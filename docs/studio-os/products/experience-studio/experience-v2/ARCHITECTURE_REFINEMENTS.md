# Architecture Refinements — Experience Studio™ 2.0

**Version:** 2.0.0  
**Parent:** [Experience v2 Package](./README.md)

---

> Experience design surfaces where **frozen architecture** must evolve to support the intended experience.  
> These are **recommendations** — not implemented changes. Each requires appropriate governance gate (DR · CA · VDR).

---

## Summary

| Priority | Count | Gate |
|----------|-------|------|
| P0 — Blocks v2.0 experience | 4 | DR required |
| P1 — Degrades experience quality | 5 | DR or VDR |
| P2 — Enhances experience | 4 | VDR or product spec |

---

## P0 — Experience Blockers

### AR-001 — Project™ as First-Class HQ Entity

**Gap:** Project exists in System Registry (`es-project`) but is not a first-class **spatial object** on HQ campus with timeline · memory · department position.

**Experience need:** Project dashboard · campus map dot · department handoff · AI Memory per project.

**Recommendation:**
```yaml
projectModel:
  elevate:
    - campusPresence: map dot · wing light
    - timeline: act structure overlay
    - departmentPosition: current · history
    - aiMemory: per-project scope
    - founderNotes: pinned entity
  registry: es-project (extend schema)
```

**Gate:** DR · M131 amendment

---

### AR-002 — Unified HQ Travel Service

**Gap:** Routing is per-product (`/admin/studio/*`) — no unified **travel** abstraction for wing → department → project transitions.

**Experience need:** Orb "Take me to Production" · ceremonial transitions · breadcrumb travel · corridor motion.

**Recommendation:**
```yaml
travelService:
  destinations: [wing, department, project, marketplace]
  transitions: ceremonial | corridor | crossfade
  context: preserve Project passport on travel
  api: travel.to('production-department', { projectId })
```

**Gate:** DR · new module or Experience Engine extension (M141)

---

### AR-003 — HQ Campus Spatial Model

**Gap:** `experience-architecture.yaml` defines wings — no persistent **campus map model** for evolution · Marketplace · project dots.

**Experience need:** Headquarters Evolution (Part 8) · Marketplace ghost buildings · maturity tiers.

**Recommendation:**
```yaml
campusModel:
  buildings: [wing, expansion, ghost]
  lights: activity | locked | active
  evolution: tier triggers visual delta
  persistence: org-scoped
```

**Gate:** DR · Living Headquarters extension (M82.5)

---

### AR-004 — Inspiration Ingestion Pipeline

**Gap:** No canonical pipeline for Reel URL · mood board · reference ingestion into Production Package.

**Experience need:** Creative Direction Studio inspiration wall · drop Reel · extract mood.

**Recommendation:**
```yaml
inspirationPipeline:
  inputs: [reel-url, image, voice, pinterest]
  outputs: [palette, rhythm, mood-chips, brief-seed]
  storage: project-scoped · content block tier
```

**Gate:** DR + content block registry · VDR for inspiration UI components

---

## P1 — Experience Quality

### AR-005 — Creative Branch Graph

**Gap:** Version history is linear — Creative Direction needs **branch · merge** for mood boards and directions.

**Experience need:** "Explore direction B" without destroying main.

**Recommendation:** Version graph on Project creative direction — branch nodes · merge proposals.

**Gate:** DR

---

### AR-006 — Concierge Identity System

**Gap:** Concierge layer exists — no **named personality constraints** per wing for consistent experience.

**Experience need:** Creative Concierge greets · Chief Concierge orients · Production Concierge coaches exit.

**Recommendation:** Concierge persona spec — tone bounds · intro lines · not uncanny.

**Gate:** Content spec · CA for tone bounds

---

### AR-007 — Quiet Achievement Layer

**Gap:** No progression system — Xbox-inspired mastery requires **quiet achievement** without gamification module.

**Experience need:** Legacy Wing plaques · tier visibility · unlock previews.

**Recommendation:**
```yaml
achievementLayer:
  storage: legacy-wing plaques
  triggers: [first-publish, tier-up, expansion]
  notification: single-line toast · optional
  anti: [points, badges, leaderboards, confetti]
```

**Gate:** Philosophy CA · DR for Legacy Wing data model

---

### AR-008 — Cross-Wing Onboarding State Machine

**Gap:** Company Onboarding Intelligence™ · Arrival · Awakening documented separately — no **unified state machine** for v2.0 journey.

**Experience need:** First login → HQ generation → first Project in one coherent flow.

**Recommendation:** `onboarding-journey.yaml` — states · skip rules · returning user compression.

**Gate:** DR · documentation merge

---

### AR-009 — Marketplace Expansion Install Model

**Gap:** Marketplace products on roadmap — no **install affects campus** architecture.

**Experience need:** Building materializes · department unlocks · concierge joins.

**Recommendation:** Expansion manifest schema — buildings · departments · concierges · tier requirement.

**Gate:** DR · Creator Marketplace product spec

---

## P2 — Enhancements

### AR-010 — Motion Token Registry

**Gap:** VDR-301 proposed in v1 prototype — not in design registry.

**Experience need:** Corridor · campus · ghost motion tokens.

**Gate:** VDR-301

---

### AR-011 — Project Status Language Map

**Gap:** Internal states exposed to users — need canonical **human language** mapping layer.

**Gate:** Product spec patch

---

### AR-012 — Emotional Computing Context Hooks

**Gap:** Emotional Computing™ defined — not wired to Orb suggestion frequency · ceremony intensity.

**Experience need:** Reduce suggestions under stress · respect grief contexts.

**Gate:** DR · M89.5 integration spec

---

### AR-013 — Accessibility Standard Document

**Gap:** `ACCESSIBILITY_STANDARD.md` missing from design/ — blocks glass combo audit.

**Gate:** Design Governance addition · not VDR

---

## Architecture That Should NOT Change

| System | Reason |
|--------|--------|
| Studio Constitution™ | Volume 0 frozen |
| Design Governance component catalog | Inheritance model |
| Master Content Pipeline 10 gates | Production Engine aligned |
| Experience Studio v1 canvas behavior | Creative Wing spec remains |
| DNA stack definitions | M84 · M85 · M76.5 frozen |

---

## Filing Plan

| Order | Refinement | When |
|-------|------------|------|
| 1 | AR-001 Project entity | Before v2.0 engineering |
| 2 | AR-002 Travel service | Before Orb navigation engineering |
| 3 | AR-003 Campus model | Before Marketplace · Evolution |
| 4 | AR-004 Inspiration pipeline | Before Creative Direction Studio |
| 5 | AR-005–009 | Phase 2 |
| 6 | AR-010–013 | Parallel design governance |

---

## Cross-References

| Document | Path |
|----------|------|
| v1.0 Readiness gaps | `../IMPLEMENTATION_READINESS_REPORT.md` |
| Experience Architecture | `../../../master-spec/experience-architecture.yaml` |
| DR Framework | `../../../design/DESIGN_REVISION_FRAMEWORK.md` |

---

*Architecture Refinements — experience reveals what architecture must become.*
