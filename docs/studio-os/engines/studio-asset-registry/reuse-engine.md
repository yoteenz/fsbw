# Reuse Engine — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.reuse-engine`  
**Status:** Smart Reuse — generation is last resort

---

## Mission

> Before Studio Asset Compiler™ generates anything, it should ask the Registry.

**Reuse becomes the default. Generation becomes the last resort.**

The Reuse Engine is the intelligence layer that saves generation cost, preserves quality, and compounds platform memory.

---

## The Six Questions

Before any Compiler stage invokes a provider, the Reuse Engine asks:

| # | Question | Action if Yes |
|---|----------|---------------|
| 1 | **Does this already exist?** | Link exact Registry match |
| 2 | **Can it be adapted?** | Link + apply genome/room overlay |
| 3 | **Can it inherit?** | Extend parent item · partial reuse |
| 4 | **Can it merge?** | Combine multiple Registry items |
| 5 | **Can it remix?** | Variant from base + modifier fragments |
| 6 | **Can it upscale?** | Higher-res artifact exists · no regen |
| 7 | **Can it evolve?** | Promote generated → approved from prior run |

Only when **all applicable questions fail** does Compiler proceed to provider generation.

---

## Reuse Resolution Pipeline

```
Compiler Stage N — asset candidate
         ↓
Extract reuse signals:
  - reuseCategory (from asset-manifest)
  - category + subcategory
  - physical dimensions band
  - genomeSlots required
  - zone context
  - industry profile
         ↓
RegistrySnapshot.reuseIndex query
         ↓
Score candidates (0-100 reuseConfidence)
         ↓
├── score ≥ 90 → EXACT REUSE (link artifact)
├── score 75-89 → ADAPT REUSE (link + genome overlay)
├── score 60-74 → INHERIT REUSE (partial · prompt only)
├── score 40-59 → REMIX (base + fragments)
└── score < 40 → GENERATE (last resort)
         ↓
Record decision in build-report.md
Update usageHistory on linked items
```

---

## Reuse Index Schema

Precomputed at snapshot generation for fast Compiler lookup:

```yaml
ReuseIndexEntry:
  reuseCategory: string
  registryId: string
  version: string
  lifecycle: string
  reuseConfidence: number
  quality: number
  performance: number
  genomeAdaptability: number
  industries: string[]
  departments: string[]
  dimensionsBand: DimensionsBand    # optional physical matcher
  packExclusive: boolean
  orgEntitled: boolean               # per snapshot scope
```

---

## Reuse Modes

| Mode | ID | Description | Compiler Behavior |
|------|-----|-------------|-------------------|
| **Exact** | `exact` | Identical role · dimensions · category | Copy artifact ref · skip stage |
| **Adapt** | `adapt` | Same base · genome/room overlay | Link mesh · expand overlay prompts only |
| **Inherit** | `inherit` | Child extends parent | Reuse parent prompt fragments · gen delta |
| **Merge** | `merge` | Combine two+ items | Composite prompt · single gen call |
| **Remix** | `remix` | Variant of approved base | Base artifact + modifier gen |
| **Upscale** | `upscale` | Higher resolution exists | Link hi-res · skip provider |
| **Evolve** | `evolve` | Prior generated run approved | Promote + link · skip regen |
| **Generate** | `generate` | No match | Full provider execution |

---

## Matching Signals

| Signal | Weight | Source |
|--------|--------|--------|
| `reuseCategory` exact match | 40% | asset-manifest · Registry item |
| Category + subcategory match | 15% | Registry taxonomy |
| Industry compatibility | 10% | `compatibility.industries` |
| Department compatibility | 10% | `compatibility.departments` |
| Genome slot coverage | 10% | Required slots ⊆ item slots |
| Room DNA slider alignment | 5% | Preset overlap |
| Quality score | 5% | `scores.quality` |
| Usage history (proven) | 5% | `usageHistory.compileReuseCount` |

---

## Adapt Reuse — Genome Overlay

When mode = `adapt`, Compiler does **not** regenerate mesh:

```
Linked artifact: registry:executive-chair-luxury-v3
         +
Company Genome overlay:
  - materialLanguage → leather tone
  - colorSystem → brand accent
  - editorialDirection → photography mood
         ↓
Runtime applies genome slots at mount
         +
Optional: expand 13_prompts/ overlay-only for marketing stills
```

Same chair · different soul. See [company-genome-adaptation.md](./company-genome-adaptation.md).

---

## Inherit Reuse — Prompt Inheritance

Child asset inherits parent's prompt stack:

