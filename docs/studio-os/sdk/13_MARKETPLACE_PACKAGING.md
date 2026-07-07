# 13 — Marketplace Packaging

**SDK Module:** `studio.department.sdk.v1.marketplace`  
**Status:** Distribution and installation specification  
**Parent:** [Headquarters Marketplace™](../headquarters-marketplace.md)  
**Philosophy:** Every department can be packaged, published, and installed into another company

---

## Definition

**Marketplace Packaging** defines how SDK-compliant departments are bundled, published, discovered, and installed into any organization's Headquarters. Packages are **identity-neutral** — Company Genome™ transforms them on installation.

---

## Package Structure

```
department-package/
├── manifest.json                 # Package metadata + anatomy
├── anatomy.json                  # Full department anatomy (01)
├── spatial-layout.json           # Layout template + placements (02)
├── objects.json                  # Object instance declarations (03)
├── interaction-maps.json         # Verb bindings (04)
├── ai-employees.json             # AI role assignments (05)
├── genome-rules.json             # Genome hook declarations (10)
├── dependencies.json             # Required departments + platform modules
├── assets/
│   ├── environment/              # Neutral environment modules
│   ├── furniture/                # Furniture modules
│   ├── glass/                      # Glass object modules
│   ├── lighting/                   # Lighting rig modules
│   ├── orb/                        # Orb assets (platform standard)
│   ├── particles/                  # Particle systems
│   ├── materials/                  # Shader bundles with Genome slots
│   ├── audio/                      # Neutral audio (room tones, SFX templates)
│   ├── animations/                 # Motion clips
│   ├── camera/                     # Camera presets
│   └── metadata/                   # Assembly metadata
├── previews/
│   ├── hero-thumbnail.png          # Marketplace listing image (neutral)
│   ├── tour-clip.mp4               # 15s neutral environment tour
│   └── genome-transforms/          # 3+ industry transform previews
│       ├── luxury-hair.png
│       ├── law-firm.png
│       └── medical.png
├── CHANGELOG.md
└── LICENSE.json
```

---

## Manifest Schema

```yaml
PackageManifest:
  id: string                    # marketplace package ID
  name: string
  version: semver
  sdkVersion: "1.0.0"
  type: enum                    # department-pack | expansion-pack
  departmentId: string
  author:
    id: string
    name: string
    verified: boolean
  description: string
  longDescription: string
  industryTags: string[]        # recommended industries; empty = universal
  maturityLevel: enum
  license: enum                 # studio-free | commercial | enterprise
  pricing: PricingModel | null
  compatibility:
    sdkVersions: string[]
    genomeVersions: string[]
    platformVersion: string
  tags: string[]                # marketplace discovery tags
  ratings: RatingSummary
  installCount: number
  created: datetime
  updated: datetime
```

---

## Package Contents

### Required Contents

| Content | Source Doc | Required |
|---------|-----------|----------|
| Department anatomy | 01 | ✓ |
| Spatial layout | 02 | ✓ |
| Object instances | 03 | ✓ |
| Interaction maps | 04 | ✓ |
| AI employee roles | 05 | ✓ |
| Asset modules (all categories) | 06 | ✓ |
| Genome rules | 10 | ✓ |
| Dependencies | 01 | ✓ |
| Neutral previews | — | ✓ |
| Genome transform previews (3+) | 10 | ✓ |

### Excluded Contents (Never in Package)

| Excluded | Reason |
|----------|--------|
| Brand colors | Genome injects |
| Company logos | Genome injects |
| Brand photography | Genome injects |
| Custom fonts | Genome injects |
| Voice recordings | Genome TTS |
| Industry-specific copy | Genome terminology |
| Organization-specific data | Tenant-specific |
| Hardcoded API keys | Security |

---

## Marketplace Tags

Standard tags for discovery:

| Category | Example Tags |
|----------|-------------|
| **Function** | `marketing`, `creative`, `production`, `legal`, `operations`, `quality` |
| **Industry** | `beauty`, `legal`, `medical`, `construction`, `fashion`, `agency`, `restaurant` |
| **Maturity** | `starter`, `growth`, `enterprise` |
| **Style** | `luxury`, `editorial`, `minimal`, `industrial` |
| **Capability** | `approval-workflow`, `timeline`, `asset-management`, `publishing`, `analytics` |
| **AI** | `multi-concierge`, `brand-guard`, `legal-review` |

---

