# Astral World Canon (as encoded in repo)

**Confidence:** HIGH for structure labels; MEDIUM for business/identity (founder judgment pending).

---

## Product definition

- **Platform / company (working):** **Astral World** — a digital place people **enter**, not a marketing site about tarot (`FAST_TRACK_PRODUCT_MODEL.md`).
- **Flagship district:** **Astréa** — "The social district of Astral World" (world-entry copy in `AwD01WorldEntryScreen.tsx`, `AwM01WorldEntryScreen.tsx`).
- **Readers:** Multi-reader platform prototype; readers have specialties, availability, favorites, optional `avatarId` / account layer (`readerAccount/*`, fixtures).
- **Clients / users:** Demo session **Teena** — friends, favorite readers, journey, notifications, membership badge (fixture).
- **Project type:** SITE 00 **client project** slug `astral-world`; experience gated by `BRAND_INTELLIGENCE` capability.
- **WORLD status:** **NOT FORMED** — structural canon **UNRESOLVED** (`PROJECT_BIBLE.md`, `WORLD_HIERARCHY.md`).

---

## Hierarchy (client/founder truth — not yet promoted to structural canon)

```
Astral World (MASTER_PRODUCT_UNIVERSE)
└── Astréa (FLAGSHIP_DISTRICT)
    ├── Tarot Suite
    ├── Astral Mall
    └── Coffee Shop
```

Future districts = siblings under Astral World (not separate top-level projects).

---

## Experience loop (product model)

```
ENTER ASTRAL WORLD → ENTER DISTRICT → SEE WHO IS HERE → CHOOSE WHAT TO DO
→ VISIT DESTINATION → INTERACT → RECEIVE READING → SAVE JOURNEY → RETURN
```

---

## Governance tracks

| Track | Purpose |
|-------|---------|
| Formal SITE 00 pipeline | ORIGIN → IDENTITY → JUDGMENT → CANON → WORLD FORMATION |
| Founder Fast Track | Interactive laboratory at `/projects/astral-world/debug/world/*` |

Prototype **does not** auto-promote to canon. Founder verdicts: KEEP · REVISE · REJECT.

---

## Reference fidelity doctrine (mandatory for Astra)

From `REFERENCE_FIDELITY.md` / `FAST_TRACK_REFERENCE_FIDELITY.md`:

- **KEEP THE FUNCTION**
- **REBUILD THE LOOK**
- **DO NOT PROTECT INCORRECT CURRENT VISUALS**
- **COPY THE REFERENCE EXACTLY** (where reference exists)
- **REFERENCE = DESIGN AUTHORITY**

Preserve: routing, state, data, business logic, auth boundaries, permissions, accessibility patterns, interaction **semantics**.

Replace: incorrect visual implementation, template/homepage drift, decorative background treatment.

---

## What is explicitly NOT canon yet

- Approved identity fields (0 promoted)
- Environment working labels as structural canon
- Business tier structure
- Mall `priceState: DEMO` pricing
- All fixture records (`source: PROTOTYPE_FIXTURE`)

See `CLIENT_TRUTH.md`, `UNRESOLVED_DECISIONS.md` in SITE00 docs.
