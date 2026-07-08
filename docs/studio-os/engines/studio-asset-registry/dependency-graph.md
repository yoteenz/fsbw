# Dependency Graph — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.dependency-graph`  
**Status:** Relationship model · graph resolution · impact analysis

---

## Purpose

Every Registry Item participates in a **directed acyclic graph (DAG)**. The graph answers:

- What does this item **belong to**?
- What does it **depend on**?
- What **uses** it?
- Which **Pack** introduced it?
- Which **departments** consume it?
- Which **generators** support it?
- Which **runtime features** require it?

---

## Relationship Types

| Type | Direction | Description |
|------|-----------|-------------|
| `belongsTo` | item → container | Category · Pack · Department · Zone |
| `requires` | item → dependency | Hard dependency — must resolve |
| `recommends` | item → peer | Soft pairing — Compiler suggests |
| `conflicts` | item ↔ item | Mutually exclusive |
| `dependedOnBy` | item ← dependent | Inverse of `requires` |
| `usedBy` | item ← consumer | Department package · Runtime session |
| `introducedBy` | item ← origin | Pack · Generator · Compiler run |
| `forkedFrom` | item ← parent | Custom fork lineage |
| `successorOf` | item ← deprecated | Deprecation chain |
| `enables` | item → feature | Runtime capability unlocked |
| `supportedBy` | item ← generator | Generator compatibility |

---

## Graph Schema

```yaml
DependencyGraph:
  schema: studio.asset-registry.v1/dependency-graph
  graphId: string
  generatedAt: ISO8601
  nodes: GraphNode[]
  edges: GraphEdge[]

GraphNode:
  registryId: string
  version: string
  category: string
  lifecycle: string

GraphEdge:
  from: string                    # registryId
  to: string                      # registryId
  type: RelationshipType
  weight: number                  # 0-1 strength for recommendations
  metadata: object
```

---

## Belongs-To Hierarchy

```
Platform
  └── Category (registry:category-furniture-v1)
        └── Registry Item (registry:executive-chair-luxury-v3)
              └── Artifact (artifact://meshes/…)

Pack (registry:pack-luxury-office-v1)
  └── Pack Member Items[]
        └── registry:executive-chair-luxury-v3

Department Template (registry:dept-template-creative-direction-v1)
  └── Zone (mood-wall)
        └── registry:mood-wall-hero-v1

Organization (frontal-slayer)
  └── Custom Item (lifecycle: custom)
        └── forkedFrom → platform item
```

---

## Dependency Resolution Algorithm

```
resolve(itemId, context):
  1. Fetch item at resolved version
  2. For each requires[]:
     a. Resolve version constraint
     b. Recurse resolve (depth-first)
     c. Fail if missing and not optional
  3. Collect recommends[] (non-blocking)
  4. Check conflicts[] against resolved set
  5. Return ResolvedBundle { items[], artifacts[], prompts[] }
```

**Context parameters:**

| Param | Purpose |
|-------|---------|
| `orgId` | Scope custom + entitled pack items |
| `packIds` | Marketplace entitlements |
| `lifecycleFilter` | Default: approved, marketplace, premium |
| `genomeSnapshot` | Validate genome slot dependencies |
| `compileMode` | full · reuse-only · prompt-only |

---

## Compiler Dependency Integration

Studio Asset Compiler™ dependency resolution ([dependency-resolution.md](../studio-asset-compiler/dependency-resolution.md)) **extends** Registry graph:

```
asset-manifest.json dependencies
         +
Registry requires[] for reused items
         +
Prompt fragment dependencies
         ↓
Unified Compile Dependency Graph
         ↓
12-stage generation queue (prune reused subgraph)
```

When reuse links a Registry item:

```json
{
  "assetId": "glass-panels-cds",
  "resolution": "reuse",
  "reusedFrom": "registry:glass-panel-frosted-v2@3.1.0",
  "prunedStages": [5],
  "inheritedDependencies": [
    "registry:brass-material-v2",
    "registry:prompt-fragment-glass-frosted-v1"
  ]
}
```

Inherited dependencies merge into compile graph — reuse does not skip dependency validation.

---

## Impact Analysis

Before deprecating or archiving, Registry runs **impact analysis**:

```yaml
ImpactReport:
  targetId: registry:glass-panel-frosted-v2
  dependedOnBy:
    - registry:pack-luxury-office-v1 (pack-member)
    - pkg-creative-direction-golden-v1 (department-package)
    - registry:dept-template-law-office-v1 (template)
  usedByOrganizations: [frontal-slayer, ndxbook]
  estimatedAffectedPackages: 12
  recommendedSuccessor: registry:glass-panel-frosted-v3
```

Founder gate required when `estimatedAffectedPackages > 0`.

---

## Pack Introduction Graph

Marketplace Pack injection creates edges:

```
purchase(pack-luxury-office-v1, orgId)
    ↓
for each item in pack.manifest.items[]:
    create edge: introducedBy → pack
    create edge: belongsTo → pack
    set licensing.orgScoped entitlement for orgId
    ↓
Event Bus: pack.injected
```

Pack items remain in global graph — org entitlement controls **access**, not **existence**.

---

## Generator Support Graph

```
registry:executive-chair-luxury-v3
    supportedBy:
      - studio-asset-compiler (mesh expansion + packaging)
      - asset-factory (direct manufacturing)
      - department-generator (blueprint seed)

registry:prompt-fragment-glass-frosted-v1
    supportedBy:
      - studio-asset-compiler (prompt-expansion base layer)
      - studio-asset-registry (direct query)
```

Generators declare supported categories in their engine spec — Registry cross-references at registration.

---

## Runtime Feature Requirements

Some runtime features require specific Registry items:

| Runtime Feature | Required Registry Items |
|-----------------|------------------------|
| Orb greeting ceremony | `orb-universal` + `orb.behavior.greeting` |
| Glass inspect overlay | `glass-panel` + `interaction-inspect-overlay` |
| Mood wall compare | `interactive-wall-hero` + compare interaction |
| Genome tint live swap | material with `genomeSlots[]` |
| Concierge hologram | `hologram-display` + `concierge` + `ai-personality` |
| Walk path tour | `walk-path` + `animation` choreography |

Runtime boot validates `15_runtime/assembly-manifest.json` against Registry graph.

---

## Circular Dependency Prevention

| Rule | Enforcement |
|------|-------------|
| No A requires B requires A | Registration validation |
| Pack cannot require item that requires pack | Pack manifest validation |
| Prompt fragment cannot require mesh that requires same prompt | Category separation |
| Department template cycles | Template lint at Generator output |

Violations block `approved` promotion.

---

## Graph Visualization (Future)

v2+ Registry UI renders:

- **Radial view** — item center · dependencies orbit
- **Pack view** — pack container · member items
- **Department view** — zone → asset mapping
- **Impact view** — deprecation blast radius

v1 spec defines data model only.

---

## Creative Direction Studio™ Graph Seed

Example subgraph from golden department:

```
registry:dept-template-creative-direction-v1
  ├── requires: registry:environment-shell-atelier-v1
  ├── requires: registry:lighting-rig-editorial-v1
  └── zones:
        mood-wall → registry:mood-wall-hero-v1
          ├── requires: registry:glass-panel-frosted-v2
          └── enables: interaction-compare-approve
        orb-zone → registry:orb-universal-v2
          ├── requires: registry:orb-behavior-greeting-v1
          └── enables: concierge-greeting-ceremony
```

This seed validates graph schema against real department structure.

---

_Dependency Graph — nothing exists in isolation._
