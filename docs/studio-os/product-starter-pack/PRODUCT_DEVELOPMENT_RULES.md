# Product Development Rules™

**Version:** 2.0.0  
**Status:** Ratified  
**Audience:** Cursor · engineering · product · design  
**Parent:** [START_HERE.md](./START_HERE.md)

---

> **This is Cursor's operating manual for Studio OS product development.**

---

## Prime Directive

Optimize for **beauty · maintainability · accessibility · scalability · user delight** — **not** implementation speed.

---

## Never Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | **Never skip Discovery** | UX_DISCOVERY_TEMPLATE required before specification |
| 2 | **Never skip UX** | User journeys precede screen maps |
| 3 | **Never skip Product Vision** | PRODUCT_VISION_TEMPLATE required before spec |
| 4 | **Never begin implementation before approval** | Founder Approval after Review Board |
| 5 | **Never invent Design Language** | Inherit from Design Governance |
| 6 | **Never duplicate governance** | Reference · link · declare compliance |
| 7 | **Never silently change architecture** | DR or milestone addition required |
| 8 | **Never silently redesign UI** | VDR required for visual behavior changes |
| 9 | **Never create local design systems** | No `{product}DesignSystem.ts` |
| 10 | **Never fork catalog components** | Use `comp-*` IDs · propose new via VDR |
| 11 | **Never skip accessibility** | WCAG 2.2 AA minimum |
| 12 | **Never generate without Genome** | CA-002 — consult Company + Project Genome first |
| 13 | **Never produce generic interchangeable output** | Genome validation required |
| 14 | **Never ship without validators** | Architecture + Design + Product Health |
| 15 | **Never mutate Foundation baseline** | v1.1 frozen — constitutional process only |

---

## Always Rules

| # | Rule | Artifact |
|---|------|----------|
| 1 | **Always reference Studio Design Constitution** | `design/STUDIO_DESIGN_CONSTITUTION.md` |
| 2 | **Always reference Design Language System** | `design/DESIGN_LANGUAGE_SYSTEM.md` |
| 3 | **Always reference Component Catalog** | `design/COMPONENT_CATALOG.md` |
| 4 | **Always reference Design Registry** | `design/DESIGN_REGISTRY.md` |
| 5 | **Always reference Design Revision Framework** | `design/DESIGN_REVISION_FRAMEWORK.md` |
| 6 | **Always create VDR for visual changes** | `design/revisions/vdr-registry.yaml` |
| 7 | **Always create CA for constitutional changes** | `master-spec/constitution.yaml` |
| 8 | **Always create DR for architectural changes** | `master-spec/design-revisions.yaml` |
| 9 | **Always keep Knowledge Registry updated** | `docs/studio-os/{module-id}.md` |
| 10 | **Always keep Master Specification updated** | Milestones · product-roadmap.yaml |
| 11 | **Always document implementation decisions** | ADRs in product spec or module doc |
| 12 | **Always declare designCompliance** | Product README |
| 13 | **Always use Product Starter Pack templates** | This package |
| 14 | **Always pass Product Review Board** | Before implementation |
| 15 | **Always register at launch** | System Registry™ · Knowledge Registry™ |
| 16 | **Always consult Company Genome™** | CA-002 — before AI generation |
| 17 | **Always declare genomeCompliance** | Product README · genome-first adherence |

---

## Governance Reference Matrix

| Layer | Governs | Change mechanism | Products |
|-------|---------|------------------|----------|
| **Studio Constitution™** | Platform principles | CA-### | Inherit |
| **Master Specification™** | Architecture · milestones | DR-### · milestone | Register · extend |
| **Design Constitution™** | Visual law | Constitutional amendment (rare) | Inherit |
| **Design Language™** | Feel · principles | VDR-### | Reference |
| **Component Catalog™** | UI canon | VDR-### | Use `comp-*` |
| **Design Registry™** | Version truth | VDR version bump | Declare compliance |
| **Product Spec** | Flows · domain | Product amendment | Author |

---

## Documentation Rules

### Before Prototype

