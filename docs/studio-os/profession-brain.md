# Profession Brain™ (Milestone 91)

Living institutional intelligence for Studio OS — not an AI chatbot. Preserves expertise, reasoning, and professional judgment across generations.

## Core philosophy

- Businesses are built on **knowledge** — processes, wisdom, and judgment.
- The Profession Brain should **think like the founder** — not repeat instructions.
- Every organization owns **unique** Profession Brains (Fuel Tax, Hair Color, Dispatch, Marketing, etc.).
- Knowledge never dies with one person.

## What it stores

Professional expertise · decision logic · business rules · regulations · best practices · mistakes · exceptions · lessons · judgment · founder intuition · policies · stories · templates · compliance · shortcuts · philosophy.

Captures **WHAT** and **WHY**.

## Architecture

```
src/studio-os-core/profession-brain/
  constants.ts
  types.ts
  brain-catalog.ts          — Fuel Tax, Permit, Bookkeeping, Hair Color, etc.
  knowledge-seeds.ts          — seed from Blueprint + Inauguration + services
  memory-graph.ts             — connected organizational memory
  decision-intelligence.ts    — judgment patterns, not only procedures
  human-knowledge.ts          — onboarding, FAQs, checklists, decision trees
  academy-bridge.ts           — Studio Institute foundation
  customer-experience.ts      — optional public expert surfaces
  knowledge-ownership.ts      — export, backup, version, transfer
  legacy-mode.ts              — generational preservation
  living-knowledge.ts         — "We changed this" updates
  concierge-bridge.ts         — concierges reference Brain, never invent policy
  dock-advisor.ts             — "Prepare John's quarterly filing" routing
  store.ts
  bootstrap.ts
  index.ts
```

## UI

**`/admin/studio/profession-brain`** — tabs: Overview · Profession Brains · Memory Graph · Decision Intelligence · Human Knowledge · Academy Foundation · Customer Experience · Knowledge Ownership · Legacy Mode

## Integration

- **`business-discovery-blueprint/store.ts`** — syncs Profession Brain when Blueprint completes.
- **`organization-inauguration`** — Charter seeds policy knowledge.
- **`command-dock/store.ts`** — `resolveProfessionBrainAdvice()` before Blueprint living updates for domain commands.
- **`command-dock/context.ts`** — Profession Brain route + Mission Control suggestions.
- **`monetization-architecture`** — concierge catalog bindings via `concierge-bridge.ts`.

## Living knowledge

Phrases like "We changed this" / "This regulation changed" trigger **Would you like to update the Profession Brain?** — every correction strengthens intelligence.

## Knowledge ownership

Organizations can export JSON snapshots (demo: clipboard). Studio OS hosts; organization owns. Protected operational knowledge stays private; public surfaces are opt-in.

## Legacy mode

Profession Brain preserves knowledge for future owners, employees, family, and leadership — institutional memory that compounds every year.
