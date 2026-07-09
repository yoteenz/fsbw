# Genesis Foundation Framework™ — Platform Guide

**Charter:** [`Genesis.md`](../../../Genesis.md)  
**Route:** `/admin/studio/genesis`  
**Core:** `src/studio-os-core/genesis/`  
**Content home:** `genesis/`

---

## Purpose

Genesis is Studio World's **canonical source kernel** — not documentation, not the Codex, not the Institute. Every future official document derives from Genesis through compilation pipelines.

This sprint delivers **reusable infrastructure only**. No hardcoded Studio World content.

---

## Module structure

| Path | Responsibility |
|------|----------------|
| `/framework` | Hierarchy, lifecycle, kernel doctrine |
| `/objects` | Canonical Object Model™, factory, Genesis Registry™ |
| `/schemas` | Base schema, object schemas, validation |
| `/relationships` | Relationship Graph™ |
| `/proposals` | Proposal Pipeline™ |
| `/adr` | ADR Pipeline™ |
| `/reviews` | Review Pipeline™ |
| `/versioning` | Semver, article revisions, historical revisions |
| `/history` | Historical archive |
| `/compiler` | Compilation Pipeline™ and compile targets |
| `/articles` | Article registry (type `article` objects) |
| `/persistence` | localStorage store (`genesis_v1`) |

---

## Lifecycle pipeline

```text
Proposal → Review → Prototype → ADR → Genesis → Implementation → Verification → Canonical
```

Use `submitGenesisProposal()` to begin. Advance via pipeline APIs in `proposals/`, `reviews/`, `adr/`, and `framework/lifecycle.ts`.

---

## Canonical object fields

Every Genesis object supports:

- Unique ID (`GEN-{TYPE}-{SLUG}`)
- Title, category, status, version
- Created / updated timestamps
- Dependencies, relationships
- Author, contributors
- Review history, canonical status
- Tags, references
- Revision history

---

## Compilation targets

Genesis compiles into:

- Constitution
- Architect's Brain
- Master Specification
- World Bible
- Developer Docs
- SDK Docs
- API Docs
- Codex
- Institute of Knowledge

Run `compileGenesisTargets()` to produce a compile manifest.

---

## Key APIs

```typescript
import {
  submitGenesisProposal,
  createGenesisAdr,
  beginGenesisReview,
  promoteObjectToCanonical,
  compileGenesisTargets,
  createGenesisObject,
  addGenesisRelationship,
} from '@/studio-os-core/genesis';
```

---

## Admin workspace

**GenesisWorkspace** at `/admin/studio/genesis` — Overview, Registry, Pipelines, Schemas, Compiler tabs.

Hook: `useGenesisState()`
