# Dev proxy and API base — how to check

When running the app **locally** (e.g. `npm run dev`), API calls (profile, sync, delete account, etc.) can go to your **deployed** backend (e.g. Vercel) so you don’t need to run the API on your machine. That’s done with a **proxy** and/or **API base** variable.

---

## Who reads which variable

| Variable | Read by | Purpose |
|----------|--------|--------|
| **`VITE_DEV_PROXY_TARGET`** | **Vite** (build tool) only, in `vite.config.ts` | In dev, proxy `/api/*` requests to this URL (e.g. `https://fsbw.vercel.app`). The **frontend code never reads this**; only the dev server uses it. |
| **`VITE_API_BASE`** | **Frontend** in `src/utils/api.ts` | Base URL for all API requests. If set (e.g. `https://fsbw.vercel.app`), every request goes to `API_BASE + path`. If **empty**, the app uses **relative** URLs like `/api/profile`, which hit the same origin (localhost) and are then **proxied** by Vite when the proxy is configured. |

So:

- **Proxy:** `vite.config.ts` reads `VITE_DEV_PROXY_TARGET` (or `VITE_API_BASE`) and configures `server.proxy` so that in dev, requests to `/api/*` are forwarded to that target.
- **Frontend:** `api.ts` only reads `VITE_API_BASE`. When it’s empty, it uses relative URLs, which are proxied when the proxy is enabled.

---

## How to check if the dev proxy variable is read

### 1. Where it’s read (code)

- **File:** `vite.config.ts`
- **Lines:** ~34–36 and ~45–46  
  The config calls `loadEnv(mode, process.cwd(), '')` and then:
  - `apiTarget = env.VITE_DEV_PROXY_TARGET || env.VITE_API_BASE || ''`
  - If `apiTarget` is set, it sets `proxy['/api'] = { target: apiTarget, changeOrigin: true }`
  - If proxy is set, it logs: **`[vite] API proxy: /api -> <your value>`**

So the “code that reads the dev proxy variable” is **only** in `vite.config.ts`; the app’s own code does not read `VITE_DEV_PROXY_TARGET`.

### 2. Verify at dev server start

1. In the project root, create or edit **`.env.local`** and set either:
   - `VITE_DEV_PROXY_TARGET=https://fsbw.vercel.app`  
   or  
   - `VITE_API_BASE=https://fsbw.vercel.app`
2. Restart the dev server: stop it (Ctrl+C) and run **`npm run dev`** again.
3. In the **terminal** where the dev server runs, look for:
   - **`[vite] API proxy: /api -> https://fsbw.vercel.app`**  
   If you see that, Vite has read the variable and the proxy is active.

If you **don’t** see that line, then either:

- The variable isn’t set in `.env.local` (or is misspelled), or  
- The env file wasn’t loaded (e.g. wrong folder; restart after changing `.env.local`).

### 3. Verify in the browser (Network tab)

1. With the dev server running and the proxy log above present, open the app at `http://localhost:3001` (or your dev URL).
2. Do something that calls the API (e.g. sign in, Sync my account, or open a page that fetches profile).
3. Open DevTools → **Network**.
4. Find a request to **`/api/...`** (e.g. `/api/profile` or `/api/admin/sync-profile`).
   - **Request URL** should be something like `http://localhost:3001/api/profile` (same origin).
   - Status should be **200** (or the real API status), and the response should be your backend’s JSON.

So: the **browser** only sees requests to your dev origin; it does **not** need to “read” the proxy variable. The dev server (Vite) reads it and forwards those requests to the target.

### 3b. Mobile-friendly ways to check (site is mobile-only)

If you're testing on a phone or only care about mobile layout, you don't have DevTools on the device. Use one of these:

**Option A — Desktop browser in mobile mode (simplest)**  
1. On your computer, open Chrome (or Edge/Firefox).  
2. Go to `http://localhost:3001` (with the dev server running).  
3. Open DevTools (F12 or right-click → Inspect).  
4. Turn on **device toolbar** (Ctrl+Shift+M or the phone/tablet icon in DevTools) and pick a phone size.  
5. Use the app (sign in, Sync, etc.) and watch the **Network** tab. You'll see the same `/api/...` requests and status codes as on a real device. The proxy and API behavior are identical; only the viewport is mobile-sized.

**Option B — Remote debugging (real phone)**  
- **Android:** Connect the phone by USB, enable USB debugging. On desktop Chrome go to `chrome://inspect`, find your device and the page, click **Inspect**. Use the Network tab in that DevTools window.  
- **iPhone/iPad:** Connect by USB. On the device: Settings → Safari → Advanced → Web Inspector ON. On Mac Safari: Develop → [your device] → [your page]. Use the Network tab in the Web Inspector.

**Option C — Trust the terminal + behavior**  
If you already see **`[vite] API proxy: /api -> https://...`** when starting the dev server, the proxy is active. On the phone, open `http://<your-computer-ip>:3001` (same Wi-Fi), sign in or tap Sync. If profile loads or sync succeeds, the API is being reached; the proxy is working without needing DevTools on the device.

### 4. Optional: show API base in the app (debug)

To confirm what the **frontend** is using as the base URL (for fetch):

- In `src/utils/api.ts`, `API_BASE` is set from `import.meta.env.VITE_API_BASE ?? ''`.
- You can temporarily log it in the app, e.g. in a component that runs on load:
  - `console.log('API_BASE', import.meta.env.VITE_API_BASE ?? '(empty = relative + proxy)');`
- If you see **(empty)** and the proxy is enabled, then the app is correctly using relative URLs and the proxy.

---

## Summary

- **Dev proxy variable** is read **only in `vite.config.ts`** when the dev server starts. The app code does **not** read `VITE_DEV_PROXY_TARGET`.
- **Check that it’s read:** set `VITE_DEV_PROXY_TARGET` (or `VITE_API_BASE`) in `.env.local`, restart `npm run dev`, and look for **`[vite] API proxy: /api -> ...`** in the terminal.
- **Check that it works:** use the Network tab and confirm `/api/*` requests go to localhost and return your backend’s responses.
