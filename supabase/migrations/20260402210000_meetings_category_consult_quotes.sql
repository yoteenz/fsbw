-- Meetings: category + metadata for A/C admin hub; allow pending status from booking APIs.
alter table public.meetings add column if not exists category text not null default 'appointment';
alter table public.meetings add column if not exists metadata jsonb default '{}'::jsonb;

do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where t.relname = 'meetings' and c.conname = 'meetings_status_check'
  ) then
    alter table public.meetings drop constraint meetings_status_check;
  end if;
end $$;

alter table public.meetings add constraint meetings_status_check
  check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'pending'));

-- Admin-sent consult quotes: client views offer + code on /account/consult-offer
create table if not exists public.consult_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_email text,
  unit_key text,
  selections jsonb default '{}'::jsonb,
  price_breakdown jsonb default '[]'::jsonb,
  admin_message text,
  thumbnail_src text,
  discount_code text not null,
  discount_amount_usd integer not null default 40,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists consult_quotes_user_id on public.consult_quotes(user_id);
create index if not exists consult_quotes_expires_at on public.consult_quotes(expires_at desc);

alter table public.consult_quotes enable row level security;

create policy "Users read own consult quotes"
  on public.consult_quotes for select
  using (auth.uid() = user_id);
