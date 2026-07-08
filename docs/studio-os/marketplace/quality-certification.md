# Quality Certification™

**Four tiers · one path to excellence**

**Version:** 1.0.0  
**Status:** Canonical quality architecture (docs only)  
**Parent:** [Studio Marketplace™](./README.md)

---

## Purpose

Define the **four quality tiers** governing every headquarters experience in Studio Marketplace™ — and the certification path from Private™ to Featured Collection™.

---

## The Four Tiers

### Studio Originals™

| Property | Value |
|----------|-------|
| **Creator** | Studio OS (official) |
| **Quality** | Premium · handcrafted · canonical |
| **Availability** | Default at onboarding · always available |
| **GPU** | Never required |
| **Certification** | Implicit Studio Certified™ |
| **Featured** | Permanent platform collection |

Official starting experiences. Maintained by Studio OS.

**Detail:** [studio-originals.md](./studio-originals.md)

---

### Private™

| Property | Value |
|----------|-------|
| **Creator** | Founder or creator (personal) |
| **Visibility** | Owner only |
| **Quality** | Unreviewed |
| **GPU** | May have used Premium Generation™ |
| **Marketplace** | Not listed |
| **Purpose** | Personal HQ · draft · experiment |

Every purchased or generated headquarters begins Private™ until published.

---

### Community™

| Property | Value |
|----------|-------|
| **Creator** | Published creators · founders |
| **Visibility** | Public marketplace |
| **Quality** | Community-reviewed · not Studio-guaranteed |
| **Requirements** | Golden Build™ · valid Headquarters Package™ |
| **GPU** | Pre-built package — buyer needs no GPU |
| **Revenue** | Creator earns per install |

Entry to creator economy. Quality varies — ranking surfaces best.

---

### Studio Certified™

| Property | Value |
|----------|-------|
| **Creator** | Any publisher passing review |
| **Visibility** | Marketplace + Certified badge |
| **Quality** | Studio OS verified · production-ready |
| **Requirements** | Full certification gate (below) |
| **Featured eligibility** | Yes |
| **Trust** | Highest buyer confidence |

Only highest-quality experiences reach Studio Certified™.

---

## Certification Gate (Studio Certified™)

| Requirement | Validation |
|-------------|--------------|
| **Headquarters Package™ schema valid** | Automated |
| **Framework Lock™ zones complete** | Automated + human |
| **Arrival Sequence™ + Idle Life™** | Human walkthrough |
| **Genome adaptation** | ≥2 industry previews pass |
| **Install / uninstall clean** | Automated integration test |
| **Preview fidelity** | Preview matches install |
| **Performance SLA** | Load time · memory bounds |
| **IP & originality** | Human review |
| **Production Lifecycle™** | Golden Build™ minimum |
| **Marketplace Certified™** | Per [marketplace-lifecycle.md](../production-lifecycle/marketplace-lifecycle.md) |

Failure returns actionable revision — not silent rejection.

---

## Publishing Progression

```
Private™
    ↓
Share With Team™          (org members · no public listing)
    ↓
Submit For Review™        (enters certification queue)
    ↓
Community Marketplace™    (approved for public listing)
    ↓
Studio Certified™         (passes full certification gate)
    ↓
Featured Collection™      (editorial platform spotlight)
```

| Step | GPU for buyer | Revenue |
|------|---------------|---------|
| Private™ | N/A | None |
| Community™ | No | Creator per install |
| Studio Certified™ | No | Higher trust · ranking boost |
| Featured™ | No | Maximum visibility |

---

## Featured Collection™

Editorial spotlight curated by Studio OS:

| Criteria | Weight |
|----------|--------|
| Studio Certified™ | Required |
| Taste match breadth | High |
| Install satisfaction | High |
| Design innovation | Medium |
| Genre diversity | Medium (platform balance) |
| Creator reputation | Medium |

Featured is **prestigious** — not paid placement alone.

---

## Tier Badges (Founder-Facing)

| Badge | Meaning |
|-------|---------|
| **Studio Original™** | Official · canonical |
| **Community™** | Creator-published |
| **Studio Certified™** | Verified excellence |
| **Featured™** | Platform spotlight |
| **97% Taste Match** | Personal recommendation |

Badges appear in browse · preview · install confirmation.

---

## Decertification

| Trigger | Action |
|---------|--------|
| Runtime breaking change unpatched | Suspend listing · notify publisher |
| Install failure rate threshold | Review · potential decertify |
| IP dispute | Immediate suspend pending review |
| Misleading preview proven | Decertify · Community™ demotion |

Existing installs remain functional — Archive™ preserves packages.

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Public listing without package validation | Quality collapse |
| Studio Certified™ without human walkthrough | Trust erosion |
| Featured paid without quality | Pay-to-win marketplace |
| Skip Golden Build™ | Incomplete environment |

---

## Relationship to Canon

| System | Role |
|--------|------|
| [Production Lifecycle™](../production-lifecycle/marketplace-lifecycle.md) | Stage language |
| [Marketplace Ranking™](./marketplace-ranking.md) | Post-certification discovery |
| [Creator Economy™](./creator-economy.md) | Revenue tied to tier |

---

## Implementation Status

**Docs only.** Certification spec — no review UI this sprint.
