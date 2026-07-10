# Export Specification — AI Context Capsule™ (v1 Appendix)

**Status:** Superseded by **[AI_CONTEXT_CAPSULE_SPECIFICATION.md](./AI_CONTEXT_CAPSULE_SPECIFICATION.md)** v2.0.0

This document remains as a **historical appendix** for the initial flat Markdown/JSON export (`npm run export:ai-context-capsule`).

---

## What changed in v2

| v1 (this doc) | v2 (canonical spec) |
|---------------|---------------------|
| Separate `.md` + `.json` files | Single `.studiocapsule` ZIP |
| Manual assembly acceptable | One-click export required |
| Basic JSON schema | Full `manifest.v2.schema.json` |
| CLI only | HQ → Archive → Knowledge Management |
| Full export only | Smart exports (sprint, incremental, etc.) |

**Read the canonical spec for:** package architecture, manifest, versioning, compression, import/export workflows, compatibility philosophy, automation roadmap.

---

## v1 CLI (still available)

```bash
npm run export:ai-context-capsule
```

Output: `dist/ai-context-capsule/ai-context-capsule-{date}.md` and `.json`

Phase 2 CLI will emit `.studiocapsule` per canonical spec.

---

*See [AI_CONTEXT_CAPSULE_SPECIFICATION.md](./AI_CONTEXT_CAPSULE_SPECIFICATION.md)*
