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

Configure OpenAI/Codex credentials in **Cursor cloud secrets** (not repository). Re-run `discoverCodexInterface({ runAuthProbe: true })`.

## Full V2 package

Upload to `benchmarks/site00-build-object-v2/incoming/` — see `incoming/README.md`.
