-- Prepared only. Do not apply to production until the founder authorizes it.
-- Organization-scoped journal drafts. Invite tokens are stored as hashes.

create table if not exists public.workflow_journal_invites (
  id text primary key,
  organization_id text not null,
  expert_label text not null,
  workflow_id text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_journal_documents (
  id text primary key,
  organization_id text not null,
  workflow_id text not null,
  document jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.workflow_journal_invites enable row level security;
alter table public.workflow_journal_documents enable row level security;

-- No public policies. Server access is service-role only until an owner-auth policy is reviewed.