## Publishing Workflow

```
1. Author completes department (16 — Creation Guide)
2. QA approval (17 — QA Checklist)
3. Package assembly (this document's structure)
4. Generate neutral previews
5. Generate 3+ Genome transform previews
6. Validate package schema
7. Submit to Marketplace review
8. Review checks:
   - SDK compliance
   - No branding in assets
   - Genome rules complete
   - All asset modules present
   - Interaction maps valid
   - AI roles complete
9. Publish to Marketplace catalog
```

---

## Installation into Another Company

When a company installs a department package from Marketplace:

### Install Sequence

```
Phase 1: Validate compatibility (SDK version, platform version)
Phase 2: Check dependencies (required departments, platform modules)
Phase 3: Resolve conflicts (duplicate department IDs)
Phase 4: Copy asset modules to organization storage
Phase 5: Register department in organization architecture profile
Phase 6: Merge into Headquarters layout (buildings, connections)
Phase 7: Register AI employees in organization concierge roster
Phase 8: Register commands in Command Dock capability index
Phase 9: Trigger Genome injection preview
Phase 10: Activate department (available for travel)
```

### Install Engine Integration

Installation uses the existing industry architecture install engine:

```
ensureOrganizationArchitectureProfile()
         ↓
mergePackIntoProfile(package)
         ↓
buildHeadquartersLayout(updatedProfile)
         ↓
syncOrganizationBoundary()
         ↓
Department available in World Map + Expansion Center
```

### Post-Install

| Action | Result |
|--------|--------|
| Genome injection | Department transforms to match installing company |
| World Map update | New department appears in HQ layout |
| AI roster update | New concierges available |
| Command Dock update | New commands registered |
| Mission Control update | New department card in grid |
| Expansion Center | Shows as installed |

---

## Dependency Resolution

```yaml
DependencyResolution:
  package: string
  requires:
    - id: string
      type: enum           # department | platform-module | expansion-pack
      version: string
      installIfMissing: boolean
  conflicts:
    - id: string
      resolution: enum     # replace | coexist | block
```

| Scenario | Behavior |
|----------|----------|
| Required department missing | Offer to install dependency package |
| Platform module missing | Block install; show required platform version |
| Duplicate department ID | Prompt: replace existing or rename |
| Version mismatch | Block if incompatible; offer upgrade |

---

## Versioning and Updates

| Rule | Specification |
|------|---------------|
| Semver | Package version follows semver |
| Update notification | Orb + Expansion Center notify of available updates |
| Update install | Non-destructive — preserves organization customizations |
| Breaking update | Requires SDK major version match; manual approval |
| Changelog | Required in package; displayed in Expansion Center |
| Rollback | Previous version retained; rollback available |

---

## Licensing

| License | Description |
|---------|-------------|
| `studio-free` | Included with Studio OS — no additional cost |
| `commercial` | Purchasable — one-time or subscription |
| `enterprise` | Custom licensing — contact publisher |
| `creator` | Published by verified creator — revenue share |

---

## Creator Requirements

Marketplace publishers must:

| Requirement | Detail |
|-------------|--------|
| SDK compliance | Full QA checklist pass |
| Neutral assets | No branding in any asset module |
| Genome transforms | 3+ industry preview images |
| Documentation | Package description + changelog |
| Support | Response within 72h for commercial packages |
| Updates | Security/compatibility updates within 30 days |

---

## Quality Gates (Marketplace Review)

| Gate | Check |
|------|-------|
| Schema valid | All JSON/YAML schemas pass validation |
| SDK version | Matches current SDK |
| No branding | Automated scan for hardcoded colors, logos, fonts |
| Asset completeness | All 12 asset categories present or declared optional |
| Genome rules | All mandatory domains hooked |
| Interaction coverage | All responsibilities have verb bindings |
| AI staffing | Minimum AI employees present |
| Preview quality | Hero thumbnail + tour clip + 3 genome transforms |
| Performance | Package total size ≤ 25 MB |

---

## Forbidden Packaging Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Flattened scene in package | Violates asset modularity |
| Brand-specific package variant | One package, Genome adapts |
| Package with API credentials | Security violation |
| Package without genome-rules.json | Cannot adapt on install |
| Package without interaction maps | Department non-functional |
| Duplicate package per industry | Universal package + Genome |

---

_Next: [14 — FAL Asset Compiler](./14_FAL_ASSET_COMPILER.md)_
