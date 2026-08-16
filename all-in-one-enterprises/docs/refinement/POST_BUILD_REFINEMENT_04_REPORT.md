# POST-BUILD REFINEMENT 04 — Trucking Bookkeeping + Road Ready Recommendation

**Status:** Shipped (demo store + public UI + portal/office modules)  
**Date:** 2026-08-16

## Summary

Added **trucking-specific bookkeeping** as a first-class All In One service: public sales page, three recurring tiers + Books Rescue, assessment/recommendation flow, portal and office command centers, demo persistence, workflow template slugs, Supabase schema, and documentation.

## New routes

| Route | Purpose |
|-------|---------|
| `/services/bookkeeping` | Public sales page |
| `/services/bookkeeping/assessment` | Recommendation questionnaire |
| `/services/bookkeeping/recommendation` | Result with WHY + Books Rescue routing |
| `/portal/bookkeeping` | Customer bookkeeping hub |
| `/office/bookkeeping` | Staff command center |
| `/office/bookkeeping/subscriptions` | Subscription list |
| `/office/bookkeeping/books-rescue` | Books Rescue queue |
| `/office/bookkeeping/leads` | Assessment leads |

## Navigation

- Services mega-menu **Operate** column: **Bookkeeping** (with Dispatching, Factoring, Insurance)
- Portal **Money** section: Bookkeeping
- Office **Services**: Bookkeeping

## Plans & prices (starting at)

| Plan | Monthly | Annual |
|------|---------|--------|
| Essentials | $249 | $2,490 |
| Plus | $449 | $4,490 |
| All In One Bookkeeping | $749 | $7,490 |
| Books Rescue | $499 one-time | — |

## Architecture

- **Domain:** `src/bookkeeping/*` (plans, config, recommendation engine + tests)
- **Demo store v21:** subscriptions, cycles, reports, rescue, leads
- **Activation:** `LIMITED_PILOT` — Request Bookkeeping / Join the Pilot
- **Billing:** `starting_at` in `servicePricingConfig.ts`
- **Road Ready:** optional `bookkeeping` item (weight 0); recommended services panel when assessment session exists
- **Icon slot:** temporary `reportsAnalytics` — document `aio-icon-bookkeeping.png` for future artwork
- **Migration:** `20260816170000_aio_bookkeeping.sql`

## Workflow templates (demo slugs)

- `bookkeeping-onboarding`
- `bookkeeping-monthly-cycle`
- `books-rescue-cleanup`

## Security / boundaries

- Disclosures on public page; no password collection
- Not CPA / tax prep / payroll processor by implication

## Responsive QA

- Plan cards stack on mobile
- Feature matrix uses plan tabs on mobile, full table on desktop
- Assessment uses large taps + step progress

## Activation status

Bookkeeping: **LIMITED_PILOT** (public page live; CTA respects activation matrix)

## Known blockers

- **Production migration:** `apply_migration` to FS Website project (`hyycomvcaqxxvyrfupes`) failed — `aio_organizations` not present (AIO schema lives on dedicated AIO Supabase when provisioned). Migration file retained: `supabase/migrations/20260816170000_aio_bookkeeping.sql`. Apply when AIO production DB is linked.
- Dedicated bookkeeping icon artwork pending (`aio-icon-bookkeeping.png`)
- Live payment checkout for subscriptions remains gated by existing billing activation (sandbox/manual)

## Key files

- `src/pages/BookkeepingPage.tsx`
- `src/pages/bookkeeping/BookkeepingAssessmentPage.tsx`
- `src/bookkeeping/bookkeepingRecommendation.ts`
- `src/demo/bookkeepingSeed.ts`
- `docs/services/BOOKKEEPING_*.md`
- `docs/operations/BOOKKEEPING_SOP.md`
