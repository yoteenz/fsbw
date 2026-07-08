# Validation Pipeline — Studio OS v1

**Stage:** 08 — Validation™  
**Engines:** [Studio Validation Loop™](../engine/validation-loop/README.md) · [Walk the Room™](../engine/walk-the-room/README.md) · [Critique Sessions™](../engine/critique-sessions/README.md)  
**Pilot:** Creative Direction Studio™

---

## Purpose

Holistic quality authority before Golden Department certification. Validation determines whether Creative Direction Studio™ **deserves to exist** as the reference implementation.

QA checks if something works. **Validation determines if something deserves to exist.**

---

## Validation Pipeline

```
Runtime ACTIVE (Stage 07)
         ↓
Self Review (automated Runtime QA)
         ↓
Walk the Room™ (spatial immersive review)
         ↓
Founder Critique Session (Creative Direction Review)
         ↓
Studio Intelligence™ Analysis
         ↓
AI Braintrust™ (multi-specialist debate)
         ↓
Company Genome Validation
         ↓
Experience Review (immersion · emotion · journey)
         ↓
Creative Review (art direction compliance)
         ↓
Performance & Accessibility Audit
         ↓
Interaction Quality Assessment
         ↓
Founder Final Review
         ↓
├── PASS → validationApprovalToken → Stage 09
└── FAIL → Revision scope → return to Stage 04–07
```

---

## Walk the Room™

**Primary immersive validation experience.**

| Element | CDS Implementation |
|---------|-------------------|
| Path | `markers-walk-room-cds` — 10 zone sequence |
| Presentation mode | Camera orbit · zone highlights |
| Critique anchors | Per-zone founder pause points |
| Session type | Creative Direction Review |
| Orb role | Moderator · context · no hard sell |

### Walk Sequence (CDS)

1. **Entry** — arrival ceremony · first impression
2. **Brief Wall** — creative intent readable?
3. **Mood Wall (hero)** — pin · cluster · compare · emotional impact
4. **Timeline** — branch · scrub · sandbox isolation
5. **Observatory** — genome visualization · company soul
6. **Reference Library** — inspiration browse · drop pipeline
7. **Orb Command** — concierge routing · creative commands
8. **Inspiration Drop** — paste · upload · reference injection
9. **Approval** — ceremony weight · founder gate
10. **Exit Discover** — handoff affordance to next department

**Pass criteria:** Founder reports *"I've entered the creative brain of my company."*

---

## Founder Critique

Structured [Critique Session](../engine/critique-sessions/README.md) — not a scorecard checklist.

| Element | Content |
|---------|---------|
| Session type | Creative Direction Review |
| Braintrust | Creative Director · Brand · Research specialists |
| Debate | Constructive disagreement encouraged |
| Founder authority | Creative Director retains final say |
| Outputs | Transcript · decisions · action items |

### Critique Questions (CDS)

- Does this feel like a **place**, not a page?
- Is the mood wall the **hero** it should be?
- Can I **branch** creative direction without losing context?
- Do concierges **support** without taking over?
- Does genome adaptation change **soul** without breaking layout?
- Would I **approve** creative direction from this room?

---

## Studio Intelligence™ Analysis

| Analysis | Output |
|----------|--------|
| Art direction compliance | Anti-SaaS law adherence score |
| Genome coherence | 7 industry preset spot-check |
| Interaction completeness | Manifest vs runtime binding audit |
| Narrative flow | Arrival → work → approval → exit journey |
| Orb register | Matches Founder Journey phase |

---

## AI Braintrust™

Multi-specialist review per [Validation Loop](../engine/validation-loop/README.md):

| Specialist | Focus |
|------------|-------|
| Creative Director AI | Mood · brief · hero impact |
| Brand AI | Genome · tone · things-we-never-do |
| Research AI | Reference pipeline · inspiration depth |
| Experience AI | Immersion · emotion · ceremony |
| Technical AI | Performance · assembly integrity |

