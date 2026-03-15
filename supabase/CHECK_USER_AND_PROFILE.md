# Step-by-step: Check if a sign-up is in Auth and in the admin table

Use this to see whether the problem is “confirm email” (user exists in Auth but no profile row yet).

---

## Step 1: Open your Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Sign in and open the project your app uses (the one with `VITE_SUPABASE_URL` for this site).

---

## Step 2: Check if the user exists in Auth (`auth.users`)

**Option A – Table Editor (no SQL)**

1. In the left sidebar, click **Table Editor**.
2. At the top you may see a schema dropdown; switch to **`auth`** (not `public`).
3. Open the table **`users`** (full name: `auth.users`).
4. In the table, find the row where **email** is the “frontal slayer” address (e.g. `frontalslayer@...` or whatever you used).
   - If you have many users, use the table search/filter if available, or scroll.
5. Note:
   - **Found:** The sign-up reached Supabase; the user exists in Auth. Go to Step 3.
   - **Not found:** The sign-up never reached Supabase (e.g. Supabase not configured or wrong project). The fix is env/config, not the trigger.

**Option B – SQL Editor**

1. In the left sidebar, click **SQL Editor**.
2. Click **New query**.
3. Paste this (replace the email with the exact one you used):

```sql
SELECT id, email, created_at, email_confirmed_at, raw_user_meta_data
FROM auth.users
WHERE email ILIKE '%frontal%' OR email ILIKE '%slayer%';
```

4. Click **Run** (or Ctrl+Enter).
5. Look at the result:
   - **One or more rows:** User exists in Auth. Note the **id** (UUID) and that **email_confirmed_at** may be empty (unconfirmed). Go to Step 3.
   - **No rows:** User is not in Auth; sign-up didn’t hit this Supabase project.

---

## Step 3: Check if that user has a row in the admin table (e.g. `public.profiles`)

Your admin client list almost certainly reads from a table in the **public** schema (often `profiles` or `clients`). You’re checking: “Is there a row for this user in that table?”

**Option A – Table Editor**

1. In **Table Editor**, switch the schema to **`public`**.
2. Open the table your backend uses for “clients” or “profiles” (often **`profiles`**).
3. Find the row whose **id** matches the **id** (UUID) you saw in `auth.users` for the frontal slayer email.
   - If the table uses a different user key (e.g. `user_id`), look for that instead.
4. Note:
   - **Found:** User exists in both Auth and the admin table; they should show in the admin client. If they don’t, the issue is the API or how the admin page filters data.
   - **Not found:** User is in Auth but not in this table → **this is the “missing profile for unconfirmed users” case.** Fix: run the trigger migration so new sign-ups get a profile row on sign-up (see `README_PROFILE_ON_SIGNUP.md`).

**Option B – SQL Editor (once you know the table name)**

1. In **SQL Editor**, **New query**.
2. Replace `public.profiles` with your actual table name if different (e.g. `public.clients`). Paste:

```sql
-- Use the same email you used in Step 2
WITH auth_user AS (
  SELECT id, email FROM auth.users
  WHERE email ILIKE '%frontal%' OR email ILIKE '%slayer%'
)
SELECT
  a.id AS auth_id,
  a.email,
  p.id AS profile_id
FROM auth_user a
LEFT JOIN public.profiles p ON p.id = a.id;
```

3. Click **Run**.
4. Read the result:
   - **One row, `profile_id` is not null:** User is in Auth and in `public.profiles`; they should appear in admin (if not, the bug is elsewhere).
   - **One row, `profile_id` is null:** User is in Auth but has **no profile row** → confirm-email flow: profile is only created after first sign-in. Apply the trigger so the profile is created on sign-up (see `README_PROFILE_ON_SIGNUP.md`).

---

## Quick summary

| auth.users | public.profiles (or your table) | Meaning |
|------------|--------------------------------|--------|
| User not found | - | Sign-up didn’t hit Supabase; check env (e.g. `VITE_SUPABASE_URL` / project). |
| User found | No row | **Confirm-email case:** user exists but no profile yet. Use the trigger so new sign-ups get a profile row and show in admin. |
| User found | Row found | User and profile exist; if they still don’t show in admin, check API or admin filters. |

---

## If you’re not sure which table the admin client uses

- Check your backend code for `/api/admin/clients` (or the route that lists clients). It will query a Supabase table (or a view). That table name is what you use in Step 3 instead of `public.profiles`.
- If the backend is in another repo, search for “profiles”, “clients”, or “admin” and the Supabase client/query that returns the list.
