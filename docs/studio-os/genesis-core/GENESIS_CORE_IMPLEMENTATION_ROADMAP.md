# Genesis Core™ — Implementation Roadmap

**Version:** 1.0.0 · Staged after visual + architecture review

---

## Phase 0 — Specification (this sprint) ✓

- Architecture, state model, compiler mapping
- Visual language + three directions + recommendation
- SVG prototypes for review
- Verification plan

**No production orb swap.**

---

## Phase 1 — State foundation

**Goal:** Single authoritative store; parallel-run logging.

### Files to create

```
src/studio-os-core/genesis-core/
  types.ts
  genesis-core-store.ts
  genesis-core-subscriptions.ts
  compiler-bridge.ts
  runtime-health-bridge.ts
  presence-bridge.ts
  selectors.ts
  index.ts
  genesis-orb-tokens.ts
src/components/admin/studio/genesis-core/
  GenesisCoreProvider.tsx
  useGenesisCore.ts (re-export or thin hook)
```

### Files to modify

```
src/components/admin/AdminStudioLayout.tsx  — wrap GenesisCoreProvider
src/studio-os-core/experience-lab-runtime/runtime-event-bus.ts — ensure typed exports
```

### Exit criteria

- Store updates from real compiler events
- Debug log when legacy presence ≠ core mode
- Unit tests for monotonic `completedStages`

---

## Phase 2 — Genesis Orb renderer (Direction A)

**Goal:** Replace orb shell visuals; keep interaction UX.

### Files to create

```
src/components/admin/studio/genesis-core/
  GenesisOrbRenderer.tsx
  GenesisOrbLayers.tsx
  GenesisOrbAnimationController.ts
  genesis-orb-quality.ts
  GenesisOrbReducedMotion.tsx
```

### Files to modify

```
src/components/admin/studio/studio-orb/StudioOrb.tsx — mount GenesisOrbRenderer
src/components/admin/studio/studio-orb/StudioOrbProvider.tsx — useGenesisCore for mode
src/components/admin/studio/studio-orb/studioOrbTheme.ts — deprecate ORB_ANIMATION_CSS overlap
```

### Exit criteria

- Idle breathe 6–8s
- All modes visually distinct
- `prefers-reduced-motion` → static tier
- iPhone Safari: no jank, no runaway rAF

---

## Phase 3 — Compiler visual accumulation

**Goal:** Orb reflects World Compiler without reset between stages.

### Files to modify

```
src/studio-os-core/genesis-core/compiler-bridge.ts — full stage table
src/studio-os-core/experience-lab-runtime/experience-lab-render-runtime.ts — expose snapshot getter
src/components/admin/studio/experience-lab/CreativeStudioPipelineStatusBar.tsx — optional sync label
```

### Exit criteria

- Full compile run shows monotonic light fill
- Failure → critical visual
- Retry resumes from last stage

---

## Phase 4 — Experience Lab test harness

**Goal:** Living test subject for Genesis Core.

### Files to create

```
src/components/admin/studio/experience-lab/GenesisCoreDebugPanel.tsx
```

### Files to modify

```
src/components/admin/studio/experience-lab/ExperienceLabRuntimeLabPanel.tsx
src/pages/admin/studio/experience-lab/health/page.tsx
```

### Exit criteria

- Force all modes in dev
- Compiler sync indicator green
- Mobile tier override works

---

## Phase 5 — Surface expansion

**Goal:** Same renderer on all canonical surfaces.

### Integrations

- Awakening overlay (`StudioOrbAwakeningOverlay`) — sync `awakening` mode
- World Compiler investigation page
- Atlas holographic table (scaled 2× renderer)
- Loading sequences

### Exit criteria

- No duplicate orb CSS in codebase
- `grep GenesisOrbRenderer` covers all appearances

---

## Phase 6 — Cleanup & deprecation

- Remove `resolvePresenceState` from `StudioOrbProvider`
- Collapse `StudioOrbPresenceState` into overlay flags
- Update `docs/studio-os/studio-orb.md`
- Update `STATE_OWNERSHIP` registry

---

## Files summary

| Action | Path |
|--------|------|
| **Create** | `docs/studio-os/genesis-core/*` (this sprint) |
| **Create** | `src/studio-os-core/genesis-core/*` |
| **Create** | `src/components/admin/studio/genesis-core/*` |
| **Modify** | `StudioOrb.tsx`, `StudioOrbProvider.tsx` |
| **Modify** | `AdminStudioLayout.tsx` |
| **Modify** | `ExperienceLabRuntimeLabPanel.tsx` |
| **Deprecate** | `studioOrbTheme.ts` visual half (keep radial tokens) |

---

## Dependency note

**No Three.js** in `package.json` today. Phase 2 does **not** add it. Optional Phase 7+ for High desktop tier only.
