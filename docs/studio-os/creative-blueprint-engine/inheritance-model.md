# Inheritance Model™ — Cohesive From Day One

**Module:** `studio.creative-blueprint.v1.inheritance`  
**Status:** New departments never begin empty

---

## Law

> New departments should never begin empty.

They inherit the full creative stack:

```
Visual DNA™
    ↓
Blueprint™
    ↓
Systems™
    ↓
Assets™
    ↓
Interactions™
```

The founder immediately sees a **cohesive headquarters** — not a blank SaaS page waiting for generation.

---

## Inheritance Chain

```yaml
InheritanceRecord:
  orgId: string
  target:
    type: headquarters | department | scene | station
    id: string
  chain:
    visualDna: VisualDNARef
    blueprint: BlueprintRef @ version
    systems: SystemRef[]
    assets: AssetBinding[]
    interactions: InteractionBinding[]
  variant: full | accent-open | executive-formal | custom
  overrides: Override[]              # explicit founder exceptions only
  inheritedAt: datetime
```

---

## New Department Flow

```
Founder: "Add Marketing department"
         ↓
Resolve org Visual DNA™ (Editorial Luxury™)
         ↓
Resolve active Blueprint™ (Editorial Luxury Blueprint™)
         ↓
Apply department variant (accent-open)
         ↓
Bind Systems™ bundle
         ↓
Asset Intelligence: link existing blueprint-bound assets
         ↓
Gap report: 3 assets missing · 12 reused
         ↓
Founder: Apply Existing™ (default) · partial gen for gaps only
         ↓
Department Runtime™ assembles inherited world
```

**No empty room.** Coherent shell on first visit.

---

## Headquarters Inheritance

HQ wings inherit org primary blueprint:

| Wing | Typical Variant |
|------|-----------------|
| Executive Lobby | `full` |
| Operations | `executive-formal` |
| Innovation Lab | `experimental-accent` (declared) |
| Legacy | `heritage` (timeline-locked) |

Living Headquarters™ atmosphere respects blueprint **Atmospheric Language™**.

---

## Scene & Station Inheritance

Within a department:

```
Department Blueprint
    ↓
Scene inherits department blueprint (no drift)
    ↓
Station inherits scene + station role modifiers
    ↓
Scene Stack™ layers inherit system mappings
```

Station role modifiers are **parameters** inside systems — not new blueprints.

---

## Interaction Inheritance

**Orb Interaction System™** · **Transition Language™** · **Typography Language™** inherit at org level.

Founder does not reconfigure Orb chrome per department unless blueprint variant declares it.

---

## Override Rules

| Override Type | Allowed | Audit |
|---------------|---------|-------|
| Blueprint variant per department | Yes | Logged |
| Temporary expedition accent | Yes · time-boxed | Milestone |
| Single-asset swap inside system | Via Asset Intelligence gate | Yes |
| New blueprint without founder choice | **No** | Blocked |
| System parameter tweak | Via system evolution | Versioned |

---

## Empty State Forbidden

| Context | Required Minimum |
|---------|------------------|
| New department | Visual DNA™ + Blueprint™ + core Systems™ |
| New scene | Parent department inheritance |
| New station | Parent scene + Scene Stack layer map |
| New company | Visual DNA™ template from Mode™ · Industry |

---

## Cross-Company Inheritance (Future)

Studio Originals™ · Marketplace blueprints seed new companies:

```
New org founded
    ↓
Visual DNA™: Editorial Luxury™ (template)
    ↓
Blueprint: Editorial Luxury Blueprint™ (licensed)
    ↓
Assets: partial platform seed + generate gaps
```

Same language from day one — different genome expression.

---

_Inheritance Model™ — cohesive before generation._
