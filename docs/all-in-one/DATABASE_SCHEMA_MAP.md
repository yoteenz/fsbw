# All In One — Database Schema Map (Sprint 20)

Quick reference: table → purpose → RLS strategy. Full DDL in `all-in-one/supabase/migrations/`.

## Identity & orgs

| Table | Purpose | RLS |
|-------|---------|-----|
| `aio_profiles` | Auth profile extension | Own profile + internal |
| `aio_organizations` | Business entity | Member or internal |
| `aio_organization_memberships` | User ↔ org | Member or internal |
| `aio_internal_staff` | AIO employees | Internal only |
| `aio_contacts` | Person record (not auth) | Internal + linked customer |
| `aio_customers` | Customer relationship | Org-scoped |
| `aio_staff_profiles` | Staff operational profile | Internal only |
| `aio_roles` / `aio_permissions` / `aio_user_roles` | RBAC | Read roles; staff manages assignments |

## Operations

| Table | Purpose | RLS |
|-------|---------|-----|
| `aio_service_requests` | Service intake | Org member or internal |
| `aio_workflow_instances` | Active workflows | Customer-safe select; staff write |
| `aio_documents` | Document metadata | Visibility enum + org |
| `aio_internal_notes` | Staff notes | **Internal only** |
| `aio_invoices` / `aio_payments` | Billing | Customer own org; finance staff |
| `aio_leads` / `aio_crm_notes` | CRM | **Staff only** |
| `aio_audit_events` | Audit trail | Append-only; security read |

## Views

| View | Purpose |
|------|---------|
| `aio_portal_service_request_view` | Customer-safe service progress |
| `aio_portal_invoice_view` | Customer-safe invoices |
| `aio_management_service_ops_view` | Staff reporting aggregates |

Classification follows `DATA_CLASSIFICATION.md`. Restricted tables: factoring, insurance internal events, integration secrets.
