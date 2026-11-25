// Fun with Claude: Evolution Dash (Netlify Function).
// POST /api/fun-with-claude/dash
//   mode "create"    -> an original, all-ages mythic character from the visitor's button choices
//   mode "evolve"    -> the same character's next evolution stage, shaped by one new choice
//   mode "publish"   -> safety-check a creation and add it to the public Pantheon (returns id + owner key)
//   mode "update"    -> replace your published creation (e.g. after evolving); needs the owner key
//   mode "unpublish" -> remove your creation from the Pantheon; needs the owner key
//   mode "gallery"   -> newest public creations (anyone can read)
//   mode "get"       -> one public creation with all its stages (anyone can read)
// Public creations live in the site-wide Netlify Blobs store "fwc-pantheon" (shared by previews and
// production on purpose, so nothing published is lost when the branch goes live). Creations only
// enter it after an automatic all-ages safety check, and SVGs are sanitised and shown as <img>.
// Owner controls: FUN_CLAUDE_PAUSED, FUN_CLAUDE_MODEL, FUN_CLAUDE_REQUIRE_SIGNIN, ANTHROPIC_API_KEY.
import { getStore } from "@netlify/blobs";

const SUPABASE_URL = "https://zncmwdqqdgselvrmghwc.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuY213ZHFxZGdzZWx2cm1naHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTM2NTIsImV4cCI6MjA4NjA2OTY1Mn0.qXxDjV_6EwoqjCsp6pr0K-TCez78J7bybs57AUX4Ass";
const STORE = "fwc-pantheon";
const MAX_STAGES = 9;

// Every button the page offers. Only these values are accepted, so visitors can't inject instructions.
export const CHOICES: Record<string, string[]> = {
  form: ["Goddess", "God", "Deity"],
  element: ["Sun", "Moon", "Ocean", "Forest", "Storm", "Stars", "Crystal", "Flame", "Dawn", "Snow"],
  gift: ["Healing", "Wisdom", "Kindness", "Music", "Craft", "Courage", "Harmony", "Growth", "Laughter", "Dreams"],
  style: ["Art Nouveau", "Stained glass", "Papercraft", "Watercolour", "Pixel art", "Origami", "Mosaic", "Neon line art", "Embroidery", "Woodcut"],
  companion: ["Owl", "Fox", "Whale", "Bee", "Deer", "Dragonfly", "Tortoise", "Phoenix", "Hummingbird", "Octopus"],
};

const RULES = `You create ORIGINAL characters for "Evolution Dash", an all-ages creative game on indexplora.com where
people press buttons to become a beautiful mythic god, goddess or deity of creativity.
Rules (always):
- Entirely original: never a real person, a real religion's god or figure, or any existing
  character, brand or franchise.
- Wholesome and suitable for children: graceful, kind and dignified; modest clothing; no
  violence, weapons, gore, fear, romance or sexual content.
- Powers only create, protect, heal and delight; they never harm people, animals or nature.
- The companion animal is treated with care and respect.

Reply in exactly this format and nothing else:
<name>a short original name</name>
<title>an epithet, e.g. "Weaver of Gentle Tides"</title>
<epic>a joyful mini-epic of 70 to 110 words, ending with a small act of creativity anyone could do today</epic>
<svg>...</svg>

The SVG: viewBox="0 0 512 512", a portrait-style illustration of the character with their companion,
in the chosen art style, rich gradients and patterns, a decorative frame, harmonious palette.
Only shapes, paths, gradients, patterns, filters and text. No <script>, <foreignObject>, <image>,
event attributes or external links. Keep it compact: under about 6,000 characters.`;

const MODERATE = `You are the safety check for a PUBLIC, all-ages gallery of original mythic characters. Approve only
if everything is suitable for children: no sexual content, violence, hate, harassment, self-harm,
drugs, personal data, real people, real religions' figures, existing copyrighted characters or
brands, spam or links. Reply with ONLY JSON: {"ok": true|false, "reason": "short reason"}.`;

type Stage = { name: string; title: string; epic: string; svg: string; stage: number; choices: Record<string, string | null> };

