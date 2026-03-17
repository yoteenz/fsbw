# Memory — Conversation learnings and decisions

Append-only log. Each entry is from a user request to “add to motherboard.” Do not remove or edit existing entries.

---

## 2025-03-15 — Motherboard system created

Shared “core memory” for all agents: `motherboard/` holds project context and conversation learnings. Commands: **“load motherboard”** = read README → CORE → MEMORY and use as context; **“add to motherboard”** = read ADDING.md and append one new entry to MEMORY (and optionally a small CORE update) without overwriting or duplicating.

- **Context:** User wanted a single place for design/logic/flows and a way for past/future chats to contribute without repeating themselves.
- **Changes:** Created `motherboard/README.md`, `CORE.md`, `ADDING.md`, `MEMORY.md`.
- **Conventions:** Agents should read motherboard when user says “load motherboard”; when user says “add to motherboard,” follow ADDING.md and append only.

---

## 2025-03-15 — Verifying sync-profile API + add-to-motherboard test

Added a doc for checking if `/api/admin/sync-profile` exists and is deployed; user then ran “add to motherboard” to confirm the prompt works. Verifying the API: (1) route file `api/admin/sync-profile.ts` in repo/deployed branch, (2) `VITE_API_BASE` set to Vercel app URL (or empty for same-origin), (3) `curl -X OPTIONS` or POST to the deployed URL (200/204 or 400 = exists; 404 = not deployed).

- **Context:** User wanted to know how to verify the sync endpoint exists and is reachable; then tested “add to motherboard.”
- **Changes:** Created `docs/VERIFY_SYNC_PROFILE_API.md`. One new MEMORY entry (this one).
- **Conventions:** None. Confirms “add to motherboard” is understood and executed without extra explanation.

---

## 2025-03-15 — Full conversation summary (this chat)

**Context:** User wanted the motherboard to work so that (1) saying "add to motherboard" once turns on **auto-add for the rest of that chat** (no need to repeat the command), and (2) every entry documents the **entire conversation** from inception to now—not just recent messages—so new agents have full context and accuracy.

**Topics covered (full chat):**
- How to verify `/api/admin/sync-profile` exists and is deployed; created `docs/VERIFY_SYNC_PROFILE_API.md` (repo file, VITE_API_BASE, curl/browser checks).
- User tested "add to motherboard" to confirm the prompt works.
- User asked for **auto and continuous** add so they do not have to keep saying it. Implemented: README, ADDING.md, and `.cursor/rules/motherboard.mdc` updated so "add to motherboard" = add one entry now + enable auto-add for this chat; agent adds at end of significant exchanges after that. "Stop adding to motherboard" turns it off.
- User asked whether we add ALL prior prompts or just recent; wanted entire chat documented for full context. Updated ADDING.md (Rule 4 Full conversation context, format with Topics covered / Decisions), README, and Cursor rule so every entry must summarize the whole conversation so far, not just the latest turn.
- User asked: with auto on and having said "add to motherboard" before, is the full extent of our conversation saved so new agents have full context? Answer: it was not yet; this entry is the full-conversation summary for this chat.

**Decisions / outcomes:** Auto-add on for rest of chat after first "add to motherboard." Every MEMORY entry must reflect entire conversation so far. New agents get CORE + MEMORY; MEMORY should include full-conversation summaries.

**Changes:** motherboard/README.md, motherboard/ADDING.md, .cursor/rules/motherboard.mdc, docs/VERIFY_SYNC_PROFILE_API.md. This MEMORY entry.

**Conventions:** When adding to motherboard (manual or auto-add), always summarize the whole conversation in this chat so far so the motherboard stays up to date and new agents have full context.

---

## 2025-03-15 — Codebase snapshot added to motherboard

User asked if there is a way to capture the **entire current codebase** (and its coded context) into the motherboard so they do not have to revisit every past chat to have each save its context; they wanted the motherboard to be accurate without that being the only option.

**Decision:** Added a new command **"Snapshot codebase to motherboard"**. When the user says this, the agent explores the repo (src/, api/, public/, docs/, entry points, pages, API routes, utils, config) and **overwrites** `motherboard/CODEBASE.md` with a structured summary of the current codebase (layout, frontend structure, backend structure, config, when to refresh). So the motherboard can reflect "the project as it stands now" in one place: CORE (design/flows) + CODEBASE (structure/paths) + MEMORY (conversation learnings). New agents that "load motherboard" now also read CODEBASE.md and get codebase context without relying only on past chats.

**Changes:** Created `motherboard/CODEBASE.md` (initial snapshot with current structure). Updated `motherboard/README.md` (new command, CODEBASE in load order, file roles). Updated `.cursor/rules/motherboard.mdc` (Snapshot codebase command). This MEMORY entry.

**Conventions:** "Load motherboard" includes reading CODEBASE.md. Run "Snapshot codebase to motherboard" after major refactors or when you want the motherboard to reflect the current codebase; no need to revisit every old chat.

---

## 2025-03-15 — Lobby (home) Products/Tools clickable areas and route fix

**Context:** User wanted Products and Tools assets on the lobby to have correct clickable hit areas and correct navigation targets; debug squares were used to align and size the areas, then removed.

