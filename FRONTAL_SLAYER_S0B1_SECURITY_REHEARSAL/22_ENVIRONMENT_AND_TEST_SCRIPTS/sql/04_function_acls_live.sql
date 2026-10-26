-- Reproduce the LIVE function ACLs captured 2026-10-25 (evidence L §1). Supabase default privileges grant
-- EXECUTE to anon/authenticated/service_role; nine functions also kept the PUBLIC default.
DO $$ DECLARE f regprocedure; BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated, service_role', f);
  END LOOP; END $$;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid,text,text,integer) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.lounge_toggle_helpful(text,text,uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.lounge_record_qualified_view(text,text,integer,integer,uuid,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.lounge_engagement_ensure_summary(text,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.lounge_engagement_recount_summary(text,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.profiles_preserve_privileged_columns() TO PUBLIC;
