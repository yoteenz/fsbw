# Studio World — SITE 00 / Studio OS Firewall Audit (Audit1)

Classification key: **SITE00** · **STUDIO_WORLD** · **STUDIO_OS** · **SHARED_CONTRACT** · **UNCLEAR**

---

## SITE 00 (creation / inception)

| Capability | Evidence | Notes |
|------------|----------|-------|
| Origin, identity, builder flows | `src/site00/`, `docs/site00/BIBLE.md` | Production lifecycle ORIGIN→… |
| ASSTS asset vault | `/assts`, `site00_*` tables | Review workflow — admin |
| Production OS API | `api/admin/site00-production.ts` | Client projects — operational on SITE00 |
| Design bridge | `api/_lib/site00DesignBridge/` | Artifact handoff |
| NDXBOOK handoff doc | `docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.md` | SW pilot ↔ SITE00 |
| Bridge test fixture | `src/features/studio-world/website/bridge-validation/site00BridgeRoundtripFixture.ts` | Contract test only |

**SW should not rebuild:** identity builder, static site compilation, ASSTS batch pipeline.

**SW may reference:** brand/project/artifact IDs once operational in world.

---

## STUDIO WORLD (lived company world)

| Capability | Evidence |
|------------|----------|
| HQ routes `/admin/studio/*`, `/admin/studio/world/*` | App.tsx, route-registry |
| Company Grand Atrium, company-scoped CDS | company-routes |
| Living HQ / Mansion metaphor | headquarters-experience, CORE.md Mansion |
| Resident system + life simulation | studio-world-residents |
| World canon docs | docs/studio-world/* |
| studio_world_* tenancy (orgs, clients, residents) | migrations |
| Spatial registries (atlas, codex, constitution) | studio-world-atlas, codex, constitution |
| Debug world surfaces | `/__studio-world/*` |

---

## STUDIO OS (machinery)

| Capability | Evidence |
|------------|----------|
| Portfolio command `/admin/studio-os/*` | application/routes.ts |
| Genesis, scene stack, world compiler | studio-os-core |
| Model orchestrator, generation runtime | model-orchestrator, generation-runtime |
| Event bus, workflow, state, permission engines | *-engine modules |
| Executive simulation modules (M90–M115 family) | org-intelligence modules |
| Resident **runtime** tick persistence adapters | life-os/runtime (substrate) |
| Diagnostics | `/__studio-os-*`, `src/studio-os/diagnostics/` |
| Institute core + expert capture backend | studio-institute/, expert-capture/ |

**Spatialization rule:** OS modules appear as **Systems Dock** rooms — founder decision whether to keep metaphor or hide.

---

## SHARED_CONTRACT

| Contract | Evidence |
|----------|----------|
| NDXBOOK SITE00 handoff JSON/MD | ndxbook handoff files |
| Governed generation / creative production | creative-production gateway |
| Workspace registry + org boundary | workspace/, OrganizationContextProvider |
| Supabase project shared with FS | hyycomvcaqxxvyrfupes — repo-audit 15 |

---

## UNCLEAR (needs founder decision)

| Item | Why |
|------|-----|
| Character Lab vs Season 1 residents | Overlapping “character” language |
| Memory Engine™ vs resident memory | Same word, different layers |
| Experience Lab product vs world environment | Is lab a **place** or **factory**? |
| Marketplace vs Expert Marketplace vs Legacy Network | Three marketplace metaphors |
| Studio Institute public routes vs SW workforce training | Training boundaries |

---

## Overlap matrix (SITE00 migration)

| Original SW-adjacent concept | Current SITE00 equivalent | Duplication risk | SW should |
|------------------------------|---------------------------|------------------|-----------|
| World / experience **creation** | SITE00 builder, BLDR | High if SW rebuilds creator | **Connect** only |
| Identity / brand genesis | ORIGIN, IDNTY | High | Reference SITE00 |
| Environment asset generation | ASSTS + FAL batches | Medium | Use approved assets |
| Client production lifecycle | site00_production_* | Medium | Link projects into SW org |
| NDXbook brand world | ndxbook module + handoff | Medium | Pilot tenant in SW |

Evidence: handoff doc + `route-intelligence/site00-p0-vr-3d-scope.ts` (scope boundary doc).

---

## Overlap matrix (Studio OS)

| SW surface | OS module | Classification |
|------------|-----------|----------------|
| Event Bus Room | event-bus | Spatialized substrate |
| Permission Control Room | permission-engine | Spatialized substrate |
| Executive Council Chamber | executive-council | Hybrid — OK as room |
| Organization Digital Twin Observatory | organization-digital-twin | Hybrid |
| Resident simulation tick | life-os/runtime | **Invisible** — do not building-ify |
