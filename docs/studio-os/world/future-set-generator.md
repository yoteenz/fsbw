# Future Set Generator™

**Version:** 1.0.0  
**Status:** Forward-looking architecture (docs only)  
**Prerequisite:** Golden Build stability · Set DNA™ canon

---

## Purpose

Define how Studio OS will **manufacture Sets™** from Set DNA™ — the environment generation pipeline successor to department-only generation.

**No implementation this sprint.**

---

## Pipeline Position

```
Set DNA™
    + Department Definition
    + Company Genome™
    + Project Genome™
    + Industry Pack (optional)
         ↓
Set Generator™ (future)
         ↓
Set Package (geometry · materials · objects · audio · behaviors)
         ↓
Studio Builder™ / Generation Manager™
         ↓
FAL + providers
         ↓
Studio Asset Registry™
         ↓
Department Runtime assembles Set™
         ↓
FOUNDER WALKS SET™
```

---

## Set Generator™ Responsibilities

| Responsibility | Output |
|----------------|--------|
| Validate Set DNA™ | Schema pass · emotion · hero declared |
| Expand Set DNA → generation instructions | Per-group prompts · dependencies |
| Resolve genome modulation | Material · light · voice injection |
| Compile arrival + idle profiles | Animation · audio manifests |
| Emit Set Package manifest | Runtime assembly input |
| Handoff to Studio Builder™ | Production groups · queue |

---

## Relationship to Existing Engines

| Existing engine | Set Generator relationship |
|-----------------|---------------------------|
| [Department Generator™](../department-generator/README.md) | Organization blueprint — Set Generator adds environment layer |
| [Studio Asset Compiler™](../engines/studio-asset-compiler/README.md) | Compiles assets — consumes Set Package |
| [Studio Builder™](../alpha/studio-builder/README.md) | Founder production UI — triggers Set generation |
| [Generation Manager™](../engines/generation-manager/README.md) | Orchestrates provider queue |
| [Department Runtime™](../engine/department-runtime/README.md) | Assembles and runs Set™ |

Set Generator™ is the **environment manufacturing coordinator** — not a replacement for frozen engines.

---

## Generation Order (Set Scope)

```
1. Environment shell (hero production group)
2. Architecture · walls · ceiling
3. Lighting rig
4. Materials · floor
5. Furniture · fixtures
6. Hero object
7. Supporting interactive objects
8. Audio profile assets
9. Particle / ambient systems
10. Arrival Sequence assets
11. Idle Life animation hooks
```

Dependency graph from Set DNA™ `interactiveObjects` + `furniture`.

---

## Input Artifacts

| File | Source |
|------|--------|
| `set-dna.json` | Set DNA™ schema |
| `department.json` | Organization context |
| `company-genome.json` | Brand modulation |
| `project-genome.json` | Active project |
| `asset-manifest.json` | Object list |
| `production-groups.json` | Generation groups |

Alpha uses `room-dna.json` — maps to `set-dna.json` in future rename sprint.

---

## Output Artifacts

| File | Contents |
|------|----------|
| `set-package.json` | Compiled Set manifest |
| `set-assembly-blueprint.json` | Runtime placement rules |
| `set-arrival-manifest.json` | Arrival beat assets |
| `set-idle-manifest.json` | Idle behavior bindings |
| `set-prompt-package/` | FAL prompt expansion |

---

## Marketplace Generation

For Marketplace Sets™:

```
Creator Set DNA™ (base)
    + Purchaser Company Genome™
    + Industry Influence selection
         ↓
Set Generator™ adaptation pass
         ↓
Purchaser-specific Set Package
         ↓
Install to purchaser headquarters lot
```

Same generator · different genome inputs.

---

## Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **0 (now)** | Sets™ philosophy · Set DNA™ docs · registry |
| **1** | Map `room-dna.json` → Set DNA schema · no rename |
| **2** | Set-aware prompt compiler in Studio Builder |
| **3** | `set-dna.json` artifact in department package |
| **4** | Full Set Generator module |
| **5** | Marketplace Set publish + install |

Gated on Golden Build mobile stability and Certified™ path for Creative Atelier™.

---

## Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| New parallel generation stack | Use Studio Builder + FAL |
| Set Generator generates UI pages | Sets™ are environments only |
| Per-Set hardcoded compiler | Set DNA™ drives all |
| Skip Department Definition | Organization context required |

---

## Cross-References

- [Set DNA](./set-dna.md)
- [Set Registry](./set-registry.md)
- [Marketplace Set System](./marketplace-set-system.md)
- [Golden Build](../production-lifecycle/golden-build.md)
- [Studio Builder future automation](../alpha/studio-builder/future-automation.md)
