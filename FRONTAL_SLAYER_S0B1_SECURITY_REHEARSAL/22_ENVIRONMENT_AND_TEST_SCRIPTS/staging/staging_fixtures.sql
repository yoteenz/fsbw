-- OPERATOR-ONLY, STAGING ONLY. Synthetic fixtures. Create the auth users first through the staging
-- project's Auth admin API (Dashboard → Authentication → Add user), using these synthetic addresses:
--   customer.a@staging.test · customer.b@staging.test · member.12m@staging.test · admin@staging.test
-- Then run this file as the staging project's postgres role. No production data is used.
DO $$
DECLARE a uuid; b uuid;
BEGIN
  IF current_database() IS NULL THEN RAISE EXCEPTION 'no database'; END IF;
  SELECT id INTO a FROM auth.users WHERE email = 'customer.a@staging.test';
  SELECT id INTO b FROM auth.users WHERE email = 'customer.b@staging.test';
  IF a IS NULL OR b IS NULL THEN RAISE EXCEPTION 'create the synthetic auth users first'; END IF;
  INSERT INTO public.orders (user_id, email, active_orders) VALUES (a, 'customer.a@staging.test', '[{"id":"order-pi-staging-a","status":"PAID"}]') ON CONFLICT DO NOTHING;
  INSERT INTO public.orders (user_id, email, active_orders) VALUES (b, 'customer.b@staging.test', '[{"id":"order-pi-staging-b","status":"PAID"}]') ON CONFLICT DO NOTHING;
  INSERT INTO public.meetings (user_id, client_email, meeting_date) VALUES (a, 'customer.a@staging.test', current_date + 7);
  INSERT INTO public.notifications (user_id, items) VALUES (a, '[]'), (b, '[]') ON CONFLICT (user_id) DO NOTHING;
END $$;
