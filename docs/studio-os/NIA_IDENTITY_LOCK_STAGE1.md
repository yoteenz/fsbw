# Nia Identity Lock — Campaign 001 Stage 1

**Sprint:** Reference Pack V1 production + canon approval gate  
**Character:** Nia (Studio World / Frontal Slayer)  
**Campaign:** 001 — identity gate blocks precision motion until pack locked  

## Objective

Establish canonical identity foundation **separate from** Campaign 001 video production. Stage 2 (live motion) requires explicit operator authorization after V1 lock.

## Repository audit (2026-08-20)

| Finding | Status |
|---------|--------|
| Approved Nia portraits in `public/` | **NOT FOUND** |
| `FS_CHARACTER_NIA.referenceUrls` | **Empty — SETUP REQUIRED** |
| Film trilogy bibles | **Text canon locked** |
| Campaign 001 precision jobs | **Queued, NOT executed** |
| SITE 00 | **Out of scope — not modified** |

Do **not** fabricate 13 independent text-to-image interpretations. All slots must represent **ONE person** once imagery exists.

## Reference Pack V1 slots

| Slot | Label |
|------|-------|
| `front` | 01 FRONT |
| `three_quarter_left` | 02 3/4 LEFT |
| `three_quarter_right` | 03 3/4 RIGHT |
| `profile_left` | 04 PROFILE LEFT |
| `profile_right` | 05 PROFILE RIGHT |
| `medium` | 06 MEDIUM |
| `full_body` | 07 FULL BODY |
| `neutral` | 08 NEUTRAL EXPRESSION |
| `smile` | 09 SMILE |
| `serious` | 10 SERIOUS EXPRESSION |
| `movement` | 11 MOVEMENT |
| `hair_detail` | 12 HAIR DETAIL |
| `skin_detail` | 13 SKIN DETAIL |

### Slot lifecycle states

`missing` → `candidate` → `qc_required` → `approved` → `locked`  
Rejection path: `rejected` (candidate provenance preserved in `studio_vp_reference_pack_candidates`)

## Primary identity anchor

One approved asset designated as strongest canonical reference. Other views should be derived/conditioned from anchor (image2image, reference uploads) — not independent rediscovery.

## OpenArt character status

**EXTERNAL** — MCP supports `image2image` + uploads; **no programmatic persistent character API**.  
Operator package: **OPENART CHARACTER SETUP / EXTERNAL**  
Studio World remains canonical owner: **STUDIO WORLD CHARACTER / NIA**

## Campaign 001 identity gate

| State | Meaning |
|-------|---------|
| `blocked` | `IDENTITY FOUNDATION REQUIRED` — precision motion blocked |
| `pass` | Reference Pack V1 locked — identity-dependent execution allowed |

Preview/configuration work remains allowed when blocked.

## API actions

| Action | Method | Purpose |
|--------|--------|---------|
| `reference_pack_board` | GET | Full board + audit + gate evaluation |
| `reference_pack_assign_candidate` | POST | Assign uploaded/generated candidate to slot |
| `reference_pack_approve_slot` | POST | Approve slot with MANUAL IDENTITY QC |
| `reference_pack_reject_slot` | POST | Reject candidate — provenance preserved |
| `reference_pack_set_anchor` | POST | Designate primary identity anchor |
| `reference_pack_lock_v1` | POST | Lock V1 immutable + set gate PASS |
| `reference_pack_create_v2` | POST | Create V2 draft from locked V1 |

## UI

**Admin:** `/admin/studio/virtual-production` → **CANON** tab → Reference Pack identity board  
**Debug:** `/__virtual-production/board` (same workspace component)

Features: primary anchor, 13-slot grid, compare-to-anchor, mobile swipe, lock control (disabled until ready).

## Database

Migration: `20260820200000_studio_vp_nia_identity_lock.sql`

- `studio_vp_reference_pack_candidates`
- Pack columns: `primary_anchor_asset_id`, `identity_invariants`, `locked_at`, `locked_by`, `openart_character_status`, `provider_mappings`
- Campaign columns: `identity_gate_status`, `identity_source_pack_id`, `identity_blocker_reason`

## Code paths

| Area | Path |
|------|------|
| Identity core | `src/studio-os-core/virtual-production/identity/` |
| Server service | `api/_lib/virtualProduction/identity-service.ts` |
| UI board | `src/components/admin/studio/virtual-production/ReferencePackIdentityBoard.tsx` |
| Canon seed | `api/_lib/virtualProduction/canon-seed.ts` |

## Stage 1 stop gate

After Reference Pack V1 is locked: **STOP** — do not auto-proceed to Campaign 001 live video. Stage 2 requires explicit operator authorization.

## Current honest status

**REFERENCE PACK V1: NOT LOCKED** — no approved imagery in repository. Architecture + gate + UI shipped; operator must upload/approve assets before lock.
