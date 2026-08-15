# All In One Enterprises Inc. — Master Product Blueprint

**Company:** ALL IN ONE ENTERPRISES INC.  
**Positioning:** The business office behind the truck.  
**Status:** Sprint 01 — debug website shell inside Frontal Slayer host repo (temporary).

---

## Vision

All In One Enterprises Inc. is a transportation business-services company helping trucking entrepreneurs, owner-operators, carriers, fleets, and shippers manage administrative and operational services surrounding transportation.

The ecosystem is broader than permit filing. It spans compliance, formation, insurance assistance, dispatch support, brokerage, document management, and a future customer command center.

---

## Service Divisions

| Division | Customer focus | Sprint 01 |
|----------|----------------|-----------|
| Permitting & Compliance | Carriers — tags, IRP, IFTA, authority, renewals | Shell + homepage messaging |
| Business Formation | New trucking businesses — LLC, corp, EIN guidance | Shell |
| Trucking Insurance | Coverage inquiries — liability, cargo, physical damage | Shell (compliant language) |
| Dispatching | Carriers — load coordination, dispatch support | Preview UI only |
| Brokerage | Shippers — freight quotes, tracking | Preview UI only |

**Language rules:** No legal guarantees. No unverified licensing claims. Insurance = assistance / quote requests, not carrier binding unless explicitly documented later.

---

## Customer Types

- Trucking entrepreneurs (startup)
- Owner-operators
- Small and growing carriers / fleets
- Shippers (brokerage)

---

## Future Product Ecosystem

1. **Public website** — marketing, intent-based discovery, trust
2. **Roadmap system** — onboarding + compliance progress (prototype in Sprint 01)
3. **Customer command center** — dashboard, documents, renewals, messages
4. **Dispatch platform** — carrier load operations
5. **Brokerage platform** — shipper quotes and freight movement
6. **Shipper portal** — shipment status, BOL/POD/invoice
7. **Internal employee system** — future ops/admin (not in host repo long-term)
8. **Compliance / document system** — deadlines, filings, storage

---

## Architectural Boundaries (mandatory)

- **Isolated codebase:** `src/all-in-one/` — extraction-first
- **Debug route only:** `/debug/all-in-one/*` — not in Frontal Slayer nav
- **No shared Supabase customer data** with Frontal Slayer in Sprint 01
- **No Frontal Slayer auth** for Client Login (prototype only)
- **Mock data layer** until standalone backend exists

---

## Phases Still to Build

| Phase | Scope |
|-------|--------|
| Sprint 01 ✅ | Website shell, design system, mock prototypes, docs |
| Sprint 02+ | Service page content, intake forms, lead capture |
| Future | Roadmap rules engine, compliance tracking |
| Future | Production auth, customer portal backend |
| Future | Dispatch TMS, load boards, GPS/ELD |
| Future | Brokerage workflow, shipper billing |
| Future | Government/DMV/IRP/IFTA integrations |
| Future | Insurance carrier integrations |
| Extraction | Standalone repo, domain, Supabase project, Vercel/Cloudflare |

---

## Canonical reads for future agents

1. This file — product vision
2. `docs/all-in-one/DEBUG_ARCHITECTURE.md` — current host setup
3. `docs/all-in-one/EXTRACTION_PLAN.md` — how to separate
4. `docs/all-in-one/SPRINT_STATUS.md` — sprint tracker
5. `src/all-in-one/config/appConfig.ts` — runtime configuration
