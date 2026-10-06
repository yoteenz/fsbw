-- Private bucket for raw migration intake files (staff-only via RLS on metadata tables).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'aio-migration-intake',
  'aio-migration-intake',
  false,
  52428800,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists aio_migration_intake_internal_read on storage.objects;
create policy aio_migration_intake_internal_read on storage.objects
  for select using (
    bucket_id = 'aio-migration-intake'
    and public.aio_is_internal_user()
  );

drop policy if exists aio_migration_intake_internal_write on storage.objects;
create policy aio_migration_intake_internal_write on storage.objects
  for insert with check (
    bucket_id = 'aio-migration-intake'
    and public.aio_is_internal_user()
  );
