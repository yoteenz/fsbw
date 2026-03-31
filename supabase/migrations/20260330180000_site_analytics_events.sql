-- Site-wide marketing/analytics events (social clicks, etc.). Written only via Vercel API using service role.
-- Anonymous visitors are keyed by `visitor_id` (first-party UUID in localStorage).

CREATE TABLE IF NOT EXISTS public.site_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  visitor_id text NOT NULL,
  user_email text,
  event_type text NOT NULL DEFAULT 'social_click',
  platform text,
  source text,
  path text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS site_analytics_events_created_at_desc_idx
  ON public.site_analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS site_analytics_events_event_type_idx
  ON public.site_analytics_events (event_type);

CREATE INDEX IF NOT EXISTS site_analytics_events_visitor_id_idx
  ON public.site_analytics_events (visitor_id);

ALTER TABLE public.site_analytics_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.site_analytics_events IS 'Anonymous + optional signed-in events for Admin Brand Analytics; inserts via POST /api/analytics/event (service role only).';