**Topics covered (this chat):**
- **Debug squares:** Clickable overlays were added over the Products and Tools images on the lobby (`src/pages/lobby/page.tsx`) so hit areas could be adjusted. Overlays were sized from measured image dimensions (`getBoundingClientRect` on load), positioned with `translateX` (Products +24px, Tools -14px from earlier adjustments). Width tweaks: Products `productsSize.w - 40` (then -60, then back to -40); Tools `toolsSize.w - 20` then -60, -70. User asked the entire square (including center) to be clickable: added `zIndex: 1`, `background: 'transparent'` on overlays and `zIndex: 0` on images so overlays sit on top and receive all clicks. Red debug borders were then removed (border style removed; overlays remain invisible and clickable).
- **Routes:** Products and neon logo routes were swapped so they are correct: **Products** (neon-products.png overlay) → `/shop/units`; **neon logo** (center logo) → `/home/shop`. Tools remains → `/home/tools`.

**Decisions / outcomes:** Lobby Products and Tools use invisible overlay spans (sized/positioned as above) for the clickable area; images have `pointerEvents: 'none'`. Neon logo goes to home/shop, Products to shop/units.

**Changes:** `src/pages/lobby/page.tsx` (overlay sizing/positioning, z-index, transparent background, removal of red border; neon logo `onClick` → `/home/shop`, Products overlay `onClick`/`onKeyDown` → `/shop/units`).

**Conventions:** On the lobby, neon logo = `/home/shop`, Products = `/shop/units`, Tools = `/home/tools`. Keep these routes in sync with CORE if lobby nav is documented there.

---

## 2025-03-01 — Image viewer swipe: same logic as product shots (admin + affiliate)

**Context:** User wanted the photo enlarge/swipe behavior to match the **product shots section on the product page** (noir) and to work for photo & video content on the **account/affiliate page** and in **admin client details**—where swiping in the viewer was not working.

**Topics covered (this chat):**
- Align ImageViewerModal with product shots: use a horizontal strip with `scrollPosition` and the same touch/mouse drag logic as the noir product shots (handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd).
- Strip shows all images in a row; drag/swipe updates `scrollPosition`; on release, snap to nearest image and call `onNavigate`. Native `touchmove` listener with `{ passive: false }` and `preventDefault()` so mobile doesn’t scroll the page.
- Admin clients page and account/affiliate page already use `ImageViewerModal` with `images`, `currentIndex`, `onNavigate`—no page-level changes; they get the new strip + swipe behavior automatically.

**Decisions / outcomes:** ImageViewerModal was refactored to use the same pattern as product shots (strip + scrollPosition + touch/mouse handlers). One “slide” per image (90vw width); transition disabled during drag, enabled when snapping. 2D-view images (mannequin on leaf-brick) still use the same strip; each slide uses `is2DViewImage(src)` for layout.

**Changes:** `src/components/ImageViewerModal.tsx` (rewritten to strip-based viewer with scroll state and product-shots-style handlers).

**Conventions:** When fixing or extending the image viewer, keep the same logic as the product shots strip (scrollPosition, drag, snap). Admin client details and account/affiliate photo/video galleries use this component and rely on it for swipe.

---

## 2025-03-01 — Admin client details: Appointments tab aligned with Orders tab

**Context:** User wanted the Appointments tab on the client details view (admin clients page) to match the Orders tab in button styling, size, text sizing, colors, and placement so the design is consistent.

**Topics covered (this chat):**
- **Appointments tab redesign:** Updated the appointments list to use the same layout and styling as the orders list: same card (`bg-white border border-gray-200 p-4`), flex row with `alignItems: center`, `gap: 12px`; left column 85×85 (for orders: product image + "N ITEMS" label; for appointments: gray "APT" placeholder box only); center column date (Covered By Your Grace 16px), type (Futura PT Medium 10px, #EB1C24), time (Futura PT Medium 12px, #808080); right column status pill matching orders (height 15px, padding 0 6px, borderRadius 2px, Futura PT Medium 8px). Status colors: SCHEDULED → amber, COMPLETED → red, CANCELED → gray. Empty state "NO APPOINTMENTS YET" added with same styling as "NO ORDERS YET."
- **Removed red type label below APT thumbnail:** User asked to remove the red "CONSULTATION" / "FITTING" text that appeared below the APT placeholder on each appointment row; removed that `<p>` so only the 85×85 APT box remains on the left (type still shown in center column).
- **Appointment time position:** User asked to move the appointment time down 2px; changed from `translateY(-4px)` to `translateY(-2px)` for the time line only.

**Decisions / outcomes:** Appointments tab now matches orders tab for layout, typography, colors, and status pill; no label under the APT icon; time at translateY(-2px). CORE updated with the convention so future agents keep the two tabs consistent.

**Changes:** `src/pages/admin/clients/page.tsx` (appointments block: layout, fonts, pill, empty state, removed type-under-thumbnail, time translateY). `motherboard/CORE.md` (one new bullet under Conventions). This MEMORY entry.

**Conventions:** When editing admin client details tabs, keep Orders and Appointments styling in sync per CORE (same card, flex, typography, pill, left column treatment, time offset).
