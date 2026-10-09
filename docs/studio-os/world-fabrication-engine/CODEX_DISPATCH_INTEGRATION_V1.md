# Codex Dispatch Integration V1

## Supported interface (verified)

| Field | Value |
|-------|--------|
| Package | `@openai/codex` |
| CLI | `npx @openai/codex` (0.162.0 observed) |
| Subcommand | `codex exec` |
| Auth | ChatGPT login, device-auth, or `OPENAI_API_KEY` → `codex login --with-api-key` |
| Cloud agent probe | **Non-billable:** `codex login status` + `codex doctor` (see `CODEX_AUTHENTICATION_UNBLOCK_V1.md`) |

## Dispatch states

`DISPATCH_UNAVAILABLE` · `HANDOFF_PREPARED` · `AWAITING_EXTERNAL_EXECUTION` · `DISPATCHED` · `RUNNING` · `OUTPUT_PENDING` · `OUTPUT_RECEIVED` · `VALIDATING` · `READY_FOR_REVIEW` · `FAILED` · `CANCELLED`

## What is NOT Codex execution

Local `blender --background` subprocess (WFE Blender runner) — separate backend `BLENDER_LOCAL`.

## Unblock dispatch

See **`CODEX_AUTHENTICATION_UNBLOCK_V1.md`** for ChatGPT vs API-key billing and cloud constraints.

1. Cursor → **Project Settings → Cloud Agent → Secrets**
2. Add **`OPENAI_API_KEY`** (Platform API key — usage billed separately from ChatGPT subscription)
3. **Authorize** one bounded proof run in chat (billable when using API key)
4. Run: **`npm run wfe:codex-fabrication-proof`**

Without that secret, outcome is **PARTIAL — CODEX CONNECTION REQUIRED**; external handoff bundle is written under `execution-runs/pipeline-activation1/external-handoff/`.

## Full V2 package

Upload to `benchmarks/site00-build-object-v2/incoming/` — see `incoming/README.md`.
