# All In One — Sprint Status

**Sprint:** 20 — Production Data Architecture + Supabase + Auth + Storage + Migration Foundation  
**Last updated:** 2026-08-16

---

## SPRINT 20 COMPLETE (Production Data Foundation)

- **Data module** — `src/all-in-one/data/` (constants, persistence inventory, data health, storage provider, permissions, seeds, importer)
- **Demo store v20** — `dataSystem` snapshot, schema version 20, upgrade path from v18
- **SQL migrations** — 8 baseline files in `all-in-one/supabase/migrations/` (identity → business → CRM/workflow → security/audit → infrastructure → RLS → indexes)
- **Migration guard** — `all-in-one/scripts/verify-migration-environment.sh` (aborts on FS project)
- **Environment contract** — `VITE_AIO_DATA_MODE` = demo | local | supabase; FS URL rejection; no FS fallback
- **Office routes** — `/office/system/data`, `/office/system/data/migration`
- **Production readiness** — architecture vs launch separation; new DATA controls (NOT CONFIGURED until dedicated Supabase)
- **Debug banner** — shows `DATA MODE: DEMO | LOCAL/TEST | SUPABASE DEV`
- **Unit tests** — `data/data.test.ts` (12) + security (16) + integrations (25)
- **Documentation** — `DATABASE_ARCHITECTURE.md`, `SUPABASE_ARCHITECTURE.md`, `DATABASE_SCHEMA_MAP.md`, `RLS_POLICY_MODEL.md`, `STORAGE_ARCHITECTURE.md`, `DATA_MIGRATION_PLAN.md`, `DATABASE_MIGRATION_RUNBOOK.md`, `SEED_DATA_STRATEGY.md`, `DATA_ACCESS_LAYER.md`

**Next:** Sprint 21 — QA + E2E Testing + Accessibility + Performance + Cross-Device Hardening

---

## SPRINT 19 COMPLETE (Security · Privacy · Audit · Resilience)

- **Security module** — `src/all-in-one/security/` (types, control registry, data classification, authorization guard, audit, production gate, file security, rate limits, redaction, FS isolation)
- **Demo store v18** — `securitySeed.ts`, `securityActions.ts`, findings, audit events, sessions, privacy requests, incidents, vendors, retention, backup status
- **Office routes** — `/office/security`, `/office/security/audit`, `/office/security/incidents`, `/office/security/production-readiness`, `/office/privacy`, `/office/settings/security`
- **Portal routes** — `/portal/settings/security`, `/portal/settings/privacy`
- **Hardening** — object-level authorization, CSV injection protection, upload validation, demo reset production guard, permission revocation overrides
- **Production gate** — `canLaunchProduction()` returns BLOCKED in debug with explicit reasons
- **Permissions** — `security.*`, `privacy.*` in `officeWorkTypes.ts` / `officeContext.ts`
- **Unit tests** — `security/security.test.ts` (16 tests) + Sprint 18 integration tests (25)
- **Documentation** — `SECURITY_HARDENING.md`, `DATA_CLASSIFICATION.md`, `PRIVACY_MODEL.md`, `AUDIT_SYSTEM.md`, `INCIDENT_RESPONSE.md`, `BACKUP_AND_DISASTER_RECOVERY.md`, `PRODUCTION_SECURITY_CHECKLIST.md`, `SECURITY_TEST_MATRIX.md`, `VENDOR_SECURITY_REGISTRY.md`

**Next:** Sprint 20 — Production Data Architecture + Supabase + Auth + Storage + Database Migration Foundation

---

## SPRINT 18 COMPLETE (Integration Platform · Provider Architecture · Demo Adapters)

