# Sprint 1 Architecture Review — Studio OS Knowledge Platform

**Status:** Complete — foundational architecture only (no product milestones)  
**Date:** 2026-07-07  
**Approved scope:** Knowledge Registry™, System Registry™, Manifest Authoring™, Manifest Reconciliation™

---

## Executive Summary

Sprint 1 establishes the **Master Specification** as the single source of truth for Studio OS platform knowledge. The specification lives independently in `docs/studio-os/master-spec/` and is consumed by the application through a compiled bundle — the codebase does not own the spec.

Four foundational systems are now wired:

| System | Role |
|--------|------|
| **Studio OS Knowledge Registry™** | Architectural brain — Volumes, milestones, constitution, design revisions, implementation status |
| **System Registry™** | Master directory of live modules, services, routes, and platform objects |
| **Manifest Authoring™** | Validates YAML manifest integrity before compilation |
| **Manifest Reconciliation™** | Merges manifest milestones with live codebase modules |

---

## 1. Manifest Location (Source of Truth)

```
docs/studio-os/master-spec/
├── constitution.yaml
├── volumes.yaml              # Volumes 0–XIX (Volume I registered immediately)
├── design-revisions.yaml
├── milestone-aliases.yaml    # Canonical ↔ shipped ID reconciliation
├── dependency-graph.yaml
├── milestones/
│   ├── index.yaml
│   ├── volume-ii-iv.yaml
│   ├── volume-v.yaml
│   └── volume-vi-xix.yaml
├── MASTER_SPEC_INDEX.md
└── MASTER_SPEC_RECONCILIATION.md   # Auto-generated on compile
```

**Consumption path:**

```
docs/studio-os/master-spec/*.yaml
        ↓  npm run compile-master-spec (also runs in prebuild)
public/studio-os/master-spec/manifest-bundle.json
src/studio-os-core/manifest-reconciliation/generated/manifest-bundle.json
        ↓
Knowledge Registry™ · System Registry™ · Search · QA surfaces
```

---

## 2. Single Source of Truth Architecture

Each entity exists **exactly once** in the Master Specification:

- Volume, Chapter, Milestone, Design Revision, Component, Workflow, Prompt, Future Enhancement

All consumers **reference** — never duplicate:

- Roadmap™ (Knowledge Registry tab)
- Knowledge Registry™
- System Registry™
- Studio Intelligence™ unified search
- Documentation Governance™
- Engineering Dashboard™
- Mission Control panels

---

## 3. Milestone Display Policy

| Surface | What users see |
|---------|----------------|
| **Normal UX** (nav, cards, Mission Control metrics) | Shipped badges only (e.g. M126, M163) |
| **Engineering surfaces** (Knowledge Registry, System Registry, Roadmap tab, QA, Engineering Dashboard) | Canonical IDs (M138, M159) + shipped aliases where reconciled |

Reconciliation is documented in `milestone-aliases.yaml` (e.g. canonical Vol V M159–M164 ↔ shipped M163–M168).

---

## 4. Unified Search (Planned + Live)

Global search includes **planned milestones** with status labels:

- **Planned**
- **In Progress**
- **Complete**
- **Deprecated** (future)

No separate roadmap search — one unified experience via `queryKnowledgeRegistry()`.

---

## 5. Volume I Registration

Volume I is registered in `volumes.yaml` immediately with:

- Status: `in-progress`
- Completion: 45%
- Child milestones (including future/planned)
- Dependencies

The Knowledge Registry Volumes tab surfaces all volumes even when milestones are still in planning.

---

## 6. Rename: Documentation Registry → Knowledge Registry

| Before | After |
|--------|-------|
| `/admin/studio/documentation-registry` | Redirects → `/admin/studio/knowledge-registry` |
| `documentation-registry` module id | `knowledge-registry` (legacy id retained as alias) |
| Documentation Registry™ | **Studio OS Knowledge Registry™** |

---

## 7. Sprint 1 Deliverables Checklist

- [x] Master Spec YAML manifests (194 milestones, 20 volumes)
- [x] Compile script + prebuild hook
- [x] Manifest Reconciliation module
- [x] Manifest Authoring validation
- [x] Knowledge Registry (manifest-driven registry builder)
- [x] System Registry (consumes Knowledge Registry entries)
- [x] Knowledge Registry UI (Volumes, Roadmap, Manifest, Unified Search tabs)
- [x] Routes + navigation + Mission Control panel
- [x] Global search status labels
- [ ] **Product milestones (DR-001, Orb, etc.) — explicitly deferred**

---

## 8. Reconciliation Snapshot

Run `npm run compile-master-spec` to refresh. At Sprint 1 completion:

- **194** manifest milestones
- **20** volumes (Volume I registered)
- Manifest Authoring validates duplicate IDs, missing Volume I, dependency integrity
- Manifest Reconciliation reports matched-live vs planned-only vs orphaned modules

---

## 9. Next Steps (Post-Review)

**Do not begin product milestone implementation until architecture review is approved.**

After approval, recommended sequence:

1. Expand milestone YAML coverage for Volume I chapters
2. Wire Engineering Excellence Dashboard™ to reconciliation report
3. Add Manifest Authoring UI for in-app spec editing (future Studio OS feature)
4. Begin DR-001 / product milestones per roadmap priority

---

## 10. Key File Map

| Concern | Path |
|---------|------|
| Spec source | `docs/studio-os/master-spec/` |
| Compile | `scripts/compile-master-spec.mjs` |
| Reconciliation engine | `src/studio-os-core/manifest-reconciliation/` |
| Knowledge Registry | `src/studio-os-core/knowledge-registry/` |
| Knowledge Registry UI | `src/components/admin/studio/knowledge-registry/KnowledgeRegistryWorkspace.tsx` |
| System Registry | `src/studio-os-core/system-registry/` |
| Unified search | `src/studio-interactive-manual/searchIndex.ts` |

---

*Present this document for architecture review before Sprint 2 product work.*
