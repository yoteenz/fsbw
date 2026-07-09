# Executive Headquarters™

**Project:** Studio OS  
**Program:** Studio OS Launch Stack™  
**Sprint:** Sprint 1  
**System:** Executive Headquarters™  
**Status:** Canonical architectural blueprint draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Depends on:** Genesis™, Canonical Object Registry™, Universal Interaction Engine™, Universal Decision Engine™, Studio OS Build Order™, Identity Engine™, Company Genome™, Workspace Framework™, Mission Engine™, Command Center™, Permissions Engine™  
**Constitutional posture:** Executive Headquarters™ is the founder's operating environment, not an admin dashboard. It is the flagship Studio OS experience where founders think, plan, build, decide, create, launch, learn, and operate companies.

---

## 0. Doctrine

Executive Headquarters™ is the first complete production-ready Studio OS experience.

It is the place where a founder should feel:

1. **Arrived** — entering a company command environment, not opening software.
2. **Accompanied** — Orb™ is present as executive intelligence, not a chatbot widget.
3. **Briefed** — Studio OS already understands the company context and today's priorities.
4. **Oriented** — Atlas™ explains where everything lives and how work connects.
5. **Empowered** — Command Center™ converts approved decisions into safe action.
6. **Calm** — the environment reduces cognitive load instead of exposing every feature.

### 0.1 Prime directive

```text
Executive Headquarters™ is the founder's headquarters.
Everything else in Studio OS eventually lives inside it.
```

The Headquarters is not an admin area, SaaS dashboard, collection of widgets, or reporting page. It is the spatial executive shell that contains rooms, wings, missions, departments, knowledge, commands, briefings, and creation environments.

### 0.2 Product promise

The minimum lovable Headquarters™ must make a founder immediately feel:

> "I never want to manage my business any other way."

This feeling comes from **clarity, presence, and actionability**, not feature count.

### 0.3 Launch Stack role

Executive Headquarters™ is Sprint 1 of the **Studio OS Launch Stack™** because it is the flagship experience founders will understand first. Its v1 implementation may use stable contracts, projections, and read-only adapters while upstream systems mature, but it must never claim source-of-truth ownership that belongs to other systems.

---

## 1. System definition

| Field | Definition |
|-------|------------|
| **Official Name™** | Executive Headquarters™ |
| **Purpose** | Founder/company operating environment where strategic work, decisions, missions, departments, company health, and AI guidance converge |
| **Responsibilities** | Present executive state; host core rooms; receive Orb briefings; navigate company operations; surface priorities; route commands; project company health; organize departments; provide deep work environments |
| **Objects owned** | Headquarters layout state, room registry/projections, arrival session, briefing projection, navigation composition, founder focus state, room readiness state |
| **Objects referenced** | Company, Organization, Identity, Mission, Command, Decision, Department, Knowledge Artifact, Genome, Role, Permission, Metric, Event |
| **Primary users** | Founder, executive team, department leads, AI workers |
| **Core philosophy** | A company should be operated from a living headquarters, not a disconnected dashboard |
| **Current build mode** | Flagship experience architecture; v1 shell may read from projections until upstream systems ship |

---

## 2. Boundaries

### 2.1 Headquarters owns experience composition

Executive Headquarters™ owns:

- Arrival sequence
- Room registry and hierarchy
- Room navigation and spatial composition
- Executive briefing projection
- Founder focus state
- Environment-level Orb placement
- Company health presentation
- Mission queue presentation
- Recommended action presentation
- Room readiness / locked-room state

### 2.2 Headquarters does not own system truth

| Truth | Owning system | Headquarters role |
|-------|---------------|-------------------|
| Company DNA, systems, flows, risks | **Company Genome™** | Projects genome into executive context |
| Identity, membership, actors | **Identity Engine™** | Consumes actor/company context |
| Authority, grants, policies | **Permissions Engine™** | Requests permission decisions |
| Commands and rollback | **Command Center™** | Hosts command interface; does not execute directly |
| Mission state | **Mission Engine™** | Displays mission queue and status |
| Knowledge truth | **Knowledge Core™** | Displays source-backed references |
| Structural map | **Atlas™ / World Graph™** | Renders navigation overlays |
| Analytics metrics | **Analytics™** | Displays health/trend projections |
| Automation execution | **Automation Engine™** | Routes approved work only |