- **Integration module** — `src/all-in-one/integrations/` (types, registry, engine, adapters, webhook, sync, reconciliation, health, redaction, audit, permissions, config)
- **Demo store v17** — `integrationsSeed.ts`, `integrationActions.ts`, carrier verifications, load board candidates, reconciliation demo
- **Office routes** — `/office/integrations`, `/office/integrations/reconciliation`, `/office/settings/integrations`, `/office/settings/integrations/providers`, `/office/settings/integrations/:connectionId`, `/office/integrations/load-board`
- **Portal route** — `/portal/settings/connections`
- **Road Ready** — external carrier verification lookup on client review (demo USDOT 1234567)
- **Management** — integration health + reconciliation attention items
- **Demo adapters** — regulatory, payment, email, SMS, maps, load board, factoring, insurance, accounting (no network calls)
- **Permissions** — `integrations.*` in `officeWorkTypes.ts` / `officeContext.ts`
- **Unit tests** — `integrations/integrations.test.ts` (25 tests)
- **Documentation** — `INTEGRATION_PLATFORM.md`, `INTEGRATION_SECURITY.md`, `INTEGRATION_PROVIDER_CONTRACTS.md`, `REGULATORY_INTEGRATION_MODEL.md`, `EXTERNAL_DATA_PROVENANCE.md`, `INTEGRATION_RECONCILIATION.md`, `INTEGRATION_RESEARCH_REGISTRY.md`

---

## SPRINT 17 COMPLETE (Management Intelligence · Financial Reporting · Attention Engine)

- **Management module** — `src/all-in-one/management/` (types, metric registry, query layer, financial allocation, attention engine, data quality, export, permissions)
- **Office routes** — `/office/management` (+ financial, sales, services, customers, dispatch, brokerage, factoring, insurance, communications, team, deadlines, data-quality), `/office/reports`, `/office/settings/management`
- **Strict financial separation** — collected cash ≠ service revenue ≠ pass-through; brokerage gross margin ≠ net profit
- **Management Attention Engine** — deterministic deduped alerts with drill-down to canonical records
- **Reporting center** — standard report library, CSV export, saved config foundation
- **Permissions** — `management.*`, `reports.*` in `officeWorkTypes.ts` / `officeContext.ts`
- **Unit tests** — `management/management.test.ts` (13 tests — allocation, brokerage margin, funnel, permissions, aging)
- **Documentation** — `MANAGEMENT_COMMAND_CENTER.md`, `MANAGEMENT_METRIC_REGISTRY.md`, `FINANCIAL_REPORTING_MODEL.md`, `REPORTING_SYSTEM.md`, `DATA_QUALITY_SYSTEM.md`, `MANAGEMENT_SECURITY.md`

---

## SPRINT 16 COMPLETE (Communications · Appointments · Portal Messaging)

- **Communications module** — `src/all-in-one/communications/` (types, engine, providers)
- **Appointments module** — `src/all-in-one/appointments/` (types, availability engine)
- **Demo store v16** — `communicationsSeed.ts`, `appointmentsSeed.ts`, conversations A–H, demo appointments
- **Office routes** — `/office/communications`, `/office/communications/:id`, `/office/communications/outbox`, `/office/appointments`, `/office/appointments/:id`, `/office/settings/communications`, `/office/settings/appointments`
- **Portal routes** — `/portal/messages`, `/portal/messages/:id`, `/portal/appointments`, `/portal/appointments/:id`
- **Public route** — `/schedule` (mobile-first consultation booking)
- **Integrations** — CRM lead → conversation; conversion relinks conversations; Client CC + Office attention + Client 360; CRM calendar shows appointments
- **Permissions** — `comm.*`, `appointments.*` in `officeContext.ts`
- **Unit tests** — `communications/communications.test.ts` (11 tests)
- **Documentation** — `COMMUNICATIONS_SYSTEM.md`, `COMMUNICATION_PREFERENCES_AND_CONSENT.md`, `COMMUNICATION_TEMPLATES.md`, `APPOINTMENTS_SYSTEM.md`, `COMMUNICATION_PROVIDER_ARCHITECTURE.md`, `COMMUNICATION_SECURITY.md`

---

## SPRINT 15 COMPLETE (CRM · Lead Pipeline · Quote Conversion)

