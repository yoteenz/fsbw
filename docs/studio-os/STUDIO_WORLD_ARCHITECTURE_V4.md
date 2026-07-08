# Studio World™ Architecture V4

**Status:** Canonical architectural law — July 2026  
**Scope:** Structure and routing only. No visual redesign in this sprint.

---

## Core Law

Nothing inside Studio World™ is a webpage.

Every destination is a **physical place** in one connected campus:

`Headquarters` · `Building` · `District` · `Wing` · `Floor` · `Room` · `Studio` · `Workshop` · `Observatory` · `Laboratory` · `Gallery` · `Museum` · `Library` · `Vault` · `Theater` · `Pavilion` · `Atrium` · `Garden` · `Command Center`

The founder **walks** — they do not click menus.

---

## One Campus · Seven Flagships

> **Responsibility Framework™:** Each flagship has one mission, no overlap. See [studio-world-responsibility-framework.md](./studio-world-responsibility-framework.md).

| Flagship | Purpose | Canonical entry | Legacy implementation (preserved) |
|----------|---------|-----------------|-----------------------------------|
| **Command Center™** | Operate · Observe · Coordinate | `/admin/studio/world/command-center` | `/admin/studio/overview` |
| **Creative Direction Studio™** | Imagine · Invent · Explore · Direct | `/admin/studio/world/creative-direction-studio` | `/admin/studio/department/creative-direction` |
| **Studio Warehouse™** | Manufacture · Assemble · Reuse · Produce | `/admin/studio/world/warehouse` | `/admin/studio/studio-warehouse` |
| **Studio Archives™** | Remember · Preserve · Teach · Celebrate | `/admin/studio/world/archives` | `/admin/studio/studio-archives` |
| **Marketplace™** | Share · Exchange · License · Monetize | `/admin/studio/world/marketplace` | `/admin/studio/marketplace` |
| **Headquarters™** | Execute · Operate · Grow | `/admin/studio/world/headquarters` | `/admin/headquarters` |
| **Expedition Hub™** | Transform · Guide · Coach | `/admin/studio/world/expedition-hub` | `/admin/studio/expansion-center` |

---

## World URL scheme

```
/admin/studio/world/{flagship}/{district|wing}/{room}
```

Examples:

- `/admin/studio/world/command-center/executive-district/mission-control`
- `/admin/studio/world/creative-direction-studio`
- `/admin/studio/world/archives/museum-wing`
- `/admin/studio/world/headquarters/distribution`
- `/admin/studio/world/expedition-hub/business-discovery`

**Resolver:** `src/pages/admin/studio/world/page.tsx` redirects canonical world paths → legacy implementations until each room is rebuilt immersive.

---

## Department Law

Every department follows identical architecture:

```
Arrival → Atrium → Overview → Workspace selection → Room → Sub-workspaces → Return
```

Never page navigation.

---

## Room Law

Every room is assembled — never hardcoded:

```
Scene Stack™ → Environment → Architecture → Lighting → Furniture → Hero Objects
→ Interactive Systems → Particles → Runtime → Finished Workspace
```

---

## Feature Law

Software features become architecture. See `src/studio-os-core/studio-world/feature-lexicon.ts`.

| Former | Architectural |
|--------|---------------|
| Pipeline | Production Wall™ |
| Analytics | Performance Observatory™ |
| Settings | Control Room™ |
| Asset Library | Warehouse Wing™ |
| Marketplace | Marketplace Pavilion™ |
| Blueprint Manager | Blueprint Archive™ |

---

## Code locations

| Artifact | Path |
|----------|------|
| Physical types & laws | `src/studio-os-core/studio-world/types.ts` |
| Five flagships + districts | `src/studio-os-core/studio-world/flagship-destinations.ts` |
| Feature lexicon | `src/studio-os-core/studio-world/feature-lexicon.ts` |
| Route inventory (mapped) | `src/studio-os-core/studio-world/route-registry.ts` |
| Navigation graph | `src/studio-os-core/studio-world/navigation.ts` |
| Route helpers | `src/utils/studioWorldRoutes.ts` |
| World path resolver | `src/pages/admin/studio/world/page.tsx` |

---

## Migration status

| Status | Meaning |
|--------|---------|
| `immersive-live` | Full Golden Build / Scene Stack room (CDS, Archives) |
| `immersive-partial` | Immersive entry + standard briefing rooms |
| `standard-room` | `AdminStudioLayout` — room mapped, not yet walked |
| `placeholder` | Catch-all `studio/:sectionId` |
| `redirect-only` | Alias route |

**Rule:** Legacy URLs remain valid. World paths are canonical for new links and navigation.

---

## Studio Command Center™ districts

- Executive District™ — mission control, executive command, council, AI director
- Operations Wing™ — orchestration, campaign ops, systems dock
- Finance Command™ — (rooms TBD)
- Performance Observatory™ — analytics, health, pulse, engineering excellence
- Security Center™ — governance, QA command

## Headquarters™ examples

**Marketing Headquarters™**

```
Campaign Studio™ → Launch Theater™ → Social Media Lab™ → Analytics Observatory™
→ Influencer Lounge™ → Content Factory™ → Email Studio™ → Brand Partnerships™
```

Mapped today to standard rooms; immersive rebuild follows Scene Stack™ per room.

## Studio Archives™ wings

Grand Entrance™ → Orientation Atrium™ → Warehouse Wing™ → Museum Wing™ → Hall of Innovation™ → Company Genome Vault™ → Blueprint Archive™ → Marketplace Pavilion™ → Future Expansion Wings™

(Live immersive — see Studio Archives™ commit.)

---

## Route inventory

~213 routes in `App.tsx`. **~80+ mapped** in `STUDIO_WORLD_ROUTE_REGISTRY` (flagship routes first). Unmapped routes resolve via:

1. Longest-prefix world path match
2. Flagship entry fallback
3. Campus Map Atrium (`/admin/studio/overview`)

Extend `route-registry.ts` as each room gains a world address — do not add new page-only routes without a physical location entry.

---

## Founder experience target

✓ "I'm heading to Marketing Headquarters."  
✓ "I'm walking into the Innovation Hall."  
✓ "I'm entering the Genome Vault."  
✗ "I'm opening another page."

---

## Related docs

- `docs/studio-os/architecture.md` — platform hierarchy
- `docs/studio-os/executive-information-architecture.md` — department card IA
- `motherboard/MEMORY.md` — sprint history