Braintrust produces **recommendations**, not approvals. Founder decides.

---

## Validation Dimensions

### Performance

| Check | Target |
|-------|--------|
| Boot time | < 8s to ACTIVE |
| Frame rate | ≥ 30fps mobile floor |
| Memory | ≤ 120 MB |
| Interaction latency | < 100ms |
| Asset load | Progressive · no blocking hero |

### Accessibility

| Check | Requirement |
|-------|-------------|
| Reduced motion | Ceremony · particles respect preference |
| Keyboard | Core verbs reachable (where applicable) |
| Touch | Mobile-first interaction targets |
| Audio | Ceremony optional · ambient adjustable |
| Readability | Glass panels legible at walk distance |

### Interaction Quality

| Check | Requirement |
|-------|-------------|
| Verb completeness | All manifest verbs functional |
| Ceremony integrity | Approval flows end-to-end |
| Branch isolation | Sandbox does not corrupt timeline |
| Orb routing | 3 concierges reachable · no dead ends |
| Inspiration pipeline | Drop · paste · upload all work |
| Chronicle | Founder notes append to session |

### Immersion

| Check | Requirement |
|-------|-------------|
| No SaaS chrome | Zero card grids · sidebars · kanban |
| Spatial navigation | Walk replaces tabs |
| Atmospheric coherence | Lighting · audio · particles unified |
| Hero moment | Mood wall delivers emotional peak |
| Exit affordance | Discover portal feels like journey continuation |

---

## Company Genome Validation

Test CDS against validation-criteria industry set:

| Industry Preset | Validation Focus |
|-----------------|------------------|
| Frontal Slayer | Editorial luxury · noir accents |
| NDXBook | Media command · crisp broadcast |
| Luxury Salon | Warm intimate · client consultation |
| Law Firm | Formal restrained · trustworthy |
| Restaurant | Hospitality warmth |
| Music Studio | Creative energy · matte accents |
| Construction HQ | Industrial professional |

**Rule:** Topology fixed · soul variable — same 35 assets, different genome expression.

---

## Studio Scorecard™ (Summary)

14 dimensions from Validation Loop — CDS must score ≥ 85 average:

| Dimension | CDS Weight |
|-----------|------------|
| Creative authority | High |
| Immersion | Critical |
| Genome adaptation | High |
| Interaction depth | High |
| Hero impact | Critical |
| Ceremony weight | High |
| AI collaboration | Medium |
| Performance | Medium |
| Accessibility | Medium |
| Reusability | Medium |
| Marketplace readiness | Low (v1) |
| Narrative coherence | High |
| Anti-SaaS compliance | Critical |
| Golden inheritance | Critical |

---

## Failure Classification

| Class | Return Stage | Example |
|-------|--------------|---------|
| Asset quality | 04 | Hero wall fails immersion |
| Assembly | 06 | Interaction wiring broken |
| Runtime | 07 | Orb routing failure |
| Performance | 06–07 | Over budget · optimize |
| Genome | 04 or 07 | Slot resolution failure |
| Experience | 01 or 08 | Creative direction mismatch |

---

## validationApprovalToken

Issued only when all gates pass:

```json
{
  "token": "validation-approval-pkg-creative-direction-golden-v1",
  "packageId": "pkg-creative-direction-golden-v1",
  "issuedAt": "ISO8601",
  "scorecardAverage": 92,
  "founderSigned": true,
  "walkTheRoomPassed": true,
  "braintrustSessionId": "critique-cds-golden-v1"
}
```

**Runtime permanent install blocked without token.**

---

## Stage 08 Gate

**Validation Complete** when:

- [ ] Walk the Room™ full path passed
- [ ] Founder critique session complete
- [ ] Braintrust recommendations addressed or accepted
- [ ] Scorecard average ≥ 85
- [ ] All 10 validation-criteria from CDS Definition pass
- [ ] `validationApprovalToken` issued
- [ ] Revision items (if any) closed

---

_Validation Pipeline — deserve to exist before becoming Golden._
