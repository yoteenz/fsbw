# Compatibility Matrix

**Protocol module:** Multi-AI handoff  
**Capsule path:** `Manifest/compatibility.json`  
**Rule:** One capsule → identical institutional memory across platforms.

---

## Purpose

AI Context Protocol is platform-neutral. The compatibility matrix documents which platforms support which protocol features and import workflows.

---

## compatibility.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "protocolVersion": "1.0.0",
  "manifestVersion": 3,
  "platformNeutral": true,
  "platforms": [
    {
      "id": "chatgpt",
      "label": "ChatGPT",
      "importMethods": ["file-upload-zip", "file-upload-json-modules"],
      "maxUploadMb": 15,
      "supportsBootstrap": true,
      "supportsOnboardingReport": "manual-prompt",
      "supportsPassport": "manual",
      "supportsKnowledgeDiff": true,
      "tested": true,
      "notes": "Primary Creative Director platform; upload .studiocapsule or key JSON extracts"
    },
    {
      "id": "claude",
      "label": "Claude",
      "importMethods": ["file-upload-zip", "project-knowledge"],
      "maxUploadMb": 30,
      "supportsBootstrap": true,
      "supportsOnboardingReport": "manual-prompt",
      "supportsPassport": "manual",
      "supportsKnowledgeDiff": true,
      "tested": false,
      "notes": "Project knowledge for static docs; capsule upload for full protocol"
    },
    {
      "id": "gemini",
      "label": "Gemini",
      "importMethods": ["file-upload"],
      "maxUploadMb": 20,
      "supportsBootstrap": true,
      "supportsOnboardingReport": "manual-prompt",
      "supportsPassport": "manual",
      "supportsKnowledgeDiff": true,
      "tested": false
    },
    {
      "id": "cursor",
      "label": "Cursor",
      "importMethods": ["repo-docs", "motherboard", "capsule-extract"],
      "maxUploadMb": null,
      "supportsBootstrap": true,
      "supportsOnboardingReport": "agent-auto",
      "supportsPassport": "future",
      "supportsKnowledgeDiff": true,
      "tested": true,
      "notes": "In-repo agents use motherboard/; capsule supplements external parity"
    },
    {
      "id": "studio-ai",
      "label": "Studio AI (future)",
      "importMethods": ["native-capsule-import"],
      "supportsBootstrap": true,
      "supportsOnboardingReport": "native",
      "supportsPassport": "native",
      "supportsKnowledgeDiff": "native",
      "tested": false,
      "notes": "Full protocol native support target"
    },
    {
      "id": "generic-llm",
      "label": "Generic LLM",
      "importMethods": ["markdown-paste", "json-paste"],
      "supportsBootstrap": true,
      "supportsOnboardingReport": "manual-prompt",
      "supportsPassport": "manual",
      "supportsKnowledgeDiff": "partial",
      "tested": false,
      "notes": "Minimum viable: bootstrap.md + handoff.md + operating manual"
    }
  ],
  "formatSupport": {
    "studiocapsuleZip": {
      "required": true,
      "manifestVersions": [2, 3]
    },
    "bootstrapJson": { "required": true, "sinceProtocol": "1.0.0" },
    "healthJson": { "required": true, "sinceProtocol": "1.0.0" },
    "memoryGraphJson": { "required": true, "sinceProtocol": "1.0.0" },
    "decisionsJson": { "required": true, "sinceProtocol": "1.0.0" },
    "canonJson": { "required": true, "sinceProtocol": "1.0.0" },
    "knowledgeDiffJson": { "required": false, "exportType": ["incremental", "sprint"] },
    "passportJson": { "required": false, "generatedOnImport": true }
  },
  "vendorNeutralRules": [
    "No platform-specific required fields in export archive",
    "All protocol data: UTF-8 JSON or Markdown",
    "readOrder uses internal paths only — not URLs",
    "Trademark names (™) preserved verbatim across platforms"
  ]
}
```

---

## Feature support matrix

| Feature | ChatGPT | Claude | Gemini | Cursor | Studio AI |
|---------|---------|--------|--------|--------|-----------|
| Bootstrap read | ✅ | ✅ | ✅ | ✅ | ✅ native |
| Health report | ✅ | ✅ | ✅ | ✅ | ✅ |
| Memory graph | ✅ | ✅ | ✅ | ✅ | ✅ |
| Decision memory | ✅ | ✅ | ✅ | ✅ | ✅ |
| Onboarding report | Prompt | Prompt | Prompt | Auto | Native |
| AI Passport | Manual | Manual | Manual | Future | Native |
| Knowledge diff | ✅ | ✅ | ✅ | ✅ | ✅ native |
| Canon engine | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Minimum viable import (any platform)

1. `Manifest/bootstrap.json` (or `bootstrap.md`)  
2. `CurrentSprint/handoff.md`  
3. `Workflow/operating-manual.md`  
4. `Founder/dna.json` or `Founder/profile.json`  

Full protocol import adds graph, canon, decisions, timeline, collaboration memory.

---

## Version compatibility

| Protocol | Manifest | Capsule |
|----------|----------|---------|
| 1.0.0 | 3 | 3.0.0 |
| 1.0.0 | 2 | 2.x (bootstrap optional — degraded mode) |

Import tools must declare degraded mode when manifest < 3 or bootstrap missing.

---

## Testing protocol (future)

For each platform marked `tested: true`:

1. Import reference capsule  
2. Generate onboarding report  
3. Verify blockers B1/B2 cited correctly  
4. Verify canon term "AI Context Protocol" used  
5. Compare report hash across platforms (semantic similarity ≥ 0.9)  

---

*Protocol module — specification only*
