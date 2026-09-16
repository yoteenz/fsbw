# World & Destination Inventory

Source: `DESTINATION_BEHAVIOR.md`, destination pages under `src/site00/astral-world/pages/destinations/`, scene components.

---

## Astréa (flagship district)

| Field | Value |
|-------|-------|
| **Purpose** | Social district hub — bridge from world entry to three destinations |
| **Entry** | Link/title "Astréa" on world entry; route `.../astrea` |
| **Scene** | `MobileAstreaScene.tsx` (hotspots, Take Me Somewhere CTA) |
| **Social role** | District-level presence; destination grouping in Who's Here |
| **Status** | Implemented (immersive scene) |
| **Assets** | Reference crops + scene contracts; FAL slots in generation manifest |

---

## Tarot Suite

| Field | Value |
|-------|-------|
| **Purpose** | Deep / private / intentional readings |
| **Tone** | Premium intimate |
| **Entry action** | Route `.../astrea/tarot-suite`; "Enter Suite", Choose Reader |
| **Reader relationship** | Primary venue for full readings; Take Me Somewhere routes deep intent here |
| **Social** | Private reading identities protected in UI |
| **Status** | Implemented (`TarotSuitePage` + mobile scene stack) |
| **Assets** | `referenceCropRegistry`, scene `data-scene-id`, portrait orbit on Find Reader |

---

## Astral Mall

| Field | Value |
|-------|-------|
| **Purpose** | Fast / spontaneous / quick reads |
| **Tone** | Energetic discovery |
| **Entry action** | Route `.../astrea/astral-mall`; **5 spatial kiosk hotspots** + `AstralKioskTray` (grid removed FT3.2) |
| **Reader relationship** | Mall readers; kiosk wait/join via context |
| **Social** | "Places popular now" fixture data |
| **Status** | Implemented (`AstralMallPage`, `MobileAstralMallScene`) |
| **Pricing** | `priceState: DEMO` — non-canonical |
| **Docs** | `ASTRAL_MALL.md` |

---

## Coffee Shop

| Field | Value |
|-------|-------|
| **Purpose** | Conversation / comfort / community |
| **Tone** | Warm social |
| **Entry action** | Route `.../astrea/coffee-shop`; **Join Her Table**, Leave Table |
| **Tables (fixtures)** | The Empath Circle, Morning Magic, Soul Talk, Moonlight Musings |
| **Presence** | Join sets user to `AT_TABLE`; full tables reject joins |
| **Status** | Implemented (`CoffeeShopPage`, `MobileCoffeeShopScene`) |
| **Docs** | `COFFEE_SHOP.md` |

---

## Additional surfaces (not separate "districts")

| Surface | Route | Role |
|---------|-------|------|
| Journal | `/journal` | Journey artifact / save journey |
| Profile | `/profile` | Avatar, privacy, energy |
| Daily Card / Create Deck / Custom Avatar | various | Product ideas — prototype visuals |
| Reader dashboard | `reader/AstralWorldReaderRouter.tsx` | Reader-side presence (separate router) |

No other flagship districts implemented in repo beyond Astréa trio.
