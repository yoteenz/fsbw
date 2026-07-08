# Asset Schema — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.item-schema`  
**Schema ID:** `studio.asset-registry.v1/registry-item`  
**Status:** Canonical Registry Item definition

---

## Purpose

Every reusable resource in Studio OS — from a marble material to a full Department Package — is represented as a **Registry Item** with a unified metadata schema.

Binary artifacts (GLB, PNG, MP3) are **referenced**, not embedded in the intelligence plane.

---

## Registry Item Schema

```json
{
  "$schema": "studio.asset-registry.v1/registry-item.json",
  "registryId": "registry:executive-chair-luxury-v3",
  "version": "3.1.0",
  "schemaVersion": "1.0.0",

  "identity": {
    "name": "Executive Chair — Luxury Editorial",
    "slug": "executive-chair-luxury",
    "category": "furniture",
    "subcategory": "seating.executive",
    "reuseCategory": "seating-executive",
    "description": "Modular executive chair with genome-tint upholstery and brass detail slots",
    "creator": {
      "type": "studio",
      "id": "studio-os-core",
      "displayName": "Studio OS"
    }
  },

  "status": {
    "lifecycle": "approved",
    "visibility": "platform",
    "qualityTier": "golden",
    "reviewedAt": "2026-07-08T00:00:00Z",
    "reviewedBy": "founder-approval-gate"
  },

  "preview": {
    "thumbnailRef": "artifact://thumbnails/executive-chair-luxury-v3.webp",
    "previewType": "mesh-360",
    "previewRefs": ["artifact://previews/executive-chair-luxury-v3-hero.webp"]
  },

  "dependencies": {
    "requires": [
      { "registryId": "registry:brass-material-v2", "versionConstraint": ">=2.0.0", "optional": false },
      { "registryId": "registry:leather-upholstery-genome-slot", "versionConstraint": "*", "optional": false }
    ],
    "recommended": [
      { "registryId": "registry:executive-desk-luxury-v2", "reason": "visual-pairing" }
    ],
    "conflicts": [
      { "registryId": "registry:executive-chair-basic-v1", "reason": "duplicate-role" }
    ]
  },

  "compatibility": {
    "departments": ["creative-direction", "executive", "legal", "marketing"],
    "industries": ["agency", "law", "beauty", "restaurant", "medical", "construction"],
    "brandAdaptability": "high",
    "companyGenome": {
      "compatible": true,
      "genomeSlots": ["materialLanguage", "colorSystem", "editorialDirection"],
      "adaptationProfile": "registry:genome-adapt-furniture-luxury-v1"
    },
    "roomDna": {
      "compatible": true,
      "sliderInfluence": ["luxuryLevel", "editorialLevel", "warmthLevel"],
      "presets": ["creative-direction-golden", "law-office-formal"]
    }
  },

  "profiles": {
    "interaction": {
      "profileId": "registry:interaction-seating-inspect-v1",
      "verbs": ["inspect", "sit", "highlight"],
      "affordances": ["hover-glow", "genome-tint-swatch"]
    },
    "runtime": {
      "profileId": "registry:runtime-mesh-replaceable-v1",
      "objectClass": "furniture-chair-executive",
      "replaceable": true,
      "genomeSlots": ["materialLanguage", "colorSystem"],
      "loadPriority": "zone-furniture",
      "budgetMB": 2.4
    },
    "generator": {
      "profileId": "registry:generator-mesh-fal-v1",
      "supportedGenerators": ["studio-asset-compiler", "asset-factory", "department-generator"],
      "providerRoutes": [
        { "provider": "fal", "modelRoute": "golden-models/furniture-executive", "assetType": "mesh" }
      ],
      "outputFormats": ["glb", "usdz"],
      "promptSourceRef": "registry:prompt-fragment-furniture-executive-v1"
    }
  },

  "promptSource": {
    "type": "fragment",
    "ref": "registry:prompt-fragment-furniture-executive-v1",
    "recipeRef": null,
    "departmentOrigin": "creative-direction-studio"
  },

  "licensing": {
    "ownership": "studio",
    "licenseType": "platform-reuse",
    "packId": null,
    "marketplaceSku": null,
    "orgScoped": false,
    "attributionRequired": false,
    "redistribution": "compile-only"
  },

  "packOwnership": {
    "ownedByPack": null,
    "introducedByPack": null,
    "packExclusive": false
  },

  "scores": {
    "quality": 94,
    "performance": 88,
    "reuseConfidence": 91,
    "genomeAdaptability": 95
  },

  "usageHistory": {
    "totalUses": 47,
    "lastUsedAt": "2026-07-07T18:00:00Z",
    "departmentsUsedIn": ["creative-direction", "legal", "marketing"],
    "organizationsUsedIn": ["frontal-slayer", "ndxbook"],
    "compileReuseCount": 31,
    "runtimeMountCount": 16
  },

  "revisionHistory": [
    {
      "version": "3.1.0",
      "changedAt": "2026-07-08T00:00:00Z",
      "changeType": "genome-slot-expansion",
      "summary": "Added colorSystem genome slot for law-firm adaptation",
      "author": "studio-os-core"
    },
    {
      "version": "3.0.0",
      "changedAt": "2026-06-15T00:00:00Z",
      "changeType": "approved-promotion",
      "summary": "Promoted from Internal to Approved after CDS golden validation",
      "author": "founder-approval-gate"
    }
  ],

  "tags": [
    "furniture", "seating", "executive", "luxury", "genome-adaptable",
    "law-firm", "creative-agency", "reuse-candidate"
  ],

  "relationships": {
    "belongsTo": [
      { "type": "category", "ref": "registry:category-furniture-v1" }
    ],
    "dependedOnBy": [
      { "registryId": "registry:executive-suite-pack-v1", "relationship": "pack-member" }
    ],
    "usedBy": [
      { "registryId": "pkg-creative-direction-golden-v1", "type": "department-package" }
    ],
    "introducedBy": {
      "type": "department-definition",
      "ref": "docs/studio-os/departments/creative-direction-studio/"
    }
  },

  "artifacts": {
    "primary": {
      "type": "mesh",
      "ref": "artifact://meshes/executive-chair-luxury-v3.glb",
      "checksum": "sha256:…",
      "sizeMB": 2.1
    },
    "derivatives": [
      { "type": "thumbnail", "ref": "artifact://thumbnails/executive-chair-luxury-v3.webp" },
      { "type": "expanded-prompt", "ref": "artifact://prompts/executive-chair-luxury-v3.json" }
    ]
  },

  "metadata": {
    "registeredAt": "2026-06-01T00:00:00Z",
    "updatedAt": "2026-07-08T00:00:00Z",
    "source": "creative-direction-studio-golden",
    "notes": "Golden reference chair — primary reuse candidate for executive zones"
  }
}
```

