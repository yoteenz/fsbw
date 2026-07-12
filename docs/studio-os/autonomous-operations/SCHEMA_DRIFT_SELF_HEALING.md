# Schema Drift Self-Healing

**Subsystem:** Studio OS Immune System™ V1  
**Scope:** Supabase schema contract vs live environment

---

## Flow

1. **Detect** — insert/probe failure or boot health check  
2. **Diagnose** — drift detector vs `schema-contract.ts`  
3. **Discover migration** — `migration-manifest.ts` allowlist  
4. **Authorize** — `evaluateAutomaticRepairAuthorization()` (default deny)  
5. **Apply** — exact repository SQL via secured server channel  
6. **Verify** — full table contract (columns, indexes, RLS)  
7. **Retry** — original operation once (max 1 repair + 1 retry per incident)

## Schema contract sources (hierarchy)

1. Applied migration files (`supabase/migrations/`)
2. `schema-contract.ts` machine-readable contract
3. `schema-dependency-manifest.ts` feature → resources
4. Application runtime expectations

## Reference table contract

`public.studio_governed_generation_jobs` — full column, index, RLS contract in `schema-contract.ts`.

## Deployment readiness

```bash
npm run schema:deployment-readiness
```

Blocks when required migration files are absent from repository manifest.

## Stop conditions

Auto-repair refuses when: no migration match, checksum mismatch, destructive SQL, RLS weakening, wrong project, concurrent repair, or verification failure.

## Security

- No browser-side DDL  
- No user-supplied SQL  
- No arbitrary migration IDs from client  
- Credentials never in incident telemetry
