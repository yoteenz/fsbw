# Documentation Map — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

## Map Overview

```
docs/studio-os/
├── developer-handbook/     ← YOU ARE HERE — contributor onboarding
├── master-spec/            ← Architecture authority
├── design/                 ← Visual authority
├── product-starter-pack/   ← Product operating procedure
├── products/               ← Product specifications
├── [module-id].md          ← Knowledge Registry™ module docs
└── [reports & governance]  ← Foundation · phase · certificates
```

---

## Foundation Package

| Document | Path | Role |
|----------|------|------|
| Master Spec Index | `master-spec/MASTER_SPEC_INDEX.md` | Architecture index |
| Constitution™ | `master-spec/constitution.yaml` | 13 principles |
| Core Philosophies | `master-spec/core-philosophies.yaml` | 23 philosophies |
| Experience Architecture™ | `master-spec/experience-architecture.yaml` | Experiential layer |
| Release Channel System™ | `master-spec/release-channel-system.yaml` | CA-001 |
| Foundation Baseline | `master-spec/foundation-baseline.yaml` | Freeze registry |
| Volumes | `master-spec/volumes.yaml` | 0–XIX containers |
| Chapters | `master-spec/chapters/volume-*.yaml` | Chapter manifests |
| Milestones | `master-spec/milestones/volume-*.yaml` | M1–M233 manifests |
| Dependency Graph | `master-spec/dependency-graph.yaml` | Hard dependencies |
| Design Revisions | `master-spec/design-revisions.yaml` | DR-001–005 history |
| Constitutional Amendments | `master-spec/constitutional-amendments.yaml` | CA registry |
| Product Roadmap | `master-spec/product-roadmap.yaml` | P1–P3 products |
| Architecture Validation Report | `master-spec/ARCHITECTURE_VALIDATION_REPORT.md` | Validator output |
| Compiled Bundle | `public/studio-os/master-spec/manifest-bundle.json` | Runtime manifest |

### Foundation Reports

| Report | Path |
|--------|------|
| Foundation Completion | `FOUNDATION_COMPLETION_REPORT.md` |
| Foundation Freeze v1 | `FOUNDATION_FREEZE_REPORT_V1.md` |
| Operational Completion | `FOUNDATION_OPERATIONAL_COMPLETION_REPORT.md` |
| Architecture Baseline Certificate | `ARCHITECTURE_BASELINE_CERTIFICATE.md` |
| Platform Readiness Review | `PLATFORM_READINESS_REVIEW.md` |
| Volume V Authoring | `VOLUME_V_AUTHORING_REPORT.md` |

---

## Design Package

| Document | Path | Role |
|----------|------|------|
| Design Index | `design/README.md` | Package index |
| Studio Design Constitution™ | `design/STUDIO_DESIGN_CONSTITUTION.md` | Visual law |
| Design Language System™ | `design/DESIGN_LANGUAGE_SYSTEM.md` | Feel principles |
| Component Catalog™ | `design/COMPONENT_CATALOG.md` | `comp-*` library |
| Design Registry™ | `design/DESIGN_REGISTRY.md` | Version truth |
| Design Revision Framework™ | `design/DESIGN_REVISION_FRAMEWORK.md` | VDR system |
| Design Health™ | `design/DESIGN_HEALTH.md` | Visual validator |
| VDR Registry | `design/revisions/vdr-registry.yaml` | VDR history |

---

## Product Package

| Document | Path | Role |
|----------|------|------|
| Product Phase Charter | `PRODUCT_PHASE_CHARTER.md` | Phase transition |
| Product Starter Pack | `product-starter-pack/README.md` | POP v2.0.0 index |
| POP START_HERE | `product-starter-pack/START_HERE.md` | Product onboarding |
| Product Development Rules | `product-starter-pack/PRODUCT_DEVELOPMENT_RULES.md` | Cursor manual |
| Product Creation Checklist | `product-starter-pack/PRODUCT_CREATION_CHECKLIST.md` | Master checklist |
| Definition of Done | `product-starter-pack/DEFINITION_OF_DONE.md` | 12 gates |
| 11 Templates | `product-starter-pack/*_TEMPLATE.md` | Reusable product docs |

### Product Specifications

| Product | Path | Status |
|---------|------|--------|
| **Experience Studio™** | `products/experience-studio/` | Golden Product · spec awaiting approval |
| Website Builder™ | `products/website-builder/` | Publish specialization · awaiting approval |

