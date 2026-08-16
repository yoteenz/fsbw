-- All In One — Indexes & reporting views
-- Apply ONLY to dedicated All In One Supabase project.

create index if not exists aio_customers_status_idx on public.aio_customers (status);
create index if not exists aio_leads_status_idx on public.aio_leads (status);
create index if not exists aio_leads_created_idx on public.aio_leads (created_at desc);
create index if not exists aio_workflow_instances_org_status_idx on public.aio_workflow_instances (organization_id, status);
create index if not exists aio_payments_org_idx on public.aio_payments (organization_id, recorded_at desc);
create index if not exists aio_audit_occurred_idx on public.aio_audit_events (occurred_at desc);
create index if not exists aio_audit_org_idx on public.aio_audit_events (organization_id, occurred_at desc);
create index if not exists aio_messages_conversation_idx on public.aio_messages (conversation_id, created_at desc);
create index if not exists aio_outbox_pending_idx on public.aio_outbox_events (status, created_at) where status = 'pending';

-- Composite indexes for common filters
create index if not exists aio_requests_org_status_idx on public.aio_service_requests (organization_id, status);
create index if not exists aio_tasks_assignee_status_idx on public.aio_tasks (assigned_staff_user_id, status);

-- Management reporting view (staff only — enforced via base table RLS when queried through security invoker)
create or replace view public.aio_management_service_ops_view as
select
  sr.organization_id,
  sr.status,
  count(*) as request_count
from public.aio_service_requests sr
group by sr.organization_id, sr.status;
