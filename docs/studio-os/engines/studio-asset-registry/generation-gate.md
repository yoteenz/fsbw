# Generation Gate™

**Engine Module:** `studio.asset-registry.v1.generation-gate`  
**Status:** Mandatory pre-generation Registry consultation

---

## Law

> **Every future generation must first ask:** Does a reusable asset already exist?

---

## Gate Flow

```
Generation request (any engine)
         ↓
★ GENERATION GATE ★
  queryRegistry(criteria)
         ↓
┌────────┴────────┐
│ MATCH FOUND     │ NO MATCH
↓                 ↓
Recommend reuse   Proceed to generate
Founder Control™      ↓
         │         Auto-register on complete
         └─────────┘
```

Gate is **mandatory** — not advisory.

---

## Query Criteria

Extracted from generation context:

```yaml
GenerationGateQuery:
  orgId: string
  category: AssetCategory
  reuseCategory: string | null
  departmentId: string
  workspaceSceneId: string | null
  layerId: string | null
  blueprintId: string | null
  materials: string[]
  lightingProfile: string | null
  tags: string[]
  compatibilityContext: CompatibilityContext
```

---

## Match Results

| Result | Action |
|--------|--------|
| **Exact Match™** | Block generation · link asset · usageCount++ |
| **Close Match™** | Recommend reuse · founder confirm |
| **Can Be Modified™** | Recommend Duplicate & Modify™ |
| **Requires Upgrade™** | Suggest certification upgrade path |
| **Generate New™** | Gate opens · provider may run |

Aligns with [Asset Intelligence Engine™](../../asset-intelligence-engine/compatibility-engine.md).

---

## Gate Enforcement Points

| Entry point | Enforcer |
|-------------|----------|
| Founder workstation action | Asset Intelligence Engine™ |
| Creative Intelligence Scene Planner™ | Registry search in plan phase |
| Generation Manager™ `job.enqueue` | Hard block without gate token |
| Studio Asset Compiler™ stage | Reuse Engine™ |
| Scene Stack™ layer regen | `useSceneStack` + registry hook |

```yaml
GenerationGateToken:
  queryId: string
  result: reuse | modify | generate
  linkedAssetId: uuid | null
  expiresAt: ISO8601
  approvedBy: founder | pipeline-auto
```

Generation Manager™ requires valid token on `job.enqueue`.

---

## Founder Override

Founder explicit **Generate Completely New™**:

- Gate records override reason
- New asset on approve
- Orb explains trade-off (cost · consistency)

---

## Internal vs Founder Messaging

| Internal log | Founder sees |
|--------------|--------------|
| `reuseCategory match 94%` | "Compatible lighting found" |
| `registry:editorial-light-v3` | "Editorial Luxury Lighting™" |
| Gate blocked | "Reuse recommended" |

---

## Metrics

| Metric | Purpose |
|--------|---------|
| `gateReuseRate` | % requests resolved without generation |
| `gateFalseNegative` | Regenerated duplicate — quality audit |
| `avgGateLatencyMs` | Search performance |

Feed [Creative Efficiency™](../../creative-portfolio/creative-efficiency.md).

---

_Generation Gate™ — ask the library before spending creative capacity._
