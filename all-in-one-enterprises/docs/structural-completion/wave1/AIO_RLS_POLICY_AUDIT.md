# RLS Policy Audit (Wave 1)

Snapshot: `_production_rls_snapshot.json` (2026-10-05T22:33:00Z)

## Summary

- **132** `aio_*` tables audited
- **132** RLS enabled (100% of audited set)
- **40** tables RLS-on with **zero policies** → default deny for `authenticated` (secure but may block product paths until policies land)
- **92** tables with explicit policies

## Findings

- **HIGH:** Zero-policy tables in active domains (bookkeeping, fleetcare jobs, quotes) — coverage gap, not overbroad allow
- **CRITICAL if discovered:** Any `USING (true)` on private tables — re-run policy SQL audit before launch

## Helpers (SECURITY DEFINER)

`aio_is_internal_user`, `aio_user_org_ids`, `aio_user_provider_ids`, `aio_internal_role`, `aio_handle_new_user` — require fixed `search_path` in migrations (verify in schema review).
