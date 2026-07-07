# 15 — Marketplace Export

**Engine Module:** `studio.department-generator.v1.marketplace-export`  
**Status:** Headquarters Marketplace™ publishing system  
**Philosophy:** Every Department Package™ should be publishable. Install without HQ restart.

---

## Design Principle

> Marketplace listings include **Department · AI Team · Interactions · Objects · Animations · Audio · Dependencies · Genome Hooks · Compatibility · Installation Guide** — not screenshots of dashboards.

---

## Export Pipeline

```
Generator QA Pass (16)
       ↓
Compiler QA Pass
       ↓
Marketplace Listing Compiler
       ↓
Compatibility Matrix Generation
       ↓
Installation Guide Generation
       ↓
MarketplaceListingDraft → Headquarters Marketplace™
```

---

## Listing Schema

```yaml
MarketplaceListing:
  listingId: string
  displayName: string
  tagline: string
  category: enum                  # flagship | creative | production | executive | industry | expansion
  departmentId: DepartmentTypeId
  packageVersion: semver
  generatorVersion: semver
  compilerVersion: semver

  contents:
    department: DepartmentSummary
    aiTeam: AITeamSummary
    interactions: VerbSummary[]
    objects: ObjectListingEntry[]
    animations: AnimationProfileSummary
    audio: AudioProfileSummary

  dependencies:
    requiredPackages: PackageDependency[]
    sdkVersion: semver
    runtimeVersion: semver
    genomeRequired: boolean

  genomeHooks:
    slots: GenomeSlotBinding[]
    industryAffinity: string[]
    transformExamples: string[]     # frontal-slayer · ndx · restaurant · law-firm

  compatibility:
    headquartersVersions: string[]
    maturityGate: MaturityLevel
    installModes: InstallMode[]

  installationGuide: InstallationGuide
  preview:
    thumbnail: string
    arrivalClip: string | null

  metadata:
    author: string
    license: string
    price: number | null
    goldenDepartment: boolean
```

---

## Install Modes

| Mode | Description |
|------|-------------|
| **Full install** | Complete department package — default |
| **Zone pack** | Single zone assets (e.g., mood-wall variant) |
| **Atmosphere pack** | Lighting + particles + audio |
| **Object swap** | Replace single asset by ID |
| **AI expansion** | Additional concierge roles + triggers |
| **Industry skin** | Genome profile preset — not topology change |

---

## Object Listing Entry

```yaml
ObjectListingEntry:
  assetId: string
  objectClass: ObjectClassId
  displayName: string
  zone: string
  replaceable: true
  genomeSlots: string[]
  previewThumb: string
```

---

## Compatibility Matrix

| Check | Requirement |
|-------|-------------|
| SDK anatomy | Passes SDK QA 17 |
| Runtime semver | `>=` declared minimum |
| Genome slots | All slots documented |
| Object class registry | All classes in SDK 03 |
| Verb registry | All verbs in SDK 04 |
| No forbidden patterns | Anti-SaaS validation |
| Golden Department alignment | If flagship category |

---

## Installation Guide (Auto-Generated)

```markdown
# Install {Department Name}

## Requirements
- Studio OS Runtime {version}
- Company Genome™ configured
- Maturity level: {gate}

## Install Steps
1. Download DepartmentPackage.zip
2. Marketplace Runtime validates compatibility
3. Hot install — no HQ restart
4. Genome injection crossfade (2s)
5. Arrival preview optional

## Genome Hooks
{slot list}

## Permissions
{permission list}
```

---

## Expansion Packages

Marketplace expansions merge via Generator Input (02):

| Expansion Type | Merge Behavior |
|----------------|----------------|
| New object | Append to manifest · minor version |
| AI role pack | Append ai-team-manifest |
| Audio stem pack | Replace audio stems by ID |
| Interaction extension | Merge interaction-map verbs |
| Industry preset | Genome modifier pack — no DNA change |

---

## Golden Department Listing

| Field | Value |
|-------|-------|
| listingId | `golden-creative-direction-v1` |
| category | flagship |
| goldenDepartment | true |
| tagline | The creative brain of your company |

Canonical reference listing — all future departments cite compatibility.

---

_Next: [16 — Department QA](./16_DEPARTMENT_QA.md)_
