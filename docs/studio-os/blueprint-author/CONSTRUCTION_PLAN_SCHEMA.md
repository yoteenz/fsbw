# Construction Plan Schema

**Version:** `construction-plan.v1`

The Construction Plan is a deterministic specification. Nothing is inferred during construction.

## Top-level structure

```typescript
ConstructionPlan {
  schemaVersion: 'construction-plan.v1'
  planId: string
  metadata: BlueprintAuthorMetadata
  versions: BlueprintRevisionVersions
  building, floor, room
  architecture: ConstructionPlanArchitecture
  heroAssets: ConstructionPlanAssetRef[]
  furnitureSet, decorSet
  materialSet: ConstructionPlanMaterialSet
  lightingProfile: LightingProfileSpec
  cameraAnchors: CameraAnchorSpec[]
  navigationGraph: NavigationGraphSpec
  validationProfile, interactionProfile, styleProfile
  assetSockets: AssetSocket[]
  collisionZones, accessibilityRules
  negativeRules, organizationRules
}
```

## Version fields

Every compile stores:

| Field | Purpose |
|-------|---------|
| `blueprintVersion` | Plan revision |
| `organizationVersion` | Org asset library |
| `worldVersion` | Studio World release |
| `roomVersion` | Room template |
| `architectureVersion` | Shell spec |
| `materialVersion` | Material library |
| `assetVersion` | Hero/furniture/decor |
| `lightingVersion` | Lighting profile |
| `validationVersion` | Quality rules |
| `generationVersion` | Worker generation |
| `promptVersion` | Prompt templates |
| `compilerVersion` | World Compiler |

## Validation

`assertConstructionPlanComplete(plan)` verifies:

- Required plan fields present
- Navigation graph loaded
- Required hero sockets have assigned assets

## Example (Reception)

```
Building: Studio World HQ
Floor: Executive Level
Room: Reception
Architecture: ReceptionShell.v4
Hero: ReceptionDesk.v7, CrystalLandmark.v5
MaterialSet: FounderMaterialLibrary.v12
Lighting: ExecutiveReceptionLighting.v3
```