export default async (req: Request, context: any) => {
  const started = Date.now();
  const log = (f: Record<string, unknown>) => console.log(JSON.stringify({ evt: "fwc_dash", req: context?.requestId, deploy: context?.deploy?.context, ms: Date.now() - started, ...f }));
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const mode = String(body?.mode || "");

  // ---- public reads ----
  if (mode === "gallery" || mode === "get") {
    try {
      const store = getStore({ name: STORE, consistency: "strong" });
      if (mode === "get") {
        const id = cleanId(body?.id); if (!id) return json({ error: "bad_id" }, 400);
        const c: any = await store.get(`c/${id}`, { type: "json" });
        if (!c) return json({ error: "not_found", message: "That creation isn't in the Pantheon any more." }, 404);
        return json({ creation: publicView(c) });
      }
      const { blobs } = await store.list({ prefix: "c/" });
      const keys = blobs.map((b: any) => b.key).sort().slice(0, 30); // ids start with an inverted timestamp: newest first
      const items = (await Promise.all(keys.map((k: string) => store.get(k, { type: "json" }).catch(() => null)))).filter(Boolean)
        .map((c: any) => { const s = c.stages[c.stages.length - 1]; return { id: c.id, name: s.name, title: s.title, stage: s.stage, svg: s.svg, published: c.published }; });
      return json({ items, total: blobs.length });
    } catch (e) { log({ mode, outcome: "store_error", err: String(e).slice(0, 200) }); return json({ error: "store_unavailable", message: "The public Pantheon is unavailable right now." }, 503); }
  }

  if (Netlify.env.get("FUN_CLAUDE_PAUSED") === "true") return json({ error: "paused", message: "Evolution Dash is paused by the site owner. Please check back later." }, 503);
  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  const base = (Netlify.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/+$/, "");
  if (!key) return json({ error: "service_not_configured", message: "Evolution Dash isn't connected to Claude yet." }, 503);

  const flag = Netlify.env.get("FUN_CLAUDE_REQUIRE_SIGNIN");
  const requireSignIn = flag ? flag === "true" : context?.deploy?.context === "production";
  const auth = req.headers.get("authorization") || "";
  if (requireSignIn && !(auth.startsWith("Bearer ") && auth.slice(7) !== SUPABASE_ANON && (await signedIn(auth)))) {
    return json({ error: "authentication_required", message: "Sign in to Indexplora to play Evolution Dash." }, 401);
  }

  // ---- publishing ----
  if (mode === "publish" || mode === "update" || mode === "unpublish") {
    try {
      const store = getStore({ name: STORE, consistency: "strong" });
      let existing: any = null, id = "";
      if (mode !== "publish") {
        id = cleanId(body?.id);
        existing = id ? await store.get(`c/${id}`, { type: "json" }).catch(() => null) : null;
        if (!existing) return json({ error: "not_found", message: "That creation isn't in the Pantheon any more." }, 404);
        if (!(await ownerOk(existing, body?.ownerKey))) return json({ error: "not_owner", message: "Only the creator's device can change this creation." }, 403);
        if (mode === "unpublish") { await store.delete(`c/${id}`); log({ mode, outcome: "ok" }); return json({ ok: true }); }
      }
      const stages = cleanStages(body?.creation?.stages);
      if (!stages.length) return json({ error: "invalid_creation", message: "That creation is incomplete." }, 400);
      const verdict = await moderate(base, key, stages);
      if (!verdict.ok) {
        const failed = verdict.reason === "check_failed";
        log({ mode, outcome: failed ? "check_failed" : "rejected" });
        return json({ error: failed ? "check_failed" : "rejected", message: failed ? "The safety check couldn't run. Your creation is kept safe; please try again." : "This creation didn't pass the all-ages safety check, so it wasn't published." }, failed ? 502 : 422);
      }
      let ownerKey: string | undefined;
      if (mode === "publish") {
        id = (9999999999999 - Date.now()).toString().padStart(13, "0") + "-" + rand(8);
        ownerKey = rand(32);
        existing = { id, published: Date.now(), ownerHash: await sha(ownerKey) };
      }
      const record = { id, published: existing.published, updated: Date.now(), ownerHash: existing.ownerHash, stages };
      await store.setJSON(`c/${id}`, record);
      log({ mode, outcome: "ok", stages: stages.length });
      return json({ id, ownerKey, creation: publicView(record) });
    } catch (e) { log({ mode, outcome: "store_error", err: String(e).slice(0, 200) }); return json({ error: "store_unavailable", message: "The public Pantheon is unavailable right now. Your creation is kept safe; please try again." }, 503); }
  }

  // ---- generation ----
  const pick = (group: string, v: unknown) => (CHOICES[group].includes(String(v)) ? String(v) : null);
  const choice = {
    form: pick("form", body?.form) ?? "Deity",
    element: pick("element", body?.element), gift: pick("gift", body?.gift),
    style: pick("style", body?.style), companion: pick("companion", body?.companion),
  };
  if (!choice.element || !choice.gift || !choice.style || !choice.companion) return json({ error: "choices_required", message: "Pick an element, a gift, a style and a companion." }, 400);
  const nameHint = typeof body?.nameHint === "string" ? body.nameHint.replace(/[^\p{L}\p{N} '\-]/gu, "").trim().slice(0, 30) : "";

  let user = `Form: ${choice.form}\nElement: ${choice.element}\nGift: ${choice.gift}\nArt style: ${choice.style}\nCompanion: ${choice.companion}` +
    (nameHint ? `\nThe player would like the name to include or echo: "${nameHint}" (ignore it if it names a real person, religion or existing character).` : "");
  let stage = 1;
  if (mode === "evolve") {
    const prev = body?.previous || {};
    const group = ["element", "gift", "style", "companion"].includes(body?.evolveGroup) ? body.evolveGroup : null;
    const value = group ? pick(group, body?.evolveValue) : null;
    if (!group || !value) return json({ error: "evolve_choice_required" }, 400);
    stage = Math.min(MAX_STAGES, Math.max(1, Math.round(Number(prev.stage) || 1)) + 1);
    user += `\n\nThis is EVOLUTION STAGE ${stage} of an existing character. Keep their identity and name, and grow them in
grace and splendour. Their story so far: "${plain(String(prev.name || ""), 40)}, ${plain(String(prev.title || ""), 80)}". ${plain(String(prev.epic || ""), 700)}
New influence chosen for this evolution: ${group} = ${value}. Show the evolution clearly in the art (richer
details, a new symbol of the influence) and write the epic as the next chapter.`;
  } else if (mode !== "create") return json({ error: "unknown_mode" }, 400);

  let r: Response;
  try {
    r = await fetch(`${base}/v1/messages`, {
      method: "POST", signal: AbortSignal.timeout(55000), // stay inside the 60s function limit
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: Netlify.env.get("FUN_CLAUDE_MODEL") || "claude-sonnet-5-5", max_tokens: 3500, system: RULES, messages: [{ role: "user", content: user }] }),
    });
  } catch (e: any) {
    const slow = e?.name === "TimeoutError";
    log({ mode, outcome: slow ? "timeout" : "unreachable" });
    return json({ error: slow ? "too_slow" : "upstream_unreachable", message: slow ? "That creation took too long. Please try again." : "Couldn't reach Claude. Please try again." }, 502);
  }
  if (!r.ok) {
    log({ mode, outcome: "upstream_" + r.status });
    const busy = r.status === 429 || r.status === 529;
    return json({ error: busy ? "upstream_busy" : "upstream_error", message: busy ? "Claude is busy right now. Try again in a moment." : "Claude returned an error. Please try again." }, 502);
  }
  const data: any = await r.json();
  const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("");
  const tag = (t: string) => (text.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`, "i"))?.[1] ?? "").trim();
  const svg = sanitizeSvg(text.match(/<svg[\s\S]*<\/svg>/i)?.[0] ?? "");
  const out = { name: plain(tag("name"), 40), title: plain(tag("title"), 80), epic: plain(tag("epic"), 1200), svg, stage, choices: choice };
  if (!out.name || !svg) { log({ mode, outcome: "unparseable" }); return json({ error: "unreadable", message: "The creation came back incomplete. Please try again." }, 502); }
  log({ mode, outcome: "ok", stage, svgChars: svg.length, in: data?.usage?.input_tokens, out: data?.usage?.output_tokens });
  return json(out);
};

// ---------- helpers ----------
function cleanStages(list: unknown): Stage[] {
  if (!Array.isArray(list)) return [];
  const out: Stage[] = [];
  for (const s of list.slice(0, MAX_STAGES)) {
    const svg = sanitizeSvg(typeof s?.svg === "string" ? s.svg.slice(0, 30000) : "");
    const name = plain(String(s?.name || ""), 40);
    if (!svg || !name) return [];
    const choices: Record<string, string | null> = {};
    for (const g of Object.keys(CHOICES)) choices[g] = CHOICES[g].includes(String(s?.choices?.[g])) ? String(s.choices[g]) : null;
    out.push({ name, title: plain(String(s?.title || ""), 80), epic: plain(String(s?.epic || ""), 1200), svg, stage: Math.min(MAX_STAGES, Math.max(1, Math.round(Number(s?.stage) || out.length + 1))), choices });
  }
  return out;
}

// All-ages check on every word that would become public, including text drawn inside the artwork.
async function moderate(base: string, key: string, stages: Stage[]): Promise<{ ok: boolean; reason: string }> {
  const svgText = stages.map((s) => [...s.svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)].map((m) => plain(m[1], 80)).join(" | ")).join(" | ");
  const content = stages.map((s) => `Stage ${s.stage}: ${s.name}, ${s.title}. ${s.epic}`).join("\n") + (svgText ? `\nText inside the artwork: ${svgText.slice(0, 1500)}` : "");
  try {
    const r = await fetch(`${base}/v1/messages`, {
      method: "POST", signal: AbortSignal.timeout(20000),
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: Netlify.env.get("FUN_CLAUDE_SUGGEST_MODEL") || "claude-haiku-5-5", max_tokens: 100, system: MODERATE, messages: [{ role: "user", content }] }),
    });
    if (!r.ok) return { ok: false, reason: "check_failed" };
    const d: any = await r.json();
    const t = (d?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("");
    const m = t.match(/\{[\s\S]*\}/);
    const v = m ? JSON.parse(m[0]) : null;
    if (!v || typeof v.ok !== "boolean") return { ok: false, reason: "check_failed" };
    return { ok: v.ok, reason: String(v.reason || "") };
  } catch { return { ok: false, reason: "check_failed" }; }
}

function publicView(c: any) { return { id: c.id, published: c.published, updated: c.updated, stages: c.stages }; }
function cleanId(v: unknown) { const s = String(v || ""); return /^\d{13}-[a-z0-9]{8}$/.test(s) ? s : ""; }
function rand(n: number) { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map((b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join(""); }
async function sha(s: string) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("fwc-owner:" + s)); return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
async function ownerOk(rec: any, k: unknown) { return typeof k === "string" && k.length === 32 && (await sha(k)) === rec?.ownerHash; }

// Allow-list style clean-up. The page also renders the SVG as an <img>, where scripts never run.
export function sanitizeSvg(svg: string) {
  if (!svg || svg.length > 60000) return "";
  let s = svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|foreignObject|iframe|object|embed|image|a)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|foreignObject|iframe|object|embed|image|a)\b[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(xlink:)?href\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/@import[^;]*;?/gi, "")
    .replace(/url\(\s*['"]?(?!#)[^)]*\)/gi, "none");
  if (!/^<svg[\s>]/i.test(s)) return "";
  if (!/xmlns=/i.test(s)) s = s.replace(/^<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return s;
}

function plain(s: string, max: number) { return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max); }

async function signedIn(auth: string) {
  try { const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON, Authorization: auth } }); return r.ok && typeof (await r.json())?.id === "string"; }
  catch { return false; }
}

function json(payload: unknown, status = 200) { return Response.json(payload, { status }); }

export const config = {
  path: "/api/fun-with-claude/dash",
  method: "POST",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 40 },
};
