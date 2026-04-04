-- Persist Stripe default payment method for off-session booking final-payment autopay.
alter table public.profiles
  add column if not exists stripe_default_payment_method_id text;
