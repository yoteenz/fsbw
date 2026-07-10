# Genesis Core™ — System Architecture

**Version:** 1.0.0 · Docs-only sprint  
**Supersedes (eventually):** fragmented `StudioOrbPresenceState` + local CSS timers as **state authority** — not Command Dock UX

---

## Purpose

**Genesis Core™** is the canonical visual indicator of Studio OS intelligence:

- System consciousness
- Runtime health
- AI presence
- World generation / World Compiler progress
- Active reasoning
- Company intelligence

**The Genesis Orb** is its physical manifestation — one renderer, one state owner, every surface.

---

## Problem statement (current)

| Issue | Evidence |
|-------|----------|
| **Split state ownership** | `StudioOrbProvider.resolvePresenceState()` locally; `useOrbState` → `genesis/orb`; `useCreativeStudioRenderPreview` owns compile job |
| **No compiler sync** | Orb CSS states do not map to `WORLD_COMPILER_STAGES` |
| **Decorative risk** | CSS radial gradients read as frosted bubble / glowing button |
| **Timer risk** | `StudioOrbProvider` voice/keyboard timers flagged in diagnostics |
| **Reset loops** | Historical ~3s compiler restart tied orb-adjacent runtime (see world-compiler decoupling sprint) |
| **Duplicate subscribers** | `STATE_OWNERSHIP.registry` lists 20+ genesis hooks + Orb |

---

## Architectural principle

```
ONE authoritative Genesis Core store
        ↓
Many subscribers (read-only projections)
        ↓
ONE GenesisOrbRenderer (visual)
```

**Forbidden:** Components that mutate core state from render, own heartbeat, or reset compiler progress independently.

---

## State owner

### Canonical module (to create)

```
src/studio-os-core/genesis-core/
├── index.ts
├── types.ts                    # GenesisCoreState, GenesisCoreSnapshot
├── genesis-core-store.ts       # Single in-memory store + reducers
├── genesis-core-subscriptions.ts
├── selectors.ts
├── compiler-bridge.ts          # Maps World Compiler + Experience Lab runtime
├── runtime-health-bridge.ts    # Heartbeat, render status, failure codes
├── presence-bridge.ts          # Voice, conversation, AI reasoning
├── hooks/
│   └── useGenesisCore.ts       # React subscription hook
└── __tests__/
    └── genesis-core-store.test.ts
```

### Owner declaration

| State key | Owner | Writers | Readers |
|-----------|-------|---------|---------|
| `genesisCore` | `genesis-core-store.ts` | `genesis-core-subscriptions` adapters only | All UI via `useGenesisCore` |
| `compilerProgress` | `experience-lab-render-runtime` (facts) | `compile-pipeline` events | `compiler-bridge` (projection into genesisCore) |
| `orbPresence` | **deprecated** → merged into `genesisCore.mode` | — | — |

---

## Subscription adapters (facts in → core state out)

| Adapter | Source | Updates |
|---------|--------|---------|
| **RuntimeHealthBridge** | `experience-lab-render-runtime` snapshot, `runtimeEventBus` | `offline`, `warning`, `critical`, `compiling` |
| **CompilerBridge** | `COMPILER_STAGE_CHANGED`, `WORLD_COMPILER_*` events | `currentStage`, `completedStages`, `progress`, intensities |
| **PresenceBridge** | `conversation-engine`, `voice-mode`, Command Dock store | `listening`, `thinking`, `speaking` |
| **GenesisBridge** | `genesis/persistence/store` | company intelligence signals, recommendations |
| **AwakeningBridge** | org inauguration / first HQ | `awakening` → `idle` |

Adapters **subscribe once** at app shell init (`GenesisCoreProvider` or `AdminStudioLayout`). They dispatch actions to the store — never write React local state for core modes.

---

## Component ownership map

| Component | Role | Change |
|-----------|------|--------|
| `GenesisCoreProvider` | Mount adapters · expose context | **Create** |
| `GenesisOrbRenderer` | 5-layer visual · quality tier | **Create** — replaces orb shell in `StudioOrb.tsx` |
| `StudioOrb.tsx` | Position · a11y · tap target · mounts renderer | **Modify** — thin shell |
| `StudioOrbProvider.tsx` | Radial · surfaces · awakening overlay | **Modify** — read `useGenesisCore`, remove local presence classification |
| `studioOrbTheme.ts` | Legacy CSS | **Deprecate** → migrate tokens to `genesis-orb-tokens.ts` |
| `useOrbState.ts` | Genesis orb intel (messages, recs) | **Keep** — intel only, not visual mode |
| `ExperienceLabRuntimeLabPanel` | Lab diagnostics | **Modify** — Genesis Core test harness |
| `CreativeStudioPipelineStatusBar` | Pipeline text status | **Keep** — optional duplicate of compiler stage label |

