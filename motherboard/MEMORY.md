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

## 2026-03-27 — Founder "VIEW AS CLIENT" profile + rewards (clean hub)

Summary: User wanted a **VIEW AS CLIENT** control on **Account → Profile** (same red **9px** styling as **LOAD GIFT CARD**) that toggles a persisted mode for **`kateenaarmstrong@gmail.com`** only: less mock/test chrome on the **profile hub** and **Rewards** while **checkout dummy card**, **orders**, and **loyalty math** stay as implemented.

- **Storage / API:** **`FOUNDER_ACCOUNT_VIEW_AS_CLIENT_KEY`** (`baw_founder_account_view_as_client`) in **`src/utils/adminAuth.ts`**. **`founderAccountViewAsClientChanged`** custom event keeps tabs in sync with Account toggle.
- **Account profile (`src/pages/account/page.tsx`):** **`profileUsesMockChrome`** = mock founder minus (founder ∧ view-as-client). Hides **ADMIN: FOUNDER**, uses **stored** membership for the line (no **`getEffectiveSubscriptionTier`** on-profile), **concierge** only if real premium or admin test mode off, **review count** + **calculateTier** + digital/voucher **mock history** fallbacks follow client logic; **voucher** row hidden in client view; **gift-card top-up** effect skipped in client view; **alerts** merge uses empty voucher fields for notification generation. Toggle label: **VIEW AS CLIENT** / **VIEW AS ADMIN PROFILE** — rendered **under the profile photo**, **below CHANGE / RESET** or **CHANGE PHOTO** (not beside **LOAD GIFT CARD**).
- **Rewards (`src/pages/account/membership/page.tsx`):** **`showTierColorsForAdmin`** false in client view → hides **SILVER/RED/BLACK** and **Standard / 3 / 6 / 12** toggle rows. Mock **tier progress**, **affiliate points**, **subscription end/tier** shortcuts, and **`hasEffectivePremium`** use real stored data when client view; **`getNextTierProgress`** uses profile **`lastKnownTier_`** / user fields instead of **`getEffectiveTierName`** overrides; **included benefits** IIFE uses **`userData.subscriptionTier`** not override when client view.
- **Out of scope:** **Settings** page unchanged. Subpages (orders, concierge, etc.) still navigable; data in **localStorage** is not deleted.
- **Changes:** **`adminAuth.ts`**, **`account/page.tsx`**, **`membership/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin Activity tab: local backup + self-view merge (like cart/wishlist)

Summary: User asked that the **Activity** tab on **Admin → Clients → client details** behave like **cart/wishlist** for **kateenaarmstrong** (tons of on-site activity not visible when cloud **`user_activity`** / POST fails).

- **Changes:** **`src/utils/activity.ts`** — on **`POST /api/activity`** **failure** (not 401), append to **`localStorage`** key **`baw_activity_local_backup`** (capped); **`readLocalActivityForEmail(email)`** returns rows for merge. **`trackActivity`** uses **`.then`/`.catch`** so 401 still does not backup. **`src/pages/admin/clients/page.tsx`** — when **selected client email === `currentUser` email** on this device: merge **server** activity + **local backup**, sort by time; inject **`device_bag_status`** row from **`cartItems` / `wishlistItems`** counts (live preview); **`trackActivity('cart_snapshot'|'wishlist_snapshot', { source: 'admin_client_details_self' })`** after **450ms** when opening own row (nudge server like cart push); labels/captions for local-only rows; empty-state copy mentions local merge. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Account shipping: optional APT, UNIT, ETC on add address

Summary: User asked for an optional **APT, UNIT, SUITE** field (no asterisk, no placeholder, same input styling as other fields) **below ADDRESS** on **Account → Shipping** when **add new address** is open.

- **Changes:** **`src/pages/account/shipping/page.tsx`** — **`AddressEntry.aptSuite`**, **`newAptUnit`** state; label **APT, UNIT, SUITE** (optional); persisted on save; cleared on cancel/success; list display shows apt line under street; duplicate/remove matching includes **`aptSuite`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Account shipping: apt label + add-address scroll

- **Label:** **APT, UNIT, ETC** → **APT, UNIT, SUITE** on add-address form.
- **Scroll:** **`account-shipping-card-fields`** uses **`overflowY: 'auto'`**, **`minHeight: 0`**, **`WebkitOverflowScrolling: 'touch'`**, **`overscrollBehavior: 'contain'`** so the add-address form (and long address lists) scroll inside the fixed-height card instead of clipping. Removed extra card **`paddingBottom`** tied only to add form.
- **Files:** **`src/pages/account/shipping/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — VIEW AS CLIENT: no seed mock orders or loyalty from LS

Summary: User reported that with **VIEW AS CLIENT** on, **Orders** and **loyalty / points** still showed **founder seed mock** data.

- **Cause:** **`src/pages/orders/page.tsx`** treated any **`isMockDataAccount`** user as a mock-orders account and ignored **`baw_founder_account_view_as_client`**. Rewards/membership already branched on **`founderViewAsClient`** for some mock UI, but **spend**, **points history**, and **affiliate points** still read **`userOrders_*`** that had been **overwritten with seed mocks**, so inflated loyalty persisted.
- **Decisions / helpers (`src/utils/adminAuth.ts`):** **`readFounderAccountViewAsClientFromStorage()`**, **`isMockProfileChromeActive(user)`** (mock founder **and** not view-as-client), **`BAW_FOUNDER_SEED_MOCK_ORDER_IDS`** + **`excludeFounderSeedMockOrders()`** to drop known seed order ids (and optional future **`bawSeedMock`** flag).
- **Orders page:** Use **`isMockProfileChromeActive`** for seeded lists; when mock account + view-as-client, load from LS and **filter** seed ids; **`founderAccountViewAsClientChanged`** listener refreshes lists; persist-from-state effect skips only when **mock chrome** is active (view-as-client can sync real edits).
- **Rewards (`membership/page.tsx`):** **`ordersFromStorageForRewards()`** applies the same filter when view-as-client; mock affiliate block uses **`isMockProfileChromeActive`**; tier mock bar uses **`isMockProfileChromeActive`**.
- **Account hub (`account/page.tsx`):** **`profileUsesMockChrome`** derived from **`isMockProfileChromeActive`**; **`mergeUserOrdersFromStorageForAccount`** / **`activeUserOrdersFromStorageForAccount`** for **order count**, **tier spend**, **VIB**, **notifications**, **concierge** badges so seed mocks do not count in client view.
- **Files:** **`adminAuth.ts`**, **`orders/page.tsx`**, **`membership/page.tsx`**, **`account/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Founder toggle label: "VIEW AS ADMIN"

Summary: User asked to shorten the founder profile toggle label from **VIEW AS ADMIN PROFILE** to **VIEW AS ADMIN** (when already in client view).

- **Changes:** **`src/pages/account/page.tsx`** — toggle text; **`src/utils/adminAuth.ts`** — JSDoc for **`FOUNDER_ACCOUNT_VIEW_AS_CLIENT_KEY`**. **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Vercel build: `founder_test_checkout_order` on `ActivityEventType`

Summary: **`npm run build`** (`tsc --noEmit && vite build`) failed on Vercel with **`TS2345`**: **`trackActivity('founder_test_checkout_order', …)`** in **`checkout/page.tsx`** not assignable to **`ActivityEventType`**.

- **Fix:** Added **`founder_test_checkout_order`** to the **`ActivityEventType`** union and **`ACTIVITY_EVENT_KEYS`** in **`src/utils/activity.ts`** so it stays in sync with **`trackActivity`** / **`isActivityEventType`**.
- **Files:** **`src/utils/activity.ts`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-27 — Admin Revenue: EDIT TRACKING + shared order tracking (Orders + Concierge)

Summary: User asked to replace **ADD TRACKING** on **Admin → Revenue → Orders** (expanded order) with **EDIT TRACKING** that toggles the expanded order card into a full **tracking editor** (stages, client-visible notes with optional **notify** → unread **account notification** + Concierge deep link, **timeline shift** days for slower/faster progress, **carrier** + **tracking number** with correct carrier URLs), persisted on **`userOrders_${email}`** so **Orders** and **Account → Concierge** stay in sync.

- **Context:** Prior behavior was a footer **ADD TRACKING** input that set **`trackingNumber`**, **`trackingCarrier: USPS`**, and **`status: SHIPPED`** in localStorage only.
- **New util (`src/utils/orderTracking.ts`):** **`ORDER_TRACKING_STAGE_LABELS`**, **`ORDER_TRACKING_CARRIERS`**, **`getCarrierTrackingUrl`**, **`patchOrderInUserOrders`**, **`appendOrderTrackingClientNotification`** (merges into **`notifications_${email}`** via **`getAccountNotifications` / `mergeAccountNotifications`**), **`getOrderTrackingStageFromOrder`** (admin stage override, **`trackingStage`**, status map, form-signed rule).
- **Admin Revenue (`src/pages/admin/revenue/page.tsx`):** **EDIT TRACKING** opens in-card editor; **SAVE TRACKING** writes **`trackingNumber`**, **`trackingCarrier`**, **`trackingTimelineShiftDays`**, **`adminTrackingStageOverride`** (null clears), **`trackingStageNotes`**; non-empty tracking still sets **`SHIPPED`**; per-stage **notify** fires **`appendOrderTrackingClientNotification`**. **COPY** / **CANCEL EDIT** unchanged pattern. View mode tracking link uses **`getCarrierTrackingUrl`**.
- **Concierge (`src/pages/account/concierge/page.tsx`):** **`getOrderTrackingStage`** delegates to **`getOrderTrackingStageFromOrder`**; **`getStageProgress`** / **`getStageTimestamp`** accept **timeline shift**; tracking UI passes shift; expanded stage shows **UPDATE:** admin note when present.
- **Orders (`src/pages/orders/page.tsx`):** **`Order`** type extended; **`?orderId=`** expands matching order; expanded + archived detail: **ORDER TRACKING** section (stages, notes, shift, **OPEN IN CONCIERGE**); list + detail tracking links use **`getCarrierTrackingUrl`**; carrier row prefers stored **`trackingCarrier`**.
- **Email:** No new server email; **notify** = in-app notification + existing alert/badge pipeline.
- **Files:** **`orderTracking.ts`**, **`admin/revenue/page.tsx`**, **`concierge/page.tsx`**, **`orders/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Revenue Orders: hide PENDING card when expanded

Summary: On **Admin → Revenue → Orders**, the bottom **PENDING** orders card is **not rendered** while an order is expanded (**`expandedOrderId`** set); it returns when the user closes the expanded order.

- **Files:** **`src/pages/admin/revenue/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Vercel `tsc`: revenue + orderTracking fixes

Summary: **`npm run build`** on Vercel failed with **TS2367** (**`adminTrackingStageOverride !== ''`** vs **`number | null`**), **TS6133** (unused **`USPS_RE`**), and **TS2345** (**`findIndex`** on **`unknown[]`**).

- **Fixes:** **`fillTrackingDraftFromOrder`** — drop string compare; use **`!= null`** and **`!Number.isNaN(Number(...))`** before clamping. **`orderTracking.ts`** — remove unused **`USPS_RE`**; **`findIndex`** callback uses **`(o) => (o as { id?: string })?.id === orderId`**.
- **Files:** **`src/pages/admin/revenue/page.tsx`**, **`src/utils/orderTracking.ts`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Account load gift card (Add funds) UI + admin barcode codes

Summary: User wanted **Account → Load gift card** reworked: remove **BACK TO ACCOUNT**; **ADD FUNDS** as red section header with gray bottom rule and **red close (X)** to **`/account`**; hero image **`/assets/load-card.png`**; **SUBMIT CODE** below the main card with **red text / white background / black border** (shared **`pageActionButtonStyle`**); **REMAINING BALANCE** → **CURRENT BALANCE**; barcode entry as **three square (no radius) uppercase segment inputs per row** (XXXX-XXXX-XXXX), three rows; top nav crumb red label **ADD FUNDS**.

- **Redemption:** Barcodes resolve against **`adminBrandPromoCodes`** (**Admin → Brand → CODES**): **`kind === 'gift'`**, active, not expired, under **max uses**; **`valueLabel`** parsed for dollar credit; **`updateBrandPromoCode`** increments **`uses`**; user **`giftCardBalance`** + **`digitalCashHistory`** (**GIFT CARD BARCODE**) via **`currentUser`** / **`registeredUsers`**.

- **`src/utils/adminBrandCodes.ts`:** **`generateGiftBarcode()`** (XXXX-XXXX-XXXX); **`generateCodePrefix('gift')`** uses it; **`normalizePromoCode`**, **`parseGiftCardDollars`**, **`findGiftPromoByNormalizedCode`**, **`giftPromoRedeemBlockReason`**.

- **`src/pages/admin/brand/page.tsx`:** Gift code placeholder **XXXX-XXXX-XXXX**; **STATUS:** ACTIVE / INACTIVE / **FULLY REDEEMED** (gift max uses) / **MAX USES REACHED** (discount).

- **Files:** **`load-card/page.tsx`**, **`adminBrandCodes.ts`**, **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card: brand header line, one row per barcode, concierge submit

Summary: User asked to match **Brand / About** header divider (**`#e5e7eb`**, title then rule—not **`#9ca3af`** on one flex); drop colon on **CURRENT BALANCE**; restore **one full-width input per row** (3 rows) with **square corners** and **XXXX-XXXX-XXXX** formatting while typing; use **`public/assets/load-card.png`** via **`import.meta.env.BASE_URL`**-aware URL; **SUBMIT CODE** below the card with the same classes/styles as **Concierge → SUBMIT MESSAGE** (not **`PageActionsBelowCard`** / **`pageActionButtonStyle`**).

- **Files:** **`src/pages/account/load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card: fix PNG src, Futura Medium barcode label, placeholder gray

Summary: **`loadCardPngUrl()`** (BASE_URL string concat) could yield bad URLs; image **`src`** now uses fixed **`/assets/load-card.png`** (same as **`public/assets/load-card.png`** / marble pattern). **ENTER BARCODE(S):** → **Futura PT Medium** 10px **`#808080`**; barcode inputs use **`.load-card-barcode-input::placeholder`** with **`#808080`** + Futura Medium uppercase.

- **Files:** **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card: balance amount 16px, tighter gap, no barcode placeholder

Summary: Digital cash line **16px** (was 20px); **CURRENT BALANCE** bottom margin **2px** (was 8px, **−6px** gap to amount); barcode inputs **no** **`placeholder`**; removed unused **`load-card-barcode-input`** placeholder CSS.

- **Files:** **`src/pages/account/load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card: balance label sizes, barcode label, concierge button spacing

Summary: User asked for **CURRENT BALANCE** / amount font sizes (stated: **18px** Covered By Your Grace, **20px** Futura Medium red), **centered**; **ENTER BARCODE(S):** in **gray `#808080` Futura PT Demi 10px** uppercase; spacing above **SUBMIT CODE** aligned with **Concierge** (outer column **`gap: 2px`**, main card **`paddingBottom: 16px`**, **`mb-2`**, button wrapper **`marginTop: 2px`** + **`translateY(-2px)`**, button **`max-w-m`**).

- **Files:** **`src/pages/account/load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card art at `public/load-card.png`, barcode block `marginTop`

Summary: Gift card image is **`public/load-card.png`** served as **`/load-card.png`** (removed **`public/assets/load-card.png`**). **`img`** uses **`decoding="async"`**, **`objectFit: 'contain'`**. Barcode section wrapper **`marginTop: 12px`**; balance block **`marginBottom: 0`**.

- **Files:** **`public/load-card.png`**, **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card: bundled `load-card.png` import + 2 barcode rows

Summary: User still saw a broken/missing hero image (public URL may not deploy). **`load-card.png`** copied to **`src/pages/account/load-card/load-card.png`** and imported in **`page.tsx`** (**`import loadCardImage from './load-card.png'`**) so Vite emits a stable URL. Only **one** hero **`img`** in the card (no duplicate). Barcode inputs reduced from **3** to **2** (**`useState(['', ''])`**, reset **`['', '']`**).

- **Files:** **`src/pages/account/load-card/load-card.png`**, **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card image: no halo / extra bands

Summary: Removed **`boxShadow`** and **`objectFit: 'contain'`** on hero **`img`**; wrapper uses **`display: flex`**, **`justifyContent: center`**, **`lineHeight: 0`**; **`img`** **`margin`/`padding` 0**, **`border: none`** to drop perceived white bars above/below.

- **Files:** **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card image spacing −20px top/bottom

Summary: ADD FUNDS header block **`marginBottom`** **12px → 0**; image wrapper **`marginTop: -8px`**, **`marginBottom`** **24px → 4px** (20px less space below; 20px less above vs prior **12px** gap plus **8px** upward shift).

- **Files:** **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card hero: further −30px above & below

Summary: Image wrapper **`marginTop`** **−8px → −38px**, **`marginBottom`** **4px → −26px** (another **30px** tighter each side vs prior).

- **Files:** **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card barcode inputs: 36px like Account Settings

Summary: Barcode fields use **`height: '36px'`**, **`padding: '8px'`** (same as **`inputBaseStyle`** on **`account/settings/page.tsx`**), replacing **`padding: '12px'`** with no fixed height.

- **Files:** **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card: balance block −15px

Summary: Wrapper around **CURRENT BALANCE** + amount **`marginTop: '-15px'`** so both lines shift up together (tuned from **`-20px`**). Amount line **`margin: '-2px 0 35px 0'`** under **CURRENT BALANCE**, **`35px`** below **$… USD** before barcodes. Last barcode input **`marginBottom: '10px'`**.

- **Files:** **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Load card: flex column inner + barcode block no marginTop

Summary: User saw prior spacing tweaks not sticking (possible **margin collapse**). Main card content wrapped in **`display: flex`**, **`flexDirection: column`** so vertical spacing between header / hero / balance / barcode is predictable. Barcode block **`marginTop: 12px`** removed (**`0`**, **`paddingTop: 0`**). Hero row **`alignSelf: center`**, **`maxWidth: 400px`**, **`flexShrink: 0`**.

- **Files:** **`load-card/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand CODES: COPY above +1 USE

Summary: **TRACK USAGE** rows: **COPY** button above **+1 USE**; copies **`c.code`** via **`navigator.clipboard.writeText`** with **`textarea` + `execCommand` fallback**.

- **Files:** **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Site-wide square form controls

Summary: **`src/index.css`** after **`@tailwind utilities`**: **`border-radius: 0 !important`** on **`input`** (except **`checkbox`**, **`radio`**, **`range`**, **`hidden`**), **`textarea`**, **`select`**. **CHOOSE FILE** inner spans **`borderRadius: '4px'` → `0`** in **`accounting-report`**, **`leave-review-order`**, **`order-form`**, **`affiliate`** (debug banner left at **4px**). Toggle / status pills / progress bars / avatars unchanged.

- **Files:** **`index.css`**, **`accounting-report/page.tsx`**, **`leave-review-order/page.tsx`**, **`order-form/page.tsx`**, **`affiliate/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin cards: 20px horizontal padding (match load gift card)

**Context:** User wanted admin **tab content** (and related card interiors) to use the same **left/right inset as `/account/load-card`** (**20px** on the main white card), because inputs and text sat too close to the card edges.

**Root cause:** Several admin tab scroll areas used **`className="px-5 pb-6"`** together with inline **`padding: '8px'`**, which **overrides** Tailwind horizontal padding so effective horizontal padding was **8px** instead of **20px**.

**Changes:**
- **Tab bodies:** Replaced conflicting shorthand with explicit **`paddingLeft` / `paddingRight: '20px'`**, **`paddingBottom: '24px'`** (former **`pb-6`**), and top padding **`2px`** or **`8px`** as before (**`brand`**, **`backend`**, **`reviews`**, **`pending`**, **`referrals`**, **`analytics`**, **`marketing`**).
- **Meetings:** Main flex column under tabs uses **20px** horizontal padding; removed redundant **`px-5`** on nested blocks; **QUICK SCHEDULE** footer no longer uses extra **`marginLeft` / `marginRight: 12px`**.
- **Audit trail list:** Same **20px** horizontal pattern; empty/loading copy **`px-5`**.
- **Clients:** Client list scroll area uses **20px** padding instead of **20px margin + 8px padding**; client **details** wrapper **`px-4` → `px-5`**; invite history popup scroll **20px** horizontal.
- **Card headers:** Concierge-style header rows **`px-4` → `px-5`** where they match the tabbed admin card pattern (**`brand`**, **`backend`**, **`clients`**, **`marketing`**, **`meetings`**, **`reviews`**, **`pending`**, **`analytics`**, **`referrals`**, **`revenue`** main + pending sub-card, **`accounting-report`**).
- **Other admin forms:** **`notifications`**, **`users`** body/header/feedback margins aligned to **`px-5` / `mx-5`**.
- **Nested “recent clicks” lists** (**`brand`**, **`analytics`**): dropped horizontal padding on the inner scroll so content stays at **20px** from the card (only vertical padding on the inner list).
- **Brand alerts client picker portal** (**`BrandAlertsPanel`**): list area **20px** horizontal padding (full-screen overlay).

**Files:** **`admin/brand/page.tsx`**, **`admin/backend/page.tsx`**, **`admin/reviews/page.tsx`**, **`admin/pending/page.tsx`**, **`admin/referrals/page.tsx`**, **`admin/analytics/page.tsx`**, **`admin/marketing/page.tsx`**, **`admin/meetings/page.tsx`**, **`admin/audit/page.tsx`**, **`admin/clients/page.tsx`**, **`admin/revenue/page.tsx`**, **`admin/revenue/accounting-report/page.tsx`**, **`admin/notifications/page.tsx`**, **`admin/users/page.tsx`**, **`admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES: remove +1 USE, add RESET USES

**Context:** User wanted the **+1 USE** control removed from under **COPY** on **TRACK USAGE** rows, and a way to **zero usage** on a code (e.g. after testing load-card redemption, which increments **`uses`** in **`localStorage`** via **`updateBrandPromoCode`**).

**Changes:** Removed **+1 USE** button. Added **RESET USES** (same column under **COPY**, before **DEACTIVATE**) calling **`updateBrandPromoCode(c.id, { uses: 0 })`** and **`refreshCodes()`**.

- **Files:** **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Confirm popups: primary left, cancel / dismiss right

**Context:** User wanted **CANCEL** (and equivalent dismiss actions) on the **right** in confirmation dialogs, including sign-out — site-wide consistency.

**Changes:**
- **`ConfirmationModal`:** Removed **`swapButtons`**; default layout is always **confirm (primary, red)** **left**, **cancel** **right**. All existing usages inherit this (sign-out, checkout validation, admin clients, etc.). Removed redundant **`swapButtons`** from **`settings`** (delete account) and **`lobby`** (upgrade).
- **Other marble-style / paired actions:** **`AddToListModal`**, **`CreateNewListModal`** — **Save/Create** left, **Cancel** right. **`account/page.tsx`** — **RESET** / **APPROVE** left, **CANCEL** right. **`checkout/page.tsx`** terms — **ACCEPT** left, **CLOSE** right. **`account/shipping`** & **`account/payment`** add forms — **SAVE** left, **CANCEL** right (row layout; cancel styled black like modal dismiss). **`account/referrals`** invite modal — **CANCEL** aligned **right** below copy actions.

- **Files:** **`components/ConfirmationModal.tsx`**, **`components/AddToListModal.tsx`**, **`components/CreateNewListModal.tsx`**, **`account/page.tsx`**, **`account/settings/page.tsx`**, **`account/shipping/page.tsx`**, **`account/payment/page.tsx`**, **`account/referrals/page.tsx`**, **`checkout/page.tsx`**, **`lobby/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES: “RESET USES” → “RESET”

Admin **Brand → CODES → TRACK USAGE** row button label changed from **RESET USES** to **RESET** (behavior unchanged: zeros **`uses`** for that code).

- **Files:** **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES: EXPIRES date input full width

**CREATE CODE** **EXPIRES (OPTIONAL)** **`type="date"`** field now matches other inputs: label **`width: '100%'`**, input **`display: block`**, **`width` / `maxWidth: '100%'`**, **`boxSizing: 'border-box'`**, **`minWidth: 0`** (avoids browser default min-width on date inputs).

- **Files:** **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Native alerts → marble ConfirmationModal (load card, checkout, membership)

**Context:** User wanted **submit code / message popups** (e.g. load gift card) to match **other app popups** (marble **`ConfirmationModal`**). All **`alert()` / `window.alert()`** message-style notices in **`src`** were replaced; **native `confirm()`** in admin users/backend left unchanged (sync confirm flows).

**Changes:**
- **`ConfirmationModal`:** New prop **`messagePreserveLineBreaks`** — **`whiteSpace: 'pre-line'`** on the message, optional **scroll** (**`maxHeight` / `overflowY`**) for long multiline text.
- **`account/load-card`:** **`loadCardNotice`** state + **`ConfirmationModal`** (**OK** only, **`cancelText=""`**): sign-in required ( **`afterClose`** → navigate sign-in), incomplete barcodes, errors / partial success / success; multiline error lists use **`preserveLineBreaks`**.
- **`checkout/page.tsx`:** **`checkoutNotice`** for Stripe membership subscribe failures (tier missing, no token, catch); **`messageTextTransform="none"`** for possible mixed-case errors.
- **`account/membership/page.tsx`:** **`redeemNoticeMessage`** for redeem placeholder feedback; **`messageTextTransform="none"`**.

- **Files:** **`components/ConfirmationModal.tsx`**, **`account/load-card/page.tsx`**, **`checkout/page.tsx`**, **`account/membership/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand CODES: TRACK USAGE styling & gift status copy

**TRACK USAGE** rows: **COPY** / **RESET** label color **#000**; **COPIED** stays **#EB1C24**. **DEACTIVATE** (active state) background **#FFFFFF** (was gray). **GIFT CARD · $…** line: **Futura PT Medium**, **9px**, **#808080**, **uppercase** (matches **STATUS** line). **STATUS** for gifts with **maxUses**: exhausted → **REDEEMED** (dropped “FULLY”); partial with **uses > 0** → **`{uses}/{maxUses} REDEEMED`**; **uses === 0** → **ACTIVE**; unlimited → **ACTIVE**. Discount codes: partial → **`N/M USED`**, maxed → **MAX USES REACHED**.

- **Files:** **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES TRACK USAGE: red action labels + 10px gray lines

**COPY**, **RESET**, **DEACTIVATE** (white background state): **Futura PT Medium**, **#EB1C24**, **uppercase**; **ACTIVATE** stays white on red. **GIFT CARD · …** and **STATUS:** lines: **9px → 10px**, still **#808080** / **Futura PT Medium**.

- **Files:** **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES: EXPIRES date input no horizontal overflow

**EXPIRES (OPTIONAL)** `type="date"` was wider than sibling inputs (UA **`min-inline-size`**), causing horizontal scroll. Fixes: **`overflow-x-hidden`** on Brand tab content scroll; **CREATE CODE** form **`min-w-0 max-w-full`**; EXPIRES label + **`min-w-0`** wrapper with **`overflow-hidden`**; **`index.css`** rule **`input.admin-brand-expires-date[type="date"]`** with **`min-width` / `min-inline-size: 0 !important`**, full width, border-box.

- **Files:** **`admin/brand/page.tsx`**, **`index.css`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES: white toggles + ACTIVATE same as DEACTIVATE

**CREATE CODE** **GIFT CARD** / **DISCOUNT** toggles: both use **#FFFFFF** background; selected still **#EB1C24** text + **1.3px** border, unselected **#808080** + **1px** border (removed red tint **`rgba(235,28,36,0.08)`**). **ACTIVATE** / **DEACTIVATE**: both **white** background, **#EB1C24** **Futura PT Medium** text, black border (ACTIVATE no longer red fill).

- **Files:** **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Promo code expiry: MM-DD-YYYY storage & display

**Brand promo `expiresAt`:** Saved as **MM-DD-YYYY** (from date input **`expiresAtFromDateInput`**). **TRACK USAGE** shows **`EXP MM-DD-YYYY`** via **`formatExpiresAtForDisplay`**. **`giftPromoRedeemBlockReason`** uses **`parseExpiresAtToEndOfDayLocal`** — supports new format and legacy **YYYY-MM-DD** in **`localStorage`**.

- **Files:** **`utils/adminBrandCodes.ts`**, **`admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — NOIR “product shots” font vs other unit pages

**Context:** User asked why **NOIR**’s **“product shots”** overlay text did not match other products and looked like the wrong font.

**Root cause:** In **`src/index.css`**, the rule grouping **`.font-covered`**, **`.noir-text`**, **`p[class*="noir"]`**, and **`div[class*="noir"]`** applies **Covered By Your Grace** with **`!important`**. The NOIR overlay uses class **`noir-product-shots-label`**, whose attribute contains the substring **`noir`**, so it matched **`div[class*="noir"]`** and overrode the inline **Bohemy** stack. Other unit pages use overlay divs without **`noir`** in the class name, so they kept **Bohemy**.

**Changes:** Added **`.noir-product-shots-label { font-family: "Bohemy", sans-serif !important; }`** immediately after that rule so the label matches Beach Wave and siblings. Updated NOIR inline **`fontFamily`** for the overlay from **`cursive`** to **`sans-serif`** to align with **`beach-wave/page.tsx`**.

- **Files:** **`src/index.css`**, **`src/pages/straight/noir/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

- **Convention:** Layout/helper classes on the NOIR page that include **`noir`** in the token can still hit **`div[class*="noir"]`**; use a dedicated class + CSS exception when a control should **not** use Covered By Your Grace.

---

## 2026-03-28 — NOIR “product shots” font: specificity + class rename

**Follow-up:** User reported **no visible change** after the first fix (**.noir-product-shots-label** with Bohemy **`!important`**).

**Additional root cause:** **`.noir-product-shots-label`** alone has specificity **(0,1,0)**; **`div[class*="noir"]`** is **(0,1,1)** (element + attribute), so the Covered rule **still won** even though the override came later.

**Final approach:** Renamed NOIR-only product-shots layout classes so the **`class`** string **does not contain the substring `noir`** (avoids **`div[class*="noir"]`** / **`p[class*="noir"]`** entirely): **`noir-product-shots-*` → `unit-pdp-product-shots-*`** in **`src/pages/straight/noir/page.tsx`** (scoped **`<style>`** + JSX). Removed the redundant **`div.noir-product-shots-label`** block from **`src/index.css`**.

- **Files:** **`src/pages/straight/noir/page.tsx`**, **`src/index.css`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Promo reactivate: same calendar span as original expiry

**Context:** User wanted **ACTIVATE** (after **DEACTIVATE**) to reset the validity window so it lasts the **same number of calendar days** as when the code was created (e.g. 2-day code → 2 days from reactivation). Codes **without** `expiresAt` stay unchanged except `active: true`.

**Implementation:**
- **`BrandPromoCode.expiresSpanCalendarDays`** (optional): calendar days from **local start-of-day** of `createdAt` to **local start-of-day** of the expiry date. Set on **SAVE CODE** when an expiry is present via **`computeExpiresSpanCalendarDays`**.
- **`computeReactivationExpiryPatch`**: if `expiresAt` is set, uses stored span or infers it for legacy rows from `createdAt` + current `expiresAt`; sets new **`expiresAt`** to **reactivation day + span** (MM-DD-YYYY) and persists **`expiresSpanCalendarDays`**. **`admin/brand/page.tsx`** ACTIVATE calls this instead of only `{ active: true }`.

- **Files:** **`src/utils/adminBrandCodes.ts`**, **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — NOIR product shots: match other units’ image height

**Context:** User asked why NOIR **product shot** images did not match the **height** of other product pages.

**Cause:** NOIR used a **300px** viewport, **`h-full`** on images (height followed the row, not a fixed pixel size), and **no** **`paddingTop: 70px`** / **`alignItems: 'center'`** / **`height: '100%'`** on the row in the default (mobile) layout. A **1024px+** scoped **`<style>`** block had copied Beach Wave’s **310px / 290px / translateY(-55px)** values for large screens only, so NOIR stayed shorter on typical phone widths. Other units (e.g. Blanco, Beach Wave) set **310px** viewport, **70px** top padding, row **100%** height + centered alignment, and each image **`height` / `maxHeight: 290px`** + **`translateY(-55px)`** inline for **all** breakpoints.

**Changes:** Removed the product-shots **`<style>`** block; aligned NOIR’s product-shots block to the same inline structure as the other unit pages; **“product shots”** overlay **`bottom: '-1px'`** like Beach Wave; tabs wrapper **`translateY(-20px)`** like other units (replacing **`-66px`**). Dropped **`unit-pdp-product-shots-*`** classes (no longer used).

- **Files:** **`src/pages/straight/noir/page.tsx`**, **`src/index.css`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand CODES: CREATE CODE below main card

**Context:** User wanted the **SAVE CODE** / **CREATE CODE** form **not** inside the main brand card; it should **replace** the **EXPORT ANALYTICS** button position (below the card).

**Changes:** **`CREATE CODE`** + full form + **SAVE CODE** moved into **`PageActionsBelowCard`**, wrapped in its own **`bg-white/60 backdrop-blur-sm`** bordered panel (same width as **`max-w-md`** column). When **`activeTab === 'CODES'`**, that panel shows; other tabs still show **EXPORT ANALYTICS**. Main card **CODES** tab now starts with **TRACK USAGE** only.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES: expiry shows date only (no “EXP”)

**Context:** User asked to drop the **EXP** label on each code row so the line shows only the end date (e.g. **03-28-2026**).

**Changes:** **`src/pages/admin/brand/page.tsx`** — **TRACK USAGE** uses **` · ${formatExpiresAtForDisplay(c.expiresAt)}`** instead of **` · EXP ${...}`**.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — NOIR DETAILS tabs: align with other unit pages (DOM nesting)

**Context:** After matching NOIR product shots to other units, **DETAILS / SHIPPING / …** tabs sat **too low** vs Blanco / Beach Wave.

**Cause:** A **`</div>`** immediately after the product-shots **viewport** closed the **`mt-8 mb-6`** wrapper **before** the tabs block. On Blanco / Beach Wave, **tabs live inside** that same **`mt-8 mb-6`** div, which applies **`transform: translateY(-34px)`** to **both** the carousel and the tabs. NOIR’s tabs were **siblings** of that wrapper (outside it), so they **did not** get the **`-34px`** vertical pull.

**Changes:** Removed the premature closing **`</div>`** so **tabs stay inside** **`mt-8 mb-6`**, and added a matching **`</div>`** after the tabs section (with the existing **`mt-6` / `mt-4`** closes) so the JSX tree stays balanced.

- **Files:** **`src/pages/straight/noir/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand CODES: toggle create panel (premium-style) + SAVE below card

**Context:** User did not want **CREATE CODE** always visible in a card below the main card. They asked for a **toggle with close** (like the premium upgrade chart): a **CREATE CODE** button opens a frosted panel; **close** (`/assets/close-icon.svg` in header) collapses it; **SAVE CODE** sits **below** the toggled card, not inside it. **CODES** main card stays **TRACK USAGE** only.

**Changes:** **`showCreateCodePanel`** state; reset when leaving **CODES** tab. **`PageActionsBelowCard`**: on **CODES**, closed → **CREATE CODE** + **EXPORT ANALYTICS**; open → panel (header + fields only) + **SAVE CODE** + **EXPORT ANALYTICS**. **`handleSavePromoCode`** **`useCallback`** for save logic.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Mobile menu: SIGN IN / OUT + socials aligned to NOIR pattern

**Context:** User wanted **menu toggle** footers (**SIGN IN/OUT** + **`SocialMenuIcons`**) in the **same position** as on the **NOIR** product page; **Wishlist** and others had them **too high**.

**Reference (NOIR):** Menu card **`minHeight` / `height: calc(100dvh - 80px)`**; inner column **`flex: 1`, `minHeight: 0`**; link list in a **`flex: 1` `overflowY: auto`** region; **SIGN IN/OUT** row **`marginTop: 'auto'`**; socials below.

**Root causes elsewhere:** (1) Inner menu wrapper used fixed **`height: '490px'`** instead of **`flex: 1` / `minHeight: 0`**, so **`marginTop: 'auto'`** could not push the footer to the bottom of a taller card. (2) Many pages used **`minHeight: '560px'`** (or a short fixed main-card height while the menu was open) for the menu panel, so the footer sat at the bottom of a **short** box, not near the **viewport** bottom like NOIR. (3) **Wishlist**, **Shopping bag**, and **Wishlist lists** kept **`calc(100vh - 270px)`** (or list proportion) while the menu was open instead of expanding the menu card.

**Changes:** Replaced **`paddingTop: '20px', height: '490px', position: 'relative'`** with **`flex: 1`, `minHeight: 0`** on the inner menu column across **~26** page files. **Wishlist**, **Shopping bag**, **Wishlist lists:** when **`showMobileMenu`**, card uses **`calc(100dvh - 80px)`** and **`overflow: visible`** (same idea as NOIR). Shop-style menus (**units**, **tools**, **products**, **brand**, **careers**): menu panel **`560px` → `calc(100dvh - 80px)`** + explicit **`height`**. Account-style menus (**account**, **orders**, **payment**, **shipping**, **reviews**, **notifications**, **load-card**, **leave-review-order**, **settings**, **referrals** inner menu, **concierge**, **affiliate**, **membership**): **`560px` or min-only** menu shells updated to **`calc(100dvh - 160px)`** + **`height`** where needed (**`-160px`** for account chrome). Left **560px** on non-menu main cards (e.g. reviews list shell, referrals main card, membership benefits modal, admin deleted).

- **Files:** Many under **`src/pages/`** (see chat), **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand CODES: DISCOUNTS ledger + checkout admin discount codes

**Context:** User removed gray **placeholder** text from the optional manual **CODE** field on **CREATE CODE**. Replaced **TOTAL REDEMPTIONS** tile with **DISCOUNTS**, showing total **USD** off from **admin-generated discount codes** applied on **confirmed checkouts** (not gift redemptions).

**Implementation:**
- **`adminBrandCodes`:** **`findDiscountPromoByNormalizedCode`**, **`parseDiscountPercent`**, **`discountPromoCheckoutBlockReason`**, ledger **`adminBrandGeneratedDiscountOrders`** with **`recordBrandGeneratedDiscountOrderEvent`**, **`sumBrandGeneratedDiscountUsd`**, **`CustomEvent('brandDiscountLedgerUpdated')`**.
- **`checkout/page.tsx`:** **`appliedBrandDiscountPromo`** (% off eligible subtotal, same special-offer rules as other codes); validate/apply before legacy flat codes; on successful order (non-subscription), increment promo **`uses`** and append ledger row with **`discountUsd`**. Gift-card / referral / legacy discount interactions clear brand promo as needed.
- **`admin/brand/page.tsx`:** Tile shows **`$` + formatted sum**; listens for ledger event; optional code input has **no** **`placeholder`**.

- **Files:** **`src/utils/adminBrandCodes.ts`**, **`src/pages/checkout/page.tsx`**, **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand CODES: create replaces main card; no EXPORT on CODES

**Context:** User wanted **EXPORT ANALYTICS** removed on the **CODES** tab. **CREATE CODE** should **replace the main brand card** (same idea as the subscription **premium upgrade chart**), not sit in **`PageActionsBelowCard`**.

**Changes:** When **`activeTab === 'CODES'`**, a dedicated layout: same **`minHeight`** frosted card with **BRAND** header, **ACTIVE CODES** / **DISCOUNTS** tiles, tab row; body is either a full-width **CREATE CODE** button (**`flex-1`** center) or the **CREATE CODE** form with **close** + scroll; **SAVE CODE** sits **below** that card when the form is open. **TRACK USAGE** is **below** the card (marble background, not inside it). Other tabs keep the original single main card. **`PageActionsBelowCard`** **EXPORT ANALYTICS** only when **`activeTab !== 'CODES'`**.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home shop UNITS mannequin size matches shop/units

**Context:** On **`/home/shop`** (`ProductsPage`), unit mannequin thumbnails were **larger** than on **`/shop/units`** and **overflowed** the marble card because the carousel used the **mobile “pair” flex math** on all breakpoints (`flex` based on `ceil(n/2)` and a very wide inner track), so each cell was ~**half** the card width on desktop instead of **quarter** like **`products/units/page.tsx`**.

**Changes:** **`src/pages/products/page.tsx`**: **`windowWidth`** + resize listener; **`isLargeUnitsCarousel`** (`> 1024`). **Desktop:** inner row **`width: calc(100% - 20px)`**, each product **`flex: 0 0 25%`**, row transform **`translateX` only** (no extra **`translateY(-5px)`**), item **`translateX(0)`** + **`translateY(-4px)`** like units; scroll strip **`marginTop: '-4px'`**. **Cart icon** positions use **`index * 25%`** on desktop. **Arrow / snap** logic for desktop: step **`window.innerWidth * 0.5`**, **`totalViews = ceil(n / 4)`**. **Mobile:** unchanged (paired columns + existing scroll).

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home shop UNITS: in-cell cart icons + marble clip + measured desktop scroll

**Context:** Follow-up: desktop mannequin scale change looked ineffective; user saw **~6 add-to-cart controls** (expected **2 visible** with the 2-up mental model). Root cause: a **full-width absolute overlay** positioned every product’s bag icon with **`index * 25%`** of the **viewport** — icons at **100% / 125%** still painted because the overlay used **`overflow: visible`**, so **all six** stacked in view. Overlay **`translateX`** also did not match **per-cell** thumbnail motion reliably.

**Changes (same file):** Removed the **global Shopping Bag Icons** layer. Each **card-add / card-added** control is **inside** the product flex cell (**`position: absolute; top: -38px`**, even → **`left: 16px`**, odd → **`right: 14px`**) so it **scrolls with** the strip — **one button per mannequin**, only off-screen cells hidden by **`overflowX: 'hidden'`** on the marble card and the **`flex: 1`** track. Thumbnails: **`marginLeft/Right: auto`**, **`display: 'block'`**, **`boxSizing: 'border-box'`** so **90% width** doesn’t spill past the cell. Desktop arrow paging uses **`unitsStripRef`** + **`ResizeObserver`**: **`unitsDesktopStepRef`** = **`(scrollWidth - clientWidth) / (pages - 1)`** with fallback to **`0.5 * innerWidth`**.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home shop UNITS: NOIR 2D scroll + single add-to-cart by viewport center

**Context:** User wanted **`/home/shop`** UNITS mannequin strip to **scroll like NOIR “Similar Products” (2D)** and **one fixed add-to-cart** (upper area) that targets **whichever unit is nearest the strip center** while scrolling—not per-cell buttons following each mannequin.

**Changes (`products/page.tsx`):** Scroll step **`0.713 * innerWidth`**, same as NOIR 2D; **drag** horizontal on the flex row (`grab`/`grabbing`) with **snap** to nearest page index; **arrows** move by one page using the same step; **`maxScroll`** from **`ceil(n / perPage) - 1`** (`perPage` 4 desktop / 2 mobile). Inner row **`translateY(-15px)`** like similar products. **`unitsStripRef`** + **`[data-units-product-cell]`** + **`useLayoutEffect`** pick **`unitsActiveIndex`** (closest cell midpoint to strip horizontal center). **Single** card-add / card-added control **`position: absolute; top: 2px; right: 10px`** calls **`handleAddToCart(active)`**. Removed **`ResizeObserver`** desktop step ref. **`unitsScrollRef`** updated live during drag so **snap** uses the final offset.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home shop UNITS: show all 6 products in one row

**Context:** User wanted the **UNITS** card on **`/home/shop`** to **display all six** unit products at once (no horizontal carousel).

**Changes (`products/page.tsx`):** Removed **arrows**, **drag**, **`unitsScroll`**, and NOIR step/snap logic. Row uses **`flex: 1 1 0`**, **`minWidth: 0`** per cell so **six** columns share width; inner width **`calc(100% - 20px)`**. **`narrowUnitsRow`** (`windowWidth < 560`) tightens padding and type. **Center line**, static **add-to-cart**, and **`unitsActiveIndex`** (nearest strip center) kept.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Nav HOME breadcrumb → `/lobby` (not shop or `/`)

**Context:** User wanted **HOME** in the **top nav** (mobile menu breadcrumb and checkout confirm **HOME** button) to go to **`/lobby`**, not **`/home/shop`** or **`/`** (root redirects to **`/shop/units`**). **Wishlist lists** was called out.

**Changes:** Replaced premium/standard **`try` / `navigate(isPremium ? '/' : '/home/shop')` / `navigate('/home/shop')`** handlers with **`navigate('/lobby')`** across matching shop/account/checkout/product nav pages. **Shopping bag** and **tools** HOME had used **`navigate('/')`** → **`/lobby`**. **Gift card** menu HOME **`/build-a-wig`** → **`/lobby`**. **Checkout confirm** **`handleHomeClick`** → **`/lobby`**; removed unused **`isPremiumMember`**. **Leave-review-order** HOME → **`/lobby`**. Unchanged: **SHOP &gt;** / back to **`/home/shop`** or **`/shop/units`**, lobby shop CTAs, **`/`** redirect in **App.tsx**.

- **Files:** Many **`src/pages/**/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Nav bar cart icon: 2px left (active + inactive)

**Context:** User asked to move the **active/inactive** nav **`DynamicCartIcon`** **2px left** on **all** top nav bars, without affecting cart icons in modals/sheets (e.g. **`width={28}`** rows).

**Changes:** **`DynamicCartIcon`**: optional **`variant?: 'default' | 'nav'`**; **`variant="nav"`** applies **`translateX(-2px)`** combined with existing **`translateY`** for empty vs non-empty cart. Every top-nav usage with **`width={22} height={19}`** now passes **`variant="nav"`** (~45 page files). Larger **`DynamicCartIcon`** instances unchanged.

- **Files:** **`src/components/DynamicCartIcon.tsx`**, many **`src/pages/**/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand expiry picker: true floating popup (not in-flow below field)

**Context:** User wanted the **SELECT DATE** calendar to behave as a **popup overlay**, not as content **expanding below** the input in the form layout.

**Changes:** **`BrandExpiresDatePicker`**: **`useLayoutEffect`** + **`updatePopoverPosition`** (`getBoundingClientRect` on trigger, **`position: fixed`** coords) so the portaled panel anchors to the button; **flip above** when near viewport bottom; **scroll/resize** (capture) + **`requestAnimationFrame`** reposition; **outside click** uses **`triggerRef`** + **`popoverRef`** (replaced broken **`wrapRef`**). Root wrapper no longer **`relative`** (only the trigger occupies layout). Stronger **`boxShadow`**, **`zIndex: 10000`**.

- **Files:** **`src/components/BrandExpiresDatePicker.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand expiry calendar: day cells like cap selection (no gray boxes)

**Context:** User wanted **no gray boxes** on calendar dates; **selected** day should use **red border**, **white** background, **red** text (aligned with product **cap** selection styling — Futura PT Medium, brand red).

**Changes:** **`BrandExpiresDatePicker`** day buttons: removed **gray** borders (**`#e5e7eb`**) and **`hover:bg-gray-50`**; default days **transparent** border/background (**`1px solid transparent`** for stable layout). **Selected:** **`1.3px solid #EB1C24`**, **`#FFFFFF`** fill, **`#EB1C24`** text, **`Futura PT Medium` / `fontWeight: 500`**. **Today** (when not selected): **`1.3px`** red border only, transparent fill, black text.

- **Files:** **`src/components/BrandExpiresDatePicker.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand CODES: create flow replaces main card; TRACK USAGE hidden; red close icon

**Context:** User reported **CREATE CODE** did not truly **replace** the main brand card (still saw **BRAND**, stats, tabs); **TRACK USAGE** was visible in the wrong place while creating; close should match **membership premium upgrade chart** (**red** icon), not black **`close-icon.svg`**.

**Changes:** **`admin/brand/page.tsx`**: When **`activeTab === 'CODES'`** and **`showCreateCodePanel`**, render **only** a dedicated frosted card (same shell as premium chart: **`border`**, **`bg-white/60`**, **`minHeight`**, transition) with header **CREATE CODE** (**12px** red Futura) + **`additional-features.svg`** (**`createCodePanelCloseIcon`**, **20×20** like **`membership/page.tsx`**). Form in **`flex-1`** scroll; **SAVE CODE** in card footer. **TRACK USAGE** only with the BRAND / tiles / tabs list view (**`!showCreateCodePanel`**). Nested ternary parentheses fixed.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand expiry date picker: calendar centered in viewport

**Context:** User wanted the **SELECT DATE** popover **centered in the viewport** instead of anchored to the trigger.

**Changes:** **`BrandExpiresDatePicker`**: portaled panel uses **`position: fixed`**, **`top/left: 50%`**, **`transform: translate(-50%, -50%)`**; **`maxHeight: calc(100vh - 32px)`** + **`overflowY: auto`** for short viewports. Removed **`popoverPos`**, **`updatePopoverPosition`**, and **`useLayoutEffect`** scroll/resize positioning.

- **Files:** **`src/components/BrandExpiresDatePicker.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand: header CREATE CODE + dashboard opens create; close panel on save

**Context:** User wanted **AdminHeader** to show **CREATE CODE** (not **BRAND**) while the create panel is open; **SAVE** should **close** the panel; entry from dashboard should feel like the **full create card** replacing the main brand UI (not stuck on overview/tabs).

**Changes:** **`admin/brand/page.tsx`**: **`useLocation` / `useNavigate`**; effect reads **`location.state.openCreateCode`** → **`setActiveTab('CODES')`**, **`setShowCreateCodePanel(true)`**, **`replace`** with cleared state. **`AdminHeader`** **`title`** and **`onBack`**: when create panel open, title **CREATE CODE** and back **closes panel** (else **`history.back`**). **`handleSavePromoCode`** calls **`setShowCreateCodePanel(false)`** after save. Create card top row: **red X only** (no duplicate **CREATE CODE** next to header title). **`admin/dashboard/page.tsx`**: **BRAND** card navigates to **`/admin/brand`** with **`{ state: { openCreateCode: true } }`**.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`src/pages/admin/dashboard/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand TRACK USAGE: smaller action buttons + more gap

**Context:** User wanted **COPY** / **RESET** / **DEACTIVATE** (and **ACTIVATE**) buttons **~20% smaller** with **more space** between them on the CODES **TRACK USAGE** list.

**Changes:** **`admin/brand/page.tsx`**: column **`gap-1` → `gap-2.5`**; buttons **`text-[10px]` → `8px`**, padding **`px-2 py-1` (8×4px) → `6×3px`** (~80% scale), **`lineHeight: 1.2`**; borders stay **1px**.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand expiry picker: single highlight, clear keeps calendar open, today ring rules

**Context:** User saw **two** dates emphasized (**selected** + **today** ring). Wanted **CLEAR DATE** to clear selection **without closing** the popover.

**Changes:** **`BrandExpiresDatePicker`**: **`selectedParsed`** from **`parseIsoLocal(value.trim())`**; **`isSelected`** by **year/month/day** match. **Today** red outline only when **no selection** or that cell **is** the selected day. **CLEAR DATE** only **`onChange('')`**. Month nav: no **`hover:bg-gray-50`**. Day **`key={iso}`**.

- **Files:** **`src/components/BrandExpiresDatePicker.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand CODES layout: X + title in create card; buttons below card; TRACK USAGE inside card

**Context:** User lost a clear **close** on create (**X**); did not want only a header-style icon row without **CREATE CODE** + **X**. **CREATE CODE** and **SAVE CODE** should sit **below** the frosted main card, not inside it. **TRACK USAGE** should live **inside** the CODES list card again, not on the marble below the card.

**Changes:** **`admin/brand/page.tsx`**: **Create** mode — card header **`justify-between`**: **CREATE CODE** (**h2**, red Futura) + **`additional-features.svg`** close; form only inside card (**`maxHeight`** scroll); **`SAVE CODE`** in **`marginTop: 10px`** block **below** card. **CODES list** mode — **TRACK USAGE** + list in **`flex-1 min-h-0 overflow-hidden`** region inside the card; list uses **`flex-1 min-h-0 overflow-y-auto`**; **CREATE CODE** button **below** card (**`marginTop: 10px`**). Create card dropped tall **`minHeight`**.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin dashboard: BRAND card right of REFERRALS

**Context:** User wanted **BRAND** and **REFERRALS** tiles swapped on the **2-column** dashboard grid so **BRAND** is **to the right** of **REFERRALS**.

**Changes:** **`admin/dashboard/page.tsx`**: In **`statsData`**, **`REFERRALS`** entry now immediately precedes **`BRAND`** (same row: referrals left, brand right).

- **Files:** **`src/pages/admin/dashboard/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home shop UNITS card matches /shop/units (size, overflow, cart icons)

**Context:** On **`/home/shop`** (products page), the **UNITS** marble card had **smaller** mannequins than **`/shop/units`**, **top clipping** on bag icons / art, and a **single** top-right add-to-cart instead of **per-product** placement like the units page.

**Changes:** **`src/pages/products/page.tsx`**: Replaced the “all six equal flex columns + one active product cart + `translateY(-10px)`” layout with the **same structure as** **`src/pages/products/units/page.tsx`**: marble **`overflow: 'visible'`**; content row **`space-between`** + **left/right arrows** when **`unitsProducts.length >= 4`**; middle column **`overflow: 'visible'`**; **shopping bag overlay** per product with **`top: '-38px'`** and **`calc(index * 50% + unitsScroll …)`** (even/odd left/right offsets); inner track **`translateX(unitsScroll)`**; desktop row **`calc(100% - 20px)`** + **`flex: 0 0 25%`**; mobile **`calc(300% - 20px)`** + **`flex: 0 0 calc(100% / 6)`** for six items; cell **`translateX`/`translateY(-4px)`** and image **`marginLeft: '10px'`**; typography matches units (NOIR 19px / others 18px, detail 10px, price/caps 12px, gap 14px). **State:** **`unitsScroll`** + **`unitsInnerRowRef`**; **`handleUnitsLeftArrow` / `handleUnitsRightArrow`** with step **`strip.clientWidth * 0.5`** (desktop) or **`window.innerWidth * 0.713`** (mobile) and max from **`strip.clientWidth - inner.scrollWidth`**; resize **clamp** effect. Removed **`unitsActiveIndex`**, **`useLayoutEffect`** centering, and **`narrowUnitsRow`**.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home shop UNITS: revert arrows/unitsScroll; mirror similar-products strip (static row)

**Context:** User clarified they **did not** want arrows, **`unitsScroll`**, or NOIR-style step/snap on the home UNITS card; prior instructions were to **remove** those and mirror the **similar products** strip **without** the carousel.

**Changes:** **`src/pages/products/page.tsx`**: Removed **`unitsScroll`**, refs, clamp **`useEffect`**, and arrow handlers/buttons. UNITS uses a **static** centered strip: **`translateY(-15px)`** only on the row (like similar products), **`width: calc(100% - 20px)`**, six columns **`flex: 1 1 0`**, **`minWidth: 0`**. Bag icons **per cell** (**`top: -38px`**, even **`left: 16px`**, odd **`right: 16px`**). Marble **`overflow: 'visible'`**. Removed unused **`useRef`** import.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home/shop: BUNDLES, CLOSURES & FRONTALS marbles + /shop routes

**Context:** User wanted **three** marble cards **below UNITS** on **`/home/shop`**, **same vertical spacing** as stacked marbles on **`/shop/units`** (**`marginTop` / `marginBottom` `20px`** per card). Each card (**BUNDLES**, **CLOSURES**, **FRONTALS**) shows **STRAIGHT / WAVY / CURLY** texture thumbnails (not individual unit names); every tile and the header navigate to **`/shop/bundles`**, **`/shop/closures`**, or **`/shop/frontals`** respectively (same destination per category).

**Changes:** **`src/pages/products/page.tsx`**: Wrapped shop content in a **`transition-all`** parent; **`shopTextureStripItems`** + **`shopCategoryMarbleCards`**; three marbles after UNITS with headers and a **three-column** strip (images from units thumbs, **18px** Covered labels). **`src/pages/shop/category/page.tsx`**: shared minimal landing (roses, back to **`/home/shop`**, marble title) keyed by **`pathname`**. **`src/App.tsx`**: lazy **`ShopCategoryPage`** + routes **`/shop/bundles`**, **`/shop/closures`**, **`/shop/frontals`**.

- **Files:** **`src/pages/products/page.tsx`**, **`src/pages/shop/category/page.tsx`**, **`src/App.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home shop UNITS: match /shop/units cell size + native horizontal scroll

**Context:** User wanted home **`/home/shop`** UNITS to look **exactly** like **`/shop/units`** product rows (same thumbnail scale, no huge **`flex: 1 1 0`** overflow), with **scroll** but **without** re-adding arrow buttons or **`unitsScroll`** / snap logic.

**Changes:** **`src/pages/products/page.tsx`**: Duplicated **shop/units** row math — desktop inner row **`calc(100% - 20px)`**, **`flex: 0 0 25%`**, cell **`translateX`/`translateY(-4px)`**; mobile **`calc(600% - 20px)`** row with **`flex: 0 0 calc(100% / 6)`** so each slot width equals units **50%-of-200%** mobile cell. **`space-between`** + **hidden arrow-sized placeholders** (same transforms as units arrows) so the **strip width** matches units between-arrows. Scroll via **`overflowX: 'auto'`** (**`WebkitOverflowScrolling: 'touch'`**, **`overscrollBehaviorX: 'contain'`**) — no **`translateX`** on the row. Header **`marginBottom: '1px'`** like units. Per-cell bag icons unchanged.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand create panel: red X close (match subscription upgrade)

**Context:** Continuation from prior work on admin **Brand** create-code panel. The close control still used **`additional-features.svg`** (diamond / “header” mark). User wanted the same **red X** as the **subscription / membership upgrade** close.

**Changes:** **`src/pages/admin/brand/page.tsx`**: Removed **`createCodePanelCloseIcon`** import from **`additional-features.svg`**. Close button **`img`** now **`src="/assets/close-icon.svg"`** with **`filter: invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)`** (same red treatment as membership tier-benefits close). Kept **20×20** and existing **`aria-label`**.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand expiry picker: CLEAR DATE without closing (stopPropagation on portal)

**Context:** User reported **CLEAR DATE** on the branded expiration calendar still **closed** the popover; it should only **`onChange('')`** and leave the calendar open.

**Changes:** **`BrandExpiresDatePicker`**: The dialog is portaled to **`document.body`**. The global **`mousedown`** outside handler could still treat some inside clicks as outside (e.g. target/ref edge cases). On the **popover root** (the element with **`popoverRef`**), added **`onPointerDown` + `onMouseDown`** with **`stopPropagation()`** so those events never bubble to **`document`**, while outside clicks still hit **`document`** and close as before. **CLEAR DATE** remains **`onChange('')`** only (no **`setOpen(false)`**).

- **Files:** **`src/components/BrandExpiresDatePicker.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand: create-code card height matches BRAND card

**Context:** User wanted the **CREATE CODE** main frosted card to use the **same height** as the **admin BRAND** CODES card; create flow card was shorter.

**Changes:** **`src/pages/admin/brand/page.tsx`**: On the create-code outer card, set **`minHeight: 'calc(100vh * 520 / 745 + 7px)'`** (same as BRAND card). Form scroll region: **`flex-1 min-h-0`** instead of a fixed **`maxHeight`**, so the body fills the card and scrolls inside like the **TRACK USAGE** block on the BRAND card.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Default site route: `/` → `/home/shop` (not `/shop/units`)

**Context:** User wanted the **main** entry route for the site to be **`/home/shop`** instead of **`/shop/units`**.

**Changes:** **`src/App.tsx`**: **`Route index`** and **`Route path="/"`** **`Navigate`** targets changed from **`/shop/units`** to **`/home/shop`**. **`motherboard/CORE.md`**: note that the app default redirect is **`/home/shop`**.

- **Files:** **`src/App.tsx`**, **`motherboard/CORE.md`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand ALERTS: SEND NOTIFICATION below card (replaces EXPORT there)

**Context:** User wanted **SEND NOTIFICATION** under the **ALERTS** tab to **replace** the bottom **EXPORT ANALYTICS** action for that tab, with the **same styling and position** as **CREATE CODE** under **CODES** (**`marginTop: 10px`**, full-width **`pageActionButtonStyle`**, not **`PageActionsBelowCard`**’s 14px).

**Changes:** **`BrandAlertsPanel`**: **`forwardRef`** + **`useImperativeHandle`** exposing **`sendNotification()`** (via a ref to latest **`handleSendNotif`**); optional **`onSendFooterState`** reports **`{ disabled, label }`** for **`sending` / `loadingNotifs`**. Removed the in-card **SEND NOTIFICATION** button. **`admin/brand/page.tsx`**: **`brandAlertsPanelRef`**, **`alertsSendFooter`** state; when **`activeTab === 'ALERTS`**, bottom row is **`SEND NOTIFICATION`** / **`SENDING...`** matching CREATE CODE wrapper; **OVERVIEW** / **ANALYTICS** keep **EXPORT ANALYTICS** inside **`PageActionsBelowCard`**.

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Shop units / home shop: name spacing + cap-size panel

**Context:** User wanted **6px** more space **above** the black **Covered By Your Grace** product name (NOIR, BLANCO, etc.) on **`/shop/units`** and **`/home/shop`**, and a **white** background with **gray** border around the **XS / S / M / L** cap row (similar to admin **client details** panels: **`bg-white`**, **`border-gray-200`**).

**Changes:** **`products/units/page.tsx`** and **`products/page.tsx`**: product name **`margin`** top changed from **`-10px`** to **`-4px`** (**+6px** gap under the image). Cap-size row wrapped in a flex container with **`backgroundColor: '#FFFFFF'`**, **`border: '1px solid #e5e7eb'`**, **`padding: '6px 10px'`**, **`borderRadius: '2px'`**; spans unchanged (red when selected).

- **Files:** **`src/pages/products/units/page.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin create code: shorter code row labels; $ in value hint (gift)

**Context:** User wanted to drop the **(BARCODE FORMAT)** and **(OFF-PREFIX FORMAT)** suffixes on the create-code **GIFT CARD** / **DISCOUNT** manual-code labels, and show **$** in the **VALUE** hint for gift amounts (**`$50` / `$50.00`**).

**Changes:** **`src/pages/admin/brand/page.tsx`**: Labels **`GIFT CARD`** and **`DISCOUNT`** only; gift value label **`VALUE (E.G. $50 OR $50.00)`**; discount value hint unchanged (**`15 FOR 15%`**).

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: chevron centered in dropdown triggers

**Context:** Red chevrons on **custom header/topic** (and similar) controls used **`translateX(16px)`** (plus extra **`marginLeft`** on full-width rows), so arrows sat outside the **36×36** / padded boxes.

**Changes:** **`BrandAlertsPanel.tsx`**: Removed horizontal offsets; **`transform`** is only **`rotate(180deg)`** when open else **`none`**; **`display: 'block'`** on SVGs; full-width header/topic/client rows rely on **`justifyContent: 'space-between'`** without extra chevron margin.

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: chevrons +8px right (custom header/topic only)

**Context:** User wanted the **custom** header/topic **36×36** dropdown chevrons shifted **8px** right; full-width header/topic and **ADD CLIENTS** chevrons should stay centered (rotate only), not inherit **`translateX(8px)`**.

**Changes:** **`BrandAlertsPanel.tsx`**: **`translateX(8px)`** / **`rotate(180deg) translateX(8px)`** only on the two chevrons beside **ENTER CUSTOM HEADER…** and **ENTER CUSTOM TOPIC…**. Full-width HEADER/TOPIC rows and the client row use **`rotate(180deg)`** vs **`none`** only.

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: header/topic/client borders match message (1.3px)

**Context:** User wanted black borders on **header**, **topic**, and **client** controls to match the **MESSAGE** textarea (**`1.3px solid #000`**).

**Changes:** **`BrandAlertsPanel.tsx`**: Replaced all **`0.8px`** border widths on those rows, their dropdown panels, and the client-picker shell with **`1.3px`** (same as message field).

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: no placeholder on MESSAGE textarea

**Context:** User asked to remove **ENTER NOTIFICATION TEXT...** from the alerts message field; also requested a repo-wide list of input placeholders (answered in chat).

**Changes:** **`BrandAlertsPanel.tsx`**: Removed **`placeholder`** from the **MESSAGE** `<textarea>`.

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Shop category pages: nav like /shop/units (no “back to shop”)

**Context:** **`/shop/bundles`**, **`/shop/closures`**, **`/shop/frontals`** used a minimal layout with **← BACK TO SHOP** and no top bar. User wanted the **same nav** as **`/shop/units`**: frosted bar, back/search, **SHOP &gt;** + category title, cart + hamburger, full mobile menu (SHOP/TOOLS/BRAND), sign out modal, currency sync for cart.

**Changes:** Rewrote **`src/pages/shop/category/page.tsx`**: mirrored **`products/units/page.tsx`** shell (roses, nav, menu, **`ConfirmationModal`**, **`DynamicCartIcon`**, **`BrandMenuLinks`**, **`SocialMenuIcons`**). Breadcrumb: **`SHOP &gt;`** → **`/home/shop`**, red label **BUNDLES** / **CLOSURES** / **FRONTALS**. Main content marble uses **`20px`** vertical margin like other shop marbles. Removed back-only button.

- **Files:** **`src/pages/shop/category/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Revert cap-size white/gray panel on shop units + home/shop

**Context:** User did not like the **white** + **`#e5e7eb`** bordered panel around **XS / S / M / L** on **`/shop/units`** and **`/home/shop`**.

**Changes:** **`products/units/page.tsx`**, **`products/page.tsx`**: cap row is again a plain flex row (**`gap: 14px`**, **`marginTop` / `translateY`** only); removed **`backgroundColor`**, **`border`**, **`padding`**, **`borderRadius`**, and extra **`lineHeight`** on spans.

- **Files:** **`src/pages/products/units/page.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — +4px space above unit product names (shop/units + home/shop)

**Context:** After the earlier **6px** loosening (name **`margin-top`** **`-10px` → `-4px`**), user wanted **4px** more space above the black **Covered By Your Grace** product name.

**Changes:** **`products/units/page.tsx`**, **`products/page.tsx`**: product name **`margin`** top **`-4px` → `0`** (**`margin: '0 0 -3px 0'`**), **+4px** vs prior.

- **Files:** **`src/pages/products/units/page.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home/shop UNITS: arrows + 2D Recently viewed snap scroll

**Context:** User wanted **`/home/shop`** UNITS strip to use **visible arrows** and **snap scrolling** matching the **2D Recently viewed** carousel (**not** drag scroll): left snaps to **0**, right snaps to **`-window.innerWidth * 0.713`**, row **`translateY(-15px)`**.

**Changes:** **`products/page.tsx`**: **`unitsScroll`** state; **`handleUnitsHomeLeftArrow` / `handleUnitsHomeRightArrow`**; **`useEffect`** resets scroll when **`windowWidth`** changes. Replaced hidden arrow placeholders with **NOIR** arrow **buttons**; scroll area **`overflowX: 'hidden'`**; inner track **`transform: translateX(unitsScroll) translateY(-15px)`**; removed **`overflow-x: auto`**. Per-cell vertical nudge **`translateY(-4px)`** dropped so vertical matches Recently viewed row.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: custom chevrons +8px → +12px

**Context:** User increased the horizontal nudge for **custom** header/topic **36×36** dropdown chevrons from **8px** to **12px**; full-width and client chevrons unchanged.

**Changes:** **`BrandAlertsPanel.tsx`**: **`translateX(12px)`** / **`rotate(180deg) translateX(12px)`** on the two custom-only chevrons (same scope as prior **+8px** entry).

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home/shop UNITS: true 2-up row, pixel snap, units-style bag overlay

**Context (full chat):** User said the home **`/home/shop`** UNITS marble strip was still wrong: should show **two products per “page”** like **Recently viewed** (not four-at-25% desktop / old sixth-width-only mobile), with **three snap steps** for six units at **`window.innerWidth * 0.713`**, and **two add-to-cart icons per visible pair** using the same **single overlay** + **`index × slot% + scroll`** positioning as **`/shop/units`**, not per-cell corner bags. **`/shop/units`** itself stays unchanged.

**Decisions / outcomes:** One scrolling row width **`calc(pairCount × 100% - 20px)`** with **`flex: 0 0 calc(100% / n)`** so each slot is half the viewport (2-up). Row transform **`translateX(unitsScrollPx) translateY(-15px)`**; cells use only **`translateX(0 / 10px)`** stagger (no **`translateY(-4px)`** on cells). Bag overlay uses **`translateY(-15px)`** so **`top: -38px`** stays aligned with the row (overlay sits outside the scrolling row). **`unitsScrollPx = -unitsHomePage × unitsSnapStepPx`**. **`unitsSlotPct = (100 × pairCount) / n`** so bag **`left`** math generalizes past exactly six items. **`useEffect`** clamps **`unitsHomePage`** when **`unitsHomeMaxPage`** shrinks.

**Changes:** **`src/pages/products/page.tsx`**: fixed bug where JSX still referenced undefined **`unitsScroll`** (now **`unitsScrollPx`**); added **Shopping Bag Icons Container** mirroring units page; removed per-cell bag divs; dynamic row width / flex basis from **`unitsPairCount`** and **`unitsProducts.length`**.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Site-wide placeholders trimmed; settings placeholder not gray

**Context:** User wanted almost all **`placeholder`** text removed, **keeping**: search fields, sign-in **@** socials, **checkout** promos/ZIP/tip, **careers** skills + cover-letter lines, **Noir** review/contact fields, **settings** personal placeholders — and settings placeholders should **not** appear gray.

**Changes:** Removed placeholders from **`BrandAlertsPanel`** (custom header/topic only; **TYPE TO SEARCH** kept), **`admin/notifications`**, **`admin/revenue`** (tracking + stage notes), **`NewsletterPanel`** subject (search kept), **`admin/meetings/schedule`** notes, **`brand/careers`** (location, URLs, years exp — skills + why-role kept), **`account/affiliate`** link inputs. **`settings/page.tsx`**: **`.settings-personal-input::placeholder`** **`#808080` → `#000`**, font **Futura PT Demi** to match inputs. Unchanged: **`AdminHeader`** search, **`checkout`**, **`sign-in`** socials, **`straight/noir`**, **`careers`** two textareas.

- **Files:** **`BrandAlertsPanel.tsx`**, **`admin/notifications/page.tsx`**, **`admin/revenue/page.tsx`**, **`NewsletterPanel.tsx`**, **`admin/meetings/schedule/page.tsx`**, **`brand/careers/page.tsx`**, **`account/affiliate/page.tsx`**, **`account/settings/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: custom chevrons centered (no translateX)

**Context:** User reported **custom** HEADER/TOPIC **36×36** chevrons still not centered in their boxes; prior **`translateX(8px/12px)`** nudges conflicted with **`justify-content: center`** on the button.

**Changes:** **`BrandAlertsPanel.tsx`**: Custom header/topic dropdown triggers now use the same transform as full-width rows — **`rotate(180deg)`** when open, **`none`** when closed — no **`translateX`**. All five chevrons share one pattern; flex centers the SVG in the square.

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Marble strip headers: 2px above/below red title

**Context:** User wanted **2px** spacing **above and below** the red marble title text (replacing the prior **~8px** rule-to-text and **1px** text-to-strip gaps from the header wrapper).

**Changes:** Vertical rule **`margin`** bottom **`8px` → `2px`**; header wrapper **`marginBottom`** **`1px` → `2px`** on **`/home/shop`** UNITS + category marbles (**`products/page.tsx`**), texture marbles (**`products/units/page.tsx`**), and the matching block on **`shop/category/page.tsx`**.

- **Files:** **`src/pages/products/page.tsx`**, **`src/pages/products/units/page.tsx`**, **`src/pages/shop/category/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand OVERVIEW: remove redundant 2×2 metric panels

**Context:** User found the **four** frosted stat tiles under **OVERVIEW** redundant with **KEY METRICS** (same retention, referral, repeat, growth values).

**Changes:** **`src/pages/admin/brand/page.tsx`**: Removed the **`grid grid-cols-2`** block; **KEY METRICS** is now the first block in the tab (**`marginTop: 16px`** on its heading).

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — UNITS strip vertical nudge: shop/units −6px, home/shop +4px

**Context:** User wanted mannequin thumbnails plus product info and cap sizes moved **up 6px** on **`/shop/units`** and **down 4px** on **`/home/shop`**, in tandem.

**Changes:** **`units/page.tsx`**: product cell **`translateY(-4px)` → `translateY(-10px)`**; bag overlay icons **`top: -38px` → `-44px`** to stay aligned with thumbs. **`products/page.tsx`**: UNITS scrolling row and bag overlay **`translateY(-15px)` → `translateY(-11px)`** (4px downward).

- **Files:** **`src/pages/products/units/page.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home/shop category thumbnails → texture PDPs (gift-card layout)

**Context:** User wanted **BUNDLES / CLOSURES / FRONTALS** texture thumbnails on **`/home/shop`** to open product pages at **`/straight/bundles`**, **`/wavy/frontals`**, etc., with **gift card**–style layout (marble-half background, frosted main card, hero, tabs, add to bag, similar + recently viewed carousels).

**Changes:** New **`src/pages/shop/texture-category-product/page.tsx`** parses **`/:texture/:category`**, renders gift-card–pattern UI, **SIMILAR** = other two textures same category, **RECENTLY VIEWED** matches gift card strip. **`App.tsx`**: nine lazy routes **`/straight|wavy|curly`/`bundles|closures|frontals`**. **`products/page.tsx`**: strip items include **`slug`**; marble cards **`categorySlug`**; thumbnail **`navigate(`/${slug}/${categorySlug}`)`** (red title still goes to **`/shop/...`**).

- **Files:** **`src/pages/shop/texture-category-product/page.tsx`**, **`src/App.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: full-width chevrons nudged right (12px)

**Context:** User said **non-custom** (full-width HEADER/TOPIC, **ADD CLIENTS**) chevrons still had not moved right; prior “rotate only” state dropped **`translateX`** on those rows.

**Changes:** **`BrandAlertsPanel.tsx`**: Module constant **`FULL_WIDTH_CHEVRON_NUDGE_PX = 12`**; full-width header/topic and client row SVGs use **`translateX(12px)`** closed and **`rotate(180deg) translateX(12px)`** open. **Custom** **36×36** triggers unchanged (**absolute** **`translate(-50%, -50%)`** ± rotate).

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — UNITS RAW line: +1px top margin for non-NOIR (align with NOIR)

**Context:** **NOIR** uses **19px** name vs **18px** for others, so the red **RAW** line sat higher for non-NOIR; user wanted **1px** more space above the red line for every product **except** NOIR so the RAW row lines up visually.

**Changes:** Hair-details **`<p>`** **`margin`**: **`NOIR`** **`0 0 5px 0`**; others **`1px 0 5px 0`** on **`/shop/units`** and **`/home/shop`** UNITS strip.

- **Files:** **`src/pages/products/units/page.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin marble cards: tab row `mb-6` + scroll `paddingTop` 2px (match client Activity)

**Context:** User wanted spacing between admin tab strips and scrollable content to match **client details** **DETAILS** tabs (**Activity** list uses **`mb-6`** on tabs and **`paddingTop: '2px'`** on the scroll body) so scrolled text does not sit too close to tab labels.

**Changes:** Added **`mb-6`** to admin tab rows using **`gap-[14px] px-5`** on **brand** (main + codes), **revenue**, **analytics**, **meetings**, **pending**, **referrals**, **reviews**, **backend**, **marketing** (tab strip wrapper), and **clients** main list tabs. Set tab-adjacent scroll areas to **`paddingTop: '2px'`** where they were **`8px`** or **`12px`** (revenue main tab content wrapper, clients list, meetings block below tabs, pending/referrals/reviews/backend). **Marketing:** removed **`marginTop: '16px'`** on the tab panel scroll (spacing from **`mb-6`** on tabs). **Clients:** **DETAILS | Cart | Wishlist** sub-tabs **`mb-4` → `mb-6`**.

- **Files:** **`src/pages/admin/brand/page.tsx`**, **`revenue/page.tsx`**, **`analytics/page.tsx`**, **`marketing/page.tsx`**, **`meetings/page.tsx`**, **`pending/page.tsx`**, **`referrals/page.tsx`**, **`reviews/page.tsx`**, **`backend/page.tsx`**, **`clients/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Home/shop BUNDLES/CLOSURES/FRONTALS: 2-up carousel like UNITS

**Context:** User asked why those marbles had no arrows or center line and showed all three textures; they wanted **two visible at a time** with the third sharing the previous slot (**STRAIGHT+WAVY** then **WAVY+CURLY**), matching UNITS behavior.

**Changes:** **`products/page.tsx`**: Per-category **`textureCategoryPage`** state; **`150%`** row, **`calc(100%/3)`** cells; snap = **one cell width** **`(viewport.clientWidth * 1.5 - 20) / 3`** via **`ResizeObserver`** on first strip (not **`0.713 * innerWidth`**, which overscrolled so page 2 showed only CURLY). **NOIR** arrows, center line + tunnel mask, **`translateY(-11px)`** row; **`shopTextureStripItems` / `shopCategoryMarbleCards`** **`useMemo`** moved above carousel state. **`maxPage = n - 2`** for overlapping pairs.

- **Files:** **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — /shop/units: bag icons +6px down, thumbnails −12%

**Context:** User wanted add-to-cart icons **6px lower** on each unit card and mannequin thumbnails **12% smaller** on **`/shop/units`**.

**Changes:** **`products/units/page.tsx`**: bag **`top`** **`-44px` → `-38px`**; product **`img`** **`width`** **`90%` → `calc(90% * 0.88)`** (12% reduction).

- **Files:** **`src/pages/products/units/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — /shop/units: bag `top` −34px; column centering for mannequin + copy

**Context:** User wanted bag **`top`** **`-38px` → `-34px`**, and content **centered in each half** (card edge ↔ center black line on 2-up): name, red RAW, price, caps; mannequin centered above that block.

**Changes:** **`products/units/page.tsx`**: bag **`top: '-34px'`**; each product cell **`display: flex`**, **`flexDirection: column`**, **`alignItems: center`**; mannequin in full-width flex row **`justifyContent: center`**; copy in inner **`width: 100%`**, **`textAlign: center`**; removed **`marginLeft: 10px`** on thumb and mobile **`translateX(10px)`** stagger on odd columns.

- **Files:** **`src/pages/products/units/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Half-band flex + snap alignment: /shop/units desktop 2-up, home/shop UNITS + category strips

**Context:** User wanted **right** column content in the same **edge ↔ center line** band treatment as **left**, and **home/shop** UNITS + BUNDLES/CLOSURES/FRONTALS to use the same centered flex so **snap** lines up like the prior column.

**Changes:** **`products/units/page.tsx`**: outer cell **`padding: 0`**, inner band **`width: 100%`**, **`alignItems: center`**, symmetric **`padding: 5px 12px`**; desktop **`flexBasis`** **`50%`** when **`< 4`** products (was **`25%`** for two units). **`products/page.tsx`**: UNITS strip same band wrapper, removed **`translateX(10px)`** stagger + thumb **`marginLeft`**; bag **`top`** **`-34px`**; category texture cells same band + no stagger.

- **Files:** **`src/pages/products/units/page.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: chevrons +4px, open/closed alignment, topic row nudge, taller dropdowns

**Context:** User wanted full-width **HEADER** / **TOPIC** / **ADD CLIENTS** chevrons moved **4px further right** (from **12px** nudge), **up** (open) arrows to sit in the **same horizontal position** as **down** (closed) arrows, **TOPIC** full-width row to get the same nudge as **HEADER** (it previously had none), **CUSTOM** not clipped at the bottom of dropdowns, and **36×36** custom header/topic triggers to stay **centered** (**`translate(-50%, -50%)`** only — unchanged).

**Changes:** **`BrandAlertsPanel.tsx`**: **`FULL_WIDTH_CHEVRON_NUDGE_PX` = 16**; open state uses **`translateX(16px) rotate(180deg)`** (not **`rotate` then `translateX`**) so the nudge stays in screen space and matches closed **`translateX(16px)`**. Full-width **TOPIC** chevron uses the same nudge + order. **`ALERT_DROPDOWN_MAX_HEIGHT_PX` = 300** for all four header/topic lists (was **220px**). Custom **36×36** SVGs unchanged.

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin tabs: remove `mb-6` below tab rows (match marketing spacing)

**Context:** Prior change added **`mb-6`** under admin marble tab strips so scroll content wasn’t tight to tabs; user found body text then sat **too low** vs **admin marketing** (**AFFILIATE** / **CHALLENGES** / etc.), where tabs sit directly above the scroll with only **`paddingTop: '2px'`** on the scroll.

**Changes:** Removed **`mb-6`** from all **`gap-[14px]`** tab rows on **analytics**, **pending**, **referrals**, **reviews**, **backend**, **revenue**, **meetings**, **brand** (both strips), **clients** (main list tabs, **DETAILS** tabs, **PERSONAL_SECTION** tabs). Kept **`paddingTop: '2px'`** on tab scroll areas where already set.

- **Files:** **`src/pages/admin/analytics/page.tsx`**, **`pending/page.tsx`**, **`referrals/page.tsx`**, **`reviews/page.tsx`**, **`backend/page.tsx`**, **`revenue/page.tsx`**, **`meetings/page.tsx`**, **`brand/page.tsx`**, **`clients/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Brand alerts: full-width chevron nudge 20px (align with 36×36 custom arrow)

**Context:** User wanted full-width row chevrons aligned horizontally with the down chevron on the **custom** **36×36** HEADER/TOPIC trigger (**+4px** from prior **16px** nudge).

**Changes:** **`BrandAlertsPanel.tsx`**: **`FULL_WIDTH_CHEVRON_NUDGE_PX` = 20** (was **16**). Custom square buttons still use centered SVG only (no nudge constant).

- **Files:** **`src/pages/admin/components/BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin Brand: dashboard opens OVERVIEW (not CODES / create)

**Context:** User wanted **admin Brand** to load on the **OVERVIEW** tab, not the **CREATE CODE** flow.

**Changes:** **`dashboard/page.tsx`**: **BRAND** card **`navigate('/admin/brand')`** without **`state: { openCreateCode: true }`** (that had forced **CODES** + create panel). **`brand/page.tsx`** still supports **`location.state.openCreateCode`** if something passes it later.

- **Files:** **`src/pages/admin/dashboard/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Dashboard StatsCard tiers row: edge-aligned, space-between

**Context:** User wanted **CLIENTS** (**BLACK / RED / SILVER**) and **REVENUE** (**Q1–Q4**) tier lines aligned with the **gray border** above (first/last text at the border’s left/right edges), not visually indented from **equal columns + centered** text, while keeping **even spacing between** items.

**Changes:** **`StatsCard.tsx`**: tiers row **`justify-between`**, removed **`flex-1 text-center`** per cell; each segment **`shrink-0`** natural width; **`overflow-x-auto scrollbar-hide`** if the row overflows on narrow cards.

- **Files:** **`src/pages/admin/components/StatsCard.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Shop product marble cards: arrows out of flex, center line + debug alignment

**Context:** Continuing product flex debug on **`/shop/units`** and **`/home/shop`**: user wanted green debug column outlines’ **sides and bottom** to match the marble card, the **column split** to match the **black center line**, and **nav arrows removed from the flex row** so they don’t shrink the track or skew the 50/50 split.

**Topics covered:** Layout of marble “content area” (center line at `left: 50%` of full-width strip), arrow placement, row width `calc(… - 20px)` legacy, vertical `translateY` on rows/columns, scroll snap distances tied to old inset width.

**Decisions / outcomes:** Wrap content in **`position: relative; width: 100%`**, **`position: absolute`** left/right arrow buttons (`zIndex: 25`, vertically centered), single full-width inner column for line + scroll. Product flex row uses **full logical width** (`pairCount×100%` or `n×25%` on large screens for `/shop/units`; **`unitsPairCount×100%`** on home UNITS; **`textureCategoryRowPct%`** for BUNDLES/CLOSURES/FRONTALS) — **no `-20px`**. **`alignItems: stretch`** on product rows; removed **`translateY(-10px/-11px)`** and negative **`marginTop`** on scroll wrappers where they hurt alignment. **Scroll step** updates: **`/shop/units`** right-arrow uses **`Math.max(200, windowWidth - 32)`**; home **`unitsSnapStepPx`** same idea; texture category **`textureCategoryCellStepPx`** uses **`(w * 1.5) / 3`** (drop **`-20`**). Home UNITS cells use same **`dbgProductCol` / `dbgProductBand`** when debug is on. **`DEBUG_PRODUCT_FLEX_BOUNDS`** default **`false`** on both pages.

**Changes:** **`src/pages/products/units/page.tsx`**, **`src/pages/products/page.tsx`**, **`motherboard/MEMORY.md`** (this entry).

**Conventions:** For these marbles, treat arrows as **overlays**; center line and 50% slots are defined against the **full card content width**, not a flex-shrunk middle column.

---

## 2026-03-28 — Home shop: fix “Cannot access uninitialized variable” (ProductsPage)

**Context:** Red error screen on load after marble layout changes.

**Cause:** **`unitsSnapStepPx`** used **`windowWidth`** before **`const [windowWidth, …]`** was declared (temporal dead zone).

**Changes:** Moved **`unitsSnapStepPx`**, **`unitsScrollPx`**, and **`unitsSlotPct`** to immediately **after** the **`windowWidth`** **`useState`** in **`src/pages/products/page.tsx`**.

---

## 2026-03-28 — Admin marble scroll: `paddingBottom: 24px` (match client details + marketing)

**Context:** Tab scroll areas had **`paddingTop: '2px'`**; user wanted **bottom** breathing room like **client details** and other marbles so scrolled text doesn’t hug the card edge.

**Changes:** **`paddingBottom: '24px'`** on client-details scrollers (**activity**, reviews list, messages), **clients** main list (**8px → 24**), **revenue** main tab inner wrapper (**0 → 24**), **meetings** list scroll (**pb-2 → 24** in style; outer wrapper stays **8px**), **brand** create-code panel (**20 → 24**) and **CODES** usage list scroll, **audit** log list (**16 → 24**), **invites** popup table scroll (**8 → 24**), **BrandAlertsPanel** client picker (**8 → 24**). Pages already at **24px** (marketing, analytics main, pending, referrals, reviews, backend, brand main tab body) unchanged.

- **Files:** **`clients/page.tsx`**, **`revenue/page.tsx`**, **`meetings/page.tsx`**, **`brand/page.tsx`**, **`audit/page.tsx`**, **`BrandAlertsPanel.tsx`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — Admin marble scroll: bottom gap **outside** `overflow-y-auto` (wrapper `paddingBottom`)

**Context:** User saw **no visible change** from **`paddingBottom`** on the same node as **`overflow-y-auto`**; they wanted space **between the scroll viewport bottom and the card’s bottom edge**, not only inside the scrollable content.

**Changes:** Wrap each tab (or list) **`overflow-y-auto`** region in a non-scrolling parent with **`paddingLeft` / `paddingRight` / `paddingBottom: '24px'`** (horizontal on wrapper where needed); inner scroll keeps **`maxHeight`** + **`paddingTop: '2px'`** only. Applied across **marketing**, **analytics**, **pending**, **referrals**, **reviews**, **backend**, **brand** (main + create-code + CODES usage list), **clients** main list + **details** (activity, review cards list, messages) + **invites** popup, **revenue** main tab + **pending orders** card (removed in-scroll spacer div), **meetings** list block, **audit**, **BrandAlertsPanel** client picker (fixed portal closing **`</div>`** count).

---

## 2026-03-28 — Home/shop mannequin thumbnails −20%

**Context:** User wanted mannequin thumbnails smaller on **`/home/shop`** (**`ProductsPage`**).

**Changes:** **`src/pages/products/page.tsx`**: product **`img`** **`width`** **`'90%'` → `'72%'`** (×0.8) for **UNITS** strip and **BUNDLES / CLOSURES / FRONTALS** texture marbles.

---

## 2026-03-28 — Shop UNITS strips: measured snap + cart icons in cells

**Context:** Paged UNITS scroll still misaligned center line / green debug vs previous page; user suspected name padding or add-to-bag overlay math.

**Changes:** **`products/page.tsx`**: ref + **`ResizeObserver`** on UNITS **`overflow-x: hidden`** viewport → **`unitsStripViewportW`**; **`unitsSnapStepPx`** = that **`clientWidth`**. Add-to-bag moved **inside** each product column (**`position: absolute`**, **`left: 16`** vs **`right: 34`** by **`index % 2`**) so it scrolls with the row. Unified product title (**18px**, **`minHeight`**, flex-centered) and subtitle margins. Removed unused **`unitsSlotPct`**. **`units/page.tsx`**: same measured width from STRAIGHT strip ref (shared for WAVY/CURLY scroll steps); icons inlined per cell; same typography normalization.

---

## 2026-03-28 — Similar / Recently viewed marble strips: measured snap (all PDP-style pages)

**Context:** User wanted the same **measured viewport snap** behavior as shop UNITS for **SIMILAR PRODUCTS** and **RECENTLY VIEWED** on product pages (2D/3D hero PDPs and related flows).

**Changes:** New hook **`src/hooks/useMarbleStripSnapStep.ts`**: **`ResizeObserver`** on the **`overflow-x: hidden`** viewport → **`snapPx`** (min 200). Each strip gets its own hook instance + **`ref`** on that viewport. Right-arrow / drag snap uses **`-snapPx`** instead of **`window.innerWidth * 0.713`** (or 0.73). Inner row **`width`** **`calc(200% - 20px)` → `200%`**. **Noir** only: drag/arrow bounds keep **3D vs 2D** ratios using measured width (**similar:** `0.5/0.713` vs full **`similarSnapPx`**; **recent:** `0.53/0.73` vs full **`recentSnapPx`**).

**Files:** **`straight/noir/page.tsx`**, **`straight/blanco/page.tsx`**, **`wavy/soft-wave/page.tsx`**, **`wavy/beach-wave/page.tsx`**, **`curly/soft-curl/page.tsx`**, **`curly/ocean-curl/page.tsx`**, **`shop/texture-category-product/page.tsx`**, **`tools/gift-card/page.tsx`**, **`hooks/useMarbleStripSnapStep.ts`**, **`motherboard/MEMORY.md`** (this entry).

---

## 2026-03-28 — PDP SIMILAR PRODUCTS order (six hero units)

**Context:** User specified exact left-to-right order for the **SIMILAR PRODUCTS** strip (2D/3D) on six unit PDPs, **excluding** the current product from the four cards.

**Orders implemented:**
- **Noir:** Blanco → Soft wave → Beach wave → Soft curl (Soft wave copy **24" RAW INDIAN** / $760; Beach wave **BEACH WAVE FRONT.JPG** + Indonesian $760).
- **Blanco:** Noir → Soft wave → Beach wave → Soft curl (removed duplicate Blanco card; fixed prior empty price `<p>`).
- **Soft wave:** Beach wave → Noir → Soft curl → Ocean curl.
- **Beach wave:** Soft wave → Noir → Soft curl → Ocean curl (dropped Blanco from similar strip).
- **Soft curl:** Ocean curl → Beach wave → Soft wave → Noir.
- **Ocean curl:** Soft curl → Beach wave → Soft wave → Noir.

**Changes:** **`src/pages/straight/noir/page.tsx`**, **`straight/blanco/page.tsx`**, **`wavy/soft-wave/page.tsx`**, **`wavy/beach-wave/page.tsx`**, **`curly/soft-curl/page.tsx`**, **`curly/ocean-curl/page.tsx`**, **`motherboard/MEMORY.md`** (this entry). **Recently viewed** strips unchanged.

---

## 2026-03-28 — Home/shop strip arrows + recently viewed wiring (Q&A)

**Context:** User asked to shrink **`/home/shop`** marble-strip arrows to match **SIMILAR PRODUCTS** / **RECENTLY VIEWED** on PDP-style pages, and whether **recently viewed** is dynamic from real history or static.

**Changes:** **`src/pages/products/page.tsx`**: UNITS + texture-category marble **left/right arrow** buttons **`padding: '8px'` → `'5px'`** (SVGs already **14×14px**, same as similar/recently).

**Answer (recently viewed):** **Static curated strips** in JSX per page—not backed by localStorage or a “last visited” queue. **`useMarbleStripSnapStep`** only measures snap distance; **`recentlyViewedScroll`** state controls horizontal scroll. Example: **`shop/texture-category-product/page.tsx`** hardcodes four cards (e.g. soft wave, soft curl, noir, blanco); hero PDPs (e.g. **`straight/noir/page.tsx`**) use the same pattern with fixed product blocks.

---

## 2026-03-28 — Shop marble headers: UNITS / BUNDLES / CLOSURES / FRONTALS nudge up 1px

**Context:** User wanted only those category title texts moved **up 1px** on **`/home/shop`**.

**Changes:** **`src/pages/products/page.tsx`**: **`transform: 'translateY(-1px)'`** on the red **`h3`** for **UNITS** and on the mapped **`h3`** for **BUNDLES**, **CLOSURES**, **FRONTALS** (divider line above unchanged).

---

## 2026-03-28 — Home/shop mannequin thumbnails +10%

**Context:** User wanted mannequin thumbnails **10% larger** on **`/home/shop`**.

**Changes:** **`src/pages/products/page.tsx`**: product **`img`** **`width`** **`'72%'` → `'79.2%'`** (×1.1) for **UNITS** strip and **BUNDLES / CLOSURES / FRONTALS** texture marbles.

---

## 2026-03-28 — Home/shop product band nudge up 8px

**Context:** User wanted **mannequin thumbnail + product text + cap size row** moved **up 8px together** on **`/home/shop`**.

**Changes:** **`src/pages/products/page.tsx`**: **`transform: 'translateY(-8px)'`** on the inner flex band (**thumbnail + copy + XS–L**) for **UNITS** and for **BUNDLES / CLOSURES / FRONTALS** texture cells. **UNITS** add-to-bag overlay **`top`** **`-34px` → `-42px`** so it stays aligned with the shifted thumb.

---

## 2026-03-28 — Similar/recently: 3D label alignment + Tools gift-card measured snap

**Context:** User wanted **SIMILAR PRODUCTS** / **RECENTLY VIEWED** typography and star-row **`translateX`** nudges applied in **3D** as well (they were **`undefined`** or **`-0.5px`** in 3D vs 2D). User also asked to wire **`src/pages/tools/page.tsx`** main gift-card carousel off **`window.innerWidth * 0.713`** to **`useMarbleStripSnapStep`**.

**Changes:**
- **Six hero PDPs** (**`straight/noir`**, **`straight/blanco`**, **`wavy/soft-wave`**, **`wavy/beach-wave`**, **`curly/soft-curl`**, **`curly/ocean-curl`**): Replaced **`!is3DView ? translateX(...) : undefined`** with fixed **`translateX(10px)`** / **`translateX(10.5px)`**; replaced last-column **`is3DView ? -0.5px : 10px`** with **`translateX(10px)`** so 2D/3D match.
- **`src/pages/tools/page.tsx`**: **`useMarbleStripSnapStep`** ref on the gift-card **`overflow-x: hidden`** viewport; **`giftCardPage`** state; **`giftCardScrollPx = -page * snapPx`**; row width **`pairCount * 100%`**; arrows use page index (right cycles **0…maxPage**); removed **`0.713`**-based pixel math. Drag mouseup snap logic dropped (drag was already inert).

---

## 2026-03-28 — Home/shop JSX: fix Vite parse after arrow refactor

**Context:** Vite/Babel error **`Unexpected token, expected ","`** at **`shopCategoryMarbleCards.map`** on **`products/page.tsx`** — ternary **`) : (`** shop branch had **two adjacent roots** (closed **`px-0`** + **transition** **`</div></div>`** before **`map`**).

**Changes:** **`src/pages/products/page.tsx`**: Removed the **two premature closes** after the **UNITS** marble card; **`shopCategoryMarbleCards.map`** stays **inside** the **`px-0`** wrapper; added the matching **`</div></div>`** after **`map`** so **px-0** then **transition** close correctly.

---

## 2026-03-28 — Home/shop UNITS: add-to-bag spacing

**Context:** User reported **extra space above** UNITS **add-to-bag** icons on **`/home/shop`**.

**Changes:** **`src/pages/products/page.tsx`**: **`unitsHomeStripViewportRef`** **`paddingTop`** **`'48px'` → `0`** (removes empty band above the row). Add-to-bag overlay **`top`** **`-34px` → `-42px`** so it stays aligned with the **`translateY(-8px)`** product band.

---

## 2026-03-28 — Home/shop UNITS add-to-bag invisible (overflow clip)

**Context:** User could not see **add-to-bag** icons after **`paddingTop: 0`** + **`top: '-42px'`**.

**Cause:** **`overflowX: 'hidden'`** on the strip viewport creates a scrollport that **clips vertical overflow** as well; icons with **negative `top`** were painted outside and **cut off**.

**Changes:** **`paddingTop: '42px'`** on **`unitsHomeStripViewportRef`** so layout reserves space matching **`top: '-42px'`** on the bag.

---

## 2026-03-28 — Home/shop UNITS: 10px top band + bags outside horizontal clip

**Context:** User wanted **`paddingTop` ~10px** instead of **42px** without losing **add-to-bag** icons (**`overflow-x: hidden`** clips vertical overflow when bags sat inside the same box with **`top: '-42px'`**).

**Changes:** **`src/pages/products/page.tsx`**: **`unitsHomeStripViewportRef`** is **`overflow: visible`**, **`paddingTop: '10px'`**. Product row scrolls inside an inner **`overflowX: 'hidden'`** div only. A second flex row in an **`position: absolute`** overlay (**`top: '10px'`**, **`pointerEvents: 'none'`** / bags **`auto`**) mirrors **`translateX`** + column flex basis and holds **add-to-bag** at **`top: '-42px'`** so it is not clipped.

---

## 2026-03-28 — Home/shop BUNDLES card: donor line + price ranges

**Context:** User wanted **BUNDLES** marble on **`/home/shop`** to show a **red “raw” line** and a **price line** per texture (**STRAIGHT / WAVY / CURLY**), same typography as **UNITS**.

**Copy:** All three: **`SINGLE DONOR + DOUBLE DRAWN`**. Prices: straight **`$100-300`**, wavy **`$120-400`**, curly **`$160-500`**.

**Changes:** **`src/pages/products/page.tsx`**: **`bundlesCardTextureLines`** map; in **`shopTextureStripItems.map`**, when **`categorySlug === 'bundles'`**, two **`<p>`**s after the texture title — red line matches UNITS length line (**Futura PT Medium** 10px **`#EB1C24`**); price line matches UNITS price (**12px** black, **`translateY(2px)`**). **CLOSURES** / **FRONTALS** unchanged.

---

## 2026-03-28 — BUNDLES copy + shared currency format (shop/tools)

**Context:** User wanted BUNDLES red line **`RAW SINGLE DONOR`** (was **SINGLE DONOR + DOUBLE DRAWN**); bundle **price ranges** to show **currency code** and follow **global currency** like other prices; **home/shop**, **home/tools**, and **shop/tool** listing pages to use the same formatting.

**Changes:**
- **`src/utils/currencyFormat.ts`**: **`formatPriceUsd`**, **`formatPriceRangeUsd`** (USD amounts × **`rate`**, HTML **`symbol`**, trailing **` selectedCurrency`** e.g. **` USD`**).
- **`src/pages/products/page.tsx`**: **`bundlesCardTextureLines`** uses **`priceMinUsd` / `priceMaxUsd`**; range line uses **`dangerouslySetInnerHTML={formatBundlesRange(...)}`**. **`formatPrice`** → **`formatPriceUsd`**.
- **`src/pages/products/units/page.tsx`**, **`src/pages/tools/page.tsx`**, **`src/pages/tools/gift-card/page.tsx`**, **`src/pages/shop/texture-category-product/page.tsx`**: **`formatPrice`** delegates to **`formatPriceUsd`** (same behavior, single implementation).

---

## 2026-03-28 — Home/shop BUNDLES/CLOSURES/FRONTALS title spacing vs UNITS

**Context:** User wanted **top spacing above STRAIGHT / WAVY / CURLY** on the three category marbles to match **UNITS** product names.

**Changes:** **`src/pages/products/page.tsx`**: Texture title **`<p>`** dropped **`margin: '-10px 0 -3px 0'`**; aligned with UNITS name block — **`margin: 0`**, **`lineHeight: 1.05`**, **`minHeight: '22px'`**, flex centering. Thumb wrapper still **`marginBottom: '5px'`** (same as UNITS).

---

## 2026-03-28 — Home/shop CLOSURES + FRONTALS: RAW SINGLE DONOR + price ranges

**Context:** User wanted the same **RAW SINGLE DONOR** red line and **currency-aware** range line as **BUNDLES** on **CLOSURES** and **FRONTALS**, with specified USD bounds.

**Ranges (USD, then `formatPriceRangeUsd`):**
- **CLOSURES:** straight **100–300**, wavy **120–400**, curly **140–500**.
- **FRONTALS:** straight **200–600**, wavy **220–700**, curly **240–800**.

**Changes:** **`src/pages/products/page.tsx`**: **`shopCategoryTextureLines`** **`Record<bundles|closures|frontals, Record<straight|wavy|curly, …>>`**; JSX shows both lines for all three marbles; **`formatShopTextureRange`** (was **`formatBundlesRange`**).

---

## 2026-03-28 — Curly PDPs: marble strip for Similar + Recently (soft-curl, ocean-curl)

**Context:** Prior work added shared **`marbleStripStyles`** for hero PDP **SIMILAR PRODUCTS** / **RECENTLY VIEWED** (shop-aligned cells, uniform 2D/3D thumbs). **Soft-wave** and **beach-wave** were already migrated; **soft-curl** and **ocean-curl** still used the old flex row with **`translateX(...) translateY(-15px)`** and per-cell padding/transform hacks. User sent **"?"** (status check); this chat finished that migration.

**Changes:**
- **`src/pages/curly/soft-curl/page.tsx`**: Both strips use **`marbleStripScrollRowStyle(similarProductsScroll | recentlyViewedScroll)`**; all eight product cells use **`marbleStripCellOuter`**, **`marbleStripCellBand`**, **`marbleStripThumbWrap`**, **`marbleStripThumbImg`**, **`marbleStripTextCol`**. Kept existing **`navigate`**, image **`src`s**, copy, and **`formatPrice`** usage. Typography stays **`"Covered By Your Grace", "Covered By Your Grace Preload"`** + **`"Futura PT Medium"`**. Comment fix: recently viewed first tile comment **`BEACH WAVE` → `SOFT WAVE`** (route/content were already soft-wave).
- **`src/pages/curly/ocean-curl/page.tsx`**: Same pattern for both strips and eight cells; same font preservation and comment fix for recently viewed first tile (**`SOFT WAVE`**). Product order and **SOFT CURL** vs **OCEAN CURL** placements unchanged per page.

**Note:** Repo **`tsc --noEmit`** still reports parse errors in **`src/pages/admin/revenue/page.tsx`** (unrelated to these edits).

---

## 2026-03-28 — Marble strip 3D: clip + snap + cell centering

**Context:** User reported **3D** similar/recently **thumbnails clipped at the top**, **scroll snap not landing** (second page felt off), and **columns 3–4 not centered** in their flex slots.

**Causes / fixes:**
- **`src/utils/marbleStripStyles.ts`**: Removed **`translateY(-15)`** from **`marbleStripScrollRowStyle`** (only **`translateX`** now) so the row is not shifted up into **`overflow-x: hidden`** clipping. **`marbleStripCellOuter`** is now a **column flex** with **`justifyContent: 'center'`** and **`minHeight: 0`** so each **25%** column **vertically centers** its band when the row **stretch**-aligns to the tallest cell.
- **`src/pages/straight/noir/page.tsx`**: **3D** marble snap no longer uses legacy multipliers **`similarSnapPx * (0.5/0.713)`** / **`recentSnapPx * (0.53/0.73)`** — uses measured **`similarSnapPx`** / **`recentSnapPx`** like **2D**, matching **one viewport width** per “page” (two **25%**-of-**200%** columns).
- **`src/pages/curly/ocean-curl/page.tsx`**: Right-arrow scroll was **`window.innerWidth * 0.713`**; now **`-similarSnapPx`** / **`-recentSnapPx`** so it matches the measured strip viewport.

---

## 2026-03-28 — Marble strip: 3D space below stars + 2D band nudge up

**Context:** User wanted **10px** under the **stars** in **3D** on similar/recent strips, and **2D** thumb + product text + stars moved **up 10px together** on those strips.

**Changes:** **`src/utils/marbleStripStyles.ts`**: **`marbleStripCellBand`** is now a function **`marbleStripCellBand(is3D)`** — **2D** adds **`transform: translateY(-10px)`** on the band; **3D** unchanged. New **`marbleStripStarsRowStyle(is3D)`** with **`marginBottom: '10px'`** when **3D**. All **six** hero PDPs import **`marbleStripStarsRowStyle`**, use **`marbleStripCellBand(is3DView)`**, and star rows use **`marbleStripStarsRowStyle(is3DView)`** instead of inline flex styles.

---

## 2026-03-28 — Marble strip stars: 5px below in 2D and 3D

**Context:** User wanted **5px** space below stars on similar/recent strips in **both** 2D and 3D.

**Changes:** **`src/utils/marbleStripStyles.ts`**: **`marbleStripStarsRowStyle`** is now a **`CSSProperties` const with **`marginBottom: '5px'`** (replaces 3D-only **10px**). Hero PDPs use **`style={marbleStripStarsRowStyle}`** (no args).

---

## 2026-03-28 — Marble strip: restore visible carousel arrows (esp. Recently viewed)

**Context:** User could not see **Recently viewed** (and risk of same on **Similar**) **left/right arrows** — likely **flex-shrink** on the arrow buttons let the **200%-width strip** squeeze them to **zero width**, plus row **`overflow`** clipping.

**Changes:** **`src/utils/marbleStripStyles.ts`**: Added **`marbleStripNavRowStyle`** (**`overflow: 'visible'`**) and **`marbleStripNavArrowStyle(side, is3D)`** (**`flexShrink: 0`**, **`minWidth: '28px'`**, **`position: 'relative'`**, **`zIndex: 3`**, same **`translateX` / `translateY`** as before; dropped **`height: '100%'`** on arrows). All **six** hero PDPs use these for **both** Similar and Recently **nav rows and four buttons**.

---

## 2026-03-28 — UNITS add-to-bag: symmetric left/right inset from card edge

**Context:** User wanted the **right-column** add-to-bag icon on UNITS to sit the same distance from the **right** card edge as the **left-column** bag from the **left** edge (mirror spacing).

**Changes:** **`right: 34` → `right: 16`** to match **`left: 16`** on the overlay bag row: **`src/pages/products/page.tsx`** (home/shop), **`src/pages/products/units/page.tsx`** (`/shop/units`).

---

## 2026-03-28 — Home/shop UNITS: duplicate bag icon outside marble (right edge)

**Context:** User saw a **second add-to-bag** sitting **outside** the UNITS marble card to the **right** (not the in-column right product bag). Cause: the **bag overlay** used the same **extra-wide** transformed flex as products but lived **outside** the **`overflow-x: hidden`** wrapper that clipped the product row, so the wide row **painted past** the card.

**Changes:** **`src/pages/products/page.tsx`**: Wrapped **product flex + bag overlay** in one inner **`position: relative`** container with **`overflowX: 'clip'`** and **`overflowY: 'visible'`** so horizontal bleed is clipped like the strip while bags can still sit above; removed the redundant inner-only overflow wrapper.

---

## 2026-03-28 — Shop marble center line: shorten from bottom only (below strip)

**Context:** User wanted the **middle vertical black line** (between columns) **6px shorter** only **below** the **UNITS / BUNDLES / CLOSURES / FRONTALS** title block—**not** by pulling the line down from the top of the product area (leave **`top: 0`**; trim from the bottom).

**Changes:** **`bottom: '0'` → `bottom: '6px'`** on the **1px black** divider and matching **10px transparent** mask: **`src/pages/products/page.tsx`** (UNITS + category marbles), **`src/pages/products/units/page.tsx`**, **`src/pages/shop/texture-category-product/page.tsx`** (both strips). The small **15px** hairline above titles unchanged.

---

## 2026-03-28 — Home/shop UNITS add-to-bag: `top` -42px → -36px

**Context:** User asked to change the bag overlay offset to **`-36px`** (in context of the shared horizontal clip wrapper on the UNITS strip).

**Changes:** **`src/pages/products/page.tsx`**: UNITS bag hit target **`top: '-42px'` → `top: '-36px'`** (moves bags **6px** lower). **`/shop/units`** (`units/page.tsx`) already used **`-34px`**; left as-is unless aligned later.

---

## 2026-03-28 — Red RAW sublines: +1px down (home/shop + shop texture PDP)

**Context:** User wanted the **red RAW** product sublines moved **down 1px** on **home/shop** and **shop** pages.

**Changes:** **`translateY(1px)`** on **10px #EB1C24** RAW lines: **`src/pages/products/page.tsx`** (UNITS **`length RAW origin`** + BUNDLES/CLOSURES/FRONTALS **`redLine`**), **`src/pages/products/units/page.tsx`** (UNITS strip). **`src/pages/shop/texture-category-product/page.tsx`**: **`translateX(10px)` → `translateX(10px) translateY(1px)`** on **`categoryTitle · RAW HAIR`** and the four **24" RAW …** cells in **Recently viewed**.

---

## 2026-03-28 — First marble card: top spacing matches stacked gap (nav-only above)

**Context:** User wanted **less space above** the **first** marble card on **home/shop** and **shop** so it matches the **gap below each card** (stacked marbles use **collapsing** vertical margins → **~20px** between cards; **first** card had **nav `mb-5` (20px) + its own `marginTop` 20px** → **~40px** above).

**Changes:** **`marginTop: '20px'` → `'0'`** on first card wrappers: **`src/pages/products/page.tsx`** (UNITS only). **`src/pages/products/units/page.tsx`**: **`renderProductContainer(..., isFirstMarble)`** — **`STRAIGHT`** passes **`true`**. **`src/pages/shop/category/page.tsx`** (bundles/closures/frontals). **`src/pages/shop/texture-category-product/page.tsx`**: **SIMILAR PRODUCTS** strip only (**Recently viewed** keeps **`marginTop: '20px'`**). Later marbles / second strips unchanged.

---

## 2026-03-28 — `/shop/units`: restore add-to-bag icons (overlay + clip)

**Context:** Add-to-bag icons were **missing** on all three texture marbles because bags sat **inside** the strip under **`overflowX: 'hidden'`**, which forces effective vertical clipping so **`top: -34px`** bags were cut off.

**Changes:** **`src/pages/products/units/page.tsx`**: Matched **home/shop UNITS** — horizontal **`overflowX: 'clip'`** wrapper around **product flex + separate bag overlay** (same **`translateX`**, bag **`top: '-48px'`**, **`left`/`right` 16**). Viewport **`paddingTop: '10px'`**, overlay **`top: '10px'`**.

---

## 2026-03-28 — UNITS add-to-bag overlay: `top` → `-48px` (higher on card)

**Context:** User wanted bags **higher** (more negative **`top`**), not lower; **`'-36px'`** was **6px below** original **`-42px`**. Requested **`-48px`** on **home/shop** and **shop/units**; shared **`overflowX: 'clip'`** wrapper unchanged.

**Changes:** **`top: '-36px'` → `'-48px'`** on bag hit targets: **`src/pages/products/page.tsx`**, **`src/pages/products/units/page.tsx`**.

---

## 2026-03-28 — UNITS add-to-bag overlay: `top` → `-52px`

**Context:** User asked to move bags **4px higher** than **`-48px`**.

**Changes:** **`top: '-48px'` → `'-52px'`** on UNITS bag overlays: **`src/pages/products/page.tsx`** (home/shop), **`src/pages/products/units/page.tsx`**. Shared **`overflowX: 'clip'`** layout unchanged.

---

## 2026-03-28 — Marble center divider: larger bottom inset (visible trim)

**Context:** User reported the **middle vertical black line** (below red **UNITS** / category titles) **did not look shorter** after **`bottom: '6px'`** — **6px** on a tall strip is easy to miss.

**Changes:** **`bottom: '6px'` → `bottom: '28px'`** on the **1px** divider and **10px** hit mask: **`src/pages/products/page.tsx`** (UNITS + texture marbles), **`src/pages/products/units/page.tsx`**, **`src/pages/shop/texture-category-product/page.tsx`**. Still **`top: '0'`** (trim from the bottom only).

---

## 2026-03-28 — Price text up 1px (home/shop + shop)

**Context:** User wanted **price** copy moved **up 1px** only on **home/shop** and **shop** (not other PDPs).

**Changes:** **`src/pages/products/page.tsx`**: UNITS product price **`translateY(2px)` → `translateY(1px)`**; BUNDLES/CLOSURES/FRONTALS range line same. **`src/pages/products/units/page.tsx`**: product price **`translateY(2px)` → `translateY(1px)`**. **`src/pages/shop/texture-category-product/page.tsx`**: hero price **`translateY(-136px)` → `-137px`**; **Similar** + **Recently viewed** price rows **`translateX(10px)` → `translateX(10px) translateY(-1px)`**.

---

## 2026-03-28 — `/units/straight|wavy|curly`: remove toggle + “N UNITS” above grid

**Context:** User wanted the **sorting toggle** image (**`/assets/toggle.svg`**) and the **`{count} UNITS`** label above the product cards removed on texture units listing pages.

**Changes:** **`src/pages/units/straight/page.tsx`**, **`wavy/page.tsx`**, **`curly/page.tsx`**: deleted **`index === 0`** toggle and **`index === 1`** count overlays; grid **`paddingTop`** **`35px` → `12px`** (straight/wavy); curly was **`50px` → `12px`**.

---

## 2026-03-28 — Hero PDP Recently viewed: right arrow inside strip + align with Similar

**Context:** **Recently viewed** right carousel arrow looked **misaligned** and **outside** the bordered strip (2D and 3D) vs **Similar products** above; user wanted it **inside** the container and **vertically consistent** with the upper strip’s right arrow.

**Decisions / outcomes:** The **200%-wide** scroll row could inflate the flex middle column’s **min-content width**, pushing the **right** nav button past the box; **Recently**’s **`transform: translateY(-17px)`** nested with arrow transforms and hurt alignment.

**Changes:** **`src/utils/marbleStripStyles.ts`**: **`marbleStripNavMiddleColStyle`** (**`flex: 1`**, **`position: 'relative'`**, **`minWidth: 0`**, **`minHeight: 0`**). **Six** hero PDPs (**noir**, **blanco**, **soft-wave**, **beach-wave**, **soft-curl**, **ocean-curl**): middle column uses it for **both** strips; **Recently** outer **`transform: translateY(-17px)`** removed and **`marginTop: '20px'`** → **`'3px'`** (keep **`marginBottom: '20px'`**) to preserve spacing vs Similar without a parent transform. **Noir** keeps full-bleed width/margins on **Recently** unchanged aside from that.

---

## 2026-03-28 — Hero marble strip 3D: star row 5px visible + viewport overflow

**Context:** User reported **no visible change** for **3D** star spacing; spec is **`paddingBottom: '5px'`** on the star row, **`marginBottom: 0`**, so the **5px** sits **inside** the row under the icons.

**Decisions / outcomes:** **`overflow-x: hidden`** on the strip viewport makes browsers treat **`overflow-y: visible`** as clipping, so the **bottom** of cells (including star **`paddingBottom`**) was **clipped**. **`overflow-x: clip`** + **`overflow-y: visible`** clips horizontal scroll only.

**Changes:** **`src/utils/marbleStripStyles.ts`**: **`marbleStripViewportStyle`** (**`overflowX: 'clip'`**, **`overflowY: 'visible'`**, width/position/maxWidth). **`marbleStripStarsRowStyle`**: **`flexShrink: 0`**, **`alignItems: 'center'`**, explicit **`paddingTop: 0`** / **`paddingBottom: 0`** on 2D vs 3D branches. **Six** hero PDPs: **Similar** + **Recently** viewport **`div`**s use **`marbleStripViewportStyle`** instead of **`overflowX: 'hidden'`**.

---

## 2026-03-28 — Marble center divider: `bottom` inset removed (line meets container)

**Context:** **`bottom: '28px'`** on the middle vertical rule left a **visible gap** between the line’s end and the strip container bottom; user wanted the line **down** so it **meets the bottom edge** again.

**Changes:** **`bottom: '28px'` → `bottom: '0'`** on the **1px** black divider and **10px** mask: **`src/pages/products/page.tsx`**, **`src/pages/products/units/page.tsx`**, **`src/pages/shop/texture-category-product/page.tsx`**.

---

## 2026-03-28 — Marble center line: shorten height from top (not bottom inset)

**Context:** User clarified **`bottom: Npx`** was the **wrong** way to shorten: it **cuts the lower end** and leaves **empty space** below the line. They want **true shorter line length** with the **bottom still on the container edge**.

**Changes:** **`top: '0'` → `top: '6px'`** and keep **`bottom: '0'`** on the **1px** divider + **10px** mask (line is **6px shorter**, anchored to the **bottom** of the strip): **`src/pages/products/page.tsx`**, **`src/pages/products/units/page.tsx`**, **`src/pages/shop/texture-category-product/page.tsx`** (Similar + Recently).

---

## 2026-03-28 — Hero marble strip 3D: 5px below stars on text column (override-resistant)

**Context:** User still saw **no effective change** under **3D** stars; something appeared to **override** star-row-only padding so **2D vs 3D** looked the same.

**Decisions / outcomes:** Put the **5px** gap on the **title/price/stars** wrapper (**`marbleStripTextColStrip(is3D)`**) as **`paddingBottom: '5px'`** when **`is3D`**, with **`flexShrink: 0`** and **`overflow: 'visible'`**; **3D** star row stays **flush** (**no** star-row padding/margin bottom). **2D** keeps **`marginBottom: '5px'`** on the star row; text column **`paddingBottom: 0`**. Removed **`minHeight: 0`** from **`marbleStripCellOuter`** (kept **`minWidth: 0`**) so strip cells are not vertically squashed by flex; **`overflow: 'visible'`** on cell outer, **3D** band, and scroll row.

**Changes:** **`src/utils/marbleStripStyles.ts`** (**`marbleStripTextColStrip`**, **`marbleStripStarsRowStyle`**, **`marbleStripCellOuter`**, **`marbleStripCellBand`**, **`marbleStripScrollRowStyle`**). **Six** hero PDPs: **`marbleStripTextCol` → `marbleStripTextColStrip(is3DView)`** on all marble strip product cells.

---

## 2026-03-28 — Home/shop UNITS band up 6px; `/shop/units` matched

**Context:** User wanted **thumb + product copy + cap sizes** on **home/shop UNITS** moved **up 6px together**, and **`/shop/units`** three marbles to **match** home for symmetry.

**Changes:** **`src/pages/products/page.tsx`** (UNITS only): inner product band **`translateY(-8px)` → `translateY(-14px)`** (price stays in same band); bag overlay **`top: '-52px'` → `'-58px'`** to track row. **`src/pages/products/units/page.tsx`**: same **`translateY(-14px)`** on inner band, thumb **`width: '79.2%'`** (was **`calc(90% * 0.88)`**), drop **`justifyContent: 'flex-start'`** on column + **`flex: '1 1 auto'`** on band to mirror home; bag **`'-52px'` → `'-58px'`**.

---

## 2026-03-28 — Home/shop UNITS bags: undo +6px (top `-58px` → `-52px`)

**Context:** User said home/shop add-to-bag was **moved incorrectly** with the prior symmetry pass; move bags **down 6px** **only** on home/shop (**`/shop/units`** unchanged at **`-58px`**).

**Changes:** **`src/pages/products/page.tsx`**: UNITS bag overlay **`top: '-58px'` → `'-52px'`**.

---

## 2026-03-28 — Admin client details: remove cart/wishlist “Showing … localStorage” gray copy

**Context:** User wanted the gray **“Showing cart from this browser…”** / **“Showing wishlist from this browser…”** lines removed below the **CART** / **WISHLIST** tabs on the client details panel.

**Changes:** **`src/pages/admin/clients/page.tsx`**: Removed those **`source === 'this_device'`** helper paragraphs; dropped unused **`source`** tracking while keeping **localStorage** fallback list behavior.

---

## 2026-03-28 — Home/shop BUNDLES/CLOSURES/FRONTALS red line: RAW HUMAN HAIR

**Context:** User wanted the red subline copy **`RAW SINGLE DONOR`** → **`RAW HUMAN HAIR`** on the texture marbles.

**Changes:** **`src/pages/products/page.tsx`**: **`shopCategoryTextureLines`** all **`redLine`** values **`'RAW SINGLE DONOR'` → `'RAW HUMAN HAIR'`** (bundles, closures, frontals × straight/wavy/curly).

---

## 2026-03-29 — Vercel build: admin revenue JSX + `tsc` clean

**Context:** **`npm run build`** failed on Vercel with **`src/pages/admin/revenue/page.tsx(1119,5): error TS1005: ')' expected`** (parser pointed at final **`</div>`**s).

**Decisions / outcomes:** One extra **`</div>`** after the main card tab scroll area (after **`admin-revenue-tab-content`** + **`overflow-y-auto`**) threw off the JSX tree; the nested ternary under **`PageActionsBelowCard`** was refactored to a precomputed **`revenuePageActions`** block for clarity. **`tsc --noEmit`** also reported **`noUnusedLocals`**: removed unused **`marbleStripNavRowStyle`** import on **`ocean-curl`**; **`soft-curl`** and **`soft-wave`** middle column now uses **`marbleStripNavMiddleColStyle`** (had been imported but inline **`flex: '1'`** still used); home **`products/page.tsx`** first UNITS **`map`** uses **`(product)`** only; bag overlay row keeps **`(product, index)`** for **`isLeftColumn`**.

**Changes:** **`src/pages/admin/revenue/page.tsx`**, **`src/pages/curly/ocean-curl/page.tsx`**, **`src/pages/curly/soft-curl/page.tsx`**, **`src/pages/wavy/soft-wave/page.tsx`**, **`src/pages/products/page.tsx`**.

---

## 2026-03-29 — Hero marble strip 3D: 15px under stars (text column)

**Context:** User wanted more obvious spacing **below stars in 3D only** (after **5px** then **10px** trials). **2D** unchanged (**`marbleStripStarsRowStyle`** **`marginBottom: '5px'`**; text column **`paddingBottom: 0`**).

**Changes:** **`src/utils/marbleStripStyles.ts`**: **`marbleStripTextColStrip`** **`paddingBottom`** for **`is3D`** is **`'15px'`**.

---

## 2026-03-29 — Hero PDP Similar/Recently: green flex debug outlines

**Context:** User wanted **green debug flexbox borders** on **Similar** and **Recently** for **both 2D and 3D** to inspect **thumbnail + product text** centering.

**Changes:** **`src/utils/marbleStripStyles.ts`**: **`DEBUG_MARBLE_STRIP_FLEX_BOUNDS`** (**`true`** — set **`false`** to hide); **`marbleDbg`** outlines on **nav row**, **middle col**, **viewport**, **scroll row**, **cell outer**, **cell band**, **thumb wrap**, **text col strip**, **stars row**; exports **`marbleStripHeroSectionOuterDebugStyle`** / **`marbleStripHeroSectionBackdropDebugStyle`** for section wrappers. **Six** hero PDPs: merge those onto **outer** + **`backdrop-blur-sm`** **`div`**s for **both** strips.

---

## 2026-03-29 — Hero marble strip: cells fill half-viewport (flex `1 1 0`)

**Context:** Debug overlays showed the **center divider** correct but **product columns** too narrow (inset from outer strip and from **50%**); user wanted column edges to match **container sides** and **center** like the blue reference.

**Decisions / outcomes:** **`flex: 0 0 25%`** on children of a **`width: 200%`** row was resolving so each cell was **smaller** than a quarter of the row on some engines (e.g. mobile WebKit). Switched to **`flex: 1 1 0`** with **`minWidth: 0`** so four items **split the row evenly** (each **half** viewport width when two are visible).

**Changes:** **`src/utils/marbleStripStyles.ts`**: **`marbleStripCellOuter`** **`flex`** **`'0 0 25%'` → `'1 1 0'`**; comment documents why.

---

## 2026-03-28 — Home/shop category-specific texture PNG thumbs

**Context:** User wanted BUNDLES / CLOSURES / FRONTALS marble texture thumbnails to use **`public/assets`** PNGs named **`{straight|wavy|curly}-{bundles|closure|frontal}.png`** instead of shared NOIR thumbs.

**Changes:** **`src/pages/products/page.tsx`**: Added **`homeShopCategoryTextureThumbSrc`** (paths **`/assets/{texture}-bundles.png`**, **`-closure.png`**, **`-frontal.png`**); **`shopTextureStripItems`** no longer carries **`image`**; marble strip **`<img src>`** uses **`homeShopCategoryTextureThumbSrc(categorySlug, t.slug)`**.

---

## 2026-03-28 — Home/shop texture thumbs: fix bundle filename (broken images)

**Context:** BUNDLES marble thumbnails 404’d: code used **`straight-bundles.png`** etc., but **`public/assets`** files are **`straight-bundle.png`**, **`wavy-bundle.png`**, **`curly-bundle.png`** (singular **`bundle`**). CLOSURES / FRONTALS names already matched.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** bundles suffix **`'bundles'` → `'bundle'`**.

---

## 2026-03-28 — Hero marble strip: full backdrop width (arrows overlay)

**Context:** User reported **no visible fix** after **`flex: 1 1 0`** on cells: the **blue-outline** target was the **full inner width of the black-bordered backdrop card**, but the **scroll row** stayed inset because **`marbleStripNavRowStyle`** was **`justifyContent: 'space-between'`** with **arrows + gap** in the flex row — the **middle column** only received the **space between** arrows, not the **full card** width.

**Decisions / outcomes:** Treat the **nav row** as **`position: 'relative'`**, **`width: '100%'`**, **`gap: 0`**, **`justifyContent: 'flex-start'`**; **middle column** **`flex: '1 1 0'`** + **`width: '100%'`** as the **sole in-flow** flex child. **Carousel arrows** use **`position: 'absolute'`** on **`left: 0` / `right: 0`**, **`top: '50%'`**, **`zIndex: 4`**, and **`transform: translateX(±10px) translateY(calc(-50% - {10|26}px))`** so prior **2D / 3D** vertical nudges are preserved while arrows **no longer consume** main-axis width.

**Changes:** **`src/utils/marbleStripStyles.ts`** only (**`marbleStripNavRowStyle`**, **`marbleStripNavMiddleColStyle`**, **`marbleStripNavArrowStyle`**). No JSX reorder required on hero PDPs.

**Conventions:** For this strip, **edge-to-edge** alignment with the **backdrop card** depends on **out-of-flow** side controls, not only cell **`flex`** on the **200%** row.

---

## 2026-03-28 — Home/shop texture thumbs: actual asset names are SVG `bundle-*` style

**Context:** User still saw **broken** thumbnails; asked whether paths were wrong and to try **`bundle-straight.svg`**. In repo, **`public/assets`** has **`bundle-straight.svg`** (not **`straight-bundle.png`**). **`base`** is **`/`** so **`/assets/...`** is correct for Vite **`public/`**.

**Decisions / outcomes:** Use **`/assets/{bundle|closure|frontal}-{texture}.svg`**. **`onError`** once swaps to prior **NOIR** texture PNGs if an SVG is missing so tiles are not broken while assets are added.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** rewritten to **`.svg`** + **`bundle-` / `closure-` / `frontal-`** prefix; **`homeShopTextureThumbFallbackSrc`** + **`img` `onError`**.

---

## 2026-03-28 — Hero marble strip: remove green flex debug outlines

**Context:** User confirmed the **full-width backdrop** strip fix worked and asked to **remove the green debugging outlines**.

**Changes:** **`src/utils/marbleStripStyles.ts`**: Removed **`DEBUG_MARBLE_STRIP_FLEX_BOUNDS`**, **`marbleDbg`**, **`marbleStripHeroSectionOuterDebugStyle`** / **`marbleStripHeroSectionBackdropDebugStyle`**, and all **`...marbleDbg.*`** merges from shared strip styles. **Six** hero PDPs (**noir**, **blanco**, **soft-wave**, **beach-wave**, **soft-curl**, **ocean-curl**): dropped imports and **`style`** spreads for those debug exports on **Similar** / **Recently** wrappers.

---

## 2026-03-28 — Account rewards: premium-upgrade SVG above subscription chart

**Context:** User wanted **`public/assets/premium-upgrade.svg`** shown **above** the subscription upgrade comparison table on the account **rewards** page.

**Changes:** **`src/pages/account/membership/page.tsx`**: In the **PREMIUM MEMBERSHIP** view (premium upgrade chart), added a centered **`<img src="/assets/premium-upgrade.svg" alt="Premium upgrade">`** between the section header row and the comparison **`<table>`** wrapper; **`maxWidth: 320px`**, responsive **`width: 100%`**; chart wrapper **`marginTop`** **`40px` → `24px`** to keep overall spacing reasonable.

---

## 2026-03-28 — Account rewards: premium-upgrade asset SVG → PNG

**Context:** User asked to use the **`premium-upgrade` PNG** in **`public/assets`** instead of the SVG for the graphic above the subscription upgrade chart.

**Changes:** **`src/pages/account/membership/page.tsx`**: **`src`** **`/assets/premium-upgrade.svg` → `/assets/premium-upgrade.png`**.

---

## 2026-03-28 — Account rewards: premium graphic → premium-membership PNG

**Context:** User asked to replace **`premium-upgrade.png`** with **`premium-membership.png`** from **`public/assets`** for the image above the subscription upgrade chart.

**Changes:** **`src/pages/account/membership/page.tsx`**: **`src`** **`/assets/premium-upgrade.png` → `/assets/premium-membership.png`**; **`alt`** **`Premium upgrade` → `Premium membership`**.

---

## 2026-03-28 — Home/shop: wavy bundle thumb → `wavy-bundle.png`

**Context:** User wanted the **wavy** tile under **BUNDLES** to use **`wavy-bundle.png`** in **`public/assets`**.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** returns **`/assets/wavy-bundle.png`** for **`bundles` + `wavy`**.

---

## 2026-03-28 — Home/shop: curly bundle thumb → `curly-bundle.png`

**Context:** User wanted the **curly** tile under **BUNDLES** to use **`curly-bundle.png`** in **`public/assets`**.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** returns **`/assets/curly-bundle.png`** for **`bundles` + `curly`**.

---

## 2026-03-28 — Home/shop: curly closure thumb → `curly-closure.png`

**Context:** User wanted the **curly** tile under **CLOSURES** to use **`curly-closure.png`** in **`public/assets`**.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** returns **`/assets/curly-closure.png`** for **`closures` + `curly`**; SVG path branch uses **`frontal`** only (all **closures** use PNGs).

---

## 2026-03-28 — Home/shop: straight frontal thumb → `straight-frontal.png`

**Context:** User wanted the **straight** tile under **FRONTALS** to use **`straight-frontal.png`** in **`public/assets`**.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** returns **`/assets/straight-frontal.png`** for **`frontals` + `straight`**; **wavy/curly** frontals still use **`frontal-{texture}.svg`**.

---

## 2026-03-28 — Home/shop: wavy frontal thumb → `wavy-frontal.png`

**Context:** User wanted the **wavy** tile under **FRONTALS** to use **`wavy-frontal.png`** in **`public/assets`**.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** returns **`/assets/wavy-frontal.png`** for **`frontals` + `wavy`**; **curly** still **`frontal-curly.svg`**.

---

## 2026-03-28 — Home/shop: curly frontal thumb → `curly-frontal.png`

**Context:** User wanted the **curly** tile under **FRONTALS** to use **`curly-frontal.png`** in **`public/assets`**.

**Changes:** **`src/pages/products/page.tsx`**: **`homeShopCategoryTextureThumbSrc`** returns **`/assets/curly-frontal.png`** for **`frontals` + `curly`**; all **9** home/shop marble texture tiles now use **`{texture}-{bundle|closure|frontal}.png`**; final branch **`throw`** for exhaustiveness (no SVG fallback path).

---

## 2026-03-28 — Account rewards: premium image on main rewards card + canonical `rewards/page` route

**Context:** User said the **premium-membership** graphic was tied to the **wrong page**; they consider it part of the **account rewards** page.

**Decisions / outcomes:** **`/account/rewards`** is still one React module ( **`membership/page.tsx`** ). Added **`src/pages/account/rewards/page.tsx`** re-exporting it; **`App.tsx`** lazy-loads **`RewardsPage`** from that path. **`premium-membership.png`** now appears on the default **UNLOCK PREMIUM REWARDS** card (under the section header, above the benefit bullets) so it shows on the main rewards scroll. The same asset **remains above the comparison table** when the **PREMIUM MEMBERSHIP** upgrade chart is open.

**Changes:** **`src/pages/account/rewards/page.tsx`** (new), **`src/App.tsx`**, **`src/pages/account/membership/page.tsx`**.

---

## 2026-03-28 — Account rewards: broken premium image → use existing `premium-upgrade.svg`

**Context:** User saw a **broken image** on rewards; earlier prompts used an asset that **loaded**, then paths moved to **`premium-membership.png`** / **`premium-upgrade.png`**.

**Decisions / outcomes:** In repo **`public/assets`** only **`premium-upgrade.svg`** exists (plus **`premium-x.svg`**, **`premium-check.svg`**); **`premium-membership.png`** and **`premium-upgrade.png`** are **not** in the tree, so **`/assets/premium-membership.png`** 404s. Reverted **`src`** to **`/assets/premium-upgrade.svg`** for both placements (**UNLOCK PREMIUM REWARDS** card and **above the comparison table** in premium view). Re-added the graphic **above the chart** in **`showPremiumView`** where it had been dropped.

**Changes:** **`src/pages/account/membership/page.tsx`**.

---

## 2026-03-28 — Account rewards: premium hero only above upgrade chart + sharper image

**Context:** User wanted **`premium-upgrade.svg` only after tapping UPGRADE SUBSCRIPTION** (above the comparison chart), **not** above **UNLOCK PREMIUM REWARDS** copy. Image looked **blurry** (was capped at **`320px`** wide).

**Decisions / outcomes:** Removed the hero **`<img>`** from the **UNLOCK PREMIUM REWARDS** card. Single placement remains in **`showPremiumView`** above the table. Styling: **`maxWidth: 'min(100%, 560px)'`**, full-width wrapper, **`imageRendering: 'high-quality'`** for better downscale. **`premium-upgrade.svg`** is very large and may embed a raster—if it stays soft, replace with a **vector** SVG or a **2× PNG** and point **`src`** at that file.

**Changes:** **`src/pages/account/membership/page.tsx`**.

---

## 2026-03-29 — Checkout upgrade: 12-month membership thumbnail

**Context:** User asked to use **`12-months.png`** in **`public/assets`** as the cart line-item thumbnail for **12-month** premium on **`/checkout/upgrade`** (replacing the default wig thumbnail).

**Changes:** **`src/pages/checkout/page.tsx`**: In **`getItemImage()`**, return **`/assets/12-months.png`** when **`item.subscriptionTier === '12months'`** or when **`isSubscriptionUpgrade`** and the item name matches **12 MONTHS** (regex fallback for older stored payloads).

---

## 2026-03-29 — Checkout upgrade: 6-month thumbnail → `12-months.svg`

**Context:** User asked to replace the **6-month** membership line-item thumbnail on **`/checkout/upgrade`** with **`12-months.svg`** in **`public/assets`** (filename as specified).

**Changes:** **`src/pages/checkout/page.tsx`**: In **`getItemImage()`**, return **`/assets/12-months.svg`** when **`item.subscriptionTier === '6months'`** or when **`isSubscriptionUpgrade`** and the item name matches **6 MONTHS** (regex fallback). **12-month** tier still uses **`/assets/12-months.png`**.

---

## 2026-03-29 — Checkout upgrade: 3 / 6 / 12 month thumbnails → matching SVGs

**Context:** User asked that **`/checkout/upgrade`** cart line-item thumbnails use **`3-months.svg`**, **`6-months.svg`**, and **`12-months.svg`** respectively for **3-, 6-, and 12-month** premium tiers (replacing prior **PNG** for 12-mo and **wrong** 6-mo asset).

**Changes:** **`src/pages/checkout/page.tsx`** **`getItemImage()`**: **`subscriptionTier`** / name regex ( **`isSubscriptionUpgrade`** ) map **`3months`** → **`/assets/3-months.svg`**, **`6months`** → **`/assets/6-months.svg`**, **`12months`** → **`/assets/12-months.svg`**. **12** branch is evaluated before **6** then **3** so names like **12 MONTHS** do not match shorter patterns.

---

## 2026-03-29 — Checkout upgrade: 3 / 6 / 12 month thumbnails → PNG assets

**Context:** User asked to use **`3-months.png`**, **`6-months.png`**, and **`12-months.png`** from **`public/assets`** for the corresponding premium line-item thumbnails on **`/checkout/upgrade`** (instead of **SVG**).

**Changes:** **`src/pages/checkout/page.tsx`** **`getItemImage()`**: same tier / name logic; **`src`** paths now **`/assets/3-months.png`**, **`/assets/6-months.png`**, **`/assets/12-months.png`**.

---

## 2026-03-29 — Checkout upgrade: 3-month thumbnail → `premium-3.png`

**Context:** User asked to use **`premium-3.png`** in **`public/assets`** for the **3-month** premium line-item thumbnail on **`/checkout/upgrade`**.

**Changes:** **`src/pages/checkout/page.tsx`** **`getItemImage()`**: **`3months`** / **3 MONTHS** name branch now returns **`/assets/premium-3.png`** (6- and 12-month paths unchanged).

---

## 2026-03-29 — Checkout upgrade: 3-month thumbnail → `3-months-premium.png`

**Context:** User asked to use **`3-months-premium.png`** in **`public/assets`** for the **3-month** premium thumbnail on **`/checkout/upgrade`**.

**Changes:** **`src/pages/checkout/page.tsx`** **`getItemImage()`**: **`3months`** / **3 MONTHS** branch **`src`** is **`/assets/3-months-premium.png`**.

---

## 2026-03-29 — Checkout upgrade: 6-month thumbnail → `6-months-premium.png`

**Context:** User asked to use **`6-months-premium.png`** in **`public/assets`** for the **6-month** premium thumbnail on **`/checkout/upgrade`**.

**Changes:** **`src/pages/checkout/page.tsx`** **`getItemImage()`**: **`6months`** / **6 MONTHS** branch **`src`** is **`/assets/6-months-premium.png`**.

---

## 2026-03-29 — Shop texture/category PDPs: same PNG thumbs as home/shop marbles

**Context:** User noted **`/straight/bundles`**, **`/wavy/closures`**, etc. (**`ShopTextureCategoryProductPage`**) still used generic **NOIR** texture thumbs in **`TEXTURE_META`**, not the **`{texture}-bundle|closure|frontal.png`** assets used on **`home/shop`**.

**Decisions / outcomes:** Centralize paths in **`shopTextureCategoryThumbSrc(texture, category)`** → **`/assets/${texture}-bundle.png`**, **`-closure.png`**, **`-frontal.png`**. **`products/page.tsx`** imports the util (arg order **`texture`**, **`category`**) instead of an inline **`if`** chain.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`** (new; exports **`shopTextureCategoryThumbSrc`**, **`shopTextureCategoryThumbFallbackSrc`**), **`src/pages/products/page.tsx`**, **`src/pages/shop/texture-category-product/page.tsx`** (hero **`img`**, add-to-bag **`image`**, **Similar** strip; **`onError`** → **NOIR** fallback by texture).

---

## 2026-03-29 — Checkout upgrade: 12-month thumbnail → `12-months-premium.png`

**Context:** User asked to use **`12-months-premium.png`** in **`public/assets`** for the **12-month** premium thumbnail on **`/checkout/upgrade`**.

**Changes:** **`src/pages/checkout/page.tsx`** **`getItemImage()`**: **`12months`** / **12 MONTHS** branch **`src`** is **`/assets/12-months-premium.png`**.

---

## 2026-03-29 — Home/shop: BUNDLES/CLOSURES/FRONTALS texture thumbs 50% smaller

**Context:** User wanted **bundles, closures & frontals** marble **thumbnail** images on **`home/shop`** reduced by **50%** (not **UNITS**).

**Changes:** **`src/pages/products/page.tsx`**: texture-strip **`<img>`** for **`shopCategoryMarbleCards`** **`width`** **`79.2%` → `39.6%`** (half).

---

## 2026-03-29 — Home/shop: BUNDLES/CLOSURES/FRONTALS texture thumbs +25%

**Context:** User wanted those marble thumbnails **25% larger** than the **`39.6%`** width (**`39.6 × 1.25 = 49.5%`**).

**Changes:** **`src/pages/products/page.tsx`**: same **`<img>`** **`width`** **`39.6%` → `49.5%`**.

---

## 2026-03-29 — Home/shop: BUNDLES/CLOSURES/FRONTALS thumb + copy block +6px down

**Context:** User wanted **thumbnail + all text below** (**label**, red line, price) moved **down 6px** together on **`home/shop`** marbles.

**Changes:** **`src/pages/products/page.tsx`**: inner **`dbgProductBand`** wrapper **`transform`** **`translateY(-8px)` → `translateY(-2px)`** (**+6px** vertical).

---

## 2026-03-29 — Account rewards: premium upgrade hero → `premium-membership-upgrade.png`

**Context:** User asked to replace the **premium membership** hero image on **`/account/rewards`** when **UPGRADE SUBSCRIPTION** opens the comparison chart (**`showPremiumView`**) with **`premium-membership-upgrade.png`** in **`public/assets`**.

**Changes:** **`src/pages/account/membership/page.tsx`**: hero **`<img>`** above the comparison table **`src`** **`/assets/premium-upgrade.svg`** → **`/assets/premium-membership-upgrade.png`**.

---

## 2026-03-29 — Premium hero −25%; checkout upgrade tier thumbs +15%

**Context:** User asked to **shrink** the **premium membership upgrade** hero (rewards comparison view) by **25%**, and **enlarge** **3 / 6 / 12 month** line-item thumbnails on **`/checkout/upgrade`** by **15%**.

**Changes:** **`src/pages/account/membership/page.tsx`**: hero **`maxWidth`** **`min(100%, 560px)` → `min(100%, 420px)`** (**560 × 0.75**). **`src/pages/checkout/page.tsx`**: **`isMembershipTierThumb`** from **`subscriptionTier`** or upgrade name; cart **`img`** **120px → 138px** (**×1.15**); non–gift-card cell **width 150px → 173px** when tier thumb so layout fits padding.

---

## 2026-03-29 — Account rewards: premium hero another −20%

**Context:** User asked to shrink the **premium membership upgrade** hero **another 20%** from the prior **420px** cap.

**Changes:** **`src/pages/account/membership/page.tsx`**: hero **`maxWidth`** **`min(100%, 420px)` → `min(100%, 336px)`** (**420 × 0.8**; **~40%** of original **560px**).

---

## 2026-03-29 — Account rewards: loyalty icon → `loyalty-points-rewards.png`

**Context:** User asked to replace the **loyalty points** SVG above the **PTS** balance on **`/account/rewards`** with **`loyalty-points-rewards.png`** in **`public/assets`**.

**Changes:** **`src/pages/account/membership/page.tsx`**: both **LOYALTY POINTS** blocks (**`showLoyaltyRewards`** overlay and main card) **`/assets/points-icon.svg`** → **`/assets/loyalty-points-rewards.png`**; **`objectFit: 'contain'`** on the **`<img>`**.

---

## 2026-03-29 — Account rewards: loyalty PNG +100% size

**Context:** User asked to **double** the **`loyalty-points-rewards.png`** icon size (**+100%**) above the **PTS** text on **`/account/rewards`**.

**Changes:** **`src/pages/account/membership/page.tsx`**: both loyalty **`<img>`** **`width`/`height`** **`31.68px` → `63.36px`**.

---

## 2026-03-29 — Account rewards: loyalty PNG +500% (from 63.36px)

**Context:** User asked to increase the **`loyalty-points-rewards.png`** size **another 500%** (interpreted as **×6** on the prior **63.36px** edge: **63.36 × 6 = 380.16px**).

**Changes:** **`src/pages/account/membership/page.tsx`**: both loyalty **`<img>`** **`width`/`height`** **`63.36px` → `380.16px`**.

---

## 2026-03-29 — Account rewards: loyalty PNG smaller after “−300%”

**Context:** User said **380.16px** was **too big** and asked to **decrease by 300%** (not standard percentage math). Applied **one-third** of prior edge: **380.16 ÷ 3 = 126.72px**.

**Changes:** **`src/pages/account/membership/page.tsx`**: both loyalty **`<img>`** **`380.16px` → `126.72px`**.

---

## 2026-03-29 — Account rewards: loyalty PNG +150%

**Context:** User asked to **increase** the **`loyalty-points-rewards.png`** size by **150%** (interpreted as **×2.5**: **126.72 × 2.5 = 316.8px**).

**Changes:** **`src/pages/account/membership/page.tsx`**: both loyalty **`<img>`** **`width`/`height`** **`126.72px` → `316.8px`**.

---

## 2026-03-29 — Account rewards: loyalty PNG −50%

**Context:** User asked to **decrease** the **`loyalty-points-rewards.png`** size by **50%** (**316.8 × 0.5 = 158.4px**).

**Changes:** **`src/pages/account/membership/page.tsx`**: both loyalty **`<img>`** **`316.8px` → `158.4px`**.

---

## 2026-03-29 — Account rewards: loyalty PNG +15%

**Context:** User asked to **increase** the **`loyalty-points-rewards.png`** size by **15%** (**158.4 × 1.15 = 182.16px**).

**Changes:** **`src/pages/account/membership/page.tsx`**: both loyalty **`<img>`** **`158.4px` → `182.16px`**.

---

## 2026-03-29 — Account rewards: loyalty thumbnail margins −4px

**Context:** User asked to **reduce spacing above and below** the **`loyalty-points-rewards.png`** thumbnail by **4px** each.

**Changes:** **`src/pages/account/membership/page.tsx`**: both loyalty **`<img>`** **`marginTop`** **`20px` → `16px`**, **`marginBottom`** **`6px` → `2px`**.

---

## 2026-03-29 — Account rewards: loyalty hero → `premium-rewards.png`

**Context:** User asked to replace the **`loyalty-points-rewards.png`** image (above the PTS balance on Account → Rewards) with **`premium-rewards.png`** from **`public/assets`**.

**Changes:** **`src/pages/account/membership/page.tsx`**: both LOYALTY POINTS hero images (overlay when **`showLoyaltyRewards`** and main card) **`/assets/loyalty-points-rewards.png` → `/assets/premium-rewards.png`**; sizing and margins unchanged (**182.16px**, **`objectFit: 'contain'`**).

---

## 2026-03-29 — Shop: straight bundles thumbnail → `bundle-straight.png`

**Context:** User asked to use **`bundle-straight.png`** from **`public/assets`** for the **straight bundle** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('straight', 'bundles')`** returns **`/assets/bundle-straight.png`** (was **`/assets/straight-bundle.png`** via the generic pattern). Wavy/curly bundles and closures/frontals unchanged. Updates home/shop marbles and **`/straight/bundles`** PDP (hero, add-to-bag, similar strip) through existing **`shopTextureCategoryThumbSrc`** imports.

---

## 2026-03-29 — Shop: wavy bundles thumbnail → `bundle-wavy.png`

**Context:** User asked to use **`bundle-wavy.png`** from **`public/assets`** for the **wavy bundle** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('wavy', 'bundles')`** returns **`/assets/bundle-wavy.png`**. Straight bundles still use **`bundle-straight.png`**; curly bundles and closures/frontals unchanged.

---

## 2026-03-29 — Shop: curly bundles thumbnail → `bundle-curly.png`

**Context:** User asked to replace the **curly bundle** thumbnail with a **`curly-straight`** PNG in **`public/assets`**. That filename is **not** in the repo; **`bundle-curly.png`** exists and matches the **`bundle-straight` / `bundle-wavy`** naming used for the other textures.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('curly', 'bundles')`** returns **`/assets/bundle-curly.png`** (generic path was **`/assets/curly-bundle.png`**). Closures/frontals unchanged.

---

## 2026-03-29 — Shop: straight closures thumbnail → `closure-straight.png`

**Context:** User asked to use **`closure-straight.png`** from **`public/assets`** for the **straight closures** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('straight', 'closures')`** returns **`/assets/closure-straight.png`** (was **`/assets/straight-closure.png`** via the generic pattern). Wavy/curly closures and all frontals unchanged.

---

## 2026-03-29 — Shop: wavy closures thumbnail → `closure-wavy.png`

**Context:** User asked to use **`closure-wavy.png`** from **`public/assets`** for the **wavy closures** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('wavy', 'closures')`** returns **`/assets/closure-wavy.png`**. Straight closures still use **`closure-straight.png`**; curly closures and all frontals unchanged.

---

## 2026-03-29 — Shop: curly closures thumbnail → `closure-curly.png`

**Context:** User asked to use **`closure-curly.png`** from **`public/assets`** for the **curly closures** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('curly', 'closures')`** returns **`/assets/closure-curly.png`**. Straight/wavy closures use **`closure-straight` / `closure-wavy`**; all frontals still use the generic pattern.

---

## 2026-03-29 — Shop: straight frontals thumbnail → `frontal-straight.png`

**Context:** User asked to use **`frontal-straight.png`** from **`public/assets`** for the **straight frontals** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('straight', 'frontals')`** returns **`/assets/frontal-straight.png`** (was **`/assets/straight-frontal.png`** via the generic pattern). Wavy/curly frontals unchanged.

---

## 2026-03-29 — Shop: wavy frontals thumbnail → `frontal-wavy.png`

**Context:** User asked to use **`frontal-wavy.png`** from **`public/assets`** for the **wavy frontals** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('wavy', 'frontals')`** returns **`/assets/frontal-wavy.png`**. Straight frontals still use **`frontal-straight.png`**; curly frontals unchanged (generic **`/assets/curly-frontal.png`**).

---

## 2026-03-29 — Shop: curly frontals thumbnail → `frontal-curly.png`

**Context:** User asked to use **`frontal-curly.png`** from **`public/assets`** for the **curly frontals** thumbnail.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbSrc('curly', 'frontals')`** returns **`/assets/frontal-curly.png`**. Straight/wavy frontals use **`frontal-straight` / `frontal-wavy`**; the generic **`${texture}-frontal.png`** fallback is now unused for the three main textures (all nine combos are explicit).

---

## 2026-03-29 — Account rewards: premium upgrade hero −25%

**Context:** User asked to **decrease by 25%** the **premium rewards** thumbnail on the **upgrade subscription** flow **above** the premium comparison chart (the hero shown when **`showPremiumView`** after **UPGRADE SUBSCRIPTION**).

**Changes:** **`src/pages/account/membership/page.tsx`**: **`premium-membership-upgrade.png`** **`<img>`** **`maxWidth`** **`min(100%, 336px)` → `min(100%, 252px)`** (**336 × 0.75**).

---

## 2026-03-29 — Checkout upgrade back → premium chart (not default rewards)

**Context:** User asked that **back** from **`/checkout/upgrade`** (nav back icon or breadcrumb) return to the **premium comparison chart** on **`/account/rewards`** so they can pick another tier, not the default rewards cards view.

**Changes:** **`src/pages/account/membership/page.tsx`**: Initial **`showPremiumView`** also true when **`localStorage.membershipShowPremiumView === 'true'`** (persists while on upgrade checkout so **browser back** restores the chart). Removed unmount cleanup that deleted **`membershipShowPremiumView`** / **`returningFromCheckout`** (it ran when leaving for checkout and broke restore). **`src/pages/checkout/page.tsx`**: **`goBackToMembershipUpgradeChart()`** sets **`returningFromCheckout`** + **`membershipShowPremiumView`** then **`navigate('/account/rewards')`**; used for subscription-upgrade **back** and **CHECKOUT > UPGRADE** breadcrumb. **Stripe success** (and deduped repeat) clears **`membershipShowPremiumView`**, **`returningFromCheckout`**, **`membershipSelectedTier`** so post-purchase lands on normal rewards. **`src/pages/lobby/page.tsx`**: lobby **upgrade to rewards** also sets **`membershipShowPremiumView`** alongside **`returningFromCheckout`** for consistent persistence.

---

## 2026-03-29 — Loyalty `premium-rewards.png` −25%

**Context:** User confirmed they meant the **loyalty** **`premium-rewards.png`** above **PTS** (182.16px), not only the **`premium-membership-upgrade.png`** chart hero. Apply **25%** smaller: **182.16 × 0.75 = 136.62px**.

**Changes:** **`src/pages/account/membership/page.tsx`**: both **`premium-rewards.png`** images (**LOYALTY POINTS** overlay + main card) **width/height `182.16px` → `136.62px`**.

---

## 2026-03-29 — Shop: curly texture marbles +10% (bundles / closures / frontals)

**Context:** User asked to increase **only** **curly** **bundles**, **closures**, and **frontals** thumbnails by **10%** (not straight or wavy).

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbDisplayScale(texture)`** → **`1.1`** for **`curly`**, else **`1`**. **`src/pages/products/page.tsx`**: home/shop marble **`<img>`** width **`49.5% × scale`** (curly **54.45%**). **`src/pages/shop/texture-category-product/page.tsx`**: PDP hero **`maxWidth` `400 × scale` px** (curly **440px**); **Similar** strip curly thumbs **`transform: scale(1.1)`**, **`transformOrigin: center top`**.

---

## 2026-03-29 — Loyalty `premium-rewards.png` size restored

**Context:** User said the prior **−25%** resize targeted the **wrong** asset; restore the loyalty **`premium-rewards.png`** above **PTS** on the main rewards page.

**Changes:** **`src/pages/account/membership/page.tsx`**: both **`premium-rewards.png`** **`<img>`**s **`136.62px` → `182.16px`** width/height.

---

## 2026-03-29 — Shop: curly texture marbles −5% (from prior curly bump)

**Context:** User asked to decrease **only** curly **bundles / closures / frontals** thumbnails by **5%** (straight/wavy unchanged).

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: curly **`shopTextureCategoryThumbDisplayScale`** **`1.1` → `1.1 × 0.95` (`1.045`)**. **`src/pages/shop/texture-category-product/page.tsx`**: **Similar** strip uses **`scale(${shopTextureCategoryThumbDisplayScale(ot)})`** so it tracks the util (no hardcoded **1.1**). Home marbles (**`products/page.tsx`**) pick up new width via existing **`49.5 × scale`**.

---

## 2026-03-29 — Premium chart hero `maxWidth` 200px

**Context:** User asked to set **`premium-membership-upgrade.png`** hero **`maxWidth`** to **200px** instead of **252px** (above the comparison chart when **`showPremiumView`**).

**Changes:** **`src/pages/account/membership/page.tsx`**: **`min(100%, 252px)` → `min(100%, 200px)`**.

---

## 2026-03-29 — Shop: curly frontal thumb −2px vertical nudge

**Context:** User asked to move **only** the **curly frontal** thumbnail **up 2px** (not other textures/categories).

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`isShopTextureCurlyFrontals(texture, category)`**. **`src/pages/products/page.tsx`**: frontals marble **curly** **`<img>`** **`transform: translateY(-2px)`**. **`src/pages/shop/texture-category-product/page.tsx`**: **`/curly/frontals`** hero same; **Similar** strip curly frontal combines **`translateY(-2px)`** with existing **`scale(...)`** when applicable.

---

## 2026-03-29 — Premium chart: “VIEW ALL BENEFITS” toggle

**Context:** User asked for a centered **black** **Futura PT Book** line **VIEW ALL BENEFITS** directly under **`premium-membership-upgrade.png`** and above the comparison chart, toggling full premium benefit lists.

**Changes:** **`src/pages/account/membership/page.tsx`**: **`showPremiumUpgradeAllBenefits`** state; **`button`** (**VIEW ALL BENEFITS** / **HIDE ALL BENEFITS**), **`aria-expanded`**; expanded block lists **`PREMIUM_BENEFITS_BY_TIER`** for **3 / 6 / 12 months** (centered tier labels **Futura PT Medium**, bullets **Futura PT Book**). Reset when **`handleClosePremiumView`** runs.

---

## 2026-03-29 — Premium chart hero thumbnail vertical spacing −10px

**Context:** User asked to **decrease spacing above and below** the **`premium-membership-upgrade.png`** block by **10px** each.

**Changes:** **`src/pages/account/membership/page.tsx`**: wrapper **`marginTop` `12px` → `2px`**, **`marginBottom` `16px` → `6px`**.

---

## 2026-03-29 — Premium chart: +10px below VIEW ALL BENEFITS

**Context:** User asked for **10px** more space **below** the **VIEW ALL BENEFITS** control on the upgrade chart.

**Changes:** **`src/pages/account/membership/page.tsx`**: that **`button`** **`margin`** bottom **`12px` → `22px`**.

---

## 2026-03-29 — Premium chart hero: −10px space above thumbnail

**Context:** User asked to **decrease spacing above** the **`premium-membership-upgrade.png`** block by **10px**.

**Changes:** **`src/pages/account/membership/page.tsx`**: thumbnail wrapper **`marginTop` `2px` → `-8px`** (**−10px**).

---

## 2026-03-29 — Premium chart table: +20px margin above

**Context:** User asked for **20px** more space **above** the premium upgrade **comparison table** (below **VIEW ALL BENEFITS**).

**Changes:** **`src/pages/account/membership/page.tsx`**: chart wrapper **`marginTop` `24px` → `44px`**.

---

## 2026-03-29 — Premium chart: VIEW ALL BENEFITS → Futura Medium

**Context:** User asked to set **VIEW ALL BENEFITS** / **HIDE ALL BENEFITS** control to **Futura Medium**.

**Changes:** **`src/pages/account/membership/page.tsx`**: that **`button`** **`fontFamily` `Futura PT Book` → `Futura PT Medium`**, added **`fontWeight: '500'`** to match other medium labels.

---

## 2026-03-29 — Premium chart: VIEW ALL BENEFITS margin −4px bottom

**Context:** User asked to **decrease spacing below** **VIEW ALL BENEFITS** by **4px**.

**Changes:** **`src/pages/account/membership/page.tsx`**: that **`button`** bottom margin **`22px` → `18px`**.

---

## 2026-03-29 — Premium chart: CHALLENGES, PRIORITY MESSAGES, SPECIAL OFFERS rows

**Context:** User asked to **add** **challenges**, **priority messages**, and **special offers** to the **premium upgrade** comparison chart.

**Changes:** **`src/pages/account/membership/page.tsx`**: after **WELCOME DISCOUNT**, three **`PremiumChartBenefitRow`** rows — **CHALLENGES** (✓ 3 / 6 / 12 mo), **PRIORITY MESSAGES** (✓ 6 & 12 only), **SPECIAL OFFERS** (✓ 12 mo only). **`PREMIUM_BENEFITS_BY_TIER`** updated to match (**CHALLENGES** / **PRIORITY MESSAGES** / **SPECIAL OFFERS** at correct tiers); **`MEMBER REWARDS + CHALLENGES`** shortened to **`MEMBER REWARDS`** to avoid duplicating the new **CHALLENGES** line.

---

## 2026-03-29 — Premium chart row order: challenges / priority messages / special offers

**Context:** User asked to move **CHALLENGES** and **PRIORITY MESSAGES** to **below PRIORITY BOOKING**, and **SPECIAL OFFERS** to **below LIVE ORDER TRACKING** (no longer directly under **WELCOME DISCOUNT**).

**Changes:** **`src/pages/account/membership/page.tsx`**: **`PremiumChartBenefitRow`** positions updated; **`PREMIUM_BENEFITS_BY_TIER`** list order aligned (**CHALLENGES** after **PRIORITY BOOKING**; **SPECIAL OFFERS** after **LIVE ORDER TRACKING** on 12 mo).

---

## 2026-03-29 — Shop BUNDLES / CLOSURES / FRONTALS thumbnails −10%

**Context:** User asked to **decrease thumbnail sizes by 10%** for **bundles, closures & frontals** (shared shop texture category imagery).

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryThumbDisplayScale`** now multiplies the previous straight/wavy vs curly ratio by **`0.9`**, so home/products marbles, texture PDP hero **`maxWidth`**, and similar-products strip **`scale()`** all shrink together without duplicating magic numbers in page files.

---

## 2026-03-29 — Curly BUNDLES/CLOSURES/FRONTALS: product text −2px, thumbs unchanged

**Context:** User asked to move **product text** up **2px** for **curly** only on **bundles, closures & frontals**, and **not** change curly **thumbnail images** (no img transform/scale edits for this request).

**Changes:** **`src/pages/products/page.tsx`**: wrapper **`translateY(-2px)`** around texture **label + red line + price** when **`t.slug === 'curly'`** (img block unchanged). **`src/pages/shop/texture-category-product/page.tsx`**: same for desktop hero (**title, subline, price, stars**) when **`texture === 'curly'`**; **SIMILAR PRODUCTS** strip wraps text/stars after each thumb with **`translateY(-2px)`** when **`ot === 'curly'`**. Left existing **`isShopTextureCurlyFrontals`** img nudge and **`shopTextureCategoryThumbDisplayScale`** on **`<img>`** as-is.

---

## 2026-03-29 — Curly BUNDLES/CLOSURES/FRONTALS: product text nudge −2px → −4px

**Context:** User said the prior **2px** text lift was not noticeable enough; asked to move the **CURLY** row product text up **another 2px** (same pattern as home marbles: wrapper after image, label + red line + price only).

**Changes:** **`translateY(-2px)` → `translateY(-4px)`** on curly-only text wrappers in **`src/pages/products/page.tsx`** (`t.slug === 'curly'`) and **`src/pages/shop/texture-category-product/page.tsx`** (hero when **`texture === 'curly'`**, **SIMILAR PRODUCTS** when **`ot === 'curly'`**). Thumbnail **`<img>`** nudges unchanged.

---

## 2026-03-29 — Curly BCF copy lift: class + `top` !important (override / route clarity)

**Context:** User saw **no visible change** from inline **`translateY(-4px)`** on curly product copy; suspected overrides.

**Changes:** **`src/index.css`**: **`.shop-bcf-curly-product-copy-lift`** — **`position: relative; top: -5px !important`** (was **`-6px`**, moved **down 1px**). **`src/pages/products/page.tsx`** and **`texture-category-product/page.tsx`**: curly-only wrappers use that **`className`** instead of inline transform. **Note for QA:** texture marbles with three columns live on **`/home/shop`**, not **`/shop/bundles`** (that route is a different placeholder page).

---

## 2026-03-29 — Vercel build: fix `imageRendering: 'high-quality'` TS2322

**Context:** Vercel **`npm run build`** failed: **`Type '"high-quality"' is not assignable to type 'ImageRendering | undefined'`** in **`membership/page.tsx`** premium chart image.

**Changes:** **`src/pages/account/membership/page.tsx`**: cast **`imageRendering: 'high-quality' as CSSProperties['imageRendering']`** so runtime CSS stays **`high-quality`** while **`tsc`** accepts it (DOM/CSS draft value not yet in TS **`ImageRendering`** union).

---

## 2026-03-29 — Curly B/C/F thumbnails up 0.5px

**Context:** User asked to move **curly bundles, closures & frontals** **thumbnail images** up **0.5px** (in addition to existing curly **frontals** img nudge).

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryCurlyThumbTranslateYPx`** — **`curly` + bundles/closures → `−0.5`**, **`curly` + frontals → `−2.5`**. **`src/pages/products/page.tsx`** (home marbles), **`texture-category-product/page.tsx`** (hero + similar strip) use it; removed direct **`isShopTextureCurlyFrontals`** img imports where superseded.

**Follow-up (revert + correct):** User wanted **text only** up **0.5px**, not thumbnail moves. **Removed** **`shopTextureCategoryCurlyThumbTranslateYPx`**; restored **`isShopTextureCurlyFrontals`** **`translateY(-2px)`** on **imgs** only (curly frontals). **`.shop-bcf-curly-product-copy-lift`** **`top` `−5px` → `−5.5px`** for curly B/C/F copy.

---

## 2026-03-29 — Account Rewards: SILVER tier label uses brand gray (not black)

**Context:** On **Account → Rewards** (`/account/rewards`), the membership status card showed **SILVER** in **NEXT TIER** and in **MORE POINTS TO REACH / UNLOCK / REMAIN** as black; user wanted it to match the period line (**JAN 1 – JUN 30**), which uses **`BRAND_GRAY`** (`#808080`).

**Changes:** **`src/pages/account/membership/page.tsx`**: Removed the non-admin fallback that forced **`#000000`** on those tier-name spans; they now always use the existing **`nextTierColor`** / **`targetTierColor`** values (**SILVER → `BRAND_GRAY`**, **RED → `#EB1C24`**, **BLACK → `#000000`**), same as the admin tier-color preview.

---

## 2026-03-29 — Premium upgrade chart: header close (red X), drop CANCEL under CONFIRM

**Context (this chat):** Earlier: membership status **SILVER** tier labels use **`BRAND_GRAY`** (see entry above). User asked: on the **premium upgrade chart**, put a **red X close** where the header icon was, and **remove the CANCEL** button below **CONFIRM SUBSCRIPTION**.

**Changes:** **`src/pages/account/membership/page.tsx`**: Replaced **`additionalFeaturesIcon`** in the **PREMIUM MEMBERSHIP** chart header with **`/assets/close-icon.svg`** inside an **`aria-label`** close **`button`**, brand-red CSS **`filter`** (same as loyalty-points close on this page). **`handleClosePremiumView`** unchanged. Removed both **CANCEL** blocks that showed when **`showPremiumView`** (premium vs non-premium subscription button branches). Slightly increased **`marginBottom`** on the **CONFIRM SUBSCRIPTION** wrapper when the chart is open so spacing stays reasonable.

---

## 2026-03-29 — Checkout summary: premium tier thumbs, hide shipping/rewards for membership

**Context (this chat):** Prior entries: rewards **SILVER** gray labels; premium chart red close + no **CANCEL**. User asked: **`/checkout/summary`** should use **3 / 6 / 12 month premium upgrade thumbnails** (not wig defaults); **no SHIPPING** or **REWARDS** for **premium upgrade** (digital-only, no points).

**Changes:** **`src/pages/checkout/confirm/page.tsx`**: Helpers **`isMembershipTierCartItem`**, **`isPremiumMembershipUpgradeSummary`**, **`summaryScrollItemWidthPx`**. **`getProductImage`** matches checkout: **`/assets/3-months-premium.png`**, **`6-months-premium.png`**, **`12-months-premium.png`** via **`subscriptionTier`** or name. Cart row: **138px** thumb / **173px** cell, **DIGITAL ONLY** subline (like gift card). Horizontal scroll widths use membership width. **`isPremiumMembershipSummary`**: hide **SHIPPING** + **REWARDS**; replace order-form blurb with premium thank-you; hide **SIGN ORDER FORM**. **`src/pages/checkout/page.tsx`**: **`isSubscriptionUpgrade`** on **`orderDataForReturn`**, both **`navigate('/checkout/summary', …)`** payloads, and **`pointsEarned: 0`** in **`checkoutSummaryRewards`** when subscription upgrade.

---

## 2026-03-29 — Rewards: premium chart persist cleared when leaving page (not when going to upgrade checkout)

**Context (this chat):** User reported **`membershipShowPremiumView` / premium upgrade chart** stayed open after leaving **`/account/rewards`** and coming back; wanted it **closed** on leave, but **back from `/checkout/upgrade`** should **still reopen** the chart (**`goBackToMembershipUpgradeChart`** + session **`returningFromCheckout`**).

**Changes:** **`src/pages/account/membership/page.tsx`**: **`preservePremiumPersistForCheckoutRef`** set **`true`** immediately before **`navigate('/checkout/upgrade')`** from **CONFIRM**. **`useEffect`** cleanup on unmount removes **`membershipShowPremiumView`** and **`membershipSelectedTier`** unless that ref is set (so persist survives only for the upgrade-checkout hop). Ref reset after skip.

---

## 2026-03-29 — File picker: round CHOOSE FILE chip, square outer row

**Context (this chat):** User wanted the inner **CHOOSE FILE** control rounded again while the outer row (**NO FILE SELECTED**) stays square.

**Changes:** Inner gray **CHOOSE FILE** **`span`**s: **`borderRadius: '4px'`** (was **`0`**) on **order form**, **leave-review**, **affiliate** (all upload rows), **accounting-report**. **`src/index.css`**: **`input[type="file"]::file-selector-button`** and **`-webkit-file-upload-button`** **`border-radius: 4px !important`** so native file inputs keep a square field but a rounded browse button.

---

## 2026-03-29 — Unit PDP 2D/3D toggle: one localStorage key (fix NOIR split)

**Context:** User reported **2D/3D view** not persisting when leaving a product page; they want the same mode on **all unit product pages** until they toggle again.

**Root cause:** **`/straight/noir`** used **`noir-3d-view`** while **NOIR, Blanco, Soft Wave, Beach Wave, Soft Curl, Ocean Curl** used **`product-3d-view`**, so toggling on NOIR did not update the shared key other pages read.

**Changes:** **`src/utils/product3dViewPreference.ts`**: **`readProduct3dViewPreference`** / **`persistProduct3dViewPreference`** with key **`product-3d-view`**; one-time migration from legacy **`noir-3d-view`**. All six unit PDPs import these helpers for **`useState`** init and toggle persistence.

---

## 2026-03-29 — Premium upgrade checkout: tier title −1px, −10px above badges

**Context:** User asked on **subscription upgrade checkout** only: move **3 / 6 / 12 months premium** product name (**above** red **DIGITAL ONLY**) up **1px**; reduce space **above premium badge thumbnails** by **10px**.

**Changes:** **`src/pages/checkout/page.tsx`**: horizontal cart row **`paddingTop` `2px` → `0`** when **`isSubscriptionUpgrade`**. Premium tier cells (**`isMembershipTierThumb`**) **`paddingTop` `8px` → `0`** when **`isSubscriptionUpgrade`**. Tier title **`<p>`** **`translateY(-1px)`** when **`isSubscriptionUpgrade && isMembershipTierThumb`** (gift card title behavior unchanged).

---

## 2026-03-29 — `/units/straight|wavy|curly`: center thumbnails over product copy

**Context:** User asked to **center thumbnails** on **units** listing pages above **product info** below.

**Changes:** **`src/pages/units/straight/page.tsx`**, **`wavy/page.tsx`**, **`curly/page.tsx`**: marble card uses **`display: flex; flexDirection: column; alignItems: center`**. Image row is a **`flex`** wrapper (**`justifyContent: center`**, full width); removed **`marginLeft: 5px`** from **`img`**, symmetric **`margin`**, **`display: block`**. Name / hair / price **`p`** and cap-size row use **`width: 100%`** + **`textAlign: center`** so copy lines up under the image.

---

## 2026-03-29 — Unit PDP back button: history-first (fix NOIR → build-a-wig)

**Context (this chat):** User said the **back button** did not follow **recently viewed / navigated** pages correctly.

**Root cause:** **`/straight/noir`** **`handleBack`** always **`navigate('/build-a-wig')`** after saving cap to **`localStorage`**, so flows like **units listing → NOIR** or **another PDP → NOIR** could not pop real history. Other unit PDPs used plain **`navigate(-1)`** with no fallback when **`history.length === 1`**.

**Decisions / outcomes:** Align with **lobby** pattern: **`window.history.length > 1`** → **`navigate(-1)`**; else navigate to a sensible default (**`/units/straight|wavy|curly`** by product path, else **`/home/shop`**).

**Changes:** New **`src/utils/navigateBack.ts`** — **`navigateUnitProductBack(navigate, pathname)`**. **`src/pages/straight/noir/page.tsx`**: keep cap persistence, then **`navigateUnitProductBack`**. **`blanco`**, **`wavy/soft-wave`**, **`wavy/beach-wave`**, **`curly/soft-curl`**, **`curly/ocean-curl`**: **`handleBack`** uses the same helper.

---

## 2026-03-29 — Build-a-wig CONFIRM SELECTION: match ADD TO BAG typography

**Context (this chat):** User asked for **CONFIRM SELECTION** on build-a-wig step pages to use the **same font weight** as **ADD TO BAG** on the main build-a-wig page.

**Root cause:** **`font-futura`** in CSS uses **`Futura PT Demi`** at **600**. **ADD TO BAG** overrides **`font-family`** inline to **`Futura PT Medium`** (same stack as the button), so the two controls did not match visually.

**Changes:** All **CONFIRM SELECTION** buttons in **`build-a-wig`** subpages (**`texture`**, **`length`**, **`color`**, **`density`**, **`lace`**, **`hairline`**, **`cap-size`**, **`styling`**, **`addons`**) now include the same inline **`fontFamily`** as **ADD TO BAG** in **`page.tsx`**, preserving existing **`font-semibold`** / **`.font-futura`** weight (**600**).

---

## 2026-03-29 — Rewards copy + alerts: free gifts do not expire

**Context (this chat):** User corrected policy: **free gifts** do **not** expire (unlike vouchers); they apply **once on the next purchase**, use **unique codes** at checkout like vouchers, are **combinable**, and will tie to **admin/inventory** later (e.g. 5k vs 45k tier gifts). **Discount codes & vouchers** still **6 months from redemption**; **digital cash / gift cards** never expire.

**Changes:** **`src/pages/account/membership/page.tsx`**: rewards disclaimer (2×) + admin tier explainer paragraph updated—removed free gifts from the expiring bucket; noted next-purchase / unique code / admin inventory. **`src/pages/account/notifications/page.tsx`**: **`isFreeGiftVoucherLabel`**; **`getVoucherExpirations`** skips **`FREE GIFT`** rows so expiring-soon alerts do not fire for free gifts. **`src/pages/account/page.tsx`**: **VOUCHER HISTORY** modal footer adds matching policy line.

---

## 2026-03-29 — Free gifts: 6-month expiry again (inventory)

**Context (this chat):** User reversed prior policy: **free gifts** should **expire in 6 months** as well (with vouchers / discount codes) to **keep inventory moving**.

**Changes:** Restored copy: **`FREE GIFTS, DISCOUNT CODES & VOUCHERS EXPIRE 6 MONTHS…`** on **`membership/page.tsx`** (2×), admin tier paragraph, and **`account/page.tsx`** voucher history modal footer. **`notifications/page.tsx`**: removed **`isFreeGiftVoucherLabel`** and the skip in **`getVoucherExpirations`**; comment notes vouchers + free gifts use the 6-month window.

---

## 2026-03-29 — Premium upgrade chart close icon −20%

**Context (this chat):** User asked to shrink the **red X** close on the **premium subscription upgrade chart** by **20%**.

**Changes:** **`src/pages/account/membership/page.tsx`**: **PREMIUM MEMBERSHIP** header close **`img`** **`20px` → `16px`** width/height (**×0.8**).

---

## 2026-03-29 — Free gifts combinable at checkout (copy + logic)

**Context (this chat):** User asked to keep **free gifts combinable with anything** at checkout while **6-month expiry** remains.

**Changes:** **Rewards / account copy** (**`membership/page.tsx`**, **`account/page.tsx`**): added that **free gifts can be combined with any other offer at checkout**. **`checkout/page.tsx`**: **`SPECIAL_OFFER_CHECKOUT_COMBO_MESSAGE`**—special-offer-only carts block codes / referral / gift card / **service** vouchers but state **free gifts still apply**; **`isFreeGiftVoucherKey`**, **`normalizeVoucherQuantitiesForModalOpen`**, **`buildAppliedVoucherQuantitiesFromModal`** so **only COLOR/HAIRLINE/STYLING** are limited to one at a time and **free gift counts are preserved** (modal **+** / apply / open). **`voucherLineApplicable`** true when user has free-gift credit. Voucher row shows **free gift + service**; modal lists service types only; empty-state note when none apply. Modal copy explains service vs free gifts. **`concierge/page.tsx`**: special-offer blurb allows **free gifts**. **`notifications/page.tsx`**: comment on combinable free gifts.

---

## 2026-03-29 — Popups: strict uppercase (brand)

**Context (this chat):** User asked that **all** popups (vouchers, loyalty redemption, confirmations, etc.) use **uppercase**; **`messageTextTransform="none"`** and mixed-case body copy were slipping through.

**Changes:** **`ConfirmationModal`**: removed **`messageTextTransform`** prop; message body always **`textTransform: 'uppercase'`**; inner shell **`className="baw-brand-modal-shell"`**. **`src/index.css`**: **`.baw-brand-modal-shell { text-transform: uppercase !important; }`**. Applied shell class to **AddToListModal**, **CreateNewListModal**, **checkout** digital cash + voucher + terms modals, **CartDropdown** currency panel, **account/page** profile / reset / crop marble popups. Removed all **`messageTextTransform`** usages from **checkout**, **concierge**, **membership**, **order-form**, **payment**, **shipping**, **sign-in**, **CartDropdown**, **NewsletterPanel**.

---

## 2026-03-29 — Upgrade checkout: premium badge spacing + DIGITAL ONLY/price nudge

**Context (this chat):** On **subscription upgrade** checkout only, for **3 / 6 / 12 months premium** cart cells: move **DIGITAL ONLY** and **price** down **1.5px** without moving the black **premium title** above; add **5px** space **above** the tier badge thumbnails.

**Changes:** **`src/pages/checkout/page.tsx`**: **`paddingTop`** for **`isSubscriptionUpgrade && isMembershipTierThumb`** cells **`0` → `5px`**. Wrapped **DIGITAL ONLY** (and following cap line + price) in a div with **`transform: translateY(1.5px)`** only when **`isSubscriptionUpgrade && isMembershipTierThumb`**; title **`<p>`** stays outside that wrapper.

---

## 2026-03-29 — BCF texture PDP: hair profile + length/color + 50% thumbs

**Context (this chat):** User wanted **`/straight|wavy|curly` / `bundles|closures|frontals`** PDPs to add two Bohemy-style blocks (like custom/flexible cap): **hair profile** (**ORIGIN**, **TEXTURE**, **LACE** on closures/frontals) and **length & color** (**LENGTH** 16–40″ per build-a-wig length, **COLOR** noir palette + GOLDEN/PLATINUM/ASH, **LACE** per build-a-wig lace). **Origin → allowed textures:** Cambodian/Russian → straight only; Indian/Indonesian → wavy; Filipino/Vietnamese → curly; route auto-corrects when origin conflicts. **Cart** stores **`hairOrigin`**, **`length`**, **`color`**, **`lace`** (not bundles) and **price** includes option deltas. **Thumbnails:** hero + similar strip use **`shopTextureCategoryProductPageDisplayScale`** (**×0.5** vs prior display scale); **recently viewed** imgs **50%** width centered.

**Changes:** New **`src/utils/bcfProductOptions.ts`**. **`src/utils/shopTextureCategoryThumb.ts`**: **`shopTextureCategoryProductPageDisplayScale`**. **`src/pages/shop/texture-category-product/page.tsx`**: state, **`skipBcfOriginDefaultOnNextPathRef`**, effects, UI, **`displayPrice`**, **`handleAddToBag`** payload.

---

## 2026-03-29 — Vercel build: `shopTextureCategoryCurlyThumbTranslateYPx` missing

**Context (this chat):** **`npm run build`** on Vercel failed with **`TS2304: Cannot find name 'shopTextureCategoryCurlyThumbTranslateYPx'`** in **`texture-category-product/page.tsx`**.

**Changes:** **`src/utils/shopTextureCategoryThumb.ts`**: exported **`shopTextureCategoryCurlyThumbTranslateYPx`** — returns **`-2`** for **curly + frontals** (same nudge as **`products/page.tsx`** marble thumbs), else **`null`**. **`src/pages/shop/texture-category-product/page.tsx`**: import the helper from the util.

---

## 2026-03-29 — Unit PDP marble strips: arrows match Noir (Blanco, Soft wave, Ocean curl)

**Context (this chat):** User said **similar / recently** carousel **right** arrows on **Soft wave** + **Blanco** and **both** strips on **Ocean curl** were misaligned vs **Noir**.

**Root cause:** Noir uses **`marbleStripNavRowStyle`** (relative row + absolute arrows) and **`marbleStripNavArrowStyle(side, is3D)`** from **`marbleStripStyles.ts`**. Blanco’s **SIMILAR** left arrow used a plain inline **`transform`** (no **`position: absolute`**, wrong vertical math vs **`translateY(calc(-50% - Npx))`**). Soft wave’s **SIMILAR** right arrow had the same issue. Ocean curl used **`flex` + `space-between` + `gap: 10px`** for the nav row (arrows in document flow) and **RECENTLY** left used the bad inline transform.

**Changes:** **`blanco/page.tsx`**: SIMILAR left **`button`** → **`marbleStripNavArrowStyle('left', is3DView)`**. **`soft-wave/page.tsx`**: SIMILAR right → **`marbleStripNavArrowStyle('right', is3DView)`**. **`ocean-curl/page.tsx`**: import **`marbleStripNavRowStyle`**; SIMILAR + RECENTLY outer rows use it; RECENTLY left → **`marbleStripNavArrowStyle('left', is3DView)`**.

---

## 2026-03-29 — BCF texture-category PDP: nav + hero title category-only

**Context (this chat):** User asked for product nav **SHOP > BUNDLES** / **CLOSURES** / **FRONTALS** (not texture-prefixed), and hero product name **BUNDLES** / **CLOSURES** / **FRONTALS** only (no **STRAIGHT/WAVY/CURLY** before the category).

**Changes:** **`texture-category-product/page.tsx`**: **`displayProductName`** = **`CATEGORY_TITLE[category]`** for nav crumb, hero, image **`alt`**; **`cartLineName`** = **`BUNDLES · STRAIGHT`**-style for cart disambiguation. **`TEXTURE_META`** **`subline`** → **`RAW HAIR`** only (removed **STRAIGHT TEXTURE ·** etc. under the title). Similar-strip cards unchanged (**WAVY BUNDLES** etc.) so other textures stay identifiable.

---

## 2026-03-29 — BCF PDP: similar/recently flexbox = home/shop + unit PDPs

**Context (this chat):** User asked to apply the same **flexbox / nav** pattern used on **`/home/shop`**, **`/shop/units`**, and **unit PDPs** for **similar / recently** to **bundles / closures / frontals** PDPs (**`texture-category-product`**).

**Changes:** **`texture-category-product/page.tsx`**: import **`marbleStripStyles`** helpers; **SIMILAR** and **RECENTLY** use **`marbleStripNavRowStyle`**, **`marbleStripNavMiddleColStyle`**, **`marbleStripNavArrowStyle(side, false)`**, **`marbleStripViewportStyle`**, **`marbleStripScrollRowStyle(scroll)`**, **`marbleStripCellOuter`** (replaces **`space-between` + gap** and in-flow arrow transforms). Center line / mask **`top: 0`**. Scroll rows no longer use **`translateY(-15px)`**. Similar cells: row click + **`pointerEvents: 'none'`** on thumb. Recently: each product wrapped in **`marbleStripCellOuter`** with keyboard handlers.

---

## 2026-03-29 — Booking: premium routes, brand card shell, calendar, cart priority

**Context (this chat):** User wanted **`/booking/consultation`** & **`/booking/appointment`** with nav **BOOKING > CONSULTATION** / **APPOINTMENT**, brand-style main card (red section title + gray rule), lobby **neon booking** → **premium** flows **`/booking/premium/consultation`** & **`/booking/premium/appointment`**, SHOP menu **BOOKING** sublinks to standard routes, **premium** cart **`bookingTier: 'premium'`** sorted first in bag, and **appointment** page uses **`BrandExpiresDatePicker`** (same component as admin brand Create Code).

**Changes:** **`BookingFlowLayout`**: **`/booking/premium/`** → header red crumb **`PREMIUM · …`**, inner frosted card matches brand (**Futura PT Medium** red title + **`#e5e7eb`** bottom border) before children. **`booking/consultation`** & **`appointment`**: same components serve premium URLs; cart sets **`bookingTier`**, premium names **`(PREMIUM)`**; appointment stores optional **`bookingPreferredDate`**. **`utils/bookingCart.ts`**: **`sortCartPremiumBookingFirst`**. **`shopping-bag`**: load sorts cart. **`App.tsx`**: **`/booking/premium/consultation`**, **`/booking/premium/appointment`**. **`lobby/page.tsx`**: booking image → **`/booking/premium/consultation`**. **`brand/page.tsx`**: deduped **`navigateShopMenuSubItem`** import (SHOP menu already wired). **`products/page.tsx`**: **`navigateShopMenuSubItem`** for BOOKING subs.

**Update (same chat):** Lobby **products** neon → **`/home/shop`** (was **`/shop/units`**). Lobby **booking** neon → **`/booking/premium/appointment`**. Alias **`/booking/premium/consult`** → same page as **`consultation`**. Cart sort: premium before standard; among premium, **`booking-appointment`** before **`booking-consult`**. **`BookingFlowLayout`**: removed duplicate **`premiumBooking`** declaration.

---

## 2026-03-29 — Booking appointment: single canonical URL (premium)

**Context (this chat):** User said they already had a **booking/appointment** flow with another agent and asked to **undo** changes from the earlier “create booking/appointment” work that **conflicted** or **duplicated** that setup.

**Decisions / outcomes:** Treat **`/booking/premium/appointment`** as the **only** real appointment route. The shorter **`/booking/appointment`** path remains as a **redirect** so old links still work.

**Changes:** **`App.tsx`**: removed the duplicate **`<Suspense>`** route for **`/booking/appointment`**; replaced with **`<Navigate to="/booking/premium/appointment" replace />`**. **`shopMobileMenuSubNav.ts`**: **APPOINTMENT** menu item → **`/booking/premium/appointment`**. **`shopping-bag/page.tsx`**: cart line navigate for **`booking-appointment`** → **`/booking/premium/appointment`**. **`pages/booking/appointment/page.tsx`**: removed **`useLocation`** and **`isPremiumBooking`** branching; cart lines always use premium naming and **`bookingTier: 'premium'`** (this page is only loaded from premium + redirect).

---

## 2026-03-29 — BCF PDP: Russian-only GOLDEN/PLATINUM/ASH + correct texture highlight from URL

**Context (this chat):** User asked that **GOLDEN**, **PLATINUM**, and **ASH** colors only appear when **Russian** origin is selected on bundles/closures/frontals PDPs, and that clicking **straight/wavy/curly** thumbnails from **`/home/shop`** should land on the texture PDP with that **texture** correctly **highlighted** (STRAIGHT / WAVY / CURLY buttons).

**Root cause (texture):** Initial **`bcfOrigin`** defaulted to **CAMBODIAN**, so **`bcfTexturesForOrigin`** only allowed **straight** on the first effect run; the redirect effect then replaced **`/wavy/...`** or **`/curly/...`** with **`/straight/...`** before origin synced to the route.

**Changes:** **`utils/bcfProductOptions.ts`**: **`BCF_RUSSIAN_ONLY_COLOR_IDS`**, **`bcfColorOptionsForOrigin(origin)`**, **`bcfInitialOriginFromPathname(pathname)`**. **`texture-category-product/page.tsx`**: **`useState`** initializer for **`bcfOrigin`** uses **`bcfInitialOriginFromPathname(window.location.pathname)`**; color grid uses **`bcfColorsAvailable`** from **`bcfColorOptionsForOrigin(bcfOrigin)`**; **`useEffect`** resets **`bcfColor`** to **OFF BLACK** if current color is not allowed for the selected origin.

---

## 2026-03-29 — Booking: SHOP menu + bag use standard vs premium paths by membership

**Context (this chat):** User clarified **standard** vs **premium** booking URLs must stay **separate**: premium members using SHOP → BOOKING should hit **`/booking/premium/consultation`** & **`/booking/premium/appointment`**; standard (and guests) should use **`/booking/consultation`** & **`/booking/appointment`**. The earlier “single canonical premium URL” change was **not** the intended product behavior.

**Changes:** **`utils/bookingMemberRoutes.ts`**: **`bookingMenuUsesPremiumPaths()`** (signed-in + **`getEffectiveSubscriptionTier`** or **BLACK** tier, aligned with lobby), **`bookingAppointmentHref()`**, **`bookingConsultationHref()`**, **`bookingAppointmentHrefForCartItem`** / **`bookingConsultationHrefForCartItem`** (use **`item.bookingTier === 'premium'`**). **`shopMobileMenuSubNav.ts`**: BOOKING sub-items call those hrefs. **`App.tsx`**: restored **`<Suspense>`** route for **`/booking/appointment`** (same **`BookingAppointmentPage`** as premium). **`shopping-bag/page.tsx`**: thumb navigation uses cart-item helpers so premium vs standard bag lines reopen the matching PDP.

---

## 2026-03-29 — BCF PDP labels + tabs aligned with unit PDPs

**Context (this chat):** User wanted bundles/closures/frontals PDP (**`texture-category-product`**) to drop Futura **ORIGIN** under **hair profile**; Bohemy **hair texture** / **hair length** / **hair color** (replacing Futura TEXTURE/LENGTH/COLOR); tab row spacing above **DETAILS** like unit PDPs (**`paddingTop: 10px`** on tab block + **`gap: 16px`**, Futura tab chrome like Noir); add **SHIPPING** and **CARE + STORAGE** tabs with copy aligned to unit PDPs.

**Changes:** **`texture-category-product/page.tsx`**: **`bcfBohemySubLabelStyle`**; **`BcfProductTab`** + five-tab order; **`shippingCopy`** / **`careStorageCopy`**; tab buttons match Noir underline + font stack.

---

## 2026-03-29 — Premium booking: fix appointment crash + lobby booking asset

**Context (this chat):** User reported **premium booking routes not working** and the **lobby booking neon asset** missing.

**Root cause:** **`BookingAppointmentPage`** called **`useLocation()`** without importing it from **`react-router-dom`**, causing **runtime failure** (and **`tsc`** errors) on **`/booking/premium/appointment`**. **`/assets/neon-booking.png`** was not present in **`public/`** in-repo (broken image on lobby and cart fallbacks).

**Changes:** **`src/pages/booking/appointment/page.tsx`**: restored **`import { useLocation } from 'react-router-dom'`** and **`isPremiumBooking`**-based cart **`name`** / **`bookingTier`** (with **`/assets/neon-booking.svg`**). **`public/assets/neon-booking.svg`**: committed neon-style **BOOKING** wordmark (**#EB1C24**). **`lobby/page.tsx`**, **`booking/consultation/page.tsx`**, **`shopping-bag/page.tsx`**: image paths **`.png` → `.svg`**. **`shopMobileMenuSubNav.ts`**: **CONSULTATION** → **`/booking/premium/consultation`** (aligned with premium appointment).

---

## 2026-03-30 — Booking pages: brand-aligned layout + typography

**Context (this chat):** User asked to align **booking consultation** and **booking appointment** pages with brand guidelines (header styling, page structure, fonts).

**Changes:** New **`src/components/booking/BookingPageChrome.tsx`**: shared **Futura PT Book / Medium** stacks, **Covered By Your Grace** hero, crumb row (**12px** red uppercase + **`#e5e7eb`** rule like **`brand/page.tsx`** inner card), **BookingSectionHeading** (accent red or black + rule), **BookingBodyParagraph** / **BookingMutedNote**, **bookingPrimaryButtonStyle** for CTAs. **`booking/consultation/page.tsx`** & **`booking/appointment/page.tsx`**: **CONSULTATION** / **APPOINTMENT** crumb → script title → subline (premium callout when applicable), body copy in **Book 9px**, **`#e5e7eb`** section breaks, frosted **`bg-white/80 backdrop-blur-sm`** on controls, **1.3px** black borders, selected rows **red** outline, totals **20px** Medium, footnotes **8px** Book **#808080**.

---

## 2026-03-30 — Lobby: restore visible booking neon (above shelves, PNG → SVG)

**Context (this chat):** User said the **booking** neon to the **right of tools** was still missing; it must route to **premium** booking.

**Root cause:** The **product shelves** block comes **after** the neon row in the DOM with the same **`zIndex: 20`**, so it painted **on top of** the nav strip and hid the rightmost **BOOKING** control. The placeholder **SVG** was also easy to lose on the landing art without a stroke.

**Changes:** **`lobby/page.tsx`**: neon row **`zIndex: 35`**; row uses **`pointerEvents: 'none'`** with **`pointerEvents: 'auto'`** on each neon cluster so taps pass through gaps; **products/tools** wrappers **`flexShrink: 0`**; **booking**: **`/assets/neon-booking.png`** first, **`onError`** → **`/assets/neon-booking.svg`**, **`translateX(-104px)`** on wrapper (legacy kern), **full-area** hit target over the image, navigates **`/booking/premium/appointment`**. **`public/assets/neon-booking.svg`**: tighter viewBox, white stroke + red fill + glow for contrast.

---

## 2026-03-30 — Booking nav: no “PREMIUM” in crumb; consultation shows CONSULT

**Context (this chat):** User wanted header nav **`BOOKING > CONSULT`** (not **CONSULTATION**), and **no “PREMIUM”** in nav text — premium vs standard only via **URL**, not the visible crumb.

**Changes:** **`BookingFlowLayout.tsx`**: removed **`PREMIUM ·`** prefix; red segment is always **`crumbHighlight`** only; type **`BookingCrumb`** is **`CONSULT` | `APPOINTMENT`**. **`booking/consultation/page.tsx`**: **`crumbHighlight="CONSULT"`** and **`BookingCrumbTitle`** **CONSULT**.

---

## 2026-03-30 — BCF texture PDP: copy trim, lace by category, Russian = Blanco colors only

**Context (this chat):** User asked to remove **ORIGIN** and **length & color** labels on bundles/closures/frontals PDP; on closures/frontals rename lace to **lace size** in **Bohemy**; **frontals** only **13×4** & **13×6**; **closures** exclude those; **Russian** origin hides non-Blanco colors (only **GOLDEN** / **PLATINUM** / **ASH**).

**Changes:** **`utils/bcfProductOptions.ts`**: **`bcfColorOptionsForOrigin`** — Russian → Blanco-only; non-Russian → noir-only. New **`bcfLaceOptionsForCategory('closures' | 'frontals')`**. **`texture-category-product/page.tsx`**: UI removals + Bohemy **lace size**; lace buttons from **`bcfLaceOptions`** (pathname memo); **`bcfLace`** init + effect keep selection valid per category; invalid color resets to first allowed option. Fixed corrupted duplicate **`import`** line ( **`ShopMobileMenuShopTab`** + **`marbleStripStyles`** ).

---

## 2026-03-30 — BCF PDP: 360/FULL frontal-only + tab/spacing tweaks

**Context (this chat):** User asked to remove **360** & **FULL** from **closures** lace list and add them to **frontals**; **+10px** above details tabs (bundles/closures/frontals); **+6px** above **hair texture**, **lace size**, **hair length**, **hair color** labels.

**Changes:** **`bcfLaceOptionsForCategory`**: frontals = **13X4**, **13X6**, **360**, **FULL**; closures = all other lace IDs. **`texture-category-product/page.tsx`**: details tabs wrapper **`paddingTop` 10px → 20px**; label margins (**hair texture** / **hair color** **`6px`** top; **lace size** & **hair length** top **10px → 16px**).

---

## 2026-03-30 — Booking: premium/standard PNG badges + checkout thumbnails

**Context (this chat):** User asked for badges **below the booking header** on appointment/consultation pages (premium vs standard from **URL**), using **`appointment-premium.png`**, **`appointment-standard.png`**, **`consultation-premium.png`**, **`consultation-standard.png`** in **`public/assets`**, and the **same assets** for **checkout** + **checkout summary** cart thumbnails for booking line items.

**Changes:** **`utils/bookingBadges.ts`**: **`bookingPageHeaderBadgeSrc(pathname)`**, **`bookingCartItemThumbnailSrc(item)`** (uses **`item.type`** **`booking-appointment` / `booking-consult`** and **`item.bookingTier === 'premium'`**). **`BookingFlowLayout.tsx`**: centered badge **img** under nav strip. **`checkout/page.tsx`** & **`checkout/confirm/page.tsx`**: **`getItemImage` / `getProductImage`** return booking badge URL when applicable (before unit/gift logic).

---

## 2026-03-30 — Brand menu: drop Care + Storage & Payment + Shipping; settings help

**Context (this chat):** User asked to remove **CARE + STORAGE** and **PAYMENT + SHIPPING** from the **menu toggle** brand list and **remove those page routes**; remove **PAYMENT** from **Account → Settings** help center.

**Changes:** **`constants/brandMenu.ts`**: removed both items; **`BRAND_SLUGS`** no **`care`** / **`payment`**. **`brand/page.tsx`**: **`VALID_SLUGS`** and nav title list updated. **`App.tsx`**: no **`BrandPage`** routes for **`/brand/care`** or **`/brand/payment`** — **`Navigate`** to **`/brand/about`** (replace) for old URLs. **`account/settings/page.tsx`**: removed **PAYMENT** help button; **CONTACT** **`lineHeight`** **`1.2`** (was **`3.2`** for spacing).

---

## 2026-03-29 — SHOP mobile menu: BUNDLES, CLOSURES, FRONTALS under UNITS

**Context (this chat, continued):** User asked for **three** separate lines (**BUNDLES**, **CLOSURES**, **FRONTALS**) **below UNITS** in the **SHOP** tab of the mobile menu toggle, each routing to **`/shop/bundles`**, **`/shop/closures`**, **`/shop/frontals`**.

**Decisions / outcomes:** Centralize the duplicated SHOP-tab list in one component so every screen with that menu stays aligned.

**Changes:** **`src/components/ShopMobileMenuShopTab.tsx`**: shared rows (**UNITS** expandable, then **BUNDLES** / **CLOSURES** / **FRONTALS**, **BOOKING**, **BUILD-A-WIG**, **ORDER AUTHORIZATION FORM**); props for **`labelTranslateX`**, **`duplicateRowClickForStaticLinks`** (pages that used row+span clicks), **`closeSubItemMenu`**, optional **`closeAfterStaticNav`** + **`buildAWigPath`** + **`arrowImgAlt`** ( **`BookingFlowLayout`** uses **`/build-a-wig/noir`** and closes the drawer). Replaced inline **`.map`** blocks across **~43** call sites; **`BookingFlowLayout`** wired the same. Repaired a few **multi-line `import`** blocks where an auto-inserted **`ShopMobileMenuShopTab`** import landed inside **`{ … }`**. Dropped **`navigateShopMenuSubItem`** imports where unused; removed unused **`getBuildAWigShopMenuTargetPath`** from **build-a-wig** subpage imports (menu uses default **`/build-a-wig`**). One-off scripts under **`scripts/`**: **`replace-shop-mobile-menu-shop-tab.mjs`**, **`add-shop-mobile-menu-import.mjs`**, **`remove-unused-shop-nav-import.mjs`** (codemod + fixes).

---

## 2026-03-30 — SHOP menu: CLOSURES & FRONTALS under HD LACE subgroup

**Context (this chat):** After the shared **`ShopMobileMenuShopTab`** work (BUNDLES + standalone CLOSURES/FRONTALS lines), user asked to **move closures and frontals** into an expandable subgroup labeled **HD LACE** on the SHOP tab mobile menu.

**Changes:** **`ShopMobileMenuShopTab.tsx`**: replaced top-level **CLOSURES** / **FRONTALS** rows with one expandable **HD LACE** row (**arrow**, sub-items **CLOSURES**, **FRONTALS**); **BUNDLES** stays a single line above it. **`shopMobileMenuSubNav.ts`**: **`navigateShopMenuSubItem`** handles **`parentLabel === 'HD LACE'`** → **`/shop/closures`** / **`/shop/frontals`** (same routes as before).

---

## 2026-03-30 — SHOP menu: HD LACE above BUNDLES

**Context (this chat so far):** SHOP mobile menu uses shared **`ShopMobileMenuShopTab`**; **CLOSURES** / **FRONTALS** sit under expandable **HD LACE**; user asked to put **HD LACE** **above** **BUNDLES** in the list.

**Changes:** **`ShopMobileMenuShopTab.tsx`**: **`SHOP_TAB_ITEMS`** order is now **UNITS** → **HD LACE** → **BUNDLES** → **BOOKING** → **BUILD-A-WIG** → **ORDER AUTHORIZATION FORM**.

---

## 2026-03-30 — BCF routes: canonical `/shop/{category}` + `?texture=`; home/shop thumbnails keep texture

**Context (this chat):** User wanted menu (**BUNDLES**, **HD LACE** sub-items, etc.) to open the **main** **`/shop/bundles`**, **`/shop/closures`**, **`/shop/frontals`** PDPs **without** URL-driven texture pre-selection; remove **`/straight/bundles`**, **`/wavy/closures`**, etc. as real PDP routes; **home/shop** texture thumbnails should still land with the matching texture selected (**`?texture=`**).

**Changes:** **`App.tsx`**: **`/shop/bundles|closures|frontals`** render **`ShopTextureCategoryProductPage`** (dropped lazy **`ShopCategoryPage`** for those paths); **`/straight|wavy|curly`/`bundles|closures|frontals`** → **`Navigate`** to plain **`/shop/...`** (no query — old bookmarks lose texture). **`texture-category-product/page.tsx`**: parse **`/shop/(bundles|closures|frontals)`**; derive active texture from **`?texture=straight|wavy|curly`** or default **`straight`** + **CAMBODIAN** origin when param absent; texture pills / similar strip use **`shopBcfUrl`**. **`products/page.tsx`**: marble thumbs → **`/shop/${category}?texture=${slug}`**. **`bcfProductOptions.ts`**: **`bcfInitialOriginFromPathname(pathname, search)`** reads **`/shop`** + query. Comments in **`shopTextureCategoryThumb.ts`**. **`tsc --noEmit`** passes.

---

## 2026-03-29 — Booking badges: inside card + Rewards-sized; checkout thumbs unified

**Context (this chat so far):** User reported appointment/consultation tier badges were **above** the frosted main card and **too small**; they should sit **inside** the card **below** the red crumb titles **APPOINTMENT** / **CONSULT**, and match the **loyalty / premium rewards** badge scale on Account → Rewards (**~182.16px**).

**Decisions / outcomes:** Header badge uses **`bookingPageHeaderBadgeSrc`** + **`BookingTierBadgeImg`** in **`BookingPageChrome`**; placement via **`BookingCrumbTitle`** optional **`middle`** slot (after title, before gray rule). Single source of truth for pixel constants in **`bookingBadges.ts`**.

**Changes:** **`BookingFlowLayout.tsx`**: no badge between nav and card (removed from above-card). **`BookingPageChrome.tsx`**: **`BookingCrumbTitle`** accepts **`middle`**; **`BookingTierBadgeImg`** at **`BOOKING_BADGE_DISPLAY_PX`** from **`utils/bookingBadges.ts`**. **`booking/appointment/page.tsx`** & **`booking/consultation/page.tsx`**: pass **`middle={<BookingTierBadgeImg />}`**. **`utils/bookingBadges.ts`**: **`BOOKING_BADGE_DISPLAY_PX`** (182.16), **`BOOKING_BADGE_CART_CELL_WIDTH_PX`**, **`isBookingCartBadgeItem`**. **`checkout/page.tsx`** & **`checkout/confirm/page.tsx`**: cart row thumb + cell width use Rewards scale for **`booking-appointment` / `booking-consult`** lines; confirm summary scroll width uses same cell width; **`digitalOnlyLine`** includes booking thumbs for layout parity with gift/membership rows.

---

## 2026-03-30 — Booking cart: premium/standard badge thumbs + consult add-to-bag

**Context (this chat):** User reported booking line items in the bag showed **wrong thumbnails** (not premium/standard PNG badges), and **consult ADD TO BAG** did not work reliably.

**Root causes:** Bag / cart dropdown used **`item.image`** (**`neon-booking.svg`**) or generic product logic instead of **`bookingCartItemThumbnailSrc`**. Consult flow **blocked** add unless a hair-inspo file was selected.

**Changes:** **`bookingCartItemThumbnailSrc`** sets **`image`** when creating cart rows on **`booking/appointment/page.tsx`** and **`booking/consultation/page.tsx`**. **`shopping-bag/page.tsx`** (cart + saved lists): **`getItemImage`** prefers **`bookingCartItemThumbnailSrc(item)`**; booking rows use **`object-contain`**. **`CartDropdown.tsx`**: same thumb logic, booking **nav** targets, hide **EDIT IN BUILD-A-WIG**, red subtitle uses **`bookingBagSubtitle`** / **BOOKING DEPOSIT**. Consult: inspo upload **optional** (label + body copy); **`handleAddToBag`** no longer requires a file.

---

## 2026-03-30 — Booking consult/appointment: trim hero copy, NOIR-style CTA below card

**Context (this chat):** User asked to drop redundant **Covered By Your Grace** script titles (**WIG CONSULT** / **WIG INSTALLATION**) and **PREMIUM MEMBER BOOKING** subline prefix; move **add to bag** below the frosted main card with the same styling as the **NOIR** product page; appointment button label **ADD TO BAG** (was **ADD SELECTION TO BAG**); consult **CHOOSE FILE** chip **rounded** (**8px** radius) inside a **square** outer file area.

**Changes:** **`BookingFlowLayout.tsx`**: optional **`belowCard`** slot after the main card (hidden when mobile menu open). **`BookingPageChrome.tsx`**: **`NoirStyleAddToBagButton`** (mirrors NOIR **`className`** / **`style`**). **`booking/consultation/page.tsx`**: removed **`BookingScriptHero`**; **`BookingHeroSubline`** = deposit line only; CTA + deposit footnote in **`belowCard`**; **`borderRadius: 8px`** on **CHOOSE FILE** span only. **`booking/appointment/page.tsx`**: removed script hero; subline **LOCATED IN MEMPHIS, TN.** only; CTA + footnote in **`belowCard`**.

---

## 2026-03-30 — BCF PDP: premium gate on non-default hair color + Russian default PLATINUM

**Context (this chat):** Standard (non–premium / non-BLACK) members selecting a **non-default** hair color on **`/shop/bundles`**, **`/shop/closures`**, **`/shop/frontals`** should see the same **upgrade subscription** modal as **`/lobby`** (title/message/UPGRADE/CANCEL). **Russian** origin default color should be **PLATINUM**, not **GOLDEN**.

**Changes:** **`utils/premiumMemberAccess.ts`**: **`isPremiumMemberForGatedFeatures()`** (matches lobby logic), **`prepareMembershipUpgradeNavigation()`** (session + **`membershipShowPremiumView`** flags). **`lobby/page.tsx`**: uses shared helpers. **`bcfProductOptions.ts`**: **`bcfDefaultColorIdForOrigin`** — **RUSSIAN** → **PLATINUM**, else **OFF BLACK**; color reset effect on PDP uses it. **`shop/texture-category-product/page.tsx`**: **`ConfirmationModal`** with same copy as lobby; **`handleBcfColorSelect`** blocks non-default colors unless premium gate passes.

---

## 2026-03-30 — Fix: `booking_badge_display_px` import binding

**Context:** Runtime / component error: imported binding **`booking_badge_display_px`** not found (actual export was **`BOOKING_BADGE_DISPLAY_PX`** only).

**Changes:** **`utils/bookingBadges.ts`**: export aliases **`booking_badge_display_px`**, **`booking_badge_cart_cell_width_px`**. **`BookingPageChrome.tsx`**: re-export **`booking_badge_display_px`** from **`bookingBadges`** for mistaken imports from the chrome module.

---

## 2026-03-30 — BCF PDP: extra space above tabs + option labels

**Context:** User asked for **+10px** above the **DETAILS / SHIPPING / …** tab row and **+6px** above **hair texture**, **hair length**, **lace size**, and **hair color** on **`/shop/bundles|closures|frontals`**.

**Changes:** **`texture-category-product/page.tsx`**: tab block **`paddingTop`** **20px → 30px** (+10px). Bohemy option labels (**hair texture**, **lace size**, **hair length**, **hair color**) use shared **`bcfBohemySubLabelStyle`** with fixed **`margin: 6px 0 8px`** (6px top, 8px bottom) — not cumulative per-label bumps.

---

## 2026-03-30 — Cart dropdown: booking badge thumbs 25% smaller

**Context:** User asked to shrink **consult** / **appointment** badge thumbnails in the **cart dropdown only** by **25%** (vs standard **88px** unit thumbs).

**Changes:** **`CartDropdown.tsx`**: for **`booking-consult`** / **`booking-appointment`**, thumb container + **`img`** use **66px** (**88 × 0.75**); gift card **108px** and other items **88px** unchanged.

---

## 2026-03-30 — BCF premium color gate: modal body copy

**Context:** Hair color non-default tap on bundles/closures/frontals should use message **YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE.** (not “…ACCESS THIS AREA.”). Title **UPGRADE YOUR SUBSCRIPTION?** and **UPGRADE** / **CANCEL** unchanged.

**Changes:** **`texture-category-product/page.tsx`** **`ConfirmationModal`** **`message`** updated. **`/lobby`** modal unchanged.

---

## 2026-03-30 — Mobile menu order: BOOKING after BUILD-A-WIG; FAQ after CAREERS

**Context (this chat):** User asked to move **BOOKING** **below** **BUILD-A-WIG** on the SHOP tab menu toggle, and **FAQ** **below** **CAREERS** on the BRAND tab.

**Changes:** **`ShopMobileMenuShopTab.tsx`**: **`SHOP_TAB_ITEMS`** order … **BUNDLES** → **BUILD-A-WIG** → **BOOKING** → **ORDER AUTHORIZATION FORM**. **`constants/brandMenu.ts`**: **`BRAND_MENU_ITEMS`** … **REVIEWS** → **CAREERS** → **FAQ** → **TERMS**; **`BRAND_SLUGS`** reordered to match (**`reviews`**, **`careers`**, **`faq`**, **`terms`**).

---

## 2026-03-30 — BCF PDP selections: Noir-sized chips, build-a-wig color rings, red selected chrome

**Context (this chat):** User asked bundles/closures/frontals PDP option buttons to match **Noir** unit page **font sizes and widths**, color swatches to use the same **gray/white ring** treatment as **build-a-wig color** **`ThumbBox`**, and **selected** options to use **red text + red border** (not black).

**Changes:** **`texture-category-product/page.tsx`**: **`bcfOptionBtnTypography`** (**11px** Futura Medium, clamp padding, **`minWidth: clamp(50px, 12vw, 75px)`** like Noir caps); **`bcfOptionSelectedChrome`** / **`BCF_OPTION_RED`**; origin / texture / lace / length buttons use that stack; lace uses wider **`minWidth: clamp(72px, 18vw, 130px)`** (Noir flexible-cap scale); length grid **`max-w-[320px]`** + per-cell **`maxWidth: clamp(52px, 14vw, 76px)`**. **`BcfColorSwatchDonut`** duplicates **`ThumbBox`** gray/white/color circles (**35px**); color cells **60px** wide, **9px** label; selected state **#EB1C24** border + label text.

---

## 2026-03-29 — Order authorization: TOOLS menu + `/tools/order-form` route

**Context (this chat):** User asked to put **ORDER AUTHORIZATION FORM** **under GIFT CARD** on the **TOOLS** tab of the mobile menu toggle (not SHOP), and to change the **canonical URL** and **nav/breadcrumb copy** from **SHOP** to **TOOLS**.

**Decisions / outcomes:** Public route is **`/tools/order-form`**; **`/shop/order-form`** **301-style** client redirect (**`<Navigate replace>`**) for old links. Mobile **TOOLS** tab lists **GIFT CARD** then **ORDER AUTHORIZATION FORM** via shared **`ShopMobileMenuToolsTab`**.

**Changes:** **`ShopMobileMenuToolsTab.tsx`** (links to **`/tools/gift-card`** and **`/tools/order-form`**). **`ShopMobileMenuShopTab.tsx`**: removed order-form from SHOP tab (from prior work in thread). **`App.tsx`**: **`/tools/order-form`** → **`OrderFormPage`**; **`/shop/order-form`** → redirect. **`pages/shop/order-form/page.tsx`**: breadcrumb **TOOLS >** linking to **`/tools`**; default **`mobileMenuActiveTab`** **`TOOLS`**; TOOLS drawer uses **`ShopMobileMenuToolsTab`**. **Navigations** to the form updated to **`/tools/order-form`** in **`checkout/confirm/page.tsx`**, **`orders/page.tsx`**, **`account/concierge/page.tsx`**. Replaced gift-card-only TOOLS drawer blocks with **`ShopMobileMenuToolsTab`** across **~47** layout/page files (bulk replace + indent normalization). **`motherboard/CODEBASE.md`**: note **`tools/order-form`** and redirect.

---

## 2026-03-30 — BCF cart + PDP: no build-a-wig edit link, PDP thumb nav, tax + Klarna copy

**Context (this chat):** User wanted **bundles / closures / frontals** cart lines (from booking/shop BCF PDP, **`type: 'shop-texture-category'`**) to **not** show **EDIT IN BUILD-A-WIG**; **thumbnail taps** should open the correct **`/shop/{category}?texture=…`** PDP; BCF product pages should show **(EXCLUDING SALES TAX)** under the main price and **OR 4 PAYMENTS … KLARNA** like Noir units; checkout summary should show the right thumb for those lines.

**Changes:** **`utils/bcfProductOptions.ts`**: **`shopBcfPdpHref`**, **`shopBcfPdpHrefFromCartItem`**. **`CartDropdown.tsx`** & **`shopping-bag/page.tsx`** (cart + saved): exclude **`shop-texture-category`** from edit link; thumbnail **`onClick`** resolves **BCF** URL before unit name fallbacks. **`shop/texture-category-product/page.tsx`**: tax line, stars, Klarna line ( **`formatPrice(Math.ceil(displayPrice / 4))`** ); hair-profile block **`translateY`** **-118px → -102px** for spacing. **`checkout/page.tsx`**: **`getItemImage`** returns **`item.image`** when **`type === 'shop-texture-category'`**.

---

## 2026-03-30 — SHOP menu: BOOKING above UNITS

**Context (this chat):** User asked to move **BOOKING** **above** **UNITS** on the mobile menu toggle (SHOP tab).

**Changes:** **`ShopMobileMenuShopTab.tsx`**: **`SHOP_TAB_ITEMS`** order is now **BOOKING** → **UNITS** → **HD LACE** → **BUNDLES** → **BUILD-A-WIG**.

---

## 2026-03-30 — BCF PDP: revert vertical chip gaps; horizontal gap-3

**Context (this chat):** User did **not** want the prior **vertical** margin changes between **hair profile / texture / length** ( **`mb-6`**, label margin tweaks); they wanted **horizontal** spacing between option chips instead.

**Changes:** **`shop/texture-category-product/page.tsx`**: lace row **`mb-6` → `mb-3`**; length grid **`mb-6` → `mb-3`**; **hair length** Bohemy label **`margin` `12px` → `22px`** top (restored). **Horizontal:** origin / texture / lace flex rows **`gap-2` → `gap-3`**; length grid **`gap-2` → `gap-3`**; hair color swatch row **`gap-x-2` → `gap-x-3`**.

**Follow-up:** Hair length grid **`gap-3`** narrowed chips inside **`max-w-[320px]`**; restored **`gap-2`** on the length grid only so option width matches the prior layout.

---

## 2026-03-30 — BCF PDP: hair texture & hair color label margin match hair length

**Context:** Spacing **above** **hair texture** and **hair color** (Bohemy labels) was smaller than **hair length** because **`bcfBohemySubLabelStyle`** used **`6px`** top margin while **hair length** used **`22px`**.

**Changes:** **`texture-category-product/page.tsx`**: **`bcfBohemySubLabelStyle`** **`margin`** **`6px` → `22px`** top ( **`22px 0 8px`** ); **hair length** paragraph uses the shared style only (removed redundant override).

---

## 2026-03-30 — BCF PDP: hair length grid matches profile gap-3, wider chips

**Context:** User wanted length option boxes **wider**, horizontal spacing **between** chips to match **hair profile** buttons (**`gap-3`**), not the old narrow caps from **`gap-2`** + **`max-w-[320px]`** + tight **`maxWidth`** on buttons.

**Changes:** **`texture-category-product/page.tsx`**: length wrapper **`grid-cols-4 gap-3`** (same as profile/texture/lace); **`max-w-[min(100%,400px)]`** + **`w-full`**; removed per-button **`maxWidth`** / tight horizontal **`padding`** overrides so cells use full **`bcfOptionBtnTypography`** padding and fill each grid column.

---

## 2026-03-30 — BCF PDP: +10px above DETAILS / SHIPPING / … tabs

**Changes:** **`texture-category-product/page.tsx`**: tab block wrapper **`paddingTop`** **`30px` → `40px`** (later **`50px`**).

---

## 2026-03-30 — BCF PDP: hair texture block matches Noir flexible cap spacing

**Context:** **Hair texture** on BCF should match **`/straight/noir`** **flexible cap** section: spacing above label, Bohemy title, and chip row transforms.

**Changes:** **`texture-category-product/page.tsx`**: origin row **`mb-3` → `mb-6`** (like custom cap before flexible cap); **hair texture** wrapped in **`mb-6`**; title **`fontSize: 20px`**, **`translateY(-24px)`**, **`mb-4`** (Noir flexible cap); texture buttons row **`translateY(-32px)`** (Noir flexible cap buttons). **`bcfBohemySubLabelStyle`** no longer used for hair texture line only.

---

## 2026-03-30 — BCF PDP: left-aligned tabs + Noir-style quantity + cart quantity

**Context:** User wanted **DETAILS / SHIPPING / …** tab row **left-aligned** like Noir **tab body** (Noir tab **buttons** are still centered in code; BCF uses **`justify-start`**); tab copy **left-aligned**; **quantity** control **below** color swatches **above** tabs (same segmented control as Noir); **`add to bag`** stores **`quantity`** and updates **`cartCount`** as **`currentCount + quantity`** (Noir unit pattern).

**Changes:** **`texture-category-product/page.tsx`**: **`quantity`** state, **`handleQuantityIncrease` / `handleQuantityDecrease`**; quantity block after color grid; tab row **`justify-center` → `justify-start`** + **`w-full`**; all tab panel paragraphs **`textAlign: 'left'`**; **`handleAddToBag`** uses **`quantity`** and **`currentCount + quantity`** for cart count.

---

## 2026-03-29 — Concierge: loyalty-points thumbnail +25%

**Context:** User asked to increase the size of the **loyalty-points** thumbnail image on **Account → Concierge** (birthday gift: **$20 gift card** vs **200 loyalty points**).

**Changes:** **`src/pages/account/concierge/page.tsx`**: selectable gift boxes **`height`** **`144px` → `180px`** (25% larger, keeps both columns aligned). **`points-loyalty.png`** **`maxWidth` / `maxHeight`** **`119`/`173` → `148.75`/`216.25`** (+25%).

**Related (earlier in chat):** Discussion of broken booking/BCF texture thumbnails—paths point at **`public/assets/`** with fixed filenames; verify files exist, casing, and cache-busting if needed.

---

## 2026-03-29 — Concierge: loyalty image horizontal offset 30px

**Context:** User adjusted the **points-loyalty** image position: **`translateX(30px)`** (was **`23px`**).

**Changes:** **`src/pages/account/concierge/page.tsx`** — **`transform: 'translateX(30px)'`** on **`points-loyalty.png`**.

---

## 2026-03-29 — Concierge: loyalty image +5% size

**Context:** User asked to increase the **loyalty-points** image size by **5%**.

**Changes:** **`concierge/page.tsx`**: **`points-loyalty.png`** **`maxWidth` / `maxHeight`** **`148.75`/`216.25` → `156.19`/`227.06`** (×1.05). Both birthday gift boxes **`height`** **`180px` → `189px`** so columns stay aligned and the image is not clipped.

---

## 2026-03-29 — Concierge: loyalty image −5% size

**Context:** User asked to decrease the **loyalty-points** image size by **5%**.

**Changes:** **`concierge/page.tsx`**: **`points-loyalty.png`** **`maxWidth` / `maxHeight`** **`156.19`/`227.06` → `148.38`/`215.71`** (×0.95). Both birthday gift boxes **`height`** **`189px` → `180px`**.

---

## 2026-03-30 — BCF PDP: quantity full black border, tabs −10px padding top

**Context:** BCF quantity control lost visible outer black border because **`border: none !important`** overrode per-side borders; user wanted **10px less** space above **DETAILS** tabs.

**Changes:** **`texture-category-product/page.tsx`**: quantity wrapped in **`inline-flex`** with **`border: 1.3px solid #000`**; inner segments **`border: none`**; middle column **`borderLeft` / `borderRight`** for internal dividers. Tab block **`paddingTop`** **`50px` → `40px`**.

---

## 2026-03-30 — BCF PDP: quantity spacing above matches Noir

**Context:** Spacing above the BCF quantity counter should match **`/straight/noir`**.

**Changes:** **`texture-category-product/page.tsx`**: hair color **`flex`** row **`mb-6`** (Noir flexible-cap block uses **`mb-6`** before quantity); quantity row **`style={{ transform: 'translateY(-30px)' }}`** (same as Noir quantity wrapper).

---

## 2026-03-30 — BCF PDP: RAW HUMAN HAIR copy + quantity −15px

**Changes:** **`texture-category-product/page.tsx`**: **`TEXTURE_META`** sublines, details bundles line, similar-products red line → **RAW HUMAN HAIR**; quantity wrapper **`translateY(20px)`** (BCF-only).

---

## 2026-03-30 — Bundles PDP: bundle photo/video assets + PHOTO/VIDEO toggle + ThumbBox row

**Context:** User wanted **`/shop/bundles`** hero media only swapped to six assets (**straight / wavy / curly** product **JPG** + **MP4**), order straight → wavy → curly; **PHOTO / VIDEO** toggle above the hero (styling like Noir **2D / 3D**); main area shows photo or video per toggle; **ThumbBox** thumbnails below (build-a-wig pattern), always **three** photo thumbs; video mode shows the three videos when each texture is selected via URL/thumbs.

**Changes:** **`texture-category-product/page.tsx`**: **`BUNDLE_PHOTO_BY_TEXTURE`** / **`BUNDLE_VIDEO_BY_TEXTURE`** (`public/assets`: **`straight-bundle-product.JPG`**, **`straight-bundle-video.MP4`**, **`wavy-bundle-product.JPG`**, **`wavy-bundle-product.MP4`** for wavy video per repo filename, **`curly-bundle-product.JPG`**, **`curly-bundle-video.MP4`**). State **`bundleShowVideo`** + **`bundleVideoRef`**; **`heroThumbSrc`** for cart uses bundle photo when **`category === 'bundles'`**. Bundles-only hero: toggle, **`img`** / **`<video>`** (muted, loop, playsInline, autoPlay), row of three **`ThumbBox`** (**TEXTURE** / **`BCF_TEXTURE_LABELS`**) wired to **`navigate(shopBcfUrl)`** and **`allowedBcfTextures`**. Closures/frontals unchanged.

**Conventions:** If wavy video is renamed to **`wavy-bundle-video.MP4`**, update **`BUNDLE_VIDEO_BY_TEXTURE.wavy`** accordingly.

---

## 2026-03-30 — BCF PDP: centered tab row, left tab body, hair profile −4px gap

**Changes:** **`texture-category-product/page.tsx`**: **DETAILS / SHIPPING / …** row **`justify-start` → `justify-center`** (panel copy stays **`textAlign: 'left'`**); options block **`translateY(-102px)` → `translateY(-106px)`** (4px less space above **hair profile**).

---

## 2026-03-30 — BCF PDP: +2px above hair texture, lace size, hair length

**Changes:** **`texture-category-product/page.tsx`**: **hair texture** / **hair length** labels **`margin` top **`22px` → `24px`**; **lace size** **`16px` → `18px`** top. **Hair color** still uses shared **`bcfBohemySubLabelStyle`** (**22px** top).

**Follow-up:** **lace size** top **`22px`**; **hair texture** / **hair length** top **`26px`**.

---

## 2026-03-30 — Bundles PDP: ~100px space between texture thumbs and product title

**Context:** User reported overlap between **BUNDLES** product name and the three **ThumbBox** textures; asked for **~100px** spacing.

**Changes:** **`texture-category-product/page.tsx`**: **`bcfBundlesBelowThumbSpacingPx`** (`100` when **`category === 'bundles'`**, else **`0`**). Added to existing negative **`translateY`** values for title, subline, price/tax/stars/Klarna, **hair profile** block, and **DETAILS** tabs so the whole stack shifts **100px** down on bundles only (closures/frontals unchanged).

---

## 2026-03-30 — Bundles PDP: hero + thumbs +1.35× scale, tandem spacing below

**Context:** Portrait bundle hero felt too narrow with excess side margin; user asked **+35%** scale for **photo/video hero + thumbnails**, with card content below moving in step (no overlap).

**Changes:** **`texture-category-product/page.tsx`**: **`BUNDLE_HERO_LAYOUT_SCALE` 1.35**; **`bundlePdpHeroMaxWidthPx(tex)`** = **`400 × scale × shopTextureCategoryProductPageDisplayScale(tex)`** for column + **`img`/`video`**; **`BUNDLE_THUMB_CONTAINER_PX` / `BUNDLE_THUMB_IMAGE_PX`** (54/72 rounded × 1.35); media **`minHeight`**, **`product-wig-preview` `marginBottom`**, media **`marginBottom`**, thumb row **`gap`/`marginBottom`** scaled ×1.35; bundles copy **`marginTop`** uses **`BUNDLE_COPY_MARGIN_TOP_PX`** (100×1.35 rounded).

---

## 2026-03-30 — Bundles PDP: texture ThumbBoxes tappable + title class fix + copy `marginTop` 100px

**Context:** Texture **ThumbBoxes** did not change the hero (taps ineffective). User wanted **bundles** copy moved **100px** down only.

**Cause:** Global **`.gift-card-product-name`** (**`translateY(-128px) !important`**, **`z-index: 999`**) still applied to the **BUNDLES** title; it sat over the thumbs and intercepted touches. React inline **`transform`** did not reliably override stylesheet **`!important`**.

**Changes:** **`texture-category-product/page.tsx`**: Bundles title uses **`bcf-bundles-pdp-product-name`** (not **`gift-card-product-name`**); **`z-index: 1`** on bundles title. Thumb row **`z-index: 30`**; **`navigate(..., { replace: true })`** on every allowed tap (not only when texture changes). Copy wrapper **`marginTop: 100px`** when **`category === 'bundles'`**. **`index.css`**: **`.bcf-bundles-pdp-product-name`** (**`translateY(0)`**, typography).

---

## 2026-03-30 — Bundles PDP: PHOTO/VIDEO toggle width matches hero media (Noir 2D/3D alignment)

**Context:** **PHOTO / VIDEO** sat on the **far right of the full card** because its **`position: absolute; right`** was relative to a **100%-wide** row; it should stay over the **hero image/video** like Noir **2D / 3D**.

**Changes:** **`texture-category-product/page.tsx`**: Inner bundles column (toggle + **`product-wig-preview-images`** + thumbs) **`maxWidth`** = **`400 * shopTextureCategoryProductPageDisplayScale(texture)`**, **`marginLeft` / `marginRight: auto`**. Removed extra horizontal padding on the media wrapper so edges match the toggle row.

---

## 2026-03-30 — BCF PDP: DETAILS tabs match Noir bottom rhythm (card padding + tab strip)

**Context:** User reported **DETAILS** copy/tabs overlapping **outside** the main white card; wanted **bottom spacing** aligned with **closures** PDP and **Noir**.

**Changes:** **`texture-category-product/page.tsx`**: Main card **`paddingBottom: '34px'`** for **bundles / closures / frontals** (was **`0`** except bundles). Tab block unified with Noir: **`mt-6`**, **`transform: translateY(-20px)`**, **`paddingTop: '10px'`** (removed per-category **`translateY(-155)`** / bundles **`0`** / **`marginBottom: -65px`** on wrapper). Tab body **`marginBottom: '-93px'`** (was **`-65px`**, matches **`noir/page.tsx`**). Tab button row **`justify-center`** without **`flex-wrap`** (Noir).

---

## 2026-03-30 — Bundles PDP: center media, thumbs one row, title stack no overlap

**Context:** User wanted bundle **photo/video** centered in the card, **three texture ThumbBoxes on one row** (no wrap), and **BUNDLES** title/copy no longer overlapping thumbnails.

**Changes:** **`texture-category-product/page.tsx`**: Hero column **`width/maxWidth 100%`** + **`alignSelf: stretch`**; media wrapper full width **`justifyContent: center`** with horizontal padding; **`img`/`video`** **`maxWidth`** from **`shopTextureCategoryProductPageDisplayScale`** + **`margin auto`**. Thumb row **`flex-nowrap`**, **`shrink-0`** on **`ThumbBox`**, **`containerSize` 54 / `imgSize` 72**, **`gap` clamp**. **`bcfPdpCopyTy`**: bundles use **`translateY(0)`** for title through **hair profile** block (replaces **`bcfBundlesBelowThumbSpacingPx`**). Copy wrapper **`marginTop`** clamp when bundles. Tabs block: bundles **`translateY(0)`**, no **`-65px`** **marginBottom**, tighter **`paddingTop`**.

---

## 2026-03-30 — BCF PDP: fix JSX fragment / extra closing divs

**Context:** Vite/Babel error: **Expected corresponding JSX closing tag for `<>`** near end of main white card (`texture-category-product/page.tsx`).

**Cause:** After the bundles hero refactor, **two extra `</div>`** closings remained where the old **`translateY(20px)`** hero wrapper used to close.

**Changes:** Removed those **two** stray **`</div>`** tags after the quantity row (before the **DETAILS** tabs block).

---

## 2026-03-30 — Bundles PDP: align PHOTO/VIDEO row with Noir 2D/3D (product-wig-preview stack)

**Context:** User wanted **PHOTO / VIDEO** on the same vertical line as Noir’s **2D VIEW / 3D VIEW** and bundles hero aligned with where Noir’s main card content starts.

**Changes:** **`texture-category-product/page.tsx`**: Bundles-only **`className="product-wig-preview"`** (uses **`index.css`** **`translateY(12px)`** / margin + **`:has(.product-wig-preview)`** card **`padding-top`** like Noir). Inner Noir mirror: **`translateY(-4px)`** + **`marginBottom: 8px`**, **`inline-flex`** column, toggle row **`position: relative`**, **`marginBottom: 4px`**, **`minHeight: clamp(18px,…,26px)`**, toggle **`position: absolute`**, **`right: clamp(4px,1vw,12px)`**, **`className="product-view-toggle-text"`**. Main media in **`product-wig-preview-images`** with Noir **`marginBottom: clamp(12px,…,16px)`**. Removed bundles **`translateY(-74px)`** lift. Card **`paddingBottom: 34px`** when bundles (Noir). Closures/frontals keep prior **`-74px`** hero wrapper.

---

## 2026-03-29 — Concierge: loyalty image translateX 13px

**Context:** User asked for **`translateX(13px)`** instead of **`23px`** on **`points-loyalty.png`**.

**Changes:** **`src/pages/account/concierge/page.tsx`** — **`transform: 'translateX(13px)'`**.

---

## 2026-03-29 — Concierge: loyalty image +6px right, +3px down

**Context:** User asked to move **`points-loyalty.png`** **3px down** and **6px to the right** (from prior **`translateX(13px)`**).

**Changes:** **`concierge/page.tsx`** — **`transform: 'translate(19px, 3px)'`** (**13+6**, **3** down).

---

## 2026-03-29 — Concierge: loyalty image 6px up

**Context:** User asked to move **`points-loyalty.png`** **6px upward** (from **`translate(19px, 3px)`**).

**Changes:** **`concierge/page.tsx`** — **`transform: 'translate(19px, -3px)'`**.

---

## 2026-03-30 — Six unit PDPs: selected cap chips match bundles (red border + #EB1C24)

**Context:** User reported **custom / flexible cap** option boxes on the **six unit product pages** stayed **black-bordered** when selected; they should match **bundles (BCF) PDP** selection (**red border + brand red label**).

**Topics covered:** Handoff from prior chat; implemented shared chrome helper and wired all six unit routes.

**Decisions / outcomes:** Single source of truth for selected chip **border + color** next to BCF product options.

**Changes:**
- **`src/utils/bcfProductOptions.ts`** — Exported **`BCF_OPTION_RED`** (`#EB1C24`) and **`bcfOptionSelectedChrome(selected)`** (1.3px solid red/black border + matching text color); uses **`CSSProperties`** from React.
- **`src/pages/shop/texture-category-product/page.tsx`** — Imports those exports; removed duplicate local definitions.
- **Six unit PDPs** — **`noir`**, **`blanco`**, **`soft-wave`**, **`beach-wave`**, **`soft-curl`**, **`ocean-curl`**: import **`bcfOptionSelectedChrome`**; **custom cap** buttons drop **`border-black` / `text-red-500`** and spread chrome in **`style`**; **flexible cap** buttons use chrome for border+color (replacing always-black border).

**Conventions:** Reuse **`bcfOptionSelectedChrome`** for any future PDP option chips that should match BCF/bundles.

---

## 2026-03-30 — BCF bundles hero: three texture thumbs always tappable (hero + highlight like wig PDP)

**Context:** User wanted the **three thumbnails under the bundles main hero** to behave like **Build-a-Wig** hero thumbs: **tap = highlighted thumb + main hero shows that texture** (photo/video still follow **PHOTO/VIDEO** toggle).

**Cause:** Hero **`ThumbBox`** row used **`isDisabled={!allowedBcfTextures.includes(tid)}`**. **`bcfTexturesForOrigin`** only allows one texture per origin (e.g. Cambodian → straight only), so **wavy/curly** thumbs were **disabled** (`pointer-events: none`) and could not be tapped.

**Decisions / outcomes:** **Bundles PDP hero row** is for **cross-texture preview**; all three thumbs stay enabled. **`navigate(..., { replace: true })`** updates **`?texture=`** so **`texture`** drives hero + cart; existing effects still sync **`bcfOrigin`** and redirect if URL texture is incompatible with the selected origin.

**Changes:** **`src/pages/shop/texture-category-product/page.tsx`** — bundles **`TEXTURE_ORDER.map`** **`ThumbBox`**: **`isDisabled={false}`**, **`onClick`** always navigates to **`shopBcfUrl(category, tid)`** (removed **`allowed`** gate for this row only). **Hair texture** option chips below still use **`allowedBcfTextures`** for purchase-valid combinations.

---

## 2026-03-30 — Bundles PDP: less space above title copy (−60px)

**Context:** User asked to **reduce spacing above the bundles text by 60px** (bundles product PDP).

**Changes:** **`texture-category-product/page.tsx`** — **`BUNDLE_COPY_MARGIN_TOP_PX`** is now **`Math.round(100 * BUNDLE_HERO_LAYOUT_SCALE) - 60`** (was scale-only; **~135px → ~75px** at scale **1.35**), applied to the copy wrapper **`marginTop`** when **`category === 'bundles'`**.

---

## 2026-03-30 — Bundles PDP: ThumbBox frame fits portrait bundle thumbs

**Context:** User asked to adjust **width and height of the white + black/red border** around the **three bundle texture thumbnails** so it matches the **slender portrait** product frames (square inner box was wrong).

**Changes:**
- **`src/components/ThumbBox.tsx`** — Optional **`containerWidth` / `containerHeight`** (outer border box) and **`imageWidth` / `imageHeight`** (inner media rectangle); defaults preserve prior **`containerSize` + `imgSize`** behavior. Removed **`console.log`**. Inner **`overflow`** uses max inner dimension vs outer box.
- **`src/pages/shop/texture-category-product/page.tsx`** — Replaced square **`BUNDLE_THUMB_CONTAINER_PX` / `BUNDLE_THUMB_IMAGE_PX`** with scaled portrait constants (**`BUNDLE_THUMB_INNER_W/H`**, **`BUNDLE_THUMB_OUTER_W/H`**) and pass the new props + **`topPosition="calc(50% + 5px)"`** on bundle hero **`ThumbBox`**es.

---

## 2026-03-30 — ThumbBox: fix ReferenceError (containerWidth undeclared)

**Context:** Runtime error **can't find variable: containerWidth** (Safari-style message for **`ReferenceError`**) when rendering **`ThumbBox`**.

**Cause:** **`containerWidth`**, **`containerHeight`**, **`imageWidth`**, and **`imageHeight`** were on the props interface and used in the component body but **not destructured** from the function arguments, so they were treated as global identifiers.

**Changes:** **`src/components/ThumbBox.tsx`** — Added those four props to the **`ThumbBox({ ... })`** destructuring list.

---

## 2026-03-30 — Bundles PDP: texture thumbs without TEXTURE / Straight–Wavy–Curly captions

**Context:** User asked to **remove the “TEXTURE” text and the Straight / Wavy / Curly labels** above and below the **three bundle hero thumbnails**.

**Changes:**
- **`ThumbBox.tsx`** — **`title`** and **`label`** optional (default **`''`**); top/bottom **`<p>`** blocks render only when trimmed string is non-empty. Optional **`imageAlt`** for **`img`** **`alt`** (fallback **`Card image`**).
- **`texture-category-product/page.tsx`** — Bundle row **`ThumbBox`**: dropped **`title`** / **`label`**; set **`imageAlt`** from **`BCF_TEXTURE_LABELS`**. **`BUNDLE_THUMB_OUTER_*`** derived as inner + scaled padding (no extra height for captions); **`topPosition="50%"`**.

---

## 2026-03-30 — Closures & frontals PDP: bundles-style PHOTO/VIDEO hero + wavy/curly front/back assets

**Context:** User asked to apply the **same PHOTO/VIDEO layout** as the **bundles** PDP to **`/shop/closures`** and **`/shop/frontals`**, using **`public/assets`** **`curly-*` / `wavy-*`** **closure** and **frontal** **product** (front/back **.JPG**) and **video** (front/back **.MP4** / **.mov** as on disk).

**Changes:** **`src/pages/shop/texture-category-product/page.tsx`**
- **`BCF_CF_PHOTO`** / **`BCF_CF_VIDEO`** maps for **closures** and **frontals**, **wavy** and **curly** only (paths match repo: e.g. **`wavy-frontal-video-front.mov`**, **`wavy-frontal-video-back.MP4`**).
- **`bcfUsesBundleStyleHero`**: bundles + closures + frontals share **`product-wig-preview`** column (toggle row, media, **three texture ThumbBoxes**).
- **Wavy/curly** closures/frontals: **PHOTO | VIDEO** ( **`bcfCfShowVideo`** ) + **FRONT | BACK** ( **`bcfCfShowBack`** ); hero uses mapped stills or videos; **`bcfCfVideoRef`** + **`useEffect`** play/pause; **`useEffect`** resets CF toggles on **`texture`/`category`** change.
- **Straight** closures/frontals: **no** PHOTO/VIDEO or FRONT/BACK row; hero **`shopTextureCategoryThumbSrc`** PNG; thumbs unchanged for straight.
- **`heroThumbSrc`** / cart thumbnail: **wavy/curly** CF uses **front JPG**; **`bcfHeroThumbSrcForTexture`** drives **ThumbBox** images + **`imageAlt`** (bundle vs closure vs frontal).
- Copy stack: **`bcfPdpCopyTy`** and title class / **`BUNDLE_COPY_MARGIN_TOP_PX`** use **`bcfUsesBundleStyleHero`** (closures/frontals align with bundles, not **`gift-card`** −128px title).

---

## 2026-03-30 — BCF PDP: fix ReferenceError / hooks (`bcfUsesBundleStyleHero`)

**Context:** Runtime **“can’t find variable bcfUsesBundleStyleHero”** (Safari-style **`ReferenceError`**) on shop texture category PDP.

**Cause:** **`if (!category) return <Navigate … />`** ran **before** **`React.useMemo`** (**`displayPrice`**) and other derived values (**`bcfUsesBundleStyleHero`**, etc.). When **`category`** was **`null`**, that branch skipped a **`useMemo`** call; when **`category`** became set, an extra hook ran → **Rules of Hooks** violation and inconsistent execution.

**Changes:** **`texture-category-product/page.tsx`** — moved **`Navigate`** guard to **after** all hooks and null-safe **`displayPrice`** / **`cartLineName`** / **`heroThumbSrc`** / **`bcfHeroThumbSrcForTexture`** / **`detailsCopy`**; **`handleAddToBag`** bails if **`!category`**.

---

## 2026-03-30 — Bundles PDP: stable thumb row (curly no longer widens/shifts layout)

**Context:** User reported **curly bundle hero** scaling larger caused the **three thumbnails** to **move/shift**; all thumbs should keep the **same container size and position**.

**Cause:** **`bundlePdpHeroMaxWidthPx(texture)`** is larger for **curly**; the **column** **`maxWidth`** followed **`texture`**, so the strip **widened** on curly; hero media also grew **taller** vs **`minHeight`-only** wrapper, pushing thumbs **down**.

**Changes:** **`texture-category-product/page.tsx`** — **`BUNDLE_PDP_COLUMN_MAX_WIDTH_PX`** = max of **`bundlePdpHeroMaxWidthPx`** over **`TEXTURE_ORDER`** for the hero+thumbs column; bundle **`img`/`video`** still use per-texture **`maxWidth`**. **Bundles** **`product-wig-preview-images`**: **`aspectRatio: '3 / 4'`**, **`overflow: 'hidden'`**; bundle media **`maxHeight: '100%'`**, **`width: 'auto'`**, **`objectFit: 'contain'`**.

---

## 2026-03-30 — BCF PDP: tighter vertical rhythm around “RAW HUMAN HAIR” subline

**Context:** User asked to **reduce spacing above and below** the **RAW HUMAN HAIR** line (**`meta.subline`**) on **BCF product pages** by **2px** each.

**Changes:** **`texture-category-product/page.tsx`** — Subline **`<p>`**: removed **`mb-2`**; **`marginTop: '-2px'`**, **`marginBottom: '6px'`** (was **~8px** from **`mb-2`**, **−2px**).

---

## 2026-03-30 — Bundles PDP: drop clipped hero box; uniform hero width (curly = straight/wavy)

**Context:** User reported the prior **aspect-ratio + `overflow: hidden`** approach **clipped** the hero; **curly** still rendered **wider** than straight/wavy.

**Changes:** **`texture-category-product/page.tsx`**
- **`BUNDLE_PDP_BUNDLES_HERO_MAX_WIDTH_PX`** = **`bundlePdpHeroMaxWidthPx('straight')`** — bundles **photo/video** and **bundles** column **`maxWidth`** use this **single** value (no per-texture upscale for curly).
- **`BUNDLE_PDP_CF_COLUMN_MAX_WIDTH_PX`** = max over textures for **closures/frontals** bundle-style column only.
- **`product-wig-preview-images`**: **`overflow: 'visible'`**, restore **`minHeight: BUNDLE_HERO_MEDIA_MIN_HEIGHT_PX`** for all; **removed** bundles-only **`aspectRatio`** / **`maxHeight: 100%`** clipping.
- Bundle **`img`/`video`**: **`width: '100%'`**, **`maxWidth: BUNDLE_PDP_BUNDLES_HERO_MAX_WIDTH_PX`**, **`height: 'auto'`**.

---

## 2026-03-30 — Bundles PDP: remove hero clip; taller hero min height

**Context:** User reported bundle **hero still cut off** top/bottom; needed **more height** on the main hero container so the **full image** shows.

**Cause:** **`product-wig-preview-images`** still used **`overflow: 'hidden'`** + **`aspectRatio: '3 / 4'`** for **`category === 'bundles'`**, which **cropped** tall portrait assets.

**Changes:** **`texture-category-product/page.tsx`** — Bundles: **removed** **`aspectRatio`** and **`overflow: hidden`** (**`overflow: 'visible'`** for all). Added **`BUNDLE_PDP_HERO_MEDIA_MIN_HEIGHT_PX`** = **`round(BUNDLE_PDP_BUNDLES_HERO_MAX_WIDTH_PX × 1.75)`** for bundles-only **`minHeight`** on **`product-wig-preview-images`**; closures/frontals keep **`BUNDLE_HERO_MEDIA_MIN_HEIGHT_PX`**.

---

## 2026-03-30 — BCF PDP: main card bottom padding so DETAILS tabs stay inside (match Noir clearance)

**Context:** User asked to fix spacing **below the details tabs** on BCF product pages — content **spilling outside** the main card — and match **Noir** tab clearance; ensure **no weaker overrides**.

**Cause:** Noir tab lines use **`whiteSpace: nowrap`**; BCF **`detailsCopy`** **wraps**, so the tab block is **taller** while both still use **`marginBottom: '-93px'`** on the tab body → wrapped copy extends past the card’s **34px** bottom padding.

**Changes:**
- **`texture-category-product/page.tsx`** — Main card: class **`bcf-pdp-main-card`**, **`pb-4`** (parity with Noir **`pt-6 pb-4`**); **removed** inline **`paddingBottom: 34px`** (owned by CSS).
- **`index.css`** — **`.bcf-pdp-main-card.border.border-black.flex-col.pt-6:has(.product-wig-preview)`** → **`padding-bottom: calc(34px + 5.5rem) !important`** (Noir’s **34px** base + room for wrapped tabs; **`!important`** beats Tailwind **`pb-4`**).

---

## 2026-03-30 — BCF PDP: 10px above texture ThumbBox row

**Context:** User asked for **10px spacing above** the **three thumbnail images** on **BCF product pages** (bundles / closures / frontals).

**Changes:** **`texture-category-product/page.tsx`** — Hero **`ThumbBox`** row wrapper: **`marginTop: '10px'`**.

---

## 2026-03-30 — BCF PDP: +4px above texture thumbnails

**Context:** User asked for **another 4px** spacing above the **three thumbnails**.

**Changes:** **`texture-category-product/page.tsx`** — Thumb row **`marginTop`**: **`10px` → `14px`**.

---

## 2026-03-30 — Closures/frontals: straight photo+video; remove back view

**Context:** User asked to add **`straight-closure-product`**, **`straight-frontal-product`**, **`straight-closure-video`**, **`straight-frontal-video`** on closures/frontals PDPs and **remove back view** assets/UI.

**Changes:** **`texture-category-product/page.tsx`**
- **`BCF_CF_PHOTO`** / **`BCF_CF_VIDEO`**: **`Record<Texture, string>`** per category — **straight** uses **`/assets/straight-closure-product.JPG`**, **`straight-frontal-product.JPG`**, **`straight-closure-video.MP4`**, **`straight-frontal-video.MP4`**; **wavy/curly** keep **front-only** stills/videos (no **`-back`** paths).
- **FRONT/BACK** row, **`bcfCfShowBack`**, and **`-back`** media keys removed.
- **PHOTO | VIDEO** for **all** textures on closures/frontals; CF video **`useEffect`** runs for **straight** too (removed wavy/curly-only guard).
- **`heroThumbSrc`** / **`bcfHeroThumbSrcForTexture`** / cart image use **`BCF_CF_PHOTO`** for every texture on CF PDPs. CF hero **`img`** **`onError`** second fallback: **`shopTextureCategoryThumbSrc`**.

**Note:** Place the four new files under **`public/assets/`** with the extensions above (or adjust paths if your filenames differ).

---

## 2026-03-30 — BCF closures/frontals: wavy/curly asset base names (no `-front`)

**Context:** User renamed wavy/curly assets to **`wavy-closure-product`**, **`wavy-frontal-product`**, **`wavy-closure-video`**, **`wavy-frontal-video`**, and curly equivalents.

**Changes:** **`texture-category-product/page.tsx`** — **`BCF_CF_PHOTO`** / **`BCF_CF_VIDEO`** wavy+curly paths: **`/assets/wavy-closure-product.JPG`**, **`wavy-frontal-product.JPG`**, **`wavy-closure-video.MP4`**, **`wavy-frontal-video.mov`**, **`curly-closure-product.JPG`**, **`curly-frontal-product.JPG`**, **`curly-closure-video.MP4`**, **`curly-frontal-video.MP4`** (extensions match **`public/assets`**).

---

## 2026-03-30 — Closures/frontals hero: fix broken media (object vs string paths)

**Context:** User reported **closures & frontals photos/videos not showing**.

**Cause:** **`BCF_CF_PHOTO`** / **`BCF_CF_VIDEO`** were still typed as nested **`{ front, back }`** objects while JSX used **`BCF_CF_PHOTO[category][texture]`** as a **string** **`src`** → **`[object Object]`** / wrong type; **straight** keys were missing from those objects.

**Changes:** **`texture-category-product/page.tsx`** — Replaced with **`Record<Texture, string>`** for each category, matching **`public/assets`** exactly: **straight** videos **`straight-closure-video.mp4`** / **`straight-frontal-video.mp4`** (**lowercase `.mp4`** on disk); wavy/curly unchanged extensions (**`.JPG`**, **`.MP4`**, **`.mov`** as files are named).

---

## 2026-03-30 — Bundles PDP: fix wavy VIDEO src (wrong filename)

**Context:** User reported **wavy bundle video** not loading.

**Cause:** **`BUNDLE_VIDEO_BY_TEXTURE.wavy`** pointed to **`/assets/wavy-bundle-product.MP4`**; repo file is **`public/assets/wavy-bundle-video.MP4`** (matches **straight-bundle-video** / **curly-bundle-video** naming).

**Changes:** **`texture-category-product/page.tsx`** — **`wavy: '/assets/wavy-bundle-video.MP4'`**; comment updated.

---

## 2026-03-30 — BCF PDP: shift title → Klarna block up 50px

**Context:** User asked to move **only** the **BUNDLES/CLOSURES/FRONTALS** title, **red RAW HUMAN HAIR** line, **price**, **sales tax**, **stars**, and **Klarna** line **up 50px together** (not the hair options below).

**Changes:** **`texture-category-product/page.tsx`** — Wrapped that block in a **`div`** with **`transform: 'translateY(-50px)'`** when **`bcfUsesBundleStyleHero`**; **hair profile** section and below unchanged.

---

## 2026-03-30 — BCF PDP: −20px above product name, −30px above hair profile

**Context:** User asked to **reduce spacing above** the **BUNDLES/CLOSURES/FRONTALS** product name by **20px**, and **reduce spacing above** **hair profile** by **30px**.

**Changes:** **`texture-category-product/page.tsx`**
- **`BUNDLE_COPY_MARGIN_TOP_PX`**: subtract **20** more from the prior formula (**`−60` → `−80`** after **`round(100 × BUNDLE_HERO_LAYOUT_SCALE)`**).
- **Hair profile** wrapper **`div`**: **`marginTop: '-30px'`** when **`bcfUsesBundleStyleHero`**.

---

## 2026-03-30 — BCF PDP: −10px more above title, −4px more above hair profile

**Context:** User asked to **reduce spacing above** the **BUNDLES/CLOSURES/FRONTALS** name by **10px** and above **hair profile** by **4px** (on top of prior tweaks).

**Changes:** **`texture-category-product/page.tsx`** — **`BUNDLE_COPY_MARGIN_TOP_PX`**: **`−80` → `−90`**; hair profile wrapper **`marginTop`**: **`−30px` → `−34px`** when **`bcfUsesBundleStyleHero`**.

---

## 2026-03-30 — BCF PDP: +10px above product name

**Context:** User asked to **increase spacing above** the **BUNDLES/CLOSURES/FRONTALS** product name by **10px**.

**Changes:** **`texture-category-product/page.tsx`** — **`BUNDLE_COPY_MARGIN_TOP_PX`**: **`−90` → `−80`** (larger **`marginTop`** value by **10px**).

---

## 2026-03-30 — BCF PDP: SIMILAR strip spacing + Noir 2D thumb sizing

**Context:** User wanted **spacing between ADD TO BAG and SIMILAR PRODUCTS** to match **Noir** (**CUSTOMIZE** row **`marginTop` 10px + button + SIMILAR **`marginTop` 20px**), and **similar-product images** to match **Noir 2D** marble strip thumbs.

**Changes:** **`texture-category-product/page.tsx`**
- **`BCF_SIMILAR_STRIP_MARGIN_TOP_PX`** = **10 + 40 + 20** (**70px**); SIMILAR outer wrapper: Noir-style **`marginLeft/Right` −16px**, **`width: calc(100% + 32px)`**, **`minWidth/maxWidth`** like Noir; inner card **`minWidth/maxWidth`** full width.
- SIMILAR cells: **`marbleStripCellBand(false)`**, **`marbleStripThumbWrap(false)`**, **`marbleStripThumbImg(false)`**, **`marbleStripTextColStrip(false)`**, **`marbleStripStarsRowStyle(false)`**; copy typography aligned with **`noir/page.tsx`** similar strip; removed BCF-only **`translateX(10px)`** / PDP display-scale transforms on those thumbs.
- Dropped unused **`isShopTextureCurlyFrontals`** import.

---

## 2026-03-30 — PDP tab label: CARE + STORAGE → CARE/STORAGE (uppercase)

**Context:** User replaced the details-area tab **CARE + STORAGE** with a slash form on **BCF** (`texture-category-product`) and all **six unit PDPs** (Noir, Blanco, Soft Wave, Beach Wave, Soft Curl, Ocean Curl), then asked for **uppercase** to match brand guidelines.

**Decisions / outcomes:** Tab id and visible label use **`CARE/STORAGE`** (all caps, slash separator).

**Changes:** **`texture-category-product/page.tsx`** — **`BcfProductTab`**, **`BCF_PRODUCT_TAB_ORDER`**, and **`activeTab === 'CARE/STORAGE'`** branch. **`noir/page.tsx`**, **`blanco/page.tsx`**, **`wavy/soft-wave/page.tsx`**, **`wavy/beach-wave/page.tsx`**, **`curly/soft-curl/page.tsx`**, **`curly/ocean-curl/page.tsx`** — **`handleTabClick`**, **`activeTab`** checks, and button text set to **`CARE/STORAGE`**.

---

## 2026-03-30 — BCF closures/frontals: keep VIDEO when switching texture thumbs

**Context:** On BCF PDP, **VIDEO** mode jumped back to **PHOTO** when tapping through **texture thumbnail** videos (URL texture changes).

**Cause:** **`useEffect`** called **`setBcfCfShowVideo(false)`** on **`[texture, category]`**, so every thumb navigation reset video mode.

**Changes:** **`texture-category-product/page.tsx`** — same reset only on **`category`** (closures vs frontals), not on **`texture`**, with a short comment explaining why.

---

## 2026-03-30 — BCF PDP: tighter RAW / price vertical rhythm

**Context:** User asked to **reduce spacing above and below the price** by **2px** each, and **reduce spacing above RAW HUMAN HAIR** by **1px**.

**Changes:** **`texture-category-product/page.tsx`** — **`meta.subline`**: **`marginTop` −2px → −3px**, **`marginBottom` 6px → 4px** (tighter to title + to price). Price **`<p>`**: dropped **`mb-1`**, **`marginTop: 0`**, **`marginBottom: '2px'`** (was ~4px from **`mb-1`**).

---

## 2026-03-30 — BCF PDP: hair color chips like build-a-wig color `ThumbBox`

**Context:** User wanted **color names** on the **bottom** of each chip (like **build-a-wig color**), not floating mid-layout, and **donuts vertically centered** in the space above the label.

**Changes:** **`texture-category-product/page.tsx`** — Each hair color **`button`**: **`60×80px`** (same footprint as **`ThumbBox`** **`containerSize` 60 + label band); **`flex` column** with **`flex: 1`** swatch wrapper **`alignItems/justifyContent: center`** for **`BcfColorSwatchDonut`**; label **`span`** **`flexShrink: 0`** on bottom row (no **`marginTop`** in the middle). Tight **`padding`**; removed fixed **`38px`** swatch box.

---

## 2026-03-30 — Cart dropdown: BCF thumb 50% + title without texture

**Context:** User wanted **BCF** (`shop-texture-category`) line items in the **cart dropdown only**: **thumbnail 50% smaller** than normal (half of **88px**), and **product title** only **BUNDLES** / **CLOSURES** / **FRONTALS** (no **STRAIGHT/WAVY/CURLY** in the script title) because the **red** subtitle carries texture.

**Changes:** **`CartDropdown.tsx`** — **`cartThumbBoxPx`** **44** for **`type === 'shop-texture-category'`**; title uses **`category`** (fallback: **`name`** before **`·`**); red line for BCF: **`{length} RAW {STRAIGHT|WAVY|CURLY} {hairOrigin}`** using **`texture`** + **`hairOrigin`** from the cart line (fixes prior default **CAMBODIAN** from **`getHairOrigin(item.name)`**).

---

## 2026-03-30 — BCF PDP: Noir-sized title / spec / price; tighter gap above price

**Context:** User asked **−2px spacing above the price only** on BCF, and to **match Noir** product name / red spec / **price** **font sizes**.

**Prior BCF vs Noir:** BCF used **32px** title, **12px** red, **16px** price; Noir uses **50px**, **10px** (`Futura PT` stack), **21px** (`Futura PT Medium`).

**Changes:**
- **`texture-category-product/page.tsx`** — **`meta.subline`**: **`marginBottom` 4px → 2px** (−2px above price). Red line: **`fontSize` 10px**, **`fontFamily`** **`"Futura PT", futuristic-pt, …`**. Price: **`fontSize` 21px**, **`futuristic-pt`** on **`Futura PT Medium`**. Title inline: **`50px` / `1.2`** when **`bcfUsesBundleStyleHero`**, else **`38px`** (gift-card path).
- **`index.css`** — **`.bcf-bundles-pdp-product-name`**: **50px**, **`line-height` 1.2** (was 32 / 1.15).

---

## 2026-03-30 — BCF hero: stable slot + posters + prefetch (no thumb jump / white flash)

**Context:** Tapping **BCF** texture thumbs showed a **white gap**, then content loaded and **thumbnails moved up**. User also asked why media didn’t feel **instant** after already loading once.

**Causes:** Closures/frontals used **`BUNDLE_HERO_MEDIA_MIN_HEIGHT_PX`** (~162px) while real hero JPG/video is much taller → **layout grew** when media decoded. **`<video>`** remounted per texture with **no `poster`** → blank until first frame. No **warm cache** for other textures’ assets.

**Changes:** **`texture-category-product/page.tsx`**
- **`BUNDLE_PDP_CF_HERO_MEDIA_SLOT_HEIGHT_PX`** = **`BUNDLE_PDP_CF_COLUMN_MAX_WIDTH_PX × 1.5`**; **`bcfHeroMediaSlotHeightPx`** (bundles = existing bundles slot height).
- Hero wrapper: fixed **`minHeight` + `height`** = slot px; light **`#f5f5f5`** background; **`img`/`video`**: **`maxHeight: '100%'`**, **`width/height: auto`**, **`objectFit: contain`**.
- **Videos:** **`poster`** = matching product JPG; **`preload="auto"`**.
- **`useEffect([category])`:** prefetch all three textures’ hero photos (**`Image`**) and videos (**hidden `video.load()`**) for that BCF category.

---

## 2026-03-30 — BCF PDP: tighter RAW + price vertical rhythm (−2px)

**Context:** User asked to **reduce spacing above and below the price** by **2px** each, and **reduce spacing above** the red **RAW** line by **2px**.

**Changes:** **`texture-category-product/page.tsx`** — **`meta.subline`**: **`marginTop` −3px → −5px**, **`marginBottom` 2px → 0**, dropped stray **`mb-2`** class. Price **`<p>`**: **`marginBottom` 2px → 0**.

---

## 2026-03-30 — BCF hero: PHOTO/VIDEO in slot + clip overflow (thumbs overlap fix)

**Context:** User reported **PHOTO/VIDEO** felt removed, **hero moved up**, and **three texture thumbs overlapped** the main hero.

**Causes:** **PHOTO/VIDEO** sat in a **separate** row with **only absolutely positioned** children (unstable layout). **Bundles** hero media still used **`width: 100%` + `height: auto`**, so it could **overflow** the fixed slot and paint **over** the thumb row.

**Changes:** **`texture-category-product/page.tsx`**
- Moved **PHOTO/VIDEO** toggle **inside** **`.product-wig-preview-images`** (**`position: absolute`**, **`top`/`right`**, **`zIndex: 2`**).
- Hero slot: **`overflow: 'hidden'`** so media stays in the slot.
- **Bundles** video/img: **`maxHeight: '100%'`**, **`poster`** + **`preload="auto"`** on video.

---

## 2026-03-30 — BCF hair color chips: 7px label nudge + ThumbBox-style swatch anchor

**Context:** User asked for color **name** **`translateY(7px)`** (3px lower than **4px**) and **donuts vertically aligned** like they sit correctly in the **60×80** square.

**Cause:** Flex **`flex: 1`** + **`alignItems: center`** centers the swatch only in the **upper band** above the label, not at the same **55%** vertical anchor as **`ThumbBox`** color (`top: 55%` + **`translateY(-50%)`**).

**Changes:** **`texture-category-product/page.tsx`** — Chip **`button`**: **`position: relative`**; swatch wrapper **`position: absolute`**, **`left: 50%`**, **`top: 55%`**, **`transform: translate(-50%, -50%)`** (35×35 cell, **`pointerEvents: 'none'`**); label **`position: absolute`**, **`bottom: 1px`**, **`transform: translateX(-50%) translateY(7px)`**; removed **`flex flex-col`** / flex-row swatch stack.

---

## 2026-03-30 — BCF hero: PHOTO/VIDEO row restored + no gray hero gutters

**Context:** User said **PHOTO/VIDEO** was **overlapped** by the main hero and should sit in its **previous position**; remove **left/right “borders”** on BCF hero images.

**Changes:** **`texture-category-product/page.tsx`** — **PHOTO/VIDEO** moved back to the **dedicated row above** the hero (same **`minHeight` + absolute right** pattern as before). Hero **`.product-wig-preview-images`** keeps **`overflow: 'hidden'`** and fixed slot height; removed **`backgroundColor: '#f5f5f5'`** (that fill read as side gutters next to **`object-fit: contain`** media).

---

## 2026-03-30 — BCF main hero ~30% wider

**Context:** User wanted the **BCF** main hero **~30% bigger** so **narrow portrait** images fill more horizontal space (**fewer L/R gaps**).

**Changes:** **`texture-category-product/page.tsx`** — **`BCF_MAIN_HERO_WIDTH_SCALE = 1.3`** applied inside **`bundlePdpHeroMaxWidthPx`** (rounded). Propagates to **column `maxWidth`**, **bundles/CF hero `maxWidth`**, and **slot heights** (**`× 1.5`**) so layout stays consistent. Texture thumbs unchanged.

---

## 2026-03-30 — BCF PHOTO/VIDEO toggle aligned to hero image right (+2px)

**Context:** After scaling the BCF hero, **PHOTO/VIDEO** still used the old **`right: calc(clamp…)`**; user wanted it **2px left of the hero image’s right edge**.

**Changes:** **`texture-category-product/page.tsx`** — **`bcfPhotoVideoToggleRightPx`**: **`round((columnW − heroMaxW) / 2 + 2)`** where **`columnW`** is bundles vs CF column max width and **`heroMaxW`** is **`bundlePdpHeroMaxWidthPx(texture)`** (bundles: same as column). Toggle **`right: `${bcfPhotoVideoToggleRightPx}px`**.

**Follow-up:** User asked to move **PHOTO/VIDEO** **6px further left** → formula uses **`+ 8`** instead of **`+ 2`** (fallback **`8`**). **Another 6px left** → **`+ 14`**, fallback **`14`**. **+2px left** on all BCF → **`+ 16`**, fallback **`16`**.

**Bundles = CF alignment:** **Bundles** now uses **`BUNDLE_PDP_CF_COLUMN_MAX_WIDTH_PX`**, **`bundlePdpHeroMaxWidthPx(texture)`** on hero media, **`BUNDLE_PDP_CF_HERO_MEDIA_SLOT_HEIGHT_PX`**, and **`bcfShowHeroVideo`** like **closures/frontals**.

**PHOTO/VIDEO position:** Toggle row sits in a **`maxWidth: bundlePdpHeroMaxWidthPx(texture)`** strip (**`margin: 0 auto`**), same width box as the hero image — **`right: BCF_PHOTO_VIDEO_TOGGLE_RIGHT_PX` (16)** — not **`(columnW − heroM) / 2`**, which misaligned **bundles** vs **closures** when measuring from the full column.

---

## 2026-03-30 — BCF hero video: no white flash (poster underlay + fade-in)

**Context:** **VIDEO** on BCF showed **white** until the file buffered; **PHOTO** felt instant when switching textures.

**Changes:** **`texture-category-product/page.tsx`** — For bundles + CF hero **`<video>`**: wrap in a **relative** container; **`<img>`** underlay (same JPG as **`poster`**, **`position: absolute`**, centered); video **`opacity: 0`** until **`onLoadedData` / `onCanPlay`** (and **`useLayoutEffect`** if **`readyState >= HAVE_CURRENT_DATA`** for cache). Short **`opacity`** transition. **`useLayoutEffect`** replaces a separate reset **`useEffect`** so a cached ready state isn’t cleared after promote.

---

## 2026-03-30 — BCF chip label 6px + noir color upcharge $80

**Context:** User wanted hair color chip label **`translateY(6px)`** (was **7px**). BCF **premium hair colors** should add **$80** (was **$100** in **`BCF_COLOR_OPTIONS`**; build-a-wig color page still uses **$100** for custom wigs).

**Changes:** **`texture-category-product/page.tsx`** — label **`translateY(6px)`**. **`bcfProductOptions.ts`** — all noir palette entries with **`price: 100, swatch`** → **`80`** (**JET BLACK** through **CITRINE**). Russian Blanco trio (**GOLDEN** / **PLATINUM** / **ASH**) unchanged (**−20** / **0** / **20**).

---

## 2026-03-30 — BCF hero texture thumbs: tighter white mat (4px/side)

**Context:** User wanted the **white inset** around the **three** hero **`ThumbBox`** thumbs to be **4px** per side instead of **~7px** (was **`inner + round(10 × BUNDLE_HERO_LAYOUT_SCALE)`** ≈ **14px** total width/height → **7px** each side at scale **1.35**).

**Changes:** **`texture-category-product/page.tsx`** — **`BUNDLE_THUMB_OUTER_W_PX` / `BUNDLE_THUMB_OUTER_H_PX`**: **`inner + 8`** (**4px** mat left/right/top/bottom when centered).

---

## 2026-03-30 — BCF hero texture thumbs: white mat 6px/side

**Context:** User wanted **6px** mat per side instead of **4px**.

**Changes:** **`texture-category-product/page.tsx`** — **`BUNDLE_THUMB_OUTER_*`**: **`inner + 12`** (was **`inner + 8`**).

---

## 2026-03-30 — BCF curly: product copy same vertical position as straight/wavy

**Context:** User said **curly** **PHOTO/VIDEO** made **product text** shift **up** vs **straight/wavy**.

**Cause:** **`texture-category-product/page.tsx`** wrapped the title stack in **`shop-bcf-curly-product-copy-lift`** for **`texture === 'curly'`** only; **`index.css`** applies **`top: -5.5px`** on that class.

**Changes:** Removed curly-only class from BCF PDP copy wrapper. **`index.css`** comment updated: class remains for **`/home/shop`** grid curly row (**`products/page.tsx`**).

---

## 2026-03-30 — BCF curly title shift: hero slot width + curly class (follow-up)

**Context:** User said **curly** product text still moved **up** vs **straight/wavy**; suspected **options/padding** below.

**Causes found:**
1. **`shop-bcf-curly-product-copy-lift`** was still on the copy wrapper (**`top: -5.5px`**) — removed again.
2. **`.product-wig-preview-images`** used **`width: bundlePdpHeroMaxWidthPx(texture)`** — **curly** uses a **larger** `shopTextureCategoryProductPageDisplayScale` than straight/wavy, so the **hero slot box** was **wider** on curly, changing flex layout and shifting **thumbs + title** stack.

**Changes:** **`texture-category-product/page.tsx`** — hero slot **`width: '100%'`** (keep **`maxWidth: '100%'`**); **img/video** still use **`maxWidth: bundlePdpHeroMaxWidthPx(texture)`** so assets size correctly inside a **fixed-height, full-width** slot.

---

## 2026-03-30 — BCF hair color chip height −4px

**Context:** User wanted BCF PDP hair color chip squares **4px shorter** so there is less empty space above and below the color swatch donuts.

**Changes:** **`texture-category-product/page.tsx`** — hair color option **`button`** **`height: '80px'`** → **`'76px'`** (**60px** width, border, padding, **55%** swatch anchor, and label styles unchanged).

---

## 2026-03-30 — BCF PDP: fix adjacent JSX / missing `</div>` in hero

**Context:** Vite/Babel error **“Adjacent JSX elements must be wrapped”** at **`texture-category-product/page.tsx`** ~1758 (add-to-bag block); **`tsc`** also reported **`JSX element 'div' has no corresponding closing tag`**, **`JSX expressions must have one parent element`** at the hero (~901), and **`Unexpected token`** at **`) : null}`** (~1271).

**Cause:** In the **`bcfUsesBundleStyleHero`** hero block, the **`inline-flex`** column (**~934**) was never closed after the texture **`ThumbBox`** row. Only two **`</div>`** followed the thumbs instead of three (**inline-flex**, **column wrapper ~920**, **`product-wig-preview` ~901**), so the ternary’s first branch was structurally invalid and everything below parsed as siblings.

**Changes:** **`texture-category-product/page.tsx`** — after the thumbs **`</div>`**, added one **`</div>`** so the stack closes **inline-flex → column → `product-wig-preview`** before **`) : null}`**.

---

## 2026-03-30 — BCF hair color chip height 65px

**Context:** User asked to set BCF PDP hair color chip **`button`** height to **`65px`** instead of **`76px`** (previously reduced from **80px**).

**Changes:** **`texture-category-product/page.tsx`** — **`height: '65px'`** on the hair color chips.

---

## 2026-03-30 — Cart dropdown: BCF raw line, thumbs; booking badges + titles

**Context:** User wanted **BCF** cart dropdown red subtitle without **STRAIGHT/WAVY/CURLY**; **BCF thumbnails** not clipped (**full** asset in the thumb slot); **booking** cart copy without **PREMIUM/STANDARD** in titles (subtitle stays install/consult lines only); **appointment/consult** badge **4px** right and **horizontally centered** in the same **88px** column as unit mannequin thumbs.

**Decisions / outcomes:** BCF red line = **`{length} RAW {origin}`** only. BCF thumbs use **88px** + **`object-contain`**. New booking cart items use plain **`WIG INSTALLATION`** / **`WIG CONSULT`** (tier still in **`bookingTier`** for badge PNG). Cart dropdown booking: **88×88** hit area, **66px** badge **`object-contain`**, wrapper **`translateX(4px)`**, centered in the **88px** box.

**Changes:** **`CartDropdown.tsx`** — BCF subtitle + **`object-contain`** at **88px**; booking thumb layout; title strip for legacy **`(PREMIUM)`/`(STANDARD)`**. **`booking/appointment/page.tsx`** & **`booking/consultation/page.tsx`** — cart **`name`** no longer includes premium suffix. **`shopping-bag/page.tsx`** — BCF subtitle + **`object-contain`**; strip tier suffixes from displayed titles for old rows.

---

## 2026-03-30 — Cart dropdown: booking badge 2px left + BCF thumb vertical center

**Context:** User follow-up after prior cart dropdown booking/BCF work.

**Changes:** **`CartDropdown.tsx`** — appointment/consult badge inner wrapper **`translateX(2px)`** (was **4px**, **2px further left**). **BCF** (`shop-texture-category`): thumbnail column **`alignSelf: 'center'`**; inner flex wrapper **`transform: 'none'`** instead of **`translateY(-8px)`** so thumbnails sit **vertically centered** in the gray bordered row.

---

## 2026-03-30 — Cart dropdown: BCF thumbnails 15% smaller

**Context:** User wanted **BCF** (`shop-texture-category`) cart dropdown thumbnails **15% smaller** than the **88px** unit thumb size.

**Changes:** **`CartDropdown.tsx`** — **`bcfCartThumbPx = Math.round(unitThumbPx * 0.85)`** (**75px**); **`cartThumbBoxPx`** uses it for **BCF** only (units stay **88px**).

---

## 2026-03-30 — BCF hero PHOTO aligned with VIDEO (same flex wrapper)

**Context:** User said **PHOTO** hero on BCF sat **further left** than **VIDEO**; they should match.

**Cause:** **VIDEO** mode wraps poster + **`<video>`** in a **full slot** **`display: flex`**, **`justifyContent/alignItems: center`**, **`width/height: 100%`**, and the video uses **`position: relative`** + same **`maxWidth`/`maxHeight`** as photo. **PHOTO** mode used a bare **`<img>`** as the direct child of **`.product-wig-preview-images`**, so horizontal centering differed.

**Changes:** **`texture-category-product/page.tsx`** — **bundles** and **closures/frontals** photo-only branches: wrap the hero **`<img>`** in the **same inner flex wrapper** as the video branch; **`img`** styles mirror the **`<video>`** ( **`position: relative`**, **`marginLeft`/`marginRight: auto`**, etc.). **CF** curly **`translateY`** nudge unchanged on the photo **`img`**.

---

## 2026-03-30 — BCF hair color swatch vertically centered in chip

**Context:** After shortening hair color chip height (**`65px`**), the color donut looked **vertically off-center** in the box.

**Changes:** **`texture-category-product/page.tsx`** — swatch wrapper **`top: '55%'`** → **`'50%'`** (keeps **`translate(-50%, -50%)`**); comment updated. Bottom label positioning unchanged.

---

## 2026-03-30 — Cart dropdown: booking thumbs vertically centered in gray row

**Context:** User wanted **appointment/consult** cart dropdown thumbnails **vertically centered** in the gray bordered line (same idea as **BCF**).

**Changes:** **`CartDropdown.tsx`** — for **`isBookingCartThumb`**: thumbnail column **`alignSelf: 'center'`**; inner stack **`transform: 'none'`** (no **`translateY(-8px)`**), matching **BCF** behavior.

---

## 2026-03-30 — BCF PHOTO/VIDEO toggle: no horizontal jump on mode switch

**Context:** Toggling **VIDEO → PHOTO** (and back) moved the **PHOTO/VIDEO** label ~**3px** horizontally even though **`right`** is fixed.

**Cause:** Toggle is **`position: absolute; right: …`**, so its width tracks content. Swapping **Futura PT Book** vs **Medium** on **PHOTO** / **VIDEO** changes glyph widths, so the box width changes and the **left** edge shifts while the **right** stays pinned.

**Changes:** **`texture-category-product/page.tsx`** — **PHOTO** and **VIDEO** spans: **`display: 'inline-block'`**, **`width: '3.35em'`** ( **`11px`** font size), **`textAlign: 'center'`** so both states use the same advance width.

---

## 2026-03-30 — BCF PHOTO/VIDEO toggle: hero strip width pinned (mode shift root cause)

**Context:** User said **something else** still moved **PHOTO/VIDEO** left in **photo** vs **video**; fixed **em** widths on labels were not enough.

**Cause:** Inner hero wrapper used **`display: inline-flex`** with **shrink-to-fit** width. **`<img>`** vs **`<video>`** contribute different **intrinsic min widths**, so the strip’s used width changed between modes. Toggle stays **`right: 16px`** from that strip, but the **whole strip** re-centered in the card → apparent horizontal jump.

**Changes:** **`texture-category-product/page.tsx`** — replace **`inline-flex`** with **`flex`**; set **`width: '100%'`**, **`maxWidth: `${bundlePdpHeroMaxWidthPx(texture)}px`**, **`marginLeft`/`marginRight: auto`** on that inner column so strip width always matches the **same** cap as hero media, independent of photo vs video. Prior **`3.35em`** label slots kept.

---

## 2026-03-30 — Booking: consults open to standard; appointments premium-only (clarify + modal fix)

**Context:** User confirmed **standard members can still book consults**; only **installs / hair appointments** are premium-gated.

**Changes:** **`appointment/page.tsx`** — Comments; upgrade modal copy notes consults stay available from shop menu; **`ConfirmationModal`** moved **outside** **`BookingFlowLayout`** (sibling **`<>…</>`**) so it does not render inside the frosted card. Removed admin-calendar **`BookingMutedNote`**; **`belowCard`** width matches in-card column (no extra **`px-5`**). **`consultation/page.tsx`** — File comment that consult is not gated like appointment; same **`belowCard`** width tweak.

---

## 2026-03-30 — Shopping bag: BCF + booking rows match cart dropdown

**Context:** User wanted **shopping bag** (cart + saved-for-later lines) aligned with **cart dropdown** for **BCF** and **appointment/consult** thumbs and text.

**Changes:** **`shopping-bag/page.tsx`** — Module helpers: thumb constants (**`BAG_BCF_THUMB_PX`** = **`round(88×0.85×1.05)`**, gift **108**, booking badge **66** in **88** slot), **`bagProductTitleLine`**, **`bagProductRedSubtitle`** (incl. **`BOOKING DEPOSIT`** fallback), **`bagHairOriginForProductName`** (matches cart dropdown, e.g. **BLANCO** → **RUSSIAN**). **`ShoppingBagLineThumb`**: booking **translateX(2px)** + **66** badge, BCF **translateX(4px)** + **`object-contain`**, vertical center for booking/BCF, **translateY(-8px)** for units/gift. Both item maps use shared thumb + title + red line.

---

## 2026-03-30 — Cart dropdown: show QTY for booking lines again

**Context:** User asked to **keep** **`QTY:`** for appointment/consult rows in the cart dropdown (revert hiding it).

**Changes:** **`CartDropdown.tsx`** — **`QTY: {quantity}`** always shown for all line types, including **`booking-consult`** / **`booking-appointment`**.

---

## 2026-03-30 — BCF PHOTO/VIDEO toggle 2px left

**Context:** User wanted BCF **PHOTO/VIDEO** label **2px further left**.

**Changes:** **`BCF_PHOTO_VIDEO_TOGGLE_RIGHT_PX`** **16 → 18** in **`texture-category-product/page.tsx`** (**`right`** on abs toggle). **`index.css`** **`.bcf-hero-photo-video-toggle`** **`right: 18px !important`** (kept in sync).

---

## 2026-03-30 — BCF PDP: +2px below sales tax line

**Context:** User wanted **2px** extra space below **(EXCLUDING SALES TAX)** on **BCF** only.

**Changes:** **`texture-category-product/page.tsx`** — removed **`mb-1`** on that **`<p>`**; **`marginBottom: 'calc(0.25rem + 2px)'`** (prior **`mb-1`** gap **+ 2px**). Only this BCF PDP file; unit PDPs unchanged.

---

## 2026-03-30 — Booking titles BOOKING/CONSULT; bag hides qty for booking only

**Context:** User wanted black product title in cart dropdown always **BOOKING** (appointments) and **CONSULT** (consults); red line + badge carry detail. Shopping bag should **not** show **+LIST** / **− qty +** / **SAVE FOR LATER** for booking lines (cart dropdown **keeps QTY**).

**Changes:** **`CartDropdown.tsx`** — **`booking-consult`** title fixed **`CONSULT`** (was derived from **`name`**). **`shopping-bag/page.tsx`** — **`bagProductTitleLine`**: consult **`CONSULT`**. **Bag cart:** booking rows → **×** remove only (confirm modal). **Saved for later:** booking rows → hide **+LIST** and qty strip; **MOVE TO BAG** / **OUT OF STOCK** unchanged.

---

## 2026-03-30 — BCF PDP: remove qty above tabs; bundles-only BUNDLE DEAL

**Context:** User wanted the **quantity counter removed** above the details tabs on **BCF** PDPs (`texture-category-product`). On **bundles** only, add a **BUNDLE DEAL** button **below ADD TO BAG** that adds **3** of the current configuration at **$40 off** the combined list total (line subtotal = `3 × displayPrice − 40`, implemented via per-unit `price = subtotal / 3`).

**Topics covered:** Handoff from prior turn; implementation completed in this chat.

**Decisions / outcomes:** Regular **ADD TO BAG** always adds **quantity 1** (no quantity UI). **BUNDLE DEAL** only when `category === 'bundles'`; cart line includes **`bcfBundleDeal: true`** for optional future display/checkout. Tabs block spacing adjusted (removed paired `translateY` nudge used with the old quantity row).

**Changes:** **`src/pages/shop/texture-category-product/page.tsx`** — removed quantity state/UI and +/- handlers; **`handleAddToBag`** uses **`quantity: 1`**; **`handleBundleDealToBag`** + **`bundleDealState`** + conditional button; **`src/types/cart.ts`** — optional **`bcfBundleDeal?: boolean`** on **`CartItem`**.

**Conventions:** None.

---

## 2026-03-30 — Shopping bag: booking QTY above ×, 6px left

**Context:** User wanted **appointment/consult** rows on the **shopping bag** to show **QTY** text with the **×** remove control (like the cart dropdown), and to move that **QTY + ×** cluster **6px left** on the bag **only** (not dropdown). Prior bag behavior was × only for booking cart lines.

**Changes:** **`shopping-bag/page.tsx`** — active cart booking lines: **`QTY: {quantity}`** label above the × button (**`Futura PT Medium`**, **8px**, same stack as **`CartDropdown`**). Absolute column **`right`** **`8px` → `14px`** when **`isBookingLine`** (6px left). Non-booking lines stay **`right: 8px`**. Saved-for-later booking layout unchanged (**+LIST** / qty strip still hidden; **MOVE TO BAG** / **OUT OF STOCK** unchanged).

---

## 2026-03-30 — BCF BUNDLE DEAL: premium-only (same upgrade modal as colors)

**Context:** User wanted **BUNDLE DEAL** on bundles BCF PDP to apply only for **premium** members, with the same **upgrade** popup used when non-premium users pick a gated **color**.

**Decisions / outcomes:** Reuse **`showBcfColorUpgradeModal`**, **`handleBcfColorUpgradeConfirm`** / **`handleBcfColorUpgradeClose`**, and existing **`ConfirmationModal`** (**UPGRADE YOUR SUBSCRIPTION?** / premium message / **UPGRADE** → rewards). Non-premium taps **BUNDLE DEAL** → modal only; no cart change.

**Changes:** **`texture-category-product/page.tsx`** — at start of **`handleBundleDealToBag`**, after **`category === 'bundles'`** check, **`if (!isPremiumMemberForGatedFeatures()) { setShowBcfColorUpgradeModal(true); return; }`** (same helper as **`handleBcfColorSelect`**).

**Follow-up (same topic):** Gate had been missing from **`handleBundleDealToBag`** in tree (signed-out / non-premium could add deal). Re-applied the same **`isPremiumMemberForGatedFeatures()`** check + **`setShowBcfColorUpgradeModal(true)`** before **`setBundleDealState('adding')`**.

---

## 2026-03-30 — Internal: wig consult pricing vs deposit (no site copy change)

**Context:** User provided **internal** business context only — **not** to add this wording to the customer-facing site.

**Facts (for agents / future implementation):** Standalone **wig consult** is **$40** (not **$25**). **$25** is a **deposit** when paired with **wig + install**. **Wig-only** consult: **non-refundable** policy rationale (no guarantee of unit purchase). **No code or public copy updated** from this message.

---

## 2026-03-30 — Booking consult + appointment UI cleanup

**Context:** User wanted consult and appointment booking flows updated: no red **CONSULT** / **APPOINTMENT** label above tier badges; no gray rule above **TOTAL DUE** / **ESTIMATED TOTAL**; **ADD TO BAG** below the frosted main card (not inside); consult **ADDITIONAL NOTES:** with colon, no textarea placeholder; remove **(OPTIONAL)** from hair inspo; remove gray rules under **ADD TO YOUR APPOINTMENT**, **SERVICE TYPE**, **PREFERRED APPOINTMENT DATE**.

**Changes:** **`BookingFlowLayout.tsx`** — **`belowCard`** rendered **after** the bordered card **`</div>`** (still only when menu closed). **`BookingPageChrome.tsx`** — **`BookingCrumbTitle`**: optional **`children`** (badge-only when omitted); **`BookingSectionHeading`**: gray **`borderBottom` rule removed**; bottom margin **14px** on title. **`consultation/page.tsx`** — **`BookingCrumbTitle`** without title text; hair inspo label without optional; **`ADDITIONAL NOTES:`**; textarea **no** **`placeholder`**; total block **no** **`borderTop`**. **`appointment/page.tsx`** — crumb title only badge; estimated total **no** **`borderTop`**.

---

## 2026-03-30 — BCF PDP: 12px less space above details tabs

**Context:** User wanted **12px** less vertical gap above the **DETAILS** / **SHIPPING** / … tab row on BCF PDP.

**Changes:** **`texture-category-product/page.tsx`** — tabs wrapper **`mt-6` → `mt-3`** (default Tailwind **1.5rem → 0.75rem**, **−12px** at **16px** root); **`paddingTop: 4px`** unchanged.

---

## 2026-03-30 — BCF PDP: another 6px less above details tabs

**Context:** User wanted **6px** less again above the BCF details tabs (follow-up to prior **−12px** change).

**Changes:** **`texture-category-product/page.tsx`** — tabs wrapper **`mt-3` → `mt-1.5`** (**0.75rem → 0.375rem**, **−6px** at **16px** root).

---

## 2026-03-30 — BCF bundle deal: thumb, strikethrough list price, locked qty

**Context:** User wanted bundle-deal cart lines to use the **same bundle thumbnail** as regular BCF bundles (PDP hero assets), show **list price struck through** and **discounted line total** (like shipping discounts on checkout), and **lock quantity** (no ±) on bag — checkout order strip has no qty controls; bag enforces **qty 3** on load.

**Changes:** **`bcfProductOptions.ts`** — **`shopBcfCartLineThumbnailSrc`** (PDP JPG paths; prefers **`item.image`**), **`BCF_BUNDLE_DEAL_DISCOUNT_USD`**, **`bcfBundleDealResolvedListSubtotal`**. **`cart.ts`** — **`bcfBundleDealListSubtotal`**. **`texture-category-product`** — deal line sets **`bcfBundleDealListSubtotal`**. **`CartDropdown`**, **`shopping-bag`**, **`checkout`** — BCF thumb via helper; bundle-deal **strikethrough + line total**; bag **disabled** ± and quantity handlers no-op for **`bcfBundleDeal`**; **`loadCartItems` / `loadSavedForLater`** clamp deal qty to **3**.

---

## 2026-03-30 — Checkout + summary strip aligned with cart dropdown; “A/C” shorthand

**Context:** User wanted **checkout** and **checkout summary** (`/checkout/summary`) horizontal cart tiles to match **cart dropdown** typography/thumbnails for **BCF** and **A/C** (appointment + consult booking lines), replacing outdated large booking badge sizing and raw cart **`name`** titles.

**Decisions / terminology:** **A/C** = internal shorthand for **booking appointment** + **consult** lines (`booking-appointment`, `booking-consult`); use **BOOKING** / **CONSULT** titles and **66px** badge in **88px** slot with **+2px** nudge, same as dropdown. Documented in **`motherboard/CORE.md`**.

**Changes:** New **`src/utils/checkoutOrderStripDisplay.ts`** — **`orderStripThumbnailSrc`**, **`orderStripThumbMetrics`**, **`orderStripTitleLine`**, **`orderStripRedSubtitle`**, **`orderStripUseDigitalStackLayout`** (gift / membership digital stack only — not A/C or BCF). **`checkout/page.tsx`** and **`checkout/confirm/page.tsx`** — order strip uses util; **BCF** **+4px** nudge, **`object-contain`**; titles **BUNDLES** / **CLOSURES** / **FRONTALS** / **BOOKING** / **CONSULT**; red line matches bag/dropdown. Confirm: **`summaryScrollItemWidthPx`** uses **`orderStripThumbMetrics`**. **`bcfBundleDeal`** strikethrough price block added on summary strip to match checkout.

---

## 2026-03-30 — Bundle deal bag UI like A/C; auto-remove when not premium

**Context:** User wanted **BCF bundle-deal** cart rows to behave like **A/C** (booking) lines: **QTY** + **×** only (no ± / **+ LIST** / **SAVE FOR LATER** on the main bag row). When the client **stops being premium** (same gate as bundle PDP: **`isPremiumMemberForGatedFeatures`** — subscription and/or **BLACK** tier), bundle-deal lines should **disappear** from cart (and saved) automatically.

**Decisions:** Strip uses the **same** premium gate as **`handleBundleDealToBag`** on the BCF PDP. **`MOVE TO BAG`** does not re-add a saved bundle deal if the user is not premium. **Cart dropdown** already used QTY+× for all lines; added **no VIEW DETAILS** for **`bcfBundleDeal`** (aligned with booking). Order summary from **`location.state`** is unchanged (post-checkout snapshot).

**Changes:** **`premiumMemberAccess.ts`** — **`stripIneligibleBcfBundleDealLines`**, **`applyStripIneligibleBcfBundleDealsToStoredCart`**, **`applyStripIneligibleBcfBundleDealsToStoredSavedForLater`**, **`applyStripIneligibleBcfBundleDealsToAllStoredCarts`**. **`App.tsx`** — effect on mount + **`signInStateChanged`** + **`focus`**. **`shopping-bag/page.tsx`** — **`isQtyOnlyLine`** includes bundle deal; saved list **`isSavedQtyOnlyLine`**; strip on **`loadCartItems` / `loadSavedForLater`**. **`CartDropdown.tsx`** — strip on load + **VIEW DETAILS** spacer for bundle deal. **`checkout/page.tsx`** and **`checkout/confirm/page.tsx`** (localStorage path) — strip when loading cart. **`motherboard/CORE.md`** updated.

---

## 2026-03-30 — Bundle deal price: stacked in bag/dropdown, inline on checkout

**Context:** User wanted **BCF bundle-deal** strikethrough list price and deal total **stacked vertically** in **cart dropdown** and **shopping bag** (cart + saved) so prices do not wrap on one line; **checkout** and **checkout summary** order strips stay **inline** (strikethrough + deal price side by side).

**Changes:** **`CartDropdown.tsx`** — bundle-deal price block: **`flexDirection: 'column'`**, **`alignItems: 'center'`**, **`gap: 2px`**, **`whiteSpace: 'nowrap'`** on price spans. **`shopping-bag/page.tsx`** — same column stack with **`alignItems: 'flex-start'`** for main cart and saved bundle-deal rows. **`checkout/page.tsx`** and **`checkout/confirm/page.tsx`** — unchanged (inline **`marginRight: 6px`** on strikethrough).

---

## 2026-03-30 — Bundle deal cart thumb: `bundle-*.png` not `*-bundle-product.JPG`

**Context:** User wanted **BCF bundle-deal** line thumbnails in cart, bag, checkout strip, etc. to use **`bundle-straight.png` / `bundle-wavy.png` / `bundle-curly.png`** (same as **`shopTextureCategoryThumbSrc`**) instead of PDP hero assets **`straight-bundle-product.JPG`**, etc.

**Changes:** **`bcfProductOptions.ts`** — **`shopBcfCartLineThumbnailSrc`**: when **`bcfBundleDeal`** and **`category === 'bundles'`**, return **`shopTextureCategoryThumbSrc(texture, 'bundles')`** before considering **`item.image`**. Regular BCF bundle lines still prefer stored **`image`** then JPG fallbacks.

---

## 2026-03-31 — Checkout + summary: BCF/A/C title row + larger strip thumbs only there

**Context:** User wanted **BUNDLES** / **CLOSURES** / **FRONTALS** and **BOOKING** / **CONSULT** black title text on the **same horizontal row** as **NOIR** / **BLANCO** / etc. on **checkout** and **checkout summary** only, and **~20–40% larger** BCF + A/C thumbnails on those pages only to balance layout after aligning copy.

**Changes:** **`checkoutOrderStripDisplay.ts`** — optional **`OrderStripThumbOptions.checkoutStrip`** on **`orderStripThumbMetrics`**: BCF + booking **`imgPx`** × **`ORDER_STRIP_CHECKOUT_BCF_BOOKING_SCALE` (1.3)**; **`slotPx`** **`ORDER_STRIP_UNIT_IMG_SLOT_PX` (120)** so title block starts like **120×120** unit tiles; **`cellWidthPx`** widened as needed. **`orderStripTitleFontPx`**: BCF + booking always **21px** (same as Blanco path); Noir wig **22px**. **`checkout/page.tsx`** / **`confirm/page.tsx`** — pass **`{ checkoutStrip: true }`**; use **`orderStripTitleFontPx`**. **Confirm** — tile column **`justifyContent: flex-start`**, **`minHeight`/`height: auto`**; horizontal strip **`alignItems: flex-start`**; **`summaryScrollItemWidthPx`** uses checkout metrics + subscription flag for scroll math.

---

## 2026-03-31 — Appointment page: no checkboxes; price right; duration line without @ price

**Context:** User wanted **checkboxes removed** (add-ons had box **left**; **service type** had box **right**); **price** on the **right** of each row in **gray Futura PT Medium**, **vertically centered**; duration sublines **without** **`@ $…`** (e.g. **`+40 MINUTES`** only).

**Changes:** **`booking/appointment/page.tsx`** — **`INSTALL_BASE`** / **`ADDONS`** **`sub`** strings stripped of **` @ $…`**; **`ToggleRow`**: drop faux checkbox, **`alignItems: center`**, right column **`$price`** **`#808080`** **`bookingFontMedium`**; **service type** buttons same (no right checkbox, price right). Selection still via red border + tap.

---

## 2026-03-31 — Vercel `tsc`: BCF PDP null category, unused imports, `BookingCrumbTitle` children

**Context:** **`npm run build`** failed on Vercel: **`BookingCrumbTitle`** missing **`children`** (appointment + consultation); **`soft-curl`** unused **`bcfOptionSelectedChrome`**; **`texture-category-product`** unused **`Navigate`** / **`BUNDLE_HERO_MEDIA_MIN_HEIGHT_PX`**; **`Category | null`** passed where **`Category`** required (similar strip + texture nav).

**Changes:** **`texture-category-product/page.tsx`** — after hooks, **`if (!category) return <Navigate to="/home/shop" replace />`** ( **`Navigate`** used); removed unused **`BUNDLE_HERO_MEDIA_MIN_HEIGHT_PX`**. **`soft-curl/page.tsx`** — removed unused import. **`appointment/page.tsx`** / **`consultation/page.tsx`** — **`BookingCrumbTitle`** given explicit **`children={null}`**. **`checkout/page.tsx`** — removed unused **`itemName`** in order strip map.

---

## 2026-03-31 — BCF bundle cart thumbs: always `bundle-{texture}.png` + dropdown uses helper

**Context:** User wanted **bundle** and **bundle deal** line thumbnails to use **`bundle-straight` / `bundle-wavy` / `bundle-curly`** assets by **hair texture** everywhere: **shopping bag**, **cart dropdown**, **checkout**, **checkout summary**.

**Changes:** **`bcfProductOptions.ts`** — **`shopBcfCartLineThumbnailSrc`**: for **`category === 'bundles'`** always **`shopTextureCategoryThumbSrc(t, 'bundles')`** (no **`item.image`** JPG first); removed unused **`BCF_CART_BUNDLE_IMG`**. **`CartDropdown.tsx`** — resolve BCF **`thumbSrc`** via **`shopBcfCartLineThumbnailSrc`** before unit/gift fallbacks. Bag + **`orderStripThumbnailSrc`** already called the helper — they pick up the change.

---

## 2026-03-31 — Premium gate: strip hair appointments + premium consult from cart; build-a-wig premium options modal

**Context:** User wanted the **same premium eligibility gate** as bundle deals applied to **hair appointments** in the cart when the user is no longer premium, and to **build-a-wig premium membership options** (lace through add-ons): standard members should get the **same upgrade modal** as elsewhere when tapping those options in customize/edit or when opening those sub-routes.

**Decisions:** **`isPremiumGatedCartLine`**: **`bcfBundleDeal`**, **`booking-appointment`** (all), **`booking-consult`** only when **`bookingTier === 'premium'`** — standard consult lines stay. **`stripIneligibleBcfBundleDealLines`** filters on **`isPremiumGatedCartLine`** (name kept for existing imports). **`MOVE TO BAG`** uses **`isPremiumGatedCartLine`** when not premium.

**Changes:** **`premiumMemberAccess.ts`** — **`isPremiumGatedCartLine`**, expanded strip. **`shopping-bag/page.tsx`** — move-to-bag guard. **`buildWigPremiumOptions.ts`** — category list. **`useBuildWigPremiumMembershipStepGate.tsx`** — modal on lace/texture/color/hairline/styling/addons URLs. **`build-a-wig/page.tsx`** — hub **`handleOptionSelect`** gate + **`ConfirmationModal`**. Sub-pages **lace, texture, color, hairline, styling, addons** — hook + render. **`motherboard/CORE.md`** cart/build-a-wig bullets updated.

---

## 2026-03-31 — Cart dropdown: bundle-deal price lines left-aligned with other rows

**Context:** User saw **bundle deal** strikethrough + deal price stacked vertically sitting **too far right** vs **CONSULT** / **BCF** single-line prices in the cart dropdown.

**Cause:** Bundle-deal block used **`alignItems: 'center'`** on a column flex; the rest of the copy column uses **`alignItems: 'flex-start'`** for title, subtitle, and default `<p>` prices.

**Changes:** **`CartDropdown.tsx`** — bundle-deal price container **`alignItems: 'flex-start'`** (shopping bag already used **`flex-start`**).

---

## 2026-03-31 — Booking: makeup $200, travel $1,200; consult $40; A/C add-to-bag spacing vs Noir

**Context:** User wanted **appointment** add-on prices: **makeup $200**, **travel $1,200**; **wig consult** deposit **$40** for both **WIG + INSTALL** and **WIG ONLY** (was **$25**); **spacing above** appointment + consult **add to bag** to match **Noir** (**2px** above button, less padding under the frosted card when **`belowCard`** is used).

**Changes:** **`booking/appointment/page.tsx`** — **`ADDONS`** makeup **200**, travel **1200**; **`belowCard`** wrapper **`paddingTop`** **8px → 2px**. **`booking/consultation/page.tsx`** — **`CONSULT_DEPOSIT_USD`** **25 → 40**; same **`paddingTop`** on **`belowCard`**. **`BookingFlowLayout.tsx`** — main card **`pb-8`** when no **`belowCard`**, **`pb-2`** when **`belowCard`** is set (tighter gap above the button).

---

## 2026-03-31 — Premium-path consult: modal + blocked add-to-bag (no URL hole)

**Context:** Close the gap where **`/booking/premium/consultation`** (or **`/consult`**) could add a **premium-tier** consult line without membership; align with **appointments** + cart strip.

**Changes:** **`booking/consultation/page.tsx`** — if **`isPremiumBooking`** and **`!isPremiumMemberForGatedFeatures()`**: **`useEffect`** opens upgrade **`ConfirmationModal`**; **`handleAddToBag`** returns early and opens modal; **`signInStateChanged`** / **`focus`** close modal when user becomes eligible. **`motherboard/CORE.md`** booking bullet updated. SHOP menu already sends non-premium users to **`/booking/consultation`** via **`bookingMenuUsesPremiumPaths()`**.

---

## 2026-03-30 — Build-a-wig premium upgrade modal copy matches BCF color gate

**Context:** User wanted the **premium build-a-wig** “upgrade subscription” popup to use the **same short body** as the **BCF hair-color** upgrade modal (**“YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE.”**) instead of the long parenthetical list (lace, texture, color, etc.).

**Changes:** **`src/pages/build-a-wig/page.tsx`** — hub **`ConfirmationModal`** **`message`** aligned with **`texture-category-product/page.tsx`** BCF color modal. **`src/hooks/useBuildWigPremiumMembershipStepGate.tsx`** — same **`message`** for direct navigation to premium steps.

---

## 2026-03-30 — BCF bundle deal discount $40 → $60

**Context:** User wanted the **bundles** bundle-deal discount to be **$60** instead of **$40** (cart strikethrough inference, checkout display, and PDP add-to-bag math).

**Changes:** **`src/utils/bcfProductOptions.ts`** — **`BCF_BUNDLE_DEAL_DISCOUNT_USD`** **40 → 60**; JSDoc for **`bcfBundleDealResolvedListSubtotal`**. **`texture-category-product/page.tsx`** — **`handleBundleDealToBag`** uses imported **`BCF_BUNDLE_DEAL_DISCOUNT_USD`** (removed duplicate local **`BUNDLE_DEAL_DISCOUNT_USD`**). **`src/types/cart.ts`** — **`bcfBundleDeal`** comment points at the shared constant.

---

## 2026-03-30 — Booking premium consult: fix JSX (fragment + imports + modal state)

**Context:** Vite/Babel errors on **`booking/consultation/page.tsx`**: unterminated JSX (stray **`</>`** without **`<>`**), then **adjacent JSX** (**`BookingFlowLayout`** + **`ConfirmationModal`**) without a wrapper; **`showPremiumConsultUpgradeModal`**, **`isPremiumMemberForGatedFeatures`**, and **`prepareMembershipUpgradeNavigation`** were referenced but not defined/imported.

**Changes:** Wrap return in **`<>...</>`** (same pattern as **`booking/appointment/page.tsx`**). Import **`isPremiumMemberForGatedFeatures`** and **`prepareMembershipUpgradeNavigation`**. Add **`useState`** for **`showPremiumConsultUpgradeModal`**. Remove unused **`useEffect`** import.

---

## 2026-03-30 — Supabase site analytics + admin Brand/Analytics tabs

**Context:** User chose **storing events in Supabase** (vs GA4-only) for anonymous + signed-in marketing analytics, surfaced on **Admin → Brand → ANALYTICS** and **Admin → Analytics**.

**Decisions:** Table **`site_analytics_events`** (visitor_id, optional user_email, event_type, platform, source, path, meta). **RLS enabled, no policies** — only service role via API. **POST `/api/analytics/event`** is public (validates social_click + platform/source); **GET `/api/admin/analytics`** aggregates + last 50 rows (admin JWT). Client: **`fsaVisitorId`** in localStorage via **`getOrCreateVisitorId()`**; **`recordSocialClick`** still updates localStorage then **`postAnalyticsEvent`**. Admin UI replaces summary with server data on success (including zero totals); **EXPORT ANALYTICS** downloads JSON.

**Changes:** **`supabase/migrations/20260330180000_site_analytics_events.sql`**. **`api/analytics/event.ts`**, **`api/admin/analytics.ts`** (Supabase queries). **`src/utils/analyticsVisitor.ts`**, **`src/utils/api.ts`** (**`postAnalyticsEvent`**, **`getAdminAnalytics`** type). **`src/utils/socialAnalytics.ts`**. **`src/pages/admin/brand/page.tsx`**, **`src/pages/admin/analytics/page.tsx`**. **`motherboard/CORE.md`** stack line.

**Deploy:** Run the new migration in Supabase SQL Editor; **`SUPABASE_SERVICE_ROLE_KEY`** required on Vercel for ingest + admin reads.

---

## 2026-03-30 — Booking appointment policy copy (unit purchase, lead time, clean lace)

**Context:** User wanted the **hair appointment** page policy paragraphs updated: require **unit** purchase before install, consult from shop menu unchanged in intent, **two months** lead time for new installs (constructed / customized / styled), **one week** for re-installs with **"CLEAN LACE"** add-on when applicable.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`policyLines`** three strings replaced with the new copy.

---

## 2026-03-30 — Booking appointment: section headings black, left, colons

**Context:** User wanted **ADD TO YOUR APPOINTMENT** and **APPOINTMENT DATE** (drop **PREFERRED**) styled like **SERVICE TYPE** (black, not red accent), **colons** on all three labels, and **left-aligned** instead of centered.

**Changes:** **`BookingSectionHeading`** in **`BookingPageChrome.tsx`** — optional **`align?: 'left' | 'center'`** (default **`center`**). **`appointment/page.tsx`** — **`ADD TO YOUR APPOINTMENT:`**, **`SERVICE TYPE:`**, **`APPOINTMENT DATE:`** with **`align="left"`**, **`accent`** removed from add-ons and date headings.

---

## 2026-03-30 — Appointment policy: “your unit” → “a unit”

**Context:** User wanted the first policy line to say **PURCHASE A UNIT** instead of **PURCHASE YOUR UNIT**.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — first **`policyLines`** string updated.

---

## 2026-03-30 — Booking appointment: CLEAN LACE add-on for RE-INSTALL only

**Context:** User wanted **CLEAN LACE** (**$40**, **+40 MINUTES**) in **ADD TO YOUR APPOINTMENT**, shown only when **RE-INSTALL** is selected, **above travel** and **below makeup**.

**Changes:** **`appointment/page.tsx`** — split add-ons into **`ADDONS_BASE`**, **`ADDON_CLEAN_LACE`**, **`ADDON_TRAVEL`**; **`appointmentAddonsForInstall`** inserts clean lace between makeup and travel for **`RE_INSTALL`** only. **`visibleAddons`** drives list, totals, subtitle, and cart **`bookingAddonIds`**. **`useEffect`** clears **`clean-lace`** from selection when switching to **NEW INSTALL**.

---

## 2026-03-30 — Cart dropdown: booking top = Noir; scroll shows ~2 lines only

**Context:** User wanted the cart dropdown on **A/C (booking)** pages to match **Noir** top offset, and the compact list scroll area should show **only the first two products** (no peek of a third) until the user scrolls.

**Changes:** **`CartDropdown.tsx`** — **`useDropdown2pxUp`** includes **`path.startsWith('/booking')`** so **`dropdownTop`** is **`86px`** (same as straight/wavy/curly product pages). Multi-item scroll **`maxHeight`** **`340px` → `284px`** (still bounded by **`calc(100vh - 230px)`**) so ~two compact rows fit before scroll.

---

## 2026-03-30 — Booking appointment: SERVICE TYPE first; APPOINTMENT DATE: black/left; add-to-bag addon list fix

**Context:** User wanted **APPOINTMENT DATE:** (no “preferred”) **black**, **left**, with **colon**; **SERVICE TYPE** block **above** **ADD TO YOUR APPOINTMENT**. **`handleScheduleToBag`** still referenced removed **`ADDONS`** array.

**Changes:** **`booking/appointment/page.tsx`** — reordered sections; **`BookingSectionHeading align="left"`** for **`APPOINTMENT DATE:`** (no **`accent`**). **`addonList`** uses **`appointmentAddonsForInstall(installKind)`**.

---

## 2026-03-30 — Booking appointment add-ons: clean lace first on re-install; brow + mink pricing

**Context:** User wanted **CLEAN LACE** **first** in the re-install add-on list (above **BRAIDS**); **mink lashes** **$20** / **+20 MINUTES**; **brow clean up** **$40** / **+40 MINUTES**.

**Changes:** **`appointment/page.tsx`** — **`appointmentAddonsForInstall(RE_INSTALL)`** returns **`[ADDON_CLEAN_LACE, ...ADDONS_BASE, ADDON_TRAVEL]`**. **`ADDONS_BASE`** brow + mink price/sub; **`ADDON_DURATION_MINUTES`** for **`brow-clean`** / **`mink-lashes`** aligned.

---

## 2026-03-30 — Hair appointment: confirm copy before estimated time; no rule above Memphis

**Context:** User wanted the **final time & date are confirmed…** line **above** the **estimated appointment time** line (near the date picker), and to **remove the gray rule** above **LOCATED IN MEMPHIS, TN.**

**Changes:** **`BookingCrumbTitle`** — optional **`hideRule`** (appointment uses it so no gray line under badge). **`appointment/page.tsx`** — two **`BookingMutedNote`** lines: confirm copy first, then **`ESTIMATED APPOINTMENT TIME: …`** only (removed duplicate final-time sentence from that line).

---

## 2026-03-30 — Hair appointment: expandable add-on & service-type detail lines

**Context:** User wanted each add-on and service-type row to **grow** when **selected** (add-on checked / install kind active), showing a **black Futura PT Book** detail paragraph **under the red duration line**; **collapse** when deselected. Shortened labels: **BROW CLEAN UP**, **MAKEUP**, **TRAVEL FEE** (removed parentheticals).

**Changes:** **`booking/appointment/page.tsx`** — **`ADDON_DETAIL_LINES`**, **`INSTALL_KIND_DETAIL_LINES`**; **`ToggleRow`** column layout + optional **`detailLine`**; service-type buttons same pattern; add-on duration subline uses **`bookingFontBook`** (red) to match install rows.

---

## 2026-03-30 — Hair appointment: SERVICE TYPE first; estimated time below calendar (red, two lines)

**Context:** User wanted **SERVICE TYPE** **before** **ADD TO YOUR APPOINTMENT**; **estimated appointment time** moved **below** the date picker; that copy **red** (not gray); **FINAL TIME CONFIRMED AFTER CHECKOUT.** on its **own line** under the estimated time line.

**Changes:** **`booking/appointment/page.tsx`** — section order; **`BrandExpiresDatePicker`** then a red **`bookingFontBook`** `<p>` with **`<br />`** between the two sentences; removed gray **`BookingMutedNote`** above the calendar for that block.

---

## 2026-03-30 — Calendar nav arrows borderless; no preferred-date heading; consult hideRule

**Context:** User wanted **no black borders** on the **red month ‹ ›** controls in **`BrandExpiresDatePicker`**; remove **PREFERRED APPOINTMENT DATE:** heading on hair appointment; remove **gray rule** under consult badge (**`BookingCrumbTitle`**) on consult page.

**Changes:** **`BrandExpiresDatePicker.tsx`** — prev/next **`border: none`**, transparent bg. **`booking/appointment/page.tsx`** — dropped **`BookingSectionHeading`** for preferred date. **`booking/consultation/page.tsx`** — **`BookingCrumbTitle`** **`hideRule`**.

---

## 2026-03-31 — Booking A/C: currency + thousands formatting (travel fee, totals)

**Context:** User reported travel add-on and other booking prices showing **`1200`** without a comma, and wanted **appointment + consult** and **BCF** display prices to follow the **currency selector** and **account** (per-user **`selectedCurrency`**).

**Changes:**
- **`src/utils/defaultCurrencyRates.ts`** — single **`DEFAULT_CURRENCY_RATES`** table (same as former inline **`CartDropdown`** block).
- **`src/utils/currencyFormat.ts`** — **`formatPriceUsdPlain`** (string output for React text, same math as **`formatPriceUsd`**).
- **`src/hooks/useSelectedCurrencyDisplay.ts`** — reads per-user **`selectedCurrency`**, listens **`currencyChanged`** / **`storage`** / **`signInStateChanged`**, exposes **`formatUsd(usd)`**.
- **`src/pages/booking/appointment/page.tsx`** — **`ToggleRow`**, install rows, **ESTIMATED TOTAL** use **`formatUsd`** (comma-separated + conversion + ISO code).
- **`src/pages/booking/consultation/page.tsx`** — **TOTAL DUE** uses **`formatUsd(CONSULT_DEPOSIT_USD)`**; hook import added.
- **`src/components/CartDropdown.tsx`** — imports **`DEFAULT_CURRENCY_RATES`**; **`stripIneligibleBcfBundleDealLines<CartItem>(...)`** so **`setCartItems`** / reduce types align.

**Conventions:** Cart and booking UIs should use **`DEFAULT_CURRENCY_RATES`** + **`formatPriceUsd` / `formatPriceUsdPlain`** + per-user currency key rather than raw **`$` + number** for list prices in USD.

---

## 2026-03-31 — Appointment: braids $60, duration estimate, inline date calendar

**Context:** User wanted **braids** at **$60** with red sub **+60 MINUTES**; **service-type** copy to reflect **2.5 h new install** vs **2 h re-install**; replace the **“same calendar as admin…”** note with **estimated appointment time** from selections; show the **calendar inline** on the card (no popup trigger).

**Changes:** **`appointment/page.tsx`** — braids **price 60**, sub **+60 MINUTES**; **`INSTALL_BASE`** subs **+2.5 HOURS** / **+2 HOURS**; **`INSTALL_BASE_MINUTES`** (150 / 120) + **`ADDON_DURATION_MINUTES`**; **`estimatedMinutes`** + **`formatEstimatedAppointmentTime`**; muted note shows estimate + checkout disclaimer; **`BrandExpiresDatePicker`** **`inline`**; **`PREFERRED APPOINTMENT DATE:`** left-aligned heading; cart **`bookingAddonIds`** uses **`visibleAddons`** (fixes undefined **`ADDONS`**). **`BrandExpiresDatePicker.tsx`** — optional **`inline`** prop renders the month grid in-flow (no trigger/portal); shared **`calendarInner`** for inline and modal modes.

---

## 2026-03-31 — Booking appointment: restore `estimatedMinutes` useMemo (runtime ReferenceError)

**Context:** Error screen **“can't find variable: estimatedminutes”** — JSX called **`formatEstimatedAppointmentTime(estimatedMinutes)`** without defining **`estimatedMinutes`** in the component.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — added **`estimatedMinutes`** **`useMemo`** (base **`INSTALL_BASE_MINUTES`** + selected **`ADDON_DURATION_MINUTES`**).

---

## 2026-03-31 — Server checkout quote API, PaymentIntent, webhook (partial hardening)

**Context:** User asked to implement or scaffold **server-side price resolution**, **quote API**, **checkout UI wired to quote**, **Stripe PaymentIntent from server totals**, **webhook writing orders**, and **USD settlement vs display FX**.

**Changes:**
- **`api/_lib/pricing/resolveQuote.ts`** — USD resolution for **`booking-appointment`**, **`booking-consult`**, simple **unit** names + cap surcharge; **BCF / gift / membership** marked unresolved with warnings.
- **`api/checkout/quote.ts`** — **`POST /api/checkout/quote`** (public).
- **`api/stripe/create-product-payment-intent.ts`** — **`POST /api/stripe/create-product-payment-intent`** (auth); **rejects** if not **`fullyResolved`**.
- **`api/_lib/recordProductOrderFromPaymentIntent.ts`** — webhook appends **`orders.active_orders`** JSON (idempotent on **`stripePaymentIntentId`**).
- **`api/stripe/webhook.ts`** — **`payment_intent.succeeded`** when **`metadata.purpose === 'product_order'`**.
- **`src/utils/checkoutQuote.ts`**, **`src/types/cart.ts`** (**`bookingInstallKind`**, **`bookingAddonIds`**), **`src/utils/api.ts`** (**`createProductPaymentIntent`**), **`src/pages/checkout/page.tsx`** (server quote row + warning).
- **`docs/CHECKOUT_SERVER_QUOTE.md`**, **`.env.example`** webhook events, **`motherboard/CORE.md`** API bullet.

**Conventions:** Settlement stays **USD** for PI; currency selector remains **display** until server FX + charge currency are added.

---

## 2026-03-30 — Hair appointment policy wrap; remove below-bag note; consult file picker matches order form

**Context:** User wanted the **“I will only re-install wigs…”** sentence on its **own line** after the new-clients sentence; **removed** the **FINAL TIME AND DATE ARE CONFIRMED…** **`BookingMutedNote`** under **Add to bag**; **HAIR INSPO / CHOOSE FILE** on consult to match **shop order-form** photo-ID control (white box, 36px row, 8px padding, 1.3px black border, gray chip styling, **Futura PT Book** 11px, **NO FILE SELECTED** 10px gray).

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`policyLines`** first item split into two strings; dropped **`BookingMutedNote`** after **`NoirStyleAddToBagButton`**. **`src/pages/booking/consultation/page.tsx`** — file row restyled to mirror order-form (solid **`#FFFFFF`**, **`36px`** hit target, **`#F5F5F5`** choose chip **`4px 8px`**, preview **`width: 100%`** block layout).

---

## 2026-03-31 — Booking consult: hero + body copy (60-day deposit, 72h follow-up)

**Context:** User replaced consult marketing copy with three paragraphs: **non-refundable deposit** redeemable within **60 days**; **complimentary consult** + **preferred appointment spot** / credits; **select WIG + INSTALL or WIG only**, notes + **clear inspo photo**, **72-hour** follow-up with checklist / price / deposit details.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`BookingHeroSubline`** + two **`BookingBodyParagraph`**s updated to that text; removed redundant **`BookingMutedNote`** under **Add to bag** and its import.

---

## 2026-03-31 — Calendar arrows +60%, policy gap −2px, HAIR INSPO no “(optional)”, cart scroll +28px

**Context:** User wanted larger appointment **month arrows** (~60%), **2px** less space above **“I will only re-install…”**, no gray **(OPTIONAL)** on consult **HAIR INSPO**, and a taller **cart** multi-item scroll so the **second item’s border** isn’t clipped.

**Changes:** **`BrandExpiresDatePicker.tsx`** — prev/next **`fontSize` 10→16** (+**`lineHeight: 1`**). **`appointment/page.tsx`** — policy line index **1** **`marginTop: '-2px'`**. **`consultation/page.tsx`** — removed gray **(OPTIONAL)** span. **`CartDropdown.tsx`** — **`min(284px → min(312px, …)`** for compact multi-item list.

---

## 2026-03-31 — Consult page: fix runtime `BookingMutedNote` ReferenceError

**Context:** Error **“can't find variable: bookingmutednote”** / component failed to load on consult — **`BookingMutedNote`** import had been removed but **JSX still referenced** the component.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — removed the stray **`<BookingMutedNote>…</BookingMutedNote>`** block under **Add to bag** (copy already in hero/body).

---

## 2026-03-30 — Booking: calendar top spacing; consult/appointment badge + hero subline alignment

**Context:** User wanted **10px** above the hair appointment **inline calendar**; **consult** and **appointment** tier badges on the **same vertical axis**; black hero sublines (**LOCATED IN MEMPHIS, TN.** vs **NON-REFUNDABLE DEPOSIT…**) with **matching top spacing** after the badge stack.

**Topics covered:** Continued from a summarized handoff that planned **`marginTop: 10px`** on the date picker wrapper, **`BookingTierBadgeImg`** margin tweaks, and **`hideRule`** spacer rhythm; consult first body block already aligned to appointment at **`24px`** bottom margin.

**Decisions / outcomes:** Single spacer under the badge for **`hideRule`** carries **28px** bottom margin (replacing separate **12px** badge bottom + **16px** rule margin) so both booking routes share one rhythm to **`BookingHeroSubline`**. Non-**`hideRule`** **`BookingCrumbTitle`** keeps the old gap via **`marginTop: 12px`** on the rule row after removing badge bottom margin.

**Changes:** **`booking/appointment/page.tsx`** — calendar wrapper **`marginTop: '10px'`** (keeps **`marginBottom: '16px'`**). **`BookingPageChrome.tsx`** — **`BookingTierBadgeImg`** wrapper **`margin: '10px 0 0'`**; rule **`div`** **`marginBottom: hideRule ? '28px' : '16px'`**, **`marginTop: hideRule ? 0 : '12px'`**.

**Conventions:** When adjusting **`hideRule`** booking headers, keep **consult** and **appointment** stacks in sync via shared **`BookingCrumbTitle`** / **`BookingTierBadgeImg`** / **`BookingHeroSubline`**.

---

## 2026-03-31 — Consult notes placeholder; appointment estimated time centered

**Context:** User wanted no gray **deposit** footnote under consult **Add to bag** (already absent after **`BookingMutedNote`** removal), no gray **“write your comment here”** placeholder on the notes field, and the red **estimated appointment time** block under the calendar **centered**.

**Changes:** **`consultation/page.tsx`** — removed **`placeholder="WRITE YOUR COMMENT HERE."`** from **ADDITIONAL NOTES** **`textarea`**. **`appointment/page.tsx`** — red estimated-time **`<p>`** **`textAlign: 'left'` → `'center'`**.

---

## 2026-03-31 — BrandExpiresDatePicker: SVG calendar arrows

**Context:** User wanted month navigation to use **`public/assets/calendar-left-arrow.svg`** and **`calendar-right-arrow.svg`** instead of text chevrons.

**Changes:** **`BrandExpiresDatePicker.tsx`** — prev/next buttons render **`<img>`** (**24×24**, **`alt=""`**, **`draggable={false}`**) with **`/assets/calendar-left-arrow.svg`** and **`/assets/calendar-right-arrow.svg`**; shared constants **`CALENDAR_LEFT_ARROW_SRC`** / **`CALENDAR_RIGHT_ARROW_SRC`**.

---

## 2026-03-31 — Appointment policy: second line −2px spacing fix (margin longhand + flex stack)

**Context:** User reported **`marginTop: '-2px'`** on the second policy line (**“I WILL ONLY RE-INSTALL…”**) did not visibly change spacing; asked to rule out padding/overrides.

**Changes:** **`BookingBodyParagraph`** — replaced **`margin: '0 0 12px'`** with **`marginTop/Right/Bottom/Left`** longhands plus **`padding: 0`** so **`...style`** overrides (**`marginTop`**, **`marginBottom`**) are reliable and not fighting the shorthand. **`appointment/page.tsx`** — policy list wrapper is **`display: 'flex'`**, **`flexDirection: 'column'`**, **`gap: 0`**, **`padding: 0`** so adjacent paragraph margins use flex spacing behavior instead of block margin-collapse quirks.

---

## 2026-03-31 — Hair appointment: install & travel expandable detail copy

**Context:** User set **NEW INSTALL** / **RE-INSTALL** detail to **THIS SERVICE INCLUDES LACE CUSTOMIZATION & STYLING.**; **TRAVEL FEE** detail to two lines: **THIS IS AN ESTIMATE AMOUNT FOR FLIGHT & OVERNIGHT STAY.** then **FINAL COSTS WILL BE CALCULATED BASED ON YOUR CITY & COUNTRY.**

**Changes:** **`booking/appointment/page.tsx`** — **`INSTALL_KIND_DETAIL_LINES`** updated for both kinds; **`ADDON_DETAIL_LINES.travel`** as **`ReactNode`** with **`<br />`**; **`ADDON_DETAIL_LINES`** typed **`Record<string, ReactNode>`**; **`ToggleRow`** **`detailLine?: ReactNode`** (import **`ReactNode`** from **React**).

---

## 2026-03-31 — Cart dropdown compact list maxHeight: 312px → 298px

**Context:** **`min(312px, …)`** for 2+ compact rows fixed second-row border clipping but exposed the top of a third row when only two should read as “full” in the viewport.

**Changes:** **`CartDropdown.tsx`** — **`cartItemsScrollMaxHeight`** multi-item branch **`min(312px, …)` → `min(298px, …)`** (middle ground vs original **`284px`**).

---

## 2026-03-31 — Cart dropdown compact list: 298px → 296px → 294px

**Context:** User wanted **2–4px** less scroll height after **`298px`** felt almost perfect; later set cap to **`294px`**.

**Changes:** **`CartDropdown.tsx`** — multi-item compact **`min(298px, …)` → `min(296px, …)` → `min(294px, …)`**.

---

## 2026-03-31 — Booking A/C: TOTAL DUE styling; install prices; calendar +12px

**Context:** User wanted **ESTIMATED TOTAL** → **TOTAL DUE** on appointment; **TOTAL DUE** + price styling to match **`/build-a-wig` main page** (**`font-futura`** label **`12px` / `md:sm` / `lg:base`**, gray **`#808080`**; price **`text-base` / `md:xl` / `lg:2xl`**, **Futura PT Medium**); **+12px** space above appointment inline calendar; **NEW INSTALL** **$250**, **RE-INSTALL** **$200**.

**Changes:** **`booking/appointment/page.tsx`** — **`INSTALL_BASE`** prices; calendar wrapper **`marginTop` `10px` → `22px`**; total block uses same **Tailwind** pattern as **`build-a-wig/page.tsx`**; label **TOTAL DUE**. **`booking/consultation/page.tsx`** — same **TOTAL DUE** block classes. **`api/_lib/pricing/resolveQuote.ts`** — **`INSTALL_USD`** **NEW_INSTALL** **250**, **RE_INSTALL** **200** (aligned with UI).

---

## 2026-03-31 — Booking consult: body copy (& overall finish, & ampersands)

**Context:** User updated the two **`BookingBodyParagraph`** blocks under the consult hero: **narrow down** … **DENSITY & OVERALL FINISH**; **THIS DEPOSIT** holds spot **&** credits; second paragraph uses periods after **WIG ONLY** and **&** before inspo / deposit details.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — replaced both paragraph strings accordingly.

---

## 2026-03-31 — Hair appointment: policy line 2 spacing −4px

**Context:** User wanted **4px** less space above **“I WILL ONLY RE-INSTALL…”** (second policy line).

**Changes:** **`booking/appointment/page.tsx`** — second policy line **`marginTop` `-2px` → `-6px` → `-8px` → `-10px`** (**`i === 1`**).

---

## 2026-03-31 — Appointment estimated time: Futura Medium +6px; calendar arrows SVG 22px symmetrical

**Context:** User wanted red **estimated appointment time** copy in **Futura PT Medium** and **+6px** space above it; **BrandExpiresDatePicker** month **‹** (smaller than right **SVG**) replaced so **left** matches **right**; both arrow images **−2px** (**24 → 22**).

**Changes:** **`appointment/page.tsx`** — **`bookingFontMedium`**, **`margin` `0 0 20px` → `6px 0 20px`**. **`BrandExpiresDatePicker.tsx`** — prev button uses **`calendar-left-arrow.svg`** **`22×22`** like next; **`flex items-center justify-center`** on both nav buttons.

---

## 2026-03-31 — Booking consult: body copy (appointment + credits; hair inspo photo)

**Context:** User shortened first paragraph to **THIS DEPOSIT HOLDS YOUR APPOINTMENT & CREDITS TOWARD YOUR UNIT OR INSTALL.** (dropped preferred spot / once you move forward); second paragraph **CLEAR INSPO** → **HAIR INSPO PHOTO**.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — two **`BookingBodyParagraph`** strings updated.

---

## 2026-03-31 — Appointment: remove `~` from estimated time formatter

**Context:** User wanted no **tilde** in **ESTIMATED APPOINTMENT TIME** line.

**Changes:** **`booking/appointment/page.tsx`** — **`formatEstimatedAppointmentTime`** returns **`0 MINUTES`** / joined parts without **`~`** prefix.

---

## 2026-03-31 — Hair appointment calendar + section headings typography

**Context:** User wanted calendar **black day numbers** in **Covered By Your Grace**; red **duration** lines (**+2 HOURS**, etc.) in **Futura PT Medium**; **SERVICE TYPE** / **ADD TO YOUR APPOINTMENT** headings **1px smaller**; **CLEAR DATE** without underline.

**Changes:** **`BrandExpiresDatePicker.tsx`** — unselected day cells use **`bookingFontScript`**; selected stays **Futura Medium**; **CLEAR DATE** **`textDecoration`** removed. **`BookingSectionHeading`** — optional **`fontSize`** (default **`12px`**); appointment uses **`fontSize="11px"`** for those two headings. **`appointment/page.tsx`** — install + add-on red **`sub`** spans **`bookingFontBook` → `bookingFontMedium`**.

---

## 2026-03-31 — CLEAN LACE detail + consult follow-up copy

**Context:** User wanted **CLEAN LACE** expandable detail to say **glue & gunk** (not dirt); consult second body paragraph to end with **payment details** (not deposit details).

**Changes:** **`booking/appointment/page.tsx`** — **`ADDON_DETAIL_LINES['clean-lace']`** **`DIRT` → `GUNK`**. **`booking/consultation/page.tsx`** — **`DEPOSIT DETAILS` → `PAYMENT DETAILS`** in the **72 hours** sentence.

---

## 2026-03-31 — Consult notes copy; appointment duration line; EST time +1px; hair option red

**Context:** User wanted **ADD NOTES ALONG WITH A HAIR INSPO PHOTO** phrasing; appointment second line **FINAL DURATION CONFIRMED AFTER CHECKOUT.**; red **estimated appointment time** block **+1px**; consult **HAIR OPTION** asterisk **red**; selected **WIG + INSTALL / WIG ONLY** text **red** again.

**Changes:** **`consultation/page.tsx`** — second **`BookingBodyParagraph`**; **`HAIR OPTION:`** + red **`*`** span; button **`color`** selected **#EB1C24**. **`appointment/page.tsx`** — estimated time **`fontSize` `9px` → `10px`**; **FINAL TIME** → **FINAL DURATION**.

---

## 2026-03-31 — Consult notes spacing/red input; install/re-install red subline font

**Context:** User wanted **1px** more space below **ADDITIONAL NOTES:** on consult; notes input text in **uppercase red Futura Medium**; and the **NEW INSTALL / RE-INSTALL** red duration subline to match other red appointment time lines (Futura Medium).

**Changes:** **`booking/consultation/page.tsx`** — notes label uses **`marginBottom: '7px'`**; textarea text color **`#000000` → `#EB1C24`** with existing uppercase + **`bookingFontMedium`**. **`booking/appointment/page.tsx`** — service-type red subline font **`bookingFontBook` → `bookingFontMedium`**.

---

## 2026-03-31 — Appointment policy line 2: -8px to -12px

**Context:** User requested another tighter adjustment above **"I WILL ONLY RE-INSTALL..."**.

**Changes:** **`booking/appointment/page.tsx`** — second policy line (**`i === 1`**) **`marginTop` `-8px` → `-12px`**.

---

## 2026-03-31 — Consult copy: OR phrasing + "towards" wording

**Context:** User requested consult text updates to use **"DENSITY OR OVERALL FINISH"**, **"WILL BE A CREDIT TOWARDS..."**, and hero line **"DEPOSIT IS APPLIED TOWARDS YOUR WIG..."**.

**Changes:** **`booking/consultation/page.tsx`** — first body paragraph updated exactly to requested sentence; hero subline changed from **`TOWARD`** to **`TOWARDS`**.

---

## 2026-03-31 — Appointment policy copy: "desired look"

**Context:** User wanted the policy sentence updated to **"if you need help choosing a unit for your desired look, book a wig..."**.

**Changes:** **`booking/appointment/page.tsx`** — policy line changed from **`FOR YOUR LOOK`** to **`FOR YOUR DESIRED LOOK`**.

---

## 2026-03-31 — Appointment policy: add guests/cancellation paragraph

**Context:** User asked to add a new paragraph below the **"NEW INSTALLS SHOULD BE BOOKED..."** policy line on the appointment page.

**Changes:** **`booking/appointment/page.tsx`** — appended a new `policyLines` paragraph: **no guests allowed** plus **48-hour cancellation / 24-hour reschedule / $50 no-show fee** copy.

---

## 2026-03-31 — Vercel build unblock: TS errors across booking/BAW/checkout/shop pages

**Context:** Vercel build failed on TS errors: unused imports, undefined **`premiumMembershipStepModal`** in several BAW steps, missing **`serverQuote`** state in checkout quote effect/UI, and nullable **`category`** usage in shop texture-category PDP.

**Changes:** **`BrandExpiresDatePicker.tsx`** — removed unused **`bookingFontScript`** import. **`build-a-wig/addons|color|texture/page.tsx`** — restored **`const premiumMembershipStepModal = useBuildWigPremiumMembershipStepGate();`**; **`build-a-wig/lace/page.tsx`** — rendered **`{premiumMembershipStepModal}`** near modals. **`checkout/page.tsx`** — added **`const [serverQuote, setServerQuote] = useState<ServerCheckoutQuote | null>(null);`** to match existing quote effect/summary UI. **`shop/texture-category-product/page.tsx`** — early guard **`if (!category) return <Navigate ... />;`** so downstream category usage is non-null typed.

**Verification:** **`npx tsc --noEmit`** passes locally after these fixes.

---

## 2026-03-31 — Appointment schedule policy: weekdays only + 2-3/day note

**Context:** User requested weekends blocked for appointments, with policy that bookings are limited to **2-3 per day** (as time permits) in a **12-hour** Mon-Fri window.

**Changes:** **`BrandExpiresDatePicker.tsx`** — added optional **`isDateDisabled(isoYmd)`** prop and disabled-day UI/interaction. **`booking/appointment/page.tsx`** — passes weekday guard to block Saturdays/Sundays in the inline calendar and appends policy copy: **Monday-Friday only**, **2-3 appointments/day**, **12-hour daily booking window**.

---

## 2026-03-31 — Appointment calendar constraints: remove customer-facing line, block past dates

**Context:** User clarified the Mon-Fri / capacity note was internal context only (not customer-facing), requested removing that paragraph, removing the CLEAR DATE underline, and disabling all dates before today (gray/unselectable like weekends).

**Changes:** **`booking/appointment/page.tsx`** — removed the customer-facing **Monday-Friday / 2-3 appointments** paragraph; date guard now blocks **past dates + weekends**. **`BrandExpiresDatePicker.tsx`** — removed `CLEAR DATE` underline styles.

---

## 2026-03-31 — Appointment: new "CHOOSE A STYLE" section

**Context:** User requested a no-price style selector under **SERVICE TYPE** with options **BONE STRAIGHT**, **LAYERS & CURLS**, **CRIMPS**.

**Changes:** **`booking/appointment/page.tsx`** — added `AppointmentStyle` state and `CHOOSE A STYLE:` section below service type with selectable rows; selected style is included in `bookingBagSubtitle` and saved to cart item metadata as `bookingStyle`.

---

## 2026-03-31 — Appointment: add "CHOOSE PART DIRECTION" section

**Context:** User requested a no-price section below **CHOOSE A STYLE** with options **LEFT SIDE**, **MIDDLE**, **RIGHT SIDE**.

**Changes:** **`booking/appointment/page.tsx`** — added `PartDirection` state/options and a new **CHOOSE PART DIRECTION:** selectable block; selected direction is included in `bookingBagSubtitle` and saved in cart item metadata as `bookingPartDirection`.

---

## 2026-03-31 — Appointment style label rename

**Context:** User requested changing **"LAYERS & CURLS"** to **"LAYERED CURLS"** in **CHOOSE A STYLE**.

**Changes:** **`booking/appointment/page.tsx`** — updated `AppointmentStyle` union and `APPOINTMENT_STYLE_OPTIONS` label to **`LAYERED CURLS`**.

---

## 2026-03-31 — Appointment upgrade modal copy matches premium-feature standard

**Context:** User wanted the booking appointment premium popup to use the same generic premium-gate message used elsewhere, instead of the consult/shop-menu specific sentence.

**Changes:** **`booking/appointment/page.tsx`** — `ConfirmationModal` message updated to **"YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE."**

---

## 2026-03-31 — Consult premium gate removed; keep area vs feature modal rule

**Context:** User clarified modal policy: **area pages** should use **"YOU MUST BE A PREMIUM MEMBER TO ACCESS THIS AREA."** and **feature gates** should use **"YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE."**. They also confirmed consult should not be premium-gated because it serves both standard and premium users.

**Changes:** **`booking/consultation/page.tsx`** — removed premium gate logic and verbose upgrade modal (deleted premium-membership checks, modal state, `ConfirmationModal` block, and related imports). Premium-path consult still keeps route-based badge/tier metadata via `isPremiumBooking`, but Add to bag no longer blocks non-premium users.

**Verification:** **`npx tsc --noEmit`** passes.

---

## 2026-03-31 — Booking meeting sync idempotency (retry-safe)

**Context:** User approved adding idempotency so checkout retries cannot create duplicate `meetings` rows for the same order/date/time.

**Changes:** **`api/booking/appointment-meeting.ts`** — added `idempotencyKey` support and dedupe check before insert (`meetings` query by user/date/time/type + notes contains `IDEMPOTENCY:<key>`); returns existing row with `idempotent: true` when matched. **`checkout/page.tsx`** — generates deterministic per-item key `BOOKING_APPT:<order>:<date>:<time>:<idx>` and sends with `postBookingAppointmentMeeting(...)`. **`utils/api.ts`** — updated booking meeting API type to include `idempotencyKey`.

---

## 2026-03-31 — Appointment time-slot dropdown: special-offer style popup + red arrow

**Context:** User wanted the time selector to match admin special-offer/client sort dropdown style (custom popup, red arrow), placeholder in **Futura Medium**, and scheduled line to end with a period after time.

**Changes:** **`booking/appointment/page.tsx`** — replaced native `<select>` with custom button+popup dropdown (same visual pattern as admin special-offer tab controls), removed gray native arrow, added red chevron + overlay-dismiss popup list; placeholder **SELECT A TIME** uses `bookingFontMedium`. Scheduled line now ends with `.` and shows compact time (`4:00PM.`).

---

## 2026-03-31 — Booking appointment checkout auto-sync to admin meetings (Supabase)

**Context:** User approved implementing automatic sync so booking appointments create admin meeting records recognized in Supabase.

**Changes:** Added **`POST /api/booking/appointment-meeting`** (`api/booking/appointment-meeting.ts`) authenticated via `getAuthUser`; inserts pending rows into Supabase `meetings` with `user_id`, `client_email`, `meeting_date`, `meeting_time`, `type`, `duration_minutes`, and `notes` (includes order number). Added **`postBookingAppointmentMeeting(...)`** in `src/utils/api.ts`. Updated checkout success flow (`src/pages/checkout/page.tsx`) to detect `booking-appointment` items with `bookingPreferredDate` + `bookingPreferredTime` and auto-create meetings via API (non-blocking with `Promise.allSettled` semantics wrapped in try/catch).

**Verification:** `ReadLints` reports no linter errors in the touched files.

---

## 2026-03-31 — Appointment scheduled-date line visibility/format + tighter grouping

**Context:** User wanted the red **SCHEDULED DATE & TIME** line to appear only after both date and time are selected, formatted like **`03-31-2026 @ 2:00pm`** (no trailing period), grouped tightly with estimated-time lines, and the time-slot dropdown to mirror client-overview sort control sizing.

**Changes:** **`booking/appointment/page.tsx`** — scheduled line now renders only when both `preferredDateIso` and `preferredTimeSlot` exist; added `formatTimeSlotForDisplay()` for lowercase compact time (`2:00pm`); removed placeholder/repetitive text and period; grouped scheduled+estimated copy in one wrapper with symmetrical spacing (`0/4px/0` rhythm). Time-slot dropdown restyled to `36px` height with `8px 10px` padding and Futura PT Book `11px`.

---

## 2026-03-31 — Booking appointment route canonicalization + premium-path fallback

**Context:** User asked to apply the same auto-recognition/page-routing pattern to other premium routes if missing.

**Changes:** **`booking/appointment/page.tsx`** — added route-level canonicalization/guard like consult: premium users on `/booking/appointment` auto-redirect to `/booking/premium/appointment`; non-premium direct premium-path access opens area-gate modal. On close of that modal (premium-path non-member), route falls back to `/booking/consultation`; confirm keeps upgrade/sign-in flow.

**Verification:** **`npx tsc --noEmit`** passes.

---

## 2026-03-31 — Admin Brand create-code date picker: inline calendar on card

**Context:** User requested the **Create Code → Select Date** control to show the full calendar inline on the main card like the appointment page, and asked to confirm appointment/admin meetings/Supabase wiring.

**Changes:** **`admin/brand/page.tsx`** — changed code-expiry picker to inline mode: **`<BrandExpiresDatePicker inline ... />`**.

**Verification note:** Current booking appointment checkout stores `bookingPreferredDate`/`bookingPreferredTime` on cart items, but there is no automatic flow from booking checkout into `POST /api/admin/meetings`; admin meetings are created via `/admin/meetings/schedule` (`postAdminMeeting`) and persisted to Supabase `meetings` table through `api/admin/meetings.ts`.

---

## 2026-03-31 — Appointment calendar: scheduled date/time line + weekday slot dropdown

**Context:** User requested a red **SCHEDULED DATE & TIME:** line below the calendar (above estimated appointment time), with a date-based time-slot dropdown. Weekday slots should start at **10AM** and latest accepted appointment should be **6PM**.

**Changes:** **`booking/appointment/page.tsx`** — added weekday `WEEKDAY_TIME_SLOTS` (**10:00 AM → 6:00 PM**) and `preferredTimeSlot` state; date picker `onChange` clears time when date changes; when a date is selected, an **AVAILABLE TIME SLOTS** dropdown appears; added red **SCHEDULED DATE & TIME** line that renders selected date + selected slot; cart payload now includes `bookingPreferredTime` when chosen.

---

## 2026-03-31 — Booking premium-route behavior: consult auto-canonicalize; area gate wording

**Context:** User clarified routing/gate behavior: consult should auto-route by membership status (**premium → `/booking/premium/consultation`**, signed-out/standard → regular consult); direct premium-path access should use **ACCESS THIS AREA** behavior; appointment route should use area-gate semantics with upgrade chart for signed-in members and sign-in for signed-out users.

**Changes:** **`booking/consultation/page.tsx`** — added route-level canonicalization/guard: premium users on standard consult are redirected to premium consult path; non-premium users hitting premium consult path get **"YOU MUST BE A PREMIUM MEMBER TO ACCESS THIS AREA."** modal and are redirected to **`/booking/consultation`**. **`booking/appointment/page.tsx`** — appointment gate message changed to **ACCESS THIS AREA**; confirm now routes to **`/account/rewards`** (with upgrade prep) if signed in, otherwise **`/sign-in`**.

**Verification:** **`npx tsc --noEmit`** passes.

---

## 2026-03-31 — Vercel build: checkout TypeScript fixes (reduce types + async sync)

**Context:** Vercel `npm run build` failed with **`tsc --noEmit`** errors in **`src/pages/checkout/page.tsx`**: **`TS7006`** on **`addonIds.reduce`** (`sum` / `id` implicit **`any`**); **`TS1308`** — **`await syncBookingAppointmentsToAdminMeetings`** inside the CONFIRM ORDER **`onClick`** handler, which was not **`async`**.

**Changes:** **`src/pages/checkout/page.tsx`** — (1) Typed the reduce callback as **`(sum: number, id: string) => ...`**. (2) Wrapped sync + **`navigate('/checkout/summary', ...)`** in **`void (async () => { ... })()`** so **`await`** is legal and navigation still runs after sync (or after a logged failure).

**Verification:** **`npm run build`** (`tsc --noEmit && vite build`) completes successfully locally.

---

## 2026-03-31 — Booking appointment: premium-only on both URLs; lobby-style cancel navigation

**Context:** Signed-out and standard members could still use **`/booking/appointment`** because the area gate only ran on **`/booking/premium/appointment`**. User wanted the same **"ACCESS THIS AREA"** **`ConfirmationModal`** (not a separate feature flow) and **cancel → previous page** like **`/lobby`** (**`navigate(-1)`** if history length > 1, else **`/home/shop`**).

**Changes:** **`src/pages/booking/appointment/page.tsx`** — Route guard now treats **both** paths as premium-only: after optional **`syncAllFromApi`** when signed in (lobby pattern), non-premium users always get **`showAppointmentUpgradeModal`**. Premium users still **`replace`** navigate to **`/booking/premium/appointment`**. Modal **`onClose`** no longer sends users to **`/booking/consultation`**; it matches lobby **`handleCancel`**.

**Verification:** **`npx tsc --noEmit`** passes.

---

## 2026-03-31 — Account profile: standard rewards member label

**Context:** User clarified the gray profile line should read **standard rewards member** (not basic / not “member awards”). The line is **`{displayMembershipType} REWARDS MEMBER`** with uppercase styling.

**Changes:** **`src/pages/account/page.tsx`** — Non-premium **`displayMembershipType`** is **`STANDARD`** instead of **`BASIC`**, so the UI shows **STANDARD REWARDS MEMBER**. Comment updated for the gray styling branch.

---

## 2026-03-31 — Shop frontals PDP: lace size row single line

**Context:** On **`/shop/frontals`**, the four frontal lace options (**13×4, 13×6, 360, FULL** per **`bcfLaceOptionsForCategory`**) were in a **`flex flex-wrap`** row with wide **`minWidth`** chips, so they wrapped to two lines on typical mobile widths.

**Changes:** **`src/pages/shop/texture-category-product/page.tsx`** — For **`category === 'frontals'`** only, lace size uses the same **`grid grid-cols-4`** pattern as hair length: **`max-w-[min(100%,400px)]`**, tighter gaps, buttons **`width: 100%`**, **`minWidth: 0`**, reduced horizontal padding. Closures keep the previous flex-wrap + scroll behavior.

---

## 2026-03-31 — Booking appointment: policy + clean lace copy

**Context:** User asked to update the appointment policy line about choosing a unit / consultation, and the **CLEAN LACE** add-on detail (**glue & residue** wording).

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`policyLines`**: consultation sentence → **IF YOU NEED ANY ASSISTANCE… FEEL FREE TO BOOK A COMPLIMENTARY CONSULTATION FROM THE SHOP MENU.** **`ADDON_DETAIL_LINES['clean-lace']`**: **GUNK** → **RESIDUE** (…removing glue & residue from your lace…).

---

## 2026-03-31 — Central membership ↔ booking routes (`membershipRoutePolicy` + `MembershipRouteSync`)

**Context:** User wanted membership status **wired across routes** so premium vs standard booking paths and related behavior are decided consistently, not only inside individual pages.

**Changes:**
- **`src/utils/membershipRoutePolicy.ts`** — Defines **`BOOKING_PATHS`**, scoped path list, **`resolveBookingMembershipRedirect`**, **`bookingConsultPathForMenu`** / **`bookingAppointmentPathForMenu`**, and documents where gates live (build-a-wig hook, lobby, cart strip, menu helpers).
- **`src/components/MembershipRouteSync.tsx`** — Mounted in **`App.tsx`** next to **`Routes`**: on booking scoped paths, **`syncAllFromApi`** when signed in, then **replace** navigate — premium users **standard → premium** consult/appointment; **`/booking/premium/consult` → `/booking/premium/consultation`**; listens to **`signInStateChanged`** via internal tick.
- **`bookingMemberRoutes.ts`** — Uses policy constants/helpers for hrefs.
- **`booking/consultation/page.tsx`** — Removed duplicate premium canonicalization **`navigate`**; modal gate + **`BOOKING_PATHS.STANDARD_CONSULT`**; **`authRev`** on **`signInStateChanged`**.
- **`booking/appointment/page.tsx`** — Removed in-page premium URL redirect (central handles); gate effect + **`authRev`**.
- **`lobby/page.tsx`** — Lounge appointment hit target uses **`BOOKING_PATHS.PREMIUM_APPOINTMENT`**.

**Verification:** **`npx tsc --noEmit`** passes.

---

## 2026-03-31 — Booking appointment policy line copy tweak

**Context:** User updated the consultation sentence in appointment **`policyLines`**: drop **ANY** — **IF YOU NEED ASSISTANCE CHOOSING A UNIT…** (still **COMPLIMENTARY CONSULTATION** / **SHOP MENU**).

**Changes:** **`src/pages/booking/appointment/page.tsx`**.

---

## 2026-03-31 — Clean lace add-on: drop-off 3 days prior

**Context:** User updated **CLEAN LACE** detail copy: keep glue & residue wording; **1 WEEK** → **3 DAYS** prior to service.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`ADDON_DETAIL_LINES['clean-lace']`** (drop-off timing).

---

## 2026-03-31 — Booking install base prices: new $300, re-install $250

**Context:** User raised **NEW INSTALL** and **RE-INSTALL** USD amounts on the appointment flow.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`INSTALL_BASE`** (**NEW_INSTALL** **300**, **RE_INSTALL** **250**). **`api/_lib/pricing/resolveQuote.ts`** — **`INSTALL_USD`** kept in sync for server checkout quotes.

---

## 2026-03-31 — Clean lace copy: “at least 3 days”

**Context:** User refined **CLEAN LACE** drop-off line to **AT LEAST 3 DAYS** prior.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`ADDON_DETAIL_LINES['clean-lace']`** (added **AT LEAST** before **3 DAYS**).

---

## 2026-03-31 — Booking install base prices: new $275, re-install $225

**Context:** User adjusted **NEW INSTALL** and **RE-INSTALL** USD amounts.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`INSTALL_BASE`**. **`api/_lib/pricing/resolveQuote.ts`** — **`INSTALL_USD`** (server quotes).

---

## 2026-03-31 — Booking appointment: duration excludes travel; brow copy + label

**Context:** User asked to omit **travel fee** from estimated appointment time; rename **brow clean up** → **brow sculpting** with new detail text; update **brow tint** detail text.

**Changes:** **`appointment/page.tsx`** — **`ADDON_DURATION_MINUTES`** no **`travel`**; **`ADDONS_BASE`** label **BROW SCULPTING**; **`ADDON_DETAIL_LINES`** for **`brow-clean`** / **`brow-tint`**. **`checkout/page.tsx`** — **`durationByAddonId`** for admin meeting sync matches (no travel minutes). **`adminMeetingsMock.ts`** — **`APPOINTMENT_SERVICE_OPTIONS`**.

---

## 2026-03-31 — Booking add-ons: mutual exclusion (makeup/mink, brow tint/sculpting)

**Context:** User wanted to avoid double-paying: selecting **makeup** clears **mink lashes** (makeup includes mink); selecting **mink** clears **makeup**. Selecting **brow tint** clears **brow sculpting** (**brow-clean**); selecting **brow sculpting** clears **brow tint**.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`toggleAddon`** applies exclusions when an add-on is turned **on** only.

---

## 2026-03-31 — Cart red line: BCF + booking → RAW HUMAN HAIR; VIEW DETAILS

**Context:** User wanted collapsed red subtitle for **BCF** (`shop-texture-category`) and **A/C** booking lines to show only **RAW HUMAN HAIR** in cart dropdown, shopping bag, and checkout/summary strip; full specs under **VIEW DETAILS** (like unit wigs).

**Changes:** **`src/utils/cartLineRedAndDetails.ts`** — **`CART_RED_LINE_BCF_BOOKING`**, **`bookingCartViewDetailsHtml`**, **`bcfCartViewDetailsHtml`**. **`checkoutOrderStripDisplay.ts`** — **`orderStripRedSubtitle`**. **`CartDropdown.tsx`** — red line + early return in details **`dangerouslySetInnerHTML`**; **VIEW DETAILS** for booking + BCF (removed spacer-only branch). **`shopping-bag/page.tsx`** — **`bagProductRedSubtitle`**, **`bagViewDetailsFor`**, toggle + details for cart + saved.

---

## 2026-03-31 — Checkout: remove founder QA payment hint

**Context:** User wanted the admin **FOUNDER QA** test-card instructions removed from checkout UI.

**Changes:** **`src/pages/checkout/page.tsx`** — removed **`showFounderTestCheckoutHint`** state, sync **`useEffect`**, payment-section hint block, and unused imports **`isAyoteenzAdminAccount`**, **`FOUNDER_CHECKOUT_DUMMY_PAN`**.

---

## 2026-03-31 — BCF cart/bag thumbnails: bundle marble PNGs (incl. bundle deal)

**Context:** User wanted cart dropdown / shopping bag thumbnails for BCF bundles to always use **`/assets/bundle-straight.png`**, **`bundle-wavy.png`**, **`bundle-curly.png`**, including **bundle-deal** (`bcfBundleDeal`) lines—not the PDP hero JPG stored on the line.

**Topics covered:** Prior investigation noted **`shopBcfCartLineThumbnailSrc`** already returned marble for **`category === 'bundles'`**, but **`item.image`** (JPG) won when texture/category was missing or inconsistent; PDP wrote **`image: heroThumbSrc`** (bundle JPG) for adds.

**Changes:**
- **`src/utils/bcfProductOptions.ts`** — **`shopBcfCartLineThumbnailSrc`**: normalize texture (case); infer texture from **`id`** (`shop-{texture}-…`) and from **`name`** (e.g. **BUNDLES · WAVY**); infer **`category`** from id when missing; treat **`bcfBundleDeal`** as bundle lines so marble always wins.
- **`src/pages/shop/texture-category-product/page.tsx`** — **`image`** on add-to-bag / bundle-deal lines uses **`shopTextureCategoryThumbSrc(texture, 'bundles')`** for bundles instead of hero JPG.

**Conventions:** Bundle cart rows should keep **`texture`** + **`category`** / **`bcfBundleDeal`**; thumbnails resolve to marble via helper + consistent stored **`image`**.

---

## 2026-04-01 — Consult booking: required hair inspo, hair option layout, deposit copy

**Context:** User wanted the consult flow updated: **hair inspo** required; consult inputs full-width like the file picker and appointment install rows; **WIG + INSTALL** and **WIG ONLY** stacked (WIG + INSTALL first, WIG ONLY below), not side-by-side; hero/deposit line updated to the 72-hour quote hold message.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`BookingHeroSubline`** uses **THIS DEPOSIT TEMPORARILY HOLDS YOUR DESIRED APPOINTMENT TIME FOR 72 HOURS AFTER RECEIVING YOUR QUOTE.**; first body paragraph keeps consult intro and moves **60-day redeem** credit line there; **HAIR INSPO** label **\*** + **`required`** on file input; **`handleAddToBag`** blocks without file with **`PLEASE UPLOAD A HAIR INSPO PHOTO.`**; hair option as full-width stacked buttons (appointment-style borders/padding), order **WIG + INSTALL** then **WIG ONLY**; hair inspo / notes wrappers **`width: 100%`**, **`minWidth: 0`**, textarea **`maxWidth: 100%`**.

---

## 2026-04-01 — Booking appointment: makeup shade, mink volume, pricing, headings, toggle rules

**Context:** User wanted **makeup** row to include BCF-style **select your shade:** (8+ skin tones fair → deep), **mink lashes** with **select your volume:** **NATURAL** / **DRAMATIC** below the shade block (makeup ordered before mink in the list); makeup **$250** / **+2.5 hours**; **brow sculpting** cleared when makeup is selected (and selecting brow sculpting clears makeup); section titles **SELECT A SERVICE / STYLE / PART DIRECTION**; server/checkout duration and USD aligned.

**Changes:**
- **`src/pages/booking/appointment/page.tsx`** — **`ADDONS_BASE`**: makeup before mink; makeup **250** / **+2.5 HOURS**; **`ADDON_DURATION_MINUTES.makeup`** **150**; **`MAKEUP_SKIN_TONES`** (8) + **`AppointmentSkinToneSwatchDonut`** + Bohemy sublabels; **`minkLashVolume`** state; **`toggleAddon`**: makeup removes mink + **brow-clean**; **brow-clean** removes makeup + **brow-tint**; cart fields **`bookingMakeupSkinTone`** / **`bookingMinkLashVolume`**; imports **`bcfOptionSelectedChrome`**, **`BCF_OPTION_RED`**.
- **`api/_lib/pricing/resolveQuote.ts`** — **`ADDON_USD.makeup`** **250**.
- **`src/pages/checkout/page.tsx`** — admin meeting sync **`durationByAddonId.makeup`** **150**.
- **`src/types/cart.ts`** — optional **`bookingMakeupSkinTone`**, **`bookingMinkLashVolume`**.
- **`src/utils/cartLineRedAndDetails.ts`** — **`bookingCartViewDetailsHtml`** lines for makeup shade + mink volume.

---

## 2026-04-01 — Consult WIG+INSTALL premium + calendar; booking lead times (2 months / 1 week)

**Context:** User wanted **WIG + INSTALL** to show black detail copy **THIS OPTION IS FOR PREMIUM MEMBERS ONLY.**; standard members who add to bag with that option get the same **“this feature”** upgrade modal as build-a-wig (**YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE.** → **UPGRADE** / Rewards or sign-in). When **WIG + INSTALL** is selected and the user is premium, show the appointment-style **inline calendar + time slots** below **ADDITIONAL NOTES**; persist **`bookingPreferredDate`** / **`bookingPreferredTime`** on the consult cart line. Scheduling rules: **new install** and **consult WIG + INSTALL** use a **two-calendar-month** minimum lead from today (e.g. Apr 1 → earliest Jun 1), weekends disabled; **RE-INSTALL** uses **seven days** minimum. Earlier dates grayed via **`BrandExpiresDatePicker`** **`isDateDisabled`**.

**Changes:**
- **`src/utils/bookingDateRules.ts`** (new) — **`bookingMinSelectableLocalDate`**, **`createBookingDateDisabledFn`** (`two_calendar_months` | `seven_days`).
- **`src/pages/booking/appointment/page.tsx`** — replace old “past + weekend” rule with shared helper; clear date when install kind makes it invalid; clear time when date cleared.
- **`src/pages/booking/consultation/page.tsx`** — premium-only note on **WIG + INSTALL** row; gate add-to-bag + **`ConfirmationModal`** for non-premium; calendar UI + validation for premium **WIG + INSTALL**; cart fields for preferred date/time.
- **`src/utils/cartLineRedAndDetails.ts`** — **VIEW DETAILS** for **`booking-consult`** includes **DATE** / **TIME** when present.

---

## 2026-04-01 — Appointment: Layered Curls $40, draft persistence, notes + inspo, quote sync

**Context:** User wanted **LAYERED CURLS** to show **$40 USD** in gray (and pricing before “complimentary” policy copy), form **photos/details** to survive refresh, and an **ADDITIONAL NOTES** block below the travel add-on row.

**Changes:**
- **`src/pages/booking/appointment/page.tsx`** — **`LAYERED_CURLS_UPCHARGE_USD`** (40): gray price on style row, included in **`totalUsd`**, policy line before complimentary consult line; **`localStorage`** draft **`bookingAppointmentFormDraftV1`** (hydrate on mount, persist on change, clear after add-to-bag); optional **HAIR INSPO** (data URL in draft) + **ADDITIONAL NOTES**; cart **`bookingNotes`** / **`bookingInspoFileName`**.
- **`api/_lib/pricing/resolveQuote.ts`** — **`bookingStyle`** on **`QuoteLineInput`**; **+40 USD** when style is **LAYERED CURLS**.
- **`api/checkout/quote.ts`**, **`api/stripe/create-product-payment-intent.ts`** — pass **`bookingStyle`**.
- **`src/utils/checkoutQuote.ts`**, **`src/types/cart.ts`** — **`bookingStyle`** (+ appointment **`bookingPreferredDate`/`Time`** on type where missing), quote payload.
- **`src/utils/cartLineRedAndDetails.ts`** — appointment **VIEW DETAILS**: **NOTES** + **INSPO FILE** when set.

---

## 2026-04-01 — Build-a-wig menu parity (Noir), checkout A/C thumbs, consult deposit copy

**Context:** User wanted **Build-a-Wig** hub step pages’ **hamburger menu** to match **Noir** (full-height inline card, HOME > MENU header, SHOP/TOOLS/BRAND tabs, footer sign-in + socials—not the old centered modal). **Checkout** horizontal strip: **hair appointment** badge image **+6px** vs consult (consult unchanged); **6px less** top padding on **booking-appointment** and **booking-consult** tiles only. **Consult** body copy: deposit credit line → **DEPOSIT IS A CREDIT TOWARDS YOUR WIG OR INSTALL WHEN REDEEMED WITHIN 72 HOURS OF QUOTE.**

**Changes:**
- **`src/utils/checkoutOrderStripDisplay.ts`** — checkout strip: **`booking-appointment`** **`imgPx`** = scaled badge **+6**; consult unchanged.
- **`src/pages/checkout/page.tsx`** — cart tile **`paddingTop`**: **2px** for **`booking-appointment`** / **`booking-consult`** (else unchanged logic including membership).
- **`src/pages/checkout/confirm/page.tsx`** — same **2px** top padding for those two line types.
- **`src/pages/booking/consultation/page.tsx`** — first **`BookingBodyParagraph`** sentence updated to the **72 HOURS OF QUOTE** credit line.
- **Build-a-wig subpages:** **`length`**, **`color`**, **`density`** — main card uses **`menu-toggle-card`**, **`calc(100dvh - 80px)`** when menu open. **`lace`**, **`texture`**, **`styling`**, **`addons`** — inline Noir-style menu (no fullscreen popup); confirm wrapped in **`!showMobileMenu`**. **`cap-size`** and **`hairline`** still use the **old** popup / **no** menu wiring on hairline—mirror **`lace/page.tsx`** to finish.

**Conventions:** Prefer **`menu-toggle-card`** + **`calc(100dvh - 80px)`** for open mobile menu panels on shop-style pages; keep **`ShopMobileMenuShopTab`** / **`Tools`** / **`BrandMenuLinks`** + **`SocialMenuIcons`** footer layout consistent with **`straight/noir/page.tsx`**.

---

## 2026-04-01 — Consult hair inspo: up to 4 photos, persistent choose file, max modal, affiliate X

**Context:** User wanted the consult **CHOOSE FILE** row to stay visible (not replaced by a large preview); up to **4** inspo images; **MAX PHOTOS REACHED** marble **`ConfirmationModal`** with **REMOVE OR REPLACE AN IMAGE.** and single **CLOSE**; thumbnails in one row with top-right delete matching **account affiliate** VIEW POINTS **photo** tab (**close-icon** in white circle).

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`inspoItems`** state, **`multiple`** file input, async **`readImageFileAsDataUrl`**; cart **`bookingInspoFileNames`** + joined **`bookingInspoFileName`**; **`src/types/cart.ts`** — **`bookingInspoFileNames`**; **`src/utils/cartLineRedAndDetails.ts`** — consult + appointment **VIEW DETAILS** list each **INSPO FILE** from array when present.

---

## 2026-04-01 — Appointment: SELECT A STYLE, no inspo / layered curls policy, shade & volume inside add-on card

**Context:** User wanted **CHOOSE A STYLE** → **SELECT A STYLE:**; remove appointment **hair inspo** block and the policy line **LAYERED CURLS INCLUDES…**; **select your shade** / **select your volume** inside the same bordered **MAKEUP** / **MINK LASHES** card below **THIS SERVICE INCLUDES…**, not below the whole row.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`ToggleRow`** refactored to outer bordered **`div`**, toggle **`button`** for header, then detail text, then optional **`expandedContent`** (clicks **`stopPropagation`**); makeup/mink shade & volume passed as **`expandedContent`**; removed **`appointmentInspo*`** state, draft fields, handler, cart **`bookingInspoFileName`** on appointment add; removed layered curls upcharge policy sentence from **`policyLines`**.

---

## 2026-04-01 — Consult hero: deposit as credit (72 hours of quote)

**Context:** User updated consult deposit messaging.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`BookingHeroSubline`**: deposit-as-credit copy (later consolidated to one line); first body paragraph no longer repeats the deposit credit sentence.

---

## 2026-04-01 — Appointment cart thumb +5%, makeup shade labels, consult “your quote”

**Context:** User wanted **`booking-appointment`** thumbnail **+5%** only (not consult); makeup swatch labels **BEIGE**, **TAN**, **MAHOGANY**, **EBONY**; consult hero **72 HOURS OF YOUR QUOTE**.

**Changes:** **`src/utils/bookingBadges.ts`** — **`BOOKING_CART_BADGE_IMG_PX`**, **`BOOKING_APPOINTMENT_CART_BADGE_IMG_PX`**. **`checkoutOrderStripDisplay.ts`** — checkout strip appointment **`Math.round((base+6)*1.05)`**; non-checkout appointment uses appointment px. **`CartDropdown.tsx`**, **`shopping-bag/page.tsx`**. **`appointment/page.tsx`** — **`MAKEUP_SKIN_TONES`** labels. **`consultation/page.tsx`** — hero **YOUR QUOTE**.

---

## 2026-04-01 — Consult: fix inspo file picker + WIG+INSTALL calendar; hero one line

**Context:** User reported consult **choose file** not loading/showing images, **calendar** missing when **WIG + INSTALL** selected (premium), and hero deposit copy as one sentence.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`handleFileChange`**: read files async **outside** `setState` updater (avoids Strict Mode / batching issues); **`isProbablyImageFile`** for empty mobile MIME types; **`<label>`** + full-size **`opacity: 0`** input over **CHOOSE FILE** row (no `overflow: hidden`); **`BrandExpiresDatePicker`** + time dropdown when **`hairOption === 'WIG + INSTALL' && isPremium`**; hero single line **WHEN REDEEMED WITHIN 72 HOURS OF QUOTE.**

---

## 2026-04-01 — Build-a-wig cap-size + hairline: finish Noir inline menu

**Context (full chat arc):** Same thread as Build-a-Wig **Noir-style** mobile menu on hub steps, checkout **A/C** strip tweaks (+6px appointment thumb, tighter top padding), consult **72 HOURS OF QUOTE** deposit copy. Remaining gaps were **`cap-size`** (inline menu existed but a legacy fullscreen popup still called removed **`handleCloseMobileMenu`**) and **`hairline`** (hamburger had no **`onClick`**, no menu state).

**Topics covered:** Close out cap-size structure to match **`lace/page.tsx`**; port menu pattern to hairline (header swap, **`menu-toggle-card`**, full-height panel, hide **CONFIRM** when menu open, sign-out **`ConfirmationModal`**).

**Decisions / outcomes:** Single inline menu path only—no duplicate modal. Hairline matches lace imports and handlers (**`ShopMobileMenuShopTab`**, **`Tools`**, **`BrandMenuLinks`**, **`SocialMenuIcons`**, **`clearAppAuth`**).

**Changes:**
- **`src/pages/build-a-wig/cap-size/page.tsx`** — Removed **MOBILE MENU POP-UP** block; after page content **`</> )}`** closes the **`showMobileMenu`** ternary; **CONFIRM** wrapped in **`!showMobileMenu`** (same shell as lace).
- **`src/pages/build-a-wig/hairline/page.tsx`** — Added mobile menu state, route tab effects, toggle/tab/expand/sign-out handlers; conditional header (**HOME > MENU** / account–wishlist); main card **`menu-toggle-card`** + **`calc(100dvh - 80px)`** when open; inline tab content; **CONFIRM** only when menu closed; **`ConfirmationModal`** for sign-out.

---

## 2026-04-01 — Appointment makeup/mink: Bohemy label spacing + no colons

**Context:** User wanted **+10px** space below the makeup shade and mink volume **selection boxes**, **+10px** above **select your shade** / **select your volume**, and to **drop the colons** from those labels.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`ToggleRow`** expanded block **`paddingBottom`** **12px → 22px**; Bohemy **`<p>`** **`marginTop` `10px`**, copy **select your shade** / **select your volume** (no **`:`**).

---

## 2026-04-01 — Consult: disabled calendar days + hair inspo previews

**Context (full thread):** Consult **WIG+INSTALL** calendar must not show a **red selection box** on **disabled/gray** dates (e.g. Apr 2). **Hair inspo** “choose file” should add images reliably and show **thumbnails** under the picker (mobile had empty MIME types, fragile async `setState`, and thumbnails collapsing).

**Decisions / outcomes:** Disabled days never use selected/today-red chrome when `isDateDisabled` is true. Inspo previews use **`URL.createObjectURL`** + **`revokeObjectURL`** (no `FileReader` in the update path). Picker uses a **visually hidden** file input and a **button** that calls **`input.click()`**. Thumbnails use **fixed 88×88** cells so one image cannot collapse. If stored consult date becomes disabled, **clear date/time** in an effect.

**Changes:**
- **`src/components/BrandExpiresDatePicker.tsx`** — **`isSelected`** and **today outline** require **`!isDisabled`** so value matching a disabled cell does not get red border.
- **`src/pages/booking/consultation/page.tsx`** — **`ConsultInspoItem.previewUrl`**; **`isProbablyImageFile`** also allows **extensionless** non-empty names; **`handleFileChange`** builds object URLs then **one** `setInspoItems`; cleanup on remove/unmount; **`useEffect`** clears **`consultPreferredDateIso` / time** when **`consultWigInstallDateDisabled`**.

---

## 2026-04-01 — Appointment page: +2px under shade/volume; header badge +5%

**Context:** User wanted **2px** more space below makeup & mink **selection boxes**, and the **appointment** booking header thumbnail **5% larger** only on that flow (not cart/checkout).

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`ToggleRow`** expanded **`paddingBottom` `22px` → `24px`**. **`src/utils/bookingBadges.ts`** — **`BOOKING_BADGE_HEADER_APPOINTMENT_PX`** = **`BOOKING_BADGE_DISPLAY_PX * 1.05`**. **`src/components/booking/BookingPageChrome.tsx`** — **`BookingTierBadgeImg`** uses it for non-consult booking routes (appointment); consult still **`BOOKING_BADGE_HEADER_CONSULT_PX`**.

---

## 2026-04-01 — Consult copy: notes + inspo photos + follow up wording

**Context:** User updated the second body paragraph on the consult booking page.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`BookingBodyParagraph`**: **ADD ADDITIONAL NOTES ALONG WITH HAIR INSPO PHOTOS** … **FOLLOW UP** (no hyphen) … same 72h / checklist / price / payment line.

---

## 2026-04-01 — Consult hair inspo: thumbnails below picker

**Context:** User wanted selected **hair inspo** images to show **below** the file picker and **above** **HAIR OPTION**, not hidden / not above the chooser; keep visually hidden file input + button **`click()`** pattern.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — Reordered **HAIR INSPO** column: **CHOOSE FILE** row first, then thumbnail row (`minHeight: 88px`, **`loading="eager"`** on preview **`img`**).

---

## 2026-04-01 — Consult hair inspo: survive premium URL redirect + show thumbnails

**Context:** User reported selected **hair inspo** images still not appearing (“something overwriting”). Root cause: **`MembershipRouteSync`** **`replace` navigates** premium users from **`/booking/consultation`** to **`/booking/premium/consultation`** (and **`/premium/consult` → `/premium/consultation`**), so **`BookingConsultationPage` unmounts/remounts**; **blob `URL.createObjectURL`** previews were cleared and **`revokeObjectURL`** on unmount invalidated URLs.

**Decisions / outcomes:** Store previews as **`data:` URLs**; persist **`inspoItems`** in **`sessionStorage`** (`bawBookingConsultHairInspoDraft`) with **`loadInspoDraftFromSession`** as **`useState` initializer**; sync on change; after async **`FileReader`** merge, **`sessionStorage.setItem`** then **`queueMicrotask` + `bawConsultInspoHydrate`** so a **new** mount hydrates if **`setState` was dropped**; clear draft + **`setInspoItems([])`** on successful add-to-bag. Removed blob **`revokeObjectURL`** lifecycle.

**Changes:** **`src/pages/booking/consultation/page.tsx`**.

---

## 2026-04-01 — Appointment policy: RE-INSTALLS / CLEAN LACE comma

**Context:** User updated the combined new-install / re-install policy sentence.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`policyLines`**: **…USING THE "CLEAN LACE" ADD ON, IF APPLICABLE.** (comma before **IF APPLICABLE**).

---

## 2026-04-01 — Appointment no-show line + consult body split

**Context:** User updated cancellation copy (**OF YOUR APPOINTMENT** / **BEING CHARGED** no-show fee) and consult intro: one paragraph for consult + options + notes/inspo, second paragraph for 72h follow-up.

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`policyLines`**: **NO GUESTS** and **APPOINTMENTS MUST BE CANCELLED… OF YOUR APPOINTMENT TO AVOID BEING CHARGED A NO SHOW FEE OF $50 USD.** as **two** entries. **`src/pages/booking/consultation/page.tsx`** — first **`BookingBodyParagraph`**: **BOOK A COMPLIMENTARY…** through **…MOST ACCURATE RESULTS.**; second: **YOU WILL RECEIVE A FOLLOW UP…**

---

## 2026-04-01 — Appointment guests + no-show one line; consult body two paragraphs

**Context:** User supplied final copy: appointment **NO GUESTS** + **48h / 24h OF YOUR APPOINTMENT / $50** as **one** sentence; consult first paragraph ends after **SELECT WIG + INSTALL OR WIG ONLY.**; second paragraph **ADD ADDITIONAL NOTES…** through **…PAYMENT DETAILS.**

**Changes:** **`src/pages/booking/appointment/page.tsx`** — **`policyLines`**: merged last two bullets into one string. **`src/pages/booking/consultation/page.tsx`** — split **`BookingBodyParagraph`** text per user strings.

---

## 2026-03-31 — NEW INSTALL: select unit, attach build-a-wig, attach prior order

**Context:** User wanted **NEW INSTALL** on the hair appointment flow to include **select your unit** (Bohemy styling like makeup shade) **below** “THIS SERVICE INCLUDES…”, with an **attach unit** control (60×65-style box + dropdown of all six hub units) that opens the matching **`/build-a-wig/{slug}`** hub in **appointment mode**; primary CTA on the hub becomes **ADD TO APPOINTMENT**, saving a **custom unit snapshot** to localStorage (not the shopping bag) and returning to the appointment page. **Attach order**: second control listing **previously purchased units** from **`userOrders_${email}`** (heuristic on product names), or **NO ELIGIBLE ORDERS.** when none. Attachments persist on the **`booking-appointment`** cart line (`bookingNewInstallUnitJson`, `bookingAttachedOrderId` / `bookingAttachedOrderSummary`) and appear in **VIEW DETAILS** via **`bookingCartViewDetailsHtml`**.

**Decisions / outcomes:** Dedicated keys in **`src/utils/bookingNewInstallUnit.ts`** (`buildWigAppointmentMode`, return URL, attached unit JSON, attached order JSON). Stale appointment mode cleared if return path is not under **`/booking`**. RE-INSTALL clears new-install attachments; **`EMPTY_ELIGIBLE_WIG_UNITS`** avoids an effect/`useMemo` loop when not NEW INSTALL.

**Changes:** **`src/utils/bookingNewInstallUnit.ts`** (new). **`src/pages/booking/appointment/page.tsx`** (service card layout + UI + bag fields + clear on schedule). **`src/pages/build-a-wig/page.tsx`** (appointment branch in **`handleAddToBag`**, button copy, sanitization **`useEffect`**). **`src/types/cart.ts`**, **`src/utils/cartLineRedAndDetails.ts`**.

**Conventions:** Appointment attach flow must not use **`editingCartItem`**; hub **`ADD TO APPOINTMENT`** writes **`bookingNewInstallAttachedUnit`** and navigates back via **`buildWigAppointmentReturn`**.

---

## 2026-04-02 — Consult copy: “ADD NOTES” (hair inspo paragraph)

**Context:** User updated the second consult body paragraph to start with **ADD NOTES** instead of **ADD ADDITIONAL NOTES**; remainder unchanged (72h follow-up, checklist, price, payment).

**Changes:** **`src/pages/booking/consultation/page.tsx`** — second **`BookingBodyParagraph`** string.

---

## 2026-04-02 — BCF cart details: no category field; bag import cleanup

**Context:** User asked to drop **category** (e.g. closures) from BCF **VIEW DETAILS** HTML, remove red **VIEW/CLOSE DETAILS** under **RAW HUMAN HAIR** for BCF on the **shopping bag** (keep toggle only in **CartDropdown** under **×**). Follow-up **“?”** clarified completing the prior task.

**Decisions / outcomes:** **`bcfCartViewDetailsHtml`** did not emit a **CATEGORY:** line in repo; **`category`** removed from its item type so it cannot be added accidentally. Shopping bag **VIEW DETAILS** was already limited to **`booking-consult` / `booking-appointment`** only (`showBookingDetailsOnBag`); removed dead **`bcfCartViewDetailsHtml`** import from **`shopping-bag/page.tsx`**.

**Changes:** **`src/utils/cartLineRedAndDetails.ts`**, **`src/pages/shopping-bag/page.tsx`**.

---

## 2026-04-02 — Cart / bag: EDIT APPOINTMENT → hydrate booking PDP + replace line on save

**Context:** User wanted red **EDIT APPOINTMENT** under the appointment thumbnail in **cart dropdown** and **bag** (same styling as **EDIT IN BUILD-A-WIG**), opening the appointment booking page with selections from that cart line.

**Decisions / outcomes:** Central **`src/utils/bookingAppointmentFormDraft.ts`**: **`applyCartItemToAppointmentFormDraft`**, **`beginEditAppointmentFromCart`** (sets **`editingBookingAppointmentCartItemId`**, persists **`bookingAppointmentFormDraftV1`**, **`bawBookingAppointmentDraftHydrate`**, navigates via **`bookingAppointmentHrefForCartItem`**). **`CartItem.bookingPartDirection`**. Appointment PDP imports draft helpers + listens for hydrate; **`handleScheduleToBag`** removes **`editingBookingAppointmentCartItemId`** line before push so re-add **replaces** the edited row.

**Changes:** **`src/utils/bookingAppointmentFormDraft.ts`** (new). **`src/pages/booking/appointment/page.tsx`**, **`src/types/cart.ts`**, **`src/components/CartDropdown.tsx`**, **`src/pages/shopping-bag/page.tsx`**.

---

## 2026-04-02 — Consult hair inspo: fix missing `latestInspoRef` + hydrate listener

**Context:** User reported hair inspo thumbnails **still never appearing**; premium URL remount was not the only cause.

**Root cause:** **`handleFileChange`** async path used **`latestInspoRef.current`** but **`latestInspoRef` was never declared**, causing a **runtime `ReferenceError`** after **`FileReader`** finished so **`setInspoItems` never ran**. **`CONSULT_INSPO_HYDRATE_EVENT`** was dispatched with **no listener**.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — restore **`latestInspoRef`** synced each render; **`useEffect`** subscribes to **`bawConsultInspoHydrate`** → **`setInspoItems(loadInspoDraftFromSession())`**; **`isProbablyImageFile`** allows **empty name + empty type** when **`size > 0`**.

---

## 2026-04-02 — Consult hair inspo: affiliate-style picker, thumbs first, modals

**Context:** User wanted behavior like **account affiliate** submit-content photo UX: image appears automatically on select (no extra step), **X** removes with **confirmation** (not instant), and **“please upload hair inspo”** / other validation as **popup** not inline text.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`FileReader`** via **`Promise.all`** + single **`setInspoItems`** (no **`latestInspoRef`** / hydrate event). File input **overlays** CHOOSE FILE row (**affiliate** pattern: full width/height, **`opacity: 0`**, **`zIndex: 3`**). **Thumbnails above** picker. **`ConfirmationModal`**: form notice (**OK** only) for missing inspo / date-time / invalid date; remove-inspo confirm (**REMOVE** / **CANCEL**). Removed inline **`formError`** paragraph.

---

## 2026-04-02 — Consult hair inspo: iOS Photo Library MIME + no `fontSize:0` + serial FileReader

**Context:** User: **Choose file → Photo Library → Add** and **no preview** below CHOOSE FILE.

**Causes addressed:** (1) **`isProbablyImageFile`** rejected WebKit UTIs (**`public.jpeg`**, **`public.heic`**, etc.) because they are not **`image/*`**. (2) **`fontSize: 0`** on the overlay **`input[type=file]`** can break iOS Safari behavior. (3) Parallel **`FileReader`** **`onload`** + **`setInspoItems`** could race (multiple updates from **`prev = []`**).

**Changes:** **`src/pages/booking/consultation/page.tsx`** — broader MIME/UTI + octet-stream/empty-type rules; removed **`fontSize: 0`** on file input; **sequential** **`readImageFileAsDataUrl`** then **one** state merge; **`files` snapshot before `input.value = ''`** (already present).

---

## 2026-04-02 — BCF closures/frontals cart thumbs = shop marbles (not PDP photos)

**Context:** User reported **closures** and **frontals** line thumbnails in **cart dropdown**, **shopping bag**, **checkout**, and **checkout summary** still showed **PDP hero** images instead of the **home/shop** marble PNGs (`closure-{texture}.png`, `frontal-{texture}.png`).

**Decisions / outcomes:** Align with **bundles**: **`shopBcfCartLineThumbnailSrc`** always maps texture + category through **`shopTextureCategoryThumbSrc`** for closures/frontals; do **not** prefer cart line **`image`** (JPG heroes).

**Changes:** **`src/utils/bcfProductOptions.ts`** — removed PDP JPG fallback maps; closures/frontals branch returns **`shopTextureCategoryThumbSrc(t, c)`** only.

---

## 2026-04-02 — Consult hair inspo: iOS photo pick — snapshot `FileList` before clearing input

**Context:** User chose **Photo Library → select → Add** and **no thumbnail** appeared under **CHOOSE FILE**.

**Root cause:** **`handleFileChange`** did **`e.target.value = ''`** immediately after reading **`e.target.files`**. On **iOS Safari / WebKit**, clearing the input can **empty or invalidate** the **`FileList`**, so **`Array.from(list)`** yields nothing and **`FileReader` / `setInspoItems`** never run with real files.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`Array.from(input.files)`** into a **`files` array first**, then **`input.value = ''`**, then filter / read.

---

## 2026-04-01 — Admin meetings: Bookings / Consults hub, consult quotes, `/checkout/bookings`, consult-offer alerts

**Context:** User requested a large admin **Meetings** overhaul: replace **DAY/WEEK/MONTH/YEAR** with **BOOKINGS** (first) and **CONSULTS**; consult cards (premium first) with **Send quote** modal (unit + sub-selections, message, breakdown, internal **CONSULT-** code, **Send alert**); client **Alerts** with **VIEW ORDER** → **`/account/consult-offer`** module (countdown, **Add to bag**); bookings tab with month calendar (red/gray days), appointment lists, **Edit meeting** modal; panels navigate to **`/admin/clients/account?email=`**; **VIEW ALL** by client; Supabase wiring; A/C checkout isolated at **`/checkout/bookings`**, **PROCEED TO CHECKOUT** (no mixed product checkout), no order tracking for booking-only carts.

**Implemented (prior work in this thread):** Migration **`20260402210000_meetings_category_consult_quotes.sql`** (`meetings.category` / `metadata`, `consult_quotes`, RLS). APIs: **`api/booking/consult-meeting.ts`**, **`api/admin/consult-quotes.ts`**, **`api/consult-quote.ts`**, updates to **`api/admin/meetings.ts`**, **`api/booking/appointment-meeting.ts`**. Client: **`AdminMeetingsHub.tsx`**, checkout split and confirm hide tracking for booking lines, **`src/pages/account/consult-offer/page.tsx`**, notifications **`actionText` / `actionRoute`**, **`src/utils/bookingCheckout.ts`** + **`src/utils/api.ts`** helpers, booking PDPs → **`/checkout/bookings`**, assets **`quote-icon.svg`**, **`edit-meeting-icon.svg`**, routes in **`App.tsx`**.

**Remaining / caveats:** Apply DB migration in Supabase; hierarchical unit dropdowns vs full PDP option trees; **edit meeting** → client notification flow; checkout application of **CONSULT-** $40 / 72h codes; **Add to bag** from consult-offer as real cart prefill; calendar paid/balance from real payments. **`npx tsc --noEmit`** still fails on **pre-existing** errors in **`src/pages/admin/brand/page.tsx`** and a pending tab type in **`admin/pending/page.tsx`** — not introduced by meetings work. Lint on meetings/checkout/consult-offer touched files: clean.

**This turn:** Conversation summarized for handoff; verified lints on key files; documented **tsc** baseline; this MEMORY entry.

---

## 2026-04-02 — Vercel build: TS2769 cart filter + TS2559 CartItem vs bookingTier

**Context:** User pasted **Vercel** `npm run build` failure: **`tsc --noEmit`** errors in **`src/pages/booking/appointment/page.tsx`** (line ~717, **`.filter`** on **`unknown[]`**) and **`src/utils/bookingAppointmentFormDraft.ts`** (**`bookingAppointmentHrefForCartItem(item)`** — **`CartItem`** had no property overlap with **`{ bookingTier?: string }`** under TypeScript weak-type checking).

**Changes:** **`appointment/page.tsx`** — filter callback takes **`unknown`** elements: guard **`typeof row === 'object' && row !== null`**, then read **`id`** via cast; avoids incompatible predicate typing on **`unknown[]`**. **`src/types/cart.ts`** — added optional **`bookingTier?: string`** on **`CartItem`** (matches runtime booking lines and satisfies **`bookingAppointmentHrefForCartItem`** / consult href helpers).

**Conventions:** When parsing **`localStorage`** JSON as **`unknown[]`**, narrow each element in **`.filter`** / **`.map`** instead of annotating the parameter as a shaped type.

---

## 2026-04-01 — Consult hair inspo: thumbs below CHOOSE FILE, max 3 photos, modal copy

**Context:** User confirmed hair inspo flow works; wanted **thumbnail row below the CHOOSE FILE row** (not directly under **HAIR INSPO:**), popup text **“MAX PHOTOS REACHED.”** only (no extra line), and **3** photos max instead of **4**.

**Decisions / outcomes:** **`MAX_HAIR_INSPO_PHOTOS = 3`**; **`ConfirmationModal`** for limit uses **`title="MAX PHOTOS REACHED."`**, empty **`message`**, **`confirmText="CLOSE"`**, no cancel. **`src/types/cart.ts`** comment updated to max **3** inspo filenames on PDP where applicable.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — flex column: **HAIR INSPO** label → **CHOOSE FILE** block → **thumbnails** after that block; **`loadInspoDraftFromSession`** **`.slice(0, MAX_HAIR_INSPO_PHOTOS)`** so old session drafts with 4 items trim to 3 on load. (Prior thread work: iOS **`FileList`** snapshot before clearing input, **`isProbablyImageFile`** for WebKit UTIs, sequential **`FileReader`**, affiliate-style overlay input, remove confirm modal.)

---

## 2026-04-02 — Booking cart red line: NEW INSTALL / RE-INSTALL / WIG + INSTALL / WIG ONLY

**Context:** User asked that the red subtitle for **booking** lines in **cart dropdown**, **shopping bag**, **checkout**, and **checkout summary** not show **RAW HUMAN HAIR** (that copy stays for **BCF** shop lines). Appointments should show **NEW INSTALL** or **RE-INSTALL**; consults **WIG + INSTALL** or **WIG ONLY**.

**Changes:** **`src/utils/cartLineRedAndDetails.ts`** — new **`bookingCartRedSubtitle`**: **`booking-appointment`** from **`bookingInstallKind`** (**`RE_INSTALL`** → **RE-INSTALL**, else **NEW INSTALL**); **`booking-consult`** from **`bookingHairOption`** or fallback **`bookingBagSubtitle`**. **`CartDropdown`**, **`shopping-bag/page.tsx`** (**`bagProductRedSubtitle`**), **`checkoutOrderStripDisplay.ts`** (**`orderStripRedSubtitle`**) use it for A/C types only; **`shop-texture-category`** still uses **`CART_RED_LINE_BCF_BOOKING`**. **`src/types/cart.ts`** — **`bookingHairOption?: string`** on **`CartItem`**.

---

## 2026-04-01 — A/C booking: centered hair inspo thumbs + divider above calendar

**Context:** User wanted **hair inspo thumbnails** centered horizontally on the consult card with **8px** space above the row; a **gray border** between **ADDITIONAL NOTES** and the **calendar** on **appointment** and **consultation** pages.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — inspo thumb flex row **`marginTop: '14px'`**, **`justifyContent: 'center'`**; premium **WIG + INSTALL** calendar wrapper **`borderTop: '1px solid #e5e7eb'`**, **`paddingTop: '20px'`** (replaces **`marginTop: '2px'`**). **`src/pages/booking/appointment/page.tsx`** — notes block **`marginBottom: 0`**; calendar wrapper same **`borderTop`** / **`paddingTop`** (replaces stacked **`marginTop`/`marginBottom`** **22px** gap).

---

## 2026-04-01 — Consult inspo spacing + A/C checkout CTA label locked

**Context:** User asked for **6px more** space above hair inspo attachment thumbnails; **PROCEED TO CHECKOUT** on appointment/consult should **not** switch to **ADDING...** / **IN THE BAG** when clicked — label stays **PROCEED TO CHECKOUT**.

**Changes:** **`consultation/page.tsx`** — thumb row **`marginTop: '14px'`** (was 8px). **`BookingPageChrome.tsx`** — **`NoirStyleAddToBagButton`** prop **`alwaysShowIdleLabel`** (keeps **`idleLabel`** for all states; still **`disabled`** while **`adding`**). **`consultation/page.tsx`** and **`appointment/page.tsx`** pass **`alwaysShowIdleLabel`** on the checkout CTA.

---

## 2026-04-02 — Checkout: TS6133 `redeemConsultQuote` unused import (Vercel build)

**Context:** User’s **Vercel** **`npm run build`** failed with **`src/pages/checkout/page.tsx`**: **`redeemConsultQuote` is declared but its value is never read** (**TS6133**).

**Changes:** Removed **`redeemConsultQuote`** from the top-level **`../../utils/api`** import list; after a successful order with an applied consult quote, **`redeemConsultQuote`** is loaded via **`await import('../../utils/api')`** inside that **`try`** block, then called — same runtime behavior without an unused static import binding.

---

## 2026-04-02 — Consult hair option defaults + premium-only subcopy

**Context:** User asked: **standard** members should land on **WIG ONLY**; **THIS OPTION IS FOR PREMIUM MEMBERS ONLY** should appear when they select **WIG + INSTALL**. **Premium** members should default to **WIG + INSTALL** and **not** see that line under the option.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`hairOption`** lazy-initializes from **`isPremiumMemberForGatedFeatures()`**; **`prevPremiumForHairRef` + `useEffect` on `authRev`** resets to **WIG + INSTALL** / **WIG ONLY** only when premium status **changes** (avoids wiping **WIG + INSTALL** on repeated **`signInStateChanged`**). Inline subcopy under **WIG + INSTALL** renders only when **`!isPremium`** and that option is selected.

---

## 2026-04-02 — Consult codes at checkout + edit-meeting client alerts

**Context:** User asked to implement **both** priorities: **(1) migration + consult code at checkout** and **(2) edit-meeting client alerts** (from admin meetings handoff).

**Consult checkout:** New migration **`supabase/migrations/20260403140000_consult_quotes_redeemed_at.sql`** — **`consult_quotes.redeemed_at`**. APIs **`api/checkout/validate-consult-code.ts`**, **`api/checkout/redeem-consult-code.ts`**. **`src/utils/api.ts`** — **`validateConsultDiscountCode`**, **`redeemConsultQuote`**. **`src/pages/checkout/page.tsx`** — **`appliedConsultQuote`** state; **`CONSULT-`** branch in **`handleApplyDiscountCode`** (async); excludes **booking** lines from eligible subtotal and blocks **`/checkout/bookings`**; mutual exclusion with referral / gift card / brand / flat codes; **`consultDiscountAmount`** in **`totalDiscount`**; order-success paths call **`redeemConsultQuote`** (card submit + wallet **`handlePaymentClick`**).

**Meeting alerts:** **`api/admin/meeting-client-alert.ts`** (admin-only) appends **notifications** with **`REVIEW APPOINTMENT`** → **`/account/notifications`** and **`meetingAlert`** payload. **`postAdminMeetingClientAlert`** in **`api.ts`**. **`AdminMeetingsHub`** — **RESCHEDULE APPOINTMENT (NOTIFY CLIENT)** / **CANCEL APPOINTMENT (NOTIFY CLIENT)** after **`patchAdminMeeting`**; resolves client via **`userId`** or **`clientEmail`**.

**Also:** **`motherboard/CORE.md`** updated with consult-code + meeting-alert flow.

---

## 2026-04-02 — A/C calendar gap + consult hair inspo “SUBMITTED” copy

**Context:** User asked: when the **SCHEDULED DATE & TIME** red line is **not** shown below the calendar flow on **appointment** and **consultation** pages, **tighten vertical spacing by 6px**; change hair inspo row from **`N OF 3 PHOTOS`** to **`N OF 3 PHOTOS SUBMITTED.`** (e.g. **1 OF 3 PHOTOS SUBMITTED.**).

**Changes:** **`consultation/page.tsx`** — **`hairInspoSubmittedLabel`**, used on the CHOOSE FILE row (open + max-photos states); **`consultScheduledSummaryVisible`**; calendar block **`marginBottom`** **`16px`** vs **`10px`** when the scheduled summary is absent. **`appointment/page.tsx`** — **`appointmentScheduledSummaryVisible`**; block wrapping **SCHEDULED** + **ESTIMATED** lines uses **`marginBottom`** **`20px`** vs **`14px`** when the scheduled line is absent.

---

## 2026-04-02 — Admin meetings: VIEW ALL below card, in-card toggle + close

**Context:** User wanted **VIEW ALL BOOKINGS** and **VIEW ALL CONSULTS** **below** the main meetings card (not inside), styled like **Concierge** **SUBMIT MESSAGE** (black border, red text); no parentheses in labels; **not** a modal — toggle **inside** the main card with **X** close like **Rewards** tier-benefits / loyalty inner cards (**close-icon.svg**, red filter).

**Changes:** **`src/pages/admin/meetings/AdminMeetingsHub.tsx`** — Replaced **`showViewAll`** modal with **`viewAllMode: 'bookings' | 'consults' | null`**; **`groupMeetingsByClientEmail`** helper + **`viewAllGroups`** memo; when **`viewAllMode`** set, tabs swap for header **VIEW ALL BOOKINGS** / **VIEW ALL CONSULTS** + close button; scroll area shows grouped list; two full-width buttons under the card (**concierge** classes + **`#EB1C24`**); buttons toggle open/close per mode and set **`mainTab`**.

---

## 2026-04-02 — Validation modals: unified “FORGETTING SOMETHING?” header

**Context:** User asked to replace repetitive red **`ConfirmationModal`** titles (**INPUT FIELD REQUIRED**, **MISSING INPUT FIELD**, **HAIR INSPO REQUIRED**, etc.) with a single uppercase header **FORGETTING SOMETHING?**, keeping black body text for the specific missing item or action.

**Changes:** **`title="FORGETTING SOMETHING?"`** (or equivalent **`setConsultFormNotice` / `setCheckoutNotice` / `setLoadCardNotice`**) in **`checkout/page.tsx`** (field validation, terms-before-checkout, Stripe sign-in notice), **`sign-in/page.tsx`**, **`shop/order-form/page.tsx`**, **`account/payment/page.tsx`**, **`account/shipping/page.tsx`**, **`account/reviews/leave-review-order/page.tsx`**, **`booking/consultation/page.tsx`** (hair inspo + date/time required), **`account/membership/page.tsx`** (tier selection), **`account/load-card/page.tsx`** (sign-in gate). **Consult** **DATE NOT AVAILABLE** left unchanged (not a “missing field” notice). Trimmed leading space on checkout terms modal message.

---

## 2026-04-02 — Consult alert CTA: VIEW QUOTE; admin founder + header example

**Context:** User wanted the consult **“YOUR ORDER IS READY!”** client notification red link to say **VIEW QUOTE** instead of **VIEW ORDER**; an **example** of that alert on the **admin founder** notifications UI; and to treat **`kateenaarmstrong@gmail.com`** as **admin founder** in ongoing copy (recorded in motherboard).

**Decisions / terminology:** **Admin founder** = **`kateenaarmstrong@gmail.com`** (same as **`FOUNDER_PRIVILEGED_ADMIN_EMAIL`**). **`isAdminFounderAccount`** aliases **`isAyoteenzAdminAccount`** in **`adminAuth.ts`**. **`motherboard/CORE.md`** updated.

**Changes:** **`api/admin/consult-quotes.ts`** — **`actionText: 'VIEW QUOTE'`** on the consult-quote notification item. **`AdminMeetingsHub.tsx`** — send-alert confirm copy **VIEW QUOTE (CONSULT OFFER)**. **`AdminHeader.tsx`** — when signed-in admin is admin founder, inject mock row **ACCOUNT ALERT - CONSULT QUOTE (VIEW QUOTE)** (id **62**) after the affiliate account-alert row in the bell dropdown list.

---

## 2026-04-02 — Appointment default RE-INSTALL + A/C calendar nav arrows 25% smaller

**Context:** User asked for **RE-INSTALL** to be the default selection on the **appointment** booking PDP, and **25% smaller** red **left/right** month arrows on the **A/C** inline calendars only.

**Changes:** **`appointment/page.tsx`** — **`installKind`** initial state fallback when no valid draft: **`RE_INSTALL`** (was **`NEW_INSTALL`**). **`bookingAppointmentFormDraft.ts`** — cart→draft fallback **`installKind`**: **`RE_INSTALL`** when **`bookingInstallKind`** missing/invalid. **`BrandExpiresDatePicker.tsx`** — optional **`navArrowScale`** (default **1**); arrows use **`round(base * scale)`** (**22** / **24** px bases). **`appointment/page.tsx`** and **`consultation/page.tsx`** pass **`navArrowScale={0.75}`**; **admin brand** picker unchanged (**scale 1**).

---

## 2026-04-02 — Consult max-photos copy, checkout booking nav, bookings checkout = digital ship, inspo × smaller

**Context:** User asked why the **MAX PHOTOS REACHED** modal had no black body text; to show nav **CHECKOUT > BOOKING** on bookings checkout; to treat **A/C** bookings checkout like **digital** (no shipping flow); to shrink hair inspo thumbnail **remove** (**×**) control by **30%** on the consult page.

**Decisions / outcomes:** Max-photos modal body restored (**REMOVE OR REPLACE AN IMAGE TO ADD MORE.**). Bookings checkout uses **`checkoutSkipsShipping`** (**subscription OR digital-only OR bookings-only**) so shipping address, calculator, method, delivery, address-confirm, tax/shipping summary rows, validations, Route protection, and related paths match digital-style checkout; **taxable** and **points-eligible** amounts are **0** for bookings-only cart. **`isBookingsOnlyCheckoutState(pathname, items)`** added to **`bookingCheckout.ts`**.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`ConfirmationModal`** **`message`** for max inspo; delete button **14×14** px, icon **8.4×8.4** px. **`src/pages/checkout/page.tsx`** — nav **BOOKING**; **`checkoutSkipsShipping`** wiring. **`src/utils/bookingCheckout.ts`** — **`isBookingsOnlyCheckoutState`**. **`motherboard/CORE.md`** — short **`/checkout/bookings`** note.

---

## 2026-04-02 — Consult hair inspo ×: nudge down 2px, left 1px

**Context (full chat):** Same session as consult max-photos modal copy, **CHECKOUT > BOOKING**, bookings-only checkout like digital (no shipping), and hair inspo remove control **30% smaller**; user then asked to move those remove icons **down 2px** and **left 1px**.

**Changes (this turn):** **`src/pages/booking/consultation/page.tsx`** — absolute remove button **`top: '-8px'`** (was **`-10px`**), **`right: '-9px'`** (was **`-10px`**).

---

## 2026-04-02 — Consult hair inspo ×: another 2px left

**Context (full chat):** Consult/checkout/inspo work above; user asked to move hair inspo remove controls **2px further left** from **`right: '-9px'`**.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — remove button **`right: '-7px'`** (was **`-9px`**); **`top: '-8px'`** unchanged.

---

## 2026-04-02 — Consult hair inspo ×: right −4px, down 3px

**Context (full chat):** Continues consult hair inspo remove-button positioning; user asked for **`right: '-4px'`** (was **`-7px`**) and **3px lower** (**`top: '-5px'`**, was **`-8px`**).

**Changes:** **`src/pages/booking/consultation/page.tsx`** — remove control **`top: '-5px'`**, **`right: '-4px'`**.

---

## 2026-04-02 — Consult hair inspo thumbnails: +3px gap

**Context (full chat):** Continues consult hair inspo UI; user asked for **3px more spacing** between attachment thumbnails.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — **`.consult-hair-inspo-thumbs`** flex **`gap`** **`'13px'`** (was **`'10px'`**).

---

## 2026-04-02 — Consult hair inspo ×: up 1px

**Context (full chat):** Consult hair inspo remove control; user asked to move it **up 1px**.

**Changes:** **`src/pages/booking/consultation/page.tsx`** — remove control **`top: '-6px'`** (was **`-5px`**); **`right: '-4px'`** unchanged.

---

## 2026-04-02 — Loyalty net for consult/booking lines, consult date + duration copy

**Context (full chat):** User wanted **credited** booking lines (e.g. **consult** deposit) not **double-counted** in loyalty — earn **1:1 on the line (e.g. 40 pts)** while consult codes / stack apply to merchandise; **consult** scheduled date display **`MM/DD/YYYY`** (slashes); restore **FINAL DURATION CONFIRMED AFTER CHECKOUT.** under scheduled time on consult page.

**Decisions / outcomes:** **`computePointsEligibleNetUsd`** allocates **referral / legacy / gift card / voucher** discounts using **merchandise subtotal only** in the proration numerator; **booking** lines add **full line USD** after **merch net** (same for mixed special-offer branch). **Confirm order** uses **`pointsEligibleNetAmount`** (was **`pointsEligibleAmount`**).

**Changes:** **`src/utils/loyaltyPointsEligibleNet.ts`** — **`peMerch` / `consultSubMerch`**, **`allocatedToMerch`**, **`merchNet + peBooking`**; mixed-offer branch **`allocatedToMerchInPool`** + **`merchNetInPool + peBookingInPool`**. **`src/pages/checkout/page.tsx`** — **`basePoints`** from **`pointsEligibleNetAmount`**. **`src/pages/booking/consultation/page.tsx`** — **`formatConsultIsoForDisplay`** slashes; scheduled **`&lt;p&gt;`** adds **`FINAL DURATION…`** line via **`<br />`**.

---

## 2026-04-03 — Vercel build TypeScript fixes (sign-in href imports, nullable parse, unused checkout var)

**Context:** User shared a failed Vercel build log from `master` (commit `d464cc0`) and asked to resolve TypeScript errors blocking deployment.

**Topics covered (entire conversation so far):**
- Reproduced and addressed the exact reported errors:
  - `Cannot find name 'signInHrefWithReturnTo'` in:
    - `src/pages/account/shipping/page.tsx`
    - `src/pages/wishlist/lists/page.tsx`
  - `Argument of type 'string | null' is not assignable to parameter of type 'string'` in `src/pages/checkout/confirm/page.tsx` (snapshot parsing path).
  - `TS6133: 'pointsEligibleAmount' is declared but its value is never read` in `src/pages/checkout/page.tsx`.
- Installed dependencies locally to run the same build command (`npm run build`) and verify fixes.

**Decisions / outcomes:**
- Added missing imports for `signInHrefWithReturnTo` in the two affected pages.
- Kept logic intact in checkout confirm while making parsing type-safe by converting snapshot input with `String(snap)` before `parseFloat`.
- Removed the unused `pointsEligibleAmount` declaration in checkout to satisfy `noUnusedLocals`/TS6133 without changing checkout totals behavior.
- Local build now passes (`tsc --noEmit && vite build`).

**Changes:**
- `src/pages/account/shipping/page.tsx` — add `signInHrefWithReturnTo` import.
- `src/pages/wishlist/lists/page.tsx` — add `signInHrefWithReturnTo` import.
- `src/pages/checkout/confirm/page.tsx` — type-safe `parseFloat(String(snap))` in both loyalty snapshot read paths.
- `src/pages/checkout/page.tsx` — remove unused `pointsEligibleAmount` calculation.

**Conventions:**
- When build failures mention missing `signInHrefWithReturnTo`, ensure page modules importing `useLocation` and calling the helper also import `../../utils/signInReturnTo` (or relative equivalent).
- For optional `sessionStorage` values in TS-strict builds, narrow to string (or coerce with `String(...)`) before numeric parsing.

---

## 2026-04-03 — Admin Meetings bookings tab: service-type composition, tier colors, A/C red calendar arrows

**Context:** After prior build-fix and meetings card-corner updates on `master`, user requested bookings-tab behavior and styling parity updates on `/admin/meetings`: service type should always lead with install kind then add-ons (never add-ons alone), tier tag colors should be premium black / standard gray, and calendar month arrows should match A/C booking calendar red arrow assets.

**Topics covered (entire conversation so far):**
- Confirmed the bookings card currently rendered raw `m.type` values, which can surface add-on-only strings without install-kind prefix depending on source data.
- Implemented bookings service formatter that composes display as:
  - `RE-INSTALL: CLEAN LACE, BRAIDS, ...` or
  - `NEW INSTALL: BRAIDS, MAKEUP, TRAVEL FEE`
  with install-kind precedence from metadata (`bookingInstallKind`/`installKind`) and fallback parsing from meeting `type`/`notes`.
- Added add-on normalization and ordering consistent with appointment booking options (`CLEAN LACE`, `BRAIDS`, `BROW SCULPTING`, `BROW TINT`, `MAKEUP`, `MINK LASHES`, `TRAVEL FEE`), de-duplicated.
- Updated bookings-tab and view-all bookings display to use formatted booking service string instead of raw `m.type`.
- Updated premium/standard badge text color:
  - premium = `#000000`
  - standard = `#808080`
  applied to both bookings and consult cards for consistency.
- Replaced bookings calendar text chevrons (`‹` / `›`) with red A/C calendar arrow assets:
  - `/assets/calendar-left-arrow.svg`
  - `/assets/calendar-right-arrow.svg`

**Decisions / outcomes:**
- Booking service display must never show add-ons without an install-kind prefix; fallback defaults to `NEW INSTALL` when install-kind token is unavailable.
- Tier label coloring now semantically reflects membership status in cards (black premium, gray standard).
- Bookings tab calendar month navigation now visually matches A/C booking page arrow style.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - Added booking service normalization/composition helpers.
  - Added tier color helper and applied it in card headers.
  - Swapped month nav chevrons for red calendar arrow images.
  - Updated bookings/view-all rows to render formatted booking service text.

**Conventions:**
- In admin meetings bookings UI, render service line as install-kind-first (`NEW INSTALL` / `RE-INSTALL`) plus add-ons list; do not display add-ons-only service labels.

---

## 2026-04-03 — Admin meetings panels: square corners on both tabs

**Context:** After the build-fix deployment flow, user requested a UI tweak: on Admin Meetings, the white panels with gray borders should have square corners in both tabs.

**Topics covered (entire conversation so far):**
- Confirmed prior local pushed changes were still present on `master` and not overwritten.
- Fast-forwarded `master` to include the build-fix commit so deployable code included both prior user changes and TS fixes.
- Attempted to trigger Vercel deployment from cloud runner; blocked by invalid Vercel token in this environment.
- Implemented this follow-up UI request: removed rounded corners from meetings list panels in both Bookings and Consults tabs.

**Decisions / outcomes:**
- Only the card corner radius was changed; border color, spacing, and other card styles remain unchanged.
- Build remains green after the style update.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`:
  - Bookings panel row cards: removed `borderRadius: '6px'`.
  - Consults panel row cards: removed `borderRadius: '6px'`.

**Conventions:**
- For Admin Meetings list cards (bookings + consults), keep white/gray bordered panels square-cornered unless a future design request says otherwise.

---

## 2026-04-03 — Admin meetings UX polish + global admin search wiring

**Context:** User requested additional admin updates in one pass: remove bookings calendar helper copy, fix no-appointment date cell background behavior, enrich consult-tab mock notes/images and ensure tap opens client details (instead of not found), remove in-card "MEETINGS" heading above view-all toggles, and make admin header search truly functional across admin pages for clients/products.

**Topics covered (entire conversation so far):**
- **Admin meetings bookings calendar copy + no-appointment cell background**
  - Removed the text line: `RED = DAY WITH AT LEAST ONE APPOINTMENT...`.
  - Updated day-cell style so **all no-appointment dates** render with gray background (same treatment as other no-appointment cells), not white.
- **Consults tab realism + open client details**
  - Added realistic mock consult content in meetings mock generator:
    - richer consult notes
    - `inspoFileNames` set to real stock image asset paths (affiliate-style): `/assets/gallery-mock.png`
  - Changed card click navigation from `/admin/clients/account?email=...` to `/admin/clients?email=...` so tapping consult panels opens the integrated clients details flow used in current admin clients page.
  - Updated API/mock bridge in `normalizeApiMeeting` to map `row.client_email`/`row.client_name` correctly; this fixes missing email/name on API-backed rows that previously led to "client not found" behavior.
- **Remove "MEETINGS" text above view-all toggles**
  - Removed the in-card `MEETINGS` heading row so the section starts directly with tab/view-all controls as requested.
- **Admin header search should actually function across admin pages**
  - Extended `AdminHeader` with global search navigation behavior (`q` query param submit on Enter and optional target path).
  - Added contextual placeholders:
    - Clients/details pages: `SEARCH CLIENTS...`
    - Revenue page: `SEARCH PRODUCTS...`
  - Wired clients page to consume global `q` and prefill/filter overview list.
  - Wired revenue page header search to target `/admin/revenue` and made PRODUCTS tab list filter by `q`, with explicit empty-result copy (`NO PRODUCTS MATCH YOUR SEARCH.`).

**Decisions / outcomes:**
- Meetings mock consult cards now load with realistic stock-media placeholders and richer notes while keeping existing layout.
- Meeting card taps now route into the active clients details surface (`/admin/clients?email=...`) instead of the legacy account subpage, preventing false "client not found" for mock rows.
- Global admin search is now submit-driven and page-consumable, not just a visual input.

**Changes:**
- `src/utils/adminMeetingsMock.ts`
  - richer mock consultation notes/inspo
  - map API `client_email`/`client_name` in `normalizeApiMeeting`
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - remove in-card `MEETINGS` heading
  - remove red/gray helper text line
  - gray background for no-appointment date cells
  - tap-to-open route: `/admin/clients?email=...`
  - consult image tiles now show actual stock image previews from `inspoFileNames`
- `src/pages/admin/components/AdminHeader.tsx`
  - global search submit behavior (query-param routing)
  - context-aware search placeholders
- `src/pages/admin/clients/page.tsx`
  - consume global `q` into `clientSearchQuery`
  - pass global search target path to header
- `src/pages/admin/revenue/page.tsx`
  - consume `q` query
  - pass global search target path to header
  - filter PRODUCTS list by query + no-match message

**Conventions:**
- Admin meeting cards should navigate to `/admin/clients?email=...` for detail context in current app flow.
- Admin header search should produce a concrete page-level filter via query param when external search handler is not supplied.

---

## 2026-04-03 — Meetings consult names red + strict non-appointment calendar gray background

**Context:** User reported two remaining UI mismatches after the prior meetings/search pass: consult-tab client names should be red, and bookings calendar still showed some white background dates that did not have appointments.

**Topics covered (entire conversation so far):**
- Verified consult card name row still rendered in default black while the user wanted red.
- Verified bookings calendar cell style needed a stricter white/gray rule to avoid any non-appointment dates rendering white.
- Applied targeted styling adjustments in `AdminMeetingsHub` only (no flow or data-model changes).

**Decisions / outcomes:**
- Consult-tab client names now render in brand red (`#EB1C24`), while premium/standard badge color behavior remains as previously set.
- Bookings calendar date cells now use white background **only when `hasAppt` is true**; all non-appointment dates (in-month or out-of-month) are gray.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings calendar cell background condition changed to `hasAppt ? '#fff' : '#f3f4f6'`
  - consult card client name line updated to red text

**Conventions:**
- On admin meetings bookings calendar, appointment dates (red text) are the only dates with white background; all other dates stay gray.

---

## 2026-04-03 — Deploy target correction + consult updates ported to preview/mobile and master

**Context:** After implementing consult-tab and booking-panel updates, user reported no visible changes. Build logs showed Vercel deployed `master` at commit `00e1400`, while the implemented work had been pushed to `cursor/client-booking-panel-details-a360` (PR #2 targeting `preview/mobile`). User asked whether both preview and main could be updated.

**Topics covered (entire conversation so far):**
- Confirmed mismatch between deployed branch/commit and the branch holding the consult updates.
- Verified fix commits (`e00c21c`, `83bade9`) existed on `cursor/client-booking-panel-details-a360` and not on deployed `master`.
- Ported consult-update commit to **preview/mobile** first:
  - cherry-picked `e00c21c`
  - pushed `preview/mobile` to `e0b892b`
- Ported same update to **master**:
  - created a local tracking branch from `origin/master`
  - cherry-pick encountered conflicts in `AdminMeetingsHub`; resolved using the consult-update version
  - completed cherry-pick and fast-forwarded/pushed `master` to `5d93d80`
- Re-verified remote heads after pushes:
  - `origin/preview/mobile`: `e0b892b`
  - `origin/master`: `5d93d80`

**Decisions / outcomes:**
- Both requested targets now contain the consult update set:
  - preview branch updated for preview deployments
  - main/master updated for production deployments that track master
- Root cause of “no changes visible” was confirmed as branch mismatch in deployment target, not missing local implementation.

**Changes:**
- Branch operations (no additional feature-file edits beyond conflict-resolved cherry-pick content):
  - `preview/mobile` now includes commit `e0b892b`
  - `master` now includes commit `5d93d80`
- `motherboard/MEMORY.md` appended with this conversation state.

**Conventions:**
- When a user reports “changes not visible,” verify deployed branch/commit vs implementation branch before further UI debugging.

## 2026-04-03 — Preview branch workflow setup (`preview/mobile`)

**Context:** User asked for a stable mobile-review workflow using Vercel previews without repeated production deploys. They confirmed preview links were stale and requested a dedicated branch to keep previews current.

**Topics covered (entire conversation so far):**
- Clarified that branch-specific Vercel preview URLs are snapshot-based and can become stale if not updated by new commits on that branch.
- Recommended workflow: keep production on `master`, do iterative changes on a persistent preview branch, and review the latest Vercel preview generated per commit on that branch.
- User requested creation of a dedicated branch now.

**Decisions / outcomes:**
- Created and switched to local branch `preview/mobile` from current repository state.
- Pushed branch to `origin` and set upstream tracking so future commits on this branch will generate/update preview deployments.

**Changes:**
- Git branch operations only (no code file changes):
  - created `preview/mobile`
  - pushed `preview/mobile` to remote
  - set upstream tracking to `origin/preview/mobile`

**Conventions:**
- Going forward for this chat/workflow, use `preview/mobile` for iterative changes and mobile Vercel preview validation; only push/merge to `master` when explicitly asked to ship production.

---

## 2026-04-03 — Preview check: bookings helper text already removed + current preview links

**Context:** User asked to "test it & create a PR" and specifically remove bookings helper copy on Admin Meetings: `RED = DAY WITH AT LEAST ONE APPOINTMENT...`.

**Topics covered (entire conversation so far):**
- Verified branch/workflow state on `preview/mobile`.
- Searched `src/pages/admin/meetings/AdminMeetingsHub.tsx` for the exact helper sentence and related fragments; no matches found because the line was already removed in current branch history.
- Ran full build to confirm branch is healthy before preview testing.
- Attempted PR creation, but there are no net code differences from `master` at this moment, so no PR can be created for this exact request alone.
- Retrieved current Vercel deployment status URLs for the latest `preview/mobile` commit so user can open a fresh preview directly.

**Decisions / outcomes:**
- No code edit was needed for this request because the targeted line was already absent.
- `preview/mobile` is build-green and has successful Vercel deploy status for latest commit.
- For next requested UI/code tweak, committing on `preview/mobile` will allow creating/updating PR and yield a fresh mobile preview URL.

**Changes:**
- No source-code change required for this specific request.
- Validation run: `npm run build` (pass).

**Conventions:**
- If a requested removal already exists in branch state, confirm with search + build and provide latest preview URLs/check locations instead of forcing no-op commits.

---

## 2026-04-03 — Meetings header restored + completed bookings/consults summary panels

**Context:** On `preview/mobile`, user clarified the "MEETINGS" removal was too broad: they wanted only the text above the card toggles removed earlier, not the main meetings header itself. They also requested data panels above meetings tabs showing totals for completed bookings and completed consults.

**Topics covered (entire conversation so far):**
- Re-read current `AdminMeetingsHub` structure and confirmed the top in-card `MEETINGS` heading had been removed in prior pass.
- Restored that in-card heading row while keeping tab/toggle structure intact.
- Added two summary panels directly above the BOOKINGS/CONSULTS tabs in non-view-all mode:
  - **COMPLETED BOOKINGS** (count)
  - **COMPLETED CONSULTS** (count)
- Counts are computed from merged meetings lists and include statuses normalized as `completed` plus fallback handling for `delivered`/`fulfilled` strings.
- Kept panel styling aligned with existing admin card metrics (soft dark background, red numeric accent, gray labels).

**Decisions / outcomes:**
- Main meetings header is visible again on the page card.
- Completed-bookings and completed-consults metrics are now immediately visible above tabs for quick admin scanning.
- Build remains passing after the update.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - restored in-card `MEETINGS` heading row
  - added completed totals computations
  - added two metric panels above tabs in standard (non-view-all) mode

**Conventions:**
- On Admin Meetings, keep the main card heading (`MEETINGS`) and place aggregate metrics above tab selectors when requested; only remove duplicated helper copy if explicitly targeted.

---

## 2026-04-03 — Meetings summary labels renamed to TOTAL BOOKED / TOTAL CONSULTED

**Context:** After adding completed-bookings/consults metric panels above meetings tabs on `preview/mobile`, user requested exact label text changes: "total booked" and "total consulted".

**Topics covered (entire conversation so far):**
- Located the two newly added panel labels in `AdminMeetingsHub`.
- Renamed labels from:
  - `COMPLETED BOOKINGS` → `TOTAL BOOKED`
  - `COMPLETED CONSULTS` → `TOTAL CONSULTED`
- Re-ran full build validation after label update.

**Decisions / outcomes:**
- Summary panel labels now match user wording exactly.
- No logic/counting changes were made; only label text changed.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx` — panel label text update.

**Conventions:**
- For this meetings summary section, use label text `TOTAL BOOKED` and `TOTAL CONSULTED` unless explicitly changed later.

---

## 2026-04-03 — Admin meetings calendar date cells: square corners

**Context:** User requested another visual adjustment on `preview/mobile`: make admin meetings calendar date cells square instead of rounded.

**Topics covered (entire conversation so far):**
- Located date-cell corner styling in `AdminMeetingsHub` calendar button styles.
- Updated calendar day cell `borderRadius` from rounded (`'4px'`) to square (`'0'`).
- Left summary metric panel corners unchanged because the request targeted the calendar.
- Re-ran full build validation after the style tweak.

**Decisions / outcomes:**
- Admin meetings calendar date cells are now square-cornered.
- No behavioral/calendar logic changes; styling only.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx` — bookings calendar date-cell `borderRadius: '0'`.

**Conventions:**
- For admin meetings calendar date cells, use square corners unless future design direction changes.

---

## 2026-04-03 — Meetings mock-client source aligned to client overview + meetings tab spacing matched to marketing

**Context:** After prior fixes (build issues, admin meetings styling, preview/mobile workflow, bookings add-on wrap, consult mock image repair), user requested two consistency updates: (1) Admin Meetings mock clients should use the same mock client identities as Admin Client Overview, and (2) tab section spacing on Meetings should match the spacing above tabs on Admin Marketing.

**Topics covered (entire conversation so far):**
- Verified current mismatch: meetings mock generation used its own local first/last-name arrays while admin clients overview uses `getMockClientsForAyoteenz()` as the authoritative mock dataset.
- Confirmed meetings already aligned by email pattern (`mock1@test.com`...`mock25@test.com`) but names/tier assignment could drift from client overview because of separate generation logic.
- Updated meetings mock source to read from the same mock client overview provider (`getMockClientsForAyoteenz()`), with local fallback identities only if that source is unavailable.
- Mapped each picked mock client’s membership type to meeting metadata tier (`premium`/`standard`) so card badges and client details remain consistent across admin surfaces.
- Applied tab-area spacing parity request: adjusted meetings panel spacing above BOOKINGS/CONSULTS tabs to mirror marketing’s visual breathing room pattern (`marginTop: 12px`, `mb-4` for panel block).
- Kept prior fixes intact (bookings third add-on wraps to second line and consult mock image paths/fallbacks).
- Re-ran full production build validation.

**Decisions / outcomes:**
- Admin Meetings mock rows now use the same mock identity pool as Client Overview (name + email + premium/standard tier alignment), improving cross-page consistency when opening client details from meetings.
- Meetings tab area now has matching top spacing feel with Marketing’s tab section.
- Build remains passing after these updates.

**Changes:**
- `src/utils/adminMeetingsMock.ts`
  - imported `getMockClientsForAyoteenz` from Admin Clients page
  - replaced local name-picking arrays with `getMockClientIdentities()` + cached client-overview-derived identities
  - added resilient fallback identity list for offline/source-failure scenarios
  - switched mock meeting client selection to `pickMockClient(...)`
  - set consultation `metadata.tier` from selected client membership type
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - changed meetings summary-panel block spacing to `mb-4` with `marginTop: '12px'` for marketing-aligned tab spacing

**Conventions:**
- For admin mock consistency, meetings should source mock client identities from the same overview provider (`getMockClientsForAyoteenz`) rather than maintaining a separate name list.
- For meetings/marketing visual parity, keep comparable top spacing before tab selectors unless explicitly changed.

---

## 2026-04-03 — Admin meetings scroll/padding aligned to marketing card spacing

**Context:** Continuing the same admin meetings polish thread (after TypeScript build fixes, meetings card/style updates, preview/mobile workflow, totals panel text updates, and square calendar date cells), user requested that the admin meetings page scroll/card padding match the admin marketing card so text/cards are not too close to the main card edge.

**Topics covered (entire conversation so far):**
- Reviewed `src/pages/admin/marketing/page.tsx` and `src/pages/admin/meetings/AdminMeetingsHub.tsx` side-by-side to compare inner card spacing + scroll structure.
- Confirmed Marketing uses a two-layer pattern:
  - outer content wrapper with `paddingLeft/Right: 20px` and `paddingBottom: 24px`
  - inner `overflow-y-auto` region with `paddingTop: 2px`
- Found Meetings used a single scroll container (`overflow-y-auto px-5 py-3`) that made content visually tighter against the card edge relative to Marketing.
- Updated Meetings to use the same two-layer wrapper/scroller spacing pattern as Marketing.
- Re-ran full production build to verify no regressions.

**Decisions / outcomes:**
- Meetings content area now has matching horizontal/vertical breathing room to Marketing, improving readability and visual consistency.
- Scroll behavior remains intact; this is a layout-spacing refactor only.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - replaced single `overflow-y-auto px-5 py-3` content container with:
    - outer wrapper: `paddingLeft: 20px`, `paddingRight: 20px`, `paddingBottom: 24px`
    - inner scroller: `overflow-y-auto`, `maxHeight: calc(100dvh - 240px)`, `paddingTop: 2px`

**Conventions:**
- For admin card pages that should feel visually consistent (Marketing + Meetings), prefer the same inner spacing/scroll shell pattern (20px side padding + separated vertical scroller) unless a page intentionally diverges.

---

## 2026-04-03 — Bookings tab install/add-on line redesign + calendar top spacing

**Context:** Continuing this chat’s admin polish stream (TypeScript build fixes, meetings UI refinements, preview/mobile workflow, mock-data consistency, and dashboard meetings source unification), user requested a specific bookings-tab content/layout change: add `12px` spacing above the bookings calendar, stop wrapping add-ons by count, and instead show a red install line that declares install type + unit + USD price while moving add-ons to a separate black line below.

**Topics covered (entire conversation so far):**
- Verified current bookings cards were still rendering install + add-ons as a combined service line with line wrapping behavior from the prior request.
- Added top spacing above the bookings calendar header row (`marginTop: '12px'`) to match requested breathing room.
- Reworked bookings card text rendering into two explicit lines:
  - **line 1 (red):** `NEW INSTALL: BLANCO $960 USD` (or `RE-INSTALL: ...`)
  - **line 2 (black):** add-ons only (comma-separated), independent from install line.
- Implemented richer booking-detail extraction in meetings hub:
  - install kind from metadata/token parsing (existing behavior retained)
  - unit label detection from meeting metadata (`bookingUnitName`, `unitName`, `unitKey`, `unitId`, attached order summary, notes/type fallback)
  - unit price detection from metadata (`bookingUnitPriceUsd`/`unitPrice`) with fallback price map by unit label.
- Updated meetings mock appointment generation metadata so mock rows now include booking unit + price + add-on ids; this keeps the new install/add-on display realistic in the bookings cards.

**Decisions / outcomes:**
- Install details and add-ons are now visually separated by purpose: install declaration line in red, add-ons line in black.
- “Third add-on wrapping” behavior is superseded by the new two-line design (install/unit/price on first line; all add-ons on second line).
- Bookings calendar top spacing is now explicitly `12px`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - added unit/price normalization + fallback helpers for booking card display
  - introduced install-line formatter and add-ons-line formatter for bookings cards
  - updated bookings card rendering colors:
    - install line red (`#EB1C24`)
    - add-ons line black (`#000000`)
  - added `marginTop: '12px'` above bookings calendar row
- `src/utils/adminMeetingsMock.ts`
  - appointment mock metadata now includes:
    - `bookingInstallKind`
    - `bookingUnitName`
    - `bookingUnitPriceUsd`
    - `bookingAddonIds`

**Conventions:**
- On admin meetings bookings cards, render install declaration (install kind + unit + USD price) separately from add-ons; keep install line red and add-ons line black unless design direction changes.

---

## 2026-04-03 — Dashboard meetings card now uses the same meetings pipeline as Admin Meetings page

**Context:** User asked whether the Admin Dashboard MEETINGS card is truly linked to meetings-page card data, then requested full alignment so everything is prepped for real clients. In this same thread, prior updates had already aligned meetings mock identities with clients overview and tab spacing with marketing.

**Topics covered (entire conversation so far):**
- Verified current behavior in `src/pages/admin/dashboard/page.tsx`:
  - dashboard card preferred `/api/admin/meetings` rows, but still had dashboard-only fallback paths (`dashboardData.bookings` and `defaultDiverseBookings`) that could drift from `/admin/meetings`.
- Confirmed `/admin/meetings` source-of-truth pipeline in `AdminMeetingsHub`:
  - deterministic monthly mock meetings (`generateMockMeetingsForRange`)
  - merged with API meetings (`getAdminMeetings` + `normalizeApiMeeting`)
  - merged with locally scheduled meetings (`loadLocalMeetings`)
  - local rows override by id.
- Implemented full parity on dashboard by switching its meetings card to this same merge model and removing dashboard-only fallback list logic.

**Decisions / outcomes:**
- Dashboard MEETINGS card and Admin Meetings page now read from the same upstream meeting model in both API and mock/local contexts.
- Removed dashboard-only fake fallback meeting rows to avoid drift.
- This improves production readiness by making what admins see on dashboard consistent with what they see when drilling into `/admin/meetings`.

**Changes:**
- `src/pages/admin/dashboard/page.tsx`
  - imported meetings utilities from `utils/adminMeetingsMock` (`generateMockMeetingsForRange`, `loadLocalMeetings`, `normalizeApiMeeting`, `startOfMonth`, `endOfMonth`, `AdminMeeting`).
  - replaced `meetingsData` state with normalized `apiMeetings: AdminMeeting[]`.
  - normalized `getAdminMeetings()` API response through `normalizeApiMeeting`.
  - removed dashboard-specific fallback meeting list (`defaultDiverseBookings`/`diverseBookings`/`upcomingMeetings`).
  - added merged meetings computation (mock + api + local, by id) for current month window, matching meetings-page strategy.
  - derived dashboard card rows from merged appointment meetings only (`category !== 'consultation'`, date >= today).
  - added robust `toIsoMeetingDateTime` conversion so meeting times sort/highlight correctly.
- `motherboard/MEMORY.md`
  - appended this full-conversation summary entry.

**Conventions:**
- For meetings-related summary cards outside `/admin/meetings`, use the same merged meetings pipeline (mock + API + local with id override) to keep dashboard and meetings hub consistent.

---

## 2026-04-03 — Meetings bookings add-on wrap + consult mock image path repair

**Context:** Continuing the same admin meetings polish conversation (after TS build fixes, multiple meetings UI adjustments, preview/mobile workflow setup, totals panels, square calendar cells, and meetings/marketing spacing alignment), user requested two targeted fixes: force the 3rd add-on onto a second line on bookings cards and repair broken consult-tab mock images.

**Topics covered (entire conversation so far):**
- Reviewed current Admin Meetings formatting helpers and consult image source mapping.
- Confirmed bookings service text was rendered as a single line string in card rows.
- Added a card-specific formatter that keeps install kind prefix and wraps add-ons after the second token:
  - line 1: `INSTALL KIND: ADDON 1, ADDON 2`
  - line 2: `ADDON 3, ...`
- Applied `whiteSpace: 'pre-line'` to the bookings service line so explicit newline renders in the card.
- Confirmed consult mock media still included filename-only entries (`inspo-1.jpg`, `inspo-2.jpg`) which do not resolve to live assets.
- Hardened consult image normalization in meetings UI to:
  - prioritize `metadata.inspoPhotoUrls` and `metadata.inspoFileNames`
  - keep absolute/root-relative URLs
  - map filename-only values to `/assets/gallery-mock.png`
  - always return at least one fallback image.
- Updated mock generator to store valid root-relative asset paths in `inspoFileNames` so newly generated mock consult rows no longer produce broken thumbnails.
- Re-ran full production build validation.

**Decisions / outcomes:**
- Bookings-tab service text now wraps add-ons onto a second line starting at the 3rd add-on while preserving install-kind-first format.
- Consult mock image tiles now consistently render using valid asset URLs/fallback mapping, including older metadata shapes.
- Change is UI/data-normalization only; no API contract or meeting flow behavior changed.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - added `formatBookingServiceTypeForCard()` for controlled add-on wrapping
  - bookings service `<p>` now uses `whiteSpace: 'pre-line'`
  - strengthened `consultInspo()` path normalization + fallback to `/assets/gallery-mock.png`
- `src/utils/adminMeetingsMock.ts`
  - changed consultation mock `metadata.inspoFileNames` to valid `/assets/gallery-mock.png` paths

**Conventions:**
- In bookings cards, long add-on lists should wrap after two add-ons for readability while keeping install-kind prefix on line one.
- In consult mock metadata/UI, prefer root-relative asset paths or full URLs; map filename-only legacy values to a known existing mock asset fallback.

---

## 2026-04-03 — Admin meetings bookings/consults panel polish + travel-day scheduling blocks

**Context:** Continuing the same long-running admin meetings thread (TS build fixes, meetings card styling passes, preview/mobile workflow, search wiring, mock consistency, dashboard-meetings source unification, and install/add-on line redesign), user requested a larger bookings-tab UX pass: add avatar + state labels on client panels (including view-all), reduce add-ons line text size by 1px, make selected date label red and nudged right, ensure panel taps open admin client detail, enforce travel add-on calendar/scheduling blocks (half-day previous + full next day), and remove extra view-all helper/header copy.

**Topics covered (entire conversation so far):**
- **Client identity visuals on bookings/consults + view-all**
  - Added per-row client photo thumbnail on the left of text in bookings cards, consult cards, and view-all rows.
  - Added state code next to client name using `NAME (ST)` format (e.g., `REESE SCOTT (NJ)`), with mapping/fallback from email and metadata/address parsing.
  - Kept panel tap behavior routing to `navigate('/admin/clients?email=...')` and extended clickable behavior to view-all row cards too.
- **Bookings line typography + selected date display**
  - Reduced black add-ons line from `10px` to `9px`.
  - Updated selected date text below calendar to red and nudged right by 2px (`translateX(2px)`).
- **Travel add-on block behavior in admin meetings calendar**
  - Added travel-block derivation from appointment meetings:
    - previous day marked as **half-day blocked** (after 12 PM unavailable)
    - next day marked as **full-day blocked** (date disabled/gray)
  - Calendar now visually indicates these travel constraints and disables full blocked dates.
- **Travel add-on block behavior in booking appointment time-slot selection**
  - Implemented time-slot availability filter in `booking/appointment`:
    - when travel add-on selected, on day `D-1` only slots **before 12:00 PM** remain selectable
    - on day `D+1`, no slots available (full day blocked)
  - Disabled blocked slots with explanatory title text and auto-cleared previously selected invalid slots.
- **View-all/header cleanup**
  - Removed "GROUPED BY CLIENT EMAIL (CURRENT MONTH RANGE)." helper line.
  - Removed in-card red `MEETINGS` header and its gray divider line above the view-all area, per request.

**Decisions / outcomes:**
- Bookings/consults rows now present richer client context consistently (photo + state) across normal tabs and view-all mode.
- Travel add-on constraints are now represented both in meetings-calendar visibility and booking time-slot selection logic to prep behavior for real scheduling constraints.
- Selected date and add-ons text now match requested emphasis hierarchy.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - added client photo/state helpers and applied to bookings, consults, and view-all rows
  - switched view-all rendering from grouped-email text block to row cards
  - removed in-card `MEETINGS` heading + divider
  - removed grouped-by helper copy
  - reduced add-ons line font size (`9px`)
  - styled selected date label red + `translateX(2px)`
  - added travel half-day/full-day block set derivation and calendar disabled styling
- `src/pages/booking/appointment/page.tsx`
  - added travel-aware time-slot filtering logic for day-before half-day and day-after full-day block
  - disabled blocked slots in dropdown and added explanatory tooltip text
  - auto-clear invalid selected slot when availability changes

**Conventions:**
- In admin meetings list rows (bookings/consults/view-all), include client context with left thumbnail + `NAME (STATE)` when available.
- Travel add-on scheduling constraints should reserve previous day afternoon and full following day to avoid accepting conflicting appointment windows.

---

## 2026-04-03 — Bookings tab UI refinements: remove tab divider, red selected-date box border, hide selected-date text label

**Context:** User requested three targeted visual updates on the bookings tab UI: remove the gray divider line below the BOOKINGS/CONSULTS tabs, change the selected calendar date cell border from gray to red, and remove the red selected-date text line (`THU, APR 30, 2026`) above the client panels.

**Topics covered (entire conversation so far):**
- Loaded motherboard context files first (`README.md`, `CORE.md`, `CODEBASE.md`, `MEMORY.md`) per project rules.
- Located the exact bookings-tab UI styles in `src/pages/admin/meetings/AdminMeetingsHub.tsx`.
- Removed the header-level gray divider under the tabs container.
- Updated calendar date-cell border styling so the currently selected day renders with a red border (`#EB1C24`) while non-selected cells keep the gray border.
- Removed the selected-day text label block that previously rendered above the bookings client panels.
- Ran production build validation; initial run failed due missing local deps (`tsc: not found`), then installed deps and reran build successfully.
- Reverted incidental `package-lock.json` modifications to keep the commit scoped to requested UI behavior.

**Decisions / outcomes:**
- Tabs area no longer shows the gray underline divider.
- Selected date box now uses a red border, matching requested emphasis.
- The red date text label above client panels is removed.
- Build passes after dependency install in this environment.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - removed tabs container gray bottom border style
  - changed calendar day button border to conditional red when `selectedDay === cell.iso`
  - removed selected-date text paragraph render block above booking cards

**Conventions:**
- For bookings tab calendar emphasis, selected day should be indicated by red cell border rather than a separate date text label above client rows.

---

## 2026-04-03 — Merged bookings-tab refinements branch into master and pushed

**Context:** After completing bookings-tab UI refinements on branch `cursor/bookings-tab-ui-refinements-380a` (remove gray tab divider, red selected-date cell border, remove selected-date text line), user requested: "merge & push all changes made to the branches to master."

**Topics covered (entire conversation so far):**
- Implemented requested bookings-tab visual updates in `AdminMeetingsHub.tsx` and validated with a production build.
- Committed feature-branch changes and pushed `cursor/bookings-tab-ui-refinements-380a`.
- Created PR #4 for the feature branch updates.
- Switched to `master`, pulled latest remote `master`, and attempted merge from `cursor/bookings-tab-ui-refinements-380a`.
- Resolved merge conflicts in:
  - `src/pages/admin/meetings/AdminMeetingsHub.tsx` (kept requested bookings-tab UI behavior)
  - `motherboard/MEMORY.md` (preserved both histories and removed conflict markers)
- Completed merge commit and pushed updated `master` to `origin`.

**Decisions / outcomes:**
- `master` now includes the bookings-tab refinements from `cursor/bookings-tab-ui-refinements-380a`.
- Merge was non-fast-forward due upstream divergence and was completed successfully after conflict resolution.
- Remote `origin/master` is updated to include the merge commit.

**Changes:**
- Git operations:
  - `git checkout master`
  - `git pull origin master`
  - `git merge --no-ff cursor/bookings-tab-ui-refinements-380a`
  - conflict resolution + merge commit `26ae490`
  - `git push -u origin master`
- Files touched during conflict resolution:
  - `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - `motherboard/MEMORY.md`

**Conventions:**
- When merging UI refinement branches into `master`, preserve requested visual behavior during conflict resolution and keep motherboard memory append-only with all conflict markers removed.

---

## 2026-04-03 — Consult tab update pass: divider, panel identity, 3-photo cap, enlarge, and client-detail routing

**Context:** User requested consult-tab-focused updates: remove the gray line below tabs on consult tab only, show client profile photos + state on booking panels (`NAME (ST)` like `REESE SCOTT (NJ)`), enforce max 3 submitted photos in sync with A/C pages, allow tapping submitted photos to enlarge, and ensure tapping a client panel opens that client’s admin detail page.

**Topics covered (entire conversation so far):**
- Loaded motherboard context and validated this work should be applied in `AdminMeetingsHub` + consult booking/checkout/API pipeline.
- Verified that photo + state + panel click-to-client-detail were largely already present on booking/consult cards and view-all rows; preserved those behaviors while implementing missing requirements.
- Updated consult-tab header wrapper so the gray divider line is removed only when `mainTab === 'consults'` (bookings tab keeps current divider styling).
- Synced consult submitted-photo data flow with booking/checkout/admin:
  - booking consult cart line now stores capped `bookingInspoPhotoUrls` (data URLs) alongside file names.
  - checkout’s consult-meeting sync now forwards `inspoPhotoUrls` (validated + sliced to 3) and existing names.
  - booking consult API route now accepts/stores `inspoPhotoUrls` and caps both URLs + names to max 3 in metadata.
  - shared API client type updated for new `inspoPhotoUrls` field.
- Updated admin consult image rendering logic to prefer `inspoPhotoUrls` (falls back to `inspoFileNames`), keep data URLs/root-relative/http(s), dedupe, and cap display at 3.
- Added consult submitted-photo tap-to-enlarge behavior in Admin Meetings with an overlay preview modal; thumbnail taps stop propagation so they open preview instead of immediately navigating away.
- Kept client panel navigation behavior intact (`/admin/clients?email=...`) across bookings/consults/view-all rows.
- Ran build verification; initial failure due to missing local `tsc` before install, then installed dependencies and re-ran successfully.

**Decisions / outcomes:**
- Consult tab now removes the gray line below tabs only in the consult state.
- Booking/consult panels continue to show profile photo + `NAME (STATE)` and open admin client detail on row tap.
- Consult submitted-photo handling is now capped and consistent across booking input, checkout sync, API persistence, and admin display.
- Consult submitted photos in admin can now be enlarged via tap without breaking row navigation flow.
- Build passes after dependency install in this environment.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - consult-only divider removal logic on header block (`borderBottom` conditional by tab)
  - `consultInspo(...)` normalized to prefer URLs, preserve data URLs, dedupe, and cap to 3
  - consult thumbs capped to 3 and converted to interactive buttons
  - added `consultPhotoPreviewSrc` state + fullscreen preview modal
- `src/pages/booking/consultation/page.tsx`
  - persisted `bookingInspoPhotoUrls` (capped to max 3) on booking-consult cart items
- `src/pages/checkout/page.tsx`
  - added consult photo URL extraction/validation (`data:image`, absolute, root-relative), capped to 3, then sent to API
- `src/utils/api.ts`
  - `postBookingConsultMeeting` body type now includes `inspoPhotoUrls?: string[]`
- `api/booking/consult-meeting.ts`
  - accepts `inspoPhotoUrls`, validates + caps to 3
  - caps `inspoFileNames` to 3
  - persists `inspoPhotoUrls` in meeting metadata

**Conventions:**
- For admin consult cards, show at most 3 submitted photos and use tap-to-enlarge for detailed viewing.
- Prefer `metadata.inspoPhotoUrls` as authoritative submitted-image sources for consult meetings; use filename fallback only when URLs are absent.

---

## 2026-04-03 — Dashboard meetings card counts/labels/ticker aligned to meetings-page semantics

**Context:** In this chat thread, the user first posted a broad bookings-tab update list, then clarified most of those edits were accidentally already sent/implemented and asked to finish the remaining dashboard-specific meetings card behavior. They requested the dashboard meetings header number to represent completed consults + bookings from meetings-page logic, service label copy fixes (`INSTALL` singular), add-on compaction (`INSTALL + ADDON (N)` for extra add-ons), prevention of orphan add-on-only labels, and a scrolling ticker that reports upcoming booking counts for today/week/month and repeats.

**Topics covered (entire conversation so far):**
- Loaded motherboard context and inspected admin meetings + booking appointment files to verify which earlier bookings-tab requests were already in place (avatars/state, selected date styling, add-on text size, click-through to client details, travel-block visuals).
- User clarified to stop reworking already-implemented bookings-tab edits and focus on the Admin Dashboard MEETINGS card.
- Traced dashboard meetings-card data pipeline in `src/pages/admin/dashboard/page.tsx`:
  - previous header count was using upcoming bookings length (hence values like `30`)
  - card labels were using raw `service_name` text (e.g., `INSTALLS`, possible add-on-only tokens)
  - highlight text was a generic upcoming-appointments message.
- Implemented dashboard-card formatting and counting updates against the same merged meetings source used for admin meetings (mock + API + local merge):
  - header count now equals completed/confirmed meetings total (appointments + consultations) for the month range
  - booking row service label now always starts with `INSTALL`
  - add-ons collapsed to one visible add-on, with remainder count in parentheses (`INSTALL + BRAIDS (3)`)
  - add-on parsing now reads metadata `bookingAddonIds` first, then token fallback from `type`, preventing standalone add-on labels (e.g., `BROW SCULPTING` by itself)
  - ticker/highlight now uses bookings-only upcoming counts for TODAY, THIS WEEK, THIS MONTH and repeats the sequence for continuous scroll.
- Validated by running project build after installing dependencies in the cloud environment.

**Decisions / outcomes:**
- The dashboard MEETINGS card header number is now defined as completed + confirmed meetings (consults and bookings) from the meetings pipeline, instead of upcoming-bookings count.
- Dashboard booking service labels are normalized to `INSTALL` singular and compact add-on display format.
- Dashboard meetings ticker now follows bookings-only cadence and copy: TODAY → THIS WEEK → THIS MONTH (repeated).

**Changes:**
- `src/pages/admin/dashboard/page.tsx`
  - added dashboard booking add-on normalization helpers
  - added `formatDashboardMeetingServiceLabel()` for `INSTALL + ADDON (N)` formatting
  - changed meetings header count to completed/confirmed total across all meetings categories
  - changed meetings card rows to bookings-only upcoming list with normalized service labels
  - replaced generic highlight copy with repeated TODAY/WEEK/MONTH upcoming-bookings ticker.
- Environment/runtime:
  - ran `npm install` (cloud agent) so `tsc` became available
  - ran `npm run build` successfully.

**Conventions:**
- On the admin dashboard MEETINGS card:
  - header count should represent completed/confirmed meetings total (bookings + consults),
  - list rows should show bookings only for upcoming entries,
  - service labels should use `INSTALL` singular with compact add-on summary (`INSTALL + X (N)` when multiple add-ons),
  - ticker should report upcoming bookings for today/week/month in repeating sequence.

---

## 2026-04-03 — Meetings mock duration realism + client-photo sourcing + direct client-details routing

**Context:** Continuing the same conversation (bookings-tab/admin meetings + dashboard meetings polish), user reported three remaining issues: mock appointment durations were unrealistic and detached from service/add-on logic, panel avatars should be rounded/larger and use the same client-image source as client details, and tapping client panels still opened clients overview instead of that client’s details state.

**Topics covered (entire conversation so far):**
- Previously in this chat, bookings/consults panel UI and dashboard meetings card semantics were adjusted (counts, labels, ticker wording, add-on compaction), then user requested this follow-up pass for realism and navigation correctness.
- **Mock duration realism**
  - Reworked appointment mock generation in `adminMeetingsMock` to derive durations from booking logic instead of random 30–75 min values.
  - Added explicit install base durations (`NEW_INSTALL` 150 min, `RE_INSTALL` 120 min) and add-on duration map (braids, brow services, makeup, mink lashes, clean lace; travel excluded from in-chair duration).
  - Mock appointment type/services now derive from install kind + selected add-on ids, and `duration` now equals computed total minutes to keep displayed card durations coherent with selected add-ons.
- **Client photos on meetings panels**
  - Replaced meetings-panel avatar fallback map with sourcing that mirrors client-details profile-image precedence:
    - metadata image fields (`clientProfilePhoto`, `profileImage`, `photo`, `profilePhoto`, `avatar`) when valid
    - then `registeredUsers` lookup by client email using same key set as client details
    - fallback to `/assets/profile-thumb.png`.
  - Updated panel avatar presentation across bookings/consults/view-all rows to rounded circles and increased dimensions from 34px to 44px (~30% larger).
- **Client panel navigation to details**
  - Updated panel click routing target from `/admin/clients?email=...` to `/admin/clients/overview?email=...`, which is the active route that reads the email query and opens selected client details on load.
  - This preserves direct “open that client detail state” behavior from meetings rows.
- Re-ran full build validation after code changes and fixed one TypeScript narrowing issue in mock add-on label mapping by widening id typing for comparison-safe normalization.

**Decisions / outcomes:**
- Appointment mock durations now reflect install/add-on logic and no longer show mismatched short durations for long service combinations.
- Meetings-panel avatars now follow client-details image sourcing priority, are rounded, and are visually larger.
- Tapping any meetings client panel now routes to the client-details state for that specific email via the correct clients overview route.

**Changes:**
- `src/utils/adminMeetingsMock.ts`
  - narrowed appointment service options to install types used by booking cards
  - added install/add-on duration constants and computed appointment duration generation
  - aligned generated appointment `type`/`services` with install + add-on composition
  - resolved TS type narrowing issue in add-on label conversion.
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - removed static avatar-by-email map
  - added normalized profile-image candidate helpers + `registeredUsers` lookup by email
  - updated avatar rendering style/size (rounded 44px) in bookings, consults, and view-all rows
  - changed `openClientAccount` navigate target to `/admin/clients/overview?email=...`.

**Conventions:**
- Meetings mock appointment durations should be computed from install base + add-on durations (not randomized independent of services).
- Meetings panel avatars should follow client-details profile-image precedence and remain rounded/larger for quick identity recognition.
- Client-panel deep-links from meetings should target `/admin/clients/overview?email=...` so selected details open reliably.

---

## 2026-04-03 — Synced preview/mobile to master with all merged updates

**Context:** After prior merges of all outstanding feature branches into `master`, user requested: "push everything to the preview branch so it has the same updates as master branch."

**Topics covered (entire conversation so far):**
- Verified branch divergence between `origin/preview/mobile` and `origin/master` and confirmed preview was behind master by multiple commits.
- Checked out `preview/mobile`, updated it from remote, and merged `origin/master` into `preview/mobile` using a non-fast-forward merge commit to preserve branch history.
- Pushed updated `preview/mobile` to origin.
- Verified post-push parity by comparing refs and content:
  - commit graph difference now only reflects preview’s merge commit topology
  - file/content diff between `origin/master` and `origin/preview/mobile` is empty.

**Decisions / outcomes:**
- `preview/mobile` now contains all code updates present in `master`.
- Preview and master are content-equivalent after sync.

**Changes:**
- Git operations:
  - `git checkout preview/mobile`
  - `git merge --no-ff origin/master`
  - `git push -u origin preview/mobile`
  - verification via `git diff --name-only origin/master..origin/preview/mobile` (no output)

**Conventions:**
- To keep preview current with production-ready changes, periodically merge `master` into `preview/mobile` and verify parity with a direct branch diff.

---

## 2026-04-03 — Consults tab visual polish follow-up (icon/height/text/photo/notes adjustments)

**Context:** After prior consults-tab updates were pushed to `preview/mobile`, user reported remaining visual mismatches: consult SVG icon still looked unchanged, panel height still appeared unchanged, and requested specific consult-card positioning/style tweaks.

**Topics covered (entire conversation so far):**
- Previously completed and pushed consults flow/UI work (meetings↔clients return context, card spacing, icon switch) and merged onto `preview/mobile`.
- User requested a follow-up pass with exact visual deltas:
  - ensure consult icon change is visible from `public/assets`,
  - increase panel height,
  - move client identity line (`NAME (STATE) · PREMIUM`) down 2px,
  - move inspo photo row right by 2px and increase photo size by 25%,
  - change gray notes text to Futura Medium.
- Verified `AdminMeetingsHub` was already targeting `/assets/quote-icon-consult.svg`, then updated the SVG content itself so the icon appearance is visibly different while keeping same path.
- Updated consults card styles in `AdminMeetingsHub` for requested offsets/sizing/typography and made totals banner height explicit (`height`) to reduce perceived override risk.
- Committed and pushed to `preview/mobile`; handled remote divergence with pull/merge and push retry.

**Decisions / outcomes:**
- Consult quote icon now points to the same file path but with refreshed SVG artwork, so the visual change is explicit.
- TOTAL BOOKED / TOTAL CONSULTED panels now use explicit `height: 88px` sizing (instead of previous `minHeight`) to improve consistency when style inheritance/layout constraints occur.
- Consult client identity line is shifted down 2px.
- Inspo photo row is shifted right 2px and thumbnails are increased from 40px to 50px (+25%).
- Additional notes text now uses `Futura PT Medium` while retaining gray color/size.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - totals cards: `minHeight` → `height: 88px`
  - consult identity line: `transform: translateY(2px)`
  - inspo strip: `marginLeft: 2px`
  - inspo thumbs: `40x40` → `50x50`
  - notes line: font family `Futura PT Medium`
- `public/assets/quote-icon-consult.svg`
  - updated path artwork to a visibly distinct consult quote icon while preserving file name/path.

**Conventions:**
- For visual-only feedback loops on admin meetings cards, prefer explicit dimensions/offsets in inline styles when the user reports that prior `minHeight`/asset-path swaps appear unchanged in preview.

---

## 2026-04-03 — Completed full branch-to-master merge sweep (remaining missing branches merged)

**Context:** User reported that `master` still did not include all expected branch changes (specifically citing missing rounded client profile photos in client-details-adjacent flows) and clarified the expectation to merge all five related branches into `master`, not only the previously merged bookings-tab refinements branch.

**Topics covered (entire conversation so far):**
- Audited all local/remote branches and open PR heads, then compared against `origin/master` to identify what was actually still unmerged.
- Verified branch merge status:
  - already in `master`: `cursor/bookings-tab-ui-refinements-380a`, `cursor/sign-in-href-definition-d776`, `preview/mobile`
  - missing from `master`: `cursor/client-booking-panel-details-a360`, `cursor/bookings-tab-display-logic-1f04`
- Merged `origin/cursor/client-booking-panel-details-a360` into `master`:
  - resolved conflicts in `src/pages/admin/meetings/AdminMeetingsHub.tsx` and `motherboard/MEMORY.md`
  - preserved requested bookings-tab refinements while keeping consult/photo-routing updates from the merged branch.
- Merged `origin/cursor/bookings-tab-display-logic-1f04` into `master`:
  - resolved `motherboard/MEMORY.md` conflict by preserving entries from both histories
  - retained dashboard meetings-card logic updates and meetings mock/profile-photo/deep-link refinements.
- Ran full build validation on merged `master` and pushed successfully.
- Confirmed with `git branch -r --no-merged origin/master` that no remote feature branches in this set remain unmerged.

**Decisions / outcomes:**
- `master` now includes all previously missing changes from the two unmerged feature branches.
- The rounded/larger meetings panel avatars and related client-detail routing/photo-source changes from `cursor/bookings-tab-display-logic-1f04` are now on `master`.
- All five referenced branch lines are now represented in `master` history either by prior inclusion or by new merge commits in this pass.

**Changes:**
- Git merges completed on `master`:
  - `Merge branch 'cursor/client-booking-panel-details-a360' into master` (`b8123d8`)
  - `Merge branch 'cursor/bookings-tab-display-logic-1f04' into master` (`c257ba6`)
- Conflict-resolved files:
  - `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - `motherboard/MEMORY.md`
- Additional merged branch code now in master includes updates from:
  - `src/pages/admin/dashboard/page.tsx`
  - `src/utils/adminMeetingsMock.ts`
  - consult booking/checkout/API pipeline files introduced by merged branch history.

**Conventions:**
- For “merge all branches” requests, verify with `git branch -r --no-merged origin/master` before and after merges, and resolve MEMORY conflicts by preserving both append-only histories.

---

## 2026-04-03 — Bookings-tab updates delivered; deployment visibility clarified; preview-branch push policy set

**Context:** User requested a bookings-tab update pass in Admin Meetings (month label font/text, card typography, icon swap, add-on wrapping), then reported they were not seeing deployments, and finally clarified that all pushes should go to the `preview/mobile` branch and asked to record that in motherboard memory.

**Topics covered (entire conversation so far):**
- Loaded motherboard context and implemented the bookings-tab UI changes in `AdminMeetingsHub`:
  - calendar month label now uses Bohemy and shows month only (year removed),
  - client name/tier line reduced by 1px,
  - red service line changed to Futura PT Medium,
  - date/time/duration line changed to Futura PT Medium,
  - booking edit icon changed to `/assets/edit-meeting-icon-booking.svg`,
  - add-ons rendering updated so add-on #3 wraps to next line.
- Added missing public asset `public/assets/edit-meeting-icon-booking.svg` so the requested icon path resolves.
- Committed and pushed the implementation branch (`cursor/bookings-tab-ui-adjustments-95ca`), created/updated PR #6, and confirmed local build success after installing dependencies in cloud (`npm run build` passed).
- Investigated deployment visibility concern:
  - verified branch commit existed on remote,
  - confirmed no GitHub Actions workflows are configured (so `gh run list` is empty),
  - verified deployments were created by Vercel GitHub integration and surfaced as commit/PR status contexts,
  - captured successful deployment targets for both Vercel projects (`fsbw`, `fsbaw`).
- User then set a new branch policy: all pushes should go to preview branch.
- Switched to `preview/mobile`, pulled latest remote, and cherry-picked the bookings UI commit onto preview so deployment-triggering updates now live on preview.

**Decisions / outcomes:**
- The requested bookings-tab UI changes were completed and are present on both the feature branch and `preview/mobile`.
- Deployment confusion was resolved: deployments are happening via Vercel checks/deployments, not GitHub Actions workflows.
- New explicit user policy established: pushes should target `preview/mobile`.

**Changes:**
- Code/assets:
  - `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - `public/assets/edit-meeting-icon-booking.svg`
- Motherboard:
  - `motherboard/MEMORY.md` (this entry and prior same-chat task summary on feature branch)
- Git operations in this chat:
  - feature branch commits + push (`2ffe59e`, `615bc60`)
  - `git checkout preview/mobile`
  - `git pull origin preview/mobile`
  - `git cherry-pick 2ffe59e`

**Conventions:**
- For this project workflow, when the user indicates preview-first deployment flow, push ongoing implementation commits to `preview/mobile` unless the user explicitly overrides.

---

## 2026-04-03 — Bookings-tab payment copy/layout follow-up and icon-only client navigation

**Context:** User requested another bookings-tab refinement pass focused on copy/layout changes after the booking payment status feature: larger Bohemy month text, simplified payment copy, updated balance text format, removal of extra payment-policy lines, and safer tap behavior so only the client icon opens client details (not the whole panel).

**Topics covered (entire conversation so far):**
- In this ongoing chat, we had already implemented booking payment metadata + due countdown tracking in meetings cards. User then requested a tighter UI/copy format:
  - increase Bohemy month label size by 10px,
  - remove “FINAL PAYMENT DUE …” line and policy paragraph line,
  - replace status line with direct “PAYMENT DUE: <date> · <countdown>” copy,
  - replace “PAID LESS …” with black “CURRENT BALANCE: $X OF $Y USD” structure,
  - prevent accidental panel taps by making only the client icon open client details (bookings/consults tabs).
- Updated bookings calendar month label styling from 15px to 25px while keeping lowercase Bohemy.
- Reworked booking payment block:
  - removed separate final-payment label line and long policy note line,
  - removed “STATUS: …” text,
  - added black “CURRENT BALANCE: $remaining OF $total USD” line,
  - retained countdown bar and changed its text to “PAYMENT DUE: <date> · <time left>”.
- Updated card interaction behavior:
  - removed `onClick` from whole booking/consult card containers,
  - wrapped avatar image in its own button that calls `openClientAccount(m)`,
  - keeps edit/quote icon actions unchanged.

**Decisions / outcomes:**
- Booking cards now use the user-requested compact payment copy format and no longer show the removed lines.
- Payment due tracking remains visible via the bar + due text line.
- Client-detail navigation is now icon-only on bookings + consults tab cards to avoid accidental panel taps.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - month label size 15px → 25px
  - booking payment copy/line removals + replacements
  - panel click behavior changed to avatar-only navigation for bookings/consult cards.

**Conventions:**
- On meetings bookings cards, prefer compact payment copy (“CURRENT BALANCE …” + “PAYMENT DUE …”) and avoid redundant policy/status lines unless explicitly requested.
- For card navigation safety in this flow, use explicit icon/avatar tap targets instead of whole-card click targets when the user asks to reduce accidental taps.

---

## 2026-04-03 — Consults tab follow-up: icon visibility question, panel-height confirmation, extra text offset, and richer mock inspo sets

**Context:** User reported that consult icon still looked wrong and asked whether local assets could cause that, asked current panel height, requested moving the consult client line down another 2px, and requested mock consult clients to show varied inspo image counts (max 3) instead of mostly one image.

**Topics covered (entire conversation so far):**
- Verified current meetings consult icon wiring in code and asset presence:
  - icon source remains `/assets/quote-icon-consult.svg` in `AdminMeetingsHub`.
  - both `quote-icon-consult.svg` and `quote-icon.svg` exist under `public/assets`.
- Confirmed current total-banner panel height values in meetings code are fixed at `height: 88px` for TOTAL BOOKED / TOTAL CONSULTED.
- Applied requested visual tweak: consult client line (`NAME (STATE) · PREMIUM`) moved down by another 2px by changing `translateY(2px)` to `translateY(4px)`.
- Updated mock consult meeting generator to produce varied inspo photo counts and sources:
  - added `CONSULT_INSPO_MOCK_POOL` of multiple asset paths,
  - per consultation row now chooses deterministic random count `1..3`,
  - selects unique photos from pool for `inspoPhotoUrls` / `inspoFileNames` while preserving max 3.
- Pulled latest remote `preview/mobile` (which included unrelated remote work) and re-pushed combined history after auto-merge.

**Decisions / outcomes:**
- Local asset location is not the root issue by itself if the deployed branch doesn’t include the same file/content or browser cache serves old assets; code still points at `/assets/quote-icon-consult.svg`.
- Current meetings summary panel height is `88px`.
- Consult client line now renders 2px lower than prior state (total 4px offset from original baseline).
- Mock consult cards now display mixed inspo counts (1, 2, or 3) with varied images, capped at 3.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - changed consult name line transform from `translateY(2px)` to `translateY(4px)`.
- `src/utils/adminMeetingsMock.ts`
  - added `CONSULT_INSPO_MOCK_POOL`,
  - generated unique per-row consult inspo arrays with deterministic random count `1..3`,
  - persisted same array into `inspoPhotoUrls` + `inspoFileNames`.
- Git:
  - commit `8ce9f6a` then merged latest `origin/preview/mobile` and pushed final branch state (`55d4d79`).

**Conventions:**
- For mock consult cards, keep inspo thumbnails varied but capped at 3 per client row; use deterministic generation so month/day views remain stable.

---

## 2026-04-03 — Booking card paid-balance logic + final-payment due countdown replaces placeholder paid-status line

**Context:** User asked to replace the booking card placeholder line (`PAID STATUS: SEE ORDER IN CLIENT ACCOUNT`) with real per-booking payment math and due-state UX tied to appointment checkout data. They specified that appointment payments should subtract install/re-install service fee, show remaining/final due context, and include a countdown tracking bar with the same style pattern as order-tracking progress.

**Topics covered (entire conversation so far):**
- Earlier in this chat we implemented bookings-tab styling updates (icon/font/case/add-ons) and clarified deployment behavior, then moved all pushes to `preview/mobile` per user rule and persisted that policy in CORE/MEMORY.
- User then requested functional payment-status behavior on booking cards:
  - derive paid status from what client paid at appointment checkout,
  - subtract install/re-install fee from total paid (install 275 / re-install 225),
  - show final payment due timing with countdown/progress and cancellation policy note.
- Traced booking flow end-to-end:
  - checkout appointment sync (`src/pages/checkout/page.tsx`) → API client (`src/utils/api.ts`) → booking meeting route (`api/booking/appointment-meeting.ts`) → admin bookings card renderer (`src/pages/admin/meetings/AdminMeetingsHub.tsx`).
- Expanded payload + persisted meeting metadata from checkout:
  - booking install kind, addon ids/style/part, unit name/price,
  - order total paid + booking line paid totals,
  - install fee, computed balance-paid-after-fee, final due amount,
  - payment method label, booked timestamp, due-at timestamp/date, policy text.
- Replaced placeholder paid-status line on booking cards with computed UI:
  - red line: `PAID LESS $275/$225 SERVICE FEE: $X USD`,
  - due line with due date + countdown text,
  - progress bar and status label (`FINAL PAYMENT WINDOW ACTIVE`, `DUE WITHIN 24 HOURS`, `PAST DUE — CANCELLATION RISK`),
  - policy note reflecting 48-hour same-method requirement/cancel rule.
- Verified with `npm run build` (passes).

**Decisions / outcomes:**
- Booking cards now show actual payment context derived from appointment checkout sync metadata rather than static placeholder text.
- Final payment due state is rendered directly in bookings cards using countdown + progress treatment that matches order-tracking bar style conventions.
- Calculation baseline:
  - install fee = 275 for new install, 225 for re-install,
  - paid-less-service-fee = max(0, paidTotal - serviceFee),
  - due date defaults to appointment date minus 2 days unless explicit metadata due date exists.

**Changes:**
- `src/pages/checkout/page.tsx`
  - `syncBookingAppointmentsToAdminMeetings(...)` now sends paid totals, service fee, balance-after-fee, payment method label, and booked timestamp per appointment line.
  - call site now passes checkout `subtotal` and `paymentMethodDisplay`.
- `src/utils/api.ts`
  - expanded `postBookingAppointmentMeeting` body typing to include booking payment/due metadata fields.
- `api/booking/appointment-meeting.ts`
  - accepts and normalizes new booking metadata fields.
  - computes/persists final due date (48h before appointment), policy text, and payment fields in `meetings.metadata`.
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - added booking payment status helpers and currency/date formatting helpers.
  - replaced placeholder paid-status copy with computed paid-balance + due countdown/progress UI and policy note.

**Conventions:**
- In Admin Meetings booking cards, payment status should come from checkout-synced meeting metadata (not static text), and must display paid-less-service-fee plus final-due countdown/progress context for appointment collections.

---

## 2026-04-03 — Bookings-tab follow-up: lowercase month, add-ons font-only change, and booking icon asset correction

**Context:** In this continuation of the same bookings-tab thread, user reported the booking-panel SVG icon still looked unchanged, requested Bohemy month text above the calendar to be lowercase, requested only the add-ons line to use Futura PT Book, and asked what the "PAID STATUS: SEE ORDER IN CLIENT ACCOUNT" line means.

**Topics covered (entire conversation so far):**
- Continued from prior completed bookings-tab adjustments and preview-first push policy setup.
- Re-opened `AdminMeetingsHub` on `preview/mobile` and verified current state:
  - month label still uppercased in logic/UI context,
  - add-ons line still in Futura PT Medium,
  - icon path already pointed to `/assets/edit-meeting-icon-booking.svg`.
- Applied follow-up UI corrections:
  - changed month label generation and rendering so it stays lowercase (`toLowerCase` + lowercase text transform),
  - changed **only** the add-ons line font family to `"Futura PT Book"`,
  - replaced `public/assets/edit-meeting-icon-booking.svg` artwork with a visibly different edit icon (using existing `edit-icon.svg` art) so the icon actually changes while keeping the same requested path.
- Push handling:
  - initial push to `preview/mobile` was rejected (remote advanced),
  - rebased onto latest `origin/preview/mobile` and pushed successfully.

**Decisions / outcomes:**
- Month label above bookings calendar is now lowercase Bohemy.
- Add-ons text line only uses Futura PT Book (service/time lines remain as previously requested).
- Booking icon at `/assets/edit-meeting-icon-booking.svg` now renders different artwork so the change is visible.
- Branch policy remains preview-first; updates landed on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - month label changed to lowercase output
  - month label style enforces lowercase text rendering
  - add-ons line font changed to `"Futura PT Book"` only
- `public/assets/edit-meeting-icon-booking.svg`
  - replaced glyph content with alternate edit icon art to reflect requested icon change
- Git:
  - commit rebased and pushed to `preview/mobile` (`9b1e257`)

**Conventions:**
- For bookings-tab micro-typography requests, isolate font-family changes to the exact requested line and avoid unintended updates to adjacent lines.
- Keep preview-first deployment flow: push to `preview/mobile` unless user explicitly asks otherwise.

## 2026-04-03 — Consults tab client-panel return flow + meetings cards spacing/height/icon updates

**Context:** User requested four UI/flow updates in admin meetings: (1) tapping a client panel and then closing client details should return to bookings/consults tabs (B/C) rather than staying on client overview, (2) increase TOTAL BOOKED / TOTAL CONSULTED banner card height by 35%, (3) add 12px spacing above consult client cards, and (4) switch consult-panel quote icon to `quote-icon-consult` from public assets.

**Topics covered (entire conversation so far):**
- Loaded motherboard context and inspected `AdminMeetingsHub` and admin clients routing/state handling.
- Identified root cause of incorrect flow: meetings deep-linked into `/admin/clients/overview?email=...` but close behavior on details remained local to client overview state.
- Added meetings return context in deep-link params and wired client details close/back behavior to route back to meetings with originating tab preserved.
- Added query-based tab hydration in meetings page so `/admin/meetings?tab=consults` and `/admin/meetings?tab=bookings` restore expected tab state.
- Applied requested meetings card UI updates: larger total banners, consult list top spacing, and consult quote icon replacement.
- Added missing `quote-icon-consult.svg` asset under `public/assets` so the updated icon path resolves.
- Committed and pushed branch changes, created PR, then ran build validation. Initial build failed due missing local `tsc`; installed dependencies and re-ran build successfully; reverted incidental `package-lock.json` change to keep repo clean.

**Decisions / outcomes:**
- Meetings client-panel navigation now carries context (`returnTo=meetings&meetingsTab=...`) and closing client details returns users to the correct meetings B/C tab instead of client overview.
- Meetings page now honors `?tab=` query for tab state restore.
- TOTAL BOOKED and TOTAL CONSULTED cards are visually taller (~35% increase via min-height sizing).
- Consults tab has 12px top spacing before client cards.
- Consult quote action icon now uses `/assets/quote-icon-consult.svg`.
- Build passes after dependency install in this environment.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - added `useLocation` + `?tab=` state initialization/sync
  - updated `openClientAccount` deep-link with `returnTo` + `meetingsTab`
  - increased totals banner card height (`minHeight: 76px`)
  - added `marginTop: '12px'` wrapper above consult cards
  - changed consult quote icon source to `/assets/quote-icon-consult.svg`
- `src/pages/admin/clients/page.tsx`
  - read `returnTo` + `meetingsTab` query params
  - updated `closeClientDetails` to navigate back to `/admin/meetings?tab=...` when opened from meetings
  - guarded block-client confirm navigation so meetings return context is preserved
- `public/assets/quote-icon-consult.svg`
  - added consult quote SVG asset.

**Conventions:**
- When opening admin client details from meetings panels, pass return context so close/back returns to `/admin/meetings` with the same tab (`bookings` or `consults`) rather than defaulting to client overview list state.

---

## 2026-04-03 — CORE updated with permanent preview/mobile push convention

**Context:** User asked to make the new push-target rule permanent in motherboard core context after setting the policy that all pushes should go to the preview branch.

**Topics covered (entire conversation so far):**
- Completed bookings-tab UI updates in Admin Meetings and deployment verification in prior turns of this same chat.
- User clarified deployment expectation and then explicitly required preview-first pushing.
- Added a MEMORY entry documenting the policy and moved code updates onto `preview/mobile`.
- User then requested the same policy be added to `CORE.md` as a lasting convention.
- Updated `motherboard/CORE.md` under Conventions with an explicit, permanent note that implementation pushes should target `preview/mobile` by default unless the user says otherwise.

**Decisions / outcomes:**
- Preview branch policy is now encoded in both MEMORY history and CORE permanent conventions.
- Future agents loading motherboard context will see the preview/mobile push rule without requiring chat-history lookup.

**Changes:**
- `motherboard/CORE.md` (new Conventions bullet for preview/mobile as default push target).
- `motherboard/MEMORY.md` (this full-conversation summary entry).

**Conventions:**
- Treat `preview/mobile` as the default push branch for this project unless the user explicitly asks for another target.

---

## 2026-04-03 — Consults meetings updates merged and pushed to preview/mobile on request

**Context:** In this chat, the user first requested consults/meetings UI and flow changes (B/C return flow, banner height increase, consult card top spacing, consult quote icon swap), then asked to commit and push those changes to the preview branch.

**Topics covered (entire conversation so far):**
- Loaded motherboard context and implemented the requested meetings/client flow and UI updates:
  - meetings → client details deep-link now carries return context so close/back can return to meetings with the originating tab,
  - meetings page now hydrates/keeps tab state from `?tab=bookings|consults`,
  - TOTAL BOOKED / TOTAL CONSULTED panels increased in height,
  - consult cards list gained 12px top spacing,
  - consult quote icon updated to `quote-icon-consult` with new public asset.
- Committed and pushed those implementation changes on feature branch `cursor/consults-tab-client-panel-41c5`, created/updated PR #5, and validated build after installing dependencies.
- On follow-up user request to push to preview:
  - switched to `preview/mobile`,
  - merged `origin/cursor/consults-tab-client-panel-41c5`,
  - resolved conflicts in `src/pages/admin/meetings/AdminMeetingsHub.tsx` (kept requested consults updates) and `motherboard/MEMORY.md` (preserved append-only history),
  - handled remote divergence by pulling/merging latest `origin/preview/mobile`, resolving an additional MEMORY conflict by keeping both entries, and pushing final preview branch successfully.

**Decisions / outcomes:**
- Requested consults/meetings behavior and UI changes are now on `preview/mobile`.
- Preview branch push is complete and remote is updated.
- Conflict resolution preserved both functional code updates and motherboard memory history.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
- `src/pages/admin/clients/page.tsx`
- `public/assets/quote-icon-consult.svg`
- `motherboard/MEMORY.md` (merge conflict resolutions + this entry)
- `motherboard/CORE.md` (retained upstream update during pull-merge reconciliation)

**Conventions:**
- When moving feature-branch work onto `preview/mobile`, resolve conflicts by preserving requested UI behavior and keep motherboard entries append-only (do not drop either side’s memory entries).

---

## 2026-04-03 — Meetings totals panels set to 100px with bottom-positioned labels

**Context:** User requested a specific follow-up adjustment to the consults/meetings summary panels: change current panel height from 88px to 100px and move panel text toward the bottom instead of vertically centered.

**Topics covered (entire conversation so far):**
- Confirmed existing panel configuration in `AdminMeetingsHub` before editing (both summary cards at `height: 88px`, text vertically centered via `justifyContent: center`).
- Updated both top summary cards (`TOTAL BOOKED`, `TOTAL CONSULTED`) to fixed `height: 100px`.
- Changed vertical alignment from centered to bottom-weighted by switching to `justifyContent: 'flex-end'` and adding bottom spacing with `paddingBottom: '10px'`.
- Committed and pushed the change directly to `preview/mobile`.

**Decisions / outcomes:**
- Meetings summary panel height is now exactly **100px**.
- Summary panel text stacks are now visually positioned toward the bottom of each card instead of center.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - `height: '88px'` -> `height: '100px'` on both summary cards.
  - `justifyContent: 'center'` -> `justifyContent: 'flex-end'`.
  - added `paddingBottom: '10px'` for bottom positioning.

**Conventions:**
- For the meetings top summary cards, use fixed explicit height and bottom-aligned content when user requests exact visual positioning.

---

## 2026-04-03 — Bookings tab micro-pass: name font, balance spacing/size, and due tracker color/timing behavior

**Context:** User requested another bookings-tab UI micro-pass on admin meetings cards: change client name line font to Futura Book, adjust current balance line spacing/size, change payment-due label font, and update countdown tracker behavior so the bar stays gray until two days remain and turns red only within that final 48-hour window.

**Topics covered (entire conversation so far):**
- Continued from prior same-chat bookings work where month spacing, payment copy structure, and icon-only card navigation were already implemented on `preview/mobile`.
- Updated booking card name typography:
  - client name line (e.g. `QUINN CHEN (TX)`) now uses `"Futura PT Book"` only.
- Updated current balance line formatting:
  - reduced text size by 1px (`10px` -> `9px`),
  - added 4px above-line spacing by changing top margin to `14px`.
- Updated payment due label typography:
  - gray due-date text (`PAYMENT DUE: THU, APR 23, 2026`) changed to `"Futura PT Medium"`.
- Updated countdown bar + time behavior:
  - tracker fill remains gray by default,
  - fill changes to red only when `<= 2 days` remain (`remainingHours <= 48`),
  - countdown time text on right below bar remains right-aligned and now turns red only in the final 48-hour window (or gray otherwise / past due).
- Ran build verification after edits; build passes.

**Decisions / outcomes:**
- Booking name text now matches requested Futura Book styling.
- Current balance line now has reduced size and updated spacing.
- Payment-due date label is now Futura Medium.
- Countdown tracker no longer fills red across long horizons; red is reserved for the final two-day due window.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - client name line font family set to `"Futura PT Book"`.
  - current balance line font size `10px -> 9px`; margin top adjusted to `14px`.
  - payment due label font family set to `"Futura PT Medium"`.
  - due tracker/time color logic changed to red only when `remainingHours <= 48`, else gray.

**Conventions:**
- For bookings due trackers in meetings cards, reserve red urgency styling for the final 48-hour payment window; keep earlier countdown states gray for lower visual alarm.

---

## 2026-04-03 — Bookings tab micro-layout pass: month top spacing, current-balance typography, and right-aligned countdown under tracker

**Context:** User requested a focused follow-up on bookings-tab card layout and typography: reduce space above the Bohemy month label by 4px, switch CURRENT BALANCE line to Futura PT Book and add 6px top spacing above it, and position only the countdown time on the right below the tracker bar.

**Topics covered (entire conversation so far):**
- Continued from earlier bookings-tab payment/status and card-interaction updates in this same chat thread.
- Synced `preview/mobile` first, then adjusted bookings calendar header spacing:
  - month row top margin reduced from `12px` to `8px` (4px less spacing).
- Updated booking payment copy block styling:
  - `CURRENT BALANCE: ...` line font changed to `"Futura PT Book"` (from Medium),
  - top margin changed from `4px` to `10px` to add 6px extra spacing above that line.
- Reworked due-line layout beneath tracker bar:
  - split into two lines on the same row under the bar:
    - left: `PAYMENT DUE: <date>`
    - right: `<countdown>` only (e.g. `115D 9H LEFT`), right-aligned.
- Verified with `npm run build` and pushed directly to `preview/mobile`.

**Decisions / outcomes:**
- Bohemy month text now sits 4px closer to the calendar.
- Current balance line now matches requested Futura Book typography and spacing.
- Countdown time is now isolated and right-positioned below the tracker bar, with due-date label on the left.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - month row `marginTop: '12px'` -> `marginTop: '8px'`
  - current balance line font `Futura PT Medium` -> `Futura PT Book`
  - current balance line margin top `4px` -> `10px`
  - due text refactored to two-part row below bar (left due-date label, right countdown only).

**Conventions:**
- For bookings payment tracker copy in meetings cards, keep due date label and countdown separated under the bar when right-aligned countdown readability is requested.

---

## 2026-04-03 — Consults follow-up: summary panels reduced to 90px and hair option text switched to Futura Medium

**Context:** User requested a small visual follow-up on consults tab: reduce summary panel height from 100px to 90px and change the `WIG ONLY` / `WIG + INSTALL` line to Futura PT Medium.

**Topics covered (entire conversation so far):**
- Confirmed the active implementation in `AdminMeetingsHub` was using `height: 100px` with bottom-weighted panel text from the prior request.
- Updated both summary cards (`TOTAL BOOKED`, `TOTAL CONSULTED`) from `100px` to `90px`.
- Updated consult hair option line typography from `Futura PT Book` to `Futura PT Medium`.
- Committed and pushed directly to `preview/mobile`.

**Decisions / outcomes:**
- Summary panel height is now **90px** on both totals cards.
- `WIG ONLY` / `WIG + INSTALL` now render in **Futura PT Medium**.
- Changes are live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - `height: '100px'` -> `height: '90px'` on both summary cards.
  - consult hair line `fontFamily: "Futura PT Book"` -> `"Futura PT Medium"`.

**Conventions:**
- Keep consults-tab visual follow-ups narrowly scoped to requested style deltas unless user asks for broader refactors.

---

## 2026-04-03 — Consults follow-up: summary panels 80px and consult row elements shifted 4px right

**Context:** User requested another consults-tab style follow-up: reduce summary panel height from 90px to 80px and move four consult-row elements 4px right (client line, service line, inspo photos row, additional notes line).

**Topics covered (entire conversation so far):**
- Confirmed active styles in `AdminMeetingsHub` before editing (`height: 90px` on summary cards).
- Updated both summary cards (`TOTAL BOOKED` and `TOTAL CONSULTED`) to `height: 80px`.
- Shifted consult row elements by 4px to the right:
  - client identity line: x-offset added while preserving existing y-offset,
  - service/hair line: `marginLeft: 4px`,
  - inspo photo container: `marginLeft: 4px`,
  - additional notes line: `marginLeft: 4px`.
- Committed and pushed to `preview/mobile`; resolved remote divergence by pulling latest preview and re-pushing.

**Decisions / outcomes:**
- Summary panels now render at exactly **80px**.
- The four requested consult-row elements are shifted **4px right**.
- Update is present on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - `height: '90px'` -> `height: '80px'` on both top summary cards.
  - consult row client/service/inspo/notes elements shifted right by 4px.

**Conventions:**
- Apply consults-tab micro-alignment requests as direct style deltas on only the named elements to avoid unintended layout changes.

---

## 2026-04-03 — Consults typography/right-offset update + standardized admin summary panels to meetings design

**Context:** User requested consults-tab refinements (client line font change, 6px right shift for four consult-row text/media elements) and asked to update summary panels on other admin pages to match meetings summary panel design (same height + bottom text position).

**Topics covered (entire conversation so far):**
- Verified meetings consult-row styles in `AdminMeetingsHub` and applied targeted typography/offset changes:
  - client identity line (`NAME (STATE) · PREMIUM`) changed to Futura PT Book,
  - client line, service line, inspo-photo row, and notes line each shifted right to 6px (from prior 4px).
- Standardized admin summary card style to the same meetings panel design pattern (height + bottom-positioned text stack) across other admin pages with two-up summary cards:
  - fixed `height: 80px`,
  - `display: flex`, `flexDirection: 'column'`, `justifyContent: 'flex-end'`,
  - `paddingBottom: '10px'`,
  - label spacing normalized to `marginTop: '4px'` where applicable.
- Applied this design to all matching summary-panel blocks in:
  - Brand (codes cards + alerts cards),
  - Marketing,
  - Referrals,
  - Pending,
  - Reviews (top cards + tools sub-tab card),
  - Revenue (main tab cards + pending-orders subcard).
- Committed and pushed updates to `preview/mobile`.

**Decisions / outcomes:**
- Consults client identity line now uses Futura PT Book.
- The four requested consult-row elements are now consistently shifted 6px right.
- Admin summary panels across the listed pages now match meetings design conventions for height/text position.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
- `src/pages/admin/brand/page.tsx`
- `src/pages/admin/marketing/page.tsx`
- `src/pages/admin/referrals/page.tsx`
- `src/pages/admin/pending/page.tsx`
- `src/pages/admin/reviews/page.tsx`
- `src/pages/admin/revenue/page.tsx`

**Conventions:**
- For admin summary-panel parity with meetings, use fixed 80px panel height and bottom-aligned text stack (`justifyContent: flex-end` + `paddingBottom: 10px`) unless a page intentionally uses a different summary treatment (e.g., single metric hero blocks).

---

## 2026-04-03 — Bookings follow-up: tracker +2px, month row -4px, and red Futura medium appointment/payment lines

**Context:** User requested another bookings-tab micro-adjustment pass: increase booking payment tracker bar height by 2px, reduce spacing above the calendar month text by 4px, and make the appointment time/payment-due text lines red in Futura PT Medium.

**Topics covered (entire conversation so far):**
- Continued on `preview/mobile` as required by the established preview-first push policy.
- Updated bookings calendar header spacing by reducing the month row top margin from `8px` to `4px` (4px less space above Bohemy month text).
- Increased booking payment tracking bar height from `7px` to `9px` (+2px).
- Changed booking appointment date/time/duration line (`SAT, MAY 30, 2026 · 4:30 PM · 340 MIN`) to red `#EB1C24` while retaining Futura PT Medium.
- Changed payment-due label line (`PAYMENT DUE: THU, MAY 28, 2026`) to red and Futura PT Medium.
- Kept countdown/right-side time text styling as existing (gray right-aligned) since request targeted the payment-due label line specifically.
- Ran `npm run build` successfully after edits.

**Decisions / outcomes:**
- Tracker bar is now visually thicker by 2px.
- Calendar month header sits 4px closer to content above.
- Requested appointment-time and payment-due label lines now use red Futura PT Medium styling.
- Changes are pushed to `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - month header row `marginTop`: `8px` -> `4px`
  - due tracker bar `height`: `7px` -> `9px`
  - appointment time line color: `#808080` -> `#EB1C24`
  - payment due label line color: `#808080` -> `#EB1C24` (Futura PT Medium retained)

**Conventions:**
- For bookings-tab micro-style requests, prefer direct per-line style deltas (font/color/spacing) and preserve surrounding interaction behavior unless explicitly requested to change.

---

## 2026-04-03 — Bookings follow-up: payment due label gray medium, countdown red medium, and client name medium

**Context:** User asked for another bookings-tab style correction pass: make the left payment-due label gray again while keeping medium weight, make the countdown time red medium, and switch only the client name line to Futura PT Medium.

**Topics covered (entire conversation so far):**
- Continued on `preview/mobile` and pulled latest before editing.
- Updated booking card client identity line font from Futura PT Book back to Futura PT Medium (name line only).
- Updated payment-due row styling under the tracker:
  - left label (`PAYMENT DUE: THU, APR 23, 2026`) changed to gray with Futura PT Medium,
  - right countdown (`20D 9H LEFT`) changed to red with Futura PT Medium.
- Left tracker height and recent spacing adjustments intact from prior request.
- Ran `npm run build` successfully after edits.
- Initial push rejected due remote advancement; rebased onto latest `origin/preview/mobile` and pushed successfully.

**Decisions / outcomes:**
- Payment due left label is now gray medium.
- Countdown text is now red medium.
- Client name line is now medium weight as requested.
- Changes are live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - client name line font family: `"Futura PT Book"` -> `"Futura PT Medium"`
  - payment due left label color: red -> gray (`#808080`)
  - payment due right countdown font family: `"Futura PT Book"` -> `"Futura PT Medium"`
  - payment due right countdown color: gray -> red (`#EB1C24`)

**Conventions:**
- For split payment-due rows in bookings cards, style left due-date label and right countdown independently when requested (left informational gray, right urgency red).

---

## 2026-04-03 — Admin meetings booking add-ons relabeled to INSTALL/RE-INSTALL with red styling

**Context:** The user provided a full recap of prior bookings-tab iterations (font, payment, tracker, icon, and routing refinements on admin meetings cards) and then requested one new meetings-card formatting change: show booking add-ons as install-prefixed labels (colon format) instead of `INSTALL + ...`, and render the add-ons text in red instead of black.

**Topics covered (entire conversation so far):**
- Continued from the previously completed bookings-tab overhaul summarized by the user (calendar month typography, payment due rows/tracker, client name styling, icon-only client navigation, and metadata-backed payment status logic).
- Implemented a focused update on the admin meetings booking card add-ons line so it now reads in the requested structure:
  - `INSTALL: CLEAN LACE`
  - `RE-INSTALL: BROW SCULPTING (2)` (first add-on shown with total count when multiple add-ons exist).
- Changed add-ons line styling color from black to red so add-ons text is red-only on the card.
- Validated changes with `npm run build` and pushed to `preview/mobile`.

**Decisions / outcomes:**
- Booking add-ons no longer use plus-sign phrasing (`INSTALL + ...`) in the admin meetings card display line.
- Add-ons line now uses install-kind label + colon format and displays in red.
- Update is committed and pushed to `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - updated `formatBookingAddonsLineForCardDisplay()` to output `INSTALL:` / `RE-INSTALL:` format with compact count for multiple add-ons.
  - updated booking add-ons line style color to `#EB1C24`.

**Conventions:**
- For admin meetings booking cards, add-ons display should use install-kind-prefixed labels (`INSTALL:` / `RE-INSTALL:`) rather than `INSTALL + ...` formatting when this presentation is requested.

---

## 2026-04-03 — Consults micro-adjustment: client identity line moved down by +2px only

**Context:** User requested one isolated visual change on consults tab: move the client identity line (`ELENA GARCIA (FL) · PREMIUM`) down by 2px and ensure no other style overrides were introduced.

**Topics covered (entire conversation so far):**
- Located the consult client line style in `AdminMeetingsHub` and confirmed current transform offsets.
- Applied a targeted Y-offset change on that line only (`translate(6px, 4px)` -> `translate(6px, 6px)`), preserving existing X-offset and all neighboring styles.
- Committed and pushed to `preview/mobile`; reconciled remote divergence by pull-merge before push.

**Decisions / outcomes:**
- Client identity line is now moved down by an additional **2px**.
- No other consult row elements were changed in this request.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - consult client line transform updated to `translate(6px, 6px)`.

**Conventions:**
- For single-line micro-adjustments, limit edits to the specific target style property to avoid regressions in adjacent consult-row layout.

---

## 2026-04-03 — Consults inspo row restore/lock: right 2px + 8px spacing

**Context:** User reported the inspo row had been moved in the wrong direction and asked to restore/correct exactly: row shifted right by 2px and spacing between images set to 8px (+2 from prior baseline).

**Topics covered (entire conversation so far):**
- Re-verified live consult inspo row styles in `AdminMeetingsHub` (`marginLeft: '2px'`, 8px gap) and confirmed intended values.
- To reduce risk of class utility overrides, changed gap from Tailwind utility class to explicit inline style so final rendered spacing is controlled in one place.
- Preserved the row’s right offset at `marginLeft: '2px'`.
- Committed and pushed to `preview/mobile` after resolving remote divergence via pull-merge.

**Decisions / outcomes:**
- Inspo photo row now has explicit inline styles:
  - `marginLeft: '2px'` (right shift)
  - `gap: '8px'` (2px more space between images)
- No other inspo row behavior changes were introduced.
- Update is on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - row class changed from `gap-[8px]` utility to inline `gap: '8px'` with `marginLeft: '2px'` preserved.

**Conventions:**
- For precision spacing tasks likely to be affected by utility precedence, prefer explicit inline style on the exact row container.

## 2026-04-03 — Corrected target scope: restore Admin Meetings tab add-ons and apply INSTALL/RE-INSTALL format on Admin Dashboard meetings card

**Context:** In this chat, the user asked for add-on service labels to be structured as `INSTALL: ...` / `RE-INSTALL: ...` with red add-ons text. The initial implementation was applied to the wrong surface (Admin Meetings tab card). The user then explicitly requested a restore and correction so the change applies to the **Admin Dashboard MEETINGS card** only.

**Topics covered (entire conversation so far):**
- Started from a long recap of prior bookings-tab iterations and implemented the new add-on label format (`INSTALL:` / `RE-INSTALL:` with count) plus red add-ons text on `AdminMeetingsHub` booking cards.
- User reported this targeted the wrong card and requested restoring those meetings-tab changes.
- Restored `AdminMeetingsHub` booking add-ons display back to prior behavior:
  - add-ons line format restored to `ADD-ONS: ...` wrapping logic,
  - add-ons text color restored from red back to black.
- Applied requested label formatting to the **Admin Dashboard MEETINGS card** logic in `src/pages/admin/dashboard/page.tsx`:
  - replaced `INSTALL + ...` formatting with `INSTALL: ...` / `RE-INSTALL: ...`,
  - for multiple add-ons: first add-on plus total count in parentheses (e.g. `RE-INSTALL: BROW SCULPTING (2)`),
  - wired dashboard meeting item color so this label line is red.
- Ran `npm run build` successfully after the restore/correct pass.
- Rebased and pushed to `preview/mobile` after remote advanced.

**Decisions / outcomes:**
- The mistaken meetings-tab change was reverted.
- Requested formatting/color now applies to the Admin Dashboard meetings card list.
- Build is green and changes are live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - restored booking add-ons formatter/content and black add-ons color.
- `src/pages/admin/dashboard/page.tsx`
  - updated dashboard meetings service label formatting to `INSTALL:` / `RE-INSTALL:` pattern,
  - added install-kind detection from meeting metadata (`bookingInstallKind` / `installKind`),
  - set service label color path to red for this dashboard card display.

**Conventions:**
- For “meetings card” requests, confirm whether the user means Admin Meetings page cards or Admin Dashboard `MEETINGS` stat card before applying formatter/style changes.

---

## 2026-04-03 — Consults micro-adjustment: hair inspo row moved to 6px right

**Context:** User requested a single consults-tab adjustment: move only the hair inspo images row 6px to the right.

**Topics covered (entire conversation so far):**
- Verified the current inspo row offset in `AdminMeetingsHub` (`marginLeft: '2px'`).
- Updated the inspo row container offset to `marginLeft: '6px'` while preserving the existing 8px gap and all other consult-row styles.
- Committed and pushed directly to `preview/mobile`.

**Decisions / outcomes:**
- Hair inspo row is now shifted right by **6px**.
- Only the inspo row offset changed in this pass.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - inspo row `marginLeft` updated from `2px` to `6px`.

**Conventions:**
- For one-line style nudges, keep the change scoped to the exact requested property and preserve neighboring spacing settings.

---

## 2026-04-03 — Bookings wrap/service typography update and dashboard meetings add-ons forced red

**Context:** User requested a new bookings-tab/UI pass with three specific corrections: wrap add-ons after the 4th add-on (not after the 3rd), change the bookings service line (`NEW INSTALL: SOFT WAVE $760 USD`) to gray Futura PT Demi, and fix admin dashboard MEETINGS card so add-ons/service labels (e.g. `CLEAN LACE`, `BROW SCULPTING (3)`) display red instead of black.

**Topics covered (entire conversation so far):**
- Continued from prior same-chat scope-correction work where meetings-tab changes were restored and dashboard meetings-card formatting was targeted.
- Updated bookings add-ons wrapping logic in `AdminMeetingsHub`:
  - now keeps first three add-ons on line one and wraps starting at the 4th add-on.
- Updated bookings service line typography/style in `AdminMeetingsHub`:
  - font family changed to `"Futura PT Demi"`,
  - color changed to gray (`#808080`).
- Diagnosed dashboard red-label issue root cause:
  - dashboard meetings text is rendered in `StatsCard` label slot, which was hardcoded black.
- Added label color support to `StatsCard` via optional `labelColor` and applied it for dashboard meetings items so service/add-on label text renders red.
- Kept dashboard meetings formatter output in `INSTALL:` / `RE-INSTALL:` shape with red label path.
- Removed an unused helper (`isWithin24Hours`) exposed by the new color wiring and re-ran `npm run build` successfully.
- Rebased/pushed to `preview/mobile` after remote advanced and updated PR pointer.

**Decisions / outcomes:**
- Bookings add-ons now wrap at the requested threshold (4th add-on starts next line).
- Bookings service line now matches gray Futura PT Demi.
- Admin dashboard MEETINGS service/add-on label text now renders red rather than black.
- Build passed and updates are live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - add-ons wrap threshold adjusted to wrap from 4th add-on onward.
  - booking service line style changed to gray Futura PT Demi.
- `src/pages/admin/dashboard/page.tsx`
  - meetings items continue using red service color path and pass label color metadata.
  - removed now-unused `isWithin24Hours` helper.
- `src/pages/admin/components/StatsCard.tsx`
  - added optional `labelColor` in `StatsItem`.
  - label text color now supports per-item override, enabling red meetings labels.

**Conventions:**
- When dashboard stat rows require colored service/add-on text, color must be applied to both label and value paths if label and value are rendered separately.

---

## 2026-04-03 — Consults micro-adjustment: hair inspo row moved from 6px to 4px right

**Context:** User requested a single follow-up adjustment after the prior 6px shift: move only the consult hair inspo row to 4px right.

**Topics covered (entire conversation so far):**
- Confirmed current inspo row was at `marginLeft: '6px'`.
- Applied a one-line update to set inspo row offset to `marginLeft: '4px'`.
- Preserved all other consult row styles (including `gap: '8px'`) unchanged.
- Committed and pushed to `preview/mobile`, handling remote divergence via pull-merge before push.

**Decisions / outcomes:**
- Hair inspo row now uses **4px** right offset.
- No other consults-tab styling changed in this pass.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - inspo row `marginLeft` set to `4px`.

**Conventions:**
- For repeated micro-position requests, modify only the exact offset property and keep prior spacing values stable unless explicitly requested.

---

## 2026-04-03 — Meetings B/C tabs: client profile icons moved down to 8px offset

**Context:** User requested a focused meetings-card adjustment: move client profile icons down 8px on both bookings and consults tabs, with no other style side effects.

**Topics covered (entire conversation so far):**
- Located both client-avatar button wrappers in `AdminMeetingsHub` (bookings card list and consults card list).
- Updated only avatar wrapper `marginTop` from `1px` to `8px` in both tab render paths.
- Left all text/image spacing, icon sizes, and other card styles untouched.
- Committed and pushed directly to `preview/mobile`.

**Decisions / outcomes:**
- Client profile icons are now offset downward by **8px** on both bookings and consults tabs.
- No unrelated layout properties were modified in this pass.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings avatar button style: `marginTop: '8px'`
  - consults avatar button style: `marginTop: '8px'`

**Conventions:**
- For mirrored B/C card layout tweaks, apply identical style values in both tab branches to maintain visual parity.

---

## 2026-04-03 — Consults micro-adjustment: hair inspo row shifted another +6px right (to 10px)

**Context:** User requested one follow-up movement: shift only the consult hair inspo row another 6px to the right.

**Topics covered (entire conversation so far):**
- Verified current consult inspo row offset was `marginLeft: '4px'`.
- Applied one-line update to increase row right shift by 6px, resulting in `marginLeft: '10px'`.
- Preserved all other row settings (including `gap: '8px'`) unchanged.
- Committed and pushed directly to `preview/mobile`.

**Decisions / outcomes:**
- Hair inspo row now sits at **10px right offset**.
- Only this offset changed in this pass.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - inspo row `marginLeft`: `4px` -> `10px`.

**Conventions:**
- For incremental position requests (“another X px”), apply additive deltas from current state and keep non-target spacing constants unchanged.

---

## 2026-04-03 — Bookings payment due label switched to Demi and bookings cards offset +6px below calendar

**Context:** User requested a focused bookings-tab adjustment pass: change the left payment-due text line typography to Futura PT Demi and add 6px vertical spacing above the bookings client panels under the calendar.

**Topics covered (entire conversation so far):**
- Continued from earlier same-chat bookings/dashboard styling refinements (add-ons wrapping threshold, service line typography, and dashboard meetings red label fix).
- Updated bookings payment block typography in `AdminMeetingsHub`:
  - changed `PAYMENT DUE: <date>` line font from `"Futura PT Medium"` to `"Futura PT Demi"` while keeping gray color and size unchanged.
- Added vertical spacing between bookings calendar section and bookings client panel list:
  - wrapped `sortedAppointmentsList.map(...)` render branch in a container with `marginTop: '6px'` so client panels start 6px lower below the calendar grid.
- Ran `npm run build` successfully.
- Committed and pushed to `preview/mobile` after rebasing on the latest remote.

**Decisions / outcomes:**
- Payment due label line now uses Futura PT Demi as requested.
- Bookings client panel stack now has an extra 6px top gap below the calendar.
- Build passes and change is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - payment due label font family updated to `"Futura PT Demi"`.
  - bookings appointment cards list wrapped with `marginTop: '6px'` spacing container.

**Conventions:**
- For bookings-tab spacing asks that target “client panels below calendar,” apply margin at the list container boundary (between calendar grid and first card) to avoid side effects inside individual cards.

---

## 2026-04-03 — Bookings typography/icon pass: current balance medium, time line book, lighter month, smaller/thinner edit icon, and 5th add-on wrap fix

**Context:** User requested another bookings-tab adjustment set: switch CURRENT BALANCE to Futura PT Medium, switch appointment time line to Futura PT Book, keep/add 6px spacing above client panels below calendar, reduce Bohemy month text weight, reduce booking edit icon line weight by 1px and size by 50%, and fix wrapping so the 5th add-on stays on the same wrapped line as the 4th.

**Topics covered (entire conversation so far):**
- Continued from prior same-chat bookings/dashboard changes where payment due label was switched to Demi and cards were offset by +6px below calendar.
- Updated bookings card typography in `AdminMeetingsHub`:
  - `CURRENT BALANCE: ...` line changed from Futura PT Book to Futura PT Medium.
  - appointment date/time/duration line (`SAT, APR 18, 2026 · 4:00 PM · 330 MIN`) changed from Futura PT Medium to Futura PT Book.
- Preserved the existing +6px list spacing below the calendar (previously added container margin remains in place).
- Reduced Bohemy month label visual weight by setting explicit lighter `fontWeight` on the month span.
- Updated booking edit icon presentation:
  - card icon render size reduced from `22x22` to `11x11` (50%),
  - SVG stroke weight reduced by ~1px equivalent (`stroke-width` set to `0.85`) in `edit-meeting-icon-booking.svg`.
- Fixed wrapped add-ons line behavior for long lists:
  - kept first line at first 3 add-ons,
  - wrapped line now starts at 4th and preserves 4th+5th on the same line by using non-breaking spaces in wrapped text joining.
- Ran `npm run build` successfully, then committed/pushed to `preview/mobile` and updated PR pointer.

**Decisions / outcomes:**
- Current balance line now uses Futura PT Medium.
- Appointment time line now uses Futura PT Book.
- Calendar month label appears lighter weight.
- Booking edit icon is visibly smaller and thinner.
- 5th add-on no longer drops to an extra new line by itself in standard card width cases.
- Build is green; updates are live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - current balance font family updated to `"Futura PT Medium"`.
  - appointment date/time line font family updated to `"Futura PT Book"`.
  - month label span now includes lighter `fontWeight`.
  - add-ons wrapped-line formatter adjusted to preserve 4th/5th on same wrapped line using NBSP handling.
  - booking edit icon render size changed to `11x11`.
- `public/assets/edit-meeting-icon-booking.svg`
  - stroke weight reduced (`stroke-width="0.85"`).

**Conventions:**
- For booking-card add-on wrap issues caused by token breaks, preserve same-line grouping via non-breaking spaces on wrapped segments before introducing additional line breaks.

---

## 2026-04-03 — Bookings-only avatar micro-adjustment: profile photos moved up 4px

**Context:** User requested one very targeted change on the bookings tab only: move profile photos upward by 4px.

**Topics covered (entire conversation so far):**
- Continued from the same chat’s sequence of bookings-tab typography, spacing, icon, and wrapping micro-tweaks.
- Located both avatar button offsets in `AdminMeetingsHub` and adjusted only the bookings-tab branch.
- Updated bookings avatar button `marginTop` from `8px` to `4px` (4px upward movement).
- Left consults avatar offset unchanged (`8px`) per “bookings tab only” instruction.
- Ran `npm run build` successfully and pushed to `preview/mobile`.

**Decisions / outcomes:**
- Bookings-tab profile photos are now 4px higher.
- Consults-tab profile photos were intentionally not changed.
- Build passed and change is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings avatar button style: `marginTop: '8px'` -> `marginTop: '4px'`.

**Conventions:**
- For “bookings only” UI nudges in shared meetings components, patch only the bookings render branch and keep consult branch values untouched unless explicitly requested.

---

## 2026-04-03 — Bohemy month weight reduced further and bookings client name turned red (membership status unchanged)

**Context:** User requested two additional bookings-tab style refinements: lower the Bohemy month text weight further (“20 instead of 30”) and make only the client name text red Futura PT Medium while keeping membership status styling separate.

**Topics covered (entire conversation so far):**
- Continued from prior same-chat bookings micro-adjustments (wrapping, icon size/stroke, payment/current-balance typography, card spacing, avatar offset).
- Updated the bookings calendar month label in `AdminMeetingsHub` to a lighter explicit weight:
  - changed `fontWeight` from `300` to `200` on the Bohemy month span.
- Updated the bookings client identity line styling so only the name is red:
  - wrapped `meetingClientDisplayNameWithState(m)` in a red span (`#EB1C24`),
  - preserved membership status (`· PREMIUM` / `· STANDARD`) in its existing independent color logic via `tierLabelColor(m)`.
- Kept font family on the client line as Futura PT Medium per request and did not alter unrelated row typography.
- Ran `npm run build` successfully and pushed to `preview/mobile`.

**Decisions / outcomes:**
- Bohemy month text now renders with a lighter weight than before (explicit `fontWeight: 200`).
- Client name text only is red on bookings cards; membership status coloring remains unchanged.
- Build is green and updates are live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - month label `fontWeight`: `300` -> `200`
  - bookings client text line split into name span (red) + status span (existing tier color logic).

**Conventions:**
- When user requests styling for only one substring in a composite label (e.g., name vs membership status), split into separate spans and preserve existing color logic for the untouched segment.

---

## 2026-04-03 — Consult icon interaction clarification + consult card spacing/style refinements

**Context:** User reported booking tab panel icons worked while consult tab icons did not, then requested four styling updates on consults plus two shared spacing updates: add 3px below additional notes, make `WIG ONLY`/`WIG + INSTALL` gray Futura Medium, increase spacing between client panel icons on both B/C tabs by 2px, and move client profile images 4px right.

**Topics covered (entire conversation so far):**
- Reviewed meetings card interactions:
  - bookings card right-side action is edit icon,
  - consult card right-side action is quote icon,
  - both use `stopPropagation` and should remain independently clickable from row open-client action.
- Hardened consult and booking right-side action icons with `flexShrink: 0` + `position: relative` + `zIndex: 2` to protect clickability in dense card layouts.
- Applied requested style updates:
  - additional notes line receives 3px space below (`marginBottom: '3px'` + spacer block),
  - hair/service line set to gray (`#808080`) Futura PT Medium,
  - client panel icon spacing increased by 2px on both bookings and consults card rows (`gap` 10 -> 12),
  - client profile image buttons shifted 4px right (`marginLeft: '4px'`) on both tabs.
- Build validation passed before push.
- Resolved merge conflict in `AdminMeetingsHub` after remote preview advanced, preserving requested consult fixes and latest remote updates.

**Decisions / outcomes:**
- Consult action icon behavior is aligned with booking behavior and protected against overlap issues.
- Requested consult notes/hair spacing and color updates are applied.
- B/C card icon spacing and avatar-right shift updates are applied uniformly.
- Final result pushed to `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - right action buttons hardened (`flexShrink`, `zIndex`),
  - row gap on bookings + consults increased to 12px,
  - avatar button left offset set to 4px (both tabs),
  - hair line switched to gray Futura Medium,
  - additional notes line bottom spacing added.

**Conventions:**
- Keep B/C row-level spacing and avatar offsets mirrored unless a request explicitly scopes to one tab only.

---

## 2026-04-03 — Consults micro-adjustment: WIG ONLY / WIG + INSTALL text reduced by 1px

**Context:** User requested a single typography tweak on consult cards: reduce the `WIG ONLY` / `WIG + INSTALL` line size by 1px.

**Topics covered (entire conversation so far):**
- Located consult hair/service line in `AdminMeetingsHub`.
- Updated only that line’s `fontSize` from `10px` to `9px`.
- Kept color, font family, margins, and all surrounding row spacing unchanged.
- Committed and pushed to `preview/mobile`.

**Decisions / outcomes:**
- Hair/service line now renders at **9px**.
- No other consult-row properties were modified.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - consult hair line `fontSize`: `10px` -> `9px`.

**Conventions:**
- For micro typography requests, adjust only the requested text node’s font size and keep neighboring spacing constants stable.

---

## 2026-04-03 — Bookings-only spacing pass: client line top gap + payment due bottom gap + avatar raised 4px (consults untouched)

**Context:** The user requested another tightly scoped bookings-tab update on admin meetings cards: increase spacing above the client text line by 6px, increase spacing below the `PAYMENT DUE` row by 6px, and move profile photo icons on the bookings tab up by 4px while explicitly not moving consult-tab profile icons.

**Topics covered (entire conversation so far):**
- Continued from this same long chat thread of iterative bookings/consults/dashboard micro-adjustments (typography, icon sizing, wrapping behavior, payment rows, and tab-scoped spacing tweaks), always shipping to `preview/mobile`.
- Located the bookings card branch in `AdminMeetingsHub` and applied only the requested spacing/offset updates:
  - client identity line top margin increased by 6px (`margin: 0` -> `margin: '6px 0 0'`),
  - payment-due row container received +6px spacing below (`marginBottom: '6px'`),
  - bookings avatar button moved up 4px (`marginTop: '4px'` -> `marginTop: '0px'`).
- Left consult-tab avatar offset unchanged as explicitly requested.
- Build validated successfully.
- During push, remote advanced and caused a rebase conflict in `AdminMeetingsHub`; resolved conflict by preserving the new bookings-only offset/spacing values while keeping latest upstream edits, then continued rebase and pushed.

**Decisions / outcomes:**
- Bookings client text line now starts 6px lower from the top of its text block.
- Payment due row now has 6px extra space below it.
- Bookings profile photos are 4px higher than the immediately prior state.
- Consult profile icons were not modified in this pass.
- Update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings avatar button `marginTop`: `4px` -> `0px`
  - bookings client name line margin: `0` -> `'6px 0 0'`
  - payment due row wrapper added `marginBottom: '6px'`

**Conventions:**
- For tab-scoped icon-position requests in shared meetings layouts, implement in the targeted tab branch only and preserve the other tab’s offsets.

---

## 2026-04-03 — Bookings-only avatar nudge: moved down 2px (consults unchanged)

**Context:** User requested one precise follow-up after prior bookings-only avatar adjustments: move profile photo icons on the bookings tab down by 2px, explicitly without moving consult-tab profile icons.

**Topics covered (entire conversation so far):**
- Continued from this same long chat’s iterative admin meetings style tuning (bookings typography, spacing, add-on wrapping, icon sizing/stroke, and tab-scoped avatar offsets).
- Located the bookings avatar button style in `AdminMeetingsHub` and adjusted only the bookings render branch:
  - `marginTop` changed from `0px` to `6px` relative to the current branch baseline used in this pass (resulting visual movement: +2px down from prior user-confirmed state).
- Confirmed consult-tab avatar button offset remained unchanged (`marginTop: '8px'`).
- Committed and pushed to `preview/mobile`.
- Ran post-push `npm run build` successfully.

**Decisions / outcomes:**
- Bookings-tab profile icons now sit 2px lower than before.
- Consults-tab profile icons were intentionally untouched.
- Build passed and update is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings avatar button `marginTop`: `4px` -> `6px` (consults branch unchanged).

**Conventions:**
- For single-tab offset nudges, preserve the non-target tab value exactly and apply only the requested delta to the target tab.

---

## 2026-04-03 — Bookings micro-pass: +1px client/payment spacing, bookings icon +2px down, and Stripe remaining-balance auto-draft assessment

**Context:** User requested another bookings-tab micro-adjustment pass: add 1px to spacing above the client text line and 1px below the payment-due row, move bookings client panel icons down 2px (bookings-only), and asked whether Stripe setup is needed so remaining install/re-install balances auto-charge from the same card used at booking checkout.

**Topics covered (entire conversation so far):**
- Continued from prior same-chat bookings-only spacing/icon refinements and repeated tab-scoped offset requests.
- Applied requested bookings-only spacing/offset deltas in `AdminMeetingsHub`:
  - client identity line margin increased by +1px (`'6px 0 0'` -> `'7px 0 0'`),
  - payment-due row bottom spacing increased by +1px (`marginBottom: '6px'` -> `'7px'`),
  - bookings avatar button moved down +2px (`marginTop: '6px'` -> `'8px'`).
- Consults-tab avatar offset was intentionally left unchanged.
- Reviewed current Stripe booking/payment code paths:
  - checkout creates product `PaymentIntent` with automatic payment methods but does not persist a reusable mandate for off-session future charges,
  - booking meeting metadata stores payment method label + due metadata only (`bookingPaymentMethodLabel`, `bookingFinalDueUsd`, due dates/policy),
  - no scheduled/future charge job or off-session final-payment capture route exists for booking balances today.
- Pushed UI commit to `preview/mobile` and updated PR pointer.

**Decisions / outcomes:**
- Requested +1px spacing tweaks and +2px bookings-icon movement are implemented.
- Consults icons remain untouched.
- Stripe currently does **not** auto-draft remaining install/re-install balances from the initial booking card in this implementation; additional Stripe + backend setup is required.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings avatar `marginTop`: `6px` -> `8px`
  - bookings client line margin: `'6px 0 0'` -> `'7px 0 0'`
  - payment-due row wrapper `marginBottom`: `'6px'` -> `'7px'`

**Conventions:**
- Keep bookings/consults avatar offsets independently adjustable; for user-scoped “bookings only” deltas, change only bookings branch values.

---

## 2026-04-03 — Bookings-only avatar nudge: moved up 1px, consult avatars unchanged

**Context:** User requested a bookings-only profile-icon movement: move bookings tab profile photos up by 1px and do not move consult tab profile icons.

**Topics covered (entire conversation so far):**
- Confirmed both bookings and consult avatar button styles in `AdminMeetingsHub`.
- Updated only bookings avatar wrapper vertical offset from `marginTop: '8px'` to `marginTop: '7px'`.
- Kept consult avatar wrapper at `marginTop: '8px'` unchanged.
- Resolved repeated preview-branch divergence conflicts while preserving this bookings-only scope.

**Decisions / outcomes:**
- Bookings tab profile icons moved up by exactly 1px.
- Consults tab profile icons were not changed.
- Update is pushed to `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings avatar button `marginTop`: `8px` -> `7px`
  - consult avatar button remains `8px`.

**Conventions:**
- For explicitly tab-scoped avatar tweaks, apply style deltas only in the named tab branch and verify the other tab branch remains unchanged.

---

## 2026-04-03 — Full conversation summary: consults/admin meetings iteration + A/C booking calendar month text parity

**Context:** This chat started with a long sequence of admin meetings/consults UI and flow refinements (navigation return behavior, panel sizing/spacing, icon and typography swaps, mock inspo photos, and tab-scoped pixel nudges), then concluded with a new request to make the month text above A/C booking calendars match the Bohemy month text used on Admin Meetings.

**Topics covered (entire conversation so far):**
- Earlier in this same conversation, multiple consults/bookings/admin-page updates were applied and iterated: client-panel return flow back to meetings B/C tabs, summary panel height/position tuning, client row micro-adjustments, quote icon updates, mock inspo-photo variety (1–3), and selective bookings-vs-consults icon offset changes.
- User’s latest request was specifically: “change the month text above the calendar on a/c booking pages to match the bohemy calendar month text on the admin meetings page.”
- Located the month style source in `AdminMeetingsHub` (Bohemy, lowercase month-only treatment) and identified A/C pages use shared `BrandExpiresDatePicker`.
- Implemented a scoped variant in the shared picker (`monthLabelVariant`) instead of globally replacing all calendar month labels, then enabled that variant only on booking appointment + consultation pages.
- Verified build success after code changes.

**Decisions / outcomes:**
- A/C booking calendars now use Admin Meetings-style month text (Bohemy, lowercase, black, month-only visual treatment) above the calendar.
- Change is intentionally scoped to appointment/consultation booking pages; other `BrandExpiresDatePicker` consumers keep the default Futura month+year style.

**Changes:**
- `src/components/BrandExpiresDatePicker.tsx`
  - Added `monthLabelVariant?: 'default' | 'adminMeetings'`.
  - Added variant-based month label text/style logic.
- `src/pages/booking/appointment/page.tsx`
  - Passed `monthLabelVariant="adminMeetings"` to inline `BrandExpiresDatePicker`.
- `src/pages/booking/consultation/page.tsx`
  - Passed `monthLabelVariant="adminMeetings"` to inline `BrandExpiresDatePicker`.

**Conventions:**
- For shared UI primitives used in multiple contexts, prefer adding an explicit style variant prop and opt-in at call sites rather than changing global default behavior.

---

## 2026-04-03 — Bookings add-on wrap fix: keep multi-word labels together (BROW TINT)

**Context:** User reported a bookings-tab wrapping bug where the `BROW TINT` add-on split across lines (`BROW` on one line and `TINT` on the next), and requested it stay on the same line.

**Topics covered (entire conversation so far):**
- Continued from the same long thread of bookings micro-adjustments (spacing, icon offsets, typography, add-on wrapping behavior) all shipping to `preview/mobile`.
- Located `formatBookingAddonsLineForCardDisplay()` in `AdminMeetingsHub`, which previously only protected wrapped (4th+) add-ons with non-breaking spaces, allowing earlier multi-word add-ons to split at regular spaces.
- Updated formatter to normalize **all** add-on labels to non-breaking word separators before joining and wrapping:
  - convert each add-on token with `addon.replace(/\s+/g, '\u00A0')`,
  - use normalized list for both first line and wrapped line output.
- This keeps labels like `BROW TINT`, `BROW SCULPTING`, `TRAVEL FEE`, etc. intact as single visual phrases across line wraps.
- Ran `npm run build` successfully.
- Rebased on latest `origin/preview/mobile` after remote advanced, then pushed and updated PR pointer.

**Decisions / outcomes:**
- Multi-word booking add-on labels now stay together on the same line.
- `BROW TINT` no longer splits into separate lines at the space boundary.
- Change is live on `preview/mobile`.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - `formatBookingAddonsLineForCardDisplay()` now applies NBSP normalization to every add-on token before formatting.

**Conventions:**
- For booking-card add-on rendering, treat each add-on label as an atomic phrase (use NBSP between words) so wrapping happens between add-ons, not inside an add-on name.

---

## 2026-04-03 — Branch governance locked: preview-first only, no agent-created branches

**Context:** User asked to stop changes getting lost/unseen by enforcing strict branch policy: commit all non-master/non-preview work, remove extra branches, and record that changes must go to preview first and only. User explicitly stated new branches must never be created by the agent unless the user manually creates them.

**Topics covered (entire conversation so far):**
- Continued from this same long chat where multiple feature changes were implemented and eventually merged onto `preview/mobile`.
- User reported visibility issues and requested hard process enforcement to prevent future branch drift.
- Audited local and remote branch state against `preview/mobile`, confirmed feature changes were already present on preview, and prepared branch cleanup.
- Captured explicit user branch policy for future agent sessions in motherboard memory.

**Decisions / outcomes:**
- Working policy is now explicit:
  - all implementation changes should be committed directly to `preview/mobile` first and only,
  - do not create new branches automatically,
  - only work on a new branch if the user manually created it and explicitly instructs its use.
- Non-master/non-preview branches should be treated as temporary and removed after their work is merged to preview.

**Changes:**
- `motherboard/MEMORY.md`
  - appended branch-governance policy entry documenting preview-only workflow and no auto branch creation.

**Conventions:**
- Default and required workflow: commit/push to `preview/mobile` only.
- Agent must never create new branches unless user explicitly requests and manually provisions branch workflow.

---

## 2026-04-03 — Booking final-payment autopay implementation (API + metadata + scheduler + failures + admin visibility)

**Context:** User approved implementing the full five-part Stripe booking autopay scope end-to-end: backend API wiring, metadata persistence, scheduled charging, failure/retry handling, and admin visibility for remaining install/re-install balance drafts.

**Topics covered (entire conversation so far):**
- Continued from the same long bookings-thread context where final-payment due metadata already existed in meetings cards, but there was no off-session charge execution path.
- Implemented checkout/API metadata expansion so appointment meetings now persist autopay fields when available:
  - `bookingStripeCustomerId`, `bookingStripePaymentMethodId`, `bookingAutopayConsent`, `bookingAutopayConsentAt`.
- Extended Stripe product PaymentIntent API to support future off-session charging enrollment:
  - `savePaymentMethodForFuture` request flag,
  - customer create/reuse + profile `stripe_customer_id` persistence,
  - `setup_future_usage: 'off_session'` on PI creation.
- Extended Stripe webhook processing to capture reusable payment method after successful enrollment payment intents:
  - saves `profiles.stripe_default_payment_method_id` (+ customer id if present).
- Added secure scheduler endpoint for autopay execution:
  - `POST /api/booking/autopay-final-payment` (Bearer `BOOKING_AUTOPAY_CRON_SECRET`),
  - scans due appointment meetings, attempts off-session Stripe charge,
  - supports dry-run (`?dry_run=true`), retries with exponential backoff, and idempotent skip behavior after success.
- Added failure/retry + status tracking model:
  - new `booking_autopay_attempts` table migration,
  - writes success/failed/skipped rows with error and retry timing,
  - updates `meetings.metadata.bookingAutopayStatus` and related timestamps/error fields,
  - appends user-facing notifications on success/failure outcomes.
- Added admin visibility API:
  - `GET /api/admin/booking-autopay-attempts` with filter params (`meeting_id`, `user_id`, `status`, `limit`).
- Added profile schema + mapping support for default Stripe payment method:
  - migration for `profiles.stripe_default_payment_method_id`,
  - mapping + profile PATCH preserve/strip rules updated.
- Added checkout UI consent + readiness gates for bookings:
  - explicit booking autopay consent checkbox text,
  - readiness message requiring Supabase session + saved Stripe card profile data,
  - validation blocks confirm when booking autopay consent is missing or Stripe card-on-file readiness is absent.
- Added docs + cron config:
  - `docs/BOOKING_AUTOPAY_SETUP.md` with setup + env + limitation notes,
  - `vercel.json` cron entry for hourly autopay endpoint trigger.
- Ran `npm run build` successfully and pushed to `preview/mobile` after rebase.

**Decisions / outcomes:**
- Full backend autopay pipeline is now implemented for booking final payments, including retries, logging, and admin retrieval endpoints.
- Checkout now captures/validates booking autopay consent and stores autopay metadata on appointment meetings.
- Admin meetings booking cards now show autopay status (`scheduled`, `failed`, `paid`) from metadata.
- Stripe operational setup still required in environment + migrations before production execution.

**Changes:**
- `api/stripe/create-product-payment-intent.ts`
- `api/stripe/webhook.ts`
- `api/booking/appointment-meeting.ts`
- `api/booking/autopay-final-payment.ts` (new)
- `api/admin/booking-autopay-attempts.ts` (new)
- `api/profile.ts`
- `api/_lib/profileMapping.ts`
- `src/pages/checkout/page.tsx`
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
- `src/utils/api.ts`
- `vercel.json`
- `docs/BOOKING_AUTOPAY_SETUP.md` (new)
- `supabase/migrations/20260403200000_booking_autopay_attempts.sql` (new)
- `supabase/migrations/20260403203000_profiles_stripe_default_payment_method.sql` (new)

**Conventions:**
- Booking autopay execution uses secure server-side scheduling (`BOOKING_AUTOPAY_CRON_SECRET`) and writes every outcome to an append-style attempts table for auditability and retry control.

---

## 2026-04-03 — Bookings cards micro-layout: icon down 4px and text column shifted right 6px (bookings tab only)

**Context:** User requested a bookings-tab-only layout tweak on admin meetings cards: move bookings client panel profile icons down by 4px and shift all text to the right of those icons in tandem by 6px.

**Topics covered (entire conversation so far):**
- Continued from the same chat thread after full booking final-payment autopay feature implementation and prior bookings micro-spacing/icon adjustments.
- Scoped edits to the bookings card render branch inside `AdminMeetingsHub` only (left consults branch unchanged):
  - bookings avatar button top offset increased by 4px (`marginTop: '8px'` -> `'12px'`),
  - bookings text column container (the div immediately right of avatar) shifted right by 6px via `marginLeft: '6px'`.
- Verified build success with `npm run build`.
- Rebased onto latest `origin/preview/mobile` after remote advanced, then pushed successfully.

**Decisions / outcomes:**
- Bookings-tab icons now sit 4px lower.
- All bookings text content to the right of profile icons moves 6px right in tandem.
- Consults-tab icon/text alignment remains unchanged.

**Changes:**
- `src/pages/admin/meetings/AdminMeetingsHub.tsx`
  - bookings avatar button style: `marginTop: '8px'` -> `marginTop: '12px'`
  - bookings right text column wrapper: added `style={{ marginLeft: '6px' }}`

**Conventions:**
- For “bookings-only” layout requests in shared meetings card code, apply offsets in bookings branch containers so text and icon alignment move together while preserving consults branch values.
