-- =====================================================================================
-- REVIEW ONLY — NOT EXECUTED.  Gate: A1a (rehearsal) → staging pass → A1b (production).
-- =====================================================================================
-- Candidate:  S0B1-M2  drop legacy customer WRITE policies (keep every SELECT policy)
-- Risk:       R-04 (HIGH, live re-verified 2026-10-25) — a signed-in customer can write their own
--             orders JSON (fabricate a DELIVERED order), meetings (incl. metadata later charged by
--             booking autopay, R-09), notifications, and reviews directly through PostgREST.
-- Owner:      FRONTAL SLAYER tables (001_initial_schema.sql, 002_admin_gaps.sql).
-- SITE00:     uses none of orders / meetings / notifications / reviews (X2 §1a; grep this sprint: 0 refs).
-- FS consumers verified this sprint:
--   * Browser (src/): 0 direct table references to these four tables.
--   * api/: every WRITE goes through getSupabaseAdmin()/service role (webhook order append,
--     admin orders/reviews/notifications, consult-quotes, meeting-client-alert, booking APIs,
--     client/submissions reviews insert). User-JWT clients only SELECT
--     (api/orders.ts, api/notifications.ts, psaMemberContext.ts, psaTools.ts).
--   * Precondition U-01: if a deployment lacks the service-role key, those writes already fail
--     under RLS today (anon has no auth.uid()); this migration does not change that.
-- Not touched: profiles policies (SITE00 api/profile.ts relies on them), cart/wishlist (legitimate
--             customer-owned data), user_activity (SITE00 inserts), SELECT policies everywhere.
-- Idempotent: DROP POLICY IF EXISTS.
-- =====================================================================================
BEGIN;

DROP POLICY IF EXISTS "Users can insert own orders"        ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders"        ON public.orders;

DROP POLICY IF EXISTS "Users can insert own meetings"      ON public.meetings;
DROP POLICY IF EXISTS "Users can update own meetings"      ON public.meetings;
DROP POLICY IF EXISTS "Users can delete own meetings"      ON public.meetings;

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can insert own reviews"       ON public.reviews;

-- Repo/live alignment only (live already has RLS on psa_tool_events; no-op there).
ALTER TABLE public.psa_tool_events ENABLE ROW LEVEL SECURITY;

-- Postcondition: no INSERT/UPDATE/DELETE/ALL policy remains on the four tables.
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename IN ('orders','meetings','notifications','reviews')
     AND cmd IN ('INSERT','UPDATE','DELETE','ALL');
  IF n > 0 THEN
    RAISE EXCEPTION 'S0B1-M2 postcondition failed: % write policies remain', n;
  END IF;
END $$;

COMMIT;
