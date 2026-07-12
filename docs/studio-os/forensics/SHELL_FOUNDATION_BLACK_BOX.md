# Shell Foundation Black Box — Forensic Instrumentation

**Sprint:** P0 — “Why Does the Foundation Crew Stop Working?”  
**Report date:** 2026-07-12  
**Classification:** Instrumentation only — **no repair**

---

## Purpose

Make shell construction fully observable on founder mobile devices when `?compilerDiag=1` is active. Answer:

> What is the very last successful thing the shell pipeline did before it stopped?

Without desktop DevTools, Vercel dashboard, or terminal logs.

---

## Activation

```
https://fsbw.vercel.app/admin/studio/experience-lab?compilerDiag=1
```

- Session persists `compilerDiag=1` in `sessionStorage`
- Collapsible **Shell Foundation Black Box™** panel appears below Creative Studio render footer
- Copy / Export JSON for ChatGPT screenshot workflow

---

## Instrumentation map

| Layer | File | Role |
|-------|------|------|
| Dispatch desk | `generate-shell-dispatch-desk.ts` | GSPU sub-stages inside `generateShellPublicUrl()` |
| Black box store | `shell-foundation-black-box.ts` | Stages, traces, awaits, network, timeline, stalls, dispatchDesk |
| Shell pipeline | `validation-shell-pipeline.ts` | `traceShellAsync` at each shell phase |
| UI panel | `ShellFoundationBlackBoxPanel.tsx` | Sections A–J live display |
| Experience Lab | `CreativeStudioRenderPreview.tsx` | Panel mount when `compilerDiag=1` |

---

## Sections (A–J + Dispatch Desk)

| Section | Content |
|---------|---------|
| **Dispatch Desk** | GSPU sub-stages, invocations, auth/fetch/promise state, stall classification |
| **Job Board** | RSS micro-markers inside `recordShellStage`, subscribers, persistence, reentrancy |
| **Independent Forensic Recorder** | Append-only raw execution ledger (IFR-01…IFR-16); primary evidence authority |
| A | Shell pipeline stages (pending/running/success/failed/skipped + duration) |
| B | Function enter/exit/throw trace |
| C | Await tracker (pending highlight >5s) |
| D | Shell-related network (studio-builder-generate) |
| E | State snapshots (shellId, compileRunId, pipeline phase) |
| F | Dependency graph |
| G | Error chain |
| H | Heartbeat / last progress |
| I | Stall detector |
| J | Chronological timeline |

---

## Persistence

- `sessionStorage` key: `shellFoundationBlackBox_v1`
- Survives exceptions and pipeline failure
- Not cleared on UI error boundary unless session cleared

---

## Documented Fact

- Shell construction stops inside `generateShellPublicUrl()` at `create-shell-request`
- **No observable network activity** in current trace (`network: []`)
- First unresolved boundary after `create-shell-request` — internal GSPU sub-stage (see Dispatch Desk)
- **No shell behavior, timing, retry, or API contract changes** in this sprint
- Shell failure remains **unresolved** — instrumentation only

## Inference

- Duplicate `generateShellPublicUrl()` function trace = Category F (wrapper + inner), not two independent callers
- Stall before `GSPU-15-fetch-started` → fetch never invoked OR authorization wait at token path

## Unknown

- Exact active sub-stage on founder device until post-deploy mobile run
- Repair approach until Dispatch Desk evidence captured

---

## Tests

`shell-foundation-black-box.test.ts`, `generate-shell-dispatch-desk.test.ts` — stage telemetry, dispatch sub-stages, awaits, network, stalls, persistence.

---

## Founder mobile workflow

1. Open Experience Lab with `?compilerDiag=1`
2. Tap **Start compile run**
3. Watch Shell Foundation Black Box panel sections A + J
4. Screenshot last successful stage + timeline terminus
5. Optional: **Copy** or **Export** JSON to ChatGPT

---

## Repair status

**None.** Await founder evidence from black box before repair sprint.
