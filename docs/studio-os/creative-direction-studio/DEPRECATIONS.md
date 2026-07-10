# Creative Direction Studio™ — Deprecation Registry (Phase 1)

**Authority:** Genesis §9B.28 · `MIGRATION_AUDIT.md`  
**Status:** Binding — Phase 1 architecture migration  
**Updated:** 2026-07-10

This registry lists modules, forbidden behaviors, and replacement owners.
Do not remove legacy paths until compatibility adapters and verification pass.

---

## Forbidden behaviors (material paths)

| Behavior | Status | Replacement |
|---|---|---|
| Direct FAL call without `productionAuthorizationId` | **Blocked in production** | `api/_lib/creativeProduction/generation-gateway.ts` |
| `skipCie` on material generation | **Blocked** | CIE advisory + Production Authorization |
| `forceGenerate` on material generation | **Blocked** | Production Authorization scope |
| Scene Stack auto-approve + auto-register | **Removed (Phase 1 hotfix)** | Draft-only local cache → promotion flow (Phase 2) |
| Local registry as write authority | **Deprecated** | Supabase Asset Registry via `registry-transaction.ts` |

---

## Legacy generation routes

| Route | Adapter | Gateway profile | Notes |
|---|---|---|---|
| `POST /api/admin/studio-builder-generate` | `adaptLegacyBuilderRequest` | studio-builder | Requires auth ID or legacy compat flag |
| `POST /api/admin/studio-foundry-generate` | `adaptLegacyFoundryRequest` | studio-foundry | Requires auth ID or legacy compat flag |
| `POST /api/admin/studio-generate-asset` | `adaptLegacyAssetDirectorRequest` | ephemeral admin | Classified `ephemeral` output |

### Environment flags

| Variable | Purpose |
|---|---|
| `CREATIVE_PRODUCTION_AUTH_SECRET` | HMAC signing secret for ProductionAuthorization |
| `CREATIVE_PRODUCTION_ALLOW_LEGACY_COMPAT` | `1`/`0` — inject compat authorization when ID omitted |

---

## Deprecated local registries (read-only cache)

| Storage key | Former owner | Replacement |
|---|---|---|
| `studioOsStudioBuilderRegistry_v1` | Studio Builder | Supabase Asset Registry |
| `studioOsAssetRegistry_v1` | M140 local view | Supabase Asset Registry |
| `studioOsFoundryRegistry_v1` | Studio Foundry | Supabase Asset Registry |

Policy module: `src/studio-os-core/creative-production/registry-policy.ts`

---

## Deprecated parallel stores (not removed in Phase 1)

| Module | Violation | Phase |
|---|---|---|
| `src/studio-os-core/campaign-engine/` | Local campaign SOT | Phase 5 projection |
| `src/services/studio/creativeDirector/` | Naming collision | Phase 3 role migration |
| `src/studio-os-core/genesis/creative-operating-system/creative-memory-engine.ts` | Parallel memory | Phase 1–2 Learning Ledger adapter |
| `src/utils/adminStudioContentBrainDemo.ts` | Content Brain SOT | Phase 5 Content Engine |

---

## Canonical Phase 1 modules (do not duplicate)

| Contract | Path |
|---|---|
| Graph types | `src/studio-os-core/creative-production/types.ts` |
| Initiative model | `src/studio-os-core/creative-production/initiative-model.ts` |
| Production graph facade | `src/studio-os-core/creative-production/graph.ts` |
| Authorization contract | `src/studio-os-core/creative-production/authorization.ts` |
| Generation gateway | `api/_lib/creativeProduction/generation-gateway.ts` |
| Registry transaction | `api/_lib/creativeProduction/registry-transaction.ts` |
| Legacy adapters | `api/_lib/creativeProduction/legacy-adapters.ts` |

---

## Service facade alignment (Phase 1 plan)

| Service | Status | Action |
|---|---|---|
| `src/services/studio/assetDirector/` | Disabled | Route through gateway |
| `src/services/studio/creativeDirector/` | Disabled | Demote to production role |
| `src/services/studio/campaignEngine/` | Disabled | Phase 5 Content Engine |
| `src/services/studio/distributionEngine/` | Disabled | Phase 5 deprecation |

Full ledger: `MIGRATION_AUDIT.md` §2.
