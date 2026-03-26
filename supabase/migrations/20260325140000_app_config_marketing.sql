-- Key/value JSON for site-wide admin config (e.g. special offer / marketing card).
-- Read/write via Vercel API using service role (RLS enabled, no user policies = client cannot access directly).

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_config_updated_at_idx ON public.app_config (updated_at DESC);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- No GRANT to anon/authenticated for direct table access; API uses service role.
