# Product Folder Structure™

**Version:** 2.0.0  
**Status:** Ratified  
**Parent:** [START_HERE.md](./START_HERE.md)  
**Supersedes:** [FOLDER_STRUCTURE_TEMPLATE.md](./FOLDER_STRUCTURE_TEMPLATE.md)

---

## Purpose

Canonical Studio OS folder hierarchy for every product — documentation through implementation.

---

## Complete Hierarchy

```
docs/studio-os/products/{product-id}/
│
├── 📋 GOVERNANCE & INDEX
│   ├── README.md                          # Product index (from PRODUCT_README_TEMPLATE)
│   └── PRODUCT_CREATION_CHECKLIST.md      # Master checklist (copied from Starter Pack)
│
├── 📐 SPECIFICATIONS
│   ├── PRODUCT_VISION.md
│   ├── UX_DISCOVERY.md
│   ├── INFORMATION_ARCHITECTURE.md
│   ├── SCREEN_MAP.md
│   ├── COMPONENT_USAGE_MAP.md
│   ├── AI_COLLABORATION.md
│   ├── DATA_MODEL.md                      # If stateful
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── {PRODUCT}_EXPERIENCE_SPEC.md       # Optional consolidated spec
│
├── 🧪 QA & LAUNCH
│   ├── QA_PLAN.md
│   ├── LAUNCH_CHECKLIST.md
│   ├── SUCCESS_METRICS.md
│   ├── LESSONS_LEARNED.md                 # Post-launch
│   └── PRODUCT_REVIEW_BOARD_RECORD.md     # Review sign-off
│
└── 🗺 ROADMAPS
    └── ROADMAP.md                         # Optional product-specific roadmap

docs/studio-os/
└── {product-id}.md                        # Module doc → Knowledge Registry™ (M126)

src/studio-os-core/{product-id}/
├── index.ts                               # Public exports
├── types.ts                               # Domain types
├── constants.ts                           # Product constants
├── store.ts | session.ts                  # State (if needed)
├── services/                              # Domain services
├── hooks/                                 # Core hooks (optional)
└── {domain}/                              # Submodules

src/components/admin/studio/{product-id}/
├── {Product}Shell.tsx                     # Route shell
├── {Product}Workspace.tsx                # Primary workspace
├── panels/                                # Panel components
├── {product}Theme.ts                     # Composition tokens ONLY
└── index.ts

src/hooks/
└── use{Product}*.ts                       # UI hooks

src/pages/admin/studio/{product-id}/
└── page.tsx                               # Route entry

tests/
├── studio-os-core/{product-id}/           # Unit tests
└── e2e/{product-id}/                      # E2E (flagship products)

docs/studio-os/design/                     # INHERITED — never duplicated per product
docs/studio-os/product-starter-pack/       # INHERITED — templates
docs/studio-os/master-spec/                # INHERITED — architecture
```

---

## Folder Purposes

| Folder | Purpose | Owner |
|--------|---------|-------|
| **Documentation** | `products/{id}/` | Product team |
| **Assets** | `public/` or org CDN | Product + Design DNA™ |
| **Components** | `components/admin/studio/{id}/` | Engineering |
| **Services** | `studio-os-core/{id}/services/` | Engineering |
| **Hooks** | `hooks/` + core hooks | Engineering |
| **Routes** | `pages/admin/studio/{id}/` | Engineering |
| **Types** | `studio-os-core/{id}/types.ts` | Engineering |
| **State** | `store.ts` / context | Engineering |
| **Tests** | `tests/` | Engineering + QA |
| **AI** | Conversation integration in core | Intelligence team |
| **Analytics** | Events in SUCCESS_METRICS | Product |
| **QA** | `QA_PLAN.md` + test dirs | QA |
| **Specifications** | All `*_TEMPLATE` outputs | Product |
| **Roadmaps** | `product-roadmap.yaml` + optional | Product |
| **Design** | `docs/studio-os/design/` — **inherited** | Platform |
| **Governance** | Starter Pack + Constitution — **inherited** | Platform |

---

## Implementation Structure (Post-Approval)

### Core Module (`studio-os-core`)

```
src/studio-os-core/{product-id}/
├── constants.ts          # Product IDs · storage keys · limits
├── types.ts              # Domain entities · state shapes
├── store.ts              # Persistence · sync
├── index.ts              # Public API
└── {feature}/            # Feature submodules
    ├── index.ts
    └── {feature}-service.ts
```

**Rule:** No UI imports in core. No React in core services.

### UI Layer (`components`)

```
src/components/admin/studio/{product-id}/
├── {Product}Shell.tsx       # Layout · providers
├── {Product}Workspace.tsx   # Primary surface
├── panels/                  # Docked panels
│   ├── InspectorPanel.tsx
│   └── DirectorPanel.tsx
├── {product}Theme.ts        # Composition layout tokens ONLY
└── index.ts
```

**Rule:** All chrome maps to `comp-*` catalog. Theme file = layout spacing · not global typography.

---

## Registry Registration Files

| Registry | File to update |
|----------|----------------|
| Product Roadmap | `master-spec/product-roadmap.yaml` |
| Design Registry | `design/DESIGN_REGISTRY.md` compliance table |
| System Registry™ | via registry-builder on launch |
| Knowledge Registry™ | `docs/studio-os/{product-id}.md` |
| Master Spec milestones | `milestones/volume-*.yaml` |

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Product ID | kebab-case | `website-builder` |
| Component IDs | `comp-*` from catalog | `comp-canvas` |
| Screen IDs | `scr-{product}-{nnn}` | `scr-wb-001` |
| Routes | `/admin/studio/{product-id}` | |
| Storage keys | `studioOs_{productId}_v1` | |
| Module doc | `{product-id}.md` | `website-builder.md` |
| Core export | `studioOs{Product}` | `studioOsWebsiteBuilder` |

---

## Prohibited Paths

| Path | Why prohibited |
|------|----------------|
| `{product}/design-system/` | Use `docs/studio-os/design/` |
| `{product}/components/Button.tsx` | Use `comp-buttons` |
| `{product}/styles/global.css` | Use Design Token Engine™ |
| `{product}/DESIGN_LANGUAGE.md` | Reference governance · application only |

---

## Examples

### Website Builder (Flagship)

```
docs/studio-os/products/website-builder/
├── README.md
├── WEBSITE_BUILDER_EXPERIENCE_SPEC.md    # Consolidated spec
└── PRODUCT_CREATION_CHECKLIST.md         # To be added

# Post-approval:
src/studio-os-core/website-builder/
src/components/admin/studio/website-builder/
docs/studio-os/website-builder.md
```

### Campaign Engine (Queued)

```
docs/studio-os/products/campaign-engine/
├── README.md                             # From template
├── PRODUCT_CREATION_CHECKLIST.md
└── {templates as completed}
```

---

## Cross-References

| Artifact | Path |
|----------|------|
| Product Development Rules | [PRODUCT_DEVELOPMENT_RULES.md](./PRODUCT_DEVELOPMENT_RULES.md) |
| Design Governance™ | `docs/studio-os/design/` |
| Knowledge Registry™ | `docs/studio-os/knowledge-registry.md` |
| Master Specification™ | `docs/studio-os/master-spec/` |

---

*Product Folder Structure™ — consistent homes · inherited design · governed growth.*
