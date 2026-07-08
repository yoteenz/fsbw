# Future Automation — Studio Builder™

**Sprint:** Alpha 002  
**Purpose:** Architect API-ready path now — implement when providers connect

---

## Target Experience

```
[ Generate Environment ]
         ↓
Studio OS compiles prompt          (same as today)
         ↓
Studio OS sends to configured provider   (NEW — no copy)
         ↓
Studio OS waits for completion         (NEW — poll/webhook)
         ↓
Studio OS downloads result               (NEW)
         ↓
Studio OS validates                    (same)
         ↓
Studio OS stores in Registry™          (same)
         ↓
Studio OS unlocks next stages           (same)
         ↓
Founder watches queue progress only
```

**Zero** manual copy · upload · tracking.

---

## UI Delta from Alpha Temporary

| Alpha v0.2 | Automated |
|------------|-----------|
| Prompt Ready + Copy | Brief "Sending to FAL…" or skip entirely |
| Open Generator | Removed from primary flow |
| Upload Result | Removed — artifact auto-ingested |
| Awaiting Upload status | `Generating…` only |
| Founder at FAL | Founder in Studio Builder queue |

Optional: **Manual Upload Override** in asset detail ⋮ for edge cases.

---

## Provider Integration Architecture

```
Studio Builder
    ↓ generateRequest(groupId, projectId)
Generation Manager™
    ↓ submitJob(expandedPrompt)
Provider Adapter (FAL · OpenAI · Runway · …)
    ↓ webhook | poll
Artifact Storage
    ↓ artifactRef
Validation Workflow
    ↓
Registry™ + Unlock
    ↓
Builder UI update (websocket)
```

**No refactor** of Builder UI structure — swap step 8–9 in [production-flow.md](./production-flow.md).

---

## Configuration (Org-Level — Not Founder)

```
Studio Settings (admin)
├── Default image provider: FAL
├── Default mesh provider: FAL
├── API credentials: env / vault
└── Failover: enabled
```

Founder never sees API keys.

---

## Job Lifecycle (Automated)

| Builder shows | Manager state |
|---------------|---------------|
| Preparing… | ingest + compile |
| Generating… | provider pending/processing |
| Reviewing Quality… | validating |
| ✓ Complete | approved + registry |

Prompt Ready state **skipped** in automation mode.

---

## Progress + ETA (Enhanced)

Real provider progress when available:

```
ARCHITECTURE    Generating…  ████░░  FAL job 78%
                ~2 min remaining
```

Fallback: indeterminate spinner + Manager estimate.

---

## Queue Controls (Enabled)

| Control | Behavior |
|---------|----------|
| Pause | Finish in-flight · hold queue |
| Resume | Continue |
| Generate All Ready | Dispatch all unlocked groups sequentially |
| Cancel | Cancel provider jobs where supported |

---

## Error Recovery (Automated)

| Failure | Builder | Manager |
|---------|---------|---------|
| Provider timeout | Needs Revision row | Retry engine |
| Provider down | Banner + auto failover | Switch adapter |
| Validation fail | Retry button | Surgical regen |
| Partial group fail | Group In Progress | Per-asset retry |

Founder action: **Retry** or **Approve revision** — not debug provider logs.

---

## Webhook vs Poll

| Mode | When |
|------|------|
| Webhook | Production Vercel/serverless |
| Poll | Alpha dev · fallback |

Builder subscribes to `generation.item.stateChanged` events.

---

## Cost Display (Future)

```
Session cost: $32.70 · 385 credits
```

In queue footer — optional · from Manager cost tracking.

---

## Multi-Provider Routing

Generation Manager selects provider — Builder displays result only:

```
Provider: FAL (auto)
```

Change provider = admin settings — not founder per asset.

---

## Parallel Generation

When enabled:

```
ARCHITECTURE    Generating…
LIGHTING        Generating…   (parallel after deps met)
FURNITURE       Queued
```

Queue ETA drops — UI already supports multiple `Generating…` rows.

---

## Department Template

Automation path **identical** for every department:

```yaml
DepartmentBuilderConfig:
  departmentId: creative-direction | discover | story
  productionGroups: []      # from manifest
  knowledgeIngest: []       # department-specific internal paths
  automationReady: true
```

Only ingest paths and group labels change.

---

## Migration Checklist

| Step | Owner |
|------|-------|
| FAL adapter implement | Engineering |
| Hide Copy/Upload UI flag | `BUILDER_AUTOMATION_MODE=true` |
| Webhook endpoint | API route |
| Storage bucket | Artifact plane |
| E2E CDS full auto job | Alpha validation Phase D |

---

## Founder Message on Automation Launch

```
Studio OS now generates assets automatically. Press Generate and watch production.
```

Remove Alpha temporary banner.

---

_Future automation — architected today, invisible copy-paste tomorrow._
