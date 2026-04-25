# Admin revenue — WebGL globe (`embed/admin-globe`)

The **3D globe** (`globe.gl` + `three.js`) lives only in **`embed/admin-globe/`**. It is deployed as a **second Vercel project** (same repo, root directory `embed/admin-globe`). The **main storefront** loads it in an **`<iframe>`** on **Admin → Revenue** only — **`three` never ships in the main app `vendor` bundle`**.

**Look (embed):** Transparent page/canvas (iframe on marble). **Ocean base:** **`globeImageUrl`** = very light PNG + **`onGlobeReady`** sets **`globeMaterial()`** **`transparent`**, **`opacity ~0.28`**, **`depthWrite: false`** so marble shows through. **Continents:** **~38k** land samples with **weight `800`** → **H3 `hexBinMerge(true)`** = one **merged honeycomb mesh** (flat prism tops, mint→sky by bin center lat). **Visitor** hotspots still add **weight-1** jitter around visitor dots for density, but **`hexAltitude`** uses the **same flat height** as land (no **`sqrt(sumWeight)`** extrusion) so you do **not** get tall slate “pillars.” **Order clusters** are **flat green dots** (same **`pointAltitude`**, slightly larger radius). **Borders:** **`pathsData`** from **`ne_110m_admin_0_boundary_lines_land.geojson`** (countries) + **`ne_110m_admin_1_states_provinces_lines.geojson`** (states/provinces). Polylines are split into **short two-point rows**. **Visual:** borders sit **above** the merged land hex (**`pathPointAlt`** slightly higher than land **`hexAltitude`**, thicker **`pathStroke`**, high-contrast **slate gradient**) so country/state lines read clearly on top of the mesh. **`pathDashAnimateTime(0)`** — borders do not crawl. **Atmosphere** = soft slate. **Red** visitors / **green** orders.

**Order cluster landmarks (zoomed in):** **`htmlElementsData`** shows one **small postcard / stamp** per order cluster (cream paper gradient, light fiber texture, dashed inner border, soft offset shadow, slight **stable tilt** from `clusterKey`). The **glyph** uses **rounded / emoji** font stack, **~44% opacity**, sepia + softened contrast so it reads like a **faded ink stamp**, not a glossy app icon. Tap opens **`MSG_CLUSTER`** + recenters. **Pointer layering:** the **CSS2D** overlay stays **`pointer-events: none`** so **OrbitControls** receives **`pointerdown`** on the **WebGL canvas** for dragging; only landmark **`<button data-fsbw-landmark="1">`** nodes get **`pointer-events: auto`**. (Setting **`auto`** on the whole overlay steals drags and can leave controls **stuck** after the parent cluster panel closes.) When **`fsbw-admin-globe-ui-cluster-panel`** closes, the embed **reconnects** OrbitControls to the canvas to clear any stuck **`pointerCapture`**. **Fallback:** tapping the **green order dot** still calls **`activateOrderCluster`** via **`onPointClick`**.

**Map labels (zoomed in):** When the orbit camera is **close** (distance / **`GLOBE_RADIUS`** − 1 ≤ **~1.15**), **`labelsData`** shows **`placeLine · placeDetail`** (single-line `TextGeometry` — no newline) from the iframe **`postMessage`** payload; **`reorderGlobeLabelsAboveHex()`** keeps **labels** then **HTML** after **hex** so text and landmark chips are not buried. Zoom gating uses **`camera.position.length`** (reliable) not only **`pointOfView()`** timing.

**Recenter / initial framing (Memphis, TN, USA):** On **first paint** the globe uses **`pointOfView`** over **Memphis** (`lat ~35.1495`, `lng ~-90.049`). **Double-click** (desktop) or **double-tap** with **one finger** (mobile) → animates to **Memphis** at **`HOME_ALTITUDE`** (~`1.35` over **~900ms**). **Pinch-zoom** is ignored for double-tap detection (two `pointerup`s in quick succession no longer trigger home — that used to feel like “auto zoom out” after zooming in).

**Performance (many markers / mocks):** Hex-bin jitter applies to **visitors** only; jitter count **scales down** with visitor count. The parent skips **`postMessage`** when the serialized payload is unchanged (avoids redundant hex rebuilds every 30s poll).

**Mock globe data (main app):** Merges **`adminGlobeMockPresence.ts`** worldwide **visitor** + **order** dots with real data on Admin → Revenue (globe + Live View card). Enable any one of:

- **`VITE_ADMIN_GLOBE_MOCK_DATA=1`** (or **`true`** / **`yes`**) in **`.env.local`** — rebuild dev / redeploy production.
- **`localStorage`** or **`sessionStorage`** key **`adminGlobeMockData`** = **`1`**, **`true`**, **`yes`**, or **`on`** — refresh.
- Open **Admin → Revenue** with **`?globe_mock=1`** (or **`true`**) in the URL — persists **`sessionStorage.adminGlobeMockData=1`** for that tab session (no env change; good for production QA). Params in the **hash** (e.g. `#?globe_mock=1`) are also read.
- On **Admin → Revenue → Overview**, use **LOAD MOCK GLOBE DATA** under the globe (no URL or console needed); **CLEAR MOCK DATA** turns session mocks off.

