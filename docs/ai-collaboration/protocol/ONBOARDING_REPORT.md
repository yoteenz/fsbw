# AI Onboarding Report

**Protocol module:** L3 — Post-read self-assessment  
**Capsule path (authoritative v0.2 template):** `StudioOS_ContextCapsule_v0.1/ONBOARDING_REPORT.md`  
**Repo spec copy:** this file documents schema + future automation  
**Rule:** Mandatory **before** contributing code, docs, or architecture.

---

## v0.2 flat export (current)

For brand-new ChatGPT / Claude / Gemini sessions using the ZIP export:

1. Read all files in `MANIFEST.md` reading order.  
2. **Complete** `ONBOARDING_REPORT.md` **exactly as provided** — do not invent structure.  
3. Include **Founder Preference Verification**, **Canon Verification**, and **Confidence Assessment**.  
4. Stop at **Waiting For Founder Approval**.

The capsule template includes all required sections. Export validation **fails** if `ONBOARDING_REPORT.md` or `context-capsule.json` is missing.

---

## onboarding-report.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://studio-os.dev/schemas/ai-context-protocol/onboarding-report.v1.json",
  "title": "AI Onboarding Report",
  "type": "object",
  "required": [
    "schemaVersion",
    "generatedAt",
    "capsuleId",
    "contextVersion",
    "understandingSummary",
    "questions",
    "potentialInconsistencies",
    "outdatedDocumentation",
    "riskAssessment",
    "recommendedNextSteps",
    "readConfirmation"
  ],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "generatedAt": { "type": "string", "format": "date-time" },
    "capsuleId": { "type": "string" },
    "contextVersion": { "type": "string" },
    "protocolVersion": { "type": "string" },
    "platform": {
      "type": "string",
      "enum": ["chatgpt", "claude", "gemini", "cursor", "studio-ai", "generic-llm"]
    },
    "understandingSummary": {
      "type": "object",
      "required": ["projectPurpose", "currentSprint", "activeBlockers", "collaborationModel"],
      "properties": {
        "projectPurpose": { "type": "string" },
        "currentSprint": { "type": "string" },
        "activeBlockers": { "type": "array", "items": { "type": "string" } },
        "collaborationModel": { "type": "string" },
        "keySystemsUnderstood": { "type": "array", "items": { "type": "string" } }
      }
    },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["question", "priority"],
        "properties": {
          "question": { "type": "string" },
          "priority": { "enum": ["blocking", "high", "medium", "low"] },
          "relatedSection": { "type": "string" }
        }
      }
    },
    "potentialInconsistencies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "sources": { "type": "array", "items": { "type": "string" } },
          "severity": { "enum": ["error", "warning", "info"] }
        }
      }
    },
    "outdatedDocumentation": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "path": { "type": "string" },
          "reason": { "type": "string" },
          "healthRef": { "type": "string" }
        }
      }
    },
    "riskAssessment": {
      "type": "object",
      "required": ["overall", "items"],
      "properties": {
        "overall": { "enum": ["low", "medium", "high"] },
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "risk": { "type": "string" },
              "mitigation": { "type": "string" }
            }
          }
        }
      }
    },
    "recommendedNextSteps": {
      "type": "array",
      "items": { "type": "string" }
    },
    "readConfirmation": {
      "type": "object",
      "required": ["bootstrapRead", "readOrderCompleted", "healthReviewed"],
      "properties": {
        "bootstrapRead": { "type": "boolean" },
        "readOrderCompleted": { "type": "boolean" },
        "healthReviewed": { "type": "boolean" },
        "sectionsSkipped": { "type": "array", "items": { "type": "string" } },
        "confidenceSelfScore": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    }
  }
}
```

---

## Example report (abbreviated)

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-10T17:00:00Z",
  "capsuleId": "capsule-2026-07-10-48a77da",
  "contextVersion": "2026-07-10T16:00:00Z",
  "protocolVersion": "1.0.0",
  "platform": "chatgpt",
  "understandingSummary": {
    "projectPurpose": "Studio OS is a living headquarters platform; Frontal Slayer is host deployment.",
    "currentSprint": "AI Context Protocol specification — no implementation.",
    "activeBlockers": ["B1 Layer 1 AUTH_REQUIRED", "B2 normal-tab diagnostic verification pending"],
    "collaborationModel": "ChatGPT architects; Composer implements; forensic before repair.",
    "keySystemsUnderstood": ["Genesis Core", "World Compiler", "Experience Lab", "AI Context Capsule"]
  },
  "questions": [
    {
      "question": "Has founder verified B2 on iOS Safari normal tab post-ef969cb7d?",
      "priority": "blocking",
      "relatedSection": "CurrentSprint/handoff.md"
    }
  ],
  "potentialInconsistencies": [],
  "outdatedDocumentation": [
    {
      "path": "Roadmap/roadmap.md",
      "reason": "Handoff lists newer blocker",
      "healthRef": "health.json#outdatedSections"
    }
  ],
  "riskAssessment": {
    "overall": "medium",
    "items": [
      {
        "risk": "Implementing compile repair before B2 verified",
        "mitigation": "Wait for founder confirmation per handoff gate"
      }
    ]
  },
  "recommendedNextSteps": [
    "Confirm B2 verification status with founder",
    "Do not start Layer 1 auth repair without approved sprint",
    "Use labeled Composer prompts for any approved implementation"
  ],
  "readConfirmation": {
    "bootstrapRead": true,
    "readOrderCompleted": true,
    "healthReviewed": true,
    "sectionsSkipped": [],
    "confidenceSelfScore": 0.88
  }
}
```

---

## Generation trigger

```
IMPORT → READ bootstrap + readOrder → GENERATE report → FOUNDER REVIEW → COLLABORATE
```

No implementation prompts until founder acknowledges report (explicit or implicit proceed).

---

## Inputs required

| Input | Used for |
|-------|----------|
| `bootstrap.json` | Read confirmation, missing sections |
| `health.json` | Outdated docs, confidence |
| `CurrentSprint/handoff.md` | Blockers, sprint scope |
| `canon.json` | Inconsistency detection |
| `decisions.json` | Architectural alignment |
| Knowledge diff (if incremental) | Changed-since-last-session section |

---

## Founder review (future UI)

Studio Archive import preview shows onboarding report before session starts.

---

*Protocol module — specification only*
