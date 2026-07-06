# Business Discovery Blueprint™ (Milestone 90)

Permanent onboarding architecture for Studio OS. Every organization begins with a Blueprint — not a setup wizard or questionnaire.

## Core philosophy

- Do not ask founders to configure software.
- Help founders **teach Studio OS how their business works**.
- The goal is **preserving organizational intelligence** — not collecting data.
- Every answer becomes part of the organization's **permanent knowledge**.
- The Blueprint is the **birth certificate** of every organization inside Studio OS.

## Discovery experience

- Guided **business consultation** — not a form or interview.
- **Conversational follow-ups** when answers are brief.
- **Auto-save** — complete across multiple sessions.
- **Industry-adaptive** prompts (skip/only-for-industry rules).
- **Living discovery** — never finishes; Command Dock responds to "I forgot to mention…"

## Nine chapters

| # | Chapter | Captures |
|---|---------|----------|
| 1 | Organization Identity | Name, industry, mission, vision, services, customers, UVP, goals |
| 2 | Founder Brain | Daily rhythm, stress, knowledge only founder holds |
| 3 | Services | Per-service deep dives (purpose, workflow, compliance, mistakes…) |
| 4 | Decision Intelligence | How decisions are made, unwritten rules, judgment |
| 5 | Knowledge & Wisdom | Lessons, stories, advice, what never to outsource |
| 6 | Resources | Document uploads and reference material |
| 7 | People | Departments, roles, vendors, hiring |
| 8 | Customers | Journey, FAQ, pain points, support workflow |
| 9 | Growth | Expansion, automation, hiring, vision |

## Code layout

```
src/studio-os-core/business-discovery-blueprint/
  constants.ts              — philosophy, output categories, living prompt
  types.ts                  — blueprint profile, chapters, responses, outputs
  chapters.ts               — chapter definitions + discovery prompts
  conversational-engine.ts  — follow-ups, industry adaptation, living phrases
  progress.ts               — chapter + overall progress, next chapter recommendation
  outputs-generator.ts      — auto-generate HQ, Mission Control, SOPs, KPIs, etc.
  store.ts                  — per-org localStorage, auto-save responses
  bootstrap.ts              — platform seed for known orgs
  dock-advisor.ts           — Command Dock living discovery + proactive suggestions
  index.ts
```

## UI

- **`BusinessDiscoveryBlueprintWorkspace.tsx`** — tabs: Guided Consultation, Chapters, Generated Outputs, Living Discovery
- **`useBusinessDiscoveryBlueprintState.ts`** — org-scoped hook with auto-save
- **`/admin/studio/business-discovery-blueprint`**

## Integration points

- **`organization-context/boundary-sync.ts`** — `ensureOrganizationDiscoveryBlueprint()` on org switch
- **`industry-architecture`** — sync industry id into blueprint profile
- **`command-dock/store.ts`** — `resolveLivingDiscoveryAdvice()` + proactive discovery when progress &lt; 50%
- **`command-dock/context.ts`** — Blueprint route context + Mission Control discovery suggestions
- **`workspaces/index.ts`** — platform bootstrap
- **`company-onboarding-intelligence`** — complementary welcome journey; Blueprint is the permanent organizational memory layer (M90)

## Generated outputs

Completing chapters automatically generates foundations for:

Headquarters · Mission Control · Department Packs · Profession Brain · Digital Concierge · Command Dock context · Knowledge Base · SOPs · Employee Handbook · Automation · Organization Intelligence · KPIs · Workflow Maps · Compliance · Training Academy · Design · Future Expansion

## Language conventions

| Avoid | Use instead |
|-------|-------------|
| Setup wizard / onboarding form | Business Discovery Blueprint · organizational archaeology |
| Configure software | Teach Studio OS how your business works |
| Finish onboarding | Foundational discovery · living organizational memory |

## Demo behavior

All discovery data is **localStorage demo** — responses persist per organization and regenerate outputs on every save. Resource uploads record metadata only (no file storage wired in M90).
