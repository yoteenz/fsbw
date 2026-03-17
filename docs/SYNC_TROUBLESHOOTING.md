# Sync my account — troubleshooting

When **"Sync my account"** fails with a server or network error, use this to track it down.

## 1. See the real error in the UI

After the latest changes, the app shows the **server’s error message** when the sync API returns 4xx/5xx (e.g. missing env, invalid password). Try Sync again and read the message under the button.

## 2. Check Vercel env for the sync API

The sync API needs these in the **Vercel project** (Settings → Environment Variables):

- **SUPABASE_URL** – Supabase project URL  
- **SUPABASE_ANON_KEY** – anon/public key  
- **SUPABASE_SERVICE_ROLE_KEY** – recommended so the API can read any user’s profile (otherwise it falls back to anon and RLS may block)  
- **ADMIN_EMAILS** – comma‑separated list of emails allowed to use Sync (e.g. `ayoteenz@yahoo.com,your@email.com`). If empty, the code falls back to a default list.

If **SUPABASE_SERVICE_ROLE_KEY** is missing and your `profiles` table has RLS, the API may return 503 or empty profile. Add the key in Supabase (Settings → API → service_role) and in Vercel.

## 3. Check Vercel function logs

1. Vercel Dashboard → your project → **Logs** (or **Deployments** → latest → **Functions**).  
2. Trigger **Sync my account** again.  
3. Open the log for **api/admin/sync-profile** and look for:
   - `Admin sync-profile error: ...` or `getSupabaseAdmin: ...` or `fromProfileRow: ...`
   - `ERR_MODULE_NOT_FOUND` → the deployment may not include `api/_lib` correctly; ensure the latest code (with `../_lib/supabase.js` and `../_lib/profileMapping.js` imports) is deployed.

## 4. Vite preview vs deploy

- **Vite preview** (`npm run preview`) serves the built app; it does **not** run the API. So Sync from preview must call your **deployed** API. Set **VITE_API_BASE** in the build to your Vercel URL (e.g. `https://fsbw.vercel.app`) so the client hits the right host, or test Sync on the deployed site instead.  
- **Deployed site** (e.g. `https://fsbw.vercel.app`): Sync calls the same origin API; no proxy needed. If Sync still fails there, the problem is on the server (env, Supabase, or logs above).

## 5. Summary

1. Read the error message shown in the app after Sync fails.  
2. Ensure SUPABASE_URL, SUPABASE_ANON_KEY, and (recommended) SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAILS are set on Vercel.  
3. Reproduce Sync and check **api/admin/sync-profile** in Vercel function logs for the exact error.  
4. When using preview, point the app at the deployed API with VITE_API_BASE.
