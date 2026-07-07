# Experience Studio™ — Interactive Prototype

**Type:** High-fidelity HTML/CSS/JS experience prototype  
**Status:** Complete · No backend · No production code  
**URL:** `/experience-studio-prototype/` (static)

---

## Purpose

A **movie-set prototype** — every screen feels real, nothing persists. Founders and reviewers can spend hours walking the complete Experience Studio™ journey before engineering begins.

This is **not** the Phase 0 React demo at `/admin/studio/digital-architect`. Rebuild engineering to this experience.

---

## Quick Start

```bash
# From repo root — any static server works
npx serve public -p 3456
# Open http://localhost:3456/experience-studio-prototype/
```

Or open `public/experience-studio-prototype/index.html` directly (some features need a local server for fonts).

---

## Screens Implemented

| Screen ID | Name | States |
|-----------|------|--------|
| — | Arrival ceremony | Entry animation |
| — | Welcome | First-visit hero |
| scr-es-004 | Project Dashboard | Search · filter · cards |
| scr-es-001 | Experience Type Entry | 13 types · Director hint |
| scr-es-002 | Creative Interview | 5 steps · skip path |
| scr-es-003 | Authoring Workspace | Generating · canvas · edit |
| scr-es-007 | Publish Pipeline | Steps · success bloom |
| scr-es-008 | Version History | Compare slider · restore |
| scr-es-005 | Assets | Upload simulation · grid |
| scr-es-006 | Templates | Browse · apply modal |
| scr-es-009 | Settings | 4 panels · toggles |

### Global Systems

- Studio Orb™ — idle · thinking · opportunity · radial menu
- Floating dock — Director · DNA · Remix · Inspector
- Command palette — ⌘K
- Context menu — right-click canvas sections
- Motion — transitions · panel slides · ceremonial publish
- Toast · modals · auto-save indicator

---

## Interaction Map

```
Arrival → Welcome → Dashboard
         ↓              ↓
    Type Entry ←───────┘
         ↓
    Interview (5 steps)
         ↓
    Workspace (generate → edit)
         ↓
    Publish → Success → Dashboard
```

**Side paths:** Assets · Templates · Version History · Settings — all navigable from workspace chrome and command palette.

---

## Validation

See [EXPERIENCE_VALIDATION_CHECKLIST.md](./EXPERIENCE_VALIDATION_CHECKLIST.md) for per-screen scores and revision flags.

---

## Governance

- Inherits Design Governance — does not redefine
- Specification reference: [Prototype Package](./README.md)
- **Not authorized for production deployment** without Founder Approval

---

*Walk the experience. Feel the studio. Then approve engineering.*
