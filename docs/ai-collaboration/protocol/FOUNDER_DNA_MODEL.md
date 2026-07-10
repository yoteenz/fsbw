# Founder DNA Model

**Protocol module:** L2 — Institutional memory  
**Capsule path:** `Founder/dna.json`  
**Source:** Expands [FOUNDER_PROFILE.md](../FOUNDER_PROFILE.md)  
**Rule:** Professional collaboration traits only — **never** private personal information.

---

## Purpose

Founder DNA captures how the founder thinks, decides, reviews, and communicates — so any AI collaborates as though it has worked with the founder for months.

---

## dna.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "profileVersion": "1.0.0",
  "redaction": {
    "piiIncluded": false,
    "credentialsIncluded": false,
    "personalLifeIncluded": false
  },
  "creativePhilosophy": {
    "coreBelief": "Studio OS is a living headquarters, not SaaS dashboard software",
    "principles": [
      "Place-driven navigation — every feature needs an address in Studio World",
      "Graphics-first executive IA — environments, not widget grids",
      "Canon is sacred — ideas explore freely; production requires explicit promotion"
    ],
    "spatialThinking": true,
    "visualStorytelling": true
  },
  "leadershipPhilosophy": {
    "visionStyle": "Long-horizon civilization building",
    "decisionAuthority": "Founder final on canon and scope",
    "riskTolerance": "Low for production canon violations; high for exploratory architecture",
    "delegation": "Composer implements within approved sprint; ChatGPT architects"
  },
  "qualityStandards": {
    "nonNegotiables": [
      "Normal browser tabs must work — private/incognito is not a workflow",
      "Diagnostic layer reliable before feature resume",
      "Governed generation respected — no silent auth bypass",
      "Zero canon contradictions without logged supersession"
    ],
    "verificationDefault": "Real phone, normal tab, production-like path"
  },
  "reviewProcess": {
    "architectureFirst": true,
    "implementationAgainstPassCriteria": true,
    "designCritique": "Preserve what works; surgical changes only",
    "evidenceLabels": ["proven", "inferred"],
    "adminPages": "Protected by default — explicit page name required to change"
  },
  "decisionStyle": {
    "framework": [
      "Does it have a home in Studio World?",
      "Does Genesis constitution allow it?",
      "Architecture or implementation? (Separate conversations)",
      "Smallest correct diff?",
      "Verify on real phone in normal tab?"
    ],
    "preferredOutput": "Decision memo with alternatives before large sprints"
  },
  "abstractionPreference": {
    "level": "systems-first",
    "teachingMode": "Deconstruct into what / owns / must never do / verify",
    "analogySource": "Studio World districts — Institute, Works, Council, Atlas"
  },
  "explanationStyle": {
    "structure": "Conclusion first, then reasoning",
    "format": "Complete sentences — no telegraphic shorthand",
    "visualAids": ["Diagrams", "Tables", "Geographic analogies"],
    "terminology": "Teach canon terms naturally during real work"
  },
  "systemsThinking": {
    "prefersGraphs": true,
    "connectsFeaturesToDistricts": true,
    "tracksDependencies": true,
    "institutionalMemoryAware": true
  },
  "longTermGoals": [
    "Studio OS understandable in ten years via infill districts, not redesign",
    "AI continuity without manual re-explaining",
    "Software preserves code; Studio OS preserves understanding"
  ],
  "learningStyle": {
    "mode": "Build and observe failures frozen with evidence",
    "aiStackPreference": {
      "chatgpt": "Creative Director — architecture and sprint design",
      "composer": "Implementer — code and forensic debugging",
      "terra": "Governance — canon and production gates"
    },
    "onboardingExpectation": "Minutes via capsule, not hours via re-explaining"
  },
  "workingStyle": {
    "mobileFirst": true,
    "forensicBeforeRepair": true,
    "oneDeployPerTask": true,
    "surgicalChanges": true
  },
  "sourceRef": "docs/ai-collaboration/FOUNDER_PROFILE.md"
}
```

---

## Allowed vs forbidden fields

| Allowed | Forbidden |
|---------|-----------|
| Creative and leadership philosophy | Legal name beyond public brand |
| Quality and review standards | Home address, family, health |
| Decision and communication style | Credentials, API keys, passwords |
| Risk tolerance (professional) | Private financial details |
| Long-term product goals | Personal relationships |
| Collaboration preferences | Unbounded chat logs with PII |

---

## Relationship to capsule v2

| v2 path | v3 path |
|---------|---------|
| `Founder/profile.json` | Retained as summary view |
| — | `Founder/dna.json` — structured DNA model |

Export includes both: `profile.json` for quick read; `dna.json` for deep onboarding.

---

## AI usage contract

1. Treat Founder DNA as behavioral contract — not suggestions  
2. Apply `qualityStandards.nonNegotiables` before any implementation  
3. Match `explanationStyle` in all founder-facing output  
4. Route architecture questions through `decisionStyle.framework`  
5. Flag onboarding report if DNA conflicts with handoff (founder may have evolved)  

---

*Protocol module — specification only*
