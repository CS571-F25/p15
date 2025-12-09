# Copilot instructions for contributors and AI agents

Purpose: concise, actionable guidance so an AI can be productive in this repo.

- **Project type & entry:** Vite + React single-page app. Entry: `src/main.jsx` -> `App.jsx`.
- **Build & dev:** use `npm run dev` (vite dev server), `npm run build` (outputs to `docs/`), `npm run preview` to inspect build. Lint with `npm run lint`.

- **Why `docs/` and `base` matter:** `vite.config.js` sets `base: '/p15/'` and `build.outDir: 'docs'`. The build is intended for GitHub Pages or similar subpath hosting—preserve the `base` and `outDir` when editing asset paths or deploy logic.

- **Major pieces (where to look):**
  - `src/` — main application source. Keep changes here.
  - `src/main.jsx` — app bootstrap (ReactDOM.createRoot).
  - `src/App.jsx` — top-level app routing and layout.
  - `src/components/` — UI broken into subfolders: `map/` (map components, e.g. `InteractiveMap.jsx`), `pages/`, `UI/`, `visuals/`.
  - `src/data/` — static data: `characters.js`, `locations.json`.
  - `public/tiles/` and `public/` — static tile images and static pages; these copy to `docs/` on build.
  - `docs/` — produced build output; do not edit built files directly.

- **Map & tiles specifics:** Map UI uses `react-leaflet` + `leaflet`. Tile images live under `public/tiles/{z}/{x}/...`. When modifying map rendering, update `src/components/map/InteractiveMap.jsx` and verify tile paths respect `base`.

- **File conventions & patterns to follow:**
  - Components are modular and colocated with CSS: `.jsx`/`.tsx` paired with `.css` in same folder.
  - Small TypeScript usage exists (`IntroOverlay.tsx`) but the repo is primarily JavaScript; prefer keeping file types consistent with existing modules.
  - Routing uses `react-router(-dom)` — update `App.jsx` for route changes.

- **Dependencies & integration points:**
  - UI: `react`, `react-dom`, `react-bootstrap`, `bootstrap`.
  - Map: `leaflet`, `react-leaflet`.
  - Build: `vite` with `@vitejs/plugin-react`.

- **When making edits, verify:**
  - Dev: `npm install` then `npm run dev` loads the app at the Vite dev server.
  - Build artifacts land in `docs/` and expect the same relative tile paths under `docs/tiles/`.
  - Lint via `npm run lint` to match the project's eslint config.

- **Examples to reference when changing map behavior:**
  - `src/components/map/InteractiveMap.jsx` — Leaflet integration and tile layer usage.
  - `src/components/IntroOverlay.tsx` — example of a small TSX component and CSS colocation.
  - `src/data/locations.json` — canonical format for location objects used by the map and side panel.

- **Do not change without checking:**
  - `vite.config.js` base/outDir settings — breaking these will change deployed asset paths.
  - `public/tiles/` layout — renaming or reorganizing tiles requires updating tile layer URLs.

If anything is unclear or you want me to expand any section (routing details, component responsibilities, or a sample change workflow), tell me which area to elaborate.
