# SITE 00 Components

Module: `src/site00/components/`

## Shell

| Component | Path | Role |
|-----------|------|------|
| `Site00AppShell` | `shell/Site00AppShell.tsx` | Header grid: logo, nav, ENTER/EXIT |
| `Site00LogoBlock` | `shell/Site00LogoBlock.tsx` | SITE 00 + diamond + bracket location |
| `GlobalNav` | `shell/GlobalNav.tsx` | Top nav from `config/navigation.ts` |
| `EntryToggle` | `shell/EntryToggle.tsx` | ENTER 00 ↔ EXIT 00 |

## Environment

| Component | Path | Role |
|-----------|------|------|
| `EnvironmentShell` | `environment/EnvironmentShell.tsx` | Background layer + UI safe zone |

## Panels

| Component | Path | Role |
|-----------|------|------|
| `ArchitecturalPanel` | `panels/ArchitecturalPanel.tsx` | Glass / workflow panel variants |
| `SectionRule` | `panels/SectionRule.tsx` | Line + red diamond divider |

## Homepage (Origin only)

| Component | Path | Role |
|-----------|------|------|
| `OriginCards` | `homepage/OriginCards.tsx` | Collapsed IDNTY/BLDR cards |
| `IdntyExpandedPanel` | `homepage/IdntyExpandedPanel.tsx` | Reference 02 state |
| `BldrExpandedPanel` | `homepage/BldrExpandedPanel.tsx` | Reference 03 state |
| `StatusStrip` | `homepage/StatusStrip.tsx` | Bottom status + guidance (Origin only) |

## Workflow

| Component | Path | Role |
|-----------|------|------|
| `StateCard` | `workflow/WorkflowCards.tsx` | IDNTY brand state card |
| `BuildClassCard` | `workflow/WorkflowCards.tsx` | BLDR build class card |
| `InvestmentColumn` | `workflow/WorkflowCards.tsx` | Pricing tier column |
| `WorkflowSummary` | `workflow/WorkflowCards.tsx` | Page footer statement |
| `DirectoryRow` | `workflow/WorkflowCards.tsx` | ENTER 00 directory row |

## ENTER 00

| Component | Path | Role |
|-----------|------|------|
| `DirectoryPanel` | `enter00/DirectoryPanel.tsx` | Waiting room directory + welcome copy |
| `EnterStatusStrip` | `enter00/DirectoryPanel.tsx` | Bottom status line (Enter only) |

## Icons

| Component | Path | Role |
|-----------|------|------|
| `GeometricIcon` | `icons/GeometricIcon.tsx` | Red wireframe SVG placeholders |
| `ArrowAction` | `icons/ArrowAction.tsx` | CTA with arrow |

## Design tokens

`src/site00/styles/tokens.css` — colors, spacing, typography, motion, z-index

`src/site00/styles/site00.css` — component classes, environment fallbacks, responsive rules

## Pages

| Page | File |
|------|------|
| Origin | `pages/OriginPage.tsx` |
| Enter | `pages/EnterPage.tsx` |
| IDNTY → state | `pages/IdntyPage.tsx` |
| IDNTY Brand State | `pages/IdntyStatePage.tsx` |
| BLDR → state | `pages/BldrPage.tsx` |
| BLDR Build State | `pages/BldrStatePage.tsx` |
