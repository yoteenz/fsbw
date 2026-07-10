# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-10  
**Git reference:** `3b8fb4fa7`

---

## Current sprint

**AI Context Capsule v0.1 — Manual prototype for protocol validation**

First complete manually generated capsule folder for onboarding a brand-new external AI conversation. Validates AI Context Protocol™ without automation or ZIP export. **No application code changes** in this sprint except capsule artifacts in repo.

**Previous shipped specs:** AI Context Protocol v1 (`243c23083`), Studio AI vision bible (`3be0e1f88`), build fix (`3b8fb4fa7`).

---

## Current blocker

See `KNOWN_BLOCKERS.md` for full detail.

| ID | Blocker | Owner | Unblock |
|----|---------|-------|---------|
| **B1** | Layer 1 `AUTH_REQUIRED` on governed generation | Composer (future sprint) | Ephemeral auth for validation OR scoped legacy compat — founder policy |
| **B2** | Diagnostic routes — normal-tab verification pending | Founder (device) | Confirm `/__studio-os-*` on iOS Safari/Chrome **normal tabs** |

**Do not resume** Experience Lab compile repair or CDS feature work until **B2 verified** and **B1** has approved repair sprint.

---

## Current debugging status

| System | Status | Notes |
|--------|--------|-------|
| Department package `studio-world-atlas` | ✅ Fixed | `03726eaf9` |
| Layer 1 forensic instrumentation | ✅ Shipped | `?compilerDiag=1`, `FAILED_AT_LAYER_1` |
| Misleading shell retry UI | ✅ Fixed | LANDMARK GENERATION FAILED |
| Diagnostic route isolation | ✅ Shipped | Pre-main probe + split entry |
| Layer 1 generation repair | ❌ Not started | Forensic only |
| Normal-tab diagnostic verification | ⏳ Pending | `/__studio-os-recovery` if stale cache |
| Vercel production build | ✅ Fixed | `3b8fb4fa7` — diagnostic test TS2322 |

---

## Latest architectural decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-10 | AI Context Capsule v0.1 manual prototype | Validate protocol via brand-new AI onboarding without export automation |
| 2026-07-10 | Studio AI as persistent intelligence layer | Models replaceable; identity and memory persist |
| 2026-07-10 | AI Context Protocol as onboarding standard | Institutional memory transfer, not doc scatter |
| 2026-07-10 | Diagnostic routes bypass main-app | Normal-tab stale cache + global-boot |
| 2026-07-10 | Layer 1 forensic separate from auth repair | Prove before mask |

---

## Recently completed work

| Deliverable | Summary |
|-------------|---------|
| `StudioOS_ContextCapsule_v0.1/` | Manual capsule prototype (this package) |
| `docs/studio-os/studio-ai/` | Studio AI vision bible suite |
| `docs/ai-collaboration/protocol/` | AI Context Protocol v1 modules |
| `3b8fb4fa7` | Build fix — persisted-state-audit test |
| `ef969cb7d` | Diagnostic isolation |
| `506d77169` | Layer 1 forensic |
| `03726eaf9` | studio-world-atlas registry |

---

## Immediate next priorities

1. **Founder:** Upload capsule to brand-new ChatGPT; review onboarding report; approve or correct  
2. **Founder:** Verify B2 on normal mobile tabs  
3. **ChatGPT (after approval):** Architecture memo for B1 repair options — do not implement until approved  
4. **Composer (future):** Layer 1 auth repair sprint after B2 + founder policy on Q1  

---

## Key URLs

```
/__studio-os-recovery
```

```
/__studio-os-flight-recorder
```

Experience Lab compile diagnostic:

```
?compilerDiag=1
```

---

*Single current snapshot — replace on sprint boundary, do not append.*
