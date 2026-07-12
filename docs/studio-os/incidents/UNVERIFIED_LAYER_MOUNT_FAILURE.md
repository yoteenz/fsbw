# Unverified Layer Mount Failure — Root Cause

## Documented fact

- Shell pipeline healthy through mount verification
- Layer 1 landmark failed even after isolated prompt/model routing repair
- Raw provider URLs were reaching Scene Stack as `draft_ready` without full identity/structure/background/postprocess gates

## Inference

Studio OS lacked an explicit candidate → approved asset production gate between provider generation and scene composition.

## Repair (verified-asset-production.v1)

- Full pipeline in `verified-asset-production/`
- Only `approved` + `approvalProof` layers mount
- Quarantine store for rejected candidates
- Conditional governed background removal
- UI shows real production stage labels

## Production verification

Pending founder mobile compile beyond Layer 1 with approved isolated landmark.