---

## Engineering Package

| Document | Path | Role |
|----------|------|------|
| Developer Handbook | `developer-handbook/` | This package |
| Engineering Guidelines | `developer-handbook/ENGINEERING_GUIDELINES.md` | Code standards |
| Core module docs | `docs/studio-os/{module-id}.md` | Per-module (Knowledge Registry™) |
| Architecture | `architecture.md` | Platform hierarchy + content OS |
| Master Content Pipeline™ | `master-content-pipeline.md` | Canonical 17-stage content lifecycle |
| NDXBook Page 001 runbook | `../NDXBOOK_PAGE_001_PIPELINE.md` | Master Content Asset pilot |
| Architecture Validator | `scripts/architecture-validator.mjs` | Build gate |
| Compile script | `scripts/compile-master-spec.mjs` | Spec compilation |

### Key Module Docs (examples)

| Module | Path |
|--------|------|
| Studio Orb™ | `studio-orb.md` |
| Conversation Engine™ | `conversation-engine.md` |
| Voice Mode™ | `voice-mode.md` |
| Release Channel System™ | `release-channel-system.md` |
| Design DNA Canon™ | `design-dna-canon.md` |
| Knowledge Registry™ | `knowledge-registry.md` |
| Master Content Pipeline™ | `master-content-pipeline.md` |
| System Registry™ | `system-registry.md` |

---

## QA Package

| Document | Path | Role |
|----------|------|------|
| QA Process | `developer-handbook/QA_PROCESS.md` | Handbook QA guide |
| QA Template | `product-starter-pack/QA_TEMPLATE.md` | Per-product QA |
| Launch Checklist | `product-starter-pack/LAUNCH_CHECKLIST.md` | Pre-launch gates |
| Product Health™ | `product-starter-pack/PRODUCT_HEALTH.md` | Composite validator |
| Design Health™ | `design/DESIGN_HEALTH.md` | Visual validator |
| Architecture Validation Report | `master-spec/ARCHITECTURE_VALIDATION_REPORT.md` | Arch validator |

---

## Roadmaps

| Document | Path | Role |
|----------|------|------|
| Product Roadmap | `master-spec/product-roadmap.yaml` | P1–P3 active products |
| Governed Volume Roadmaps | `product-roadmap.yaml` → volumes VI–XIX | Paused chapter authoring |
| Product Maturity | `product-starter-pack/PRODUCT_MATURITY.md` | 🌱 → 🏛 levels |

---

## Knowledge & Registry

| Registry | Path | Milestone |
|----------|------|-----------|
| Knowledge Registry™ | `knowledge-registry.md` | M126 |
| System Registry™ | `system-registry.md` | M127 |
| Module docs | `docs/studio-os/*.md` | Per module |
| Design Registry™ | `design/DESIGN_REGISTRY.md` | Visual versions |

---

## Relationships

```
Constitution™
    → Master Spec (milestones define modules)
        → Module docs (Knowledge Registry™)
            → Architecture Validator™ (checks docs exist)
        
Design Governance
    → Component Catalog (engineering implements comp-*)
        → Design Health™ (validates compliance)

Product Starter Pack
    → Product specs (products/experience-studio/)
        → Implementation (src/studio-os-core/)
            → Module doc update (Knowledge Registry™)
                → System Registry™ (launch)

Developer Handbook
    → References ALL packages (onboarding layer)
```

---

## Find Something Fast

| I need… | Go to… |
|---------|--------|
| Platform principles | `constitution.yaml` |
| How to build a product | `product-starter-pack/START_HERE.md` |
| Component IDs | `design/COMPONENT_CATALOG.md` |
| Experience Studio spec | `products/experience-studio/` |
| How to contribute | `developer-handbook/CONTRIBUTOR_GUIDE.md` |
| Release channels | `release-channel-system.yaml` |
| Validator errors | `ARCHITECTURE_VALIDATION_REPORT.md` |
| Term definitions | `developer-handbook/GLOSSARY.md` |
| Module documentation | `docs/studio-os/{module-id}.md` |

---

## Cross-References

| Document | Path |
|----------|------|
| Platform Overview | [PLATFORM_OVERVIEW.md](./PLATFORM_OVERVIEW.md) |
| Platform Map | [PLATFORM_MAP.md](./PLATFORM_MAP.md) |
| Governance Model | [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md) |

---

*Documentation Map — every package · every relationship · one index.*
