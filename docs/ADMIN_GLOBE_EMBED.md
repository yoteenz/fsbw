# Admin revenue — WebGL globe (`embed/admin-globe`)

The **3D globe** (`globe.gl` + `three.js`) lives only in **`embed/admin-globe/`**. It is deployed as a **second Vercel project** (same repo, root directory `embed/admin-globe`). The **main storefront** loads it in an **`<iframe>`** on **Admin → Revenue** only — **`three` never ships in the main app `vendor` bundle`**.

**Look (embed):** Light **background**, **no** graticule, **no** photo texture — **dot-matrix land** as many **small points** (Fibonacci sphere with correct **`lng = atan2(z, x)`**); **mint → sky** gradient by latitude (reference-style). **Hex bins** are used only for **hotspot pillars** (jittered around visitor/order coords), not for full continents. Soft **cyan atmosphere**; brand **red** visitors / **green** orders; **cache-bust** iframe `?v=4`.

---

## 1. Deploy the embed (admin-globe-embed)

1. Vercel → **New Project** → this repo  
2. **Root Directory:** `embed/admin-globe`  
3. Build: `npm run build` (output `dist/`)  
4. Copy the production URL, e.g. `https://admin-globe-embed-xxx.vercel.app`

**PostCSS:** This folder includes `postcss.config.js` (empty plugins) so Vite does not pick up the monorepo root Tailwind PostCSS config.

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
