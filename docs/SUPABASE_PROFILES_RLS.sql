-- Run in Supabase → SQL Editor if GET/PATCH /api/profile returns 500 with Postgres/RLS errors
-- (e.g. "permission denied for table profiles", "new row violates row-level security policy").
-- Adjust schema name if you use a non-public schema.

-- Ensure RLS is on (safe to run if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if you need to replace them (ignore errors if names differ)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Authenticated users can read their own row (auth.uid() = id)
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users can insert their own row (first sign-in / upsert create)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own row
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: allow delete own row if your app deletes profiles here
-- CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
