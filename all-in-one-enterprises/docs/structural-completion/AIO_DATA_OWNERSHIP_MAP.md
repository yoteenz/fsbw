# AIO Data Ownership Map (canonical)

Duplicate owners flagged in `AIO_DUPLICATION_MAP.md`.

| Entity | Canonical owner | Storage |
|--------|-----------------|---------|
| User / profile | `auth.users` + `aio_profiles` | Supabase |
| Organization | `aio_organizations` | Supabase |
| Membership | `aio_organization_memberships` | Supabase |
| Staff | `aio_internal_staff` | Supabase |
| Service request | `aio_service_requests` (+ demo store mirror) | Supabase + demo |
| Shipment request | `aio_shipment_requests` | Supabase |
| Load | `aio_dispatch_loads` | Supabase + demo |
| Load financials | `aio_brokerage_load_financials` | Supabase |
| Brokerage quote | `aio_brokerage_freight_quotes` | Supabase |
| Document | `aio_documents` / vault records | Supabase + demo |
| Conversation / message | `aio_conversations`, `aio_messages` | Supabase |
| Notification | `aio_notifications` | Supabase |
| Invoice / payment | `aio_invoices`, billing tables | Supabase + demo |
| Factoring case | `aio_factoring_cases` | Supabase + demo |
| Insurance case | `aio_insurance_cases` | Supabase |
| Bookkeeping handoff | `aio_brokerage_bookkeeping_handoffs` | Supabase |
| FleetCare ticket | fleetcare tables / demo | Mixed |
| DriverLink opportunity | driverlink demo + schema | Demo-primary |
| Activity event | `aio_activity_events`, `aio_brokerage_audit_events` | Supabase |

**Rule:** New modules reference vault document IDs—not parallel blob stores.
