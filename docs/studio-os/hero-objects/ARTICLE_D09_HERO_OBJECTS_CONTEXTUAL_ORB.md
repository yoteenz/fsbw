# ARTICLE-D09 — Hero Objects™ & Contextual Orb™

**Status:** Accepted  
**System:** Hero Objects™ · Contextual Orb™  
**Governance layer:** Layer 1 — Design Principles™  
**Principle:** Hero Objects Over Icons™  
**Graph role:** `hero-object` nodes · `W-HO-*`  
**Approved:** 2026-07-08  

---

## One sentence

**Studio World does not navigate with icons; it navigates with collectible living artifacts.**

---

## Purpose

Studio World should abandon software iconography as the default visual language for navigation.

The founder should not feel like they are opening apps from a launcher.  
They should feel like they are selecting crafted artifacts from an intelligent toolbelt.

Hero Objects™ exist so every major destination can be remembered by:

- physical form,
- silhouette,
- material,
- behavior,
- history,
- edition,
- emotional identity,
- World Graph presence.

This makes navigation part of Studio World’s civilization, not a layer of UI pasted over it.

---

## Definition

A **Hero Object™** is:

- a collectible artifact,
- a navigation primitive,
- a storytelling device,
- a brand symbol,
- a reusable 3D asset,
- a World Graph node,
- a Studio Foundry™ product line.

A Hero Object™ is **not**:

- an icon,
- an app tile,
- a generic pictogram,
- a static launcher button,
- a decorative prop with no function.

---

## Architectural shift

| Old software thinking | Studio World thinking |
|-----------------------|-----------------------|
| Icon | Hero Object™ |
| Launcher | Contextual Orb™ toolbelt |
| Sidebar item | Collectible artifact |
| Button | Physical interaction |
| App grid | Location-aware object set |
| Brand mark | Material symbol |
| Static image | Living object |
| Feature list | World citizens |

This is not a naming change.

It changes how Studio World designs navigation, produces assets, records history, and teaches future AI systems what a destination is.

---

## Relationship to Signature Landmarks™

Studio World already has **Signature Landmarks™**: large architectural anchors that define departments and places.

Hero Objects™ are different.

| Concept | Scale | Role |
|---------|-------|------|
| **Signature Landmark™** | Room / department scale | The remembered architectural centerpiece of a place |
| **Hero Object™** | Handheld / pedestal / toolbelt scale | The collectible navigation artifact for a destination |

Example:

- **Story Table™** can be the Signature Landmark™ of Creative Direction Studio™.
- **Story Table Relic™** can be the Hero Object™ surfaced by the Orb™ when the founder is inside Creative Direction Studio™.

Landmarks are places.  
Hero Objects are artifacts that take the founder to places.

---

## Core principles

### 1. Every major destination owns one Hero Object™

Major Studio World destinations should eventually define:

- `heroObjectId`,
- destination owner,
- silhouette family,
- material,
- motion profile,
- Asset Registry ID,
- World Graph node,
- Foundry product line,
- edition model.

No major destination should rely on a generic icon as its permanent identity.

### 2. Hero Objects are manufactured

Hero Objects are products of **Studio Foundry™**.

The Foundry is responsible for:

- base object design,
- material variants,
- edition variants,
- 3D production packages,
- motion profiles,
- asset export standards,
- marketplace packaging,
- future collectible drops.

### 3. Hero Objects are registered

Every Hero Object must be registered in **Asset Registry™** with:

- asset ID,
- version,
- material,
- creator,
- destination owner,
- usage history,
- edition availability,
- current status,
- related systems.

### 4. Hero Objects are graph citizens

Every Hero Object becomes a **World Graph™** node:

```text
nodeType: hero-object
id: W-HO-*
```

Hero Objects can connect to:

- destination room,
- destination flagship,
- Asset Registry™,
- Studio Foundry™,
- Orb™,
- Atlas™,
- Marketplace™,
- Museum™,
- Knowledge Core™,
- Achievements™,
- Expeditions™.

### 5. Hero Objects are collectible

Hero Objects should support long-term editions:

- Founder Editions,
- Golden Editions,
- Anniversary Editions,
- Community Event Editions,
- Achievement Unlock Editions,
- Limited-Time Civilization Editions.

Collectibility is not cosmetic. It gives Studio World memory, scarcity, identity, and cultural history.

---

## Silhouette Law™

Every Hero Object must have a unique silhouette.

A founder should recognize the object without reading a label.

Rules:

1. No two Hero Objects may share the same overall form.
2. A silhouette must remain recognizable at small scale.
3. A silhouette must remain recognizable in shadow.
4. Material changes may not destroy the silhouette.
5. Editions may decorate the object, but may not change the primary silhouette.
6. If two objects can be confused in a five-second glance, one must be redesigned.

Examples:

| Destination | Hero Object™ | Silhouette |
|-------------|--------------|------------|
| World Atlas™ | World Atlas Globe™ | Orbital globe with halo ring |
| Production Board™ | Production Board Slate™ | Hinged production slate / drafting board |
| Story Table™ | Story Table Relic™ | Wide altar-table with floating corner lights |
| Asset Registry™ | Asset Registry Vault™ | Circular vault door with asymmetric locks |
| Generation Bay™ | Generation Bay Engine™ | Open turbine-bay with visible rotor |

---

## Living Object Law™

Hero Objects are never static.

Every object must define:

- ambient motion,
- internal energy,
- material behavior,
- light refraction,
- environmental reflections,
- personality.

