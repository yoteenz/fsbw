# Environment vs Interface Layering

## Correct layering (Experience Lab V2)

```
React Department Shell (z-index 2+)
├── Command Dock, inspectors, viewport, workbench, approval, tool dock
└── All typography, buttons, navigation — native React

ExperienceLabEnvironmentLayer (z-index 0, pointer-events: none)
└── Decorative architectural environment only
```

## Environment must NOT contain

- Blueprint UI or holographic overlays
- Founder Render imagery
- Panels, cards, charts, buttons
- Command dock or workbench chrome
- Navigation or typography

## Readability system

- Adaptive scrim (`--elab-scrim`)
- Panel backplates with backdrop blur
- `elab-v2--bright` preset for high-luminance environments
- WCAG-aware focus rings on interactive controls
- Safe zones configurable in `experience-lab-v2.config.ts`

## Viewport safe region

Center viewport remains usable when environment asset changes. Blueprint and Founder Render render **inside** `StudioViewport` panes, not in the background layer.
