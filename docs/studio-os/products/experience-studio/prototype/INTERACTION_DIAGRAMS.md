# Interaction Diagrams — Experience Studio™

**Version:** 1.0.0  
**Parent:** [Prototype Package](./README.md)

---

## Interaction Hierarchy

```
Priority 1 — Studio Orb™ (always)
Priority 2 — Canvas direct manipulation
Priority 3 — Floating dock panels (on demand)
Priority 4 — Command palette (power users)
Priority 5 — Context menu (precision)
```

---

## Studio Orb™ Interaction Map

```mermaid
flowchart TD
    O[Studio Orb™ idle] -->|Tap| R[Radial menu]
    O -->|Long press| V[Voice Mode™]
    O -->|Double tap| P[Command palette]
    R --> D[Ask Director]
    R --> X[Remix suggestion]
    R --> H[Design Health]
    R --> K[Commands]
    R --> Q[Return HQ]
    D --> FD[Floating dock · Director tab]
    X --> RM[Remix panel · pre-selected chip]
    H --> DH[Design Health widget expand]
```

### Orb Positioning Rules

| Viewport | Position | Safe area |
|----------|----------|-----------|
| Desktop | Bottom center · 24px margin | Never over primary CTA |
| Tablet | Bottom center · 20px | Above home indicator |
| Mobile | Bottom center · 16px + safe-area | 44px touch target |

### Orb + Canvas Coordination

- Orb dims 20% when canvas text editing active (focus on content)
- Orb pulses when Director has unprompted suggestion (max 1 per 5 min)
- Orb never opens modal over active inline editor

---

## Canvas Interaction Map

```mermaid
flowchart TD
    C[Canvas default] -->|Click section| S[Section selected]
    C -->|Double-click text| E[Inline editor]
    C -->|Drag section| R[Reorder · snap guides]
    C -->|Right-click| M[Context menu]
    C -->|Scroll| SC[Navigate long experience]
    S -->|Click outside| C
    S -->|Inspector icon| I[Inspector dock]
    E -->|Blur / Enter| S
    R -->|Drop| S
    M --> M1[Duplicate]
    M --> M2[Ask Director about this]
    M --> M3[Delete · confirm]
    M --> M4[Move up/down]
```

### Canvas Gestures

| Gesture | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Select | Click | Tap | Tap |
| Edit text | Double-click | Double-tap | Tap "Edit" chip |
| Reorder | Drag handle | Long-press drag | Reorder via menu |
| Pan | Scroll | Scroll · two-finger | Scroll |
| Zoom preview | ⌘+ / ⌘- | Pinch (preview mode only) | Pinch |

---

## Floating Dock Interaction

```mermaid
stateDiagram-v2
    [*] --> Hidden
    Hidden --> Director: Orb · ⌘D
    Hidden --> DNA: DNA chip on canvas
    Hidden --> Remix: Remix chip
    Hidden --> Inspector: Section select
    Director --> Hidden: Esc · click-outside
    DNA --> Hidden: Esc · click-outside
    Remix --> Hidden: Esc · click-outside
    Inspector --> Hidden: Esc · click-outside
    Director --> Remix: User switch tab
    note right of Hidden: Max 1 dock desktop\nStack sheet mobile
```

### Dock Behavior Rules

| Rule | Detail |
|------|--------|
| Max width | 380px desktop · 100% - 32px mobile sheet |
| Collision | Dock never covers selected section — auto-reposition left if needed |
| Persistence | Last tab remembered per session |
| Animation | Slide + fade · 280ms ease-out |
| Focus trap | Yes when open · Esc dismisses |

---

## Design DNA™ Interaction

```mermaid
flowchart LR
    A[Open DNA panel] --> B[Adjust Luxury 70→80]
    B --> C[Release slider]
    C --> D[Canvas updates 400ms morph]
    D --> E[Director explains change]
    E --> F{Accept feel?}
    F -->|Yes| G[Keep]
    F -->|No| H[Undo · ⌘Z]
```

**Blend constraint:** Sum must equal 100 — auto-adjust others proportionally unless user pins a personality.

---

## Remix™ Interaction

```mermaid
sequenceDiagram
    participant U as User
    participant R as Remix chip
    participant C as Canvas
    participant D as Director

    U->>R: Tap "More Editorial"
    R->>C: Preview overlay · 400ms
    C-->>U: Side-by-side ghost or full preview
    R->>D: Generate explanation
    D-->>U: "I've tightened type rhythm and..."
    U->>R: Accept
    R->>C: Commit · preview → live
    Note over U,C: Undo available 30s highlight
```

---

## Command Palette Interaction

| Command | Action |
|---------|--------|
| `publish` | → Publish pipeline |
| `remix` | → Remix panel |
| `dna` | → Design DNA panel |
| `versions` | → Version history |
| `director` | → Director dock |
| `health` | → Design Health expand |
| `hq` | → Return Headquarters |

**Component:** `comp-command-palette` · fuzzy search · recents at top.

---

## Publish Interaction Flow

```mermaid
flowchart TD
    P[Publish button] --> V{Design Health ≥ threshold?}
    V -->|Yes| PRE[Preview split view]
    V -->|No| BL[Blocker list · jump links]
    BL --> W[Workspace fix]
    W --> P
    PRE --> C{User confirms?}
    C -->|Yes| GO[Progress pipeline · 3 steps]
    C -->|No| W
    GO --> S[Success celebration]
    GO --> E[Error · retry]
```

---

## Keyboard Map (Desktop)

| Key | Action |
|-----|--------|
| ⌘K | Command palette |
| ⌘D | Director dock |
| ⌘I | Inspector |
| ⌘Z / ⌘⇧Z | Undo / redo |
| Esc | Dismiss dock / modal |
| Tab | Section navigation |
| Enter | Edit selected text |

---

## Touch Targets (Mobile)

| Element | Min size |
|---------|----------|
| Orb | 56px |
| Section tap | Full section width |
| Chips | 44px height |
| Dock tabs | 48px |
| Publish CTA | 48px · bottom safe area |

---

## Cross-References

| Document | Path |
|----------|------|
| Motion | [MOTION_SPECIFICATION.md](./MOTION_SPECIFICATION.md) |
| AI Flows | [AI_COLLABORATION_FLOWS.md](./AI_COLLABORATION_FLOWS.md) |
| Screen Walkthrough | [SCREEN_WALKTHROUGH.md](./SCREEN_WALKTHROUGH.md) |

---

*Interaction Diagrams — direct the creation · don't fight the software.*
