# Runtime Integration — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.integration`  
**Status:** Generator · Compiler · Runtime contracts

---

## Purpose

Studio Asset Registry™ sits at the center of the four-engine foundation. This document defines **integration contracts** — how each engine reads, writes, and depends on the Registry.

**No implementation in this sprint.**

---

## Four-Engine Integration Map

```
                    ┌─────────────────────────┐
                    │  STUDIO ASSET REGISTRY™ │
                    │  (permanent memory)     │
                    └───────────┬─────────────┘
           writes │             │ reads         │ writes
    ┌─────────────┼─────────────┼───────────────┼─────────────┐
    ▼             ▼             ▼               ▼             ▼
Generator™    Compiler™     Compiler™       Runtime™      Marketplace
(definitions) (reuse query) (promote gen)   (mount refs)  (inject packs)
```

---

## Studio Department Generator™

**Path:** [`../../department-generator/`](../../department-generator/README.md) · [`../../engine/department-generator/`](../../engine/department-generator/README.md)

### Generator → Registry (Writes)

| Event | What Registers |
|-------|----------------|
| Department Definition complete | `department-template` item |
| Asset blueprint finalized | Per-asset items (Draft → Internal) |
| fal-prompt-package created | `prompt.fragment` items |
| Room DNA preset saved | `room-dna` preset item |
| Golden department approved | Promotion to `approved` |

### Generator → Registry (Reads)

| Use | Query |
|-----|-------|
| Blueprint seeding | Reuse existing `reuseCategory` assets |
| Prompt assembly | Pull fragments from Prompt Library |
| Pack template install | Load `department-template` from entitled pack |
| Industry preset | Load `genome-preset` + `room-dna` |

### Generator Output Registration

When Generator emits `asset-manifest.json`:

```json
{
  "assetId": "glass-panels-cds",
  "reuseCategory": "glass-panel",
  "registryRef": null,
  "registerOnApproval": true
}
```

On department golden approval, each asset registers with `relationships.introducedBy` → department definition path.

---

## Studio Asset Compiler™

**Path:** [`../studio-asset-compiler/`](../studio-asset-compiler/README.md) · [`../../engine/asset-compiler/`](../../engine/asset-compiler/README.md)

### Compiler → Registry (Reads)

| Stage | Registry Use |
|-------|--------------|
| Pre-compile | `RegistrySnapshot` load · reuse index |
| Per-asset | Smart Reuse lookup ([reuse-engine.md](./reuse-engine.md)) |
| Prompt Expansion | Prompt Library fragments + recipes |
| Dependency Resolution | Merge Registry `requires[]` into compile graph |
| Quality Engine | Reuse opportunity check · model routes |
| Provider routing | `profiles.generator.providerRoutes` |

### Compiler → Registry (Writes)

| Event | What Registers |
|-------|----------------|
| Successful generation | `lifecycle: generated` item |
| QA promotion | `generated` → `approved` |
| Reuse link recorded | `usageHistory` increment |
| New prompt expansion | Optional `prompt.fragment` if novel |

### Input Migration — Design Registry™ → Asset Registry™

Compiler v1 input ([input-spec.md](../studio-asset-compiler/input-spec.md)) migrates:

| Legacy | Canonical |
|--------|-----------|
| `designContext.designRegistryRef` | `registryContext.registrySnapshotRef` |
| `DesignRegistrySnapshot` | `RegistrySnapshot` |
| `registeredAssets` | `items[]` |
| `reuseLibrary` | `reuseIndex[]` |
| `goldenModels` | `items[].profiles.generator.providerRoutes` |

Compile request v1.1:

```json
{
  "registryContext": {
    "registrySnapshotRef": "snapshot-org-frontal-slayer-2026-07-08",
    "entitledPacks": ["registry:pack-luxury-office-v1"],
    "reusePolicy": {
      "minExactScore": 90,
      "minAdaptScore": 75,
      "allowExperimental": false
    }
  }
}
```

### Compiler Output — Registry Resolutions

`package-manifest.json` includes:

```json
{
  "registryResolutions": [
    {
      "assetId": "glass-panels-cds",
      "registryId": "registry:glass-panel-frosted-v2",
      "resolvedVersion": "3.1.0",
      "reuseMode": "adapt",
      "artifactRef": "artifact://meshes/glass-panel-frosted-v3.glb"
    }
  ],
  "metrics": {
    "reusePercentage": 57,
    "registryItemsLinked": 14,
    "registryItemsGenerated": 15
  }
}
```

---

## Studio Department Runtime™

**Path:** [`../../engine/department-runtime/`](../../engine/department-runtime/README.md) (when present)

### Runtime → Registry (Reads)

| Boot Phase | Registry Use |
|------------|--------------|
| Package load | Resolve `registryResolutions[]` from `package-manifest.json` |
| Artifact fetch | `artifacts.primary.ref` per resolved item |
| Genome mount | Apply `profiles.runtime.genomeSlots` from live Company Genome |
| Interaction bind | Load `profiles.interaction` patterns |
| Concierge spawn | Resolve `concierge` + `ai-personality` items |
| Orb behavior | Resolve `orb` mesh + behavior items |

