# UX · Interaction · Motion Recommendations — Experience Studio™ 2.0

**Version:** 2.0.0  
**Parent:** [Experience v2 Package](./README.md)

---

## UX Recommendations

### Spatial & Information Architecture

| # | Recommendation | Rationale |
|---|----------------|-----------|
| U1 | **One hero per viewport** | Executive IA — never compete for attention |
| U2 | **Travel metaphor everywhere** | "Entering" · "Continuing to" — not "Loading page" |
| U3 | **Campus map as orientation** | Reduces lost-in-space anxiety |
| U4 | **Project dashboard as production room** | Not sortable table default |
| U5 | **Ghost previews for locked content** | Curiosity without FOMO pressure |
| U6 | **Founder Notes always visible on Project** | Reinforces ownership |
| U7 | **Status language human** | "On the Production Stage" not `in_production` |
| U8 | **Maximum 3 introductions day one** | Progressive disclosure |
| U9 | **Breadcrumb = travel path** | Tap segment to navigate |
| U10 | **All interface copy uppercase** | Studio OS metadata discipline — v1 prototype precedent |

### AI & Collaboration UX

| # | Recommendation |
|---|----------------|
| A1 | Proposal card pattern everywhere — Accept · Preview · Alternative · Why? |
| A2 | Director narrates all state changes — never silent mutation |
| A3 | Confidence badge on structural proposals |
| A4 | Undo highlight 30s after AI commit |
| A5 | Teach mode on first department entry — 30s max |
| A6 | Orb max 1 unprompted suggestion per 5 minutes |

### Onboarding UX

| # | Recommendation |
|---|----------------|
| O1 | First Project within 15 minutes of login |
| O2 | Skip paths at every ceremony step |
| O3 | Returning users bypass ceremony — 200ms to Mission Control |
| O4 | HQ generation skippable after 4s |
| O5 | No 12-slide feature tour — ever |

---

## Interaction Recommendations

### Primary Interaction Model

```
Orb (navigate · collaborate)
    ↓
Destination focus (hero · canvas · department)
    ↓
Ephemeral dock (on demand)
    ↓
Command palette (power)
    ↓
Context menu (precision)
```

### Gesture & Input

| Context | Desktop | Mobile |
|---------|---------|--------|
| Travel | Click card · Orb command | Tap card · Orb · voice |
| Project compare | Slider divider | Swipe compare |
| Inspiration | Drag drop | Share sheet → wall |
| Department continue | Primary CTA | Sticky bottom CTA |
| Dismiss panel | Esc · click-outside | Swipe down sheet |

### Department Handoff

| Step | Interaction |
|------|-------------|
| Exit criteria met | Concierge modal — not auto-advance |
| Confirm continue | Single CTA — "Continue to [Next]" |
| Transition | 400ms corridor — asset follows |
| Arrival | Concierge greet — 10s max |

### Marketplace

| Step | Interaction |
|------|-------------|
| Preview | "Walk preview" — 30s inhabitation |
| Install | Confirm + Director summary |
| First visit | Learn by doing — one task |

---

## Motion Recommendations

*Inherits v1.0 MOTION_SPECIFICATION · extends for HQ-wide travel.*

### Token Extensions (propose VDR-301)

| Token | Duration | Use |
|-------|----------|-----|
| `motion-ceremonial` | 480–600ms | Wing entry · HQ generation · publish |
| `motion-corridor` | 400ms | Department-to-department |
| `motion-campus` | 320ms | Map updates · building materialize |
| `motion-teach` | 280ms | Teach card appear |
| `motion-orb-breathe` | 2400ms | Idle loop |
| `motion-ghost` | 400ms | Locked preview fade |

### Transition Catalog

| Transition | Duration | Easing |
|------------|----------|--------|
| Auth → Threshold | 480ms | ceremonial |
| HQ generation | 800ms blueprint + 600ms wing | ceremonial |
| Wing → Wing | 480ms | ceremonial |
| Department handoff | 400ms | standard |
| Marketplace install | 600ms | ceremonial |
| Achievement plaque | 400ms | emphasis |
| Panel dock | 280ms | standard |

### Motion Rules

| Rule | Detail |
|------|--------|
| One focal animation per moment | Never simultaneous competing motion |
| Stagger max 8 items | Then batch instant |
| Reduced motion | All → instant · opacity only |
| No confetti particles | Quiet pride only |
| No bounce easing | Confident ease-out only |

---

## Accessibility Recommendations

| # | Recommendation | Priority |
|---|----------------|----------|
| X1 | Glass contrast audit all combos | P1 |
| X2 | Focus order: environment → hero → dock → Orb | P1 |
| X3 | Landmarks: main · complementary · navigation | P1 |
| X4 | Voice = text parity for Orb commands | P1 |
| X5 | 44px touch targets mobile | P1 |
| X6 | Reduced motion respects system + override | P2 |
| X7 | Screen reader announces travel destination | P2 |

---

## Responsive Recommendations

| Breakpoint | Paradigm |
|------------|----------|
| Desktop ≥1280 | Campus visible · floating docks |
| Tablet 768–1279 | Full travel · stacked sheets |
| Mobile <768 | Vertical travel · bottom sheets · Orb safe area |

**Rule:** Mobile is not a reduced admin UI — it is the same headquarters, tighter corridors.

---

## Content & Copy Recommendations

| Context | Pattern |
|---------|---------|
| Arrival | "Let's build your headquarters." |
| Travel | "Entering [Destination]" |
| Blocked | "Here's what we need before continuing." |
| Success | "Your experience is live." |
| Achievement | "[Milestone] — [Project name]" on plaque |
| Error | Warm tone · specific fix · retry |

**Typography:** Uppercase metadata · editorial display for hero moments — inherit Design Language.

---

*UX Recommendations — experience decisions ready for Figma and prototype v2.*
