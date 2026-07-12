# Asset Approval Contract™

**Policy version:** `asset-approval-policy.v1`

## Default: deny

`evaluateAssetApproval()` returns `approved: false` unless all gates pass.

## Required for approval

- `identityMatch = true` and confidence ≥ 0.62
- Structural classification valid
- Background not `FULL_SCENE_RERENDER`, `ENVIRONMENT_FUSED`, or `FAKE_TRANSPARENCY`
- Full-scene likelihood < 0.78
- Shell similarity ≤ 0.82
- Postprocess valid when cleanup was used
- Alpha acceptable (native or successful cleanup)
- Mount metadata present
- Organization ownership verified
- Complete candidate correlation IDs

## Approval proof

Approved layers carry `approvalProof` on `SceneStackLayerRecord`:

- `assetCandidateId`
- `approvedAt`
- `candidateUrl` / `cleanedUrl`
- `backgroundClassification`
- `identityConfidence`
- `structuralClassification`
- `postprocessClassification`

Scene Stack mount and World Compiler component packages require `status: approved` + `approvalProof`.
