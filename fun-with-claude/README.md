# Fun with Claude

A separate section of indexplora.com for Claude experiments. Nothing here changes or depends on
the existing app code; the page styles are copies kept in `fun-with-claude/assets/`.

- `/fun-with-claude/`: section home.
- `/fun-with-claude/eight-minds/`: 8-Mind AI Generator. Eight Claude minds (Strategist,
  Scientist, Skeptic, Creator, Earner, Storyteller, Designer, Futurist) each generate a take on
  the visitor's idea in the chosen format; a Unified Mind merges them into one result.
- `/fun-with-claude/app-generator/`: AI App & UI Generator. The eight minds write short specs, the
  Conductor streams one self-contained HTML app, shown in a locked preview (sandboxed iframe +
  no-network Content-Security-Policy, so generated code can't reach the network, cookies or the
  visitor's sign-in). Pull-up smart log with summaries and export, pop-up alerts, Stop, refine,
  copy/download, full screen, and a local history of the last 8 builds.
  Back end: `netlify/functions/fun-with-claude-apps.mts` at `POST /api/fun-with-claude/apps`.
- `netlify/functions/fun-with-claude.mts`: the back end at `POST /api/fun-with-claude`
  (no npm packages). Holds the persona prompts; the browser can only pick minds by id.

## Claude access
On Netlify credit-based plans the AI Gateway supplies Claude credentials automatically and bills
Netlify credits. Otherwise set `ANTHROPIC_API_KEY` in Netlify (Site configuration > Environment
variables, scope: Functions) and redeploy. Your own key always takes priority over the gateway.

Optional: `FUN_CLAUDE_MODEL` (default `claude-sonnet-5-5`), `FUN_CLAUDE_REQUIRE_SIGNIN`
(`true`/`false`). By default the live site requires an Indexplora sign-in and previews do not.

## Owner controls and logs
- `FUN_CLAUDE_PAUSED=true` switches the App Generator off immediately (redeploy to apply).
- Server logs: one JSON line per request in Netlify > Logs > Functions (hashed user id, mode,
  mind, duration, tokens, outcome; never the prompt). Give staff access by inviting them to the
  Netlify team, which has its own logins and roles.
- Built-in safety rules (in the function, not editable by visitors) forbid impersonation and
  look-alike official portals, collecting passwords/cards/IDs/health data, dark patterns, and
  unsupported medical/legal/financial claims.

## Cost and limits
An App Generator run with all minds = 8 short calls + 1 build call (up to 6,000 output tokens),
limited to 45 calls per visitor IP per minute.
A generation with all eight minds = 9 Claude calls. Each visitor IP is limited to 54 calls a
minute (about 6 generations). Watch usage in Netlify (or your Anthropic console if using your key).
