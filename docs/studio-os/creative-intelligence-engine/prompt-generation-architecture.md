# Prompt Generation Architecture™

**Module:** `studio.creative-intelligence-engine.v1.prompt-pipeline`  
**Status:** Founders never write FAL prompts

---

## Law

> **Do NOT require founders to write FAL prompts.** Build the pipeline.

---

## Canonical Pipeline

```
Founder Intent™
         ↓
Creative Interpreter™
         ↓
Blueprint Engine™
         ↓
Asset Registry™
         ↓
Scene Planner™
         ↓
Prompt Composer™
         ↓
Provider Optimizer™
         ↓
FAL (internal — never founder-facing)
         ↓
Quality Inspector™
         ↓
Approval Queue™
         ↓
Asset Registry™
         ↓
Scene Assembly™
         ↓
Completed Workspace™
```

**Creative Direction Studio™** is the first department on this pipeline.

---

## Stage Definitions

### 1. Founder Intent™

```yaml
FounderIntent:
  source: voice | text | gesture | genome | workstation_context
  workspaceScene: arrival | story-table | mood-wall | notes-desk | pipeline | library
  intentType: generate | modify | reuse | approve | explore
  naturalLanguage: string
  projectContext: ProjectGenome
  tasteSignals: FounderTasteGenome
```

Founder says: *"Make the Story Table lighting warmer — editorial luxury."*  
Not: *"fal-ai/nano-banana-pro/edit prompt: warm lighting..."*

---

### 2. Creative Interpreter™

| Input | Output |
|-------|--------|
| Natural language | Structured creative request |
| Workstation context | Target layer · scene · asset class |
| Genome | Tone · restraint · brand guardrails |

Resolves ambiguity · asks Orb clarifying question if needed.

---

### 3. Blueprint Engine™

[Creative Blueprint Engine™](../creative-blueprint-engine/README.md) provides:

- Active Visual DNA™
- Applicable Blueprints™ · Systems™
- Inheritance rules (Apply Existing™ default)

Output: `blueprintScope` for scene/asset generation.

---

### 4. Asset Registry™

[Asset Intelligence Engine™](../asset-intelligence-engine/README.md) runs **before** compose:

| Result | Path |
|--------|------|
| Exact Match™ | Skip generation · reuse |
| Close Match™ | Modify path |
| Generate New™ | Proceed to Scene Planner |

---

### 5. Scene Planner™

```yaml
ScenePlan:
  workspaceScene: string
  layerManifest: LayerPlan[]      # Scene Stack™ layers
  dependencies: string[]
  productionEstimateId: string    # Production Estimates™
  reuseLineItems: ReuseLineItem[]
  newGenerationLineItems: GenerationLineItem[]
```

Plans **what** to generate — not provider prompts yet.

---

### 6. Prompt Composer™

[Prompt Composer™](../engines/prompt-composer/README.md) — the **translation layer** between founder intent and generation engines.

Assembles **twelve composition sources** into one provider-neutral **`ProductionPrompt™`**:

| Source | Contributes |
|--------|-------------|
| Company DNA™ | Genome tone · material language · restraint |
| Department Blueprint™ | Visual DNA™ · Blueprints™ · Systems™ |
| Workspace Rules™ | Physical room · zone context |
| Camera Rules™ | Angle · focal length · isolation |
| Architectural Language™ | Envelope · proportion · anti-SaaS |
| Lighting Rules™ | Editorial rig · key-fill · volumetric |
| Material Library™ | Stone · brass · glass vocabulary |
| Asset Registry References™ | Reuse refs · prompt fragments |
| Rendering Requirements™ | Resolution · aspect · layer isolation |
| Quality Requirements™ | Golden Build™ · blueprint compliance |
| Negative Prompt™ | Universal anti-SaaS · brand guardrails |
| Provider Hints™ | Capability tags — **not** final provider |

Output: `ProductionPrompt™` — **provider-neutral** · never hardcoded to FAL.

See [production-prompt-schema.md](../engines/prompt-composer/production-prompt-schema.md) · [provider-neutral-contract.md](../engines/prompt-composer/provider-neutral-contract.md).

---

### 7. Provider Optimizer™

[Provider Optimizer™](../engines/prompt-composer/provider-optimizer-handoff.md) — adapts `ProductionPrompt™` → `OptimizedProviderPayload™` per provider family:

| Family | Status |
|--------|--------|
| FAL | Primary v1 |
| OpenAI Images | Fallback |
| Flux (BFL) | Future v1.1 |
| Imagen | Future v1.1 |
| Runway · Luma · ElevenLabs | Future |

[Model Orchestrator™](../model-orchestrator.md) / [Generation Manager™](../engines/generation-manager/README.md) execute optimized payloads — never raw founder intent.

- Select model route from hints + health + org policy
- Resolution · aspect · quality tier mapping
- Failover rules

Founder never sees provider or model.

---

### 8. FAL (Internal)

Execution only. Results return to Quality Inspector™.

---

### 9. Quality Inspector™

| Check | Action |
|-------|--------|
| Blueprint compliance | Pass / regen scope |
| Perspective · resolution | Pass / retry |
| Layer isolation | No bleed into wrong layer |
| Brand genome | Pass / revision |

May invoke [Validation Loop™](../engine/validation-loop/README.md) rules.

---

### 10. Approval Queue™

[Creative Approval Pipeline™](../creative-direction-pipeline/README.md) · [Production Estimates™](../studio-production-estimates/README.md):

Founder approves at **Pipeline™** board or workstation — not API config.

---

### 11. Asset Registry™ (Write)

Approved assets registered with:

- Layer ID · scene ID · blueprint ID
- Version · golden flag
- Creative ROI™ seed

---

### 12. Scene Assembly™

[Scene Stack™](../scene-stack/README.md) compositor:

- Layer blend order
- Runtime FX™ · Interaction Layer™ (Cursor)
- Workspace scene `ready` state

---

### 13. Completed Workspace™

Founder walks into finished or updated room.

Orb: *"Story Table™ lighting layer updated — editorial luxury preserved."*

---

## Forbidden

| Forbidden | Alternative |
|-----------|-------------|
| Founder prompt textarea | Founder Intent™ voice/text |
| Model picker | Provider Optimizer™ |
| Raw FAL slug in UI | "Producing lighting layer…" |
| Skip Asset Registry search | Remember-first law |

---

_Prompt Generation Architecture™ — intent in, worlds out._
