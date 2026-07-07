# Engineering Guidelines — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

> **Optimize for beauty · maintainability · accessibility · scalability — not speed.**

---

## Repository Layout

```
docs/studio-os/                    # Governance + module documentation
docs/studio-os/master-spec/        # Master Specification™ (source of truth)
docs/studio-os/design/             # Design Governance™
docs/studio-os/products/           # Product specifications
src/studio-os-core/                # Business logic — NO React in services
src/components/admin/studio/       # UI presentation
src/hooks/                         # React hooks (UI layer)
src/pages/admin/studio/            # Route entry points
scripts/                           # Validators · compile · tooling
public/studio-os/                  # Compiled manifest bundles
tests/                             # Unit + E2E
```

---

## Folder Conventions

### Core Module (`studio-os-core/{module-id}/`)

```
{module-id}/
├── index.ts          # Public exports only
├── types.ts          # Domain types
├── constants.ts      # IDs · storage keys · limits
├── store.ts          # State persistence (if needed)
├── services/         # Pure business logic
└── {feature}/        # Feature submodules
```

**Rules:**
- No React imports in core
- No UI components in core
- Export clean public API via `index.ts`
- Storage keys: `studioOs_{moduleId}_v{n}`

### UI Module (`components/admin/studio/{module-id}/`)

```
{module-id}/
├── {Module}Shell.tsx       # Route shell · providers
├── {Module}Workspace.tsx   # Primary surface
├── panels/                 # Docked panels
├── {module}Theme.ts        # Composition tokens ONLY
└── index.ts
```

**Rules:**
- All chrome maps to `comp-*` catalog
- Theme file = layout spacing — NOT global typography/color
- No `{module}DesignSystem.ts`

### Module Documentation

Every shipped module requires:

```
docs/studio-os/{module-id}.md
```

Architecture Validator™ checks existence. This feeds Knowledge Registry™ (M126).

---

## Architecture

### Layer Separation

```
┌─────────────────────────────────────┐
│  Pages (routes)                     │
├─────────────────────────────────────┤
│  Components (presentation)          │
├─────────────────────────────────────┤
│  Hooks (UI state bridges)           │
├─────────────────────────────────────┤
│  studio-os-core (domain logic)      │
├─────────────────────────────────────┤
│  Platform (conversation · registry) │
└─────────────────────────────────────┘
```

### Dependency Rules

| Layer | May import from |
|-------|-----------------|
| Pages | Components · hooks |
| Components | Hooks · studio-os-core (types/constants only) |
| Hooks | studio-os-core |
| studio-os-core | Other core modules · platform utilities |
| studio-os-core | ❌ Components · ❌ React (except hooks in core/hooks if needed) |

### Milestone Registration

New modules register in:
- `master-spec/milestones/volume-*.yaml`
- `master-spec/product-roadmap.yaml` (if product)
- `dependency-graph.yaml` (if hard dependency)

---

## Services

| Pattern | Location | Rule |
|---------|----------|------|
| Domain services | `studio-os-core/{id}/services/` | Pure functions · testable |
| API services | `src/services/studio/` | External API boundaries |
| Platform services | `studio-os-core/{platform-module}/` | Shared infrastructure |

**No business logic in components.** Extract to core services.

---

## Events

| Pattern | Usage |
|---------|-------|
| Module events | `{module}:{action}` e.g. `experience-studio:saved` |
| Platform Event Bus™ | Cross-module (M131 in volume-xi — verify ID) |
| Analytics events | Per SUCCESS_METRICS.md |

Emit from core · consume in UI or analytics.

---

## State

| State type | Location | Persistence |
|------------|----------|-------------|
| Domain state | `studio-os-core/store.ts` | localStorage + server |
| UI state | React context / Zustand in hooks | Session |
| Platform state | Existing platform stores | Per module |
| Form state | Component-local | Ephemeral |

**Rule:** Core owns truth · UI reflects · sync explicitly.

---

## Caching

| Cache | Strategy |
|-------|----------|
| Master spec bundle | Compiled at build · `manifest-bundle.json` |
| Module data | TTL per data class in DATA_MODEL |
| Assets | CDN · org-scoped |
| AI context | Session-scoped · not unbounded |

Invalidate on: publish · DNA change · org settings update.

---

## Versioning

| Artifact | Scheme |
|----------|--------|
| Master Spec | Semver · Foundation frozen at 1.1.0 |
| Design Governance | Semver · VDR bumps |
| Products | Independent semver per product |
| Storage keys | `_v{n}` suffix for migrations |
| API | Versioned endpoints when external |

Breaking storage changes require migration script + rollback plan.

---

## Feature Flags

| Pattern | Usage |
|---------|-------|
| Release Channel | Primary gate — CA-001 |
| Module flags | `{module}_enabled` per org |
| Product flags | `{product}_preview` |

**Rule:** Every Preview feature has a kill switch.

Integration: `master-spec/release-channel-system.yaml` · org profile.

---

## Performance

| Budget | Target |
|--------|--------|
| LCP | <2.5s |
| INP | <200ms |
| CLS | <0.1 |
| Canvas render | 60fps |
| AI response | <3s (graceful degrade beyond) |

Measure before launch · document exceptions in QA plan.

---

## Security

| Rule | Detail |
|------|--------|
| Auth | HQ session — no custom auth |
| Authz | Per-object permissions in DATA_MODEL |
| Secrets | Never in client storage |
| AI | Prompt injection adversarial testing |
| Uploads | MIME validation · size limits · scan |
| Audit | Sensitive operations logged |

Threat model per product before implementation.

---

## Scalability

| Dimension | Approach |
|-----------|----------|
| State | Bounded stores · pagination |
| Canvas | Virtualize 20+ sections |
| AI | Queue heavy operations |
| Publish | CDN · async pipeline |
| Multi-tenant | Org isolation on all queries |

---

## Maintainability

| Practice | Detail |
|----------|--------|
| Module boundaries | Core/UI separation enforced |
| ADRs | Document decisions in spec or module doc |
| Types | Strict TypeScript · no `any` in core |
| Tests | Core logic unit tested · flagship E2E |
| Lint | Pass on PR · 0 Architecture Validator errors |

---

## Build & Validate

```bash
# Compile master spec + run Architecture Validator™
node scripts/compile-master-spec.mjs

# Full build (prebuild runs validator)
npm run build
```

**0 errors required.** Warnings reviewed per Release Channel.

---

## Cross-References

| Document | Path |
|----------|------|
| Design Governance | [DESIGN_GOVERNANCE.md](./DESIGN_GOVERNANCE.md) |
| QA Process | [QA_PROCESS.md](./QA_PROCESS.md) |
| Product Folder Structure | `product-starter-pack/PRODUCT_FOLDER_STRUCTURE.md` |
| Release Process | [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) |
| Contributor Guide | [CONTRIBUTOR_GUIDE.md](./CONTRIBUTOR_GUIDE.md) |

---

*Engineering Guidelines — consistent architecture · governed quality.*
