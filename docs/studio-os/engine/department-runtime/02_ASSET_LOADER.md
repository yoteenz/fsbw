# 02 — Asset Loader

**Engine Module:** `studio.department-runtime.v1.asset-loader`  
**Status:** Modular loading specification  
**Philosophy:** Assets load independently — lazy, progressive, replaceable

---

## Definition

The **Asset Loader** fetches, validates, caches, and delivers individual asset modules from a Department Asset Package to runtime subsystems. Each asset loads **independently** — never as a flattened scene.

---

## Load Categories

| Category | Format | Priority | Strategy |
|----------|--------|----------|----------|
| **Materials** | JSON shader bundles | 0 — first | Eager, blocking |
| **Metadata** | JSON manifest | 0 — first | Eager, blocking |
| **Environment** | GLB | 1 | Eager, blocking |
| **Lighting** | JSON + HDR | 2 | Eager, parallel |
| **Furniture** | GLB | 3 | Progressive, parallel |
| **Glass** | GLB + shader ref | 4 | Progressive, parallel |
| **Interactive Objects** | GLB | 5 | Progressive, parallel |
| **Orb** | GLB (platform cache) | 6 | Eager |
| **Particles** | JSON | 7 | Lazy — on ACTIVE |
| **Audio** | OGG/WAV | 8 | Progressive — ambient first |
| **Animations** | GLB clips + JSON | 9 | Lazy — on zone entry |
| **Camera** | JSON | 0 | Eager, blocking |
| **Interaction Maps** | JSON | 10 | Eager, blocking |
| **Decor** | GLB | 5 | Lazy |

---

## Loader Architecture

```
Package Manifest
    ↓
Load Planner (dependency graph + priority)
    ↓
┌─────────────────────────────────────┐
│  Cache Layer (session + persistent) │
└─────────────────────────────────────┘
    ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Network  │  │ Registry │  │ Fallback │
│ Fetch    │  │ Lookup   │  │ Resolver │
└──────────┘  └──────────┘  └──────────┘
    ↓
Validator (checksum + schema)
    ↓
Asset Handle → subsystem consumer
```

---

## Independent Loading

Each asset module is a **separate fetch operation**:

```yaml
LoadTask:
  assetId: string
  path: string                        # relative in package
  category: AssetCategory
  priority: number
  dependencies: string[]              # must complete first
  strategy: enum                      # eager | progressive | lazy
  fallbackId: string | null
  version: string
  checksum: string
```

**Rules:**
- One HTTP/cache fetch per asset file
- Failed asset does not block unrelated assets
- Dependency failures block dependents only
- Parallel max: 6 concurrent fetches

---

## Lazy Loading

Assets marked `lazy` defer until runtime trigger:

| Asset | Lazy Trigger |
|-------|-------------|
| Particles | State → ACTIVE |
| Environmental audio | User enters zone |
| Celebration audio | Ceremony verb triggered |
| Object animations | Object enters camera frustum |
| Decor | Camera reveals zone |
| LOD 1+ | Camera distance threshold |

---

## Progressive Loading

**Progressive** assets stream during LOADING/ASSEMBLING states:

```
Phase 1: Environment shell visible (blocking)
Phase 2: Primary furniture silhouettes (progressive)
Phase 3: Glass + interactive objects refine (progressive)
Phase 4: Secondary furniture + decor (progressive)
```

User sees department **materialize** — never a blank wait.

---

## Asset Replacement (Hot-Swap)

When Asset Compiler regenerates a single asset:

```
1. Loader fetches new asset version (background)
2. Validator confirms checksum
3. Object Manager swaps runtime actor mesh/material
4. State Manager preserves object state
5. Animation Engine rebinds clips if changed
6. Crossfade transition (Genome refresh profile)
```

**No full department reload** except environment shell changes.

```yaml
HotSwapRequest:
  departmentId: string
  assetId: string
  newVersion: string
  preserveState: true                 # always true
```

---

## Cache Strategy

| Cache Tier | Scope | Contents | Eviction |
|------------|-------|----------|----------|
| **Session** | Per department visit | Loaded handles, Genome snapshot | On unload |
| **Persistent LRU** | Cross-session | Environment, furniture, materials | Max 50 modules |
| **Platform** | Global | Orb mesh, fallback assets | Never |
| **Genome** | Per organization | Genome snapshot | 5 min TTL |

Cache key: `{organizationId}:{packageId}:{assetId}:{version}`

---

## Fallback Resolution

```
Primary fetch
    ↓ fail
Package-declared fallbackId
    ↓ fail
SDK platform fallback (Cursor runtime fallbacks/)
    ↓ fail
Skip asset + Error Recovery (19) + Orb notification
```

Fallback assets are Genome-injectable — same slot structure as primary.

---

## Validation on Load

| Check | Action on Fail |
|-------|----------------|
| Checksum match | Retry once → fallback |
| Schema valid (JSON) | Fallback |
| GLB parseable | Fallback |
| Version compatible | Reject package (pre-flight) |
| Size within budget | Warning + load |
| Metadata sidecar present | Warning |

---

## Load Metrics

```yaml
LoadMetrics:
  departmentId: string
  totalAssets: number
  loaded: number
  failed: number
  fallbacksUsed: number
  cacheHits: number
  timeToFirstPaint: number            # environment visible
  timeToInteractive: number           # ACTIVE state
  totalBytes: number
```

Targets: first paint ≤ 2s · interactive ≤ 5s (see 16).

---

_Next: [03 — World Assembler](./03_WORLD_ASSEMBLER.md)_
