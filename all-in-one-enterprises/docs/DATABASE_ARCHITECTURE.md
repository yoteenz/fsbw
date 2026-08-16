# All In One — Database Architecture (Sprint 20)

**Status:** Architecture foundation — not production launch  
**Last updated:** 2026-08-16

## Purpose

Canonical persistence design for the standalone All In One product. All tables use the `aio_` prefix in a **dedicated Supabase project** — never Frontal Slayer (`hyycomvcaqxxvyrfupes`).

## Domains

| Domain | Primary tables |
|--------|----------------|
| IDENTITY | `aio_profiles`, `auth.users` |
| ORGANIZATIONS | `aio_organizations`, `aio_organization_memberships` |
| CUSTOMERS | `aio_contacts`, `aio_customers`, `aio_customer_organizations` |
| STAFF | `aio_internal_staff`, `aio_staff_profiles` |
| ROLES | `aio_roles`, `aio_permissions`, `aio_role_permissions`, `aio_user_roles` |
| SERVICES | `aio_service_requests`, `aio_service_request_status_history` |
| WORKFLOW | `aio_workflow_definitions`, `aio_workflow_versions`, `aio_workflow_instances`, `aio_workflow_steps` |
| CRM | `aio_leads`, `aio_opportunities`, `aio_crm_notes` (INTERNAL default) |
| DOCUMENTS | `aio_documents`, `aio_document_versions`, `aio_document_sharing_events` |
| BILLING | `aio_invoices`, `aio_invoice_items`, `aio_payments`, `aio_financial_events` |
| DISPATCH | `aio_dispatch_loads`, `aio_load_stops`, `aio_load_status_history` |
| FACTORING | `aio_factoring_cases` |
| INSURANCE | `aio_insurance_cases`, `aio_insurance_events` |
| INTEGRATIONS | `aio_integration_connections` (secret_reference only) |
| AUDIT | `aio_audit_events` (append-only) |
| INFRASTRUCTURE | `aio_idempotency_keys`, `aio_outbox_events`, `aio_inbox_events` |

## Conventions

- **PKs:** UUID (`gen_random_uuid()`)
- **Timestamps:** `timestamptz`, UTC, `created_at` / `updated_at` server-generated
- **Human IDs:** Separate columns — `AIO-CUS-*`, `AIO-SVC-*`, via sequences/functions
- **Money:** `amount_cents bigint` + `currency text` — never float
- **Enums:** Postgres enums for stable sets; check constraints for visibility
- **JSONB:** Metadata and provider snapshots only — not core relational entities

## Foreign keys & delete behavior

- Financial/audit/workflow history: **RESTRICT** or **SET NULL** — never cascade-delete history
- Memberships: **CASCADE** from organization when org deleted (non-production only)
- Audit events: **no UPDATE/DELETE** grants for `authenticated`

## Indexes

Composite indexes on `(organization_id, status)`, `(assigned_staff_user_id, status)`, audit `occurred_at desc`.

## Event architecture

- Domain events → `aio_outbox_events` (transactional outbox)
- External webhooks → `aio_inbox_events` (dedupe by provider + external id)
- Critical commands → `aio_idempotency_keys`

## Demo vs production

| Mode | Persistence |
|------|-------------|
| `demo` | `aio_debug_store` v20 + DemoRepository |
| `local` | Same as demo; for automated tests |
| `supabase` | Dedicated AIO Postgres + RLS |

See also: `DATABASE_SCHEMA_MAP.md`, `RLS_POLICY_MODEL.md`, `DATA_ACCESS_LAYER.md`.
