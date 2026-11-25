# Fun with Claude

A separate section of indexplora.com for Claude experiments. Nothing here changes or depends on
the existing app code; the page styles are copies kept in `fun-with-claude/assets/`.

- `/fun-with-claude/`: section home.
- `/fun-with-claude/evolution-dash/`: Evolution Dash. Visitors press buttons (form, element, gift,
  art style, companion) and Claude creates an original, all-ages god, goddess or deity of creativity:
  SVG artwork, name, title and a mini-epic. "Evolve" adds a new influence and creates the next
  stage (up to 9), with a stage timeline and PNG/SVG downloads. Every creation and evolution is
  published to the **public Pantheon** (Netlify Blobs store `fwc-pantheon`, shared by previews and
  production) after an automatic all-ages safety check of all its text, including text in the art.
  Anyone can browse it; the creator's device keeps only a private owner key (`fwc.dash.mine`) that
  allows evolving or removing their own. Creations saved on a device by the earlier version are
  moved to the Pantheon automatically and deleted from the device only after they're safely public.
  `package.json` exists only so Netlify installs `@netlify/blobs` for this function; there is still
  no build step.
  Only listed button values are accepted; the SVG is sanitised on the server and shown as an
  <img>, so it can't run code. Back end: `netlify/functions/fun-with-claude-dash.mts` at
  `POST /api/fun-with-claude/dash` .
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
  **Quality loop (Self-improve, on by default):** after each build the preview reports runtime
  errors, a static lint checks the industry-standard bar (title, lang, viewport, alt text, labels,
  focus styles, reduced motion, external files), and a Reviewer scores it out of 100 with issues and
  **foresight** warnings about knock-on effects on users, others, animals and the environment.
  Below 85 or with runtime errors, one automatic improvement pass builds the next version and
  re-checks it. Warnings go to the chat and the Activity log.
  **Live suggestions** (💡) fade in and out under the prompt bar, with a soft pulse while thinking;
  they learn from the user's recent prompts and picks (kept only in their browser, resettable) (uses `FUN_CLAUDE_SUGGEST_MODEL`,
  default `claude-haiku-5-5`). **Export backup / Import** saves chats, versions and the activity log
  as a JSON file (e.g. to iCloud Drive) and restores it in any browser.
  Back end: `netlify/functions/fun-with-claude-apps.mts` at `POST /api/fun-with-claude/apps`.
- `netlify/functions/fun-with-claude.mts`: the back end at `POST /api/fun-with-claude`
  (no npm packages). Holds the persona prompts; the browser can only pick minds by id.

## Claude access
On Netlify credit-based plans the AI Gateway supplies Claude credentials automatically and bills
Netlify credits. Otherwise set `ANTHROPIC_API_KEY` in Netlify (Site configuration > Environment
variables, scope: Functions) and redeploy. Your own key always takes priority over the gateway.

Optional: `FUN_CLAUDE_MODEL` (default `claude-sonnet-5-5`), `FUN_CLAUDE_REQUIRE_SIGNIN`
(`true`/`false`). By default the live site requires an Indexplora sign-in and previews do not.

- `/fun-with-claude/showcase/`: public App Showcase. "Share 🌍" in the App Generator publishes an app
  (Netlify Blobs store `fwc-showcase`) after an all-ages safety check; anyone can open it at
  `/fun-with-claude/view/#s=<id>` or remix it. The sharing device keeps a private owner key to remove it.

- `/fun-with-claude/wellbeing/`: Wellbeing Studio. Break rhythm timer (optional browser
  notifications), 20-20-20 eye rest, box breathing, guided stretches, water tracker and a private
  mood check-in with a gentle "talk to someone" note after several low days. All data stays in the
  visitor's browser (`fwc.well.*`, "Clear my data" removes it). General wellness, not medical advice.
- `/fun-with-claude/status/`: the hourly health pulse (reads `GET /api/fun-with-claude/status`).

## Hourly health pulse ("pests out")
`netlify/functions/fun-with-claude-pulse.mts` is a scheduled function (17 minutes past every hour,
production only; "Run now" in Netlify runs it on demand). It checks Claude with a tiny request,
checks every Pantheon creation and Showcase app is well-formed and safe to show, moves anything broken
to the `fwc-quarantine` store (restorable for 30 days, then cleared), and records the pulse in
`fwc-health` (one week kept). It can't change the site's code: code changes still go through a pull
request a person approves.

## Parallel builders ("RAM split") and the feature ledger
After the minds and the huddle, the **Architect** splits the app into up to 20 modules and writes a
shared shell: design tokens, layout with one slot per module, and a tiny `window.App` event/state
runtime. Up to **20 builders** then write their modules at the same time (one request each, retried
once if busy), and the page assembles them instantly. Each module's script runs isolated, so one
broken module can't stop the others, and its error names the module for the quality check. Choose
20/12/8/4 builders, or "1 builder (in parts)". If the Architect fails, it falls back to one builder.
Builders use the main model (`FUN_CLAUDE_BUILDER_MODEL`, default = `FUN_CLAUDE_MODEL`); if Claude is busy
a builder retries with the lighter `FUN_CLAUDE_LITE_MODEL` (default `claude-haiku-5-5`).
Every chat keeps a **feature ledger** of everything asked for so far; minds, huddle, Architect,
builders and reviewer all receive it, so new versions keep every earlier feature and connect them.

## Request time limit
Netlify Free cuts every request at about 30 seconds. Every Claude call is therefore sized to finish
in time: single-builder parts are capped at 2,600 tokens (`FUN_CLAUDE_PART_TOKENS`) with a hard 24s
timer (`FUN_CLAUDE_PART_MS`), and the page continues automatically (up to 12 parts). Evolution Dash streams
internally and stops by about 25s (`FUN_CLAUDE_DASH_MS`), closing any unfinished artwork so it still
displays. On a paid plan with a longer limit you can raise both values.

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
(up to 8,000 output tokens each). There is no per-visitor rate limit (owner's choice); `FUN_CLAUDE_PAUSED=true` stops everything at once.
A generation with all eight minds = 9 Claude calls. Each visitor IP is limited to 54 calls a
minute (about 6 generations). Watch usage in Netlify (or your Anthropic console if using your key).
