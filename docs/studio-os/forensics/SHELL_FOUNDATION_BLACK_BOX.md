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
| Black box store | `shell-foundation-black-box.ts` | Stages, traces, awaits, network, timeline, stalls |
| Shell pipeline | `validation-shell-pipeline.ts` | `traceShellAsync` at each shell phase |
| UI panel | `ShellFoundationBlackBoxPanel.tsx` | Sections A–J live display |
| Experience Lab | `CreativeStudioRenderPreview.tsx` | Panel mount when `compilerDiag=1` |

---

## Sections (A–J)

| Section | Content |
|---------|---------|
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

- Shell construction is the first visible unresolved boundary after completion-authority repair
- **No shell behavior, timing, retry, or API contract changes** in this sprint
- Shell failure remains **unresolved** — instrumentation only

---

## Tests

`shell-foundation-black-box.test.ts` — stage telemetry, function trace, await, network, errors, stalls, persistence.

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
