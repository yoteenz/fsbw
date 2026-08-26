# AIO Supabase Migration History Reconciliation

**Project:** `nnnljnhtmseagotvgxxt` (AIO only — never `hyycomvcaqxxvyrfupes`)  
**Date:** 2026-08-26  
**Task:** Forensic reconciliation — history-only mismatch after MCP `apply_migration`

---

## Root Cause

All **16 canonical migrations** were applied to production via **Supabase MCP `apply_migration`**, which records history using **ad-hoc version timestamps** (`20260826211xxx`) instead of the **repo filename timestamps** (`20260815100000`, etc.).

When GitHub Actions runs `supabase db push --linked`, the CLI compares **version strings** (not migration names). Remote history contained versions that **do not exist as local filenames**, producing:

> Remote migration versions not found in local migrations

**Schema state:** FULLY PRESENT — this was **HISTORY ONLY**, not partial schema.

---

## Local Canonical Chain (16)

| Version | Name | Purpose |
|---------|------|---------|
| 20260815100000 | aio_identity_foundation | Identity, orgs, profiles |
| 20260815110000 | aio_business_data_rls | Business data + RLS base |
| 20260815120000 | aio_identity_roles_contacts | Roles, contacts |
| 20260815130000 | aio_crm_workflow_billing | CRM, workflow, billing |
| 20260815140000 | aio_integrations_security_audit | Integrations, audit |
| 20260815150000 | aio_infrastructure_outbox | Outbox infrastructure |
| 20260815160000 | aio_rls_extensions | RLS extensions |
| 20260815170000 | aio_indexes_views | Indexes, views |
| 20260816170000 | aio_bookkeeping | Bookkeeping domain |
| 20260817180000 | aio_digital_records_vault | Digital records vault |
| 20260817190000 | aio_fleetcare_network | FleetCare network |
| 20260817200000 | aio_driverlink | DriverLink |
| 20260819120000 | aio_freight_load_board_production | Freight load board |
| 20260819140000 | aio_shipper_brokerage_intake | Shipper brokerage intake |
| 20260819150000 | aio_shipper_rls_bookkeeping_handoff | Shipper RLS + bookkeeping handoff |
| 20260826200000 | aio_tms_freight_autopilot_production | TMS autopilot persistence |

---

## Remote History Before Repair

| Version | Name | Local Exists (by name) | Schema Present | Classification |
|---------|------|------------------------|----------------|----------------|
| 20260826211023 | aio_identity_foundation | yes (20260815100000) | yes | B — renamed version timestamp |
| 20260826211110 | aio_business_data_rls | yes | yes | B |
| 20260826211140 | aio_identity_roles_contacts | yes | yes | B |
| 20260826211141 | aio_crm_workflow_billing | yes | yes | B |
| 20260826211145 | aio_integrations_security_audit | yes | yes | B |
| 20260826211158 | aio_infrastructure_outbox | yes | yes | B |
| 20260826211159 | aio_rls_extensions | yes | yes | B |
| 20260826211200 | aio_indexes_views | yes | yes | B |
| 20260826211218 | aio_bookkeeping | yes | yes | B |
| 20260826211219 | aio_shipper_brokerage_intake | yes | yes | B |
| 20260826211233 | aio_digital_records_vault | yes | yes | B |
| 20260826211311 | aio_driverlink | yes | yes | B |
| 20260826211349 | aio_freight_load_board_production | yes | yes | B |
| 20260826211406 | aio_shipper_rls_bookkeeping_handoff | yes | yes | B |
| 20260826211442 | aio_fleetcare_network | yes | yes | B |
| 20260826211459 | aio_tms_freight_autopilot_production | yes | yes | B |

**REMOTE-ONLY versions (all 16):** MCP ad-hoc timestamps — same names as local, different version IDs.

**LOCAL-ONLY versions (before repair):** All 16 canonical filename timestamps — not recorded remotely.

---

## Schema Verification (Post-Forensics)

Confirmed present on `nnnljnhtmseagotvgxxt`:

- aio_organizations
- aio_dispatch_loads
- aio_brokerage_shipper_invoices
- aio_brokerage_bookkeeping_handoffs
- aio_freight_autopilot_events
- aio_freight_document_completeness
- aio_freight_billing_packages
- aio_freight_exceptions
- aio_driver_settlements
- aio_carrier_settlements
- aio_pretrip_inspections

**SCHEMA STATE:** matching (full canonical schema)

---

## Repair Performed

**Yes** — history-only repair via controlled SQL on `supabase_migrations.schema_migrations`:

1. **DELETE** 16 remote-only MCP version rows (`20260826211xxx`)
2. **INSERT** 16 canonical local version rows (`20260815100000` … `20260826200000`)

No DDL re-run. No data loss. No reset. No `db pull`.

### Repaired Versions

| Old Remote Version | New Canonical Version | Action |
|--------------------|----------------------|--------|
| 20260826211023 | 20260815100000 | delete + insert (history align) |
| 20260826211110 | 20260815110000 | delete + insert |
| 20260826211140 | 20260815120000 | delete + insert |
| 20260826211141 | 20260815130000 | delete + insert |
| 20260826211145 | 20260815140000 | delete + insert |
| 20260826211158 | 20260815150000 | delete + insert |
| 20260826211159 | 20260815160000 | delete + insert |
| 20260826211200 | 20260815170000 | delete + insert |
| 20260826211218 | 20260816170000 | delete + insert |
| 20260826211219 | 20260819140000 | delete + insert |
| 20260826211233 | 20260817180000 | delete + insert |
| 20260826211311 | 20260817200000 | delete + insert |
| 20260826211349 | 20260819120000 | delete + insert |
| 20260826211406 | 20260819150000 | delete + insert |
| 20260826211442 | 20260817190000 | delete + insert |
| 20260826211459 | 20260826200000 | delete + insert |

---

## Post-Repair State

Remote history now matches local filename versions exactly (16/16).  
`db push` should report **no pending migrations** if schema unchanged.

---

## Future Prevention

- **Do not** apply AIO production migrations via MCP `apply_migration` when CI uses `supabase db push` — use repo filenames only, or repair history immediately after MCP apply.
- Workflow now runs **`aio-migration-history-check.sh`** after link, **before** `db push`.
- Preflight prints local inventory; post-link check fails fast on mismatch.

---

## CLI Equivalent (if repair needed again)

```bash
# Mark stale remote-only versions reverted (one at a time or batch):
supabase migration repair --status reverted 20260826211023 ...

# Mark canonical local versions applied (schema must already exist):
supabase migration repair --status applied 20260815100000 ...
```

Use only when forensic verification confirms **history-only** mismatch with **schema matching**.
