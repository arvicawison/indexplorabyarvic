# Fun with Claude

A separate section of indexplora.com for Claude experiments. Nothing here changes or depends on
the existing app code; the page styles are copies kept in `fun-with-claude/assets/`.

- `/fun-with-claude/`: section home.
- `/fun-with-claude/eight-minds/`: 8-Mind AI Generator. Eight Claude minds (Strategist,
  Scientist, Skeptic, Creator, Earner, Storyteller, Designer, Futurist) each generate a take on
  the visitor's idea in the chosen format; a Unified Mind merges them into one result.
- `/fun-with-claude/app-generator/`: AI App & UI Generator, laid out like Claude: chats on the
  left, each run's progress as chat messages in the middle, the app on the right with versions.
  Workflow: the eight minds plan in parallel → a **Huddle** merges their specs into one shared
  blueprint (resolving disagreements) → the **Conductor** streams the app; large apps continue
  automatically in up to 4 parts. Refining reuses the blueprint and the previous version.
  **Deploy** makes a shareable link to `/fun-with-claude/view/` with the app packed inside the
  link (nothing stored on a server); viewers can download or remix it. Previews and shared apps
  run in a sandboxed iframe with a no-network Content-Security-Policy. Activity panel with smart
  summary and export; usage (calls, tokens) is shown openly. Chats are saved in the browser.
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
An App Generator run with all minds = 8 short planning calls + 1 huddle + 1 to 4 build parts
(up to 8,000 output tokens each). Limit: 120 calls per visitor IP per minute, to stop runaway
scripts rather than normal use.
A generation with all eight minds = 9 Claude calls. Each visitor IP is limited to 54 calls a
minute (about 6 generations). Watch usage in Netlify (or your Anthropic console if using your key).