---

## Required Fields

Every Registry Item **must** include:

| Field | Required | Description |
|-------|----------|-------------|
| `registryId` | ✓ | Globally unique ID — format `registry:{slug}` |
| `version` | ✓ | Semver |
| `identity.name` | ✓ | Human-readable name |
| `identity.category` | ✓ | Top-level category (see [category-system.md](./category-system.md)) |
| `identity.subcategory` | ✓ | Dot-notation subcategory |
| `identity.creator` | ✓ | Studio · org · marketplace · generated |
| `status.lifecycle` | ✓ | Lifecycle state (see [versioning.md](./versioning.md)) |
| `preview.thumbnailRef` | ✓ | Discovery thumbnail |
| `dependencies` | ✓ | May be empty object — structure required |
| `compatibility` | ✓ | Department · industry · genome · room DNA |
| `profiles.interaction` | ○ | Required if interactive |
| `profiles.runtime` | ✓ | Runtime mounting contract |
| `profiles.generator` | ○ | Required if generatable |
| `promptSource` | ○ | Required for generatable assets |
| `licensing` | ✓ | Ownership + redistribution rules |
| `packOwnership` | ✓ | May be null — structure required |
| `scores` | ✓ | Quality + performance minimum |
| `usageHistory` | ✓ | Initialized at registration |
| `revisionHistory` | ✓ | At least one entry at creation |
| `tags` | ✓ | Minimum one tag |
| `relationships` | ✓ | Belongs-to graph anchor |

---

## Registry ID Format

```
registry:{kebab-slug}[-v{major}]
```