### 2.3 Anti-duplication law

If Headquarters needs data from another system, it creates a **projection**, not a duplicate registry.

---

## 3. Experience principles

| Principle | Meaning in Headquarters |
|-----------|-------------------------|
| **Immersive** | Scrolling and navigation feel like moving through a real headquarters |
| **Elegant** | The environment feels premium, composed, and intentional |
| **Minimal** | One primary executive question at a time |
| **Luxurious** | White/marble/glass/crystal, generous space, calm hierarchy |
| **Calm** | No alert noise; urgency is curated |
| **Highly productive** | Every panel leads to a decision, mission, command, or room |
| **AI-first** | Orb is ambient and proactive, never intrusive |
| **Spatial** | Rooms and wings replace tabs and dashboard sections |
| **Context-aware** | Briefing adapts to founder, company, day, active missions, risk |
| **Founder-centered** | The environment protects founder attention and decision quality |

### 3.1 Rejected patterns

| Rejected | Canonical replacement |
|----------|----------------------|
| Admin dashboard | Founder Headquarters |
| Feature sidebar | Room / wing navigation |
| KPI wall | Executive briefing + company health story |
| Chatbot floating button | Orb as executive presence |
| Alert feed | Prioritized briefing |
| Module grid | Department Directory™ + Atlas™ |
| Everything visible | Progressive disclosure and locked future rooms |

---

## 4. Arrival sequence

The first seconds define the product.

### 4.1 Sequence

```text
Open Studio OS
  → Environment resolves founder + company context
  → Headquarters doors / atrium arrival
  → Orb greets founder by context, not generic salutation
  → Executive briefing appears
  → Today's priorities are distilled
  → Company health is summarized
  → Recommended actions are offered
  → Mission queue is staged
  → Department navigation opens
  → Founder chooses deep work room or command path
```

### 4.2 First impression

The founder should see:

1. A single cinematic **Executive Atrium™** hero.
2. Orb™ present with a short, relevant greeting.
3. Today's executive briefing in one calm paragraph.
4. Three to five priority cards, not a dashboard grid.
5. Company health as a living signal, not a spreadsheet.
6. One recommended action with clear reason and confidence.
7. A room map inviting movement.

### 4.3 Emotional arc

| Moment | Feeling |
|--------|---------|
| Arrival | "My company has a place." |
| Orb greeting | "It knows what matters today." |
| Briefing | "I understand the state of the business." |
| Priorities | "I know what deserves attention first." |
| Recommended actions | "I can move forward safely." |
| Room navigation | "Everything has a place." |
| Deep work | "I can focus." |

---

## 5. Founder opening flow

### 5.1 Required flow

```text
Arrival
  ↓
Orb greeting
  ↓
Executive briefing
  ↓
Today's priorities
  ↓
Company health
  ↓
Recommended actions
  ↓
Mission queue
  ↓
Department navigation
  ↓
Deep work
```

### 5.2 Detailed behavior

#### Arrival

- Resolve Identity Context™ and active company.
- Load company room profile, maturity, and active wings.
- Show a quiet living presence: date, company name, atmosphere, current focus.
- Do not ask setup questions unless required context is missing.

#### Orb greeting

Orb says what a great chief of staff would say:

- Acknowledge the founder and company.
- State the most important pattern of the day.
- Offer one immediate orientation.
- Never perform unsolicited execution.

Example posture:

> "Good morning. I reviewed the company pulse, open missions, and launch queue. The most important decision today is whether to prioritize client delivery or marketing preparation."

#### Executive briefing

Briefing must include:

- What changed since last session
- What requires founder attention
- What can wait
- Which departments are active
- Which recommendation Orb is prepared to explain

#### Today's priorities

Limit to **three** priority cards in MLH v1:

1. Critical decision
2. Active mission
3. Opportunity or risk

#### Company health

Show health as a composed signal:

- Overall company state
- Operational pulse
- Revenue/financial signal when available
- Knowledge confidence or readiness when available
- Risk notes

#### Recommended actions

Each recommendation includes:

