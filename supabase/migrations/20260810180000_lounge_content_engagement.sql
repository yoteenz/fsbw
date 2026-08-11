-- Lounge TV content engagement: qualified views, helpful reactions, discussion comments.
-- Idempotent DDL; safe to re-run.

-- ---------------------------------------------------------------------------
-- Engagement config (per-content toggles)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lounge_engagement_config (
  content_type text NOT NULL,
  content_id text NOT NULL,
  views_enabled boolean NOT NULL DEFAULT true,
  helpful_enabled boolean NOT NULL DEFAULT true,
  comments_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (content_type, content_id)
);

-- ---------------------------------------------------------------------------
-- Aggregate summaries (maintained by triggers — clients cannot write directly)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lounge_engagement_summaries (
  content_type text NOT NULL,
  content_id text NOT NULL,
  qualified_view_count integer NOT NULL DEFAULT 0 CHECK (qualified_view_count >= 0),
  helpful_count integer NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  comment_count integer NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (content_type, content_id)
);

CREATE INDEX IF NOT EXISTS lounge_engagement_summaries_helpful_idx
  ON public.lounge_engagement_summaries (helpful_count DESC);

CREATE INDEX IF NOT EXISTS lounge_engagement_summaries_views_idx
  ON public.lounge_engagement_summaries (qualified_view_count DESC);

CREATE INDEX IF NOT EXISTS lounge_engagement_summaries_comments_idx
  ON public.lounge_engagement_summaries (comment_count DESC);

