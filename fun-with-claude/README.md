# Fun with Claude

A separate section of indexplora.com for Claude experiments. Nothing here changes or depends on
the existing app code; the page styles are copies kept in `fun-with-claude/assets/`.

- `/fun-with-claude/`: section home.
- `/fun-with-claude/eight-minds/`: 8-Mind AI Generator. Eight Claude minds (Strategist,
  Scientist, Skeptic, Creator, Earner, Storyteller, Designer, Futurist) each generate a take on
  the visitor's idea in the chosen format; a Unified Mind merges them into one result.
- `netlify/functions/fun-with-claude.mts`: the back end at `POST /api/fun-with-claude`
  (no npm packages). Holds the persona prompts; the browser can only pick minds by id.

## Claude access
On Netlify credit-based plans the AI Gateway supplies Claude credentials automatically and bills
Netlify credits. Otherwise set `ANTHROPIC_API_KEY` in Netlify (Site configuration > Environment
variables, scope: Functions) and redeploy. Your own key always takes priority over the gateway.

Optional: `FUN_CLAUDE_MODEL` (default `claude-sonnet-5-5`), `FUN_CLAUDE_REQUIRE_SIGNIN`
(`true`/`false`). By default the live site requires an Indexplora sign-in and previews do not.

## Cost and limits
A generation with all eight minds = 9 Claude calls. Each visitor IP is limited to 54 calls a
minute (about 6 generations). Watch usage in Netlify (or your Anthropic console if using your key).
