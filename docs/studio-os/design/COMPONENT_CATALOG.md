# Studio OS Component Catalog™

**Version:** 1.0.0  
**Registry:** [DESIGN_REGISTRY.md](./DESIGN_REGISTRY.md)  
**Parent:** [Studio Design Constitution™](./STUDIO_DESIGN_CONSTITUTION.md)

---

> Every reusable UI element in Studio OS is cataloged here. Products **use** canonical IDs — they do not fork components.

---

## Catalog Conventions

| Field | Meaning |
|-------|---------|
| **Canonical ID** | `comp-{name}` — permanent identifier |
| **Version** | Semver · tracked in Design Registry |
| **Status** | `ratified` · `experimental` · `deprecated` |
| **Milestone** | Master Spec module when applicable |

---

## Presence & Intelligence

### `comp-studio-orb`

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | ratified |
| **Milestone** | M89.1 |
| **Purpose** | Ambient intelligence presence — primary OS interaction anchor |
| **Usage** | Bottom-weighted · all headquarters surfaces · one per viewport |
| **Interaction** | Tap → radial menu · presence states (idle/thinking/opportunity) · never blocks content |
| **Accessibility** | `aria-label` · keyboard alternative via command palette · 44px min touch |
| **Extensibility** | Radial action slots · voice · future XR spatial anchor |
| **Related** | `comp-command-dock`, `comp-floating-dock`, `comp-ai-chat` |

---

### `comp-command-dock`

| Field | Value |
|-------|-------|
| **Version** | 2.0.0 |
| **Status** | ratified |
| **Milestone** | M82 |
| **Purpose** | Conversational command console — evolves toward Orb-centric flow |
| **Usage** | Opens from Orb · centered acrylic panel · conversation mode backdrop |
| **Interaction** | Submit · approve route · history · favorites · dismiss |
| **Accessibility** | Focus trap in panel · escape closes · screen reader announces routing |
| **Extensibility** | Context profiles per route · builder-scoped commands |
| **Related** | `comp-studio-orb`, `comp-conversation-timeline`, `comp-ai-chat` |

---

### `comp-ai-chat`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Creative Director / intelligence dialogue surface |
| **Usage** | Director dock · builder · inline assist chips |
| **Interaction** | Thread · accept/reject proposals · "why?" explanations |
| **Accessibility** | Message roles announced · contrast on glass |
| **Extensibility** | Voice transcript merge · tool call cards |
| **Related** | `comp-command-dock`, `comp-conversation-timeline` |

---

### `comp-conversation-timeline`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Turn history for Conversation Engine™ sessions |
| **Usage** | Director panel · session review · audit |
| **Interaction** | Scroll · expand turn · copy |
| **Accessibility** | Chronological nav · semantic list |
| **Extensibility** | Export · governance audit link |
| **Related** | `comp-ai-chat`, `comp-command-dock` |

---

## Spatial Shell

### `comp-floating-dock`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Ephemeral glass dock container — attaches to canvas edge |
| **Usage** | Inspector · library · director · max 2 desktop |
| **Interaction** | Slide-in · drag reposition (optional) · click-outside close |
| **Accessibility** | Focus management · escape dismiss |
| **Extensibility** | Dock zones: left/right/bottom |
| **Related** | `comp-inspector-panel`, `comp-floating-panel` |

---

### `comp-floating-panel`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Modal glass panel — centered or sheet |
| **Usage** | Remix · settings · confirmations |
| **Interaction** | Backdrop blur · scale-in · close button |
| **Accessibility** | `role="dialog"` · focus trap |
| **Extensibility** | Size variants: sm/md/lg/full |
| **Related** | `comp-modal`, `comp-drawer` |

---

### `comp-workspace-panel`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Primary product workspace container on marble environment |
| **Usage** | All admin studio routes · rounded glass shell |
| **Interaction** | Internal scroll · not full viewport replace |
| **Accessibility** | Landmark region · skip link target |
| **Extensibility** | Phase variants: entry/builder/dashboard |
| **Related** | `comp-canvas`, `comp-dashboard` |

---

### `comp-inspector-panel`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Contextual property editor — Figma-like precision |
| **Usage** | Builder · selection-driven · empty when no selection |
| **Interaction** | Field groups · live preview update |
| **Accessibility** | Labelled inputs · keyboard navigable |
| **Extensibility** | Plugin property sections |
| **Related** | `comp-floating-dock`, `comp-forms` |

