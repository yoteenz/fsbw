-- =====================================================================================
-- REVIEW ONLY — NOT EXECUTED.  STATUS: BLOCKED until U-01 (service-role key confirmed in
-- every deployment that calls these functions) and the Studio OS owner's acknowledgement.
-- =====================================================================================
-- Candidate:  S0B1-M1B  server-only RPCs whose callers use getSupabaseAdmin() — which SILENTLY
--             FALLS BACK TO THE ANON KEY when SUPABASE_SERVICE_ROLE_KEY is missing
--             (api/_lib/supabase.ts:30). If the key were missing in production, this revoke
--             would break these features without an error at deploy time.
-- Functions / callers:
--   studio_world_atomic_reserve_budget  ← api/_lib/productionGovernance/atomic-reserve.ts:45 (Studio OS, fsbw)
--   trend_intelligence_public_forecast_payload ← api/_lib/trendIntelligence/service.ts:533,579
--   trend_intelligence_public_report_signals   ← api/_lib/trendIntelligence/service.ts:590
--   slay_forecast_public_broadcast_package     ← api/_lib/slayForecastBroadcast/packages.ts:228
-- The last three are "public by design" (they return published content only), so they are
-- lower risk; studio_world_atomic_reserve_budget lets an anonymous caller burn any
-- organisation's generation budget and is the priority of this file.
-- Browser callers: none (no .rpc( in src/ of either repo).
-- SITE00: does not call any of these (reaches Studio World over HTTP only; X2 §1a).
-- =====================================================================================
BEGIN;
REVOKE EXECUTE ON FUNCTION public.studio_world_atomic_reserve_budget(uuid, uuid, text, numeric, text, text, text, timestamptz, timestamptz, jsonb) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.studio_world_atomic_reserve_budget(uuid, uuid, text, numeric, text, text, text, timestamptz, timestamptz, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.trend_intelligence_public_forecast_payload(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trend_intelligence_public_report_signals(text)   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.slay_forecast_public_broadcast_package(text)     FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.trend_intelligence_public_forecast_payload(text) TO service_role;
GRANT  EXECUTE ON FUNCTION public.trend_intelligence_public_report_signals(text)   TO service_role;
GRANT  EXECUTE ON FUNCTION public.slay_forecast_public_broadcast_package(text)     TO service_role;
COMMIT;

-- ROLLBACK (re-opens the exposure; restores live 2026-10-25 ACLs):
-- GRANT EXECUTE ON FUNCTION public.studio_world_atomic_reserve_budget(uuid, uuid, text, numeric, text, text, text, timestamptz, timestamptz, jsonb) TO PUBLIC, anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.trend_intelligence_public_forecast_payload(text) TO PUBLIC, anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.trend_intelligence_public_report_signals(text)   TO PUBLIC, anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.slay_forecast_public_broadcast_package(text)     TO anon, authenticated;

-- EXCLUDED on purpose:
--   public.site00_allocate_access_credential_code()  — SITE00-owned (SITE00 migration
--   20260820000000_site00_access_credentials.sql). FRONTAL SLAYER must not alter it.
--   Hand-off note for the SITE00 owner is in 11_SHARED_SUPABASE_IMPACT_ANALYSIS.md §5.
