# Package Schema — `package-manifest.json`

**Schema ID:** `studio.asset-compiler.v1/package-manifest`  
**Output file:** `package-manifest.json` (root of DepartmentPackage.zip)

---

## Purpose

Machine-readable build manifest with dependencies · metrics · health · engine requirements. Complements root `manifest.json` with manufacturing analytics.

---

## Schema

```json
{
  "$schema": "studio.asset-compiler.v1/package-manifest.json",
  "packageId": "pkg-creative-direction-golden-v1",
  "departmentId": "creative-direction",
  "displayName": "Creative Direction Studio™",
  "version": "1.0.0",
  "goldenDepartment": true,

  "build": {
    "compilerVersion": "studio.asset-compiler.v1.0.0",
    "compiledAt": "2026-07-08T00:00:00Z",
    "compileMode": "full",
    "sourceDefinition": "docs/studio-os/departments/creative-direction-studio/",
    "buildHealth": 87,
    "buildStatus": "pass",
    "buildReportRef": "build-report.md"
  },

  "department": {
    "category": "creative",
    "layoutTemplate": "stage",
    "heroObjectId": "wall-mood-cds",
    "zoneCount": 11,
    "profileIds": {
      "lighting": "editorial-three-point-warm",
      "environment": "double-height-stage-atelier",
      "interaction": "physical-verbs-editorial"
    }
  },

  "metrics": {
    "assetCount": 35,
    "promptCount": 47,
    "reusePercentage": 12,
    "assetsGenerated": 31,
    "assetsReused": 4,
    "assetsAdapted": 8,
    "missingAssets": 0,
    "generationStages": 12,
    "estimatedRenderMinutes": 151,
    "estimatedPackageMB": 118,
    "runtimeComplexity": "high",
    "memoryFootprintMB": 95,
    "interactiveObjectCount": 18,
    "aiSystemCount": 9
  },

  "dependencies": {
    "graphRef": "14_metadata/dependencies.json",
    "generationQueueRef": "14_metadata/generation-queue.json",
    "externalPackages": [],
    "sdkVersion": "studio.department-sdk.v1",
    "minRuntimeVersion": "studio.department-runtime.v1.0.0"
  },

  "generationStages": [
    { "stage": 1, "id": "environment", "assetCount": 1, "folder": "01_environment/" },
    { "stage": 2, "id": "architecture", "assetCount": 6, "folder": "02_architecture/" },
    { "stage": 3, "id": "lighting", "assetCount": 1, "folder": "08_lighting/" },
    { "stage": 4, "id": "furniture", "assetCount": 3, "folder": "03_furniture/" },
    { "stage": 5, "id": "large-objects", "assetCount": 3, "folder": "04_objects/" },
    { "stage": 6, "id": "interactive-objects", "assetCount": 5, "folder": "04_objects/" },
    { "stage": 7, "id": "glass", "assetCount": 2, "folder": "05_glass/" },
    { "stage": 8, "id": "floating-ui", "assetCount": 2, "folder": "07_ui/" },
    { "stage": 9, "id": "effects", "assetCount": 1, "folder": "09_vfx/" },
    { "stage": 10, "id": "animation-refs", "assetCount": 2, "folder": "10_animation/" },
    { "stage": 11, "id": "audio-refs", "assetCount": 6, "folder": "11_audio/" },
    { "stage": 12, "id": "final-validation", "assetCount": 0, "folder": "14_metadata/" }
  ],

  "genome": {
    "companyGenomeSnapshotId": "genome-snapshot-v1",
    "projectGenomeSnapshotId": null,
    "brandGenomeSnapshotId": "brand-snapshot-v1",
    "founderJourneySnapshotId": "founder-journey-snapshot-v1",
    "roomDnaRef": "room-dna.json",
    "injectionSlotCount": 11
  },

  "aiSystems": [
    "studio-orb",
    "creative-director",
    "editorial-art-director",
    "brand-concierge",
    "visual-research-concierge",
    "founder-memory-concierge"
  ],

  "requiredEngines": [
    "studio.department-runtime.v1",
    "studio.validation-loop.v1",
    "studio.walk-the-room.v1"
  ],

  "providerHandoff": {
    "profile": "provider-agnostic",
    "primaryProvider": "fal",
    "handoffRef": "14_metadata/provider-handoff.json",
    "promptPackageRef": "13_prompts/"
  },

  "runtime": {
    "assemblyManifestRef": "15_runtime/runtime-assembly-manifest.json",
    "interactionManifestRef": "15_runtime/interactions.json",
    "cursorHandoffRef": "15_runtime/cursor-handoff.json"
  },

  "marketplace": {
    "exportable": true,
    "reuseTags": ["interactive-wall-hero", "timeline-surface", "orb-universal", "genome-observatory"],
    "inheritanceRef": "golden-department/creative-direction-studio"
  }
}
```

---

## Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `build.buildHealth` | ✓ | 0–100 Quality Engine score |
| `metrics.reusePercentage` | ✓ | % assets from Design Registry |
| `metrics.estimatedRenderMinutes` | ✓ | Provider queue time estimate |
| `metrics.runtimeComplexity` | ✓ | low · medium · high · flagship |
| `metrics.interactiveObjectCount` | ✓ | Objects with interaction colliders |
| `generationStages` | ✓ | 12-stage pipeline summary |
| `requiredEngines` | ✓ | Runtime ecosystem dependencies |
| `aiSystems` | ✓ | Concierge roles in package |

---

## Versioning

Package manifest uses semver aligned with Department Definition `version`. Compiler adds `compilerVersion` independent of package version.

Regenerated package increments patch unless `compileMode: full` with breaking Definition change → minor/major per SDK rules.

See [engine/asset-compiler/10_VERSIONING_SYSTEM.md](../../engine/asset-compiler/10_VERSIONING_SYSTEM.md).
