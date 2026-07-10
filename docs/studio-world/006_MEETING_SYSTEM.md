# 006 — Meeting System™

**Status:** Canonical — Part 1 of Studio World Bible  
**Scope:** Every meeting type in Studio World™

---

## Meeting System Thesis

Meetings are the **primary interface** between founder and organization. Every meeting has a room, preparation, participants, evidence, debate, founder decision, chronicle entry, and follow-ups.

Prompting is what happens when the meeting system fails.

---

## Universal Meeting Schema

Every meeting type specifies:

| Field | Required |
|-------|----------|
| **Meeting ID** | Canonical type identifier |
| **Attendees** | Required · optional · excluded roles |
| **Agenda** | Structured topics · sequence |
| **Presentation format** | Boards · reels · samples · walkthrough |
| **Decision flow** | Frame → present → debate → direct → record |
| **Approval outcomes** | Approve · reject · revise · branch · defer |
| **Required evidence** | What must be mounted before `ready` |
| **Follow-up tasks** | Organizational actions post-meeting |
| **Calendar integration** | Origin department · scheduling rules |
| **Meeting history** | Chronicle refs · prior session links |
| **Replay capability** | Chronicle playback · evidence reconstruction |

---

## Meeting Lifecycle

```
TRIGGER → SCHEDULE → PREPARE → READY → ARRIVE → CONDUCT → RECORD → FOLLOW-UP
```

**Law:** Founder cannot enter until `preparationStatus: ready`.

---

## 1 — Morning Executive Briefing™

| Field | Detail |
|-------|--------|
| **Attendees** | Studio Orb™ (presents) · Founder (receives) · all departments (summarized, not present) |
| **Agenda** | Overnight summary · decision queue · calendar · risks · proactive requests · priority recommendation |
| **Presentation format** | Holographic projection at Grand Atrium™ / Mission Control™ |
| **Decision flow** | Orient → prioritize → route founder to first destination |
| **Approval outcomes** | None — briefing only · may spawn immediate meeting attendance |
| **Required evidence** | Department overnight reports · queue state · calendar ready-list |
| **Follow-up tasks** | Founder transit to first meeting · Orb context update |
| **Calendar integration** | Daily recurring · Executive Office origin · first on arrival |
| **Meeting history** | References yesterday's outstanding follow-ups |
| **Replay capability** | Briefing chronicle scroll · prior morning comparison |

---

## 2 — Creative Direction Review

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Creative Director™ · Art Director™ · Studio Orb™ · Founder · **Optional:** Brand Strategist™ · Motion Director™ · **Excluded:** Production Director (feasibility separate) |
| **Agenda** | Brief status · concept presentation · specialist debate · direction decision |
| **Presentation format** | A/B/C boards mounted · Story Table™ prototypes · Mood Wall context |
| **Decision flow** | Frame → walk concepts → debate → founder selects/rejects/branches |
| **Approval outcomes** | Select concept · reject all · branch exploration · request revision · defer |
| **Required evidence** | Minimum 2 concepts mounted · brief on table · prior review refs |
| **Follow-up tasks** | Direction lock ceremony OR sandbox spawn OR revision queue |
| **Calendar integration** | Origin: Creative Direction Studio™ · weekly cadence |
| **Meeting history** | References all prior Creative Direction Reviews for project |
| **Replay capability** | Chronicle + board positions at time of decision |

---

## 3 — Brand Strategy Review

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Brand Strategist™ · Brand Concierge™ · Founder · Orb · **Optional:** Marketing Director™ · Creative Director™ |
| **Agenda** | Positioning presentation · audience analysis · competitive landscape · genome alignment |
| **Presentation format** | Positioning maps · competitive matrices · audience boards |
| **Decision flow** | Present positioning → debate audience fit → founder approves positioning |
| **Approval outcomes** | Approve positioning · revise · defer · genome override (founder explicit) |
| **Required evidence** | Positioning board · competitive intel · genome comparison overlay |
| **Follow-up tasks** | Update brief wall · signal Creative Direction · Marketing alignment |
| **Calendar integration** | Origin: Brand Strategy Office™ |
| **Meeting history** | Prior positioning decisions · drift history |
| **Replay capability** | Chronicle + positioning board state |

---

