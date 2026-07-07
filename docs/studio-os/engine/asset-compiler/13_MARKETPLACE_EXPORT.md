# 13 — Marketplace Export

**Engine Module:** `studio.asset-compiler.v1.marketplace-export`  
**Status:** Distribution packaging specification  
**Parent:** [SDK Marketplace Packaging](../../sdk/13_MARKETPLACE_PACKAGING.md) · [Headquarters Marketplace™](../../headquarters-marketplace.md)

---

## Definition

Every validated Department Asset Package can be exported to the **Headquarters Marketplace™** as an installable department. Marketplace Export transforms an organization-compiled package into a **Genome-neutral, universally installable** distribution.

---

## Export Prerequisites

| Prerequisite | Source |
|-------------|--------|
| QA validation passed | Stage 14 (12) |
| All required assets present | Compile profile (07) |
| Genome-neutral assets | Compliance scan (12.4) |
| 3+ Genome transform previews | Compile Stage 13 |
| Package README | Package assembly |
| Compile profile registered | Department Compiler (07) |

---

## Marketplace Package Structure

```
marketplace-package/
├── manifest.json                    # Marketplace manifest (extended)
├── LICENSE.json                     # License terms
├── CHANGELOG.md                     # Version history
├── INSTALLATION.md                  # Installation guide
│
├── package/                         # Department Asset Package (neutral)
│   ├── [full package structure per 05]
│   └── (current versions only — no archives)
│
├── marketing/
│   ├── description.md               # Marketplace listing description
│   ├── hero-thumbnail.webp
│   ├── tour-clip.mp4                # 15s neutral environment tour
│   ├── screenshots/
│   │   ├── hero-angle.webp
│   │   ├── overview.webp
│   │   └── primary-workspace.webp
│   └── genome-transforms/
│       ├── luxury-hair.webp
│       ├── law-firm.webp
│       ├── medical-practice.webp
│       └── media-command.webp
│
├── profile/
│   └── compile-profile.json         # DepartmentCompileProfile (07)
│
└── validation/
    └── validation-report.json       # QA pass report
```

---

## Marketplace Manifest (Extended)

```yaml
MarketplaceManifest:
  # Identity
  id: string
  name: string
  description: string
  longDescription: string
  version: semver
  compilerVersion: "1.0.0"
  sdkVersion: "1.0.0"
  packageFormat: "studio.department-package.v1"

  # Classification
  departmentId: string
  departmentType: string            # compile profile ID
  industryTags: string[]
  maturityLevel: enum
  capabilityTags: string[]

  # Author
  author:
    id: string
    name: string
    verified: boolean
    organizationId: string

  # Technical
  assetCount: number
  totalSizeBytes: number
  compatibility:
    sdkVersions: string[]
    compilerVersions: string[]
    platformVersion: string
  dependencies:
    departments: string[]
    platformModules: string[]

  # Genome
  genomeNeutral: true                 # always true for marketplace
  genomeTransformPreviews: string[]   # preview image paths
  genomeHooksDeclared: string[]       # domains that adapt at install

  # Distribution
  license: enum
  pricing: PricingModel | null
  installCount: number
  rating: number | null

  # Content
  installationGuide: string           # path to INSTALLATION.md
  compileProfile: string              # path to profile JSON
  previewImages: string[]
  tourClip: string | null
```

---

## Export Process

```
Step 1: VALIDATE package passes QA (12) with marketplace checks
Step 2: STRIP organization-specific data
        - Remove organizationId from manifest
        - Remove project-specific content
        - Verify Genome-neutral assets
Step 3: STRIP archived versions (current only)
Step 4: GENERATE marketing materials
        - Description from department profile
        - Screenshots from preview renders
        - Genome transform set
Step 5: GENERATE INSTALLATION.md
Step 6: PACKAGE compile profile for reproducibility
Step 7: COMPUTE marketplace manifest
Step 8: SUBMIT to Marketplace review
Step 9: REVIEW gates (automated + human)
Step 10: PUBLISH to catalog
```

---

## Installation Guide Template

```markdown
# Installing {Department Name}

## Requirements
- Studio OS platform version: {platformVersion}
- SDK version: {sdkVersion}
- Dependencies: {dependencyList}

## Installation
1. Open Expansion Center in your Headquarters
2. Search for "{Department Name}" or browse {category}
3. Click "Expand Headquarters" to install
4. Company Genome automatically transforms the department
5. Travel to the new department via World Map

## What Changes
- New department appears in HQ layout
- AI concierges added to your roster
- Commands registered in Command Dock
- Department connects to: {connectedDepartments}

## Genome Adaptation
This package adapts automatically to your Company Genome:
- Colors, materials, lighting from your brand
- Typography and terminology from your voice
- AI personality from your brand character
- Audio from your sonic identity

## Support
{authorContact}
```

---

## Marketplace Description Template

```markdown
# {Department Name}

{oneLinePurpose}

## What This Department Does
{responsibilitiesList}

## Key Features
- {featureObjects}
- {featureInteractions}
- {featureAIEmployees}

## Best For
{industryTags}

## Includes
- {assetCount} modular assets
- {aiRoleCount} AI concierges
- Full interaction system
- Genome-adaptive branding

## Preview
See how this department transforms for different industries:
[Luxury Hair] [Law Firm] [Medical Practice] [Media Command]
```

---

## Post-Install Behavior

When a company installs a Marketplace package:

```
Install Engine (industry-architecture)
    │
    ├── Copy package assets to organization storage
    ├── Register in organization architecture profile
    ├── Merge into Headquarters layout
    ├── Register AI employees in concierge roster
    ├── Register commands in Command Dock
    │
    ▼
Department Runtime
    │
    ├── Load package (neutral assets)
    ├── Inject installing company's live Company Genome™
    ├── Hydrate with organization's project data
    │
    ▼
Living Department (unique to installing company)
```

---

## Pricing Models

| Model | Description |
|-------|-------------|
| `studio-free` | Included with Studio OS |
| `one-time` | Single purchase |
| `subscription` | Monthly department lease |
| `revenue-share` | Creator revenue split |
| `enterprise` | Custom licensing |

---

## Export Validation (Additional Checks)

| Check | Requirement |
|-------|-------------|
| Genome-neutral | No org-specific branding |
| Current versions only | No archived assets |
| Installation guide present | INSTALLATION.md |
| 3+ transform previews | Genome adaptation proof |
| Compile profile included | Reproducibility |
| License specified | Legal compliance |
| Author verified (commercial) | Trust gate |

---

_Next: [14 — Future AI Providers](./14_FUTURE_AI_PROVIDERS.md)_
