# Azterra / One Map

Interactive campaign OS for Dungeon Masters: a Leaflet-powered world map, atlas, compendium, player hub, and lightweight Express API with markdown content ingestion.

## What we built
- **Immersive map + editor**: Custom tile set (docs/tiles) with fog, vignette, cloud, heatmap, parallax layers, keyboard/nav controls, and an editor mode for placing typed markers with icon/glow palettes, filters, and region overlays.
- **Atlas & compendium**: World Atlas and location detail views, an Almanac plus societies/cosmos/heroes tabs, and per-region pages that reuse the same data the map consumes.
- **Accounts & permissions**: Supabase/Google/local auth, JWT sessions, role-gated areas (guest → pending → editor/admin), secret unlocks, and friend/favorite state persisted per user.
- **Campaign & player hub**: Campaigns tied to players, featured/favorited characters, public player cards, and document uploads (PDF/TXT) stored on the server.
- **Content ingestion pipeline**: `npm run import-content` scans Obsidian-style markdown (configurable patterns), normalizes to `server/data/content.json`, emits diagnostics, and lets the UI render lore cards even when offline via `src/data/content.json`.
- **Admin tools**: Visibility toggles for characters/locations/NPCs, asset uploads with download auditing, map/region saves with rotating backups, and a default admin auto-seeded from env.

## How it works (frontend)
- Built with Vite + React + React Router (HashRouter by default; BrowserRouter only for the auth callback).
- Leaflet map (`src/components/map/InteractiveMap.jsx`) uses layered effects, marker palette, filters, and region hover cards. Tiles live in `docs/tiles` so the built site can run from static hosting under `base: '/p15/'`.
- Contexts coordinate data + effects (`src/context/*`): auth, content, map effects, regions, and locations. API calls go to `VITE_API_BASE_URL` with graceful fallbacks to `src/data/*.json` when the backend is down.
- Feature surfaces: Map, Atlas (viewer + editor), Compendium (almanac/societies/cosmos/heroes), Campaign, Players + public profiles, Secrets pages, Admin dashboard, and detail routes for regions/locations.

## How it works (backend)
- Express server (`server/server.js`) with JSON-file persistence under `server/data`. Save routes create timestamped backups to avoid map/region loss.
- Auth: email/password, Google OAuth, and Supabase token verification. JWT secret is required; a default admin user is auto-created from env values.
- Domain routes: locations/regions (save + fetch), content (markdown-imported lore), characters (favorites/visibility), campaigns, players, files (upload/download), secrets, entities/npcs, and view helpers for the public cards.
- Utilities: rotating backups for users/content, visibility lists for gating public data, uploads stored on disk with MIME guards.

## Local setup
1) Install deps  
```bash
npm install
```
2) Start the API (defaults to port 4000)  
```bash
npm run server
```
3) Start the web app (Vite on 5173 with `/api` proxying to 4000)  
```bash
npm run dev
```
4) Build for static hosting (outputs to `docs/` for GitHub Pages)  
```bash
npm run build
npm run preview  # optional check
```

### Environment variables
Create `.env.local` for the client (Vite):
- `VITE_API_BASE_URL=http://localhost:4000/api`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (enable Supabase auth)
- `VITE_SUPABASE_REDIRECT_URL` (defaults to `${origin}/p15/auth/callback`)

Create `.env` for the server:
- `PORT=4000`
- `JWT_SECRET=` (required for login)
- `DEFAULT_ADMIN_EMAIL=admin@azterra.com`, `DEFAULT_ADMIN_PASSWORD=admin12345`, `DEFAULT_ADMIN_NAME=Azterra Admin`
- `GOOGLE_CLIENT_ID=` (optional Google Sign-In)
- `SUPABASE_JWT_SECRET=` (to verify Supabase access tokens)

### Content import workflow
1) Set source folders/patterns in `content-importer.config.json` (rootFolder, include/exclude globs, extensions).  
2) Run `npm run import-content` to scan markdown, normalize entries, and write `server/data/content.json` + `content-diagnostics.json` with validation (missing IDs, invalid regions/map links, unreadable files).  
3) Restart the server or refresh the app; the UI will pull the imported entries.

### Data + backups
- Map + region saves live in `server/data/locations.json` and `server/data/regions.json` with rotating backups (`locations_backup_*`, `regions_backup_*`).  
- User, visibility, secrets, uploads, and content files are kept under `server/` with backup folders for critical stores.  
- Frontend ships seed data in `src/data/` so demo content still renders without the API.

### Useful scripts
- `npm run dev` / `npm run build` / `npm run preview` – frontend.
- `npm run server` – start Express API.
- `npm run import-content` – ingest markdown notes into structured content.
- `npm run lint` – lint the project.

### Deploying
- The Vite `base` is `/p15/`; keep that path when hosting (GitHub Pages-friendly).  
- Static assets (tiles, icons) already live under `docs/`. Serve `docs/` and run the API wherever `/api` points.
