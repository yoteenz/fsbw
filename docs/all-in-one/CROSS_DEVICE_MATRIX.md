# All In One — Cross-Device Matrix

Source: `src/all-in-one/qa/qaEngine.ts` → `DEVICE_MATRIX`  
Route: `/all-in-one/office/system/qa/devices`

**Status key:** PASS | PARTIAL | NOT_TESTED

| Viewport | Class | Public | Portal | Office | Notes |
|----------|-------|--------|--------|--------|-------|
| 390×844 | small-phone | PASS | PARTIAL | PARTIAL | Vitest + smoke; overflow manual pending |
| 430×932 | large-phone | PARTIAL | PARTIAL | NOT_TESTED | — |
| 768×1024 | tablet-portrait | PASS | PASS | PARTIAL | Office queues usable |
| 1024×768 | tablet-landscape | PASS | PASS | PASS | — |
| 1366×768 | laptop | PASS | PASS | PASS | Playwright default desktop |
| 1920×1080 | desktop | PASS | PASS | PASS | — |

---

## Sprint 21 testing performed

- Playwright smoke at default desktop viewport (Chromium)
- Responsive CSS under `.aio-app` / `.aio-office` — no automated per-viewport screenshots in CI

---

## Priority routes by device class

### Phone (390px)

- Road Ready onboarding — PARTIAL (manual overflow check pending)
- Portal billing, documents, messages — PARTIAL
- Dispatch full board — NOT recommended; list/detail pattern expected

### Tablet

- Office queue, Client 360, CRM — PARTIAL/PASS
- Dispatch load detail — PASS at 1024×768 smoke

### Desktop

- Management dashboards — PASS smoke (no crash)

---

## Safe areas / mobile keyboard

NOT_TESTED in automated suite. iOS Safari-specific behavior documented as manual follow-up in BROWSER_COMPATIBILITY.md.

---

## Recommendations

1. Add Playwright projects for `390×844` and `768×1024` on critical paths
2. Selective visual regression on Road Ready + portal dashboard (Sprint 22)
