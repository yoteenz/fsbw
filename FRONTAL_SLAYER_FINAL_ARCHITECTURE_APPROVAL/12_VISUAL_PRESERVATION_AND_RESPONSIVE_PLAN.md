# 12 — Visual Preservation and Responsive Plan

**Principle: correct the layout containers, not the look.** Every fix below wraps existing markup in a shared container or adjusts its width, target size or semantics. Marble, glass, chrome, the red/gray palette, Futura PT, Covered By Your Grace, Bohemy, the medallions, collectible art, concierge/PSA characters and the immersive environments stay exactly as they are.

Evidence: audit doc 19 (204-render sweep), audit doc 18 (shell inventory), `appendix/V2_assets_components.md` (this package).

## 1. What is preserved (non-negotiable)

| Element | Where it lives today | Rule |
|---|---|---|
| Marble background | `/assets/marble-half.png` inline layers; `MarblePageShell` | Same asset, same scale and repeat; moves into the shared shells unchanged |
| Translucent glass card | `rgba(255,255,255,0.6)` + `backdrop-blur-sm` + 1.3px black/gray border | Same values; shells reuse them verbatim |
| Breadcrumb bar | `ACCOUNT > X` / `ADMIN > X`, red current crumb | Same grammar; only labels change where families are renamed |
| Typography | Futura PT Book/Medium/Demi (`src/index.css`), Covered By Your Grace (Google Fonts), Bohemy (`@font-face`) | No substitutions; `Inter` stays a fallback only |
| Brand red / gray | `#EB1C24`, `#808080` | No new accents. Semantic success/warning colours limited to existing admin feedback (green `#166534`, red `#b91c1c`) |
| Alert-row typography canon | CORE.md (title / gray Demi body / red action) | Becomes the empty, error and toast standard everywhere |
| Collectible phase art, loyalty medallion, concierge/PSA avatar expressions | Supabase Storage `live-preview/Collectibles/…`, `/assets/…` | Never regenerated; referenced as they are |
| Build-A-Wig Atelier, Lounge, Lobby, Desktop Mansion rooms | Immersive shells | **Different interaction model, intentionally.** These are scenes, not record views. Account and admin link into them; they are not re-laid out by this plan. |

## 2. Targeted corrections (from the audit sweep)

| Problem (evidence) | Correction | Visual change? |
|---|---|---|
| Account pages stretch edge to edge at 1440/2560 (sweep: order card ~2,000px wide with ~200px of content) | `AccountShell` centres a column: **max 720px** (forms, overview, settings) or **960px** (orders, rewards, my hair, reviews). Marble fills the sides. | Only on ≥768px; the phone is unchanged |
| Admin fixed at 448px on every device | `AdminPageShell` widths: ≤767 = 448 column (unchanged); 768–1023 = 720; ≥1024 = **1280 max** with list + inspector | Gated (G3) |
| 30% of tap targets <24px at 390 (243/812) | Minimum hit area 44×44 via padding. Visible text sizes may stay small where the design calls for it (e.g. 9px CHANGE PHOTO keeps its type size but gains a 44px hit box). | No visible change |
| 135 clickable `div`/`span`/`img` elements, 12 with role/tabIndex | Convert to `<button>`/`<a>` with existing classes, or add `role`, `tabIndex=0` and Enter/Space handlers. Add a 2px `#EB1C24` focus ring (`:focus-visible` only). | Focus ring appears only for keyboard users |
| Nested fixed-height scroll boxes (alerts 467px, orders 265px, stages 200px) | Remove on phone; the document scrolls (FRONTAL SLAYER rule; **not** Studio World's no-page-scroll) | Slight: longer pages |
| Single-line truncated alert bodies and dashboard rows | Wrap to 2 lines with a "MORE" affordance | Slight |
| Nav bar scrolls away | Sticky nav bar with a `env(safe-area-inset-top)` offset | Slight |
| Collectibles is a plain white page; consult-offer has no nav | Wrap in `AccountShell` | Brings them **into** the brand look |
| Trend Desk / PSA Broadcast are black SaaS screens | Re-skin onto the admin glass shell (G5) | Gated |
| `'15px !important'` inline icon sizes ignored | Use valid style values | Restores the intended size |

## 3. Layout authority per family

| Family | Mobile (≤767) authority | Tablet (768–1023) | Desktop (≥1024) | Ultra-wide (≥1920) | Max readable width | Sidebar / nav | Inspector | Internal scroll | Modal / drawer |
|---|---|---|---|---|---|---|---|---|---|
| Customer Overview | Existing single column | 720 column | 720 column (or Desktop Penthouse per B5) | same, centred | 720 | Menu-toggle card (ACCOUNT tab) | — | none | Photo crop modal |
| Orders (+ detail) | Existing list; detail as a page | 960 | 960; detail two-column (timeline · items) | centred | 960 | menu | — | none | Need-help modal |
| Concierge | Existing | 720 | 720 | centred | 720 | menu | — | none | Upgrade modal (exists) |
| Rewards | Existing; tabs scroll horizontally inside their strip | 960 | 960 | centred | 960 | menu | — | tab strip only | Redeem confirm modal |
| My Hair | New page in the same card language | 960 | 960 | centred | 960 | menu | — | none | New-analysis drawer (bottom sheet on phone, right drawer ≥1024) |
| Wishlist / lists | Existing | 720 | 720 | centred | 720 | menu | — | none | Existing list modals |
| Reviews & Content | Existing | 720 | 720 | centred | 720 | menu | — | none | Supplemental-media modal (exists) |
| Earn & Share | Existing | 720 | 720 | centred | 720 | menu | — | none | Invite modal (exists) |
| Alerts | Existing | 720 | 720 | centred | 720 | menu | — | none | — |
| Settings (+ children) | Existing | 720 | 720 | centred | 720 | menu | — | none | Delete-account confirm (exists) |
| Admin list families (Orders, Approvals, Customers, Rewards, Inbox, Inventory) | 448 column, row cards | 720 | 1280 shell: list + inspector drawer | centred 1280 | 1280 | Admin menu drawer (all widths) | Right drawer ≥1024; full sheet on phone | Tables: horizontal scroll inside the table container; sticky header | Confirmations in modals; edits in drawers |
| Admin detail pages (Order, Customer) | Stacked sections | 720 | Two-column (main · activity timeline) | centred 1280 | 1280 | menu | — | none | Tracking/refund drawers |
| Command Center | 1-column tiles | 2-column tiles | 3–4-column queue grid | centred 1280 | 1280 | menu | — | tile lists cap at 3 items (no inner scroll) | — |
| Immersive (Atelier, Lounge, Lobby, Desktop Mansion) | **Own interaction model; out of this plan** | — | — | — | — | — | — | — | — |

## 4. Design-authority gates (founder visual sign-off before shipping)

| Gate | Change | Decision |
|---|---|---|
| G1 | Account desktop column widths (720/960) and an optional side rail ≥1024px | G1 |
| G2 | Admin menu drawer in `AdminHeader` | G2 |
| G3 | Admin wide shell and Command Center queue layout | G3 |
| G4 | Account Overview status panels | G4 |
| G5 | Trend Desk / PSA Broadcast re-skin | G5 |
| — | MY HAIR page (new page, existing language) | B2 + G4 |

**Review method:** baseline screenshots from the audit sweep (390/768/1440/2560) against the candidate at the same widths, reviewed side by side. No speculative mockups or new media are produced in this sprint.
