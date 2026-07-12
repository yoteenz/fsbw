# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-12  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — recordShellStage reentrancy / subscriber stall forensics**

**Status: Complete (instrumentation shipped) — shell stall unresolved.**

Job Board RSS micro-trace around `recordShellStage` — subscribers, persistence, reentrancy.

**Previous:** Department Package micro-trace (`bee29d366`).

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-Shell** | Shell construction never finishes | **In Progress** — RSS job-board forensics shipped; repair awaits proven RSS marker |

---

## Founder workflow

```
/admin/studio/experience-lab?compilerDiag=1
```

1. Tap **Start compile run**
2. Open **Dispatch Desk** → **CONTRACTOR DIRECTORY MICRO-TRACE**
3. Screenshot / Copy / Export JSON

---

## References

- `docs/studio-os/forensics/GENERATE_SHELL_DISPATCH_DESK.md`
- `docs/studio-os/forensics/SHELL_FOUNDATION_BLACK_BOX.md`
