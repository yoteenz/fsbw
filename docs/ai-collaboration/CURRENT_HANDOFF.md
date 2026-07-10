# Current Handoff — Active Sprint State

**Last updated:** 2026-07-10  
**Update this file** at every sprint boundary, P0 change, or architecture decision.

---

## Current sprint

**Brand Language Engine™ — naming philosophy & identity architecture**

Document: `STUDIO_OS_BIBLE/BRAND_LANGUAGE_ENGINE.md` — permanent naming constitution: four tiers, product/place/AI/system frameworks, social handle methodology (no final handles), availability workflow, evaluation scorecard, Studio Test, long-term roadmap. Brand architecture sprint only — no logo, social, or marketing execution.

**Previous shipped:** Spatial Architecture Review Engine™ (`8a6027b93`), Spatial Computing Philosophy™ (`b30c93efc`).

---

## Current blocker

| ID | Blocker | Owner | Unblock |
|----|---------|-------|---------|
| **B1** | Layer 1 (`signature-landmark`) fails with `AUTH_REQUIRED` on governed generation API | Composer (future sprint) | Issue ephemeral `productionAuthorizationId` for validation mode OR scoped legacy compat for Experience Lab drafts |
| **B2** | Diagnostic routes — normal-tab verification pending post-`ef969cb7d` | Founder (device) | Confirm all `/__studio-os-*` routes load in iOS Safari/Chrome normal tabs |

**Do not resume** Experience Lab compile repair or Creative Direction Studio feature work until **B2 verified** and **B1** has an approved repair sprint.

---

## Current debugging status

| System | Status | Notes |
|--------|--------|-------|
| Department package `studio-world-atlas` | ✅ Fixed | `03726eaf9` |
| Layer 1 forensic instrumentation | ✅ Shipped | `?compilerDiag=1`, `FAILED_AT_LAYER_1` freeze |
| Misleading "Retry Shell Layer" UI | ✅ Fixed | Shows LANDMARK GENERATION FAILED |
| Diagnostic route isolation | ✅ Shipped | Pre-main probe + split entry |
| Layer 1 generation repair | ❌ Not started | Forensic only — root cause proven |
| Normal-tab diagnostic verification | ⏳ Pending | Use `/__studio-os-recovery` if stale cache |

---

## Latest architectural decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-10 | Diagnostic routes bypass `main-app.tsx` entirely | Normal-tab failures caused by global-boot + stale chunks before route split |
| 2026-07-10 | Quarantine incompatible persisted state; never blind clear | Preserve auth + user data; scoped recovery |
| 2026-07-10 | Layer 1 forensic pass separate from auth repair | Must prove failure before masking with fallback |
| 2026-07-10 | `studio-world-atlas` bundled in DepartmentPackageRegistry | Scene stack referenced unregistered package |
| 2026-07-10 | External AI onboarding via `docs/ai-collaboration/` | Separate from motherboard (Cursor) and product bibles |
| 2026-07-10 | Studio AI as persistent intelligence layer — not foundation model | Models replaceable; identity, roles, memory persist via IME + succession |

---

## Recently completed work

| Commit / deliverable | Summary |
|---------------------|---------|
| `ef969cb7d` | Diagnostic route isolation, pre-main probe, recovery page |
| `506d77169` | Layer 1 forensic trace, FAILED_AT_LAYER_1 UI |
| `03726eaf9` | studio-world-atlas department package registration |
| Docs sprints | Studio World Master Plan, Atlas, Knowledge Graph, Civilization bibles |
| Docs sprints | Institute V3, Learning DNA bibles |
| This sprint | ChatGPT Operating Manual package (in progress) |

---

## Immediate next priorities

1. **Founder:** Verify diagnostic routes on normal mobile tabs; paste recovery export if failure persists
2. **ChatGPT:** Use this package for all new external conversations (`NEW_CHAT_CHECKLIST.md`)
3. **Composer (next code sprint):** Layer 1 auth repair for Experience Lab validation mode — after B2 confirmed
4. **Maintainer:** Update this handoff after each completed sprint

---

## Known risks

| Risk | Mitigation |
|------|------------|
| Stale asset cache after deploy | Build ID meta + recovery page cache clear |
| Oversized `genesis_v1` / env snapshots break boot | Pre-main quarantine on diagnostic entry |
| Multiple Vercel deploys per task | One `agent-commit.sh` per founder request |
| ChatGPT contradicts canon | Read `AI_GLOSSARY.md` + changelog; confirm handoff |
| Canvas shell fallback masks auth gap | Do not add Landmark canvas fallback |

---

## Open questions

1. Production policy: `CREATIVE_PRODUCTION_ALLOW_LEGACY_COMPAT=1` for validation-only paths vs formal ephemeral ProductionAuthorization issuance?
2. Should AI Context Capsule export be automated on every deploy or manual only until Phase 2?
3. Terra review cadence for Experience Lab before public demo?

---

## Key URLs for verification

```
/__studio-os-recovery
```

```
/__studio-os-flight-recorder
```

```
/__studio-os-live-runtime
```

```
/__studio-os-session-report
```

Experience Lab diagnostic compile:

```
?compilerDiag=1
```

---

*Replace this file's body when sprint state changes — do not append; keep one current snapshot.*