- **CRM core module** — `src/all-in-one/crm/` (types, deduplication, conversion engine)
- **Demo store v15** — `crmSeed.ts`, `crmActions.ts`, demo leads A–J, pipelines, demo quotes
- **Office routes** — `/office/crm`, `/office/crm/leads`, `/office/crm/leads/:id`, `/office/crm/pipeline`, `/office/crm/opportunities/:id`, `/office/crm/calendar`, `/office/crm/reports`, `/office/settings/crm`
- **Public routes** — functional `/contact`, `/request-callback`, secure `/quote/:secureToken`
- **Integrations** — Smart Intake → lead; service page CTA; canonical Sprint 07 quotes; conversion → service requests + Sprint 14 workflows; CRM follow-ups → Office work items; Office Command Center CRM queues
- **Permissions** — `crm.*` role bundles in `officeContext.ts`
- **Unit tests** — `crm/crm.test.ts` (dedupe, conversion idempotency, existing customer link, permissions, quote tokens)
- **Documentation** — `CRM_SYSTEM.md`, `CRM_CONVERSION_ENGINE.md`, `CRM_PIPELINES.md`, `CRM_LEAD_CAPTURE.md`, `CRM_SECURITY.md`

---

## SPRINT 14 COMPLETE (Workflow Engine · Automation · Service Journeys)

- **Workflow core module** — `src/all-in-one/workflow/` (types, validation, engine, orchestrator, domain events, business days)
- **Template versioning** — published immutable versions; Operating Authority v1/v2 demo
- **Workflow instances & steps** — dependency graph, weighted progress, conditional skip, payment gates
- **Automation engine** — event bus, rules, idempotent execution, kill switch, exceptions queue
- **Service journeys** — New Carrier Startup demo bundles multiple workflow instances
- **Office routes** — `/office/workflows`, `/office/workflows/:id`, `/office/settings/workflows`, `/office/settings/automations`, `/office/automation-exceptions`, `/office/workflow-health`
- **Portal routes** — `/portal/services/:serviceRequestId` (service tracker), `/portal/roadmap` (journey)
- **Integrations** — Service request → workflow; document upload → workflow; Client CC + Office attention sync
- **Demo store v14** — `workflowSeed.ts`, migration from v13
- **Permissions** — `workflows.*`, `workflow_templates.*`, `automation_*` added to Office roles
- **Unit tests** — 11 workflow tests (validation, cycles, idempotency, versioning, journeys)
- **Documentation** — `WORKFLOW_ENGINE.md`, `AUTOMATION_ENGINE.md`, `SERVICE_ORCHESTRATION.md`, `SERVICE_JOURNEYS.md`, `WORKFLOW_SOURCE_OF_TRUTH.md`

---

## SPRINT 13 COMPLETE (Office 2.0 · Unified Staff Operations)

- **Office 2.0 IA** — Home / Work / Clients / Services / Operations / Finance / Communication / Management nav
- **Office core module** — `src/all-in-one/office-core/` (work types, work engine, attention, next-action, command center, Client 360, context)
- **Office Command Center** — `/office` upgraded with staff greeting, next action, attention, queues, role modules, manager summary
- **Work routes** — `/office/work`, `/office/queues`, `/office/approvals`, `/office/escalations`, `/office/services`, `/office/documents/review`, `/office/inbox`, `/office/workload`, `/office/activity`, `/office/audit`
- **OfficeWorkItem** — references canonical domains; waiting-on model; assignment history; queue membership; overdue/stale detection
- **Client 360** — `/office/clients/:organizationId` upgraded with operational status, service relationships, pinned notes, role-aware tabs
- **Handoffs / approvals / escalations** — demo seed + pages + actions
- **Staff roles & permissions** — role bundles; financial domain separation; audit gate
- **Command palette** — ⌘/Ctrl+K quick navigation
- **Demo store v13** — fictional staff, work scenarios A–H, management demo state
- **Unit tests** — 15 tests (dedupe, next-action, auth, transitions, Client 360, note privacy)
- **Documentation** — `OFFICE_2_SYSTEM.md`, `OFFICE_WORK_MODEL.md`, `CLIENT_360.md`, `OFFICE_HANDOFFS_APPROVALS_ESCALATIONS.md`

---

## SPRINT 12 COMPLETE (Client Command Center · Portal IA · Attention Engine)

