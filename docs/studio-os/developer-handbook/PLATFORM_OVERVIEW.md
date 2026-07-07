# Platform Overview — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

## Ecosystem Summary

Studio OS is a **layered governance platform** with **registry infrastructure**, **design canon**, **product operating procedure**, and **validation gates** — unified by the Studio Constitution™.

```
                    ┌─────────────────────┐
                    │ Studio Constitution™ │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Master Specification™│
                    └──────────┬──────────┘
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
    ┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
    │ Knowledge       │ │ System       │ │ Design          │
    │ Registry™       │ │ Registry™    │ │ Governance™     │
    └────────┬────────┘ └──────┬───────┘ └────────┬────────┘
             └─────────────────┼──────────────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Product Starter Pack™│
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Experience Studio™   │ ← Reference Implementation™
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Future Products™     │
                    └──────────┬──────────┘
                               ↓
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
    ┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
    │ Architecture    │ │ Design       │ │ Product         │
    │ Validator™      │ │ Health™      │ │ Health™         │
    └────────┬────────┘ └──────┬───────┘ └────────┬────────┘
             └─────────────────┼──────────────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Release Channels™   │ → Launch → Evolution
                    └─────────────────────┘
```

---

## Core Artifacts

### Studio Constitution™

| Property | Value |
|----------|-------|
| **Role** | Supreme platform law — 13 principles |
| **Path** | `docs/studio-os/master-spec/constitution.yaml` |
| **Version** | 1.1.0 frozen |
| **Changes** | Constitutional Amendments (CA-###) only |

Governs: platform identity · intelligence layer · registry requirement · premium UX · release channels.

---

### Master Specification™

| Property | Value |
|----------|-------|
| **Role** | Architectural source of truth — Volumes 0–XIX |
| **Path** | `docs/studio-os/master-spec/` |
| **Version** | 1.1.0 · Foundation frozen |
| **Compile** | `node scripts/compile-master-spec.mjs` |
| **Bundle** | `public/studio-os/master-spec/manifest-bundle.json` |

Contains: constitution · philosophies · experience architecture · milestones · dependency graph · product roadmap.

**Index:** [MASTER_SPEC_INDEX.md](../master-spec/MASTER_SPEC_INDEX.md)

---

### Knowledge Registry™ (M126)

| Property | Value |
|----------|-------|
| **Role** | Searchable documentation index for all modules |
| **Path** | `docs/studio-os/knowledge-registry.md` + `docs/studio-os/{module-id}.md` |
| **Requirement** | Every shipped module has a doc file |
| **Consumer** | Global search · Academy · Studio Intelligence™ |

---

### System Registry™ (M127)

| Property | Value |
|----------|-------|
| **Role** | Runtime registry of platform objects and products |
| **Path** | `docs/studio-os/system-registry.md` |
| **Registration** | On product launch via registry-builder |
| **Consumer** | QA Engine™ · Deployment · Manifest Reconciliation™ |

---

### Design Governance™

| Property | Value |
|----------|-------|
| **Role** | Permanent visual source of truth |
| **Path** | `docs/studio-os/design/` |
| **Version** | 1.0.0 |
| **Authority** | Studio Design Constitution™ |

| Document | Purpose |
|----------|---------|
| STUDIO_DESIGN_CONSTITUTION.md | Governing visual law |
| DESIGN_LANGUAGE_SYSTEM.md | Permanent feel principles |
| COMPONENT_CATALOG.md | `comp-*` canonical library |
| DESIGN_REGISTRY.md | Version truth |
| DESIGN_REVISION_FRAMEWORK.md | VDR-### system |
| DESIGN_HEALTH.md | Visual validator rubric |

---

### Product Starter Pack™

| Property | Value |
|----------|-------|
| **Role** | Product Operating Procedure — mandatory for every product |
| **Path** | `docs/studio-os/product-starter-pack/` |
| **Version** | 2.0.0 |
| **Contains** | 22 documents · templates · Review Board · Definition of Done |

First product: Experience Studio™.

---

### QA Framework™

| Property | Value |
|----------|-------|
| **Role** | Quality gates across architecture · design · product |
| **Components** | Architecture Validator™ · Design Health™ · Product Health™ · QA_TEMPLATE |
| **Definition of Done** | 12 gates — see Product Starter Pack |

Not a single file — distributed across validators and QA_PROCESS.md.

---

### Architecture Validator™

| Property | Value |
|----------|-------|
| **Role** | Structural compliance gate |
| **Script** | `scripts/architecture-validator.mjs` |
| **Trigger** | `compile-master-spec.mjs` · `npm run build` (prebuild) |
| **Output** | 0 errors required · warnings channel-dependent |
| **Report** | `master-spec/ARCHITECTURE_VALIDATION_REPORT.md` |

Validates: milestone coverage · module docs · registry integrity · dependency graph.

---

### Design Health™

| Property | Value |
|----------|-------|
| **Role** | Visual compliance validator |
| **Rubric** | `docs/studio-os/design/DESIGN_HEALTH.md` |
| **Output** | PASS · WARNING · FAIL (0–100 score) |
| **Dimensions** | 14 including consistency · typography · accessibility · luxury score |
| **Future** | Executable script (recommended) |

---

### Product Health™

| Property | Value |
|----------|-------|
| **Role** | Composite product readiness validator |
| **Path** | `product-starter-pack/PRODUCT_HEALTH.md` |
| **Dimensions** | 10 — architecture through scalability |
| **Use** | Pre-launch · quarterly review |

---

### Release Channel System™ (CA-001)

| Property | Value |
|----------|-------|
| **Role** | Constitutional capability — org opt-in feature gates |
| **Path** | `master-spec/release-channel-system.yaml` |
| **Milestone** | M127.14 |
| **Channels** | Stable · Preview · Beta · Experimental |

See [RELEASE_PROCESS.md](./RELEASE_PROCESS.md).

---

### Experience Studio™ (Reference Implementation™)

| Property | Value |
|----------|-------|
| **Role** | Golden Product™ · proves entire OS stack |
| **Path** | `docs/studio-os/products/experience-studio/` |
| **Status** | Spec complete · awaiting approval |
| **Identity** | AI Creative Operating System — not a website builder |

See [PRODUCT_REFERENCE_IMPLEMENTATION.md](./PRODUCT_REFERENCE_IMPLEMENTATION.md).

---

## How They Connect

| From | To | Relationship |
|------|-----|--------------|
| Constitution™ | Master Spec | Parent authority |
| Master Spec | Milestones | Implementation containers |
| Milestones | Module docs | Knowledge Registry™ entries |
| Module docs | Validator | Architecture Validator™ checks |
| Design Governance | Products | Inheritance via designCompliance |
| Product Starter Pack | Products | Lifecycle · templates · gates |
| Products | System Registry™ | Launch registration |
| Validators | Release Channels | Channel promotion gates |
| Experience Studio™ | Future products | Reference patterns · graduation |

---

## Implementation Layout

```
docs/studio-os/                    # All governance + module docs
docs/studio-os/master-spec/        # Master Specification™
docs/studio-os/design/             # Design Governance™
docs/studio-os/product-starter-pack/  # POP
docs/studio-os/products/           # Product specifications
docs/studio-os/developer-handbook/ # This handbook
src/studio-os-core/                # Business logic modules
src/components/admin/studio/       # UI presentation
scripts/                           # Validators · compile
public/studio-os/                  # Compiled bundles
```

---

## Foundation Status

| Component | Version | Status |
|-----------|---------|--------|
| Foundation | v1.1.0 | 🔒 Frozen · operationally complete |
| Volumes 0–V | — | Authored |
| Volumes VI–XIX | — | Governed roadmaps |
| CA-001 Release Channels | — | Ratified |
| DR-001–005 | — | Merged into Experience Architecture™ |

---

## Cross-References

| Document | Path |
|----------|------|
| Governance Model | [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md) |
| Documentation Map | [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) |
| Platform Map | [PLATFORM_MAP.md](./PLATFORM_MAP.md) |
| Product Phase Charter | [PRODUCT_PHASE_CHARTER.md](../PRODUCT_PHASE_CHARTER.md) |

---

*Platform Overview — the complete Studio OS ecosystem in one view.*
