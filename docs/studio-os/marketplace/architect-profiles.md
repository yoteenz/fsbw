# Architect Profiles™

**Luxury design firm — not an online seller account**

**Version:** 1.0.0  
**Status:** Canonical profile & portfolio spec (docs only)  
**Parent:** [Studio Architects™](./studio-architects.md)

---

## Purpose

Define the **Architect Profile™** and **Architect Portfolio™** — how Studio Architects™ present themselves and how individual Headquarters become design case studies.

**No profile UI this sprint** — specification only.

---

## Architect Profile™

Every Studio Architect™ eventually has a **public profile**.

Everything should feel like a **luxury design firm** — not an online seller account.

### Profile Fields

| Field | Description |
|-------|-------------|
| **Portrait** | Professional presence — architect as author |
| **Biography** | Origin · philosophy · career narrative |
| **Design Philosophy** | Written manifesto — materials · light · space |
| **Specialties** | Editorial · luxury · minimal tech · hospitality · etc. |
| **Portfolio** | Curated Headquarters case studies |
| **Published Headquarters™** | Complete listing with tiers |
| **Studio Certified™ status** | Badge · date · collection eligibility |
| **Downloads** | Total install count (aggregate) |
| **Installs** | Active deployments |
| **Followers** | Founder follow count |
| **Collections** | Architect Collections™ published |
| **Awards** | Platform · community recognition |
| **Years Active** | Tenure on Studio OS |
| **Architect Level™** | Emerging → Legendary |

**Detail:** [architect-rankings.md](./architect-rankings.md)

---

## Profile Tone

| Seller account (forbidden) | Design firm (required) |
|----------------------------|------------------------|
| "12 products" | "12 published headquarters" |
| "Buy now" | "Explore portfolio" |
| Star rating only | Case study + reviews |
| Thumbnail grid | Walkthrough-first |
| Username | **Studio Architect™** name |

---

## Architect Portfolio™

Each published Headquarters™ in the portfolio is a **design case study** — not a product card.

### Headquarters Case Study Fields

| Section | Contents |
|---------|----------|
| **Overview** | One-paragraph architectural intent |
| **Story** | Why this headquarters exists · design narrative |
| **Screenshots** | Key sightlines — arrival · hero zones |
| **Walkthrough** | Guided path — Arrival Sequence™ preview |
| **Architecture** | Envelope · scale · circulation |
| **Mood** | Primary emotion · atmosphere |
| **Materials** | Surface vocabulary · craft |
| **Lighting** | Key · fill · ceremony |
| **Company Types** | Industries · modes best served |
| **Recommended Modes™** | Entrepreneur · Creator · Operator fit |
| **Founder Taste Matches™** | Taste vectors aligned |
| **Version History** | Evolution · renovations · lineage |
| **Reviews** | Founder experience testimonials |
| **Awards** | Certified · Featured · community |

The Headquarters itself becomes the **case study**.

---

## Example Profile Structure

```
KATEENA ARMSTRONG™
Studio Certified™ · Master Architect™

Design Philosophy
"Luxury editorial architecture for founders who build beauty brands."

Specialties
Editorial Headquarters™ · Luxury Living Sets™ · Beauty Brand Worlds™

Portfolio (case studies)
├── The Black Atelier™ — Creative Studio case study
├── Editorial Loft™ — Media headquarters case study
└── Luxury Reception™ — Arrival experience case study

Collections
Editorial Collection™ · Luxury Marble Collection™

Followers · Installs · Years Active · Awards
```

---

## Follow Architects™

Founders **follow** Studio Architects™ from profile.

| Follower receives | Trigger |
|-------------------|---------|
| New Headquarters launch | Publish event |
| New Living Set™ | Department release |
| Major renovation | Collection update |
| Studio Certified™ achieved | Milestone |
| Seasonal collection | Limited release |
| Collection expansion | New bundle |

Follow is **place-author subscription** — not generic creator alerts.

---

## Privacy & Identity

| Rule | Law |
|------|-----|
| Public profile | Opt-in for Community™ publishing |
| Private™ work | Hidden until published |
| Team attribution | Co-architect credits on case study |
| Enterprise architects | Optional org-branded profile |

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Seller dashboard aesthetic | Breaks design firm tone |
| Case study without walkthrough | Cannot feel the place |
| Missing Design Philosophy | Profile feels transactional |
| Download count as only metric | Ignores craft |

---

## Relationship to Canon

| System | Role |
|--------|------|
| [Architect Rankings™](./architect-rankings.md) | Architect Level™ on profile |
| [Architect Certification™](./architect-certification.md) | Studio Certified™ badge |
| [Architect Collections™](./architect-collections.md) | Collection section |
| [Headquarters Packages™](./headquarters-packages.md) | Install payload behind case study |

---

## Implementation Status

**Docs only.** Profile spec — no profile pages this sprint.
