-- Booking final-payment autopay attempt log (admin visibility + retry/failure history).
-- Service role writes; users can read their own attempts for transparency.

create table if not exists public.booking_autopay_attempts (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_number integer not null default 1,
  status text not null default 'failed' check (status in ('succeeded', 'failed', 'cancelled', 'skipped')),
  amount_usd numeric not null default 0,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  stripe_payment_method_id text,
  error_code text,
  error_message text,
  next_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_autopay_attempts_meeting_id_idx
  on public.booking_autopay_attempts(meeting_id);

create index if not exists booking_autopay_attempts_user_id_created_at_idx
  on public.booking_autopay_attempts(user_id, created_at desc);

create index if not exists booking_autopay_attempts_created_at_idx
  on public.booking_autopay_attempts(created_at desc);

alter table public.booking_autopay_attempts enable row level security;

drop policy if exists "Users read own booking autopay attempts" on public.booking_autopay_attempts;
create policy "Users read own booking autopay attempts"
  on public.booking_autopay_attempts
  for select
  using (auth.uid() = user_id);
