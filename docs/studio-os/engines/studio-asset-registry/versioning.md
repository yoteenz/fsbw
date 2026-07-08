# Versioning — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.versioning`  
**Status:** Lifecycle states · semver · promotion gates

---

## Purpose

Registry Items evolve without breaking historical packages. Versioning governs **what Compiler may reuse**, **what Runtime may mount**, and **what Marketplace may sell**.

---

## Lifecycle States

| State | ID | Meaning | Compiler | Runtime | Marketplace |
|-------|-----|---------|----------|---------|-------------|
| **Draft** | `draft` | Work in progress | ✗ | ✗ | ✗ |
| **Internal** | `internal` | Studio-only · not customer-visible | ○ (studio orgs) | ○ | ✗ |
| **Approved** | `approved` | Production-ready · platform reuse | ✓ | ✓ | ○ (if licensed) |
| **Deprecated** | `deprecated` | Superseded · migration path required | ○ (warn) | ○ (warn) | ✗ |
| **Archived** | `archived` | Historical only · no new use | ✗ | ○ (pinned refs) | ✗ |
| **Experimental** | `experimental` | May change without notice | ○ (opt-in) | ○ (opt-in) | ✗ |
| **Marketplace** | `marketplace` | Sold via Expert Marketplace / Packs | ✓ (licensed) | ✓ (licensed) | ✓ |
| **Premium** | `premium` | Premium-tier Pack or subscription | ✓ (entitled) | ✓ (entitled) | ✓ |
| **Generated** | `generated` | AI output · pending QA promotion | ○ (same compile) | ○ | ✗ |
| **Custom** | `custom` | Organization-authored · org-scoped | ✓ (org) | ✓ (org) | ○ |

---

## State Transitions

```
                    ┌─────────────┐
                    │    Draft    │
                    └──────┬──────┘
                           │ submit
                    ┌──────▼──────┐
         ┌──────────│  Internal   │──────────┐
         │          └──────┬──────┘          │
         │ experimental    │ QA pass         │ archive
         │          ┌──────▼──────┐          │
         └─────────►│ Experimental│          │
                    └─────────────┘          │
                           │ approve          │
                    ┌──────▼──────┐          │
                    │  Approved   │◄─────────┤
                    └──────┬──────┘          │
              marketplace  │                 │
                    ┌──────▼──────┐    ┌─────▼─────┐
                    │ Marketplace │    │ Archived  │
                    │  / Premium  │    └───────────┘
                    └──────┬──────┘
                           │ successor
                    ┌──────▼──────┐
                    │ Deprecated  │
                    └─────────────┘

Generated ──QA pass──► Approved
Custom ──org publish──► Approved (org-scoped)
```

---

## Promotion Gates

| Transition | Gate |
|------------|------|
| Draft → Internal | Schema validation · dependency resolve |
| Internal → Approved | QA score ≥ 85 · founder or automated gate |
| Approved → Marketplace | License defined · Pack manifest · preview assets |
| Approved → Deprecated | Successor `registryId` declared · migration notes |
| Generated → Approved | Build Health ≥ 80 · visual QA · genome compliance |
| Experimental → Approved | Explicit promotion · changelog required |
| Any → Archived | No active dependents · 90-day deprecation window elapsed |

---

## Semantic Versioning

Registry Items use **semver** (`MAJOR.MINOR.PATCH`):

| Bump | When |
|------|------|
| **MAJOR** | Breaking runtime contract · genome slot removal · mesh topology change |
| **MINOR** | New genome slot · new interaction verb · additive dependency |
| **PATCH** | Thumbnail · prompt tweak · metadata · score update |

**Pinning rules:**

| Consumer | Default Resolution |
|----------|-------------------|
| Compiler (reuse) | Latest **Approved** within semver range |
| Compiler (new package) | Latest **Approved** unless manifest pins |
| Runtime (live dept) | Pinned version from `package-manifest.json` |
| Runtime (hotfix) | `^PATCH` allowed for non-breaking patches |
| Marketplace | Exact version at purchase time + upgrade path |

