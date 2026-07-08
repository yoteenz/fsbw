# Search System — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.search`  
**Status:** Discovery · natural language · ranking spec

---

## Purpose

The Registry should eventually support **natural language search** — founders discover reusable assets by intent, not ID.

v1 defines the **search intelligence contract**. Vector DB and UI are future implementation.

---

## Search Modes

| Mode | Input | Example |
|------|-------|---------|
| **Natural language** | Plain English query | "Show luxury marble conference tables" |
| **Structured filter** | Facet combination | `category:furniture + industry:law` |
| **Registry ref** | Exact ID | `registry:glass-panel-frosted-v2` |
| **Reuse lookup** | Compiler criteria | `reuseCategory:glass-panel + genomeSlots:materialLanguage` |
| **Semantic similar** | Item ID → similar | "Find items like registry:orb-universal-v2" |
| **Pack browse** | Pack ID | All items in `pack-luxury-office-v1` |
| **Dependency trace** | Item ID → graph | "What uses registry:brass-material-v2?" |

---

## Natural Language Examples

| Query | Expected Results |
|-------|------------------|
| "Show luxury marble conference tables" | `furniture.tables.conference` + `material.marble` + high `luxuryLevel` affinity |
| "Find holographic displays for law firms" | `hologram` + `industry:law` + `pack-law-office` items |
| "Show immersive lighting for creative agencies" | `lighting` + `industry:agency` + high `editorialLevel` |
| "Find every asset compatible with Frontal Slayer" | `compatibility.companyGenome` + org presets + usage in `frontal-slayer` |
| "Show everything using Orb animations" | `orb` + `animation` + `dependedOnBy: orb-universal` |
| "What prompts exist for frosted glass?" | `prompt.fragment.glass` + `reuseCategory:prompt-glass-panel` |
| "Reuse candidates for creative direction department" | `department:creative-direction` + `lifecycle:approved` + high reuseConfidence |

---

## Search Request Schema

```yaml
RegistrySearchRequest:
  schema: studio.asset-registry.v1/search-request
  query: string                     # natural language or structured
  mode: enum                        # natural | structured | ref | reuse | similar
  scope:
    orgId: string
    entitledPacks: string[]
    lifecycle: string[]             # default: approved, marketplace, premium
  filters:
    categories: string[]
    subcategories: string[]
    industries: string[]
    departments: string[]
    tags: string[]
    qualityMin: number
    performanceMin: number
    reuseConfidenceMin: number
    packId: string
    creator: string
  sort:
    field: enum                     # relevance | quality | usage | recent | reuseConfidence
    direction: asc | desc
  pagination:
    offset: number
    limit: number                   # default 25, max 100
```

---

## Search Response Schema

```yaml
RegistrySearchResponse:
  query: string
  interpretedFilters: object        # NL → structured translation
  totalMatches: number
  results: SearchResultItem[]
  facets: FacetCounts
  suggestions: string[]             # query refinements

SearchResultItem:
  registryId: string
  version: string
  name: string
  category: string
  subcategory: string
  thumbnailRef: string
  relevanceScore: number            # 0-100
  matchReasons: string[]            # human-readable why matched
  lifecycle: string
  packExclusive: boolean
  orgEntitled: boolean
```

---

## Natural Language Processing Pipeline

```
User query (natural language)
         ↓
1. Intent classification
   - find-assets · find-prompts · find-packs · trace-deps · reuse-lookup
         ↓
2. Entity extraction
   - categories · industries · materials · departments · brands · adjectives
         ↓
3. Filter construction
   - map entities → RegistrySearchRequest.filters
         ↓
4. Scope application
   - org entitlements · lifecycle · pack visibility
         ↓
5. Candidate retrieval
   - index lookup (category · tag · reuseCategory · embedding)
         ↓
6. Ranking (see below)
         ↓
7. Response + facets + suggestions
```

Studio Intelligence Layer™ (M122) routes NL queries — Registry provides domain schema, not raw LLM answers.

---

## Ranking Algorithm

