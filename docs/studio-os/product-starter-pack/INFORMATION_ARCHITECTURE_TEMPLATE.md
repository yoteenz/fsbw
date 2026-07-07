# Information Architecture — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Status:** Draft | Review | Approved  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}

---

> Copy to `docs/studio-os/products/{product-id}/INFORMATION_ARCHITECTURE.md`

---

## IA Overview

{One paragraph describing how information is organized in this product}

---

## Navigation

### Primary Navigation

| Item | Label | Destination | Component |
|------|-------|-------------|-----------|
| | | | `comp-navigation` |

### Secondary Navigation

| Item | Context | Visibility |
|------|---------|------------|
| | | |

### Orb / Command Integration

| Command | Action | Palette entry |
|---------|--------|---------------|
| | | |

**Rule:** Navigation inherits [Component Catalog™](../design/COMPONENT_CATALOG.md) — no custom nav chrome.

---

## Objects

| Object ID | Name | Description | Registry |
|-----------|------|-------------|----------|
| `{obj-id}` | | | System Registry™ |

### Object: {Name}

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | uuid | yes | |
| | | | |

---

## Relationships

```
{Parent Object}
    ├── {Child A}
    │     └── {Grandchild}
    └── {Child B}
```

| From | Relationship | To | Cardinality |
|------|--------------|-----|-------------|
| | owns | | 1:N |

---

## Permissions

| Role | Create | Read | Update | Delete | Publish |
|------|--------|------|--------|--------|---------|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Editor | | ✓ | ✓ | | |
| Viewer | | ✓ | | | |

### Permission Model

- **Authentication:** {method}
- **Authorization:** {RBAC / ABAC / object-level}
- **Inheritance:** {from HQ org roles}

---

## Hierarchy

### Content Hierarchy

```
Product Root
├── Workspace
│   ├── Canvas / Primary surface
│   ├── Library / Assets
│   └── History / Versions
├── Intelligence
│   └── Director / AI
└── Settings
    └── Product preferences (not global design)
```

### Visual Hierarchy (Z-Index Layers)

| Layer | Content | Component |
|-------|---------|-----------|
| 0 | Environment (marble) | — |
| 1 | Canvas | `comp-canvas` |
| 2 | Workspace panels | `comp-workspace-panel` |
| 3 | Floating docks | `comp-floating-dock` |
| 4 | Modals | `comp-modal` |
| 5 | Orb / notifications | `comp-studio-orb` |

---

## Routes

| Route | Screen | Auth | Channel |
|-------|--------|------|---------|
| `/admin/studio/{product-id}` | Workspace | required | preview+ |
| `/admin/studio/{product-id}/{id}` | Editor | required | preview+ |

### Route Parameters

| Param | Type | Purpose |
|-------|------|---------|
| `id` | string | Resource identifier |

---

## Search & Discovery

| Searchable | Index | Registry |
|------------|-------|----------|
| | Knowledge Registry™ | |

---

## Future Scalability

| Dimension | Current | Future |
|-----------|---------|--------|
| Object count | | Pagination · virtual scroll |
| Multi-tenant | | Org isolation |
| Collaboration | | Real-time · presence |
| Localization | | i18n keys |
| API exposure | | Public API tier |

---

## IA Approval

| Item | Status | Reviewer | Date |
|------|--------|----------|------|
| Objects registered | ☐ | | |
| Permissions complete | ☐ | | |
| Routes defined | ☐ | | |
| Scalability noted | ☐ | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Screen Map | [SCREEN_MAP_TEMPLATE.md](./SCREEN_MAP_TEMPLATE.md) |
| Data Model | [DATA_MODEL_TEMPLATE.md](./DATA_MODEL_TEMPLATE.md) |
| System Registry™ | `docs/studio-os/system-registry.md` |

---

*Information Architecture — structure before screens.*
