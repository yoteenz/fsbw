# recordShellStage Job Board Forensic Report

**Sprint:** P0 — “The Job Board May Be Blocking the Construction Crew”  
**Report date:** 2026-07-12  
**Classification:** Instrumentation only — **no repair**

---

## Purpose

Prove whether `recordShellStage('create-shell-request', 'running')` blocks or triggers a blocking downstream reaction before package resolution begins.

---

## Activation

```
/admin/studio/experience-lab?compilerDiag=1
```

Shell Foundation Black Box → **JOB BOARD FORENSICS — recordShellStage**

---

## RSS step map (actual implementation)

| ID | Operation |
|----|-----------|
| RSS-01 | Enter `recordShellStage` |
| RSS-01b | Diagnostic enabled guard |
| RSS-02 | Locate stage definition (`SHELL_FOUNDATION_STAGE_DEFS.find`) |
| RSS-03 | Get existing stage record (`stages.get`) |
| RSS-04 | Mutate stage fields (running vs terminal) |
| RSS-05 | `stages.set(id, existing)` |
| RSS-06 | `pushTimeline` |
| RSS-07 | `heartbeat.lastStateTransition` update |
| RSS-08 | `detectStalls` |
| RSS-09 | `notify()` |
| RSS-09a | `persist()` |
| RSS-09a1 | `buildShellFoundationBlackBoxStateForPersist` |
| RSS-09a2 | `JSON.stringify` |
| RSS-09a3 | `sessionStorage.setItem` |
| RSS-09b | Subscriber callback iteration |
| RSS-10 | Return |

---

## Documented Fact

- Stall occurs before package resolution (GSPU-03 never begins)
- Leading suspect: `recordShellStage('create-shell-request', 'running')`
- No auth, request helper, fetch, or provider path reached
- Wrapper/body duplicate invocation is instrumentation-only

## Inference

- If GSPU-02a (`before recordShellStage`) is running and RSS markers show stall at RSS-09a2/RSS-09b, blocking is in persistence or subscriber notification
- `notify()` always calls `persist()` then iterates `listeners` synchronously
- Panel subscriber calls `buildShellFoundationBlackBoxState()` on each notification

## Unknown

- Exact blocking RSS marker on founder device until post-deploy mobile run

---

## Reentrancy classifications

| Code | Meaning |
|------|---------|
| A | No reentrancy |
| B | Expected nested instrumentation |
| C | Direct recursion |
| D | Subscriber-induced recursion |
| E | Persistence-induced recursion |
| F | Derived-state feedback loop |

---

## RSS stall classifications

A — Stage lookup  
B — Stage mutation  
C — Timeline append  
D — Serialization  
E — sessionStorage write  
F — Subscriber notification  
G — Subscriber callback  
H — Reentrant recursion  
I — Derived-state feedback loop  
J — React external-store snapshot  
K — Other

---

## Repair status

**None.** Instrumentation only.

---

## Tests

`record-shell-stage-forensic.test.ts` — RSS markers, reentrancy, subscribers, persistence, controlled skip comparison.
