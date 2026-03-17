# Add your Supabase email as admin and use Sync

This walkthrough gets you signed in with your **Supabase** email and password so that **Sync my account** works (profile, orders, cart, wishlist from the backend).

---

## 1. Add your Supabase email to the admin list

You need the same email in two places: **frontend** (app) and **backend** (Vercel API).

### 1a. Frontend (local development)

- Open (or create) **`.env.local`** in the project root.
- Add or edit:

  ```env
  VITE_ADMIN_EMAILS=ayoteenz@yahoo.com,YOUR_SUPABASE_EMAIL
  ```

  Replace `YOUR_SUPABASE_EMAIL` with the exact email you use in **Supabase → Authentication → Users** (e.g. `you@gmail.com`).  
  Use a comma between emails, no spaces (or trim spaces).

- Save the file.
- Restart the dev server so the new env is picked up (stop and run `npm run dev` or `vercel dev` again).

### 1b. Backend (Vercel production / preview)

- Go to [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**.
- Add or edit:
  - **Name:** `ADMIN_EMAILS`
  - **Value:** `ayoteenz@yahoo.com,YOUR_SUPABASE_EMAIL`  
    (same Supabase email as above, comma-separated, no spaces)
- Apply to **Production** (and **Preview** if you want Sync on preview deploys).
- Save.
- **Redeploy** the project (e.g. **Deployments** → **⋯** on latest → **Redeploy**) so the API uses the new value. Env changes only apply after a new deploy.

---

## 2. Sign in with your Supabase email and password

- Open the app (local or your Vercel URL).
- Go to **Sign in**.
- Enter:
  - **Email:** your **Supabase** email (the one you added to `VITE_ADMIN_EMAILS` and `ADMIN_EMAILS`).
  - **Password:** your **Supabase** password (the one you use in Supabase Dashboard or when signing up with email/password in Supabase Auth).
- Sign in (the app will use Supabase Auth with these credentials).

You are now signed in as an admin (your Supabase email is in the admin list). The app stores this email and, after a successful sign-in, the password so Sync can use it.

---

## 3. Use Sync my account

- Go to **Account** → **Settings**.
- Find the **SYNC MY ACCOUNT** button (visible because you’re an admin).
- Click **SYNC MY ACCOUNT**.

The app sends your **current** email (Supabase) and stored password (Supabase) to `POST /api/admin/sync-profile`. The backend signs in to Supabase with those credentials and returns profile, orders, cart, and wishlist; the frontend applies them locally.

- If you see **“Account synced. Profile, orders, cart, and wishlist updated.”** → Sync worked.
- If you see **“Invalid Supabase password”** → the stored password doesn’t match Supabase. Sign out and sign in again with the correct Supabase password, then try Sync again.
- If you see **“Sync request failed. Check your connection…”** → the request didn’t reach the API (e.g. wrong `VITE_API_BASE`, or `/api/admin/sync-profile` not deployed). Check Vercel deployment and env (e.g. `ADMIN_EMAILS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`).

---

## 4. Optional: keep using ayoteenz for some things

- You can keep `ayoteenz@yahoo.com` in `VITE_ADMIN_EMAILS` and `ADMIN_EMAILS` so that account still has admin access when you sign in with it.
- For **Sync** to work, you must be signed in with the **Supabase** email and password that exist in Supabase Auth. So for Sync, use the Supabase account; for other admin testing you can still use ayoteenz if that account is also in the list.

---

## Checklist

- [ ] `VITE_ADMIN_EMAILS` in `.env.local` includes your Supabase email (and restart dev server).
- [ ] `ADMIN_EMAILS` in Vercel includes your Supabase email.
- [ ] Project redeployed on Vercel after changing `ADMIN_EMAILS`.
- [ ] Signed in to the app with **Supabase email** and **Supabase password**.
- [ ] In **Account → Settings**, clicked **SYNC MY ACCOUNT** and saw success or a clear error message.
