# Folder Structure Template

> **v2.0.0:** Superseded by [PRODUCT_FOLDER_STRUCTURE.md](./PRODUCT_FOLDER_STRUCTURE.md).

---

## Standard Product Package

```
docs/studio-os/products/{product-id}/
├── README.md                          # Index · status · approval gates · designCompliance
├── {PRODUCT_ID}_EXPERIENCE_SPEC.md    # Consolidated spec (or split docs per checklist)
├── USER_FLOWS.md                      # Optional if not in spec
├── DATA_MODEL.md                      # If stateful
├── SUCCESS_METRICS.md                 # Pre-launch
├── COMPONENT_USAGE_MAP.md             # Maps to design/COMPONENT_CATALOG.md
└── LAUNCH_REPORT.md                   # Post-launch (generated)
```

---

## Implementation Structure (Post-Approval)

```
src/studio-os-core/{product-id}/
├── constants.ts
├── types.ts
├── store.ts | session.ts
├── index.ts
└── {domain}/                          # Submodules as needed

src/components/admin/studio/{product-id}/
├── {Product}Shell.tsx
├── {Product}Workspace.tsx
├── {Product}Panels.tsx
└── {product}Theme.ts                  # Product composition tokens ONLY — not global design

src/hooks/
└── use{Product}State.ts

src/pages/admin/studio/{product-id}/
└── page.tsx

docs/studio-os/
└── {product-id}.md                    # Module doc for Architecture Validator™
```

---

## Rules

| Rule | Detail |
|------|--------|
| **No `{product}DesignSystem.ts`** | Global design lives in `docs/studio-os/design/` |
| **Theme files** | Composition layout only · import governance tokens |
| **Core vs UI** | Business logic in `studio-os-core` · presentation in `components` |
| **One module doc** | `docs/studio-os/{module-id}.md` for registry |

---

## Registry Registration Files

| Registry | Update |
|----------|--------|
| `master-spec/product-roadmap.yaml` | Product entry + lifecycle |
| `design/DESIGN_REGISTRY.md` | Compliance row |
| System Registry™ | On launch via `registry-builder` |
| Knowledge Registry™ | Module documentation |

---

## Example: Website Builder

```
docs/studio-os/products/website-builder/
├── README.md
└── WEBSITE_BUILDER_EXPERIENCE_SPEC.md

# Post-approval (future):
src/studio-os-core/website-builder/
src/components/admin/studio/website-builder/
```

---

## Example: Campaign Engine (Queued)

```
docs/studio-os/products/campaign-engine/
├── README.md
├── CAMPAIGN_ENGINE_EXPERIENCE_SPEC.md   # TBD
└── COMPONENT_USAGE_MAP.md               # TBD
```

---

## Naming Conventions

| Item | Convention |
|------|------------|
| Product ID | kebab-case · `website-builder` |
| Component IDs | `comp-*` from catalog only |
| Routes | `/admin/studio/{product-id}` |
| Storage keys | `studioOs_{productId}_v1` |
| Milestone | Assigned in Master Spec when registered |

---

*Folder Structure Template — consistent homes · inherited design.*
