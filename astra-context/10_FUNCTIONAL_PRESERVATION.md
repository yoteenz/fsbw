# Functional Preservation Contract

Landing / world-entry redesign **must not accidentally erase** these capabilities (semantic + routing), even if UI moves spatially.

---

## Routing & navigation

- [ ] Base paths: `/projects/astral-world/experience/*` and fast-track `/debug/world/*`
- [ ] Home → `home` section; index redirect
- [ ] Links to `astrea`, three destinations, `readers`, `friends`, `journal`, `profile`
- [ ] Project slug gate + `BRAND_INTELLIGENCE` capability
- [ ] Mobile bottom nav five tabs (HOME, WORLD, JOURNAL, FRIENDS, PROFILE)
- [ ] `path()` helper respects experience vs fast-track mode

---

## Account / session (prototype)

- [ ] Demo session persona (Teena) — display name, avatar link to profile
- [ ] Reader account / `avatarId` resolution where portraits shown (P0R1)

---

## Reader selection

- [ ] Find My Reader flow reachable from entry
- [ ] Reader list, favorites toggle, reader detail tray semantics
- [ ] Relationships fixtures (favorite / subscribed / regular)

---

## Presence & social

- [ ] Who's Here discovery from entry
- [ ] Meet My Friends reachable (overlay + nav)
- [ ] Privacy levels + allow-friends-to-join (profile/context)
- [ ] Check-in to `IN_WORLD` / district astrea
- [ ] Join Her Table at Coffee Shop (not required on entry UI but must remain in product)

---

## World entry actions

- [ ] Take Me Somewhere overlay + routing engine outputs
- [ ] Destination rows for Tarot Suite, Coffee Shop, Astral Mall
- [ ] Enter Astréa navigation

---

## Notifications & journey

- [ ] Fixture notifications + mark read
- [ ] Journey artifact route (journal)
- [ ] Notification demo route (if retained for QA)

---

## Mall & tables (downstream — do not break routes)

- [ ] Kiosk select / wait
- [ ] Table join / leave / occupancy errors

---

## Accessibility & tech

- [ ] Keyboard-focusable sr-only "Enter Astréa" escape hatch
- [ ] `prefers-reduced-motion` respected where FSMS patterns apply in shared CSS
- [ ] Scene `data-scene-id` / asset slot hooks if keeping FAL pipeline

---

## Explicit non-requirements for Test 01

Do **not** need to implement full Supabase realtime, production auth, or Stripe on the entry screen — prototype fixtures suffice if semantics remain visible.
