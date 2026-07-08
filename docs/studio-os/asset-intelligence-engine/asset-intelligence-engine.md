# Asset Intelligence Engine™ — Master Specification

**Engine ID:** `studio.asset-intelligence.v1`  
**Status:** Canonical permanent intelligence system

---

## Definition

**Asset Intelligence Engine™** is one of the permanent intelligence systems inside Studio OS.

It is not a database. It is not a generator. It is the **decision intelligence** that sits between founder intent and AI production — ensuring Studio OS **remembers everything it has ever created** and only generates when necessary.

---

## The Problem

| Waste | Cause |
|-------|-------|
| **Tokens** | Regenerating near-identical prompts and outputs |
| **Time** | Founder re-approving assets they already own |
| **Compute** | Provider calls when Registry already holds match |
| **Consistency** | Visual language drifts · departments feel unrelated |

Traditional AI treats every request as net-new. Studio OS treats every request as **a query against accumulated creative capital**.

---

## Core Laws

### Law 1 — Remember First

> Before generating… always remember.

Every generation request begins with a **Registry Search™**, not a provider call.

### Law 2 — Generation Is Last

> Generation should always be the last option. Never the first.

The Intelligence Engine must exhaust reuse paths (exact · adapt · duplicate · upgrade) before routing to **Studio Generation Manager™**.

### Law 3 — Founder Chooses

> The founder always chooses.

Studio OS recommends. The founder selects **Reuse Existing™**, **Duplicate & Modify™**, or **Generate Completely New™**.

### Law 4 — Explain WHY

> Studio OS should explain WHY it selected an asset.

Every recommendation includes compatibility score, match type, and human-readable rationale.

### Law 5 — Nothing Forgotten

> Nothing valuable should ever be forgotten or unnecessarily regenerated.

Approved assets enter **Company Memory™** permanently. Deprecation ≠ deletion.

### Law 6 — DNA Protection

> Studio OS should protect visual consistency.

**Company DNA™** strengthens when materials, lighting, and architectural language reuse coherently across departments.

---

## System Components

| Component | Responsibility |
|-----------|----------------|
| **Registry Search™** | Query Asset Registry™ by category, tags, scene, materials, lighting, style |
| **Compatibility Engine™** | Score candidates · classify match type |
| **Recommendation Engine™** | Rank options · produce founder-facing explanation |
| **Founder Control Gate™** | Pause before provider · present choices |
| **Learning Loop™** | Track reuse · rejection · preferences |
| **Company DNA™ Tracker** | Material · lighting · architecture coherence |
| **Marketplace Bridge™** | Score owned · licensed · purchasable packs |

---

## Input Contract

Any system that may trigger generation must call Intelligence first:

```yaml
IntelligenceRequest:
  requestId: string
  orgId: string
  departmentId: string
  sceneId: string | null
  stationId: string | null
  layerId: string | null          # Scene Stack™ layer when applicable
  assetIntent:
    name: string                  # e.g. "Story Table", "luxury architectural lighting"
    category: AssetCategory
    styleHints: string[]
    materialHints: string[]
    lightingProfile: string | null
    colorPalette: string[] | null
    environmentTags: string[]
  context:
    goldenBuildVersion: string | null
    companyGenomeRef: string | null
    roomDnaRef: string | null
    projectId: string | null
  constraints:
    allowMarketplace: boolean
    allowModify: boolean
    maxCompatibilityFloor: number   # default 60
```

---

## Output Contract

```yaml
IntelligenceResponse:
  requestId: string
  searchSummary:
    candidatesFound: number
    searchDurationMs: number
  recommendations: Recommendation[]   # ranked
  defaultRecommendation: Recommendation
  founderChoices:
    - Reuse Existing™
    - Duplicate & Modify™
    - Generate Completely New™
  routing:
    ifReuse: RegistryLink
    ifModify: RegistryLink + ModifySpec
    ifGenerate: GenerationManagerJob
  dnaImpact:
    strengthens: string[]             # e.g. "editorial lighting continuity"
    risks: string[]                   # e.g. "introduces new marble family"
```

---

## Recommendation Schema

```yaml
Recommendation:
  registryAssetId: string
  assetName: string
  compatibilityScore: number        # 0-100
  matchType: Exact Match™ | Close Match™ | Can Be Modified™ | Requires Upgrade™ | Generate New™
  action: Reuse Existing™ | Duplicate & Modify™ | Upgrade™ | Generate New™
  explanation: string             # human-readable WHY
  performanceCost:
    tokensSavedEstimate: number | null
    computeSavedEstimate: number | null
    timeSavedEstimate: string | null
  metadata:
    department: string
    scene: string | null
    category: string
    reuseCount: number
    lastUsed: datetime
```

---

## Example — Creative Direction Studio™

**Request:** luxury architectural lighting

```
Registry Search: Editorial Lighting Pack™
Compatibility: 96%
Match Type: Close Match™
Recommendation: Reuse Existing™
Explanation: "Three approved editorial light rigs from CDS Story Table™ and Mood Wall™ share your bronze-pool + volumetric haze profile. Reusing avoids 4 provider calls and preserves lighting continuity across stations."
```

---

## Example — Marketing Department™

**Request:** floating bronze shelves

```
Registry Search: Creative Library Shelving™
Compatibility: 91%
Match Type: Can Be Modified™
Recommendation: Duplicate & Modify Finish™
Explanation: "Reference Library™ shelving matches dimensions and float-mount style. Duplicate with brushed bronze finish swap — one partial regen vs full furniture generation."
```

---

## Example — Finance™

**Request:** dark marble flooring

```
Registry Search: Executive Marble Floor™
Compatibility: 98%
Match Type: Exact Match™
Recommendation: Reuse Existing™
Explanation: "Capital Vault™ and Executive Command Center already use this approved dark Calacatta-class floor. Exact reuse strengthens Company DNA™."
```

---

## Integration Map

| Upstream | Downstream |
|----------|------------|
| Founder · Orb · Department Runtime™ | Studio Generation Manager™ |
| Scene Stack™ layer requests | Studio Asset Registry™ |
| Creative Approval Pipeline™ | Founder Taste Engine™ |
| Marketplace purchase | Company Memory™ |
| Department Generator™ manifests | Build reports · reuse metrics |

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Skip search on "small" assets | Waste compounds at scale |
| Auto-generate without founder gate | Violates founder control |
| Recommend without explanation | Breaks trust |
| Ignore DNA drift warnings | Departments feel like different companies |
| Delete rejected assets | Alternate branches teach taste |
| Duplicate Registry logic in UI | Intelligence lives in engine layer |

---

## Final Philosophy

Studio OS should become an operating system that **accumulates creative intelligence over time**.

Every generation makes future generations smarter.  
Every approved asset increases the value of the platform.

**Generate only when necessary.**  
Otherwise — intelligently reuse, refine, and evolve the creative knowledge the company already owns.

---

_See also: [generation-order.md](./generation-order.md) · [compatibility-engine.md](./compatibility-engine.md) · [founder-control.md](./founder-control.md)_
