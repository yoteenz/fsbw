# Article K18 — Progressive Presence™

**Constitutional Behavioral Law #10 · Layer 3 governance · Ratified 2026-07-08**

---

## Preamble

Information should never exist simply because it exists. Information earns its presence based on the founder's intent.

The architecture should always remain the primary experience. The interface should appear only when curiosity or interaction requires it.

**The environment comes first. Knowledge comes second. UI comes last.**

---

## Core Principle™

The architecture IS the interface. The interface should never overpower the architecture.

A founder should first feel like they entered a place. Only afterward should they realize how much intelligence exists beneath it.

---

## Five Presence Levels™

| Level | Name | What appears |
|-------|------|----------------|
| 0 | Architecture™ | Environment only — lighting, materials, atmosphere |
| 1 | Ambient™ | Max 3 elements — district, one Orb line, one indicator |
| 2 | Context™ | After tap — World Health detail, civilization pulse |
| 3 | Professional™ | After explore — metrics, monuments, chain reactions |
| 4 | Architect™ | Advanced — global destinations, tier badges, graph debug |

---

## Progressive Presence Engine™

Central visibility authority at `src/studio-os-core/progressive-presence/`.

Every UI element registers:

- Presence Level™
- Priority™
- Required Intent™ (ambient · tap · explore · architect)
- Visual Weight™ · Animation Weight™ · Dismiss Behavior™

Components consult `resolvePresenceVisibility()` — they do not self-decide.

React hook: `useProgressivePresence(roomId)`.

---

## One Primary Focus™

Each room answers one question first (see `room-focus.ts`).

---

## Design Law™

If removing a panel improves the room, remove the panel. If the founder still needs the information, let the Orb, Atlas, or intentional interaction reveal it.

**Code:** `src/studio-os-core/progressive-presence/` · `src/studio-os-core/studio-world-experience/` · `src/components/admin/studio/global-experience/`

**Global system:** `docs/studio-os/governance/GLOBAL_EXPERIENCE_SYSTEM.md` — departments inherit via `StudioWorldExperienceProvider`; no per-department wiring.
