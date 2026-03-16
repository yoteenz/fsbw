# Delete Account API – Inspect Backend & Confirm Deployment

This guide walks you through finding the delete-account API, confirming it’s deployed, and fixing the “FUNCTION_INVOCATION_FAILED” / “A SERVER ERROR HAS OCCURRED” error.

---

## 1. Where the API is defined (this repo)

- **Handler:** `api/delete-account.ts`
- **Route:** `DELETE /api/delete-account`
- **Behavior:** Reads the user from the `Authorization: Bearer <token>` header (Supabase JWT), then calls Supabase Auth Admin API to delete that user.

**Relevant files:**

| File | Purpose |
|------|--------|
| `api/delete-account.ts` | Main handler: auth check, then `admin.auth.admin.deleteUser(user.id)` |
| `api/_lib/auth.ts` | `getAuthUser(req)` – validates Bearer token with Supabase and returns user id/email |
| `api/_lib/supabase.ts` | `getSupabaseAdmin()` – Supabase client with **service role** (required for deleteUser) |

The frontend calls this API from `src/utils/api.ts` → `deleteAccount()` → `apiFetch('/api/delete-account', { method: 'DELETE' })`, with the Supabase session token sent as `Authorization: Bearer <access_token>`.

---

## 2. Why you see “FUNCTION_INVOCATION_FAILED”

On Vercel, that message usually means the serverless function **crashed** (unhandled exception, timeout, or missing config) instead of returning a normal HTTP response.

Common causes for this project:

1. **`SUPABASE_SERVICE_ROLE_KEY` not set in Vercel**  
   The delete-account handler needs the **service role** key to call `admin.auth.admin.deleteUser()`. If it’s missing, the code is written to return **503** with a JSON body, but if something fails earlier (e.g. env not loaded), the function can still crash and Vercel shows FUNCTION_INVOCATION_FAILED.

2. **Other Supabase env vars missing in production**  
   `SUPABASE_URL` and `SUPABASE_ANON_KEY` are used in `getAuthUser()`. If they’re missing or wrong, the handler can throw before sending a response.

3. **Unhandled exception**  
   Any thrown error that isn’t caught can cause a crash. The handler was updated to wrap logic in try/catch and to catch errors from `getAuthUser` and `getSupabaseAdmin()` so the function always returns a proper JSON response instead of crashing.

---

## 3. Confirm API deployment (Vercel)

1. **Confirm the project deploys the `api` folder**
   - Vercel deploys serverless functions from the **`api`** directory at the project root.
   - Your repo has `api/delete-account.ts`, so `DELETE https://<your-domain>/api/delete-account` should be the live endpoint.

2. **Confirm base URL and env**
   - Frontend uses **`VITE_API_BASE`** (e.g. in `.env.local`: `VITE_API_BASE=https://fsbw.vercel.app`).
   - So the app calls: `https://fsbw.vercel.app/api/delete-account` (or whatever your production URL is).
   - In Vercel: **Project → Settings → Environment Variables** and ensure:
     - **Production** (and Preview if you test there) have:
       - `SUPABASE_URL`
       - `SUPABASE_ANON_KEY`
       - **`SUPABASE_SERVICE_ROLE_KEY`** ← required for delete-account

3. **Redeploy after env changes**
   - Changing env vars in Vercel does **not** restart already-running functions. **Redeploy** the project (e.g. push a commit or “Redeploy” in Vercel) so the new env is picked up.

---

## 4. Inspect the backend (Vercel logs)

1. Open **Vercel Dashboard** → your project (e.g. **fsbw**).
2. Go to **Deployments** → open the latest **production** deployment.
3. Open the **“Functions”** tab (or “Logs”).
4. Trigger delete-account again from the app (Settings → Delete account → confirm).
5. In the logs, look for:
   - **`/api/delete-account`** (or `delete-account`) and the corresponding request.
   - **Error lines** such as:
     - `Delete account: SUPABASE_SERVICE_ROLE_KEY is not set` → add the key in Vercel and redeploy.
     - `Delete account getAuthUser error:` or `getSupabaseAdmin error:` → check SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY.
     - `Supabase deleteUser error:` → Supabase-side error (e.g. user already deleted, or project config).

If the function doesn’t appear in the logs at all, the request may be going to the wrong URL or the deployment may not include the `api` folder (e.g. wrong root directory in Vercel project settings).

---

## 5. Get the Supabase service role key

The delete-account API **must** use the **service role** key (not the anon key):

1. **Supabase Dashboard** → your project.
2. **Settings** → **API**.
3. Under **Project API keys**:
   - **anon public** → already used as `SUPABASE_ANON_KEY`.
   - **service_role** (secret) → copy this and set it in Vercel as **`SUPABASE_SERVICE_ROLE_KEY`**.

Do not expose the service role key in the frontend or in public repos. Only use it in server-side env (e.g. Vercel Environment Variables).

---

## 6. Checklist

- [ ] **Vercel → Project → Settings → Environment Variables**
  - `SUPABASE_URL` = your Supabase project URL  
  - `SUPABASE_ANON_KEY` = anon key  
  - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (required for delete-account)
- [ ] **Redeploy** after adding or changing any of these.
- [ ] **Frontend** `.env` or Vercel env has `VITE_API_BASE` pointing at the same domain (e.g. `https://fsbw.vercel.app`) so the app calls the correct `/api/delete-account`.
- [ ] **Vercel → Deployments → Functions/Logs**: Reproduce delete-account and confirm the function runs and check for the error messages above.

After the service role key is set and the function returns 200/401/503/500 with JSON (instead of crashing), the frontend will show the normal error message from the API (or success) instead of “A SERVER ERROR HAS OCCURRED / FUNCTION_INVOCATION_FAILED”.
