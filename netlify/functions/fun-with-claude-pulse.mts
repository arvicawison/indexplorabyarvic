// Fun with Claude: hourly health pulse (Netlify Scheduled Function).
// Runs every hour on the published production site (Netlify > Functions > fun-with-claude-pulse > "Run now"
// runs it on demand). Each pulse:
//   1. checks that Claude answers (a tiny, cheap request) and that public storage works;
//   2. "pests out": checks every Pantheon creation and Showcase app is well-formed and safe to show.
//      Anything broken is MOVED to the quarantine store (not destroyed), so a mistake can be undone
//      for 30 days; after that it is cleared for good;
//   3. records the result in the "fwc-health" store, which /fun-with-claude/status/ shows.
// Scheduled functions have a 30s limit, so the pulse stops checking at ~22s and continues next hour.
import { getStore } from "@netlify/blobs";

const BUDGET_MS = 22000;
const KEEP_PULSES = 168;              // one week of hourly pulses
const QUARANTINE_DAYS = 30;

export default async () => {
  const started = Date.now();
  const timeLeft = () => BUDGET_MS - (Date.now() - started);
  const pulse: any = { at: new Date().toISOString(), checks: {}, notes: [] };

  // 1) Claude
  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  const base = (Netlify.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/+$/, "");
  if (Netlify.env.get("FUN_CLAUDE_PAUSED") === "true") pulse.checks.claude = { ok: true, paused: true };
  else if (!key) pulse.checks.claude = { ok: false, error: "not_configured" };
  else {
    const t = Date.now();
    try {
      const r = await fetch(`${base}/v1/messages`, {
        method: "POST", signal: AbortSignal.timeout(8000),
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: Netlify.env.get("FUN_CLAUDE_LITE_MODEL") || "claude-haiku-5-5", max_tokens: 5, messages: [{ role: "user", content: "Reply with OK" }] }),
      });
      pulse.checks.claude = { ok: r.ok, status: r.status, ms: Date.now() - t };
      await r.body?.cancel().catch(() => {});
    } catch (e: any) { pulse.checks.claude = { ok: false, error: e?.name === "TimeoutError" ? "timeout" : "unreachable", ms: Date.now() - t }; }
  }

  // 2) Storage + "pests out"
  const quarantine = getStore({ name: "fwc-quarantine", consistency: "strong" });
  let moved = 0, purged = 0;
  for (const [name, prefix, check] of [["fwc-pantheon", "c/", checkCreation], ["fwc-showcase", "a/", checkApp]] as const) {
    const label = name === "fwc-pantheon" ? "pantheon" : "showcase";
    const t = Date.now();
    try {
      const store = getStore({ name, consistency: "strong" });
      const { blobs } = await store.list({ prefix });
      let checked = 0, bad = 0;
      for (const b of blobs) {
        if (timeLeft() < 4000) { pulse.notes.push(`${label}: time budget reached, the rest is checked next hour`); break; }
        const rec: any = await store.get(b.key, { type: "json" }).catch(() => undefined);
        const problem = rec === undefined ? "unreadable" : check(rec, b.key.slice(prefix.length));
        checked++;
        if (problem) {
          bad++;
          await quarantine.setJSON(`q/${label}/${b.key.slice(prefix.length)}`, { from: name, key: b.key, reason: problem, quarantinedAt: Date.now(), record: rec ?? null });
          await store.delete(b.key);
          moved++;
        }
      }
      pulse.checks[label] = { ok: true, items: blobs.length - bad, checked, quarantined: bad, ms: Date.now() - t };
    } catch (e) { pulse.checks[label] = { ok: false, error: String(e).slice(0, 160), ms: Date.now() - t }; }
  }
  try {
    const { blobs } = await quarantine.list({ prefix: "q/" });
    for (const b of blobs) {
      if (timeLeft() < 2500) break;
      const q: any = await quarantine.get(b.key, { type: "json" }).catch(() => null);
      if (!q || Date.now() - Number(q.quarantinedAt || 0) > QUARANTINE_DAYS * 86400000) { await quarantine.delete(b.key); purged++; }
    }
    pulse.checks.quarantine = { ok: true, held: blobs.length - purged, movedNow: moved, purgedNow: purged };
  } catch (e) { pulse.checks.quarantine = { ok: false, error: String(e).slice(0, 160) }; }

  // 3) Record the pulse
  pulse.ok = Object.values(pulse.checks).every((c: any) => c.ok);
  pulse.ms = Date.now() - started;
  try {
    const health = getStore({ name: "fwc-health", consistency: "strong" });
    await health.setJSON(`p/${(9999999999999 - Date.now()).toString().padStart(13, "0")}`, pulse);
    const { blobs } = await health.list({ prefix: "p/" });
    const old = blobs.map((b: any) => b.key).sort().slice(KEEP_PULSES);
    for (const k of old) { if (timeLeft() < 500) break; await health.delete(k); }
  } catch (e) { pulse.notes.push("could not save pulse: " + String(e).slice(0, 120)); }
  console.log(JSON.stringify({ evt: "fwc_pulse", ...pulse }));
};

const SVG_BAD = /<\s*(script|foreignObject|iframe|object|embed)\b|\son[a-z]+\s*=|javascript:/i;

export function checkCreation(c: any, id: string): string {
  if (!c || typeof c !== "object") return "not an object";
  if (c.id !== id) return "id mismatch";
  if (typeof c.ownerHash !== "string" || !/^[0-9a-f]{64}$/.test(c.ownerHash)) return "missing owner key";
  if (!Array.isArray(c.stages) || c.stages.length < 1 || c.stages.length > 9) return "bad stages";
  for (const s of c.stages) {
    if (typeof s?.name !== "string" || !s.name.trim() || s.name.length > 40) return "bad name";
    if (typeof s?.svg !== "string" || !/^<svg[\s>]/i.test(s.svg) || s.svg.length > 60000) return "bad artwork";
    if (SVG_BAD.test(s.svg)) return "unsafe artwork";
    if (typeof s?.epic !== "string" || s.epic.length > 1200) return "bad story";
  }
  return "";
}

export function checkApp(a: any, id: string): string {
  if (!a || typeof a !== "object") return "not an object";
  if (a.id !== id) return "id mismatch";
  if (typeof a.ownerHash !== "string" || !/^[0-9a-f]{64}$/.test(a.ownerHash)) return "missing owner key";
  if (typeof a.title !== "string" || !a.title.trim() || a.title.length > 80) return "bad title";
  if (typeof a.html !== "string" || a.html.length < 50 || a.html.length > 400000) return "bad app size";
  if (!/<(body|div|main|section|canvas)/i.test(a.html)) return "not an app";
  return "";
}

// Every hour at minute 17 (UTC); 17 avoids the busy top of the hour.
export const config = { schedule: "17 * * * *" };
