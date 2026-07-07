# Headquarters Navigation Philosophy — Experience Studio™ 2.0

**Version:** 2.0.0  
**Parent:** [Experience v2 Package](./README.md)  
**Inherits:** [Executive Information Architecture](../../../executive-information-architecture.md) · `experience-architecture.yaml`

---

## Core Rule

```
Users move through Headquarters.
They do not navigate pages.
```

Scrolling = walking. Doors = wings. Cards = departments. Orb = executive transport.

---

## Spatial Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDIO OS HEADQUARTERS CAMPUS                 │
│                         (marble · glass · light)                 │
├─────────────────────────────────────────────────────────────────┤
│  EXECUTIVE LOBBY ─── today's pulse · priorities · arrival       │
├──────────────┬──────────────────────────────┬───────────────────┤
│ INNOVATION   │      OPERATIONS WING         │  KNOWLEDGE WING   │
│ WING         │  Production · Intelligence   │  Library · Memory │
│ Creative     │  Review · Publishing         │                   │
│ Direction    │                              │                   │
│ Experience   │                              │                   │
│ Studio™      │                              │                   │
├──────────────┴──────────────────────────────┴───────────────────┤
│  MARKETPLACE PLAZA ─── expansions · ghost previews              │
├─────────────────────────────────────────────────────────────────┤
│  LEGACY WING ─── achievements · milestones · plaques            │
└─────────────────────────────────────────────────────────────────┘
         Studio Orb™ — bottom center — always available
```

*Wing names inherit Headquarters Experience™ V2 canon.*

---

## Navigation Mechanisms

| Priority | Mechanism | Use |
|----------|-----------|-----|
| 1 | **Studio Orb™** | "Take me to…" · teach · collaborate |
| 2 | **Walking (scroll)** | Within wing interiors |
| 3 | **Department cards** | Destination selection — Executive IA |
| 4 | **Environmental doors** | Wing-to-wing transitions |
| 5 | **Campus map** | Spatial orientation · progress |
| 6 | **Command palette** | Power user jump — ⌘K |

**Never primary:** Left sidebar · hamburger admin menu · breadcrumb-only IA.

---

## Destination Catalog

### Innovation Wing

| Destination | Entry | Character |
|-------------|-------|-----------|
| **Creative Direction Studio** | Lobby card · Orb | Inspiration · brief · mood boards |
| **Experience Studio™** | Studio door · Project | Canvas · DNA · Remix — v1.0 spec |
| **Digital Architect™** | Advanced · power users | IA · structure beneath experiences |

### Production Wing (Studio Production Engine™)

| Destination | Department # | Character |
|-------------|---------------|-----------|
| Discover | 01 | Research library |
| Development | 02 | Writers' room |
| Assembly | 03 | Staging floor |
| Production Stage | 04 | Main creation |
| Review Theater | 05 | Preview seats |
| Expansion Gallery | 06 | Derivatives |
| Approval Chamber | 07 | Signatures |
| Publishing Control Room | 08 | Go-live monitors |
| Intelligence Center | 09 | Analytics observatory |
| Learning Garden | 10 | Reflection |

### Executive & Support

| Destination | Wing | Character |
|-------------|------|-----------|
| Executive Lobby | Core | Priorities · pulse |
| Executive Office | Core | Preferences · Founder settings |
| Knowledge Library | Knowledge | Brand · assets · memory |
| Marketplace Plaza | Expansion | HQ Expansions™ |
| Legacy Wing | Legacy | Achievements · history |

---

## Transition Language

| From → To | Motion | Duration | Copy pattern |
|-----------|--------|----------|--------------|
| Wing → Wing | Corridor fade · door open | 480ms | "Entering [Wing]" |
| Department → Department | Handoff ceremony | 400ms | Concierge intro |
| HQ → Creative Studio | Marble crossfade · zoom 98→100% | 480ms | v1.0 MOTION_SPEC |
| Any → Executive Lobby | Pull back · campus visible | 320ms | "Headquarters" |

---

## Campus Map (Persistent HUD)

Optional · collapsible · never competes with focus:

- Wing lights = activity status
- Project dots = active productions
- Ghost buildings = available expansions
- Tap dot → travel to Project

---

## Mobile Navigation

| Desktop | Mobile |
|---------|--------|
| Walking scroll | Vertical travel preserved |
| Department cards | Full-width cards · swipe |
| Floating dock | Bottom sheet |
| Campus map | Collapsed strip · expand to full |
| Orb | Bottom center · safe area |

---

## Breadcrumb Philosophy

Breadcrumbs are **location names** — not URL paths:

```
HEADQUARTERS › INNOVATION WING › CREATIVE DIRECTION STUDIO › PROJECT 014
```

Tap any segment → travel to that destination (with confirm if unsaved).

---

*Headquarters Navigation — inhabit · don't administrate.*
