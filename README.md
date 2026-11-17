# indexplorabyarvic
Evolution Maintenance Operating System — source for indexplora.com.

## Structure
- `index.html` — home page (about, modules, principles)
- `music/` — Music Essentia studio (see `music/README.md`)
- `gallery/` — prototype and editorial galleries (images in `assets/gallery/`; Unsplash photos are hotlinked)
- `assets/` — shared stylesheet and favicon
- `404.html`, `robots.txt`, `sitemap.xml`
- `supabase/` — Music Essentia schema and Edge Function (not yet deployed)

Plain static HTML/CSS, no build step. Deploy the repo root to any static host
(GitHub Pages, Netlify, Cloudflare Pages, Vercel) and point indexplora.com at it.