### Runtime → Registry (Writes)

| Event | What Updates |
|-------|--------------|
| Session mount | `usageHistory.runtimeMountCount` |
| Genome adaptation applied | Telemetry → `scores.genomeAdaptability` |
| Interaction completion | Usage context recorded |
| Deprecation encounter | Log for impact analysis |

### Runtime Assembly Contract

`15_runtime/assembly-manifest.json` (from Compiler) carries Registry refs:

```json
{
  "departmentId": "creative-direction",
  "registrySnapshotRef": "snapshot-at-compile-time",
  "mountOrder": [
    {
      "assetId": "glass-panels-cds",
      "registryId": "registry:glass-panel-frosted-v2",
      "version": "3.1.0",
      "genomeSlots": ["materialLanguage", "colorSystem"],
      "adaptationProfile": "registry:genome-adapt-glass-v1"
    }
  ]
}
```

Runtime **pins versions** — never silently upgrades mid-session.

---

## Marketplace Integration

| Event | Registry Action |
|-------|-----------------|
| Pack listed | Register `pack` item · `lifecycle: marketplace` |
| Pack purchased | `injectPack()` · org entitlements |
| Refund | Revoke entitlements · items remain in global catalog |
| Contributor upload | Register with `creator.type: marketplace` |

See [pack-support.md](./pack-support.md).

---

## Organization Genome™ Integration

| System | Integration |
|--------|-------------|
| Organization Genome (M95) | Live snapshot for Runtime slot resolution |
| Company Genome presets | Registry `genome-preset` items |
| Room DNA | Registry `room-dna` presets |
| Genome adaptation | [company-genome-adaptation.md](./company-genome-adaptation.md) |

`consultOrganizationGenome()` runs before any Registry-mediated generation or adaptation.

---

## Event Bus™ Subscriptions

| Event | Subscribers |
|-------|-------------|
| `item.registered` | Documentation Registry · System Registry |
| `item.approved` | Search index rebuild · Compiler snapshot refresh |
| `item.used` | Memory Engine · usage analytics |
| `pack.injected` | Expansion Center · Mission Control notification |
| `reuse.missed` | Quality Engine · Command Dock suggestion |
| `item.deprecated` | Impact analysis · Compiler warning |

---

## System Registry™ Cross-Reference

System Registry (M127) registers Asset Registry as platform system:

```yaml
systemId: studio.asset-registry.v1
type: engine
docsPath: docs/studio-os/engines/studio-asset-registry/
dependsOn: [studio.department-generator.v1, studio.asset-compiler.v1]
dependedOnBy: [studio.department-runtime.v1, marketplace.packs.v1]
```

Individual Registry Items may also appear in System Registry for admin discovery.

---

## API Surface (Conceptual)

| Endpoint | Consumer |
|----------|----------|
| `GET /registry/snapshot` | Compiler pre-compile |
| `POST /registry/search` | Command Dock · Admin |
| `POST /registry/reuse-lookup` | Compiler Smart Reuse |
| `GET /registry/resolve/{ref}` | Runtime boot |
| `POST /registry/register` | Generator · Compiler post-gen |
| `POST /registry/pack/inject` | Marketplace purchase |
| `GET /registry/impact/{ref}` | Deprecation gate |

Implementation backend agnostic — Supabase · edge function · local index in future sprints.

---

## Creative Direction Studio™ End-to-End

Reference flow for golden department:

```
1. Generator created CDS Definition
   → Registers dept-template + 35 asset Drafts + 15 prompt fragments

2. Golden approval promotes to Approved
   → Reuse index populated

3. Compiler compiles pkg-creative-direction-golden-v1
   → Reuse orb-universal (exact)
   → Adapt glass-panel (genome overlay)
   → Generate unique mood-wall variant
   → registryResolutions in package-manifest

4. Runtime mounts Creative Direction room
   → Resolves pinned registry refs
   → Applies Frontal Slayer Company Genome live

5. Usage recorded
   → usageHistory updated
   → Build Health reuse % = 57%
```

---

## Failure Modes

| Failure | Behavior |
|---------|----------|
| Registry ref not found | Compiler abort · build-report error |
| Version constraint unsatisfied | Try successor · else generate |
| Org not entitled to pack item | Exclude from snapshot · generate alt |
| Artifact missing | Runtime placeholder · alert Command Dock |
| Genome slot unresolved | Block mount · log · suggest preset |
| Snapshot stale (>24h) | Compiler refresh snapshot before compile |

---

## Versioning This Contract

| Contract | Schema ID |
|----------|-----------|
| Registry Item | `studio.asset-registry.v1/registry-item` |
| Registry Snapshot | `studio.asset-registry.v1/snapshot` |
| Search Request | `studio.asset-registry.v1/search-request` |
| Reuse Lookup | `studio.asset-registry.v1/reuse-lookup` |
| Pack Manifest | `studio.asset-registry.v1/pack-manifest` |

Breaking changes → `studio.asset-registry.v2` with migration guide.

---

_Runtime Integration — every engine remembers through the Registry._