- **Client Command Center** — `/portal` home replaces flat dashboard; `ClientCommandCenterService` aggregates cross-domain state
- **Portal module** — `src/all-in-one/portal/` (command center service, attention engine, next-action engine, organization context, types, hook)
- **Hub routes** — `/portal/business`, `/portal/business/summary`, `/portal/operations`, `/portal/money`, `/portal/documents`, `/portal/communication`, `/portal/requests` (list), `/portal/services`, `/portal/activity`, `/portal/team`, `/portal/search`
- **Legacy routes preserved** — Road Ready, Vault, Dispatch, Factoring, Brokerage, Insurance, Billing deep links unchanged
- **Attention engine** — dedupe by `dedupeKey`; insurance expiry canonical key `insurance-expiry:{orgId}:{date}`
- **Next-action engine** — deterministic precedence; optional growth suppressed when operational items exist
- **Financial domains** — AIO billing, freight receivables, brokerage payables, factoring in-process shown separately — **never combined**
- **Role-aware portal** — `portalMemberRole` gates billing/money/quick actions (owner, admin, accounting, operations, driver, viewer)
- **Organization members** — team roster on `/portal/team`; demo seed per org
- **Demo org switcher** — `AIODebugBanner` organization + role selects; shipper org button
- **Mobile IA** — bottom nav (Home · Business · Ops · Money · More); collapsible sidebar
- **Demo store v12** — adds `portalMemberRole`, `organizationMembers`; migration from v11
- **Unit tests** — attention dedupe, optional suppression, next-action precedence, driver money exclusion, no combined money total
- **Documentation** — `CLIENT_COMMAND_CENTER.md`, `CLIENT_INFORMATION_ARCHITECTURE.md`, `CLIENT_ATTENTION_ENGINE.md`, updated canon docs

---

## SPRINT 11 COMPLETE (Insurance · Assistance Mode · COI · Road Ready Sync)

- **Insurance core module** — types, rules, calculations, config, partner adapter stub (`src/all-in-one/insurance/`)
- **Operating modes** — `assistance` (default) · `referral` · `partner` · `direct_future` (disabled)
- **Capability gate** — `demo` | `assistance` | `partner` | `direct_disabled`; default **`demo`**
- **Policy records** — intake, verification states, derived expiration, replacement chain, vehicle linkage
- **Insurance requests** — `IR-YYYY-####`, status machine, coverage needs, fleet prefill from Road Ready
- **Partner directory & handoffs** — manual referral adapter; fictional demo partner
- **Quote records** — partner-reported with required source attribution; premium ≠ AIO revenue
- **COI workflow** — request + status; customer cannot issue COI
- **Issues queue** — expiring policy, vehicle schedule, partner info flags
- **Road Ready integration** — `syncInsuranceToRoadReady()`; brokerage carrier insurance read
- **Customer portal** — `/portal/insurance/*` (home, request, policies, certificates, renewals)
- **Office Command Center** — `/office/insurance/*` (requests, policies, partners, COIs, readiness)
- **Notifications** — insurance category events (request, quote, policy, COI, renewal)
- **Demo store v11** — insurance seed (scenarios A–I), migration from v10
- **Unit tests** — policy date derivation, masking, status transitions, regulatory invariants
- **Documentation** — `INSURANCE_SYSTEM.md`, `INSURANCE_REGULATORY_BOUNDARIES.md`, `INSURANCE_DATA_SECURITY.md`, `INSURANCE_ACTIVATION.md`, updated canon docs

---

## SPRINT 10 COMPLETE (Brokerage · Shipper Portal · Coverage · Finance)

