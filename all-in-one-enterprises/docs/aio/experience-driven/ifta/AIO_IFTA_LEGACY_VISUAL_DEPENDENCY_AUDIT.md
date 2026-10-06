# AIO IFTA — Legacy Visual Dependency Audit

**Sprint:** P0.AIO.EXPERIENCE-DRIVEN-PAGE-REFINEMENT1 · founder override
**Status:** AUDIT COMPLETE · visual build stopped · nothing visual committed
**Machine-readable:** `AIO_IFTA_LEGACY_VISUAL_DEPENDENCY_AUDIT.json` (41 dependencies) · `AIO_IFTA_FUNCTIONAL_CONTRACT.json`
**Evidence:** `evidence/legacy/*.jpg` (captured from the running app, demo mode)

## Rule applied

Legacy AIO visuals carry zero design authority. Legacy code is used only for function, data, routing, business logic, permissions, content truth and existing capabilities.

## Where visual authority actually stands today

| Source | What it settles | What it leaves open |
|---|---|---|
| **AIO brand foundation — LOCKED** (`docs/structural-completion/AIO_FORENSIC_EXECUTIVE_SUMMARY.md`) | Tagline, positioning, voice. Typography: **uppercase primary**. **Nav uses the simple monogram only**; full lockup in lower bands, footer, intro moments. Palette: obsidian, charcoal, signature gold, platinum/silver, stone white, warm champagne. | Hex values; typefaces; no standalone monogram file exists |
| AIO IDNTY case (SITE00 `docs/site00/idnty/intake/AIO_IDNTY_INTAKE_VALIDATION_CASE.json`) | Verbal system: WHERE BUSINESS MEETS THE ROAD. · THE BUSINESS OFFICE BEHIND THE TRUCK. · FROM STARTUP TO EVERY MILE AFTER. Voice: operator / business partner / road office. Brand world: American road + business office — asphalt, paper, cab, dispatch. Documentary operational truth with professional polish. | Mark, palette, type, visual grammar are IN_PROGRESS. No hex values claimed. Prohibits generic semi hero shots, stock handshakes, highway clip art, mascots. |
| Brand-family skin AIO (SITE00 `shared/site00-brand-lore/projectSkin/brandFamily/registry.ts`) | Skin intent OPERATIONAL_COMMAND; gold family, distinct from Studio World | Status NEW_SKIN_TO_DESIGN · visual authority NOT_STARTED |
| Workspace Experience Brain — AIO DNA + IFTA contracts (vendored, SITE00 @ 5d6c074) | Register EXECUTIVE INDUSTRIAL × MODERN INFRASTRUCTURE; palette names BLACK · GOLD · SILVER · OBSIDIAN · CHARCOAL · STONE · CHAMPAGNE; emphasis map per role; QUARTERLY FILING ROOM; archetypes; per-state composition, CTAs, sections, viewports | Contract itself records IFTA expression authority NONE |
| Founder-approved new composition | — | This review |

So the new family is composed from the brain + IDNTY directly, and anything the authorities leave open is listed as a founder decision, not filled from the legacy app.

## Findings that matter most

