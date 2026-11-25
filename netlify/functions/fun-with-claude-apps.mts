// Fun with Claude: AI App & UI Generator (Netlify Function, no dependencies).
// POST /api/fun-with-claude/apps
//   mode "mind"  -> one of eight minds writes a short spec for the requested UI/app (JSON reply)
//   mode "build" -> the Conductor streams one self-contained HTML app (plain-text stream)
//   mode "huddle" -> merges the minds' specs into one shared blueprint (resolves conflicts)
//   mode "review" -> quality score, issues and foresight warnings for a built app (JSON)
//   mode "suggest" -> live prompt suggestions while the user types (JSON)
//   mode "continue" -> continues a build that was cut off (large apps are built in parts)
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
- Humanity first, with care for animals and the environment: no features that encourage harm to
  people, animals or nature, and flag likely knock-on effects instead of hiding them.
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

const HUDDLE = `You run the Huddle in "Fun with Claude: AI App & UI Generator". Several minds each wrote a spec
for the user's app. Merge them into ONE shared blueprint the Conductor will build from, so the ideas
reinforce each other instead of competing. Max 260 words, Markdown, with these headings:
**Concept** (name + one line), **Core flow**, **Features** (prioritised list), **Look & feel**,
**Copy**, **Safeguards**, **Resolved** (where minds disagreed and what you chose, one line each).
No code.

${SAFETY}`;

const REVIEW = `You are the Reviewer in "Fun with Claude: AI App & UI Generator". Review the built app against an
industry-standard bar (functionality, accessibility WCAG 2.2 AA, responsive design, visual polish,
code quality, safety) and look ahead at foreseeable knock-on effects of people using it: on users,
other people, animals and the environment. Use the runtime errors and lint findings provided.

Reply with ONLY a JSON object, no Markdown:
{"score": 0-100, "summary": "one sentence",
 "issues": [{"severity": "high|medium|low", "area": "functionality|accessibility|design|code|safety", "note": "what is wrong and how to fix it"}],
 "foresight": [{"level": "warning|info", "affects": "users|others|animals|environment|society", "note": "likely chain reaction and how the app mitigates or should mitigate it"}]}
Max 8 issues and 4 foresight items. Be specific and honest; don't invent problems.

${SAFETY}`;

const SUGGEST = `You suggest prompts for "Fun with Claude: AI App & UI Generator". Given what the user has typed so
far (and the current app, if any), offer 3 short, concrete, useful ways to finish or improve the
request (max 12 words each). Follow the safety rules. Reply with ONLY a JSON array of 3 strings.

${SAFETY}`;

