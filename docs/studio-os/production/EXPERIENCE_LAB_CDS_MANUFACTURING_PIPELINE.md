# Experience Lab → Creative Director Studio Manufacturing Pipeline

**Status:** Canonical P0 sprint — permanent Studio OS production pipeline  
**Spatial review:** `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_EL_CDS_PIPELINE.md` (Approved 4.3)  
**Contract:** `src/studio-os-core/production-pipeline/`

---

## Objective

Redefine department responsibilities so **Experience Lab never manufactures production assets** and **Creative Director Studio never invents a room from scratch**.

| Department | Role |
|------------|------|
| **Experience Lab** | World Architect — intent, layout, blueprint, Founder Render, founder approval |
| **Creative Director Studio** | Manufacturing & Art Direction — load approved room; manufacture, version, and approve individual assets |

The **approved Founder Render** is the master reference for every downstream system.

---

## Production pipeline (canonical order)

```
Founder Idea
    ↓
Experience Lab
    ↓
Blueprint Author™
    ↓
Construction Plan
    ↓
Founder Render™
    ↓
Founder Approval  ← room locked for architecture
    ↓
Creative Director Studio™
    ↓
Asset Manufacturing (per selected asset only)
    ↓
Asset Registry™
    ↓
Construction Mode™
    ↓
Scene Stack™
    ↓
Living Experience™
```

---

## Experience Lab responsibility (Architect only)

Experience Lab is responsible **only** for:

- Interpreting founder intent
- Architecture, world layout, room composition
- Lighting concept, materials concept, environmental storytelling, atmosphere
- Camera composition, navigation
- Blueprint generation
- Founder Render generation

Experience Lab **never** manufactures production assets. Once the founder approves the room, **Experience Lab is complete**.

**Code paths:** `BlueprintAuthorExperienceLabGate`, `useBlueprintAuthorWorkflow`, Founder Render APIs.

---

## Creative Director Studio responsibility (Manufacturing)

Creative Director Studio **never** creates a room from scratch. It loads:

- Approved Founder Render (`previewArtifactUrl`)
- Blueprint revision
- Construction Plan
- Brand assets, material library, lighting profile, camera metadata
- Socket map, room metadata

The room shown inside CDS **must** be the approved Founder Render from Experience Lab. The room is a **production workspace**, not a concept workspace.

**Code paths (target):** `CreativeDirectionStudioRoom`, `useSceneStack` — gated by `ApprovedFounderRenderHandoff`.

---

## Room decomposition

When CDS opens, analyze the approved Founder Render + Construction Plan and build a **manufacturing graph** (`buildRoomManufacturingGraph`).

Example — Reception:

```
Reception
├── Reception Desk
├── Founder Landmark
├── Floor
├── Ceiling
├── Left Wall
├── Right Wall
├── Glass Panels
├── Furniture
├── Coffee Table
├── Decorative Objects
├── Display Wall
├── Lighting
├── Reflection Layer
└── Atmosphere Layer
```

Each node is selectable, versioned, and regenerates **independently**.

---

## Visiting the room

When the founder enters CDS, they are **not** entering another concept generator. They enter the **approved room**. Every asset is selectable, isolatable, replaceable, and versioned. The room updates live after asset approvals.

---

## Asset workflow

Selecting an asset opens its production workspace:

| Field | Source |
|-------|--------|
| Reference image | Auto-cropped from approved Founder Render |
| Blueprint metadata | Construction Plan socket + asset ref |
| Material library | Plan `materialSet` |
| Prompt / negative prompt | Asset-specific manufacturing intent |
| Brand constraints | Brand vault for org |
| Model | Governed route per asset class |
| Versions | v1, v2, v3… with approve / reject / compare / history |

**Only that asset regenerates.** The room re-composites using the approved version. Nothing else regenerates.

---

## Asset generation inputs

Every asset generator receives:

```
Approved Founder Render
+ Blueprint
+ Room metadata
+ Brand assets
+ Socket position
+ Camera metadata
+ Lighting metadata
+ Material library
```

AI manufactures a **specific component inside an approved room** — it does not invent context.

---

## Live room preview

CDS always displays:

**Current approved Founder Render** + **approved production assets composited into the room.**

As assets evolve, the room evolves. The founder always sees the latest production state.

---

## Version control

Each asset maintains its own history (e.g. ReceptionDesk v4 approved, FounderLandmark v2 approved). The room retains full lineage.

---

## Approval pipeline

```
Experience Lab Approval
    ↓
Room locked (architecture)
    ↓
Creative Director Studio opens (handoff required)
    ↓
Asset selected
    ↓
Asset generated
    ↓
Asset reviewed
    ↓
Asset approved
    ↓
Asset Registry updated
    ↓
Room re-composited
    ↓
Construction Mode
```

No asset may bypass approval.

---

## Handoff contract

```typescript
// src/studio-os-core/production-pipeline/approved-founder-render-handoff.ts
ApprovedFounderRenderHandoff {
  handoffVersion: 'approved-founder-render-handoff.v1'
  source: 'experience-lab' | 'creative-director'
  organizationId, projectId, stationId, roomId
  constructionPlanId, blueprintId, blueprintRevision
  founderRenderJobId, previewArtifactUrl
  approvedAt, approvedBy
  materialSetId, lightingProfileId, cameraProfileLabel
  approvalRecord: FounderRenderApprovalRecord
}
```

`validateApprovedFounderRenderHandoff` gates CDS manufacturing. Stale blueprint revision returns `HANDOFF_STALE`.

---

## Success criteria

- [ ] Experience Lab owns ideation and architectural design only
- [ ] Founder approves one canonical room before production begins
- [ ] CDS always opens the approved room — not a blank generator
- [ ] Every production asset inherits the approved room as reference
- [ ] Only selected assets regenerate
- [ ] Asset approvals immediately update room preview
- [ ] Asset Registry is manufacturing source of truth
- [ ] Construction Mode assembles from approved assets only

---

## Current gaps (Documented Fact)

| Gap | Phase |
|-----|-------|
| No EL→CDS handoff persistence on approve | P0-B |
| CDS `ensureStation` generates rooms without handoff | P0-C |
| Construction Mode manufacturing is mock | P2 |
| EL World Compiler unlocks after mock manufacturing, not Founder approval | P0-C |
| Asset Registry has no `founder-shell-reference` category | P0-B |

---

## Cross-references

- Founder Render: `docs/studio-os/blueprint-author/FOUNDER_RENDER.md`
- Experience Lab preview: `docs/studio-os/experience-lab/FOUNDER_PREVIEW_WORKFLOW.md`
- Creative Production Pipeline (department stages): `docs/studio-os/production/creative-production-pipeline.md`
- Director Mode manufacturing order: `docs/studio-os/director-mode/MANUFACTURING_PIPELINE.md`
- Spatial review artifact: `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_EL_CDS_PIPELINE.md`
