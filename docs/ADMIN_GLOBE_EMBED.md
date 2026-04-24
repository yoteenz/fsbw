# Admin revenue — WebGL globe (`embed/admin-globe`)

The **3D globe** (`globe.gl` + `three.js`) lives only in **`embed/admin-globe/`**. It is deployed as a **second Vercel project** (same repo, root directory `embed/admin-globe`). The **main storefront** loads it in an **`<iframe>`** on **Admin → Revenue** only — **`three` never ships in the main app `vendor` bundle`**.

**Look (embed):** Light **background**, **no** graticule, **no** photo texture — **dot-matrix land** from **Natural Earth `ne_110m_land.geojson`** (bundled in **`embed/admin-globe/public/`** and **`/` storefront `public/`** for the SVG fallback): coast + interior samples, **mint → sky** by latitude. **Hex bins** only for **hotspot pillars** (jittered visitor/order coords). Soft **cyan atmosphere**; **red** visitors / **green** orders.

**Cache / deploy:** The main app iframe URL appends **`b=<git sha or timestamp>`** from **`__GLOBE_EMBED_BUILD__`** (Vite `define` on each deploy) so you do **not** rely on manually bumping `?v=`. Redeploy **embed** when **`src/utils/adminGlobeNe110mLand.ts`** or embed code changes; redeploy **main** for iframe URL / SPA rewrite / `public/ne_110m_land.geojson`.

---

## 1. Deploy the embed (admin-globe-embed)

1. Vercel → **New Project** → this repo  
2. **Root Directory:** `embed/admin-globe`  
3. Build: `npm run build` (output `dist/`)  
4. Copy the production URL, e.g. `https://admin-globe-embed-xxx.vercel.app`

**PostCSS:** This folder includes `postcss.config.js` (empty plugins) so Vite does not pick up the monorepo root Tailwind PostCSS config.

**Land data:** `public/ne_110m_land.geojson` is [Natural Earth](https://www.naturalearthdata.com/) 110m land (public domain). The embed build resolves shared sampling from `../../src/utils/adminGlobeNe110mLand.ts` via Vite alias `@fsbw/adminGlobeNe110mLand`.

**Local:**

```bash
cd embed/admin-globe
npm install
npm run dev
# http://localhost:3010
```

---

## 2. Wire the main app (required for WebGL)

On the **main** Vercel project (the one that serves `/admin/revenue`):

```bash
VITE_ADMIN_GLOBE_EMBED_URL=https://your-admin-globe-embed.vercel.app
```

- **No trailing slash** (optional; code trims it).  
- **`VITE_*`** is inlined at **build time** — after setting or changing it, **redeploy the main app**.

Without this variable, Admin → Revenue uses the **SVG/CSS** fallback only.

**Check in DevTools:** wrapper `data-admin-globe-mode="iframe-webgl"` vs `svg-analytics`.

---

## 3. `postMessage` protocol (must match `embed/admin-globe/src/main.ts`)

**Iframe → parent** (ready):

```ts
{ type: 'fsbw-admin-globe-ready' }
```

**Parent → iframe** (after ready):

```ts
{ type: 'fsbw-admin-globe', points: Array<{ lat, lng, label, kind: 'visitor' | 'order' }> }
```

**Iframe → parent** (user tapped a point on the WebGL globe):

```ts
{ type: 'fsbw-admin-globe-point', kind, label, lat, lng }
```

The parent only accepts messages where `event.source` is the iframe’s `contentWindow`.

---

## 4. Iframe `sandbox`

`sandbox="allow-scripts"` — WebGL runs in the iframe; no `three` in the parent bundle.

---

## 5. “Different way” without iframe

The only other way to keep **`three`** out of the main **`vendor`** chunk is **dynamic `import()` in a separate Rollup async chunk** that is **never** preloaded from the entry graph — fragile with Vite. **Iframe + second deploy** is the reliable pattern.
