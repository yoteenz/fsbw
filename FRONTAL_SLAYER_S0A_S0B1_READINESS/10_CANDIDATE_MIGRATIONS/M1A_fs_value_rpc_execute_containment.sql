-- =====================================================================================
-- REVIEW ONLY — NOT EXECUTED.  Do NOT place this file in supabase/migrations/ and do NOT
-- run it against any database until: (1) founder decision A1a recorded (rehearsal),
-- (2) staging rehearsal passed (doc 14), (3) founder decision A1b recorded (production).
-- =====================================================================================
-- Candidate:  S0B1-M1A  FRONTAL SLAYER value/quota RPC EXECUTE containment
-- Risk:       R-01 (CRITICAL, live re-verified 2026-10-25, evidence/L_live_readonly_2026-10-25.md §1)
-- Owner:      FRONTAL SLAYER (all functions defined in fsbw supabase/migrations)
-- SITE00:     none of these functions is called by SITE00 (evidence X2 §2; grep this sprint)
-- Callers:    all server-side, all through a service-role client that FAILS CLOSED
--             (getSupabaseAdminServiceRole / inline serviceSupabase → 503 without key):
--               api/_lib/hairstyleAnalysisUsage.ts:64,140,161
--               api/_lib/psaUsageLimit.ts:70 · api/_lib/psaEntitlements.ts:307
--               api/_lib/loungeEngagement.ts:133,161,320,355,423
-- Version:    assign at apply time: > 20261011140245 (highest remote) and unused in fsbw AND SITE00.
-- Why all three grantees: live ACLs show direct anon/authenticated grants on every function
--             and a PUBLIC (=X) grant on several; revoking from one leaves the others.
-- Idempotent: REVOKE/GRANT are idempotent; safe to re-run.
-- =====================================================================================

BEGIN;

-- Precondition guard: abort if a signature drifted (prevents a silent no-op on the wrong overload).
DO $$
DECLARE
  sig text;
  sigs text[] := ARRAY[
    'public.hairstyle_analysis_grant_purchase_credits(uuid,text,integer[])',
    'public.hairstyle_analysis_try_consume(uuid,text,integer)',
    'public.hairstyle_analysis_refund_consume(uuid,text,text,integer)',
    'public.hairstyle_analysis_refund_consume(uuid,text)',
    'public.psa_try_consume_message(uuid,text,text,integer,integer)',
    'public.psa_consume_watch_if_qualified(uuid,uuid)',
    'public.lounge_toggle_helpful(text,text,uuid)',
    'public.lounge_record_qualified_view(text,text,integer,integer,uuid,text)',
    'public.lounge_engagement_ensure_summary(text,text)',
    'public.lounge_engagement_recount_summary(text,text)'
  ];
BEGIN
  FOREACH sig IN ARRAY sigs LOOP
    IF to_regprocedure(sig) IS NULL THEN
      RAISE EXCEPTION 'S0B1-M1A precondition failed: % not found', sig;
    END IF;
  END LOOP;
END $$;

-- Hair analysis: paid-credit minting, consumption, refund (both refund overloads)
REVOKE EXECUTE ON FUNCTION public.hairstyle_analysis_grant_purchase_credits(uuid, text, integer[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hairstyle_analysis_try_consume(uuid, text, integer)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text, text, integer)      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text)                     FROM PUBLIC, anon, authenticated;

-- PSA quotas and episode entitlements
REVOKE EXECUTE ON FUNCTION public.psa_try_consume_message(uuid, text, text, integer, integer)       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.psa_consume_watch_if_qualified(uuid, uuid)                        FROM PUBLIC, anon, authenticated;

-- Lounge engagement (caller-supplied p_user_id; browser already goes through /api/lounge-tv/*)
REVOKE EXECUTE ON FUNCTION public.lounge_toggle_helpful(text, text, uuid)                           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lounge_record_qualified_view(text, text, integer, integer, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lounge_engagement_ensure_summary(text, text)                      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lounge_engagement_recount_summary(text, text)                     FROM PUBLIC, anon, authenticated;

-- Least privilege: only the server role keeps EXECUTE.
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_grant_purchase_credits(uuid, text, integer[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_try_consume(uuid, text, integer)               TO service_role;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text, text, integer)      TO service_role;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text)                     TO service_role;
GRANT EXECUTE ON FUNCTION public.psa_try_consume_message(uuid, text, text, integer, integer)       TO service_role;
GRANT EXECUTE ON FUNCTION public.psa_consume_watch_if_qualified(uuid, uuid)                        TO service_role;
GRANT EXECUTE ON FUNCTION public.lounge_toggle_helpful(text, text, uuid)                           TO service_role;
GRANT EXECUTE ON FUNCTION public.lounge_record_qualified_view(text, text, integer, integer, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.lounge_engagement_ensure_summary(text, text)                      TO service_role;
GRANT EXECUTE ON FUNCTION public.lounge_engagement_recount_summary(text, text)                     TO service_role;

-- Postcondition guard inside the transaction: fail (and roll back) if any grantee still has EXECUTE.
DO $$
DECLARE
  bad text;
BEGIN
  SELECT string_agg(p.oid::regprocedure::text, ', ') INTO bad
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('hairstyle_analysis_grant_purchase_credits','hairstyle_analysis_try_consume',
                       'hairstyle_analysis_refund_consume','psa_try_consume_message','psa_consume_watch_if_qualified',
                       'lounge_toggle_helpful','lounge_record_qualified_view','lounge_engagement_ensure_summary',
                       'lounge_engagement_recount_summary')
     AND (has_function_privilege('anon', p.oid, 'EXECUTE')
          OR has_function_privilege('authenticated', p.oid, 'EXECUTE')
          OR NOT has_function_privilege('service_role', p.oid, 'EXECUTE'));
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'S0B1-M1A postcondition failed for: %', bad;
  END IF;
END $$;

COMMIT;
