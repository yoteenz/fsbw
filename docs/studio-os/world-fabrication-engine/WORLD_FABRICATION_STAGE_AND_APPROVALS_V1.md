# World Fabrication — Stages & Founder Approvals V1

**Stages:** `src/studio-os-core/world-fabrication-engine/stages.ts`  
**Approvals:** `src/studio-os-core/world-fabrication-engine/approvals.ts`

## Stage model (00–14)

See `WORLD_FABRICATION_STAGES` for codes from `COMMISSION_INTAKE` through `DEPLOYMENT_AUTHORIZATION`.

Rules:

- Stages may be **skipped** only when recorded on manifest scope (simple Build Object path uses `BUILD_OBJECT_STAGE_PATH`).
- Forward transitions require sequential order unless revision workflow documented.
- `STAGE_04` massing requires visual authority approval.
- `STAGE_14` deployment requires founder experience approval chain.

## Founder gates

1. Visual authority  
2. Geometry  
3. Material  
4. Spatial assembly  
5. Interaction  
6. Final experience  
7. Deployment authorization  

Approving stage N **does not** approve stage N+1.

Approval statuses: `DRAFT`, `IN_PRODUCTION`, `READY_FOR_REVIEW`, `APPROVED`, `APPROVED_WITH_CORRECTIONS`, `REVISION_REQUESTED`, `REJECTED`, `SUPERSEDED`.
