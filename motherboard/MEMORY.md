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
