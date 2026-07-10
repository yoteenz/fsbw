# Capsule Health System

**Capsule path:** `Manifest/health.json`  
**Audience:** Founder (primary), AI onboarding report (secondary)

---

## Purpose

Every export includes a **health report** so the founder knows whether the capsule is safe to upload before an AI session.

---

## health.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "scores": {
    "completeness": 0.94,
    "freshness": 0.98,
    "consistency": 0.91,
    "coverage": 0.88,
    "confidence": 0.87
  },
  "freshness": {
    "handoffAgeHours": 4,
    "changelogAgeHours": 4,
    "memorySnapshotAgeHours": 0,
    "staleThresholdHours": 168,
    "isStale": false
  },
  "completeness": {
    "requiredSectionsPresent": 14,
    "requiredSectionsTotal": 14,
    "missingSections": [],
    "emptySections": []
  },
  "outdatedSections": [
    {
      "section": "Roadmap/roadmap.md",
      "reason": "Handoff lists newer blocker not reflected in roadmap extract",
      "severity": "low"
    }
  ],
  "brokenReferences": [
    {
      "from": "Glossary/terms.json",
      "ref": "docs/studio-os/removed-doc.md",
      "severity": "medium"
    }
  ],
  "glossaryGaps": [
    { "term": "Institutional Memory Engine", "usedIn": ["bootstrap.json"], "defined": false }
  ],
  "architectureGaps": [],
  "pendingDocumentation": [
    "Layer 1 auth repair sprint not yet documented in handoff fix section"
  ],
  "recommendations": [
    "Regenerate after next sprint close",
    "Add glossary term: Institutional Memory Engine"
  ],
  "exportBlocked": false,
  "exportBlockReason": null
}
```

---

## Score definitions

| Score | Meaning | Calculation (spec) |
|-------|---------|-------------------|
| **Completeness** | All required sections present and non-empty | present / required |
| **Freshness** | Handoff and snapshot age | decay after `staleThresholdHours` |
| **Consistency** | Handoff ↔ changelog ↔ graph alignment | heuristic cross-check count |
| **Coverage** | Canon docs represented in graph | graph nodes / expected canon nodes |
| **Confidence** | Weighted mean; penalize gaps and broken refs | formula in IME spec |

---

## Founder UI (future)

Traffic light on export preview:

- 🟢 confidence ≥ 0.85 — upload recommended
- 🟡 0.70–0.84 — upload with warnings
- 🔴 < 0.70 — `exportBlocked: true` unless founder overrides

---

## AI usage

Onboarding report must cite `health.json` warnings and `outdatedSections`.

---

*Protocol module — specification only*
