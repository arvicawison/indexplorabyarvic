// Fun with Claude: public health status. GET /api/fun-with-claude/status
// Returns the latest hourly pulses written by fun-with-claude-pulse. Read-only; no personal data.
import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const health = getStore({ name: "fwc-health", consistency: "strong" });
    const { blobs } = await health.list({ prefix: "p/" });
    const keys = blobs.map((b: any) => b.key).sort().slice(0, 48); // newest first
    const pulses = (await Promise.all(keys.map((k: string) => health.get(k, { type: "json" }).catch(() => null)))).filter(Boolean);
    const okCount = pulses.filter((p: any) => p.ok).length;
    return Response.json(
      { pulses, summary: { count: pulses.length, healthy: okCount, latest: pulses[0] ?? null } },
      { headers: { "cache-control": "public, max-age=60" } },
    );
  } catch (e) {
    return Response.json({ error: "store_unavailable", message: "Health history is unavailable right now." }, { status: 503 });
  }
};

export const config = { path: "/api/fun-with-claude/status", method: "GET" };
