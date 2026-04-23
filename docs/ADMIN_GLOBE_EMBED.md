# Admin revenue WebGL globe — separate deploy (iframe)

The main storefront app **must not** bundle `three.js` / `globe.gl`: Vite merges those into **`vendor`** (~multi‑MB), which can **crash mobile Safari** when combined with the rest of the app.

This repo includes a **tiny second app** at **`embed/admin-globe/`** that only renders the WebGL globe. Deploy it as its **own Vercel project** (or any static host). The main app loads it in an **`<iframe>`** and passes point data with **`postMessage`**.

---

## 1. Deploy the embed

1. In Vercel, **New Project** → import the **same Git repo**.
2. Set **Root Directory** to: `embed/admin-globe`
3. Build: default (`npm run build`) — output is **`dist/`**.
4. Deploy. Note the URL, e.g. `https://admin-globe-embed.vercel.app`

**Local check**

```bash
cd embed/admin-globe
npm install
npm run dev
# open http://localhost:3010 — you should see the globe
```

---

## 2. Wire the main app

In the **main** Vercel project (and `.env.local` for dev), set:

```bash
VITE_ADMIN_GLOBE_EMBED_URL=https://admin-globe-embed.vercel.app
```

Use the **origin only** (no path required). The revenue page iframe loads that URL.

Redeploy the main app. **Admin → Revenue → Overview** will use the iframe when this variable is set; otherwise it keeps the **SVG/CSS** globe (no WebGL in `vendor`).

---

## 3. Protocol (`postMessage`)

**Parent → iframe** (after iframe sends ready):

```ts
{ type: 'fsbw-admin-globe', points: Array<{ lat, lng, label, kind: 'visitor' | 'order' }> }
```

**Iframe → parent** (globe ready):

```ts
{ type: 'fsbw-admin-globe-ready' }
```

**Iframe → parent** (user tapped a point):

```ts
{ type: 'fsbw-admin-globe-point', kind, label, lat, lng }
```

The parent only accepts messages whose **`event.source`** is the iframe’s `contentWindow` (see `AdminRevenueLiveGlobe.tsx`).

**Security note:** `postMessage` uses `'*` as target origin for simplicity. For stricter setups, switch both sides to an explicit origin (main app URL + embed URL).

---

## 4. CORS / cookies

The embed is **static** (no API calls). It only loads **textures from jsDelivr** and runs WebGL in the iframe. No cookies required.

---

## 5. Sandbox

The iframe uses **`sandbox="allow-scripts"`** (no `allow-same-origin`) so the embed runs in an **opaque origin** when cross‑origin — safer if the embed URL is ever not fully trusted. WebGL still works in modern browsers for this case.

If you **must** use `allow-same-origin` (e.g. for future features), only do so when the embed is **your** origin and you accept the relaxed sandbox model.

---

## 6. Micro‑frontend vs iframe

- **Iframe** (this doc): simplest isolation; separate JS heap; separate bundle; easy to version/deploy independently.
- **True micro‑frontend** (module federation, import maps): shares the parent page’s memory budget — usually **does not** solve the “mobile vendor too big” problem unless the heavy code is still a separate async chunk and never preloaded.

For this product, **iframe + separate Vercel project** is the recommended path.
