# Azterra / One Map

https://azterra.netlify.app

Interactive campaign OS for Dungeon Masters: a Leaflet-powered world map, atlas, compendium, player hub, and lightweight Express API with markdown content ingestion.

Status: in progress - we keep shipping updates to the live site and expanding the toolset.

**Learn the story:** Open the in-app About page to see how Azterra came together, why we built it, and what's next.

## What you can do

- Explore the Azterra map with fog, vignette, heatmap, and parallax effects; filter markers and jump into regions or locations for lore.
- Edit the map in creator mode with typed markers, icon/glow palettes, overlays, and backups to keep edits safe.
- Browse the atlas and compendium (almanac, societies, cosmos, heroes, per-region details) that all use the same data as the map.
- Manage campaigns, players, and featured/favorited characters; share public player cards.
- Upload documents (PDF/TXT), unlock secrets, and keep friend/favorite state per user across devices.

## What we built

- **Immersive map + editor**: Custom tile set (docs/tiles) with fog, vignette, cloud, heatmap, parallax layers, keyboard/nav controls, and an editor mode for placing typed markers with icon/glow palettes, filters, and region overlays.
- **Atlas & compendium**: World Atlas and location detail views, an Almanac plus societies/cosmos/heroes tabs, and per-region pages that reuse the same data the map consumes.
- **Accounts & permissions**: Supabase/Google/local auth, JWT sessions, role-gated areas (guest -> pending -> editor/admin), secret unlocks, and friend/favorite state persisted per user.
- **Campaign & player hub**: Campaigns tied to players, featured/favorited characters, public player cards, and document uploads (PDF/TXT) stored on the server.
- **Admin tools**: Visibility toggles for characters/locations/NPCs, asset uploads with download auditing, map/region saves with rotating backups, and a default admin auto-seeded from env.

## Systems and stack

- Frontend: Vite, React, React Router, Leaflet, and context-based state for auth, map, content, and regions.
- Backend: Express with JSON persistence, rotating backups, uploads, and Supabase/Google/local auth.
- Netlify functions: Keep `VITE_API_BASE_URL=/api` and rely on the Netlify redirect in `netlify.toml` to proxy calls into the serverless API.

## How it works (frontend)

- Built with Vite + React + React Router (BrowserRouter with `base: '/p15/'`; static hosts need SPA rewrites).
- Leaflet map (`src/components/map/InteractiveMap.jsx`) uses layered effects, marker palette, filters, and region hover cards. Tiles live in `docs/tiles` so the built site can run from static hosting under `base: '/p15/'`.
- Contexts coordinate data + effects (`src/context/*`): auth, content, map effects, regions, and locations. API calls go to `VITE_API_BASE_URL` with graceful fallbacks to `src/data/*.json` when the backend is down.
- Feature surfaces: Map, Atlas (viewer + editor), Compendium (almanac/societies/cosmos/heroes), Campaign, Players + public profiles, Secrets pages, Admin dashboard, and detail routes for regions/locations.

## How it works (backend)

- Express server (`server/server.js`) with JSON-file persistence under `server/data`. Save routes create timestamped backups to avoid map/region loss.
- Auth: email/password, Google OAuth, and Supabase token verification. JWT secret is required; a default admin user is auto-created from env values.
- Domain routes: locations/regions (save + fetch), content (markdown-imported lore), characters (favorites/visibility), campaigns, players, files (upload/download), secrets, entities/npcs, and view helpers for the public cards.
- Utilities: rotating backups for users/content, visibility lists for gating public data, uploads stored on disk with MIME guards.
- Entry wiring lives in `server/routes/index.js` (all `app.use` mounts) and middleware like Supabase auth sits under `server/middleware/`. Config + env loading is centralized in `server/config/env.js` so the entry file stays lean.
