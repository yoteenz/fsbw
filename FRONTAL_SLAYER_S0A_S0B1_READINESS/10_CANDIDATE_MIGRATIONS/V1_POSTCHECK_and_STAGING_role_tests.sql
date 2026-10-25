-- =====================================================================================
-- REVIEW ONLY. Part A is read-only (production or staging). Part B CALLS FUNCTIONS and must
-- run on STAGING ONLY, inside a transaction that is rolled back. Never run Part B on production.
-- =====================================================================================

-- ---------- PART A — read-only postconditions ----------
-- A1. No FRONTAL SLAYER value/quota function is executable by anon or authenticated (expect 0 rows)
SELECT p.oid::regprocedure AS still_exposed
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('hairstyle_analysis_grant_purchase_credits','hairstyle_analysis_try_consume',
                     'hairstyle_analysis_refund_consume','psa_try_consume_message','psa_consume_watch_if_qualified',
                     'lounge_toggle_helpful','lounge_record_qualified_view','lounge_engagement_ensure_summary',
                     'lounge_engagement_recount_summary')
   AND (has_function_privilege('anon', p.oid, 'EXECUTE') OR has_function_privilege('authenticated', p.oid, 'EXECUTE'));

-- A2. service_role keeps EXECUTE (expect 0 rows)
SELECT p.oid::regprocedure AS service_role_lost
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('hairstyle_analysis_grant_purchase_credits','hairstyle_analysis_try_consume',
                     'hairstyle_analysis_refund_consume','psa_try_consume_message','psa_consume_watch_if_qualified',
                     'lounge_toggle_helpful','lounge_record_qualified_view','lounge_engagement_ensure_summary',
                     'lounge_engagement_recount_summary')
   AND NOT has_function_privilege('service_role', p.oid, 'EXECUTE');

-- A3. No customer write policy on the four tables (expect 0 rows); SELECT policies still present (expect ≥4)
SELECT tablename, policyname, cmd FROM pg_policies
 WHERE schemaname = 'public' AND tablename IN ('orders','meetings','notifications','reviews')
   AND cmd IN ('INSERT','UPDATE','DELETE','ALL');
SELECT count(*) AS select_policies FROM pg_policies
 WHERE schemaname = 'public' AND tablename IN ('orders','meetings','notifications','reviews') AND cmd = 'SELECT';

-- A4. Grant body now accepts 4 (expect 'IN (1, 3, 4, 6)')
SELECT substring(prosrc FROM '(?i)IN \([0-9, ]+\)') AS pack_check
  FROM pg_proc WHERE proname = 'hairstyle_analysis_grant_purchase_credits';

-- A5. Profile triggers unchanged (compare with V0 P6 output)
SELECT c.relname, t.tgname, p.proname FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_proc p ON p.oid = t.tgfoid
 WHERE NOT t.tgisinternal AND c.relname IN ('users', 'profiles');

-- ---------- PART B — STAGING ONLY, synthetic ids, always ROLLBACK ----------
-- Each statement is expected to FAIL with "permission denied for function ...".
-- BEGIN;
--   SET LOCAL ROLE anon;
--   SELECT public.hairstyle_analysis_grant_purchase_credits('00000000-0000-0000-0000-000000000001'::uuid, 'pi_staging_probe', ARRAY[4]);
-- ROLLBACK;
-- BEGIN;
--   SET LOCAL ROLE authenticated;
--   SELECT public.lounge_toggle_helpful('episode', 'staging-probe', '00000000-0000-0000-0000-000000000001'::uuid);
-- ROLLBACK;
-- Expected to SUCCEED as service_role on staging (synthetic user from 13_STAGING fixtures):
-- BEGIN;
--   SET LOCAL ROLE service_role;
--   SELECT public.hairstyle_analysis_grant_purchase_credits('<staging fixture user uuid>'::uuid, 'pi_staging_fixture_4pack', ARRAY[4]);
--   -- expect {"ok": true, "granted": [4], ...}
--   SELECT public.hairstyle_analysis_grant_purchase_credits('<staging fixture user uuid>'::uuid, 'pi_staging_fixture_mixed', ARRAY[1, 5]);
--   -- expect {"ok": false, "reason": "invalid_counts"} and NO row in hairstyle_analysis_purchase_grants for that PI
-- ROLLBACK;
-- Policy probe (STAGING, as a synthetic authenticated customer through PostgREST, not SQL):
--   PATCH /rest/v1/orders?user_id=eq.<fixture uid>  → expect 0 rows affected / RLS denial
--   POST  /rest/v1/meetings                          → expect RLS denial