const CONDUCTOR = `You are the Conductor of "Fun with Claude: AI App & UI Generator". Eight minds wrote specs for
the user's app, and a Huddle merged them into a shared blueprint. Follow the blueprint, use the
specs for detail, and build it.

Output ONLY one complete HTML document, starting with <!doctype html> and ending with </html>.
No Markdown fences, no explanation before or after.
- Everything inline: CSS in <style>, JavaScript in <script>. No external files, fonts, CDNs,
  images by URL, network requests or tracking (the preview blocks all network access).
  Use emoji, CSS shapes, inline SVG or data: URIs for visuals.
Industry-standard quality bar (all required):
- Works fully: real interactivity in plain JavaScript, no console errors, every button does something.
- Semantic HTML (header/main/nav/section, real <button>s and <label>s), <html lang>, <title>,
  viewport meta; WCAG 2.2 AA: contrast, visible focus, keyboard use, aria-live for updates,
  alt text, respects prefers-reduced-motion.
- Responsive from 360px phones to wide desktops; touch targets at least 44px.
- Clean design system: CSS custom properties for colours/spacing/type, consistent components,
  polished empty, loading and error states, input validation with friendly messages.
- Robust code: no global leaks (wrap in an IIFE or module pattern), handle edge cases. Storage may be
  unavailable in the sandbox: wrap localStorage in try/catch and fall back to memory.
- Be ambitious: build a complete, polished, feature-rich app. Large apps are fine; if you are cut off
  you will be asked to continue.
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
    const prev = typeof body?.blueprint === "string" ? body.blueprint.slice(0, 3000) : "";
    const r = await claude(base, key, {
      model, max_tokens: 400, system: `${MIND_SHARED}\n\n${mind.prompt}`,
      messages: [{ role: "user", content: prev ? `${request}\n\nThis refines an existing app. Build on its current blueprint rather than starting over:\n\n${prev}` : request }],
    });
    if (!r.ok) { log({ who, mode: "mind", mind: body.mind, kind, outcome: "upstream_" + r.status }); return upstreamError(r.status); }
    const data: any = await r.json();
    const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("").trim();
    log({ who, mode: "mind", mind: body.mind, kind, outcome: "ok", in: data?.usage?.input_tokens, out: data?.usage?.output_tokens });
    return json({ mind: body.mind, text, usage: { in: data?.usage?.input_tokens ?? 0, out: data?.usage?.output_tokens ?? 0 } });
  }

  if (body?.mode === "huddle") {
    const specs = cleanSpecs(body?.specs);
    if (!specs.length) return json({ error: "specs_required" }, 400);
    const prev = typeof body?.blueprint === "string" ? body.blueprint.slice(0, 3000) : "";
    const r = await claude(base, key, {
      model, max_tokens: 700, system: HUDDLE,
      messages: [{ role: "user", content: `${request}\n\n${prev ? "Previous blueprint (update it, don't discard what still works):\n" + prev + "\n\n" : ""}The minds' specs:\n\n${specs.join("\n\n")}` }],
    });
    if (!r.ok) { log({ who, mode: "huddle", kind, outcome: "upstream_" + r.status }); return upstreamError(r.status); }
    const data: any = await r.json();
    const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("").trim();
    log({ who, mode: "huddle", kind, specs: specs.length, outcome: "ok", in: data?.usage?.input_tokens, out: data?.usage?.output_tokens });
    return json({ blueprint: text, usage: { in: data?.usage?.input_tokens ?? 0, out: data?.usage?.output_tokens ?? 0 } });
  }

  if (body?.mode === "review") {
    const html = typeof body?.html === "string" ? body.html.slice(0, 60000) : "";
    if (!html) return json({ error: "html_required" }, 400);
    const runtime = (Array.isArray(body?.runtimeErrors) ? body.runtimeErrors : []).slice(0, 10).map((e: any) => String(e).slice(0, 300));
    const lint = (Array.isArray(body?.lint) ? body.lint : []).slice(0, 15).map((e: any) => String(e).slice(0, 200));
    const r = await claude(base, key, {
      model, max_tokens: 1200, system: REVIEW,
      messages: [{ role: "user", content: `${request}\n\nRuntime errors seen in the preview: ${runtime.length ? runtime.join(" | ") : "none"}\nLint findings: ${lint.length ? lint.join(" | ") : "none"}\n\nThe app:\n\n${html}` }],
    });
    if (!r.ok) { log({ who, mode: "review", outcome: "upstream_" + r.status }); return upstreamError(r.status); }
    const data: any = await r.json();
    const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("");
    const review = parseJson(text, null);
    if (!review || typeof review !== "object") { log({ who, mode: "review", outcome: "unparseable" }); return json({ error: "review_unreadable", message: "The review came back in an unexpected format." }, 502); }
    const clean = {
      score: Math.max(0, Math.min(100, Math.round(Number(review.score) || 0))),
      summary: String(review.summary || "").slice(0, 300),
      issues: (Array.isArray(review.issues) ? review.issues : []).slice(0, 8).map((i: any) => ({ severity: ["high", "medium", "low"].includes(i?.severity) ? i.severity : "low", area: String(i?.area || "code").slice(0, 20), note: String(i?.note || "").slice(0, 300) })).filter((i: any) => i.note),
      foresight: (Array.isArray(review.foresight) ? review.foresight : []).slice(0, 4).map((f: any) => ({ level: f?.level === "warning" ? "warning" : "info", affects: String(f?.affects || "users").slice(0, 20), note: String(f?.note || "").slice(0, 300) })).filter((f: any) => f.note),
    };
    log({ who, mode: "review", outcome: "ok", score: clean.score, issues: clean.issues.length, warnings: clean.foresight.filter((f: any) => f.level === "warning").length, runtimeErrors: runtime.length, in: data?.usage?.input_tokens, out: data?.usage?.output_tokens });
    return json({ review: clean, usage: { in: data?.usage?.input_tokens ?? 0, out: data?.usage?.output_tokens ?? 0 } });
  }

  if (body?.mode === "suggest") {
    const ctx = typeof body?.appSummary === "string" ? body.appSummary.slice(0, 600) : "";
    const memory = (Array.isArray(body?.memory) ? body.memory : []).filter((m: any) => typeof m === "string" && m.trim()).slice(-8).map((m: string) => m.trim().slice(0, 160));
    const r = await claude(base, key, {
      model: Netlify.env.get("FUN_CLAUDE_SUGGEST_MODEL") || "claude-haiku-5-5", max_tokens: 200, system: SUGGEST,
      messages: [{ role: "user", content: `${memory.length ? "This user's recent requests and picks (personalise to their style and interests, but don't repeat them):\n- " + memory.join("\n- ") + "\n" : ""}${ctx ? "Current app: " + ctx + "\n" : ""}Type: ${KINDS[kind]}\nTyped so far: ${prompt}` }],
    });
    if (!r.ok) return upstreamError(r.status);
    const data: any = await r.json();
    const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("");
    const list = parseJson(text, []);
    const suggestions = (Array.isArray(list) ? list : []).filter((x: any) => typeof x === "string" && x.trim()).slice(0, 3).map((x: string) => x.trim().slice(0, 120));
    log({ who, mode: "suggest", outcome: "ok", n: suggestions.length, memory: memory.length });
    return json({ suggestions, usage: { in: data?.usage?.input_tokens ?? 0, out: data?.usage?.output_tokens ?? 0 } });
  }

  if (body?.mode === "build" || body?.mode === "continue") {
    const partial = body?.mode === "continue" && typeof body?.partialHtml === "string" ? body.partialHtml.slice(-60000) : "";
    if (body?.mode === "continue" && !partial) return json({ error: "partial_required" }, 400);
    const specs = cleanSpecs(body?.specs);
    const blueprint = typeof body?.blueprint === "string" ? body.blueprint.slice(0, 3000) : "";
    const previous = typeof body?.previousHtml === "string" ? body.previousHtml.slice(0, 40000) : "";
    let user = `${request}\n\n${blueprint ? "Shared blueprint (follow this):\n" + blueprint + "\n\n" : ""}${specs.length ? "The minds' specs:\n\n" + specs.join("\n\n") : "(No specs: use your own judgement.)"}`;
    if (previous) user += `\n\nThis is a refinement. Here is the current version; keep what works and apply the request:\n\n${previous}`;
    const fixes = typeof body?.fixes === "string" ? body.fixes.slice(0, 4000) : "";
    if (fixes) user += `\n\nSelf-improvement pass. A review of the current version found these problems; fix all of them while keeping everything that works:\n${fixes}`;
    if (partial) user += `\n\nYou already started writing the app but were cut off. Here is everything written so far:\n\n${partial}\n\nContinue EXACTLY from the last character above. Output only the remaining code, without repeating anything already written and without any explanation, and finish with </html>.`;

    const r = await claude(base, key, { model, max_tokens: 8000, stream: true, system: CONDUCTOR, messages: [{ role: "user", content: user }] });
    if (!r.ok || !r.body) { log({ who, mode: "build", kind, outcome: "upstream_" + r.status }); return upstreamError(r.status); }

    // Turn Anthropic's event stream into a plain text stream of the HTML as it is written.
    const upstream = r.body.getReader();
    const enc = new TextEncoder(), dec = new TextDecoder();
    let buf = "", outTokens = 0, inTokens = 0, stop = "";
    const stream = new ReadableStream({
      async pull(ctrl) {
        while (true) {
          const { value, done } = await upstream.read();
          if (done) { log({ who, mode: body.mode, kind, specs: specs.length, refine: !!previous, outcome: "ok", stop, in: inTokens, out: outTokens }); ctrl.close(); return; }
          // Stay inside Netlify's 60s limit: stop cleanly so the page can ask for the next part.
          if (Date.now() - started > 52000) { upstream.cancel().catch(() => {}); log({ who, mode: body.mode, kind, outcome: "part_done", in: inTokens, out: outTokens }); ctrl.close(); return; }
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

function parseJson(text: string, fallback: any) {
  const t = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(t); } catch {}
  const m = t.match(/[\[{][\s\S]*[\]}]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return fallback;
}

function cleanSpecs(list: unknown): string[] {
  return (Array.isArray(list) ? list : [])
    .filter((s: any) => MINDS[s?.mind] && typeof s?.text === "string" && s.text.trim())
    .slice(0, 8)
    .map((s: any) => `<spec mind="${MINDS[s.mind].name}">\n${s.text.slice(0, 2000)}\n</spec>`);
}

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

// Generous per-visitor limit: 120 calls a minute (about 10 full builds) to stop runaway scripts only.
export const config = {
  path: "/api/fun-with-claude/apps",
  method: "POST",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 120 },
};
