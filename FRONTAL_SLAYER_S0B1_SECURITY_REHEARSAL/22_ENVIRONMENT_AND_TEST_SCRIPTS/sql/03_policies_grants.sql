-- Live RLS policies and table grants for in-scope tables (read-only catalog capture, 2026-10-26).
CREATE POLICY "Users read own consult quotes" ON public.consult_quotes AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY lounge_engagement_comments_insert_own ON public.lounge_engagement_comments AS PERMISSIVE FOR INSERT TO public WITH CHECK (((auth.uid() = user_id) AND (status = 'visible'::text) AND (is_official = false) AND (is_pinned = false)));
CREATE POLICY lounge_engagement_comments_select_visible ON public.lounge_engagement_comments AS PERMISSIVE FOR SELECT TO public USING (((status = 'visible'::text) OR (auth.uid() = user_id)));
CREATE POLICY lounge_engagement_comments_update_own ON public.lounge_engagement_comments AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK (((auth.uid() = user_id) AND (is_official = false) AND (is_pinned = false)));
CREATE POLICY lounge_engagement_helpful_delete_own ON public.lounge_engagement_helpful AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY lounge_engagement_helpful_insert_own ON public.lounge_engagement_helpful AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY lounge_engagement_helpful_select_all ON public.lounge_engagement_helpful AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY lounge_engagement_qv_select_none ON public.lounge_engagement_qualified_views AS PERMISSIVE FOR SELECT TO public USING (false);
CREATE POLICY lounge_engagement_summaries_select_all ON public.lounge_engagement_summaries AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Users can delete own meetings" ON public.meetings AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own meetings" ON public.meetings AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can read own meetings" ON public.meetings AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own meetings" ON public.meetings AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users read own membership payments" ON public.membership_payments AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own notifications" ON public.notifications AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can read own notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own notifications" ON public.notifications AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own orders" ON public.orders AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can read own orders" ON public.orders AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own orders" ON public.orders AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY orders_select_own ON public.orders AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own profile" ON public.profiles AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can read own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = id));
CREATE POLICY profiles_insert_own ON public.profiles AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = id));
CREATE POLICY profiles_select_own ON public.profiles AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY profiles_update_own ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
CREATE POLICY psa_episode_entitlements_select_own ON public.psa_episode_entitlements AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY psa_watch_sessions_select_own ON public.psa_watch_sessions AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own reviews" ON public.reviews AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can read own reviews" ON public.reviews AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY slay_ticket_transactions_select_own ON public.slay_ticket_transactions AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
-- Table grants: anon + authenticated hold ALL (SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER)
-- on every in-scope table except lounge_engagement_qualified_views and lounge_engagement_summaries
-- (SELECT, REFERENCES, TRIGGER, TRUNCATE only). service_role/postgres implied full.
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    IF t IN ('lounge_engagement_qualified_views','lounge_engagement_summaries') THEN
      EXECUTE format('GRANT SELECT, REFERENCES, TRIGGER, TRUNCATE ON public.%I TO anon, authenticated', t);
    ELSE
      EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated', t);
    END IF;
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
  GRANT USAGE, SELECT ON SEQUENCE public.profile_debug_log_id_seq TO anon, authenticated, service_role;
END $$;
