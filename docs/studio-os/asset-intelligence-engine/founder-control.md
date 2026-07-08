# Founder Control™ — Choose Before Generation

**Module:** `studio.asset-intelligence.v1.founder-control`  
**Status:** Mandatory gate before provider execution

---

## Law

> The founder always chooses.

Studio OS recommends. The founder decides. **No provider call without explicit or delegated founder consent** when reuse candidates exist.

---

## The Gate

When Compatibility Engine™ finds one or more candidates above floor (default 60):

```
┌─────────────────────────────────────────────────────────┐
│  We already own three compatible lighting systems.        │
│                                                         │
│  ★ Editorial Lighting Pack™          96% match          │
│    Reuse preserves CDS lighting continuity              │
│                                                         │
│  ○ Warm Pool Lighting v2             89% match          │
│  ○ Mood Wall Editorial Rig           87% match          │
│                                                         │
│  [ Reuse Existing™ ]                                    │
│  [ Duplicate & Modify™ ]                                │
│  [ Generate Completely New™ ]                           │
└─────────────────────────────────────────────────────────┘
```

---

## Three Founder Choices

| Choice | When to Use | Provider |
|--------|-------------|----------|
| **Reuse Existing™** | Exact or Close Match™ | **None** |
| **Duplicate & Modify™** | Can Be Modified™ | Partial (delta only) |
| **Generate Completely New™** | Novel expression · reject all candidates | Full |

Fourth implicit path: **Upgrade™** — surfaced when Requires Upgrade™ — founder confirms targeted quality pass.

---

## Choice Semantics

### Reuse Existing™

- Links `registryAssetId` to request
- Increments `Reuse Count™`
- Updates `Last Used™`
- Records savings in build report
- **Environment Shell™ · lighting · materials** — default when score ≥ 85

### Duplicate & Modify™

- Forks Registry item → new `Asset ID™`
- `forkedFrom` parent preserved
- Modify spec captures deltas (finish · scale · palette · content)
- Partial Generation Manager™ job
- Parent remains available for other departments

### Generate Completely New™

- Bypasses reuse candidates
- Full Intelligence request logged as `founderOverride: true`
- Not penalized — teaches preference ("founder wanted novel")
- Generation Manager™ full job

---

## Delegation Modes

| Mode | Behavior |
|------|----------|
| **Always Ask** | Default for Golden Build™ · Scene Stack™ layers |
| **Trust Exact** | Auto-reuse when Exact Match™ ≥ 98% · notify after |
| **Trust Recommendations** | Auto-follow default when score ≥ 95 · founder can undo |
| **Pipeline Batch** | Creative Approval Pipeline™ batch — review at end |

Delegation is org setting · never platform default for first Golden Build™.

---

## Orb Presentation

Orb narrates recommendations — never raw scores alone:

> *"Your company already built editorial lighting for the Story Table. I can reuse it here — same bronze pools, same mood — or we can create something new for this station."*

Orb does **not** pressure reuse. Presents savings as information, not mandate.

---

## When Gate Is Skipped

| Scenario | Rule |
|----------|------|
| No candidates above floor | Proceed to Generate New™ · inform founder |
| Founder pre-selected "always new" for category | Skip search · log override |
| Emergency maintenance regen | Policy Engine™ may allow · audit trail |
| Marketplace preview (not production) | Search only · no gate |

Skipped gate events are **audited**.

---

## Interaction with Creative Approval Pipeline™

```
Intelligence Gate (reuse vs generate)
         ↓
Generation (if needed)
         ↓
Creative Review™ / Braintrust
         ↓
Founder Review™
         ↓
Approve → Registry
```

Reuse Existing™ may skip generation stages but **never** skips approval for first use in a new department context.

---

## Undo & Branch

| Action | Support |
|--------|---------|
| Undo reuse | Swap registry link · restore prior |
| Branch from reuse | Duplicate & Modify™ from linked asset |
| Compare | Side-by-side reuse vs generate preview (v2) |

---

## Anti-Patterns

| Anti-Pattern | Why |
|--------------|-----|
| Auto-generate when 96% match exists | Wastes trust and tokens |
| Hide cheaper reuse path | Violates operating system promise |
| Force reuse without modify option | Founder may need fork |
| Skip gate in "speed mode" | Speed ≠ waste |

---

_Founder Control™ — recommend, never assume._
