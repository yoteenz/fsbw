# 13 — Genome Injection

**Engine Module:** `studio.department-runtime.v1.genome-injection`  
**Status:** Runtime identity transformation specification  
**Parent:** [Asset Compiler Genome Injection](../asset-compiler/08_COMPANY_GENOME_INJECTION.md) · SDK [10 — Company Genome Integration](../../sdk/10_COMPANY_GENOME_INTEGRATION.md)

---

## Definition

**Genome Injection** is the runtime phase where live **Company Genome™** values fill asset slots, override terminology, configure AI personalities, and transform department expression — **without rebuilding assets**.

> Every department transforms without the Runtime knowing industry.

---

## Injection Timing

```
World Assembler completes structure
    ↓
GENOME_INJECTING state
    ↓
Resolve genome-hooks.json targets
    ↓
Apply all domain injections (parallel)
    ↓
Trigger genome-refresh animation (2s crossfade)
    ↓
READY → arrival sequence
```

Live Genome updates during ACTIVE re-trigger partial injection + `genome-refresh` profile.

---

## Injection Targets

| Genome Domain | Runtime Target |
|---------------|----------------|
| **Materials** | Shader uniform values on all surfaces |
| **Colors** (`colorPrinciples`) | Particles, glass tint, light accents, emissive |
| **Typography** (`editorialDirection`) | Floating Panel, Command Console labels |
| **Photography** (`visualReferences`) | Mood Wall imagery |
| **Products** | Asset Shelf default content |
| **Motion** (`motionPhilosophy`, `pacing`) | Animation Engine scale factor |
| **Brand language** (`voice`, `microcopyStyle`) | Panel copy, command labels |
| **Objects** (terminology) | Object display names, zone labels |
| **Audio** (`musicStyle`, `soundDesign`) | Track selection, SFX character |
| **AI personalities** (`personality`, `voice`) | Concierge + Orb TTS |
| **Terminology** | Department name, role titles, commands |
| **Lighting** (`lightingStyle`) | Light rig temperature, intensity, IBL |
| **Industry expression** | Via Genome domains — not industry ID |

---

## Injection Process

```yaml
GenomeInjectionJob:
  snapshotId: string
  hooks: GenomeHook[]                 # from package genome-hooks.json
  domains:
    - domain: colorPrinciples
      resolver: MaterialInjector
      targets: [materials/*, particles/*]
    - domain: lightingStyle
      resolver: LightingInjector
      targets: [lighting/lights.json]
    # ... per hook manifest
  projectOverlay: ProjectGenome | null
  audit: InjectionAuditEntry[]
```

Each injection logged with `fallbackUsed` flag.

---

## Transformation Without Rebuild

| Change | Runtime-Only | Recompile Needed |
|--------|-------------|------------------|
| Typography | ✓ | — |
| Terminology | ✓ | — |
| AI voice | ✓ | — |
| Light parameters | ✓ | — |
| Material colors | ✓ | — |
| Mood Wall images | ✓ (if refs in Genome) | — |
| Ambient audio swap | ✓ (if alt in package) | — |
| Environment geometry | — | ✓ |
| Furniture mesh | — | ✓ (hot-swap via Loader) |
| New material family | — | ✓ |

---

## Project Genome Overlay

Project Genome™ merges on top for:

- Mood Wall project mood
- Timeline events
- Interactive Wall pins
- Concierge knowledge emphasis
- Preview Screen context

Never overrides `thingsWeNeverDo`.

---

## Marketplace Install Injection

```
Neutral package loads
    ↓
Installing company's live Genome resolves
    ↓
Full injection
    ↓
Department unique to that company
```

Same package + different Genome = different world.

---

## Injection Audit

```yaml
InjectionAuditEntry:
  domain: string
  target: string
  resolved: boolean
  fallbackUsed: boolean
  timestamp: datetime
```

Orb suggests Genome enrichment when `fallbackUsed: true`.

---

_Next: [14 — State Manager](./14_STATE_MANAGER.md)_
