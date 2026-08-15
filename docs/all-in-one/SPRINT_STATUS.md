# All In One — Sprint Status

**Sprint:** 09 — Factoring Operations + Receivables Workflow  
**Last updated:** 2026-08-15

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
- Dispatch + billing + factoring backend tables deferred — demo store v8 is source of truth for Sprint 09 review
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
