-- THE STUDIO social publishing — OAuth tokens (encrypted server-side), posts, audit log.
-- Run in Supabase SQL Editor. API uses service role only; RLS enabled with no policies.

-- ---------------------------------------------------------------------------
-- studio_social_accounts — one row per platform; tokens never exposed to clients
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.studio_social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'pinterest', 'x')),
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN (
    'connected', 'needs_reauthorization', 'token_expiring', 'posting_disabled', 'error', 'disconnected', 'unavailable'
  )),
  account_label text,
  account_external_id text,
  encrypted_tokens text,
  token_expires_at timestamptz,
  scopes text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  posting_disabled boolean NOT NULL DEFAULT false,
  last_error text,
  connected_by_email text,
  connected_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_social_accounts_status ON public.studio_social_accounts (status);

ALTER TABLE public.studio_social_accounts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.studio_social_accounts IS 'Brand social OAuth connections for THE STUDIO Distribution Network. Tokens encrypted; API-only access.';

-- ---------------------------------------------------------------------------
-- studio_social_posts — per-platform post drafts; admin approval required
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.studio_social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_pack_id text NOT NULL,
  content_pack_ref text,
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'pinterest', 'x')),
  caption text NOT NULL DEFAULT '',
  hashtags text NOT NULL DEFAULT '',
  thumbnail_url text,
  cover_url text,
  scheduled_at timestamptz,
  approval_status text NOT NULL DEFAULT 'draft' CHECK (approval_status IN (
    'draft', 'pending_approval', 'approved', 'rejected'
  )),
  publish_status text NOT NULL DEFAULT 'draft' CHECK (publish_status IN (
    'draft', 'scheduled', 'publishing', 'published', 'failed'
  )),
  approved_by_email text,
  approved_at timestamptz,
  created_by_email text,
  publish_result jsonb,
  error_details text,
  platform_post_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_social_posts_pack ON public.studio_social_posts (distribution_pack_id, platform);
CREATE INDEX IF NOT EXISTS studio_social_posts_status ON public.studio_social_posts (approval_status, publish_status);

ALTER TABLE public.studio_social_posts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.studio_social_posts IS 'Social post drafts/schedules for approved content packs. Publish requires approval_status=approved.';

-- ---------------------------------------------------------------------------
-- studio_social_publish_log — immutable action log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.studio_social_publish_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.studio_social_posts (id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN (
    'save_draft', 'submit_approval', 'approve', 'reject', 'schedule', 'publish', 'connect', 'disconnect', 'reauthorize', 'error'
  )),
  actor_email text,
  platform text,
  caption text,
  asset_used text,
  scheduled_time timestamptz,
  publish_result jsonb,
  error_details text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_social_publish_log_created ON public.studio_social_publish_log (created_at DESC);
CREATE INDEX IF NOT EXISTS studio_social_publish_log_post ON public.studio_social_publish_log (post_id);

ALTER TABLE public.studio_social_publish_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.studio_social_publish_log IS 'Audit trail for social publishing — who approved, when, platform, caption, asset, result.';
