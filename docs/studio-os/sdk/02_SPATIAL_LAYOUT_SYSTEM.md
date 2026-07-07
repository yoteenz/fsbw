# 02 — Spatial Layout System

**SDK Module:** `studio.department.sdk.v1.spatial`  
**Status:** Mandatory layout contract  
**Philosophy:** Departments are physical environments — not dashboards

---

## Core Principle

> A user entering a department should immediately understand **where they are**, **what they can do**, and **how to leave** — without reading a single label.

Spatial layout is the **stage direction** for business work. Every department shares the same topological grammar while remaining visually unique through Genome adaptation and asset variation.

---

## Coordinate System

Departments exist in a normalized spatial envelope:

```
┌─────────────────────────────────────────────────────────────┐
│                        SKY / CEILING                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   HERO SPACE (back wall)             │    │
│  │              Mood Wall · Mission Display             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  SECONDARY ZONES          PRIMARY ZONE          SECONDARY    │
│  (left flank)            (center stage)         (right flank) │
│                                                              │
│                    ┌──────────┐                              │
│                    │   ORB    │  ← elevated, always visible  │
│                    │ PEDESTAL │                              │
│                    └──────────┘                              │
│                                                              │
│  ┌──────────┐                              ┌──────────┐     │
│  │  ENTRY   │                              │   EXIT   │     │
│  │  PORTAL  │                              │  PORTAL  │     │
│  └──────────┘                              └──────────┘     │
│                        FLOOR PLANE                           │
└─────────────────────────────────────────────────────────────┘
```

### Spatial Axes

| Axis | Range | Meaning |
|------|-------|---------|
| `X` | -1.0 to 1.0 | Left (negative) to Right (positive) |
| `Y` | 0.0 to 1.0 | Floor (0) to Ceiling (1) |
| `Z` | -1.0 to 1.0 | Entry (negative) to Back wall (positive) |
| `depth` | 0.0 to 1.0 | Foreground focus to background atmosphere |

All object placements reference this coordinate system. Camera positions are defined relative to these axes.

---

## Mandatory Spatial Elements

Every department layout MUST include all elements below. Visual expression varies; topology does not.

### 1. Entry Point

| Property | Specification |
|----------|---------------|
| Position | `Z = -0.9`, centered on `X = 0` |
| Width | 15–25% of department envelope |
| Purpose | Arrival orientation — user materializes here |
| Objects | Entry Marker, arrival lighting trigger |
| Camera | Default arrival camera faces into department |

**Arrival behavior:**
- User enters from World Routing travel animation
- Entry lighting sequence activates (see Motion Standard)
- Orb acknowledges arrival if configured
- Hero space becomes visible within 1.5s

**Forbidden:** Instant teleport with no orientation. Popup onboarding modals at entry.

---

### 2. Hero Space

| Property | Specification |
|----------|---------------|
| Position | Back wall, `Z = 0.85–1.0`, full width |
| Height | 40–60% of vertical envelope |
| Purpose | Department identity, current mission, atmospheric anchor |
| Objects | Mood Wall, Mission Display, optional Media Display |
| Lighting | Primary lighting anchor — brightest zone |

**Hero space communicates:**
- What department this is (Genome-adapted, not hardcoded)
- Current active project or mission
- Department health / status at a glance

**Rules:**
- Hero space is always visible from entry camera
- Hero content updates dynamically — never static decoration
- Mood Wall reflects Company Genome `brandEmotions` domain

---

### 3. Primary Interaction Zone

| Property | Specification |
|----------|---------------|
| Position | Center stage, `Z = 0.2–0.5`, `X = -0.3 to 0.3` |
| Purpose | Main work surface — where primary responsibilities execute |
| Objects | Timeline Table, Project Board, Command Console, or department-specific primary surface |
| Camera | Primary work camera — default after arrival settles |

**Rules:**
- One primary zone per department — never competing primary surfaces
- Primary zone objects accept the department's core interaction verbs
- User is guided here within 3s of arrival (subtle camera nudge, not forced)

