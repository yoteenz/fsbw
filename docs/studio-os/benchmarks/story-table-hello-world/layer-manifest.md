# Story Table™ Layer Manifest™

**Benchmark Module:** `studio.benchmark.story-table-hello-world.v1.layers`  
**Status:** Twelve required layers — generation authority

---

## Layer Registry

```yaml
StoryTableLayerManifest:
  workspaceScene: story-table
  departmentId: creative-direction
  blueprintId: blueprint-editorial-luxury-v1
  layers:
    - layerId: env-shell-story-table
      category: Environment Shell™
      layerIndex: 1
      generatable: true
      owner: provider

    - layerId: lighting-story-table
      category: Lighting™
      layerIndex: 2
      generatable: true
      dependsOn: [env-shell-story-table]

    - layerId: architecture-story-table
      category: Architecture™
      layerIndex: 3
      generatable: true
      dependsOn: [env-shell-story-table]

    - layerId: furniture-story-table
      category: Furniture™
      layerIndex: 4
      generatable: true
      dependsOn: [env-shell-story-table, architecture-story-table]

    - layerId: executive-strategy-table
      category: Executive Strategy Table™
      layerIndex: 5
      reuseCategory: executive-strategy-table-hero
      generatable: true
      dependsOn: [furniture-story-table, architecture-story-table]
      proofNote: Signature landmark surface — illuminated executive table

    - layerId: floating-studio-orb
      category: Floating Studio Orb™
      layerIndex: 6
      reuseCategory: studio-orb-spatial-host
      generatable: true
      dependsOn: [executive-strategy-table]
      proofNote: Reuse Orb mesh across departments — genome tint only

    - layerId: holographic-project-boards
      category: Holographic Project Boards™
      layerIndex: 7
      generatable: true
      dependsOn: [executive-strategy-table, lighting-story-table]
      proofNote: Diegetic holographic cards — no readable UI text

    - layerId: material-samples-story-table
      category: Material Samples™
      layerIndex: 8
      generatable: true
      dependsOn: [architecture-story-table, lighting-story-table]

    - layerId: atmosphere-story-table
      category: Atmosphere™
      layerIndex: 9
      generatable: true
      dependsOn: [lighting-story-table]

    - layerId: particles-story-table
      category: Particles™
      layerIndex: 10
      generatable: true
      dependsOn: [atmosphere-story-table]

    - layerId: ambient-audio-story-table
      category: Ambient Audio™
      layerIndex: 11
      generatable: true
      dependsOn: [env-shell-story-table]

    - layerId: runtime-fx-story-table
      category: Runtime FX™
      layerIndex: 12
      generatable: false
      owner: cursor
      dependsOn: [lighting-story-table, holographic-project-boards, floating-studio-orb]
```

---

## Generation Order (Benchmark)

Aligns with [Generation Pipeline layer sequence](../engines/generation-pipeline/layer-by-layer-generation.md):

```
1. Environment Shell™
2. Lighting™          } may parallel after shell
3. Architecture™      }
4. Furniture™
5. Executive Strategy Table™
6. Floating Studio Orb™
7. Holographic Project Boards™
8. Material Samples™
9. Atmosphere™
10. Particles™
11. Ambient Audio™     } may parallel with atmosphere
12. Runtime FX™        (Cursor — after visual approval)
```

---

## Scene Stack™ Mapping

| Benchmark layer | Scene Stack ID |
|-----------------|----------------|
| Environment Shell™ | `environment-shell` |
| Lighting™ | `lighting-systems` |
| Architecture™ | `environment-shell` (structural) |
| Furniture™ | `furniture` |
| Executive Strategy Table™ | `signature-landmark` |
| Floating Studio Orb™ | `signature-landmark` (orb pass) |
| Holographic Project Boards™ | `furniture` + `interaction-layer` visual |
| Material Samples™ | `surface-materials` |
| Atmosphere™ | `atmospheric` |
| Particles™ | `atmospheric` (particle pass) |
| Ambient Audio™ | parallel audio manifest |
| Runtime FX™ | `runtime-effects` |

---

## Per-Layer Proof Intent

| Layer | What benchmark must demonstrate |
|-------|--------------------------------|
| Environment Shell™ | Independent generate · approve · Registry write |
| Lighting™ | **Regen proof target** — regen without shell rebuild |
| Architecture™ | Layer isolation — no lighting bleed |
| Furniture™ | Human-scale · genome material injection |
| Executive Strategy Table™ | Hero landmark as independent asset |
| Floating Studio Orb™ | Cross-department reuse candidate |
| Holographic Project Boards™ | Interactive visual pass — not HTML cards |
| Material Samples™ | Material Library™ Registry entries |
| Atmosphere™ | Depends on lighting — DAG enforced |
| Particles™ | Child of atmosphere — DAG enforced |
| Ambient Audio™ | Non-visual layer in same pipeline |
| Runtime FX™ | Cursor boundary — only after visual approval |

---

## Forbidden

| Anti-pattern | Why |
|--------------|-----|
| Single image for full Story Table | Violates layer law |
| React cards for holographic boards | Cursor visual substitute |
| Hand-placed Orb in Three.js without layer | Skips generation proof |
| Skip audio layer | Pipeline must handle non-visual assets |

---

_Story Table™ Layer Manifest — twelve proofs in one room._
