# All In One — Sprint Status

**Sprint:** 02 — Smart Intake + Business Roadmap + Service Marketplace  
**Last updated:** 2026-08-15

---

## UI PROTOTYPE COMPLETE (Sprint 02)

- **Smart Intake** — `/all-in-one/get-started` with goal query params (`?goal=start-business`, etc.)
- **Config-driven intake engine** — `src/all-in-one/intake/` (sections, conditional branches)
- **Carrier, shipper, factoring, insurance branches** — single intake system, not separate forms
- **Preliminary Roadmap engine** — `src/all-in-one/roadmap/` (mock deterministic rules, not legal compliance)
- **Roadmap results** — `/all-in-one/roadmap/results` with explainable recommendations, dual progress bars
- **Service Marketplace** — upgraded `/all-in-one/services` with divisions, bundles, 30+ service cards
- **Config-driven service detail** — `/all-in-one/services/:serviceSlug` + division landing pages
- **Service bundles** — Start Trucking, Get Legal, Keep Compliant, Run My Truck
- **My Service Plan** — `/all-in-one/service-plan` (not a shopping cart)
- **Mock service request** — submit → `AIO-DEMO-XXXX` confirmation → portal Active Requests
- **Request detail + timeline** — `/all-in-one/portal/requests/:requestId`
- **Portal dashboard upgrade** — roadmap, requests, documents needed, deadlines, dispatch/factoring previews
- **localStorage persistence** — `aio_debug_intake`, `aio_debug_roadmap`, `aio_debug_service_plan`, `aio_debug_requests`
- **Debug banner + Reset Demo Data** — visible in All In One app only
- **Repository abstractions** — Intake, Roadmap, ServicePlan, ServiceRequest (LocalDemo* implementations)

---

## COMPLETED (Sprint 01 core)

- Isolated `src/all-in-one/` architecture
- Canonical route `/all-in-one/*` + legacy `/debug/all-in-one/*` redirect
- Homepage, portal shell, design system, docs
- Frontal Slayer isolation preserved

---

## COMPLETED FOR PROTOTYPE (Sprint 01 Factoring follow-up)

- Six primary service divisions including Factoring
- Public `/all-in-one/services/factoring` + portal `/all-in-one/portal/factoring`
- Mock factoring layer + partner-ready provider stub
- Compliant language — no guarantees, illustrative fees labeled Sample

---

## PRODUCTION IMPLEMENTATION PENDING

- Production auth, CRM, real compliance rules engine
- Government, insurance, factoring, brokerage, dispatch integrations
- Supabase schema for All In One (separate from Frontal Slayer)
- Document upload/storage, messaging, specialist assignment
- Partner factoring API, underwriting, ACH/banking/KYC
- Verified contact info, final logo, real factoring partner

---

## PARTIALLY COMPLETED

- Contact form: nonfunctional prototype
- Document upload buttons: labeled "Coming in Future Sprint"
- Portal nav items beyond Dashboard/Roadmap/Plan/Factoring: mostly stubs

---

## BLOCKED

- Verified contact info, final logo, real factoring partner selection

---

## Assumptions

1. Sprint 02 roadmap is **preliminary guidance only** — not legal compliance determination
2. Factoring/dispatch optional — do not reduce compliance progress score
3. All demo requests persist in localStorage only
4. Embedded/partner factoring model for future production
