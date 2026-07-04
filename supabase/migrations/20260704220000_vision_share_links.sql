-- Vision Share™ — server-persisted presentation links (cross-device stakeholder demos).

CREATE TABLE IF NOT EXISTS public.vision_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  mode_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'frontal-slayer',
  label text NOT NULL,
  password text,
  expires_at timestamptz,
  autoplay boolean NOT NULL DEFAULT true,
  presenter_mode boolean NOT NULL DEFAULT false,
  self_guided boolean NOT NULL DEFAULT true,
  views integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vision_share_links_slug_key UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS vision_share_links_workspace_idx
  ON public.vision_share_links (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS vision_share_links_active_slug_idx
  ON public.vision_share_links (slug)
  WHERE active = true;

CREATE TABLE IF NOT EXISTS public.vision_share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid NOT NULL REFERENCES public.vision_share_links(id) ON DELETE CASCADE,
  mode_id text NOT NULL,
  event text NOT NULL,
  stop_id text,
  watch_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vision_share_events_share_idx
  ON public.vision_share_events (share_id, created_at DESC);

ALTER TABLE public.vision_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_share_events ENABLE ROW LEVEL SECURITY;

-- No direct client access — API uses service role.

COMMENT ON TABLE public.vision_share_links IS 'Vision Share™ links — resolved via /api/vision/share';
COMMENT ON TABLE public.vision_share_events IS 'Vision Share analytics events';

-- Default stakeholder demo links (idempotent)
INSERT INTO public.vision_share_links (slug, mode_id, workspace_id, label, autoplay, presenter_mode, self_guided)
VALUES
  ('creative', 'frontal-slayer-creative-partner', 'frontal-slayer', 'Creative Partner Vision', true, false, true),
  ('investor', 'frontal-slayer-investor', 'frontal-slayer', 'Investor Vision', true, true, false),
  ('agency', 'frontal-slayer-agency-presentation', 'frontal-slayer', 'Agency Presentation', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  mode_id = EXCLUDED.mode_id,
  label = EXCLUDED.label,
  active = true,
  updated_at = now();
