# All In One — Future Data Model (Conceptual)

**Status:** Planning document from Sprints 01–03 prototypes. Not a locked production schema.

---

## Core entities (Sprint 04 production schema)

| Entity | Table | Purpose |
|--------|-------|---------|
| User profile | `aio_profiles` | Authenticated human (extends auth.users) |
| Organization | `aio_organizations` | Company/entity |
| Membership | `aio_organization_memberships` | User ↔ org role |
| Internal staff | `aio_internal_staff` | All In One employees |
| Intake session | `aio_intake_sessions` | Smart Intake persistence |
| Roadmap | `aio_roadmaps` + `aio_roadmap_items` | Preliminary roadmap + rule_version |
| ServiceRequest | `aio_service_requests` | Unit of customer work |
| Status history | `aio_service_request_status_history` | Audit trail |
| Task | `aio_tasks` | Internal work items |
| Document | `aio_documents` | Metadata (storage_reference future) |
| InternalNote | `aio_internal_notes` | Staff-only — separate table |
| Conversation / Message | `aio_conversations`, `aio_messages` | Portal messaging |
| ActivityEvent | `aio_activity_events` | Audit stream |
| Notification | `aio_notifications` | In-app alerts |
| Deadline | `aio_deadlines` | Compliance dates (verified flag) |
| DispatchLoad | `aio_dispatch_loads` | Carrier loads |
| FactoringCase | `aio_factoring_cases` | Workflow only — no funding |
| BrokerageQuote/Shipment | `aio_brokerage_quotes`, `aio_brokerage_shipments` | Shipper freight |
| Invoice | `aio_invoices` | Billing foundation |

---

## Core entities (Sprint 03 prototype mapping)

| Entity | Purpose |
|--------|---------|
| Client | Customer account (carrier, fleet, shipper, owner-operator) |
| Company | Legal entity details linked to client |
| Contact | People associated with client |
| Vehicle / Trailer | Fleet assets |
| Roadmap | Preliminary customer path (intake-derived) |
| ServiceRequest | Unit of customer work |
| RequestWorkflow | Division-specific status machine |
| DocumentRequirement | Metadata + visibility + status |
| Task | Internal work item |
| Deadline | Compliance/service dates |
| InternalNote | Staff-only (`visibility: internal`) |
| Message | Customer/staff thread (`visibility: customer`) |
| ActivityEvent | Audit/history stream |
| StaffMember | Internal user profile (future auth-linked) |
| DispatchLoad | Carrier load record |
| FactoringSubmission | Invoice review case |
| BrokerageQuote / Shipment | Shipper freight records |
| Invoice | Service billing preview |

---

## Relationships (high level)

```
Client 1—* ServiceRequest
Client 1—* DocumentRequirement
Client 1—* Task
Client 1—* Deadline
Client 1—* Message
Client 1—* InternalNote (internal only)
ServiceRequest *—* DocumentRequirement
ServiceRequest 1—* Message
ServiceRequest 1—* Task
DispatchLoad 0—1 FactoringSubmission
BrokerageQuote 0—1 Shipment
StaffMember 1—* ServiceRequest (assigned)
StaffMember 1—* Task (assigned)
```

---

## Visibility boundaries

| Data | Customer portal | Office |
|------|---------------|--------|
| InternalNote | Never | Yes |
| Message (customer-visible) | Yes | Yes |
| DocumentRequirement (requested) | Yes | Yes |
| Staff assignment | Display name only | Full |
| Invoice draft | Sent/paid only | Full |
| Activity (internal) | Filtered | Full |

Production must enforce visibility **server-side** — not UI-only hiding.

---

## Sensitive data classifications (future)

- **Public:** service descriptions, non-identifying status labels
- **Customer confidential:** business name, contact, documents, messages
- **Staff confidential:** internal notes, workload, draft invoices
- **Financial sensitive:** factoring amounts, banking (not collected in prototype)
- **Regulatory:** authority/insurance filings (future integrations)

---

## Integration boundaries (future)

- Government / FMCSA / IRP / IFTA agencies — outbound only, audited
- Insurance partners — quote API, no All In One as carrier
- Factoring partners — submission API, no direct funding claims in UI
- Load boards — read-only or partner APIs
- Payments — isolated billing service, PCI scope minimized
- Document storage — encrypted object store with signed URLs

---

## Audit requirements

All state changes should emit ActivityEvent with: actor, entity, before/after, timestamp, correlation id.

---

## Prototype mapping

Sprint 03 stores all entities in `aio_debug_store` (localStorage). Production replaces with All In One–dedicated Supabase project (separate from Frontal Slayer).
