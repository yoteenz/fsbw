# EXTRACTION COMPLETION REPORT — Sprint 22

**Date:** 2026-08-16  
**Source:** Frontal Slayer repo `src/all-in-one/` (legacy `/all-in-one` host)  
**Target:** `all-in-one-enterprises/` standalone application  
**Result:** **COMPLETE** (standalone extraction) · **PRODUCTION BLOCKED** (infrastructure)

---

## Summary

| Gate | Status |
|------|--------|
| Standalone extraction (`isStandaloneExtractionComplete()`) | **COMPLETE** |
| Extraction readiness (`canExtractAllInOne()`) | **BLOCKED** — live RLS / dedicated Supabase only |
| Preview deployment (`canDeployStandalonePreview()`) | **READY** (build + demo) |
| Production launch | **BLOCKED** |

---

## Migrated

| Area | Destination |
|------|-------------|
| Source (368 files) | `all-in-one-enterprises/src/` |
| Migrations (8 SQL) | `all-in-one-enterprises/supabase/migrations/` |
| Docs | `all-in-one-enterprises/docs/` |
| Tests | Standalone vitest + Playwright `e2e/` |
| Routes | `/all-in-one/*` → `/` (see ROUTE_MIGRATION.md) |

---

## Verification evidence

- **188 vitest** PASS in standalone
- **Standalone build** PASS (~1.1MB main chunk)
- **Isolation scan** PASS (`scripts/check-isolation.sh`)
- **Hard isolation test** PASS (copy to `/tmp`, install, build, test)
- **FS build** PASS after removing `src/all-in-one/`
- **Legacy FS routes** frozen with moved notice

---

## Remaining blockers (production, not extraction)

- Dedicated All In One Supabase project + live RLS tests (QA-002)
- Production domain, auth, storage, providers (Sprint 23)

---

## Legacy FS items

- `/all-in-one`, `/debug/all-in-one` → `LegacyAioMovedNotice` (no runtime AIO code in FS)
- Expert capture routes under `/expert-capture/all-in-one-permitting` remain FS (separate product surface)