- **Brokerage core module** — types, rules, calculations, config (`src/all-in-one/brokerage/`)
- **Capability gate** — `disabled` | `demo` | `prelaunch` | `active`; default **`demo`**
- **Shipper onboarding & profiles** — `ShipperProfile`, agreement status, `/shipper/onboarding`
- **Shipment requests** — `SR-YYYY-####`, status machine, shipper submission flow
- **Freight quotes** — `BQ-YYYY-####`, revisions, accept → canonical load conversion
- **Canonical load conversion** — `sourceType: 'brokerage'`, `BR-LD-*`, financials sidecar
- **Coverage workflow** — needs coverage queue, coverage history, carrier contact/offer states
- **Carrier network** — internal directory, verification levels, W-9 status
- **Carrier offers** — accept/decline, revision history, portal at `/portal/brokerage/offers`
- **Rate confirmations** — dev template only; production gate in activation checklist
- **Brokerage financials** — shipper charge vs carrier pay vs gross margin (office-only margin)
- **Shipper invoices** — `BSI-YYYY-####`, ready-to-bill rules, shipper billing portal
- **Carrier payables** — approval workflow, factoring assignment flags (demo)
- **Dispatch ≠ Brokerage** — mandatory domain separation documented and enforced in UI visibility
- **Shipper portal** — `/shipper/*` (home, shipments, quotes, billing)
- **Carrier brokerage portal** — `/portal/brokerage/*` (offers, loads, payables)
- **Office Command Center** — `/office/brokerage/*` (readiness, shippers, coverage, carriers, finance)
- **Notifications** — brokerage category events (quote, coverage, POD, invoice)
- **Demo store v9** — brokerage seed (loads A–H scenarios), migration from v8
- **Unit tests** — margin calculations, quote/offer/request status transitions, ready-to-bill rules
- **Documentation** — `BROKERAGE_SYSTEM.md`, `BROKERAGE_FINANCIAL_DOMAIN.md`, `BROKERAGE_SECURITY.md`, `BROKERAGE_ACTIVATION.md`, updated canon docs

---

## SPRINT 09 COMPLETE (Factoring · Freight Invoices · Partner Handoff)

- **Factoring core module** — types, rules, calculations, config, provider adapter stub (`src/all-in-one/factoring/`)
- **Service modes** — `factoring_assistance`, `partner_factoring`; `direct_factoring_future` disabled (`directFactoringEnabled = false`)
- **Enrollment & profiles** — per-organization factoring profile, application flow, provider assignment
- **Providers directory** — demo partner + carrier-existing provider records
- **Freight invoices** — `HF-YYYY-####` numbering, load-linked, distinct from Sprint 07 service invoices
- **Submissions lifecycle** — package review, status machine, timeline, duplicate protection
- **Reported funding fields** — staff-entered provider reports only; no bank storage, no direct funding
- **Issues workflow** — amount mismatch, missing docs, provider additional info, customer action flags
- **Dispatch handoff integration** — consumes Sprint 08 `factoringHandoffStatus`; `LoadFactoringSection` on load detail
- **Customer portal** — factoring home, application, ready loads, submissions, history, freight invoice print
- **Office Command Center** — pipeline metrics, submissions queue, client profiles, providers, review checklist
- **Notifications** — factoring category events (submitted, approved, funded, action needed, etc.)
- **Vault references** — rate con, BOL, POD linked on freight invoices and submission packages
- **Demo store v8** — factoring seed (clients A–G scenarios), migration from v7
- **Unit tests** — readiness rules, duplicate detection, status transitions, estimated calculations
- **Documentation** — `FACTORING_SYSTEM.md`, `FREIGHT_RECEIVABLES_DOMAIN.md`, `FACTORING_SECURITY.md`, `DIRECT_FACTORING_FUTURE.md`, updated canon docs

---

## SPRINT 08 COMPLETE (Dispatch · Loads · Command Center)

- **Dispatch core module** — types, calculations, rules, config (`src/all-in-one/dispatch/`)
- **Dispatch enrollment** — per-organization service relationship, agreement status, onboarding
- **Canonical Load domain** — single extensible load entity, offer vs operational status, timeline
- **Carrier load offers** — accept / decline with structured reasons
- **Truck availability** — per power unit, next available location/date
- **Office Command Center** — metrics, needs-load queue, dispatch board, today schedule
- **Office routes** — loads, clients, brokers, load detail ops
- **Customer portal** — dispatch home, onboarding, loads, history (mobile-first)
- **Vault integration** — rate confirmation, BOL, POD on loads
- **Factoring handoff foundation** — `not_ready` / `ready` / `submitted_future` — no funding
- **Dispatch billing foundation** — fee config + billing events; distinct from load gross
- **Demo store v7** — dispatch seed (carriers A–E scenarios), migration from v6
- **Unit tests** — RPM, deadhead %, gross, dispatch fee calculations
- **Documentation** — `DISPATCH_SYSTEM.md`, `LOAD_DOMAIN.md`, updated `FINANCIAL_BOUNDARIES.md`