- Action
- Reason
- Confidence
- Source systems
- Required permission / approval
- Primary room to continue

#### Mission queue

Mission queue is not a task list. It is the founder's operational runway:

- Active missions
- Blocked missions
- Awaiting approval
- Recently completed / learned

#### Department navigation

The founder sees wings and rooms as destinations. Locked future rooms should feel like planned expansion, not missing features.

#### Deep work

The environment routes the founder into one of:

- Founder Office™ for strategic thinking
- Command Center™ for approved action
- Content Studio™ for creation
- Knowledge Wing™ for learning/research
- Department room for operational review

---

## 6. Headquarters room hierarchy

### 6.1 Spatial model

```text
Executive Headquarters™
  ├── Executive Atrium™
  ├── Founder Office™
  ├── Mission Control™
  ├── Daily Briefing™
  ├── Command Center™
  ├── Content Studio™
  ├── Knowledge Wing™
  ├── Department Directory™
  ├── Department Headquarters
  │     ├── Marketing Headquarters™
  │     ├── Finance Headquarters™
  │     ├── Customer Experience Headquarters™
  │     ├── Operations Wing™
  │     └── Creative Direction Studio™
  ├── Research Wing™
  ├── Automation Lab™
  ├── Meeting Rooms™
  ├── Expansion Wings™
  └── Future Rooms™
```

### 6.2 Room taxonomy

| Room class | Purpose |
|------------|---------|
| **Core executive rooms** | Founder arrival, briefing, mission, command, strategic focus |
| **Creation rooms** | Content, creative direction, production-adjacent workflows |
| **Knowledge rooms** | Knowledge, research, learning, profession intelligence |
| **Department rooms** | Marketing, finance, customer experience, operations, future departments |
| **Expansion rooms** | Locked/unlocked future wings via Department Packs / Launch Stack |

---

## 7. Launch Stack v1 room scope

### 7.1 Minimum lovable Headquarters™ v1

Only include rooms necessary for the founder to feel the future of company management.

| Room | Launch Stack v1? | Why |
|------|------------------|-----|
| **Executive Atrium™** | Yes | First impression and spatial home |
| **Founder Office™** | Yes | Founder deep work and strategic decisions |
| **Mission Control™** | Yes | Operational runway and active missions |
| **Daily Briefing™** | Yes | Immediate clarity and AI-first value |
| **Command Center™** | Yes, guarded | Converts decisions into approved actions |
| **Department Directory™** | Yes | Shows company structure without bloat |
| **Knowledge Wing™** | Yes, lightweight | Source-backed references and operating knowledge |
| **Content Studio™** | Yes, focused | Creation is a flagship Studio OS differentiator |
| **Creative Direction Studio™** | Yes, focused | Founder-level creative command, not production sprawl |
| **Marketing Headquarters™** | Yes, projection | Launch/revenue planning visible early |
| **Operations Wing™** | Yes, projection | Core business execution view |
| **Customer Experience Headquarters™** | Yes, projection | Client/customer state is founder-relevant |
| **Finance Headquarters™** | Future | Needs deeper metrics/accounting contracts |
| **Research Wing™** | Future | Needs Knowledge Core / Research Engine maturity |
| **Automation Lab™** | Future locked | Unsafe before Command/Workflow/Permissions maturity |
| **Meeting Rooms™** | Future partial | Can show calendar preview, but full meeting OS later |
| **Expansion Wings™** | Future locked | Department Packs / marketplace later |
| **Future Rooms™** | Yes as locked preview | Communicates extensibility without feature bloat |

### 7.2 Minimum lovable v1 layout

```text
Executive Atrium
  → Daily Briefing strip
  → Priority trio
  → Company Health panel
  → Mission Queue
  → Room Map / Department Directory
  → Founder Office focus panel
```

Do not ship a long page with every room fully rendered. Ship a memorable arrival + room system.

---

## 8. Room definitions

### 8.1 Executive Atrium™

| Field | Definition |
|-------|------------|
| Purpose | Headquarters arrival, orientation, company presence |
| Responsibilities | Resolve context, display greeting, set atmosphere, route to briefing/rooms |
| Objects owned | Arrival session, atrium composition, active room selection |
| Dependencies | Identity Engine™, Workspace Framework™, Company Genome™ |
| Events | `Headquarters Opened™`, `Atrium Entered™`, `Room Selected™` |
| AI behavior | Orb greets and orients; no execution |
| Failure mode | Generic dashboard landing |

