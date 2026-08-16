# Service Journey Architecture

**All In One Enterprises Inc.** · Refinement 06  
**Status:** Shipped (demo)

---

## Purpose

Transform static service explanation pages into **actionable guided workflows** with clickable milestones, real progress, and return navigation.

---

## Journey vs Workflow vs Road Ready

| Layer | Question | Example |
|-------|----------|---------|
| **Road Ready** | What does this business need? | USDOT required, IFTA not applicable |
| **Service Journey** | How does the customer complete startup milestones? | BUILD → AUTHORIZE → … → ROLL |
| **Workflow** | What operational tasks run behind a service? | Collect docs → submit → external wait |

Journey progress derives from **Road Ready item statuses** and service/workflow state — never hard-coded percentages.

---

## Domain types

Location: `src/journeys/journeyTypes.ts`

- `ServiceJourneyDef` — config (steps, routes, Road Ready keys)
- `JourneyStepView` — resolved step with status, CTA, sub-progress
- `JourneyProgressView` — completed / applicable counts
- `StartBusinessJourneyView` — full page view model

---

## Progress logic

```
progress = completed_required_applicable_milestones / total_required_applicable_milestones × 100
```

- **ROLL** is optional — not counted toward 100%
- **NOT APPLICABLE** steps do not count against the customer
- Sub-journeys (REGISTER, ACTIVATE) show sub-progress: `3 of 4 complete`

Status priority for next action: `action_required` → `in_progress` → `waiting_partner` → `waiting_aio` → `ready` → `not_started`

---

## Journey context (URL)

Query params:

- `journey=start-your-business`
- `step=build|authorize|…`
- `from=/start-your-business` (optional return override)

Helper: `withJourneyContext(path, step)` in `journeyContext.ts`

Back navigation: `JourneyBackNav` component on sub-routes and service pages when journey context present.

---

## Start Your Business routes

| Milestone | Route |
|-----------|-------|
| Journey hub | `/start-your-business` |
| BUILD | `/start-your-business/build` |
| AUTHORIZE | `/services/operating-authority-assistance` |
| PROTECT | `/services/insurance` |
| REGISTER | `/start-your-business/register` |
| ACTIVATE | `/start-your-business/activate` |
| ROLL | `/start-your-business/roll` |

Sub-steps link to existing service catalog routes with journey context appended.

---

## Road Ready integration

`useStartBusinessJourney()` reads:

- `getRoadReadyProfile(orgId)`
- `getRoadReadyItems(orgId)`

Maps requirement keys per step via `startBusinessJourneyConfig.ts`.

---

## Reuse for other journeys

Same engine pattern supports future journeys (bookkeeping onboarding, insurance intake, audit support) by adding new `ServiceJourneyDef` configs — not duplicating UI components.

Existing `ServiceJourney` in `workflowTypes.ts` (workflow instance bundles) remains for portal roadmap — complementary, not replaced.

---

## Components

| Component | Role |
|-----------|------|
| `ServiceJourneyHeader` | Progress bar, attention banner, continue CTA |
| `ServiceJourneyStepper` | Compact clickable milestone navigator |
| `ServiceJourneyStepDetail` | Selected step detail + sub-steps |
| `JourneyBackNav` | Explicit back to journey |

---

## Service page actionability

Service catalog pages show `JourneyBackNav` when `?journey=start-your-business` is present. All service pages retain existing `getPublicServiceCta()` START / CONTINUE / REQUEST paths.
