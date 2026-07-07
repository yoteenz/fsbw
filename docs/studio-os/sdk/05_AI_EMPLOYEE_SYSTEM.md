# 05 — AI Employee System

**SDK Module:** `studio.department.sdk.v1.ai-employees`  
**Status:** Canonical AI role registry  
**Philosophy:** AI employees collaborate — they do not replace one another or the human founder

---

## Definition

An **AI Employee** is a persistent, role-bound intelligence agent assigned to a department. AI employees have defined responsibilities, knowledge scopes, permissions, memory, communication style, and escalation rules. They work **alongside** humans and each other — never as sole operators.

> Every department feels staffed — not automated.

---

## AI Employee Schema

```yaml
AIEmployee:
  roleId: string              # canonical role from registry below
  instanceId: string          # unique within department
  displayName: string         # Genome may override via terminology
  department: string
  primaryZone: string

  role:
    title: string
    responsibilities: string[]
    knowledgeDomains: string[]

  permissions:
    read: string[]
    write: string[]
    approve: string[]
    escalate: string[]
    veto: string[]            # genome-veto, brand-veto

  memory:
    scope: enum               # department | organization | project
    retention: enum           # session | persistent | archival
    sharedWith: string[]      # other AI role IDs

  communication:
    style: string             # Genome-injected from voice domain
    verbosity: enum           # concise | balanced | detailed
    proactivity: enum         # reactive | suggestive | anticipatory
    channels: string[]        # orb, panel, ambient, notification

  escalation:
    rules: EscalationRule[]
    humanFallback: boolean    # always true for approve/veto
```

---

## Canonical AI Roles

### Creative Director

| Field | Value |
|-------|-------|
| **Role ID** | `creative-director` |
| **Responsibilities** | Creative vision, concept evaluation, variant direction, reference curation, creative risk assessment |
| **Knowledge** | Company Genome creative domains, Project Genome, visual references, brand constraints |
| **Permissions** | Read: all project assets. Write: creative notes, variant requests. Approve: creative concepts. Escalate: brand conflicts |
| **Memory** | Organization scope — remembers creative decisions across projects |
| **Communication** | Editorial, opinionated, references visual language. Proactivity: suggestive |
| **Escalation** | Brand conflicts → Brand Concierge. Budget impact → Production Manager |

---

### Research Concierge

| Field | Value |
|-------|-------|
| **Role ID** | `research-concierge` |
| **Responsibilities** | Market research, competitor analysis, trend signals, reference discovery, fact verification |
| **Knowledge** | Industry context, competitor landscape, trend databases, Company Genome competitive domains |
| **Permissions** | Read: external sources, reference libraries. Write: research briefs, reference pins. No approve |
| **Memory** | Organization scope — builds institutional research knowledge |
| **Communication** | Precise, citation-oriented, curious. Proactivity: anticipatory |
| **Escalation** | Uncertain claims → Quality Concierge. Strategic implications → Creative Director |

---

### Production Manager

| Field | Value |
|-------|-------|
| **Role ID** | `production-manager` |
| **Responsibilities** | Timeline management, resource allocation, dependency tracking, bottleneck detection, delivery forecasting |
| **Knowledge** | Project schedules, department dependencies, team capacity, production history |
| **Permissions** | Read: all project timelines. Write: schedule changes, task assignments. Approve: timeline adjustments. Escalate: blockers |
| **Memory** | Project + department scope |
| **Communication** | Direct, timeline-focused, solution-oriented. Proactivity: anticipatory |
| **Escalation** | Resource conflicts → department head. Quality concerns → Quality Concierge |

---

### Quality Concierge

| Field | Value |
|-------|-------|
| **Role ID** | `quality-concierge` |
| **Responsibilities** | Quality standards enforcement, compliance checks, error detection, consistency review, accessibility audit |
| **Knowledge** | Brand guidelines (Genome), platform standards, industry regulations, QA checklists |
| **Permissions** | Read: all outputs. Write: quality reports, fix requests. Approve: quality gate. Veto: non-compliant output |
| **Memory** | Organization scope — tracks quality patterns over time |
| **Communication** | Measured, specific, constructive. Proactivity: reactive (flags issues) |
| **Escalation** | Brand violations → Brand Concierge. Legal concerns → Legal Concierge |

---

### Marketing Concierge

| Field | Value |
|-------|-------|
| **Role ID** | `marketing-concierge` |
| **Responsibilities** | Channel strategy, audience targeting, campaign structure, messaging alignment, launch coordination |
| **Knowledge** | Marketing channels, audience segments, campaign history, Company Genome voice domains |
| **Permissions** | Read: campaign assets, audience data. Write: campaign plans, channel recommendations. Approve: channel selection |
| **Memory** | Organization scope |
| **Communication** | Strategic, audience-aware, channel-fluent. Proactivity: suggestive |
| **Escalation** | Brand voice conflicts → Brand Concierge. Production delays → Production Manager |

---

### Publishing Concierge

| Field | Value |
|-------|-------|
| **Role ID** | `publishing-concierge` |
| **Responsibilities** | Publication scheduling, distribution routing, platform formatting, post-publish monitoring |
| **Knowledge** | Distribution channels, platform requirements, publication history, OAuth-connected accounts |
| **Permissions** | Read: approved assets, channel configs. Write: schedules, format adaptations. Approve: publication timing. No veto |
| **Memory** | Department scope |
| **Communication** | Operational, precise, deadline-aware. Proactivity: reactive |
| **Escalation** | Asset not approved → Marketing Concierge. Technical failures → Production Manager |

---

### Legal Concierge

