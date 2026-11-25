// Fun with Claude: Evolution Dash (Netlify Function, no dependencies).
// POST /api/fun-with-claude/dash
//   mode "create" -> an original, all-ages mythic character from the visitor's button choices
//   mode "evolve" -> the same character's next evolution stage, shaped by one new choice
// Returns JSON { name, title, epic, svg }. The SVG is sanitised here and shown by the page as an
// <img>, which never runs scripts. Same owner controls as the App Generator (FUN_CLAUDE_PAUSED,
// FUN_CLAUDE_MODEL, FUN_CLAUDE_REQUIRE_SIGNIN, ANTHROPIC_API_KEY or Netlify AI Gateway).

const SUPABASE_URL = "https://zncmwdqqdgselvrmghwc.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuY213ZHFxZGdzZWx2cm1naHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTM2NTIsImV4cCI6MjA4NjA2OTY1Mn0.qXxDjV_6EwoqjCsp6pr0K-TCez78J7bybs57AUX4Ass";

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

export default async (req: Request, context: any) => {
  const started = Date.now();
  const log = (f: Record<string, unknown>) => console.log(JSON.stringify({ evt: "fwc_dash", req: context?.requestId, ms: Date.now() - started, ...f }));
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
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

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
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
  if (body?.mode === "evolve") {
    const prev = body?.previous || {};
    const group = ["element", "gift", "style", "companion"].includes(body?.evolveGroup) ? body.evolveGroup : null;
    const value = group ? pick(group, body?.evolveValue) : null;
    if (!group || !value) return json({ error: "evolve_choice_required" }, 400);
    stage = Math.min(9, Math.max(1, Math.round(Number(prev.stage) || 1)) + 1);
    user += `\n\nThis is EVOLUTION STAGE ${stage} of an existing character. Keep their identity and name, and grow them in
grace and splendour. Their story so far: "${String(prev.name || "").slice(0, 40)}, ${String(prev.title || "").slice(0, 80)}". ${String(prev.epic || "").slice(0, 700)}
New influence chosen for this evolution: ${group} = ${value}. Show the evolution clearly in the art (richer
details, a new symbol of the influence) and write the epic as the next chapter.`;
  } else if (body?.mode !== "create") return json({ error: "unknown_mode" }, 400);

  let r: Response;
  const timer = AbortSignal.timeout(55000); // stay inside the 60s function limit
  try {
    r = await fetch(`${base}/v1/messages`, {
      method: "POST", signal: timer,
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: Netlify.env.get("FUN_CLAUDE_MODEL") || "claude-sonnet-5-5", max_tokens: 3500, system: RULES, messages: [{ role: "user", content: user }] }),
    });
  } catch (e: any) {
    const slow = e?.name === "TimeoutError";
    log({ mode: body.mode, outcome: slow ? "timeout" : "unreachable" });
    return json({ error: slow ? "too_slow" : "upstream_unreachable", message: slow ? "That creation took too long. Please try again." : "Couldn't reach Claude. Please try again." }, 502);
  }
  if (!r.ok) {
    log({ mode: body.mode, outcome: "upstream_" + r.status });
    const busy = r.status === 429 || r.status === 529;
    return json({ error: busy ? "upstream_busy" : "upstream_error", message: busy ? "Claude is busy right now. Try again in a moment." : "Claude returned an error. Please try again." }, 502);
  }
  const data: any = await r.json();
  const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("");
  const tag = (t: string) => (text.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`, "i"))?.[1] ?? "").trim();
  const svgRaw = text.match(/<svg[\s\S]*<\/svg>/i)?.[0] ?? "";
  const svg = sanitizeSvg(svgRaw);
  const out = { name: plain(tag("name"), 40), title: plain(tag("title"), 80), epic: plain(tag("epic"), 1200), svg, stage, choices: choice };
  if (!out.name || !svg) { log({ mode: body.mode, outcome: "unparseable" }); return json({ error: "unreadable", message: "The creation came back incomplete. Please try again." }, 502); }
  log({ mode: body.mode, outcome: "ok", stage, svgChars: svg.length, in: data?.usage?.input_tokens, out: data?.usage?.output_tokens });
  return json(out);
};

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
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 30 },
};
