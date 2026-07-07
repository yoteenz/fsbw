# 09 — Command Interface

**Engine Module:** `studio.walk-the-business.v1.command-interface`  
**Status:** Natural language HQ navigation  
**Philosophy:** The founder commands naturally — the Headquarters responds immediately.

---

## Design Principle

> The founder should say *"Take me to Production"* — not hunt a sidebar. Voice · Orb · natural language. **Immediate** spatial response.

---

## Canonical Commands

| Intent | Example Phrases |
|--------|-----------------|
| **Navigate department** | "Take me to Production." · "Walk me through Marketing." |
| **Navigate project** | "Show me Project 014." · "Where is Truth Tuesday?" |
| **Priority query** | "What needs attention?" · "Take me to today's priorities." |
| **Approval query** | "Where are approvals waiting?" |
| **Opportunity query** | "Show me our biggest opportunity." |
| **Scope change** | "Quick summary only." · "Full walk please." |
| **Pause / resume** | "Pause the walk." · "Continue." |
| **Deep-dive** | "I want to work in Creative Direction." |
| **Critique branch** | "Review the mood board." → Walk the Room |
| **Exit walk** | "End walk." · "I'm ready to work." |

---

## Command Schema

```yaml
ExecutiveWalkCommand:
  commandId: string
  walkId: string
  inputChannel: enum              # voice · orb · text
  rawTranscript: string

  intent: enum
    # navigate-department · navigate-project · query-priority · query-approval
    # query-opportunity · change-scope · pause · resume · deep-dive · branch-critique · end-walk

  parsedTarget:
    departmentId: string | null
    projectId: string | null
    buildingId: string | null

  responseLatencyMs: number       # target < 500ms navigation start
```

---

## Response Protocol

```
Command received
    ↓
Orb confirms (brief): "Production — let's go."
    ↓
Walk path recalculates OR immediate teleport-walk (editorial camera move — never jarring cut)
    ↓
Arrival at destination · concierge greeting if applicable
    ↓
Transcript logged
```

**Immediate** means camera begins moving within 500ms. Full arrival may take 3–5s editorial travel.

---

## Query Commands

Queries do not always navigate — Orb may answer in place:

**Founder:** "What needs attention?"

**Orb:** "Three items: Creative Direction approval, Production blocker on 009, and Marketing launch at 2 PM. Priority walk covers all three in twelve minutes. Shall we begin?"

**Founder:** "Where are approvals waiting?"

**Orb:** "Creative Direction and Publishing. Creative Direction is closer — I'll take you there first."

---

## Project Navigation

Projects exist as **objects in transit** on production lot:

```
"Show me Project 014"
    ↓
Camera travels to project object's current department
    ↓
Concierge at station provides update
    ↓
Founder may enter department work mode
```

---

## Command During Free Explore

All commands available without active guided walk. Orb remains executive assistant.

---

## Integration

| System | Role |
|--------|------|
| **Studio Orb™** | Primary parser · confirmation |
| **Executive Walk Orchestrator** | Path recalculation |
| **Department Runtime** | Door entry · work mode |
| **Walk the Room** | Critique branch intent |

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Command palette / slash commands | Power-user SaaS |
| Sidebar navigation as primary | Breaks walk metaphor |
| "I didn't understand" loops | Orb asks clarifying question once |
| Map overlay with pins | Spatial world IS the map |

---

_Next: [10 — World Evolution](./10_WORLD_EVOLUTION.md)_
