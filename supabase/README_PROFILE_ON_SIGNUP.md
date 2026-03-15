# Show new sign-ups in admin before email confirmation

When **Confirm email** is enabled in Supabase, new users are created in `auth.users` but don’t get a session until they confirm. Your app only calls `patchProfile()` after sign-in, so the profile row was never created for unconfirmed users and they didn’t show in the admin client.

**Fix:** create a profile row as soon as the user is inserted into `auth.users`, using a database trigger. Then the admin client can list them even before they confirm.

## 1. Ensure `public.profiles` exists

Your backend likely already has a `profiles` table. If not, create one (adjust columns to match what your API expects):

```sql
-- Optional: only if you don't have public.profiles yet.
-- Your backend may use different column names; change as needed.
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  email text,
  first_name text,
  last_name text,
  phone_number text,
  birthday text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
```

## 2. Match the trigger to your table

Open **Supabase Dashboard → SQL Editor** and run the migration:

**`supabase/migrations/20250314000000_create_profile_on_signup.sql`**

If your admin client reads from a different table (e.g. `public.clients`), change `public.profiles` to that table name in the migration. If your table has different column names (e.g. `firstName` instead of `first_name`), edit the `INSERT` in `handle_new_user()` to use your columns. The trigger reads from `NEW.email` and `NEW.raw_user_meta_data` (the same `options.data` you pass in `signUp`).

## 3. Run the migration

- **Supabase Dashboard:** paste the contents of the migration file into SQL Editor and run it.
- **Supabase CLI:** from the project root run `supabase db push` (or apply the migration with your usual workflow).

After this:

- New sign-ups get a row in `public.profiles` immediately.
- They appear in the admin client list even before confirming email.
- You can leave **Confirm email** on and add your marketing/confirmation email template later.

## 4. When they confirm and sign in

When the user confirms and signs in, your app will call `patchProfile()` and `syncAllFromApi()` as usual, so the same profile row is updated with the full data (referral code, membership, etc.). The trigger only creates the initial row so they’re visible in admin right away.
