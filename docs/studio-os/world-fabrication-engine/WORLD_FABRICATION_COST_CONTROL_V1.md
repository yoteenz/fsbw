# World Fabrication — Cost Control V1

**Module:** `src/studio-os-core/world-fabrication-engine/cost-control.ts`  
**Bridge:** `src/studio-os-core/production-governance/`

## Requirements

- Preflight estimate + per-job budget + per-stage caps  
- `allowPaidGeneration` flag — default **false** for foundation jobs  
- **No automatic paid retries** (`autoRetryPaid: false`)  
- Founder approval above cap (`requiresFounderApprovalAboveCap: true`)  
- Track provider, model, quoted/actual credits, attempts, renders, exports, manual intervention  

## Artlist / massing

Artlist models listed as **candidates** in `massing-provider.ts`. Credit costs are **not** hardcoded — verify at execution time.

This sprint: **zero paid generations executed.**

## Governance alignment

Fabrication spend should emit `studio_world_production_usage_events` when server routes wire WFE jobs to governance gateway (future sprint).
