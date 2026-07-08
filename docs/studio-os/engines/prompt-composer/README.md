# Prompt Composer™ — The Translation Layer (v1)

**Version:** 1.0.0  
**Status:** Canonical prompt composition engine specification — architecture sprint  
**Type:** Core Studio OS Engine — not a feature, not a provider  
**Engine ID:** `studio.prompt-composer.v1`  
**Tagline:** *Intent in. Production brief out.*

---

> **The founder should never manually write production prompts.**

> **The founder only provides intent. Studio OS creates the production brief.**

---

## Mission

Translate **simple founder intent** into **world-class AI production prompts**.

**Example:**

| Founder says | Prompt Composer™ assembles |
|--------------|---------------------------|
| *"Build an editorial luxury headquarters."* | Company DNA · Department Blueprint · Workspace Rules · Camera Rules · Architectural Language · Lighting Rules · Material Library · Asset Registry References · Rendering Requirements · Quality Requirements · Negative Prompt · Provider Hints — into one **Production Prompt™** object |

Prompt Composer™ is the **translation layer** between founder intent and generation engines.

It does **not** call providers. It does **not** hardcode FAL. It outputs a **provider-neutral** `ProductionPrompt™` that [Provider Optimizer™](./provider-optimizer-handoff.md) later adapts for FAL · OpenAI Images · Flux · Imagen · and future providers.

---

## Law

```
Founder Intent™  →  Prompt Composer™  →  ProductionPrompt™  →  Provider Optimizer™  →  Generation Manager™
```

| Forbidden | Required |
|-----------|----------|
| Founder prompt textarea | Founder Intent™ voice/text/gesture |
| Hardcoded FAL strings | Provider-neutral Production Prompt™ |
| Provider-specific compose | Provider Optimizer™ downstream |
| Skip Registry references | Asset Registry™ refs in every compose |

---

## Engine Position

```
Founder Intent™
         ↓
Creative Interpreter™
         ↓
Blueprint Engine™
         ↓
Asset Registry™ (Generation Gate™)
         ↓
Scene Planner™
         ↓
★ PROMPT COMPOSER™ ★ (this engine)
         ↓
Provider Optimizer™
         ↓
Generation Manager™
         ↓
Providers (FAL · OpenAI · Flux · Imagen · future)
```

**Two compose paths converge on the same schema:**

| Path | Trigger | Entry |
|------|---------|-------|
| **Intent Path™** | Founder speaks in workstation | Scene Planner™ `GenerationLineItem` |
| **Manufacturing Path™** | Department package batch compile | [Compiler Prompt Expansion](../studio-asset-compiler/prompt-expansion-engine.md) |

Both output `ProductionPrompt™` — Generation Manager never sees two incompatible formats.

---

## What This Engine Does

| Does | Does Not |
|------|----------|
| Assemble 12 composition source layers | Execute generation |
| Resolve Genome · Blueprint · Registry refs | Select final provider (Optimizer does) |
| Emit provider-neutral `ProductionPrompt™` | Store binary artifacts |
| Version every compose (`promptVersion`) | Replace Scene Planner™ |
| Inject negative · quality · rendering gates | Expose prompts to founder UI |

---

## Document Index

| Document | Contents |
|----------|----------|
| [founder-intent-translation.md](./founder-intent-translation.md) | Intent → structured brief |
| [composition-sources.md](./composition-sources.md) | 12 source layers |
| [assembly-pipeline.md](./assembly-pipeline.md) | Compose stages · merge rules |
| [production-prompt-schema.md](./production-prompt-schema.md) | Canonical `ProductionPrompt™` object |
| [provider-neutral-contract.md](./provider-neutral-contract.md) | Provider independence law |
| [provider-optimizer-handoff.md](./provider-optimizer-handoff.md) | Optimizer · Generation Manager contract |
| [compiler-convergence.md](./compiler-convergence.md) | Manufacturing path alignment |
| [future-roadmap.md](./future-roadmap.md) | v1.1+ implementation order |

---

## Sprint Constraints

| Allowed | Forbidden |
|---------|-----------|
| Engine architecture · schema · pipeline docs | React · Three.js · Supabase |
| Cross-references · motherboard | Provider SDK integration |
| Provider-neutral contract spec | Founder-facing prompt fields |
| Example compose walkthrough | FAL-only hardcoding |

---

## Success Criteria (v1)

- [x] Mission · law · pipeline position documented
- [x] 12 composition sources specified
- [x] `ProductionPrompt™` canonical schema defined
- [x] Provider-neutral contract — never hardcode FAL
- [x] Provider Optimizer™ handoff contract
- [x] Compiler convergence path documented
- [x] Cross-refs to CIE · Registry · Generation Manager

---

_Prompt Composer™ — the founder speaks intent; Studio OS speaks production._
