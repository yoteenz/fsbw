-- One-time use for consult checkout codes ($40 off); redeemed after successful order.
alter table public.consult_quotes
  add column if not exists redeemed_at timestamptz;

create index if not exists consult_quotes_discount_code_user
  on public.consult_quotes (user_id, discount_code);
