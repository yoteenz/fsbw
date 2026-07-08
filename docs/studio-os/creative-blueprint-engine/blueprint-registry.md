# Blueprint Registry™ — Reusable Design Language Catalog

**Module:** `studio.creative-blueprint.v1.registry`  
**Status:** Blueprint metadata · search · versioning

---

## Purpose

**Blueprint Registry™** stores every Creative Blueprint™ and System™ as searchable, versioned, reusable platform intelligence.

Analogous to Asset Registry™ for objects — but for **design languages**.

---

## Blueprint Record Fields

Every Blueprint™ contains:

| Field | Description |
|-------|-------------|
| **Blueprint ID™** | `blueprint:{slug}-v{n}` |
| **Name™** | Editorial Luxury Blueprint™ |
| **Company™** | orgId · platform · marketplace publisher |
| **Compatible Industries™** | beauty · agency · law · medical · etc. |
| **Visual Style™** | Links Visual DNA™ archetype |
| **Material Systems™** | Bound system IDs |
| **Lighting Systems™** | Bound system IDs |
| **Audio Systems™** | Bound system IDs |
| **Motion Systems™** | Bound system IDs |
| **Environmental FX™** | Bound system IDs |
| **Transition Systems™** | Bound system IDs |
| **Asset Dependencies™** | Required Registry asset IDs |
| **Performance Cost™** | Aggregate original generation cost of bound assets |
| **Reuse Count™** | Departments · scenes using this blueprint |
| **Founder Rating™** | Explicit · implicit from retention |
| **Compatibility™** | Industry · mode · genome fit score |
| **Golden Build Version™** | Certified pipeline version |

Everything becomes reusable.

---

## Registry Record Schema

```yaml
BlueprintRegistryItem:
  blueprintId: blueprint:editorial-luxury-v1
  version: 1.4.0
  schemaVersion: 1.0.0
  identity:
    name: Editorial Luxury Blueprint™
    visualDnaId: visual-dna:editorial-luxury
    description: string
  scope:
    orgId: org:frontal-slayer | platform | marketplace:{publisher}
    visibility: private | org | marketplace
  compatibility:
    industries: [beauty, agency, creator]
    modes: [entrepreneur, creator, agency]
    departments: [creative-direction, marketing, executive]
    genomeProfile: genome:editorial-luxury-starter
  systems:
    materials: system:luxury-materials-v1
    lighting: system:editorial-lighting-v1
    architecture: system:architectural-atelier-v1
    glass: system:glass-smoked-v1
    atmosphere: system:soft-atmosphere-v1
    motion: system:slow-ambient-v1
    audio: system:warm-minimal-v1
    orb: system:orb-host-editorial-v1
    transitions: system:gallery-walk-v1
    color: system:warm-bronze-palette-v1
    typography: system:futura-editorial-v1
    fx: system:milestone-glow-v1
  assetDependencies:
    required: [registry:editorial-lighting-pack, registry:dark-marble-executive]
    recommended: [registry:bronze-trim-system]
  metrics:
    reuseCount: number
    departmentCount: number
    performanceCost: PerformanceCostAggregate
    founderRating: number | null
    compatibilityScore: number
  provenance:
    goldenBuildVersion: golden-build-v1
    createdAt: datetime
    lastEvolvedAt: datetime
    forkedFrom: blueprintId | null
```

---

## System Registry Sub-Index

Systems are first-class registry items linked to blueprints:

```
BlueprintRegistry
├── blueprints[]
└── systems[]
    └── editorial-lighting-v1
        └── assetBindings[]
```

---

## Search Dimensions

| Index | Query Examples |
|-------|----------------|
| Visual DNA™ | *"Editorial Luxury"* |
| Industry | *"law office compatible"* |
| Department | *"marketing variant"* |
| System completeness | *"has lighting + materials"* |
| Marketplace | *"licensed hospitality blueprints"* |
| Reuse popularity | *"most reused in beauty"* |

---

## Versioning

| Rule | Behavior |
|------|----------|
| Never overwrite | New version · prior preserved |
| Active pin | Departments pin `blueprintId@version` until evolve |
| Deprecation | Successor declared · migrate path documented |
| Fork | Duplicate Blueprint™ creates new lineage |

---

## Link to Asset Registry™

```yaml
AssetToBlueprintLink:
  registryAssetId: registry:editorial-lighting-pack
  boundSystems: [system:editorial-lighting-v1]
  boundBlueprints: [blueprint:editorial-luxury-v1]
  role: primary-rig
```

Asset Intelligence searches **within blueprint context** when `blueprintId` is set on request.

---

## Org vs Platform vs Marketplace

| Scope | Contents |
|-------|----------|
| **Platform** | Universal systems (Orb · glass baseline) |
| **Organization** | Company-evolved blueprints |
| **Marketplace** | Licensed blueprint products |

---

_Blueprint Registry™ — design languages on file._