| Signal | Weight | Description |
|--------|--------|-------------|
| Text relevance | 25% | Name · description · tags match |
| Category precision | 20% | Exact subcategory > parent |
| Industry affinity | 15% | `compatibility.industries` overlap |
| Quality score | 10% | `scores.quality` |
| Reuse confidence | 10% | Proven reuse history |
| Usage popularity | 10% | `usageHistory.totalUses` |
| Recency | 5% | `metadata.updatedAt` |
| Org entitlement boost | 5% | Entitled pack items +5 when `preferPackItems` |

Deprecated items rank below Approved. Draft/Archived excluded unless explicit filter.

---

## Faceted Navigation

Default facets on every search response:

| Facet | Values |
|-------|--------|
| `category` | Top-level categories |
| `subcategory` | Dot-notation children |
| `industry` | Industry compatibility |
| `department` | Department compatibility |
| `lifecycle` | approved · marketplace · premium · ... |
| `pack` | Pack membership |
| `qualityTier` | golden · approved · ... |
| `creator` | studio · organization · marketplace |
| `reuseCategory` | Reuse matcher groups |
| `genomeAdaptability` | high · medium · low bands |

---

## Semantic Similarity (Future)

v2+ embedding index on:

- `identity.description`
- `promptContent.text` (prompt items)
- `tags[]`
- Visual embedding from `preview.thumbnailRef`

Enables: *"Find items visually similar to this chair"* without exact category match.

v1 spec reserves `embeddingRef` field on Registry Item metadata.

---

## Command Dock Integration

Registry search powers Command Dock asset discovery:

```
Founder: "Do we have a luxury salon chair?"
         ↓
Command Dock → RegistrySearch (natural)
         ↓
"I found 3 salon seating assets in your library. The highest-rated is
 Executive Lounge Chair (registry:salon-chair-v1, quality 91).
 Shall I use it in the current department compile?"
```

Proactive suggestions when Compiler reports missed reuse opportunities.

---

## Compiler Reuse Lookup

Smart Reuse uses specialized search — subset of full search:

```yaml
ReuseLookupRequest:
  reuseCategory: string
  dimensionsBand: object
  genomeSlotsRequired: string[]
  industry: string
  department: string
  orgId: string
  minReuseConfidence: 60          # default
```

Returns ranked candidates for [reuse-engine.md](./reuse-engine.md) — not general discovery.

---

## Search Index Structure

```yaml
SearchIndex:
  schema: studio.asset-registry.v1/search-index
  updatedAt: ISO8601
  entries:
    - registryId: string
      tokens: string[]              # inverted index
      categoryPath: string
      tags: string[]
      industries: string[]
      departments: string[]
      reuseCategory: string
      lifecycle: string
      scores: object
      packIds: string[]
      orgScoped: boolean
```

Index rebuilds on: `item.registered` · `item.approved` · `pack.injected` · score update.

---

## Privacy & Scope

| Rule | Behavior |
|------|----------|
| Org custom items | Visible only to owning org in search |
| Pack exclusive | Visible only to entitled orgs |
| Internal lifecycle | Studio orgs only |
| Cross-org search | Never — org boundary enforced |
| Marketplace browse | Pre-purchase preview · view-only items |

---

## Performance Targets (Implementation)

| Operation | Target |
|-----------|--------|
| Registry ref lookup | < 10ms |
| Structured filter search | < 50ms |
| Natural language search | < 500ms |
| Reuse lookup (Compiler) | < 100ms |
| Facet aggregation | < 50ms |

Reuse lookup is on Compiler hot path — must be precomputed in `RegistrySnapshot.reuseIndex`.

---

## Example Structured Query

```json
{
  "mode": "structured",
  "filters": {
    "categories": ["furniture"],
    "subcategories": ["furniture.tables.conference"],
    "tags": ["marble", "luxury"],
    "industries": ["law", "agency"],
    "qualityMin": 85
  },
  "sort": { "field": "reuseConfidence", "direction": "desc" },
  "scope": { "orgId": "frontal-slayer", "lifecycle": ["approved", "marketplace"] }
}
```

---

_Search System — find by intent, not inventory spreadsheets._
