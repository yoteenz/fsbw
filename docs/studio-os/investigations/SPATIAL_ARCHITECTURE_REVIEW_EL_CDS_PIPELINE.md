# SPATIAL ARCHITECTURE REVIEW — Experience Lab → Creative Director Studio Manufacturing Pipeline

**Status:** APPROVED WITH MITIGATIONS  
**Reviewed against:** `STUDIO_OS_BIBLE/SPATIAL_ARCHITECTURE_REVIEW.md` v1.0.0  
**Date:** 2026-07-13  
**Sprint:** P0 — Experience Lab → Creative Director Studio Manufacturing Pipeline

---

## Automatic review answers

1. **Where does this live?** Studio World Headquarters — **Experience Lab** (Architect wing, Mode 2) hands off to **Creative Direction Studio** (Manufacturing & Art Direction floor, immersive room at `/admin/studio/department/creative-direction`).
2. **Department owner?** **Experience Lab** (World Architect) → **Creative Direction Studio** (Manufacturing & Art Direction). Executive: Founder as Creative Director visiting approved rooms.
3. **Who interacts?** **Founder** (approve room, select assets, version, compare). **Genesis** coordinates handoff and observes manufacturing state. **Employees/agents** — factory workers per asset node. **Guests/clients** — not in this sprint.
4. **Physical place?** Experience Lab = architectural review gallery with Founder Render hero. CDS = **the approved room itself** as production workspace — Story Table, Review Chamber, selectable assets on the floor.
5. **Reinforces immersion?** **Yes** — separates *designing a world* from *manufacturing inside an approved world*. Founder enters a room that already exists; does not summon another concept generator.
6. **Makes World feel larger?** **Yes** — two departments with distinct jobs expand organizational believability vs duplicate room invention.
7. **Sensible without traditional UI?** **Yes** — events: *approve blueprint*, *enter approved room*, *touch desk*, *version landmark*, *watch room update*.
8. **Creates a dashboard?** **No** — CDS remains spatial room; Asset Registry is warehouse infrastructure, not primary surface. **Mitigation:** guard against asset inspector becoming a generic form grid — keep spatial selection first.
9. **Existing department instead?** **No new department** — redefines responsibilities within existing Experience Lab + Creative Direction Studio. Legacy `/admin/studio/creative-director` decision engine remains separate (deprecate overlap later).
10. **User experience?** Founder **designs and approves one canonical room** in Experience Lab, then **enters that same room** in CDS to improve individual assets without re-inventing the space.

---

## Genesis review

- **Why Genesis knows:** Organizational handoff between Architect and Manufacturing; tracks approval, asset versions, and room lock state.
- **Role:** **Coordinate** handoff · **Observe** manufacturing progress · **Present** room-ready status in briefing.
- **Rationale:** Genesis schedules the transition from “room approved” to “asset manufacturing open” — not a chat surface.

---

## World review

- **Classification:** **Belongs inside existing places** — Experience Lab + Creative Direction Studio rooms; no new building.
- **World Graph impact:** Register handoff edge `experience-lab` → `creative-direction-studio` with `approved-founder-render` artifact. Register manufacturing graph nodes per Construction Plan socket.

---

## Design review output

| Field | Value |
|-------|-------|
| Spatial Placement | HQ · Experience Lab (design) → Creative Direction Studio immersive room (manufacture) |
| Department Owner | Experience Lab (Architect) · Creative Direction Studio (Manufacturing) |
| Genesis Relationship | Coordinate handoff · Observe versions · Present readiness |
| Founder Journey | Arrive EL → request blueprint → Founder Render → approve → walk to CDS → enter approved room → select asset → version → approve → room updates |
| Physical Environment | EL: photoreal hero + collapsed blueprint. CDS: approved render as room shell; assets as touchable production objects |
| Expected Emotional Response | Confidence that one room is canonical; intentional art direction (“improve THIS desk”) not roulette |
| Architecture Risks | Parallel Scene Stack shell gen bypassing handoff · mock Construction Mode confusion · legacy Creative Director page naming collision |

---

## Design score

| Dimension | Score (1–5) |
|-----------|-------------|
| Spatial Integrity | 4.5 |
| Immersion | 4.5 |
| Department Clarity | 4.5 |
| Genesis Integration | 4.0 |
| Emotional Presence | 4.5 |
| Architectural Consistency | 4.0 |
| Future Expandability | 4.5 |

**Overall World Score:** **4.3** — Approved for phased implementation.

---

## Mitigations (required)

| Risk | Mitigation |
|------|------------|
| CDS `ensureStation` invents rooms | Gate on `ApprovedFounderRenderHandoff`; seed shell from `previewArtifactUrl` |
| EL mock manufacturing unlocks World Compiler early | Unlock CDS path on Founder approval, not mock worker completion |
| Duplicate generation products | Founder Render = master reference; Scene Stack layers manufacture components only |
| Asset inspector dashboard drift | Asset panel opens from spatial selection; room preview always visible |

---

## Implementation phases (P0 → P1)

| Phase | Deliverable |
|-------|-------------|
| **P0-A** | Canon + handoff contract + manufacturing graph (this sprint foundation) |
| **P0-B** | Persist handoff on approve; Asset Registry `founder-shell-reference` row |
| **P0-C** | CDS `ensureStation` gate + shell seed from approved render |
| **P1** | Per-asset production workspace (reference crop, versions, compare) |
| **P1** | Live room re-composite from approved asset versions |
| **P2** | Replace mock Construction Mode workers with governed manufacturing |

---

## Red flags checked

- Generic dashboard — **not triggered** (room-first CDS)
- Orphan page — **not triggered** (existing department routes)
- Feature-first nav — **not triggered** (pipeline is departmental)
- Duplicate departments — **mitigated** by role split, not duplication

**Verdict:** Proceed with phased implementation per `docs/studio-os/production/EXPERIENCE_LAB_CDS_MANUFACTURING_PIPELINE.md`.
