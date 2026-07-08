# Scene Generation Pipeline™

**Module:** `studio.creative-intelligence-engine.v1.scene-generation`  
**Status:** CDS proving ground for generated worlds

---

## Principle

> Creative Direction Studio™ becomes the **proving ground** for the new Scene Generation Pipeline.

Instead of manually designing scenes — Studio OS **generates** them through internal architecture.

---

## Generated Layer Systems

Studio OS eventually generates per workspace:

| Layer / System | Scene Stack™ mapping |
|----------------|------------------------|
| **Environment Shell™** | `environment-shell` |
| **Lighting System™** | `lighting-systems` |
| **Architectural Language™** | `environment-shell` + materials |
| **Furniture System™** | `furniture` |
| **Atmosphere™** | `atmospheric` |
| **Hero Landmark™** | `signature-landmark` |
| **Materials™** | `surface-materials` |
| **Particles™** | `atmospheric` (particle pass) |
| **Runtime FX™** | `runtime-effects` (Cursor) |
| **Interaction Layer™** | `interaction-layer` (Cursor) |

Every scene assembled from **reusable systems** — not one flat image.

Full layer law: [Scene Stack™](../scene-stack/README.md) · [asset-first-layers.md](./asset-first-layers.md).

---

## Per-Workspace Generation

```yaml
WorkspaceSceneGeneration:
  workspaceId: string               # story-table | mood-wall | etc.
  departmentId: creative-direction
  blueprintId: editorial-luxury-v1
  layers:
    - layerId: environment-shell
      status: pending | generating | approved | golden
      generationJobId: string | null
    - layerId: signature-landmark
      ...
  assemblyStatus: incomplete | compositing | ready
  goldenBuildContribution: number   # % toward department Golden Build™
```

---

## Generation Order (CDS Pilot)

Aligns with [Asset Intelligence generation-order](../asset-intelligence-engine/generation-order.md):

```
1. Environment Shell™
2. Signature Landmark™ (Story Table™ in story-table scene)
3. Lighting Systems™
4. Surface Materials™
5. Furniture™
6. Atmospheric™
7. Ambient Motion™
8. Founder Personalization™
── Cursor layers after FAL approval ──
9. Interaction Layer™
10. Runtime Effects™
```

---

## Pipeline Integration

```
Scene Planner™ (Scene Blueprint™ — plan only)
         ↓
Production Estimate™ (founder approve)
         ↓
Prompt Composer™ (per GenerationLineItem)
         ↓
Provider Optimizer™
         ↓
Generation Manager™ (per-layer jobs)
         ↓
Quality Inspector™ (per-layer)
         ↓
Approval Queue™ (per-layer or batch)
         ↓
Scene Stack compositor (SceneAssembly™)
         ↓
Workspace scene ready
```

Full spec: [Scene Planner™](../engines/scene-planner/README.md).

---

## Regeneration

Dislike lighting in Mood Wall™?

Regenerate **`lighting-systems` layer only** — Environment Shell™ intact.

See [Scene Stack regeneration](../scene-stack/regeneration-system.md).

---

## CDS Benchmark Role

| Milestone | Meaning |
|-----------|---------|
| First fully generated workspace scene | Engine proof |
| All six CDS scenes layered | Department benchmark |
| Golden Build™ on generated stack | Flagship department |
| Package export | Template for all future departments |

**Goal this sprint:** architecture — not final visuals.

---

## Anti-Pattern

| Anti-Pattern | Why |
|--------------|-----|
| Single hero image per room | Retired Scene Genesis™ path |
| Manual Photoshop comp | Not scalable |
| Generate full room one prompt | Violates layer isolation |
| Skip approval per layer | No informed consent |

---

_Scene Generation Pipeline™ — generate rooms like a studio lot, not like a webpage._
