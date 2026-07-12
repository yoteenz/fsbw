# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-12  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Independent Forensic Recorder**

**Status: Complete (instrumentation shipped) — shell stall unresolved.**

Append-only IFR ledger independent of RSS/GSPU/Black Box stores; IFR-01…IFR-16 disputed-window instrumentation; mobile raw export; reconciliation table.

**Previous:** recordShellStage Job Board RSS forensics (`b9ffb71ea`).

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-Shell** | Shell construction never finishes | **In Progress** — IFR shipped; repair awaits founder IFR export |

---

## Founder workflow

```
/admin/studio/experience-lab?compilerDiag=1
```

1. Tap **Start compile run**
2. Open **INDEPENDENT FORENSIC RECORDER** (top of Black Box panel)
3. **Copy raw events** or **Export raw JSON**
4. Compare IFR-01…IFR-16 sequence with RSS Job Board + GSPU micro-trace exports (same `compileRunId`)

**First missing IFR event after a recorded before-event = next proven repair boundary.**

---

## References

- `docs/studio-os/forensics/INDEPENDENT_FORENSIC_RECORDER.md`
- `docs/studio-os/forensics/RECORD_SHELL_STAGE_JOB_BOARD.md`
- `docs/studio-os/forensics/GENERATE_SHELL_DISPATCH_DESK.md`
- `docs/studio-os/forensics/SHELL_FOUNDATION_BLACK_BOX.md`
