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
| FactoringProfile | `aio_factoring_profiles` | Enrollment + service mode |
| FactoringProvider | `aio_factoring_providers` | Partner directory (internal) |
| DebtorAccount | `aio_debtor_accounts` | Broker/debtor per carrier org |
| FreightInvoice | `aio_freight_invoices` | Carrier invoice to debtor — **not** service billing |
| FactoringSubmission | `aio_factoring_submissions` | Package workflow + reported funding fields |
| FactoringIssue | `aio_factoring_issues` | Blockers and customer actions |
| FactoringCase | `aio_factoring_cases` | **Deprecated name** — use FactoringSubmission |
| BrokerageQuote/Shipment | `aio_brokerage_quotes`, `aio_brokerage_shipments` | **Legacy names** — see Sprint 10 brokerage domain |
| Invoice | `aio_invoices` | Billing foundation |
| Quote | `aio_quotes` + `aio_quote_versions` + `aio_quote_line_items` | Service estimates |
| QuoteAcceptance | `aio_quote_acceptances` | Immutable accepted version |
| InvoiceLineItem | `aio_invoice_line_items` | Snapshot at issue |
| Payment | `aio_payments` | Provider-confirmed payments |
| Receipt | `aio_receipts` | Post-payment record |
| Credit / Refund | `aio_credits`, `aio_refunds` | Adjustments |
| ServicePricing | `aio_service_pricing` | Catalog commercial config |

Demo mode: `DemoStore` v9 fields mirror billing + factoring + brokerage relationships in localStorage.

### Billing domain (Sprint 07)

| Entity | Table (planned) | Purpose |
|--------|-----------------|---------|
| ServicePricing | `aio_service_pricing` | pricing_mode, fees, payment_timing |
| Quote | `aio_quotes` | Header + status |
| QuoteVersion | `aio_quote_versions` | Immutable line snapshots |
| QuoteLineItem | `aio_quote_line_items` | fee_category, amount_status |
| Invoice | `aio_invoices` | balance_due, status lifecycle |
| Payment | `aio_payments` | provider id, idempotency |
| Receipt | `aio_receipts` | Post-payment artifact |

---

| Entity | Table (planned) | Purpose |
|--------|-----------------|---------|
| RoadReadyProfile | `aio_road_ready_profiles` | Org-scoped profile + onboarding state + rule_version |
| RoadReadyItem | `aio_road_ready_items` | Requirement instances (org/vehicle scope) |
| RoadReadyVerification | `aio_road_ready_verifications` | Staff verification audit |
| RoadReadyHistory | `aio_road_ready_history` | Customer-visible event stream |
| PowerUnit / Trailer / Driver | `aio_power_units`, `aio_trailers`, `aio_drivers` | Fleet profile |

Demo mode: `DemoStore` v4 fields mirror these relationships in localStorage.

---

### Factoring domain (Sprint 09)

| Entity | Table (planned) | Purpose |
|--------|-----------------|---------|
| FactoringProfile | `aio_factoring_profiles` | Enrollment, service mode, terms (self-reported) |
| FactoringProvider | `aio_factoring_providers` | External partner metadata |
| DebtorAccount | `aio_debtor_accounts` | Broker/debtor directory |
| FreightInvoice | `aio_freight_invoices` | Carrier receivable document (`HF-*`) |
| FactoringSubmission | `aio_factoring_submissions` | Review workflow + timeline |
| FactoringSubmissionEvent | `aio_factoring_submission_events` | Timeline rows (or JSONB on submission) |
| FactoringIssue | `aio_factoring_issues` | Operational blockers |

Demo store keys: `factoringProfiles`, `factoringProviders`, `debtorAccounts`, `freightInvoices`, `factoringSubmissions`, `factoringIssues`, `factoringCounters`.

Relationships:

```
Organization 1—1 FactoringProfile (active)
Organization 1—* FreightInvoice
Load 1—* FreightInvoice (one non-void typical)
FreightInvoice 1—* FactoringSubmission (one active)
FactoringSubmission *—1 FactoringProvider
Load 1—* FactoringSubmission (via freight invoice)
FactoringSubmission 1—* FactoringIssue
DebtorAccount *—* Load (via broker reference)
```

No funding ledger table in Sprint 09 — `reportedAdvanceMinor` on submission only.

---

### Brokerage domain (Sprint 10)

| Entity | Table (planned) | Purpose |
|--------|-----------------|---------|
| BrokerageCapabilityState | `aio_brokerage_capability` | `disabled` / `demo` / `prelaunch` / `active` |
| ShipperProfile | `aio_shipper_profiles` | Shipper onboarding + agreement |
| ShipmentRequest | `aio_shipment_requests` | `SR-*` intake |
| BrokerageFreightQuote | `aio_brokerage_freight_quotes` | `BQ-*` shipper freight charge |
| BrokerageQuoteRevision | `aio_brokerage_quote_revisions` | Immutable quote history |
| CarrierNetworkProfile | `aio_carrier_network_profiles` | Internal carrier directory |
| CarrierOffer | `aio_carrier_offers` | Carrier pay offers |
| BrokerageRateConfirmation | `aio_brokerage_rate_confirmations` | Rate con workflow |
| BrokerageLoadFinancials | `aio_brokerage_load_financials` | Shipper charge / carrier pay / margin |
| BrokerageAccessorial | `aio_brokerage_accessorials` | Per-side accessorials |
| BrokerageShipperInvoice | `aio_brokerage_shipper_invoices` | `BSI-*` A/R |
| CarrierPayable | `aio_carrier_payables` | A/P to carrier |
| BrokerageIssue | `aio_brokerage_issues` | Operational issues |
| CoverageHistoryEvent | `aio_coverage_history_events` | Coverage audit |

Demo store keys: `brokerageCapability`, `shipperProfiles`, `shipmentRequests`, `brokerageFreightQuotes`, `carrierNetworkProfiles`, `carrierOffers`, `brokerageRateConfirmations`, `brokerageLoadFinancials`, `brokerageAccessorials`, `brokerageShipperInvoices`, `carrierPayables`, `brokerageIssues`, `coverageHistory`, `brokerageCounters`.

Relationships:

```
ShipperProfile 1—* ShipmentRequest
ShipmentRequest 1—* BrokerageFreightQuote
BrokerageFreightQuote 0—1 Load (sourceType brokerage)
Load 1—1 BrokerageLoadFinancials
Load 1—* CarrierOffer
Load 0—1 BrokerageShipperInvoice
Load 0—1 CarrierPayable
CarrierNetworkProfile 1—* CarrierOffer
```

Canonical load remains in dispatch load table / `loads[]` — no duplicate movement rows.

See **`BROKERAGE_SYSTEM.md`**.

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
DispatchLoad 0—* FactoringSubmission (via FreightInvoice)
FreightInvoice 0—* FactoringSubmission
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
| Factoring submission (own org) | Status + customer timeline | Full + reported funding entry |
| Reported funding amounts | Summary when funded | Full + edit until locked |
| Activity (internal) | Filtered | Full |

Production must enforce visibility **server-side** — not UI-only hiding.

---

## Sensitive data classifications (future)

- **Public:** service descriptions, non-identifying status labels
- **Customer confidential:** business name, contact, documents, messages
- **Staff confidential:** internal notes, workload, draft invoices
- **Financial sensitive:** freight invoice amounts, reported factoring advances/reserves/fees, banking (**not collected** in Sprint 09)
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
