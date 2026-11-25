// Fun with Claude: 8-Mind AI Generator (Netlify Function, no dependencies).
// Serves POST /api/fun-with-claude. Separate from the rest of indexplora.com.
//
// Claude access: on Netlify's credit-based plans the AI Gateway injects ANTHROPIC_API_KEY and
// ANTHROPIC_BASE_URL automatically. Setting your own ANTHROPIC_API_KEY in Netlify takes priority.
// Optional env vars: FUN_CLAUDE_MODEL (default claude-sonnet-5-5),
//                    FUN_CLAUDE_REQUIRE_SIGNIN ("true" / "false"; default: true on production only).

const SUPABASE_URL = "https://zncmwdqqdgselvrmghwc.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuY213ZHFxZGdzZWx2cm1naHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTM2NTIsImV4cCI6MjA4NjA2OTY1Mn0.qXxDjV_6EwoqjCsp6pr0K-TCez78J7bybs57AUX4Ass";

const SHARED = `You are one of eight minds in "Fun with Claude: 8-Mind AI Generator" on indexplora.com.
Each mind generates its own take on the user's request; another step merges them afterwards,
so stay in your own lane and don't try to cover every angle. Be vivid, concrete and useful.
Keep it under 180 words. Markdown bold and short lists are fine. Never invent facts, figures,
studies, quotes or links; say when something is speculative. No medical, legal or financial
certainty, and never promise earnings.`;

export const MINDS: Record<string, { name: string; prompt: string }> = {
  strategist: { name: "Strategist", prompt: "You are the Strategist. Generate a plan: the goal, the few highest-leverage moves in order, and the first step to take today." },
  scientist: { name: "Scientist", prompt: "You are the Scientist. Generate the take grounded in how things actually work: mechanisms and evidence, clearly separating established, plausible and speculative." },
  skeptic: { name: "Skeptic", prompt: "You are the Skeptic. Generate the stress test: hidden assumptions, risks and failure modes, each with a way to reduce it. Fair, not cynical." },
  creator: { name: "Creator", prompt: "You are the Creator. Generate bold, original ideas the obvious answer misses: reframes, mash-ups, playful experiments. Flag which are wild and which are practical." },
  earner: { name: "Earner", prompt: "You are the Earner. Generate the value angle: who would pay, for what, the cheapest way to test demand, and honest expectations." },
  storyteller: { name: "Storyteller", prompt: "You are the Storyteller. Generate a short, memorable narrative, scene or hook that brings the idea to life for a real person." },
  designer: { name: "Designer", prompt: "You are the Designer. Generate the experience: what someone sees, touches and feels; name, look, layout or product shape, described concretely." },
  futurist: { name: "Futurist", prompt: "You are the Futurist. Generate where this could go in 5, 20 and 100 years, keeping each step plausible and labelled as speculation." },
};

const FORMATS: Record<string, string> = {
  answer: "a clear, direct answer",
  ideas: "a list of fresh ideas",
  plan: "a step-by-step plan",
  story: "a short story",
  post: "a social media post",
  product: "a product or business concept",
};

const SYNTH = `You are the Unified Mind of "Fun with Claude: 8-Mind AI Generator". Several minds each
generated a take on the user's request. Produce the single best final result in the requested
format: combine their strongest material, resolve contradictions (or say briefly where they
disagree), and keep the Skeptic's important cautions. Don't summarise each mind in turn. Don't add
facts you aren't confident of. Keep it under 350 words. Markdown is fine.`;

export default async (req: Request, context: any) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  const base = (Netlify.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/+$/, "");
  if (!key) return json({ error: "service_not_configured", message: "Fun with Claude isn't connected to Claude yet." }, 503);

  // Sign-in: required on the live site by default, optional on previews so the owner can try it.
  const flag = Netlify.env.get("FUN_CLAUDE_REQUIRE_SIGNIN");
  const requireSignIn = flag ? flag === "true" : context?.deploy?.context === "production";
  if (requireSignIn) {
    const auth = req.headers.get("authorization") || "";
    const ok = auth.startsWith("Bearer ") && auth.slice(7) !== SUPABASE_ANON && (await isSignedIn(auth));
    if (!ok) return json({ error: "authentication_required", message: "Sign in to Indexplora to use Fun with Claude." }, 401);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 3000) return json({ error: "prompt_required_or_too_long", message: "Write a prompt (up to 3,000 characters)." }, 400);
  const format = FORMATS[String(body?.format)] ? String(body.format) : "answer";
  const request = `Generate ${FORMATS[format]} for this request:\n\n${prompt}`;
  const history = cleanHistory(body?.history);

  let system: string, user: string, maxTokens: number, label: string;
  if (body?.mode === "mind") {
    const mind = MINDS[String(body?.mind)];
    if (!mind) return json({ error: "unknown_mind" }, 400);
    system = `${SHARED}\n\n${mind.prompt}`; user = request; maxTokens = 600; label = String(body.mind);
  } else if (body?.mode === "synthesize") {
    const parts = (Array.isArray(body?.answers) ? body.answers : [])
      .filter((a: any) => MINDS[a?.mind] && typeof a?.text === "string" && a.text.trim())
      .slice(0, 8)
      .map((a: any) => `<mind name="${MINDS[a.mind].name}">\n${a.text.slice(0, 3000)}\n</mind>`);
    if (!parts.length) return json({ error: "answers_required" }, 400);
    system = SYNTH; user = `${request}\n\nThe minds generated:\n\n${parts.join("\n\n")}`; maxTokens = 1100; label = "synthesis";
  } else {
    return json({ error: "unknown_mode" }, 400);
  }

  const messages = [
    ...history.flatMap((t) => [{ role: "user", content: t.prompt }, { role: "assistant", content: t.result }]),
    { role: "user", content: user },
  ];

  let res: Response;
  try {
    res = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: Netlify.env.get("FUN_CLAUDE_MODEL") || "claude-sonnet-5-5", max_tokens: maxTokens, system, messages }),
    });
  } catch {
    return json({ error: "upstream_unreachable", message: "Couldn't reach Claude. Please try again." }, 502);
  }
  if (!res.ok) {
    console.error("claude_error", res.status, (await res.text().catch(() => "")).slice(0, 500));
    const busy = res.status === 429 || res.status === 529;
    return json({ error: busy ? "upstream_busy" : "upstream_error", message: busy ? "Claude is busy right now. Try again in a moment." : "Claude returned an error. Please try again." }, 502);
  }
  const data: any = await res.json();
  const text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("").trim();
  return json({ mind: label, text });
};

async function isSignedIn(auth: string) {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON, Authorization: auth } });
    if (!r.ok) return false;
    const u = await r.json();
    return typeof u?.id === "string";
  } catch { return false; }
}

function cleanHistory(h: unknown) {
  if (!Array.isArray(h)) return [] as { prompt: string; result: string }[];
  return h
    .filter((t: any) => typeof t?.prompt === "string" && typeof t?.result === "string" && t.prompt.trim() && t.result.trim())
    .slice(-3)
    .map((t: any) => ({ prompt: t.prompt.slice(0, 2000), result: t.result.slice(0, 3000) }));
}

function json(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

export const config = {
  path: "/api/fun-with-claude",
  method: "POST",
  // No per-visitor rate limit (owner's choice). Use FUN_CLAUDE_PAUSED=true to stop everything at once.
};