The motion should be subtle and premium.  
It should make the object feel alive, not distracting.

Object behavior examples:

| Object | Living behavior |
|--------|-----------------|
| World Atlas Globe™ | Continents pulse when work is active; halo ring slowly precesses |
| Daily Brief Lens™ | Briefing motes orbit the lens and condense when selected |
| Mood Wall Prism™ | Internal color fragments drift toward the current creative direction |
| Generation Bay Engine™ | Rotor turns slowly; molten energy brightens when renders are queued |
| Performance Wall Monolith™ | A liquid metric river flows through the split stone |

---

## Contextual Orb™

The Orb™ should become adaptive.

Instead of always showing the same static navigation objects, it should surface the five most relevant Hero Objects for the founder’s current location.

The founder experiences this as an intelligent toolbelt:

```text
Current location
    ↓
Contextual relevance model
    ↓
Five most useful Hero Objects
    ↓
Living object toolbelt
    ↓
Travel / action / review / production
```

### Context examples

#### Command Center™

- World Atlas Globe™ → World Atlas™
- Mission Control Console™ → Mission Control™
- Daily Brief Lens™ → Daily Brief™
- Knowledge Core Crystal™ → Knowledge Core™
- Production Board Slate™ → Production Board™

#### Creative Direction Studio™

- Story Table Relic™ → Story Table™
- Mood Wall Prism™ → Mood Wall™
- Studio Foundry Crucible™ → Studio Foundry™
- Asset Registry Vault™ → Asset Registry™
- Golden Review Marquee™ → Golden Review™

#### Warehouse Wing™

- Generation Bay Engine™ → Generation Bay™
- Materials Library Tower™ → Materials Library™
- Blueprint Archive Scroll™ → Blueprint Archive™
- Marketplace Pavilion Arch™ → Marketplace Pavilion™
- Hero Object Vault™ → Hero Object Vault™

#### Marketing HQ™

- Campaign Studio Beacon™ → Campaign Studio™
- Launch Theater Marquee™ → Launch Theater™
- Social Media Lab Signal™ → Social Media Lab™
- Brand Partnerships Handshake™ → Brand Partnerships™
- Performance Wall Monolith™ → Performance Wall™

---

## Contextual Orb selection rules

The Orb™ may rank Hero Objects by:

1. Current location.
2. Active task or project.
3. Pending approvals.
4. Recently used destination.
5. Live production state.
6. Founder habit.
7. Unlock status.
8. Achievement state.
9. Knowledge relevance.
10. Current world event.

But the Orb™ must never become a generic app launcher.

If a destination is not relevant, its object should not be shown merely because it exists.

---

## Production data model

Every Hero Object stores:

- ID,
- display name,
- destination,
- route / world path,
- version,
- material,
- creator,
- date introduced,
- Asset Registry ID,
- World Graph slug,
- Foundry product line,
- silhouette law,
- motion profile,
- surfaces,
- editions,
- usage history,
- evolution timeline,
- contextual Orb placements,
- tags.

Code architecture:

```text
src/studio-os-core/hero-objects/
├── constants.ts
├── types.ts
├── catalog.ts
├── contextual-orb.ts
└── index.ts
```

Graph ingestion:

```text
src/studio-os-core/world-graph/ingestion/hero-objects-ingest.ts
```

---

## Required integrations

### Orb™

Orb™ surfaces Hero Objects as the primary contextual action layer.

Future Orb UI should render objects as:

- pedestal objects,
- floating toolbelt objects,
- miniatures with living motion,
- selectable physical artifacts,
- never flat icons.

### Atlas™

Atlas™ projects Hero Objects near destinations as identity markers and collectible map pins.

Atlas labels may appear, but silhouette recognition should lead.

### Studio Foundry™

Studio Foundry™ manufactures:

- base object models,
- edition variants,
- materials,
- animation loops,
- export packages,
- Marketplace-ready product lines.

### Asset Registry™

Asset Registry™ stores and versions every Hero Object.

Hero Objects are managed assets with usage history, not scattered model files.

### Marketplace™

Marketplace™ may distribute:

- edition variants,
- community drops,
- civilization event editions,
- premium material packs,
- destination object collections.

### Museum™

Museum™ preserves:

- retired versions,
- first editions,
- founder editions,
- anniversary drops,
- object evolution timelines.

### Knowledge Core™

Knowledge Core™ stores:

- why the object exists,
- what destination it represents,
- when it was introduced,
- what editions exist,
- how it evolved,
- how founders used it.

---

## Migration rule

The phrase **icon** is now legacy language for Studio World navigation.

Allowed replacements:

- Hero Object™,
- navigation artifact,
- object primitive,
- collectible artifact,
- toolbelt object,
- destination artifact.

Do not rename historical docs blindly.  
Instead, mark old icon language as superseded where relevant and use Hero Object™ for new architecture.

---

## Success criteria

Studio World succeeds when:

- founders remember objects before labels,
- navigation feels like touching artifacts,
- every major destination has a unique silhouette,
- the Orb™ feels contextually intelligent,
- Hero Objects appear in Atlas™, Foundry™, Registry™, Marketplace™, Museum™, Knowledge Core™, Production Board™, Achievements™, and Expeditions™,
- software iconography no longer defines Studio World’s interaction language.

---

## Final law

**If it looks like an app icon, it is not a Hero Object™.**

**If it cannot be collected, remembered, manufactured, versioned, and recognized in silhouette, it is not ready for Studio World.**
