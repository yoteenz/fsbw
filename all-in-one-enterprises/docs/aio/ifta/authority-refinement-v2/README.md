# AIO IFTA · three-mode authority refinement V2

Sprint `P0.AIO.IFTA.THREE-MODE-AUTHORITY-REFINEMENT-V2`. This is a surgical refinement of the three V1 authority compositions (public, client, staff / founder). It covers typography, hierarchy, spacing, module proportions and responsive composition.

It does not change:
- the concepts or hero imagery
- the content or copy
- the data or business logic
- the brand

**Nothing live was changed.** The work lives in a scratch worktree on `aace9d2d`. It ships here as a reference patch for the live implementation pass.

| | V1 (kept for comparison) | V2 |
|---|---|---|
| Public | https://claude.ai/artifact/WQDLzooEj26KangyyzKssx | https://claude.ai/artifact/Mwz9TDJadxqKMPpcoBxxCR |
| Client | https://claude.ai/artifact/JDEeSCFdEea3JUTDkYxMzw | https://claude.ai/artifact/D4rPXM9faMgPse25oUxgzt |
| Staff / founder | https://claude.ai/artifact/LbuNRAW5JrDtnevYrjSfQ4 | https://claude.ai/artifact/2562hEnELiQyQSjCkoB5FR |

- Boards: `boards/v1-v2-public.jpg`, `boards/v1-v2-client.jpg`, `boards/v1-v2-staff.jpg`, and the equal-scale `boards/v2-three-mode-board.jpg`.
- Reference patch: `v2-reference.patch`, against `aace9d2d`. It applies cleanly with `git apply -p1` from the repo root.
- The V2 links are static snapshots and are **not** refreshed by the mock routine. The V1 links follow `master` (see `../visual-reconstruction/MOCKS.md`), so they turn into V2 once V2 lands on `master`. The V1 look stays on record in the boards here.

## Shared system

All values are in the authority unit: 1rem = 10 px at the band's reference width. The references are desktop 1440, tablet 834 (staff 1024) and phone 402.

The tokens live on `.ifta-root`, so every actor uses one scale. Each actor varies only the hero lockup sizes.

### Type scale T0–T7

Faces:
- **Inter Tight** for headings, metrics, labels, actions, tabs and status.
- **Inter** for body text and metadata.
- **No other faces.** Monument Extended is not used, because no licence is on file.

Uppercase is reserved for headings, labels, tabs and status.

| Token | Role | Desktop | Tablet | Phone | Weight / tracking |
|---|---|---|---|---|---|
| T0 | hero signal (Q3 2026) | 84 · staff 68 · public 100 | 80 · staff 72 · public 88 | 48 · staff 44 · public 46 | 600 / −0.025em |
| T1 | page title (IFTA FILING ROOM) | 22 · staff 18 · public 30 | 22 · staff 20 · public 28 | 14 · staff 13 · public 15 | 500 / 0.10em |
| T1s | period | 20 · staff 17 · public 24 | 20 · staff 18 · public 24 | 13 · staff 12 · public 13 | 500 / 0.08em |
| TL | hero lines | 16 · staff 15 · public 20 | 16 · public 20 | 12 | 500 / 0.05em, staff client name 600 |
| T2 | section title | 26 | 26 · public 24 | 18 | 500 / 0.08em |
| T3 | card / module title | 16 | 17 | 14 | 600 / 0.06em |
| T4 | metric value | 30 · public 34 | 28 · public 30 | 22 · public 20 | 600 (public 500) / −0.01em |
| T5 | body / row text | 15 | ≥ 15 (floor 13 px) | ≥ 14 (floor 13 px) | 400–500 / 0 |
| T6 | metadata | 13 | ≥ 13 (floor 12 px) | ≥ 12 (floor 11.5 px) | 400 / 0–0.03em |
| T7 | eyebrow / label / status / chip | 12 | ≥ 12 (floor 11.5 px) | ≥ 11 (floor 11 px) | 600 / 0.06–0.08em |
| tab · CTA · button · state pill | | 13 · 20 · 14 · 16 | 13 · 20 · 15 · 16 | 12 · 16 · 13 · 13 | 600 |