-- ---------------------------------------------------------------------------
-- Qualified view events (engagement analytics — separate from PSA access watches)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lounge_engagement_qualified_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id text NOT NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  viewer_key text,
  watch_seconds integer NOT NULL DEFAULT 0 CHECK (watch_seconds >= 0),
  qualified_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lounge_engagement_qv_identity_chk CHECK (user_id IS NOT NULL OR viewer_key IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS lounge_engagement_qv_content_idx
  ON public.lounge_engagement_qualified_views (content_type, content_id, qualified_at DESC);

CREATE INDEX IF NOT EXISTS lounge_engagement_qv_user_dedup_idx
  ON public.lounge_engagement_qualified_views (content_type, content_id, user_id, qualified_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS lounge_engagement_qv_viewer_dedup_idx
  ON public.lounge_engagement_qualified_views (content_type, content_id, viewer_key, qualified_at DESC)
  WHERE viewer_key IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Helpful reactions (one row per user per content)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lounge_engagement_helpful (
  content_type text NOT NULL,
  content_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (content_type, content_id, user_id)
);

CREATE INDEX IF NOT EXISTS lounge_engagement_helpful_content_idx
  ON public.lounge_engagement_helpful (content_type, content_id);

-- ---------------------------------------------------------------------------
-- Discussion comments (top-level + one level of replies)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lounge_engagement_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.lounge_engagement_comments (id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) >= 1 AND char_length(body) <= 2000),
  status text NOT NULL DEFAULT 'visible'
    CHECK (status IN ('visible', 'hidden', 'removed', 'pending')),
  is_official boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  pinned_at timestamptz,
  pinned_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  report_count integer NOT NULL DEFAULT 0 CHECK (report_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS lounge_engagement_comments_content_idx
  ON public.lounge_engagement_comments (content_type, content_id, created_at DESC);

CREATE INDEX IF NOT EXISTS lounge_engagement_comments_parent_idx
  ON public.lounge_engagement_comments (parent_id)
  WHERE parent_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Summary maintenance helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lounge_engagement_ensure_summary(
  p_content_type text,
  p_content_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.lounge_engagement_summaries (content_type, content_id)
  VALUES (p_content_type, p_content_id)
  ON CONFLICT (content_type, content_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.lounge_engagement_recount_summary(
  p_content_type text,
  p_content_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.lounge_engagement_ensure_summary(p_content_type, p_content_id);

  UPDATE public.lounge_engagement_summaries s
  SET
    qualified_view_count = (
      SELECT count(*)::integer
      FROM public.lounge_engagement_qualified_views v
      WHERE v.content_type = p_content_type AND v.content_id = p_content_id
    ),
    helpful_count = (
      SELECT count(*)::integer
      FROM public.lounge_engagement_helpful h
      WHERE h.content_type = p_content_type AND h.content_id = p_content_id
    ),
    comment_count = (
      SELECT count(*)::integer
      FROM public.lounge_engagement_comments c
      WHERE c.content_type = p_content_type
        AND c.content_id = p_content_id
        AND c.status = 'visible'
    ),
    updated_at = now()
  WHERE s.content_type = p_content_type AND s.content_id = p_content_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Record qualified view (dedup: 7-day window per viewer)
-- Threshold validated server-side from watch_seconds + duration_seconds.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lounge_record_qualified_view(
  p_content_type text,
  p_content_id text,
  p_watch_seconds integer,
  p_duration_seconds integer,
  p_user_id uuid DEFAULT NULL,
  p_viewer_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_threshold integer;
  v_recent_exists boolean;
  v_inserted boolean := false;
BEGIN
  IF p_content_type IS NULL OR length(trim(p_content_type)) = 0
     OR p_content_id IS NULL OR length(trim(p_content_id)) = 0 THEN
    RETURN jsonb_build_object('recorded', false, 'reason', 'invalid_content');
  END IF;

  IF p_user_id IS NULL AND (p_viewer_key IS NULL OR length(trim(p_viewer_key)) = 0) THEN
    RETURN jsonb_build_object('recorded', false, 'reason', 'missing_viewer');
  END IF;

  IF coalesce(p_duration_seconds, 0) <= 0 THEN
    v_threshold := 30;
  ELSIF p_duration_seconds < 60 THEN
    v_threshold := least(15, greatest(1, (p_duration_seconds * 0.5)::integer));
  ELSE
    v_threshold := least(30, greatest(1, (p_duration_seconds * 0.2)::integer));
  END IF;

  IF coalesce(p_watch_seconds, 0) < v_threshold THEN
    RETURN jsonb_build_object('recorded', false, 'reason', 'below_threshold', 'threshold', v_threshold);
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.lounge_engagement_qualified_views v
      WHERE v.content_type = p_content_type
        AND v.content_id = p_content_id
        AND v.user_id = p_user_id
        AND v.qualified_at > now() - interval '7 days'
    ) INTO v_recent_exists;
  ELSE
    SELECT EXISTS (
      SELECT 1
      FROM public.lounge_engagement_qualified_views v
      WHERE v.content_type = p_content_type
        AND v.content_id = p_content_id
        AND v.viewer_key = p_viewer_key
        AND v.qualified_at > now() - interval '7 days'
    ) INTO v_recent_exists;
  END IF;

  IF v_recent_exists THEN
    RETURN jsonb_build_object('recorded', false, 'reason', 'dedup_window');
  END IF;

  INSERT INTO public.lounge_engagement_qualified_views (
    content_type, content_id, user_id, viewer_key, watch_seconds
  ) VALUES (
    p_content_type, p_content_id, p_user_id, p_viewer_key, p_watch_seconds
  );

  v_inserted := true;
  PERFORM public.lounge_engagement_recount_summary(p_content_type, p_content_id);

  RETURN jsonb_build_object('recorded', true, 'threshold', v_threshold);
END;
$$;

-- ---------------------------------------------------------------------------
-- Toggle helpful reaction
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lounge_toggle_helpful(
  p_content_type text,
  p_content_id text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active boolean;
  v_count integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;

  PERFORM public.lounge_engagement_ensure_summary(p_content_type, p_content_id);

  IF EXISTS (
    SELECT 1 FROM public.lounge_engagement_helpful h
    WHERE h.content_type = p_content_type
      AND h.content_id = p_content_id
      AND h.user_id = p_user_id
  ) THEN
    DELETE FROM public.lounge_engagement_helpful h
    WHERE h.content_type = p_content_type
      AND h.content_id = p_content_id
      AND h.user_id = p_user_id;
    v_active := false;
  ELSE
    INSERT INTO public.lounge_engagement_helpful (content_type, content_id, user_id)
    VALUES (p_content_type, p_content_id, p_user_id);
    v_active := true;
  END IF;

  PERFORM public.lounge_engagement_recount_summary(p_content_type, p_content_id);

  SELECT helpful_count INTO v_count
  FROM public.lounge_engagement_summaries
  WHERE content_type = p_content_type AND content_id = p_content_id;

  RETURN jsonb_build_object('helpful', v_active, 'helpfulCount', coalesce(v_count, 0));
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.lounge_engagement_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_engagement_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_engagement_qualified_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_engagement_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_engagement_comments ENABLE ROW LEVEL SECURITY;

-- Public read summaries
DROP POLICY IF EXISTS lounge_engagement_summaries_select_all ON public.lounge_engagement_summaries;
CREATE POLICY lounge_engagement_summaries_select_all ON public.lounge_engagement_summaries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS lounge_engagement_config_select_all ON public.lounge_engagement_config;
CREATE POLICY lounge_engagement_config_select_all ON public.lounge_engagement_config
  FOR SELECT USING (true);

-- Qualified views: no direct client insert (RPC only)
DROP POLICY IF EXISTS lounge_engagement_qv_select_none ON public.lounge_engagement_qualified_views;
CREATE POLICY lounge_engagement_qv_select_none ON public.lounge_engagement_qualified_views
  FOR SELECT USING (false);

-- Helpful: users read all; write only own row
DROP POLICY IF EXISTS lounge_engagement_helpful_select_all ON public.lounge_engagement_helpful;
CREATE POLICY lounge_engagement_helpful_select_all ON public.lounge_engagement_helpful
  FOR SELECT USING (true);

DROP POLICY IF EXISTS lounge_engagement_helpful_insert_own ON public.lounge_engagement_helpful;
CREATE POLICY lounge_engagement_helpful_insert_own ON public.lounge_engagement_helpful
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS lounge_engagement_helpful_delete_own ON public.lounge_engagement_helpful;
CREATE POLICY lounge_engagement_helpful_delete_own ON public.lounge_engagement_helpful
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: public read visible; authors manage own visible comments
DROP POLICY IF EXISTS lounge_engagement_comments_select_visible ON public.lounge_engagement_comments;
CREATE POLICY lounge_engagement_comments_select_visible ON public.lounge_engagement_comments
  FOR SELECT USING (status = 'visible' OR auth.uid() = user_id);

DROP POLICY IF EXISTS lounge_engagement_comments_insert_own ON public.lounge_engagement_comments;
CREATE POLICY lounge_engagement_comments_insert_own ON public.lounge_engagement_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'visible' AND is_official = false AND is_pinned = false);

DROP POLICY IF EXISTS lounge_engagement_comments_update_own ON public.lounge_engagement_comments;
CREATE POLICY lounge_engagement_comments_update_own ON public.lounge_engagement_comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_official = false AND is_pinned = false);

-- Revoke direct writes on summaries from authenticated/anon
REVOKE INSERT, UPDATE, DELETE ON public.lounge_engagement_summaries FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.lounge_engagement_qualified_views FROM anon, authenticated;

GRANT SELECT ON public.lounge_engagement_summaries TO anon, authenticated;
GRANT SELECT ON public.lounge_engagement_config TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.lounge_engagement_helpful TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lounge_engagement_comments TO authenticated;

GRANT EXECUTE ON FUNCTION public.lounge_record_qualified_view(text, text, integer, integer, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lounge_toggle_helpful(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lounge_engagement_recount_summary(text, text) TO service_role;
