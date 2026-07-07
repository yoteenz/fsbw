# 13 — Marketplace Certification

**Engine Module:** `studio.validation-loop.v1.marketplace-certification`  
**Status:** Headquarters Marketplace™ trust certification system  
**Philosophy:** Certifications communicate trust and quality — not marketing fluff.

---

## Design Principle

> Departments published to Headquarters Marketplace™ must earn certification. Buyers trust badges backed by Validation Loop evidence.

---

## Certification Badges

| Badge | Criteria |
|-------|----------|
| **Studio Certified™** | Full Validation pipeline pass · Founder approved · Scorecard ≥ 75 |
| **Luxury Certified™** | Creative Review luxury ≥ 85 · Editorial Quality ≥ 80 |
| **Genome Optimized™** | Genome Validation ≥ 90 · Swap test strong pass |
| **Marketplace Ready™** | Marketplace Readiness dimension ≥ 85 · install dry-run pass |
| **Performance Optimized™** | Performance dimension ≥ 85 · size/draw within budget |
| **Experience Gold™** | Overall Experience ≥ 90 · all nine experience questions yes |
| **Accessibility Verified™** | Accessibility dimension ≥ 80 · reduced-motion pass |

Badges are **earned** — not purchased. Revoked on failed revalidation.

---

## Certification Schema

```yaml
MarketplaceCertification:
  listingId: string
  packageId: string
  packageVersion: semver
  validationId: string
  badges: CertificationBadge[]
  issuedAt: ISO8601
  expiresAt: ISO8601              # default 12 months · revalidation required
  scorecard: StudioScorecard
  genomeProfile: string[]         # industry affinity proven
  installGuide: string
  compatibilityMatrix: CompatibilityEntry[]
  revoked: boolean
  revocationReason: string | null
```

```yaml
CertificationBadge:
  id: string
  displayName: string
  earnedAt: ISO8601
  evidence: string                # explanation from scorecard dimension
  score: number
```

---

## Certification Pipeline

```
Department Package Founder Approved
       ↓
Marketplace Listing Draft (Generator 15)
       ↓
Full Validation (if not already complete)
       ↓
Badge Evaluator (automated against scorecard)
       ↓
Department Review — Marketplace compatibility
       ↓
Founder Publish Approval
       ↓
Certification Issued
       ↓
Listing Live with badges
```

---

## Badge Evaluator Rules

| Badge | Required Dimensions | Minimum |
|-------|---------------------|---------|
| Studio Certified™ | overallScore | 75 |
| Luxury Certified™ | luxury + editorialQuality | 85 + 80 |
| Genome Optimized™ | brandAuthenticity | 90 |
| Marketplace Ready™ | marketplaceReadiness | 85 |
| Performance Optimized™ | performance | 85 |
| Experience Gold™ | overallExperience + immersion | 90 + 85 |
| Accessibility Verified™ | accessibility | 80 |

All badges require explanation string in certification record.

---

## Buyer Trust Signals

Marketplace listing displays:

| Signal | Source |
|--------|--------|
| Badge icons | Certification |
| Scorecard summary | Anonymized dimension highlights |
| Genome affinity tags | Tested industry profiles |
| Install compatibility | compatibilityMatrix |
| Last validated date | Certification issuedAt |
| Creator reputation | Learning Engine org history |

---

## Revocation Triggers

| Trigger | Action |
|---------|--------|
| Package major update without revalidation | Suspend listing |
| Evolution System critical fail | Revoke badges · notify buyers |
| Genome breaking change | Mandatory recertification |
| Founder request | Delist |
| Performance regression reports | Review · possible revoke |

---

## Third-Party Expansions

Creator-submitted Marketplace expansions undergo **same certification** as first-party departments. No bypass for marketplace sellers.

---

## Relationship to Generator Marketplace Export

| Generator Provides | Certification Validates |
|-------------------|------------------------|
| Listing draft | Against earned badges |
| Compatibility matrix | Install dry-run confirmation |
| Genome hooks | Genome Optimized test |

---

_Next: [14 — Evolution System](./14_EVOLUTION_SYSTEM.md)_
