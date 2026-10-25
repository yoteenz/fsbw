-- =====================================================================================
-- REVIEW ONLY. READ-ONLY pre-checks (SELECT only). Safe on staging and production.
-- Run immediately before applying M1A/M2/M3; attach output to the change record.
-- =====================================================================================

-- P1. Target project sanity (compare with the expected project; never paste keys)
SELECT current_database() AS db, current_setting('server_version') AS pg_version, now() AS checked_at;

-- P2. Highest applied migration version (new version must be greater and unused in BOTH repos)
SELECT max(version) AS highest_applied FROM supabase_migrations.schema_migrations;

-- P3. Current EXECUTE state of every candidate function (expect anon/auth TRUE before M1A)
SELECT p.oid::regprocedure AS fn, p.prosecdef AS security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon_exec,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_exec,
       has_function_privilege('service_role', p.oid, 'EXECUTE')  AS service_exec,
       array_to_string(p.proacl, ' ') AS acl
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public' AND p.prosecdef
 ORDER BY 1;

-- P4. Write policies targeted by M2 (expect 8 rows before M2)
SELECT tablename, policyname, cmd FROM pg_policies
 WHERE schemaname = 'public' AND tablename IN ('orders','meetings','notifications','reviews')
   AND cmd IN ('INSERT','UPDATE','DELETE','ALL')
 ORDER BY 1, 3;

-- P5. Pack-size check in the live grant body (expect 'IN (1, 3, 6)' before M3)
SELECT substring(prosrc FROM '(?i)IN \([0-9, ]+\)') AS pack_check
  FROM pg_proc WHERE proname = 'hairstyle_analysis_grant_purchase_credits';

-- P6. Profile triggers that affect SITE00/JURNL signups and profile sync (must be unchanged by S0B-1)
SELECT c.relname, t.tgname, p.proname, p.prosecdef
  FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_proc p ON p.oid = t.tgfoid
 WHERE NOT t.tgisinternal AND c.relname IN ('users', 'profiles');

-- P7. Row counts that bound remediation (aggregates only, no customer content)
SELECT (SELECT count(*) FROM public.hairstyle_analysis_purchase_grants) AS analysis_grants,
       (SELECT count(*) FROM public.orders)   AS order_rows,
       (SELECT count(*) FROM public.meetings) AS meeting_rows;
