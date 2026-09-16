# Environmental Life

---

## EXISTING CANON (repo-supported)

| Signal | Evidence |
|--------|----------|
| Inhabited world copy | Hero + Astréa taglines |
| Who's Here portraits | Overlay + presence fixtures |
| Reader availability | Notifications fixture, reader states |
| Destination activity | Hotspots, mall kiosks, coffee tables occupancy |
| Places popular now | Fixture in context |
| Presence chips on portraits | `AstralPortrait` `showPresence` |
| Scene transitions | `AstralSceneTransition` in shell |
| Energy / alignment widget | Reference desktop energy compass; energy state in context |
| Demo notifications | Unread counts in reference-era rail |

---

## IMPLEMENTATION (ambient)

| Signal | Status |
|--------|--------|
| Lighting | Baked into environment PNGs + CSS (`astral-world.css`) |
| Moving signage | UNKNOWN |
| Weather/sky | Static art |
| Sound cues | UNKNOWN — not in entry components |
| Live indicators | Prototype chips + overlays |

---

## POSSIBLE ASTRA EXPLORATION (if cost-approved)

- Subtle parallax on environment plate
- Distant animated lights / signage in Astréa panorama
- Presence flicker at windows / tables (Coffee Shop tease)
- Title-screen idle loop (30s cycle) before input
- Transition pulse when hovering entry verbs

**Guard:** Must not require backend or dozens of generated assets for Test 01.