```
□ PRODUCT_VISION_TEMPLATE complete
□ UX_DISCOVERY_TEMPLATE complete
□ INFORMATION_ARCHITECTURE_TEMPLATE complete
□ SCREEN_MAP_TEMPLATE complete
□ COMPONENT_USAGE_TEMPLATE complete
□ AI_COLLABORATION_TEMPLATE complete (if AI surfaces)
□ designCompliance in README
```

### Before Implementation

```
□ TECHNICAL_ARCHITECTURE_TEMPLATE complete
□ DATA_MODEL_TEMPLATE complete (if stateful)
□ IMPLEMENTATION_PLAN_TEMPLATE complete
□ Product Review Board — all 9 reviews PASS
□ Founder Approval recorded
```

### Before Launch

```
□ QA_TEMPLATE complete
□ LAUNCH_CHECKLIST complete
□ DEFINITION_OF_DONE — all gates PASS
□ Product Health™ PASS
□ Knowledge Registry™ indexed
□ Master Specification updated
```

---

## Code Organization Rules

| Rule | Detail |
|------|--------|
| Core logic | `src/studio-os-core/{product-id}/` |
| UI presentation | `src/components/admin/studio/{product-id}/` |
| Module documentation | `docs/studio-os/{module-id}.md` |
| Product specification | `docs/studio-os/products/{product-id}/` |
| Composition tokens only | `{product}Theme.ts` — layout · not global design |
| Hooks | `src/hooks/use{Product}*.ts` |
| Routes | `/admin/studio/{product-id}` |

See [PRODUCT_FOLDER_STRUCTURE.md](./PRODUCT_FOLDER_STRUCTURE.md).

---

## AI Development Rules

When Cursor or AI assists implementation:

| Do | Don't |
|----|-------|
| Read governance docs first | Generate ad-hoc UI components |
| Map UI to `comp-*` catalog | Invent button/modal patterns |
| Propose VDR for new visual patterns | Edit global CSS silently |
| Run Architecture Validator | Skip module documentation |
| Document decisions in spec | Assume design from training data |
| Respect Release Channel | Ship experimental on Stable |

---

## Review & Approval Rules

| Action | Requires |
|--------|----------|
| Start research | Idea approval |
| Start specification | Vision approval |
| Start prototype | Spec completeness |
| Start implementation | **Founder Approval** |
| Promote Release Channel | Product Health™ + QA PASS |
| Deprecate feature | Migration plan + registry update |
| Breaking visual change | VDR Major + migration window |

---

## Change Routing

| Change type | Route | Prefix |
|-------------|-------|--------|
| Platform principle | Constitutional Amendment | CA-### |
| Architecture | Design Revision (architectural) | DR-### |
| Visual / component | Visual Design Revision | VDR-### |
| Product feature | Product spec amendment | — |
| Registry entry | System Registry™ update | — |
| Documentation | Knowledge Registry™ sync | — |

---

## Quality Hierarchy

When trade-offs arise, resolve in this order:

```
1. Accessibility
2. Security
3. Architecture compliance
4. Design compliance
5. User delight
6. Performance
7. Maintainability
8. Implementation speed  ← lowest priority
```

---

## Anti-Patterns

- ❌ "We'll align with design later"
- ❌ "Quick prototype in production code"
- ❌ "Product-specific button for this one screen"
- ❌ "Skip Review Board for small features"
- ❌ "Local CSS variables for global typography"
- ❌ "Copy Framer/Linear patterns without catalog mapping"
- ❌ "Volume authoring without product driver"

---

## Cross-References

| Artifact | Path |
|----------|------|
| Studio Constitution™ | `docs/studio-os/master-spec/constitution.yaml` |
| Master Specification™ | `docs/studio-os/master-spec/` |
| Design Governance™ | `docs/studio-os/design/` |
| Knowledge Registry™ | `docs/studio-os/knowledge-registry.md` |
| Product Review Board | [PRODUCT_REVIEW_BOARD.md](./PRODUCT_REVIEW_BOARD.md) |
| Definition of Done | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) |

---

*Product Development Rules™ — Cursor's operating manual for governed product creation.*
