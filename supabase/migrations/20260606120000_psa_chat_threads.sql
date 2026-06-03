-- PSA chat threads + messages (cross-device history; server writes via service role).

CREATE TABLE IF NOT EXISTS public.psa_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text,
  last_openai_response_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS psa_threads_user_updated
  ON public.psa_threads (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.psa_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.psa_threads (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  openai_response_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS psa_messages_thread_created
  ON public.psa_messages (thread_id, created_at ASC);

ALTER TABLE public.psa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psa_messages ENABLE ROW LEVEL SECURITY;

-- Members may read own threads (optional direct client reads; API uses service role for writes).
CREATE POLICY psa_threads_select_own ON public.psa_threads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY psa_messages_select_own ON public.psa_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.psa_threads t
       WHERE t.id = psa_messages.thread_id
         AND t.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.psa_threads IS 'PSA chat sessions per member; one thread = one conversation.';
COMMENT ON TABLE public.psa_messages IS 'PSA chat messages; persisted after each user/assistant turn via /api/psa/chat.';
