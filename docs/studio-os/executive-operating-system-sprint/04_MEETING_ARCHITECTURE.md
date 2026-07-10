# Meeting Architecture™

**Status:** Canonical meeting design — P0 Executive OS Sprint  
**Scope:** How meetings feel real inside Studio World™

---

## Meeting Philosophy

> **Meetings replace prompting.**

A meeting in Studio World™ is not a video call, not a chat thread, not a modal. It is a **physical gathering in a prepared room** where specialists present evidence, debate discipline-specific positions, and the founder makes decisions.

The founder walks into an **active conversation** — never an empty chat.

---

## Meeting vs. Prompt

| Prompt interaction | Meeting interaction |
|--------------------|---------------------|
| Founder types request | Founder walks to prepared room |
| AI generates output | Specialists present prepared evidence |
| Single response | Multidisciplinary debate |
| Stateless | References meeting history |
| "Done" | Recorded outcome · follow-up scheduled |
| Founder initiates | Organization prepares · founder joins |

---

## Meeting Lifecycle

```
1. TRIGGER
   Department milestone · calendar schedule · proactive intelligence
        ↓
2. SCHEDULING
   Executive Calendar™ entry · room assigned · participants notified
        ↓
3. PREPARATION (before founder)
   Specialists gather · materials mounted · agenda placed · debate begins
        ↓
4. READY STATE
   preparationStatus: ready · founder notified
        ↓
5. FOUNDER ARRIVAL
   Short transition · walk into active room
        ↓
6. BRIEFING
   Orb or lead specialist frames agenda · expected decisions
        ↓
7. PRESENTATION
   Evidence shown · concepts mounted · samples arranged
        ↓
8. DEBATE
   Specialists advocate · respectful disagreement visible
        ↓
9. FOUNDER DIRECTION
   Founder decides · points · verbal direction
        ↓
10. OUTCOME RECORDING
    Decision chronicle · canon/reject/sbranch · follow-ups
        ↓
11. REMNANTS
    Meeting artifacts persist on table · boards · shelves
        ↓
12. FOLLOW-UP SCHEDULING
    Next gates on calendar · transit artifacts dispatched
```

---

## Room Preparation Standard

When founder enters, the room must show:

| Element | State |
|---------|-------|
| **Presentation screens** | Content loaded · cycling if appropriate |
| **Moodboards** | Pinned · annotated · comparison-ready |
| **Concepts** | Mounted · A/B/C layout if decision meeting |
| **Lighting studies** | Playing on monitors |
| **Prototype assets** | Arranged on table · tactile-accessible |
| **Agenda** | Physical document on table |
| **Specialists** | Present at stations · mid-discussion |
| **Prior meeting refs** | Previous decisions visible on side board |
| **Seating** | Founder chair positioned · not empty auditorium |

**Minimum preparation time:** Organization works during `preparation` window — founder sees evidence of prep if arriving early, never emptiness.

---

## Meeting Room Types

| Meeting type | Room | Layout |
|--------------|------|--------|
| **Creative Direction Review** | Creative Review Theater | Projection wall · debate table · concept boards |
| **Brand Strategy Review** | Brand Strategy Boardroom | Positioning maps · competitive boards |
| **Art Direction Review** | Art Direction Salon | Comparison wall · reference clusters |
| **Packaging Approval** | Packaging Lab table | Material samples · dielines · shelf mockup |
| **Motion Graphics Review** | Motion Screening Room | Cinema screen · storyboard wall |
| **Photography Selection** | Photography Studio™ | Contact sheets · lighting references |
| **Campaign Readiness** | Campaign War Room | Channel boards · launch timeline |
| **Production Readiness** | Warehouse Quality Theater | Deliverables · compliance evidence |
| **Founder Vision Session** | Founder Boardroom™ | Strategic documents · long-horizon boards |
| **Morning Executive Briefing** | Mission Control™ / Grand Atrium™ | Holographic overview · decision queue |
| **Arbitration Session** | Founder Boardroom™ | Split boards · specialist position summaries |

