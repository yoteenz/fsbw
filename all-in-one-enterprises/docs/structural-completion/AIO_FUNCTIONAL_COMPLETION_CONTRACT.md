# AIO Functional Completion Contract

A material node is **100% functionally complete** only when every applicable requirement below is **PASS** or **N/A** (documented).

## Requirements

1. **Route** — Canonical path registered; guard/layout documented; no orphan component.
2. **Navigation** — Reachable from target IA container (MY OFFICE, MY BUSINESS, OPERATIONS, FINANCES, VAULT, INBOX, SERVICES, ACCOUNT) or explicit public/office entry.
3. **State** — Default, loading, empty, error, success (and domain-specific: unauthorized, pending review, expired where relevant).
4. **Primary interactions** — CTAs, forms, wizards, tables, filters documented in `AIO_INTERACTION_COVERAGE_MATRIX.json`.
5. **Data contract** — Canonical entity owner identified (`AIO_DATA_OWNERSHIP_MAP.md`); demo vs Supabase adapter declared.
6. **Form behavior** — Validation, submit, disabled states for all material forms.
7. **Responsive behavior** — Usable at mobile / tablet / desktop (gaps in `AIO_RESPONSIVE_GAP_MATRIX.json`).
8. **Accessibility** — Keyboard, labels, landmarks, focus (gaps in `AIO_ACCESSIBILITY_GAP_MATRIX.json`).
9. **Authorization** — Route guard + RLS/tenant alignment for production paths.
10. **Persistence** — Not demo-only for production-ready classification; or explicitly `DEMO_ONLY` with launch blocker.
11. **Role visibility** — Shipper/carrier/staff separation preserved (financial privacy, internal notes).
12. **Audit / event hooks** — Material actions mappable in `AIO_ANALYTICS_EVENT_MAP.json`.
13. **Dependencies** — Upstream systems listed in canonical graph node.

## Zero-generation rule

Functional completion waves may use **neutral structural shells** (uppercase, monogram nav, charcoal/stone, basic gold accent) — no paid assets, no family-specific visual expression.

## Current baseline honesty

Most customer portal nodes score **PARTIAL (55–68%)** because demo store is the default runtime (`VITE_AIO_DATA_MODE=demo`), while freight/brokerage/shipper domains have **BACKEND_PARTIAL** adapters and live CI tests exist but require production secrets.
