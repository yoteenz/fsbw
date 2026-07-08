# Assembly Verification™ — Story Table™ Benchmark

**Benchmark Module:** `studio.benchmark.story-table-hello-world.v1.assembly`  
**Status:** Scene Assembly™ proof requirements

---

## Purpose

Verify [Scene Assembly™](../engines/generation-pipeline/scene-assembly-stage.md) correctly composites twelve layered assets into one publishable Story Table™ workspace.

---

## Input Verification

Before assembly, confirm:

```yaml
PreAssemblyCheck:
  allLayersApproved: true
  artifactRefsPresent: 12
  noPendingGenerationJobs: true
  runtimeFxEligible: true    # visual layers approved
```

---

## Blend Verification

| blendOrder | Layer | Verification |
|------------|-------|--------------|
| 1 | Environment Shell™ | Shell establishes scale reference |
| 2 | Architecture™ | Structural pass · no shell overwrite |
| 3 | Furniture™ | Props on floor plane |
| 4 | Executive Strategy Table™ | Hero surface centered |
| 5 | Material Samples™ | Surface detail pass |
| 6 | Lighting™ | Adjustment pass — materials visible |
| 7 | Floating Studio Orb™ | Above table · correct elevation |
| 8 | Holographic Project Boards™ | On table plane · no HTML overlay |
| 9 | Atmosphere™ | Haze · depth |
| 10 | Particles™ | Ambient dust |
| 11 | Ambient Audio™ | Spatial audio manifest linked |
| 12 | Runtime FX™ | Cursor state · vignette |

---

## Isolation Verification

| Test | Pass |
|------|------|
| Lighting regen does not alter shell artifact hash | ✓ |
| Atmosphere does not redraw furniture geometry | ✓ |
| Particles do not include architecture pixels | ✓ |
| Holographic boards isolated from wall geometry | ✓ |

---

## Progressive Assembly Proof (Optional v1.1)

| Milestone | Visible state |
|-----------|---------------|
| Shell approved | Empty editorial volume |
| + Lighting | Lit volume |
| + Table + Orb | Furnished hero zone |
| + Holographic boards | Strategy surface active |
| Full stack | Complete Story Table™ |

---

## Output Artifact

```yaml
AssembledWorkspaceScene:
  assemblyId: uuid
  workspaceScene: story-table
  departmentId: creative-direction
  layerRefs:
    - { layerId: env-shell-story-table, artifactRef: artifact://..., registryId: registry:... }
    # ... 12 entries
  audioManifestRef: artifact://audio/story-table-ambient
  runtimeFxManifestRef: cursor://runtime-fx/story-table
  compositorVersion: scene-stack.v1
  status: assembled
```

---

## Department Runtime™ Handoff

```yaml
RuntimeHandoff:
  assembledSceneId: uuid
  packageId: pkg-creative-direction-golden-v1
  workspaceScene: story-table
  readyForWalk: true
```

Runtime loads Registry refs — not raw file paths from prototype.

---

## Fail Conditions

| Failure | Recovery |
|---------|----------|
| Missing artifact ref | Re-queue layer |
| Blend order violation | Reassemble from checkpoint |
| Orb elevation wrong | Regenerate orb layer only |
| Holographic bleed | Regenerate boards layer |

---

_Assembly Verification — twelve layers, one room, compositor truth._
