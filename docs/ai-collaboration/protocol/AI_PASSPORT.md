# AI Passport™

**Protocol module:** L4 — Accountability per import  
**Capsule path:** `Manifest/passport.json` (generated on import; not bundled in export)  
**Purpose:** Every AI interaction receives provenance — context version, import timestamp, understanding confirmation.

---

## Purpose

The AI Passport creates accountability across multi-AI handoff:

- Which capsule version was read  
- When import occurred  
- Which platform hosted the AI  
- Whether onboarding report was completed  
- Project generation and compatibility status  

---

## passport.json schema (import output)

```json
{
  "schemaVersion": 1,
  "passportId": "passport-2026-07-10T17:05:00Z-chatgpt-abc123",
  "issuedAt": "2026-07-10T17:05:00Z",
  "contextVersion": "2026-07-10T16:00:00Z",
  "capsuleVersion": "3.0.0",
  "capsuleId": "capsule-2026-07-10-protocol-v1",
  "protocolVersion": "1.0.0",
  "manifestVersion": 3,
  "importTimestamp": "2026-07-10T17:00:00Z",
  "platform": {
    "id": "chatgpt",
    "model": "gpt-4o",
    "sessionRef": null
  },
  "understandingConfirmation": {
    "onboardingReportGenerated": true,
    "onboardingReportId": "report-2026-07-10T17:04:00Z",
    "founderAcknowledged": false,
    "confidenceSelfScore": 0.88,
    "readOrderCompleted": true
  },
  "projectGeneration": 3,
  "compatibility": {
    "protocolSupported": true,
    "manifestSupported": true,
    "warnings": [],
    "blocks": []
  },
  "checksumVerification": {
    "archiveSha256Verified": true,
    "manifestSha256Verified": true
  },
  "knowledgeDiffApplied": {
    "applied": true,
    "baseCapsuleId": "capsule-2026-07-10-48a77da"
  },
  "expiresAt": null,
  "notes": "Import via manual file upload — no Studio Archive integration yet"
}
```

---

## Passport lifecycle

```
EXPORT (no passport)
    ↓
IMPORT → validate checksums + health
    ↓
ISSUE passport.json
    ↓
GENERATE onboarding report (linked by onboardingReportId)
    ↓
COLLABORATE (passport referenced in session metadata)
    ↓
OPTIONAL: export updated passport back to Archive on session close
```

---

## Required fields (accountability minimum)

| Field | Purpose |
|-------|---------|
| `contextVersion` | Which institutional memory snapshot |
| `capsuleVersion` | Capsule format + content bundle |
| `importTimestamp` | When AI ingested memory |
| `understandingConfirmation` | Proof onboarding report ran |
| `projectGeneration` | Institutional maturity marker |
| `compatibility` | Platform support status |

---

## Multi-AI handoff rule

Identical capsule + identical readOrder → passports should reflect same `contextVersion` and `capsuleId`.

Platform-specific fields (`platform.model`, `sessionRef`) vary; institutional memory fields must not.

---

## passport.schema.json (bundled in capsule)

Export includes schema only — template for import tools:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://studio-os.dev/schemas/ai-context-protocol/passport.v1.json",
  "title": "AI Passport",
  "description": "Generated on import — not included in export archive"
}
```

---

## Future: Studio Archive integration

- Passport stored per import session in Archive  
- Founder dashboard: "ChatGPT session 2026-07-10 read capsule v3.0.0"  
- Audit trail for canon violations traced to stale passport  

---

## Security

Passport must never contain:

- Raw capsule secrets  
- Founder PII  
- Full onboarding report body in passport (link by ID only)  

---

*Protocol module — specification only*
