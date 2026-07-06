# Knowledge Commerce™ (Milestone 92.5)

Expands Expert Marketplace™ — helps organizations **monetize** expertise, not just discover it.

## Philosophy

- Not ecommerce — **expertise economy**.
- Organizations monetize experience · judgment · processes · frameworks · wisdom.
- One Profession Brain™ → multiple revenue streams from the same source of truth.
- Third brand promise: **MONETIZE KNOWLEDGE.** (extends Preserve Expertise · Build Legacy)

## Capabilities

| Area | Description |
|------|-------------|
| **Knowledge Product Builder** | Transform Brain portions into sellable products (checklists, toolkits, courses, SOPs, etc.) |
| **Publication controls** | private · internal · employees · managers · customers · members · subscribers · public · invite-only |
| **Licensing** | single purchase · subscriptions · enterprise · seat-based · white-label · partnership |
| **Commerce dashboard** | MRR · lifetime revenue · per-brain metrics · utilization · popular topics |
| **AI Expert Experiences** | Brain-powered experts — not generic AI |
| **Customer journey** | learn free → checklist → course → AI expert → membership → consultation → client |
| **Revenue intelligence** | profitable products · converting experiences · gaps · suggested offerings |
| **Knowledge assets** | version · owner · pricing · performance · revenue · reviews · dependencies |

## Architecture

```
src/studio-os-core/knowledge-commerce/
  constants.ts
  types.ts
  product-builder.ts
  ai-expert-experiences.ts
  commerce-dashboard.ts
  customer-journey.ts
  revenue-intelligence.ts
  store.ts
  dock-advisor.ts
  bootstrap.ts
  index.ts
```

## UI

**`/admin/studio/knowledge-commerce`** — tabs: Commerce Dashboard · Product Builder · Licensing · AI Experts · Customer Journey · Revenue Intel · Knowledge Assets · Opportunities

Hook: **`useKnowledgeCommerceState`**

## Integration

- **`profession-brain/store.ts`** — sync on upsert
- **`boundary-sync.ts`** — ensure org profile
- **`command-dock`** — `resolveKnowledgeCommerceAdvice()` · proactive monetization prompts
- Linked from **Expert Marketplace** page

## Command Dock examples

- "You've answered this question 47 times — turn it into a Knowledge Product?"
- "This workflow could become a customer course."
- "This checklist is frequently requested — publish to Expert Marketplace?"
