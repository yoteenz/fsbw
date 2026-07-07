# Screen Walkthrough — Experience Studio™

**Version:** 1.0.0  
**Parent:** [Prototype Package](./README.md)  
**Fidelity:** High — layout · typography · states · components

---

> Walk through every screen as if experiencing the finished product.

---

## Global Chrome (All Screens)

| Element | Component | Position | Behavior |
|---------|-----------|----------|----------|
| Studio Orb™ | `comp-studio-orb` | Bottom-center · 24px from edge | Always visible · never blocks canvas |
| Save indicator | `comp-status-indicator` | Top-right metadata | Auto-save every 30s · "Saved" fade |
| HQ breadcrumb | `comp-navigation` | Top-left · subtle | "Headquarters › Creative Wing" · tap returns |
| Command palette | `comp-command-palette` | ⌘K overlay | Global |

**Environment:** Marble background bleeds edge-to-edge. No gray app frame.

---

## Screen 1 — `scr-es-004` Project Dashboard

### Purpose
Home base — all projects · resume work · create new.

### Desktop (1280+)

```
┌────────────────────────────────────────────────────────────┐
│  HEADQUARTERS › CREATIVE WING                    [⌘K] [+]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   YOUR EXPERIENCES                                         │
│   ─────────────────                                        │
│   [Search...........................]  [Active|Draft|All]  │
│                                                            │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│   │ Website      │ │ Landing Page │ │ + Create     │      │
│   │ Salon Lumière│ │ Spring Promo │ │              │      │
│   │ Draft · 2h   │ │ Published ✓  │ │              │      │
│   │ ████░░ 72%   │ │ Live →       │ │              │      │
│   └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                            │
│                    [ Studio Orb ]                          │
└────────────────────────────────────────────────────────────┘
```

| Zone | Spec |
|------|------|
| Cards | `comp-card` · glass · 16:10 preview thumbnail · metadata below |
| Create card | Dashed glass edge · "+" centered · "Begin new experience" |
| Tabs | `comp-tabs` · Active · Drafts · Published · Archived |
| Search | `comp-search` · filters by title · type |

### States

| State | Treatment |
|-------|-----------|
| **Empty** | Single hero card: "Create your first experience" · Director quote · no table |
| **Loading** | Skeleton cards · shimmer on glass |
| **Error** | Inline banner · retry · drafts preserved locally |

### Tablet
2-column card grid · search full-width above.

### Mobile
Single column · swipe actions (archive · duplicate) · FAB "+" bottom-right above Orb.

### Entry / Exit
- **Entry:** HQ Creative Wing · Orb · deep link
- **Exit:** Open project → Workspace · Create → Type Entry

---

## Screen 2 — `scr-es-001` Experience Type Entry

### Purpose
Choose what kind of experience to create — narrative, not form.

### Desktop

```
┌────────────────────────────────────────────────────────────┐
│  ← Projects          WHAT WOULD YOU LIKE TO CREATE?        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   Studio Intelligence™ listens. Pick a world — or describe │
│   something entirely your own.                             │
│                                                            │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│   │ Website │ │ Landing │ │ Store   │ │ Portal  │         │
│   │ flagship│ │ page    │ │ commerce│ │ client  │         │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ... (13 total)      │
│   │ Mobile  │ │ Academy │ │ Custom  │                     │
│   └─────────┘ └─────────┘ └─────────┘                     │
│                                                            │
│   [ Browse templates ]              [ Studio Orb ]         │
└────────────────────────────────────────────────────────────┘
```

| Card | Content |
|------|---------|
| Label | Experience type name · Futura PT Medium 9px uppercase |
| Hint | One line · muted · e.g. "Flagship presence · editorial rhythm" |
| Hover | Glass brightens · 2px lift · hint expands 1 line |
| Selected | Crystal edge glow · org accent |

**Component:** `comp-card` experience-type variant (VDR-103 proposed · compose from `comp-card` until ratified)

### Custom path
"Something Else" card → Director opens: "Describe your world in one sentence."

### States
- **Empty N/A** — always 13 cards
- **Director suggestion** — Orb glow · "Based on your industry, Website might fit best"

---

## Screen 3 — `scr-es-002` Creative Interview

### Purpose
Capture style · audience · feeling — conversation before configuration.

### Desktop

```
┌────────────────────────────────────────────────────────────┐
│  ● ● ● ○ ○  Step 2 of 5 — AUDIENCE          [Skip →]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│              ┌─────────────────────────────────┐          │
│              │  FROSTED GLASS PANEL            │          │
│              │  comp-floating-panel · centered │          │
│              │                                 │          │
│              │  Who is this experience for?    │          │
│              │                                 │          │
│              │  [Hair Brand] [Law Firm]        │          │
│              │  [Restaurant] [Medical] ...     │          │
│              │                                 │          │
│              │  Or tell the Director →         │          │
│              │  ┌─────────────────────────┐  │          │
│              │  │ comp-ai-chat inline     │  │          │
│              │  └─────────────────────────┘  │          │
│              │                                 │          │
│              │         [ Continue ]            │          │
│              └─────────────────────────────────┘          │
│                                                            │
│                    [ Studio Orb ]                          │
└────────────────────────────────────────────────────────────┘
```

### Steps

| Step | Question | Input |
|------|----------|-------|
| 1 | Style direction | Chip grid · Luxury · Editorial · Minimal · … |
| 2 | Audience | Industry chips + Director freeform |
| 3 | Desired feeling | Inspired · Exclusive · Confident · … |
| 4 | DNA preview | 70/20/10 blend visualization |
| 5 | Confirm | Director summary · "Create my experience" |

**Progress:** `comp-progress-system` · dots + label · not numbered steps (calmer)

