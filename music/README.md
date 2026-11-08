# Indexplora Music Essentia

A responsive, self-contained front-end concept for the Music Essentia workspace.

## Current capability
- Responsive music concept form
- Genre, vocal, language and mood selection
- Generates a structured production brief locally in the browser

## Not yet connected
- AI audio generation provider
- User authentication and saved projects
- Audio storage, playback library and billing
- Production deployment at https://indexplora.com/music

## Integration requirements
Choose a music-generation provider with commercial-use terms appropriate to the product. Store provider credentials only as server-side secrets. Add an authenticated backend endpoint for generation jobs, persist job metadata and audio assets in a selected Supabase project, and configure the website host to route /music to this app.

Do not put API keys in browser code.
