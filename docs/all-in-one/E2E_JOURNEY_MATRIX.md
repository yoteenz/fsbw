# All In One — E2E Journey Matrix

Source of truth for journey tracking: `src/all-in-one/qa/testSuites.ts` → `E2E_JOURNEY_MATRIX`.

**Legend:** Automated = covered by vitest and/or Playwright. Status reflects Sprint 21 evidence.

| ID | Journey | Persona | Key routes | Domains | Expected result | Automated | Status |
|----|---------|---------|------------|---------|-----------------|-----------|--------|
| j1 | Prospect to Customer | Anonymous → Customer A | `/all-in-one`, `/get-started`, `/portal` | PUBLIC, ROAD_READY, PORTAL | Demo onboarding → persisted portal | Partial (smoke) | PARTIAL |
| j2 | Lead to Sale | CRM Staff | `/office/crm` | CRM, BILLING, WORKFLOW | Convert without duplicate customer | Yes (crm.test) | PASS |
| j3 | Permitting Service | Customer + Staff | `/portal/requests`, `/office/requests` | SERVICES, WORKFLOW, DOCUMENTS | End-to-end demo flow | No | PARTIAL |
| j4 | Road Ready derivation | Customer A | `/portal/road-ready` | ROAD_READY | Explained READY vs ACTION NEEDED | Yes | PASS |
| j5 | Dispatch load lifecycle | Dispatcher | `/office/dispatch/loads` | DISPATCH | Load + stops persist | Domain tests | PASS |
| j6 | Brokerage shipment | Brokerage Staff | `/office/brokerage` | BROKERAGE | Margin hidden from customer | Rules tests | PASS |
| j7 | Factoring partner workflow | Customer + Staff | `/portal/factoring`, `/office/factoring` | FACTORING | Partner language; no false funded claim | Rules tests | PASS |
| j8 | Insurance referral | Customer + Staff | `/portal/insurance` | INSURANCE | No false ACTIVE COVERAGE | Rules tests | PASS |
| j11 | Finance payment propagation | Finance | `/office/billing` | BILLING, MANAGEMENT, AUDIT | Consistent state across surfaces | crossDomain.test | PASS |
| j12 | Cross-customer attack | Customer A vs B | `/portal` | SECURITY | All cross-org denied | security.test | PASS |
| j13 | Provider failure fallback | Staff | `/office/integrations` | INTEGRATIONS | DEGRADED; manual workflow | integrations.test | PASS |
| j20 | Demo reset | Any | `/all-in-one` | DEMO, SYSTEM | Fixtures restored; no FS mutation | data.test | PASS |
| j21 | Extraction simulation | System | — | EXTRACTION | Dependency graph; blockers documented | qa.test | PARTIAL |
| j24 | Extraction readiness gate | System | `/office/system/qa` | EXTRACTION | `canExtractAllInOne()` evidence | qa.test | PARTIAL |

---

## Master journeys (Sprint 21 spec) — mapping

| Spec journey | Matrix coverage |
|--------------|-----------------|
| 1 Prospect → Customer | j1 PARTIAL |
| 2 Lead → Sale | j2 PASS |
| 3 Permitting | j3 PARTIAL |
| 4 Road Ready | j4 PASS |
| 5 Dispatch | j5 PASS |
| 6 Brokerage | j6 PASS |
| 7 Factoring | j7 PASS |
| 8 Insurance | j8 PASS |
| 9 Renewal | Domain tests (renewal logic in demo) — manual PARTIAL |
| 10 Customer Support | communications.test — manual PARTIAL |
| 11 Finance | j11 PASS |
| 12 Security | j12 PASS |
| 13 Provider failure | j13 PASS |
| 14–16 Mobile / tablet / a11y | Device/a11y matrices — PARTIAL |
| 17–19 Network / double-submit / refresh | Manual NOT_TESTED at E2E level |
| 20 Demo reset | j20 PASS |
| 21 Cross-customer attack | j12 PASS |
| 22 Role change | security.test partial — manual PARTIAL |
| 23 Data propagation | j11 PASS |
| 24 Extraction simulation | j21, j24 PARTIAL |

---

## Playwright smoke coverage

File: `e2e/all-in-one/smoke.spec.ts` (15 tests, Chromium)

- Public home, services, skip link
- Portal dashboard, Road Ready
- Office home, QA Command Center, Data Health
- Route crash smoke: contact, about, get-started, crm, dispatch, management, security

Run: `E2E_BASE_URL=http://localhost:3001 npm run test:aio:e2e`
