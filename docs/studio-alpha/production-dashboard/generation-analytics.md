# Generation Analytics™

**Module:** `studio-alpha.production-dashboard.v1.generation`  
**Status:** Full provider visibility — **internal only**

---

## Law

> Studio Alpha™ operators see **truth** — FAL · models · tokens · GPU cost.

This module is **never** rendered in Studio OS founder UI.

See [boundary-rules.md](./boundary-rules.md).

---

## Tracked Metrics

| Metric | Definition |
|--------|------------|
| **FAL Provider** | Provider route (FAL · OpenAI · Runway · etc.) |
| **Model Used** | Model slug · e.g. `fal-ai/nano-banana-pro/edit` |
| **Resolution** | Output dimensions · aspect ratio |
| **Generation Time** | Wall-clock seconds |
| **Failures** | Failed job count · period |
| **Retry Count** | Retries per job · Retry Engine™ |
| **Average Queue Time** | Queue → start latency |
| **Average Approval Time** | Complete → approval latency |
| **Generation Success Rate** | `completed / (completed + failed)` |
| **Token Usage** | Input/output tokens — **internal only** |
| **GPU Cost** | Actual provider invoice cost — **internal only** |

---

## Generation Analytics Snapshot

```yaml
GenerationAnalyticsSnapshot:
  period: day | week | month | all_time
  totals:
    jobsCompleted: number
    jobsFailed: number
    successRate: number
    totalGpuCostUsd: number
    totalTokens: number
    avgGenerationTimeSeconds: number
    avgQueueTimeSeconds: number
    avgApprovalTimeSeconds: number
  byProvider:
    - provider: string
      model: string
      jobCount: number
      gpuCostUsd: number
      avgTimeSeconds: number
      failureRate: number
  byDepartment:
    - departmentId: string
      gpuCostUsd: number
      jobCount: number
  recentFailures: FailureRecord[]
```

---

## Failure Record

```yaml
FailureRecord:
  jobId: string
  timestamp: ISO8601
  department: string
  layer: string | null
  provider: string
  model: string
  failureReason: timeout | quality | provider_error | validation
  retryCount: number
  resolved: boolean
```

---

## Panel Layout

```
GENERATION ANALYTICS (Internal)
────────────────────────────────────
Success Rate              94.2%
Avg Generation Time       48s
Avg Queue Time            12s
Avg Approval Time         4h 22m
────────────────────────────────────
GPU Cost (month)          $4,218.44
Token Usage (month)       2.4M
Failures (month)          18
────────────────────────────────────
Top Provider: FAL / nano-banana-pro   $3,102.00
```

---

## Relationship to Founder Plane

| Internal field | Founder sees |
|----------------|--------------|
| GPU Cost $0.04 | Estimated Production Cost™ $0.42 |
| Token 12,400 | Estimated Time 2m 12s |
| FAL nano-banana-pro | "Production pipeline" |
| Failure provider_error | "Production retrying" |

Mapping rules in [boundary-rules.md](./boundary-rules.md).

---

## Data Source

[Studio Generation Manager™](../../studio-os/engines/generation-manager/README.md) build reports · provider callbacks · internal rate cards.

---

_Generation Analytics™ — ILM-grade operator truth._
