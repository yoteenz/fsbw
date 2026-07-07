# Technical Architecture — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Status:** Draft | Review | Approved  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}

---

> Copy to `docs/studio-os/products/{product-id}/TECHNICAL_ARCHITECTURE.md`  
> Or include as final section of consolidated Experience Specification.

---

## Architecture Overview

{One paragraph · how this product fits in Studio OS layers}

```
┌─────────────────────────────────────────┐
│  UI Layer (components/admin/studio/)    │
├─────────────────────────────────────────┤
│  Core Layer (studio-os-core/)           │
├─────────────────────────────────────────┤
│  Platform (Conversation · Registry · HQ) │
└─────────────────────────────────────────┘
```

---

## Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| `{product-id}` core | `src/studio-os-core/{product-id}/` | Domain logic · state |
| `{product-id}` UI | `src/components/admin/studio/{product-id}/` | Presentation |
| Module doc | `docs/studio-os/{product-id}.md` | Knowledge Registry™ |

### Master Spec Milestones

| Milestone | Status | Notes |
|-----------|--------|-------|
| M{nnn} | planned / in-progress | |

---

## Services

| Service | Type | Responsibility |
|---------|------|----------------|
| `{Product}Service` | core | CRUD · validation |
| | | |

---

## Events

| Event | Emitter | Consumers | Payload |
|-------|---------|-----------|---------|
| `{product}:saved` | core | UI · analytics | `{ id, version }` |
| `{product}:published` | core | notifications | |

---

## Queues / Background Jobs

| Job | Trigger | Retry | Timeout |
|-----|---------|-------|---------|
| | | 3x | 30s |

---

## API

### Internal API (module exports)

| Function | Input | Output |
|----------|-------|--------|
| | | |

### External API (if applicable)

| Endpoint | Method | Auth | Channel |
|----------|--------|------|---------|
| | GET | required | beta+ |

---

## Authentication

| Context | Method |
|---------|--------|
| Studio session | Existing HQ auth |
| API | Bearer / org scope |

---

## Authorization

| Resource | Check |
|----------|-------|
| | `canEdit(resource, user)` |

**Reference:** DATA_MODEL permissions

---

## State

| State | Location | Persistence |
|-------|----------|-------------|
| Workspace UI | React context / Zustand | session |
| Domain data | core store | localStorage + server |
| AI session | Conversation Engine™ | session |

---

## Caching

| Cache | Key | TTL | Invalidation |
|-------|-----|-----|--------------|
| | | | |

---

## Performance

| Budget | Target | Measurement |
|--------|--------|-------------|
| LCP | <2.5s | Lighthouse |
| INP | <200ms | RUM |
| Bundle (product chunk) | <{n}kb | build analyze |
| Canvas render | 60fps | profiling |

---

## Offline

| Capability | Offline behavior |
|------------|------------------|
| Draft edit | Full (local) |
| Publish | Queue · sync on reconnect |
| AI | Graceful unavailable message |

---

## Scalability

| Dimension | Approach |
|-----------|----------|
| Data volume | Pagination · lazy load |
| Concurrent users | Optimistic UI · server sync |
| Asset size | CDN · compression |

---

## Dependencies

### Studio OS Platform

| Dependency | Module | Required |
|------------|--------|----------|
| Conversation Engine™ | `conversation-engine/` | yes |
| Design tokens | Design Token Engine™ | yes |
| Digital Architect™ | `digital-architect/` | if applicable |

### External

| Dependency | Version | Purpose |
|------------|---------|---------|
| | | |

### Dependency Graph Alignment

Verify against `master-spec/dependency-graph.yaml` — no circular hard dependencies.

---

## Feature Flags

| Flag | Default | Channel |
|------|---------|---------|
| `{product}_enabled` | false | preview |

---

## Architecture Decisions (ADR)

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| ADR-001 | | | |

---

## Approval

| Item | Status | Reviewer | Date |
|------|--------|----------|------|
| Milestones scoped | ☐ | | |
| Dependencies clean | ☐ | | |
| Performance budgets | ☐ | | |
| Architecture Review ready | ☐ | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Master Specification™ | `docs/studio-os/master-spec/MASTER_SPEC_INDEX.md` |
| Studio Constitution™ | `docs/studio-os/master-spec/constitution.yaml` |
| Implementation Plan | [IMPLEMENTATION_PLAN_TEMPLATE.md](./IMPLEMENTATION_PLAN_TEMPLATE.md) |
| Folder Structure | [PRODUCT_FOLDER_STRUCTURE.md](./PRODUCT_FOLDER_STRUCTURE.md) |

---

*Technical Architecture — platform-aligned · registry-driven · shippable.*
