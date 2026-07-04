# Asset Registry

Every uploaded asset is registered with:

- **Product** — e.g. SOFT WAVE
- **Collection Number** — 003
- **Version** — v1
- **Asset Type** — master-white, master-transparent, cart, …
- **Crop Template** — template id used
- **Dimensions** — width × height
- **Transparency** — boolean
- **Supabase URL** — public URL
- **Created Date / Last Updated**
- **Status** — ready-for-review | published | failed

**Storage:** `adminStudioBrandAssetsProductAssetFactory_v1` (admin localStorage) + API response payload.

Future: persist registry to Supabase table.