### Skip path
Returning users: "Skip — use my org defaults" link · goes to Generating with Design Genome™.

### Tablet / Mobile
Full-screen sheet · one question per view · swipe or Continue.

---

## Screen 4 — `scr-es-003` Authoring Workspace (Primary)

### Purpose
The heart of Experience Studio™ — canvas dominates · intelligence surrounds.

### Desktop — Default State

```
┌────────────────────────────────────────────────────────────┐
│ Salon Lumière · Website · Saved 2s ago          DH: 84  ⌘K │
├────────────────────────────────────────────────────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓                                                          ▓│
│▓     HERO — editorial headline · large calm type           ▓│
│▓     Subhead in org body · generous leading              ▓│
│▓                                                          ▓│
│▓     ─── section boundary (subtle) ───                   ▓│
│▓                                                          ▓│
│▓     FEATURES — three column · glass cards on canvas      ▓│
│▓                                                          ▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│                                                            │
│  [Publish]                              [ Studio Orb ]     │
└────────────────────────────────────────────────────────────┘
```

**Canvas:** `comp-canvas` · crystal frame · 85%+ viewport · scroll for long experiences.

### Section Selected

- Thin org-accent outline · 4px offset
- Inline handles appear on hover (desktop) · long-press (mobile)
- `comp-inspector-panel` slides from right dock — 320px max · glass

### Floating Dock (Right-Lower)

Triggered by: Orb menu · panel icons · ⌘I

```
┌─────────────────────┐
│ DIRECTOR │ DNA │ REMIX │ INSPECTOR │  ← tabs
├─────────────────────┤
│ [Active panel body] │
│                     │
└─────────────────────┘
```

**Component:** `comp-floating-dock` · slides in 280ms · click-outside dismisses · remembers tab.

### Design DNA™ Panel

- 12 personality chips with % sliders
- Sum = 100 indicator
- Live canvas update on release (not during drag — performance)
- Director note: "Luxury at 70% — I've widened margins and softened contrast."

### Experience DNA™ Panel

- 12 vertical sliders · labels left · value right
- Grouped: Motion · Material · Space · Intelligence
- Reduced motion: sliders still work · canvas respects instantly

### Remix™ Panel

- Horizontal scroll chips: "More Luxury" · "More Editorial" · …
- Tap → canvas **preview** overlay (not committed)
- Director explains diff below chips
- Accept · Try another · Revert

### Generating State

- Canvas: soft marble · `comp-progress-system` center
- Director narrates: "Composing your hero… structuring your story…"
- Orb: thinking state
- Duration prototype: 4–8s simulated · skippable if cached

### Empty Canvas (edge case)

Director: "Let's add your first section." · 3 suggestion cards on canvas ghost area.

---

## Screen 5 — `scr-es-007` Publish Pipeline

### Purpose
Preview · validate · celebrate — not a settings form.

### Desktop — Split View

```
┌──────────────────────────┬─────────────────────────────────┐
│  LIVE PREVIEW            │  READY TO PUBLISH?              │
│  (full canvas render)    │                                 │
│                          │  Design Health™    87  PASS     │
│                          │  Accessibility     ✓            │
│                          │  SEO metadata        ✓            │
│                          │  Mobile preview      ✓            │
│                          │                                 │
│                          │  URL: salon.studio.os/...       │
│                          │                                 │
│                          │  [ Preview in new tab ]         │
│                          │  [ Publish experience ]         │
└──────────────────────────┴─────────────────────────────────┘
```

### Publish Success

- Canvas full-screen · subtle light bloom 600ms
- Metadata: "Your experience is live."
- Primary: View live · Share · Return to HQ
- No confetti · no gamification — quiet pride

### Blocked Publish

Design Health™ <70: Director explains blockers · links to fix · "Improve accessibility contrast" with jump-to-section.

---

## Screen 6 — `scr-es-008` Version History

### Desktop

- Left: `comp-table` timeline · name · date · author · AI/human badge
- Right: side-by-side canvas compare · slider divider
- Restore → `comp-modal` confirm

---

## Screen 7 — `scr-es-005` Assets · `scr-es-006` Templates · `scr-es-009` Settings

Documented at standard fidelity — glass grids · minimal forms · Director help links.

**Settings scope:** Product prefs only — NOT global design (inherits governance).

---

## State Catalog (Cross-Screen)

| State | Visual language |
|-------|-----------------|
| **Loading** | Skeleton shimmer on glass · Director copy · never spinner-only |
| **Error** | Warm tone · specific fix · retry · never red alarm |
| **Empty** | Invitation · single CTA · Director voice |
| **Success** | Subtle glow · one line · next action |
| **AI thinking** | Orb breathe · dock typing dots · canvas dim 5% |
| **Offline** | Banner top · "Editing locally · will sync" |

---

## Accessibility (Prototype)

| Requirement | Prototype expression |
|-------------|---------------------|
| Focus order | HQ nav → canvas → dock → Orb |
| Keyboard | Tab sections · Enter edit · Esc dismiss dock |
| Contrast | AA on all glass combos (see review findings) |
| Reduced motion | All animations → instant per MOTION_SPEC |
| Screen reader | Landmarks: main canvas · complementary dock |

---

## Cross-References

| Document | Path |
|----------|------|
| Interactions | [INTERACTION_DIAGRAMS.md](./INTERACTION_DIAGRAMS.md) |
| Responsive | [RESPONSIVE_SPECIFICATION.md](./RESPONSIVE_SPECIFICATION.md) |
| Motion | [MOTION_SPECIFICATION.md](./MOTION_SPECIFICATION.md) |

---

*Screen Walkthrough — every pixel in service of the creation.*
