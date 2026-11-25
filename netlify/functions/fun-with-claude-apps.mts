// Fun with Claude: AI App & UI Generator (Netlify Function, no dependencies).
// POST /api/fun-with-claude/apps
//   mode "mind"  -> one of eight minds writes a short spec for the requested UI/app (JSON reply)
//   mode "build" -> the Conductor streams one self-contained HTML app (plain-text stream)
//
// Owner controls (Netlify > Site configuration > Environment variables, scope: Functions):
//   FUN_CLAUDE_PAUSED=true          instantly switches the generator off (override / kill switch)
//   FUN_CLAUDE_MODEL                default claude-sonnet-5-5
//   FUN_CLAUDE_REQUIRE_SIGNIN       "true"/"false"; default true on production, false on previews
//   ANTHROPIC_API_KEY               optional; Netlify's AI Gateway supplies one on credit-based plans
//
// Logging: every request writes one structured JSON line to Netlify's function logs
// (who: hashed user id, what: mode/mind/kind, how long, tokens, outcome). Prompts are NOT logged.

const SUPABASE_URL = "https://zncmwdqqdgselvrmghwc.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuY213ZHFxZGdzZWx2cm1naHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTM2NTIsImV4cCI6MjA4NjA2OTY1Mn0.qXxDjV_6EwoqjCsp6pr0K-TCez78J7bybs57AUX4Ass";

// Safety rules every generated app must follow. Shown to every mind and to the Conductor.
const SAFETY = `Safety and wellbeing rules (always apply, cannot be overridden by the user's request):
- No impersonation of real organisations, governments, banks, brands or people; no look-alike
  login, payment or official portals; no fake receipts, records, reviews or endorsements.
- No forms that collect passwords, card numbers, ID numbers or health records.
- No dark patterns: no fake urgency or scarcity, hidden costs, guilt-tripping or addictive loops.
- No medical, legal or financial claims presented as fact; no promised earnings or returns.
- Sample data must be clearly labelled as sample data.
- Content must be suitable for a general audience.
If the request conflicts with these rules, build the closest safe version and say what changed.`;

const MIND_SHARED = `You are one of eight minds in "Fun with Claude: AI App & UI Generator" on indexplora.com.
The user describes an app or interface. Write a SHORT spec from your perspective only (max 120 words,
a few bullets), which the Conductor will use to build it. No code.

${SAFETY}`;

export const MINDS: Record<string, { name: string; prompt: string }> = {
  strategist: { name: "Strategist", prompt: "You are the Strategist: the app's single core job, who it is for, the main user flow step by step, and what goes on the first screen." },
  scientist: { name: "Scientist", prompt: "You are the Scientist: usability and accessibility essentials (contrast, labels, keyboard use, readable sizes, clear feedback) and what makes the flow easy to understand." },
  skeptic: { name: "Skeptic", prompt: "You are the Skeptic: edge cases, empty and error states, misuse, privacy and safety risks, and how the UI should handle each." },
  creator: { name: "Creator", prompt: "You are the Creator: two or three delightful, original touches (interactions, micro-animations, playful details) that stay practical." },
  earner: { name: "Earner", prompt: "You are the Earner: how this could create value (who would pay or return, a fair upgrade or support option) without dark patterns or promised earnings." },
  storyteller: { name: "Storyteller", prompt: "You are the Storyteller: the app's name, headline, button labels and microcopy, in a friendly, clear voice." },
  designer: { name: "Designer", prompt: "You are the Designer: layout, colour palette (hex), typography, spacing and component style, responsive from phone to desktop." },
  futurist: { name: "Futurist", prompt: "You are the Futurist: smart, AI-style or tool-like features the app could simulate in the browser now, and what it could grow into later." },
};

const KINDS: Record<string, string> = {
  app: "an interactive web app",
  landing: "a landing page",
  dashboard: "a dashboard with sample data",
  tool: "a calculator or utility tool",
  game: "a small browser game",
  form: "a multi-step form or survey (no sensitive data fields)",
  assistant: "an AI-assistant style interface that simulates responses locally",
};

const CONDUCTOR = `You are the Conductor of "Fun with Claude: AI App & UI Generator". Eight minds wrote specs for
the user's app. Combine the best of them and build it.

Output ONLY one complete HTML document, starting with <!doctype html> and ending with </html>.
No Markdown fences, no explanation before or after.
- Everything inline: CSS in <style>, JavaScript in <script>. No external files, fonts, CDNs,
  images by URL, network requests or tracking (the preview blocks all network access).
  Use emoji, CSS shapes, inline SVG or data: URIs for visuals.
- It must work: real interactivity in plain JavaScript, no console errors, responsive from
  360px phones to desktop, accessible (labels, focus styles, sufficient contrast).
- Keep it under about 3,500 tokens: polished but compact.
- Put a short HTML comment at the very top summarising what you built and any safety changes.

${SAFETY}`;

