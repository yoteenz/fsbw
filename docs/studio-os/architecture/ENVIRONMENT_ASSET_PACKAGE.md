# Environment Asset Package — Canonical Production Pipeline

**Status:** Architecture layer (Studio World)  
**Module:** `src/studio-os-core/environment-asset-package/`  
**Key files:** `EnvironmentAssetPackage.ts` · `EnvironmentPackageOutputs.ts` · `EnvironmentPackageRepository.ts` · `EnvironmentPackageService.ts` · `EnvironmentPackageGenerationService.ts` · `EnvironmentPackageCache.ts` · `EnvironmentPackageGenerationQueue.ts` · `EnvironmentPackageStatus.ts`  
**Spatial review:** SKIPPED — architecture-only sprint; no new surfaces, nav, or Genesis behavior.

---

## Objective

Studio World stops thinking in terms of generating individual images. Every department environment becomes a single **Environment Asset Package**: one environment, many deliverables. The founder approves **one** environment package — not separate desktop and mobile renders.

**Replace:** "Generate Reception"  
**With:** "Generate Reception Environment Package"

---

## Hierarchy

```
Department
  Environment
    Design Variant (head)
      Environment Package (1:1 — one variant owns exactly one package)
        Outputs (desktop · mobile · tablet · heroes · thumbnails)
        Production Assets (blueprint · construction · lighting · materials)
```

**Law:** Every Design Variant owns exactly ONE `environmentPackageId`. Desktop, mobile, and tablet are **outputs** of that package — not separate designs or separate packages.

## Production Readiness Gate

Every Environment Package owns exactly one **Production Readiness** record. No expensive production generation without explicit Founder approval.

**Lifecycle:** draft → preview-ready → founder-reviewing → **production-ready** → generating → production-complete → marketplace-ready → archived

Only `production-ready` packages may enter `EnvironmentPackageGenerationQueue`.

**Service:** `ProductionReadinessService.ts` — validate, calculate readiness %, detect blockers, estimate costs, authorize queue, founder approval.

**Persistence:** `ProductionReadinessRepository.ts` — stored alongside packages (not transient UI state). Permanent audit log.

**Consumers:** CDS and Asset Manufacturing require production-ready. Marketplace requires production-complete.

---

## Approval workflow

| Step | Action |
|------|--------|
| 1 | Generate six low-cost concept previews (3 light + 3 dark) |
| 2 | Founder reviews concepts |
| 3 | Founder promotes **one** variant |
| 4 | Promoted variant becomes production-ready |
| 5 | Studio World generates the full Environment Package (all outputs + production assets) |

No additional founder interaction required after promotion.

---

## Package status

`generating` · `review` · `approved` · `canonical` · `archived` · `deprecated` · `superseded` · `marketplace-ready` · `production-ready` · `failed`

---

## Cache and regeneration

Packages are permanently cached when:

- prompt unchanged
- seed unchanged
- revision unchanged
- department unchanged
- environment unchanged

Regenerate **only** when: founder requests regeneration, prompt changes, department bible changes, revision increments, canonical environment changes, provider changes, or seed intentionally changes.

Code: `cache-policy.ts` — `buildEnvironmentPackageCacheKey`, `assertPackageReusePolicy`

---

## Consumers

| Consumer | Binding | Module |
|----------|---------|--------|
| Experience Lab | Viewport resolves outputs from package via bridge | `experience-lab-environment-package-bridge.ts` |
| Creative Director Studio | `packageId` + `variantId` — never loose image URLs | `cds-consumer.ts` |
| Asset Manufacturing | Blueprint, construction, lighting, materials from same package | `asset-manufacturing-consumer.ts` |
| Marketplace (future) | Sell packages, not images | types + registry |

---

## Performance

Experience Lab loads **preview thumbnail + metadata + status** only. Remaining outputs lazy-load on demand (`requestLazyOutputLoad` in `package-resolver.ts`).

---

## Future output formats

Architecture supports additional formats without redesign: Vision Pro, Apple TV, ultra-wide, social story, marketplace card, animated preview, depth map, mask, VR/AR, etc. See `output-formats.ts` — `tier: 'future'`.

---

## Storage layout (canonical)

```
Environment
  Package
    Variant
      Outputs
      Metadata
      History
      Blueprint
      Construction
      Lighting
      Materials
      Assets
```

Registry: in-memory `package-registry.ts` today; production persistence hooks here later.

---

## Experience Lab integration (no UI redesign)

- Six design variants remain visually unchanged; each variant record includes `environmentPackageId`
- `useExperienceLabDesignVariants({ isCompact })` resolves viewport from per-variant package outputs
- Drawer displays package status, outputs generated/pending, cost, revision, provider, seed
- Auto-migration: `experience-lab-design-variant-package-migration.ts`
- Package IDs: `envpkg.experience-lab.reception.{variantId}.r1`

---

## Success criteria

- Every environment is an Environment Asset Package
- Desktop and mobile belong to the same package
- One approved variant generates all production outputs
- Cached packages prevent duplicate generation costs
- CDS and Asset Manufacturing consume package IDs
- Marketplace-ready for selling environment packages
- Experience Lab interface remains visually unchanged