---

### 4. Secondary Interaction Zones

| Property | Specification |
|----------|---------------|
| Position | Left flank (`X = -0.6 to -0.3`) and/or right flank (`X = 0.3 to 0.6`) |
| Purpose | Supporting work — reference, history, comparison, preview |
| Objects | Asset Shelf, Preview Screen, Version History panel, Reference Drop zone |
| Depth | Slightly behind primary zone (`Z = 0.1–0.3`) |

**Rules:**
- Maximum 2 secondary zones (left + right)
- Secondary zones are discoverable but not demanding
- Camera can orbit to secondary zones — never requires menu navigation

---

### 5. Orb Position

| Property | Specification |
|----------|---------------|
| Position | Elevated center-right or center-left, `Y = 0.5–0.7`, `Z = 0.3–0.5` |
| Purpose | Ambient intelligence presence — always accessible |
| Objects | Orb Pedestal (required object class) |
| Visibility | Must remain in peripheral vision from all standard camera positions |

**Rules:**
- Orb never blocks primary work surface
- Orb pedestal height ensures Orb floats above furniture plane
- Orb zone accepts `speak`, `orb-conversation`, `command` verbs
- Orb position is consistent across all departments (muscle memory)

---

### 6. Lighting Anchors

| Property | Specification |
|----------|---------------|
| Count | Minimum 3 per department |
| Types | Hero anchor, Primary work anchor, Ambient fill |
| Genome hook | `lightingStyle` domain |

**Anchor placement:**

| Anchor | Position | Purpose |
|--------|----------|---------|
| Hero Key | Above hero space, `Y = 0.85` | Identity illumination |
| Work Key | Above primary zone, `Y = 0.75` | Task illumination |
| Ambient Fill | Ceiling grid or window sources | Atmospheric depth |

**Rules:**
- Lighting never hardcoded — always Genome-adapted
- Interactive walls and glass objects receive secondary fill
- Ceremony zone has dedicated accent anchor (activates on approval/launch)

---

### 7. Mood Wall Placement

| Property | Specification |
|----------|---------------|
| Position | Hero space back wall, full width |
| Object class | `mood-wall` |
| Purpose | Emotional and brand atmosphere surface |
| Content | Genome-driven imagery, color fields, motion textures |

**Rules:**
- Mood Wall is not a static image — it breathes (subtle motion per Motion Standard)
- Updates when Company Genome `brandEmotions` or `visualReferences` change
- Serves as department "skybox" equivalent — sets emotional tone

---

### 8. Interactive Walls

| Property | Specification |
|----------|---------------|
| Position | Flanking walls, `X = ±0.85–0.95` |
| Object class | `interactive-wall` |
| Purpose | Contextual information, reference boards, live feeds |
| Interaction | Pin, Annotate, Reference Drop |

**Rules:**
- Maximum 2 interactive walls per department
- Walls are optional for minimal departments but recommended
- Content is project-scoped, not department-global

---

### 9. Furniture Rules

Furniture establishes spatial hierarchy and affordance.

| Rule | Specification |
|------|---------------|
| Primary surface | One dominant work table/console — Glass Table, Timeline Table, or Command Console |
| Seating | Optional — Genome determines presence (law firm: yes; creative studio: often no) |
| Shelving | Asset Shelf along secondary zones for reference materials |
| Pedestals | Orb Pedestal required; optional display pedestals for featured assets |
| Spacing | Minimum 0.15 units between furniture objects (prevents visual crowding) |
| Scale | Furniture scales with Genome `spatialDesign` domain — luxury brands: generous; operational brands: compact |

**Forbidden:**
- Flattened UI panels masquerading as furniture
- Grid layouts of equal-weight cards
- Data tables as primary furniture

---

### 10. Camera Positions

Departments define a standard camera set. Users may orbit; these are defaults.

