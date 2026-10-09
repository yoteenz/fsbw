# SITE 00 Astra V2 blockout — Phase A preflight

**Sprint:** `P0.STUDIOOS.WFE.V1-ASTRA-SITE00-CAMERA-MATCHED-ARCHITECTURAL-BLOCKOUT1`  
**Package:** `src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-astra-v2-blockout/`  
**Gate 01:** `05_FOUNDER_REVIEW/GATE_01_PREFLIGHT_PACKAGE.md`

Phase B launch (billable, after founder authorization):

```bash
export WFE_FOUNDER_AUTHORIZED_BUDGET_USD=<ceiling>
export WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1
./scripts/wfe-site00-astra-v2-blockout-launch.sh
```

Budget enforcement is **SOFT_ONLY** — see `04_DOCUMENTATION/BUDGET_ENFORCEMENT_STATUS.md`.
