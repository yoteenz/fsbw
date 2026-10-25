-- =====================================================================================
-- REVIEW ONLY — NOT EXECUTED.  ROLLBACK for S0B1-M2.
-- WARNING: re-opens R-04 (customers can write their own orders/meetings/notifications/reviews).
-- Prefer a forward fix: route the broken write through the API with the service role.
-- Re-creates the policies exactly as captured live on 2026-10-25 (roles = public).
-- =====================================================================================
BEGIN;
CREATE POLICY "Users can insert own orders"        ON public.orders        FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders"        ON public.orders        FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meetings"      ON public.meetings      FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings"      ON public.meetings      FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings"      ON public.meetings      FOR DELETE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews"       ON public.reviews       FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
COMMIT;
-- psa_tool_events RLS is intentionally NOT disabled by this rollback (it was already enabled live).
