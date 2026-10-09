# Codex authentication unblock (WFE) — discovery v1

Verified against **`@openai/codex` CLI 0.162.0** in Cursor Cloud Agent (Ubuntu, non-interactive).

## Supported authentication methods (official)

| Method | CLI entry | Billing model | Cloud agent fit |
|--------|-----------|---------------|-----------------|
| **ChatGPT account** | `codex login` (browser) | Included in eligible ChatGPT plans (Plus/Pro/Team/Enterprise) — not OpenAI Platform metered API | **BLOCKED** for default browser flow (no interactive founder browser in agent VM) |
| **ChatGPT device code** | `codex login --device-auth` | Same as ChatGPT login | **CONDITIONAL** — founder must complete device-code URL in a browser; not automatable in this sprint |
| **ChatGPT access token** | `printenv CODEX_ACCESS_TOKEN \| codex login --with-access-token` | ChatGPT subscription path | **CONDITIONAL** — token must be supplied via **Cursor secrets**, never chat/repo |
| **OpenAI API key** | `printenv OPENAI_API_KEY \| codex login --with-api-key` | **Usage-based OpenAI Platform billing** — separate from ChatGPT subscription credits | **SUPPORTED** when key is in **Cursor → Project Settings → Cloud Agent → Secrets** as `OPENAI_API_KEY` |

References: [OpenAI Codex authentication](https://developers.openai.com/codex/auth), [Codex CLI login](https://openai-codex.mintlify.app/cli/login).

## Non-billable status checks (WFE default)

WFE **`discoverCodexInterface({ runAuthProbe: true })`** uses:

1. `codex login status` — logged in vs not
2. If `OPENAI_API_KEY` / `CODEX_API_KEY` present: `codex login --with-api-key` (stdin only; never logged)
3. `codex doctor` — auth line (no model invocation)

It does **not** run `codex exec` for auth probing (avoids accidental API spend).

## Cursor Cloud Agent secrets

- **Supported:** secrets inject as environment variables on the agent VM (same mechanism as `CLOUDFLARE_TUNNEL_TOKEN`, etc.).
- **Required name for API path:** **`OPENAI_API_KEY`**
- Optional alias read by WFE probe: **`CODEX_API_KEY`**
- **Do not** paste keys in chat or commit them to the repo.

## API billing vs ChatGPT subscription

- **ChatGPT login:** Codex usage tied to subscription entitlements; not the same as Platform API metered keys.
- **API key:** Billed per OpenAI Platform usage; ChatGPT Plus/Pro does **not** automatically fund API-key Codex calls.
- **WFE cost control:** assignments use `allowPaidGeneration: false`; real `codex exec` fabrication still requires explicit founder authorization for any billable path.

## Unblock checklist (founder)

### Path A — API key (recommended for Cloud Agent)

1. Create/locate an OpenAI Platform API key with Codex/API access (dashboard).
2. **Cursor → Project Settings → Cloud Agent → Secrets** → add **`OPENAI_API_KEY`**.
3. Start or resume a cloud agent run (secrets apply on new runs).
4. Reply in chat: **authorize billable Codex proof** (one bounded `wfe:codex-fabrication-proof` run).
5. Agent runs: `npm run wfe:codex-fabrication-proof`.

### Path B — ChatGPT (device code)

1. In an interactive terminal with browser access, run: `npx @openai/codex login --device-auth`.
2. Complete sign-in at the URL shown.
3. Credentials cache under `~/.codex/` on that machine (may not persist across ephemeral cloud VMs unless snapshot/build captures it — prefer Path A for agents).

## Current environment (this run)

- `codex login status` → **Not logged in**
- `codex doctor` → **no Codex credentials**
- `OPENAI_API_KEY` / `CODEX_API_KEY` → **absent**
- **Authentication verified:** **NO**
- **Billable proof executed:** **NO** (not authorized + not authenticated)

## Existing execution bridge

No new adapter. Use **`npm run wfe:codex-fabrication-proof`** on PR stack **#49→#54** (`execution-bridge.ts`).
