# All In One — Future Data Model (Conceptual)

**Status:** Planning document from Sprints 01–03 prototypes. Not a locked production schema.

---

## Core entities

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