**Cache / deploy:** The main app iframe URL appends **`b=<git sha or timestamp>`** from **`__GLOBE_EMBED_BUILD__`** (Vite `define` on each deploy) so you do **not** rely on manually bumping `?v=`. Redeploy **embed** when **`src/utils/adminGlobeNe110mLand.ts`**, boundary utils, or embed code changes; redeploy **main** for iframe URL / SPA rewrite / `public/*.geojson` (including **`ne_110m_admin_1_states_provinces_lines.geojson`**).

---

## 1. Deploy the embed (admin-globe-embed)

1. Vercel → **New Project** → this repo  
2. **Root Directory:** `embed/admin-globe`  
3. Build: `npm run build` (output `dist/`)  
4. Copy the production URL, e.g. `https://admin-globe-embed-xxx.vercel.app`

**PostCSS:** This folder includes `postcss.config.js` (empty plugins) so Vite does not pick up the monorepo root Tailwind PostCSS config.

**Land data:** `public/ne_110m_land.geojson` is [Natural Earth](https://www.naturalearthdata.com/) 110m land (public domain). **`public/ne_110m_admin_0_boundary_lines_land.geojson`** = international boundaries on land; **`public/ne_110m_admin_1_states_provinces_lines.geojson`** = internal state/province lines. Shared utils: **`@fsbw/adminGlobeNe110mLand`**, **`@fsbw/adminGlobeBoundaryPaths`**.

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

**Parent → iframe** (after ready) — **pause auto-rotate** while the order cluster panel is open (keeps the view steady on the tapped location):

```ts
{ type: 'fsbw-admin-globe-ui-cluster-panel', open: boolean }
```

**Parent → iframe** (after ready) — **points payload**:

```ts
{
  type: 'fsbw-admin-globe',
  points: Array<{
    lat: number;
    lng: number;
    label: string;
    kind: 'visitor' | 'order';
    placeLine?: string;
    placeDetail?: string;
    /** Order clusters only — ship-to key + landmark + pillar height + per-email rollup */
    clusterKey?: string;
    orderCount?: number;
    landmarkTitle?: string;
    landmarkSymbol?: string;
    orderTowerHeight?: number;
    clusterCustomers?: Array<{ email: string; orderCount: number; totalSpent: number; topProduct: string }>;
  }>;
}
```

**Iframe → parent** (user tapped a **visitor** dot):

```ts
{ type: 'fsbw-admin-globe-point', kind, label, lat, lng }
```

**Iframe → parent** (user tapped an **order cluster dot** — **from any zoom**):

```ts
{
  type: 'fsbw-admin-globe-cluster',
  clusterKey, placeLine, orderCount, landmarkTitle, landmarkSymbol,
  customers: Array<{ email, orderCount, totalSpent, topProduct }>,
}
```

The embed then **animates `pointOfView`** to that cluster’s **lat/lng** at a **close altitude** (~`0.38`) so the city is centered and the holographic panel (parent) stays open while zooming. While that animation runs, **`fsbw-admin-globe-pov` with `clusterPanel: false`** is **suppressed** briefly so the parent does not clear the panel mid-flight.

**Iframe → parent** (camera zoom — parent may clear cluster UI when zooming out):

```ts
{ type: 'fsbw-admin-globe-pov', clusterPanel: boolean }
```

The parent only accepts messages where `event.source` is the iframe’s `contentWindow`.

---

## 4. Iframe `sandbox`

`sandbox="allow-scripts"` — WebGL runs in the iframe; no `three` in the parent bundle.

---

## 5. “Different way” without iframe

The only other way to keep **`three`** out of the main **`vendor`** chunk is **dynamic `import()` in a separate Rollup async chunk** that is **never** preloaded from the entry graph — fragile with Vite. **Iframe + second deploy** is the reliable pattern.
