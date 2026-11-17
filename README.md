# indexplorabyarvic
Evolution Maintenance Operating System: source for indexplora.com.

## Structure
- `index.html`, `assets/*-<hash>.js|css|png`: the full indexplora.com app (React/Vite build
  transferred from the Figma Sites deployment, 58 routes). Edits:
  - asset base changed from `https://www.indexplora.com/` to `/` so it is self-contained;
  - "Live Developments" subtitle relabelled as an illustrative concept feed;
  - the unverified HIPAA claim removed from the Security & Privacy note.
- `music/`: Music Essentia studio (see `music/README.md`)
- `rebuild/`: hand-written static overview and gallery (`rebuild/gallery/`)
- `assets/site.css`, `assets/favicon.svg`, `assets/gallery/`: used by `music/` and `rebuild/`
- `supabase/`: Music Essentia schema and Edge Function (not yet deployed)

## Hosting
No build step: deploy the repo root as a static site. Every app route (e.g. `/gene-design-lab`)
must fall back to `index.html`; this is already configured for:
- GitHub Pages: `404.html` (copy of `index.html`) and `.nojekyll`
- Netlify / Cloudflare Pages: `_redirects`
- Vercel: `vercel.json`

The app still calls its existing Supabase project (auth and `make-server-76921f97` functions)
and Stripe. Those back ends were not moved; check sign-in and checkout on the new host, and
add the new domain to Supabase's allowed redirect URLs if it changes.

The compiled bundle is not meant to be hand-edited. For real changes, export the source from
Figma and rebuild.
