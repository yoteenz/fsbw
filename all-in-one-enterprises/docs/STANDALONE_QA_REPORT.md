# STANDALONE QA REPORT — Sprint 22

**Environment:** Standalone app `all-in-one-enterprises/`  
**Date:** 2026-08-16

## Automated results

| Check | Result |
|-------|--------|
| Vitest (188 tests) | **PASS** |
| Standalone build | **PASS** |
| Isolation scan | **PASS** |
| Hard isolation (copy to /tmp) | **PASS** |
| Playwright smoke (15 tests) | **PASS** |
| FS build regression | **PASS** |

## Extraction regressions

None tagged `EXTRACTION_REGRESSION` at P0/P1.

## Parity with Sprint 21

- Demo fixtures and domain tests preserved (same source tree)
- Cross-customer security tests PASS
- Financial/management calculator tests PASS
- QA Command Center loads at `/office/system/qa`

## Known gaps (unchanged from Sprint 21)

- Live Supabase RLS (QA-002)
- Full browser matrix (Firefox/Safari)
- Manual accessibility sign-off
