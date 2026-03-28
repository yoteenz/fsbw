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

---

## 2025-03-01 — Admin clients: search on overview only, persist when closing details, clear button

**Context:** User wanted (1) client details view to show only nav text + back button (no search bar), (2) search text to **persist** on client overview after closing client details (so the typed query is still there and the list stays filtered), and (3) a way to **clear** the search and show all clients again without having to click into search and delete manually.

**Topics covered (this chat):**
- **Details view:** When `selectedClientEmail` is set (client details open), the header must show breadcrumb + title (e.g. "CLIENTS > DETAILS") and back button only—not the search input. Implemented in AdminHeader: when `hideSearchIcon` is true, `useEffect` sets `isSearchActive` to false so the center always shows nav text; center content renders search input only when `isSearchActive && !hideSearchIcon`.
- **Persist search:** Removed the `useEffect` on the clients page that cleared `clientSearchQuery` when opening client details. So when the user opens a client, the search value is unchanged; when they close details and return to overview, the same search text is still in the header and the list remains filtered.
- **Clear search:** Added a clear (X) button in AdminHeader next to the search input when `searchInputValue.trim() !== ''`. Clicking it calls `onExternalSearchChange('')` (or `setSearchQuery('')` for non-external search), clearing the filter so the client list shows all clients again.

**Decisions / outcomes:** Client details = nav + back only; overview keeps search value when navigating to/from details; users can clear search via the X button in the header when the search bar is expanded and has text.

**Changes:** `src/pages/admin/clients/page.tsx` (removed useEffect that cleared `clientSearchQuery` on `selectedClientEmail`). `src/pages/admin/components/AdminHeader.tsx` (useEffect when `hideSearchIcon` sets `isSearchActive` false; center shows search only when `isSearchActive && !hideSearchIcon`; clear X button when search has value). This MEMORY entry.

**Conventions:** On admin clients, search is an overview-only feature; details view never shows the search bar. Search state is not cleared when opening a client so it persists when returning to overview. AdminHeader shows a clear (X) control when external search has content so users can reset the filter and see all clients.

---

## 2025-03-16 — Admin marketing page: route, nav, randomize, dropdowns, options

**Context:** User asked to document recent admin marketing (special-offer) work and to "add to motherboard" so future agents have the full picture.

**Topics covered (this chat):**
- **Route and nav:** The marketing card on the admin dashboard and the special-offer config page now use route **`/admin/marketing`** (not `/admin/special-offer`). Nav/breadcrumb on the page shows **"ADMIN > MARKETING"** (AdminHeader title set to "MARKETING"). Dashboard MARKETING card navigates to `/admin/marketing`.
- **Randomize button:** A **RANDOMIZE** button was added below the Save Config button on the marketing page. It randomly populates product (unit), length, density, texture, lace, hairline, color, styling, and add-ons (random subset). Thumbnail and start date are left unchanged. Same height as other buttons (padding 8px 10px).
- **Marketing page UI:** Save Config and Upload Photo buttons use the same height as concierge page buttons (padding 8px 10px). Add-ons selector was changed from cap-size–style toggle buttons to a **dropdown** (trigger shows "NONE" or comma-separated add-ons; panel lists BLEACH, PLUCK, BLUNT CUT with multi-select toggle and checkmark).
- **Options coverage:** Hairline dropdown includes combined option **LAGOS + PEAK** (stored as "LAGOS, PEAK"). Styling dropdown includes single options plus Bangs combinations (BANGS, CRIMPS; BANGS, FLAT IRON; BANGS, LAYERS). All dropdowns use product-specific options from `productOptions.ts` / `getOptionsForUnit(unitId)`.

**Decisions / outcomes:** Marketing config lives at `/admin/marketing` with nav "admin > marketing". Component file remains `src/pages/admin/special-offer/page.tsx`; only route path and label were changed. Randomize gives admins a quick way to fill all selection options with valid random values.

**Changes:** `src/App.tsx` (route path "special-offer" → "marketing"). `src/pages/admin/dashboard/page.tsx` (navigate to `/admin/marketing`). `src/pages/admin/special-offer/page.tsx` (AdminHeader title "MARKETING"; randomize handler and RANDOMIZE button; add-ons as dropdown; Upload Photo and Save Config padding 8px 10px). `src/utils/productOptions.ts` (HAIRLINE_OPTIONS + "LAGOS, PEAK"; STYLING_OPTIONS + Bangs combos). This MEMORY entry.

**Conventions:** Admin marketing config: route `/admin/marketing`, nav text "ADMIN > MARKETING". Marketing page: Save Config, Upload Photo, and dropdown triggers share same button height (8px 10px). Add-ons are a multi-select dropdown; hairline includes LAGOS + PEAK; styling includes Bangs combinations. Randomize button below Save Config randomly fills all selection options for the chosen unit.

---

## 2025-03-15 — Client details: tag alignment, stats font size, right-edge alignment

**Context:** User asked for layout and typography tweaks on the admin client details panel (referral block with ACTIVE/INACTIVE tag, invites, and newsletter).

**Topics covered (this chat):**
- **Tag position:** Move the active/inactive tag to the right so the end of the tag aligns with the end of the "invites & newsletter" text below. Tag wrapper was given `alignItems: 'flex-end'` and `transformOrigin: 'top right'` so the tag sits on the right and scales from the right edge.
- **Stats font size:** Decrease the orders, total spent, and membership data values (e.g. 5, $4,196, PREMIUM) above the ORDERS / TOTAL SPENT / MEMBERSHIP labels by 1px. Those three bold values were changed from 14px to 13px in `src/pages/admin/clients/page.tsx`.
- **No shifting:** User reported that when the tag or the text below changed, the other would shift; they wanted all of it aligned so the end of the tag and the end of the invites/newsletter line stay aligned. Fix: the second column of the referral block uses a fixed width (72px). All cells in that column (tag wrapper, invites cell wrappers, newsletter wrappers) now use `alignItems: 'flex-end'` and `width: '100%'`; removed inconsistent `alignItems: 'center'` and `paddingRight: '10px'` so the right edges of tag and text stay aligned and no longer shift.

**Decisions / outcomes:** Client details referral block: tag, invites, and newsletter in the right column are right-aligned within the same fixed-width column so their ends line up regardless of tag value (ACTIVE/INACTIVE) or which rows are visible.

**Changes:** `src/pages/admin/clients/page.tsx` (tag wrapper: flex-end, width 100%, transformOrigin top right; orders/total spent/membership values 14px → 13px; all second-column wrappers for invites and newsletter: alignItems flex-end, width 100%, removed center alignment and paddingRight). This MEMORY entry.

**Conventions:** On admin client details, the referral block’s right column (72px) should keep tag, invites, and newsletter right-aligned (alignItems: flex-end) so their right edges align and layout does not shift when content varies.

---

## 2025-03-11 — Vercel build TypeScript fixes and dev-server port cleanup

**Context:** User hit multiple Vercel build failures (TypeScript) and then could not start the dev server because ports 3001/3002 were already in use. Fixes were applied so the build passes and the dev server can be restarted.

**Topics covered (this chat):**
- **First build errors:** (1) `src/pages/admin/audit/page.tsx` — `e.details` (unknown) used in a conditional that produced a non–ReactNode type; (2) `src/pages/admin/dashboard/page.tsx` — API stats type missing `signUpsThisMonth`, and `api.bookings` / `api.notifications` were `unknown[]` vs. `Booking[]` / `Notification[]`; (3) `src/pages/admin/notifications/page.tsx` — `getAdminNotifications()` returns items as `unknown[]`, state expects `NotifEntry[]`.
- **Fixes applied:** In `src/utils/api.ts`, added `signUpsThisMonth` to dashboard stats and typed `bookings` and `notifications` with explicit shapes. In audit page, replaced `e.details && ... && ( <pre>...</pre> )` with a ternary `e.details != null && ... ? ( <pre>...</pre> ) : null` so the expression is a valid ReactNode. In notifications page, cast API result to `NotifEntry[]` when calling `setList()`.
- **Port in use:** User ran `npm run dev` after a reboot; Vite failed with "Port 3001 is already in use" and live-reload port 3002 EADDRINUSE. Identified process (PID 18628) using both ports and ran `Stop-Process -Id 18628 -Force` so they could run `npm run dev` again.
- **Second build error:** Dashboard still failed: API booking type had optional `appointment_date?` (and similar) while dashboard `Booking` type required `appointment_date: string`. Fixed by mapping `api.bookings` in the dashboard to full `Booking` objects with `?? ''` for any missing fields (`status`, `appointment_date`, `service_name`, `client_name`).

**Decisions / outcomes:** Admin API and pages are typed so Vercel `tsc --noEmit` passes. When the dev server reports ports in use, find the PID with `netstat -ano | findstr :3001` (or the port in question) and kill it with `Stop-Process -Id <PID> -Force`.

**Changes:** `src/utils/api.ts` (dashboard return type: signUpsThisMonth, typed bookings/notifications). `src/pages/admin/audit/page.tsx` (details block: ternary for ReactNode). `src/pages/admin/notifications/page.tsx` (setList with NotifEntry[] cast). `src/pages/admin/dashboard/page.tsx` (bookings mapped to full Booking with required string fields). This MEMORY entry.

**Conventions:** When fixing "type X is not assignable to type Y" for API → state, either align API return types in `api.ts` or normalize in the page (e.g. map API array to required shapes with defaults). For "Port already in use" on Windows, use netstat + Stop-Process to free the port.

---

## 2025-03-01 — OAuth (Google/Facebook) removed from sign-in and all pages

**Context:** User asked to remove the sign-up with Facebook and Google buttons on the sign-in page, the "if Google shows 'access blocked' or the wrong account…" text below them, and the entire OAuth feature and logic from all pages.

**Topics covered (this chat):**
- Removal of OAuth UI and flows: no Google/Facebook sign-in buttons or access-blocked text on sign-in (none were present in current sign-in page; OAuth logic was removed elsewhere).
- Checkout: removed OAuth confirmation requirement—no modal or block for unconfirmed OAuth users; removed `showOAuthConfirmRequiredModal`, `isOAuthUnconfirmedCheckoutBlocked()`, and the "CONFIRM YOUR DETAILS" OAuth modal.
- Account settings: removed all OAuth-only state and UI—no "confirm name & birthday" block, no OAuth password/confirm-password fields, no "SIGNED IN WITH GOOGLE/FACEBOOK" read-only field; first name, last name, and birthday are always editable; password section always shows normal show/reset password flow.
- Account reviews: removed OAuth branching; all users get same lists (user-submitted + mock shop/tool reviews) and same last-seen updates for alerts.
- Account affiliate: removed `authProvider` checks; mock content is based only on `isMockDataAccount(currentUser)`.
- Account notifications: notification key is always email-based (`user?.email ? \`notifications_${user.email}\` : 'notifications'`), no OAuth condition.
- Account page: tier calculation and alerts no longer branch on OAuth; single behavior for all users.
- Constants/reviews: removed `isOAuthUser()`; `getTotalReviewCount` and `hasNewReviewApproved` treat all users the same (mock + user count; full alert logic).

**Decisions / outcomes:** Sign-in and account behavior are email/password only. No OAuth (Google/Facebook) sign-in, no OAuth-specific confirmation flows, and no `authProvider`-based branching in checkout, settings, reviews, affiliate, notifications, or account page.

**Changes:** `src/pages/checkout/page.tsx` (OAuth modal and checkout block removed). `src/pages/account/settings/page.tsx` (OAuth state, confirm block, password branch, "SIGNED IN WITH" display removed; name/birthday always editable). `src/pages/account/reviews/page.tsx` (isOAuth removed; unified shop/tool lists and last-seen). `src/pages/account/affiliate/page.tsx` (authProvider checks removed; mock by isMockDataAccount only). `src/pages/account/notifications/page.tsx` (key by email only). `src/pages/account/page.tsx` (tier and alerts key without authProvider). `src/constants/reviews.ts` (isOAuthUser removed; getTotalReviewCount and hasNewReviewApproved unified). This MEMORY entry.

**Conventions:** Do not reintroduce OAuth (Google/Facebook) sign-in or `authProvider`-based logic unless explicitly requested. Profile fields "facebook"/"google" that remain are social handles (e.g. @FACEBOOK) or platform names, not OAuth.

---

## 2025-03-16 — Concierge/Marketing UI, auth persistence, add-on combos

**Context:** User requested several concierge and admin marketing tweaks, confirmed sign-out-on-browser-close was still happening (no cookie/site settings to blame), and asked for full add-on combination options on the marketing add-ons dropdown. User also confirmed that auto-add to motherboard is on for this chat.

