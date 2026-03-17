# How to verify /api/admin/sync-profile exists and is deployed

Three checks: (1) the route file exists in the repo, (2) the app is pointing at the right API base, (3) the endpoint is live and responding.

---

## 1. Confirm the route exists in the repo

The handler lives at:

**`api/admin/sync-profile.ts`**

- In your project: open that file. If it’s there and exports a default function, the route is defined.
- On Vercel: the same file must be in the deployed branch (e.g. `main`). If you deploy from a branch that doesn’t have this file, the route won’t exist in production.

---

## 2. Check VITE_API_BASE (where the app calls the API)

The frontend builds the sync URL as:

`${VITE_API_BASE}/api/admin/sync-profile`

So the app must know the **root URL** of your deployed app (where the API is served).

**Where it’s set**

- **Local:** `.env.local` (or `.env`):
  ```env
  VITE_API_BASE=https://your-app.vercel.app
  ```
  Use your real Vercel URL (e.g. `https://fsbw.vercel.app`). No trailing slash. Restart the dev server after changing.

- **Production (Vercel):** In the same project that serves the frontend, the API is on the **same origin**. So either:
  - **Option A:** Leave `VITE_API_BASE` **empty** in Vercel’s env for the frontend build. Then the app uses the current origin (e.g. `https://fsbw.vercel.app`), and requests go to `https://fsbw.vercel.app/api/admin/sync-profile`.
  - **Option B:** Set `VITE_API_BASE=https://your-app.vercel.app` in Vercel so the built app explicitly points at that host.

**How to see what the app is using**

- Build the app and look at the compiled output, or
- In the browser: when you click “Sync my account,” open DevTools → **Network**, find the request to `sync-profile`. The **Request URL** is the exact URL the app is calling. That tells you both that the app is using an API base and what it is.

If the Request URL is wrong (e.g. wrong host or path), fix `VITE_API_BASE` and redeploy the frontend.

---

## 3. Check that the endpoint is deployed and reachable

You’re checking: “Does `https://<my-vercel-host>/api/admin/sync-profile` exist and respond?”

**A. OPTIONS request (no auth, safe)**

In a terminal:

```bash
curl -i -X OPTIONS "https://YOUR_VERCEL_URL/api/admin/sync-profile"
```

Example:

```bash
curl -i -X OPTIONS "https://fsbw.vercel.app/api/admin/sync-profile"
```

- **200 or 204** with CORS headers → route is deployed and reachable.
- **404** → route not found. Either the file wasn’t in the deployed branch, or the project isn’t set up to run `api/` as serverless functions (see Vercel docs for “Serverless Functions” and the `api` directory).
- **Connection refused / DNS / timeout** → wrong URL or app not deployed at that host.

**B. POST without body (should get 400, not 404)**

```bash
curl -i -X POST "https://YOUR_VERCEL_URL/api/admin/sync-profile" -H "Content-Type: application/json"
```

- **400** with a body like “email and password required” → route exists and is running; it’s correctly rejecting an empty body.
- **404** → route not deployed or wrong URL.
- **401** → route exists and is rejecting (e.g. missing/invalid credentials). That’s expected when you don’t send email/password.

So: **404 = “does not exist” or “not deployed”**. **400/401 = “exists and is deployed.”**

**C. From the browser**

1. Open your deployed app (e.g. `https://fsbw.vercel.app`).
2. Sign in as an admin (Supabase email in admin list).
3. Go to **Account → Settings** and click **Sync my account**.
4. Open DevTools → **Network**.
5. Find the request to **`sync-profile`** (or `admin/sync-profile`).
   - **Status 200** → Sync worked.
   - **Status 401** → “Invalid Supabase password” (credentials wrong).
   - **Status 403** → “Not allowed” (email not in `ADMIN_EMAILS`).
   - **Status 404** or **Failed** (e.g. net::ERR_NAME_NOT_RESOLVED) → Endpoint doesn’t exist at that URL or `VITE_API_BASE` is wrong; use steps 2 and 3A/3B above.

---

## Quick checklist

| Check | How |
|-------|-----|
| Route file in repo | Open `api/admin/sync-profile.ts` and confirm it’s in the branch you deploy. |
| API base set | In `.env.local` / Vercel: `VITE_API_BASE` = your Vercel app URL (or empty so same origin is used). |
| Endpoint deployed | `curl -X OPTIONS "https://YOUR_VERCEL_URL/api/admin/sync-profile"` → 200/204, not 404. |
| Endpoint reachable from app | Sync from Settings and check Network tab: request to `.../api/admin/sync-profile` is not 404. |

If **404** after deployment: ensure `api/admin/sync-profile.ts` is in the deployed branch and that the Vercel project is configured to use the `api` directory as serverless functions (default for Vercel + this structure).
