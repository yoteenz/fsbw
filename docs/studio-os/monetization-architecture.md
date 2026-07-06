# Studio OS Monetization Architecture (Milestone 89)

Permanent pricing and monetization architecture for Studio OS. Founders build companies — they do not subscribe to SaaS.

## Core philosophy

- Founders **build Headquarters**, **expand Departments**, and **hire Digital Staff**.
- Every payment is an **investment in organizational growth**, never a feature unlock.
- Studio OS should feel like **building a company**, not buying software.

## Three-layer economy

| Layer | Billing | Purpose |
|-------|---------|---------|
| **Headquarters License** | Monthly | Operating system — Mission Control, Command Dock, Registry, security, core intelligence |
| **Department Packs** | Permanent purchase | New wings of Headquarters — Creator Studio, Accounting, Warehouse, CRM, etc. |
| **Digital Workforce** | Monthly payroll | Active Digital Staff — concierges and intelligence employees |

## Code layout

```
src/studio-os-core/monetization-architecture/
  constants.ts           — philosophy, HQ license amount, payroll defaults
  types.ts               — profiles, staff, payroll summary, growth recommendations
  headquarters-license.ts
  pack-pricing.ts        — permanent department prices + expansion wings
  digital-staff-catalog.ts
  payroll-engine.ts      — active staff, monthly payroll totals
  growth-recommendations.ts — Expansion Center + Command Dock executive advice
  dock-advisor.ts        — growth/staff hiring responses for Command Dock
  store.ts               — per-org localStorage profile
  bootstrap.ts
  index.ts
```

## Integration points

- **`industry-architecture/store.ts`** — `installDepartmentPack()` records permanent ownership via `recordDepartmentPackPurchase()`.
- **`organization-context/boundary-sync.ts`** — `ensureOrganizationMonetizationProfile()` on org switch.
- **`ExpansionCenterWorkspace.tsx`** — tabs: Overview, Catalog, Owned Departments, Digital Workforce, Digital Payroll, HQ Layout.
- **`command-dock/store.ts`** — `resolveExecutiveGrowthAdvice()` for executive recommendations (not upsell copy).
- **`workspaces/index.ts`** — platform bootstrap seeds monetization profiles.

## Language conventions (mandatory)

| Avoid | Use instead |
|-------|-------------|
| Subscribe / subscription | Headquarters License · Digital Payroll |
| Buy software / unlock features | Expand Headquarters · Own Department permanently |
| AI subscription | Hire Digital Staff · Activate Concierge |
| Marketplace | Expansion Center · Recommended Growth |
| Install pack | Expand Headquarters · Permanent purchase |

## Demo behavior

All commerce is **localStorage demo** — no Stripe or payment processor wired in M89. Prices display organizational investment framing; purchases immediately expand Headquarters and unlock staff for hire.
