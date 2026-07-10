# Organizational Memory Model™

**Status:** Canonical memory architecture — P0 Executive OS Sprint  
**Scope:** How the organization remembers · learns · accumulates wisdom

---

## Memory Thesis

> **The organization has memory. Nothing feels stateless.**

Departments remember. Meetings reference previous meetings. Design decisions have history. Rejected concepts remain archived. Lessons accumulate. The organization becomes **wiser over time**.

---

## Memory vs. Storage

| Organizational memory | Technical storage |
|----------------------|-------------------|
| Meeting references prior meeting | Chronicle graph query |
| Rejection shelf visible in room | Archive artifact records |
| Specialist recalls founder override | Taste Genome™ update |
| "We tried this before" in debate | Branch lineage lookup |
| Company feels wiser at year 3 | Accumulated chronicle + canon |

Memory must be **experienced** — not only stored.

---

## Four Memory Domains

### Domain 1 — Meeting Memory (Chronicle)

Every meeting produces a chronicle entry that future meetings reference.

```
Meeting Chronicle Graph
    ├── meetingId · timestamp · participants
    ├── evidenceReviewed[]
    ├── specialistPositions[] (who advocated what)
    ├── founderDecision
    ├── rationale
    ├── priorMeetingRefs[]  ← links to previous chronicles
    └── followUpActions[]   ← links to future calendar entries
```

**Experience:** Prior decisions visible on side board when entering new meeting. Orb frames: *"Last Creative Direction Review, you chose Concept B over A because of audience fit."*

### Domain 2 — Creative Memory (Canon & Archive)

| State | Physical expression | Memory role |
|-------|---------------------|-------------|
| **Canon** | Vault · approved walls | What the company is |
| **Active** | Boards · tables · sandboxes | What we're exploring now |
| **Rejected** | Red-tag shelves · face-down boards | What we tried and declined |
| **Branch** | Parallel sandbox boards | What we might become |
| **Superseded** | Version stacks | How we evolved |

**Experience:** Founder walks rejection shelf — sees three packaging directions tried last quarter. Informs today's decision.

### Domain 3 — Specialist Memory (Institutional Positions)

Specialists remember:
- Their advocacy history on this project
- Founder override patterns (via Taste Genome™)
- Domain-specific lessons (e.g., Brand Strategist remembers audience miss on Campaign X)
- Cross-meeting threads in their discipline

**Experience:** Brand Strategist opens meeting: *"Similar to the Q2 positioning debate — I want to flag audience risk again."*

### Domain 4 — Organizational Wisdom (Accumulated Learning)

Over time, the organization accumulates:

| Wisdom type | Source | Expression |
|-------------|--------|------------|
| **Decision patterns** | Taste Genome™ | Orb surfaces learned preferences |
| **Failure lessons** | Rejection archive | Risk flags in new reviews |
| **Success patterns** | Canon analysis | Recommendations weighted toward proven approaches |
| **Process efficiency** | Meeting chronicle | Shorter prep for recurring meeting types |
| **Market intelligence** | World Knowledge Engine™ | Competitive context in briefings |
| **Relationship memory** | Visitor chronicle · partner history | Context for collaborations |

**Experience:** At year two, meetings feel faster because the organization **knows** the founder — not because UI improved.

---

## Memory Layers

| Layer | Duration | Authority | Executive OS use |
|-------|----------|-----------|------------------|
| **Ephemeral** | Current moment | Runtime | Debate in progress |
| **Session** | Current visit | Session store | Camera · open notes |
| **Project** | Project lifecycle | Project Genome™ | Active direction · branches |
| **Company** | Company lifetime | Company Genome™ · Chronicle | Institutional memory |
| **Founder** | Cross-company | Founder Genome™ · Taste Genome™ | Personal decision patterns |
| **Platform** | Permanent | Knowledge Core™ | Canon law · standards |

---

## Memory Physicalization Rules

| Stored memory | Must be visible as |
|---------------|-------------------|
| Prior meeting decision | Side board · chronicle tablet · Orb reference |
| Rejection history | Archive shelf · red tags |
| Version evolution | Stacked proofs · numbered layers |
| Specialist position | Meeting sticky notes · preserved on table |
| Follow-up from last meeting | Transit artifact · calendar entry |
| Accumulated wisdom | Orb proactive framing · weighted presentations |

**Law:** Memory that cannot be encountered by walking the headquarters is incomplete.

---

## Meeting-to-Meeting Continuity

```
Meeting A (Creative Direction Review)
    → Decision: Concept B approved
    → Chronicle recorded
    → Canon updated
        ↓
Meeting B (Art Direction Review) — 3 days later
    → Side board shows Concept B as approved direction
    → Art Director: "Working within B's visual language…"
    → priorMeetingRefs: [Meeting A]
        ↓
Meeting C (Packaging Approval) — 1 week later
    → Packaging aligned to B · Art Direction standards
    → Brand Strategist: "Consistent with B's audience positioning from Review A"
    → priorMeetingRefs: [Meeting A, Meeting B]
```

No meeting exists in isolation.

---

## Rejection as Memory

Rejected concepts are **institutional memory assets**:

| Rejection data | Memory value |
|----------------|--------------|
| What was rejected | Prevents re-proposal without acknowledgment |
| Why founder rejected | Taste learning · future presentation calibration |
| Who advocated for it | Specialist calibration |
| What survived | Elements extracted to active branch |
| When rejected | Timeline context |

**Law:** Rejection is archival relocation — not deletion. Founder may revisit: *"Remember packaging direction C we killed in March? Let's look again."*

---

## Organizational Amnesia Anti-Patterns

| Anti-pattern | Memory failure |
|--------------|----------------|
| Meeting with no prior refs | Stateless |
| Rejection deleted | Lost lesson |
| Specialist resets each session | No institutional voice |
| Same debate repeated unknowingly | No chronicle |
| Founder re-explains preferences | Taste Genome™ not learning |
| Empty room despite project history | No physicalization |
| Calendar without chronicle links | No institutional thread |

---

## Integration with Platform Memory Systems

| System | Executive OS relationship |
|--------|--------------------------|
| [World Memory™](../world/world-memory.md) | Spatial persistence foundation |
| [World Graph™](../world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md) | Canonical civilization truth |
| [Knowledge Core™](../knowledge-core/ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md) | Approved organizational canon |
| [Founder Intelligence System™](../intelligence/) | Taste · founder · company genomes |
| [Memory Engine™](../memory-engine.md) | Operational recall · compounding |
| Meeting Chronicle (this sprint) | Executive decision thread |

Executive OS memory is the **experiential layer** atop platform memory — how founders **feel** the organization remembering.

---

## Closing

An organization without memory is a chatbot with furniture.

An organization with memory is a company that gets wiser every quarter — and lets the founder feel that wisdom every time they walk into a room.
