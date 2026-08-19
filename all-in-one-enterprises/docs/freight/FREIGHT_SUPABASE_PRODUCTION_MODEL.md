# AIO Freight — Supabase Production Model

**Sprint:** Load Board Phase 2 Production Hardening  
**Migration:** `supabase/migrations/20260819120000_aio_freight_load_board_production.sql`  
**Apply target:** Dedicated **All In One** Supabase project only (`AIO_SUPABASE_PROJECT_REF`) — **not** Frontal Slayer (`hyycomvcaqxxvyrfupes`).

---

## Tables

| Table | Purpose |
|-------|---------|
| `aio_dispatch_loads` (extended) | Canonical load row + geo + `financial_split_status` + legacy rate preservation |
| `aio_brokerage_load_financials` | Shipper rate / carrier rate split (margin derived in app/view) |
| `aio_brokerage_load_financial_revisions` | Audit trail for material rate changes |
| `aio_carrier_offers` | Carrier load-board + staff offers (org-scoped privacy) |
| `aio_load_board_publications` | Publication metadata (status, visibility, booking flags) |
| `aio_load_board_saved_searches` | Saved filters + alert flag |
| `aio_load_board_recent_searches` | Capped recent search history per user |
| `aio_load_board_search_alert_events` | Dedupe ledger for saved-search alerts |
| `aio_load_status_history` (extended) | Lifecycle transitions + note/actor label |

---

## Financial split

- **Stored:** `shipper_rate_minor`, `carrier_rate_minor`, `currency`
- **Derived (view `aio_brokerage_load_financials_internal`):** `gross_margin_minor`, `gross_margin_percent`
- **Legacy:** `aio_dispatch_loads.rate` + `legacy_rate_minor` — meaning **unclassified**
- **Status enum:** `legacy_unclassified` | `complete` | `needs_review`

Carriers never receive shipper rate or margin (RLS + carrier view + `carrierLoadProjection.ts`).

---

## Views

| View | Audience | Columns |
|------|----------|---------|
| `aio_load_board_carrier_loads` | Authenticated carriers | Load geo, carrier rate, publication — **no shipper/margin** |
| `aio_brokerage_load_financials_internal` | Staff only | Full split + derived margin |

Both use `security_invoker = true` so base-table RLS applies.

---

## RLS summary

| Resource | Carrier | Staff |
|----------|---------|-------|
| `aio_brokerage_load_financials` | **Deny** (no policy) | Full |
| `aio_carrier_offers` | Own org SELECT/INSERT | Full |
| `aio_load_board_publications` | Published SELECT | Full |
| Saved/recent searches | Own user + org | — |
| Alert dedupe events | Own user | — |

Helper functions: `aio_is_internal_user()`, `aio_user_org_ids()`.

---

## Indexes

- Publications: `(publication_status, published_at desc)` where published
- Loads: origin/dest state, pickup_date, equipment_type
- Offers: load_id, carrier_organization_id, partial unique on active offers
- Saved searches: organization_id
- Recent searches: `(user_id, searched_at desc)`

---

## Application layer

| Component | Role |
|-----------|------|
| `FreightRepository` | Demo vs Supabase adapter boundary |
| `DemoFreightRepository` | Demo Store v25 (isolated) |
| `SupabaseFreightRepository` | Production queries/mutations |
| `useFreightRepository()` | React hook — **no silent demo fallback in supabase mode** |
| `freightNotifications.ts` | In-app delivery + dedupe |
| `freightSavedSearchAlerts.ts` | Server-side match on publish |
| `fleetcareLoadIntelligence.ts` | Real maintenance signals only |
| `freightGeocoding.ts` | Stored lat/lng + US city cache |

---

## Deployment

```bash
export AIO_SUPABASE_PROJECT_REF=<aio-project-ref>
bash scripts/verify-migration-environment.sh
supabase db push --project-ref "$AIO_SUPABASE_PROJECT_REF"
```

Verify with `list_tables` / spot-check RLS before enabling production load board traffic.