---

### `comp-canvas`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Primary live preview / editing viewport |
| **Usage** | Website Builder · Experience Studio · 70–90% viewport |
| **Interaction** | Select · drag sections · inline text · device frames |
| **Accessibility** | Selection announced · keyboard nudge |
| **Extensibility** | Grid overlay · responsive breakpoints |
| **Related** | `comp-workspace-panel`, `comp-editor-inline` |

---

## Navigation & Command

### `comp-navigation`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Spatial navigation — wings · destinations · not flat admin trees |
| **Usage** | Headquarters · studio hub · breadcrumbs minimal |
| **Interaction** | Place-based labels · back returns to place |
| **Accessibility** | Current location · landmark nav |
| **Extensibility** | Wing icons · org-scoped |
| **Related** | `comp-tabs`, `comp-command-palette` |

---

### `comp-command-palette`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Linear-style keyboard command surface (⌘K) |
| **Usage** | Builder · headquarters · power users |
| **Interaction** | Fuzzy search · categories · recents |
| **Accessibility** | Full keyboard · aria combobox pattern |
| **Extensibility** | Product-scoped command registration |
| **Related** | `comp-search`, `comp-context-menu` |

---

### `comp-search`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Registry-aware discovery search |
| **Usage** | Knowledge · systems · commands |
| **Interaction** | Instant results · keyboard nav |
| **Accessibility** | Combobox · results list semantics |
| **Extensibility** | Scoped: global · product · org |
| **Related** | `comp-command-palette` |

---

### `comp-tabs`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Section switcher within panel — not primary OS navigation |
| **Usage** | Inspector groups · settings |
| **Interaction** | Horizontal · uppercase labels optional |
| **Accessibility** | `tablist` · `aria-selected` |
| **Extensibility** | Scrollable tab bar mobile |
| **Related** | `comp-navigation` |

---

### `comp-context-menu`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Right-click / long-press contextual actions |
| **Usage** | Canvas · tables · cards |
| **Interaction** | Glass menu · destructive separated |
| **Accessibility** | Keyboard context key · arrow nav |
| **Extensibility** | Registry-driven actions |
| **Related** | `comp-command-palette` |

---

### `comp-toolbar`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Thin ephemeral action bar — never persistent heavy chrome |
| **Usage** | Canvas top · device switcher row |
| **Interaction** | Icon buttons · tooltips |
| **Accessibility** | `aria-label` per action |
| **Extensibility** | Contextual tool sets |
| **Related** | `comp-buttons`, `comp-status-indicator` |

---

## Content & Data

### `comp-card`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Acrylic content container — editorial not boxed SaaS |
| **Usage** | Overview · entry selection · summaries |
| **Interaction** | Hover lift optional · click target clear |
| **Accessibility** | Heading hierarchy inside card |
| **Extensibility** | Variants: editorial · metric · action |
| **Related** | `comp-dashboard`, `comp-analytics-widget` |

---

### `comp-table`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Data table — calm density · not spreadsheet clone |
| **Usage** | Registry views · admin lists |
| **Interaction** | Sort · filter · row actions |
| **Accessibility** | Table semantics · caption |
| **Extensibility** | Virtual scroll · column resize |
| **Related** | `comp-forms`, `comp-search` |

---

### `comp-forms`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Input system — labels · validation · calm layout |
| **Usage** | Inspectors · settings · onboarding |
| **Interaction** | Inline validation · AI assist optional |
| **Accessibility** | Labels · errors linked · required marked |
| **Extensibility** | Field types registry |
| **Related** | `comp-inspector-panel` |

---

### `comp-editor-inline`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | In-canvas text editing |
| **Usage** | Builder · headline/body direct edit |
| **Interaction** | Double-click activate · blur commit |
| **Accessibility** | Escape cancel · boundary announced |
| **Extensibility** | Rich text tiers |
| **Related** | `comp-canvas`, `comp-ai-chat` |

---

## Feedback & State

### `comp-buttons`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Action buttons — crystal · glass · text |
| **Usage** | Primary CTA · secondary · destructive |
| **Interaction** | 140ms feedback · disabled clear |
| **Accessibility** | Focus ring · loading state announced |
| **Extensibility** | Icon · split · toggle |
| **Related** | `comp-toolbar` |

