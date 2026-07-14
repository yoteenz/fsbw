# Environment Asset Package — Canonical Production Pipeline

**Status:** Architecture layer (Studio World)  
**Module:** `src/studio-os-core/environment-asset-package/`  
**Experience Lab bridge:** `src/features/studio-world/experience-lab-v2/experience-lab-environment-package-bridge.ts`  
**Spatial review:** SKIPPED — architecture-only sprint; no new surfaces, nav, or Genesis behavior.

---

## Objective

Studio World stops thinking in terms of generating individual images. Every department environment becomes a single **Environment Asset Package**: one environment, many deliverables. The founder approves **one** environment package — not separate desktop and mobile renders.

**Replace:** "Generate Reception"  
**With:** "Generate Reception Environment Package"

---

## Hierarchy

```
Environment Asset Package
  ├── Environment (department + environmentId + revision)
  ├── Variants (exactly six architectural directions)
  │     ├── Light 01 · Light 02 · Light 03
  │     └── Dark 01 · Dark 02 · Dark 03
  ├── Outputs (responsive formats — same design, different framing)
  │     ├── Desktop 21:9
  │     ├── Mobile 9:16
  │     ├── Tablet 4:3
  │     ├── Hero Landscape · Hero Portrait
  │     └── Thumbnails · Preview Card · Studio Preview
  └── Production Assets
        ├── Blueprint · Construction Plan
        ├── Lighting Profile · Materials Profile
        └── Asset Manifest · Prompt/Seed Archive · Revision History
```

**Law:** Desktop, mobile, and tablet are **outputs** of the same approved variant — not separate designs. Same architecture, materials, lighting, layout, furniture, props, branding, and composition language. Different only: camera framing, aspect ratio, responsive composition.

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

- Six design variants remain visually unchanged.
- `useExperienceLabDesignVariants({ isCompact })` resolves viewport URLs from package outputs.
- `drawerPackageModel` exposes package metadata for future drawer — no drawer redesign in this sprint.
- Seed package: `envpkg.experience-lab.reception.r1`

---

## Success criteria

- Every environment is an Environment Asset Package
- Desktop and mobile belong to the same package
- One approved variant generates all production outputs
- Cached packages prevent duplicate generation costs
- CDS and Asset Manufacturing consume package IDs
- Marketplace-ready for selling environment packages
- Experience Lab interface remains visually unchanged
