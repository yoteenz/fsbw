# Responsive Specification — Experience Studio™ Prototype

**Version:** 1.0.0  
**Parent:** [Prototype Package](./README.md)  
**Inherits:** [Design Language System™](../../../design/DESIGN_LANGUAGE_SYSTEM.md) § Platforms

---

## Breakpoints

| Name | Range | Primary device |
|------|-------|----------------|
| **Desktop** | ≥1280px | MacBook · external monitor |
| **Tablet** | 768–1279px | iPad · landscape priority |
| **Mobile** | 320–767px | iPhone · Android |

---

## Layout Paradigm by Device

| Paradigm | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| **Canvas dominance** | 85%+ height | 80%+ | 100% width · 75%+ height |
| **Chrome** | Metadata strip only | Compact strip | Minimal · collapses on scroll |
| **Panels** | Floating dock right | Floating dock / sheet | Bottom sheets |
| **Orb** | Bottom center | Bottom center | Bottom center · safe area |
| **Navigation** | Breadcrumb + tabs | Tabs | Bottom nav for project switch |
| **Inspector** | Dock tab | Dock / drawer | Full bottom sheet 85% |
| **Director** | Dock tab | Dock tab | Half-height sheet |
| **Command palette** | Center modal | Center modal | Full-screen search |

---

## Desktop (≥1280px)

### Project Dashboard
- 3-column card grid · 24px gap
- Search + tabs single row
- Preview thumbnails 16:10

### Type Entry
- 4-column card grid · 13 cards · 2 rows + wrap
- Hints visible on hover

### Workspace
- Canvas centered · max-width 1200px content simulation inside full-bleed marble
- Floating dock: 380px × auto height · right 24px · bottom 96px (above Orb)
- Toolbar: hidden until hover near bottom edge

### Publish
- 60/40 split · preview left · checklist right

---

## Tablet (768–1279px)

### Project Dashboard
- 2-column cards
- Search stacks above tabs

### Type Entry
- 2-column grid · larger touch targets 48px min

### Workspace
- Canvas full width · reduced side margin 16px
- Dock: 340px or full-width sheet when <900px
- Inspector: drawer from right 40% width
- Orb: 52px target

### Publish
- Tabbed: Preview | Checklist
- Sticky publish CTA bottom

### Orientation
- **Landscape:** Preferred · dock beside canvas if width ≥1024
- **Portrait:** Sheet pattern for all panels

---

## Mobile (<768px)

### Project Dashboard
- Single column cards · full width
- FAB "+" fixed bottom-right · above Orb · 56px
- Swipe left: archive · swipe right: duplicate

### Type Entry
- Single column scroll · one card per row · hero image left 64px
- Sticky "Browse templates" footer

### Interview
- Full-screen steps · one question per view
- Chips wrap · 44px min height
- Director input: fixed bottom above keyboard

### Workspace
- Canvas edge-to-edge · pinch zoom preview mode only
- Section select: tap → floating edit chip on section
- Inspector: `comp-drawer` bottom sheet 85% · drag handle
- Director: bottom sheet 50% · expandable to 90%
- DNA / Remix: separate sheets · not tabs (cognitive load)
- Publish: full-screen preview → swipe up checklist

### Orb Mobile
- 56px · safe-area-inset-bottom + 16px
- Radial menu: semicircle above Orb · larger labels

---

## Touch & Gesture Summary

| Action | Mobile gesture |
|--------|----------------|
| Select section | Single tap |
| Edit text | Tap "Edit" chip · or double-tap |
| Open Director | Tap Orb → Ask Director |
| Dismiss sheet | Drag down · or tap scrim |
| Undo | Shake device **disabled** · toolbar undo only |

---

## Typography Scale Adjustments

| Role | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| Metadata | 8px caps | 8px | 9px min |
| Canvas headline | 48–72px | 40–56px | 32–40px |
| Director body | 14px | 14px | 15px |
| Chip label | 10px caps | 11px | 12px |

---

## Performance (Prototype Notes for Engineering)

| Device | Constraint |
|--------|--------------|
| Mobile | Max 1 glass blur layer active |
| Tablet | Max 2 floating panels |
| Desktop | Max 2 docks (inspector + director) |

---

## Cross-References

| Document | Path |
|----------|------|
| Screen Walkthrough | [SCREEN_WALKTHROUGH.md](./SCREEN_WALKTHROUGH.md) |
| Interactions | [INTERACTION_DIAGRAMS.md](./INTERACTION_DIAGRAMS.md) |

---

*Responsive Specification — one experience · three expressions · canvas always wins.*
