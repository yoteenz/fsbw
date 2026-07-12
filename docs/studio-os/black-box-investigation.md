# Studio OS Black Box Investigation™

**Status:** Observe-only forensic layer — **no production fixes**.  
**Routes:** `/__studio-os-flight-recorder` · `/__studio-os-session-report`  
**Code:** `src/studio-os/diagnostics/`

---

## Mission

Capture every significant event leading up to platform failure with **evidence only**. No repair proposals until we can answer:

> What single event **ALWAYS** occurs immediately before the heartbeat dies?

---

## Architecture

```
src/studio-os/diagnostics/
├── flight-recorder/     Append-only event log (IndexedDB + memory mirror)
├── event-timeline/      Chronological analysis + gap detection
├── environment-diff/    Safari/Chrome/normal/private fingerprint compare
├── lifecycle-monitor/   Routes, errors, remounts, long tasks
├── state-monitor/       Ownership map + storage write observation
├── subscription-graph/  Publisher → subscriber → side effect mapping
├── timer-inventory/     setTimeout/setInterval/RAF registration log
└── session-report/      End-of-session forensic bundle
```

**Isolation rule:** Monitors wrap or listen passively. Original behavior is unchanged.

---

## Flight recorder event schema

Each append-only event includes:

| Field | Description |
|-------|-------------|
| `id` / `eventId` | Monotonic sequence + session-scoped id |
| `timestamp` / `isoTime` | Wall clock |
| `type` | e.g. `BOOT_STARTED`, `HEARTBEAT_STOPPED`, `COMPILER_STAGE_ENTER` |
| `source` / `caller` | Module + stack snippet |
| `route` / `url` | Current navigation |
| `browser` / `platform` | UA + platform |
| `company` / `stationId` / `shellId` / `compileRunId` | Context overlay |
| `heartbeatState` | Read-only snapshot from `window.__MTD` |
| `registryVersion` / `sceneStackVersion` | Genesis/scene versions |
| `reactRenderCount` / `activeSubscriptions` | Runtime counters |
| `detail` | Event-specific payload |

**Nothing is deleted or overwritten.**

---

## Logged event types

`BOOT_STARTED` · `BOOT_COMPLETED` · `AUTH_STARTED` · `AUTH_COMPLETED` · `GENESIS_LOADED` · `REGISTRY_LOADED` · `SCENE_STACK_CREATED` · `SCENE_STACK_UPDATED` · `STATION_CREATED` · `STATION_RESTORED` · `SHELL_CREATED` · `SHELL_LOADED` · `SHELL_INVALIDATED` · `COMPILER_STARTED` · `COMPILER_STAGE_ENTER` · `COMPILER_STAGE_COMPLETE` · `COMPILER_FAILED` · `HEARTBEAT_STARTED` · `HEARTBEAT_STOPPED` · `HEARTBEAT_TIMEOUT` · `ROUTE_CHANGED` · `CONTEXT_UPDATED` · `STORE_UPDATED` · `PROVIDER_RENDER` · `COMPONENT_MOUNT` · `COMPONENT_UNMOUNT` · `COMPONENT_REMOUNT` · `ERROR_BOUNDARY` · `SERVICE_WORKER_MESSAGE` · `CACHE_UPDATED` · `SESSION_RESTORED` · `TIMER_REGISTERED` · `SUBSCRIPTION_ATTACHED` · `STORAGE_WRITE` · `LONG_TASK` · `ENV_SNAPSHOT` · `SESSION_REPORT`

---

## Usage

### Automatic (boot)

Flight recorder initializes in `main-legacy.tsx` via `initStudioOsFlightRecorder()` — runs on every legacy app load.

### Manual context registration

Experience Lab / compiler code can register context **without changing behavior**:

```javascript
window.__STUDIO_OS_REGISTER_CONTEXT__?.({
  stationId: '…',
  shellId: '…',
  compileRunId: '…',
});

window.__STUDIO_OS_RECORD__?.('COMPILER_STAGE_ENTER', 'my-module', {
  detail: { stage: 'assemble-scene' },
});
```

### Environment diff (normal vs private)

1. Open `/__studio-os-flight-recorder`
2. Select label (`safari-normal`, `safari-private`, `chrome-normal`, `chrome-incognito`)
3. Click **Capture env fingerprint** in each browser mode
4. Open `/__studio-os-session-report` — differing values only

### Session report

- Auto-generated on `pagehide`
- Manual rebuild via **Rebuild forensic report** on `/__studio-os-session-report`
- Persisted to `sessionStorage.studioOsFlightRecorderLastReport_v1`

---

## Forensic report fields

| Field | Purpose |
|-------|---------|
| `finalSuccessfulEvent` | Last normal event before failure |
| `firstAbnormalEvent` | First `HEARTBEAT_STOPPED`, `ERROR_BOUNDARY`, etc. |
| `firstIrreversibleFailure` | First event after which recovery did not occur |
| `failureClassification` | Evidence-based category (not speculation) |
| `timeline.gapDescription` | Missing expected step or success→abnormal gap |
| `timerInventory` | All registered timers + ~3s cadence candidates |
| `subscriptionLoops` | Detected pub/sub cycles |
| `ownershipConflicts` | Multi-writer state keys |
| `environmentDiff` | Normal vs private differing values |

---

## State ownership map

Static baseline in `state-monitor/ownership-registry.ts` for:

Heartbeat · Scene Stack · Compiler · Registry · Genesis · Shell · Station · Compile Job · Current Company · Current Route

Runtime mutation counts observed via storage write tap (genesis/studio keys only).

---

## Absolute rule

**No repair sprint authorized** until flight recorder proves one event that **ALWAYS** precedes heartbeat death across normal-tab Safari and Chrome iOS runs.

---

## Evolution: Studio OS Nervous System™

**Classification:** Planned architecture · **Documented Fact** (this forensic layer exists today)

Black Box Investigation is the **forensic precursor** to the permanent **[Studio OS Nervous System™](./STUDIO_OS_NERVOUS_SYSTEM.md)**.

| Today (Documented Fact) | Tomorrow (Planned) |
|-------------------------|-------------------|
| Append-only Flight Recorder | Continuous operational intelligence |
| Forensic routes (`/__studio-os-flight-recorder`) | Org-scoped health always-on |
| Manual session export | Operational memory + incident history |
| Observe-only during incidents | Every subsystem explains itself proactively |

**Rule:** Flight Recorder capabilities are **not** temporary. They seed the Nervous System. Do not remove forensic instrumentation when Nervous System phases ship — **elevate** it.

---

## Related

- **[Studio OS Nervous System™](./STUDIO_OS_NERVOUS_SYSTEM.md)** — Planned operational intelligence constitution
- Experience Engine bisect: `/__experience-engine-bisect` · `docs/studio-os/experience-engine-freeze-bisect.md`
- Main-thread overlay: `window.__MTD` (unchanged by this sprint)
