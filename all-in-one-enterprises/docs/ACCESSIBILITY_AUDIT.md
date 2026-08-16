# All In One — Accessibility Audit (Sprint 21)

**Benchmark:** WCAG 2.2 AA as engineering target where practical.  
**Disclaimer:** Automated checks and partial manual review do **not** constitute formal accessibility certification.

---

## Sprint 21 changes

| Item | Status | Notes |
|------|--------|-------|
| Skip to main content | **PASS** | Public + Office layouts (`#aio-main-content`) |
| Skip link CSS | **PASS** | `.aio-skip-link` visible on focus |
| Form labels (core flows) | **PASS** | Vitest + code review |
| Icon-only control names | **PARTIAL** | Not audited on every surface |
| Keyboard-only E2E | **NOT_TESTED** | Planned master journey 16 |
| Screen reader manual review | **NOT_TESTED** | — |
| Automated axe scan | **NOT_TESTED** | Foundation only |
| prefers-reduced-motion | **NOT_TESTED** | — |
| Contrast audit | **NOT_TESTED** | — |
| Modal focus trap audit | **PARTIAL** | Pattern exists; not fully verified |
| Table headers / scope | **PARTIAL** | QA tables use `<th>`; responsive tables vary |
| Chart text alternatives | **PARTIAL** | Management metrics have labels; not all charts audited |
| 200% zoom | **NOT_TESTED** | — |
| Touch targets (mobile) | **PARTIAL** | Responsive CSS; not measured |

---

## QA Command Center

Route: `/all-in-one/office/system/qa/accessibility`

Tracks checklist from `src/all-in-one/qa/qaEngine.ts` → `ACCESSIBILITY_CHECKLIST`.

---

## Known issues

- QA-003, QA-004 — intentional placeholders (P4), not a11y blockers
- Full keyboard navigation across Dispatch board and Management charts requires Sprint 22+ dedicated pass

---

## Recommendations (post-Sprint 21)

1. Add `@axe-core/playwright` smoke on public home + portal dashboard + office home
2. Keyboard-only Playwright journey for Road Ready onboarding
3. Contrast audit on status badges and disabled buttons
4. Verify dialog focus return on all destructive confirmations

---

## Fixes applied

- Skip navigation links on public and office shells (Sprint 21)

**Remaining work:** Manual keyboard + SR review before production launch.
