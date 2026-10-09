-- Durable migration file processing (lease + retry accounting)

alter table public.aio_archive_migration_batch_files
  add column if not exists processing_attempts integer not null default 0,
  add column if not exists processing_lease_expires_at timestamptz;

create index if not exists idx_aio_migration_batch_files_queue
  on public.aio_archive_migration_batch_files (batch_id, queue_state);
