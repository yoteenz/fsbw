# Frontal Slayer Asset Factory

Production pipeline: Photography Bible approved master hero → website-ready asset library.

| Document | Topic |
|----------|-------|
| [01-purpose.md](./01-purpose.md) | Purpose and scope |
| [02-workflow.md](./02-workflow.md) | End-to-end workflow |
| [03-folder-structure.md](./03-folder-structure.md) | Repo and Supabase paths |
| [04-crop-templates.md](./04-crop-templates.md) | Reusable crop definitions |
| [05-derivative-engine.md](./05-derivative-engine.md) | Derivative outputs |
| [06-asset-registry.md](./06-asset-registry.md) | Registry fields |
| [07-supabase-structure.md](./07-supabase-structure.md) | Upload layout |
| [08-processing-pipeline.md](./08-processing-pipeline.md) | Stages, retry, Ideogram |
| [09-version-history.md](./09-version-history.md) | Milestone lineage |

**Admin:** `/admin/studio/brand-assets/asset-factory`  
**API:** `POST /api/admin/product-asset-factory-run`  
**Code:** `api/_lib/productAssetFactory/`, `src/studio-os/product-photography/`

**POC unit:** SOFT WAVE (`soft-wave`) only in this milestone.
