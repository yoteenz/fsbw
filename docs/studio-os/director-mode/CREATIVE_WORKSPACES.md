# Creative Workspaces (Director Studios)

Every creative domain receives a **Director Studio** — a specialized workspace sharing the same directing philosophy. Only workers differ.

## Architecture

```
Studio World Headquarters
└── Creative District
    ├── Creative Director Studio    ← umbrella directing
    ├── Brand Studio
    ├── Campaign Studio
    ├── Logo Studio
    ├── Packaging Studio
    ├── Website Studio
    ├── Environment Studio          ← Blueprint Author, Construction Mode
    ├── Scene Studio
    ├── Motion Studio
    ├── Product Studio
    ├── Photography Studio
    ├── Social Studio
    ├── Merchandise Studio
    ├── Video Studio
    ├── Advertising Studio
    ├── Presentation Studio
    └── Publishing Studio
```

## Shared philosophy (all studios)

| Capability | Shared across studios |
|------------|----------------------|
| Directable objects | Yes |
| Object selection model | Yes |
| Blueprint / plan preview | Yes |
| Approval before manufacturing | Yes |
| Bounded worker jobs | Yes |
| Object Inspector | Yes |
| Quality Guard | Yes |
| Immune System | Yes |
| Material library inheritance | Yes |
| Director history | Yes |

## Studio-specific workers

| Studio | Primary workers |
|--------|-----------------|
| Environment Studio | Architect, Hero Asset, Furniture, Lighting |
| Brand Studio | Logo, Typography, Color System |
| Campaign Studio | Model, Photography, Copy, Layout |
| Motion Studio | Animation, Camera, Transition |
| Packaging Studio | Structure, Foil, Label, Material |

## Spatial placement

Director Studios live in the **Creative District** of Studio World Headquarters. See [SPATIAL_ARCHITECTURE_REVIEW.md](./SPATIAL_ARCHITECTURE_REVIEW.md).

Environment Studio is the **only studio with shipped runtime foundation** (Blueprint Author, Construction Mode, Manufacturing Engine). Other studios are **Planned**.

## Non-goals

No studio UI is built in this sprint. Architecture and contracts documented only.
