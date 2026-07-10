# Genesis Core™ — Verification Plan

**Version:** 1.0.0

---

## Verification environments

| Environment | Priority |
|-------------|----------|
| iPhone Safari (real device) | P0 |
| iPhone Chrome | P1 |
| iPad Safari | P1 |
| Desktop Chrome | P1 |
| Desktop Safari | P2 |

Project rule: **mobile-first QA** per `AGENTS.md`.

---

## Experience Lab validation matrix

| Test | Method | Pass |
|------|--------|------|
| Visual state transitions | `GenesisCoreDebugPanel` cycle all modes | Each mode distinct, no flash |
| Compiler sync | Run full Experience Lab compile | Orb intensities monotonic; matches stage bar |
| Runtime health | Simulate stall / failure | warning → critical accurate |
| Light intensity | Compare debug readout vs visual | energyIntensity tracks table |
| Animation behavior | 60s idle observe | 6–8s breathe, no drift crash |
| Mobile performance | Safari Web Inspector FPS | ≥ 30fps effective, no long tasks |
| Reduced-motion | OS setting on | Static tier, instant cuts |
| Failure accuracy | Force `COMPILE_FAILED` | Critical fracture, shell intact |
| No placeholder rects | Visual inspection | Actual Genesis Orb layers |
| Offscreen pause | Scroll orb offscreen | rAF stops |

---

## State ownership tests

```typescript
// genesis-core-store.test.ts
- completedStages only appends per activeRunId
- progress never decreases within run
- success pulse reverts to compiling if more stages remain
- critical does not clear completedStages
- subscribers cannot mutate store directly
```

---

## Compiler integration tests

```
1. Start compile → mode compiling, awakening energy ≥ 0.25
2. Complete load-shell → completedStages includes load-shell
3. Complete mount-landmark → energy ≥ 0.5, nucleus visible
4. Fail at apply-materials → critical, failureCode set
5. Retry → resume from load-shell lock, not dormant
6. Complete render-final-scene → success pulse → idle with full energy
```

Manual: compare `ExperienceLabRenderRuntime` snapshot vs `useGenesisCore()`.

---

## Visual regression

| Check | Tool |
|-------|------|
| 16px / 40px / 80px silhouette | Screenshot compare to prototypes A |
| No green channel dominance | Color picker on core |
| No X-shaped negative space | Visual review |
| Warning not full red | Screenshot |
| Success no green flash | Video capture |

Store reference PNGs from SVG prototypes after founder approval.

---

## Performance checks

| Metric | Threshold |
|--------|-----------|
| rAF loops per page | ≤ 1 per visible orb |
| Memory after 10 min Experience Lab | No canvas leak growth |
| CPU when offscreen | ~0% animation |
| DPR cap | ≤ 2 |
| Touch target | ≥ 44×44px |

Diagnostics: confirm no new entries in `timer-inventory` for orb breathe.

---

## Accessibility

- `aria-label` reflects `mode` in plain language
- Reduced motion honored
- No seizure-inducing flash (success ≤ 600ms single pulse)
- Critical state announced to screen readers

---

## Sign-off gates

| Gate | Owner |
|------|-------|
| Visual directions reviewed | Founder |
| Direction A canonical | Founder |
| Phase 1 state tests green | Engineering |
| Mobile Safari pass | Engineering |
| Experience Lab harness complete | Engineering |
| Production swap approved | Founder |

**Production Genesis Orb ships only after all gates.**
