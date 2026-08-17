-- All In One — Digital Records Vault + Archive Migration foundation
-- Apply ONLY to dedicated All In One Supabase project (NOT Frontal Slayer hyycomvcaqxxvyrfupes).

-- ---------------------------------------------------------------------------
-- Extend aio_documents to match VaultDocument application model
-- ---------------------------------------------------------------------------
alter table public.aio_documents
  add column if not exists document_type text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists mime_type text,
  add column if not exists file_name text,
  add column if not exists file_size_bytes bigint,
  add column if not exists file_hash text,
  add column if not exists source text not null default 'digital_upload',
  add column if not exists record_lifecycle text not null default 'pending',
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists visibility_scope text not null default 'customer',
  add column if not exists issued_at timestamptz,
  add column if not exists effective_at timestamptz,
  add column if not exists renewal_date timestamptz,
  add column if not exists jurisdiction text,
  add column if not exists issuing_agency text,
  add column if not exists road_ready_item_id uuid,
  add column if not exists related_service_id uuid references public.aio_service_requests(id) on delete set null,
  add column if not exists supersedes_document_id uuid references public.aio_documents(id) on delete set null,
  add column if not exists superseded_by_document_id uuid references public.aio_documents(id) on delete set null,
  add column if not exists is_current boolean not null default true,
  add column if not exists physical_original_status text,
  add column if not exists physical_archive_location text,
  add column if not exists review_status text default 'pending',
  add column if not exists classification_confidence numeric(5,4),
  add column if not exists metadata_extraction_status text not null default 'none',
  add column if not exists suggested_metadata jsonb default '{}'::jsonb,
  add column if not exists internal_notes text,
  add column if not exists uploaded_by uuid references auth.users(id) on delete set null,
  add column if not exists uploaded_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists migration_batch_id uuid,
  add column if not exists version_number integer not null default 1;

-- Backfill title from legacy name column when present
update public.aio_documents set title = name where title is null and name is not null;

create index if not exists idx_aio_documents_org_category_current
  on public.aio_documents (organization_id, category, is_current);

create index if not exists idx_aio_documents_org_lifecycle
  on public.aio_documents (organization_id, record_lifecycle);

create index if not exists idx_aio_documents_file_hash
  on public.aio_documents (organization_id, file_hash)
  where file_hash is not null;

-- ---------------------------------------------------------------------------
-- Client archive migration status (organization-level)
-- ---------------------------------------------------------------------------
alter table public.aio_organizations
  add column if not exists archive_migration_status text not null default 'not_started';

-- ---------------------------------------------------------------------------
-- Archive migration batches
-- ---------------------------------------------------------------------------
create table if not exists public.aio_archive_migration_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  state text not null default 'uploading',
  review_state text not null default 'pending',
  approval_state text not null default 'pending',
  file_count integer not null default 0,
  document_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aio_archive_migration_batch_files (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.aio_archive_migration_batches(id) on delete cascade,
  organization_id uuid not null references public.aio_organizations(id) on delete cascade,
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  file_hash text,
  storage_reference text,
  page_count integer,
  processing_state text not null default 'uploaded',
  document_id uuid references public.aio_documents(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.aio_documents
  add constraint aio_documents_migration_batch_fk
  foreign key (migration_batch_id) references public.aio_archive_migration_batches(id) on delete set null;

create index if not exists idx_aio_migration_batches_org
  on public.aio_archive_migration_batches (organization_id, state);

create index if not exists idx_aio_migration_batch_files_batch
  on public.aio_archive_migration_batch_files (batch_id);

-- ---------------------------------------------------------------------------
-- RLS — archive migration (internal only)
-- ---------------------------------------------------------------------------
alter table public.aio_archive_migration_batches enable row level security;
alter table public.aio_archive_migration_batch_files enable row level security;

create policy aio_migration_batches_internal on public.aio_archive_migration_batches
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

create policy aio_migration_batch_files_internal on public.aio_archive_migration_batch_files
  for all using (public.aio_is_internal_user())
  with check (public.aio_is_internal_user());

-- ---------------------------------------------------------------------------
-- RLS — customer document upload (additive)
-- ---------------------------------------------------------------------------
create policy aio_documents_customer_insert on public.aio_documents
  for insert with check (
    organization_id in (select public.aio_user_org_ids())
    and source in ('client_upload', 'digital_upload')
    and visibility = 'customer'
  );

create policy aio_documents_customer_update_own on public.aio_documents
  for update using (
    organization_id in (select public.aio_user_org_ids())
    and verification_status in ('unverified', 'pending_review')
    and uploaded_by = auth.uid()
  );
