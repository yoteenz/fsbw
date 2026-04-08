-- Optimistic concurrency for cart sync across devices
alter table public.cart
  add column if not exists version integer not null default 1;

update public.cart set version = 1 where version is null;
