# Studio World — Season 1 Core Ensemble Canon Bible

**Version:** 1.0 (`season1-v1`)  
**Sprint:** `P0.STUDIOWORLD.SEASON1.CORE-ENSEMBLE-CANON1`  
**Status:** FOUNDER_APPROVED (identity, roles, natural wardrobe, anti-flattening)  
**Runtime source:** `src/studio-os-core/studio-world-residents/season1-ensemble/`  
**JSON export:** `docs/studio-world/residents/season-1/season1-ensemble-canonical.json`

---

## Ensemble overview

Eight **persistent canonical residents** of Studio World Season 1 — not disposable avatars or generic AI staff. Each has stable identity, behavioral continuity, relationship continuity, wardrobe logic, camera behavior, and future UE/MetaHuman embodiment targets (`NOT_STARTED` until fabrication sprints).

| ID | Name | Core sentence |
|----|------|----------------|
| SW-RESIDENT-001 | Etta Vale | She decides what is good enough to exist. |
| SW-RESIDENT-002 | Zuri Xu | She sees the whole problem and knows what happens next. |
| SW-RESIDENT-003 | Jules Mercer | He makes Studio World feel human. |
| SW-RESIDENT-004 | Noa Kline | He makes the machinery actually work. |
| SW-RESIDENT-005 | Caspian Reed | He turns ideas into places you can enter. |
| SW-RESIDENT-006 | Iona Wells | She becomes terrifyingly competent once she starts working. |
| SW-RESIDENT-007 | Marlowe Saint | He knows who someone is before they fully know themselves. |
| SW-RESIDENT-008 | Elio “EV” Vahn | He understands leverage, access, and how to make the world bigger. |

Full dossiers: per-resident modules under `season1-ensemble/residents/SW-RESIDENT-*.ts`.

---

## Product ontology

- **SITE 00** — inception / creation (not these residents’ home product).
- **Studio OS** — machinery (Noa liaises; residents are not OS modules).
- **Studio World** — lived digital company world where these eight operate.

**Canonical person ≠ temporary cast role.** Cast contracts overlay simulation; they must not mutate identity canon.

---

## Relationship map (founder-approved)

| Pair | Dynamic |
|------|---------|
| Etta ↔ Zuri | Mutual respect, power duo |
| Etta ↔ Caspian | Precision vs spectacle; she edits him |
| Etta ↔ Noa | Taste vs logic; high trust, few words |
| Jules ↔ everyone | Social glue, hospitality |
| Noa ↔ Caspian | Systems vs drama |
| Iona ↔ Marlowe | Fabrication / performance complement |
| Zuri ↔ EV | Strategic rivalry (smartest decision vs leverage/timing) |
| Marlowe ↔ everyone | Chemistry observer, confidant |
| Jules ↔ Iona | Tender non-romantic support — if someone makes Iona feel ugly, Jules will find out |

Graph edges: `season1-relationships.ts`.

---

## Documentary / camera language

Workplace **mockumentary grammar** (The Office as grammar only — no copied plots). Camera awareness per resident is seeded in `season1-documentary.ts` and ensemble canon.

| Resident | Camera |
|----------|--------|
| Etta | Mostly ignores until smallest look |
| Zuri | Speaks when worthwhile |
| Jules | Plays to camera |
| Noa | Dislikes / endures |
| Caspian | Assumes partial ownership |
| Iona | Forgets camera |
| Marlowe | Always knows; performs or weaponizes silence |
| EV | Manages image |

---

## Natural-habitat visual authorities (FOUNDER_APPROVED)

Distinct from **work uniform** (below). See JSON `naturalWardrobeAuthority` + notes per resident.

---

## Signed wall portrait system

Direct-camera essence; **non-standardized** placement and handwriting. Each resident’s `signedPortraitBehavior` in ensemble canon. Competency / full-body role portraits are **separate** — no wall signature unless directed.

---

## Work uniform system

**Status:** `CONCEPT_LOCKED_VISUAL_PENDING`  
**One shared Studio World uniform family** — customized per resident, never unrecognizable as SW staff. Placeholder insignia: **SW**. Detail: `season1-ensemble/uniform-system.ts`.

---

## Astrology & birth records

**PROVISIONAL_CANON** unless founder supersedes. Full chart in JSON per resident; do not invent additional placements.

---

## Protected open fields

Explicit **unresolved** fields per resident in JSON (`protectedOpenFields`). Systems must not auto-fill (partners, EV sexuality, Marlowe husband identity, Noa family names, etc.).

---

## Superseded canon

| Superseded | Replaced by |
|------------|-------------|
| Zuri **Hale** | Zuri **Xu** |
| Slender / young Marlowe | Age **54**, larger-bodied |
| Caspian gay-only framing | **Fluid** sexuality |
| Frumpy Iona | Precision Utilitarian + **contextual glamour arc** (not makeover endpoint) |
| Jules player archetype | Emotionally competent hospitality |

List: `season1-ensemble/superseded-canon.ts`.

---

## Anti-flattening rules

Per-resident `antiFlattening` arrays in ensemble canon — generation systems must consult before visual or dialogue output.

---

## Humanization system

Foundational habits in canon; additional micro-habits may **emerge in scenes** (handwriting, desk habits, elevator behavior, etc.) without overwriting protected fields.

---

## Future continuity rules

- Identity, core biography, and relationship **labels** remain stable across cast roles.
- Embodiment (UE/MetaHuman) is downstream of this canon.
- Glamour for Iona is **rare and contextual** — not a final “hot” state.
- EV private life remains **intentionally unresolved**.

---

## Validation

`validateSeason1EnsembleCanon()` + vitest `studio-world-residents-ensemble-canon.test.ts`.

---

_Founder is final creative authority._
