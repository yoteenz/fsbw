# Hero Objects Over Icons™

**ID:** `hero-objects-over-icons`  
**Article:** ARTICLE-D09 — Hero Objects™ & Contextual Orb™  
**Layer:** Design Principles™  
**Status:** Canon  
**Graph node:** `W-DPR-hero-objects-over-icons`  

---

## Principle

Studio World should represent navigation with collectible living artifacts rather than software icons.

When a destination needs a visual primitive, first design a **Hero Object™**:

- unique silhouette,
- material language,
- ambient motion,
- internal energy,
- destination ownership,
- Asset Registry identity,
- World Graph node,
- Foundry product line,
- collectible editions,
- usage history.

Do not default to app icons, pictograms, tiles, or generic launcher marks.

---

## Decision guide

When multiple navigation treatments are possible, prefer:

1. object over icon,
2. artifact over button,
3. silhouette over label,
4. contextual Orb toolbelt over static launcher,
5. manufactured asset over decorative SVG,
6. collectible edition over one-off graphic,
7. graph citizen over local UI element.

---

## Canonical architecture

Primary spec:

`docs/studio-os/hero-objects/ARTICLE_D09_HERO_OBJECTS_CONTEXTUAL_ORB.md`

Code:

`src/studio-os-core/hero-objects/`

World Graph ingestion:

`src/studio-os-core/world-graph/ingestion/hero-objects-ingest.ts`
