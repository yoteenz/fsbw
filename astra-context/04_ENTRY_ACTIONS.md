# Entry Actions (world-entry candidates)

These are the primary **world-entry verbs** Astra should treat as title-screen / lobby actions (preserve semantics; reinvent presentation).

---

## Take Me Somewhere

| Attribute | Detail |
|-----------|--------|
| **UI (world entry)** | Desktop: right rail action on `AwD01WorldEntryScreen`. Mobile: quick-hit button on `AwM01WorldEntryScreen`. Opens **`TakeMeSomewhereWorldOverlay`** (not a new page). |
| **Legacy UI** | `TakeMeSomewherePanel.tsx` (section layout — older reference home) |
| **Primary prompt** | "What's going on today?" |
| **Intention tokens (FT3.2)** | Not chip bars — image-led / token UI in overlay |
| **Routing** | `takeMeSomewhereRouter.ts` — deterministic prototype |
| **Context engine** | `takeMeSomewhereContextEngine.ts` — conversational line + destination + optional reader |
| **Example chips → destinations** | CLARITY/DEEP → Tarot Suite; 10 MIN → Mall; COMFORT/CONNECTION → Coffee Shop |
| **State required** | Intent, energy, reader availability, favorite reader, friend presence |
| **Status** | **Live prototype** — tested (P0.E.1 TEST 4, FT3.2 tests) |

---

## Find My Reader

| Attribute | Detail |
|-----------|--------|
| **UI (world entry)** | Desktop D01: links to `.../readers`. Mobile M01: quick-hit link to `.../readers`. |
| **Destination scene** | `MobileFindReaderScene.tsx` — Astréa backdrop, `AstralInvokeField`, category sigils, **portrait orbit**, brass reader tray (FT3.2) |
| **Semantics** | World-native discovery — **not** directory/search CRM |
| **State** | Readers list, favorites (`toggleFavoriteReader`), reader relationships fixtures |
| **Status** | **Live prototype** |

---

## Meet My Friends

| Attribute | Detail |
|-----------|--------|
| **UI (world entry)** | **Not** a direct button on D01/M01 layered entry. Reach via: **Who's Here overlay** → "Meet My Friends →" link; bottom nav **Friends**; route `.../friends`. |
| **Scene** | `MobileFriendsScene.tsx` — "Meet My Friends" heading; `SpatialPresenceGroups` |
| **Reference-era home** | `DesktopHomeReferenceLayout` had explicit Meet My Friends section (mid-band) — reference board authority still shows it; current layered entry emphasizes Who's Here + link to friends |
| **Status** | **Live prototype** |

---

## Who's Here (presence discovery)

| Attribute | Detail |
|-----------|--------|
| **UI** | Overlay `WhosHereWorldOverlay.tsx` — portrait tiles grouped by place |
| **Trigger** | World entry actions (D01 right rail / M01 quick hit) |
| **Status** | **Live prototype** |

---

## Join Her Table

| Attribute | Detail |
|-----------|--------|
| **UI** | **Coffee Shop destination** — not world-entry screen primary CTA |
| **Behavior** | `joinHerTable(tableId)` in context → presence `AT_TABLE`; errors if full |
| **Copy in generation contracts** | Space reserved for JOIN HER TABLE overlays on table photography |
| **Status** | **Live prototype** at Coffee Shop |

---

## Enter Astréa / destination rows

World entry surfaces **three destination rows** (Tarot Suite, Coffee Shop, Astral Mall) with medallion icons + descriptors — anchored on canonical stage (%-based geometry).

---

## Smart Routing

Mentioned in **REFERENCE A/B** fidelity doc as mid-band element on **reference board** and older home layouts. Treat as **reference-era CTA** — verify before implementing; not exposed as labeled control on current D01/M01 layered screens (UNKNOWN as standalone live control).
