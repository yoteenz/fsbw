# SITE 00 Build Object — Astra V2 Blockout (Recovery C, Stage 01)

**Asset ID:** `SITE00_BUILD_OBJECT_ASTRA_V2_BLOCKOUT`  
**Lineage:** `site00-build-object-astra-v1` preserved (not modified).

## Phase A (this commit)

Preflight only — **no billable Codex**, **no `.blend`**.

Start here: `05_FOUNDER_REVIEW/GATE_01_PREFLIGHT_PACKAGE.md`

## Phase B (when founder authorizes)

```bash
export WFE_FOUNDER_AUTHORIZED_BUDGET_USD=<ceiling>
export WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1
./scripts/wfe-site00-astra-v2-blockout-launch.sh
```

## Forensic audit input

`../site00-build-object-astra-v1/08_FORENSIC_AUDIT_RECOVERY1/` @ master `a209f34b9`
