# Studio World Virtual Production OS

**Status:** Foundation + Campaign 001 pilot + External contract v1  
**Domain module:** `src/studio-os-core/virtual-production/`  
**Admin workspace:** `/admin/studio/virtual-production`  
**Debug hub:** `/__virtual-production`  
**External API:** `/api/studio-world/v1/campaigns` (contract v1)

---

## Spatial Architecture Review (condensed)

| Question | Answer |
|----------|--------|
| World placement | **Studio World production district** — Virtual Production command center, not FS commerce |
| Department | Creative Production / Campaign Operations (alongside Creative Production Graph™, not inside Experience Lab compile) |
| Genesis | Production authorization still flows through governed generation gateway for material output |
| Dashboard risk? | **No** — production board is shot-centric film workflow, not generic SaaS metrics |
| Overall World Score | **4.1** — approved for foundation implementation |

Frontal Slayer is the **first reference tenant** (`org_id: frontal-slayer`), not the architecture owner.

---

## Philosophy

Studio World is the **persistent creative-production intelligence layer**. External AI systems (FAL, OpenArt, OpenArt Director, manual upload) are **production providers**.

Production flow:

```
CANON → DIRECT → PRODUCE → INSPECT → REPAIR → APPROVE → ASSEMBLE → DISTRIBUTE → LEARN
```

Studio World owns brand memory, canon, continuity, QC, approvals, provenance. Providers execute tasks.

---

## Domain Model

| Entity | Table | Purpose |
|--------|-------|---------|
| Brand | `studio_vp_brands` | Brand Production Bible root |
| Character | `studio_vp_characters` | Persistent character canon |
| Reference Pack | `studio_vp_character_reference_packs` | Versioned character reference sets |
| Environment | `studio_vp_environments` | World / location canon |
| Product | `studio_vp_products` | Product fidelity canon |
| Wardrobe | `studio_vp_wardrobe` | Outfit / accessory canon |
| Prop | `studio_vp_props` | Prop canon |
| Camera Profile | `studio_vp_camera_profiles` | Camera grammar |
| Behavior Profile | `studio_vp_behavior_profiles` | Behavioral continuity |
| Campaign | `studio_vp_campaigns` | Production project |
| Scene | `studio_vp_scenes` | Scene grouping |
| Shot | `studio_vp_shots` | Independently replaceable shot records |
| Continuity | `studio_vp_shot_continuity` | Start/end state inheritance |
| Storyboard Frame | `studio_vp_storyboard_frames` | Keyframe anchors |
| Production Job | `studio_vp_production_jobs` | Provider execution jobs |
| Generation Asset | `studio_vp_generation_assets` | Provenance-rich media |
| QC Review | `studio_vp_qc_reviews` | Structured quality control |
| Repair | `studio_vp_repairs` | Shot repair without campaign destruction |
| Assembly | `studio_vp_assemblies` | Edit timeline foundation |
| Deliverable | `studio_vp_deliverables` | Platform export metadata |
| Director Package | `studio_vp_director_packages` | External Director export payload |
| Provider Config | `studio_vp_provider_configs` | Capability metadata (no secrets) |
| Take | `studio_vp_takes` | Candidate generations per shot |
| External Engagement | `studio_vp_external_engagements` | Idempotent external provisioning |
| Client Review | `studio_vp_client_reviews` | Client-visible review items |
| Client Activity | `studio_vp_client_activity` | Sanitized activity feed |
| Production Event | `studio_vp_production_events` | Webhook readiness (recorded only) |

All tables use **`org_id`** tenant scoping + RLS (service-role API access).

---

## Production Modes

| Mode | ID | Use case |
|------|-----|----------|
| **Director** | `director` | Fast multi-scene — social, lifestyle, narrative volume |
| **Precision** | `precision` | Shot-by-shot — hero product, exact character |
| **Hybrid** | `hybrid` | Director speed + Precision repair for weak shots |

Mode selection UI: `ProductionModeSelector` in Virtual Production workspace.

---

## Provider Abstraction