| Field | Value |
|-------|-------|
| **Role ID** | `legal-concierge` |
| **Responsibilities** | Compliance review, rights verification, disclaimer requirements, contract references, regulatory alignment |
| **Knowledge** | Industry regulations, usage rights, Company Genome `thingsWeNeverDo`, legal precedents |
| **Permissions** | Read: all content, contracts, licenses. Write: legal notes, compliance flags. Veto: non-compliant content |
| **Memory** | Organization scope — permanent compliance record |
| **Communication** | Formal, cautious, citation-heavy. Proactivity: reactive |
| **Escalation** | Ambiguous rights → human legal counsel (always). Brand risk → Brand Concierge |

---

### Brand Concierge

| Field | Value |
|-------|-------|
| **Role ID** | `brand-concierge` |
| **Responsibilities** | Brand integrity, Genome alignment, final brand approval, terminology enforcement, signature moment preservation |
| **Knowledge** | Full Company Genome™, brand history, competitive positioning, signature moments |
| **Permissions** | Read: everything. Write: brand notes. Approve: brand compliance. Veto: genome-veto (highest brand authority) |
| **Memory** | Organization scope — permanent brand memory |
| **Communication** | Authoritative, brand-fluent, protective. Proactivity: reactive (guards) |
| **Escalation** | Genome conflicts → human founder. Legal risk → Legal Concierge |

---

### Orb

| Field | Value |
|-------|-------|
| **Role ID** | `orb` |
| **Responsibilities** | Ambient intelligence, command routing, concierge dispatch, context awareness, arrival acknowledgment |
| **Knowledge** | Full department context, user preferences, Life & Culture Preferences™, active project state |
| **Permissions** | Read: all department state. Write: routing decisions. No direct approve/veto — routes to specialists |
| **Memory** | Session + organization preferences |
| **Communication** | Genome-driven personality. Warm, efficient, context-aware. Proactivity: anticipatory |
| **Escalation** | Routes to any specialist concierge. Never replaces specialist decisions |

---

## Collaboration Model

AI employees operate as a **collaborative staff** — not a hierarchy of replacements.

### Collaboration Rules

| Rule | Description |
|------|-------------|
| **No monopoly** | No single AI owns all decisions in a department |
| **Specialist authority** | Each AI has authority only within its knowledge domains |
| **Human supremacy** | Humans execute `approve` and `reject` verbs — AI recommends |
| **Orb routes, not decides** | Orb dispatches to specialists; never auto-approves |
| **Shared memory** | AI employees with `sharedWith` can reference each other's context |
| **Visible collaboration** | When AI employees consult each other, user sees the exchange (ambient panel, not hidden) |

### Collaboration Flow Example

```
User places asset on Approval Station
    → Quality Concierge reviews compliance (ambient note on Preview Screen)
    → Brand Concierge checks Genome alignment (glow on asset if aligned)
    → Marketing Concierge confirms channel fit (timeline marker update)
    → Orb summarizes: "Ready for your approval — all checks passed"
    → User executes APPROVE verb
    → Publishing Concierge receives handoff
```

---

## Genome Adaptation

AI employee **structure** is fixed. AI employee **expression** is Genome-driven:

| Attribute | Genome Domain |
|-----------|---------------|
| Display name | `terminology` |
| Communication style | `voice`, `microcopyStyle` |
| Personality tone | `personality`, `humorStyle` |
| Proactivity level | `interactionStyle` |
| Knowledge emphasis | `coreBeliefs`, `values` |
| Veto sensitivity | `thingsWeNeverDo` |

The Marketing Concierge at a luxury hair brand speaks differently than at a law firm — same role, different Genome injection.

---

## Department AI Staffing Guidelines

| Department Type | Minimum AI Staff | Recommended Staff |
|-----------------|------------------|-------------------|
| Universal (Marketing) | Marketing Concierge + Brand Concierge + Orb | + Publishing Concierge, Research Concierge |
| Creative | Creative Director + Brand Concierge + Orb | + Research Concierge, Quality Concierge |
| Production | Production Manager + Quality Concierge + Orb | + Creative Director |
| Legal / Compliance | Legal Concierge + Brand Concierge + Orb | + Quality Concierge |
| Operations | Production Manager + Orb | + Quality Concierge |
| Custom | 1 specialist + Orb | + Brand Concierge |

---

## Memory Architecture

```yaml
MemoryLayer:
  session:        # current visit context — cleared on exit
  department:     # department-specific learnings — persists across visits
  organization:   # company-wide knowledge — shared across departments
  project:        # project-scoped context — cleared on project close
  archival:       # permanent record — never deleted, exportable
```

**Privacy rules:**
- User can export/delete personal memory layers
- Organization memory feeds Company Genome™ learning outputs
- AI employees never share memory across organizations (tenant isolation)

---

## Escalation Schema

```yaml
EscalationRule:
  trigger: string           # condition expression
  from: string              # AI role ID
  to: string                # AI role ID or "human-founder"
  urgency: enum             # ambient | notification | blocking
  message: string           # Genome-styled escalation message
```

**Mandatory escalations:**
- Any `veto` → human founder notification
- Legal uncertainty → human legal counsel
- Genome conflict → Brand Concierge → human founder
- Production blocker > 48h → Production Manager → human founder

---

## Forbidden Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| AI auto-approves without human verb | Human supremacy rule |
| Single AI replaces all specialists | Collaboration rule |
| AI with no memory scope | Cannot learn or contextualize |
| AI with hardcoded personality | Must be Genome-adapted |
| Hidden AI-to-AI negotiation | Collaboration must be visible |
| AI employees across tenant boundaries | Tenant isolation violation |

---

_Next: [06 — Asset Standard](./06_ASSET_STANDARD.md)_
