# Admin revenue — WebGL globe (`embed/admin-globe`)

The **3D globe** (`globe.gl` + `three.js`) lives only in **`embed/admin-globe/`**. It is deployed as a **second Vercel project** (same repo, root directory `embed/admin-globe`). The **main storefront** loads it in an **`<iframe>`** on **Admin → Revenue** only — **`three` never ships in the main app `vendor` bundle`**.

**Look (embed):** Transparent page/canvas (iframe on marble). **Ocean base:** **`globeImageUrl`** = very light PNG + **`onGlobeReady`** sets **`globeMaterial()`** **`transparent`**, **`opacity ~0.28`**, **`depthWrite: false`** so marble shows through. **Continents:** **~38k** land samples with **weight `800`** → **H3 `hexBinMerge(true)`** = one **merged honeycomb mesh** (flat prism tops, mint→sky by bin center lat). **Hex bins** do **not** fake order/view volume (no hot-bin jitter for counts). **Order / view volume** = **stacked `pointsData`**: for each order **cluster** (`clusterKey`), **`applyPayload`** adds **`orderCount`** **green** markers and **`viewCount`** **red** markers (same 100 km rule as the cluster panel). **Stack altitude** starts at **`STACK_SURFACE_ALT`** (~land hex top, **~0.00585**) so **one** order is a **flat** disk on the surface; each additional order or view adds **`POINT_STACK_STEP`** (~**0.00135**) — one layer per count. `pointAltitude` reads each row’s **`alt`**. Distant **visitors** (not within ~5 km of a cluster) stay as **single** red dots at **`STACK_SURFACE_ALT`**. **Borders:** **`pathsData`** from **`ne_110m_admin_0_boundary_lines_land.geojson`** (countries) + **`ne_110m_admin_1_states_provinces_lines.geojson`** (states/provinces). **Atmosphere** = soft slate. **Red** = visitors + view stack; **green** = order stack.

**Postcard clips (zoomed in):** **`htmlElementsData`** — **one** small chip **per** order **cluster** and **per standalone visitor site** (deduped by **`postcardKey`**). Chips float at **`topOfStack + POSTCARD_ABOVE_STACK`**. **Neutral** hairline border only (**no** red/green frame — pillar color is on the markers). **Title + emoji** from payload or **`adminGlobeGeographicLandmark`**. Tap **order** chip → **`MSG_CLUSTER`**; tap **visitor** chip → **`MSG_POINT`**. **CSS2D** overlay stays **`pointer-events: none`** except **`[data-fsbw-landmark="1"]`**; embed reconnects **OrbitControls** when the parent cluster panel closes.

**Zoomed-in overlays:** **`labelsData`** is kept **empty** — no floating **`placeLine` / `placeDetail`** **`TextGeometry`** on zoom (dots + order-cluster **HTML** chips only). When the camera is **close** (same altitude band as before), **`htmlElementsData`** still shows **landmark** chips; **`reorderGlobeLabelsAboveHex()`** keeps the **HTML** layer after **hex** so chips are not buried. Zoom gating uses **`camera.position.length`** (reliable) not only **`pointOfView()`** timing.

**Recenter / initial framing (Memphis, TN, USA):** On **first paint** the globe uses **`pointOfView`** over **Memphis** (`lat ~35.1495`, `lng ~-90.049`). **Double-click** (desktop) or **double-tap** with **one finger** (mobile) → animates to **Memphis** at **`HOME_ALTITUDE`** (~`1.35` over **~900ms**). **Pinch-zoom** is ignored for double-tap detection (two `pointerup`s in quick succession no longer trigger home — that used to feel like “auto zoom out” after zooming in).

**Performance (many markers / mocks):** Stacked cluster markers are **`orderCount` + `viewCount`** per location (capped by practical WebGL only by admin design). The parent skips **`postMessage`** when the serialized payload is unchanged (avoids redundant hex rebuilds every 30s poll).

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

Implementation note: **globe.gl** often **re-enables** `OrbitControls.autoRotate` after **`width`/`height`**, **`hexBinPointsData` / `pointsData`**, **`pointOfView`**, etc. The embed therefore **re-asserts `autoRotate = false` every animation frame** while `open: true`, and calls **`enforceAutoRotateWhenClusterPanelOpen()`** after **`applySize`** / **`applyPayload`** as well.

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
    clusterCustomers?: Array<{
      email: string; orderCount: number; totalSpent: number; topProduct: string;
      displayName?: string; profileImageUrl?: string; age?: number | null;
    }>;
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
  clusterKey, placeLine, orderCount,
  /** Visitor dots within ~100 km of the cluster (same `points` payload as the globe). */
  viewCount: number,
  landmarkTitle, landmarkSymbol,
  customers: Array<{
    email, orderCount, totalSpent, topProduct,
    /** Optional — from main app `registeredUsers` merge for cluster panel UI */
    displayName?: string; profileImageUrl?: string; age?: number | null;
  }>,
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
