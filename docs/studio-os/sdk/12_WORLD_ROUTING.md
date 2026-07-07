# 12 — World Routing

**SDK Module:** `studio.department.sdk.v1.routing`  
**Status:** Spatial navigation specification  
**Philosophy:** Departments are locations — not pages

---

## Definition

**World Routing** governs how users **travel** between departments, buildings, and Headquarters locations. Navigation is spatial movement through a business world — never URL page transitions or tab switching.

> Users travel. They arrive. They work. They leave.

---

## Navigation Model

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADQUARTERS WORLD                        │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Building │    │ Building │    │ Building │              │
│  │    A     │    │    B     │    │    C     │              │
│  │ ┌──────┐ │    │ ┌──────┐ │    │ ┌──────┐ │              │
│  │ │Dept 1│ │    │ │Dept 3│ │    │ │Dept 5│ │              │
│  │ │Dept 2│ │    │ │Dept 4│ │    │ │Dept 6│ │              │
│  │ └──────┘ │    │ └──────┘ │    │ └──────┘ │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              MISSION CONTROL (HQ Hub)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              WORLD MAP (quick travel)               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Location Types

| Type | ID Pattern | Description |
|------|-----------|-------------|
| **Headquarters** | `hq:{orgId}` | Organization root — Mission Control |
| **Building** | `bld:{buildingId}` | Major wing or destination |
| **Department** | `dept:{departmentId}` | Interactive world (SDK governed) |
| **Workspace** | `ws:{workspaceId}` | Focused room inside department |
| **Transit** | `transit:{corridorId}` | Connection path between locations |

---

## Travel Methods

### 1. Walk (Default)

User exits department via Exit Portal → traverses corridor/transit → enters destination via Entry Portal.

| Property | Value |
|----------|-------|
| Speed | Cinematic (Motion Standard departure + arrival) |
| Duration | 3–8s depending on distance |
| Visual | Corridor or outdoor path between buildings |
| Audio | Ambient crossfade between departments |
| State | Origin department → BACKGROUND; destination → LOADING |

### 2. Quick Travel (World Map)

User opens World Map → selects destination → abbreviated transit.

| Property | Value |
|----------|-------|
| Speed | Abbreviated cinematic |
| Duration | 2–3s |
| Visual | Map zoom to destination + brief transit flash |
| Audio | Transit whoosh |
| State | Same as walk |

### 3. Orb Dispatch

User speaks destination to Orb → Orb confirms → travel initiates.

| Property | Value |
|----------|-------|
| Speed | Standard walk or quick travel (user preference) |
| Trigger | `orb-conversation` verb with destination intent |
| Confirmation | Orb repeats destination before travel |
| Accessibility | Primary method for voice-first users |

### 4. Command Dock Navigation

User types or selects destination in Command Dock™.

| Property | Value |
|----------|-------|
| Speed | Quick travel |
| Trigger | Command Dock department command |
| Display | Available destinations listed with status |

### 5. Deep Link (External)

External system or notification links directly to a department.

| Property | Value |
|----------|-------|
| Speed | Arrival sequence only (skip transit) |
| Trigger | URL route `/admin/studio/{department}` |
| Behavior | Route resolves to department travel with arrival animation |
| Note | URL is a transport mechanism — user still experiences arrival |

---

## Arrival

Every department entry executes the arrival sequence (Motion Standard 08):

```
1. User materializes at Entry Portal
2. Camera: arrival → hero (department reveal)
3. Lighting sequence activates
4. Ambient audio crossfades in
5. Orb acknowledgment (if configured)
6. Camera: hero → primary (ready to work)
7. State: ACTIVE
```

### Arrival Context

| Context | Arrival Variation |
|---------|-------------------|
| First visit ever | Extended arrival (5s) + Orb introduction |
| Return visit | Standard arrival (3s) |
| Return with pending work | Arrival + notification toward pending item |
| Return after completion | Arrival + subtle celebration if output was satisfied |
| Deep link with project | Arrival + project context on Project Board |

---

## Entry Animation

Entry animations are **department-specific in character, SDK-consistent in structure**:

| Phase | Animation | Genome Influence |
|-------|-----------|------------------|
| Portal activate | Entry portal shimmer | `colorPrinciples` |
| Materialize | User presence fade-in | — |
| Reveal | Camera travel into room | `motionPhilosophy` |
| Identity | Hero space illumination | `lightingStyle` |
| Welcome | Orb pulse | `personality` |
| Settle | Camera to primary | `pacing` |

