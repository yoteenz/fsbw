# 17 — QA Checklist

**SDK Module:** `studio.department.sdk.v1.qa`  
**Status:** Approval gate — mandatory before any department release  
**Philosophy:** A department is not done when it is built. It is done when it feels alive.

---

## How to Use This Checklist

1. Complete all items in every section.
2. Mark each item: **PASS** · **FAIL** · **N/A** (with justification).
3. All items must be **PASS** or justified **N/A** for approval.
4. Any **FAIL** blocks release until resolved.
5. Reviewer signs off with date and name.

```yaml
QAReview:
  departmentId: string
  version: semver
  reviewer: string
  date: datetime
  sections: QASectionResult[]
  overallResult: enum     # approved | rejected | conditional
  notes: string
```

---

## Section 1: Aliveness

> Does it feel alive?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 1.1 | Ambient audio plays on entry | Room tone or intentional silence — not dead quiet |
| 1.2 | Mood Wall breathes | Subtle motion visible on hero surface |
| 1.3 | Lighting responds to focus | Active zone brightens; inactive zones dim |
| 1.4 | Particles present | Ambient particles visible (or intentionally absent per Genome) |
| 1.5 | Orb acknowledges arrival | Orb pulse or greeting on department entry |
| 1.6 | Objects respond to hover | Hover states animate on interactive objects |
| 1.7 | Environmental audio on interaction | Glass tap, pin stick, or material sounds on verbs |
| 1.8 | AI employees visible | At least one AI presence acknowledged on entry |
| 1.9 | No static screenshots | All surfaces show live or dynamic content |
| 1.10 | Time feels present | Timeline, schedule, or temporal element visible |

**Section gate:** ≥ 8/10 PASS (1.4 and 1.9 are mandatory PASS)

---

## Section 2: Placeness

> Does it feel like a place?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 2.1 | Floor plane visible | User perceives ground |
| 2.2 | Depth layers distinguishable | Foreground, midground, background separable |
| 2.3 | Entry portal exists | Distinct entry point at spatial envelope edge |
| 2.4 | Exit portal exists | Distinct exit, separate from entry |
| 2.5 | Hero space establishes identity | Back wall communicates department character |
| 2.6 | Furniture at human scale | Work surfaces feel like real furniture |
| 2.7 | Spatial envelope bounded | Room feels contained — not infinite scroll |
| 2.8 | Not a dashboard | No card grids, no table layouts, no page structure |
| 2.9 | Not a form | No form fields as primary work surface |
| 2.10 | Windows or sky visible | Environmental context beyond walls |

**Section gate:** ≥ 9/10 PASS (2.8 and 2.9 are mandatory PASS)

---

## Section 3: Natural Navigation

> Can users navigate naturally?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 3.1 | Arrival orients user | Camera reveals department within 3s |
| 3.2 | Primary zone discoverable | User finds main work area without instruction |
| 3.3 | Orb always accessible | Orb visible from all standard camera positions |
| 3.4 | Exit visible or one turn away | User can find exit without menu |
| 3.5 | Zone transitions smooth | Camera travels between zones — no hard cuts |
| 3.6 | World Map includes department | Department appears on HQ world map |
| 3.7 | Quick travel works | Can travel to and from via world map |
| 3.8 | Return path available | Can return to previous department |
| 3.9 | Command Dock lists department | Commands registered and discoverable |
| 3.10 | Breadcrumb accurate | Shows HQ → Building → Department |

**Section gate:** ≥ 9/10 PASS

---

## Section 4: AI Collaboration

> Can AI collaborate?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 4.1 | Multiple AI employees present | ≥ 2 specialists (excluding Orb) |
| 4.2 | AI respond to verbs | Relevant concierge reacts to user actions |
| 4.3 | AI collaborate visibly | Cross-concierge consultation shown to user |
| 4.4 | No AI auto-approves | Human must execute approve verb |
| 4.5 | Orb routes, not decides | Orb dispatches to specialists |
| 4.6 | AI personalities differ | Different roles have distinct communication |
| 4.7 | Escalation works | AI escalates to human or specialist on trigger |
| 4.8 | AI memory persists | Return visit shows AI remembers context |
| 4.9 | Genome adapts AI voice | Different Genome → different AI personality |
| 4.10 | AI never hidden | No silent AI decisions behind the scenes |

