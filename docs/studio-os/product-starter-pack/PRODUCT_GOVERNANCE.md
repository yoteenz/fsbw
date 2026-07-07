# Product Governance™

**Version:** 2.0.0  
**Status:** Ratified  
**Parent:** [START_HERE.md](./START_HERE.md)  
**Supersedes:** [GOVERNANCE_RULES.md](./GOVERNANCE_RULES.md) (retained for reference)

---

## The Inheritance Rule

> **Products inherit governance. They request amendments. They never override.**

---

## What Products MUST Inherit

### Architectural Governance

| Artifact | Path | Product action |
|----------|------|----------------|
| **Studio Constitution™** | `master-spec/constitution.yaml` | Comply · never contradict |
| **Core Philosophies** | `master-spec/core-philosophies.yaml` | Align product vision |
| **Experience Architecture™** | `master-spec/experience-architecture.yaml` | Position product in OS layers |
| **Master Specification™** | `master-spec/` | Register milestones · minimal delta |
| **Foundation Baseline v1.1** | `master-spec/foundation-baseline.yaml` | No silent mutation |
| **Release Channel System™** | `master-spec/release-channel-system.yaml` | Channel eligibility |
| **Product Phase Charter** | `PRODUCT_PHASE_CHARTER.md` | Lifecycle discipline |

### Visual Governance

| Artifact | Path | Product action |
|----------|------|----------------|
| **Studio Design Constitution™** | `design/STUDIO_DESIGN_CONSTITUTION.md` | Acknowledge · comply |
| **Design Language System™** | `design/DESIGN_LANGUAGE_SYSTEM.md` | Reference · never duplicate |
| **Component Catalog™** | `design/COMPONENT_CATALOG.md` | Use `comp-*` IDs only |
| **Design Registry™** | `design/DESIGN_REGISTRY.md` | Declare version |
| **Design Revision Framework™** | `design/DESIGN_REVISION_FRAMEWORK.md` | Route visual changes via VDR |
| **Design Health™** | `design/DESIGN_HEALTH.md` | Pass before launch |

### Registry Governance

| Registry | Milestone | Product action |
|----------|-----------|----------------|
| **Knowledge Registry™** | M126 | Module doc · indexed documentation |
| **System Registry™** | M127 | Launch registration |
| **Product Roadmap** | `product-roadmap.yaml` | Lifecycle status |
| **Design Registry™** | Design package | Compliance version |

---

## What Products CANNOT Do

| Prohibited | Consequence |
|------------|-------------|
| Override Studio Constitution | Rejected at Architecture Review |
| Override Design Constitution | Rejected at Design Review |
| Local design system | Design Health FAIL |
| Fork catalog components | Component duplication FAIL |
| Silent architecture change | Foundation violation |
| Silent UI redesign | VDR required |
| Skip registry registration | Launch blocked |
| Ship without validators | Definition of Done incomplete |

---

## What Products MAY Do

| Allowed | Scope |
|---------|-------|
| **Composition layout** | How catalog components arrange on screens |
| **Product flows** | Journeys · IA · screen maps · domain logic |
| **Domain components** | New `comp-*` via VDR — not forks |
| **Canvas content** | User-generated artifacts (separate tier) |
| **Atmosphere** | Organization Design DNA™ within constitutional bounds |
| **Product-specific tokens** | Atmosphere only (e.g., `--wb-brand`) — not global canon |
| **Master Spec additions** | Milestones product requires — minimal delta |

---

## Amendment Request Process

Products do not edit governance directly. They **request amendments**:

| Change type | Request via | Approver |
|-------------|-------------|----------|
| Platform principle | Constitutional Amendment (CA-###) | Executive + Foundation |
| Architecture | Design Revision (DR-###) | Architecture lead |
| Visual / component | Visual Design Revision (VDR-###) | Design governance owner |
| New catalog component | VDR-100+ series | Design Review Board |
| Product feature | Product spec amendment | Product lead |
| Registry entry | System Registry™ PR | Platform |

---

## designCompliance Block (Required)

Every product README must include:

```yaml
designCompliance:
  registryVersion: "1.0.0"
  catalogVersion: "1.0.0"
  languageSystemVersion: "1.0.0"
  constitutionVersion: "1.0.0"
  designHealthGate: pending | pass | warning | fail
  releaseChannel: preview | beta | stable
  vdrCompliance: []  # List active VDRs product complies with
```

---

## Specification Writing Rules

When a product spec references design:

```markdown
## Design Application (Not Design Definition)

This product **inherits** Studio OS Design Governance v1.0.0.

- Constitution: design/STUDIO_DESIGN_CONSTITUTION.md
- Language: design/DESIGN_LANGUAGE_SYSTEM.md
- Components: COMPONENT_USAGE_MAP.md

Composition notes (product-specific only):
- {layout intent}

Do NOT redefine: typography · color philosophy · glass · motion · accessibility floor.
```

---

## Compliance Verification Gates

| Gate | Verify |
|------|--------|
| Research complete | Constitution + Design Constitution read |
| Spec approval | designCompliance · Component Usage Map |
| Prototype approval | Catalog components only · Design Health preview |
| Review Board | All 9 reviews |
| Launch | Design Health PASS · all registries updated |
| Quarterly | Product Health™ · maturity review |

---

## Governance Hierarchy (Conflict Resolution)

When product needs conflict with governance:

```
1. Studio Constitution™ wins over all
2. Master Specification™ wins over product spec
3. Design Constitution™ wins over product visual choices
4. Product spec wins over implementation shortcuts
```

Resolution path: **amendment request** — not silent override.

---

## Cross-References

| Artifact | Path |
|----------|------|
| Studio Constitution™ | `docs/studio-os/master-spec/constitution.yaml` |
| Master Specification™ | `docs/studio-os/master-spec/MASTER_SPEC_INDEX.md` |
| Design Governance™ | `docs/studio-os/design/` |
| Knowledge Registry™ | `docs/studio-os/knowledge-registry.md` |
| System Registry™ | `docs/studio-os/system-registry.md` |
| Product Development Rules | [PRODUCT_DEVELOPMENT_RULES.md](./PRODUCT_DEVELOPMENT_RULES.md) |

---

*Product Governance™ — inherit the canon · extend the capability · request the exception.*