---

## Exit Animation

| Phase | Animation |
|-------|-----------|
| Save state | Work preserved on surfaces |
| Camera travel | Current → departure position |
| Portal activate | Exit portal shimmer + destination preview |
| Audio fade | Ambient crossfade out |
| Traverse | User exits through portal |
| Origin state | BACKGROUND |

---

## Return Paths

Every department maintains **return path memory**:

| Return Path | Description |
|-------------|-------------|
| **Last visited** | Return to previous department |
| **Origin** | Return to department that sent work here |
| **HQ Hub** | Return to Mission Control |
| **Project home** | Return to department where active project lives |

Return paths appear on Exit Portal as destination options.

---

## Department Connections

Departments declare connections in anatomy `dependencies` and `outputs`:

```yaml
Connection:
  from: dept:marketing
  to: dept:distribution
  type: enum           # workflow | reference | approval | asset-handoff
  direction: enum      # one-way | bidirectional
  transitStyle: enum   # corridor | portal | conveyor
  visualIndicator: boolean   # show connection on exit portal
```

### Connection Types

| Type | Visual | Trigger |
|------|--------|---------|
| **Workflow** | Corridor with directional lighting | Output port satisfied |
| **Reference** | Doorway with preview thumbnail | User selects |
| **Approval** | Formal portal with seal | Approval handoff |
| **Asset handoff** | Conveyor or shelf bridge | Asset dropped on output |

---

## World Map

The World Map is the **spatial overview** of the entire Headquarters.

| Feature | Description |
|---------|-------------|
| Layout | Top-down or isometric view of buildings and departments |
| Status indicators | Active project glow, pending approval pulse, AI activity |
| Quick travel | Click any department to travel |
| Building grouping | Buildings shown as connected structures |
| Locked departments | Uninstalled expansions shown as "available to expand" |
| User position | Current location highlighted |

### World Map Data Source

```
Organization Architecture Profile (industry-architecture)
         ↓
Installed Department Packs
         ↓
Active Project locations
         ↓
World Map render
```

---

## Quick Travel

| Rule | Specification |
|------|---------------|
| Availability | All installed departments |
| Restrictions | Permission-denied departments shown but locked |
| Animation | Abbreviated transit (2–3s) |
| Audio | Transit whoosh + destination ambient fade in |
| Skip | User can skip transit animation |
| Keyboard | `G` key opens World Map from any department |

---

## Studio Navigation

Platform-level navigation supplements spatial travel:

| Method | Scope | Behavior |
|--------|-------|----------|
| **Command Dock** | Any department | Type destination or command |
| **Orb** | Any department | Speak destination |
| **Breadcrumb** | UI overlay | Shows HQ → Building → Department (informational, not clickable path) |
| **Back to HQ** | Any department | Quick travel to Mission Control |
| **Recent locations** | Command Dock | Last 5 departments visited |

**Rule:** Breadcrumbs are **informational overlays** — they do not replace spatial navigation. Clicking breadcrumb triggers quick travel, not page load.

---

## Routing Configuration

```yaml
WorldRoutingConfig:
  headquartersId: string
  buildings:
    - id: string
      departments: string[]
      position: { x, y }       # world map coordinates
      connections: Connection[]
  defaultDepartment: string    # arrival for new users
  transitStyle: enum         # corridor | teleporter | walk
  worldMapEnabled: boolean
```

---

## Multi-Department Workflow Routing

When work flows between departments:

```
Marketing (approve) → Output port satisfied
    → Conveyor animation to Distribution
    → Distribution Entry Portal receives asset
    → Publishing Concierge acknowledges arrival
    → User may follow or continue in Marketing
```

User is **not forced** to follow work — AI employees handle handoff. User can follow via Exit Portal connection indicator.

---

## Forbidden Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Page tab navigation between departments | Departments are locations |
| Instant teleport without any transition | Breaks spatial continuity |
| URL-only navigation without arrival | User must experience arrival |
| Hidden departments (no world map entry) | All installed departments visible |
| Forced linear path | User can travel to any permitted department |
| Breadcrumb as primary navigation | Spatial travel is primary |

---

_Next: [13 — Marketplace Packaging](./13_MARKETPLACE_PACKAGING.md)_