| Camera | Position | FOV | Purpose |
|--------|----------|-----|---------|
| `arrival` | Entry portal, looking in | 60° | First impression |
| `hero` | Center, looking at back wall | 45° | Identity moment |
| `primary` | Slightly above primary zone | 50° | Default work view |
| `orb` | Angled toward Orb Pedestal | 40° | Conversation mode |
| `ceremony` | Elevated, wide | 55° | Approval / launch |
| `departure` | Facing exit portal | 60° | Exit transition |

**Camera rules:**
- Smooth interpolation between positions (never hard cuts except ceremony)
- `prefers-reduced-motion` → instant position set, no travel
- Primary camera is default resting position after arrival sequence completes

---

### 11. Navigation Flow

Spatial navigation is **movement through the environment**, not tab switching.

```
ENTRY → ORIENT (hero visible) → PRIMARY WORK ⇄ SECONDARY ZONES
                                      ↕
                                   ORB CONVERSATION
                                      ↕
                              CEREMONY (on trigger)
                                      ↓
                                    EXIT
```

**Flow rules:**
- User can reach any zone within 2 interactions from any other zone
- No dead ends — exit always visible or one turn away
- Breadcrumb equivalent: spatial awareness (user knows where they are)
- Command Dock supplements spatial navigation — never replaces it

---

### 12. Exit Locations

| Property | Specification |
|----------|---------------|
| Position | `Z = -0.9`, offset from entry (`X = 0.4–0.6` or `-0.4 to -0.6`) |
| Purpose | Departure to other departments or Headquarters |
| Objects | Exit Portal, connection indicators to linked departments |
| Animation | Departure transition per Motion Standard |

**Rules:**
- Exit and Entry are distinct portals (not the same door)
- Exit portal shows available destinations (World Routing connections)
- Completing work triggers subtle exit portal illumination (work is ready to leave)

---

## Layout Templates

SDK provides three layout templates. Departments select one at authoring time.

### Template A: Stage (Default)

Hero-dominant. Primary zone center stage. Best for: Marketing, Creative, Production.

```
[Entry]                    [Hero / Mood Wall]
         [Secondary]  [PRIMARY]  [Secondary]
                    [Orb]
                              [Exit]
```

### Template B: Workshop

Primary zone dominant. Hero as backdrop. Best for: Operations, Fulfillment, Quality.

```
[Entry]     [Hero — compact]
              [PRIMARY — wide]
    [Secondary]    [Orb]    [Secondary]
                              [Exit]
```

### Template C: Gallery

Secondary zones dominant. Hero as exhibition wall. Best for: Asset Director, Portfolio, Archive.

```
[Entry]     [Hero / Mood Wall — full exhibition]
  [Secondary]              [Secondary]
         [Primary — review desk]
                    [Orb]
                              [Exit]
```

---

## Spatial Validation Rules

Before department approval:

| Check | Requirement |
|-------|-------------|
| Entry exists | ✓ at `Z = -0.9` |
| Hero exists | ✓ at `Z ≥ 0.85` |
| Primary zone exists | ✓ one only |
| Orb pedestal exists | ✓ elevated, visible |
| Exit exists | ✓ distinct from entry |
| Lighting anchors | ✓ minimum 3 |
| Camera set | ✓ all 6 positions defined |
| No overlapping objects | ✓ spacing ≥ 0.15 |
| Genome hooks on all surfaces | ✓ no hardcoded materials |

---

## Genome Adaptation

Spatial layout structure is **fixed**. Spatial **expression** is Genome-driven:

| Element | Genome Domain |
|---------|---------------|
| Room proportions | `spatialDesign` |
| Material surfaces | `materialLanguage` |
| Light character | `lightingStyle` |
| Hero imagery | `visualReferences`, `photographyDirection` |
| Furniture presence | `worldBuilding` |
| Atmospheric depth | `brandEmotions` |

The same layout template produces a marble law library, a neon creative loft, or a clinical medical suite — without changing topology.

---

_Next: [03 — Object Library](./03_OBJECT_LIBRARY.md)_
