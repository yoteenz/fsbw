# Astréa creative fabrication benchmark — preflight (P0)

**Sprint:** `P0.STUDIOOS.WFE.V1-ASTRA-NATIVE-BLENDER-CREATIVE-FABRICATION-BENCHMARK1`  
**Status:** Preflight complete — **billable Codex execution not authorized in this sprint turn**  
**Baseline:** `master` @ merge of PR #58 (`ab93c0051`)

## Model identity gate (passed)

| Field | Value |
|-------|--------|
| Requested model (founder) | **Astra** |
| Verified Codex slug | **`gpt-6-astra`** (display: GPT-6-Astra) |
| Catalog probe | `npx @openai/codex@0.162.0 debug models` (authenticated account) |
| `supported_in_api` | `true` |
| Selection mechanism | `codex exec -m gpt-6-astra` or `WFE_CODEX_MODEL=gpt-6-astra` via WFE adapter |
| Prior SITE 00 proof model | **`gpt-6.1-sol`** (not Astra — do not conflate) |

**Alternatives on this account (do not substitute without founder choice):**  
`gpt-6.1-sol`, `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-sol`, `gpt-5.6-luna`, `gpt-5.6-terra`, `gpt-5.5`, `codex-auto-review`

## Authentication

- **Mechanism:** `OPENAI_API_KEY` → `codex login --with-api-key` (Cursor Cloud secret)
- **CLI:** `@openai/codex` **0.162.0**
- **Probe:** `codex login status` → logged in (API key)

## Execution mode (when authorized)

- **Subcommand:** `npx --yes @openai/codex exec -m gpt-6-astra -s workspace-write -C <benchmark-cwd> -`
- **Blender:** headless 5.2.x via existing `wfe_blender_benchmark_runner.py` pattern
- **Render inspection:** Codex `gpt-6-astra` supports **text + image** input; attach renders with `codex exec -i <png>...`
- **Context:** ~272k default window, up to ~872k max (catalog metadata)
- **Billing:** OpenAI API usage for Codex `exec` sessions (token-metered; prior SITE 00 proof ≈ **54,102 tokens** for validation-only work)

## Proposed bounded budget (founder approval required)

| Control | Proposal |
|---------|------------|
| Codex sessions | **1** initial fabrication + up to **2** revision cycles |
| Max `codex exec` wall time | **900s** per session (`WFE_CODEX_EXEC_TIMEOUT_MS`) |
| Reasoning | **medium** unless founder requests high/xhigh for revisions |
| Paid extras | **None** (no OpenArt, Artlist, remote GPU) |
| Expected token band | **150k–400k** total (environment build + 6 camera renders × up to 3 passes) — estimate only |

## Creative authority (recovered)

**Primary (in-repo):**

- `astra-context/references/astral-world-desktop-reference.png` (REFERENCE A)
- `astra-context/references/astral-world-mobile-reference.png` (REFERENCE B)
- `astra-context/references/AW_D_01_final-composition-reference-v1.jpg`
- `astra-context/references/AW_M_01_final-composition-reference-v1.jpg`
- Canon pack `astra-context/00`–`13`, `08_VISUAL_AUTHORITY.md`

**WFE spec:** `WORLD_FABRICATION_ASTRA_TEST01.md` — **Entrance Threshold** (3D spatial benchmark; distinct from ChatGPT Work Test 01 title-screen brief in `13_ASTRA_TEST_BRIEF.md`)

**TEST 02:** No separate `WORLD_FABRICATION_TEST_02` artifact in fsbw; spatial world-entry evidence is covered by AW_D_01 / AW_M_01 composition references + `09_SPATIAL_EVIDENCE.md`.

**Gap:** Full-resolution Supabase screen masters (paths in `08_VISUAL_AUTHORITY.md`) are not vendored in fsbw; pack JPG/PNG references above are sufficient to start blockout **once billable execution is authorized**.

## Fabrication plan artifact

`src/studio-os-core/world-fabrication-engine/benchmarks/astrea-entrance-threshold-v1/06_DOCUMENTATION/fabrication-plan.md`

## Known WFE gaps before first creative run

1. `authorizeCodexDispatch` currently allows **`projectId: site00` only** — extend for `astrea` / creative budget flag when founder authorizes paid generation.
2. Default dispatch prompt is SITE 00 validation text — replace with Astréa assignment manifest prompt for creative benchmark.
3. Ingestion path exists; **no return package** until authorized `codex exec` completes.

## Founder authorization request

Reply with explicit approval including:

1. Confirm model **`gpt-6-astra`**
2. Accept proposed iteration cap (**≤3** Codex sessions) and token band estimate
3. Optional: reasoning effort (`medium` / `high` / `xhigh`)

**Do not** treat this sprint message as billable execution authorization.
