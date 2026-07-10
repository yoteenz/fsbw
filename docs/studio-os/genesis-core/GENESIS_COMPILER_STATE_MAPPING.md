# Genesis Core™ — World Compiler State Mapping

**Version:** 1.0.0

Maps World Compiler™ pipeline stages to **accumulating** Genesis Orb visuals. Progress **never resets to dormant** between layers within a compile run.

---

## Pipeline stages (canonical)

From `WORLD_COMPILER_STAGES` (`src/studio-os-core/scene-stack/world-compiler/constants.ts`):

1. `load-shell`
2. `lock-shell`
3. `mount-landmark`
4. `mount-furniture`
5. `apply-materials`
6. `calculate-lighting`
7. `apply-atmosphere`
8. `apply-motion`
9. `bake-reflections`
10. `render-final-scene`

**Pre-pipeline:** `dormant` → `awakening` (Experience Lab session attach)

---

## Visual accumulation table

| Stage | Core mode | Visual layer changes | Intensity targets |
|-------|-----------|----------------------|-------------------|
| **Dormant** | `dormant` | Faint ember core (~15% brightness); shell visible, dim | energy 0.15, motion 0, particles 0, env 0 |
| **Awakening** | `awakening` | Nucleus activates; inner light begins filling | energy 0.25→0.4, motion 0.1, particles 0.05, env 0.05 |
| **load-shell** | `compiling` | Outer shell structure resolves; perimeter ring illuminates | energy 0.35, motion 0.1, particles 0.1, env 0.08 |
| **lock-shell** | `compiling` | Shell lock — stability pulse (no reset) | energy 0.4, motion 0.12, particles 0.1, env 0.1 |
| **mount-landmark** | `compiling` | Central nucleus appears; major inner geometry locks | energy 0.5, motion 0.15, particles 0.15, env 0.12 |
| **mount-furniture** | `compiling` | Secondary light structures orbit nucleus | energy 0.58, motion 0.2, particles 0.18, env 0.15 |
| **apply-materials** | `compiling` | Shell gains translucency, refraction depth | energy 0.65, motion 0.22, particles 0.2, env 0.18 |
| **calculate-lighting** | `compiling` | Internal light reaches physical realism; env spill begins | energy 0.78, motion 0.25, particles 0.22, env 0.35 |
| **apply-atmosphere** | `compiling` | Haze, particles, bloom activate | energy 0.85, motion 0.3, particles 0.45, env 0.45 |
| **apply-motion** | `compiling` | Breathing + rotation systems live | energy 0.9, motion 0.55, particles 0.4, env 0.5 |
| **bake-reflections** | `compiling` | Outer shell polish — specular sharpens | energy 0.94, motion 0.5, particles 0.35, env 0.55 |
| **render-final-scene** | `compiling` → `success` → `idle` | Full ignition; 600ms success bloom; settle to idle with energy 1.0 retained until new run | energy 1.0, motion 0.45, particles 0.3, env 0.6 |

---

## Event subscription

| Runtime event | Stage |
|---------------|-------|
| `WORLD_COMPILER_STARTED` | `awakening` → `load-shell` |
| `ShellLoaded` | `load-shell` complete |
| `COMPILER_STAGE_CHANGED` | maps `stage` field |
| `LandmarkGenerated` | `mount-landmark` |
| `FurnitureGenerated` | `mount-furniture` |
| `MaterialsApplied` | `apply-materials` |
| `LightingCalculated` | `calculate-lighting` |
| `AtmosphereApplied` | `apply-atmosphere` |
| `MotionApplied` | `apply-motion` |
| `ReflectionsBaked` | `bake-reflections` |
| `RenderCompleted` | `render-final-scene` |
| `COMPILER_FAILED` | `critical` + `failureCode` |
| `WORLD_COMPILER_STOPPED` | hold last visual → fade to `idle` over 2s (not instant dormant) |

Source: `experience-lab-render-runtime.ts` `WORLD_STAGE_EVENTS` + `compile-pipeline.ts` `onStageComplete`.

---

## Progress calculation

```
progress = (completedStages.length + inStagePartial) / WORLD_COMPILER_STAGES.length
```

- `inStagePartial` from pipeline sub-progress if available (0–0.9 max within stage)
- **Monotonic:** `progress` never decreases within same `activeRunId`

---

## Failure mapping

| Condition | Visual |
|-----------|--------|
| Stage timeout (`RENDER_PIPELINE_STALL_MS`) | `warning` + amber undertone |
| `COMPILE_FAILED` | `critical` — fracture diffusion, core 40% |
| Retry | `warning` → resume `compiling` from last `completedStages` — **no dormant** |
| User abort | Fade to `idle`, retain last `completedStages` in debug only |

---

## Experience Lab sync

`GenesisCoreDebugPanel` displays:

- `activeRunId`
- `currentStage` / `completedStages[]`
- `progress` bar + orb preview side-by-side
- Mismatch alarm if UI stage ≠ runtime stage

---

## Anti-patterns

- Resetting to dormant after `mount-landmark` before `apply-materials`
- Fake stage timer advancing without `COMPILER_STAGE_CHANGED`
- Independent heartbeat mutating `completedStages`
- Orb-local compile simulation decoupled from `experience-lab-render-runtime`