### 8.2 Founder Office™

| Field | Definition |
|-------|------------|
| Purpose | Strategic deep work room for decisions, reflection, priorities |
| Responsibilities | Protect focus, show decisions, draft plans, review recommendations |
| Objects owned | Founder focus session, strategy scratchpad projection |
| Dependencies | Decision Engine™, Identity Engine™, Company Genome™ |
| Events | `Founder Office Opened™`, `Strategic Note Drafted™`, `Decision Review Requested™` |
| AI behavior | Orb acts like executive chief of staff; summarizes and challenges gently |
| Failure mode | Notes app with no company context |

### 8.3 Mission Control™

| Field | Definition |
|-------|------------|
| Purpose | Operational runway: missions, blockers, approvals, outcomes |
| Responsibilities | Present mission queue, active blockers, approval needs, recent completions |
| Objects owned | Mission view projection only |
| Dependencies | Mission Engine™, Workflow Engine™, Company Registry™ |
| Events | `Mission Queue Viewed™`, `Mission Opened™`, `Blocker Highlighted™` |
| AI behavior | Prioritizes mission attention and explains tradeoffs |
| Failure mode | Generic task list |

### 8.4 Daily Briefing™

| Field | Definition |
|-------|------------|
| Purpose | Founder clarity at the start of every session |
| Responsibilities | Summarize company state, changes, risks, priorities, recommended action |
| Objects owned | Briefing projection and presentation state |
| Dependencies | Ambient Awareness™, Company Health Index™, Mission Engine™, Knowledge Core™ |
| Events | `Executive Briefing Generated™`, `Briefing Recommendation Opened™` |
| AI behavior | Proactive but concise; sources every claim |
| Failure mode | Untrusted AI summary or alert dump |

### 8.5 Command Center™

| Field | Definition |
|-------|------------|
| Purpose | Safe command intake, approval, routing, monitoring |
| Responsibilities | Host command console, approvals, command status, rollback visibility |
| Objects owned | Command room layout only |
| Dependencies | Command Center™, Permissions Engine™, Workflow Engine™, Event Bus™ |
| Events | `Command Room Opened™`, `Command Drafted™`, `Command Submitted For Approval™` |
| AI behavior | Converts intent into command draft; never executes without authorization |
| Failure mode | Unsafe shortcut actions |

### 8.6 Content Studio™

| Field | Definition |
|-------|------------|
| Purpose | Founder-level content planning and launch preparation |
| Responsibilities | Show active campaigns, content needs, creation queue, approved assets |
| Objects owned | Content room composition only |
| Dependencies | Asset Registry™, Generation Recipes™, Mission Engine™, Marketing systems |
| Events | `Content Studio Opened™`, `Content Mission Selected™` |
| AI behavior | Suggests content from company priorities and knowledge |
| Failure mode | Social media scheduler clone |

### 8.7 Knowledge Wing™

| Field | Definition |
|-------|------------|
| Purpose | Source-backed operating knowledge, manuals, profession intelligence |
| Responsibilities | Show knowledge confidence, operating manual, source-backed answers |
| Objects owned | Knowledge navigation projection |
| Dependencies | Knowledge Core™, Profession Brains™, Operating Manual™ |
| Events | `Knowledge Wing Opened™`, `Knowledge Artifact Viewed™` |
| AI behavior | Answers only with source-backed context or admits gaps |
| Failure mode | Hallucinated knowledge hub |

### 8.8 Creative Direction Studio™

| Field | Definition |
|-------|------------|
| Purpose | Founder-level creative decision room |
| Responsibilities | Present brand direction, campaigns, visual decisions, creative priorities |
| Objects owned | Creative direction workspace projection |
| Dependencies | Company Genome™, Asset Registry™, Content Studio™, Blueprint Engine™ |
| Events | `Creative Direction Opened™`, `Creative Decision Logged™` |
| AI behavior | Acts as executive creative director; explains tradeoffs |
| Failure mode | Moodboard without operational connection |

