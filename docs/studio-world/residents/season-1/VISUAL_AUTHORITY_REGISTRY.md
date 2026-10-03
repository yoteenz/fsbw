# Studio World — Season 1 Visual Authority Registry

**Sprint:** `P0.STUDIOWORLD.SEASON1.VISUAL-AUTHORITY.INGEST2` (package bind) · builds on INGEST1  
**Canon version:** `season1-v1`  
**Runtime source:** `src/studio-os-core/studio-world-residents/visual-authority/`  
**Ingested assets:** `public/studio-world/residents/season-1/`  
**Package manifest:** [visual-authority-package-manifest.json](./visual-authority-package-manifest.json)  
**Machine registry JSON:** [season1-visual-authority-registry.json](./season1-visual-authority-registry.json)

Repo files are authority — not chat, not the attachment ZIP path after ingest.

---

## Package ingested

| Field | Value |
|--------|--------|
| Source package | `STUDIO_WORLD_SEASON1_VISUAL_AUTHORITY_CURSOR_LIGHT_v1` |
| Assets in repo | **27** JPEG references (Cursor-light derivatives; visual authority unchanged) |
| Residents | **8 / 8** |
| Re-ingest script | `node scripts/ingest-season1-visual-authority-package.mjs <extracted-dir>` |

---

## Authority taxonomy

| Type | Purpose |
|------|---------|
| `NATURAL_HABITAT_FULL_BODY` | Primary identity (one per resident, **FOUNDER_APPROVED** + linked JPEG) |
| `IDENTITY_CLOSEUP` | Face / identity continuity (Noa: **3** `REFERENCE_ONLY` close-ups retained) |
| `IDENTITY_ANGLE_PACK` | MetaHuman/UE slot — **PROVISIONAL** (partial close-ups only) |
| `SIGNED_WALL_PORTRAIT` | Direct-camera essence (text authority; no signed JPEG in package) |
| `ROLE_COMPETENCY_FULL_BODY` | Role/competency (text authority) |
| `WORK_UNIFORM_REFERENCE` | Shared-uniform **candidates** — `CONCEPT_LOCKED_VISUAL_PENDING` |
| `GLAMOUR_OR_ALTERNATE_MODE` / `ALTERNATE_MODE` | Iona full-glam / Marlowe grand reference — **not** primary |
| `SUPERSEDED_REFERENCE` | Textual anti-drift (Hale, slender Marlowe, etc.) |

---

## Primary natural authorities (linked assets)

| ID | Name | Public asset path (primary) |
|----|------|-----------------------------|
| SW-RESIDENT-001 | Etta Vale | `/studio-world/residents/season-1/sw-resident-001-etta-vale/natural-authority/sw-resident-001-etta-vale-natural-fullbody-01.jpg` |
| SW-RESIDENT-002 | Zuri Xu | `.../sw-resident-002-zuri-xu/.../sw-resident-002-zuri-xu-natural-fullbody-01.jpg` |
| SW-RESIDENT-003 | Jules Mercer | `.../sw-resident-003-jules-mercer/...` |
| SW-RESIDENT-004 | Noa Kline | `.../sw-resident-004-noa-kline/...` |
| SW-RESIDENT-005 | Caspian Reed | `.../sw-resident-005-caspian-reed/...` |
| SW-RESIDENT-006 | Iona Wells | `.../sw-resident-006-iona-wells/...` |
| SW-RESIDENT-007 | Marlowe Saint | `.../sw-resident-007-marlowe-saint/...` (larger-bodied natural) |
| SW-RESIDENT-008 | Elio “EV” Vahn | `.../sw-resident-008-elio-vahn/...` |

Each record stores `sourceFilename` (original archive name) for traceability.

---

## Close-up / face references

- **Etta, Zuri, Jules, Caspian, Iona, EV:** one close-up each (`FOUNDER_APPROVED_REFERENCE` where manifest says so).
- **Noa:** three close-ups (`REFERENCE_ONLY`) — no single frame promoted over the others.
- **Marlowe:** no separate close-up folder in package; natural full-body carries primary face/body continuity.

---

## Signed wall portraits

Textual signed-portrait behavior remains in ensemble canon (e.g. EV: **only** “Regards, EV”). No signed-wall JPEGs were in the Cursor-light package — do not substitute close-ups as signed-wall authority.

---

## Alternate modes

| Resident | Asset | Status |
|----------|--------|--------|
| Iona Wells | `.../alternate-modes/...-full-glam...` | `ALTERNATE_MODE_REFERENCE` → **not** primary |
| Marlowe Saint | `.../grand-cultural-icon...` | `REFERENCE_ONLY` alternate — not default |

---

## Work uniform candidates

Eight `work-uniform-candidate-01.jpg` files — all **`CONCEPT_REFERENCE_ONLY`** → authority status **`CONCEPT_LOCKED_VISUAL_PENDING`**. Not final shared-uniform visual authority.

Marlowe candidate filename notes **corrected-larger-body** in manifest organized path.

---

## Protections (enforced in validation)

- **Zuri Xu** naming only; Hale appears only under superseded text refs.
- **Marlowe** natural authority text + ingested natural JPEG = larger-bodied age-54 canon.
- **Iona** glam JPEG cannot become `isPrimaryIdentityAuthority`.
- **Uniform** records cannot be `founderApproved`.

---

## Fabrication readiness (post-ingest)

| Flag | Typical value |
|------|----------------|
| `bodyLocked` | true (natural JPEG linked) |
| `portraitLocked` | true when founder-approved close-up exists |
| `anglesPartial` | true when any close-ups exist |
| `anglesComplete` | false |
| `uePending` / `metahumanPending` | true |
| `ueReconstructed` | false |

---

## Known gaps

- Signed-wall portrait JPEGs not in package.
- Role/competency full-body JPEGs not in package (text authorities only).
- Complete MetaHuman angle pack not approved.
- Final Studio World logo + final uniform visual still pending.

---

## Validation

- `validateSeason1VisualAuthority()` — includes on-disk asset checks.
- Vitest: `studio-world-residents-visual-authority.test.ts` + full `studio-world-residents/` suite.