```
Parent: registry:glass-panel-frosted-v2
Child manifest: glass-panels-law-firm
         ↓
Reuse: prompt-fragment-glass-frosted-v1 (inherit)
Generate delta: "law firm formal partition, darker tint"
         ↓
New Registry item (generated) → QA → approved
```

Inheritance recorded in `relationships.forkedFrom`.

---

## Merge Reuse — Composite Assets

When department needs hybrid:

```
Merge candidates:
  - registry:marble-calacatta-genome-slot (material)
  - registry:conference-table-luxury-v2 (furniture)
         ↓
Composite prompt recipe: registry:prompt-recipe-marble-conference-v1
         ↓
Single generation OR link pre-merged approved item
```

Merge recipes are Registry items (`prompt.recipe`).

---

## Remix Reuse — Controlled Variation

```
Base: registry:lighting-rig-editorial-v1
Remix modifiers:
  - registry:prompt-fragment-lighting-warm-v1
  - Room DNA warmthLevel: 0.8
         ↓
Variant gen with base as ControlNet / reference
OR link registry:lighting-rig-editorial-warm-v1 if exists
```

---

## Upscale Reuse

When provider previously generated hi-res artifact:

```json
{
  "reuseMode": "upscale",
  "reusedFrom": "registry:glass-panel-frosted-v2@3.1.0",
  "artifactRef": "artifact://meshes/glass-panel-frosted-v3-4k.glb",
  "skippedProvider": true,
  "savedMinutes": 6
}
```

---

## Evolve Reuse — Generated Promotion

Prior compile run produced `lifecycle: generated` item. QA passed. Reuse Engine promotes:

```
registry:glass-panels-cds-generated-run-42
  lifecycle: generated → approved
  reuseMode: evolve
  next compile: exact link (no regen)
```

Build Health rewards evolve promotions — platform learns from its own output.

---

## Compiler Integration Points

| Compiler Stage | Reuse Check |
|----------------|-------------|
| Pre-compile (Stage 0) | Full manifest reuse scan |
| Per-stage (1-11) | Category-scoped reuse before provider |
| Prompt Expansion | Fragment reuse before write |
| Quality Engine | Flag regen when reuse candidate exists |
| Package seal | `metrics.reusePercentage` in manifest |

Quality Engine reuse rule ([quality-engine.md](../studio-asset-compiler/quality-engine.md)):

> Registry match flagged if regen unnecessary — severity: **info** (warn if ignored)

---

## Build Health Reuse Dimension

Reuse efficiency = **10%** of Build Health score:

```
reuseScore = min(100, reusePercentage * 2)
```

| Reuse % | Contribution |
|---------|--------------|
| 0% | 0 |
| 25% | 50 |
| 40% | 80 |
| 50%+ | 100 |

Target for mature departments: **≥40% reuse**.

---

## build-report.md Reuse Section

```markdown
## Reuse Summary

| Metric | Value |
|--------|-------|
| Total assets | 35 |
| Reused | 14 |
| Adapted | 6 |
| Generated | 15 |
| Reuse % | 57% |

### Reuse Decisions

| Asset | Mode | Registry Ref | Saved |
|-------|------|--------------|-------|
| orb-cds | exact | registry:orb-universal-v2 | ~8 min |
| glass-panels-cds | adapt | registry:glass-panel-frosted-v2 | ~6 min |

### Missed Opportunities

1. `timeline-table-cds` — candidate `registry:creative-desk-v1` (score 72, below adapt threshold)
```

---

## Override Rules

| Scenario | Rule |
|----------|------|
| Founder force-regen | `compileMode: force-generate` bypasses reuse |
| Golden department QA | May require fresh gen for validation |
| Pack exclusive item | Reuse only if org entitled |
| Deprecated item | Reuse blocked unless pinned · suggest successor |
| Experimental item | Reuse only with `allowExperimental: true` |
| Genome incompatibility | Adapt blocked → try inherit → generate |

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Regenerate orb every compile | Orb is universal — exact reuse mandatory |
| Duplicate glass panel per department | Adapt via genome |
| Ignore reuse score ≥ 90 | Wastes provider credits |
| Reuse without dependency resolve | Broken packages |
| Cross-org reuse of custom items | License violation |

---

## Event Bus Hooks

| Event | Subscriber |
|-------|------------|
| `reuse.exact` | Usage history · Build Health |
| `reuse.adapt` | Genome adaptation telemetry |
| `reuse.missed` | Quality Engine recommendations |
| `reuse.generate` | Generation cost tracking |

---

_Reuse Engine — ask the library first._
