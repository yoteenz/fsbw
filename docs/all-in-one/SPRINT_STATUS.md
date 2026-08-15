# All In One — Sprint Status

**Sprint:** 03 — Internal Office + CRM + Service Operations  
**Last updated:** 2026-08-15

---

## UI PROTOTYPE COMPLETE (Sprint 03)

- **All In One Office** — `/all-in-one/office/*` (INTERNAL PREVIEW, not in public nav)
- **Operational dashboard** — metrics, today's priorities, my tasks, activity feed
- **Client CRM** — list + Client 360 profile with tabs and internal notes
- **Request operations center** — table + workflow board, rich request detail
- **Configurable workflows** — `src/all-in-one/office/workflows/` per division
- **Tasks, deadlines, documents, messages** — operational pages
- **Division queues** — permitting, formation, insurance, dispatch, factoring, brokerage
- **Dispatch center** — loads, load detail, delivered → factoring handoff
- **Factoring operations** — review detail, mock status updates
- **Brokerage operations** — quotes, shipments, shipment detail
- **Team, reports, invoices, payments** — management + financial preview
- **Centralized demo store** — `src/all-in-one/demo/` shared by portal + office
- **Cross-portal sync** — request status, documents, messages sync both ways
- **Activity/audit model** — events on key actions
- **Search + Quick Create + notifications** — office top bar
- **Future docs** — `FUTURE_DATA_MODEL.md`, `FUTURE_ROLE_MODEL.md`

---

## UI PROTOTYPE COMPLETE (Sprint 02)

- Smart Intake, Roadmap engine, Service Marketplace, Service Plan, mock requests, portal integration

---

## UI PROTOTYPE COMPLETE (Sprint 01)

- Isolated architecture, public website, design system, factoring division, portal shell

---

## PRODUCTION BACKEND PENDING

- Production auth (Office + portal), Supabase schema (All In One–dedicated)
- Real document storage, messaging (SMS/email), payments, integrations
- Government, insurance, factoring partner, load board APIs
- Server-side role authorization and tenant isolation

---

## Assumptions

1. Office is debug-only entry (banner link) — no production staff auth
2. All data in `aio_debug_store` localStorage — resets to seed
3. Financial figures labeled sample/illustrative
4. Internal notes never exposed to customer portal
