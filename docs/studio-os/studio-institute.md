# Studio Institute™ (Milestone 93)

Permanent learning and knowledge development system — **not** an online course platform.

## Philosophy

- Knowledge should be **teachable · repeatable · searchable · transferable**.
- **Profession Brain™** is the single source of truth — the Institute never asks organizations to recreate knowledge.
- When the Profession Brain changes, courses · lessons · checklists · playbooks · certifications stay synchronized.
- Teaches humans **and** Digital Staff — one organizational memory.

Official contextual voice: **Learn from expertise. Carry the legacy forward.**

## Auto-generated learning

From each Profession Brain, Studio Institute automatically generates:

Courses · lessons · learning paths · micro-lessons · checklists · playbooks · reference guides · scenario training · interactive exercises · knowledge articles · certification programs · operational simulations · role-based training.

## Capabilities

| Area | Description |
|------|-------------|
| **Multi-audience** | Employee · manager · executive · contractor · customer · student · partner · franchise owner · future family · AI concierge |
| **Role paths** | Personalized paths (Fuel Tax Specialist, Bookkeeper, Dispatcher, etc.) |
| **Scenario learning** | Realistic decision scenarios — not memorization |
| **Certifications** | Organization-specific tracks with progress |
| **Customer education** | Published from Profession Brain public surfaces |
| **Living sync** | Knowledge updates when Brain evolves |
| **Institute dashboard** | Progress · certifications · recommended lessons · activity |

## Architecture

```
src/studio-os-core/studio-institute/
  constants.ts
  learning-types.ts
  types.ts
  course-generator.ts
  scenario-engine.ts
  role-paths.ts
  audience-adaptation.ts
  certification-engine.ts
  dashboard-engine.ts
  knowledge-evolution.ts
  org-store.ts              — sync from Profession Brain
  dock-advisor.ts
  store.ts / bootstrap.ts   — legacy M75 demo seed
  index.ts
```

## UI

**`/admin/studio/studio-institute`** — tabs: Institute Dashboard · Courses & Lessons · Role Paths · Scenario Learning · Certifications · Customer Education · Living Sync · Audiences

Hook: **`useStudioInstituteOrgState`**

## Integration

- **`profession-brain/store.ts`** — `syncStudioInstituteFromProfessionBrain()` on upsert
- **`boundary-sync.ts`** — `ensureOrganizationStudioInstituteProfile()`
- **`command-dock`** — `resolveStudioInstituteAdvice()` · proactive learning recommendations
- **`expert-marketplace`** — customer academy offerings complement Institute customer education
- Legacy M75 panels remain in **`StudioInstituteWorkspace.tsx`** (executive faculty / schools) — M93 workspace is **`StudioInstituteLearningWorkspace.tsx`**

## Command Dock examples

- "A new regulation affects your industry — I've prepared a five-minute lesson."
- "Three employees have not completed the updated certification."
- "This workflow recently changed — would you like me to generate a training lesson?"
