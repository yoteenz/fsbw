-- Live definitions captured read-only (pg_get_functiondef) on 2026-10-25/26. Bodies unchanged.
CREATE OR REPLACE FUNCTION public.hairstyle_analysis_try_consume(p_user_id uuid, p_month_key text, p_month_limit integer)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.hairstyle_analysis_usage; next_count integer; comparison_count integer; new_queue integer[]; paid_remaining integer;
BEGIN
  INSERT INTO public.hairstyle_analysis_usage (user_id, month_key, month_count, paid_credit_queue) VALUES (p_user_id, p_month_key, 0, '{}') ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO r FROM public.hairstyle_analysis_usage WHERE user_id = p_user_id FOR UPDATE;
  IF r.month_key IS DISTINCT FROM p_month_key THEN r.month_key := p_month_key; r.month_count := 0; END IF;
  IF p_month_limit >= 1 AND r.month_count < p_month_limit THEN
    next_count := r.month_count + 1;
    UPDATE public.hairstyle_analysis_usage SET month_key = p_month_key, month_count = next_count, updated_at = now() WHERE user_id = p_user_id;
    RETURN jsonb_build_object('ok', true, 'source', 'monthly', 'month_count', next_count, 'month_limit', p_month_limit, 'paid_remaining', COALESCE(array_length(r.paid_credit_queue, 1), 0));
  END IF;
  IF COALESCE(array_length(r.paid_credit_queue, 1), 0) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'purchase_required', 'month_count', r.month_count, 'month_limit', p_month_limit, 'paid_remaining', 0);
  END IF;
  comparison_count := r.paid_credit_queue[1];
  IF array_length(r.paid_credit_queue, 1) > 1 THEN new_queue := r.paid_credit_queue[2:array_length(r.paid_credit_queue, 1)]; ELSE new_queue := '{}'; END IF;
  paid_remaining := COALESCE(array_length(new_queue, 1), 0);
  UPDATE public.hairstyle_analysis_usage SET paid_credit_queue = new_queue, updated_at = now() WHERE user_id = p_user_id;
  RETURN jsonb_build_object('ok', true, 'source', 'paid', 'comparison_count', comparison_count, 'month_count', r.month_count, 'month_limit', p_month_limit, 'paid_remaining', paid_remaining);