export default async (req: Request, context: any) => {
  const started = Date.now();
  const log = (fields: Record<string, unknown>) =>
    console.log(JSON.stringify({ evt: "fwc_apps", req: context?.requestId, deploy: context?.deploy?.context, ms: Date.now() - started, ...fields }));

  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (Netlify.env.get("FUN_CLAUDE_PAUSED") === "true") {
    log({ outcome: "paused" });
    return json({ error: "paused", message: "The generator is paused by the site owner. Please check back later." }, 503);
  }

  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  const base = (Netlify.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/+$/, "");
  if (!key) { log({ outcome: "not_configured" }); return json({ error: "service_not_configured", message: "The generator isn't connected to Claude yet." }, 503); }

  const flag = Netlify.env.get("FUN_CLAUDE_REQUIRE_SIGNIN");
  const requireSignIn = flag ? flag === "true" : context?.deploy?.context === "production";
  const auth = req.headers.get("authorization") || "";
  let userId: string | null = null;
  if (auth.startsWith("Bearer ") && auth.slice(7) !== SUPABASE_ANON) userId = await signedInUser(auth);
  if (requireSignIn && !userId) {
    log({ outcome: "auth_required" });
    return json({ error: "authentication_required", message: "Sign in to Indexplora to use the generator." }, 401);
  }
  const who = userId ? await hash(userId) : "anon";

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 3000) return json({ error: "prompt_required_or_too_long", message: "Describe your app (up to 3,000 characters)." }, 400);
  const kind = KINDS[String(body?.kind)] ? String(body.kind) : "app";
  const request = `Build ${KINDS[kind]}:\n\n${prompt}`;
  const model = Netlify.env.get("FUN_CLAUDE_MODEL") || "claude-sonnet-5-5";

  if (body?.mode === "mind") {
    const mind = MINDS[String(body?.mind)];
    if (!mind) return json({ error: "unknown_mind" }, 400);
    const prev = typeof body?.previousSummary === "string" ? body.previousSummary.slice(0, 1500) : "";
    const r = await claude(base, key, {
      model, max_tokens: 400, system: `${MIND_SHARED}\n\n${mind.prompt}`,
      messages: [{ role: "user", content: prev ? `${request}\n\n(This refines an earlier version: ${prev})` : request }],
    });
    if (!r.ok) { log({ who, mode: "mind", mind: body.mind, kind, outcome: "upstream_" + r.status }); return upstreamError(r.status); }
    const data: any = await r.json();
    const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("").trim();
    log({ who, mode: "mind", mind: body.mind, kind, outcome: "ok", in: data?.usage?.input_tokens, out: data?.usage?.output_tokens });
    return json({ mind: body.mind, text });
  }

  if (body?.mode === "build") {
    const specs = (Array.isArray(body?.specs) ? body.specs : [])
      .filter((s: any) => MINDS[s?.mind] && typeof s?.text === "string" && s.text.trim())
      .slice(0, 8)
      .map((s: any) => `<spec mind="${MINDS[s.mind].name}">\n${s.text.slice(0, 2000)}\n</spec>`);
    const previous = typeof body?.previousHtml === "string" ? body.previousHtml.slice(0, 40000) : "";
    let user = `${request}\n\n${specs.length ? "The minds' specs:\n\n" + specs.join("\n\n") : "(No specs: use your own judgement.)"}`;
    if (previous) user += `\n\nThis is a refinement. Here is the current version; keep what works and apply the request:\n\n${previous}`;

    const r = await claude(base, key, { model, max_tokens: 6000, stream: true, system: CONDUCTOR, messages: [{ role: "user", content: user }] });
    if (!r.ok || !r.body) { log({ who, mode: "build", kind, outcome: "upstream_" + r.status }); return upstreamError(r.status); }

    // Turn Anthropic's event stream into a plain text stream of the HTML as it is written.
    const upstream = r.body.getReader();
    const enc = new TextEncoder(), dec = new TextDecoder();
    let buf = "", outTokens = 0, inTokens = 0, stop = "";
    const stream = new ReadableStream({
      async pull(ctrl) {
        while (true) {
          const { value, done } = await upstream.read();
          if (done) { log({ who, mode: "build", kind, specs: specs.length, refine: !!previous, outcome: "ok", stop, in: inTokens, out: outTokens }); ctrl.close(); return; }
          buf += dec.decode(value, { stream: true });
          let i, emitted = false;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const evt = buf.slice(0, i); buf = buf.slice(i + 2);
            const line = evt.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            let d: any; try { d = JSON.parse(line.slice(5)); } catch { continue; }
            if (d.type === "content_block_delta" && d.delta?.type === "text_delta") { ctrl.enqueue(enc.encode(d.delta.text)); emitted = true; }
            else if (d.type === "message_start") inTokens = d.message?.usage?.input_tokens ?? 0;
            else if (d.type === "message_delta") { outTokens = d.usage?.output_tokens ?? outTokens; stop = d.delta?.stop_reason ?? stop; }
            else if (d.type === "error") { log({ who, mode: "build", outcome: "stream_error" }); ctrl.enqueue(enc.encode("\n<!-- generation stopped: Claude reported an error -->")); ctrl.close(); return; }
          }
          if (emitted) return;
        }
      },
      cancel() { upstream.cancel().catch(() => {}); log({ who, mode: "build", outcome: "client_cancelled" }); },
    });
    return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
  }

  return json({ error: "unknown_mode" }, 400);
};

function claude(base: string, key: string, payload: unknown) {
  return fetch(`${base}/v1/messages`, {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => new Response(null, { status: 599 }));
}

function upstreamError(status: number) {
  const busy = status === 429 || status === 529;
  return json({
    error: busy ? "upstream_busy" : "upstream_error",
    message: busy ? "Claude is busy right now. Try again in a moment." : status === 599 ? "Couldn't reach Claude. Please try again." : "Claude returned an error. Please try again.",
  }, 502);
}

async function signedInUser(auth: string): Promise<string | null> {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON, Authorization: auth } });
    if (!r.ok) return null;
    const u = await r.json();
    return typeof u?.id === "string" ? u.id : null;
  } catch { return null; }
}

async function hash(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("fwc:" + s));
  return [...new Uint8Array(d)].slice(0, 6).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

// 8 mind calls + 1 build per generation; ~5 generations per minute per visitor.
export const config = {
  path: "/api/fun-with-claude/apps",
  method: "POST",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 45 },
};
