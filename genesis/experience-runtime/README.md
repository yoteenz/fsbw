# Experience Runtime™

**Canonical article:** [`../articles/EXPERIENCE_RUNTIME.md`](../articles/EXPERIENCE_RUNTIME.md)  
**Parent system:** Experience Engine™  
**Status:** Architecture drafted; **runtime implemented (2026-07-09)**  
**Purpose:** Execute Experience Engine™ output in real time by assembling every
Studio OS page, Headquarters, department, room, workspace, scene, panel,
workflow, and application from layered DNA.

---

## Role

Experience Engine™ defines the layered DNA model.

Experience Runtime™ executes that model:

```text
Platform DNA
  -> Brand DNA
    -> Department DNA
      -> Scene DNA
        -> Component DNA
          -> Motion DNA
            -> Interaction DNA
              -> State DNA
                -> Runtime Assembly
                  -> Rendered Experience
```

Studio OS should never manually construct branded experiences. Pages become
runtime-assembled scene graphs.

| `runtime/` | Runtime overview content home |
| `runtime-engine/` | DNAResolver, ThemeResolver, Scene/Component/Motion/Interaction assemblers |
| `runtime-cache/` | Versioned runtime graph caches |
| `runtime-registry/` | Platform DNA registry |
| `runtime-state/` | State DNA continuity layer |
| `runtime-preview/` | Runtime Inspector™ |
| `runtime-playground/` | Live brand switching playground |

---

## Runtime (implemented)

**Path:** `src/studio-os-core/genesis/experience-runtime/`  
**UI:** `/admin/studio/experience-runtime` (+ subsystem rooms)  
**Genesis key:** `experienceRuntimeDna`  
**Guide:** `docs/studio-os/genesis/EXPERIENCE_RUNTIME_PLATFORM.md`

---

## Architecture areas

| Area | Responsibility |
|------|----------------|
| Runtime lifecycle | Boot, context resolution, DNA loading, validation, inheritance, graph assembly, render projection, live observation, teardown |
| Runtime graph | Stable scene/component/state node identity independent of Brand DNA |
| State DNA™ | Continuity layer for form state, workflow progress, Orb context, panel state, migrations, and live switching |
| Live DNA switching | Founder can switch Brand DNA during runtime without route rebuild, layout regeneration, or state loss |
| Caching | Versioned caches for registry indexes, resolved DNA, component plans, CSS variables, motion plans, state snapshots, render graphs |
| Conflict/fallback | Deterministic precedence, governed overrides, safe minimal experience when DNA fails |

---

## First proof case

Using one identical Headquarters template, generate:

- Studio OS™
- Frontal Slayer™
- NDX™

Validation rule:

```text
Same template.
Same runtime graph.
Same state slots.
Only inherited DNA changes.
```

---

## Implementation posture

Do not redesign or replace the completed Experience Engine™ runtime at
`src/studio-os-core/genesis/experience-engine/`.

The first implementation should wrap existing Experience Engine profile
resolution into a Runtime Experience Graph™, then add Platform DNA™, State DNA™,
stable node IDs, graph patches, and live Brand DNA switching.