1. **No client IFTA surface exists.** `/portal/services/ifta` falls into the service tracker and renders SERVICE NOT FOUND (`evidence/legacy/legacy-portal-ifta-route.jpg`).
2. **The public desktop page has no styling at all.** `aio-page-system.css` is imported by nothing, so the desktop service template renders as raw stacked text (`legacy-public-desktop.jpg`).
3. **The public page states availability the product does not have.** `getPublicServiceCta` has no slug mapping for `ifta-filing`, so the page shows AVAILABLE / GO with "Get Started" while the catalog says PREPARING and the launch matrix says fuel tax is INTERNAL_ONLY ("Staff-coordinated filing"). Founder decision D-04.
4. **The public copy is abstract placeholder text.** "End-to-End Guidance · Fast & Reliable · Accuracy You Can Trust · Ongoing Support" and "All In One coordinates this step with your business profile." repeated per step.
5. **Four competing CTAs** on the public page; the contract allows one (REQUEST FILING).
6. **Uppercase primary is locked brand; its legacy implementation is not.** One global CSS transform forces caps on every string including form inputs, receipts and long copy. The new family keeps uppercase primary and asks only for a sentence-case exception inside paper records (D-05), citing IDNTY_09 document legibility.
6b. **The legacy nav breaks the locked mark rule.** Every nav bar carries the full lockup; the lock says nav uses the simple monogram only. No standalone monogram file exists (D-06).
7. **The hero truck photo is prohibited imagery** under IDNTY_10 (generic semi hero shot). The IFTA icon asset is cropped. Neither is reused.
8. **The client shell runs business logic.** `AIOPortalLayout` triggers `runExpirationEvaluation()` and `runBillingEvaluation()`; any new shell must keep both.
9. **The staff shell owns staff identity.** `AIOOfficeLayout` sets the acting staff member and hosts the command palette; the new staff shell keeps identity and permission checks.
10. **Content-truth bugs found on the way:** Road Ready and Start Your Business link IFTA to slug `ifta-setup`, which no catalog entry has; `labelForCategory('tax_fuel')` returns "Permits".
11. **Cross-client activity leak (fixed).** My Office activity showed customer-visible events from every organization; it is now scoped by `clientId`. This is a privacy fix, not a visual change.

## Per-surface separation

### Public — `/services/ifta-filing`

| Keep (function / truth) | Discard (visual) |
|---|---|
| Route path; catalog lookup; quote-required pricing; requirements (fuel purchase records, mileage by jurisdiction); prerequisite link to IFTA registration; smart-intake request destination `getStartedForService('ifta-filing')`; service-plan capability; skip link | AIOPublicLayout shell (nav, plan bar, footer); ServiceDetailTemplate + left "On this page" rail; MobileServiceDetailView; generic benefits + process copy; four-CTA stack; status box; `.aio-app` tokens; forced caps; hero truck photo; cropped IFTA icon |

### Client — `/portal/services/ifta` (+ My Office, Vault, Inbox, Activity touchpoints)

| Keep | Discard |
|---|---|
| CustomerRouteGuard; portal org context; both evaluation side effects; unread count; attention / next-action engine; Vault documents + taxonomy; notifications; conversations; activity | AIOPortalLayout sidebar / bottom nav / grey canvas; command-center cards (navy hero, orange-ruled attention cards, emoji quick actions); Road Ready ring; vault card grid + metrics bar; inbox list rows; activity rows; `aio-badge` / `aio-cc-*` / `aio-portal-*` CSS; 767px mobile split |

### Founder / staff — `/office/permitting/fuel-tax`

| Keep | Discard |
|---|---|
| OfficeRouteGuard; staff identity; office permissions; staff notifications; communications store; requests by division | AIOOfficeLayout (80-link sidebar, search header, red badge, + NEW); DivisionQueuePage list + pills; `aio-office-table` styling |

## This sprint's own work, classified

| Item | Class | Decision |
|---|---|---|
| Vendored brain contracts + typed accessor (`src/ifta/experience`) | Brain consumption | Keep |
| Quarter case model, derivations, contract-transition reducers, Inbox / Activity / Vault emission (`src/ifta/*`) | Function | Keep |
| Store hook, additive unions, path helpers | Function / routing | Keep |
| Tax & Fuel filter on Notifications, IFTA filter on Activity, settings label | Function on legacy surfaces | Keep the function; visuals stay legacy until those families are rebuilt |
| Planned mounting into legacy shells, reuse of hero photo and `.aio-app` tokens | Visual plan | **Withdrawn** — never committed |
| Default section lists for states the contract does not cover | Composition inference | Re-decided in the concept, marked PROPOSED |

## What happens next

The new page family is proposed in `AIO_IFTA_PAGE_FAMILY_CONCEPT.md` and the companion contracts. No visual implementation starts until the founder approves the composition and the decisions listed there.
