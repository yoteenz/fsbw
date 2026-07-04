-- Tutorial OS progress — per-user tour state for logged-in customers.
-- Guests continue to use localStorage; signed-in users sync via /api/tutorial/progress.

CREATE TABLE IF NOT EXISTS public.tutorial_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  last_step_id text,
  last_step_index integer NOT NULL DEFAULT -1,
  completed_step_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  completion_percentage integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  skipped_at timestamptz,
  dismissed_at timestamptz,
  earned_achievement_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tour_id)
);

ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own tutorial progress"
  ON public.tutorial_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own tutorial progress"
  ON public.tutorial_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own tutorial progress"
  ON public.tutorial_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tutorial_progress_user_updated_idx
  ON public.tutorial_progress (user_id, updated_at DESC);