**Readability floors.** Text never drops below 12 px on desktop or tablet, or below 11 px on phone. The only exceptions are the file-type glyphs drawn inside the DOC / PDF / CSV icons.

The table below shows measured computed sizes. V1 phones ran at 6–9 px body because the phone layout was the desktop layout squeezed; V2 phones run at 12–14 px.

| Role (px, V1 → V2) | public 1440 | public 834 | public 402 | client 1440 | client 834 | client 402 | staff 1440 | staff 1024 | staff 402 |
|---|---|---|---|---|---|---|---|---|---|
| T0 hero signal | 116.8 → 100 | 104.5 → 88 | 46 → 46 | 88 → 84 | 92.1 → 80 | 46 → 48 | 89.3 → 68 | 107.2 → 72 | 50.2 → 44 |
| T1 page title | 41.2 → 30 | 34.4 → 28 | 17.9 → 15 | 24.7 → 22 | 24.7 → 22 | 14.4 → 14 | 24.7 → 18 | 27.5 → 20 | 13.8 → 13 |
| T3 card title | — | — | — | 18.5 → 16 | 20.5–23.5 → 17 | 8.2–9.6 → 14 | 19–23 → 16 | 17.5–23 → 17 | 7–11 → 14 |
| T4 metric value | 37 → 34 | 30 → 30 | 14 → 20 | 29 → 24/30 | 24–28.5 → 22/28 | 13–17 → 18/22 | 34 → 24/30 | 30–35 → 22/28 | 11–13 → 18/22 |
| T5 body | 17.5 → 15 | 19.5–21 → 15 | 7.5–9 → 12–14 | 14–16.5 → 15 | 15–18.5 → 15 | 6.5–7.5 → 14 | 15.5–17.5 → 15 | 19.5–20 → 15 | 6.6–7.5 → 14 |
| T6 metadata | 14.5–15 → 13 | 15 → 13 | 7.2 → 12 | 14–15 → 13 | 13.5–18.5 → 13 | 6–6.5 → 12 | 14.5–15 → 13 | 16.5–19.5 → 13 | 6–6.5 → 12 |
| T7 label / status | 20 → 13 | 16 → 13 | 6.6 → 12 | 12–19 → 12–16 | 14.5–20.5 → 13–16 | 7–8.8 → 11–13 | 12–19 → 12–16 | 13–21 → 12–16 | 5.5–8.8 → 11–13 |
| Tabs | — | — | — | 15 → 13 | 14.5 → 13 | 7.5 → 12 | 14.5 → 13 | 15 → 13 | 7.5 → 12 |
| CTA label | 17–20 → 14–15 | 20–22 → 15 | 9.5–10 → 13–15 | 17–18 → 14–20 | 21.5 → 20 | 13 → 16 | 27 → 20 | 26 → 20 | 13 → 16 |

### Spacing scale

| Step | s1 | s2 | s3 | s4 | s5 | s6 | s7 | s8 | s9 |
|---|---|---|---|---|---|---|---|---|---|
| px | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 48 | 64 |

| Setting | Desktop | Tablet | Phone |
|---|---|---|---|
| Gutter | 24 | 24 | 16 |
| Section rhythm | 48 | 40 | 32 |
| Card padding | 20 | 20 | 16 |
| Card gap | 16 | 16 | 12 |
| Card radius | 12 | 12 | 10 |

Rows in lists, tasks, uploads and activity are at least 52 px tall on phone, so they work as tap targets.

### Module proportions

**Desktop** keeps the V1 authority grids.

**Tablet:**
- Staff: risks/flags moves from a one-third card to a full-width row, directly above the next-action rail (WHAT NEEDS ATTENTION, then WHAT STAFF DOES NEXT). Client activity and AIO team activity become a half-and-half pair.
- Staff below 1024 px keeps a 10 px authority unit instead of shrinking the 1024 layout.
- Client: the insights and activity row grows to fit its content.

**Phone:** one column, ordered by what matters now.
- Client: filing progress, quick actions, next-action rail, jurisdiction map, uploads, insights, activity.
- Staff: risks/flags, next-action rail, quarter tasks, workflow, mileage, fuel, client activity, team activity.
- Metric rails are 2 × 2, never five across.
- Tabs become a scrolling strip with a fade that shows more follow.

### CTA hierarchy

