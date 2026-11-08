# Indexplora Music Essentia

## What works now
- Responsive browser-based creative brief builder at `music/index.html`.
- Supabase schema for private user-owned music projects and generation jobs.
- Authenticated Edge Function entry point that validates the user and request.
- The API explicitly reports missing provider configuration instead of pretending to generate audio.

## Not yet live
- No verified music-generation API adapter is installed.
- No Supabase project has been designated for Music Essentia; do not deploy the migration to an unrelated project.
- No server secrets have been configured.
- No hosting or GoDaddy route has been changed.
- Figma import was not completed.

## Deployment sequence
1. Select or create a dedicated Supabase project for Music Essentia.
2. Apply `supabase/migrations/202611080001_music_essentia.sql`.
3. Deploy `supabase/functions/music-generate/index.ts`.
4. Configure server-side secrets: `MUSIC_PROVIDER`, `MUSIC_PROVIDER_API_KEY`, and `APP_ORIGIN`.
5. Implement and test a provider-specific adapter against the provider's documented API and commercial-use terms.
6. Connect authenticated frontend requests and job polling; store generated audio in a private storage bucket with signed playback URLs.
7. Deploy the app to a supported host and configure the GoDaddy Website Builder page to embed it. Test mobile layout, auth, failures, storage permissions, and billing before public launch.

Never expose provider secrets in browser JavaScript. Do not use an unofficial API or claim commercial rights without checking the provider's terms.
