-- Migration approve idempotency + file queue stage tracking

create table if not exists public.aio_client_migration_commits (
  idempotency_key text primary key,
  batch_id uuid not null references public.aio_archive_migration_batches(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  committed_by_user_id uuid references auth.users(id) on delete set null,
  committed_at timestamptz not null default now()
);

create index if not exists idx_aio_migration_commits_batch
  on public.aio_client_migration_commits (batch_id);

alter table public.aio_archive_migration_batch_files
  add column if not exists queue_state text not null default 'QUEUED',
  add column if not exists processing_stage text,
  add column if not exists processing_error text,
  add column if not exists last_processed_at timestamptz;

alter table public.aio_client_migration_commits enable row level security;

create policy aio_migration_commits_internal on public.aio_client_migration_commits
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());