Core types in `src/studio-os-core/virtual-production/providers.ts`:

- `ProductionProvider` — declares capabilities + integration mode
- `ProductionCapability` — e.g. `image_generation`, `directed_multi_scene`, `external_manual`
- `ProductionRequest` / `ProductionJobRecord` / `ProductionResult`
- `resolveProviderForCapability()` — capability-based provider selection
- `classifyProductionError()` — user-facing error categories (never raw stack traces)

### Registered providers

| Provider | Integration | Status |
|----------|-------------|--------|
| `fal` | API | Wired via governed generation gateway |
| `openart` | API | Partial — MCP model API; not in VP job dispatch yet |
| `openart-director` | External manual | Production package export only |
| `manual` | External manual | Import into QC pipeline |
| `upload` | Upload | Traditional footage import |

### Adding a new provider

1. Add entry to `PRODUCTION_PROVIDERS` with declared `capabilities` and `integrationMode`.
2. Implement server adapter under `api/_lib/creativeProduction/providers/` (or VP-specific adapter).
3. Route material generation through `executeGovernedGeneration()` — never call provider APIs from UI.
4. Register non-secret metadata in `studio_vp_provider_configs` if org-specific toggles needed.
5. Extend `resolveProviderForCapability()` ranking if mode-specific preference required.

---

## FAL Integration (reused)

Existing path preserved:

```
Admin UI → POST /api/admin/studio-builder-generate
         → api/_lib/creativeProduction/generation-gateway.ts
         → FAL → studio_governed_generation_jobs + asset registry
```

Precision-mode shot repair jobs link to this via `studio_vp_production_jobs.governed_job_id` (foundation field ready).

---

## OpenArt Integration (reused / status)

| Surface | Status |
|---------|--------|
| OpenArt MCP model API | Available in Cursor environment (`openart_generate_image`, etc.) |
| OpenArt in provider registry | `providers/adapters.ts` — `READY · NOT CONNECTED` |
| OpenArt Director programmatic API | **Does not exist** in codebase |
| OpenArt Director workflow | **External/manual** — `buildDirectorProductionPackage()` + markdown export |

### OpenArt Director

- **Programmatic integration:** NO
- **External/manual workflow:** YES — `export_director_package` API action
- **Blocked by:** No supported Director API; do not scrape private interfaces

---

## Campaign Lifecycle

```
IDEA → BRIEF → DIRECTION → STORYBOARD → PREPRODUCTION → PRODUCTION
  → QC → REPAIR → ASSEMBLY → CLIENT_REVIEW → APPROVED → DELIVERED → ARCHIVED
```

## Asset Approval States

`draft` | `generating` | `ready_for_review` | `approved` | `rejected` | `repair_required` | `superseded` | `archived`

**Canon locked** ≠ **QC verified** — lock prevents intentional redesign; QC is separate inspection.

---

## QC System

Categories: identity, product, environment, wardrobe, prop, anatomy, motion, camera, lighting, continuity, text/logo, audio, brand, overall.

Statuses: `pass` | `warning` | `fail` | `not_reviewed`

Decisions: approve | reject | repair

---

## Repair Workflow

1. Preserve original asset (`approval_state: superseded`)
2. Create repair production job (Precision mode default)
3. Copy canon/continuity from shot
4. Produce replacement candidates
5. Select replacement take — original history preserved in `repair_ancestry`

Implementation: `src/studio-os-core/virtual-production/repair.ts`

---

## Continuity

Shot continuity records inherit previous shot `end_state` into next shot `start_state`. Dimensions: character, wardrobe, hair, makeup, prop, environment, lighting, position, camera.

Automatic continuity solving is **out of scope** for this sprint — architecture only.

---

## Assembly Foundation

`studio_vp_assemblies.timeline` — ordered shot/take entries with transitions. No NLE editor in this sprint.

---

## External Import

`POST /api/admin/studio-virtual-production` action `import_asset` — associates uploaded media with campaign/shot/provider; enters same QC pipeline.

---

## API

