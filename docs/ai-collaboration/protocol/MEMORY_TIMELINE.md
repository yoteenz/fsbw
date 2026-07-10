# Project Memory Timeline

**Protocol module:** L2 — Institutional memory  
**Capsule path:** `History/timeline.json`  
**Purpose:** Every milestone becomes replayable — version history, architectural evolution, institutional growth.

---

## Purpose

Future AI understands **how the project evolved** — not only its current state.

The timeline is institutional replay: milestones, redesigns, discoveries, and growth events in chronological order.

---

## timeline.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "projectGeneration": 3,
  "events": [
    {
      "id": "evt-2026-07-10-ai-context-protocol",
      "date": "2026-07-10",
      "type": "architecture",
      "title": "AI Context Protocol™ v1.0 specified",
      "summary": "Capsule extended from documentation export to institutional memory transfer standard.",
      "impact": "high",
      "systems": ["Studio Archive", "AI collaboration layer"],
      "decisionRefs": [],
      "capsuleVersion": null,
      "gitRef": null,
      "replayHints": [
        "Read AI_CONTEXT_PROTOCOL_SPECIFICATION.md",
        "Read protocol/ module index"
      ]
    },
    {
      "id": "evt-2026-07-10-capsule-v2",
      "date": "2026-07-10",
      "type": "milestone",
      "title": "AI Context Capsule v2 architecture",
      "summary": "Single .studiocapsule ZIP layout with manifest v2.",
      "impact": "high",
      "systems": ["Knowledge Management export target"],
      "decisionRefs": ["dec-ai-context-capsule-v2"],
      "capsuleVersion": "2.0.0",
      "gitRef": "48a77da3c"
    },
    {
      "id": "evt-2026-07-10-layer1-forensic",
      "date": "2026-07-10",
      "type": "discovery",
      "title": "Layer 1 AUTH_REQUIRED root cause proven",
      "summary": "Shell succeeds via canvas fallback; Landmark uses governed API without auth.",
      "impact": "critical",
      "systems": ["Experience Lab", "World Compiler"],
      "decisionRefs": ["dec-2026-07-10-layer1-forensic"],
      "gitRef": "506d77169"
    },
    {
      "id": "evt-2026-07-09-atlas-package",
      "date": "2026-07-09",
      "type": "fix",
      "title": "studio-world-atlas department package registered",
      "summary": "Registry had 3 entries; Experience Lab required atlas package.",
      "impact": "high",
      "gitRef": "03726eaf9"
    }
  ],
  "eras": [
    {
      "id": "era-platform-stabilization",
      "label": "Platform Stabilization",
      "start": "2026-07-08",
      "end": null,
      "themes": ["Compile pipeline", "Diagnostic isolation", "AI continuity"]
    }
  ],
  "architecturalEvolution": [
    {
      "from": "Flat markdown AI export (v1 CLI)",
      "to": "ZIP capsule with manifest v2",
      "date": "2026-07-10"
    },
    {
      "from": "Documentation export",
      "to": "AI Context Protocol institutional memory",
      "date": "2026-07-10"
    }
  ],
  "featureEvolution": [
    {
      "feature": "Experience Lab compile",
      "states": [
        { "date": "2026-07-09", "state": "blocked-package-missing" },
        { "date": "2026-07-10", "state": "blocked-layer-1-auth" }
      ]
    }
  ]
}
```

---

## Event types

| Type | Meaning |
|------|---------|
| `milestone` | Shipped deliverable or sprint close |
| `architecture` | Structural or constitutional change |
| `discovery` | Root cause or insight |
| `redesign` | Major UX/IA shift |
| `deprecation` | Retired system or term |
| `fix` | Repair with institutional significance |
| `growth` | New district, org, or platform layer |

---

## Replay contract

Each event includes `replayHints` — minimum reading list to understand that moment.

Future AI can:

- Filter timeline by `systems` or `type`  
- Walk `architecturalEvolution` for paradigm shifts  
- Correlate `decisionRefs` with decisions.json  
- Compare `projectGeneration` across capsule versions  

---

## Generation sources

| Source | Role |
|--------|------|
| `AI_CHANGELOG.md` | Event seeds |
| Git tags / release notes | Milestone anchors |
| `motherboard/MEMORY.md` | Conversation milestones |
| Capsule version history | `capsuleVersion` on export events |
| Memory graph | System impact linkage |

---

## Relationship to Knowledge Diff

- **Timeline** — full institutional history  
- **Knowledge diff** — delta since last capsule only  

Incremental import uses diff; deep onboarding uses timeline + graph.

---

*Protocol module — specification only*