### 8.9 Department Directory™

| Field | Definition |
|-------|------------|
| Purpose | Spatial directory of departments and installed wings |
| Responsibilities | Show department health, readiness, active missions, locked expansions |
| Objects owned | Directory composition and room availability |
| Dependencies | Department Framework™, Company Genome™, Identity Engine™ |
| Events | `Department Directory Opened™`, `Department Room Requested™` |
| AI behavior | Recommends which department needs founder attention |
| Failure mode | Module launcher grid |

---

## 9. Navigation philosophy

### 9.1 Navigation is spatial

Founders should not feel like they are clicking software sections. They are moving through headquarters.

Canonical navigation language:

- **Enter**
- **Open room**
- **Visit wing**
- **Review briefing**
- **Convene**
- **Dispatch**
- **Approve**
- **Return to Atrium**

Rejected navigation language:

- Manage
- Configure
- Admin
- CRUD
- Settings-first
- Dashboard tab

### 9.2 Room map layers

| Layer | Description |
|-------|-------------|
| **Primary path** | Atrium → briefing → priorities → mission → room |
| **Room map** | Spatial cards/wings |
| **Orb route** | Natural-language navigation with explanation |
| **Atlas overlay** | Structural map and dependencies |
| **Command route** | Approved action path |

### 9.3 Progressive disclosure

Executive Headquarters™ v1 uses:

1. One hero.
2. One briefing.
3. Three priority cards.
4. One company health summary.
5. One mission queue.
6. One room map.
7. One focus panel.

Everything else is secondary or locked.

---

## 10. Information architecture

The Headquarters follows M83 Executive Information Architecture:

```text
Arrival / hero
  ↓
Executive briefing
  ↓
Priority trio
  ↓
Company health visual
  ↓
Mission queue
  ↓
Room / wing navigation
  ↓
Primary focus room
  ↓
Supporting details (collapsed)
```

### 10.1 Executive questions

Every Headquarters session should answer these questions in order:

1. What changed?
2. What matters today?
3. Is the company healthy?
4. What should I do next?
5. Which mission needs me?
6. Where should I go?

### 10.2 Data hierarchy

| Priority | Data |
|----------|------|
| P0 | Risks, blocked missions, required decisions |
| P1 | Today's opportunities and active priorities |
| P2 | Company health and department state |
| P3 | Trends, history, logs |
| P4 | Raw data, settings, configuration |

---

## 11. Relationship to Orb™

Orb™ is Headquarters' executive presence.

### 11.1 Orb responsibilities in Headquarters

- Greet founder with context.
- Generate / explain briefing.
- Recommend next action.
- Route founder to rooms.
- Draft commands for Command Center™.
- Protect attention.
- Surface missing context.
- Explain why a room is locked or future.

### 11.2 Orb boundaries

Orb does not:

- Execute commands directly.
- Own company data.
- Invent knowledge.
- Override permissions.
- Replace Atlas navigation.

Orb is **guide + advisor + router**, not source of truth.

### 11.3 Orb modes

| Mode | Behavior |
|------|----------|
| **Greeting mode** | Short, calm, context-aware arrival |
| **Briefing mode** | Summarizes and cites source systems |
| **Focus mode** | Reduces noise and supports deep work |
| **Command mode** | Drafts safe command payloads for approval |
| **Room guide mode** | Explains where to go and why |

---

## 12. Relationship to Atlas™

Atlas™ is Headquarters' map layer.

Atlas provides:

- Room graph
- Department graph
- Company structure overlay
- Mission-to-room routes
- Locked/future wing map
- System dependencies behind rooms

Headquarters presents Atlas as an environmental overlay, not a separate app.

---

## 13. Relationship to Company Genome™

Company Genome™ gives Headquarters company-specific meaning.

Headquarters consumes:

- Business systems
- Operating flows
- Risks
- Opportunities
- Brand personality
- Department structure
- Customer experience standards
- Decision principles

Company Genome™ determines what the Headquarters should feel like for each company. Headquarters renders the experience.

---

## 14. Relationship to Command Center™

Command Center™ is the action safety layer.

Headquarters:

- Hosts command entry.
- Shows command readiness.
- Shows approvals and rollback state.
- Routes Orb-drafted commands into Command Center™.

