# Collaboration Memory

**Protocol module:** L2 — Institutional memory  
**Capsule path:** `Workflow/collaboration-memory.json`  
**Purpose:** Transfer **how** the founder and AI work together — not only **what** to build.

---

## Purpose

Institutional memory includes collaboration patterns. The receiving AI learns:

- How brainstorming occurs  
- How reviews occur  
- How architecture evolves  
- How implementation decisions are approved  
- How disagreements are resolved  

---

## collaboration-memory.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "roles": {
    "founder": {
      "title": "Founder / Creative Director",
      "responsibilities": ["Vision", "Canon approval", "Sprint scope", "Final design authority"]
    },
    "chatgpt": {
      "title": "Creative Director (external)",
      "responsibilities": ["Architecture exploration", "Sprint design", "Decision memos", "Composer prompt authoring"]
    },
    "composer": {
      "title": "Implementer (Cursor / Cloud Agent)",
      "responsibilities": ["Code changes", "Forensic debugging", "Spec authoring", "Verification"]
    },
    "terra": {
      "title": "Governance layer",
      "responsibilities": ["Canon enforcement", "Scope gates", "Production authorization"]
    }
  },
  "brainstorming": {
    "pattern": "explore-then-narrow",
    "maxDirections": 3,
    "labelsRequired": ["exploratory", "production-candidate", "defer"],
    "outputFormats": ["decision-memo", "composer-sprint", "open-questions"],
    "rules": [
      "Connect to canon before expanding scope",
      "Never treat exploratory sketch as shipped architecture",
      "End with explicit next step: implement, defer, or founder decision"
    ]
  },
  "architectureReview": {
    "trigger": "Net-new system, cross-district feature, or constitutional change",
    "participants": ["founder", "chatgpt"],
    "deliverable": "Architecture decision memo with alternatives",
    "gateBeforeImplementation": true,
    "composerStartsAfter": "Founder approves memo or names explicit sprint scope"
  },
  "implementationReview": {
    "trigger": "Sprint completion or significant PR",
    "criteria": ["Pass criteria from sprint", "Scope boundaries respected", "Mobile normal-tab verification"],
    "distinctionRequired": {
      "proven": "Device-confirmed behavior",
      "inferred": "Code analysis only — must be labeled"
    }
  },
  "approvalFlow": {
    "architecture": "Founder explicit approval → Composer sprint",
    "implementation": "Composer executes within approved scope → Founder verifies",
    "canonPromotion": "Exploratory → Bible update → Changelog entry → Capsule regen",
    "productionDeploy": "One commit + one push per completed user task"
  },
  "disagreementResolution": {
    "default": "Founder decision is final",
    "aiObligations": [
      "State tradeoffs clearly before founder decides",
      "Document rejected alternatives in decision memory",
      "Never silently override stated founder preferences"
    ],
    "escalation": "Pause implementation; produce decision memo with options"
  },
  "communicationPatterns": {
    "promptStructure": "Labeled Composer vs Terra blocks in dedicated code fences",
    "testingUrls": "One URL per code block — never grouped",
    "explanationStyle": "Conclusion first, then reasoning; complete sentences",
    "visualThinking": "Diagrams, tables, Studio World geography analogies preferred"
  },
  "sessionRituals": {
    "newExternalAI": ["Upload capsule", "Read bootstrap readOrder", "Generate onboarding report", "Confirm blockers"],
    "newCursorAgent": ["Load motherboard", "Read CURRENT_HANDOFF", "Respect one-deploy-per-task"],
    "sprintClose": ["Update handoff", "Append changelog", "Regenerate capsule when milestone"]
  },
  "antiPatterns": [
    "Re-explaining entire Studio OS every session",
    "Implementing before architecture approval on net-new systems",
    "Redesigning finalized admin pages without explicit naming",
    "Treating private/incognito success as production verification",
    "Multiple pushes per completed task"
  ]
}
```

---

## Source documents

| Capsule path | Source |
|--------------|--------|
| `Workflow/operating-manual.md` | `CHATGPT_OPERATING_MANUAL.md` |
| `Workflow/style-guide.md` | `AI_STYLE_GUIDE.md` |
| `Workflow/prompt-library.md` | `PROMPT_TEMPLATES.md` |
| Collaboration JSON | Derived from above + `FOUNDER_PROFILE.md` |

---

## AI usage contract

Receiving AI must:

1. Identify its role (external ChatGPT vs Cursor Composer vs generic)  
2. Apply role-appropriate boundaries from `roles`  
3. Follow `brainstorming.rules` before expanding scope  
4. Respect `approvalFlow` gates — no silent architecture commits  
5. Cite `antiPatterns` in onboarding report if prior session violated them  

---

## Relationship to Founder DNA

- **Founder DNA** (`Founder/dna.json`) — traits, philosophy, preferences  
- **Collaboration memory** — processes, rituals, role boundaries  

Founder DNA answers *who*; collaboration memory answers *how we work*.

---

*Protocol module — specification only*
