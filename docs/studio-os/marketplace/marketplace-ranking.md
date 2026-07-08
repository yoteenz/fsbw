# Marketplace Ranking™

**Discovery · Featured placement · trust signals**

**Version:** 1.0.0  
**Status:** Canonical ranking architecture (docs only)  
**Parent:** [Studio Marketplace™](./README.md)

---

## Purpose

Define how Studio Marketplace™ surfaces headquarters experiences — balancing **taste personalization**, **quality certification**, **creator reputation**, and **platform curation**.

Ranking is not a generic app store sort.

Founders discover **places they want to work**.

---

## Core Law

```
DISCOVERY FAVORS COMPLETE EXPERIENCES · CERTIFIED QUALITY · TASTE ALIGNMENT
```

Never rank individual assets.

---

## Ranking Signals

| Signal | Weight tier | Description |
|--------|-------------|-------------|
| **Taste match score** | Highest (personalized) | Founder Taste Genome™ alignment |
| **Studio Certified™** | High (trust) | Passed full certification gate |
| **Featured Collection™** | High (editorial) | Platform spotlight |
| **Studio Originals™** | Contextual | Boosted at onboarding |
| **Install satisfaction** | High | Post-install founder rating |
| **Preview completion** | Medium | Founder finished preview arrival |
| **Install count** | Medium | Proven popularity — not sole driver |
| **Creator reputation** | Medium | Historical quality · low dispute rate |
| **Genre diversity** | Low (platform) | Avoid filter bubble in browse |
| **Recency (Evolution™)** | Low | Fresh versions surface briefly |
| **Price** | None in ranking | Commerce separate from quality sort |

Paid placement **cannot** override Studio Certified™ requirement for Featured™.

---

## Browse Modes

| Mode | Ranking emphasis |
|------|------------------|
| **For You** | Taste match dominant |
| **Studio Originals™** | Official catalog · industry filter |
| **Studio Certified™** | Certification + satisfaction |
| **Featured Collection™** | Editorial curation |
| **Community™** | Install count + taste · certification optional |
| **By Industry** | Industry envelope + taste |
| **By Creator** | Creator portfolio reputation |

Default landing: **For You** after onboarding.

---

## Taste Match Integration

Taste match score (0–100%) influences **For You** ranking heavily:

| Score band | Presentation |
|------------|----------------|
| 90–100% | *"97% Taste Match"* · top placement |
| 75–89% | *"Strong match"* · recommended row |
| 60–74% | Browse available · not pushed |
| Below 60% | Hidden from For You · searchable |

**Detail:** [taste-driven-recommendations.md](./taste-driven-recommendations.md)

---

## Featured Collection™ Curation

Editorial team (Studio OS) selects Featured™ from Studio Certified™ pool:

| Curation goal | Method |
|---------------|--------|
| Showcase excellence | Walk-through review |
| Genre balance | Rotate industries |
| Creator diversity | Spotlight emerging architects |
| Platform narrative | Align with launches · seasons |

Featured is **prestigious** — limited slots per season.

---

## Creator Reputation Score

Aggregated from:

| Input | Effect |
|-------|--------|
| Certified listing count | Positive |
| Average install satisfaction | Positive |
| Decertification history | Negative |
| Revision responsiveness | Positive |
| Accurate previews | Positive |
| Dispute resolution | Negative if poor |

Reputation affects Community™ sort — not certification bypass.

---

## Anti-Gaming Rules

| Manipulation | Prevention |
|--------------|------------|
| Fake install inflation | Verified install events only |
| Review bombing | Founder-verified ratings |
| Misleading preview | Decertification · ranking penalty |
| Keyword stuffing | Environment DNA™ semantic review |
| Asset spam listings | Package-type gate — HQ only |

---

## Search & Filter

Founders search by **place language**:

| Search intent | Maps to |
|---------------|---------|
| *"luxury editorial creative studio"* | Genre · tags · Environment DNA™ |
| *"minimal tech innovation lab"* | Studio Original™ · Certified tags |
| *"law firm war room"* | Industry envelope |
| *"creator loft"* | Product type |

Not: *"marble texture 4k"* — asset language rejected.

---

## Ranking vs Monetization

| Principle | Law |
|-----------|-----|
| Quality tiers gate visibility ceiling | Community™ cannot buy Certified™ |
| Featured requires Certified™ | No pay-to-Featured without quality |
| Taste match is personal | Not sold to creators |
| Studio Originals™ always discoverable | Platform obligation |

Commerce layers sit **beside** ranking — never replace quality signals.

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Sort by price only | Commodity marketplace |
| Popularity-only ranking | Ignores taste + quality |
| Asset search results | Wrong product class |
| Uncertified Featured™ | Trust collapse |

---

## Relationship to Canon

| System | Role |
|--------|------|
| [Quality Certification™](./quality-certification.md) | Tier gates |
| [Taste-Driven Recommendations™](./taste-driven-recommendations.md) | Personal scoring |
| [Creator Economy™](./creator-economy.md) | Reputation |

---

## Implementation Status

**Docs only.** Ranking spec — no search UI this sprint.
