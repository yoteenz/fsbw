# Executive Information Architecture (M83 V1.0)

Studio OS is **Executive Headquarters**, not an admin dashboard. Milestone 83 establishes the permanent design language for how information is organized, prioritized, and experienced across every current and future module.

**Visual identity is unchanged** — marble, white HQ aesthetic, black borders, red accents, handwritten annotations, Command Dock, luxury executive feel. Only **information architecture** changes.

## Core philosophy

- Every screen answers **one primary executive question**
- Everything else **quietly supports** that answer
- Founders should feel **guided**, not overwhelmed
- Scrolling should feel like **walking through Headquarters**
- **Content production:** [Studio Production Engine™](../studio-production-engine.md) extends this to the Production Wing — one department workspace at a time, not one long scrolling production page

## Page hierarchy (mandatory rhythm)

```
Header
  ↓
Hero (exactly one per screen)
  ↓
Department Cards
  ↓
Visual Summary (graphics before text)
  ↓
Primary Focus Area (exactly one)
  ↓
Supporting Sections
  ↓
Detailed Data (collapsible)
  ↓
History / Logs (collapsed by default)
```

Never expose every layer simultaneously.

## Reusable components

Location: `src/components/admin/studio/executive-ia/`

| Component | Purpose |
|-----------|---------|
| `ExecutivePageShell` | Vertical rhythm wrapper + M83 animations |
| `ExecutiveHeroCard` | Single visual anchor per page |
| `ExecutiveDepartmentCard` / `ExecutiveDepartmentCards` | Destination cards — icon, name, description, status, health ring |
| `ExecutiveModuleSummary` | "23 Modules Installed → Open Department" |
| `ExecutiveVisualSummary` | Wrapper for graphics-first summaries |
| `ExecutiveFocusPanel` | One primary working area |
| `ExecutiveSecondaryGrid` | Grouped supporting cards |
| `ExecutiveCollapsibleSection` | Progressive disclosure for heavy data |
| `ExecutiveHealthRing` | Organization/department health |
| `ExecutivePipelineViz` | Production pipeline state |
| `ExecutiveTrendSparkline` | Revenue/metric trends |
| `ExecutiveWorkspaceZone` | Animated wing beneath department selection |
| `useExecutiveDepartment` | Department selection transforms workspace |

## Department iconography

Canonical icons in `executiveIaDepartments.ts` — every department wing uses consistent landmarks.

## Reference implementations

- **Mission Control** — `/admin/studio/mission-control`
- **Distribution Network** — `/admin/studio/distribution-network`
- **Studio Overview** — `/admin/studio/overview`

## Rules for new modules

1. **One hero** — never multiple competing hero panels
2. **Department cards** over text tabs
3. **Visual before text** — timeline, calendar, pipeline, health rings
4. **One focus panel** — one decision per screen
5. **Collapse** render queues, activity feeds, logs, history by default
6. **Whitespace** is part of the design — increase spacing, reduce unnecessary borders
7. **Command Dock** remains primary interaction — pages are the environment, not a competitor
8. **Microinteractions** communicate work (pipeline flow, wing enter) — not decoration

## Decision-driven design

Ask: *"What decision should the founder make next?"*

Not: *"How much information can we display?"*
