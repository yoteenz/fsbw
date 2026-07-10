# Decision Memory

**Protocol module:** L2 — Institutional memory  
**Capsule path:** `History/decisions.json`  
**Purpose:** Future AI understands **why** choices were made — not only **what** exists.

---

## Purpose

Every major architectural decision stores structured rationale so institutional memory survives people and AI system changes.

Decision memory is the capsule equivalent of Git commits with rich messages — but for organizational understanding.

---

## decisions.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "decisions": [
    {
      "id": "dec-2026-07-10-layer1-forensic",
      "date": "2026-07-10",
      "title": "Layer 1 forensic pass — no repair in same sprint",
      "status": "active",
      "category": "architecture",
      "decision": "Ship forensic instrumentation only; do not repair governed generation auth in the same sprint.",
      "reason": "UI masked Landmark failure as shell failure. Root cause must be proven before masking with fallback.",
      "alternativesConsidered": [
        {
          "option": "Immediate canvas fallback for Layer 1",
          "rejectedBecause": "Masks AUTH_REQUIRED without governance review"
        },
        {
          "option": "Silent legacy compat bypass",
          "rejectedBecause": "Violates governed generation canon"
        }
      ],
      "rejectedIdeas": [
        "Retry shell layer when shell already loaded",
        "Assume private/incognito success equals production readiness"
      ],
      "tradeoffs": {
        "gained": ["Proven root cause", "Accurate failure UI", "Black Box traceability"],
        "lost": ["Experience Lab compile still blocked until repair sprint"]
      },
      "dependencies": [
        "genesis-core",
        "world-compiler",
        "experience-lab",
        "governed-generation-api"
      ],
      "futureImplications": [
        "Repair sprint must choose: ephemeral productionAuthorizationId OR scoped legacy compat for Experience Lab drafts",
        "All future compile failures must distinguish shell vs landmark vs auth"
      ],
      "impact": {
        "systems": ["Experience Lab", "Scene Stack", "World Compiler"],
        "files": ["layer1-forensic.ts", "SceneStackViewport.tsx", "useSceneStack.ts"],
        "docs": ["CURRENT_HANDOFF.md", "AI_CHANGELOG.md"]
      },
      "supersedes": null,
      "supersededBy": null,
      "graphNodeId": "dec-layer1-forensic",
      "changelogRef": "2026-07-10 — Layer 1 Forensic Pass (No Repair)",
      "confidence": 0.95,
      "provenance": "device-confirmed + code analysis"
    }
  ]
}
```

---

## Decision categories

| Category | Examples |
|----------|----------|
| `architecture` | System boundaries, pipeline design, route isolation |
| `governance` | Auth, canon promotion, production authorization |
| `collaboration` | AI onboarding, export protocol, handoff format |
| `design` | IA, Studio World geography, admin alignment |
| `process` | Deploy policy, sprint boundaries, verification gates |
| `deprecation` | Superseded patterns, retired terminology |

---

## Required fields (major decisions)

Every decision marked `major: true` (or all entries in full export) must include:

1. **Decision** — one declarative sentence  
2. **Reason** — primary motivation  
3. **Alternatives considered** — at least one with rejection rationale  
4. **Tradeoffs** — explicit gains and losses  
5. **Dependencies** — systems, prior decisions, or canon refs  
6. **Future implications** — what future AI must respect  

Optional but recommended: `rejectedIdeas`, `supersedes`, `supersededBy`, `graphNodeId`.

---

## Generation sources

| Source | Role |
|--------|------|
| `AI_CHANGELOG.md` | Primary human-readable decision log |
| `motherboard/MEMORY.md` | Agent conversation outcomes |
| `CURRENT_HANDOFF.md` | Active decisions and blockers |
| Memory graph edges | `supersedes`, `blocked-by`, `governs` |
| Git commit messages | Provenance and file impact |

---

## Relationship to AI Changelog

- **AI_CHANGELOG.md** — founder-readable append-only prose  
- **decisions.json** — machine-readable structured memory  

Both must stay aligned. Health system flags changelog ↔ decisions drift.

---

## AI usage contract

Before proposing architecture changes, receiving AI must:

1. Query decisions affecting target systems  
2. Cite relevant decision IDs in onboarding report  
3. Never re-litigate closed decisions without noting supersession path  
4. Propose new decisions in structured format when founder approves  

---

## Decision lifecycle

```
PROPOSED → ACTIVE → SUPERSEDED → ARCHIVED
```

- **Proposed:** In handoff or sprint discussion — not yet in decisions.json  
- **Active:** Current canon  
- **Superseded:** `supersededBy` set; still readable for history  
- **Archived:** Retained in timeline; excluded from default AI preload  

---

*Protocol module — specification only*
