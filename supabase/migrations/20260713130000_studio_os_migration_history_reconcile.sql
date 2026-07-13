-- Studio OS migration history reconcile + stale governed job cleanup
-- Idempotent hygiene: backfill schema_migrations for objects already live in production.
-- Does not recreate tables. Expires stuck async work orders so idempotency can issue fresh jobs.

-- ---------------------------------------------------------------------------
-- 1) Backfill migration history (repo canonical versions, skip if name exists)
-- ---------------------------------------------------------------------------
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
SELECT incoming.version, incoming.name, ARRAY[]::text[]
FROM (
  VALUES
    ('20260705120000', 'studio_os_org_memberships'),
    ('20260706170000', 'studio_os_workspace_state'),
    ('20260710230000', 'expert_capture_sessions'),
    ('20260710234500', 'expert_capture_knowledge_mirror'),
    ('20260711000000', 'studio_institute_invites'),
    ('20260712180000', 'studio_governed_generation_jobs')
) AS incoming(version, name)
WHERE NOT EXISTS (
  SELECT 1
  FROM supabase_migrations.schema_migrations existing
  WHERE existing.version = incoming.version OR existing.name = incoming.name
);

-- ---------------------------------------------------------------------------
-- 2) Expire stale governed generation jobs (break idempotency retry loops)
-- ---------------------------------------------------------------------------
UPDATE public.studio_governed_generation_jobs
SET
  status = 'expired',
  progress_phase = 'failed',
  progress_pct = 0,
  error_category = 'job-expired',
  error_message = 'Generation work order expired during migration hygiene reconcile — submit again to retry',
  failed_at = NOW(),
  provider_state = 'EXPIRED',
  updated_at = NOW()
WHERE status IN ('submit', 'accepted', 'queued', 'generating', 'normalizing', 'storing', 'registering')
  AND (
    (expires_at IS NOT NULL AND expires_at < NOW())
    OR updated_at < NOW() - INTERVAL '15 minutes'
  );

COMMENT ON TABLE public.studio_governed_generation_jobs IS
  'Async governed generation work orders (ASYNC_GOVERNED_GENERATION_V1). Stale active jobs auto-expire after TTL/inactivity.';
