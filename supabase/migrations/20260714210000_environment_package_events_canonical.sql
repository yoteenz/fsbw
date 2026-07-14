-- Canonical Environment Package event envelope extensions (audit_events = durable event stream)

alter table public.studio_environment_package_audit_events
  add column if not exists variant_id text,
  add column if not exists environment_id text,
  add column if not exists department_id text,
  add column if not exists output_type text,
  add column if not exists job_id text,
  add column if not exists actor_type text default 'system',
  add column if not exists actor_id text,
  add column if not exists source text default 'package-repository',
  add column if not exists sequence bigint,
  add column if not exists correlation_id text,
  add column if not exists causation_id text,
  add column if not exists schema_version text not null default 'studio.environment-package-event.v1',
  add column if not exists persisted_at timestamptz not null default now();

create index if not exists studio_env_pkg_audit_pkg_seq_idx
  on public.studio_environment_package_audit_events (package_id, sequence);

create index if not exists studio_env_pkg_audit_job_idx
  on public.studio_environment_package_audit_events (job_id)
  where job_id is not null;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'studio_env_pkg_audit_authenticated_read') then
    create policy "studio_env_pkg_audit_authenticated_read"
      on public.studio_environment_package_audit_events
      for select to authenticated
      using (true);
  end if;
end $$;

comment on table public.studio_environment_package_audit_events is
  'Canonical append-only Environment Package event stream (studio_environment_package_events contract).';
