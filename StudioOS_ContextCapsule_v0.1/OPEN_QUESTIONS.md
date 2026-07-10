# OPEN QUESTIONS — Unresolved Founder Decisions

**Last updated:** 2026-07-10  
**Rule:** AI must not decide these silently — surface in onboarding report and ask founder

---

## Production & governance

### Q1 — Layer 1 auth repair policy

**Question:** For Experience Lab validation mode, should production use:

- **Option A:** Ephemeral `productionAuthorizationId` issued for validation compiles only  
- **Option B:** Scoped `CREATIVE_PRODUCTION_ALLOW_LEGACY_COMPAT=1` for Experience Lab draft paths only  
- **Option C:** Other governed path (specify)

**Context:** B1 blocker — root cause proven; repair not started.  
**Blocks:** Experience Lab full compile resume.

---

### Q2 — AI Context Capsule automation cadence

**Question:** Should capsule export be automated on every deploy, or manual only until Phase 2 CLI builder ships?

**Context:** v0.1 is manual prototype; v2/v3 specs exist in repo.  
**Blocks:** Nothing immediate — process decision.

---

### Q3 — Terra review cadence for Experience Lab

**Question:** Is Terra governance review required before any public Experience Lab demo?

**Context:** Validation mode vs production-canonical promotion.  
**Blocks:** Public demo planning.

---

## Studio AI & protocol

### Q4 — External AI vs native Studio AI convergence

**Question:** When native Studio AI runtime ships, does ChatGPT remain primary Creative Director host, or does HQ Studio AI replace external sessions?

**Context:** `docs/studio-os/studio-ai/` vision bible.  
**Blocks:** Long-term workflow only.

---

### Q5 — Capsule v0.1 validation success criteria

**Question:** After brand-new ChatGPT reads this capsule, what founder approval phrase confirms onboarding? (e.g. "approved — proceed with architecture review for B1")

**Context:** This manual prototype sprint.  
**Blocks:** Protocol validation ceremony.

---

## Genesis Core (visual)

### Q6 — Genesis Orb direction approval

**Question:** Which Genesis Orb visual direction is canonical — A (Luminous Crystal Nucleus, recommended), B, or C?

**Context:** Docs at `docs/studio-os/genesis-core/` — production orb blocked until review.  
**Blocks:** Genesis Orb implementation Phase 1.

---

## How to use this file

1. Include all open questions in your **onboarding report**  
2. Label which are **blocking** vs **informational**  
3. Do not implement options A/B/C without founder choice  
4. When founder resolves, expect `PROJECT_CHANGELOG.md` update in next capsule version  

---

*End of OPEN_QUESTIONS.md*
