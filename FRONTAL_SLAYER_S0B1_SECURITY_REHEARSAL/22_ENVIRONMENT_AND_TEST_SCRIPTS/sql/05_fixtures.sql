-- Synthetic fixtures only (no production data). Fixed UUIDs for repeatable tests.
-- A = customer A, B = customer B, ADM = an admin identity (admin rights live in the API allow-list, not the DB).
INSERT INTO auth.users (id, email) VALUES
 ('00000000-0000-4000-8000-00000000000a', 'customer.a@staging.test'),
 ('00000000-0000-4000-8000-00000000000b', 'customer.b@staging.test'),
 ('00000000-0000-4000-8000-0000000000ad', 'admin@staging.test');
-- Service-side records for customer B (as the webhook/admin APIs would write them)
SET request.jwt.claims = '{"role":"service_role"}';
INSERT INTO public.orders (user_id, email, active_orders) VALUES ('00000000-0000-4000-8000-00000000000b', 'customer.b@staging.test', '[{"id":"order-pi-test-b","status":"PAID"}]');
INSERT INTO public.orders (user_id, email, active_orders) VALUES ('00000000-0000-4000-8000-00000000000a', 'customer.a@staging.test', '[{"id":"order-pi-test-a","status":"PAID"}]');
INSERT INTO public.meetings (user_id, client_email, meeting_date, metadata) VALUES ('00000000-0000-4000-8000-00000000000a', 'customer.a@staging.test', current_date + 7, '{"bookingFinalDueUsd": 500}');
INSERT INTO public.notifications (user_id, items) VALUES ('00000000-0000-4000-8000-00000000000a', '[]'), ('00000000-0000-4000-8000-00000000000b', '[]');
INSERT INTO public.reviews (user_id, email, rating, status) VALUES ('00000000-0000-4000-8000-00000000000a', 'customer.a@staging.test', 5, 'published');
INSERT INTO public.psa_episode_entitlements (id, user_id, episode_id, content_id, expires_at) VALUES ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-00000000000b', 'ep1', 'c1', now() + interval '30 days');
INSERT INTO public.psa_watch_sessions (id, entitlement_id, user_id, episode_id, actual_watched_seconds, qualification_threshold_seconds) VALUES ('00000000-0000-4000-8000-0000000000f1', '00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-00000000000b', 'ep1', 100, 10);
RESET request.jwt.claims;
