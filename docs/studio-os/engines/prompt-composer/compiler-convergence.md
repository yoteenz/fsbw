# Compiler Convergence™

**Engine Module:** `studio.prompt-composer.v1.compiler-convergence`  
**Status:** Manufacturing path alignment with Intent path

---

## Two Paths, One Schema

Studio OS has two compose entry points that **must** converge on `ProductionPrompt™`:

| Path | Engine | Trigger |
|------|--------|---------|
| **Intent Path™** | Prompt Composer™ | Founder intent → Scene Planner™ line item |
| **Manufacturing Path™** | [Compiler Prompt Expansion](../studio-asset-compiler/prompt-expansion-engine.md) | Department package batch · `13_prompts/{assetId}.json` |

Generation Manager™ consumes **one format** regardless of path.

---

## Mapping: ExpandedPromptStack → ProductionPrompt™

Compiler today writes `ExpandedPromptStack`. Convergence maps fields:

| ExpandedPromptStack | ProductionPrompt™ |
|---------------------|-------------------|
| `assetId` | `layerId` |
| `departmentId` | `departmentId` |
| `category` | `category` |
| `layers.base` | `layers.base` |
| `layers.physical` | `layers.physical` |
| `layers.material` | `layers.material` |
| `layers.lighting` | `layers.lighting` |
| `layers.camera` | `layers.camera` |
| `layers.architectural` | `layers.architectural` |
| `layers.negative` | `layers.negative` |
| `layers.genome` | `layers.genome` |
| `generation.resolution` | `rendering.resolution` |
| `generation.aspectRatio` | `rendering.aspectRatio` |
| `generation.qualityTier` | `quality.qualityTier` |
| `provider.preferred` | `providerHints.preferredFamilies` |
| `provider.modelRoute` | `providerHints.modelRouteRef` |
| `provider.assetType` | `providerHints.assetType` |

**Migration:** Compiler v1.1 writes native `ProductionPrompt™` JSON — `ExpandedPromptStack` becomes alias.

---

## When Each Path Runs

```
┌─────────────────────────────────────────────────────────┐
│ BATCH: Department package compile                       │
│   Compiler Prompt Expansion → ProductionPrompt™         │
│   (no founder in loop · static Genome from package)     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RUNTIME: Founder workstation generation                 │
│   Scene Planner™ → Prompt Composer™ → ProductionPrompt™│
│   (live Genome · Registry gate · founder intent)        │
└─────────────────────────────────────────────────────────┘
                              ↓
                    Provider Optimizer™
                              ↓
                    Generation Manager™
```

---

## Shared Prompt Library

Both paths read [Registry Prompt Library](../studio-asset-registry/prompt-library.md):

| Item type | Intent path | Manufacturing path |
|-----------|-------------|-------------------|
| `prompt.fragment` | Live fetch at compose | Baked into package at compile |
| `prompt.recipe` | Scene Planner selects | Compiler executes at expansion |
| `prompt.template` | Golden reuse | Copied to `13_prompts/` |

---

## Version Alignment

| Field | Source |
|-------|--------|
| `promptVersion` | `prompt-composer/{date}/{hash8}` — both paths |
| `composerVersion` | `studio.prompt-composer.v1` or `studio.asset-compiler.v1.prompt-expansion` |
| `blueprintVersion` | Active Blueprint at compose/expand time |

Registry [Canonical Asset Record™](../studio-asset-registry/canonical-asset-record.md) stores same `promptVersion` field regardless of path.

---

## Dedupe & Reuse

Both paths honor [Remember-First Law™](../studio-asset-registry/remember-first-law.md):

| Path | Gate location |
|------|---------------|
| Intent | Before Prompt Composer™ (Registry search in CIE pipeline) |
| Manufacturing | Compiler expansion pre-write dedupe |

---

## Boundary Rules

| Responsibility | Compiler | Prompt Composer™ |
|----------------|----------|------------------|
| Batch package `13_prompts/` | ✓ | — |
| Live founder intent compose | — | ✓ |
| Genome token resolution | Package snapshot | Live snapshot |
| Scene Planner input | — | ✓ |
| Output schema | ProductionPrompt™ | ProductionPrompt™ |
| Provider call | — | — (Optimizer + Manager) |

---

## v1 Status

| Item | Status |
|------|--------|
| Schema convergence spec | ✓ This document |
| Compiler writes ProductionPrompt™ natively | Future v1.1 |
| Shared validation rules | ✓ assembly-pipeline Stage ⑦ |
| Single Optimizer entry | ✓ |

---

_Compiler Convergence™ — two doors, one production truth._
