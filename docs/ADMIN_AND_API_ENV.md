# Admin routes and API environment setup

This doc explains how to configure your **backend API** (e.g. on Vercel) so admin routes work: auth admin and RLS bypass rely on the Supabase **service role** key. It also describes the current admin model and placeholders.

---

## 1. Set the service role key in your API env (e.g. Vercel)

Admin routes (e.g. `/api/admin/clients`, `/api/admin/users`, `/api/admin/deleted-accounts`) need to call Supabase with **elevated privileges** so they can:

- List all users (auth admin).
- Read/write data bypassing Row Level Security (RLS) for admin-only operations.

That is done with the **service role key**, not the anon key. The service role key must **only** be used on the server (your API). Never expose it in the frontend or in client-side env (e.g. never put it in `VITE_*`).

### Get the key in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **Project Settings** (gear in the left sidebar).
3. Open **API**.
4. Under **Project API keys**, find **service_role** (labeled “secret”).
5. Copy the key (or reveal and copy). Treat it like a password.

### Add it in Vercel (API project)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and open the **project that runs your API** (the one that serves `VITE_API_BASE` or your backend).
2. Go to **Settings → Environment Variables**.
3. Add a new variable:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** the service_role key you copied from Supabase.
   - **Environments:** select Production (and Preview if you use preview deployments).
4. Save. If the key is sensitive, you can mark it as **Sensitive** so it’s hidden in the UI.
5. **Redeploy** the project so new builds use the variable (env vars are applied at build/runtime; changing them doesn’t update already-deployed runs).

### If your API runs elsewhere

Use the same **name** `SUPABASE_SERVICE_ROLE_KEY` and the same **value** in that environment (e.g. `.env` on a server, or your host’s env config). Your backend code should read this env var and use it to create a Supabase client for admin operations (and only use that client on the server, never send the key to the browser).

---

## 2. How the backend should use it

- Create a second Supabase client used **only** for admin routes, initialized with `SUPABASE_SERVICE_ROLE_KEY` instead of the anon key.
- Use that client for:
  - Listing users (e.g. `auth.admin.listUsers()` or your equivalent).
  - Querying tables that are protected by RLS when you need to act as “admin” (e.g. listing all profiles for `/api/admin/clients`).
- Keep using the **anon** key (and the user’s JWT) for non-admin routes; the service role key is only for admin endpoints.

---

## 3. Current admin model and placeholders

- **Admin check:** Admin access is currently an **email allowlist**. The backend (or frontend) considers a user an admin if their email is in the allowed list (e.g. env or config). Roles/permissions (e.g. a proper `roles` table or Supabase custom claims) are **future work**.
- **Deleted accounts:** The `/api/admin/deleted-accounts` endpoint and the “deleted accounts” UI are **placeholder** for now. A real implementation would involve a table or audit log of deleted users and possibly soft-deletes; that is left as **future work**. The doc here only ensures the API env (e.g. service role key) is set so that when you implement those features, auth admin and RLS bypass already work.

---

## 4. Quick checklist

| Item | Where | Notes |
|------|--------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | API env (e.g. Vercel) | Service role key from Supabase → Project Settings → API. Server-only. |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Frontend env (e.g. Vercel) | Used by the browser; anon key only. |
| `VITE_API_BASE` | Frontend env | Base URL of your API so the app can call `/api/profile`, `/api/admin/clients`, etc. |
| Redeploy after changing env | Vercel (or your host) | So new builds/runs pick up the new variables. |
