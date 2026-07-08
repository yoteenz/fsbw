# Canonical Asset Record™

**Engine Module:** `studio.asset-registry.v1.canonical-record`  
**Status:** Every asset field — engine contract

---

## Purpose

Every asset in Studio OS receives a **canonical record** — the minimum metadata required for remember-first reuse, Scene Stack™ assembly, and long-term creative capital tracking.

Maps to full [Registry Item schema](./asset-schema.md) — this document is the **founder/engine field contract** for generated creative assets.

---

## Canonical Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **UUID** | `uuid` | ✓ | Globally unique asset identifier (`assetId`) |
| **Name** | `string` | ✓ | Human display name |
| **Category** | `AssetCategory` | ✓ | Primary taxonomy — see [scene-stack-categories.md](./scene-stack-categories.md) |
| **Department** | `departmentId` | ✓ | Origin department (e.g. `creative-direction`) |
| **Workspace** | `workspaceSceneId` | ✓ | Workspace scene (e.g. `story-table` · `mood-wall`) |
| **Scene** | `sceneId` | ○ | Scene within department topology |
| **Generation Pack** | `generationPackId` | ○ | Batch/pack that produced asset |
| **Tags** | `string[]` | ✓ | Search · filter tags |
| **Materials** | `string[]` | ○ | Material DNA (bronze · marble · glass · …) |
| **Lighting Profile** | `string` | ○ | Rig type · mood · temperature |
| **Camera Profile** | `string` | ○ | Angle · rig · inspect preset |
| **Resolution** | `string` | ○ | Output dimensions (e.g. `1536x2048`) |
| **Aspect Ratio** | `string` | ○ | e.g. `3:4` · `16:9` · `21:9` |
| **Generation Cost** | `number` | ✓ | Abstract production $ (founder) + internal GPU ref |
| **Generation Model** | `string` | internal | Provider model route — **never founder-facing** |
| **Prompt Version** | `string` | ✓ | Prompt Composer™ version hash |
| **Blueprint Version** | `string` | ○ | Active Creative Blueprint™ version |
| **Created By** | `creatorRef` | ✓ | founder · pipeline · studio-alpha |
| **Date** | `ISO8601` | ✓ | `createdAt` |
| **Usage Count** | `number` | ✓ | Times reused without full regeneration |
| **Marketplace Eligible** | `boolean` | ✓ | May publish when approved |
| **Favorite** | `boolean` | ○ | Founder pinned |
| **Archived** | `boolean` | ○ | Soft retire — history preserved |

---

## Registry Item Mapping

```yaml
CanonicalAssetRecord:
  uuid: identity.assetId                    # UUID v4
  name: identity.name
  category: identity.category
  department: context.departmentId
  workspace: context.workspaceSceneId
  scene: context.sceneId
  generationPack: provenance.generationPackId
  tags: tags[]
  materials: visual.materials[]
  lightingProfile: visual.lightingProfile
  cameraProfile: visual.cameraProfile
  resolution: generation.resolution
  aspectRatio: generation.aspectRatio
  generationCost: usageHistory.originalGenerationCost
  generationModel: generation.modelRoute      # internal plane only
  promptVersion: prompt.versionHash
  blueprintVersion: provenance.blueprintVersion
  createdBy: identity.creator
  date: provenance.createdAt
  usageCount: usageHistory.reuseCount
  marketplaceEligible: licensing.marketplaceEligible
  favorite: founder.favorite
  archived: status.archived
```

---

## Example Record

```yaml
uuid: "a7f3c2e1-8b4d-4e9a-9c1f-2d8e6a4b5c3d"
name: "Editorial Luxury Lighting — Story Table"
category: lighting
department: creative-direction
workspace: story-table
scene: story-table-main
generationPack: cds-story-table-bootstrap-v1
tags: [editorial, luxury, rim-light, story-table]
materials: []
lightingProfile: editorial-rim-warm
cameraProfile: orbit-story-table-v1
resolution: "1536x2048"
aspectRatio: "3:4"
generationCost: 0.42
generationModel: "fal-ai/nano-banana-pro/edit"    # internal only
promptVersion: "prompt-composer/2026-07-08/abc123"
blueprintVersion: "editorial-luxury-blueprint/2.1.0"
createdBy: { type: pipeline, id: creative-intelligence-engine }
date: "2026-07-08T12:00:00Z"
usageCount: 436
marketplaceEligible: true
favorite: true
archived: false
```

---

## Registration Completeness Gate

Asset cannot enter **approved** reuse pool until:

- All ✓ required fields populated
- Artifact `primary` ref attached
- `blueprintVersion` set when blueprint-scoped
- `department` + `workspace` set for scene assets

Incomplete records remain `draft` — not reuse candidates.

---

## Founder vs Internal Planes

| Field | Founder sees | Internal sees |
|-------|--------------|---------------|
| Generation Cost | Abstract production $ | GPU invoice |
| Generation Model | "Production pipeline" | Model slug |
| Prompt Version | Hidden | Full hash |
| Usage Count | Yes | Yes |

See [Creative Intelligence forbidden exposure](../../creative-intelligence-engine/prompt-generation-architecture.md).

---

_Canonical Asset Record™ — every asset speaks the same language._
