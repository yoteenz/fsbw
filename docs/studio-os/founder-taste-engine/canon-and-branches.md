# Canon™ & Alternate Branch™

**Official history · preserved explorations**

---

## Purpose

Define how founder creative decisions become **Canon™** (current truth) or **Alternate Branches™** (preserved explorations) — both feeding Founder Taste Engine™.

---

## Canon™

### Definition

**Canon™** = the founder's approved creative direction — the **current official truth** of the company.

Every approved vision · refinement · brand lock · campaign direction becomes Canon™.

### Canon Properties

| Property | Meaning |
|----------|---------|
| **Authority** | Production truth · Golden Build™ path |
| **Persistence** | Permanent company history |
| **Single active** | One Canon per creative domain at a time |
| **Versioned** | Canon evolves · history preserved |
| **Taste signal** | Strong positive weight in Taste Genome™ |

### Canon Events

| Event | Canon update |
|-------|--------------|
| Founder Selects Vision™ | Room/set Canon locked |
| Refinement approved | Node Canon updated |
| Brand identity approved | Brand Canon locked |
| Campaign direction approved | Campaign Canon locked |
| Golden Build™ certified | Canon immutable (unlock requires ceremony) |

### Canon Schema

```typescript
interface CanonRecord {
  id: string;
  companyId: string;
  domain: CanonDomain;           // 'environment' | 'brand' | 'campaign' | ...
  conceptId: string;
  sceneBlueprintId?: string;
  artifactRef: string;
  lockedAt: string;
  lockedBy: 'founder';
  tasteSnapshot: TasteDimensionTag[];  // traits at time of lock
  previousCanonId?: string;      // version chain
}
```

---

## Alternate Branch™

### Definition

**Alternate Branch™** = a rejected or exploratory concept **preserved** — not deleted.

Alternate Branches™ are:

- Creative explorations
- Future inspiration
- Parallel timelines
- Experimental directions

Studio OS **remembers them**.

### When Branches Are Created

| Trigger | Branch |
|---------|--------|
| Founder rejects concept but saves | Explicit Alternate Branch™ |
| Founder selects A · B was strong second | Auto-suggest Branch save for B |
| Founder requests "keep this direction" | Branch from current refinement |
| Blend exploration | Hybrid stored as Branch |

### Branch Properties

| Property | Meaning |
|----------|---------|
| **Non-canonical** | Not production truth |
| **Preserved** | Full artifact + blueprint retained |
| **Searchable** | Founder may revisit · "show me Concept C" |
| **Taste signal** | Reveals exploratory dimensions · nuance |
| **Activatable** | Founder may promote Branch → new Canon (ceremony) |

### Branch Schema

```typescript
interface AlternateBranch {
  id: string;
  companyId: string;
  parentCanonId?: string;
  conceptId: string;
  artifactRef: string;
  sceneBlueprintId?: string;
  savedAt: string;
  savedReason?: string;
  tasteDimensions: TasteDimensionTag[];
  status: 'archived' | 'active-exploration';
}
```

---

## Canon vs Branch Decision

```
Founder selects Concept B
        ↓
Concept B → Canon™
        ↓
Concept A · C → archived by default
        ↓
Orb: "Would you like to preserve A or C as Alternate Branches?"
        ↓
Founder: Yes / No / Both
        ↓
Branches saved → Taste Learning™ analyzes all three
```

---

## Taste Learning from Canon & Branches

| Source | Learning type |
|--------|---------------|
| **Canon selection** | Strong positive traits |
| **Rejected (not saved)** | Negative traits |
| **Alternate Branch saved** | "Also resonates" — nuance not contradiction |
| **Branch activated later** | Taste evolution signal |
| **Canon version chain** | Direction shift over time |

---

## Relationship to Creative Direction Pipeline™

[Founder Vision Selection™](../creative-direction-pipeline/founder-vision-selection.md) already archives rejected concepts.

Founder Taste Engine™ **elevates** this to platform law:

- Canon™ = universal vocabulary for approved truth
- Alternate Branch™ = universal vocabulary for preserved exploration
- Applies beyond rooms to **all** Concept First™ domains

---

## Legacy Integration

| System | Role |
|--------|------|
| [Legacy Vault™](../legacy-vault.md) | Canon milestones preserved |
| [Archive™](../production-lifecycle/archive-system.md) | Canon versions immutable |
| [Memory Engine™](../memory-engine.md) | "We chose B over A because…" |
| [World Memory™](../world/world-memory.md) | Spatial Canon state |

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Delete rejected concepts | Lose Branch value · lose taste signal |
| Multiple active Canon per domain | Production confusion |
| Branch without blueprint | Incomplete exploration |
| Canon without taste snapshot | Lose historical taste context |

---

## Cross-References

- [concept-first.md](./concept-first.md)
- [taste-learning.md](./taste-learning.md)
- [Creative Direction Pipeline™](../creative-direction-pipeline/founder-vision-selection.md)