---

### `comp-status-indicator`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | State chips — live · planned · preview · health |
| **Usage** | Registry · milestones · channel badges |
| **Interaction** | Read-only · optional tooltip |
| **Accessibility** | Not color-only · text label |
| **Extensibility** | Release channel variants |
| **Related** | `comp-progress-system` |

---

### `comp-progress-system`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Progress bars · rings · multi-step |
| **Usage** | Onboarding · interview · upload |
| **Interaction** | Determinate preferred |
| **Accessibility** | `aria-valuenow` · label |
| **Extensibility** | Step wizard integration |
| **Related** | `comp-status-indicator` |

---

### `comp-notifications`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | experimental |
| **Purpose** | Toast · banner · inbox |
| **Usage** | System events · AI completion |
| **Interaction** | Auto-dismiss calm · action optional |
| **Accessibility** | `aria-live` polite |
| **Extensibility** | Orb radial slot future |
| **Related** | `comp-studio-orb` |

---

## Overlays

### `comp-modal`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Focused interrupt — publish gate · confirm |
| **Usage** | Sparse — not default pattern |
| **Interaction** | Backdrop · escape · primary action |
| **Accessibility** | Dialog · focus trap |
| **Extensibility** | Size variants |
| **Related** | `comp-floating-panel`, `comp-drawer` |

---

### `comp-drawer`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Edge sheet — mobile docks · structure overlay |
| **Usage** | Bottom sheet primary on mobile |
| **Interaction** | Swipe dismiss optional |
| **Accessibility** | Focus trap · escape |
| **Extensibility** | Left/right/bottom |
| **Related** | `comp-floating-dock` |

---

## Analytics & Overview

### `comp-dashboard`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Executive overview layout — cards · pulse · not dense BI |
| **Usage** | Mission Control · studio home |
| **Interaction** | Drill to place · not modal maze |
| **Accessibility** | Landmark · heading order |
| **Extensibility** | Wing-specific widgets |
| **Related** | `comp-card`, `comp-analytics-widget` |

---

### `comp-analytics-widget`

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | ratified |
| **Purpose** | Single metric / chart cell |
| **Usage** | Dashboard grids · health HUD |
| **Interaction** | Expand optional |
| **Accessibility** | Text alternative for charts |
| **Extensibility** | Widget registry |
| **Related** | `comp-dashboard`, `comp-card` |

---

## Catalog Index

| Canonical ID | Category | Status |
|--------------|----------|--------|
| `comp-studio-orb` | Presence | ratified |
| `comp-command-dock` | Presence | ratified |
| `comp-ai-chat` | Presence | ratified |
| `comp-conversation-timeline` | Presence | ratified |
| `comp-floating-dock` | Shell | ratified |
| `comp-floating-panel` | Shell | ratified |
| `comp-workspace-panel` | Shell | ratified |
| `comp-inspector-panel` | Shell | ratified |
| `comp-canvas` | Shell | ratified |
| `comp-navigation` | Nav | ratified |
| `comp-command-palette` | Nav | ratified |
| `comp-search` | Nav | ratified |
| `comp-tabs` | Nav | ratified |
| `comp-context-menu` | Nav | ratified |
| `comp-toolbar` | Nav | ratified |
| `comp-card` | Content | ratified |
| `comp-table` | Content | ratified |
| `comp-forms` | Content | ratified |
| `comp-editor-inline` | Content | ratified |
| `comp-buttons` | Feedback | ratified |
| `comp-status-indicator` | Feedback | ratified |
| `comp-progress-system` | Feedback | ratified |
| `comp-notifications` | Feedback | experimental |
| `comp-modal` | Overlay | ratified |
| `comp-drawer` | Overlay | ratified |
| `comp-dashboard` | Analytics | ratified |
| `comp-analytics-widget` | Analytics | ratified |

---

## Adding Components

1. Propose in VDR — see [DESIGN_REVISION_FRAMEWORK.md](./DESIGN_REVISION_FRAMEWORK.md)
2. Register in [DESIGN_REGISTRY.md](./DESIGN_REGISTRY.md)
3. Validate via [DESIGN_HEALTH.md](./DESIGN_HEALTH.md)
4. Link from product **Component Usage Map** — never redefine

---

*Component Catalog™ — one library · infinite products.*