## 4 — Packaging Review

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Packaging Designer™ · Material Concierge™ · Founder · Orb · **Optional:** Industrial Designer™ · Brand Strategist™ |
| **Agenda** | Material presentation · structural review · shelf presence · tactile evaluation |
| **Presentation format** | Material table · dielines · shelf mockups · tactile samples |
| **Decision flow** | Tactile walkthrough → material debate → founder approves/revises |
| **Approval outcomes** | Approve packaging · reject material · structural revision · defer |
| **Required evidence** | Physical samples · dieline · shelf mockup · material board |
| **Follow-up tasks** | Production handoff · Foundry spec · revision queue |
| **Calendar integration** | Origin: Packaging Lab™ · gate-triggered |
| **Meeting history** | Prior packaging attempts · rejection shelf refs |
| **Replay capability** | Chronicle + sample manifest |

---

## 5 — Motion Review

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Motion Director™ · Art Director™ · Founder · Orb · **Optional:** Creative Technologist™ · Production Director™ |
| **Agenda** | Reel screening · pacing analysis · scale feasibility · storyboard alignment |
| **Presentation format** | Cinema screen · storyboard wall · timing charts |
| **Decision flow** | Screen → pacing debate → scale check → founder approves/revises |
| **Approval outcomes** | Approve motion · revise pacing · animation profile change · defer |
| **Required evidence** | Motion reel · storyboard · timing chart · channel scale matrix |
| **Follow-up tasks** | Motion spec lock · Foundry queue · revision storyboard |
| **Calendar integration** | Origin: Motion Graphics Theater™ |
| **Meeting history** | Prior motion approvals · pacing lineage |
| **Replay capability** | Chronicle + reel timestamp markers |

---

## 6 — Product Review

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Industrial Designer™ · UX Lead™ · Experience Architect™ · Founder · Orb · **Optional:** Packaging Designer™ · Production Director™ |
| **Agenda** | Form presentation · ergonomics · interaction flow · manufacture feasibility |
| **Presentation format** | Prototypes · CAD · flow diagrams · journey overlay |
| **Decision flow** | Form walkthrough → UX flow review → feasibility check → founder decides |
| **Approval outcomes** | Approve form · revise · branch form exploration · defer |
| **Required evidence** | Prototype or CAD · journey map · feasibility note |
| **Follow-up tasks** | Form spec → Packaging · Production · UX refinement queue |
| **Calendar integration** | Origin: Product Design Workshop™ |
| **Meeting history** | Form evolution versions |
| **Replay capability** | Chronicle + prototype manifest |

---

## 7 — Narrative Review

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Narrative Director™ · Brand Strategist™ · Founder · Orb · **Optional:** Creative Director™ · Marketing Director™ |
| **Agenda** | Story architecture · voice consistency · message hierarchy · tone alignment |
| **Presentation format** | Story boards · voice guides · messaging matrix |
| **Decision flow** | Story presentation → voice debate → founder locks narrative direction |
| **Approval outcomes** | Approve narrative · revise voice · branch story · defer |
| **Required evidence** | Story architecture · voice samples · message matrix |
| **Follow-up tasks** | Narrative spec → Motion · Marketing · Production copy |
| **Calendar integration** | Origin: Narrative Intelligence™ |
| **Meeting history** | Voice evolution · story branch lineage |
| **Replay capability** | Chronicle + storyboard state |

---

## 8 — Photography Selection

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Photographer™ · Art Director™ · Founder · Orb · **Optional:** Creative Director™ |
| **Agenda** | Contact sheet review · lighting assessment · composition · shot list approval |
| **Presentation format** | Contact sheets on light table · lighting reference reels |
| **Decision flow** | Sheet review → composition debate → founder selects shots |
| **Approval outcomes** | Select shots · reshoot request · lighting revision · defer |
| **Required evidence** | Contact sheets · shot list · lighting tests |
| **Follow-up tasks** | Shot list lock · retouch queue · Asset Registry |
| **Calendar integration** | Origin: Photography Studio™ |
| **Meeting history** | Prior shoot selections |
| **Replay capability** | Chronicle + selected frame markers |

---

