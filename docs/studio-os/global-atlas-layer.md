# Global Atlas Layer™

**Status:** Canonical OS navigation — July 2026  
**Philosophy:** The map comes to you. One Atlas, everywhere.

---

## Mission

Studio World Atlas™ is no longer only a destination. It is part of the operating system — one interaction away in every room, department, headquarters, workspace, expedition, museum, warehouse, laboratory, and observatory.

---

## One Atlas · Many Anchors™

There is only **one** living Atlas. It projects from native architectural objects:

| Workspace | Atlas Anchor™ |
|-----------|---------------|
| Creative Direction Studio™ | Story Table™ |
| Studio Warehouse™ | Warehouse floor |
| Studio Archives™ / Museum™ | Holographic exhibit |
| Marketplace™ | Central pavilion |
| Marketing Headquarters™ | Strategy wall |
| Finance Headquarters™ | Capital Table™ |
| Command Center™ | Mission Control™ / Holographic table |
| Constitution Hall™ | Constitutional monument |

Engine: `src/studio-os-core/global-atlas-layer/anchors.ts`

---

## Universal access

- **Keyboard:** `Ctrl/Cmd + Shift + A` toggles Global Atlas Layer™
- **Studio Orb™ radial:** World Atlas (🌐)
- **Immersive rooms:** `DepartmentGoldenBuildShell` mounts Orb + Global Atlas
- **Admin layouts:** `GlobalAtlasProvider` wraps all Studio admin surfaces

The current room stays visible (live world). The Atlas projects as a holographic overlay — never an abrupt teleport.

---

## Current location

On open, the layer resolves pathname → atlas node and highlights **YOU ARE HERE**:

```
Studio World™ → Company Campus™ → Flagship → Wing → Room
```

Resolver: `resolveGlobalAtlasLocation()` in `location-resolver.ts`

---

## Fast travel

Walk · Elevator · Fast Travel · Guided Tour — same modes as full Atlas. Cinematic transition overlay before navigation.

---

## Intelligent shortcuts

- Continue where I left off
- Recent destinations
- Frequently visited
- Context-priority recommendations (CDS vs HQ vs Archives)

Storage: `studioOsGlobalAtlasLayer_v1`

---

## Location-adaptive context

Atlas opens with map modes and destination priorities based on flagship context — `resolveAtlasContextForPath()`.

---

## Orb Atlas Guide™

Parse navigation intents from natural language:

```typescript
import { parseOrbAtlasNavigationIntent } from 'src/studio-os-core/global-atlas-layer';

parseOrbAtlasNavigationIntent('Take me to Story Table');
parseOrbAtlasNavigationIntent('Open Blueprint Archive');
```

Examples: Story Table, Marketing Headquarters, Blueprint Archive, last workspace.

---

## Related

- [studio-world-responsibility-framework.md](./studio-world-responsibility-framework.md)
- Full Observatory table: `/admin/studio/world-atlas` (canonical holographic room — Global Layer is primary OS fabric)

---

## Final philosophy

People don't stop what they're doing to find a map. **The map comes to them.**