**Topics covered (this chat):**
- **Special offer cap size (concierge):** Font size for XS/S/M/L buttons increased to 10px only (no box height change). Box height remains minHeight 28px, padding 6px 4px.
- **No-offer empty state (concierge):** When there is no special offer (1‑month break or no config/expired), the empty message is "THERE ARE NO OFFERS AVAILABLE AT THIS TIME." + line break + "CHECK BACK SOON!" in gray (#666), same card style as other concierge content.
- **Auth persistence (sign-out on browser close):** Because beforeunload/pagehide can be unreliable when closing the browser, added: (1) `visibilitychange` listener in `main.tsx` so we persist auth backup when the tab becomes hidden (switch tab, minimize, or start closing); (2) in `App.tsx` a 20s interval that calls `persistAuthBackup()` while the user is signed in; (3) in `AccountRouteGuard`, call `persistAuthBackup()` after setting `isSignedIn` when restoring session. Sign-out still happens only on explicit Sign Out via `clearAppAuth()`.
- **Marketing dropdown scrolling:** All dropdown panels on the admin marketing page (`/admin/marketing`) now use `max-h-48 overflow-y-auto` so long lists (e.g. Styling) are scrollable to the bottom.
- **Randomize button:** RANDOMIZE button text color changed from black to red (#EB1C24).
- **Add-ons dropdown (marketing):** Replaced individual toggles with a single-select list of **all combinations**: NONE, BLEACH, PLUCK, BLUNT CUT, BLEACH + PLUCK, BLEACH + BLUNT CUT, PLUCK + BLUNT CUT, BLEACH + PLUCK + BLUNT CUT. Implemented via `ADDON_COMBO_OPTIONS` in `productOptions.ts` (label + value array). Config still stores `addOns: string[]` for pricing/concierge; Randomize now picks one combo from `ADDON_COMBO_OPTIONS`.

**Decisions / outcomes:** Concierge empty state and cap button styling as above. Auth backup is written on visibility hidden, every 20s when signed in, and after guard session restore so it survives browser close even when beforeunload does not fire. Marketing dropdowns all scroll; add-ons dropdown shows and selects full combinations; RANDOMIZE is red.

**Changes:** `src/pages/account/concierge/page.tsx` (cap fontSize 10px; no-offer empty state block with gray message). `src/main.tsx` (visibilitychange → persistAuthBackup). `src/App.tsx` (isSignedIn import; 20s interval to persistAuthBackup when signed in). `src/components/AccountRouteGuard.tsx` (persistAuthBackup after setting isSignedIn). `src/utils/productOptions.ts` (ADDON_COMBO_OPTIONS). `src/pages/admin/special-offer/page.tsx` (dropdown scrolling for all panels; RANDOMIZE color #EB1C24; add-ons use ADDON_COMBO_OPTIONS, single-select, display label from matching combo). This MEMORY entry.

**Conventions:** When adding to motherboard in this chat, auto-add remains on: add one MEMORY entry at the end of significant exchanges, summarizing the **entire conversation so far**. Do not remove or overwrite existing MEMORY/CORE content.

---

## 2025-03-01 — Admin UI: search persistence, empty-state copy, cards above tabs, meetings scroll

**Context:** User requested several admin and client-detail UI fixes: keep search visible after closing client details, unify “no content” empty-state styling, center invite count under ACTIVE tag, move summary cards above tabs on multiple admin pages, fix meetings page layout/scroll, and fix build errors.

**Topics covered (this chat):**
- **Client overview search persistence:** After closing client details, the nav search bar was collapsing so the user could not see or clear the search without clicking search again. Fix: In `AdminHeader`, the effect that keeps search expanded when there is an external search value now also depends on `hideSearchIcon`; when returning to overview (`hideSearchIcon` false) with a non-empty `externalSearchValue`, search is re-expanded so the query stays visible and clearable.
- **Build errors (Vercel):** `src/pages/admin/clients/deleted/page.tsx` — sort callback parameters `a`/`b` implicitly any → typed as `(a: DeletedUser, b: DeletedUser)`. `src/pages/admin/clients/page.tsx` — removed unused `rewards` and `hasDiscounts` to satisfy TS6133.
- **Empty-state messages consistency:** User asked for a list of all “no content” messages (e.g. “JUST DUST & LINT HERE.”, “No videos submitted yet”) and their font settings. Then requested all such messages to use **full caps**, **11px**, **Futura PT Medium**, **#808080**. Updated: admin clients (photos/videos/socials, NO ORDERS YET, NO APPOINTMENTS YET, NO REGISTERED CLIENTS YET, NO CLIENTS MATCH, NO INVITES YET), admin clients account (NO ORDERS YET), account affiliate (NO PHOTOS/VIDEOS/SOCIAL TAGS SUBMITTED YET), account referrals (NO PAST INVITES YET), admin referrals (NO REFERRAL EARNINGS YET, NO CONFIRMED REFERRALS YET), admin analytics (NO CLICKS RECORDED YET), wishlist (YOUR WISHLIST IS EMPTY), gift card (NO REVIEWS YET…). Cart/shopping-bag and “NO MESSAGES OR SUPPORT EMAILS YET” already matched.
- **Invite text under ACTIVE tag (client details):** User wanted “0 INVITES” / “1 INVITE” centered below the ACTIVE/INACTIVE pill. Iterations: (1) Centered text in the 72px block with `items-end` — still looked left of tag. (2) Switched column to `items-center` and fixed tag `transformOrigin` to `top center` (was `top right`) so the scaled pill stays visually centered. (3) User said invite text was then “moved upwards” off the same row as tier/duration; restored row alignment using a **two-column grid** (`gridTemplateColumns: '1fr 72px'`): row 1 = referral code | ACTIVE tag; row 2 = tier label | invite block; row 3 = duration | empty or NEWSLETTER. Invite block and ACTIVE live in the same 72px column, centered; tier/duration stay on the left so “rewards” no longer wraps.
- **Font sizes (client details):** Silver tier rewards, subscription duration, and invite text all use **10px** (confirmed for user).
- **Cards above tabs (revenue, pending, meetings, reviews, referrals, brand, analytics):** Total revenue and total orders cards moved above tabs on **revenue** page. **Pending** page: header title set to **“PENDING”** (breadcrumb shows “ADMIN > PENDING”); two cards (PENDING REVIEWS, ORDER FORMS) moved above ALL/REVIEWS/FORMS/ALERTS tabs. **Meetings:** Three cards (TODAY, CONFIRMED, PENDING) placed above DAY/WEEK tabs. **Reviews:** Two cards (AVERAGE RATING, TOTAL REVIEWS) above ALL/PENDING/PUBLISHED. **Referrals:** Two cards (TOTAL INVITEES, TOTAL PAID OUT) above OVERVIEW/BY REFERRER/ACTIVITY. **Brand:** Brand score (e.g. 94% OVERALL BRAND SCORE) above OVERVIEW/METRICS/ACHIEVEMENTS. **Analytics:** Total clicks section (number + “TOTAL CLICKS”) above SUMMARY/BY PLATFORM/BY SOURCE; dashboard **analytics** card no longer shows “Social” — `count` set to `''`, activity text to “TRACK LINK CLICKS…” (no “social”).
- **Meetings page JSX and scroll:** Fixed “Adjacent JSX elements must be wrapped” error caused by an extra `</div>` left after a prior edit (removed one closing `</div>`). Then made the **quick schedule** (and date picker + today’s meetings list) scrollable: wrapped that block in `<div className="flex-1 min-h-0 overflow-y-auto">` so the card content below the tabs scrolls and the quick schedule is no longer cut off.

**Decisions / outcomes:** Admin/client empty states use 11px Futura PT Medium #808080 full caps. Client details referral/invite block uses a grid so ACTIVE + invite stay in one column (72px, centered) while tier/duration stay on the same rows on the left. Summary cards live above tabs on revenue, pending, meetings, reviews, referrals, brand, and analytics. Meetings main card uses a scrollable middle section so date + meetings list + quick schedule all scroll inside the card.

**Changes:** `src/pages/admin/components/AdminHeader.tsx` (search-expand effect deps + hideSearchIcon). `src/pages/admin/clients/deleted/page.tsx` (sort callback types). `src/pages/admin/clients/page.tsx` (unused vars removed; empty-state styles; invite/ACTIVE grid + centered column; NO ORDERS/APPOINTMENTS/REGISTERED CLIENTS/INVITES etc. styling). `src/pages/admin/clients/account/page.tsx` (NO ORDERS YET style). `src/pages/account/affiliate/page.tsx`, `src/pages/account/referrals/page.tsx`, `src/pages/admin/referrals/page.tsx`, `src/pages/admin/analytics/page.tsx`, `src/pages/wishlist/page.tsx`, `src/pages/tools/gift-card/page.tsx` (empty-state 11px Futura PT Medium #808080). `src/pages/admin/revenue/page.tsx` (cards above tabs). `src/pages/admin/pending/page.tsx` (title “PENDING”, cards above tabs). `src/pages/admin/meetings/page.tsx` (cards above tabs; scroll wrapper for date/meetings/quick schedule; removed extra `</div>`). `src/pages/admin/reviews/page.tsx`, `src/pages/admin/referrals/page.tsx`, `src/pages/admin/brand/page.tsx` (cards / brand score above tabs). `src/pages/admin/analytics/page.tsx` (total clicks above tabs). `src/pages/admin/dashboard/page.tsx` (analytics card count and activity text without “social”). This MEMORY entry.

**Conventions:** When centering a label under a scaled element, use `transformOrigin: 'top center'` so the visual center matches layout. For tabbed admin cards that have summary stats, place the summary cards above the tabs so they are always visible. Use a single scrollable wrapper (`flex-1 min-h-0 overflow-y-auto`) for the body of a fixed-height card so content (e.g. quick schedule) is not cut off.

---

## 2025-02-28 — Client profile BIRTHDAY row (between EMAIL and PHONE)

**Context:** User specified how birthday should be displayed in client/profile views and requested a BIRTHDAY row between EMAIL and PHONE.

**Decisions / outcomes:**
- Add a **BIRTHDAY** row between EMAIL and PHONE in client details and any profile views that show this info block.
- Display format: **"AUGUST 30, 1989"** (month name, day, year — uppercase).
- Fallback order for deriving the displayed value:
  1. `birthDate` (full string) — use as-is if present
  2. `birthMonth` + `birthDay` + `birthYear` → format as MM/DD/YYYY, then convert to "MONTH DD, YYYY"
  3. `birthMonth` + `birthDay` → MM/DD
  4. `birthDay` only → "Day {day}" (e.g. "Day 15")
  5. Otherwise → "—"

**Changes:** motherboard/CORE.md (convention), this MEMORY entry.

**Conventions:** Client profile info blocks that show EMAIL and PHONE must include BIRTHDAY between them, using the fallback logic above. See CORE.md Conventions.

---

## 2025-02-17 — Account profile red email underline removed

**Context:** User still saw an underline on the red email text on the account profile page, especially for the yoteenz account; they wanted it removed.

**Topics covered (this chat):**
- Located the red email display in `src/pages/account/page.tsx` (the `<p>` with `color: '#EB1C24'` showing the user email in the profile card).
- Inline `textDecoration: 'none'` was already present but was being overridden (e.g. by global or inherited styles or browser/extension link styling).

**Decisions / outcomes:** Removed the underline by (1) adding `className="account-profile-email"` to that email `<p>`, and (2) adding a CSS rule in `src/index.css`: `.account-profile-email { text-decoration: none !important; }` so the no-underline style wins over any other rule.

**Changes:** `src/pages/account/page.tsx` (className on email paragraph), `src/index.css` (new `.account-profile-email` rule). This MEMORY entry.

**Conventions:** None. For future styling overrides on that email, use or extend the `.account-profile-email` class so behavior stays consistent.

---

## 2025-02-28 — Main card height and responsiveness (payment, shipping, wishlist lists, other pages)

**Context:** User wanted payment method and shipping address main card height reverted to match the latest pushed Vercel deploy; then wanted the wishlist lists main card to be responsive while still appearing like the 520px design, and asked about all other cards across the site.

**Topics covered (this chat):**
- **Payment & Shipping:** Main card height was set to fixed **510px** (reverting from viewport-fill). Later made responsive with proportional scaling: `minHeight: calc(100vh * 510 / 900)` so the card scales with viewport and equals 510px at 900px viewport height.
- **Wishlist lists:** Main card height was adjusted from 265px through several steps (275, 500, 510, 520px fixed). User wanted it responsive but visually like 520px. Implemented proportional formula `calc(100vh * 520 / 745)` so at 745px viewport height the card is exactly 520px; denominator was tuned (900 → 800 → 700 → 750 → **745**) until the card “looked right” on the user’s screen. Final: `height`, `minHeight`, and `maxHeight` all set to `calc(100vh * 520 / 745)`.
- **Other pages:** Clarified which pages have responsive main cards and how: Wishlist (main) and Shopping bag use `calc(100vh - 270px)`. Admin clients, Account settings, and Account (menu open) use `minHeight: calc(100dvh - 160px)`. Build-a-wig, products, checkout, sign-in, etc. often have no explicit height on the main card (content-sized). Not all use the same proportional formula; standardizing to 520/745 (or 510/745) is possible for consistency.
- **“Add to motherboard”:** User said “add to motherboard”; agent mistakenly created `MOTHERBOARD.md` in the project root. User corrected: there is a **motherboard folder** in the project; the correct action is to add to **`motherboard/MEMORY.md`** (and optionally CORE) per ADDING.md, not to create a file in the root.

**Decisions / outcomes:** Wishlist lists main card uses `calc(100vh * 520 / 745)`. Payment and Shipping use `calc(100vh * 510 / 900)`. Other main cards use various viewport-based or content-sized heights. CORE updated with a convention for main card responsive height formulas.

**Changes:** `src/pages/account/payment/page.tsx` (minHeight 510px then calc(100vh*510/900)). `src/pages/account/shipping/page.tsx` (same). `src/pages/wishlist/lists/page.tsx` (height/minHeight/maxHeight: fixed 520px then proportional with denominator 900, 800, 700, 750, 745). Deleted erroneous `MOTHERBOARD.md` from project root. This MEMORY entry and one new CORE convention.

**Conventions:** When adding to motherboard, append to `motherboard/MEMORY.md` (per ADDING.md); do not create a file named MOTHERBOARD in the project root. Main card proportional height: wishlist lists = 520/745; payment/shipping = 510/900. See CORE for the full main-card responsive height convention.

---

## 2025-02-17 — Add to motherboard: user directed to motherboard folder

**Context:** User said "add to motherboard" and then "check the motherboard folder in the build-a-wig project folder for further instructions." The agent had no prior reference to a "motherboard" in the codebase; the user was pointing to the existing `motherboard/` folder and its protocol.

**Topics covered (this chat):**
- User requested to add to motherboard.
- User clarified that instructions live in the **motherboard folder** (`motherboard/`) at the project root, not a single file. Agent was directed to read that folder for the adding protocol.
- Agent listed project root, found `motherboard/` (README.md, CORE.md, ADDING.md, MEMORY.md, CODEBASE.md), read README.md, ADDING.md, and CORE.md, then MEMORY.md to follow the protocol and avoid duplicates.
- Per ADDING.md: append one new entry to MEMORY.md summarizing the entire conversation so far; do not overwrite or remove existing content; optionally add to CORE only if there is a new permanent design/stack/flow fact (none this chat). Auto-add is now **on** for the rest of this chat—at the end of significant exchanges, add one new MEMORY entry without the user saying "add to motherboard" again.

**Decisions / outcomes:** When the user says "add to motherboard" or "check the motherboard folder for further instructions," the agent should read `motherboard/README.md`, `motherboard/ADDING.md`, `motherboard/CORE.md`, and `motherboard/MEMORY.md`, then append one entry to MEMORY.md per the format in ADDING.md. The motherboard is a **folder** at the project root (`motherboard/`), not a single file.

**Changes:** This MEMORY entry only.

**Conventions:** "Add to motherboard" and "check the motherboard folder for instructions" mean: read the motherboard folder files and append to MEMORY per ADDING.md. Motherboard location: `motherboard/` (folder) at project root.

---

## 2026-02-15 — Motherboard folder confirmed; add to motherboard + where we left off

**Context:** User said "add to motherboard" and "check the build-a-wig project files again for the motherboard folder." They wanted to confirm the motherboard location and then add to it. They also asked "where did we last leave off?"

**Topics covered (this chat):**
- User asked "?" (status check), then "where did we last leave off?", then "add to motherboard."
- First search for "motherboard" in the codebase returned no matches; user asked to check project files again. Grep then found the **motherboard folder** at `motherboard/` (project root) with: `README.md`, `ADDING.md`, `MEMORY.md`, `CODEBASE.md`, and `.cursor/rules/motherboard.mdc`. No file named "motherboard" or "MOTHERBOARD.md" at root—only the folder.
- User requested add to motherboard per protocol: read README, ADDING, CORE, MEMORY and append one entry summarizing the full conversation.

**Where we left off (from prior session):** Admin subscription override for ayoteenz was implemented so they can toggle Standard / 3 MONTH / 6 MONTH / 12 MONTH next to "INCLUDED IN YOUR MEMBERSHIP" and verify benefits and logic across pages. Implemented: `getEffectiveSubscriptionTier()` and `ADMIN_SUBSCRIPTION_OVERRIDE_KEY` in `src/utils/adminAuth.ts`; state and toggle buttons on membership page with persistence to localStorage. **Not yet done:** Checkout page `getPremiumTier()` and checkout confirm page (points calculation) were not yet updated to use `getEffectiveSubscriptionTier(currentUser)`, so the override does not yet apply site-wide (checkout, orders). To finish: in checkout replace `getPremiumTier` logic with `getEffectiveSubscriptionTier(user)` (or call it inside `getPremiumTier`); in confirm page use `getEffectiveSubscriptionTier(user)` instead of `user.subscriptionTier` when computing points multiplier.

**Decisions / outcomes:** Motherboard is the folder `motherboard/` at project root; "add to motherboard" means follow ADDING.md and append to MEMORY. This entry records the chat and the unfinished wiring of admin subscription override to checkout/confirm.

**Changes:** This MEMORY entry only.

**Conventions:** When searching for "motherboard," check for the **folder** `motherboard/` (and its files); grep for "motherboard" will hit README, ADDING, MEMORY, CODEBASE, and .cursor/rules/motherboard.mdc.

---

## 2025-02-15 — Add to motherboard: user pointed to AGENTS.md and MOTHERBOARD_COMMANDS.md

**Context:** User said "add to motherboard" and then clarified: "When I say 'add to motherboard', read AGENTS.md or docs/MOTHERBOARD_COMMANDS.md in this repo—they explain where the motherboard is and what to do."

**Topics covered (this chat):**
- User requested add to motherboard.
- User directed the agent to read **AGENTS.md** (project root) or **docs/MOTHERBOARD_COMMANDS.md** for the motherboard location and protocol when the agent is unsure.
- Agent read AGENTS.md, docs/MOTHERBOARD_COMMANDS.md, then motherboard/README.md, motherboard/ADDING.md, motherboard/CORE.md, and motherboard/MEMORY.md, and appended this entry per ADDING.md.

**Decisions / outcomes:** When the user says "add to motherboard" and the agent does not already have motherboard context, the agent should read **AGENTS.md** or **docs/MOTHERBOARD_COMMANDS.md** first; those docs state that the motherboard is the **folder** `motherboard/` at project root and describe the commands (add = append to MEMORY per ADDING.md; load = read README → CORE → CODEBASE → MEMORY; snapshot = overwrite CODEBASE.md). No new CORE facts this chat.

**Changes:** This MEMORY entry only.

**Conventions:** Do not reply that there is no motherboard or ask the user to specify what to add. Read AGENTS.md or docs/MOTHERBOARD_COMMANDS.md when the user says "add to motherboard" and you need the protocol; then read motherboard/README.md and motherboard/ADDING.md and append one entry to motherboard/MEMORY.md summarizing the entire conversation so far.

---

## 2025-03-17 — Auto-add to motherboard on by default (same as mandatory read at chat start)

**Context:** User asked whether the agent was auto-saving the chat to the motherboard (as the code suggests) and, when told no (because auto-add only turns on after saying "add to motherboard"), asked if auto-add could be enabled by default the same way the "read motherboard at chat start" fix was done.

**Topics covered (this chat):**
- Vercel build fix: removed unused `month` in `src/pages/account/concierge/page.tsx` (TS6133).
- User asked if the agent had read/loaded the motherboard before implementing; agent had not; user asked what to change so new chats always read the motherboard. Rule was updated: removed "read (or assume you have read)" and made it mandatory to **read** the four files at chat start; AGENTS.md gained a line requiring read at chat start.
- User asked if the agent was auto-saving this chat to the motherboard; agent said no—auto-add only turns on after "add to motherboard." User asked to enable auto-add by default the same way as the read-at-start fix.

**Decisions / outcomes:** Auto-add is now **on by default** for every new chat. At the end of any significant exchange, the agent must append one new entry to `motherboard/MEMORY.md` per ADDING.md (full conversation summary). "Add to motherboard" = add one entry now (and re-enable auto-add if the user had said "stop"). "Stop adding to motherboard" turns off auto-add for that chat. No need for the user to say "add to motherboard" to start capturing the conversation.

**Changes:** `.cursor/rules/motherboard.mdc` (new paragraph: auto-add on by default; "Add to motherboard" section simplified to "one entry now"; "stop" behavior kept). `motherboard/README.md` (Auto-load section: Add to motherboard now describes default auto-add; "Add to motherboard" command meaning and steps updated; removed step 5 about "remember auto-add is on"). `motherboard/ADDING.md` (section "Auto-add (continuous)..." renamed to "Auto-add is on by default"; text updated so auto-add is default; checklist item updated). This MEMORY entry.

**Conventions:** New chats: (1) must read README, CORE, CODEBASE, MEMORY at start; (2) auto-add is on—append to MEMORY at end of significant exchanges. "Add to motherboard" = one entry now (and re-enable if user had said "stop"). "Stop adding to motherboard" = turn off auto-add for that chat.

---

## 2025-03-18 — Add to motherboard: user reiterated AGENTS.md / MOTHERBOARD_COMMANDS.md

**Context:** User said "add to motherboard." When the agent did not have motherboard context, the user clarified: "When I say 'add to motherboard', read AGENTS.md or docs/MOTHERBOARD_COMMANDS.md in this repo—they explain where the motherboard is and what to do."

**Topics covered (this chat):**
- User requested add to motherboard.
- User directed the agent to read **AGENTS.md** (project root) or **docs/MOTHERBOARD_COMMANDS.md** when unsure where the motherboard is or what to do.
- Agent read AGENTS.md, docs/MOTHERBOARD_COMMANDS.md, then motherboard/README.md, motherboard/ADDING.md, motherboard/CORE.md, and motherboard/MEMORY.md, and appended this entry per ADDING.md.

**Decisions / outcomes:** No change to protocol. Reconfirms that when the user says "add to motherboard" and the agent is unsure, the agent should read AGENTS.md or docs/MOTHERBOARD_COMMANDS.md first; those docs state that the motherboard is the folder `motherboard/` at project root and describe the commands (add = append to MEMORY per ADDING.md; load = read README → CORE → CODEBASE → MEMORY; snapshot = overwrite CODEBASE.md).

**Changes:** This MEMORY entry only.

**Conventions:** Same as MEMORY entry 2025-02-15 (Add to motherboard: user pointed to AGENTS.md and MOTHERBOARD_COMMANDS.md). Do not reply that there is no motherboard or ask the user to specify what to add; read AGENTS.md or docs/MOTHERBOARD_COMMANDS.md, then follow motherboard/README and ADDING.md.

---

## 2026-02-15 — Vouchers, membership copy, history order, points history sort, EXPLORE ALL BENEFITS spacing

**Context:** Multiple UX and copy fixes: voucher modal and applicability, premium/membership section text, history sort order, points history date logic, and spacing below "EXPLORE ALL BENEFITS."

**Topics covered (this chat):**
- **Voucher modal (checkout):** Only the quantity counter (+/- and number) is disabled when a voucher type is not applicable; the label (e.g. "1X OF COLOR") is always visible and not dimmed. Label shows **available** count (e.g. "1X OF COLOR"); when type is not applicable the counter shows 0 and label stays as available; when applicable, counter is 0..available. On open/apply, inapplicable types are forced to 0.
- **Voucher applicability:** A voucher type (COLOR, HAIRLINE, STYLING) is applicable only when at least one cart item has **add-on price > 0** for that type (so e.g. "Golden" is not applicable). BLANCO color fallback in checkout: GOLDEN = -20, ASH = 20, PLATINUM = 0.
- **Premium / membership:** Unlock Premium Rewards section only (do not change upgrade chart): two **headers** = "Premium 3d wig selection options", "Entry to members only lobby + lounge"; four **lines** (gray subtitles) = "Prioritized support with significantly reduced response times", "Option to schedule in advance + prioritized custom orders", "Eligible for a chance to win raffles, discounts + vouchers", "Earn 2x loyalty points unlocking rewards faster." Restore original subtitles under the first two headers. TOTAL DUE TODAY price on premium upgrade chart = gray for all premium price selections.
- **Admin account:** Unhide name and email (remove blur/condition); restore canonical profile layout so name and email are **direct children** of the Profile Details div (no inner wrapper) to fix email position.
- **History order:** Digital cash history, voucher history, and points history: **newest at top**, oldest at bottom (sort by date descending).
- **Points history sort fix:** Jan 26 was appearing above Feb 15. Cause: inconsistent date formats (e.g. M-D-YYYY vs D-M-YYYY) and parsing. Fix: single **parsePointsHistoryDateToTime** (handles M-D-YYYY and YYYY-M-D when first part > 31); **normalizePointsHistoryDate** stores normalized M-D-YYYY when building rows from order.date; period filter and **formatPointsHistoryDateDisplay** use the same parser. Sort remains newest first.
- **EXPLORE ALL BENEFITS spacing:** 12px below was not significant; wrapper div around the button now has **marginBottom: '24px'** (wrapper ensures spacing is not overridden).

**Decisions / outcomes:** Voucher modal = counter disabled only, label = available; applicability = add-on price > 0. Unlock Premium Rewards = only section to change (headers/lines as above); chart unchanged. Profile = name/email direct under Profile Details. All three histories = newest first. Points history = normalized dates + single parser for correct chronological sort. EXPLORE ALL BENEFITS = 24px gap below via wrapper.

**Changes:** `src/pages/checkout/page.tsx` (voucher modal label/counter/disabled logic; cartVoucherApplicability by addOnPrice > 0; BLANCO color fallback; open/apply inapplicable → 0). `src/pages/account/membership/page.tsx` (Unlock Premium Rewards headers/lines only; TOTAL DUE gray; EXPLORE ALL BENEFITS wrapper marginBottom 24px; tier name color in "EARN X TO UNLOCK / REMAIN [TIER] TIER" — BLACK/SILVER/RED; points history: parsePointsHistoryDateToTime, normalizePointsHistoryDate, formatPointsHistoryDateDisplay, getPointsHistoryRows sort and period filter). `src/pages/account/page.tsx` (remove profile blur; remove inner div so name/email direct children; digital cash + voucher history sort descending). This MEMORY entry.

**Conventions:** When changing premium/membership copy, only change the Unlock Premium Rewards section (headers + lines as specified); do not change the upgrade chart row labels. For points/digital cash/voucher history, use newest-first sort; for points history, normalize order dates and use a single date parser so sort is correct across formats.

---

## 2025-03-17 — Create-account password icon alignment; motherboard auto-add and read-at-start confirmed

**Context:** User asked to align the show/hide password icon on the create-account card’s password input with the confirm-password icon (move password icon left for symmetry). Later asked to confirm whether the chat is auto-saving to the motherboard and whether the agent read the motherboard before implementing.

**Topics covered (this chat):**
- **Password icon alignment:** On the create-an-account card (`src/pages/sign-in/page.tsx`), the password field’s show/hide icon used `right: '8px'` while the confirm-password icon used `right: '11px'`. The password icon was moved left by changing it to `right: '11px'` so both icons are symmetrical.
- **Motherboard behavior:** User confirmed (1) auto-add is on by default—agent adds one MEMORY entry at the end of significant exchanges; (2) agent did read README → CORE → CODEBASE → MEMORY at chat start before making the icon fix.

**Decisions / outcomes:** Create-account card password and confirm-password show/hide icons both use `right: '11px'` for consistent alignment. This MEMORY entry documents the fix and the confirmation that motherboard read-at-start and auto-add are working as intended.

**Changes:** `src/pages/sign-in/page.tsx` (password field icon style `right: '8px'` → `right: '11px'`). This MEMORY entry.

**Conventions:** None. Confirms agents should read motherboard first and that auto-add appends to MEMORY after significant exchanges.

---

## 2025-03-17 — Auto-add rule tightened: add after any completed task, never skip for "small" changes

**Context:** User asked why the agent didn't append a MEMORY entry after the password-icon fix, then asked how to fix the rules so future agents don't skip adding for one-line tweaks or similar reasons.

**Topics covered (this chat):**
- **Why the skip happened:** The agent had treated the password-icon alignment as a "one-line tweak" and didn't run the add-to-motherboard step; the rule said "significant" which was interpreted loosely.
- **Rule change:** Make auto-add trigger unambiguous: add whenever you **completed a user-requested task** that involved changing code, fixing a bug, adding a feature, or making a decision. **Do not skip** because the change was "small," "one-line," "just a tweak," or "only UI"—size and scope do not matter. Only skip when there is no outcome to record (thanks, ok, clarifying Q with no code change or decision).

**Decisions / outcomes:** ADDING.md and `.cursor/rules/motherboard.mdc` now state explicitly that agents must add after any completed task that touches the codebase or delivers an outcome; they must not skip based on perceived size (one-line, single file, UI-only). Skip only when there is nothing to record.

**Changes:** `motherboard/ADDING.md` (Auto-add section: "When to add" / "When to skip" bullets; "significant" replaced with task-based wording; Rule 3 updated). `.cursor/rules/motherboard.mdc` (auto-add paragraph: same task-based trigger + explicit "Do not skip because the change was small"). This MEMORY entry.

**Conventions:** When auto-add is on, append to MEMORY after any exchange where you completed a user-requested task (code change, fix, feature, or decision). Do not skip for small scope; only skip for no-outcome exchanges (conversation only, no code or decision).

---

## 2025-03-17 — Mobile menu toggle spacing and text aligned to account profile

**Context:** User reported that menu toggle spacing and text adjustments (20px below social icons, 6px right for subtext, 6px left for arrows) were not applied consistently; some tabs/pages (e.g. unit & shop pages, wishlist, product pages) didn’t match. They wanted all pages to mirror the account profile page and be symmetrical.

**Topics covered (this chat):**
- **Canonical reference:** Account profile page (`src/pages/account/page.tsx`) uses: menu item labels `transform: 'translateX(13px)'`, SHOP tab arrows `translateX(-11px) translateY(-4px)`, scroll area `flex: 1, overflowY: 'auto', marginBottom: '20px'`, Sign In/Out block `marginBottom: '20px', marginTop: 'auto'`, and social icons wrapped in `<div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>`.
- **Label subtext (6px right):** Replaced remaining `translateX(7px)` with `translateX(13px)` in: `src/pages/products/page.tsx` (2), `src/pages/account/shipping/page.tsx` (2), `src/pages/account/reviews/leave-review-order/page.tsx` (2). `BrandMenuLinks.tsx` and most other pages already had 13px.
- **Arrow position (6px left):** Replaced remaining `translateX(-5px) translateY(-4px)` with `translateX(-11px) translateY(-4px)` in: `src/pages/wavy/beach-wave/page.tsx`, `src/pages/units/curly/page.tsx`, `src/pages/straight/blanco/page.tsx`, `src/pages/curly/soft-curl/page.tsx`.
- **tools/gift-card:** Grep reported `translateX(7px)` at two menu label lines; read_file showed 13px (possible workspace/index difference). If still 7px on disk, apply same replace: `transform: 'translateX(7px)'` → `transform: 'translateX(13px)'` only for the two menu label spans (TOOLS GIFT CARD and SHOP items), not the cart badge.
- **Layout note:** build-a-wig addons, lace, texture, styling, cap-size use absolute positioning for Sign In/Out and social icons (bottom: 86px / 37px). Account and most other pages use flex with marginBottom: 20px. To make those build-a-wig pages match account’s flex layout would require restructuring that bottom section.

**Decisions / outcomes:** Menu labels use `translateX(13px)` and SHOP tab arrows use `translateX(-11px) translateY(-4px)` everywhere. Social icons are wrapped with `marginBottom: '20px'` on all pages that use the standard menu. One-off back-button or cart-badge transforms (e.g. translateX(4px), translateX(-2.5px)) were left unchanged.

**Changes:** `src/pages/products/page.tsx`, `src/pages/account/shipping/page.tsx`, `src/pages/account/reviews/leave-review-order/page.tsx` (7px → 13px for menu labels). `src/pages/wavy/beach-wave/page.tsx`, `src/pages/units/curly/page.tsx`, `src/pages/straight/blanco/page.tsx`, `src/pages/curly/soft-curl/page.tsx` (-5px → -11px for menu arrows). This MEMORY entry.

**Conventions:** Mobile menu toggle: label subtext = `translateX(13px)`, SHOP arrows = `translateX(-11px) translateY(-4px)`, 20px below social icons via wrapper. Use account profile page as reference for any new or updated menu implementations.

---

## 2025-03-17 — Admin Marketing Alerts tab: concierge styling, client list from overview, button below card

**Context:** User wanted the Alerts tab (Marketing admin card) to match the concierge priority-messages UI: same styling for the user dropdown and message input; the "Select a client" dropdown should show all clients from the overview (it was empty); and the Send notification button should sit below the main card with uppercase red Futura Medium styling.

**Topics covered (this chat):**
- **Dropdown and textarea styling:** Alerts tab user dropdown and message input now use the same styles as the concierge "PRIORITY MESSAGES" card: dropdown with height 36px, border 1.3px solid #000, Futura PT Book 11px, uppercase, custom arrow via `/assets/dropdown.svg`, borderRadius 0, appearance none; textarea with padding 12px, same border/font, uppercase, 6 rows, input forced to uppercase on change.
- **Client list source:** Added `buildClientListFromOverview()` so the Alerts client list matches the overview: `getAdminClients()` result is merged with `getMockClientsForAyoteenz()`, deduped by email, and filtered with `isClientBlocked`. When the API returns empty or fails, fallback uses `registeredUsers` from localStorage and, for ayoteenz admin, merges mock clients—same logic as the clients overview page.
- **Send notification button:** Moved out of the card; when Alerts is active it is rendered in `PageActionsBelowCard` below the main card, with `pageActionButtonStyle` (red #EB1C24, Futura PT Medium, uppercase, "SEND NOTIFICATION" / "SENDING...").

**Decisions / outcomes:** Alerts tab uses concierge-style form controls; client dropdown is populated from the same source as the admin clients overview (API + mock + fallback); primary action button is below the card with shared admin button styling.

**Changes:** `src/pages/admin/marketing/page.tsx` (imports for `isAyoteenzAdminAccount`, `isClientBlocked`, `getMockClientsForAyoteenz`; `buildClientListFromOverview()`; Alerts client loading uses it; dropdown/textarea/labels styled like concierge; Send button in `PageActionsBelowCard` with `pageActionButtonStyle`). This MEMORY entry.

**Conventions:** Admin Marketing Alerts tab: client list = same as overview (API + mock merge, dedupe, filter blocked); form styling matches concierge priority messages; action button below card with red Futura Medium uppercase.

---

## 2025-03-17 — Marketing Alerts "Select a client" dropdown matches client overview sort styling

**Context:** User wanted the "Select a client" dropdown on the Marketing Alerts tab to use the same box/text styling as the most recent sorting control on the client overview page.

**Topics covered (this chat):**
- **Client overview sort reference:** The sort dropdown on the client overview (`admin/clients`) uses a trigger + dropdown panel with border 1.3px black, white bg; dropdown options use `text-xs` (12px), Futura PT Book, color #000, fontWeight 400, uppercase.
- **Marketing select update:** The Alerts "Select a client" native `<select>` was updated to match: same border and background; text styling set to fontSize 12px, fontWeight 400, color #000; padding set to `8px 28px 8px 12px` to align with sort option spacing.

**Decisions / outcomes:** Marketing Alerts "Select a client" dropdown now matches client overview sort dropdown box and text styling (12px, 400, #000, same border/bg).

**Changes:** `src/pages/admin/marketing/page.tsx` (select style: fontSize 12px, fontWeight 400, color #000, padding shorthand).

**Conventions:** When aligning admin form controls across pages, use client overview sort dropdown (and its option styling) as the reference for dropdown/select box and text styling.

---

## 2025-03-17 — Admin pending header icon updated to pending-icon2

**Context:** User asked to update the admin Pending page header icon to use the `pending-icon2.svg` asset (folder/file with checkmark).

**Changes:** `src/pages/admin/pending/page.tsx` — replaced the previous inline SVG (three-dots style) with the pending-icon2 paths (folder shape + checkmark), keeping 15×15 display size and existing wrapper style; SVG attributes use React camelCase (strokeWidth, strokeLinecap, strokeLinejoin).

---

## 2025-03-17 — Marketing Alerts: "SEARCH" hint below Select a client

**Context:** User wanted a "search" text line below the "SELECT A CLIENT" label on the Marketing Alerts dropdown to make it easier to find the client, with similar styling to the search icon/input in the admin nav bar.

**Changes:** `src/pages/admin/marketing/page.tsx` — added a "SEARCH" line below "SELECT A CLIENT" with nav-bar search styling (Futura PT Medium, 500, #EB1C24, 12px, uppercase); reduced SELECT A CLIENT bottom margin to 4px so the two lines sit together, SEARCH has 8px margin above the dropdown. Native select supports type-to-search in browsers, so the hint reinforces that behavior.

---

## 2025-03-17 — Admin header icons moved 6px left

**Context:** User asked to move all admin header icons 6px to the left.

**Changes:** Updated header icon `marginLeft` on all admin card pages so icons shift 6px left: revenue, marketing, pending, analytics, meetings, brand, referrals, reviews, backend — from `1px` to `-5px`; clients page (icon had `4px`) to `-2px`. Backend icon retains `transform: translateY(-1.5px)`.

---

## 2025-03-17 — Marketing Alerts: dropdown scroll, custom inputs, arrow position, border thickness

**Context:** User asked for: (1) header & topic dropdowns to have scroll; (2) when selecting CUSTOM, show an input field to enter custom header/topic; (3) move the red dropdown arrow 16px to the right for all three input boxes (header, topic, client); (4) decrease dropdowns’ line thickness by 0.5px.

**Changes:** `src/pages/admin/marketing/page.tsx` — Header and topic dropdown panels use `overflowY: 'auto'` with `maxHeight: '220px'` so lists scroll. When header is CUSTOM or topic is CUSTOM, the control becomes a text input (placeholder "ENTER CUSTOM HEADER..." / "ENTER CUSTOM TOPIC...") with a red ▼ button to reopen the list; send logic uses `customHeaderText`/`customTopicText` (state added). Red arrow position: header and topic `marginLeft` 8px→24px, client 18px→34px. All three dropdown triggers and panels: border 1.3px→0.8px.

---

## 2026-03-26 — Signup + session profile sync to Supabase (full metadata, schema doc, cart/wishlist push)

**Context:** User reported Supabase was not storing/populating signup card fields (birthday, join date, phone, socials) so new clients had no personal info in admin client overview or account settings. They asked for tables/schema and syncing from all relevant flows.

**Decisions / outcomes:** Root cause was partly **email-confirm signup** (no immediate `PATCH` until first session) with **incomplete `user_metadata`** (only name/phone/birthday, no socials/referral), and **`buildProfilePayloadForBackend` / `buildMinimalUserFromSupabaseSession`** not carrying socials and related fields into `profiles`. Cart/wishlist existed in API but local changes were not routinely pushed to cloud.

**Changes:**
- `src/utils/syncFromApi.ts` — `buildMinimalUserFromSupabaseSession` merges `raw_user_meta_data` + `user_metadata`, reads socials + `referral_code`, sets `createdAt` from auth `created_at`, default rewards fields; `buildProfilePayloadForBackend` sends full profile fields for `PATCH /api/profile`.
- `src/pages/sign-in/page.tsx` — `signUp` `options.data` includes `referral_code` (precomputed), all social fields; session branch reuses same referral variable; `registeredUsers` seed includes socials.
- `api/profile.ts` — On first profile upsert (`!existing`), sets `created_at`.
- `api/admin/clients.ts` — `authUserToMinimalClient` surfaces socials + referral from metadata when no `profiles` row yet.
- `src/utils/pushCartWishlistToCloud.ts` + `src/App.tsx` — Debounced (2s) `putCart` / `putWishlist` on `location.pathname` change when signed in with Supabase.
- `supabase/migrations/20260326180000_ensure_profiles_columns.sql` — `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS` for all columns used by `toProfileRow`.
- `docs/SUPABASE_SCHEMA_SYNC.md` — Runbook: metadata, RLS, tables, app sync summary.

**Conventions:** New persistent user fields should go through `PATCH /api/profile` (or dedicated API) and be reflected in `profileMapping`, migration, and signup `user_metadata` if collected before first session.

---

## 2026-03-25 — Supabase schema migration, profile/notifications API, orders PUT, settings + signup cloud sync

**Context:** User said Supabase was not storing signup and account data (birthday, join date, phone, socials, etc.) so admin client overview and account settings showed empty personal info. They wanted tables and backend sync for account pages, admin, cart, checkout, wishlist, and related flows.

**Topics covered (full chat):** Diagnosed gaps: missing or incomplete DB columns/RLS blocking `PATCH /api/profile`; signup `user_metadata` and `PATCH` should match settings-style social URLs; settings socials and notification toggles were local-only unless the user hit “save profile to cloud”; cart/wishlist had debounced push but orders did not; `GET`-only `api/orders` meant no server persistence for order blobs.

**Decisions / outcomes:** Ship one SQL migration for `profiles` (all API fields + notification booleans), `cart`, `wishlist`, `orders`, RLS, and an `auth.users` trigger inserting a minimal `profiles` row. Extend API mapping and `PATCH` for notification columns. Add `PUT /api/orders` and push local `userOrders_*` from the existing debounced cloud sync. Persist non-mock order state from the orders page to localStorage and dispatch `ordersUpdated`. Harden signup: domain-prefixed socials in metadata + `PATCH`, try/catch with a clear modal on profile save failure. Settings: `patchProfile` after social blur and after notification toggles when a Supabase session exists.

**Changes:** `supabase/migrations/20260325120000_full_app_sync.sql` (new); `api/_lib/profileMapping.ts`, `api/profile.ts`, `api/orders.ts` (PUT); `src/utils/api.ts` (`putOrders`); `src/utils/pushCartWishlistToCloud.ts` (also `putOrders`); `src/App.tsx` (listen for `ordersUpdated`); `src/pages/orders/page.tsx` (persist non-mock orders + event); `src/pages/sign-in/page.tsx` (social URL metadata + `PATCH` error handling); `src/pages/account/settings/page.tsx` (cloud patch for socials + notifications); `docs/PROFILES_COLUMNS_AND_APP_MAPPING.md`; `motherboard/CORE.md` (pointer to migration).

**Conventions:** Run `supabase/migrations/20260325120000_full_app_sync.sql` in the Supabase SQL Editor when columns/RLS are missing. Join date for clients is `profiles.created_at` (exposed as `createdAt`). Keep social values aligned with settings (`facebook.com/...`, `x.com/...`, etc.).

---

## 2026-03-25 — Admin client details: cart/wishlist tied to Supabase user id

**Context:** User asked whether cart and wishlist tabs on admin client details should show that client’s data and whether Supabase can support it.

**Topics covered:** Confirmed `cart` / `wishlist` tables and `GET /api/admin/cart?user_id=` / `GET /api/admin/wishlist?user_id=` already back admin reads. Found a UI bug: cart/wishlist were fetched by `registeredUsers` row `id` but the merged `selectedClient` (when admin views their own email) overwrote Supabase UUID with `currentUser.id` from localStorage, so cache keys did not match and tabs looked empty.

**Decisions / outcomes:** Preserve Supabase UUID when merging `currentUser` over the API client row for same email. Fetch cart and wishlist when the admin opens the Cart or Wishlist tab (fresh data). Use `selectedClientForOrders?.id` (with fallback) for display keys. Show short messages for mock/local-only ids (non-UUID). Guard orders and activity fetches with `isSupabaseUserId` so mock clients skip invalid API calls.

**Changes:** `src/pages/admin/clients/page.tsx` (`isSupabaseUserId`, merge preserves id, replaced eager cart/wishlist effects with tab-scoped fetch + loading, cart/wishlist copy for non-UUID, orders/activity fetch guards).

**Conventions:** Admin client details that hit Supabase by `user_id` must use the auth UUID from the client list row, not a local-only `id` after merging `currentUser`.

---

## 2026-03-25 — Admin client overview: sort options, scrollable sort menu, Alerts + new orders

**Context:** User wanted more sorting options on the client overview “most recent” dropdown (photos, videos, tags, reviews, active/inactive), a scrollable panel so all options are reachable, and the Alerts sort to reliably surface clients with new orders.

**Topics covered (full chat):**
- **New sort options:** Added `Photos`, `Videos`, `Tags`, `Reviews`, `Active`, and `Inactive` to `SORT_OPTIONS` on `src/pages/admin/clients/page.tsx`. Each filters to clients with that signal (REWARDS counts via `getRewardsRow`, reviews via `getReviewsTabRow`, referral ACTIVE/INACTIVE via `getInvitesRow`) and sorts by count descending where relevant, then account recency (`createdAt`).
- **Scrollable dropdown:** Sort options panel uses Tailwind `max-h-60 overflow-y-auto` so long lists scroll inside the panel.
- **Alerts:** Kept filter `clientHasUnreadPriorityMessages(u) || getClientRow(u, 0).newCount > 0` (priority/order-issue/new-order logic plus ALL-tab NEW when counts differ). Sort uses `getLastUnreadPriorityMessageTime` with a secondary tie-break by `createdAt` descending so clients with similar alert timestamps order consistently.
- **priorityMessages:** Exported `getClientNewOrdersCount` for reuse (Alerts still uses `clientHasUnreadPriorityMessages`, which internally uses that count).

**Decisions / outcomes:** Client overview sort dropdown includes media/reviews/referral-status filters; dropdown scrolls; Alerts ordering is clearer for ties; new-order eligibility remains aligned with existing priority message helpers plus NEW column fallback.

**Changes:** `src/pages/admin/clients/page.tsx` (`SORT_OPTIONS`, `sortedClients` branches, dropdown `className`). `src/utils/priorityMessages.ts` (export `getClientNewOrdersCount`). This MEMORY entry.

**Conventions:** When adding many custom dropdown options on admin pages, use a max-height + `overflow-y-auto` on the panel (see also marketing dropdown scrolling in CORE/MEMORY).

---

## 2026-03-25 — Checkout voucher COLOR discount matches BAW color sub-page ($120)

**Context:** User reported voucher discounts at checkout did not match the Build-a-Wig sub-page color price (e.g. UI showed $120 but checkout applied −$100).

**Topics covered:** Root cause was a split between `build-a-wig/color/page.tsx` `getSelectedPrice()` for customize/edit (flat **$120** for non-default non-Blanco colors) vs `calculatePricesFromSelections` on `build-a-wig/page.tsx` and checkout `getVoucherAddOnPriceForItem` fallback (**$100** + **$40** for long lengths). Stale `cartItems[].colorPrice === 100` also kept vouchers at $100 because checkout preferred stored `colorPrice` first.

**Decisions / outcomes:** Single rule for non-Blanco paid color: **$120** flat (aligned with the color sub-page). Checkout **COLOR** voucher amount is always derived from the current selection (not stored `colorPrice`) so legacy carts still get the correct discount. HAIRLINE/STYLING unchanged (still prefer stored price when present).

**Changes:** `src/pages/checkout/page.tsx` (COLOR: skip stored `colorPrice`; fallback `120`). `src/pages/build-a-wig/page.tsx` (`calculatePricesFromSelections` color branch: `120` instead of 100/+40). `src/pages/build-a-wig/color/page.tsx` (non-customize `getSelectedPrice` non-Blanco: `120` flat, no length surcharge).

**Conventions:** Voucher discount for COLOR must match BAW color selection pricing; if pricing rules change, update color sub-page, `calculatePricesFromSelections`, and `getVoucherAddOnPriceForItem` together.

---

## 2026-03-25 — Brand: overview metrics, ALERTS + CODES tabs; marketing alerts removed

**Context:** User asked to move brand **metrics** and **achievements** under the **Overview** tab; remove **Alerts** from the marketing page; add **Alerts** after Overview on Brand and **Codes** after Alerts for gift/discount code creation and usage tracking.

**Topics covered:**
- **Brand `OVERVIEW`:** Retains the 2×2 quick stats plus former **METRICS** list (key metrics incl. market penetration) and **RECENT ACHIEVEMENTS** in one scrollable section. Tabs are now **OVERVIEW · ALERTS · CODES · ANALYTICS** (removed standalone METRICS and ACHIEVEMENTS tabs).
- **Brand `ALERTS`:** Former marketing Alerts UI (header/topic, client multi-select from same overview client list, message, preview, send, recent for client) lives in `src/pages/admin/components/BrandAlertsPanel.tsx`, with shared client list builder in `src/utils/adminClientListFromOverview.ts`. Summary row above tabs shows clients with notifications and total sent count.
- **Brand `CODES`:** Local persistence `adminBrandPromoCodes` via `src/utils/adminBrandCodes.ts` — create **gift card** or **discount** codes (value, max uses, expiry, note), list with **+1 USE** and activate/deactivate; header shows active code count and total redemptions.
- **Marketing:** Tabs **AFFILIATE · CHALLENGES · OFFERS** only; all Alerts tab code, portal, and notification API wiring removed from `src/pages/admin/marketing/page.tsx`.

**Changes:** `src/pages/admin/brand/page.tsx`, `src/pages/admin/components/BrandAlertsPanel.tsx` (new), `src/utils/adminClientListFromOverview.ts` (new), `src/utils/adminBrandCodes.ts` (new), `src/pages/admin/marketing/page.tsx` (simplified). This MEMORY entry.

**Conventions:** Client-targeted admin notifications (“Alerts”) live under **Admin → Brand → ALERTS**; promo codes tracking under **Brand → CODES** (`localStorage` until a backend exists).

---

## 2026-03-25 — Checkout header: CHECKOUT > BAG / UPGRADE (red second segment)

**Context:** User asked to change checkout header breadcrumb text: regular checkout should read **checkout > bag** with **bag** in brand red; subscription upgrade checkout (**/checkout/upgrade**) should read **checkout > upgrade** with **upgrade** in red.

**Changes:** `src/pages/checkout/page.tsx` — when the mobile menu is closed, center nav shows `CHECKOUT >` (Futura PT Book, clickable: navigates to `/bag` on regular checkout, `/account/rewards` on upgrade) and a red Futura PT Medium label **`BAG`** or **`UPGRADE`** (replacing the previous `BAG >` / `UPGRADE >` + red `CHECKOUT` pattern).

**Conventions:** None. Confirm/summary page still uses `CHECKOUT >` + red `SUMMARY` unless product asks to align it.

---

## 2026-03-25 — Admin meetings: DAY/WEEK/MONTH/YEAR, mock data, schedule page (consultation vs appointment)

**Context:** User wanted **MONTH** and **YEAR** tabs after DAY/WEEK on the admin meetings page; mock data should differ by range (not one static list); quick schedule should open a full scheduling flow with **Consultation** (wig consult) vs **Appointment** (installs, re-installs, brow tint/clean up, mink lashes, travel fee, braids, makeup), including date, time, client-linked personal info, and notes.

**Topics covered:**
- **Tabs & ranges:** `MEETING_TABS` extended to DAY, WEEK, MONTH, YEAR. Week = Mon–Sun containing selected date; month/year from selected date. Summary cards show totals for the active range (IN DAY / IN WEEK / IN MONTH / IN YEAR) plus confirmed/pending.
- **Mock data:** New `src/utils/adminMeetingsMock.ts` — seeded per-day meetings (consultation = `WIG CONSULT` vs appointment with multi-service labels), merged with `localStorage` (`adminMeetingsScheduled`) and optional API rows via `normalizeApiMeeting`. Year-long ranges use sparser mock (cap/skip) so lists stay usable; month/week/day fuller.
- **Schedule page:** `src/pages/admin/meetings/schedule/page.tsx` + route `/admin/meetings/schedule?kind=consultation|appointment`. Client dropdown from `registeredUsers`; manual fields; appointment multi-select from `APPOINTMENT_SERVICE_OPTIONS`. Save appends or upserts local rows, dispatches `adminMeetingsUpdated`, optional `postAdminMeeting`. Edit on local `local-*` ids upserts; mock edit pre-fills then save adds a new local row.
- **Meetings list:** Date chips when not in DAY view; category badges CONSULT/APPT; removed duplicate footer quick-schedule CTA; two quick buttons navigate to schedule.

**Changes:** `src/utils/adminMeetingsMock.ts` (new), `src/pages/admin/meetings/page.tsx` (rewrite), `src/pages/admin/meetings/schedule/page.tsx` (new), `src/App.tsx` (lazy `AdminMeetingsSchedule`, route `meetings/schedule` before `meetings`). This MEMORY entry.

**Conventions:** Admin meetings mock + local merge lives in `adminMeetingsMock`; after saving a meeting, dispatch `adminMeetingsUpdated` so the list refreshes without full remount.

---

## 2026-03-25 — Admin reviews: SHOP/TOOLS tabs; View pending reviews → Pending REVIEWS tab

**Context:** User asked to rename admin reviews tabs from PENDING/PUBLISHED to SHOP/TOOLS; replace **Approve pending reviews** with **View pending reviews** navigating to the admin Pending page **REVIEWS** tab.

**Changes:** `src/pages/admin/reviews/page.tsx` — tabs `ALL`, `SHOP`, `TOOLS`; reviews carry `scope: 'shop' | 'tools'` (API rows: optional `scope`, default shop); mock tools rows added; SHOP/TOOLS lists filter by scope; bottom CTA `navigate('/admin/pending?tab=reviews')` with label **VIEW PENDING REVIEWS**. `src/pages/admin/pending/page.tsx` — `useSearchParams`; on `?tab=reviews` sets `activeTab` to **REVIEWS**.

**Conventions:** Deep-link to Pending reviews tab: `/admin/pending?tab=reviews`. API can return `scope: "tools"` for tools reviews; omit or other values → shop.

---

## 2026-03-25 — Admin reviews ALL tab: sort dropdown (client-overview styling)

**Context:** User asked to replace the red **RECENT REVIEWS** heading on the admin reviews page with a sorting dropdown matching the client overview **Most recent** sort control, with options: 1–4 star, Photos, Videos.

**Changes:** `src/pages/admin/reviews/page.tsx` — `REVIEW_SORT_OPTIONS`, `reviewSortOptionToLabel` (uppercase labels like clients), trigger + red chevron + overlay + panel (`1.3px` black border, `max-h-60 overflow-y-auto`, Futura PT Book option rows). Sort logic: **1 STAR** ascending rating; **2/3 STAR** matching rating first then date desc; **4 STAR** ratings ≥4 first then date; **PHOTOS** / **VIDEOS** descending counts. Default **4 STAR**. Review rows gain optional **`videos`** (API + mock). `useMemo` sorts the ALL-tab list only; SHOP/TOOLS headers unchanged.

**Conventions:** Reuse client overview sort dropdown structure for admin list controls when product asks for parity.

---

## 2026-03-25 — Dashboard stat cards: only PENDING/MEETINGS items capped (no uniform row stretch)

**Context:** User did not want all dashboard stat cards forced to one row height; they asked to restore natural card heights and **only** constrain **PENDING** and **MEETINGS** so those two stay symmetrical with typical peers.

**Changes:** Removed `gridAutoRows` and per-card `fillHeight`. `StatsCard` now takes optional **`itemsMaxHeightPx`** (dashboard passes **148** for `PENDING` and `MEETINGS` only): items list gets `maxHeight` + `overflow-y-auto` + horizontal scroll. Other cards unchanged (`min-h-[140px]` only). Meetings page scroll behavior from prior work unchanged unless user revisits.

**Conventions:** Use `itemsMaxHeightPx` on dashboard only for cards with long item lists; tune px if typography changes.

---

## 2026-03-25 — Special-offer / marketing admin JSON in Supabase (`app_config`)

**Context:** User wanted admin marketing / special-offer configuration (previously localStorage-only) stored in the database like the rest of the app sync scope, not kept separate from Supabase.

**Topics covered:** Prior work had wired profile, cart, wishlist, orders, and settings notifications through `/api/*`; admin-only marketing JSON was called out as needing its own tables/APIs if persisted. This change implements that persistence.

**Decisions / outcomes:** Added **`public.app_config`** (`key` PK, `value` jsonb, `updated_at`) with RLS enabled and no anon/authenticated policies (access only via API + service role). Row key **`special_offer_admin`** holds the same object shape as `specialOfferAdminConfig` in localStorage.

**Changes:**
- `supabase/migrations/20260325140000_app_config_marketing.sql` — creates `app_config`.
- `api/special-offer-config.ts` — **GET** returns `{ config }` for the concierge (public, no auth).
- `api/admin/special-offer-config.ts` — **PUT** upserts config (admin via `requireAdmin`); audit action `app_config.upsert`.
- `api/_lib/auditLog.ts` — extended `AuditAction` with `app_config.upsert`.
- `src/utils/api.ts` — `getSpecialOfferAdminConfig()`, `putAdminSpecialOfferConfig()`.
- `src/pages/admin/special-offer/page.tsx` — load: API first, then localStorage; save: localStorage + cloud PUT.
- `src/pages/account/concierge/page.tsx` — hydrate special offer: API first (and cache admin key in localStorage when present), then localStorage admin key, then random offer logic.
- `motherboard/CORE.md` — documented `app_config` migration and GET/PUT routes. This MEMORY entry.

**Conventions:** Run the new migration in Supabase after deploy; `VITE_API_BASE` / proxy must reach the API for dev. Large `thumbnailDataUrl` base64 payloads may hit request size limits—consider storage URLs later if needed.

---

## 2026-03-25 — Admin pending: OVERVIEW / AFFILIATE tabs; remove review & affiliate banners

**Context:** User asked to rename the **ALL** tab to **OVERVIEW**, **ALERTS** to **AFFILIATE**, and remove the stat banners under **REVIEWS** and the former alerts tab.

**Changes:** `src/pages/admin/pending/page.tsx` — `PENDING_TABS` = `OVERVIEW`, `REVIEWS`, `FORMS`, `AFFILIATE`; default tab `OVERVIEW`; first section title **PENDING ITEMS**; dropped the gray “12 / PENDING REVIEWS” block above **BY TYPE** on Reviews; replaced Alerts tab with **AFFILIATE** content (**AFFILIATE PENDING** list: submissions, photo/video review, social tags, payout queue) and removed the “5 / ACTIVE ALERTS” banner.

**Conventions:** Admin Pending tab order: **OVERVIEW · REVIEWS · FORMS · AFFILIATE**.

---

## 2026-03-25 — Admin clients sort: affiliate media vs account reviews vs referral Active/Inactive

**Context:** User wanted the admin **Clients** overview sort options to mean: **Photos / Videos / Tags** = clients who submitted **affiliate** content (stored under `userAffiliatePhotos_*`, `userAffiliateVideos_*`, `userAffiliateTags_*`); **Reviews** = clients who left reviews via **Account → Reviews** (`userSubmittedReviews_*`); **Active / Inactive** = **referral code** status (not media/review activity).

**Decisions / outcomes:** Photos/Videos/Tags sorts **filter** to clients with count > 0 from those affiliate keys and **sort** by that count (then recency). Reviews sort uses only account-submitted review storage (with `mock*N@test.com` fallbacks: `photosCount` / `videosCount` / `tagsCount` and `totalReviews` when localStorage is empty for demos). Active/Inactive continue to use **`getInvitesRow(...).status === 'ACTIVE' | 'INACTIVE'`**.

**Changes:** `src/pages/admin/clients/page.tsx` — helpers `countAffiliateSubmitted`, `countAccountSubmittedReviews`; sort branches for **Photos**, **Videos**, **Tags**, **Reviews**, **Active**, **Inactive** aligned with the above. This MEMORY entry.

**Conventions:** Do not use rewards-tab or generic profile counts for these four media/review sorts unless explicitly product-defined otherwise.

---

## 2026-03-26 — Checkout: rush + COLOR voucher vs default Blanco (Platinum) / Noir

**Context:** User had **default** Blanco & Noir units in the cart but checkout **disabled 4–6 week rush** and treated **COLOR** as applicable; they suspected color voucher logic.

**Root cause:** `hasColorStylingOrAddOns` used `item.name === 'BLANCO'` for the default color, so cart lines titled **"Blanco"** (title case) used **Off Black** as the default instead of **Platinum**—Platinum then looked like a custom color, which flipped rush off. **`VOUCHER_TYPE_CONFIG.COLOR.getDefault`** used the same strict name check, so **Platinum** looked like an upgrade vs Off Black while `getVoucherAddOnPriceForItem` still priced Platinum at $0—incoherent UI. Trimming: **`PLATINUM` with trailing whitespace** failed the early `=== 'PLATINUM'` check and could fall through to the flat **$120** branch.

**Changes:** `src/pages/checkout/page.tsx` — added **`normalizeCartUnitName`** / **`defaultHairColorForUnit`**; wired **COLOR** `getDefault`, **`getVoucherAddOnPriceForItem`** (trim + normalized Blanco), **`hasColorStylingOrAddOns`** (uppercase/trim color + styling; Blanco → Platinum default), and **voucher discount `hasOption`** (trim/upper on cart value vs default). This MEMORY entry.

**Conventions:** Treat cart **unit name** and **color** comparisons as **case- and whitespace-normalized** anywhere default Blanco = Platinum matters.

---

## 2026-03-26 — Admin Brand CODES tab: fix ReferenceError `codesSummary`

**Context:** User saw a red error on **Admin → Brand → CODES**: **Can't find variable: codessummary** (browser `ReferenceError` for **`codesSummary`**).

**Root cause:** `src/pages/admin/brand/page.tsx` rendered the CODES summary strip and the create-code form using **`codesSummary`**, **`alertsStats`**, **`onAlertsStats`**, and form state (**`codeKind`**, **`manualCode`**, etc.) without declaring them—likely incomplete merge or truncated component body.

**Changes:** Same file — added **`promoCodes`** + **`refreshCodes`** from **`loadBrandPromoCodes`**, **`useMemo`** for **`codesSummary`** (active count + total uses as redemptions), **`alertsStats`** + stable **`onAlertsStats`** for **`BrandAlertsPanel`**, and all CODES form **`useState`** hooks. This MEMORY entry.

**Conventions:** Brand **CODES** UI must keep hook definitions in sync with JSX that references them.

---

## 2026-03-25 — Dashboard stat cards: cap items list for CLIENTS, REVENUE, BRAND (all cards)

**Context:** User asked to apply the same **fixed items-list height + vertical scroll** behavior used on other admin dashboard stat cards to **CLIENTS**, **REVENUE**, and **BRAND** as well.

**Decisions / outcomes:** All dashboard `StatsCard` instances now receive **`itemsMaxHeightPx={DASHBOARD_CAPPED_STAT_ITEMS_MAX_PX}`** (103px). Removed **`DASHBOARD_ITEMS_CAP_TITLES`** since every stat card is capped; no per-title branching.

**Changes:** `src/pages/admin/dashboard/page.tsx` — comment + always pass cap; `src/pages/admin/components/StatsCard.tsx` — JSDoc for **`itemsMaxHeightPx`** updated (no longer says CLIENTS/REVENUE/BRAND uncapped). This MEMORY entry.

**Conventions:** Admin dashboard stat grid treats all cards uniformly for items area height unless a future requirement splits behavior again.

---

## 2026-03-26 — Admin dashboard CLIENTS card: EMAIL MARKETING row

**Context:** User wanted **email marketing** tracking on the **Dashboard → CLIENTS** stat card, on a new line **below NEW ACCOUNTS**, aligned with how newsletter signup is tracked on the **admin Clients overview** page.

**Decisions / outcomes:** No new counting logic: **`clientTiers.emailMarketing`** already increments for each **`visibleClients`** row where **`isClientNewsletterSubscribed(c)`** is true (same helper as clients overview: **`newsletterSubscribed`** on the client object and/or **`userNewsletter_${email}`** in localStorage). Blocked clients stay excluded via **`visibleClients`**.

**Changes:** `src/pages/admin/dashboard/page.tsx` — added **`EMAIL MARKETING`** item with value **`String(clientTiers.emailMarketing ?? 0)`** immediately after **`NEW ACCOUNTS`**. This MEMORY entry.

---

## 2026-03-26 — StatsCard tiers: BLACK / RED / SILVER label + value use `tier.color`

**Context:** User wanted **BLACK** and **RED** tier tracker text on the admin **CLIENTS** stat card to render in black and red like **SILVER** uses its tier color (full line consistent).

**Root cause:** Tier row **label** colors were hardcoded only for legacy labels **`PREM` / `STD` / `STANDARD`**; dashboard **CLIENTS** tiers use **`BLACK` / `RED` / `SILVER`**, so labels fell through to gray **`#808080`** while values already used **`getColorValue(tier.color)`**.

**Changes:** `src/pages/admin/components/StatsCard.tsx` — tier block now sets **`tierColor = getColorValue(tier.color)`** and applies it to both the **display label** (still mapping PREM→BLACK, STD→RED, STANDARD→SILVER) and the **value**. **REVENUE** **Q1/Q2/Q3** labels now match their red values. This MEMORY entry.

---

## 2026-03-26 — Dashboard REVENUE card: TOP PRODUCT (sales by unit)

**Context:** User wanted a **TOP PRODUCT** line on the admin **Dashboard → REVENUE** stat card **below TAX DEDUCTIONS**, showing the unit with the **most sales**, aligned with the admin **Revenue** page (they referenced the **Products** tab; that tab shows **remaining inventory** per unit, while **sales-by-unit** is the same order list and the same counting as **Overview → TOP PRODUCTS**).

**Decisions / outcomes:** Centralized **`getProductSalesCounts`** / **`getTopProductBySales`** in **`adminRevenueStats.ts`** (same line-item → canonical product mapping as the former inline **`topProductsBySales`** on the revenue page). Dashboard uses **`getTopProductBySales(buildRevenueOrdersList())`** and shows **`UNIT (count)`** or **`—`** when there are no sales.

**Changes:** `src/utils/adminRevenueStats.ts` — new exports; `src/pages/admin/revenue/page.tsx` — **`topProductsBySales`** from **`getProductSalesCounts(orders)`**; `src/pages/admin/dashboard/page.tsx` — **TOP PRODUCT** row. This MEMORY entry.

---

## 2026-03-26 — Dashboard REVENUE card: Q4 tier + single-line StatsCard tiers

**Context:** User wanted **Q4** after **Q3** on the dashboard **REVENUE** stat card bottom tiers, and **tighter layout** so **Q1–Q4** stay on **one line**.

**Changes:** `src/pages/admin/dashboard/page.tsx` — fourth tier **`Q4`** using **`quarterlyRevenue.Q4`** (same **K** formatting as Q1–Q3; **`quarterlyRevenue`** already aggregates Oct–Dec). `src/pages/admin/components/StatsCard.tsx` — tier row uses **`flex w-full flex-nowrap gap-0.5 text-[7px] leading-tight`**, each tier **`flex-1 min-w-0 text-center truncate`** with **`title`** for full text on hover; applies to all stat cards with tiers (e.g. **CLIENTS** BLACK/RED/SILVER). This MEMORY entry.

---

## 2026-03-26 — StatsCard TOP PRODUCT: gray unit name, red count in parentheses

**Context:** User wanted only the **parentheses count** (e.g. **`(7)`**) in **red** on the dashboard **TOP PRODUCT** line; **unit name** (e.g. **NOIR**) stays **gray**.

**Changes:** `src/pages/admin/components/StatsCard.tsx` — for **`item.label === 'TOP PRODUCT'`**, value matching **`/^(.+)\s+(\(\d+\))$/`** renders name with **`getColorValue(item.color)`** (gray) and **`(\d+)`** span with **`#EB1C24`**; **`—`** or non-matching values use single gray span. This MEMORY entry.

---

## 2026-03-26 — Dashboard PENDING card: MESSAGES (unread priority)

**Context:** User wanted a **MESSAGES** line on the admin **Dashboard → PENDING** stat card **below AFFILIATE**, showing **unread priority message** volume.

**Decisions / outcomes:** Total = sum of **`unreadCount`** from **`getClientUnreadPriorityMessage(client)`** over **`visibleClients`** (same helper as Alerts / clients overview: profile fields + **`adminPriorityMessagesByClient`** localStorage). Row inserted **after** the first item whose label contains **`AFFILIATE`**; skipped if API **`pendingItems`** already includes **MESSAGES**. Value **red** when count **> 0**, else gray.

**Changes:** `src/pages/admin/dashboard/page.tsx` — import **`getClientUnreadPriorityMessage`**; **`basePendingCardItems`** + **`pendingCardItems`** merge. This MEMORY entry.

---

## 2026-03-26 — Admin Marketing: OFFERS tab → SPECIAL OFFERS

**Context:** User wanted the admin **Marketing** page tab label **OFFERS** renamed to **SPECIAL OFFERS**.

**Changes:** `src/pages/admin/marketing/page.tsx` — **`MARKETING_TABS`**, **`TAB_PANEL_LABELS`**, and **`activeTab`** checks use **`SPECIAL OFFERS`** instead of **`OFFERS`**. `src/pages/admin/dashboard/page.tsx` — **MARKETING** stat card line label updated to **SPECIAL OFFERS** for consistency. This MEMORY entry.

---

## 2026-03-26 — Admin client details: POINTS before affiliate media; expandable REVIEWS

**Context:** User wanted **loyalty points (all earned)** shown **before** the **photos** count on the client **details** affiliate-style panel, and the **reviews** panel to **expand like** **photos / videos / socials** with **content** under each metric.

**Changes:** `src/pages/admin/clients/page.tsx` — **`selectedTotalLoyaltyPointsEarned`**: sum **`pointsEarned`** on **`selectedRawOrders`**, else rounded **`subtotal`/`total`** per order, else **`loyaltyPoints`** on profile. Affiliate row grid **`grid-cols-4`**: first column **POINTS** (display only), then **PHOTOS / VIDEOS / SOCIALS** toggles unchanged. **`reviewsExpand`** state (**`total` | `media` | `pending`**); **TOTAL / MEDIA / PENDING** are buttons; expanded sections show filtered lists (**all** / **hasPhoto \|\| hasVideo** / **pending**) or empty copy. Reset **`reviewsExpand`** when **`selectedClientEmail`** changes. This MEMORY entry.

---

## 2026-03-26 — Client details: POINTS in header grid (not affiliate row)

**Context:** User wanted the **loyalty points** counter moved from the **affiliate** (photos/videos/socials) strip to the **top** stats row: **after ORDERS**, **before TOTAL SPENT**.

**Changes:** `src/pages/admin/clients/page.tsx` — profile card stats **`grid-cols-4`**: **ORDERS → POINTS → TOTAL SPENT → MEMBERSHIP** (tighter **`gap-2 sm:gap-4`**). Affiliate panel back to **`grid-cols-3`** (**PHOTOS / VIDEOS / SOCIALS** only). This MEMORY entry.

---

## 2026-03-26 — Admin fulfilled orders: DELIVERED at bottom per client

**Context:** User wanted **delivered** orders always **at the bottom** of the list on the admin **Revenue → Fulfilled orders** page.

**Changes:** `src/pages/admin/revenue/fulfilled-orders/page.tsx` — **`isDeliveredOrder`** (**`status === 'DELIVERED'`** or **`deliveredAt`** set). Per-client arrays sort with **non-delivered first**, then **delivered**; within each group **newest first** by **`date`**. This MEMORY entry.

---

## 2026-03-26 — Clients overview NEW column = unfulfilled orders

**Context:** User clarified that on **Clients → ALL**, the **NEW** column should mean **unfulfilled** orders: **not shipped or delivered yet**.

**Decisions / outcomes:** Shared **`isOrderUnfulfilled`**: excludes **CANCELED/CANCELLED**, **`canceledAt`**, **`deliveredAt`**, and statuses **DELIVERED**, **SHIPPED**, **FULFILLED**; everything else counts as unfulfilled. **`getClientRow`** (ALL tab) and **`getClientNewOrdersCount`** / **`getLastNewOrderTime`** (**`priorityMessages`**, Alerts) use the same rules; when **`userOrders_*`** has rows, counts come from that filter (else fall back to **`client.newCount`** from API). **NEW** header **`title`** tooltip documents meaning.

**Changes:** `src/utils/priorityMessages.ts`, `src/pages/admin/clients/page.tsx`. This MEMORY entry.

---

## 2026-03-26 — Client details stats row: even 4-column centering

**Context:** User wanted **ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP** on client details **horizontally centered** with **even spacing**; prior **grid-cols-4** alignment looked off.

**Changes:** `src/pages/admin/clients/page.tsx` — **`display: grid`**, **`repeat(4, minmax(0, 1fr))`**, **`justifyItems: 'center'`**, **`columnGap: clamp(6px, 3vw, 14px)`**; each metric **`flex flex-col items-center text-center`** with **`min-w-0 w-full`**, tight **`leading-tight`**, **`wordBreak`** on **TOTAL SPENT** label. This MEMORY entry.

---

## 2026-03-26 — Vercel build: TS6133 cartWishlistLoading setter, TS1355 dashboard `as const`

**Context:** **`npm run build`** (**`tsc --noEmit && vite build`**) failed on Vercel: **`setCartWishlistLoading`** unused in **`admin/clients/page.tsx`**; invalid **`as const`** on a ternary in **`admin/dashboard/page.tsx`** (**TS1355**).

**Changes:** **`clients/page.tsx`** — **`useState(false)`** destructuring only **`cartWishlistLoading`** (setter unused). **`dashboard/page.tsx`** — **`messagesRow.color`** typed as **`'text-red-500' | 'text-gray-500'`** instead of **`as const`** on the ternary expression. This MEMORY entry.

---

## 2026-03-26 — WORKERS dashboard card: 103px + summary metrics only

**Context:** User wanted the WORKERS stat card to match other cards’ **103px** items height and show **key metrics only** on the dashboard; full duties, daily tasks, hours, pay, etc. belong on **`/admin/workers`** only.

**Changes:** **`src/utils/adminWorkersDashboard.ts`** — replaced per-employee flattening with **`buildWorkersDashboardSummaryItems()`** (roster count line, truncated function/role line, comp mix hourly/salary/other, contacts on file, pointer to workers page). **`src/pages/admin/dashboard/page.tsx`** — removed taller WORKERS cap; all cards use **`DASHBOARD_CAPPED_STAT_ITEMS_MAX_PX` (103)**. This MEMORY entry.

---

## 2026-03-25 — Client stats row: real table + account route parity

**Context:** User said the four-metric row (**ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP**) still looked wrong and suspected another style was overwriting alignment, padding, or spacing after an earlier grid/table-div fix.

**Topics / diagnosis:** (1) **Overview** (`src/pages/admin/clients/page.tsx`) already used **`display: table` on `div`s**; that can still interact badly with nested layout in some cases, so switching to a semantic **`<table>`** with **`table-layout: fixed`**, **`<colgroup>`** four **25%** columns, **`td`** with **`minWidth: 0`** keeps equal column widths and centered copy. (2) **Standalone CLIENT DETAILS** (`src/pages/admin/clients/account/page.tsx`) still had **`grid-cols-3`** and **no POINTS** — if the user opens that URL, prior overview-only changes would look “unchanged.”

**Changes:** **`page.tsx` (clients)** — replaced the stats **div table** with **`<table role="presentation">`**, **colgroup**, **tbody/tr/td**, same typography and **6px** horizontal cell padding. **`account/page.tsx`** — **`totalLoyaltyPoints`** from **`userOrders_*`** (**`pointsEarned`** or rounded **subtotal/total**, else **`client.loyaltyPoints`**), same four columns in a matching fixed-layout table; membership label color **#000**, other labels **gray-600** equivalent (**#4b5563**).

**Conventions:** Prefer real **`<table>`** for “four equal columns, centered” admin stat rows when div-as-table is unreliable; keep **overview** and **account** client headers aligned when both show the same metrics.

---

## 2026-03-25 — Client stats row: no top rule + flex centering

**Context:** User asked to **remove the gray line** above **ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP** and said the **label/value text still looked horizontally off-center**.

**Changes:** **`src/pages/admin/clients/page.tsx`** — removed **`borderTop`** and **extra `paddingTop`** on the stats **`<table>`** (kept **`marginTop: 12px`** only). Each **`td`** wraps content in a **`display: flex; flexDirection: column; alignItems: center; width: 100%`** div; value/label **`p`** use **`width: 100%`** + **`textAlign: center`**; **`td`** padding **`0 6px`**. **`src/pages/admin/clients/account/page.tsx`** — same flex wrapper + **`td`** padding for the four-metric table.

---

## 2026-03-25 — Client stats row: CSS Grid for symmetric gutters

**Context:** User saw **asymmetric** space (more outside left of ORDERS than right of MEMBERSHIP; uneven gaps between columns) despite a fixed **`<table>`** with **25%** cols and **td** padding.

**Changes:** **`src/pages/admin/clients/page.tsx`** and **`account/page.tsx`** — replaced the stats **table** with **`display: grid`**, **`gridTemplateColumns: repeat(4, minmax(0, 1fr))`**, **`columnGap: 10px`**, **`width: 100%`**; **no** horizontal **padding** on cells (gutters come only from **columnGap**). Each metric is a **grid cell** with **`minWidth: 0`** and the same flex column stack for centered text.

**Rationale:** Table **%** widths plus **per-cell padding** can **round unevenly**; grid **1fr** splits leftover space equally after one uniform **gap**.

---

## 2026-03-25 — Client stats row: nudge 4px left

**Context:** User asked to move the whole **ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP** row **4px left**.

**Changes:** **`marginLeft: '-4px'`** on the stats **grid** wrapper in **`src/pages/admin/clients/page.tsx`** and **`src/pages/admin/clients/account/page.tsx`**.

---

## 2026-03-25 — Stats row: POINTS + TOTAL SPENT nudge 8px

**Context:** User increased the **translateX** nudge for the middle two columns (**2px → 4px → 8px**) until it reads clearly on screen.

**Changes:** **`transform: 'translateX(-8px)'`** on the **span-2** wrapper (POINTS + TOTAL SPENT) in **`src/pages/admin/clients/page.tsx`** and **`src/pages/admin/clients/account/page.tsx`**.

---

## 2026-03-26 — Worker roster: brand positions (10 roles)

**Context:** User specified **Frontal Slayer / brand** job positions for the worker roster: personal assistant, creative director, accountant, lawyer, graphic designer, photographer, videographer/editor, social media content planner/manager, makeup artist, hair stylist — with duties, pay, etc. on **`/admin/workers`**; dashboard card stays summary-only.

**Changes:** **`src/utils/adminWorkersDashboard.ts`** — **`ADMIN_DASHBOARD_WORKERS`** replaced with **10** entries matching those roles; each has **jobDuties**, **dailyTasks**, **scheduledHours**, **pay** placeholders, **contact** placeholders, optional **notes**; names remain **PLACEHOLDER — ROLE** until filled in. This MEMORY entry.

---

## 2026-03-26 — Fix: `buildWorkersDashboardSummaryItems` import binding not found

**Context:** Red error screen: named import **`buildWorkersDashboardSummaryItems`** from **`adminWorkersDashboard.ts`** not found (runtime / bundler).

**Changes:** **`buildWorkersDashboardSummaryItems`** logic moved into **`src/pages/admin/dashboard/page.tsx`** as a local function; **`adminWorkersDashboard.ts`** now exports only roster data (**`ADMIN_DASHBOARD_WORKERS`** + **`AdminDashboardWorker`** type). Dashboard imports **`ADMIN_DASHBOARD_WORKERS`** only. This MEMORY entry.

---

## 2026-03-26 — Worker roster: PA + customer service (Pending, email, priority messages)

**Context:** User wanted the **personal assistant** role to also cover approving/triaging **admin PENDING** (affiliate, reviews, etc.), **priority messages**, **email / customer service**, and related front-line work.

**Changes:** **`src/utils/adminWorkersDashboard.ts`** — first roster entry: **`role`** → **Personal assistant / customer service**; expanded **`jobDuties`** (PENDING tab, concierge/priority messages, client email/support); expanded **`dailyTasks`** (PENDING queues, email routing); **`notes`** on primary front line and owner sign-off on edge cases. This MEMORY entry.

---

## 2026-03-26 — Admin `/admin/workers`: card titles = brand `role`, not placeholder name

**Context:** User said workers page cards still didn’t reflect the **10 business roles**; root issue was UI using **`w.name`** (“PLACEHOLDER — …”) as the red **card title**, so **`role`** (the actual job) was buried.

**Changes:** **`src/pages/admin/workers/page.tsx`** — card **h2** = **`w.role`**; **POSITION n / total**; hire line shows **OPEN** + placeholder hint or **HIRE:** real name; intro + **single-line summary** built from **`ADMIN_DASHBOARD_WORKERS.map(role).join(' · ')`**; removed duplicate **ROLE** row in **dl**. **`adminWorkersDashboard.ts`** — JSDoc on **`name`** / **`role`**. This MEMORY entry.

---

## 2026-03-26 — Brand Jobs + applications ↔ Admin Workers

**Context:** User wanted **JOBS** in the **menu** (above Terms), a **Brand → Jobs** page with postings tied to the **10 worker roles**, full **apply** flow (resume, portfolio, etc.), and **Admin → Workers** cards that **expand** with **close X** to show **applicants per role**.

**Changes:**
- **`src/constants/brandMenu.ts`** — **`JOBS`** → **`/brand/jobs`** immediately **above** **TERMS OF SERVICE**; **`BRAND_SLUGS`** includes **`jobs`** (for shared constants).
- **`src/utils/jobApplicationsStorage.ts`** — **`brandJobApplications_v1`** localStorage: **`appendJobApplication`**, **`getJobApplicationsForJob`**, **`countApplicationsForJob`**, **`removeJobApplication`**; optional **`resumeDataUrl`** with quota fallback.
- **`src/pages/brand/jobs/page.tsx`** — lists **`ADMIN_DASHBOARD_WORKERS`**; **APPLY** opens modal (name, email, phone, LinkedIn, portfolio, other links, experience, résumé file ≤~1.5MB, cover letter); **`jobApplicationsUpdated`** event on submit; menu/header pattern aligned with brand/checkout **BRAND** tab.
- **`src/pages/admin/workers/page.tsx`** — cards are **buttons**; **application count** hint; **overlay** lists applicants with qualifications, links, cover letter, résumé open/download, **Remove**; **Escape** / backdrop / **×** close; link to **Brand → Jobs**.
- **`src/App.tsx`** — lazy **`BrandJobsPage`**, route **`/brand/jobs`**.
- **`src/pages/admin/dashboard/page.tsx`** — **WORKERS** card **activity** text mentions **Brand → Jobs** and **tap role** to review apps.
- **`src/pages/admin/components/StatsCard.tsx`** — optional title case **`jobs`** → **`/brand/jobs`**. This MEMORY entry.

---

## 2026-03-25 — Brand “Jobs” rebrand to Careers (`/brand/careers`)

**Context:** User asked to change **job** wording to **careers** in the brand area: **Brand > CAREERS**, not Jobs.

**Changes:**
- **`src/constants/brandMenu.ts`** — menu label **`CAREERS`**, route **`/brand/careers`**; **`BRAND_SLUGS`** uses **`careers`** instead of **`jobs`**.
- **`src/pages/brand/careers/page.tsx`** — same apply flow as former jobs page; component **`BrandCareersPage`**; breadcrumb **BRAND > CAREERS**; dialog id **`careers-apply-title`**. Removed **`src/pages/brand/jobs/page.tsx`**.
- **`src/App.tsx`** — lazy **`BrandCareersPage`**, route **`/brand/careers`**; **`Navigate`** redirect **`/brand/jobs` → `/brand/careers`** (replace).
- **`src/pages/admin/workers/page.tsx`** — link **Brand → Careers**, **`navigate('/brand/careers')`**.
- **`src/pages/admin/dashboard/page.tsx`** — WORKERS **DETAIL** / **activity** copy: **BRAND/CAREERS**, **BRAND → CAREERS**.
- **`src/pages/admin/components/StatsCard.tsx`** — title cases **`careers`** and legacy **`jobs`** → **`/brand/careers`**.
- **`jobApplicationsStorage`** / events unchanged (**`brandJobApplications_v1`**, **`jobApplicationsUpdated`**). This MEMORY entry.

---

## 2026-03-26 — Careers page chrome + 10 explicit wig-shop roles + APPLY styling

**Context:** User wanted **Brand > Careers** to match other **brand** pages (header icon styling, gray rule under title), remove intro and roster/hours/pay clutter above cards, **10 explicit** Frontal Slayer / online wig shop positions (not generic “lead stylist / ops” summaries), same roster intent on admin workers, and **APPLY** **below** each role card with **red text / white background / black border** like site outline buttons.

**Changes:**
- **`src/pages/brand/careers/page.tsx`** — Header aligned with **`brand/page.tsx`** (!important left icon sizes, 24px menu hit area, HOME path logic, **`clearAppAuth`** sign-out); mobile menu shell matches brand (560px / inner 490px, scroll region); main body = bordered card with **CAREERS** (Futura 12px red) + **`#e5e7eb`** rule; ten inner role cards (duties only, no schedule/pay); **APPLY** sibling under each card (outline style).
- **`src/utils/adminWorkersDashboard.ts`** — Roster copy rewritten for **e-commerce wig shop** (orders, listings, shoots, social, PA/CS, etc.); still **10** fixed roles with stable **`id`**s **1–10**.
- **`src/pages/admin/dashboard/page.tsx`** — WORKERS card: dropped truncated **FUNCTIONS** role string; **POSITIONS** row = **`N BRAND ROLES (CAREERS)`**.
- **`src/pages/admin/workers/page.tsx`** — Removed the **joined `role · role · …`** summary line under intro. This MEMORY entry.

---

## 2026-03-26 — Careers: per-role cards only; workers cards uppercase; remove roster intro

**Context:** User wanted **each job on its own card** on **`/brand/careers`** (no single large wrapping **CAREERS** card), **all text uppercase** on **admin workers** list cards, and removal of the intro block (**“Brand roster…”** / **“Replace placeholder…”**) above the first worker card.

**Changes:**
- **`src/pages/brand/careers/page.tsx`** — **CAREERS** title + gray rule sit **outside** any job card; each of the **10** roles is a **separate** bordered card + **APPLY** below it.
- **`src/pages/admin/workers/page.tsx`** — Intro paragraphs removed; roster cards use **`uppercase`** / **`textTransform: 'uppercase'`** and no **`normal-case`** on card body; removed unused **`useNavigate`**. Applicant overlay unchanged (**`normal-case`**). This MEMORY entry.

---

## 2026-03-26 — Admin workers: applicants inline accordion (no modal)

**Context:** User wanted worker cards to **toggle open in place** (like account rewards “explore benefits”), listing applicants **inside the card** with **×** close, instead of a **fullscreen/modal** popup.

**Changes:** **`src/pages/admin/workers/page.tsx`** — Removed fixed **`role="dialog"`** overlay. Each card: **tap header row** toggles expand/collapse; **HOURS / duties / tasks** sit in a **`<dl>` outside** the toggle button so reading doesn’t collapse; **×** (top-right) and **Escape** collapse; applicants panel **`normal-case`** below a divider; **`Remove`** still per applicant. This MEMORY entry.

---

## 2026-03-26 — Brand careers: inline apply (no modal); APPLY matches concierge submit

**Context:** User wanted **`/brand/careers`** **APPLY** to use an **inline expand/collapse** (not a modal), and the **APPLY** control’s **height / typography** to match **SUBMIT MESSAGE** on **Account → Concierge** (priority messages).

**Changes:** **`src/pages/brand/careers/page.tsx`** — Removed fullscreen apply dialog. **APPLY** toggles a bordered panel under the role card (same form as before); **×** + **Escape** close; **`toggleApplyForJob`** switches role or closes; submit success still auto-collapses after delay. **APPLY** uses the same classes/styles as Concierge **SUBMIT MESSAGE** (**`py-2`**, **`text-[11px]`**, **`font-semibold`**, **`Futura PT Medium`**, white bg, red text, black border, **`hover:bg-gray-50`**). Form **SUBMIT APPLICATION** remains the red filled primary. This MEMORY entry.

---

## 2026-03-26 — Careers/workers role titles: concierge section header; openings count

**Context:** User removed standalone **CAREERS** label/rule above the first job card on **`/brand/careers`**. Role titles (personal assistant, creative director, …) should use the **Concierge-style section header** (Futura 12px red, **gray bottom border**, **right icon**) — not **Covered By Your Grace**. Same for **admin workers** card titles. **POSITION 1 / 10** was wrong: it should reflect **openings for that role** (all **1** for now), not index in the roster.

**Changes:**
- **`src/components/RoleCardSectionHeader.tsx`** — Shared row: **`Futura PT Medium`** 12px **`#EB1C24`**, **`border-b border-gray-200`**, red-tinted **`/assets/NOIR/account-icon.svg`**; optional **`className`** (e.g. **`pr-10`**) when **×** overlaps.
- **`src/utils/adminWorkersDashboard.ts`** — Required **`openings: number`** (**`1`** on all ten roles).
- **`src/pages/brand/careers/page.tsx`** — Dropped top **CAREERS** block; role + apply form titles use **`RoleCardSectionHeader`**.
- **`src/pages/admin/workers/page.tsx`** — **`{openings} OPENING(S)`** line; role row + applications subhead use **`RoleCardSectionHeader`**; removed roster index **`POSITION n / total`**. This MEMORY entry.

---

## 2026-03-25 — Careers: full posting sections + page-wide uppercase; roster about/education

**Context:** User wanted **`/brand/careers`** role cards to show **hours, pay, required education, job duties, daily tasks, notes**, etc. **with** a real **“About the role”** narrative (not duties-only under that heading). **All text** on the careers page should be **uppercase**, including the inline apply panel (no **`normal-case`** there).

**Changes:**
- **`src/utils/adminWorkersDashboard.ts`** — Extended **`AdminDashboardWorker`** with **`aboutTheRole`** and **`requiredEducation`**; filled for all **10** roles.
- **`src/pages/brand/careers/page.tsx`** — Per role: **openings** line; sections **ABOUT THE ROLE**, **HOURS**, **PAY**, **REQUIRED EDUCATION**, **JOB DUTIES**, **DAILY TASKS**, **NOTES** (if present). **`relative z-10`** wrapper: **`uppercase`** + **`textTransform: 'uppercase'`**; removed **`normal-case`** from apply panel / form / success copy.
- **`src/pages/admin/workers/page.tsx`** — **`<dl>`** adds **ABOUT THE ROLE** and **REQUIRED EDUCATION** (after **PAY**, before **CONTACT**).

**Note:** Automated **`npm run build`** in-agent did not complete reliably in one session; verify locally.

---

## 2026-03-26 — Careers apply: full-screen card, new fields, checkout-style inputs

**Context:** User wanted **`/brand/careers`** apply flow to **replace** the job list (single visible card, like the **menu toggle**), not expand under one job. Form: add **SKILLS & EXPERIENCE** above résumé, **CURRENT LOCATION** above LinkedIn; all fields **square** with **checkout**-matching label/input/placeholder styling.

**Changes:**
- **`src/pages/brand/careers/page.tsx`** — **`APPLY`** calls **`openApply`** only; when **`applyJobId`** set, only the apply **`menu-toggle-card`** shows; header **BRAND > APPLY**, left **back** + in-card **×** close; **`handleBack`** closes apply when open. Checkout-like **`checkoutLabelStyle` / `checkoutInputStyle` / `checkoutTextareaStyle`** (36px inputs, **1.3px** black border, **Futura PT Book** 10px labels / 11px values, **#808080**). Email uppercased like checkout. Intro uses gray helper copy.
- **`src/index.css`** — **`.careers-apply-checkout-field`** placeholder + uppercase text for inputs/textareas.
- **`src/utils/jobApplicationsStorage.ts`** — Optional **`currentLocation`**, **`skillsAndExperience`** on **`JobApplication`** (backward compatible with old **`localStorage`** rows).
- **`src/pages/admin/workers/page.tsx`** — Applicant cards show **Location** and **SKILLS & EXPERIENCE** when present. This MEMORY entry.

---

## 2026-03-26 — Careers apply: SUBMIT APPLICATION matches APPLY button

**Context:** User wanted **SUBMIT APPLICATION** to use the **same button/text styling** and **below-main-card** placement as the **APPLY** control (outline red text, white fill, black border), not the previous red filled primary inside the card.

**Changes:** **`src/pages/brand/careers/page.tsx`** — Wrapped apply **menu-toggle-card** + submit row in **`flex flex-col gap-2`**. Form has **`id="careers-apply-form"`**; submit is **`type="submit" form="careers-apply-form"`** in the same **`px-0` / `marginTop` / `translateY`** wrapper as **APPLY**. Hidden when **`submitDone`**. This MEMORY entry.

---

## 2026-03-26 — Careers apply close: red close-icon (membership benefits)

**Context:** User wanted the apply toggle **×** to match the **red close** used on the **tier benefits / explore benefits** toggle (**`/account/membership`** **`showBenefitsModal`** header), not the black bordered text **×**.

**Changes:** **`src/pages/brand/careers/page.tsx`** — Replaced close control with **`/assets/close-icon.svg`** + same CSS **`filter`** as **`membership/page.tsx`** tier benefits modal; transparent **`button`** wrapper for **`aria-label`** and tap padding (**`p-2`**). This MEMORY entry.

---

## 2026-03-26 — Careers apply: REQUIRED EDUCATION dropdown above years

**Context:** User wanted **required education** as a **dropdown** on the careers apply form, **above** **years of relevant experience**.

**Changes:**
- **`src/pages/brand/careers/page.tsx`** — **`requiredEducation`** in form state; **`REQUIRED_EDUCATION_OPTIONS`** (HS/GED through JD, doctorate, certification-only, other); **`<select>`** with **`checkoutSelectStyle`** (36px, square, Futura, custom chevron); label **REQUIRED EDUCATION\***; validation + **`required`**; saved as **`educationLevel`** on submit.
- **`src/utils/jobApplicationsStorage.ts`** — Optional **`educationLevel`** on **`JobApplication`**.
- **`src/index.css`** — **`select.careers-apply-checkout-field`** uppercase + option font.
- **`src/pages/admin/workers/page.tsx`** — Applicant detail shows **Education:** when **`educationLevel`** set (above **Experience**). This MEMORY entry.

---

## 2026-03-26 — Workers: openings under role title; “opening available” copy

**Context:** User wanted the openings line on **`/admin/workers`** moved **above** the **OPEN — SET HIRE NAME…** / hire line **instead** of sitting above the role header — i.e. **role title first**, then openings, then hire status. Copy should read **“1 opening available”** on worker cards and careers (plural: **N openings available**); page uppercase styling applies on workers/careers.

**Changes:**
- **`src/pages/admin/workers/page.tsx`** — **`RoleCardSectionHeader`** first; then **`openingsLabel`**; then hire / applications lines. **`openingsLabel`**: **`1 OPENING AVAILABLE`** or **`${n} OPENINGS AVAILABLE`**.
- **`src/pages/brand/careers/page.tsx`** — Same **`openingsLabel`** strings (still below role header, above posting body). This MEMORY entry.

---

## 2026-03-26 — Account profile cloud persistence hardening (queued patch sync)

**Context:** User expected prior Supabase persistence work to cover **all account profile data** (photo + settings) plus cart/wishlist cloud sync/admin visibility, but still saw resets after navigation/browser close.

**Changes:**
- **`src/utils/profileSyncQueue.ts`** — New resilient profile patch queue: **`patchProfileWithRetryQueue`**, **`queueProfilePatch`**, **`flushQueuedProfilePatch`**. Failed profile PATCH writes are stored in **`pendingProfilePatch_v1`** and retried later.
- **`src/App.tsx`** — Flush queued profile patches on route change, sign-in state changes, and window focus (so pending photo/name/settings edits eventually reach Supabase when session/network returns).
- **`src/pages/account/page.tsx`** — Profile photo crop save now uses queued retry patching (instead of silent drop on API/session failure).
- **`src/pages/account/settings/page.tsx`** — Social/personal/notification profile writes now use queued retry patching; “Save my profile to cloud” reports queued state when immediate PATCH fails. This MEMORY entry.

---

## 2026-03-26 — Account settings/profile: prevent backend overwrite + instant name persistence

**Context:** User reported prior Supabase sync steps still did not persist profile updates; first/last name and profile photo could revert after navigation/refresh.

**Changes:**
- **`src/utils/syncFromApi.ts`** — `syncProfileFromApi` now normalizes snake_case fields and merges with existing `currentUser`, preserving non-empty local profile values when backend returns empty/null fields (including `profileImage`, names, socials, tier fields). Prevents cloud sync from wiping valid local profile data.
- **`src/pages/account/settings/page.tsx`** — First/last name inputs now persist immediately on `onChange` (in addition to `onBlur`) so edits are saved before route changes and not lost if blur doesn’t occur.

---

## 2026-03-26 — End-to-end profile image upload route + explicit save status

**Context:** User requested a stronger, working persistence fix: implement backend image upload and non-silent save states for account profile/settings.

**Changes:**
- **`api/profile-image.ts`** — New authenticated **POST** route that accepts image data URL, ensures/creates Supabase Storage bucket **`profile-images`**, uploads avatar at **`{user_id}/avatar.{ext}`** with upsert, writes returned public URL into **`profiles.profile_image`**, and returns `{ profileImage }`.
- **`src/utils/api.ts`** — Added **`uploadProfileImage(imageDataUrl)`** API helper.
- **`src/pages/account/page.tsx`** — Crop approve now uploads to storage and stores URL in `currentUser`/`registeredUsers`/`profileImage`; falls back to queued profile patch when upload/session fails; shows explicit `profileImageSaveMessage` feedback (`SAVING`, `SAVED`, `QUEUED`, `FAILED`).
- **`src/pages/account/settings/page.tsx`** — Added explicit `personalInfoSaveMessage` for name/profile saves (`SAVED`, `QUEUED`, `FAILED`) so save failures are no longer silent.

---

## 2026-03-26 — Profile overwrite fix: block fallback clobber + sanitize placeholders

**Context:** User still saw `profiles` values reverting (e.g. `first_name = EMPTY`) even after env setup. Root cause suspected: fallback minimal-profile upsert ran after transient sync failures, clobbering good cloud values.

**Changes:**
- **`src/utils/syncFromApi.ts`** — Added `didLastProfileSyncError()` flag; fallback creation now distinguishes true sync errors vs missing profile. Also removed invented fallback payload defaults (`firstName/email-prefix`, default profile image path) from `buildProfilePayloadForBackend` to avoid cloud overwrite with placeholders.
- **`src/components/AccountRouteGuard.tsx`**, **`src/pages/lobby/page.tsx`**, **`src/pages/sign-in/page.tsx`** — Only run fallback `patchProfile(buildProfilePayloadForBackend(minimal))` when last sync did **not** error.
- **`api/profile.ts`** — Sanitize sentinel text (`EMPTY`, `NULL`, `N/A`, `NA`, blank) to `null` for `first_name`, `last_name`, `profile_image` on PATCH/upsert.
- **`supabase/migrations/20260326120000_normalize_profile_placeholders.sql`** — One-time cleanup migration to null out existing placeholder values.

---

## 2026-03-26 — Account photo status: popup only (remove inline text)

**Context:** User wanted photo save messages removed from below the profile image because they disrupt layout; status should use popup styling instead.

**Changes:** **`src/pages/account/page.tsx`** — Removed inline `profileImageSaveMessage` text under CHANGE/RESET. Added `showProfileImageStatusPopup` modal (marble popup style consistent with account popups) with title **PROFILE PHOTO**, message text, and **OK** button. Photo save flow now calls `openProfileImageStatusPopup(...)` for saved/queued/failed states.

---

## 2026-03-26 — Settings page: remove Save-to-cloud / Sync-account blocks

**Context:** User requested removal of all text/buttons between the main settings card and **DELETE ACCOUNT** because **SAVE MY PROFILE TO CLOUD** / **SYNC MY ACCOUNT** were not functioning reliably and cluttered UI.

**Changes:** **`src/pages/account/settings/page.tsx`** — Removed the two admin-only blocks (save profile to cloud + sync account, helper text, password input). Deleted related state, imports, and handlers (`handleSaveProfileToCloud`, `handleSyncAccount`, sync messages/loading/password input) so build remains clean.

---

## 2026-03-26 — Photo status popup: auto-close successes only

**Context:** User requested photo status popup UX tweak: successful statuses should auto-close (~1.5s), failures should remain manual-close.

**Changes:** **`src/pages/account/page.tsx`** — Added `useEffect` timer for profile photo popup that auto-closes when message includes `SAVED` after 1500ms; queued/failed states remain manual-close via OK or backdrop.

---

## 2026-03-26 — Mobile-only debugging preference (explicit)

**Context:** User requested tracing guidance tailored for **mobile device only** and asked to stop receiving desktop-browser-first debugging prompts for this project phase.

**Changes:** Added explicit motherboard core note that the active build/debug target is **mobile-only** until desktop phase later. Future troubleshooting instructions should prioritize mobile device flows first.

---

## 2026-03-26 — Mobile account overwrite tracing UI (in-page debug log)

**Context:** Across this conversation, user priorities were: careers/workers UI updates, then persistent Supabase account sync hardening (profile names/photo/cart/wishlist/admin visibility), and repeated fixes for `first_name`/`profile_image` reverting to null/placeholder values. User explicitly requires **mobile-first debugging** and asked for direct overwrite tracing because values sometimes save correctly then revert.

**Topics covered (conversation so far):**
- Careers/workers updates: uppercase styling, richer role details, openings copy/location, apply form UX and fields, close icon, submit styling.
- Supabase persistence hardening: queued profile patch retry, storage-based photo upload route, sync merge protections, fallback-clobber guards, placeholder normalization migration, settings cleanup, popup-only photo statuses, success auto-close behavior.
- Mobile-only troubleshooting preference captured in motherboard/core and used for debugging direction.

**Latest decision/outcome:** Add **mobile-visible debugging directly on the account profile page** so overwrite events can be observed in-app without relying on desktop-first browser workflows.

**Changes:** **`src/pages/account/page.tsx`**
- Added `ProfileDebugEvent` log model and persistent debug store (`profileDebugEvents_v1` in localStorage).
- Added `captureProfileSnapshot(...)` diffing for key profile fields (`email`, `firstName`, `lastName`, `profileImage`) to detect when local account state changes.
- Instrumented account flows: initial mount/load, user/profile image state changes, photo crop/upload success/fallback/failure, photo reset.
- Added passive tracing on mobile via `storage` + `focus` listeners and a 1.5s polling watcher to catch silent/background overwrites.
- Added `PROFILE DEBUG` button on account profile and a marble-style popup (`PROFILE DEBUG (MOBILE)`) listing recent events, with `CLEAR LOG` and `CLOSE`.

**Conventions:** Continue prioritizing mobile-first, in-app traceability for profile persistence/overwrite issues before desktop-centric debugging steps.

---

## 2026-03-26 — Vercel-only profile reset guard (preserve existing on fallback)

**Context:** User reported an important split: local Vite admin account behaves correctly, but Vercel/non-local keeps resetting **profile fields** (name/photo) while cart and other local data remain stable. This indicates the overwrite is in cloud profile/session recovery flow, not generic local storage for cart.

**Decision/outcome:** Harden fallback profile recovery so transient Vercel auth/profile-sync misses cannot overwrite existing profile values with defaults/empties.

**Changes:** **`src/utils/syncFromApi.ts`**
- `syncProfileFromApi()` now checks token presence when `getProfile()` returns `null`:
  - missing token => mark `lastProfileSyncErrored = true` (treat as sync error; avoid clobber fallback behavior)
  - token exists with null profile => non-error (likely no row yet)
- `applyMinimalUserToStorage()` now preserves existing same-email values for key profile fields (`first/last name`, `profile image`, socials, birthday) when fallback values are empty/default-like.
- Fallback storage write for `profileImage` now prefers preserved/user value first and only uses `/assets/profile-thumb.png` as true last resort.

**Conventions:** For mobile/Vercel troubleshooting, treat profile resets as a session-recovery/fallback-clobber class of issue first, especially when cart/wishlist are unaffected.

---

## 2026-03-26 — Mobile profile debug export (one-tap copy log)

**Context:** User confirmed local Vite admin profile persists correctly while Vercel resets profile fields and requested the promised one-tap export so mobile debug traces can be pasted back quickly for overwrite forensics.

**Decision/outcome:** Added an in-app mobile **copy debug log** action in account profile debug popup, including current snapshot + full event trace.

**Changes:** **`src/pages/account/page.tsx`**
- Added debug export helpers:
  - `readCurrentProfileSnapshot()`
  - `buildProfileDebugExportText()`
  - `copyProfileDebugLog()` (clipboard-first with `window.prompt` fallback)
- Added `COPY LOG` button in `PROFILE DEBUG (MOBILE)` popup.
- Added copy feedback state/message (`DEBUG LOG COPIED.`, `COPY PROMPT OPENED.`, `COPY FAILED.`).
- Export payload includes timestamp, current URL, current profile snapshot (`email`, `first/last`, `profileImage`), and full event log (newest first) so overwrite points can be identified from mobile production sessions.

**Conventions:** Keep mobile-first forensic tooling inside the account page UI so users can capture production/Vercel behavior without desktop-only tooling.

---

## 2026-03-26 — Safari reopen sign-out fix (server session cookie routes)

**Context:** User confirmed Chrome production flow is now stable, but Safari still signs out on close/reopen and can reset account flow behavior. Existing frontend already called `/api/session-cookie` and `/api/session-restore`, but those backend routes were missing in this repo.

**Decision/outcome:** Implemented the missing Vercel API endpoints so Safari can restore Supabase session from an HttpOnly refresh-token cookie after browser reopen.

**Changes:**
- **`api/session-cookie.ts`** (new)
  - `POST` endpoint to set/clear signed HttpOnly cookie `baw_session_rt`.
  - Requires Bearer auth (`getAuthUser`) when setting cookie.
  - Supports `{ clear: true }` for explicit sign-out cookie removal.
  - Uses `SESSION_COOKIE_SECRET` HMAC signature for tamper protection.
- **`api/session-restore.ts`** (new)
  - `GET` endpoint reads/verifies signed cookie, calls `supabase.auth.refreshSession({ refresh_token })`, rotates cookie, and returns fresh session payload.
  - Clears cookie on invalid signature/session mismatch/refresh failure.
  - Enables frontend `tryServerSessionRestore()` fallback to actually work on Safari.

**Conventions:** Keep Safari restore path server-backed and cookie-based (HttpOnly + signed token), with explicit clear on sign-out only.

---

## 2026-03-26 — Profile image hardening: Storage URL only (no data:image cloud persistence)

**Context:** After overwrite/session fixes, user requested a final hardening patch so `data:image/...` blobs are never treated as final cloud profile image in production; persistence should be URL-based via Storage endpoint only.

**Decision/outcome:** Enforced URL-only profile image persistence at both client queue and backend API layers.

**Changes:**
- **`src/utils/profileSyncQueue.ts`**
  - Added `sanitizeProfilePatch(...)` to strip `profileImage` / `profile_image` values when they are `data:image/...`.
  - `queueProfilePatch(...)` now sanitizes before writing queue.
  - `patchProfileWithRetryQueue(...)` now sanitizes before PATCH/queue; returns `false` if nothing valid remains.
- **`api/profile.ts`**
  - `normalizeProfileText(...)` now rejects `data:image/...` (returns `null`) so backend never writes base64 image blobs into `profiles.profile_image`.

**Conventions:** Profile photo cloud persistence path is now strictly `/api/profile-image` (Storage upload) returning URL; profile PATCH path is text/url-only and blocks raw image data.

---

## 2026-03-26 — First-name reset fix + ayoteenz-only birthday edit for admin tracing

**Context:** User reported admin first name keeps resetting to `ayoteenz` while last name saves correctly, and requested ability to edit birthday for `ayoteenz` admin only to validate profile trace/display on admin client detail.

**Decision/outcome:** Removed fallback email-prefix first-name injection and enabled birthday editing only for `ayoteenz` admin account in account settings.

**Changes:**
- **`src/utils/syncFromApi.ts`**
  - In `buildMinimalUserFromSupabaseSession(...)`, changed fallback `firstName` from `email.split('@')[0] || 'User'` to empty string when metadata first name is absent.
  - Prevents session-restore fallback path from overwriting saved profile first name with `ayoteenz`.
- **`src/pages/account/settings/page.tsx`**
  - Added `canEditAdminBirthday = isAyoteenzAdminAccount(userData)`.
  - Birthday input now `readOnly={!canEditAdminBirthday}` and only persists on change/blur when `canEditAdminBirthday` is true.
  - Keeps birthday locked for non-`ayoteenz` users while allowing admin tracing test flow.

**Conventions:** Avoid placeholder/name synthesis from email in fallback profile paths; preserve explicit saved profile identity fields.

---

## 2026-03-26 — Safari reopen persistence hardening (server-restore retries in guards)

**Context:** User reported Safari still signs out on close/reopen and sometimes mounts account with `NO_NAME` + default profile image before later recovery, while Chrome flow stays stable.

**Decision/outcome:** Added extra Safari/session-restore hardening so account/sign-in paths proactively trigger server cookie restore whenever Supabase session is missing at startup.

**Changes:**
- **`src/components/AccountRouteGuard.tsx`**
  - On missing Supabase session, now attempts `tryServerSessionRestore()` first (which reloads on success), before falling back to local auth-backup restore.
- **`src/pages/sign-in/page.tsx`**
  - In sign-in boot session check, if no Supabase session found, now also triggers `tryServerSessionRestore()`.
- **`src/utils/sessionRestore.ts`**
  - Added `keepalive: true` for session cookie set/clear fetches to improve reliability when page is closing/backgrounded (Safari-sensitive timing).

**Conventions:** For Safari auth continuity, treat missing client session as recoverable by server cookie path first, then local backup fallback.

---

## 2026-03-26 — Safari close/reopen persistence fix (first-party session routes + compact profile cookie merge)

**Context:** User confirmed Safari still signs out / resets account fields after close+reopen on both local Vite and Vercel while Chrome remains stable. Debug log showed account mounts with `NO_NAME` + default photo before later recovery.

**Decision/outcome:** Hardened Safari flow in two places: force first-party API path for session-cookie restore and preserve key profile identity fields in a tiny dedicated cookie that is merged on restore.

**Changes:**
- **`src/utils/sessionRestore.ts`**
  - Switched restore/register/clear endpoints to same-origin routes (`/api/session-restore`, `/api/session-cookie`) instead of `VITE_API_BASE` absolute host for this auth-cookie path.
  - Keeps Safari cookie traffic first-party (especially important on local dev where cross-site cookies are blocked).
- **`src/utils/adminAuth.ts`**
  - Added compact profile cookie `baw_auth_p` persisted alongside auth backup with: `email`, `firstName`, `lastName`, `birthday`, `profileImage` (non-data URL only).
  - On backup restore, merges missing/placeholder profile fields from this compact cookie back into `currentUser` for same email.
  - Clears profile cookie on explicit auth clear/sign-out (`clearAuthBackup`, `clearAppAuth`).

**Conventions:** For Safari resilience, keep auth/session restore first-party and maintain a slim, non-base64 profile identity snapshot separate from large backup payloads.

---

## 2026-03-26 — Fix duplicate default export in session restore APIs

- **Context:** User reported repeated Vite/esbuild internal server errors from `api/session-restore.ts` showing `Multiple exports with the same name "default"` and `handler has already been declared`.
- **Topics covered:** Inspected `api/session-restore.ts` and confirmed the file had two full route implementations concatenated together. Also checked `api/session-cookie.ts` and found the same duplicate-handler pattern.
- **Decisions / outcomes:** Kept the current signed-cookie implementation (`baw_session_rt`, HMAC-signed payload path) and removed the older duplicate appended implementations to restore a single valid default export per API file.
- **Changes:** Updated `api/session-restore.ts` and `api/session-cookie.ts` by deleting the duplicate second import/handler blocks that caused duplicate symbol and default export errors.
- **Conventions:** For these API routes, maintain exactly one `export default` handler per file and avoid mixing two alternate implementations in the same module.

---

## 2026-03-26 — Final account-route restore guard after duplicate API fix

- **Context:** In this chat, user first reported repeated Vite/esbuild failures from duplicate `default` export / duplicate `handler` declarations in `api/session-restore.ts` (and still failing after initial fix), then asked to check motherboard context and apply the promised final guard to prevent account fallback flash while debugging Chrome/Safari persistence and profile input retention issues.
- **Topics covered:** Re-read motherboard context, confirmed prior session-restore hardening timeline, removed duplicate concatenated handlers in both session cookie API files, then strengthened account-route startup flow so server cookie restore attempt is awaited before fallback path runs.
- **Decisions / outcomes:** Keep signed-cookie server restore implementation as canonical, and enforce a first-pass, awaited restore attempt in the account guard to reduce stale fallback rendering paths that can surface `NO_NAME`/default-profile flashes before restore completes.
- **Changes:** 
  - `api/session-restore.ts`: removed duplicate second import+`export default handler` block.
  - `api/session-cookie.ts`: removed duplicate second import+`export default handler` block.
  - `src/components/AccountRouteGuard.tsx`: added final guard with per-tab session key (`baw_server_restore_attempted_v1`) and awaited `tryServerSessionRestore()` before proceeding to local/session fallback logic.
- **Conventions:** For auth restore routes and guards, keep one handler per API file and prioritize awaited server session-restore before local fallback on protected account pages.

---

## 2026-03-26 — Birthday flow reconnect for admin client details

- **Context:** After prior fixes in this chat (duplicate session API handlers and final account-route restore guard), user reported another disconnected flow: birthday entered in Account Settings was not showing on Admin Clients details.
- **Topics covered:** Traced settings save path and admin details render path. `account/settings` persists birthday using the `birthday` key, while admin client details displays `selectedBirthday = formatBirthday(selectedClient)`.
- **Decisions / outcomes:** Kept storage/API key as `birthday` (already aligned with profile mapping) and fixed the display formatter so admin details reads modern birthday field values instead of only legacy birthDate parts.
- **Changes:** Updated `src/utils/formatBirthday.ts` to:
  - Read `birthday` first (then `birthDate` fallback).
  - Parse common stored formats (`MM/DD/YYYY`, `MM-DD-YYYY`, `YYYY-MM-DD`, compact `MMDDYYYY`) and render as `MONTH DAY, YEAR`.
  - Retain fallback support for legacy `birthMonth`/`birthDay`/`birthYear`.
- **Conventions:** For profile fields, prefer canonical `birthday` in client/API/UI mappings; keep legacy keys only as compatibility fallback.

---

## 2026-03-26 — Hard lock against fallback profile overwrite on re-signin/reopen

- **Context:** User reported persistence still breaks after sign-out/sign-in (Chrome + Safari) and Safari can still sign out on close; requested the promised hard lock so fallback minimal session user cannot overwrite richer stored account/profile fields.
- **Topics covered:** Reviewed fallback path in `applyMinimalUserToStorage(...)` used when profile sync fails but session exists; this path could still write minimal data to `currentUser` and flatten identity fields during recovery races.
- **Decisions / outcomes:** Added an explicit guard that skips fallback write entirely when same-email stored profile already contains richer identity data than incoming minimal payload.
- **Changes:** `src/utils/syncFromApi.ts`
  - In `applyMinimalUserToStorage(...)`, added richer-profile detection for same-email user across name, birthday, and non-default profile image.
  - If stored data is richer and incoming fallback is weaker, function now **does not overwrite `currentUser`**; it only keeps `isSignedIn=true`, preserves existing profile image, and persists auth backup.
- **Conventions:** Fallback/session-recovery writes must never down-level an existing same-email profile; preserve richer local identity fields over minimal session metadata.

---

## 2026-03-26 — Admin client details linkage audit + phone field mapping fix

- **Context:** User asked to confirm end-to-end linkage for all Admin Clients details panels/tabs (phone, socials, reviews, affiliate, totals, orders, messages, etc.) and ensure fields fire/store correctly, following the birthday reconnect validation.
- **Topics covered:** Audited `src/pages/admin/clients/page.tsx` data sources and corresponding API/util mappings (`src/utils/api.ts`, `api/admin/clients.ts`, `api/admin/orders.ts`, `api/admin/activity.ts`, `src/utils/formatBirthday.ts`).
- **Decisions / outcomes:** Confirmed most panel sources are wired as intended (profile from `profiles` via `fromProfileRow`, orders/cart/wishlist/activity via admin APIs when UUID is present, birthday formatter now reading `birthday`). Identified a concrete mismatch in the details `PHONE` row.
- **Changes:** `src/pages/admin/clients/page.tsx` — updated details phone render to use `phoneNumber` / `phone_number` fallback before legacy `phone`, preventing blank phone display when profile data is camel/snake-case mapped.
- **Conventions:** In admin details UI, prefer canonical profile keys (`phoneNumber`, `birthday`, camelCase profile fields) with legacy aliases only as fallback.

---

## 2026-03-26 — New triangulation: sign-out/sign-in race hardening for persistence

- **Context:** User reported no practical change after previous guard and requested a different debugging strategy to triangulate why settings data appears unsaved after sign-out/sign-in and why Safari can still sign out on close.
- **Topics covered:** Identified two likely race points: (1) sign-out clearing auth before queued profile/settings patches flush, and (2) sign-in redirect racing ahead of server cookie registration needed for Safari reopen restore.
- **Decisions / outcomes:** Added explicit await points + debug markers on these race edges instead of only merge-guard logic.
- **Changes:**
  - `src/pages/account/page.tsx`
    - `handleSignOut` is now async.
    - Attempts `flushQueuedProfilePatch()` before Supabase sign-out and auth clear.
    - Added auth debug log markers (`signOut:start`, flush result, clear completion).
    - Awaits `supabase.auth.signOut()` (instead of fire-and-forget).
  - `src/pages/sign-in/page.tsx`
    - Awaits `registerServerSessionCookie(...)` before redirect in both primary and fallback sign-in paths.
    - Attempts `flushQueuedProfilePatch()` immediately after successful sign-in before redirect.
    - Added auth debug log markers around cookie registration and queue flush attempts.
- **Conventions:** Treat sign-out/sign-in persistence as a sequencing problem first: flush pending profile writes before auth clear, and complete session-cookie registration before post-login navigation (Safari-sensitive).

---

## 2026-03-26 — Birthday fallback hardening + begin server-backed clients tab migration

- **Context:** User requested execution of the next step (reduce localStorage-only dependencies) and reported birthday still not showing for ayoteenz on Admin Clients details despite being present in Account Settings.
- **Topics covered:** Hardened birthday source resolution in details view and started server-backed migration for Admin Clients review metrics.
- **Decisions / outcomes:** 
  - Birthday display now resolves from richer same-email sources (selected row → currentUser → registeredUsers) before rendering, preventing missing birthday when selected client row is stale/incomplete.
  - Reviews metrics on Admin Clients now prefer `/api/admin/reviews` aggregation by email (cross-browser/device), with localStorage as fallback only when server data is unavailable.
- **Changes:** `src/pages/admin/clients/page.tsx`
  - `selectedBirthday` computation now includes same-email fallback lookup from `currentUser` and `registeredUsers`.
  - Imported `getAdminReviews`, added `adminReviewCountsByEmail` state, fetched/aggregated server review counts in `useEffect`, and wired counts into `getReviewsTabRow` + `countAccountSubmittedReviews`.
  - Earlier phone field mapping fix remains in place (`phoneNumber`/`phone_number` fallback).
- **Changes:** `src/utils/syncFromApi.ts`
  - Added auth debug marker when hard-lock skip triggers in `applyMinimalUserToStorage(...)`, improving triangulation visibility for fallback-overwrite prevention.
- **Conventions:** For admin client details, treat server-backed API data as primary and localStorage values as resilience fallback; for birthday/identity display, always fallback to same-email current session data when row snapshot is incomplete.

---

## 2026-03-26 — Manual-only sign-out gate (FashionNova-style persistence intent)

- **Context:** User asked whether sign-in/out flow was investigated for stricter persistence so users stay signed in across browser close/reopen and only sign out when manually pressing sign-out controls.
- **Topics covered:** Audited auth event flow around Supabase `SIGNED_OUT`, explicit sign-out button path, backup restore, and server cookie restore.
- **Decisions / outcomes:** Added an explicit **manual sign-out gate** so automatic/unexpected Supabase signed-out events do not immediately force signed-out app state.
- **Changes:**
  - `src/utils/adminAuth.ts`
    - Added `markManualSignOutInProgress()` and `consumeManualSignOutFlag()` (session-scoped flag).
  - `src/pages/account/page.tsx`
    - Explicit sign-out path now sets manual sign-out flag before calling `supabase.auth.signOut()`.
  - `src/utils/supabase.ts`
    - `onAuthStateChange('SIGNED_OUT')` now checks manual flag:
      - manual sign-out => allow sign-out flow
      - non-manual sign-out => restore from backup and trigger server session-restore attempt (`tryServerSessionRestore`) instead of dropping session.
- **Conventions:** Enforce manual-only sign-out semantics: unexpected `SIGNED_OUT` events should auto-recover session/auth when possible; only explicit user intent should fully sign out.

---

## 2026-03-26 — Settings phone input added and wired to admin client details

- **Context:** User requested adding a phone-number input under Birthday in Account Settings and ensuring it reflects correctly in Admin Clients details.
- **Decision/outcome:** Added a dedicated phone field in settings personal info and wired persistence through local + backend profile sync paths.
- **Changes:** `src/pages/account/settings/page.tsx`
  - Added `phoneNumber` state.
  - Hydrates phone from `userData.phoneNumber` / `phone_number` / `phone`.
  - Added `PHONE NUMBER` input directly below `BIRTHDAY`.
  - Extended `persistPersonalInfo(...)` to include `phoneNumber` and `phone_number`.
  - Sends `phoneNumber` in queued backend patch payload (`patchProfileWithRetryQueue`).
  - Updates `currentUser` and `registeredUsers` with both camelCase/snake_case phone keys.
- **Linkage:** Admin Clients details phone row already reads `phoneNumber`/`phone_number` (with legacy `phone` fallback), so the new settings input now feeds the correct client-details display path.

---

## 2026-03-26 — Visible SIGNED_OUT gate lines + hidden-state profile flush

- **Context:** User asked to proceed with explicit visible auth gate lines and reported ongoing sign-out/reset behavior, suspecting local storage is not reaching Supabase/session restore reliably.
- **Decision/outcome:** Added exact debug lines in auth log and an extra hidden-state profile queue flush to improve Safari close-path persistence.
- **Changes:**
  - `src/utils/supabase.ts`
    - On auth `SIGNED_OUT`, now logs:
      - `SIGNED_OUT accepted (manual)` when explicit sign-out flag is consumed.
      - `SIGNED_OUT blocked (auto-recover)` when non-manual sign-out is intercepted.
  - `src/main.tsx`
    - On `visibility_hidden`, now also attempts `flushQueuedProfilePatch()` and logs `visibility_hidden → flushQueuedProfilePatch attempted`.
- **Conventions:** Keep auth state transitions observable in the in-app debug panel; on browser-hide/close path, attempt both auth backup persistence and queued profile flush before suspension.

---

## 2026-03-26 — Phone format standardization (XXX-XXX-XXXX) in settings + client details

- **Context:** User requested hyphen phone formatting (`901-237-8945`) during typing and storage/display across settings and admin client details.
- **Decision/outcome:** Standardized phone formatting to `XXX-XXX-XXXX` at input and display layers.
- **Changes:**
  - `src/pages/account/settings/page.tsx`
    - Added `formatPhoneWithHyphens(...)`.
    - Phone field now formats live as user types and stores formatted value via `persistPersonalInfo`.
    - Initial hydrate for phone now normalizes existing values to hyphen format.
  - `src/pages/admin/clients/page.tsx`
    - Added `formatPhoneWithHyphens(...)`.
    - Client details `PHONE` row now displays normalized hyphen format from `phoneNumber` / `phone_number` / `phone`.
- **Conventions:** Keep phone presentation/storage consistent in `XXX-XXX-XXXX` across account settings and admin client details, regardless of legacy raw formats.

---

## 2026-03-26 — Auth debug panel copy button for easy sharing

- **Context:** User requested a one-tap copy action in `?auth_debug=1` panel similar to profile debug export, to share logs quickly.
- **Decision/outcome:** Added `Copy debug` action to Auth Debug Panel with clipboard-first behavior and prompt fallback.
- **Changes:** `src/components/AuthDebugPanel.tsx`
  - Added export builder for full auth debug payload (timestamp, URL, live snapshot keys, recent log lines).
  - Added `Copy debug` button in panel actions.
  - Added copy status feedback text: `DEBUG LOG COPIED.`, `COPY PROMPT OPENED.`, `COPY FAILED.`.
- **Conventions:** Keep mobile/debug forensics one-tap where possible; include both snapshot state and chronological event log in exported debug payloads.

---

## 2026-03-26 — Debug export analysis led to auth self-heal + robust cookie parsing

- **Context:** User shared auth debug exports. Snapshot showed backup/session artifacts present (`cookie_baw_auth_b`, `ls_baw_auth_backup`, `ls_currentUser`, `ls_isSignedIn`) while logs still repeatedly reported `lsBackup=false cookieBackup=false`, indicating restore path inconsistency.
- **Decision/outcome:** Hardened backup cookie parsing and added self-healing restore behavior so auth remains signed-in even when one storage signal is temporarily missing/inconsistent.
- **Changes:** `src/utils/adminAuth.ts`
  - Replaced backup cookie regex read with deterministic split/parse in `readBackupFromCookie()` for improved robustness.
  - In `ensureAuthRestoredFromBackup()` added self-heal steps:
    - if `currentUser` exists but `isSignedIn` dropped → force `isSignedIn=true`.
    - if signed/current exists but backup missing → immediately re-seed backup via `persistAuthBackup()`.
  - Added auth debug log lines for self-heal actions/errors so `?auth_debug=1` explicitly shows recovery events.
- **Conventions:** Treat auth continuity as multi-source: when `currentUser` and sign-in intent exist, heal missing backup flags/cookies proactively instead of waiting for a full restore branch.

---

## 2026-03-26 — Reopen bootstrap: promote existing Supabase session into app auth

- **Context:** User shared fresh debug exports showing improved backup behavior before close, but still needing manual sign-in after browser reopen. Logs indicated early restore path could still start with backup absent (`hadLs=false/hadCookie=false`) before app auth flags are restored.
- **Decision/outcome:** Added startup rehydration gate that converts an already-available Supabase session into app auth state immediately on boot.
- **Changes:** `src/main.tsx`
  - Added boot-time `supabase.auth.getSession()` check after client init.
  - If session user exists and app `isSignedIn()` is false, now:
    - builds minimal app user from session,
    - applies to storage via `applyMinimalUserToStorage(...)`,
    - dispatches `signInStateChanged=true`,
    - writes debug marker: `boot: promoted existing Supabase session into app auth`.
  - Added error debug markers for failed session read/promotion.
- **Conventions:** On reopen, treat existing Supabase session as authoritative and proactively hydrate app auth flags before route guards can redirect to sign-in.

---

## 2026-03-26 — Pre-render auth bootstrap gate (wait before routing)

- **Context:** User shared new debug exports showing repeated early `restore ... rawLen=0` checks and still needing manual sign-in on reopen, with no clear boot-promotion marker in the captured log.
- **Decision/outcome:** Moved auth bootstrap to a pre-render async gate so session promotion/restore runs before app routes and guards render.
- **Changes:** `src/main.tsx`
  - Added `bootstrapAuthBeforeRender()`:
    - if already signed in: log and continue.
    - else read Supabase `getSession()`, promote session user into app auth (`applyMinimalUserToStorage`) + dispatch signed-in event.
    - if no session, attempts `tryServerSessionRestore()` and logs result.
  - App render (`ReactDOM.createRoot(...).render`) now runs in `bootstrapAuthBeforeRender().finally(...)`, ensuring boot auth attempt happens first.
  - Added explicit boot debug markers:
    - `boot: app already signed in`
    - `boot: promoted existing Supabase session into app auth`
    - `boot: no session from getSession, trying server restore`
    - `boot: tryServerSessionRestore=ok|miss` (+ error variants)
- **Conventions:** For reopen/session continuity, run auth bootstrap before routing/guards so restore has first chance and users are not prematurely pushed into sign-in flow.

---

## 2026-03-26 — Dual-track hardening: startup proof logs + account cloud rehydrate

- **Context:** User explicitly asked whether both issues are being fixed together (forced sign-out and profile data reset on sign-back-in) and shared another debug export still missing clear boot marker evidence.
- **Decision/outcome:** Added explicit boot-start debug marker and account-page cloud rehydrate sync to address both auth continuity and profile restoration.
- **Changes:**
  - `src/main.tsx`
    - Added `boot:start` debug log at the beginning of pre-render bootstrap so startup path execution is unambiguous in `?auth_debug=1`.
  - `src/pages/account/page.tsx`
    - Added mount-time Supabase session check + `syncAllFromApi()` rehydrate when session exists.
    - On successful sync, refreshes `userData` + profile image from updated `currentUser`.
    - Adds debug marker: `account: syncAllFromApi rehydrated profile on mount`.
- **Conventions:** Treat auth continuity and profile persistence as coupled: preserve session at boot and always rehydrate account identity from cloud when account opens under a valid session.

---

## 2026-03-26 — Added explicit server-cookie/restore status logging

- **Context:** User shared repeated auth debug exports still showing restore misses before sign-in, with no clear evidence of session-cookie register/restore HTTP outcomes.
- **Decision/outcome:** Added explicit status/error logs for session-cookie registration and session-restore fetch so failures can be pinpointed (network/status/token-shape).
- **Changes:** `src/utils/sessionRestore.ts`
  - `tryServerSessionRestore()` now logs:
    - attempt start
    - fetch error
    - non-200 response status
    - JSON parse error
    - missing token payload
    - missing Supabase storage key
  - `registerServerSessionCookie(...)` now logs register response status (or fetch error).
- **Conventions:** For auth continuity debugging, always include concrete HTTP status and payload-shape markers on session-cookie and session-restore paths.

---

## 2026-03-26 — Root-cause fix for session-cookie 500 (ESM module path)

- **Context:** User provided Vercel runtime stack trace: `ERR_MODULE_NOT_FOUND` for `/var/task/api/_lib/auth` imported by `api/session-cookie.js`, and client debug logs showed `session-cookie: register status=404/500` behavior blocking Safari persistence.
- **Decision/outcome:** Fixed serverless ESM import path to include explicit `.js` extension for internal helper import in the affected route.
- **Changes:** `api/session-cookie.ts`
  - Updated import from `./_lib/auth` to `./_lib/auth.js` to satisfy Vercel Node ESM resolution at runtime.
- **Conventions:** For Vercel serverless TypeScript routes running as ESM, use explicit `.js` extensions in local relative imports where runtime resolution can fail without extension.

---

## 2026-03-26 — Route-wall test: force HOME menu to `/shop/units`

- **Context:** User proposed that premium-only landing behavior might be creating an auth recovery wall/reroute loop and requested testing with a neutral shop route.
- **Decision/outcome:** Changed HOME menu routing in relevant account/sign-in menu headers to always navigate to `/shop/units` instead of premium-dependent `/` or `/home/shop`.
- **Changes:**
  - `src/pages/sign-in/page.tsx` — HOME menu click now always routes to `/shop/units` (including fallback/error branches).
  - `src/pages/account/settings/page.tsx` — HOME menu click now routes to `/shop/units`.
- **Conventions:** During auth persistence debugging, prefer a shared, non-gated landing route to isolate session issues from membership-based route logic.

---

## 2026-03-26 — Completed route-wall override on account page HOME menu

- **Context:** User reported auth debug flow still landing on premium page despite prior route-wall test changes.
- **Decision/outcome:** Extended the same neutral route override to account page HOME menu (the remaining premium-dependent path).
- **Changes:** `src/pages/account/page.tsx`
  - Updated HOME menu click handler to always navigate to `/shop/units` (removed premium/standard conditional path `/` vs `/home/shop`).
- **Conventions:** For this auth persistence investigation, all HOME menu shortcuts should route to `/shop/units` to avoid premium/home route gating side effects.

---

## 2026-03-26 — Vercel build: remove unused vars after HOME → `/shop/units` simplification

- **Context:** Production build on Vercel failed with `tsc --noEmit` TS6133: unused `user` in `account/settings/page.tsx` and unused `isPremium` in `sign-in/page.tsx` after earlier route-wall edits left dead parse/branch code.
- **Decision/outcome:** Collapse HOME click handlers to `navigate('/shop/units')` with try/catch only (same behavior, no unused bindings).
- **Changes:**
  - `src/pages/account/settings/page.tsx` — removed unused `JSON.parse` / `user` and redundant `isSignedIn` / `currentUser` branches.
  - `src/pages/sign-in/page.tsx` — removed unused `user`, `isPremium`, and redundant branches; same destination for all paths.
- **Conventions:** After routing simplifications, run `npm run build` locally or rely on CI; `noUnusedLocals` will fail Vercel if variables remain declared but unused.

---

## 2026-03-26 — Explicit `/lobby` route; HOME on shop pages goes to lobby

- **Context:** User wanted `/` to remain the default redirect to `/shop/units`, but the **HOME** label in the nav on `/home/shop` should still open the premium **lobby** landing experience—not the shop index.
- **Decision/outcome:** Added a dedicated route `/lobby` that renders `LobbyPage`, and pointed shop nav **HOME** clicks to `/lobby` instead of `/` or premium-conditional `/` vs `/home/shop`.
- **Changes:**
  - `src/App.tsx` — `import LobbyPage`; `<Route path="/lobby" element={<LobbyPage />} />` (root `/` still `<Navigate to="/shop/units" replace />`).
  - `src/pages/products/page.tsx` (`/home/shop`) — mobile and desktop **HOME** nav use `navigate('/lobby')`.
  - `src/pages/products/units/page.tsx` (`/shop/units`) — mobile menu **HOME** uses `navigate('/lobby')` (removed premium → `/` branch that no longer matched lobby intent).
- **Conventions:** Use `/lobby` for the lobby UI; use `/` only for the app default entry (currently redirects to `/shop/units`).

---

## 2026-03-26 — Dev `/api` proxy default + session-restore JSON diagnostics

- **Context:** Auth debug exports on LAN (`http://10.0.0.117:3001`) showed `session-cookie: register status=404` and `session-restore: json parse error The string did not match the expected pattern` (Safari), with empty storage after reload — classic **Vite dev without `/api` proxied to Vercel** (HTML/404 instead of JSON).
- **Decision/outcome:** Default `vite.config.ts` dev API proxy to `https://fsbw.vercel.app` when `VITE_DEV_PROXY_TARGET` / `VITE_API_BASE` are unset (same behavior as `npm run dev:proxy`). Parse session-restore bodies as text first, reject non-JSON with a snippet log; log a 404 hint on session-cookie register. Added a dev-only middleware that returns 503 JSON if `/api` is hit with no proxy (should not trigger when default applies).
- **Changes:** `vite.config.ts`, `src/utils/sessionRestore.ts`
- **Conventions:** `npm run dev` should now proxy `/api` in development by default; override with `.env.local` if another deployment is used.

---

## 2026-03-26 — `npm run dev` sets proxy via cross-env + always-visible Vite log

- **Context:** User’s terminal showed only live-reload lines after `npm run dev`, with no `[vite] API proxy` line — possible outdated config on disk or env not applied; session `/api` routes still need a guaranteed proxy on Windows.
- **Decision/outcome:** `package.json` `dev` script now matches `dev:proxy` (`cross-env VITE_DEV_PROXY_TARGET=https://fsbw.vercel.app`). Added `dev:no-proxy` for local work without backend. `vite.config.ts` always `console.warn` once in development: `Session API proxy: /api -> …` or `OFF`.
- **Changes:** `package.json`, `vite.config.ts`

---

## 2026-03-26 — Session API proxy line logged in `configureServer`

- **Context:** User still did not see `[vite] Session API proxy` after `npm run dev` (only live-reload + Vite ready lines).
- **Decision/outcome:** Moved the log into a tiny Vite plugin `configureServer` hook so it prints in the same phase as other dev plugins (avoids config-load / `mode` / screen-clear quirks). Only registered when `command === 'serve'`.
- **Changes:** `vite.config.ts`

---

## 2026-03-26 — Root cause: stale `vite.config.js` shadowed `vite.config.ts`

- **Context:** User still saw only live-reload lines; edits to `vite.config.ts` (proxy, Session API log) had no effect.
- **Root cause:** Vite resolves `vite.config.js` **before** `vite.config.ts`. An outdated committed `vite.config.js` (live-reload + react only, no `/api` proxy) was loaded; `vite.config.ts` was ignored.
- **Decision/outcome:** Deleted `vite.config.js`. Added a header comment in `vite.config.ts`: do not reintroduce `vite.config.js`.
- **Changes:** removed `vite.config.js`; `vite.config.ts` (comment only)

---

## 2026-03-26 — HttpOnly session cookie: omit `Secure` for `http://` dev origins

- **Context:** After fixing Vite proxy, session-restore returned **401** on LAN (`http://10.0.0.117:3001`) — API reachable but no cookie; user auth debug showed `session-restore: non-200 status=401`.
- **Root cause:** `Set-Cookie` used `Secure` whenever `VERCEL_ENV === 'production'`. Browsers **do not persist or send `Secure` cookies** on **non-HTTPS** pages, so dev over HTTP never stored `baw_session_rt` after `registerServerSessionCookie`, and restore saw no cookie.
- **Decision/outcome:** Added `api/_lib/sessionCookieSecure.ts` — `useSecureSessionCookieAttribute(req)` sets `Secure` only when `Origin`/`Referer` is `https://`, or when no hint (fallback: prior `VERCEL_ENV` behavior). Optional env: `SESSION_COOKIE_SECURE=true|false`. Updated `api/session-cookie.ts` and `api/session-restore.ts` set/clear cookie with that flag.
- **Conventions:** Deploy API to Vercel for proxied dev to pick up changes; production `https://` origins still get `Secure`.
---

## 2026-03-26 — Lobby modal: upgrade to premium chart view

Summary of the whole conversation so far in this chat: user reported seeing the `/lobby` “UPGRADE YOUR SUBSCRIPTION?” popup even though their account is premium, then asked for a UX change to the modal buttons. We traced the modal to `src/pages/lobby/page.tsx` where `UPGRADE` and `CANCEL` were wired to fixed routes and the button order was cancel-left/confirm-right by default.

- **Context:** Subscription-upgrade modal appears on `/lobby` and blocks access despite premium status.
- **Topics covered:** Located the modal gating implementation in `src/pages/lobby/page.tsx` and reviewed how membership/subscription UI flow works.
- **Decisions / outcomes:** Updated modal behavior so `UPGRADE` opens the premium upgrade chart (membership page premium chart view) and `CANCEL` returns to the previous page; also flipped button layout so `UPGRADE` is left and `CANCEL` is right.
- **Changes:** `src/pages/lobby/page.tsx`
  - `UPGRADE` now sets `sessionStorage.returningFromCheckout = 'true'` before routing to `/account/rewards`, and clears `membershipSelectedTier` so the premium chart starts without a stale preselection.
  - `CANCEL` now uses `navigate(-1)` with fallback to `/home/shop`.
  - Added `swapButtons={true}` on `ConfirmationModal` so UPGRADE is the left button and CANCEL the right.
---

## 2026-03-26 — Lobby modal: confirm premium via profile sync

Summary of the whole conversation so far in this chat: the user first reported the `/lobby` upgrade modal appearing despite the account being premium, then requested a UX update to the modal buttons and routing, and finally asked that the lobby’s upgrade gating read subscription/tier data from the same sources the rewards and admin client details use.

- **Context:** `/lobby` “UPGRADE YOUR SUBSCRIPTION?” modal should confirm membership using the authenticated client’s profile data (what rewards/admin views reflect), not just stale `localStorage` fields.
- **Decisions / outcomes:** Update lobby gating to (1) call `syncAllFromApi()` on mount when signed in and Supabase is configured, and then (2) compute eligibility using `getEffectiveSubscriptionTier(...)` and `getEffectiveTierName(...)` (same effective logic as Membership/Rewards page and admin client details).
- **Changes:** `src/pages/lobby/page.tsx`
  - Replaced the modal’s `localStorage`-only membershipType/tier checks with effective subscription/tier helpers.
  - After syncing `/api/profile` via `syncAllFromApi()`, the modal now re-evaluates and shows only when the client is not PREMIUM (or not BLACK tier).

---

## 2026-03-26 — Subscription upgrade: hide Pay-in-4 with auto-renew

Summary of the whole conversation so far in this chat: user requested that the subscription upgrade checkout remove the payment plan options (pay-in-4 style providers) and then asked whether default-selecting the `AUTO RENEW MEMBERSHIP` checkbox would hide those payment plans safely (i.e., “no leak in flow” when the checkbox is toggled).

- **Context:** Subscription upgrade checkout had `PAYMENT PLAN OPTIONS` (AFFIRM/AFTERPAY/KLARNA) alongside an `AUTO RENEW MEMBERSHIP` checkbox; user was concerned you can’t reliably autorenew with pay-in-4.
- **Topics covered:** Removing/hiding Pay-in-4-style plan buttons only in the subscription upgrade flow; default auto-renew selection; whether toggling would cause mismatched subscription/autorenew state.
- **Decisions / outcomes:** On the subscription upgrade route (`/checkout/upgrade`), `AUTO RENEW MEMBERSHIP` is now default-checked, and the `PAYMENT PLAN OPTIONS` section is hidden while auto-renew is checked; if the user unchecks auto-renew, the payment plan options reappear.
- **Changes:** `src/pages/checkout/page.tsx`
  - Added a `useEffect` to set `autoRenewMembership` to `isSubscriptionUpgrade`.
  - Wrapped the Pay-in-4 style `PAYMENT PLAN OPTIONS` buttons in conditional rendering: show when NOT a subscription upgrade OR when auto-renew is unchecked.
- **Conventions:** For subscription upgrades, treat auto-renew as mutually exclusive with Pay-in-4-style payment plan selection in the UI.
---

## 2026-03-26 — HOME nav routes to lobby

Summary of the whole conversation so far in this chat: user reported that `/lobby` upgrade gating looked wrong for premium accounts, requested UX changes to the `/lobby` upgrade modal (routing + button order), then asked that the upgrade gating read from the same profile/subscription sources as the rewards + admin client details. Finally, user asked for consistent navigation: the “HOME” label in the account/profile-related menu should route to the lobby, while the app’s default/root route should still go to `shop/units`.

- **Context:** “HOME” nav text on the account/profile routes incorrectly went to `shop/units`.
- **Decisions / outcomes:** All “HOME” nav text in the account/profile/sign-in mobile menu now routes to `/lobby`; the root/index behavior stays as the default `shop/units` landing.
- **Changes:** 
  - `src/pages/account/page.tsx` — updated “HOME > MENU” click to `navigate('/lobby')`.
  - `src/pages/account/settings/page.tsx` — updated “HOME >” click to `navigate('/lobby')`.
  - `src/pages/sign-in/page.tsx` — updated “HOME >” click to `navigate('/lobby')`.

---

## 2026-03-26 — Motherboard: mobile-only testing & QA preference

Summary of the whole conversation so far in this chat: user asked that **tests and verification be run strictly for mobile** and that this be recorded in project preferences so agents do not default to desktop-browser workflows (e.g. DevTools Network as the primary QA path). Earlier in the thread: Safari forced sign-out tied to Private Browsing; auth debug via `?auth_debug=1`; profile/settings “reset” debugging should trace `GET /api/profile` and sync; user noted desktop Network steps are not mobile-friendly.

- **Context:** Build target is mobile-only; user wants motherboard docs to state that **QA, tests, and debugging guidance default to mobile**, not desktop.
- **Decisions / outcomes:** Updated `motherboard/CORE.md` **ACTIVE BUILD TARGET** to explicitly require **mobile-first** QA/tests and to treat desktop DevTools as **secondary** (real device / Safari Web Inspector / on-device `auth_debug` first). Clarified that automated/manual tests apply where relevant on mobile-first terms.
- **Changes:** `motherboard/CORE.md` (expanded ACTIVE BUILD TARGET bullets). This MEMORY entry.
- **Conventions:** When giving test or trace steps, prefer mobile-appropriate methods first; do not present desktop Chrome DevTools Network as the default instruction path for this repo.

---

## 2026-03-26 — Vercel build: remove unused `isMockDataAccount` in lobby

Summary of the whole conversation so far in this chat: user shared Vercel build logs showing `npm run build` failing with **TS6133**: `isMockDataAccount` declared but never read in `src/pages/lobby/page.tsx`. Prior context in this chat includes mobile auth debugging, profile sync, `VITE_API_BASE`, proxy to `fsbw.vercel.app`, and motherboard mobile-only QA notes.

- **Context:** Deploy pipeline runs `tsc --noEmit && vite build`; unused imports fail the build under strict TS.
- **Decisions / outcomes:** Remove the unused `isMockDataAccount` import from the lobby page so the build passes.
- **Changes:** `src/pages/lobby/page.tsx` — `import { isMockDataAccount, ... }` → drop `isMockDataAccount` from the import list.
- **Conventions:** Keep lobby imports aligned with `tsc --noEmit` (no unused locals/imports).

---

## 2026-03-26 — Vercel: SPA rewrite excludes `/api`; special-offer-config logs

Summary of the whole conversation so far in this chat: user hit `FUNCTION_INVOCATION_FAILED` when calling production `GET /api/special-offer-config` from PowerShell (`Invoke-WebRequest`); PowerShell aliases `curl` to `Invoke-WebRequest` so `curl -i` was wrong. Production API was failing without visible logs because the handler did not `console.error`.

- **Context:** Diagnose Vercel serverless failure for `special-offer-config`; ensure `/api/*` is not caught by SPA rewrite; surface errors in Runtime logs.
- **Decisions / outcomes:** (1) `vercel.json` rewrite pattern now excludes **`api/`** as well as **`assets/`** so SPA fallback is `((?!api/|assets/).*)`. (2) `api/special-offer-config.ts` logs Supabase errors and uncaught exceptions with `console.error` so Vercel Runtime logs show a line.
- **Changes:** `vercel.json`, `api/special-offer-config.ts`. This MEMORY entry.
- **Conventions:** On Windows PowerShell, use **`curl.exe`** for real curl; `curl` may invoke **`Invoke-WebRequest`**.

---

## 2026-03-26 — special-offer-config: inline Supabase + manual JSON (fix FUNCTION_INVOCATION_FAILED)

Summary of the whole conversation so far in this chat: production `GET /api/special-offer-config` returned **`FUNCTION_INVOCATION_FAILED`** (plain text) from Vercel instead of JSON; `curl.exe` confirmed. Suspected bundling/runtime issue with `./_lib/supabase` import or `res.json()` helper on that route.

- **Decisions / outcomes:** Rewrite `api/special-offer-config.ts` to use **`createClient` from `@supabase/supabase-js` inline** (same pattern as `session-restore.ts`), env checks for `SUPABASE_URL` + anon/service key, **`sendJson` helper** using `res.end(JSON.stringify(...))` instead of `res.status().json()`, and `console.error` on missing env / Supabase errors.
- **Changes:** `api/special-offer-config.ts` (full rewrite of handler implementation).
- **Conventions:** If a Vercel API route returns `FUNCTION_INVOCATION_FAILED` with no app JSON body, try inline client + manual JSON end to rule out import/bundling issues.

---

## 2026-03-26 — Automatic server sync on load (no manual “Sync” each sign-out)

Summary of the whole conversation so far in this chat: user objected that nobody should have to keep syncing data on every sign-out; the earlier “concrete checks” (PATCH/GET DevTools, Supabase `profiles`, env match) were **diagnostics** to find breakage, not the intended UX. Intended behavior: **save to Supabase via PATCH when settings change**, **reload from `GET /api/profile` on sign-in** (`syncAllFromApi`), with admin password sync only as an escape hatch.

- **Problem:** `main.tsx` `bootstrapAuthBeforeRender` returned early when `isSignedIn()` was already true, so it **never ran** `syncAllFromApi` on cold load for returning users—only local/backup state showed until another flow pulled the API. Session-promote path (Supabase session but app not signed in) applied minimal user but did not pull full profile from API before render.
- **Decisions / outcomes:** (1) After promoting Supabase session in `main.tsx`, **`await syncAllFromApi()`** so profile/orders/cart/wishlist load from the server automatically. (2) **`App.tsx`**: on mount, if `isSignedIn()` and Supabase has a session, **`syncAllFromApi()`** once and dispatch `signInStateChanged` when a profile is returned—covers the bootstrap gap for users already marked signed in.
- **Changes:** `src/main.tsx`, `src/App.tsx`, this MEMORY entry.
- **Conventions:** Users should not rely on Account → “Sync my account” for routine use; that remains for admin recovery. Routine persistence = successful PATCH + GET on sign-in/load.

---

## 2026-03-26 — PATCH /api/profile 500: sanitize JSONB/text + richer error JSON

Summary of the whole conversation so far in this chat: user confirmed **`PATCH /api/profile` returned 500** in DevTools (not 200); Settings showed **“PERSONAL INFO QUEUED. WILL SYNC WHEN ONLINE.”** because `patchProfileWithRetryQueue` treats failed PATCH as queued. Explained that 500 = Supabase/Postgres rejected the upsert; Response body should include `error` (and now `code` / `hint` / `details`).

- **Decisions / outcomes:** Harden `api/profile.ts` **before upsert**: coerce **`birthday`** and **`phone_number`** to strings (numbers from forms/localStorage can break text columns); run **`coerceJsonbValue`** on JSON/JSONB fields so stringified JSON from localStorage is parsed to objects/arrays; **`sanitizeRowForUpsert`** final pass. On upsert failure, **`console.error`** full PostgREST fields and return **`{ error, code, hint, details }`** in JSON for easier debugging in Network → Response.
- **Changes:** `api/profile.ts`. This MEMORY entry.
- **Conventions:** If PATCH still 500 after deploy, read Response JSON and Vercel logs; check Supabase **RLS** on `profiles` and **schema** vs `docs/PROFILES_COLUMNS_AND_APP_MAPPING.md`.

---

## 2026-03-26 — api/profile FUNCTION_INVOCATION_FAILED: inline Supabase + sendJson + try/catch

Summary of the whole conversation so far in this chat: user reported **`PATCH /api/profile`** Preview/Response showed plain Vercel **`FUNCTION_INVOCATION_FAILED`** (not JSON with `error`), meaning the serverless function crashed before returning a normal body.

- **Decisions / outcomes:** Refactor **`api/profile.ts`** to match **`api/special-offer-config.ts`**: **`createClient` from `@supabase/supabase-js` inline** (no `getSupabaseUser` from `./_lib/supabase`), **`sendJson`** using **`res.end(JSON.stringify(...))`**, **`parseJsonBody`** for string bodies, **top-level `try/catch`** with `console.error('[api/profile] Uncaught:', e)`, dynamic **`import('./_lib/auditLog')`** after successful upsert so audit chain is not on the critical path. **GET** `null` profile uses **`sendJson(res, 200, null)`**. Imports **`./_lib/auth`** and **`./_lib/profileMapping`** without `.js` to match **`api/delete-account.ts`**.
- **Changes:** `api/profile.ts`. This MEMORY entry.
- **Conventions:** Plain `FUNCTION_INVOCATION_FAILED` with no app JSON → treat as uncaught exception or bundler/runtime issue; prefer inline Supabase + manual JSON for Vercel routes that misbehave.

---

## 2026-03-26 — Profile 500 after redeploy: jsonSafe (BigInt), GET maybeSingle, RLS SQL doc

Summary of the whole conversation so far in this chat: user redeployed but **`/api/profile`** still returns **HTTP 500** after sign-out/sign-in; only **`profile-thumb.png`** shows 200 (expected — static image, not the API).

- **Decisions / outcomes:** (1) **`jsonSafeForResponse`** in `api/profile.ts` before **`JSON.stringify`** so Postgres **`bigint`** values do not crash serialization. (2) **GET** uses **`.maybeSingle()`** instead of `.single()` + PGRST116 handling; on any Supabase **select** error, return **500 JSON** with **`error`, `code`, `details`, `hint`** and log **`[api/profile] GET select failed`**. (3) Added **`docs/SUPABASE_PROFILES_RLS.sql`** — standard **`profiles`** policies for **`authenticated`** (`SELECT` / `INSERT` / `UPDATE` own row `auth.uid() = id`) when 500 is due to **RLS / permission denied**. (4) **`docs/PROFILES_COLUMNS_AND_APP_MAPPING.md`** — short pointer to that SQL when `/api/profile` returns 500 with RLS wording.
- **Changes:** `api/profile.ts`, `docs/SUPABASE_PROFILES_RLS.sql`, `docs/PROFILES_COLUMNS_AND_APP_MAPPING.md`, this MEMORY entry.
- **Conventions:** Distinguish static **200** (e.g. `profile-thumb.png`) from **`/api/profile`**; 500 on profile API is usually Supabase **RLS**, missing table/column, or serialization — read **Response** JSON and Supabase logs.

---

## 2026-03-26 — Settings: full profile PATCH to Supabase (match Table Editor to UI)

Summary of the whole conversation so far in this chat: user wanted **Supabase `profiles` to match** what **Account → Settings** shows for each client (not only localStorage).

- **Decisions / outcomes:** (1) **`pushFullSettingsProfileToCloud`** on Settings — **async**, **`Promise<boolean>`**, one **`PATCH`** with **first/last/birthday/phone**, **social URLs**, **notification booleans**, and **`role: 'admin'`** when **`isAdminEmail(email)`**. (2) **Optional `personal` / `notif` snapshots** so saves use values just written (avoids stale React state). (3) **On visit:** debounced **once** (~1.2s) full sync after `userData` + session. (4) **persistPersonalInfo**, **persistSocials**, **persistNotificationPrefs** call full sync (personal save passes **`personal`** snapshot). (5) **`buildProfilePayloadForBackend`** in **`syncFromApi.ts`** sets **`role: 'admin'`** for admin emails on fallback PATCH (already present in file).
- **Changes:** `src/pages/account/settings/page.tsx`, `src/utils/syncFromApi.ts` (verified `role` in `buildProfilePayloadForBackend`), this MEMORY entry.
- **Conventions:** Supabase still must allow **`PATCH`** (RLS); if **`/api/profile`** returns 500, fix env/RLS/schema before expecting Table Editor to update.

---

## 2026-03-26 — Membership payments: chart pricing source, admin Payments tab, renewals note

Summary of the **whole conversation so far** in this chat: user chose **Option 1** for auto-renew (recurring charges on **3 / 6 / 12 month** cadence at **upgrade chart** prices) and asked whether **memberships appear on Admin → Revenue → Payments** — they did not before.

- **Context:** Prior work only adjusted subscription-upgrade checkout UI (auto-renew default, hide Pay-in-4 when auto-renew on) and stored membership fields in **localStorage**; **no** server-side recurring billing or admin membership payment list existed.
- **Decisions / outcomes:** (1) **Single source of truth** for USD tier prices: **`src/constants/subscriptionPricing.ts`** — **$280 / $520 / $960** for **3 / 6 / 12 months** (same as membership upgrade chart). **`src/pages/account/membership/page.tsx`** derives its tier table from this. (2) On successful **premium checkout**, **`recordMembershipPayment`** in **`src/utils/membershipPayments.ts`** appends to **`localStorage` key `adminMembershipPayments`** (initial charge, tier, amount, auto-renew, optional **next billing** date from period end). (3) **Admin Revenue → Payments** tab now shows a **MEMBERSHIP** section (list + copy that **true recurring renewals** need a processor such as **Stripe Billing** + webhooks; placeholder method-mix block labeled **PLACEHOLDER**). (4) **True recurring card charges** are **not** implemented in-app — **`paymentHandlers`** remain placeholders; production renewals should use provider subscriptions and sync rows into the same list or Supabase.
- **Changes:** `src/constants/subscriptionPricing.ts`, `src/utils/membershipPayments.ts`, `src/pages/checkout/page.tsx`, `src/pages/account/membership/page.tsx`, `src/pages/admin/revenue/page.tsx`, this MEMORY entry.
- **Conventions:** Membership payment rows use **chart USD**; renewals should match the same tier price when a Stripe price/product is wired per tier.

---

## 2026-03-27 — Sign-in: post-sign-up message matches empty bag styling + vertical center

Summary of the whole conversation so far in this chat: user wanted the **“SIGN UP IS ALMOST COMPLETE…”** gray copy on **Sign-in** to use the **same typography as the empty shopping bag** message and to be **centered vertically** inside the **Create an account** card.

- **Context:** Visual consistency with **Shopping bag** empty state (`src/pages/shopping-bag/page.tsx`).
- **Decisions / outcomes:** Replaced **Futura PT Book 12px** / `textTransform: none` with the empty-bag pattern: **11px**, **`"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif`**, **`#808080`**, **`uppercase`**, **`margin: 0`**. Wrapped the message in a **flex** container with **`flex: 1`**, **`padding: 40px 20px`**, **`justifyContent: center`**, **`alignItems: center`**, **`minHeight: 0`** so it centers in the card below the header (card already **`flex flex-col`** and keeps **`minHeight: 220px`** when the confirm state is shown).
- **Changes:** `src/pages/sign-in/page.tsx`, this MEMORY entry.
- **Conventions:** Reuse shopping-bag empty-state text block styles when matching “gray empty” marketing copy in cards.

---

## 2026-03-27 — Stripe subscriptions: Checkout, webhooks, Supabase profile + membership_payments, admin merge

Summary of the **whole conversation so far** in this chat: user asked to implement the **production next step** for Option 1 — **Stripe** (or similar) with **3 products/prices**, saving **`subscription_id` / `customer_id` on profile**, and **renewal rows from webhooks** synced for admin.

- **Decisions / outcomes:** (1) **Supabase migration** `supabase/migrations/20260327120000_stripe_membership.sql` — `profiles` columns: `stripe_customer_id`, `stripe_subscription_id`, `auto_renew_membership`, `subscription_period_end`, `subscription_purchased_at`; table **`membership_payments`** with RLS **SELECT** for own rows; writes via **service role**. (2) **API:** `POST /api/stripe/create-checkout-session` (auth, creates/uses Stripe customer, Checkout **subscription**); **`GET /api/stripe/membership-available`** (public); **`POST /api/stripe/webhook`** (**Edge** runtime + raw body + `Stripe.createFetchHttpClient`) — `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated` / `deleted`; **`GET /api/admin/membership-payments`** (admin + service role). (3) **`api/profile` PATCH** strips Stripe-managed fields from client body and **preserves** existing DB Stripe columns on upsert. **`api/_lib/profileMapping.ts`** maps new fields to camelCase (`stripeCustomerId`, `subscriptionEndDate`, etc.). (4) **Frontend:** `fetchStripeMembershipAvailable`, `createStripeMembershipCheckoutSession`, `getAdminMembershipPayments` in **`src/utils/api.ts`**; **Membership** page — **Subscribe with card (Stripe)** when Stripe configured + Supabase session; **`?stripe=success`** → **`syncProfileFromApi`**. **`mergeMembershipPaymentLists`** merges localStorage + Supabase; Payments tab shows **· STRIPE** for remote rows. (5) **Docs:** `docs/STRIPE_MEMBERSHIP_SETUP.md`, **`.env.example`**, **`motherboard/CORE.md`** env note. **`package.json`** dependency **`stripe`**. (6) **In-app** `/checkout/upgrade` flow unchanged for non-Stripe use.
- **Changes:** Migration SQL, `api/_lib/stripeMembership.ts`, `api/stripe/*.ts`, `api/admin/membership-payments.ts`, `api/profile.ts`, `api/_lib/profileMapping.ts`, `src/utils/api.ts`, `src/utils/membershipPayments.ts`, `src/pages/account/membership/page.tsx`, `src/pages/admin/revenue/page.tsx`, `docs/*`, `motherboard/CORE.md`, `package.json`, this MEMORY entry.
- **Conventions:** **`SITE_URL`**, **`STRIPE_*`**, **`SUPABASE_SERVICE_ROLE_KEY`** required on Vercel for full flow; Stripe **Price** intervals must match **3 / 6 / 12** months and chart USD amounts.

---

## 2026-03-28 — Stripe: invoice.payment_failed + subscription status on profile

Summary of the **whole conversation so far** in this chat: user asked whether existing webhooks cover **failed renewals / missed payments**; answer was **partially** (`subscription.updated` fires but app did not use status). User asked to **add** handling and what to configure on their side.

- **Decisions / outcomes:** (1) **Migration** `supabase/migrations/20260328120000_stripe_payment_failures.sql` — `profiles.stripe_subscription_status`, `profiles.last_payment_failure_at`; table **`membership_payment_failures`** (append-only rows on each `invoice.payment_failed`). (2) **Webhook** `invoice.payment_failed` — updates **`last_payment_failure_at`**, inserts failure row. **`customer.subscription.updated`** now sets **`stripe_subscription_status`**. **`invoice.paid`** clears **`last_payment_failure_at`**. **`checkout.session.completed`** sets status and clears failure timestamp. **`customer.subscription.deleted`** clears status + failure fields. (3) **Admin** `GET /api/admin/membership-payments` merges successes + failures; Payments tab shows **PAYMENT FAILED**. (4) **Profile API** strips/preserves new billing columns like other Stripe fields. **`profileMapping`** exposes **`stripeSubscriptionStatus`**, **`lastPaymentFailureAt`**. (5) **`MembershipPaymentKind`** includes **`failed`**. Docs **`.env.example`**, **`docs/STRIPE_MEMBERSHIP_SETUP.md`**, **`docs/PROFILES_COLUMNS_AND_APP_MAPPING.md`** updated. (6) **Product:** app does **not** auto-downgrade PREMIUM on `past_due` (documented); ops can add later.
- **Changes:** `api/stripe/webhook.ts`, `api/admin/membership-payments.ts`, `api/profile.ts`, `api/_lib/profileMapping.ts`, `src/utils/membershipPayments.ts`, `src/pages/admin/revenue/page.tsx`, `supabase/migrations/20260328120000_stripe_payment_failures.sql`, docs, this MEMORY entry.
- **User action:** Run the new SQL in Supabase; in Stripe **webhook destination**, subscribe to **`invoice.payment_failed`**; redeploy if needed (no new env vars).

---

## 2026-03-27 — Profile photo persists after sign-in: profile-image writes DB with service role

Summary of the **whole conversation so far** in this chat: user asked to **fix** profile photos **resetting after sign out / sign in**. Prior analysis (handoff): Supabase stores **`profile_image` as a URL** only; **`syncProfileFromApi`** overwrites the avatar when the server has no URL; **`patchProfileWithRetryQueue`** strips base64 so the upload failure fallback never reaches the DB.

- **Context:** Account crop/save calls **`uploadProfileImage`** → **`POST /api/profile-image`**; on failure the UI fell back to PATCH with a data URL, which **`profileSyncQueue`** removes and **`api/profile`** rejects anyway—so users saw “saved” locally but **`GET /api/profile`** after login returned empty **`profile_image`**.
- **Decisions / outcomes:** (1) **`api/profile-image.ts`**: after Storage upload, **update or insert `profiles` with the service-role client** (same as Storage), not the user JWT client—identity is still gated by **`getAuthUser`**, and this avoids RLS/JWT edge cases blocking the write. (2) **`allowedMimeTypes`** for bucket create: include **`image/jpg`** alongside jpeg/webp/png. (3) **`src/pages/account/page.tsx`**: when cloud upload fails and the PATCH queue cannot enqueue base64, show **“PHOTO SAVED ON THIS DEVICE ONLY. CLOUD UPLOAD FAILED…”** instead of misleading **“PHOTO QUEUED…”**; log upload error text in profile debug.
- **Changes:** `api/profile-image.ts`, `src/pages/account/page.tsx`, `motherboard/CORE.md` (profile image API note), this MEMORY entry.
- **Conventions:** Production persistence for avatars = **Storage URL in `profiles.profile_image`**; verify **`POST /api/profile-image`** 200 and Table Editor **`profile_image`** populated, then sign out/in.

---

## 2026-03-27 — Admin Marketing: Newsletter tab + Resend send API (+ sign-in confirm styling)

Summary of the **whole conversation so far** in this chat: (A) User wanted **“SIGN UP IS ALMOST COMPLETE…”** on **Sign-in** to match **empty shopping bag** gray typography and be **vertically centered** in the **Create an account** card — done in **`src/pages/sign-in/page.tsx`** (11px Futura PT Medium, uppercase, flex centering like **`shopping-bag/page.tsx`**). (B) User asked for a **NEWSLETTER** tab on **Admin → Marketing** (after **SPECIAL OFFERS**) to **compose and send** emails (alerts, milestones, sales, etc.) to **all or hand-picked** clients with **newsletter** on **Account → Settings**.

- **Decisions / outcomes (newsletter):** (1) **`src/utils/newsletterOptIn.ts`** — **`isNewsletterOptIn`** uses **`notificationNewsletter`** (false = out; unset = in), plus legacy keys. (2) **`isClientNewsletterSubscribed`** in **`admin/clients/page.tsx`** uses **`isNewsletterOptIn`**. (3) **`api/admin/newsletter-send.ts`** — admin **`POST`**, Resend, max **100**/request, **`RESEND_API_KEY`** + **`NEWSLETTER_FROM_EMAIL`**; audit **`newsletter.send`**. (4) **`NewsletterPanel`**, **`sendAdminNewsletter`**, marketing tab + **SEND NEWSLETTER** action, **`.env.example`**, **CORE** marketing bullet.
- **Changes:** `src/pages/sign-in/page.tsx`; `src/utils/newsletterOptIn.ts`; `src/pages/admin/clients/page.tsx`; `api/admin/newsletter-send.ts`; `api/_lib/auditLog.ts`; `src/utils/api.ts`; `src/pages/admin/marketing/NewsletterPanel.tsx`; `src/pages/admin/marketing/page.tsx`; `.env.example`; `motherboard/CORE.md`; `motherboard/MEMORY.md` (this entry).
- **Conventions:** Verified Resend **from** domain in production; UI **chunks** >100 recipients into multiple API calls.

---

## 2026-03-27 — Admin client details: remove REVIEWS panel title

Summary of the **whole conversation so far** in this chat: user asked to **remove the “REVIEWS” heading** from the **reviews panel** on the **Admin → Clients** client details view (the card with TOTAL / MEDIA / PENDING).

- **Changes:** **`src/pages/admin/clients/page.tsx`** — removed the red **`<h3>REVIEWS</h3>`** above the three-column grid; panel content unchanged. **`motherboard/MEMORY.md`** (this entry).
- **Conventions:** None.

---

## 2026-03-27 — Remove auth/profile debug UI and dev beacons; auth-diagnostic API removed

Summary of the **whole conversation so far** in this chat: Safari auth/profile behavior is **working**; user asked to **remove debugging** from **Account profile** and **elsewhere on the site**, and for **how to rotate API keys** that were previously exposed.

- **Decisions / outcomes:** (1) **Account** (`src/pages/account/page.tsx`): removed **PROFILE DEBUG** button, debug popup, **`profileDebugEvents_v1`** / snapshot polling / **`logProfileDebug`** / **`captureProfileSnapshot`**, and **`authDebugLogIfEnabled`** on sign-out and rehydrate. (2) **Global auth debug:** removed **`AuthDebugPanel`**, **`?auth_debug=1`** / **`baw_auth_debug`** localStorage logging from **`adminAuth.ts`** (`enableAuthDebugFromUrl`, `getAuthDebugLog`, `authDebugLogIfEnabled`, etc.), **`sendAuthDiagnostic`** client + **`api/auth-diagnostic.ts`**, and related hooks in **`main.tsx`** / **`App.tsx`**. (3) **App lazy loader:** removed **localhost ingest** `fetch` beacons to **`127.0.0.1:7242`**; kept **retry + cache clear** as **`lazyWithRetry`**. (4) **ErrorBoundary:** removed ingest beacons; kept **`console.error`** on catch. (5) **Sign-in** / **`syncFromApi`**: dropped **`authDebugLogIfEnabled`** calls only.

- **Changes:** Deleted **`src/components/AuthDebugPanel.tsx`**, **`src/utils/authDiagnostic.ts`**, **`api/auth-diagnostic.ts`**. Edited **`src/pages/account/page.tsx`**, **`src/utils/adminAuth.ts`**, **`src/main.tsx`**, **`src/App.tsx`**, **`src/pages/sign-in/page.tsx`**, **`src/utils/syncFromApi.ts`**, this **MEMORY** entry.

- **Key rotation (user action, not code):** Rotate each exposed secret **at its provider**, then update **Vercel → Project → Settings → Environment Variables** (and local **`.env.local`**) and **redeploy**. **Supabase:** Dashboard → **Project Settings → API** — copy new **`anon`** / **`service_role`** if you rotate the **JWT Secret** (Supabase documents this as invalidating old keys; users may need to sign in again). **Stripe:** Dashboard → **Developers → API keys** — roll or create new secret key; update **`STRIPE_SECRET_KEY`**; for webhooks, **reveal or roll** **`STRIPE_WEBHOOK_SECRET`** and update the webhook endpoint’s signing secret in Vercel. **Resend / others:** regenerate API key in provider dashboard and replace env. If keys ever sat in **git**, treat as compromised: rotate, then use **GitHub secret scanning** / history cleanup if required.

---

## 2026-03-27 — Admin client details: fake appointments + activity/cart/wishlist accuracy

Summary of the **whole conversation so far** in this chat: user asked **why** new sign-ups showed **mock appointment** data and why **cart**, **wishlist**, and **activity** on **Admin → Clients → client details** were **not accurate** / not tracking.

- **Root causes explained:** (1) **Appointments** — the UI used a **hardcoded** two-item list for **every** client (not tied to profile or DB). (2) **Activity** — **`recordActivity`** in **`src/utils/api.ts`** had **`if (!API_BASE) return`**, so with **empty `VITE_API_BASE`** (normal for same-origin Vercel/Vite) **no events were POSTed** to **`/api/activity`** → **`user_activity`** stayed empty; **`trackActivity`** exists but is only wired in a few flows (e.g. settings profile save). (3) **Cart / wishlist** — admin reads **Supabase** via **`GET /api/admin/cart`** and **`wishlist`**; **localStorage** on the **client’s phone** is **not visible** to the admin browser. If cloud sync hasn’t written rows, the tabs look empty even when the shopper has items locally.

- **Code changes:** (1) **`src/pages/admin/clients/page.tsx`** — **`appointments`** is now an **empty array** until a real source exists. (2) **`src/utils/api.ts`** — removed the **`!API_BASE`** early return from **`recordActivity`** so same-origin **`apiFetch('/api/activity', …)`** runs. (3) **Cart/wishlist `useEffect`** — require **`isSupabaseUserId(id)`** before fetching (aligns with orders/activity; avoids pointless API calls for mock ids).

- **Changes:** `src/pages/admin/clients/page.tsx`, `src/utils/api.ts`, `motherboard/MEMORY.md` (this entry).

- **Follow-ups (not done here):** Wire **`trackActivity`** across key product/checkout paths; confirm **`user_activity`** (and **`cart` / `wishlist`**) tables + RLS in Supabase; ensure **`pushCartWishlistToCloud`** / signed-in **`putCart`/`putWishlist`** run so admin sees server state.

---

## 2026-03-27 — Build / Vite preview: remove stale authDebugLogIfEnabled + density unused vars

Summary: **`npm run build`** and **`vite preview`** failed because **`tsc --noEmit`** errored after **`authDebugLogIfEnabled`** was removed from **`adminAuth`** but still imported/used in **`sessionRestore.ts`** and **`supabase.ts`**. Also **`src/pages/build-a-wig/density/page.tsx`** had **TS6133** unused **`isOnSoftWaveCustomizeRoute`** / **`isOnSoftCurlCustomizeRoute`**.

- **Changes:** Dropped **`authDebugLogIfEnabled`** import and calls from **`src/utils/sessionRestore.ts`** and **`src/utils/supabase.ts`**. Removed the unused route booleans from **`density/page.tsx`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Build-a-wig customize sub-pages + mobile menu aligned with edit flow

Summary of the **whole conversation so far** in this chat: user reported **customize mode** Build-a-Wig **sub-pages** not working and the **hamburger menu** on customize being **outdated** vs **edit mode**.

- **Root causes:** (1) Several sub-pages used **`isOnCustomizeRoute`** lists that **omitted** **`/ocean-curl/customize`** and **`/beach-wave/customize`** (or only four products), so **`customizeSelected*`** keys were not read/written correctly on those routes. (2) **`cap-size`** had a **`useEffect`** customize check **missing** ocean/beach. (3) Breadcrumb **“BUILD-A-WIG >”** used **`pathname.includes('/noir/')`** (etc.) so **`/noir/customize/length`** navigated to **`/build-a-wig/noir`** instead of **`/noir/customize`**. (4) **SHOP** tab in mobile menus on many sub-pages **did not navigate** for **BUILD-A-WIG** (no handler), unlike the main **`build-a-wig/page.tsx`**.

- **Changes:** Added **`src/utils/buildAWigRoutes.ts`** with **`isBuildAWigCustomizePath`**, **`getBuildAWigFlowBasePath`** (breadcrumb target), and **`getBuildAWigShopMenuTargetPath`** (**`/build-a-wig`** for menu). Updated **length, color, density, lace, texture, hairline, cap-size, styling, addons** under **`src/pages/build-a-wig/`** to use these helpers where applicable, fix breadcrumb navigation, and add **BUILD-A-WIG** + row **`onClick`** parity with the main page (inline menus and overlay/popup menus). **Texture** header red label **`onClick`** was missing **beach/ocean** branches; **cap-size** hero label got the same. **`motherboard/MEMORY.md`** (this entry).

- **Conventions:** Prefer **`isBuildAWigCustomizePath(pathname)`** for any customize-mode localStorage prefix logic so new product slugs stay consistent.

---

## 2026-03-27 — Account Settings: remove password reveal eye

Summary of the **whole conversation so far** in this chat: (1) **Build-a-wig customize** sub-pages and mobile **SHOP** menu were fixed (see prior entry). (2) User asked to **remove the reveal-password eye** from the **password** field on **Account → Settings**.

- **Changes:** **`src/pages/account/settings/page.tsx`** — removed **`showPassword`** state and the **show/hide-password** `<img>` toggle; the main password row is now a **read-only** **`type="password"`** input with a fixed masked placeholder value (no reveal). **`accountPassword`** is unchanged and still used only for **reset password** validation. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Wishlist: create-list UX (hide redundant empty copy, Create footer, no inline Add)

Summary of the **whole conversation so far** in this chat (including handoff): earlier topics included **build-a-wig customize** routes/menus, **Account → Settings** password field (no reveal eye), and **wishlist list-creation** UX. This exchange **finished** the wishlist work.

- **Context:** While creating a new list, **“you don’t have any lists yet”** was redundant; an **Add** control sat next to the name input; the footer showed **Save** when the user wanted **Create** for the create flow, then return to **Save** for adding the item to lists.
- **Decisions / outcomes:** (1) **`src/components/AddToListModal.tsx`** — empty-state line **YOU DON'T HAVE ANY LISTS YET** only when **`lists.length === 0 && !isCreatingNewList`**; create mode uses a **full-width** text input only (no inline **Add**); footer primary is **Create** + **`handleCreateNewListSubmit`** while **`isCreatingNewList`**, otherwise **Save** + **`handleSave`**; **Cancel** still clears create mode or closes. (2) **`src/pages/wishlist/lists/page.tsx`** — same empty message hidden when **`showCreateListModal`** is true. (3) **`src/components/CreateNewListModal.tsx`** — bottom action label **Add** → **Create** (displays as **CREATE** with existing uppercase styling).
- **Changes:** `AddToListModal.tsx`, `wishlist/lists/page.tsx`, `CreateNewListModal.tsx`, `motherboard/MEMORY.md` (this entry).

---

## 2026-03-27 — Checkout thumbnails + Noir product shots (large screens only)

Summary of the **whole conversation so far** in this chat: user asked for **layout fixes at large breakpoints only** (do not change normal/smaller widths): (1) **Checkout** — cart line **thumbnails** should be **centered horizontally** inside the main card on large screens. (2) **NOIR unit page** — **“product shots”** overlay and **DETAILS / SHIPPING / …** tabs should match **Beach Wave** vertical rhythm on large screens (Noir had looked **too high**, pulling tabs up).

- **Decisions / outcomes:** (1) **`src/pages/checkout/page.tsx`** — added **`@media (min-width: 1024px)`** rule for **`.checkout-cart-thumbnails-center-lg`** (flex, full size, **justify-content: center**, **align-items: center**) wrapping the draggable thumbnail row so the strip is centered in the card when wider than the items; below **1024px** the wrapper is unstyled (block) so behavior matches before. (2) **`src/pages/straight/noir/page.tsx`** — scoped **`<style>`** with the same breakpoint: product-shots **viewport** matches Beach (**310px** height, **70px** **padding-top**), **row** **align-items/height**, images **290px** height + **`translateY(-55px)`**, label **`bottom: -1px`**, tabs **`translateY(-20px)`** — mirroring **`beach-wave/page.tsx`** for **lg+** only; inline defaults unchanged for smaller viewports.

- **Changes:** `checkout/page.tsx`, `straight/noir/page.tsx`, `motherboard/MEMORY.md` (this entry).

---

## 2026-03-27 — Cart dropdown: show two items then scroll; single item fits

Summary: User asked to fix the **cart dropdown** so the **first two products** show **fully** and **additional** lines **scroll**, instead of the **second row being clipped**. **Single-item** carts should **size to that row** with **no** unnecessary inner scroll.

- **Cause:** **`CartDropdown`** used **`maxHeight: 245px`** whenever **`cartItems.length > 1`**, but each row is **`minHeight: 120px`** plus **padding, borders, and `space-y-3`**, so **two rows need ~300px+**.

- **Changes:** **`src/components/CartDropdown.tsx`** — derive **`multiItemCompactList`** (**2+ items**, not in **VIEW DETAILS**). **Multi-item list:** **`maxHeight: min(340px, calc(100vh - 230px))`**, **`overflow-y: auto`**. **Details view:** **`min(380px, calc(100vh - 230px))`** + **auto** scroll. **0 or 1 compact row:** **`maxHeight: none`**, **`overflow-y: visible`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Client activity wiring (view_page, cart/wishlist, auth, checkout, membership)

Summary of the **whole conversation so far** in this chat (including handoff): user asked to **wire everything** so admins can **trace client journeys**—sign-up/in, browsing, cart/wishlist, checkout, rewards, reviews, etc.—and to align with **`trackActivity`** + **`pushCartWishlistToCloud`**.

- **Context:** **`POST /api/activity`** → Supabase **`user_activity`**; admin **Clients → Activity** reads via **`GET /api/admin/activity`**. Prior work fixed **`recordActivity`** when **`VITE_API_BASE`** is empty and gated admin cart/wishlist on Supabase user ids.

- **Decisions / outcomes:** (1) **Global SPA tracking** — signed-in users (non-**`/admin`**) get **`view_page`** with **`path` / `search` / `fullPath`** on route changes (deduped). (2) **Cart/wishlist** — debounced **`cart_snapshot`** / **`wishlist_snapshot`** on **`cartUpdated`** / **`wishlistUpdated`** (item counts + product names). (3) **Cloud sync** — after successful **`putCart`/`putWishlist`** in **`schedulePushCartWishlistToCloud`**, log **`cloud_sync`** with counts. (4) **Auth** — **`sign_in`** payloads include **`method`** (`password`, `session_restore`); **`sign_up`** (`supabase` | `local`) plus sign-in with **`afterSignUp`** where applicable. (5) **Cart UI** — **`open_cart_dropdown`**, **`cart_navigate`** (checkout vs bag). (6) **Wishlist** — **`add_to_cart`** from wishlist, **`remove_from_wishlist`**. (7) **Checkout** — **`checkout_start`** includes path + upgrade flag. (8) **Membership** — Stripe start (**`membership_checkout_start`**), upgrade nav (**`membership_upgrade_checkout`**), Stripe return (**`membership_stripe_return`**), **`redeem_points`** on both reward lists, **`sign_out`** before menu sign-out **`clearAppAuth`**. (9) **Reviews** — **`sign_out`** before **`clearAppAuth`** on leave-review flow. (10) **`bawTrackActivity`** **`CustomEvent`** + **`emitClientActivityEvent`** for optional decoupled hooks. (11) **Admin labels** — **`formatEventLabel`** extended for new event types and payload hints. (12) **Build** — **`sessionRestore.ts`** removed unused **`res`** from **`fetch`** (**TS6133**).

- **Changes:** **`src/utils/clientActivityBootstrap.ts`** (new), **`src/utils/activity.ts`**, **`src/App.tsx`**, **`src/utils/pushCartWishlistToCloud.ts`**, **`src/pages/sign-in/page.tsx`**, **`src/pages/admin/clients/page.tsx`**, **`src/pages/wishlist/page.tsx`**, **`src/components/DynamicCartIcon.tsx`**, **`src/components/CartDropdown.tsx`**, **`src/pages/checkout/page.tsx`**, **`src/pages/account/membership/page.tsx`**, **`src/pages/account/reviews/leave-review-order/page.tsx`**, **`src/utils/sessionRestore.ts`**, **`motherboard/MEMORY.md`** (this entry).

- **Conventions:** Prefer **`trackActivity`** (or **`emitClientActivityEvent`**) at real user-action boundaries; heavy browsing is covered by **`view_page`** + debounced snapshots so the feed stays readable.

---

## 2026-03-27 — Admin Marketing: newsletter tab on same row as other tabs

Summary: User wanted the **NEWSLETTER** tab on **Admin → Marketing** to sit on the **same line** as **AFFILIATE**, **CHALLENGES**, and **SPECIAL OFFERS**, not wrapped below.

- **Cause:** Tab row used **`flex flex-wrap`**, so the fourth label wrapped on narrow **`max-w-md`** widths.

- **Changes:** **`src/pages/admin/marketing/page.tsx`** — tab row is **`flex-nowrap`** with **`flex-shrink-0`** + **`whiteSpace: nowrap`** on each button; outer wrapper uses **`overflow-x: auto`** (hidden scrollbar where supported) so all four stay one line, with horizontal swipe/scroll only if the viewport is too tight.

- **Changes:** `src/pages/admin/marketing/page.tsx`, `motherboard/MEMORY.md` (this entry).

---

## 2026-03-27 — Account Settings: “Sales” → “Alerts”; profile ALERTS card icon respects toggle

Summary: User asked to rename **Sales** to **Alerts** on **Account → Settings** notifications, and to **hide the rose notification icon** on the **ALERTS** card on **Account → Profile** when that preference is **off**.

- **Changes:** (1) **`src/pages/account/settings/page.tsx`** — notification row label **Sales** → **Alerts** (still persists **`notificationSales`** / same toggle + **`persistNotificationPrefs`**). (2) **`src/pages/account/page.tsx`** — **`cardHasNotifications('ALERTS')`** returns **`false`** when **`notificationSales === false`**, or **`notification_sales === false`** if camel is unset (default remains on). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Account Settings: RESET PASSWORD below field, right-aligned

Summary: User wanted **RESET PASSWORD** **below** the masked password field (not beside it), **right-aligned** under the input on **Account → Settings**. (An earlier pass had placed it in one row with the input; user corrected that.)

- **Changes:** **`src/pages/account/settings/page.tsx`** — collapsed state: full-width password **`input`**, then a row **`display: flex`**, **`justifyContent: flex-end`**, **`marginTop: 6px`** with the **RESET PASSWORD** button. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Activity tracking inventory + admin client stats label spacing

Summary of the **whole conversation so far** in this chat: (1) User asked what **“enumerate and wire call sites one by one”** meant and for a **full flow list** of **`trackActivity`** / what’s missing — answered with definitions, a **step-by-step table** of wired flows, and a **gaps** list (**`cancel_order`**, build-a-wig **`add_to_cart`**, shopping bag, **`sign_out`** coverage, etc.). (2) User asked for **20px more space above** the **ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP** label row on **Admin → Clients → client details**.

- **Changes:** **`src/pages/admin/clients/page.tsx`** — in the 4-column stats grid, label **`<p>`** **`marginTop`** under the red values increased from **`4px`** to **`24px`** (+20px above ORDERS, POINTS, TOTAL SPENT, MEMBERSHIP). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout: extra space above loyalty points line

Summary: User asked for **10px more spacing above** the checkout subtotal loyalty copy (**“SIGN IN TO EARN…”** / **“YOU’RE EARNING … LOYALTY POINTS…”**).

- **Changes:** **`src/pages/checkout/page.tsx`** — wrapper **`div`** around the loyalty **`<p>`** (comment **`{/* Loyalty Points Text */}`**) **`marginTop`** increased from **`10px`** to **`20px`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Unit product pages: 10px above DETAILS / SHIPPING / POLICY tabs

Summary: User asked for **10px spacing above** the **DETAILS**, **SHIPPING**, **POLICY**, etc. tab row on the **six** ready-made unit product pages (**Noir**, **Blanco**, **Soft Wave**, **Beach Wave**, **Soft Curl**, **Ocean Curl**).

- **Changes:** On each page’s **`{/* Tabs Section */}`** outer **`div`** (the one with **`mt-6`** and **`translateY`**), added **`paddingTop: '10px'`** in the inline **`style`** next to the existing **`transform`**. Files: **`src/pages/straight/noir/page.tsx`** (also has **`noir-product-shots-tabs`** and **`-66px`** translate), **`src/pages/straight/blanco/page.tsx`**, **`src/pages/wavy/soft-wave/page.tsx`**, **`src/pages/wavy/beach-wave/page.tsx`**, **`src/pages/curly/soft-curl/page.tsx`**, **`src/pages/curly/ocean-curl/page.tsx`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin client details: tap profile photo to enlarge (match Account Profile)

Summary: User wanted **Admin → Clients → client details** profile photo to **open an enlarged view** using the **same styling** as **Account → Profile** (frosted white overlay, circular image, black border).

- **Changes:** **`src/pages/admin/clients/page.tsx`** — **`showEnlargedProfileImage`** state; reset with **`profilePhotoError`** when **`selectedClientEmail`** changes; **`selectedClientProfilePhotoSrc`** derived from **`profileImage` / `photo` / `profilePhoto` / `avatar`** (fallback **`/assets/profile-thumb.png`**); circular avatar wrapper is **`pointer`** + **`onClick`** when the image loaded (**`!profilePhotoError`**); fixed full-screen modal duplicated from **`src/pages/account/page.tsx`** ( **`rgba(255,255,255,0.6)`**, blur, **`zIndex: 9999`**, inner **`maxWidth/maxHeight 90%`**, **`img`** **`borderRadius: 50%`**, **`1.3px solid #000`**, **`objectFit: cover`**). Tap backdrop closes. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout cart strip: Futura for raw / cap / price (not Covered By Your Grace)

Summary: **Checkout** order-summary thumbnails showed **Covered By Your Grace** on **24″ RAW…**, **CAP SIZE**, and **price** even though only the **product name** should use that font. **Cause:** **`src/index.css`** rule **`[class*="thumbnail"] p { font-family: … !important }`** matched the wrapper class **`checkout-cart-thumbnails-center-lg`** (substring **`thumbnail`** in **`thumbnails`**), so all **`p`** tags inside got the script font and **beat inline styles**.

- **Changes:** **`src/pages/checkout/page.tsx`** — renamed wrapper + media query class to **`checkout-cart-items-center-lg`** (no **`thumbnail`** substring). Aligned **RAW** line with shopping bag: **`Futura PT Book`**, **9px**; **CAP SIZE**: **`Futura PT Medium`**, **10px**; **price**: **`Futura PT Book`**, **12px**, **`fontWeight: 600`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Vercel build: fix `clientActivityBootstrap` + `ActivityEventType` TS errors

Summary: **`npm run build`** (**`tsc --noEmit`**) failed on Vercel with **`clientActivityBootstrap.ts`**: **`reduce`** accumulator **`s`** inferred as **`unknown`**; **`trackActivity(t, …)`** with **`t: string`** not assignable to **`ActivityEventType`**.

- **Changes:** (1) **`src/utils/clientActivityBootstrap.ts`** — cart/wishlist **`reduce`** uses **`(acc: number, i: unknown)`** and **`return acc + …`**. (2) **`bawTrackActivity`** handler: **`import isActivityEventType`**, **`if (!isActivityEventType(t)) return`** then **`trackActivity(t, …)`**. (3) **`src/utils/activity.ts`** — **`ACTIVITY_EVENT_KEYS`** object **`satisfies Record<ActivityEventType, true>`** (exhaustive keys) + **`isActivityEventType`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Shift founder / full admin privileges from ayoteenz to kateenaarmstrong@gmail.com

Summary of the **whole conversation so far** in this chat: User asked to move **all** privileges that were tied to the **ayoteenz** admin account to **`kateenaarmstrong@gmail.com`**: account profile (rewards toggles, ADMIN: FOUNDER, loyalty/vouchers/mock digital cash), and **full `/admin`** + API admin allow lists.

- **Decisions / outcomes:** The **founder-privileged** identity (tier/subscription **`localStorage` overrides**, **`isMockDataAccount`** eligibility, **`isAyoteenzAdminAccount`** checks, default **protected delete** account) now uses **`kateenaarmstrong@gmail.com`**. **`ayoteenz@yahoo.com`** was **removed** from default admin/sync lists so it no longer gets those behaviors unless explicitly added via **`VITE_ADMIN_EMAILS` / `ADMIN_EMAILS`**.

- **Changes:**
  - **`src/utils/adminAuth.ts`** — **`DEFAULT_ADMIN_EMAILS`** includes **`kateenaarmstrong@gmail.com`** instead of ayoteenz; new **`FOUNDER_PRIVILEGED_ADMIN_EMAIL`**; **`AYOTEENZ_ADMIN_EMAIL`** aliases it for backward-compatible imports; **`isAyoteenzAdminAccount`** compares against the founder email; comments updated.
  - **`api/_lib/adminAuth.ts`**, **`api/admin/sync-profile.ts`** — default allow lists aligned with the new Gmail address.
  - **`api/delete-account.ts`** — default **`PROTECTED_ACCOUNT_EMAIL`** fallback is **`kateenaarmstrong@gmail.com`** (still overridable by env).
  - **`src/components/AdminGuard.tsx`**, **`src/App.tsx`**, **`src/utils/clearTestDataForNonAdmin.ts`**, **`src/utils/syncFromApi.ts`** (comment), **`src/pages/account/page.tsx`** (comments), **`.env.example`**, **`motherboard/CORE.md`**.

- **Conventions:** If **`VITE_ADMIN_EMAILS` / `ADMIN_EMAILS`** are set in deploy, **include every admin’s real Supabase email**; defaults in code no longer list ayoteenz. **`isAyoteenzAdminAccount`** remains the function name but means **founder-privileged** email only.

---

## 2026-03-27 — Client activity: no SPA `view_page` spam; bag / build-a-wig / sources / profile sections

Summary: User wanted **each meaningful action** tracked **separately** (account, product, shop/cart/wishlist flows) and **not** generic **page navigation** / path spam like **`view_page`** on every route. **`profile_update`** should not read like “changed name from X to Y” in the feed — use **section** labels instead of logging every URL.

- **Changes:** (1) **`src/App.tsx`** — removed **`trackClientViewPage`** on **`location`** changes. (2) **`src/utils/activity.ts`** — new **`ActivityEventType`**: **`cart_item_updated`**, **`save_for_later`**, **`move_saved_to_cart`**, **`remove_saved_item`**. (3) **`src/utils/clientActivityBootstrap.ts`** — comment that **`trackClientViewPage`** is legacy / unused from App. (4) **`src/pages/shopping-bag/page.tsx`** — **`add_to_cart`** / **`remove_from_cart`** with **`source: 'shopping_bag'`** + **`change`** for qty up/down / line remove; **`save_for_later`**, **`move_saved_to_cart`**, **`remove_saved_item`**. (5) **`src/pages/build-a-wig/page.tsx`** — **`add_to_cart`** **`source: 'build_a_wig'`** on new add; **`cart_item_updated`** with **`context`** wishlist / saved_for_later / cart on edit save. (6) **`src/pages/wishlist/page.tsx`** — **`remove_from_cart`** when removing a line from the mini-bag on wishlist (**`source: 'wishlist_page'`**). (7) **`src/components/CartDropdown.tsx`** — **`remove_from_cart`** includes **`source: 'cart_dropdown'`**. (8) Six unit **`page.tsx`** files — **`source: 'product_page'`** on **`view_product`**, **`add_to_cart`**, **`add_to_wishlist`**. (9) **`src/pages/account/page.tsx`** — **`profile_update`** with **`section: 'photo'`**; **`account/settings/page.tsx`** — **`section: 'settings'`** on user-driven PATCH only; initial settings **`pushFullSettingsProfileToCloud`** on mount uses **`recordActivity: false`** so opening Settings doesn’t emit a bogus update. (10) **`src/pages/admin/clients/page.tsx`** — **`formatEventLabel`**: labels for new types; **`view_page`** path only for **`view_page`**; **`profile_update (section)`**; append **`source`**, **`change`**, **`context`** where present. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout order-summary lines: Futura sizes back to pre–shopping-bag values

Summary: After fixing the **`[class*="thumbnail"] p`** font override, checkout RAW / CAP / price were aligned to **shopping bag** sizes (**9px / 10px / 12px**). User reported checkout should stay **slightly smaller** (~1–2px) than bag; restore **original checkout** typography while keeping **Futura** (not script).

- **Changes:** **`src/pages/checkout/page.tsx`** — under-thumbnail lines: **RAW** **`Futura PT Medium` `8px`**; **CAP SIZE** **`Futura PT Demi` `9px`**; **price** **`Futura PT Medium` `10px`** **`fontWeight: 500`**. Product name line unchanged (**Covered By Your Grace**). Class **`checkout-cart-items-center-lg`** unchanged. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout: space above thumbnails only (loyalty margin clipped strip)

Summary: **`marginTop: 20px`** on the loyalty line increased **subtotal** height in a **flex** card; the **flex-1** body **shrank** and clipped the **180px** thumbnail row. User wanted **padding above thumbnails only**, not layout pressure from the loyalty block.

- **Changes:** **`src/pages/checkout/page.tsx`** — wrap the scroll strip in **`paddingTop: '10px'`** (above thumbnails only); body **`flexShrink: 0`** + **`minHeight: '190px'`** so the strip doesn’t shrink; loyalty wrapper **`marginTop`** back to **`10px`** (from **`20px`**). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin client details: stat labels vs space above red values

Summary: Earlier change set **ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP** label **`marginTop`** to **`24px`**, which added **20px between the red numbers and the captions** (wrong). User wanted **+20px above the red value row** only, with **~4px** between value and label again.

- **Changes:** **`src/pages/admin/clients/page.tsx`** — label **`<p>`** **`margin`** restored to **`4px 0 0 0`**; the **4-column stats grid** **`marginTop`** increased from **`12px`** to **`32px`** (**+20px** above the red numbers). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Account profile: remove ADMIN: FOUNDER debug row

Summary: User asked to remove **profile debug text below the profile photo** and noted prior expectation that debugging was stripped from the site. The visible **ADMIN: FOUNDER** line on **Account → Profile** (founder-privileged admin only, tappable to **`/admin/dashboard`**) read as internal/testing UI.

- **Changes:** **`src/pages/account/page.tsx`** — removed the conditional **`ADMIN: FOUNDER`** **`<p>`** under the membership line. Founder-privileged behavior (tier toggles, mock data, membership overrides, **`/admin`** access) is unchanged; admins can still open **`/admin/dashboard`** directly or via bookmarks. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Careers & admin workers: role header SVGs + expand-on-tap cards

Summary: User wanted **role-specific header icons** on **Brand → Careers** and **Admin → Workers** using SVGs under **`public/assets/`** (personal assistant, creative director, accountant, lawyer, graphic designer, photographer, videographer, makeup artist, hair stylist). The **10th roster role** (social media planner) uses **`/assets/media-icon.svg`**. **Admin workers** should match **careers-style** behavior: **full role details (and applicants)** only after **tapping the card** to expand, not always visible below the header.

- **Context:** Replace generic account icon in role card headers; align workers page expand/collapse with careers (tap card to toggle content).
- **Decisions / outcomes:** Central map **`workerRoleHeaderIconSrc(workerId)`** in **`src/utils/workerRoleHeaderIcon.ts`**. **`RoleCardSectionHeader`** accepts optional **`iconSrc`** (default **`/assets/NOIR/account-icon.svg`**) with the existing red-tint **CSS filter**. **Careers** job list: **`expandedListJobId`** — collapsed row shows title, openings, **TAP FOR ROLE DETAILS & APPLY**; expanded shows all sections + **APPLY** inside the card; **Escape** clears expansion when not in apply flow; **`openApply`** clears expansion. **Admin workers:** **`HOURS` / `PAY` / about / duties / tasks / notes** **`<dl>`** only when **`isOpen`**; applicants block when open.
- **Changes:** **`src/utils/workerRoleHeaderIcon.ts`** (new), **`src/components/RoleCardSectionHeader.tsx`**, **`src/pages/brand/careers/page.tsx`**, **`src/pages/admin/workers/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Vercel build: TS6133 unused `headerIcon` on admin workers

Summary: **`npm run build`** on Vercel failed with **`TS6133`**: **`headerIcon`** declared in **`src/pages/admin/workers/page.tsx`** but never read (likely a branch where **`iconSrc`** was not wired to that variable).

- **Changes:** Removed **`const headerIcon`**; pass **`iconSrc={workerRoleHeaderIconSrc(w.id)}`** inline on both **`RoleCardSectionHeader`** usages. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Block sign-in until Supabase email is confirmed

Summary: User wanted **new sign-ups** unable to **log in** until they **confirm email** from Supabase; they should see the same **invalid email/password** modal as bad credentials, not access the app.

- **Implementation:** **`src/utils/supabase.ts`** — **`isSupabaseUserEmailConfirmed(user)`** (requires **`email_confirmed_at`** when **`user.email`** is set) and **`signOutIfSessionEmailUnconfirmed(client, session, { clearAppAuth? })`** (signs out Supabase; clears app auth by default). **`src/pages/sign-in/page.tsx`** — after successful **`signInWithPassword`**, if email not confirmed: sign out (no app clear), **`INVALID EMAIL OR PASSWORD.`** modal; session-restore **`getSession`** effect rejects unconfirmed the same way. Supabase errors mentioning **email not confirmed** map to the same message. **`src/main.tsx`**, **`src/App.tsx`**, **`src/components/AccountRouteGuard.tsx`**, **`src/pages/lobby/page.tsx`**, **`src/pages/account/page.tsx`** — run **`signOutIfSessionEmailUnconfirmed`** so restored sessions cannot bypass confirmation. **`motherboard/CORE.md`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin client details: +24px above red stats row

Summary: User asked for **another 24px** above the red **ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP** value row, on top of the earlier change that set the **4-column stats grid** **`marginTop`** from **`12px`** to **`32px`** (**+20px** above those values only).

- **Changes:** **`src/pages/admin/clients/page.tsx`** — stats grid **`marginTop`**: **`32px`** → **`56px`** (**+24px**). Comment updated to document the sequence. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Restore ADMIN: FOUNDER on profile (founder email only)

Summary: User asked to bring back the **ADMIN: FOUNDER** tag on **Account → Profile** that navigates to **`/admin/dashboard`**. It had been removed as “debug” text; they want it **only** for the **`kateenaarmstrong@gmail.com`** founder account.

- **Changes:** **`src/pages/account/page.tsx`** — re-added the tappable **ADMIN: FOUNDER** row under **…REWARDS MEMBER**, gated by **`isAyoteenzAdminAccount(userData)`** (same as **`FOUNDER_PRIVILEGED_ADMIN_EMAIL`** in **`adminAuth.ts`** → **`kateenaarmstrong@gmail.com`** only). **`motherboard/CORE.md`** (founder bullet mentions the row + email). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin workers runtime: ReferenceError `headerIcon`

Summary: Red **component failed to load** / **Can’t find variable: headerIcon** (Safari-style wording) on **Admin → Workers**. After removing **`const headerIcon`** for **`TS6133`**, one **`RoleCardSectionHeader`** still had **`iconSrc={headerIcon}`** while another used **`workerRoleHeaderIconSrc(w.id)`**, so the bundle referenced an undefined variable at runtime.

- **Changes:** **`src/pages/admin/workers/page.tsx`** — top card header **`iconSrc={workerRoleHeaderIconSrc(w.id)}`** (match applications block). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Delete account: fix flow; protect only founder Gmail

Summary: User could not delete accounts via **Account → Settings → DELETE ACCOUNT** and asked to **remove delete protection from ayoteenz** so **only `kateenaarmstrong@gmail.com`** is blocked.

- **Cause (likely):** **`DELETE`** requests with a **JSON body** are often **dropped or mishandled** by proxies/browsers; the API still worked when the body was missing, but **`deletedFrom`** and reliable routing mattered less than **401/503** from missing token or **`SUPABASE_SERVICE_ROLE_KEY`**. Client also used **`isAyoteenzAdminAccount`** for the block (same email as founder after the ayoteenz→Gmail migration, but ambiguous). **Fix:** send **`deletedFrom` as a query param**; parse **JSON errors** (403/500); gate UI with **`isProtectedFromAccountDeletion`** (**`PROTECTED_FROM_ACCOUNT_DELETION_EMAIL`** = founder Gmail only).

- **Changes:** **`src/utils/adminAuth.ts`** — **`PROTECTED_FROM_ACCOUNT_DELETION_EMAIL`**, **`isProtectedFromAccountDeletion`**. **`src/pages/account/settings/page.tsx`** — delete guard uses **`isProtectedFromAccountDeletion`** (not generic founder helper name). **`src/utils/api.ts`** — **`deleteAccount`** uses **`fetch(DELETE)`** with **`?deletedFrom=`** + **Bearer**, no body; maps **403** to message text. **`api/delete-account.ts`** — read **`deletedFrom`** from **query or body**; **403** only when protected email is non-empty and matches. **`.env.example`** — **`SUPABASE_SERVICE_ROLE_KEY`** note for delete + optional **`PROTECTED_ACCOUNT_EMAIL`**. **`motherboard/CORE.md`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Role card header icons: no CSS filter on pre-red SVGs + thicker strokes

Summary: **Brand Careers** (and shared **`RoleCardSectionHeader`**) showed **broken red squares** for worker role header icons. The header applies a **CSS filter** meant for **black NOIR** art; role SVGs already use **`#EB1C24`** strokes/fills, so the filter **corrupts** rendering in WebKit. User wanted icons to match **size** and **line weight** of the default header icon.

- **Decisions / outcomes:** Export **`roleHeaderIconApplyCssFilter(iconSrc)`** — **`false`** for paths in **`workerRoleHeaderIcon`** roster (pre-colored art); **`true`** for **`media-icon.svg`** (black fill) and everything else (e.g. **`NOIR/account-icon.svg`**). **`RoleCardSectionHeader`** sets **`filter`** only when that returns true; **`img`** uses resolved **`src`**. Stroke-based role SVGs (**personal-assistant, creative-director, lawyer, accountant, makeup-artist**): **`stroke-width`** **`0.5` → `1.15`** for readability at **~20px**.
- **Changes:** **`src/utils/workerRoleHeaderIcon.ts`**, **`src/components/RoleCardSectionHeader.tsx`**, five **`public/assets/*-icon.svg`** files, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Personal assistant role header: use `assistant-icon.svg`

Summary: User asked to replace the **personal assistant** header asset with **`assistant-icon.svg`** from **`public/assets/`** (worker id **`1`** — personal assistant / customer service).

- **Changes:** **`src/utils/workerRoleHeaderIcon.ts`** — id **`1`**: **`personal-assistant-icon.svg`** → **`assistant-icon.svg`**. **`public/assets/assistant-icon.svg`** — **`stroke-width`** **`0.5` → `1.15`** to align with other role header strokes. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Brand ambassador role (5 openings) + “More ways” header icon

Summary: User asked for a **brand ambassador** listing on **Brand → Careers** and **Admin → Workers**, using the same header graphic as **Account → Membership → “More ways to earn”** (`more-ways.svg`), with **5 openings** and job duties covering a **1-year contract**, monthly pay for **post/social goals**, **10% code / 5% keep**, **flat fees** on content tied to **conversions**, **50k+ combined followers**, **50% off invite-entry wig** (default specs) with **quota** for wig perks, **points** from **clicks / purchases / sign-ups** toward a **first free wig**, **quest** tiers (**12 / 24 / 48** code uses per **6 months** → **1–3 wigs**), **separate upgrade points**, and **top influencer EOY bonus/gift**.

- **Changes:** **`public/assets/more-ways-earn-icon.svg`** — copy of membership **`more-ways`** art for static **`/assets/...`** URLs. **`src/utils/workerRoleHeaderIcon.ts`** — worker id **`11`** → **`/assets/more-ways-earn-icon.svg`**. **`src/utils/adminWorkersDashboard.ts`** — new **`Brand ambassador`** row (**`id: '11'`**, **`openings: 5`**), **`aboutTheRole`**, **`requiredEducation`**, **`jobDuties`**, **`dailyTasks`**, pay/hours/contact placeholders aligned with other roles. Careers and admin workers both consume **`ADMIN_DASHBOARD_WORKERS`**, so they pick up the new card automatically. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout: +20px air above cart thumbnails (no loyalty margin change)

Summary: User said **checkout thumbnails were still clipped** and asked for **20px more space above** the thumbnail row, using **`paddingTop`** on the thumbnail wrapper (not loyalty **`marginTop`**).

- **Changes:** **`src/pages/checkout/page.tsx`** — wrapper above the horizontal cart strip: **`paddingTop`** **`10px` → `30px`** (**+20px**). Parent body **`minHeight`** **`190px` → `210px`** so **`paddingTop + 180px`** strip height still fits and the row is not squeezed/clipped. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout thumbnails: fix top clipping (layout, not only padding)

Summary: **Padding-only** fix did not stop **tops of cart thumbnails** from clipping. **Cause:** the strip used a **fixed `height: 180px`** plus **`overflow-hidden`**, while each tile was **`height: 150px`** with **image + multi-line copy** taller than the box; the inner row used **`height: 100%`** + **`alignItems: center`**, which **vertically centered** overflowing content inside a **clipped** viewport.

- **Changes:** **`src/pages/checkout/page.tsx`** — removed **`overflow-hidden`** from the cart **body** wrapper ( **`overflow: visible`** ). **Scroll strip:** **`height: auto`**, **`minHeight: 200px`**, **`overflowX: hidden`**, **`overflowY: visible`** (horizontal drag unchanged). **Inner flex:** dropped **`height: '100%'`**, **`alignItems: 'flex-start'`**, small **`paddingTop` / `paddingBottom`**. **Per-item column:** **`height: 'auto'`**, **`minHeight: '150px'`**, **`justifyContent: 'flex-start'`**. **`.checkout-cart-items-center-lg`:** **`align-items: flex-start`** (no **`height: 100%`**). Wrapper **`paddingTop`** **`30px` → `16px`** since vertical space now comes from intrinsic tile height. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout thumbnails: −12px space above strip

Summary: After fixing **vertical clipping**, user found **too much space above** cart thumbnails; asked to **reduce spacing above by 12px** without reintroducing a fixed vertical clip.

- **Changes:** **`src/pages/checkout/page.tsx`** — wrapper above the scroll strip **`paddingTop`** **`16px` → `4px`** (**−12px**). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Worker header icons: director + social manager assets

Summary: User asked to use **`director-icon.svg`** for **creative director** (worker id **`2`**) and **`social-manager-icon.svg`** for **social media manager** (id **`8`**) instead of **`creative-director-icon.svg`** and **`media-icon.svg`**.

- **Changes:** **`src/utils/workerRoleHeaderIcon.ts`** — id **`2`** → **`/assets/director-icon.svg`**, id **`8`** → **`/assets/social-manager-icon.svg`**; removed **`media-icon.svg`** special case in **`roleHeaderIconApplyCssFilter`** (all roster paths skip filter). **`public/assets/social-manager-icon.svg`** — **`stroke-width`** **`0.5` → `1.15`** for header size parity with other stroke role icons. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Worker id 8: re-point to `social-manager-icon.svg`

Summary: User said the **id `8`** icon change (**`media-icon.svg`** → **`social-manager-icon.svg`**) had **not taken effect** in their tree. **`workerRoleHeaderIcon.ts`** still had **`'8': '/assets/media-icon.svg'`** (likely merge/revert).

- **Changes:** **`src/utils/workerRoleHeaderIcon.ts`** — **`'8'`** → **`/assets/social-manager-icon.svg`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin clients: restore list scroll after closing details

Summary: User reported that **Admin → Clients** overview **jumped back to the top** (first client) after closing **client details**; they wanted the **same scroll position** as when they opened a row (e.g. client **#17**).

- **Cause:** The overview rows live in a **`max-height` + `overflow-y-auto`** container; opening details **unmounted** that node, so **`scrollTop` reset to 0** on return.
- **Changes:** **`src/pages/admin/clients/page.tsx`** — **`ref`** on the list viewport; **`openClientDetails`** saves **`scrollTop`** before **`setSelectedClientEmail`**; **`useLayoutEffect`** when returning to overview (**`selectedClientEmail === null`**) reapplies saved **`scrollTop`**; **`closeClientDetails`** centralizes back/close/block-return cleanup. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout thumbnails: −12px space above strip

Summary: After fixing **vertical clipping**, user found **too much space above** cart thumbnails; asked to **reduce spacing above by 12px** without reintroducing a fixed vertical clip.

- **Changes:** **`src/pages/checkout/page.tsx`** — wrapper above the scroll strip **`paddingTop`** **`16px` → `4px`** (**−12px**). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout thumbnails: −6px misread corrected (less space above)

Summary: **−6px** was misread as **`paddingTop: 10px`** (**16 − 6**), which **increased** space vs the prior **`4px`** wrapper. User clarified they wanted **less** space above thumbnails.

- **Changes:** **`src/pages/checkout/page.tsx`** — wrapper **`paddingTop`** **`10px` → `0px`**. Inner horizontal row **`paddingTop`** **`8px` → `2px`** (**−6px**). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout thumbnails: −6px more above strip

Summary: User asked to **reduce space above thumbnails by another 6px**.

- **Changes:** **`src/pages/checkout/page.tsx`** — thumbnail block wrapper **`marginTop: '-6px'`** (with **`paddingTop: 0`** unchanged). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout: hide loyalty line on subscription upgrade

Summary: User asked to remove **“you’re earning X loyalty points…”** (and the signed-out **sign in to earn** variant) on **subscription upgrade checkout only** — memberships don’t earn that points line.

- **Changes:** **`src/pages/checkout/page.tsx`** — wrap the loyalty block in **`!isSubscriptionUpgrade`**; simplified signed-in **`basePoints`** (no redundant **`isSubscriptionUpgrade`** branch). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Profile photo reset after sign-out: cause + fix

Summary: User asked **why profile photos reset** after **sign out → sign in**. **Cause:** **`clearAppAuth()`** clears **`currentUser`**, but **`registeredUsers`** still holds the saved row. **`syncProfileFromApi`** / **`applyMinimalUserToStorage`** only treated **`currentUser`** as **`existing`**, so after sign-out **`sameEmail` was false**, merge started from **`{}`**, and when **`getProfile()`** returned empty **`profile_image`**, **`profileImage` in localStorage** fell through to the **default thumb**—wiping the prior photo even though **`registeredUsers`** still had it.

- **Changes:** **`src/utils/syncFromApi.ts`** — added **`getLocalUserSnapshotForEmail(email)`** (prefers matching **`currentUser`**, else matching **`registeredUsers`** row). **`syncProfileFromApi`** and **`applyMinimalUserToStorage`** use it for **`existing` / `sameEmail`** so re-login **preserves local photo** when the API omits image data. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Rewards vs “Membership” nav; Stripe CTA visibility + on-page hints

Summary of the **whole conversation so far** in this chat (including handoff): User clarified there is **no Account → Membership** in the app; they use **Account → Rewards** for the subscription upgrade flow and still did not see **Subscribe with card (Stripe)** on “step 3.” Prior work fixed the Stripe return path to **`/account/rewards`** (not `/account/membership`) in **`createStripeMembershipCheckoutSession`** default in **`src/utils/api.ts`**, and docs were pointed at Rewards → open chart → tier → CTA under **CONFIRM SUBSCRIPTION**.

- **Context:** Align naming with the real UI; explain why the Stripe button is hidden; reduce confusion when env/API/session conditions fail.
- **Outcomes:** **Account → Rewards** at **`/account/rewards`** is the correct place (same **`MembershipPage`**). The Stripe button renders only when **`showPremiumView`** (premium chart open), **`stripeMembershipAvailable`** (**`GET /api/stripe/membership-available`** → **`available: true`**: **`STRIPE_SECRET_KEY`** + all three **`STRIPE_PRICE_ID_*`** on the server), and **`hasSupabaseSession`** (**Supabase JWT** via **`getAccessToken()`**—not local-only admin fallback without a session). Tier must be chosen (**SELECT**); button is **below CONFIRM SUBSCRIPTION** (and disabled until a tier is selected).
- **Changes:** **`src/pages/account/membership/page.tsx`** — after availability fetch completes (**`stripeAvailabilityLoaded`**), show short gray copy when Stripe is unavailable (server config) or when Stripe is available but there is **no Supabase session** (sign in with Supabase email). **`motherboard/CORE.md`** — one bullet under **Key flows** documenting Rewards path, no “Membership” nav, and Stripe visibility rules. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Stripe membership CTA moved to `/checkout/upgrade` only

Summary: User asked for **Stripe subscription functionality only on the subscription checkout page**, not on **Account → Rewards**.

- **Changes:**
  - **`src/pages/account/membership/page.tsx`** — removed all Stripe UI, availability/session fetches, **`handleStripeSubscribe`**, **`useSearchParams`** / **`?stripe=success`** handling, and related **`api` / `syncFromApi`** imports. Rewards flow unchanged: chart → **CONFIRM SUBSCRIPTION** → **`/checkout/upgrade`** via existing **`localStorage`** + **`navigate`**.
  - **`src/pages/checkout/page.tsx`** — on **`isSubscriptionUpgrade`** only: fetch **`/api/stripe/membership-available`** + **`getAccessToken()`**, show the same unavailable / sign-in hints and **Subscribe with card (Stripe)** button above **CONFIRM ORDER**; **`handleStripeMembershipSubscribe`** uses tier from **`cartItems[0].subscriptionTier`**. Stripe return: **`/checkout/upgrade?stripe=success`** (with optional **`session_id`** dedupe via **`sessionStorage`**) → **`syncProfileFromApi()`** → clear upgrade **`localStorage`** keys → **`navigate('/account/rewards', { replace: true })`**.
  - **`src/utils/api.ts`** — **`createStripeMembershipCheckoutSession`** default **`returnPath`** → **`/checkout/upgrade`**.
  - **`api/stripe/create-checkout-session.ts`** — default / invalid **`returnPath`** fallback → **`/checkout/upgrade`** (was **`/account/membership`**).
  - **`docs/STRIPE_MEMBERSHIP_SETUP.md`** §4 — documents checkout-only Stripe CTA and post-success flow.
  - **`motherboard/CORE.md`** — Rewards vs **`/checkout/upgrade`** Stripe placement updated.
  - **`src/constants/subscriptionPricing.ts`** — comment fix (Rewards, not “Membership”).
  - **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Checkout discount input placeholder: “REFERRAL CODE”

Summary: User asked to change checkout **placeholder** copy to **“REFERRAL CODE, DISCOUNT CODE OR GIFT CARD”** (add **“code”** after referral).

- **Changes:** **`src/pages/checkout/page.tsx`** — discount code **`input`** **`placeholder`** updated (only occurrence in **`src`**). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Founder admin profile “wiped”; sync merge + role

Summary: User (**kateenaarmstrong** admin) saw **Account** profile/settings data reset, **ADMIN: FOUNDER** and **Rewards** tier/membership toggles gone—“like the account no longer exists.”

- **Why (root causes):**
  1. **`syncProfileFromApi`** only used **`currentUser`** as the merge base when emails matched. If **`currentUser` was missing or a different email** (backup restore, race, partial clear), merge started from **`{}`**, so a **sparse Supabase `profiles` row overwrote** **`registeredUsers`** and wiped local name/socials/membership fields.
  2. **`ADMIN: FOUNDER` / Rewards toggles** depend on **`isAyoteenzAdminAccount(userData)`** → email must be exactly **`kateenaarmstrong@gmail.com`**. Signing in with **`kateena.armstrong@frontalslayer.com`** (the separate **mock “Kateena”** admin email in code) is **not** founder—no FOUNDER row, different mock rules.
  3. **`role`** in merged user was **`admin` only when `isAdminEmail(email)`**. If **`VITE_ADMIN_EMAILS`** is set and **omits** the founder Gmail, **`role`** could become non-admin → **`isMockDataAccount`** (requires founder + admin role or admin email) turns **off**, changing premium/mock behavior.
- **Changes:** **`src/utils/syncFromApi.ts`** — merge base falls back to **`getLocalUserSnapshotForEmail(email)`** when **`currentUser` doesn’t match API email;** set **`role` to `admin` when `isAdminEmail` OR `isAyoteenzAdminAccount`;** after preserve loop, reapply **`adminTierOverride` / `adminSubscriptionOverride`** from localStorage for those users (parity with **`applyAdminSyncPayload`**). **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Sign-in after sign-out: profile “empty” except photo (`applyMinimalUserToStorage`)

Summary: User reported that after **sign out → sign in**, **name, email in UI, admin tag, Rewards toggles** disappeared while **profile photo** still showed—like the account reset except the image.

- **Cause:** In **`applyMinimalUserToStorage`**, when **`hasRicherStoredIdentity`** was true (stored **`registeredUsers`** row had name/birthday/image but Supabase minimal user did not), the code **returned early** after setting **`isSignedIn`** and **`profileImage`** only. **`clearAppAuth()`** on sign-out removes **`currentUser`**, so that path left the user **signed in with no `currentUser`** → React **`userData`** null/empty → no email match for founder UI, no admin row, while **`profileImage`** still displayed from the separate key.
- **Changes:** **`src/utils/syncFromApi.ts`** — in that branch, **rebuild `currentUser`** from **`existing` + session `id`/`email`**, reapply admin **`role`** and tier/subscription overrides from localStorage, update **`registeredUsers`**, then **`persistAuthBackup()`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — `GET /api/stripe/membership-available` 500 on Vercel

Summary: **`https://fsbw.vercel.app/api/stripe/membership-available`** returned **FUNCTION_INVOCATION_FAILED** (500) instead of JSON.

- **Cause:** The handler imported **`../_lib/stripeMembership`**. Other API routes (`api/profile.ts`, `api/special-offer-config.ts`) document that importing **`api/_lib`** can trigger **Vercel bundling resolution/runtime failures** for some serverless functions.
- **Changes:** **`api/stripe/membership-available.ts`** — removed `_lib` import; inlined the same env check as **`membershipStripeConfigured()`**; added **`sendJson`** + top-level **`try/catch`**. **`docs/STRIPE_MEMBERSHIP_SETUP.md`** — troubleshooting subsection. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Photo sync fix vs founder admin data (clarify + harden)

Summary: User asked whether **`getLocalUserSnapshotForEmail`** / profile merge **reset** **`kateenaarmstrong@gmail.com`** admin privileges (**ADMIN: FOUNDER**, Rewards tier/sub toggles, settings). **Answer:** That change **does not strip** admin data—it **adds** **`registeredUsers`** as merge base when **`currentUser`** is missing so **fewer** fields are wiped when the API is sparse; **`syncProfileFromApi`** already forces **`role: admin`** and reapplies **`adminTierOverride` / `adminSubscriptionOverride`** for founder + env admins.

- **Real causes of “wiped” feel (if it happened):** wrong email (**`kateena.armstrong@frontalslayer.com`** is not founder), **`VITE_ADMIN_EMAILS`** omitting founder Gmail so older **`buildMinimalUserFromSupabaseSession`** left **`role`** undefined, sparse API overwrite for fields **outside** the preserve list, or cleared **`registeredUsers` / site data**. **Sign-out does not clear** **`adminTierOverride`** / **`adminSubscriptionOverride`**.
- **Follow-up changes:** **`src/utils/syncFromApi.ts`** — **`buildMinimalUserFromSupabaseSession`**: **`role: admin`** when **`isAyoteenzAdminAccount`** (not only **`isAdminEmail`**). **`applyMinimalUserToStorage`**: after merge, set **`role: admin`** and reapply tier/sub overrides for founder + env admins (parity with full profile sync). **`applyAdminSyncPayload`**: **`role`** and override reapply use **`isAdminEmail` OR `isAyoteenzAdminAccount`**. **`buildProfilePayloadForBackend`**: set **`role: admin`** for founder too. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Account profile photo: remove “device only” status popup

Summary: User asked to **remove the popup** that said **photo saved on this device only** (cloud upload failed) when changing the **Account** profile photo.

- **Changes:** **`src/pages/account/page.tsx`** — when **`uploadProfileImage`** fails and **`patchProfileWithRetryQueue`** also fails, **no longer** call **`openProfileImageStatusPopup`** with that message; **`console.warn`** only. Other photo toasts (**PHOTO SAVED.**, **PHOTO SAVED LOCALLY.**, **PHOTO SAVE FAILED.**) unchanged. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin client details: empty cart/wishlist vs local; activity not showing

Summary: User reported **kateenaarmstrong** (founder) had **2 cart** and **1 wishlist** items in the app but **Admin → Clients → client details** **Cart** / **Wishlist** tabs showed **empty**; also said **track activity** was **not implemented**.

- **Why cart/wishlist looked empty:** Tabs load **only from Supabase** via **`GET /api/admin/cart`** and **`GET /api/admin/wishlist`** (service role). The shopping UI uses **`localStorage`** (`cartItems`, `wishlistItems`). **`schedulePushCartWishlistToCloud`** debounces **PUT /api/cart** and **PUT /api/wishlist** on navigation / **`cartUpdated`** / **`wishlistUpdated`**; failures are **caught and ignored** in **`pushCartWishlistToCloud.ts`**, so the cloud row can stay **empty** while the browser still has items. The admin UI also treated **`adminCartByUserId[id] === undefined`** as **`[]`**, so it showed **empty before the fetch finished** (no real loading state).
- **Why activity looked “not implemented”:** **`trackActivity`** is wired in many places and **`registerGlobalClientActivityListeners`** runs from **`App`**, but **`POST /api/activity`** inserts into **`user_activity`**. There was **no repo migration** for that table; inserts can **500**, and **`trackActivity`** **swallows errors** in production (so nothing appears in admin).
- **Changes:** **`src/pages/admin/clients/page.tsx`** — when opening a client whose email matches **`currentUser`**, call **`schedulePushCartWishlistToCloud()`**; **loading** while cart/wishlist fetch not yet stored; if cloud list is empty but **same browser + same email**, **fallback** to **`localStorage`** cart/wishlist with a short “this browser / check PUT” note; **activity** tab shows **LOADING** until fetch completes and an empty-state hint about **`user_activity`** + failed POSTs. **`src/utils/activity.ts`** — in **`import.meta.env.DEV`**, **`console.warn`** on **`recordActivity`** failure. **`supabase/migrations/20260327210000_user_activity.sql`** — creates **`user_activity`**, index, RLS **insert/select own** for **`authenticated`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin client details: broken social links (double instagram.com)

Summary: User reported **invalid social URLs** on **Admin → Clients → client details** (e.g. **`instagram.com/instagram.com/vexedmental`** instead of **`instagram.com/vexedmental`**).

- **Cause:** **Account → Settings** (and **sign-up**) saved socials as **`instagram.com/${stripAt(input)}`** without stripping an already-present **`instagram.com/`** (or **`https://…`**) prefix when users pasted URLs. **`getSocialUrl`** in admin then prepended **`https://instagram.com/`** again, producing doubled hosts in the href.
- **Changes:** **`src/utils/socialLinks.ts`** — **`stripSocialPlatformPrefixes`**, **`profileSocialStorageValue`** (normalized **`facebook.com/…`** etc. for PATCH), **`socialStorageToHttpsUrl`** (admin links). **`src/pages/account/settings/page.tsx`** — **`parseSocialHandle`** uses strip loop; **`pushFullSettingsProfileToCloud`** / **`persistSocials`** use **`profileSocialStorageValue`**. **`src/pages/sign-in/page.tsx`** — sign-up metadata uses **`profileSocialStorageValue`**. **`src/pages/admin/clients/page.tsx`** — removed local **`getSocialUrl`**; uses **`socialStorageToHttpsUrl`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Founder-only dummy card at product checkout (QA)

Summary: User wanted **only** the founder admin account (**`kateenaarmstrong@gmail.com`**, **`isAyoteenzAdminAccount`**) to complete **in-app product checkout** with a **dummy/test card** while the rest of the flow stays identical (orders in **`userOrders_*`**, points on the order, summary, reviews path, etc.) for pre-deploy bug-hunting.

- **Decisions:** Dummy PAN is **`4242424242424242`** (**`FOUNDER_CHECKOUT_DUMMY_PAN`**). Allowed only when **signed in** as founder **and** the **checkout email field matches** that session’s email (prevents unlocking dummy mode with a different email). Everyone else must pass **Luhn + length (13–19)** and basic **MM/YY|MM/YYYY** exp plus **3–4 digit** CVN. Non-founder using the dummy PAN gets an explicit error. Summary line shows **`VISA (FOUNDER TEST) ENDING IN 4242`** when dummy is used; **`trackActivity('founder_test_checkout_order', { orderNumber })`** fires on confirm.
- **Changes:** **`src/utils/checkoutCardValidation.ts`** (new) — **`validateCheckoutCardInput`**, **`canUseFounderDummyCheckout`**, exports. **`src/pages/checkout/page.tsx`** — founder-only hint under **PAYMENT**, card validation after required fields, payment label + activity. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin Activity tab: local backup + self-view merge (like cart/wishlist)

Summary: User asked that the **Activity** tab on **Admin → Clients → client details** behave like **cart/wishlist** for **kateenaarmstrong** (tons of on-site activity not visible when cloud **`user_activity`** / POST fails).

- **Changes:** **`src/utils/activity.ts`** — on **`POST /api/activity`** **failure** (not 401), append to **`localStorage`** key **`baw_activity_local_backup`** (capped); **`readLocalActivityForEmail(email)`** returns rows for merge. **`trackActivity`** uses **`.then`/`.catch`** so 401 still does not backup. **`src/pages/admin/clients/page.tsx`** — when **selected client email === `currentUser` email** on this device: merge **server** activity + **local backup**, sort by time; inject **`device_bag_status`** row from **`cartItems` / `wishlistItems`** counts (live preview); **`trackActivity('cart_snapshot'|'wishlist_snapshot', { source: 'admin_client_details_self' })`** after **450ms** when opening own row (nudge server like cart push); labels/captions for local-only rows; empty-state copy mentions local merge. **`motherboard/MEMORY.md`** (this entry).
