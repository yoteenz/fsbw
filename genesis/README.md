# Genesis — Canonical Source Kernel

**Charter:** [`Genesis.md`](../Genesis.md)  
**Runtime:** `src/studio-os-core/genesis/`  
**Admin workspace:** `/admin/studio/genesis`

Genesis is Studio World's single canonical source of truth. This folder is the **content home** for official Genesis articles and governance artifacts.

## Structure

| Path | Purpose |
|------|---------|
| `framework/` | Kernel hierarchy, lifecycle, charter references |
| `articles/` | Canonical articles authored via Genesis pipelines |
| `adr/` | Architecture Decision Records |
| `proposals/` | Pre-canonical change proposals |
| `reviews/` | Canonical review session records |
| `objects/` | Canonical object instances |
| `schemas/` | Object schema definitions |
| `relationships/` | Relationship graph edges |
| `versioning/` | Semantic versions and revision history |
| `history/` | Historical revisions archive |
| `compiler/` | Compile manifests and target outputs |

## Rule

If Genesis and any compiled output disagree, **Genesis wins**.