**Section gate:** ≥ 9/10 PASS (4.4 and 4.5 are mandatory PASS)

---

## Section 5: Genome Transformation

> Does Company Genome transform it?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 5.1 | No hardcoded colors | Automated scan finds zero hex/rgb in assets |
| 5.2 | No hardcoded fonts | Zero font declarations in configuration |
| 5.3 | No logos in assets | Zero logo/brand mark in asset files |
| 5.4 | Luxury Genome transform | Visually distinct from default |
| 5.5 | Professional Genome transform | Visually distinct from luxury |
| 5.6 | Operational Genome transform | Visually distinct from professional |
| 5.7 | Terminology adapts | Department labels change per Genome |
| 5.8 | AI voice adapts | AI personality changes per Genome |
| 5.9 | Audio adapts | Ambient character changes per Genome |
| 5.10 | Same topology across transforms | Layout identical; only expression changes |
| 5.11 | Genome refresh works | Live Genome update triggers crossfade |
| 5.12 | All mandatory hooks declared | 20+ domains hooked in genome-rules.json |

**Section gate:** ALL items PASS (this section has zero tolerance)

---

## Section 6: Modularity

> Is it modular?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 6.1 | No flattened scene | Zero combined GLB/FBX scene files |
| 6.2 | Environment independent | Can swap environment without touching furniture |
| 6.3 | Furniture independent | Can swap one furniture piece without others |
| 6.4 | Materials independent | Can swap material set without geometry reload |
| 6.5 | Lighting independent | Can swap lighting rig without geometry |
| 6.6 | Audio independent | Can swap audio without visual changes |
| 6.7 | All modules versioned | Every asset module has semver |
| 6.8 | All modules have fallback | Every module declares fallbackId |
| 6.9 | Interaction maps separate | Behavior in separate file from assets |
| 6.10 | Metadata drives assembly | Placement from metadata, not baked into geometry |

**Section gate:** ALL items PASS

---

## Section 7: Marketplace Readiness

> Is it marketplace-ready?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 7.1 | Package schema valid | manifest.json passes validation |
| 7.2 | All config files present | anatomy, layout, objects, interactions, AI, genome, deps |
| 7.3 | All asset categories present | 12+ categories in assets/ |
| 7.4 | Neutral preview renders | Hero thumbnail without branding |
| 7.5 | 3+ Genome transform previews | Different industry transforms shown |
| 7.6 | CHANGELOG present | Version history documented |
| 7.7 | LICENSE specified | License type declared |
| 7.8 | Dependencies declared | All deps in dependencies.json |
| 7.9 | SDK version compatible | Matches current SDK version |
| 7.10 | Package size ≤ 25 MB | Total package within budget |

**Section gate:** ≥ 9/10 PASS

---

## Section 8: Asset Independence

> Can assets be replaced independently?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 8.1 | Replace environment test | Swap environment → department still functions |
| 8.2 | Replace furniture test | Swap one furniture piece → layout intact |
| 8.3 | Replace material test | Swap material set → Genome injection still works |
| 8.4 | Replace audio test | Swap ambient audio → department still functional |
| 8.5 | Replace particle test | Swap or disable particles → no errors |
| 8.6 | Add new object test | Add object instance → loads and interacts |
| 8.7 | Remove optional object test | Remove optional object → department degrades gracefully |
| 8.8 | Version upgrade test | Upgrade one module version → no full reload needed |

**Section gate:** ≥ 7/8 PASS

---

## Section 9: Inheritance

