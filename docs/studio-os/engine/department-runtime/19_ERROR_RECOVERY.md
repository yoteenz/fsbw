# 19 — Error Recovery

**Engine Module:** `studio.department-runtime.v1.error-recovery`  
**Status:** Graceful degradation specification

---

## Philosophy

> The department never white-screens. Users always inhabit a place — even an incomplete one.

---

## Failure Categories

| Failure | Recovery |
|---------|----------|
| **Missing asset** | Load fallback → continue assembly |
| **Broken metadata** | Skip invalid placement → log → use defaults |
| **Missing Genome** | SDK default injection → Orb enrichment suggestion |
| **Failed AI** | Orb solo mode → Concierge degraded |
| **Offline assets** | Cache → fallback → skip |
| **Corrupt package** | Block load → redirect to HQ + Orb explain |
| **Provider timeout** | N/A at runtime — compile-time issue |
| **Permission denied** | Read-only department mode |
| **GPU failure** | Reduce quality profile → 2D fallback mode |

---

## Recovery Pipeline

```
Failure detected
    ↓
Classify severity (critical | degrading | warning)
    ↓
Execute recovery strategy
    ↓
Log to ErrorRecoveryAudit
    ↓
Emit runtime-error event
    ↓
Orb gentle notification (if user-visible)
    ↓
Continue or redirect
```

---

## Per-Subsystem Recovery

### Asset Loader

| Error | Recovery |
|-------|----------|
| Fetch fail | Retry 2× → fallback → skip |
| Checksum fail | Fallback → skip |
| GLB corrupt | Fallback mesh |

### World Assembler

| Error | Recovery |
|-------|----------|
| Missing attachment node | Place at metadata position sans attach |
| Overlap detected | Auto-offset 0.15 |
| Missing required object | Place fallback + warning |

### Genome Injection

| Error | Recovery |
|-------|----------|
| Genome service down | SDK defaults all slots |
| Domain empty | Per-hook fallback |
| Injection timeout | Partial inject + resume |

### Concierge / AI

| Error | Recovery |
|-------|----------|
| Concierge init fail | Role absent; Orb covers routing |
| TTS fail | Text panel fallback |
| Escalation fail | Log + notify founder async |

### Interaction

| Error | Recovery |
|-------|----------|
| Handler throw | Verb error state + Orb message |
| Permission service down | Deny write verbs |

---

## 2D Fallback Mode

When GPU unavailable or `reduced-capability` device:

- Spatial layout as annotated schematic
- Objects as interactive cards positioned by zone
- Full verb routing preserved
- Genome injection on typography/colors
- **Still not a traditional form dashboard** — zone-scoped cards

---

## Corrupt Package

```
manifest invalid OR critical assets missing
    ↓
Block assembly
    ↓
Redirect to Mission Control
    ↓
Orb: "Creative Direction is being restored. Try again shortly."
    ↓
Log for admin + Asset Registry quarantine
```

---

## ErrorRecoveryAudit

```yaml
ErrorRecoveryAudit:
  id: string
  departmentId: string
  failure: string
  severity: enum
  recoveryAction: string
  fallbackUsed: boolean
  userNotified: boolean
  timestamp: datetime
```

---

## User Communication

| Severity | User Sees |
|----------|-----------|
| Warning | Nothing or subtle Orb tip |
| Degrading | Ambient Orb note |
| Critical | Redirect + clear Orb explanation |

Never: stack traces, error pages, infinite spinners.

---

_Next: [20 — Runtime QA](./20_RUNTIME_QA.md)_