---

## Meeting Anatomy

Every meeting follows consistent anatomy:

### 1 — Frame (2 minutes)

Orb or lead specialist states:
- Why we're here
- What was prepared
- What decisions are expected
- What previous meetings inform this one

### 2 — Present (5–15 minutes)

Lead specialist walks evidence:
- Concepts · boards · samples · reels
- Physical walk if appropriate (Walk the Room™)

### 3 — Debate (5–10 minutes)

Specialists advocate positions:
- Visible disagreement · sticky notes · vocal exchange
- Each speaks from discipline · not consensus

### 4 — Direct (founder-paced)

Founder:
- Asks clarifying questions
- Points at specific evidence
- States decision or requests iteration

### 5 — Record (automatic + visible)

Outcome physicalizes:
- Approval → vault · canon wall
- Rejection → red-tag shelf
- Branch → sandbox spawn
- Defer → calendar reschedule
- Iterate → revision queue with spec

### 6 — Close

Orb summarizes:
- Decision made
- Follow-ups scheduled
- Next gate identified

---

## Active Conversation Standard

When founder enters mid-preparation or at ready state:

| Active signal | Example |
|---------------|---------|
| **Vocal ambient** | "...but the audience skews younger than this concept assumes" |
| **Sticky note debate** | Brand Strategist note vs. Creative Director note on same board |
| **Partial arrangement** | Boards being positioned · last samples arriving |
| **Monitor activity** | Reel playing · lighting test cycling |
| **Specialist movement** | Art Director at wall · Research Concierge at shelf |

Founder interrupts — does not initiate — the conversation.

---

## Meeting Participants

| Role | Meeting behavior |
|------|------------------|
| **Studio Orb™** | Frame · moderate · record · never decide |
| **Lead specialist** | Present evidence · primary advocate |
| **Supporting specialists** | Debate · annotate · discipline advocacy |
| **Founder** | Direct · decide · approve/reject/branch |
| **Founder Memory Concierge™** | Capture rationale · chronicle |

Participant assembly is **meeting-type-specific** — not all specialists attend every meeting.

---

## Meeting Outcomes

| Outcome | Organizational response |
|---------|------------------------|
| **Approved** | Canon update · vault · production signal |
| **Rejected** | Archive shelf · taste learning · alternative request |
| **Revision requested** | Spec pinned · specialist queue · follow-up scheduled |
| **Branched** | Sandbox fork · parallel exploration scheduled |
| **Deferred** | Rescheduled · evidence gap identified |
| **Escalated** | Arbitration session scheduled · positions summarized |

Every outcome generates `followUpActions[]` on calendar.

---

## Meeting Chronicle

Each meeting produces permanent chronicle entry:

| Chronicle field | Content |
|-----------------|--------|
| meetingId | Calendar link |
| timestamp | When conducted |
| participants | Who attended |
| evidenceReviewed | Artifact references |
| specialistPositions | Who advocated what |
| founderDecision | What was decided |
| rationale | Founder words · Memory Concierge capture |
| priorRefs | Previous meetings referenced |
| followUps | Scheduled next actions |

Chronicle is **searchable** · **referenced by future meetings** · **visible in Archives**.

---

## Meeting Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Empty room on join | No preparation |
| Chat bubble interface | Not a meeting |
| Instant generation on enter | Prompt, not review |
| Unanimous agreement always | No healthy tension |
| No outcome recorded | Stateless |
| No follow-up | Momentum dies |
| Founder presents to AI | Role inversion |
| Meeting without agenda | Unfocused |
| Meeting without expected decision | Waste of executive time |

---

## Closing

A meeting in Studio World™ should feel like walking into a conference room at Pixar where your team has been debating for an hour — boards up, samples out, strong opinions on the table — and they're ready for your call.

That is the Meeting Architecture™ standard.