**Route:** `/api/admin/studio-virtual-production`

| Method | Action | Description |
|--------|--------|-------------|
| GET | `campaigns` | List campaigns for org |
| GET | `brands` | List brand bibles |
| GET | `board` | Campaign + shots for production board |
| GET | `providers` | Provider registry |
| POST | `seed_reference` | Legacy brand + placeholder shell |
| POST | `seed_fs_canon_campaign001` | Real FS canon + Campaign 001 pilot seed |
| POST | `create_campaign` | New campaign |
| POST | `create_repair` | Open repair job |
| POST | `export_director_package` | OpenArt Director markdown package |
| POST | `import_asset` | External media import |

Auth: admin session via `resolveAdminAuth`. Provider secrets remain server-side.

---

## Routes

### Admin
- `/admin/studio/virtual-production` — Production Board workspace

### Debug / Review
- `/__virtual-production` — Debug home + provider status
- `/__virtual-production/brand-canon`
- `/__virtual-production/character-canon`
- `/__virtual-production/campaign`
- `/__virtual-production/storyboard`
- `/__virtual-production/shot-board`
- `/__virtual-production/shot-detail`
- `/__virtual-production/production`
- `/__virtual-production/qc`
- `/__virtual-production/repair`
- `/__virtual-production/assembly`

---

## Reference Tenant — Frontal Slayer Campaign 001

**Brand:** FRONTAL SLAYER (`brand_key: frontal-slayer`, status `approved` — real canon from repo sources)  
**Campaign:** FRONTAL SLAYER / CAMPAIGN 001 — 9-shot hybrid social pilot (9:16, Reels/TikTok)  
**Character:** Nia — text canon locked; reference pack V1 all slots **SETUP REQUIRED**  
**Products:** Six signature units from SignatureCollectionRegistry (no invented SKUs)

Seed via API: `{ "action": "seed_fs_canon_campaign001", "org_id": "frontal-slayer" }`

See: `docs/studio-os/FRONTAL_SLAYER_CAMPAIGN_001_PILOT.md`

---

## External Integration Contract v1

**Route:** `/api/studio-world/v1/campaigns`  
**Auth:** HMAC-SHA256 (`STUDIO_WORLD_EXTERNAL_API_SECRET`)  
**Docs:** `docs/studio-os/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md`

Supports: provision (idempotent), client-safe status, reviews, deliverables, activity.  
**SITE 00 not connected** — contract documented for independent consumer implementation.

---

## Reference Tenant (legacy shell)

Legacy placeholder seed still available: `{ "action": "seed_reference", "org_id": "frontal-slayer" }`

---

## Standalone Studio World Extraction Notes

| Dependency | Extraction impact |
|------------|-------------------|
| `src/studio-os-core/virtual-production/` | Portable — no FS imports |
| `api/_lib/virtualProduction/` | Portable with Supabase + admin auth |
| Governed generation gateway | Shared platform seam — inject via interface |
| `org_id` tenant model | Already multi-tenant |
| Admin UI under `/admin/studio/*` | Replace with standalone Studio World shell |
| Frontal Slayer reference seed | Remove or replace with tenant bootstrap |

---

## Known Limitations (this sprint)

- No automatic identity scoring or facial recognition (manual QC only)
- No full nonlinear editor
- No OpenArt Director API automation (external/manual package only)
- Precision FAL jobs queued in DB — live generation execution next sprint
- Final social master render not produced — deliverable marked incomplete
- Continuity side-by-side comparison UI partial
- Outbound webhooks not implemented — polling documented
- SITE 00 integration architected only — not connected

---

## Recommended Next Sprint

1. Upload Nia reference pack images → approve slots
2. Wire Precision-mode shot generation to governed gateway with shot-level canon injection
3. Import Director external results; complete hybrid repair on shot-08
4. Full QC review UI with per-category forms + candidate comparison
5. Assembly render when selected takes approved
6. External consumer (SITE 00 repo) implements contract v1 client
7. Optional outbound webhooks from `studio_vp_production_events`