---

## Version Constraints in Dependencies

```yaml
requires:
  - registryId: registry:brass-material-v2
    versionConstraint: ">=2.0.0 <3.0.0"
  - registryId: registry:orb-universal-v2
    versionConstraint: "^2.0.0"
  - registryId: registry:glass-panel-frosted-v2
    versionConstraint: "3.1.0"          # exact pin
```

Resolver picks highest compatible **Approved** version unless exact pin specified.

---

## Revision History

Every version change appends to `revisionHistory[]`:

```json
{
  "version": "3.1.0",
  "changedAt": "2026-07-08T00:00:00Z",
  "changeType": "genome-slot-expansion",
  "summary": "Added colorSystem genome slot",
  "author": "studio-os-core",
  "breaking": false,
  "migrationNotes": "Recompile departments using ^3.0.0 to pick up slot",
  "successorRef": null
}
```

| changeType | Description |
|------------|-------------|
| `created` | Initial registration |
| `approved-promotion` | Lifecycle promotion |
| `genome-slot-expansion` | New Company Genome compatibility |
| `mesh-update` | Artifact replacement |
| `prompt-refinement` | Prompt source change |
| `dependency-update` | Requires/recommends change |
| `deprecation` | Marked deprecated |
| `marketplace-listing` | Listed for sale |
| `pack-injection` | Introduced via Pack purchase |
| `usage-milestone` | Auto-entry at 100+ reuses |

---

## Deprecation Contract

Deprecated items **must** include:

```json
{
  "status": {
    "lifecycle": "deprecated",
    "deprecatedAt": "2026-08-01T00:00:00Z",
    "successorRef": "registry:executive-chair-luxury-v4",
    "sunsetAt": "2027-08-01T00:00:00Z"
  }
}
```

| Phase | Behavior |
|-------|----------|
| Deprecation announced | Compiler info warning · Build Health −2 |
| Sunset window | Reuse allowed · new registrations blocked |
| Post-sunset | Archived · pinned refs only |

---

## Generated Asset Lifecycle

AI provider outputs follow a distinct path:

```
Provider execution
    ↓
Registry item (lifecycle: generated)
    ↓
QA Engine review
    ↓
├── fail → remain generated · retry or discard
└── pass → promote to approved (or internal)
```

Generated items include `identity.creator.type: "generated"` and `metadata.sourceProvider` trace.

---

## Pack Versioning

Packs version independently:

```
registry:pack-luxury-office-v1  →  version 1.2.0
  └── contains items at various versions
  └── pack manifest pins minimum item versions
```

Pack version bump does not auto-bump child items — manifest updated explicitly.

---

## Org-Scoped Custom Versions

`lifecycle: custom` items are visible only to owning `orgId`:

```json
{
  "licensing": {
    "orgScoped": true,
    "organizationId": "frontal-slayer",
    "licenseType": "org-exclusive"
  }
}
```

Custom items may fork from Approved platform items:

```json
{
  "relationships": {
    "forkedFrom": "registry:executive-chair-luxury-v3@3.1.0"
  }
}
```

---

## Compiler Version Resolution

When Compiler encounters `designRegistryRef` / `registrySnapshotRef`:

1. Load snapshot scoped to org + entitled packs
2. For each manifest asset, query reuse by `reuseCategory`
3. Resolve version per constraint
4. Reject `draft` · `archived` unless explicit pin
5. Warn on `deprecated` · suggest `successorRef`
6. Record resolved versions in `package-manifest.json` → `registryResolutions[]`

---

## Runtime Version Pinning

`15_runtime/assembly-manifest.json` includes:

```json
{
  "registryResolutions": [
    {
      "assetId": "glass-panels-cds",
      "registryId": "registry:glass-panel-frosted-v2",
      "resolvedVersion": "3.1.0",
      "resolutionMode": "reuse",
      "artifactRef": "artifact://meshes/glass-panel-frosted-v3.glb"
    }
  ]
}
```

Runtime **never** silently upgrades pinned versions mid-session.

---

_Versioning — evolve without forgetting._