### Appearance surfaces (same renderer)

- Studio Headquarters / `AdminStudioLayout`
- Studio Council routes
- Experience Lab
- World Compiler investigation / preview
- Creative Direction Studio
- Studio Institute (professor office hours — future)
- Studio Atlas holographic table (scaled variant)
- Mobile application shell
- Loading / awakening sequences

**Rule:** `GenesisOrbRenderer` accepts `scale`, `interactive`, `qualityTier` props — not separate orb implementations per page.

---

## Rendering strategy

### Stack evaluation

| Approach | Verdict |
|----------|---------|
| **WebGL / Three.js / R3F** | Not in repo today. **High tier only** — defer until Direction A proven in CSS; add behind feature flag for Experience Lab desktop |
| **Layered SVG + CSS filters** | **Recommended primary** — matches 5-layer model, Safari-safe, no new dependency |
| **Canvas 2D** | **Medium tier** optional — particle field + subtle noise |
| **Pre-rendered video** | **Reject** for interactive states — memory leak risk on mobile |
| **Hybrid 3D asset + CSS** | **Future** — Lottie/GLB inner nucleus for High tier only |

### Quality tiers

| Tier | Technique | When |
|------|-----------|------|
| **High** | SVG layers + CSS `filter` bloom + Canvas particles (optional) | Desktop, `prefers-reduced-motion: no`, visible |
| **Medium** | SVG layers, reduced particles, simpler filters | Mobile landscape, older iPad |
| **Low** | Static SVG + CSS breathe only | Mobile Safari budget mode |
| **Static** | Single SVG frame + state opacity shifts | `prefers-reduced-motion: reduce` |

### Performance rules

- One `requestAnimationFrame` loop max per visible orb (particle canvas only)
- `IntersectionObserver` → pause animation offscreen
- `devicePixelRatio` capped at 2
- Unmount → cancel rAF, release canvas
- No bloom if tier is Low/Static
- Core state updates throttle visual at 30fps max (store can update faster)

---

## Mobile performance

| Requirement | Implementation |
|-------------|----------------|
| iPhone Safari reliable | SVG-primary; no WebGL default |
| No duplicate rAF | Central `GenesisOrbAnimationController` singleton |
| Offscreen pause | IntersectionObserver in renderer |
| `prefers-reduced-motion` | Static tier + instant state cuts |
| No 3s reset | Store driven by runtime events only |
| No compiler mutation in render | Bridges in `useEffect` / event handlers |
| Touch target | Min 44×44px hit area; visual can be 40px |

---

## Experience Lab integration

Experience Lab becomes the **Genesis Core living test subject**:

```
ExperienceLabRuntimeLabPanel
    └── GenesisCoreDebugPanel (new)
            ├── State inspector (mode, stage, intensities)
            ├── Force state buttons (dev only)
            ├── Compiler sync indicator
            ├── Quality tier override
            └── Reduced-motion preview toggle
```

Validates: transitions, compiler accumulation, failure accuracy, mobile tier, no placeholder rectangles.

---

## Migration from Studio Orb™

| Phase | Action |
|-------|--------|
| 1 | Ship `genesis-core` store + bridges (no visual change) |
| 2 | Parallel-run: log when old presence ≠ new core mode |
| 3 | Swap `StudioOrb` shell to `GenesisOrbRenderer` Direction A |
| 4 | Remove `resolvePresenceState` local logic |
| 5 | Archive gold/champagne-heavy `ORB_VISUAL` tokens |

Command Dock, radial menu, Hero Objects, awakening narrative — **unchanged UX**, new core visual.

---

## Anti-patterns (forbidden)

- Copy Xbox X silhouette, green, or external logo lighting literally
- Multiple orb renderers per route
- Local `setInterval` for breathe/compile progress
- Fake compiler stage advancement
- Full-orb red on warning (amber undertone only)
- Explosion on critical failure
- Rainbow holographic AI sparkle
- Chrome ball primary material
