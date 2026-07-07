# Contributor Guide — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

## Welcome, Contributor

Whether you are an engineer, designer, product manager, QA engineer, architect, or AI agent — this guide explains **how to propose changes** to Studio OS without breaking governance.

---

## Before You Start

1. Read [START_HERE.md](./START_HERE.md)
2. Read [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md)
3. Read role-specific docs (see START_HERE reading order)
4. Search [GLOSSARY.md](./GLOSSARY.md) for unfamiliar terms

---

## How to Propose Features

### Platform Feature (affects multiple products)

```
1. Document intent — problem · scope · affected modules
2. Check Master Spec — does milestone exist?
3. If new milestone needed → DR proposal
4. If product-scoped → route through product spec
5. Architecture alignment review
6. Implement with module doc update
7. Architecture Validator™ pass
8. PR with documentation
```

### Product Feature (single product scope)

```
1. Update product specification
2. Update COMPONENT_USAGE_MAP if UI changes
3. Product Review Board review (if pre-implementation)
4. Implement within product module boundaries
5. QA_TEMPLATE check
6. No global governance change unless VDR/DR needed
```

---

## How to Propose Design Revisions (VDR)

Visual changes to **global** design require VDR.

### When VDR Is Required

| Change | VDR? |
|--------|------|
| New reusable component | ✓ VDR-100+ |
| Global token value | ✓ VDR-200+ |
| Motion token change | ✓ VDR-300+ |
| Component anatomy breaking change | ✓ Major VDR |
| Product layout composition | ✗ Product spec |
| Product atmosphere token | ✗ Within bounds |

### VDR Process

```
1. Draft proposal (use DESIGN_REVISION_FRAMEWORK template)
2. Impact analysis — affected products · compatibility
3. Design Health™ preview on affected surfaces
4. Submit to design governance owner
5. Ratification → Design Registry version bump
6. Migration window for deprecated components
7. Register in design/revisions/vdr-registry.yaml
```

**Framework:** [DESIGN_REVISION_FRAMEWORK.md](../design/DESIGN_REVISION_FRAMEWORK.md)

---

## How to Request Constitutional Amendments (CA)

Rare — changes to platform principles.

### When CA Is Required

- New constitutional principle
- Change to immutable Design Constitution clause
- New platform-wide capability (like Release Channels)

### CA Process

```
1. Written amendment proposal
2. Impact on Foundation baseline
3. Executive review
4. Update constitutional-amendments.yaml
5. Update constitution.yaml version
6. Update foundation-baseline.yaml
7. Recompile manifest bundle
```

**File:** `master-spec/constitutional-amendments.yaml`  
**Example:** CA-001 — Release Channel System™

---

## How to Propose Architectural Changes (DR)

Architectural changes require DR — not VDR.

### When DR Is Required

| Change | DR? |
|--------|-----|
| New milestone / module | ✓ |
| Dependency graph change | ✓ |
| Experience Architecture update | ✓ |
| Foundation baseline change | ✓ (rare) |
| Product-only logic | ✗ |

### DR Process

```
1. Proposal — milestones · dependencies · breaking changes
2. Update dependency-graph.yaml
3. Architecture Validator™ preview
4. Ratification by architecture lead
5. Register in design-revisions.yaml (if historical record needed)
6. Implement + module doc
```

---

## How to Create Products

Every product starts from the Product Starter Pack — **no exceptions**.

```
1. Read product-starter-pack/START_HERE.md
2. Copy PRODUCT_CREATION_CHECKLIST.md → products/{id}/
3. Copy PRODUCT_README_TEMPLATE.md → products/{id}/README.md
4. Complete templates in lifecycle order
5. Pass Product Review Board
6. Receive Founder Approval
7. Implement per PRODUCT_FOLDER_STRUCTURE.md
8. Launch per LAUNCH_CHECKLIST.md
```

**First example:** [Experience Studio™](../products/experience-studio/)

---

## How to Update Documentation

### Module Documentation

| Action | Path |
|--------|------|
| New module | Create `docs/studio-os/{module-id}.md` |
| Update module | Edit existing module doc |
| Index update | Knowledge Registry™ auto-indexes on compile |

**Required for:** Architecture Validator™ pass.

### Governance Documentation

| Package | Update process |
|---------|----------------|
| Master Spec | DR if architectural · compile after |
| Design Governance | VDR · registry bump |
| Product Starter Pack | PR + product governance review |
| Developer Handbook | PR + handbook review |
| Product specs | Product owner approval |

### Documentation Rules

- Spec in `docs/` — independent of app code
- Cross-reference — don't duplicate governance
- Version and date every document
- Link to canonical source of truth

---

## How to Work with Studio Intelligence™

### As a Product Author

- Define AI boundaries in AI_COLLABORATION.md
- Map to Conversation Engine™ integration
- Set approval thresholds
- Plan adversarial review

### As an Engineer

- Use Conversation Engine™ APIs — don't build parallel chat
- Ground AI in Knowledge Registry™ docs
- Respect memory scopes
- Log AI mutations in Conversation Timeline

### As an AI Agent (Cursor)

```
Required workflow:
1. Read handbook START_HERE + role docs
2. Read product spec if product-scoped
3. Read design governance if UI-scoped
4. Map all UI to comp-* catalog
5. Implement in correct layer (core vs UI)
6. Update module doc
7. Verify Architecture Validator passes
8. Never skip approval gates in documentation
```

**Guide:** [AI_COLLABORATION_GUIDE.md](./AI_COLLABORATION_GUIDE.md)

---

## Pull Request Checklist

```
□ Governance appropriate (none / VDR / DR / CA / product spec)
□ Module doc updated (if new/changed module)
□ Architecture Validator™ 0 errors
□ No local design system introduced
□ No Foundation baseline mutation (unless DR)
□ designCompliance intact (if product)
□ Tests for core logic (where applicable)
□ Cross-references accurate
```

---

## Who to Ask

| Question | Ask |
|----------|-----|
| Architecture / DR | Architecture lead |
| Design / VDR | Design governance owner |
| Product / spec | Product owner |
| Constitution / CA | Executive |
| Release channel | Release governance |
| QA gates | QA lead |
| Handbook | Documentation review |

---

## Cross-References

| Document | Path |
|----------|------|
| Governance Model | [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md) |
| Engineering Guidelines | [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md) |
| Product Development Rules | `product-starter-pack/PRODUCT_DEVELOPMENT_RULES.md` |
| Documentation Map | [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) |

---

*Contributor Guide — propose with governance · ship with confidence.*