Command Center™:

- Validates authority.
- Routes execution.
- Tracks state.
- Emits audit events.

No Headquarters button should execute a material action without Command Center™ or explicit mock boundary.

---

## 15. Dependencies

### 15.1 Hard dependencies for production Headquarters

| Dependency | Why |
|------------|-----|
| Identity Engine™ | Founder, company, AI worker, room identity |
| Workspace Framework™ | Active company/workspace scope |
| Company Registry™ | Company source of truth |
| Company Genome™ | Meaning, structure, risks, department semantics |
| Mission Engine™ | Mission queue and blockers |
| Command Center™ | Safe actions |
| Permissions Engine™ | Authority and visibility |
| Universal Interaction Engine™ | Events and audit |
| Universal Decision Engine™ | Recommendations and confidence |

### 15.2 Soft / projection dependencies for Launch Stack v1

| Dependency | Launch Stack v1 use |
|------------|---------------------|
| Knowledge Core™ | Lightweight source-backed references / placeholders |
| Analytics™ | Company health projection |
| Atlas™ | Room map projection |
| Asset Registry™ | Content/creative room previews |
| Automation Engine™ | Locked future room |

---

## 16. Events

### 16.1 Produced events

| Event | Trigger |
|-------|---------|
| `Headquarters Opened™` | Founder enters HQ |
| `Atrium Entered™` | Arrival sequence starts |
| `Orb Greeting Delivered™` | Orb completes greeting |
| `Executive Briefing Generated™` | Briefing projection created |
| `Priority Viewed™` | Founder opens priority card |
| `Recommended Action Opened™` | Founder reviews recommendation |
| `Room Selected™` | Founder enters a room |
| `Department Wing Opened™` | Department room opened |
| `Founder Focus Started™` | Founder begins deep work |
| `Command Draft Requested™` | Headquarters sends intent to Command Center™ |
| `Future Room Viewed™` | Founder views locked expansion |

### 16.2 Consumed events

| Event | Source | Headquarters behavior |
|-------|--------|-----------------------|
| `Identity Context Resolved™` | Identity Engine™ | Load founder/company |
| `Company Genome Updated™` | Company Genome™ | Refresh room meaning |
| `Mission Advanced™` | Mission Engine™ | Update mission queue |
| `Blocker Raised™` | Mission Engine™ | Promote to priority |
| `Command Executed™` | Command Center™ | Update activity |
| `Permission Denied™` | Permissions Engine™ | Explain limitation |
| `Knowledge Artifact Approved™` | Knowledge Core™ | Refresh Knowledge Wing |
| `Company Health Changed™` | Analytics / Health | Update health visual |

---

## 17. AI behaviors

### 17.1 Orb as Executive Chief of Staff

Orb in Headquarters should:

- Speak with confidence and restraint.
- Present one next best action, not a buffet.
- Cite source systems.
- Ask for clarification only when necessary.
- Distinguish facts from recommendations.
- Use founder preferences and Company Genome™ tone.
- Avoid hype, gamification, or excessive animation.

### 17.2 AI action ladder

```text
Observe → Brief → Recommend → Draft → Request approval → Route command → Monitor
```

Headquarters v1 stops before autonomous execution.

### 17.3 AI failure guards

- If confidence is low, Orb says what is missing.
- If data source is stale, briefing labels it.
- If permission is missing, Orb routes to request/approval.
- If a room is future, Orb explains dependency and value.

---

## 18. Future expansion

### 18.1 Expansion wings

Future wings unlock through platform maturity:

| Expansion | Unlock dependency |
|-----------|-------------------|
| Finance Headquarters™ | Finance/accounting connectors + Analytics™ |
| Research Wing™ | Knowledge Core™ + Research Engine™ |
| Automation Lab™ | Workflow + Command + Permissions + Automation |
| Meeting Rooms™ | Calendar + identity + mission integration |
| Expansion Wings™ | Department Packs + Monetization Architecture |
| Studio Exchange Room | Asset + identity + permissions + listing truth |
| Career Worlds Room | Experience + profession + mission + identity |
| Simulation Room | Simulation Engine™ + Analytics™ |

