# Admin revenue globe (historical): iframe WebGL embed

The main app **no longer uses** an iframe WebGL path. Admin → Revenue uses a **single SVG/CSS “analytics globe”** in `src/components/admin/AdminRevenueLiveGlobe.tsx` (dark sphere, dot grid, meridians, glow, animated arcs) so it stays **reliable on mobile** and never pulls **`three.js`** into the main `vendor` bundle.

The **`embed/admin-globe/`** folder remains in the repo as an **optional standalone experiment** if you ever want to host WebGL on a **separate** origin for desktop-only demos — it is **not wired** to production by default.

---

## If you still run `embed/admin-globe` separately

1. Vercel project root: `embed/admin-globe`
2. `npm run build` → deploy `dist/`
3. Local: `cd embed/admin-globe && npm install && npm run dev` (port 3010)

See `embed/admin-globe/package.json` for scripts.

**Note:** `postcss.config.js` in that folder prevents Vite from picking up the monorepo root Tailwind PostCSS config during embed builds.
