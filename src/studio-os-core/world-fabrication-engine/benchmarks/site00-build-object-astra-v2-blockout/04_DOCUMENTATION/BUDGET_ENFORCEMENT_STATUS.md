# Budget enforcement status — Stage 01 preflight

## Finding

| Mechanism | Enforces USD hard cap? | Status |
|-----------|------------------------|--------|
| Prompt text (“$10 max”) | **No** | V1 proved insufficient |
| `WFE_FOUNDER_AUTHORIZED_BUDGET_USD` | **Soft** — required env for dispatch; does not stop API mid-session | **Implemented** |
| `WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1` | **Gate** — blocks WFE dispatch + launch script | **Implemented** (this sprint) |
| `WFE_CODEX_EXEC_TIMEOUT_MS` | Wall-clock stop only | Default 900000 in launch script |
| `maxCodexSessions: 1` in assignment | Policy | Assignment manifest |
| OpenAI org/project budget limits | **External** — founder must set in OpenAI dashboard | **Not wired to repo** |
| Codex CLI token/cost telemetry | Logs tokens; **USD often UNKNOWN** | V1: 94346 tokens, no USD |

**Classification:** `BUDGET_ENFORCEMENT: SOFT_ONLY`

## Repo-side gates (Phase B)

1. `./scripts/wfe-site00-astra-v2-blockout-preflight.sh` — non-billable checks.
2. `./scripts/wfe-site00-astra-v2-blockout-launch.sh` — requires `WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1` + `WFE_FOUNDER_AUTHORIZED_BUDGET_USD>0`.
3. `authorizeCodexDispatch` — additional block for assignment id `site00-build-object-astra-v2-blockout`.
4. `authorizeSite00BlockoutPhaseB()` — unit-tested helper.

## Founder authorization for Phase B

Explicit message required, e.g.:

> Authorize Phase B blockout: budget ceiling **$X**, max **1** Codex session.

Then operator sets:

```bash
export WFE_FOUNDER_AUTHORIZED_BUDGET_USD=15
export WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1
./scripts/wfe-site00-astra-v2-blockout-launch.sh
```

**Remaining cost risk:** session may exceed soft USD ceiling until OpenAI org limits or manual abort — state clearly before spend.
