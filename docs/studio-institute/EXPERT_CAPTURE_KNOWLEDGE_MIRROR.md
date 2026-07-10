# Expert Capture — Living Knowledge Mirror™

Evolution of Expert Capture from a one-time interview into a permanent, dual-sided knowledge relationship between experts and business owners.

## Architecture

```
Expert Interview Session
        ↓ sync (on approve)
KnowledgeProgram (canonical JSON document)
  ├── entries[]          — versioned knowledge stream items
  ├── versions[]         — supersession history
  ├── packets[]          — incremental training packets
  ├── competencies[]     — worker competency by area
  ├── authorizations[]   — partial granular permissions
  ├── notifications[]    — owner alerts
  └── conflicts[]        — detected opposing rules

Storage: localStorage cache + Supabase `expert_capture_knowledge_programs`
API: `/api/expert-capture/knowledge-mirror` (GET/POST)
```

### Governance (non-negotiable)

Only knowledge in `approved_for_training`, `scenario_tested`, or `active_knowledge` may enter worker training. Raw recordings, drafts, rejected, and deleted items never train the Studio professional.

Lifecycle: `recorded → transcribed → interpreted → expert_reviewed → owner_visible → approved_for_training → scenario_tested → active_knowledge`

## Core modules

| Path | Role |
|------|------|
| `knowledge-mirror/types.ts` | Canonical models |
| `knowledge-mirror/lifecycle.ts` | Governance helpers, state labels |
| `knowledge-mirror/sync-from-session.ts` | Session answers → entries |
| `knowledge-mirror/training-packets.ts` | Packet rebuild, supersede, conflicts |
| `knowledge-mirror/competency-core.ts` | Competencies, authorizations, scenario pass |
| `knowledge-mirror/confessional-service.ts` | Quick expert updates |
| `knowledge-mirror/owner-mirror-data.ts` | Owner snapshot + sandbox Q&A |
| `knowledge-mirror/program-orchestrator.ts` | Full program refresh |
| `knowledge-mirror/store.ts` | localStorage + server sync |
| `hooks/useKnowledgeMirror.ts` | React hook for UI actions |

## User journeys

### Expert

1. Conduct interview (existing flow) — approve answers in Knowledge Review
2. Approved answers sync to Knowledge Stream automatically
3. Submit individual entries or all expert-approved items for owner review
4. Record Knowledge Confessional updates (draft or submit)
5. Mark outdated knowledge; corrections create new versions (prior preserved)

### Owner

1. Open Owner Training Mirror — notifications, ready-for-review queue
2. Approve/reject/hold/restrict entries; approve packets for scenario testing
3. Pass scenario tests to activate packets and grant partial authorizations
4. Use Training Sandbox to query worker against approved knowledge only

## Production routes

| Route | Purpose |
|-------|---------|
| `/expert-capture/knowledge-stream` | Generic expert stream |
| `/expert-capture/confessional` | Generic confessional |
| `/expert-capture/owner-mirror` | Generic owner mirror |
| `/expert-capture/tax-preparation/knowledge-stream` | Tax expert stream |
| `/expert-capture/tax-preparation/confessional` | Tax confessional |
| `/expert-capture/tax-preparation/owner-mirror` | Tax owner mirror |
| `/expert-capture/all-in-one-permitting/knowledge-stream` | Permitting stream |
| `/expert-capture/all-in-one-permitting/confessional` | Permitting confessional |
| `/expert-capture/all-in-one-permitting/owner-mirror` | Permitting owner mirror |

Interview nav links (Stream, Confessional, Owner Mirror) appear once an expert session is started.

## Training packets (shared platform)

Profession-specific packet definitions in `packet-definitions.ts` — Tax Preparation and All In One Permitting share the same `KnowledgeProgram` schema.

Examples: Client Intake, Document Collection, Permit Submission, Tax Return Intake, Prior-Year Comparison, Escalation, Quality Control.

## Tests

Run: `npm run test -- src/studio-os-core/expert-capture/knowledge-mirror/knowledge-mirror-scenarios.test.ts`

Covers all 20 required sprint scenarios (partial approval, owner review, packets, supersession, confessional, privacy, outdated detection, multi-session).

## Deployment

Base URL: `https://fsbw.vercel.app`

See commit SHA in release notes after deploy.
