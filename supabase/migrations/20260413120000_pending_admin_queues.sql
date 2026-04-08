-- Server-backed queues for Admin Pending (cross-device). API uses service role; no direct client DB access.
-- Run in Supabase SQL Editor after prior migrations.

-- ---------------------------------------------------------------------------
-- Profile JSON mirrors for client UI sync (merged with localStorage on fetch)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_submitted_reviews jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS affiliate_submitted_content jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signed_order_forms jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.profiles.user_submitted_reviews IS 'Client-submitted shop reviews + supplemental state; synced from app via API.';
COMMENT ON COLUMN public.profiles.affiliate_submitted_content IS 'Per-order affiliate uploads map { orderId: { photos, videos, socials } }; server is source of truth when synced.';
COMMENT ON COLUMN public.profiles.signed_order_forms IS 'Approved/pending snapshots for client order authorization forms (synced to signedOrderFormsByEmail on client).';

-- ---------------------------------------------------------------------------
-- pending_order_forms: order authorization snapshots awaiting admin
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_order_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  admin_decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pending_order_forms_status_created ON public.pending_order_forms (status, created_at DESC);
CREATE INDEX IF NOT EXISTS pending_order_forms_user ON public.pending_order_forms (user_id);

ALTER TABLE public.pending_order_forms ENABLE ROW LEVEL SECURITY;
-- No policies: only service role / server APIs (bypass RLS).

COMMENT ON TABLE public.pending_order_forms IS 'Client-submitted order authorization forms; admin approves via API.';

-- ---------------------------------------------------------------------------
-- pending_affiliate_submissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_affiliate_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('photo', 'video', 'social')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  admin_decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pending_affiliate_status_created ON public.pending_affiliate_submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS pending_affiliate_user ON public.pending_affiliate_submissions (user_id);

ALTER TABLE public.pending_affiliate_submissions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.pending_affiliate_submissions IS 'Account affiliate tab submissions pending admin approval.';

-- ---------------------------------------------------------------------------
-- pending_review_supplemental (photos/videos after review published)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_review_supplemental (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  client_review_key text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  product text,
  subtitle text,
  review_excerpt text,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  videos jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pending_review_supp_status_created ON public.pending_review_supplemental (status, created_at DESC);
CREATE INDEX IF NOT EXISTS pending_review_supp_user ON public.pending_review_supplemental (user_id);

ALTER TABLE public.pending_review_supplemental ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.pending_review_supplemental IS 'Extra media for an existing client review row (client_review_key = local review id).';

-- Client-submitted review media URLs (pending row before publish)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS video_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