1. **Primary.** The dark next-action rail: gold eyebrow, white Inter Tight 600 label, gold arrow tile. There is one per view. On phone it sits beside the module it acts on, and its label wraps to two lines instead of being cut.
2. **Secondary.** Outlined actions: public SEE HOW IT WORKS, quarter-card buttons, EXPORT REPORT.
3. **Tertiary.** Text links: View All with an arrow.

Public GET STARTED stays the gold filled pill, the single conversion action.

### Status system

The hero state pill, row chips, case-state chips, risk chip and health chip are one family:
- same Inter Tight 600 uppercase type
- same tracking
- same radius
- height 40 px (hero pill, 32 px on phone) or 24 px (chips)

The colour semantics are unchanged:

| Colour | Meaning |
|---|---|
| Gold | needs you / awaiting |
| Green | confirmed / on track |
| Blue | needs review |
| Red | blocked |

### Icon scale

| Use | Desktop / tablet | Phone |
|---|---|---|
| Metadata | 16 | 14 |
| Row | 20 | 18 |
| Card / quick action | 24 | 20 |
| Metric rail | 32 | 24 |

The public dark rail uses 40 px icons on desktop and 32 px on tablet. Stroke weights are unchanged.

## Per mode

### Public (dark cinematic)

**Typography**
- The hero lockup is rescaled: Q3 2026 goes from 117 to 100 px, with a calmer title and period.
- One section title size (T2) and one body size; labels are trimmed from 20 to 13 px.
- On phone, body copy goes from 7.5–9 px to 12–14 px.

**Composition**
- The hero text block sits on a dark left scrim, and the truck stays visible.
- Phone hero is auto-height. Process tiles are 2-up, the one-return card stacks, and the promises stack.
- The tablet hero tagline keeps its two-line break so it clears the truck.
- Process tiles get a bottom inset.
- The footer brand lockup returns to V1 presence.
- The tablet metric rail fits again: V1's $2,184.32 overflowed it by 7–11 px.

**Copy:** no changes. Hidden line breaks now render as spaces; V1 phone would have run "ROUTES" and "ACROSS" together.

### Client (light premium Filing Room)

**Typography**
- Hero lockup on the shared scale; card titles at 16–17 px; metadata at 13 px.
- Tabs at 13 px, readable on phone at 12 px. V1 phone tabs were 7.5 px.

**Composition**
- Desktop hero lines and the state pill share one foot row.
- The phone order puts quarter identity, status, metrics, progress, next action, then key modules.
- Rows wrap to two lines instead of clipping.
- The activity table's event column is widened.

### Staff / founder (light command)

**Typography**
- Q3 2026 drops from 89–107 px to 68–72 px.
- The hero text is white on a dark scrim. In V1 it was dark text on the dark fleet plate.
- The client name is set in 600 white, so CLIENT reads first and QUARTER second.

**Composition**
- The health panel is lighter, top-anchored and no longer covers the rail.
- On phone the health panel moves below the 2 × 2 metrics as a one-column list.
- Phone order: risks, next action, tasks, workflow, charts, activity.
- Tablet: risks span full width above the next action.
- Table columns get a 12 px gutter, and activity and risk detail may take a second line.

**Staff queue:** the same phone health-panel recomposition and a case list on the V2 scale. Before this, 7.5 px metadata and the health panel covered the hero.

## Checks (V2 worktree on aace9d2d)

| Check | Result |
|---|---|
| Overflow | No horizontal overflow at 375, 390, 402, 834, 1024 or 1440 on public, client, staff and queue. |
| Clipped text | None in the three modes. The detector covers ellipsis, overflow, line-clamp and content outside its card. |
| Readability floors | Met (see above). |
| `tsc` | Clean. |
| `vitest src/ifta` | 21 / 21. |
| Functional interaction pass | 41 / 43, the same 41 / 43 as untouched `master` `aace9d2d`. |

The two functional failures come from the Cursor-agent commit `596dc269`, not from V2:
1. The client page shows a "Client health" card. The staff-only guard forbids CLIENT HEALTH in client mode.
2. The staff primary action reads "Return draft" instead of "Nudge client".

Both await a founder decision. V2 keeps them as they are.

No new image generation was needed, and none was run.