END; $function$;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_refund_consume(p_user_id uuid, p_month_key text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.hairstyle_analysis_usage;
BEGIN
  SELECT * INTO r FROM public.hairstyle_analysis_usage WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND OR r.month_key IS DISTINCT FROM p_month_key OR r.month_count < 1 THEN RETURN; END IF;
  UPDATE public.hairstyle_analysis_usage SET month_count = r.month_count - 1, updated_at = now() WHERE user_id = p_user_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING; RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.lounge_engagement_ensure_summary(p_content_type text, p_content_id text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN INSERT INTO public.lounge_engagement_summaries (content_type, content_id) VALUES (p_content_type, p_content_id) ON CONFLICT (content_type, content_id) DO NOTHING; END; $function$;

CREATE OR REPLACE FUNCTION public.lounge_engagement_recount_summary(p_content_type text, p_content_id text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.lounge_engagement_ensure_summary(p_content_type, p_content_id);
  UPDATE public.lounge_engagement_summaries s SET
    qualified_view_count = (SELECT count(*)::integer FROM public.lounge_engagement_qualified_views v WHERE v.content_type = p_content_type AND v.content_id = p_content_id),
    helpful_count = (SELECT count(*)::integer FROM public.lounge_engagement_helpful h WHERE h.content_type = p_content_type AND h.content_id = p_content_id),
    comment_count = (SELECT count(*)::integer FROM public.lounge_engagement_comments c WHERE c.content_type = p_content_type AND c.content_id = p_content_id AND c.status = 'visible'),
    updated_at = now()
  WHERE s.content_type = p_content_type AND s.content_id = p_content_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.lounge_record_qualified_view(p_content_type text, p_content_id text, p_watch_seconds integer, p_duration_seconds integer, p_user_id uuid DEFAULT NULL::uuid, p_viewer_key text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_threshold integer; v_recent_exists boolean; v_inserted boolean := false;
BEGIN
  IF p_content_type IS NULL OR length(trim(p_content_type)) = 0 OR p_content_id IS NULL OR length(trim(p_content_id)) = 0 THEN RETURN jsonb_build_object('recorded', false, 'reason', 'invalid_content'); END IF;
  IF p_user_id IS NULL AND (p_viewer_key IS NULL OR length(trim(p_viewer_key)) = 0) THEN RETURN jsonb_build_object('recorded', false, 'reason', 'missing_viewer'); END IF;
  IF coalesce(p_duration_seconds, 0) <= 0 THEN v_threshold := 30;
  ELSIF p_duration_seconds < 60 THEN v_threshold := least(15, greatest(1, (p_duration_seconds * 0.5)::integer));
  ELSE v_threshold := least(30, greatest(1, (p_duration_seconds * 0.2)::integer)); END IF;
  IF coalesce(p_watch_seconds, 0) < v_threshold THEN RETURN jsonb_build_object('recorded', false, 'reason', 'below_threshold', 'threshold', v_threshold); END IF;
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM public.lounge_engagement_qualified_views v WHERE v.content_type = p_content_type AND v.content_id = p_content_id AND v.user_id = p_user_id AND v.qualified_at > now() - interval '7 days') INTO v_recent_exists;
  ELSE
    SELECT EXISTS (SELECT 1 FROM public.lounge_engagement_qualified_views v WHERE v.content_type = p_content_type AND v.content_id = p_content_id AND v.viewer_key = p_viewer_key AND v.qualified_at > now() - interval '7 days') INTO v_recent_exists;
  END IF;
  IF v_recent_exists THEN RETURN jsonb_build_object('recorded', false, 'reason', 'dedup_window'); END IF;
  INSERT INTO public.lounge_engagement_qualified_views (content_type, content_id, user_id, viewer_key, watch_seconds) VALUES (p_content_type, p_content_id, p_user_id, p_viewer_key, p_watch_seconds);
  v_inserted := true;
  PERFORM public.lounge_engagement_recount_summary(p_content_type, p_content_id);
  RETURN jsonb_build_object('recorded', true, 'threshold', v_threshold);
END; $function$;

CREATE OR REPLACE FUNCTION public.lounge_toggle_helpful(p_content_type text, p_content_id text, p_user_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_active boolean; v_count integer;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  PERFORM public.lounge_engagement_ensure_summary(p_content_type, p_content_id);
  IF EXISTS (SELECT 1 FROM public.lounge_engagement_helpful h WHERE h.content_type = p_content_type AND h.content_id = p_content_id AND h.user_id = p_user_id) THEN
    DELETE FROM public.lounge_engagement_helpful h WHERE h.content_type = p_content_type AND h.content_id = p_content_id AND h.user_id = p_user_id; v_active := false;
  ELSE
    INSERT INTO public.lounge_engagement_helpful (content_type, content_id, user_id) VALUES (p_content_type, p_content_id, p_user_id); v_active := true;
  END IF;
  PERFORM public.lounge_engagement_recount_summary(p_content_type, p_content_id);
  SELECT helpful_count INTO v_count FROM public.lounge_engagement_summaries WHERE content_type = p_content_type AND content_id = p_content_id;
  RETURN jsonb_build_object('helpful', v_active, 'helpfulCount', coalesce(v_count, 0));
END; $function$;

CREATE OR REPLACE FUNCTION public.profiles_preserve_privileged_columns() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF coalesce(auth.jwt () ->> 'role', '') = 'service_role' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.membership_type := coalesce(nullif(trim(NEW.membership_type), ''), 'STANDARD');
    IF upper(NEW.membership_type) = 'PREMIUM' OR NEW.subscription_tier IS NOT NULL THEN NEW.membership_type := 'STANDARD'; NEW.subscription_tier := NULL; END IF;
    NEW.role := coalesce(nullif(trim(NEW.role), ''), 'user');
    IF NEW.role NOT IN ('user', 'client') THEN NEW.role := 'user'; END IF;
    NEW.loyalty_points := coalesce(NEW.loyalty_points, 0);
    NEW.gift_card_balance := coalesce(NEW.gift_card_balance, 0);
    NEW.slay_ticket_balance := coalesce(NEW.slay_ticket_balance, 0);
    RETURN NEW;
  END IF;
  NEW.membership_type := OLD.membership_type; NEW.subscription_tier := OLD.subscription_tier; NEW.subscription_period_end := OLD.subscription_period_end;
  NEW.subscription_purchased_at := OLD.subscription_purchased_at; NEW.auto_renew_membership := OLD.auto_renew_membership; NEW.role := OLD.role;
  NEW.current_tier_name := OLD.current_tier_name; NEW.loyalty_points := OLD.loyalty_points; NEW.gift_card_balance := OLD.gift_card_balance;
  NEW.slay_ticket_balance := OLD.slay_ticket_balance; NEW.has_made_first_purchase := OLD.has_made_first_purchase; NEW.unlocked_discounts := OLD.unlocked_discounts;
  NEW.voucher_list := OLD.voucher_list; NEW.voucher_history := OLD.voucher_history; NEW.digital_cash_history := OLD.digital_cash_history;
  NEW.welcome_discount_tiers_credited_by_period := OLD.welcome_discount_tiers_credited_by_period; NEW.stripe_customer_id := OLD.stripe_customer_id;
  NEW.stripe_default_payment_method_id := OLD.stripe_default_payment_method_id; NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  NEW.stripe_subscription_status := OLD.stripe_subscription_status; NEW.last_payment_failure_at := OLD.last_payment_failure_at;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.psa_consume_watch_if_qualified(p_session_id uuid, p_user_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_session public.psa_watch_sessions%ROWTYPE; v_ent public.psa_episode_entitlements%ROWTYPE; v_total numeric;
BEGIN
  SELECT * INTO v_session FROM public.psa_watch_sessions WHERE id = p_session_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND OR v_session.consumed_watch_at IS NOT NULL THEN RETURN false; END IF;
  SELECT * INTO v_ent FROM public.psa_episode_entitlements WHERE id = v_session.entitlement_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  v_total := coalesce(v_ent.pending_watch_seconds, 0) + coalesce(v_session.actual_watched_seconds, 0);
  IF v_total < v_session.qualification_threshold_seconds THEN RETURN false; END IF;
  IF v_ent.watches_used >= v_ent.total_watches THEN RETURN false; END IF;
  UPDATE public.psa_episode_entitlements SET watches_used = watches_used + 1, pending_watch_seconds = 0, status = CASE WHEN watches_used + 1 >= total_watches THEN 'watches-exhausted' ELSE status END WHERE id = v_ent.id;
  UPDATE public.psa_watch_sessions SET qualified = true, consumed_watch_at = now(), last_active_at = now() WHERE id = p_session_id;
  RETURN true;
END; $function$;

CREATE OR REPLACE FUNCTION public.psa_try_consume_message(p_user_id uuid, p_month_key text, p_day_key text, p_month_limit integer, p_day_limit integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.psa_message_usage; next_month_count integer; next_day_count integer;
BEGIN
  IF p_month_limit < 1 OR p_day_limit < 1 THEN RETURN jsonb_build_object('ok', false, 'reason', 'monthly', 'month_count', 0, 'month_limit', p_month_limit, 'day_count', 0, 'day_limit', p_day_limit); END IF;
  INSERT INTO public.psa_message_usage (user_id, month_key, month_count, day_key, day_count) VALUES (p_user_id, p_month_key, 0, p_day_key, 0) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO r FROM public.psa_message_usage WHERE user_id = p_user_id FOR UPDATE;
  IF r.month_key IS DISTINCT FROM p_month_key THEN r.month_key := p_month_key; r.month_count := 0; END IF;
  IF r.day_key IS DISTINCT FROM p_day_key THEN r.day_key := p_day_key; r.day_count := 0; END IF;
  IF r.month_count >= p_month_limit THEN RETURN jsonb_build_object('ok', false, 'reason', 'monthly', 'month_count', r.month_count, 'month_limit', p_month_limit, 'day_count', r.day_count, 'day_limit', p_day_limit); END IF;
  IF r.day_count >= p_day_limit THEN RETURN jsonb_build_object('ok', false, 'reason', 'daily', 'month_count', r.month_count, 'month_limit', p_month_limit, 'day_count', r.day_count, 'day_limit', p_day_limit); END IF;
  next_month_count := r.month_count + 1; next_day_count := r.day_count + 1;
  UPDATE public.psa_message_usage SET month_key = p_month_key, month_count = next_month_count, day_key = p_day_key, day_count = next_day_count, updated_at = now() WHERE user_id = p_user_id;
  RETURN jsonb_build_object('ok', true, 'month_count', next_month_count, 'month_limit', p_month_limit, 'day_count', next_day_count, 'day_limit', p_day_limit);
END; $function$;

-- Out-of-band debug trigger (in neither repo), SECURITY INVOKER, no search_path.
CREATE OR REPLACE FUNCTION public.log_profile_changes() RETURNS trigger LANGUAGE plpgsql
AS $function$
begin
  insert into public.profile_debug_log (profile_id, email, old_first_name, new_first_name, old_last_name, new_last_name, old_profile_image, new_profile_image)
  values (new.id, new.email, old.first_name, new.first_name, old.last_name, new.last_name, old.profile_image, new.profile_image);
  return new;
end; $function$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER profiles_guard_privileged_columns BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_preserve_privileged_columns();
CREATE TRIGGER trg_log_profile_changes AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();
