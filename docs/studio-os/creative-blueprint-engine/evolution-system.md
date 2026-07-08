# Evolution System™ — The Company Evolves Together

**Module:** `studio.creative-blueprint.v1.evolution`  
**Status:** Blueprint upgrades propagate — not room by room

---

## Principle

> Blueprints evolve. If the founder upgrades lighting, every department using that Blueprint can optionally inherit the improvement. The company evolves together — not room by room.

---

## Evolution Types

| Type | Scope | Example |
|------|-------|---------|
| **System upgrade** | One System™ within blueprint | Editorial Lighting v1.2 → v1.3 |
| **Blueprint revision** | Composite version bump | Editorial Luxury v1 → v2 |
| **Visual DNA™ chapter** | Org-wide aesthetic shift | Editorial → Executive Modern (Expedition) |
| **Asset rebind** | System points to new Registry asset | New golden lighting pack approved |

---

## Propagation Modes

When a system evolves, founder chooses propagation:

| Mode | Behavior |
|------|----------|
| **Optional Inherit™** | Each department prompted · default accept |
| **Auto-Inherit™** | All bound departments update on next visit |
| **Pin Previous™** | Department stays on old system version |
| **Staged Rollout™** | Pilot one department · then org-wide |

Default for non-breaking parameter tweaks: **Optional Inherit™**.  
Default for quality/security fixes: **Auto-Inherit™**.

---

## Evolution Flow

```
Founder upgrades Editorial Lighting System™
         ↓
Blueprint Registry creates system:editorial-lighting-v1.3.0
         ↓
Diff computed: bloom + reflection profile
         ↓
Affected departments listed (CDS · Marketing · Finance)
         ↓
Founder selects propagation mode
         ↓
Departments on Optional Inherit™ receive Orb notice:
  "Your company lighting language evolved. Apply to this room?"
         ↓
Accept → rebind assets · update Scene Stack lighting layer
Decline → pin v1.2 · coherence warning if org-wide drift
```

---

## Version Pinning

```yaml
DepartmentBlueprintPin:
  departmentId: marketing
  blueprintId: blueprint:editorial-luxury-v1
  systemPins:
    system:editorial-lighting-v1: 1.2.0    # pinned
    system:luxury-materials-v1: 1.4.0     # current
```

Pins are **explicit** — never silent drift.

---

## Coherence Monitoring

Asset Intelligence **Company DNA™** + Blueprint Engine compute **coherence score**:

| Score | Meaning |
|-------|---------|
| 90–100 | Strong single-language expression |
| 70–89 | Acceptable · accent variants declared |
| 50–69 | Drift warning · mixed unpinned systems |
| < 50 | Expedition or remediation recommended |

---

## Relationship to Production Lifecycle Evolution™

| Production Lifecycle Evolution™ | Blueprint Evolution™ |
|--------------------------------|---------------------|
| Experience maturity stage | Design language version |
| Feature unlock · polish | System parameter · asset rebind |
| Certified → Live refinement | Blueprint v1.3 certified |

Both compound — blueprint evolution does not skip lifecycle gates.

---

## Breaking Changes

| Change | Requirement |
|--------|-------------|
| Color temp shift > 500K | Founder review · preview |
| New required asset dependency | Gap gen or Marketplace |
| Removed subsystem | Migration guide · pin old |
| Visual DNA™ archetype change | Expedition milestone · chapter doc |

---

## Rollback

Prior blueprint + system versions remain in Registry:

```
Rollback editorial-lighting to v1.2.0
    ↓
Departments rebind previous asset manifest
    ↓
No provider regen if assets still approved
```

---

_Evolution System™ — upgrade once, evolve together._
