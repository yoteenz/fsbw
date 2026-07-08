# Remember-First Law™

**Engine Module:** `studio.asset-registry.v1.remember-first`  
**Status:** Foundational law — generation is last resort

---

## Mission

> Every generated asset should become a **reusable company asset**.

> Studio OS should **never** generate something it already owns unless the founder explicitly requests a **variation**.

---

## The Law

```
BEFORE every generation:

  Does a reusable asset already exist?

  YES → recommend reuse
  NO  → generate new asset → auto-register on approval
```

No engine may invoke a provider without Registry consultation.

---

## Who Must Ask

| Engine | Gate |
|--------|------|
| [Asset Intelligence Engine™](../../asset-intelligence-engine/README.md) | Founder-facing search · explain · Founder Control™ |
| [Creative Intelligence Engine™](../../creative-intelligence-engine/README.md) | Scene Planner™ · Prompt Composer™ path |
| [Studio Generation Manager™](../generation-manager/README.md) | Job queue — blocked without registry resolution |
| [Studio Asset Compiler™](../studio-asset-compiler/README.md) | Batch compile stages |
| [Reuse Engine](./reuse-engine.md) | Compiler Smart Reuse |

---

## Variation Exception

Founder may explicitly request:

| Request | Registry behavior |
|---------|-------------------|
| **Generate Completely New™** | Skip reuse · new Registry Item on approve |
| **Duplicate & Modify™** | Link parent · new version branch |
| **Force regen** | New generation job · may supersede prior version |

Without explicit variation request — **reuse is default recommendation**.

---

## Company Asset Definition

A **company asset** is any Registry Item with:

- `orgId` scope (or platform + org license)
- `status.lifecycle` ≥ `approved` (or `generated` pending QA)
- Complete [canonical record](./canonical-asset-record.md)
- Artifact reference stored

Draft explorations are internal — not promoted to reuse candidates until approved.

---

## Failure Modes (Forbidden)

| Failure | Consequence |
|---------|-------------|
| Generate without registry query | Engine violation · logged |
| Duplicate approved asset silently | Waste · portfolio health penalty |
| Skip auto-registration on approve | Asset amnesia · forbidden |
| Cross-org reuse without license | Privacy violation |

---

## Orb Narration

> *"I found an existing Editorial Lighting layer — reusing saves approximately $0.62."*

> *"You already own a compatible Environment Shell for Story Table™. Shall I reuse it?"*

---

## Relationship to Creative Equity™

Every registered asset seeds [Creative ROI™](../../creative-equity/creative-roi.md).

Reuse increases equity · redundant generation does not.

---

_Remember-First Law™ — the library remembers so Studio OS never forgets._
