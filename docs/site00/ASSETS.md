# SITE 00 Assets

Registry: `src/site00/config/assets.ts`

## Asset Gap Report — Foundation V1.1

For each approved screen: environment, objects, icons, reference status, temporary implementation, final asset requirement.

---

### ORIGIN (01_ORIGIN_APPROVED)

| Category | Need | Reference | Production | Temporary |
|----------|------|-----------|------------|-----------|
| Environment | Origin architectural plaza with 00 monument | Yes | **No** | CSS gradient fallback |
| Objects | Glass side structures, 00 monument, human scale figures | In reference | **No** | None (environment only) |
| Icons | Red wireframe IDNTY/BLDR card icons | In reference | **No** | SVG `GeometricIcon` |
| Interface | All text, cards, status strip | N/A | React UI | Production UI |

**Final required:** Clean production ORIGIN environment image (desktop + mobile focal crops)

---

### IDNTY EXPANDED (02_ORIGIN_IDNTY_EXPANDED)

| Category | Need | Reference | Production | Temporary |
|----------|------|-----------|------------|-----------|
| Environment | Same as ORIGIN | Yes | **No** | Shared origin fallback |
| Objects | Header wireframe cube | In reference | **No** | SVG placeholder |
| Interface | Expanded panel content | N/A | React UI | Production UI |

**Final required:** Production wireframe icon set; origin environment asset

---

### BLDR EXPANDED (03_ORIGIN_BLDR_EXPANDED)

| Category | Need | Reference | Production | Temporary |
|----------|------|-----------|------------|-----------|
| Environment | Same as ORIGIN | Yes | **No** | Shared origin fallback |
| Objects | Header wireframe cubes | In reference | **No** | SVG placeholder |
| Interface | Expanded panel + framework | N/A | React UI | Production UI |

---

### IDNTY BRAND STATE (04_IDNTY_BRAND_STATE)

| Category | Need | Reference | Production | Temporary |
|----------|------|-----------|------------|-----------|
| Environment | Workflow hall with arches, roses, pedestals | Yes | **No** | CSS workflow fallback |
| Objects | Four identity-state wireframe geometries (complexity 0–3) | In reference | **No** | SVG complexity variants |
| Icons | Framework pillar icons | In reference | **No** | SVG placeholders |
| Interface | State cards, investment guide | N/A | React UI | Production UI |

**Final required:** WORKFLOW environment image; 4 isolated state wireframe objects

---

### BLDR BUILD STATE (05_BLDR_BUILD_STATE)

| Category | Need | Reference | Production | Temporary |
|----------|------|-----------|------------|-----------|
| Environment | Same workflow hall as IDNTY | Yes | **No** | Shared workflow fallback |
| Objects | SITE, WORLD, ENTERPRISE, NOT SURE wireframes | In reference | **No** | SVG placeholders |
| Interface | Build class cards, investment guide | N/A | React UI | Production UI |

**Final required:** 4 build-class wireframe production objects

---

### ENTER 00 WAITING ROOM (06_ENTER00_WAITING_ROOM_APPROVED)

| Category | Need | Reference | Production | Temporary |
|----------|------|-----------|------------|-----------|
| Environment | White lobby, sofa, table, plants, 00 neon sign | Yes | **No** | CSS enter fallback |
| Objects | Sofa, coffee table, vase, tree, 00 signage | In reference | **No** | Not rendered (env only) |
| Interface | Directory panel — **editable** | Provisional in reference | React UI | Data-driven config |
| Icons | Directory row icons | Provisional | **No** | Generic cube SVG |

**Final required:** LOCKED waiting room environment production asset (highest priority for ENTER 00 fidelity)

---

## Screens requiring dedicated mobile design

No approved mobile references exist. These need dedicated composition sprints:

- ORIGIN (hero + cards + status strip stacking)
- IDNTY/BLDR expanded panels
- IDNTY Brand State (4-column cards)
- BLDR Build State (4-column cards + investment guide)
- ENTER 00 (directory panel + welcome copy layout)

Current implementation uses structural responsive fallbacks only.

## Asset metadata schema

```typescript
id, type, src, alt, environment, route, status, notes
```

Status values: `reference-only` | `temporary` | `production` | `pending`

## Do not

- Bake pricing, navigation, or status metrics into environment images
- Generate replacement imagery in code — production assets produced separately