## 9 — Production Readiness Review

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Production Director™ · QA Inspector™ · Founder · Orb · **Optional:** Creative Director™ · Marketing Director™ · Legal Counsel AI™ |
| **Agenda** | Deliverable presentation · quality evidence · compliance · timeline · authorization request |
| **Presentation format** | Quality Theater · deliverable table · compliance checklist |
| **Decision flow** | Evidence review → quality debate → founder authorizes or rejects |
| **Approval outcomes** | Authorize production · authorize distribution · rework · defer |
| **Required evidence** | Production package · QA report · direction alignment confirmation |
| **Follow-up tasks** | Warehouse activation · Distribution Dock · rework queue |
| **Calendar integration** | Origin: Production Floor · gate-triggered |
| **Meeting history** | Prior production authorizations · quality patterns |
| **Replay capability** | Chronicle + deliverable manifest |

---

## 10 — Executive Approval

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Founder · Orb · relevant department lead · **Optional:** Legal Counsel AI™ |
| **Agenda** | Final gate presentation · risk summary · authorization |
| **Presentation format** | Founder Boardroom™ · executive table · summary boards |
| **Decision flow** | Summary → final questions → founder sign-off |
| **Approval outcomes** | Approve · reject · conditional approve · defer |
| **Required evidence** | Gate-specific package · legal clearance if material |
| **Follow-up tasks** | Canon vault · production signal · calendar advance |
| **Calendar integration** | Origin: Executive Office™ · escalated gates |
| **Meeting history** | Full project chronicle available |
| **Replay capability** | Full chronicle replay |

---

## 11 — Founder Arbitration Session

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Founder · Orb · conflicting specialists · **Optional:** Creative Director™ as synthesizer |
| **Agenda** | Position summary · evidence comparison · founder resolution |
| **Presentation format** | Split boards · position summary tablets · evidence side-by-side |
| **Decision flow** | Orb summarizes positions → founder questions → founder resolves |
| **Approval outcomes** | Founder ruling · hybrid direction · defer for more evidence |
| **Required evidence** | Both positions documented · cross-review notes |
| **Follow-up tasks** | Decision cascade to all departments · chronicle · taste signal |
| **Calendar integration** | Origin: organizational intelligence · proactive trigger |
| **Meeting history** | Prior disagreements on same topic |
| **Replay capability** | Position replay + founder ruling |

---

## 12 — Founder Vision Session

| Field | Detail |
|-------|--------|
| **Attendees** | **Required:** Founder · Orb · Creative Director™ · Brand Strategist™ · **Optional:** all Tier 1 summoned |
| **Agenda** | Strategic reflection · long-horizon direction · investment priorities |
| **Presentation format** | Founder Boardroom™ · strategic boards · legacy timeline |
| **Decision flow** | Reflect → aspire → align → founder sets strategic direction |
| **Approval outcomes** | Strategic directive · new initiative · defer exploration |
| **Required evidence** | Year-to-date chronicle · milestone exhibits |
| **Follow-up tasks** | Calendar restructure · department priority shift · Expedition spawn |
| **Calendar integration** | Origin: Executive Office™ · monthly cadence |
| **Meeting history** | All prior vision sessions |
| **Replay capability** | Strategic chronicle arc |

---

## Chronicle & Replay System

### Chronicle Entry Schema

```
meetingId · timestamp · roomAddress · participants[]
agenda[] · evidenceReviewed[] · specialistPositions[]
founderDecision · rationale · priorMeetingRefs[]
followUpActions[] · physicalOutcomes[] (vault/shelf/branch)
```

### Replay Capability

| Replay mode | Experience |
|-------------|------------|
| **Chronicle scroll** | Text + position summary at Archives terminal |
| **Evidence reconstruction** | Boards remounted to decision-state positions |
| **Full replay** (future) | Ambient reconstruction of meeting atmosphere |

**Law:** Every meeting produces chronicle. No stateless sessions.

---

## Calendar Integration Rules

1. Every meeting originates from a department
2. Preparation window opens on schedule
3. `ready` state required before founder notification
4. Outcomes auto-schedule follow-ups
5. Proactive meetings require trigger evidence
6. Founder OS may defer timing — never remove entries

---

## Related Documents

- [003_DEPARTMENTS.md](./003_DEPARTMENTS.md) — Meeting origins
- [004_AI_SPECIALISTS.md](./004_AI_SPECIALISTS.md) — Attendees
- [005_FOUNDER_EXPERIENCE.md](./005_FOUNDER_EXPERIENCE.md) — Founder participation
- [007_WORLD_RULES.md](./007_WORLD_RULES.md) — Every proposal has a meeting
