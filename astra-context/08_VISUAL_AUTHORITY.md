# Visual Authority Manifest

**Rule:** Approved references > screen-master compositions > current DOM implementation.

---

## Tier 1 — Founder reference boards (PRIMARY)

| Asset | Path (SITE00) | Dimensions | Role | Status |
|-------|---------------|------------|------|--------|
| REFERENCE A (desktop) | `docs/projects/astral-world/references/astral-world-desktop-reference.png` | 1672×941 | Full-board design authority for desktop | **APPROVED** (design authority per REFERENCE_FIDELITY) |
| REFERENCE B (mobile) | `docs/projects/astral-world/references/astral-world-mobile-reference.png` | 941×1672 | Full-board design authority for mobile | **APPROVED** |

**Pack copies (symlinks):** `astra-context/references/astral-world-desktop-reference.png`, `astral-world-mobile-reference.png`

---

## Tier 2 — Screen masters (world entry — Test 01)

| Asset | Path (public) | Viewport | Role | Status |
|-------|---------------|----------|------|--------|
| AW_D_01 background V2 | `/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V2.png` | 1536×1024 | Production shell background | **APPROVED** (ATTACHMENT_A V2) |
| AW_D_01 final composition | `.../final-composition-reference-v1.jpg` | 1536×1024 | QA composition authority | **APPROVED** |
| AW_M_01 background V2 | `/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V2.png` | 854×1842 | Production shell background | **APPROVED** (founder Supabase shell lineage) |
| AW_M_01 final composition | `.../final-composition-reference-v1.jpg` | 854×1842 | QA composition authority | **APPROVED** |

**Pack symlinks:** `references/AW_D_01_final-composition-reference-v1.jpg`, `AW_M_01_final-composition-reference-v1.jpg`

---

## Tier 3 — Runtime cinematic crops

| Asset | Path | Role | Status |
|-------|------|------|--------|
| Desktop cinematic | `/astral-world/bg-desktop-cinematic.png` | Hero/environment crops from reference | **INTERIM** |
| Mobile cinematic | `/astral-world/bg-mobile-cinematic.png` | Mobile cinematic states | **INTERIM** |

Registry: `shared/site00-astral-world/referenceAssets.ts`, `referenceCropRegistry.ts`

---

## Tier 4 — Implementation-only (NOT design authority)

| Asset | Role | Status |
|-------|------|--------|
| Current D01/M01 DOM overlay positions | Functional anchor map | **EVIDENCE** |
| `DesktopHomeReferenceLayout` screenshots | Superseded home pattern | **STALE** for entry (pre-FT5.2) |
| FAL-generated portraits | In progress / pilot | **PROTOTYPE** until ACTIVE in manifest |

---

## Viewport authority

| Viewport | Authority document | Independent layout |
|----------|-------------------|-------------------|
| Desktop | REFERENCE A + AW_D_01 masters | YES — not scaled mobile |
| Mobile | REFERENCE B + AW_M_01 masters | YES — not stacked desktop |

Breakpoint: **1024px** (`useAstralViewport`).

---

## Upload list for ChatGPT Work (minimum)

1. `astral-world-desktop-reference.png`
2. `astral-world-mobile-reference.png`
3. (Recommended) AW_D_01 + AW_M_01 `final-composition-reference-v1.jpg`
4. (Optional) Current implementation screenshot from live `/experience/home` for **functional** comparison only — label as NON-AUTHORITY