---

## SPRINT 07 COMPLETE (Billing · Quotes · Invoices · Payments)

- **Billing core module** — money (minor units), types, calculator, service pricing, payment provider abstraction
- **Quote system** — versioning, fee categories, pending external fees, acceptance audit, revisions, expiration
- **Invoice system** — snapshots, numbering, balance tracking, past-due evaluation
- **Payment foundation** — demo/disabled/provider modes, demo simulate pay, idempotency architecture
- **Receipts** — numbering, print-friendly views
- **Customer portal** — Billing Center, Quotes, Pay, Receipts
- **Office** — Billing Center, Quotes queue/detail, Invoice detail, Payments, Pricing Settings
- **Integrations** — portal dashboard, service catalog/plan pricing, request detail billing sections, notifications (billing category), Road Ready/renewal via shared billing domain
- **Demo store v6** — billing seed, migration from v5, reset restores billing state
- **Documentation** — `BILLING_SYSTEM.md`, `PAYMENT_SECURITY.md`, `FINANCIAL_BOUNDARIES.md`

---

## SPRINT 06 COMPLETE (Vault · Calendar · Renewals · Notifications)

- **All In One Vault** — categories, upload, verification, supersession, search (`/portal/vault`)
- **Compliance Calendar** — derived events from documents, renewals, deadlines (`/portal/calendar`)
- **Renewal Center** — eligibility, start renewal → service request, self-managed (`/portal/renewals`)
- **Notification Engine** — event model, dedupe, expiration evaluator, in-app center + preferences
- **Office upgrades** — Document Center queues + review, Deadline Center filters, Renewal Center + batch view
- **Integrations** — portal dashboard, Road Ready links, fleet matrix, Client 360, office dashboard/reports
- **Demo store v5** — relative-date seed clients A–E, migration from v4
- **Documentation** — `DOCUMENT_VAULT_SYSTEM.md`, `RENEWAL_SYSTEM.md`, `NOTIFICATION_SYSTEM.md`, updated canon docs

---

## SPRINT 05 COMPLETE (Road Ready)

- **Road Ready core module** — config, types, rules, scoring, priority (`src/all-in-one/road-ready/`)
- **Demo store v4** — profiles, items, history, verifications, fleet (power units, trailers, drivers)
- **Customer onboarding** — 10-step wizard with autosave, resume, skip (`/portal/onboarding`)
- **Persistent Road Ready home** — dual progress ring, categories, attention center, next step, history (`/portal/road-ready`)
- **Fleet profile** — list + vehicle detail with masked VIN (`/portal/fleet`)
- **Office Road Ready queue** — filters, incomplete onboarding visibility (`/office/road-ready`)
- **Service request linkage** — Get Help With This pre-populates requests
- **Expiration foundation** — centralized thresholds, deadline sync hook
- **Documentation** — `ROAD_READY_SYSTEM.md`, updated blueprint, auth matrix, security, data model

---

## ARCHITECTURE COMPLETE (Sprint 04)

- **Data mode architecture** — `demo` | `backend` via `VITE_AIO_DATA_MODE`
- **Isolated env config** — dedicated Supabase (never Frontal Slayer)
- **Repository layer**, migrations, auth, route guards

---

## BACKEND ACTIVATION PENDING

Dedicated All In One Supabase project credentials are **not yet configured**.

- App runs in **Demo Mode** (default)
- Dispatch + billing + factoring + brokerage + insurance + command center backend tables deferred — demo store v12 is source of truth for Sprint 12 review
- Payment provider mode: **demo** (no live charges)
- No Frontal Slayer schema touched

---

## Prior sprints

- **Sprint 03** — All In One Office, CRM, shared demo store
- **Sprint 02** — Smart Intake, Roadmap (extended by Road Ready — not replaced)
- **Sprint 01** — Isolated architecture, public website, design system

---

## Production pending

- Apply dispatch + billing + Road Ready migrations to dedicated AIO Supabase when backend activated
- Payment provider selection + webhook deployment
- Attorney-approved dispatch agreement terms before production enrollment
