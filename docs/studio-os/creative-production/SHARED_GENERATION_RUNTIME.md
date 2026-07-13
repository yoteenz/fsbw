# Shared Generation Runtime

Studio OS and Frontal Slayer share FAL dispatch through `api/_lib/creativeProduction/generation-gateway.ts` for Studio surfaces. Frontal Slayer Build-a-Wig color/styling uses a **separate** inline `fal.subscribe` path optimized for sync mannequin edits.

## Forensic envelope

`src/studio-os-core/generation-runtime/generation-parity-forensic.ts` records comparable fields under `?compilerDiag=1`:

- surface, endpoint, model route, artifact intent
- reference count, generation mode, provider latency
- validation path/result, postprocessing, final status
- first divergence marker

## Transport parity

| Concern | Frontal Slayer NOIR | Studio OS |
|---------|---------------------|-----------|
| Dispatch | Direct in API route | `studio-builder-generate` gateway |
| Polling | Sync subscribe | Async governed jobs |
| Artifact resolution | First FAL URL | Gateway + registry write |

**No consolidation required** for transport — divergence is validation contract, not FAL SDK drift.

## Repair (2026-07-13)

Salvageable opaque studio plates now reach governed background removal before isolated-layer hard rejection.
