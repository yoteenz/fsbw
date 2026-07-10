# Capsule Bootstrap System

**Protocol module:** L0 — Self-describing entry point  
**Capsule path:** `Manifest/bootstrap.json`  
**Rule:** First file read after checksum validation. Receiving AI never wonders where to begin.

---

## Purpose

Every capsule introduces itself — like `README.md` for Git, but **machine-first**.

---

## bootstrap.json schema

```json
{
  "schemaVersion": 1,
  "protocolVersion": "1.0.0",
  "capsuleKind": "ai-context-capsule",
  "identity": {
    "title": "Studio OS AI Context Capsule",
    "tagline": "Institutional memory clone for AI collaboration",
    "projectName": "Studio OS / Frontal Slayer",
    "organization": "Frontal Slayer"
  },
  "selfDescription": {
    "whatThisIs": "Portable institutional memory — not source code, not a doc zip.",
    "whatThisIsNot": ["A codebase export", "Private personal data", "Vendor-locked format"],
    "analogy": "Like git clone, but for organizational understanding."
  },
  "contentsSummary": [
    { "section": "Founder DNA", "path": "Founder/dna.json", "purpose": "Collaboration traits" },
    { "section": "Operating Manual", "path": "Workflow/operating-manual.md", "purpose": "How to work with founder" }
  ],
  "readOrder": ["Manifest/bootstrap.json", "Manifest/health.json", "Founder/dna.json", "..."],
  "compatibility": {
    "protocolMin": "1.0.0",
    "manifestMin": 3,
    "platformNeutral": true,
    "platforms": ["chatgpt", "claude", "gemini", "cursor", "studio-ai", "generic-llm"]
  },
  "projectMaturity": {
    "phase": "platform-stabilization",
    "stability": "active-development",
    "productionSurface": "Experience Lab blocked on Layer 1 auth"
  },
  "versions": {
    "capsuleVersion": "3.0.0",
    "contextVersion": "2026-07-10T16:00:00Z",
    "studioOsBuildId": "48a77da3c",
    "protocolVersion": "1.0.0"
  },
  "confidence": {
    "overall": 0.87,
    "handoffFreshnessHours": 4,
    "notes": "Handoff updated same day; Layer 1 blocker confirmed in code."
  },
  "missingSections": [],
  "warnings": ["Architecture/overview.md truncated to 32KB"],
  "firstActions": [
    "Read readOrder sequentially",
    "Generate onboarding report before contributing",
    "Treat CurrentSprint/handoff.md as authoritative over training data"
  ],
  "humanEntryPoint": "Assets/executive-summary.md"
}
```

---

## Bootstrap narrative (human mirror)

`Manifest/bootstrap.md` — same content in prose for founders skimming inside Archive.

---

## AI read contract

1. Parse `bootstrap.json`
2. If `missingSections` non-empty → note gaps in onboarding report
3. If `confidence.overall` < 0.7 → ask founder to confirm handoff freshness
4. Follow `readOrder` exactly unless `exportType` is partial (then bootstrap lists subset)
5. Emit onboarding report before implementation prompts

---

## Generation source

| Field | Source |
|-------|--------|
| `contentsSummary` | Capsule builder inventory |
| `projectMaturity` | CURRENT_HANDOFF + CORE |
| `confidence` | health.json scores |
| `missingSections` | health.json gaps |
| `readOrder` | Protocol default + export type filter |

---

*Protocol module — specification only*