> Can future departments inherit it?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 9.1 | Anatomy follows SDK schema | Validates against 01 schema |
| 9.2 | Spatial layout follows template | Uses stage/workshop/gallery template |
| 9.3 | Objects from library only | All objects use canonical class IDs from 03 |
| 9.4 | Verbs from catalog only | All verbs use canonical IDs from 04 |
| 9.5 | AI roles from registry only | All AI use canonical role IDs from 05 |
| 9.6 | Assets follow standard | All modules validate against 06 schema |
| 9.7 | Visual language compliant | Inherits from 07 — no custom visual rules |
| 9.8 | Motion profiles referenced | Uses canonical profile IDs from 08 |
| 9.9 | Audio categories correct | Uses canonical categories from 09 |
| 9.10 | Serves as reference | Could be used as template for new departments |

**Section gate:** ≥ 9/10 PASS

---

## Section 10: Performance

> Does it perform within budget?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 10.1 | Load time ≤ 5s | Time to interactive on broadband |
| 10.2 | Verb response ≤ 100ms | Local verb feedback timing |
| 10.3 | Frame rate ≥ 30fps | During normal interaction |
| 10.4 | Frame rate ≥ 24fps | During ceremony animations |
| 10.5 | Memory ≤ 150 MB | Per department session |
| 10.6 | Background unload | Memory releases on department background |
| 10.7 | Fallback load ≤ 1s | Fallback asset loads quickly |
| 10.8 | Reduced motion works | All animations respect preference |
| 10.9 | No memory leaks | 10 depart/arrive cycles — memory stable |
| 10.10 | Cache effective | Second load ≤ 2s (cached) |

**Section gate:** ≥ 8/10 PASS

---

## Section 11: Accessibility

> Is it accessible?

| # | Check | Pass Criteria |
|---|-------|---------------|
| 11.1 | Keyboard navigation | Tab between objects; Enter activates |
| 11.2 | Screen reader support | Objects and verbs announced |
| 11.3 | Reduced motion | Instant transitions when preferred |
| 11.4 | High contrast | Verb feedback visible without color alone |
| 11.5 | Voice alternative | All verbs available via Orb speech |
| 11.6 | Form fallbacks | Structured input when verb inaccessible |
| 11.7 | Focus indicators | Clear focus state on all interactive objects |
| 11.8 | No vestibular triggers | Camera travel below 2.0 units/s |

**Section gate:** ≥ 7/8 PASS

---

## Approval Gate

### Automatic Rejection

Any of these conditions = **automatic rejection**:

- Hardcoded brand colors in any asset (5.1 FAIL)
- Flattened scene file in package (6.1 FAIL)
- Form as primary workflow (2.9 FAIL)
- Dashboard layout (2.8 FAIL)
- AI auto-approves without human verb (4.4 FAIL)
- Missing Genome hooks (5.12 FAIL)
- Missing Orb Pedestal
- Missing exit portal

### Approval Levels

| Result | Criteria |
|--------|----------|
| **Approved** | All section gates passed; zero automatic rejection triggers |
| **Conditional** | One section gate failed by 1 item — fix and re-review |
| **Rejected** | Any automatic rejection trigger or multiple section gate failures |

### Sign-Off

```yaml
Approval:
  departmentId: string
  version: semver
  reviewer: string
  date: datetime
  result: approved
  sectionsPassed: 11
  sectionsTotal: 11
  notes: string
```

---

## Quick Reference: The 10 Questions

The founder's 10-question gut check — if any answer is "no," the department is not ready:

| # | Question | Section |
|---|----------|---------|
| 1 | Does it feel **alive**? | 1 |
| 2 | Does it feel like a **place**? | 2 |
| 3 | Can users **navigate naturally**? | 3 |
| 4 | Can AI **collaborate**? | 4 |
| 5 | Does Company Genome **transform it**? | 5 |
| 6 | Is it **modular**? | 6 |
| 7 | Is it **marketplace-ready**? | 7 |
| 8 | Can assets be **replaced independently**? | 8 |
| 9 | Can future departments **inherit it**? | 9 |
| 10 | Does it **perform** within budget? | 10 |

**All 10 must be "yes" for approval.**

---

_Studio Department SDK™ — QA Checklist v1.0.0_
