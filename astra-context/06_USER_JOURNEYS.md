# User Journeys (concise)

Purpose: show what the **world-entry screen must lead into**. Do not discard these flows in Test 01.

---

## 1. New user enters Astral World

Land on **`/experience/home`** → cinematic/layered **Welcome to Astral World** → copy introduces **Astréa** → user chooses destination row, Enter Astréa link, or quick action (Who's Here / Take Me Somewhere / Find My Reader) → optional `checkIn()` semantics when entering world.

---

## 2. Returning user continues journey

Fixtures include **journey** artifact, notifications, energy state (`ALIGNED_OPEN`), favorite readers — entry should allow resume signals (reference board: Journey in right rail on desktop reference layout; journey data in context).

---

## 3. User finds their reader

Entry **Find My Reader** → `/readers` → invoke field + orbit + tray → favorite toggle → reader detail tray → route toward Tarot Suite / reading (prototype).

---

## 4. User meets friends

Entry **Who's Here** overlay → see portraits by place → **Meet My Friends** → `/friends` spatial groups → optional navigate toward friend's destination (prototype fixtures).

---

## 5. User joins a reader / table / destination

- **Destination:** tap Tarot Suite / Mall / Coffee Shop row → interior scene  
- **Table:** Coffee Shop → **Join Her Table** → presence `AT_TABLE`  
- **Kiosk:** Mall hotspot → tray → wait/join  
- **Reader:** Find My Reader → select reader → toward suite/mall flow

---

## 6. User discovers someone is present

**Who's Here** overlay from entry; presence chips on portraits; notification demo for reader-available alerts.

---

## 7. Journal / favorites / notifications

- **Journal:** bottom nav → journey artifact scene  
- **Favorites:** `toggleFavoriteReader` in context  
- **Notifications:** fixture list + demo route; reference desktop had notifications in right rail

---

## Demo persona

**Teena** — pre-seeded friends, readers, journey, notifications (see `fixtureService.ts` / FAST_TRACK doc).
