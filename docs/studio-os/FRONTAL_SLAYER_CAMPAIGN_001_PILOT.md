# FRONTAL SLAYER — Campaign 001 Production Pilot

**Status:** IMPLEMENTED (pilot architecture + seed data)  
**Tenant:** `org_id: frontal-slayer` (reference tenant, not architecture owner)  
**Campaign key:** `campaign-001`  
**Production mode:** HYBRID  
**Format:** 9:16 · 15–30s · Instagram Reels / TikTok

---

## Purpose

First real Studio World production pilot validating:

- Real Frontal Slayer canon attachment (no invented assets)
- 9-shot social editorial structure
- Director / Precision / Hybrid workflows
- Keyframe → QC → motion gating
- Repair + supersession without history loss
- Assembly V1 + incomplete deliverable (accurate state)
- External integration contract v1 (for future consumers — **SITE 00 not connected**)

---

## Campaign Brief

| Field | Value |
|-------|-------|
| Objective | HIGH-CONSISTENCY SOCIAL PRODUCTION PILOT |
| Narrative | Recognition → environment → movement → detail → product → recognition → hero resolution |
| Treatment | Observational luxury social film; Hybrid Director speed + Precision repair |
| Audio | Music + ambience + SFX planned; no automatic VO |
| Director external status | `ready_for_director` |

Source: `src/studio-os-core/virtual-production/pilot/campaign-001.ts`

---

## Shot List (9 shots)

| # | Key | Title | Mode | Provider | ID crit | PR crit | Notes |
|---|-----|-------|------|----------|---------|---------|-------|
| 1 | shot-01 | Identity Hero | precision | fal | HIGH | LOW | Identity-critical hero |
| 2 | shot-02 | Environmental Wide | director | openart-director | LOW | LOW | SET-001 wide |
| 3 | shot-03 | Movement Tracking | director | openart-director | MED | LOW | Walking coverage |
| 4 | shot-04 | Detail Insert | director | openart-director | LOW | LOW | Distraction cut |
| 5 | shot-05 | Product Critical | precision | fal | LOW | HIGH | NOIR vitrine |
| 6 | shot-06 | Profile Identity | precision | fal | HIGH | LOW | 3/4 identity |
| 7 | shot-07 | Occlusion Transition | director | openart-director | MED | LOW | Editorial occlusion |
| 8 | shot-08 | Recognition Return | hybrid | openart-director → fal | HIGH | LOW | **Hybrid repair target** |
| 9 | shot-09 | Hero Resolution | director | openart-director | MED | LOW | Final resolution |

Each shot stores: purpose, duration, canon refs, criticality, transition type, editorial note (where applicable), start/end state, capability requirement.

---

## Canon Attached

| Entity | Key | Status |
|--------|-----|--------|
| Brand | frontal-slayer | APPROVED — #EB1C24, Futura PT, luxury tone |
| Character | nia | SETUP REQUIRED — text canon locked, images missing |
| Reference Pack V1 | reference-pack-v1 | All 13 slots MISSING |
| Products | 6 signature units | APPROVED — from SignatureCollectionRegistry |
| Environment | set-001-flagship | APPROVED — SET-001 text/spatial canon |
| Wardrobe | nia-locked-look-v1 | APPROVED — film trilogy locked look |
| Props | earbuds, matcha, etc. | APPROVED where defined |
| Camera profile | fs-camera-v1 | IMPLEMENTED |
| Behavior profile | nia-behavior-v1 | IMPLEMENTED |

Source: `src/studio-os-core/virtual-production/canon/frontal-slayer-canon.ts`

---

## Production Workflows Exercised

### Director (EXTERNAL/MANUAL)

- OpenArt Director has **no programmatic API** (`OPENART_DIRECTOR_INTEGRATION.programmaticApi === false`)
- Seed creates director package + `ready_for_director` status
- Export: `POST /api/admin/studio-virtual-production` action `export_director_package`

### Precision (ARCHITECTED — jobs queued, no live generation in pilot)

- Production jobs queued for shot-01 (character_reference) and shot-05 (multi_reference) via FAL
- Status: `queued` — awaiting governed generation execution

### Hybrid (IMPLEMENTED in seed)

- shot-08: Director TAKE A → QC fail → repair job → Precision replacement path
- Original take preserved; repair record + supersession metadata

---

## QC

Manual identity QC supported. No fabricated confidence scores.

Pilot seed includes sample QC on hybrid shot. Dimensions: identity, product, environment, wardrobe, prop, anatomy, brand, overall.

---

## Assembly & Deliverable

| Artifact | Status |
|----------|--------|
| Assembly V1 | IMPLEMENTED — ordered timeline, transitions, audio plan; **no final render** |
| Social Master deliverable | INCOMPLETE — `delivery_state: pending`, `client_visible: false` |

**Not marked DELIVERED** — accurate incomplete state.

---

## Operator UI

| Route | Purpose |
|-------|---------|
| `/admin/studio/virtual-production` | Campaign Operator workspace (admin auth) |
| `/__virtual-production/board` | Debug board with demo fallback |

Tabs: BRIEF · CANON · STORYBOARD · SHOTS · PRODUCTION · QC · ASSEMBLY · DELIVERABLES · HISTORY

Seed action: **Initialize FS Canon + Campaign 001** → `seed_fs_canon_campaign001`

---

## Seed API

```
POST /api/admin/studio-virtual-production
{ "action": "seed_fs_canon_campaign001", "org_id": "frontal-slayer" }
```

Implementation: `api/_lib/virtualProduction/canon-seed.ts`

---

## Database

Migration: `20260820160000_studio_vp_campaign_pilot_external.sql`  
Applied to production Supabase project `hyycomvcaqxxvyrfupes`.

---

## Known Limitations

- Nia approved reference images: **SETUP REQUIRED** (all slots missing)
- Precision FAL generation: jobs queued only
- Final video render: not produced
- Keyframe QC side-by-side UI: partial (shot list in storyboard tab)
- Continuity comparison UI: metadata stored; full adjacent-shot viewer not built
- SITE 00 integration: **not implemented** — see `STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md`

---

## Recommended Next Sprint

1. Upload approved Nia reference pack images → flip slot states from MISSING to APPROVED
2. Execute Precision jobs for shot-01 and shot-05 via governed FAL gateway
3. Import Director external result for shot-02/03/07/09
4. Complete hybrid repair on shot-08 with real assets
5. Run assembly render when selected takes approved
6. Mark deliverable client-visible after founder approval
7. External consumer (SITE 00 repo) implements contract v1 client
