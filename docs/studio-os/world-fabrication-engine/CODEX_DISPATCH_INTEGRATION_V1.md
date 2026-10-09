# Codex Dispatch Integration V1

## Supported interface (verified)

| Field | Value |
|-------|--------|
| Package | `@openai/codex` |
| CLI | `npx @openai/codex` (0.162.0 observed) |
| Subcommand | `codex exec` |
| Auth | `OPENAI_API_KEY` or Codex OAuth session |
| Cloud agent probe | **401 Unauthorized** without configured secrets |

## Dispatch states

`DISPATCH_UNAVAILABLE` · `HANDOFF_PREPARED` · `AWAITING_EXTERNAL_EXECUTION` · `DISPATCHED` · `RUNNING` · `OUTPUT_PENDING` · `OUTPUT_RECEIVED` · `VALIDATING` · `READY_FOR_REVIEW` · `FAILED` · `CANCELLED`

## What is NOT Codex execution

Local `blender --background` subprocess (WFE Blender runner) — separate backend `BLENDER_LOCAL`.

## Unblock dispatch

1. Cursor → **Project Settings → Cloud Agent → Secrets**
2. Add **`OPENAI_API_KEY`** (valid OpenAI key with Codex access)
3. Run: **`npm run wfe:codex-fabrication-proof`**

Without that secret, outcome is **PARTIAL — CODEX CONNECTION REQUIRED**; external handoff bundle is written under `execution-runs/pipeline-activation1/external-handoff/`.

## Full V2 package

Upload to `benchmarks/site00-build-object-v2/incoming/` — see `incoming/README.md`.