| Pattern | Example |
|---------|---------|
| Object | `registry:glass-panel-frosted-v2` |
| Material | `registry:marble-calacatta-genome-slot` |
| Prompt | `registry:prompt-fragment-lighting-rim-v1` |
| Pack | `registry:pack-luxury-office-v1` |
| Department template | `registry:dept-template-creative-direction-v1` |
| Genome preset | `registry:genome-preset-law-firm-v1` |

**Resolution syntax** (used by Compiler + Runtime):

```
registry:glass-panel-frosted-v2          → latest approved
registry:glass-panel-frosted-v2@3.1.0      → pinned version
registry:glass-panel-frosted-v2@^3.0.0     → semver range
```

---

## Creator Types

| Type | Meaning |
|------|---------|
| `studio` | Studio OS core team · golden assets |
| `organization` | Org-authored custom asset |
| `marketplace` | Third-party or licensed Pack contributor |
| `generated` | AI provider output promoted to Registry |
| `compiler` | Output of Studio Asset Compiler™ run |
| `generator` | Output of Department Generator™ definition |

---

## Score Definitions

| Score | Range | Meaning |
|-------|-------|---------|
| `quality` | 0–100 | Visual · semantic · interaction fidelity |
| `performance` | 0–100 | Load time · polygon budget · memory |
| `reuseConfidence` | 0–100 | Smart Reuse match confidence |
| `genomeAdaptability` | 0–100 | How well asset adapts across companies |

Scores update on: QA approval · usage feedback · Runtime telemetry · Compiler Build Health.

---

## Registry Snapshot (Engine Input)

Engines consume a **Registry Snapshot** — not the full catalog:

```yaml
RegistrySnapshot:
  schema: studio.asset-registry.v1/snapshot
  snapshotId: string
  generatedAt: ISO8601
  scope:
    categories: string[]          # optional filter
    lifecycle: string[]           # default: [approved, marketplace, premium]
    packIds: string[]             # org-owned packs
    orgId: string                 # tenant scope
  items: RegistryItem[]           # resolved subset
  reuseIndex: ReuseIndexEntry[]   # precomputed for Compiler
  promptLibrary: PromptIndexEntry[]
  modelRoutes: ModelRouteEntry[]
```

Replaces legacy `DesignRegistrySnapshot` in Compiler input. See [runtime-integration.md](./runtime-integration.md).

---

## Registration Events

| Event | Trigger | Result |
|-------|---------|--------|
| `item.registered` | New item Draft created | Event Bus™ publish |
| `item.approved` | QA / founder gate passed | Available for Smart Reuse |
| `item.deprecated` | Successor published | Compiler warns on use |
| `item.used` | Compiler reuse or Runtime mount | Usage history append |
| `pack.injected` | Marketplace purchase | Org-scoped items unlocked |

---

## Minimal Registration Example (Prompt Fragment)

```json
{
  "registryId": "registry:prompt-fragment-glass-frosted-v1",
  "version": "1.0.0",
  "identity": {
    "name": "Frosted Glass Panel — Base Fragment",
    "category": "prompt",
    "subcategory": "prompt.fragment.glass",
    "reuseCategory": "prompt-glass-panel",
    "creator": { "type": "studio", "id": "studio-os-core" }
  },
  "status": { "lifecycle": "approved", "qualityTier": "golden" },
  "preview": { "thumbnailRef": "artifact://thumbnails/prompt-glass-v1.webp" },
  "promptSource": {
    "type": "fragment",
    "content": "Frosted glass floating inspect panel, polished bevel edge, soft interior bounce"
  },
  "profiles": {
    "generator": {
      "supportedGenerators": ["studio-asset-compiler"],
      "expansionRole": "base-layer"
    }
  }
}
```

---

## Validation Gates

| Gate | Rule |
|------|------|
| Unique ID | No duplicate `registryId` + `version` |
| Category valid | Category exists in [category-system.md](./category-system.md) |
| Dependency resolve | All `requires` refs exist or marked `pending` |
| Circular deps | Dependency graph acyclic |
| Genome slots | Declared slots exist in Company Genome schema |
| Pack consistency | `packExclusive` items must have `packOwnership.ownedByPack` |
| License match | Marketplace items require `marketplaceSku` |
| Score bounds | All scores 0–100 |

---

_Asset Schema — every Registry Item speaks the same language._
