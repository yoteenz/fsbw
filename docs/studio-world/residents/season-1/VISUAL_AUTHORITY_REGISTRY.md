# Studio World — Season 1 Visual Authority Registry

**Sprint:** `P0.STUDIOWORLD.SEASON1.RESIDENT-VISUAL-AUTHORITY.INGEST1`  
**Canon version:** `season1-v1`  
**Runtime source:** `src/studio-os-core/studio-world-residents/visual-authority/`  
**JSON export:** [season1-visual-authority-registry.json](./season1-visual-authority-registry.json)

Repo files are authority — not chat, not disconnected image folders without lineage.

---

## Authority taxonomy

| Type | Purpose | Default status at ingest |
|------|---------|---------------------------|
| `NATURAL_HABITAT_FULL_BODY` | Approved off-duty / natural identity lane | `FOUNDER_APPROVED` (primary identity) |
| `SIGNED_WALL_PORTRAIT` | Direct-camera essence + signature behavior | `FOUNDER_APPROVED` (text authority; binary asset optional) |
| `ROLE_COMPETENCY_FULL_BODY` | Role + competency + client value in frame | `FOUNDER_APPROVED` (text authority) |
| `IDENTITY_ANGLE_PACK` | Face/body angles for UE/MetaHuman | `PROVISIONAL` until repo-verified pack |
| `WORK_UNIFORM_REFERENCE` | Shared SW uniform personalization slot | `CONCEPT_LOCKED_VISUAL_PENDING` |
| `GLAMOUR_OR_ALTERNATE_MODE` | Contextual alternate (Iona only) | `FOUNDER_APPROVED` — **not** primary identity |
| `SUPERSEDED_REFERENCE` | Anti-drift archive | `REFERENCE_ONLY` |

Statuses: `FOUNDER_APPROVED` · `PROVISIONAL` · `CONCEPT_LOCKED_VISUAL_PENDING` · `SUPERSEDED` · `REFERENCE_ONLY`

---

## Integration

- Each resident identity (`ensembleRecordToIdentity`) exposes `visualAuthorityRefs`, `primaryNaturalHabitatAuthorityId`, and `visualFabricationReadiness`.
- Assets remain versionable; resident canon **references** authority record IDs (`va:SW-RESIDENT-###:…`).
- Validation: `validateSeason1VisualAuthority()` + vitest `studio-world-residents-visual-authority.test.ts`.

---

## Eight residents — primary natural lane (summary)

| ID | Name | Natural lane |
|----|------|----------------|
| SW-RESIDENT-001 | Etta Vale | Sophisticated Fashionista — ivory sculptural tailoring |
| SW-RESIDENT-002 | Zuri Xu | Architectural Fashion Strategist — taupe/stone asymmetric tailoring |
| SW-RESIDENT-003 | Jules Mercer | Relaxed Romantic — long locs, linen, wine trousers |
| SW-RESIDENT-004 | Noa Kline | Understated Systems Dad — muted brown/charcoal basics |
| SW-RESIDENT-005 | Caspian Reed | Decadent Bohemian Aristocrat — burgundy romantic coat |
| SW-RESIDENT-006 | Iona Wells | Precision Utilitarian — freckles, glasses, technical workwear |
| SW-RESIDENT-007 | Marlowe Saint | Off-Duty Cultural Icon — larger-bodied, burgundy/gold pattern |
| SW-RESIDENT-008 | Elio “EV” Vahn | Private Club Strategist — burgundy velvet, black tailoring |

Full trait-level authority: see TypeScript records in `visual-authority/season1-records.ts`.

---

## Signed portrait (canonical behaviors)

- **EV:** ONLY “Regards, EV” with underline — never “Elio Vahn” on portrait signature.
- **Marlowe:** Large theatrical signature; possible “You’re welcome.”
- **Jules:** Loose, warm, playful.
- **Etta:** Restrained, elegant.
- **Zuri:** Small, neat, efficient.
- **Noa:** Minimal.
- **Caspian:** Expressive.
- **Iona:** Modest, careful; possible correction language.

Signed portraits are **not** merged with natural full-body or competency portraits.

---

## Work uniform

**Status:** `CONCEPT_LOCKED_VISUAL_PENDING` — one shared Studio World uniform system with per-resident customization (see ensemble `uniform-system.ts`). Generated uniform candidates must **not** be marked `FOUNDER_APPROVED`.

---

## Fabrication readiness (all residents at ingest)

| Flag | Value |
|------|--------|
| portraitLocked | false |
| bodyLocked | false |
| anglesPartial / anglesComplete | false |
| uePending / metahumanPending | true |
| ueReconstructed | false |

Do not mark UE/MetaHuman reconstruction complete without founder-verified assets.

---

## Anti-drift (machine-consumable)

Each authority record carries `prohibitedDrift` aligned with ensemble `antiFlattening` plus visual-specific guards (e.g. Iona glam not default, Marlowe not slimmed, Zuri not Hale, Jules locs length, Noa not costumed heritage).

---

## Pending / missing assets

- No repo-verified binary paths are bound at ingest (`assetPath` empty) — intentional.
- Identity angle packs: **PROVISIONAL** until approved packs are checked into repo with founder sign-off.
- Final SW logo and final uniform visual authority: **pending**.

---

## Superseded visual references

Registered where applicable (e.g. Zuri Hale surname, slender Marlowe). Superseded records cannot be `isPrimaryIdentityAuthority`.
