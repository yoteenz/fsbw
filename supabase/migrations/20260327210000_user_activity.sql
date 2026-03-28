-- Client activity for admin Activity tab: POST /api/activity inserts here; GET /api/admin/activity reads via service role.
-- Without this table (and RLS allowing authenticated users to insert their own rows), trackActivity() fails on the server and the admin UI stays empty.

CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_activity_user_id_created_at_desc_idx
  ON public.user_activity (user_id, created_at DESC);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_activity_insert_own" ON public.user_activity;
DROP POLICY IF EXISTS "user_activity_select_own" ON public.user_activity;

-- Signed-in users may insert only their own activity rows (matches api/activity.ts using user JWT).
CREATE POLICY "user_activity_insert_own"
  ON public.user_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Optional: allow users to read their own rows (not required for admin, which uses service role).
CREATE POLICY "user_activity_select_own"
  ON public.user_activity
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_activity IS 'Append-only client events for admin client details Activity tab';
