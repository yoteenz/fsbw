# Generation Pipeline — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.generation-pipeline`  
**Status:** Ordered 12-stage manufacturing pipeline

---

## Principle

The compiler **automatically creates generation stages**. Dependencies respected. No asset generated before its prerequisites are queued.

Providers execute stages **sequentially** (parallel within stage allowed when no intra-stage edges).

---

## Stage Definitions

| Stage | ID | Folder | Contents | Gate |
|-------|-----|--------|----------|------|
| **01** | `environment` | `01_environment/` | Floor shader · atmosphere · exterior plate specs | None |
| **02** | `architecture` | `02_architecture/` | Shell · walls · ceiling · alcove · portals | 01 complete |
| **03** | `lighting` | `08_lighting/` | Three-point rig · accent metadata · IBL spec | 02 complete |
| **04** | `furniture` | `03_furniture/` | Timeline table · sandbox · library shelving | 01, 03 |
| **05** | `large-objects` | `04_objects/` | Mood wall · brief wall · observatory shell | 02, 03, 04 |
| **06** | `interactive-objects` | `04_objects/` | Orb · pedestals · approval · inspiration drop | 05 |
| **07** | `glass` | `05_glass/` | Table glass · panels · window glass surfaces | 04, 05 |
| **08** | `floating-ui` | `07_ui/` | Context panels · inspect overlays | 07 |
| **09** | `effects` | `09_vfx/` · `12_particles/` | Particles · haze · floor shimmer | 03, 05 |
| **10** | `animation-refs` | `10_animation/` | Arrival · ceremony · object motion metadata | 05, 06 |
| **11** | `audio-refs` | `11_audio/` | Ambient · ceremony · orb · SFX manifests | 06 |
| **12** | `final-validation` | `14_metadata/` | Quality Engine · Build Health · package seal | All 01–11 queued |

---

## Creative Direction Studio™ Stage Map

```yaml
generationStages:
  - stage: 1
    id: environment
    assetIds: [env-floor-cds]
    folder: 01_environment/
    estimatedMinutes: 8
  - stage: 2
    id: architecture
    assetIds: [env-shell-cds, env-ceiling-cds, env-alcove-cds, env-window-cds, portal-entry-cds, portal-exit-cds]
    folder: 02_architecture/
    estimatedMinutes: 25
  - stage: 3
    id: lighting
    assetIds: [lighting-rig-cds]
    folder: 08_lighting/
    estimatedMinutes: 5
  - stage: 4
    id: furniture
    assetIds: [table-timeline-cds, table-sandbox-cds, shelf-library-cds]
    folder: 03_furniture/
    estimatedMinutes: 18
  - stage: 5
    id: large-objects
    assetIds: [wall-mood-cds, wall-brief-cds, observatory-cds]
    folder: 04_objects/
    estimatedMinutes: 30
  - stage: 6
    id: interactive-objects
    assetIds: [pedestal-orb-cds, orb-cds, zone-inspiration-drop-cds, pedestal-approval-cds, screen-compare-cds]
    folder: 04_objects/
    estimatedMinutes: 22
  - stage: 7
    id: glass
    assetIds: [glass-panels-cds, panel-context-float-cds]
    folder: 05_glass/, 07_ui/
    estimatedMinutes: 12
  - stage: 8
    id: floating-ui
    assetIds: [panel-founder-notes-cds, markers-walk-room-cds]
    folder: 07_ui/, 14_metadata/navigation/
    estimatedMinutes: 8
  - stage: 9
    id: effects
    assetIds: [particles-ambient-cds]
    folder: 09_vfx/, 12_particles/
    estimatedMinutes: 5
  - stage: 10
    id: animation-refs
    assetIds: [ceremony-approval-cds, camera-paths-cds]
    folder: 10_animation/
    estimatedMinutes: 6
  - stage: 11
    id: audio-refs
    assetIds: [audio-ambient-cds, audio-ceremony-cds, audio-orb-cds, ai-creative-director-cds, ai-brand-concierge-cds, ai-research-concierge-cds]
    folder: 11_audio/, 14_metadata/ai/
    estimatedMinutes: 10
  - stage: 12
    id: final-validation
    assetIds: []
    action: quality-engine-run
    estimatedMinutes: 2
```

**Total estimated generation time (CDS v1):** ~151 minutes provider execution (compile-time estimate only).

---

## Per-Asset Pipeline States

```
pending → validated → optimized → expanded → queued → packaged → ready-for-provider
                                                              ↓
                                                    (provider: generating → cooked)
                                                              ↓
                                                    validated-post-cook → sealed
```

Compiler sprint ends at **`ready-for-provider`**.

---

## Queue Record Schema

```json
{
  "assetId": "wall-mood-cds",
  "stage": 5,
  "status": "ready-for-provider",
  "promptRef": "13_prompts/wall-mood-cds.json",
  "outputPath": "04_objects/wall-mood-cds.glb",
  "dependencies": ["env-shell-cds", "lighting-rig-cds"],
  "dependenciesResolved": true,
  "provider": { "preferred": ["fal"], "assetType": "mesh" }
}
```

Written to `14_metadata/generation-queue.json`.

---

## Regeneration Scopes

| Scope | Stages Re-run |
|-------|---------------|
| `lighting-only` | 03, 09 (+ dependent material rebind) |
| `materials-only` | 01, 02, 04, 05, 07 |
| `mood-wall-only` | 05 (single asset) |
| `full` | 01–12 |

From `room-dna.json` `regenerationScopes`.

---

## Parallelism Rules

| Allowed | Forbidden |
|---------|-----------|
| Same-stage assets with no mutual edges in parallel | Stage N+1 before Stage N gate |
| Audio + metadata parallel with effects | Interactive objects before large-objects shell |
| Prompt expansion parallel (pre-queue) | Glass before furniture table exists |

---

## Provider Handoff

Stage 12 produces `14_metadata/provider-handoff.json`:

```json
{
  "packageId": "pkg-creative-direction-golden-v1",
  "stages": [ "...ordered queue..." ],
  "totalAssets": 35,
  "totalPrompts": 47,
  "estimatedRenderMinutes": 151
}
```

FAL worker pulls stage-by-stage. See [provider-abstraction.md](./provider-abstraction.md).
