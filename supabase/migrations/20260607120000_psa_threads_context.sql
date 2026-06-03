-- PSA thread archive + summary; member context snapshot for session continuity.

ALTER TABLE public.psa_threads
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS thread_summary text;

CREATE INDEX IF NOT EXISTS psa_threads_user_active
  ON public.psa_threads (user_id, updated_at DESC)
  WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS public.psa_member_context (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.psa_member_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY psa_member_context_select_own ON public.psa_member_context
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON COLUMN public.psa_threads.archived_at IS 'When set, thread is hidden from default HISTORY list.';
COMMENT ON COLUMN public.psa_threads.thread_summary IS 'Rolling summary for long threads; injected into PSA instructions.';
COMMENT ON TABLE public.psa_member_context IS 'Latest server snapshot (cart, active orders, tier) refreshed on thread load.';
