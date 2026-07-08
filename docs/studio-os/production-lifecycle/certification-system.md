# Certified™ — Studio OS Quality Assurance

**Lifecycle Stage:** 3 of 6  
**Status:** Canonical  
**Predecessor:** Golden Build™  
**Successor:** Live™

---

## Purpose

Certified™ is Studio OS **quality assurance**.

Nothing becomes **Live™** without certification.

Golden Build™ proves the vision. Certified™ proves it meets Studio OS standards for founders, performance, genome fidelity, and immersive quality.

---

## Certification Philosophy

| Principle | Meaning |
|-----------|---------|
| **Earned, not declared** | Certification follows evidence |
| **Multi-dimensional** | No single checkbox |
| **Founder authority** | Founder Review™ is final gate |
| **Blocking** | Live™ requires `certificationToken` |

---

## Validation Stack

Everything entering Certified™ review passes:

| System | What it validates |
|--------|-------------------|
| [Walk the Room™](../engine/walk-the-room/README.md) | Immersive spatial proof · 10-stop critique path |
| [Studio Validation Loop™](../engine/validation-loop/README.md) | Asset quality · perspective · luxury · genome |
| **AI Braintrust™** | Multi-model quality consensus |
| **Founder Review™** | Explicit founder approval ceremony |
| **Accessibility** | WCAG-aligned immersive access |
| **Performance** | Load · interaction · generation latency |
| **Company Genome™ validation** | Brand fidelity across surfaces |
| **Runtime validation** | Department Runtime boot · state · recovery |

---

## Certification Taxonomy

| Certification | Scope | Issuer |
|---------------|-------|--------|
| **Studio Certified™** | Base platform quality — required for all Live™ experiences | Studio Validation Loop |
| **Luxury Certified™** | Material · lighting · editorial luxury bar | Validation + founder |
| **Genome Certified™** | Company Genome™ fidelity | Genome validation engine |
| **Marketplace Certified™** | Third-party pack safety · compatibility | Marketplace QA + Studio |
| **Performance Certified™** | Latency · load · generation SLA | Performance harness |
| **Experience Certified™** | Immersive founder journey quality | Walk the Room™ + founder |

An experience may hold **multiple certifications**. Studio Certified™ is mandatory.

---

## Certification Process

```
Golden Build Gate passed
         ↓
Certification review initiated
         ↓
Walk the Room™ — full path
         ↓
Studio Validation Loop™ — all assets
         ↓
AI Braintrust™ consensus
         ↓
Accessibility + Performance audit
         ↓
Company Genome™ + Runtime validation
         ↓
Founder Review™ ceremony
         ↓
certificationToken issued
         ↓
CERTIFIED™
```

---

## Certification Metadata

```json
{
  "certification": {
    "status": "certified",
    "token": "cert-pkg-creative-direction-golden-v1",
    "issuedAt": "ISO8601",
    "certifications": [
      "studio-certified",
      "luxury-certified",
      "genome-certified",
      "experience-certified"
    ],
    "walkTheRoomReportId": "wtr-...",
    "validationApprovalToken": "validation-approval-...",
    "founderReview": {
      "reviewedAt": "ISO8601",
      "founderId": "..."
    }
  }
}
```

---

## Certified™ by Entity Type

| Entity | Certification focus |
|--------|---------------------|
| **Department** | Walk the Room™ · all production groups · runtime |
| **Marketplace Pack™** | Compatibility · security · genome safety + Marketplace Certified™ |
| **Asset** | Validation Loop per asset · registry promotion |
| **AI Employee** | Voice · boundaries · concierge quality |
| **Headquarters** | Navigation · arrival · department integration |
| **Workflow** | Reliability · outcome accuracy |

---

## Relationship to Golden Department Process

The [Golden Department Process](../production/golden-department-process.md) (Production Stage 09) is the **predecessor methodology** for department certification.

| Legacy term | Lifecycle term |
|-------------|----------------|
| Golden Certified | Certified™ + Studio Certified™ |
| validationApprovalToken | Part of certificationToken bundle |
| qualityTier: golden | Registry status under Certified™ |

Production Lifecycle language **supersedes** Golden Department terminology for founder-facing communication.

---

## Exit Criteria — Certification Gate

| # | Criterion | Required |
|---|-----------|----------|
| 1 | Studio Certified™ | Yes |
| 2 | Walk the Room™ complete | Yes |
| 3 | Validation Loop pass | Yes |
| 4 | Founder Review™ sign-off | Yes |
| 5 | Performance within SLA | Yes |
| 6 | Accessibility audit pass | Yes |
| 7 | certificationToken issued | Yes |

**Gate detail:** [quality-gates.md](./quality-gates.md#certification-gate)

---

## Founder Experience in Certified™

| Signal | Founder sees |
|--------|--------------|
| Stage badge | **Certified™** + certification badges |
| Room state | Full experience · validation complete |
| Orb behavior | Confident · ceremony-aware |
| Primary verbs | Approve · launch · celebrate |

Founder language: *"This Marketplace Pack is Certified™."*

---

## Anti-Patterns

| Anti-pattern | Consequence |
|--------------|-------------|
| Skipping certification for "soft launch" | Violates lifecycle law |
| Self-certifying without Validation Loop | Invalid token |
| Certifying Blueprint artifacts | Wrong stage — nothing to certify yet |
| Permanent Certified™ without Evolution™ | Certified is pre-Live gate — not terminal |

---

## Transition

**Certified™ → Live™** when Certification Gate passes and Headquarters deployment authorized.

Next: [live-system.md](./live-system.md)
