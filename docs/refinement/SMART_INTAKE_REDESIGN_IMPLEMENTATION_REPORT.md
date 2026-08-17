# Smart Intake Responsive Redesign — Implementation Report

**Date:** 2026-08-17  
**Route:** `/get-started` (All In One standalone, port 5173)  
**Scope:** UX/UI architecture refactor — preserve intake logic, validation, persistence, demo mode, business-name check

---

## Summary

Smart Intake was rebuilt as a **guided business-setup console** matching the approved desktop + mobile design reference:

- **Desktop:** persistent dark journey rail (~32%) + warm light workspace (~68%), max-width shell centered on ultrawide
- **Mobile:** compact dark header, collapsible journey drawer, stacked content, sticky footer navigation
- **All visible steps** share one shell; Step 3 (Business) is the visual reference for cards, name check, and insight modules

Existing workflow truth (dynamic sections from `getVisibleSections`, conditional branches, roadmap generation) is unchanged.

---

## Architecture

| Layer | Path |
|-------|------|
| Dedicated layout (no public nav/footer) | `all-in-one-enterprises/src/layouts/SmartIntakeLayout.tsx` |
| Route wiring | `all-in-one-enterprises/src/routes/AllInOneRoutes.tsx` |
| Page orchestration | `all-in-one-enterprises/src/pages/GetStartedPage.tsx` |
| Journey metadata (i18n keys) | `all-in-one-enterprises/src/intake/smartIntakeMeta.ts` |
| Design system CSS | `all-in-one-enterprises/src/styles/aio-smart-intake.css` |

### Component system

| Component | Role |
|-----------|------|
| `SmartIntakeShell` | Grid shell, mobile drawer, workspace scroll region |
| `SmartIntakeJourneyRail` | Desktop rail + mobile drawer content |
| `SmartIntakeWorkspaceHeader` | Eyebrow, title, description, step progress bar |
| `SmartIntakeNavigation` | Back / Save & Exit / Continue footer |
| `SmartIntakeSection` | Module grouping + `SmartIntakeInsight` |
| `SmartIntakeChoiceGrid` | Goal, structure, compact selection cards |
| `SmartIntakeBusinessStep` | Step 3 grouped modules |
| `SmartIntakeReviewSummary` | Final-step roadmap preview + edit links |

---

## Behavior preserved

- **Dynamic steps** via `getVisibleSections(answers)` (carrier flow ≈ 7 steps; factoring/insurance/shipper branches unchanged)
- **Autosave** on every `answers` change through `intakeRepository.save`
- **Validation** via `useIntakeValidation` — errors shown under fields
- **Business name check** — formation state → name → structure order; honest registry statuses; stale invalidation
- **Final submit** — last step shows review summary; Continue generates roadmap → `/roadmap/results`
- **Demo mode** — preview controls remain outside customer shell (unchanged)
- **i18n** — new copy in `locales/en|es/intake.json`

---

## Bug fixed during QA

**Continue button did not advance steps.** Footer `type="submit"` lived outside the `<form>` in `SmartIntakeShell`. Fixed by:

- Form `id="si-intake-form"` on `GetStartedPage`
- `form="si-intake-form"` on Continue button in `SmartIntakeNavigation`

---

## Responsive breakpoints

CSS uses fluid typography (`clamp`), grid breakpoints at **1024px** (desktop rail), and **max-width: 1280px** shell for ultrawide. Test matrix: 320–3440px.

---

## Not in scope / follow-ups

- Full roadmap payoff remains on `roadmapResults` page; last wizard step shows `SmartIntakeReviewSummary` preview
- Legacy `aio-intake` CSS retained for any non-migrated surfaces
- Production Vercel deploy requires founder **"deploy now"**

---

## Files touched

```
src/layouts/SmartIntakeLayout.tsx
src/components/smart-intake/*
src/pages/GetStartedPage.tsx
src/components/IntakeQuestionField.tsx
src/components/intake/BusinessNameCheckField.tsx
src/intake/smartIntakeMeta.ts
src/intake/intakeConfig.ts (structure option descriptions)
src/styles/aio-smart-intake.css
src/routes/AllInOneRoutes.tsx
src/App.tsx
src/locales/en/intake.json
src/locales/es/intake.json
```
