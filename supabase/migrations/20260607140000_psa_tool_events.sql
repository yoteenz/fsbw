-- PSA tool usage events for admin transcript + analytics review.

CREATE TABLE IF NOT EXISTS public.psa_tool_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.psa_threads (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  user_message_snippet text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS psa_tool_events_created
  ON public.psa_tool_events (created_at DESC);

CREATE INDEX IF NOT EXISTS psa_tool_events_thread
  ON public.psa_tool_events (thread_id, created_at ASC);

CREATE INDEX IF NOT EXISTS psa_tool_events_tool
  ON public.psa_tool_events (tool_name, created_at DESC);

COMMENT ON TABLE public.psa_tool_events IS 'Per-tool-call audit for PSA admin review; written by /api/psa/chat via service role.';
