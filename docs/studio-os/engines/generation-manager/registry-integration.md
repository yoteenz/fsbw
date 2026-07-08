# Registry Integration — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.registry`  
**Status:** Storage · reuse · Runtime notification

---

## Principle

Generation Manager determines **when assets become reusable** — Registry™ remembers them permanently after validation.

---

## Integration Flow

```
Artifact validated (approved)
         ↓
Store to artifact plane (checksum · storageRef)
         ↓
Registry.register(item) OR update usage
         ↓
Update package-manifest cooked refs
         ↓
Item state → installed
         ↓
On package complete → Runtime notification
```

---

## Asset Storage

### Artifact Plane

```yaml
ArtifactStorage:
  storageRef: artifact://meshes/wall-mood-cds-v1.glb
  checksum: sha256
  sizeMB: number
  providerId: string
  jobId: string
  orgId: string
  packageId: string
  retention: permanent | org-scoped
```

| Storage Tier | Content |
|--------------|---------|
| Primary | Cooked GLB · textures · audio |
| Derivatives | Thumbnails · previews |
| Metadata | Validation records · prompt hash |

Backend agnostic — Supabase Storage · CDN · S3 in implementation.

---

## Registry Registration

On `approved` → register or update:

```yaml
RegistryWrite:
  registryId: string                  # from asset-production-workflow
  version: string                     # semver bump on recook
  lifecycle: generated → approved     # after validation
  artifacts:
    primary: storageRef
    derivatives: [thumbnailRef]
  usageHistory:
    event: generation.approved
    jobId: string
  relationships:
    introducedBy: packageId
    jobId: string
  scores:
    quality: from validation
    performance: estimated
```

See [asset-schema.md](../studio-asset-registry/asset-schema.md).

---

## Reuse Recording

Skipped regen items:

```yaml
ReuseRecord:
  assetId: string
  registryId: string
  resolution: exact | adapt
  jobId: string
  savedMinutes: number
  savedCredits: number
```

Increments `usageHistory.compileReuseCount` on Registry item.

---

## Package Manifest Update

After each `installed` item:

```json
{
  "registryResolutions": [
    {
      "assetId": "wall-mood-cds",
      "registryId": "registry:mood-wall-hero-v1",
      "resolvedVersion": "1.0.0",
      "reuseMode": "generate",
      "artifactRef": "artifact://meshes/wall-mood-cds-v1.glb",
      "cookedAt": "2026-07-08T00:00:00Z",
      "validationRef": "val-req-..."
    }
  ],
  "cookStatus": "in-progress | complete",
  "cookedAt": "ISO8601"
}
```

---

## Runtime Notification

When `job → complete` and validation token issued:

```yaml
RuntimeNotification:
  event: generation.package.complete
  packageId: string
  jobId: string
  orgId: string
  cookedPackageRef: string
  assemblyManifestRef: 15_runtime/assembly-manifest.json
  validationApprovalToken: string
  readyForAssembly: true              # Stage 06
  readyForRuntime: false              # after Stage 06 assembly
```

### Event Bus Subscribers

| Subscriber | Action |
|------------|--------|
| Department Assembly (Cursor) | Begin Stage 06 |
| Production dashboard | Show complete |
| Mission Control | Department cook milestone |
| Memory Engine | Record production event |
| Registry | Final index refresh |

---

## Smart Reuse Feedback Loop

```
Generation completes
         ↓
Registry items approved
         ↓
reuseIndex updated
         ↓
Next department compile benefits
         ↓
Higher reuse % · lower cost
```

Generation Manager reports reuse metrics in Build Report — compounds platform memory.

---

## Pack & Marketplace Assets

| Source | Registration |
|--------|--------------|
| Department cook | Standard register on approve |
| Pack generation job | `packOwnership` set · marketplace lifecycle |
| Contributor upload | `creator.type: marketplace` · review gate |

Pack jobs use same Manager orchestration — different `jobType`.

---

## Partial Package Policy

Default: **no Runtime handoff** with failed required assets.

Founder explicit partial accept (non-golden only):

```yaml
partialPackage:
  allowed: false                      # golden departments
  missingAssets: []
  runtimePlaceholderPolicy: none
```

CDS: all 35 required — no partial.

---

## Installed Checklist

Package `cookStatus: complete` requires:

- [ ] All required items `installed | reused`
- [ ] All artifacts checksum-verified
- [ ] Registry writes confirmed
- [ ] `package-manifest.json` updated
- [ ] Validation approval token (golden)
- [ ] Build Report emitted

---

## Cleanup & Archival

| Event | Action |
|-------|--------|
| Branch regen success | Prior artifact `archived` · Registry version chain |
| Job cancelled | Queued artifacts none · in-flight completes |
| Failed exhausted | Artifact retained for debug 30 days |

Never delete Registry items — version and deprecate per Registry versioning.

---

_Registry Integration — store once, reuse forever._