### 18.2 Room maturity levels

| Level | Meaning |
|-------|---------|
| **Preview** | Locked/future with explanation |
| **Projection** | Read-only room from upstream data |
| **Operational** | Can route commands / missions |
| **Autonomous-ready** | Can prepare work awaiting approval |
| **Advanced** | Deep integrations and specialized workflows |

---

## 19. Failure modes

| Failure mode | Cause | Prevention |
|--------------|-------|------------|
| Dashboard sprawl | Too many panels at launch | Minimum lovable scope; one focus at a time |
| Fake intelligence | Unsourced AI briefings | Source-backed briefing contract |
| Authority confusion | Buttons execute directly | Command Center™ required |
| Duplicate truth | HQ stores missions/company data | Projection-only boundary |
| Generic SaaS feel | Tabs/settings/admin language | Spatial room language |
| Founder overwhelm | Too many recommendations | Priority trio + one next action |
| Stale company state | No event subscriptions | Consume mission/genome/health events |
| Orb intrusion | Chat-first behavior | Ambient executive presence rules |

---

## 20. Success metrics

### 20.1 Founder experience metrics

- Time to understand today's priority
- Founder return rate to Headquarters
- Recommendation acceptance rate
- Room navigation clarity
- Reduction in open-loop decisions
- Perceived calm / confidence

### 20.2 Operational metrics

- Mission queue engagement
- Blocker resolution time
- Command draft approval rate
- Briefing accuracy
- Department room visits
- Stale data incidents

### 20.3 Product signal

The strongest success metric:

> Founders open Headquarters before they open any other business tool.

---

## 21. Minimum lovable Headquarters™

### 21.1 Must include

1. Beautiful Executive Atrium™ arrival.
2. Orb™ contextual greeting.
3. Daily Briefing™.
4. Three priorities.
5. Company health signal.
6. Recommended action with reason/confidence.
7. Mission queue.
8. Department / room map.
9. Founder Office™ focus path.
10. Command Center™ guarded action path.
11. Locked future rooms with meaningful explanation.

### 21.2 Must not include

- Full department operating systems.
- Full finance/accounting.
- Full automation execution.
- Full marketplace.
- Full meeting OS.
- Every metric available.
- Deep configuration.
- Generic module grid.

### 21.3 The v1 promise

```text
You open Headquarters.
It knows who you are.
It knows which company you are operating.
It tells you what matters.
It shows the health of the business.
It recommends the next action.
It gives every part of the company a place.
It routes action safely.
```

That is enough for Sprint 1.

---

## 22. Implementation posture

### 22.1 Launch Stack v1 may use projections

Because Executive Headquarters™ is an experience sprint that may precede every upstream runtime, v1 may use stable projection adapters:

- `HeadquartersCompanyProjection`
- `HeadquartersMissionProjection`
- `HeadquartersBriefingProjection`
- `HeadquartersRoomProjection`
- `HeadquartersHealthProjection`
- `HeadquartersCommandDraft`

Each projection must name its future owning system.

### 22.2 No source-of-truth shortcuts

If an upstream runtime does not exist, v1 must mark the boundary:

```yaml
sourceSystem: Mission Engine™
currentAdapter: static | local projection | mock boundary
rewriteRisk: low
replacementPlan: consume Mission Engine API when shipped
```

---

## 23. Genesis review checklist

- [ ] Headquarters is positioned as flagship experience, not admin dashboard.
- [ ] Arrival → Orb → briefing → priorities → health → actions → missions → rooms → deep work flow is explicit.
- [ ] Launch Stack v1 rooms are separated from future expansion rooms.
- [ ] Orb, Atlas, Company Genome, and Command Center relationships are defined.
- [ ] Minimum lovable scope avoids feature bloat.
- [ ] Data ownership boundaries prevent duplicate truth.
- [ ] Events, failure modes, and success metrics are defined.
- [ ] Implementation posture allows projections without hiding future ownership.

---

## 24. Official architecture law

```text
Headquarters is the place.
Orb is the presence.
Atlas is the map.
Command Center is the action gate.
Company Genome is the meaning.
Mission Engine is the operational runway.
```

Executive Headquarters™ is where Studio OS becomes real to founders.

