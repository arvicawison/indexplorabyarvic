// Supabase Edge Function: music-generate
// Provider credentials must be configured as server-side secrets.
// This endpoint deliberately refuses to fake generation when no provider exists.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "https://indexplora.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const auth = req.headers.get("Authorization");
  if (!url || !anon || !auth) return json({ error: "service_not_configured" }, 503);

  const supabase = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return json({ error: "authentication_required" }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 3000) return json({ error: "prompt_required_or_too_long" }, 400);

  const provider = Deno.env.get("MUSIC_PROVIDER");
  const providerKey = Deno.env.get("MUSIC_PROVIDER_API_KEY");
  if (!provider || !providerKey) {
    return json({
      error: "audio_provider_not_configured",
      message: "Music brief creation is available. Audio generation is awaiting an authorized provider connection."
    }, 503);
  }

  // Provider-specific adapter must be implemented and reviewed before enabling generation.
  // Do not send user prompts to an unknown or unofficial endpoint.
  return json({
    error: "provider_adapter_not_implemented",
    message: "Provider credentials are present, but no verified adapter is installed. No audio job was submitted."
  }, 501);
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: cors });
}
