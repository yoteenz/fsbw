# 10 — Versioning System

**Engine Module:** `studio.asset-compiler.v1.versioning`  
**Status:** Independent asset versioning specification  
**Philosophy:** Every asset supports versions — users regenerate individual assets without rebuilding departments

---

## Definition

The Versioning System tracks **independent version lineages** for every asset in a Department Asset Package. Versions are incremental, immutable, and auditable.

> `environment_v1` → `environment_v2` → `environment_v3` — each preserved, each regenerable.

---

## Version Model

```yaml
AssetVersion:
  assetId: string                     # stable identity (e.g., "timeline")
  version: number                     # incremental integer: 1, 2, 3, ...
  versionLabel: string                # display: "v1", "v2", "v3"
  status: enum                        # current | archived | deprecated
  file: string                        # relative path in package
  metadata: AssetMetadata             # full metadata record (06)
  parentVersion: number | null        # version this was regenerated from
  changeReason: string                # why this version was created
  createdAt: datetime
```

---

## Versioning Rules

| Rule | Specification |
|------|---------------|
| **Independent lineages** | Each assetId has its own version counter |
| **Monotonic increment** | Versions only increase: v1 → v2 → v3 |
| **Immutable history** | Previous versions never deleted — archived |
| **One current** | Exactly one version per assetId has `status: current` |
| **Filename convention** | Current: `timeline.glb` · Archived: `timeline_v2.glb` |
| **Metadata sidecar** | Every version has `.meta.json` sidecar |
| **Package version** | Package semver increments on any asset version change |

---

## Version Lineage Example

```
creative-direction/
├── environment/
│   ├── environment.glb              # v3 (current)
│   ├── environment.glb.meta.json
│   ├── environment_v2.glb           # v2 (archived)
│   ├── environment_v2.glb.meta.json
│   └── environment_v1.glb           # v1 (archived)
│
├── lighting/
│   ├── lights.json                  # v5 (current)
│   ├── lights_v4.json
│   ├── lights_v3.json
│   ├── lights_v2.json
│   └── lights_v1.json
│
├── furniture/
│   ├── timeline.glb                 # v3 (current)
│   ├── timeline_v2.glb
│   └── timeline_v1.glb
│
├── glass/
│   └── mood-wall-surface.glb        # v12 (current)
│       # mood-wall_v1 through v11 archived
│
└── orb/
    └── orb.glb                      # v8 (current) — platform Orb reference
```

---

## Version Triggers

| Trigger | Scope | New Version |
|---------|-------|-------------|
| Full department compile | All assets | All start at v1 (new package) |
| Regenerate single asset | One asset | That asset increments |
| Genome refresh compile | Genome-dependent assets | Each affected asset increments |
| Department anatomy change | Affected assets | Changed assets increment |
| Manual human override | One asset | That asset increments with `creator: human-override` |
| Marketplace import | All assets | New lineage starting at v1 |
| Template upgrade | Assets using upgraded template | Opt-in regeneration |

---

## Package Versioning

Package-level semver follows these rules:

```yaml
PackageVersioning:
  major: breaking anatomy or SDK change
  minor: new assets added or significant regeneration
  patch: single asset regeneration or metadata update
```

| Change | Version Bump |
|--------|-------------|
| New department compile | `1.0.0` |
| Regenerate mood wall | `1.0.1` (patch) |
| Add new furniture object | `1.1.0` (minor) |
| SDK version upgrade | `2.0.0` (major) |
| Full recompile | `1.0.0` → `2.0.0` if anatomy changed; else minor |

---

## Version Comparison

Asset Registry™ supports version comparison:

```yaml
VersionComparison:
  assetId: string
  versionA: number
  versionB: number
  differences:
    - field: string
      valueA: any
      valueB: any
    - fileSizeDelta: number
    - promptHashChanged: boolean
    - genomeProfileChanged: boolean
```

Users can preview previous versions and restore if preferred.

---

## Version Storage Budget

| Rule | Limit |
|------|-------|
| Max archived versions per asset | 10 (configurable) |
| Oldest archived auto-pruned | After limit, oldest archived removed |
| Current version never pruned | Protected |
| Total package size with archives | ≤ 50 MB (organization); ≤ 25 MB (marketplace — current only) |

Marketplace packages ship **current versions only**. Archived versions remain in organization's Asset Registry.

---

## Version in Metadata

Every AssetMetadata record (06) includes:

```yaml
version: "v3"
semver: "1.0.2"
parentVersion: "v2"
changeReason: "Genome refresh — material language updated"
status: current
```

---

## API Concepts

```yaml
# Get current version
GetAssetVersion(assetId) → AssetVersion

# List all versions
ListAssetVersions(assetId) → AssetVersion[]

# Restore previous version
RestoreAssetVersion(assetId, version) → makes target version current

# Compare versions
CompareAssetVersions(assetId, vA, vB) → VersionComparison
```

---

_Next: [11 — Regeneration Rules](./11_REGENERATION_RULES.md)_
