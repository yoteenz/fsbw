-- =====================================================================================
-- REVIEW ONLY — NOT EXECUTED.  ROLLBACK for S0B1-M1A.
-- WARNING: running this RE-OPENS R-01 (anyone with the public anon key can mint
-- hair-analysis credits, reset quotas and toggle "helpful" as any user).
-- Use only if M1A breaks a production feature AND a forward fix (doc 14 §4) is not possible
-- within the incident window. Prefer: fix the caller to use the service role, keep M1A.
-- Restores the exact ACLs captured live on 2026-10-25 (evidence/L_live_readonly_2026-10-25.md §1).
-- =====================================================================================
BEGIN;
-- Functions whose live ACL had anon + authenticated (no PUBLIC):
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_grant_purchase_credits(uuid, text, integer[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_try_consume(uuid, text, integer)               TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text)                     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.psa_try_consume_message(uuid, text, text, integer, integer)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.psa_consume_watch_if_qualified(uuid, uuid)                        TO anon, authenticated;
-- Functions whose live ACL also had PUBLIC (=X):
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text, text, integer)      TO PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lounge_toggle_helpful(text, text, uuid)                           TO PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lounge_record_qualified_view(text, text, integer, integer, uuid, text) TO PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lounge_engagement_ensure_summary(text, text)                      TO PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lounge_engagement_recount_summary(text, text)                     TO PUBLIC, anon, authenticated;
COMMIT;
-- Limitation: grants are restored exactly, but any value minted or consumed between M1A and
-- this rollback is not affected either way (M1A changes privileges only, not data).
