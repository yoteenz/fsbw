# Innovation Expeditions™

**Status:** Canonical guided knowledge network — July 2026  
**Philosophy:** People remember stories, places, and experiences — not tutorials.

---

## Mission

Innovation Constellations™ visualizes collective knowledge. Innovation Expeditions™ lets founders **journey through that knowledge with purpose** — museum tour + university course + documentary + RPG quest inside Studio World.

This is **not** a tutorial, documentation, or onboarding flow.

---

## Expedition types

| Type | Trademark | Examples |
|------|-----------|----------|
| Industry | Industry Expeditions™ | Luxury Beauty™, Healthcare™, Creator Economy™ |
| Innovation | Innovation Expeditions™ | Evolution of Customer Experience™, Birth of Automation™ |
| Founder | Founder Expeditions™ | Legendary founder headquarters and decisions |
| Company | Company Expeditions™ | Idea → startup → enterprise replay |
| Blueprint | Blueprint Expeditions™ | Invention through forks, merges, adoption |
| Community | Community Expeditions™ | Founder-authored journeys |

Engine: `src/studio-os-core/innovation-expeditions/expedition-catalog.ts`

---

## Guided tour experience

Every expedition is a living guided tour:

- Orb walks with the founder as **Expedition Guide** (Professor · Historian · Coach)
- Stops at exhibits, headquarters, monuments, Blueprint galleries, Marketplace showcases
- Each stop: story beat + principle + Orb prompt
- Learning happens **inside Studio World** — never long articles

Component: `InnovationExpeditionsHall.tsx`  
Route: `/admin/studio/innovation-expeditions`

---

## Multiple paths

Every expedition adapts to path level:

Beginner™ · Intermediate™ · Advanced™ · Founder™ · Enterprise™ · Creative™ · Operations™ · Strategy™

Engine: `filterStopsForPath()` in `expedition-catalog.ts`

---

## Interactive missions

Optional design challenges per expedition — improve Blueprints, reorganize campuses, reduce Creative Budget, expand Innovation District.

Engine: missions embedded in expedition catalog

---

## Community Expeditions™

Founders create expeditions for others — best journeys become Marketplace experiences.

Engine: `community-expeditions.ts`

---

## Live events

Scheduled Founder Talks™, Architecture Reviews™, Marketplace Spotlights™, Innovation Tours™, Museum Nights™.

Engine: `live-events.ts`

---

## Rewards

Completing expeditions unlocks Knowledge™, Blueprints™, Collectibles™, Artifacts™, Certificates™, Creative Equity™, districts, headquarters, Orb personalities.

Engine: `rewards-engine.ts`

---

## Orb — Expedition Guide

In Innovation Expeditions™ Hall, Orb teaches through curiosity at each stop.

Engine: `expedition-guide.ts`

---

## Global Atlas integration

Expeditions begin from Atlas — route illuminates, buildings activate, world becomes classroom.

Engine: `atlas-expeditions.ts`

---

## Command Dock

`resolveInnovationExpeditionsAdvice()` — expedition score, industry tours, path levels, community events, rewards.

Storage: `studioOsInnovationExpeditions_v1`

---

## Related

- [innovation-constellations.md](./innovation-constellations.md)
- [innovation-lineage.md](./innovation-lineage.md)
- [global-atlas-layer.md](./global-atlas-layer.md)
