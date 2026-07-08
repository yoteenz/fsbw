# Studio World Codex™

The Codex is the constitutional memory of Studio World.

It is not documentation. It is the source of truth for approved philosophy, systems, laws, naming, architectural decisions, production standards, profession knowledge, Career Worlds, Knowledge Core, and future vision.

---

## Canon

- [ARTICLE-C01 — The Codex First Principle™](./ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md)
- [Codex Article™ Template](./CODEX_ARTICLE_TEMPLATE.md)

---

## Core

- [Codex Platform Guide](./CODEX_PLATFORM.md) — schemas, API, relationships, search, versioning
- Admin workspace: `/admin/studio/codex`

```text
src/studio-os-core/studio-world-codex/
```

Key exports:

- `queryCodex()` — semantic search with filters
- `createCodexArticle()` / `reviseCodexArticle()` — append-only article lifecycle
- `getCodexOrbRecommendations()` — Orb Curator™ hooks
- `getCodexWorldGraphSyncPayload()` — World Graph integration
- `CODEX_VOLUMES` · `CODEX_PIPELINE_STAGES` · `evaluateCodexReadiness()`

---

## Rule

Every major Studio World feature must become a Codex Article™ before implementation begins.

The intended flow:

```text
Idea → Exploration → Architectural Evolution → Codex Article™ → Constitution Review™ → World Bible™ → Implementation Plan™ → Engineering → Production → Post-Launch Review → Codex Update™
```

---

## Permanent volumes

1. Studio World Manifesto™
2. Constitution™
3. World Bible™
4. Architecture Standards™
5. Design Language™
6. Production Standards™
7. Profession Brains™
8. Career Worlds™
9. Knowledge Core™
10. Future Vision™
