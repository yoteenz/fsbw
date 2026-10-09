# Asset Package Standard V1

Flexible folder layout (create only folders with real artifacts):

```
WORLD_ASSET_001/
  00_MANIFEST/
  01_REFERENCES/
  02_SOURCE_MODELS/
  03_HIGH_POLY/
  04_RUNTIME_MESHES/
  05_UV/
  06_TEXTURES/
  07_MATERIALS/
  08_COLLISION_AND_LOD/
  09_RIG_AND_ANIMATION/
  10_ENGINE_FILES/
  11_EXPORTS/
  12_RENDERS_AND_QA/
```

Manifest type: `AssetPackageManifest` in `technical-art/asset-package.ts`.

Completeness cells: `PRESENT`, `MISSING`, `NOT_REQUIRED`, `NOT_APPLICABLE`, `UNVERIFIED`, `BLOCKED`.

**Worked audit:** `technical-art/examples/site00-build-object-audit.ts` (SITE 00 Build Object).
