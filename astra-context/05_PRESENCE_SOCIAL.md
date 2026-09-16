# Presence & Social Intelligence

Source: `SOCIAL_PRESENCE.md`, `presenceService.ts`, `AstralWorldContext.tsx`.

---

## Design intent

Astral World should feel **inhabited** — presence + places + shared activities, **not** a social feed (`FAST_TRACK_PRODUCT_MODEL.md`).

---

## Presence states (prototype)

`OFFLINE` · `ONLINE` · `IN_WORLD` · `IN_DISTRICT` · `AT_DESTINATION` · `AT_TABLE` · `READING` · `AVAILABLE` · `JOINABLE` · `PRIVATE`

---

## Privacy

| Level | Behavior |
|-------|----------|
| `EVERYONE` | Visible to all |
| `FRIENDS` | Default — friends only |
| `HIDDEN` | No friend-location discovery |

**Allow friends to join me** — toggle (`allowFriendsToJoin` in context).

---

## Check-in

`checkIn()` sets user presence to `IN_WORLD`, district `astrea`.

---

## Reader–client relationships (fixtures)

`FAVORITE_READER` · `SUBSCRIBED_READER` · `REGULAR_READER`  
Reader alert concept: "A regular is back" (requires client presence permission).

---

## Friend visibility

`visibleFriends()` filters by privacy rules — used in Who's Here / Friends scenes.

---

## Tables & mall (social mechanics)

- **Coffee Shop tables** — occupancy, join/leave, selected table id
- **Mall kiosks** — select kiosk, join wait (`selectKiosk`, `joinKioskWait`)

---

## Notifications (prototype)

Fixture notifications in context; demo page `notification-demo`; reader availability alerts (e.g. Kai READER_AVAILABLE in MEMORY).

---

## Implementation status

| System | Status |
|--------|--------|
| Live presence backend | **MISSING** — local React state, "realtime-ready abstraction" |
| Friend graph | **PARTIAL** — fixtures + UI |
| Reader presence | **PARTIAL** — fixtures + reader account model emerging |
| Privacy toggles | **PARTIAL** — UI + local state |

---

## Who's Here Now

Overlay grouped by destination / `SpatialPresenceGroups` — primary "world is alive" signal on **entry screen** via overlay, not persistent HUD on all routes.
