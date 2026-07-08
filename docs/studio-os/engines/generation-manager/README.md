# Studio Generation Manager™ — The AI Production Coordinator (v1)

**Version:** 1.0.0  
**Status:** Canonical orchestration engine specification  
**Type:** Core Studio OS Engine — not a feature, not a provider  
**Engine ID:** `studio.generation-manager.v1`  
**Tagline:** *The AI Production Coordinator*

---

> **The founder never writes prompts. Studio OS manufactures the department.**

Studio Generation Manager™ is the **orchestration engine** responsible for manufacturing every visual asset used inside Studio OS.

It does **not** generate images itself. It coordinates the entire production process.

---

## Mission

Think of this as the **Production Manager inside a Hollywood studio**.

| Generation Manager Does | Generation Manager Does Not |
|-------------------------|----------------------------|
| Determine what · when · in what order to generate | Expand prompts (Compiler does) |
| Select provider per asset | Call providers directly from UI |
| Track states · progress · history | Design departments (Generator does) |
| Retry failures intelligently | Skip validation |
| Hand off to Validation Loop™ | Register assets (Registry receives after validation) |
| Produce Build Report | Assemble runtime scenes (Cursor does) |
| Notify Runtime when cook complete | Generate assets without a queue |

---

## Position in the Pipeline

```
Creative Direction Studio™ (intent)
         ↓
Studio Department Generator™ (Department Definition)
         ↓
Studio Asset Compiler™ (DepartmentPackage.zip · prompts · metadata)
         ↓
Prompt Compiler™ (expanded prompt stacks in 13_prompts/)
         ↓
Asset Intelligence Engine™ (search Registry · compatibility · founder gate)
         ↓
Studio Production Estimates™ (scope · cost · savings · Orb WHY · founder approve)
         ↓
STUDIO GENERATION MANAGER™ (this engine — only approved estimate scope)
  Queue · schedule · execute · retry · validate handoff
         ↓
AI Generators (FAL · OpenAI Images · Runway · Luma · BFL · future)
         ↓
Studio Validation Loop™ (quality authority)
         ↓
Studio Asset Registry™ (permanent library)
         ↓
Department Runtime™ (live operation)
```

**Prompt Compiler™** = Compiler Prompt Expansion Engine ([prompt-expansion-engine.md](../studio-asset-compiler/prompt-expansion-engine.md)). Generation Manager consumes its output — never re-expands.

---

## Responsibilities

| Responsibility | Module |
|----------------|--------|
| Generation Queue | [queue-system.md](./queue-system.md) |
| Asset Scheduling | [queue-system.md](./queue-system.md) |
| Dependency Resolution | [dependency-engine.md](./dependency-engine.md) |
| Retry Logic | [retry-engine.md](./retry-engine.md) |
| Progress Tracking | [generation-states.md](./generation-states.md) |
| Generation History | [generation-states.md](./generation-states.md) |
| Quality Validation Handoff | [validation-handoff.md](./validation-handoff.md) |
| Provider Selection | [provider-abstraction.md](./provider-abstraction.md) |
| Asset Storage | [registry-integration.md](./registry-integration.md) |
| Registry Integration | [registry-integration.md](./registry-integration.md) |
| Runtime Notification | [registry-integration.md](./registry-integration.md) |
| Build Report | [build-report-schema.md](./build-report-schema.md) |

---

## Document Index

| Document | Contents |
|----------|----------|
| [generation-overview.md](./generation-overview.md) | Philosophy · Hollywood production model · integrations |
| [queue-system.md](./queue-system.md) | Auto queue · CDS example · scheduling |
| [dependency-engine.md](./dependency-engine.md) | Order rules · stage gates · CDS dependencies |
| [generation-states.md](./generation-states.md) | State machine · founder visibility |
| [retry-engine.md](./retry-engine.md) | Failure classes · intelligent retry |
| [provider-abstraction.md](./provider-abstraction.md) | Multi-provider routing · adapter contract |
| [validation-handoff.md](./validation-handoff.md) | Quality gates · Validation Loop contract |
| [registry-integration.md](./registry-integration.md) | Storage · reuse · Runtime notify |
| [build-report-schema.md](./build-report-schema.md) | Completion report · metrics |
| [future-roadmap.md](./future-roadmap.md) | Parallel · overnight · enterprise farms |

---

## Founder Experience (Conceptual)

The founder sees production progress — never prompts:

```
Creative Direction Studio™
Generating...
██████████░░░░░░░░  52%

✓ Environment      Complete
⟳ Lighting         Generating...
○ Furniture        Queued
○ Orb              Queued
○ Mood Wall        Queued
…

Estimated time remaining: 12 minutes

[Pause] [Resume] [Prioritize] [Regenerate asset] [Approve] [Reject]
```

See [generation-states.md](./generation-states.md) for controls.

---

## Cross-References

| System | Path |
|--------|------|
| Studio Asset Compiler™ | [`../studio-asset-compiler/`](../studio-asset-compiler/README.md) |
| Studio Asset Registry™ | [`../studio-asset-registry/`](../studio-asset-registry/README.md) |
| Production Pipeline | [`../../production/`](../../production/README.md) |
| Creative Direction Studio™ | [`../../departments/creative-direction-studio/`](../../departments/creative-direction-studio/README.md) |
| Validation Loop™ | [`../../engine/validation-loop/`](../../engine/validation-loop/README.md) |
| Studio Builder™ | [`../../alpha/studio-builder/`](../../alpha/studio-builder/README.md) |

---

## Success Criteria (v1)

- [ ] Founder never thinks *"I need to write prompts"*
- [ ] Queue auto-created per department — zero manual ordering
- [ ] Dependencies enforced — lighting after environment · furniture after floor
- [ ] Every asset has visible state in pipeline
- [ ] Retry engine handles failures without babysitting
- [ ] Provider-agnostic — FAL today · OpenAI · Runway · Luma · BFL tomorrow
- [ ] Nothing reaches Registry without validation handoff
- [ ] Build Report produced on completion
- [ ] CDS pilot queue mapped (16 logical groups · 35 assets)

**No implementation. No FAL connection. No UI. No asset generation.**

---

_Studio Generation Manager™ — The AI Production Coordinator._
