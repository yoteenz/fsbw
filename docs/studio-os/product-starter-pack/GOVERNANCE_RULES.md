# Governance Rules — Products

**Parent:** [Studio Product Starter Pack™](./README.md)

---

## The Inheritance Rule

> **Products inherit. They never redefine.**

---

## What Products MUST Inherit

| Governance artifact | Path | Product action |
|--------------------|------|----------------|
| **Studio Design Constitution™** | `design/STUDIO_DESIGN_CONSTITUTION.md` | Acknowledge · comply |
| **Design Language System™** | `design/DESIGN_LANGUAGE_SYSTEM.md` | Reference · never duplicate |
| **Component Catalog™** | `design/COMPONENT_CATALOG.md` | Use `comp-*` IDs only |
| **Design Registry™** | `design/DESIGN_REGISTRY.md` | Declare version |
| **Design Revision Framework™** | `design/DESIGN_REVISION_FRAMEWORK.md` | Route visual changes via VDR |
| **Design Health™** | `design/DESIGN_HEALTH.md` | Pass before launch |

---

## What Products MUST NOT Do

| Prohibited | Instead |
|------------|---------|
| Local design system document | Reference Design Language System |
| Custom button/modal/panel spec | Use Component Catalog |
| Product-specific color philosophy | Use token-color + org Design DNA |
| Product-specific typography rules | Use typography roles |
| Product-specific motion library | Use token-motion |
| Override glass recipes | VDR proposal |
| Skip designCompliance block | Required in README |

---

## What Products MAY Do

| Allowed | Scope |
|---------|-------|
| **Composition layout** | How catalog components arrange on screens |
| **Product-specific flows** | User journeys · IA · screen maps |
| **Domain components** | Registered as new `comp-*` via VDR — not forks |
| **Canvas content components** | User-generated (e.g., website sections) — separate registry tier |
| **Atmosphere within bounds** | Organization Design DNA™ sliders |

---

## Architectural Governance (Also Inherited)

| Artifact | Rule |
|----------|------|
| Studio Constitution™ | Platform principles |
| Master Specification™ | Milestone registration |
| Release Channel System™ | Channel eligibility |
| Foundation Baseline v1.1 | Frozen — no silent mutation |
| Product Phase Charter | Lifecycle discipline |

---

## Specification Writing Rules

When a product spec includes "Design Language" section:

```markdown
## Design Application (Not Design Definition)

This product **inherits** Studio OS Design Governance v1.0.0.

- Registry: design/DESIGN_REGISTRY.md
- Components: see COMPONENT_USAGE_MAP.md

Composition notes (product-specific):
- Canvas occupies 85% viewport
- Director dock preferred right-lower

Do NOT redefine: typography · color · glass · motion philosophy.
```

Website Builder spec §6 is **application** — will reference governance on next revision (not required to rewrite now per user instruction — only reference if needed).

---

## Change Routing

| Change type | Route |
|-------------|-------|
| Product feature | Product spec amendment |
| New reusable UI | VDR → Component Catalog |
| Token value global | VDR → Design Registry |
| Architecture | DR or milestone addition |
| Constitutional | CA-### amendment |

---

## Compliance Verification

Before each gate:

| Gate | Verify |
|------|--------|
| Spec approval | designCompliance declared · Component Usage Map |
| Prototype approval | Catalog components only · Design Health preview |
| Launch | Design Health PASS · Registry updated |

---

*Governance Rules — inherit the canon · extend the capability.*
