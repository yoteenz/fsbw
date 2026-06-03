-- Priority messages from Concierge + PSA (replaces localStorage-only inbox over time).
CREATE TABLE IF NOT EXISTS public.priority_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  client_email text NOT NULL,
  client_name text,
  message text NOT NULL,
  is_order_related boolean NOT NULL DEFAULT false,
  is_urgent boolean NOT NULL DEFAULT false,
  related_order_id text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  source text NOT NULL DEFAULT 'concierge' CHECK (source IN ('concierge', 'psa')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS priority_messages_status_created
  ON public.priority_messages (status, created_at DESC);

CREATE INDEX IF NOT EXISTS priority_messages_user
  ON public.priority_messages (user_id, created_at DESC);

ALTER TABLE public.priority_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY priority_messages_insert_own ON public.priority_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY priority_messages_select_own ON public.priority_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.priority_messages IS 'Member priority messages; PSA + Concierge POST via user JWT. Admin reads via service role API.';
