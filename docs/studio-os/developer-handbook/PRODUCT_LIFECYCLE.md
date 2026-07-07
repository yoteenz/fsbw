# Product Lifecycle — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)  
**Authority:** [Product Starter Pack v2.0.0](../product-starter-pack/START_HERE.md)

---

## Lifecycle Overview

```
Idea
  ↓
Research
  ↓
Product Vision
  ↓
Architecture
  ↓
Design Governance Reference
  ↓
Product Specification
  ↓
Experience Prototype
  ↓
Product Review Board
  ↓
Founder Approval
  ↓
Implementation
  ↓
QA
  ↓
Beta
  ↓
Production (Launch)
  ↓
Governed Evolution
```

**Critical gate:** Implementation requires **Founder Approval** after Product Review Board.

---

## Phase Details

### 1. Idea 🌱

| Attribute | Detail |
|-----------|--------|
| **Duration** | Days |
| **Owner** | Executive / product |
| **Output** | One-page concept |
| **Gate** | Executive go/no-go |

**Activities:**
- Confirm OS thesis alignment
- Assign priority slot in `product-roadmap.yaml`
- Identify anti-personas

**Exit:** Executive approval to research

---

### 2. Research 🌿

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1–2 weeks |
| **Output** | UX Discovery draft |
| **Gate** | Research review |

**Activities:**
- User/persona evidence
- Competitive scan (what we are NOT)
- Existing module reuse map
- Release Channel rationale

**Template:** [UX_DISCOVERY_TEMPLATE.md](../product-starter-pack/UX_DISCOVERY_TEMPLATE.md)

---

### 3. Product Vision 🌿

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1 week |
| **Output** | PRODUCT_VISION.md |
| **Gate** | Vision approval |

**Activities:**
- Mission · vision · north star
- Success metrics · out of scope
- Emotional goals · AI philosophy

**Template:** [PRODUCT_VISION_TEMPLATE.md](../product-starter-pack/PRODUCT_VISION_TEMPLATE.md)

---

### 4. Architecture 🌳

| Attribute | Detail |
|-----------|--------|
| **Duration** | Days–1 week |
| **Output** | Milestone map · tech scope |
| **Gate** | Architecture alignment |

**Activities:**
- Master Spec milestone identification
- Dependency mapping
- Foundation v1.1 compliance check
- Release Channel assignment

**Rule:** No Foundation mutation without DR.

---

### 5. Design Governance Reference 🌳

| Attribute | Detail |
|-----------|--------|
| **Duration** | Days |
| **Output** | designCompliance declaration |
| **Gate** | Design Constitution acknowledgment |

**Activities:**
- Read Studio Design Constitution™
- Draft COMPONENT_USAGE_MAP.md
- Confirm: no local design language

**Reference:** [DESIGN_GOVERNANCE.md](./DESIGN_GOVERNANCE.md)

---

### 6. Product Specification 🌳

| Attribute | Detail |
|-----------|--------|
| **Duration** | 2–4 weeks |
| **Output** | Full spec package |
| **Gate** | Spec approval |

**Activities:**
- IA · screen map · user flows
- AI collaboration model
- Data model · technical architecture
- Component usage map

**Example:** [Experience Studio™ spec](../products/experience-studio/)

---

### 7. Experience Prototype 🏗

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1–3 weeks |
| **Output** | Interactive proof of feel |
| **Gate** | Prototype approval |

**Rules:**
- Catalog components only (`comp-*`)
- Not production code
- Design Health™ preview ≥70

---

### 8. Product Review Board 🏗

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1–2 weeks |
| **Output** | Review record · conditions |
| **Gate** | All reviews PASS/CONDITIONAL resolved |

**Reviews:** Architecture · UX · Design · AI · Accessibility · Performance · Security · Engineering · Scalability · Maintainability · Founder

**Reference:** [PRODUCT_REVIEW_BOARD.md](../product-starter-pack/PRODUCT_REVIEW_BOARD.md)

---

### 9. Founder Approval 🏗

| Attribute | Detail |
|-----------|--------|
| **Output** | Written authorization |
| **Gate** | **Implementation unlock** |

No code without this gate.

---

### 10. Implementation ⚙

| Attribute | Detail |
|-----------|--------|
| **Duration** | Weeks–months |
| **Output** | Production code + module docs |
| **Gate** | Feature complete for channel scope |

**Standards:**
- [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md)
- [PRODUCT_FOLDER_STRUCTURE.md](../product-starter-pack/PRODUCT_FOLDER_STRUCTURE.md)
- Architecture Validator™ 0 errors on build

---

### 11. QA 🧪

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1–2 weeks |
| **Output** | QA_PLAN signed off |
| **Gate** | Product Health™ PASS |

**Reference:** [QA_PROCESS.md](./QA_PROCESS.md)

---

### 12. Beta 🧪

| Attribute | Detail |
|-----------|--------|
| **Channel** | Preview or Beta |
| **Gate** | Org opt-in · monitoring active |

Limited audience · feedback collection · iteration.

---

### 13. Production (Launch) 🚀

| Attribute | Detail |
|-----------|--------|
| **Output** | Live on Release Channel |
| **Gate** | Definition of Done — 12 gates PASS |

**Activities:**
- LAUNCH_CHECKLIST 100%
- System Registry™ + Knowledge Registry™ registration
- Release notes · support runbook

---

### 14. Governed Evolution ⭐

| Attribute | Detail |
|-----------|--------|
| **Duration** | Ongoing |
| **Output** | Lessons Learned · maturity promotion |

**Activities:**
- Quarterly Product Health™ review
- VDR/DR for improvements
- Maturity promotion (⭐ Mature → 🏛 Platform Service)

---

## Maturity Levels

| Level | Symbol | Phase alignment |
|-------|--------|-----------------|
| Concept | 🌱 | Idea |
| Discovery | 🌿 | Research + Vision |
| Architecture | 🌳 | Architecture + Spec |
| Prototype | 🏗 | Prototype + Review |
| Development | ⚙ | Implementation |
| QA | 🧪 | QA + Beta |
| Production | 🚀 | Launch |
| Mature | ⭐ | Post-launch stability |
| Platform Service | 🏛 | Other products depend on it |

**Detail:** [PRODUCT_MATURITY.md](../product-starter-pack/PRODUCT_MATURITY.md)

---

## Current Products

| Product | Maturity | Phase |
|---------|----------|-------|
| Studio Orb™ / Voice / Conversation | ⭐ Mature | Governance |
| Experience Studio™ | 🌳 Architecture | Specification complete · awaiting approval |
| Website Builder™ | 🌳 Architecture | Publish specialization · awaiting approval |
| Campaign Engine™ | 🌱 Concept | Queued |

---

## Cross-References

| Document | Path |
|----------|------|
| Product Starter Pack | `product-starter-pack/START_HERE.md` |
| Product Creation Checklist | `product-starter-pack/PRODUCT_CREATION_CHECKLIST.md` |
| Definition of Done | `product-starter-pack/DEFINITION_OF_DONE.md` |
| Contributor Guide | [CONTRIBUTOR_GUIDE.md](./CONTRIBUTOR_GUIDE.md) |

---

*Product Lifecycle — governed from idea to evolution.*
