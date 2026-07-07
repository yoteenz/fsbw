# 13 — Package Spec

**Engine Module:** `studio.department-generator.v1.package-spec`  
**Status:** DepartmentPackage output specification  
**Philosophy:** Everything modular. Everything replaceable. Everything versioned.

---

## Package Identity

```yaml
DepartmentPackage:
  schema: studio.department-package.v1
  id: string                      # pkg-{departmentId}-{orgHash}-{version}
  departmentId: DepartmentTypeId
  version: semver
  generatorVersion: semver
  compilerVersion: semver
  goldenDepartment: boolean       # true for canonical references
  createdAt: ISO8601
  genomeSnapshotId: string
```

Compatible with Asset Compiler `05_ASSET_PACKAGE_SPEC.md`.

---

## DepartmentPackage.zip Structure

```
DepartmentPackage.zip
├── manifest.json                 # package identity + dependency graph
├── department-dna.json             # resolved DNA snapshot
├── spatial/
│   └── spatial-manifest.json
├── environment/
│   ├── shell.glb
│   ├── interior.glb
│   ├── ceiling.glb
│   ├── windows.glb
│   └── exterior.plate
├── materials/
│   ├── floor.shader
│   └── glass-panels.shader
├── furniture/
│   └── *.glb
├── objects/
│   └── *.glb                     # mood-wall · timeline · orb · etc.
├── lighting/
│   └── rig.json
├── particles/
│   └── ambient.json
├── portals/
│   ├── entry.glb
│   └── exit.glb
├── interactions/
│   └── interaction-map.json
├── ai/
│   ├── ai-team-manifest.json
│   └── ai-triggers.json
├── audio/
│   ├── ambient.webm
│   ├── ceremony.webm
│   ├── orb-bed.webm
│   └── effects/
├── animations/
│   ├── animation-manifest.json
│   └── camera-paths.json
├── ceremonies/
│   └── *.json
├── seeds/                        # optional content seeds
│   └── *.json
├── metadata/
│   └── assets/*.meta.json        # per Asset Compiler 06
├── runtime/
│   └── assembly-manifest.json
├── preview/
│   ├── thumbnail.png
│   └── arrival-preview.mp4       # optional
├── docs/
│   └── README.md                 # human-readable package summary
└── dependencies/
    └── required-packages.json
```

---

## manifest.json Schema

```yaml
PackageManifest:
  id: string
  departmentId: string
  version: semver
  assets:
    - id: string
      path: string
      objectClass: string | null
      zoneId: string | null
      genomeSlots: string[]
      replaceable: true
      dependencies: string[]
  ceremonies: CeremonyId[]
  permissions: string[]
  aiRoles: AIRoleId[]
  primaryVerbs: VerbId[]
  sizeBudgetMB: number
  assetCount: number
```

---

## Modular Replacement Rules

| Rule | Specification |
|------|---------------|
| Asset swap | Same `asset.id` → replace file · preserve manifest entry |
| Partial install | Zone pack or object pack supported |
| Version pin | Runtime checks semver compatibility |
| Dependency declare | Required packages in `dependencies/` |
| Never flatten | No monolithic scene file |

---

## Package by Pipeline Stage

| Stage | Generator Produces | Compiler Produces | Runtime Consumes |
|-------|-------------------|-------------------|------------------|
| DNA | department-dna.json | — | anatomy validation |
| Spatial | spatial-manifest.json | — | zone bounds |
| Environment | tasks → | environment/*.glb | World Assembler |
| Objects | tasks → | objects/*.glb | Object Manager |
| Interactions | interaction-map.json | copy | Interaction Engine |
| AI | ai/*.json | copy | Concierge Runtime |
| Audio | tasks → | audio/* | Audio Engine |
| Animation | animations/*.json | copy | Animation Engine |
| Runtime | assembly-manifest.json | merge | boot sequence |

---

## Creative Direction Reference Package

| Field | Value |
|-------|-------|
| ID | `pkg-creative-direction-golden-v1` |
| Assets | 45 |
| Size | 120 MB |
| Ceremonies | creative-approval |
| Permissions | creative-direction.approve · creative-direction.branch |

First Generator output must produce equivalent manifest.

---

## Size Budgets (Default)

| Department Category | Asset Budget | Size Budget |
|--------------------|--------------|-------------|
| Creative pipeline | 45 | 120 MB |
| Production | 40 | 100 MB |
| Executive | 35 | 90 MB |
| Industry | 30–40 | 80–110 MB |
| Marketplace viewer | 25 | 60 MB |

DNA `assetBudget` overrides defaults.

---

_Next: [14 — Regeneration System](./14_REGENERATION_SYSTEM.md)_
