# FRONTAL SLAYER: S0A Founder Decision Triage and S0B-1 Security Containment Readiness

**Sprint:** `P0.FRONTAL-SLAYER.OPUS.S0A-FOUNDER-DECISION-TRIAGE-AND-S0B1-SECURITY-CONTAINMENT-READINESS.V1`
**Status:** PLANNING AND PREPARATION ONLY · **PENDING FOUNDER APPROVAL**
**Builds on:** architecture package `FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/` (commit `df982a37`) and the original audit `FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT/` (commit `4863456`). Both are preserved unchanged.

> No production mutation, no deployment, no merge, no payment change, no implementation. Candidate migrations are **review-only and not executed**. No founder decision is recorded: every state is RECOMMENDED or BLOCKED.

## 1. The answer in one page

**1. The experience model is corrected.** FRONTAL SLAYER has three experience authorities: **Customer Mobile**, **Customer Desktop/Tablet** (the immersive "Frontal Slayer Tower") and **Administration**. They share records, server rules and APIs, but not UI.
- The prior package's 720px "centred column" for tablet and desktop, and its universal `AccountShell`, are **withdrawn**.
- Today, ≥768px customers already land in the Tower's Penthouse Suite. That is a founder directive from 2026-06-23.

Docs 01–05.

**2. 55 decisions become a manageable process.**

| Classification | Count |
|---|---|
| Genuine founder decisions | 34 |
| Engineering defaults | 8 |
| Already established (historical founder authority cited) | 11 |
| Blocked by missing evidence | 2 |

- 3 audit decisions that V2 had dropped are carried forward (D14–D16). Nothing was silently deleted.
- 3 new experience decisions are added (XD-1–XD-3).
- Founder decisions are split into **5 waves**. Approving one wave approves nothing else.
- **Wave 1 needs only:** A1a (rehearse the containment on staging), H2 (choose staging, once three facts are known) and H3 (acknowledge SITE00 coordination). A1b (production) comes later, as its own approval.
- In 4 places the V2 recommendation **contradicted** a founder directive, so it is withdrawn: B4, C5, E4, E6.

Docs 06–07.

**3. The database containment is ready for review.** A **new read-only live check (2026-10-25)** re-verified the findings:
- 17 SECURITY DEFINER functions are executable with the public key, including a second, legacy refund overload not previously listed.
- 8 legacy customer write policies are live.
- The 4-pack check still accepts only 1/3/6.

Candidate SQL M1A, M2 and M3 is written, with in-transaction guards, exact rollbacks and pre/post checks. **None of it touches a trigger, a profile column or a SITE00 object.** M1B is BLOCKED until the service-role key is confirmed. Docs 08–11, 14.

**4. Staging recommendation:** a **separate staging Supabase project** (schema-only copy, synthetic data) + **Vercel Preview on a staging domain** + **Stripe test mode**. Supabase branching is not recommended yet, because the shared project's migration history cannot be replayed cleanly. Doc 13.

**5. Service-role key (U-01) is still open.**
- The source and a local production build are clean: 0 keys, 0 JWTs.
- This session could not reach the production hosts or the dashboards.
- Doc 12 gives a no-secrets checklist for the operator.

**6. Application containment (S0B-2) is specified.** It includes two corrections from code:
- Build-A-Wig is **undercharged at checkout, not blocked**.
- The Concierge test-order injection reaches **every** signed-in customer.

Every item preserves the Atelier and both customer experiences' visual identity. Doc 15.

## 2. Deliverables

| # | Document | Purpose |
|---|---|---|
| 00 | This README | Summary, validation, founder report |
| 01 | Experience authority correction | The rule, what was wrong before, conflicts EC-1…EC-9, rules for later sprints |
| 02 | Mobile experience inventory | Entry, shell, design authority, families, assets, interactions, gaps |
| 03 | Desktop/tablet experience inventory | Tower floors, rooms, navigation language, panels, hand-offs, gaps |
| 04 | Admin experience inventory | Separate operational interface; protocol; fabricated data |
| 05 | Experience parity matrix (CSV) | 25 shared capabilities × mobile, desktop/tablet and admin presentation, single data owner, status, founder status |
| 06 | Founder decision triage (CSV) | 61 rows (55 originals + 3 carried + 3 new), all required fields |
| 07 | Founder approval waves | Waves 1–5 with scope limits; defaults and established rules for objection |
| 08 | Security risk reconciliation | Six criticals with all 12 fields; HIGH/MEDIUM reconciled; new findings N-01…N-06 |
| 09 | Database containment spec | Scope, live findings, candidates, measurable criteria C1–C9, approvals |
| 10 | Candidate migrations | **REVIEW ONLY — NOT EXECUTED**: V0, M1A(+rollback), M1B (blocked), M2(+rollback), M3(+rollback), V1 |
| 11 | Shared Supabase impact analysis | Ownership map, per-candidate impact, avoided failure modes, SITE00 smoke, hand-off note |
| 12 | Service-role verification plan | Who needs the key, checks done, secure operator checklist, closure criteria |
| 13 | Staging environment proposal | Recommended configuration, fixtures, workflow, options |
| 14 | Migration validation and recovery | Preconditions, execution rules, postconditions, forward-fix-first recovery |
| 15 | S0B-2 application containment spec | 9 items with components, handlers, data and UI after |
| 16 | Architecture board V3 | https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82 (updated in place; V2 source kept) |
| 17 | Approval manifest template (JSON) | Waves, A1a/A1b, evidence items, 61 decisions, all null |
| 18 | Unverified dependencies | U-01…U-16 status, U-17…U-26 new, blockers |
| 19 | Implementation gate matrix | Every sprint's founder, evidence, environment and verification gates |
| 20 | Recommended next sprints | The next sprint and its order |
| — | `evidence/` | E (experiences), T (decision history), S (application and secrets), L (live read-only check), generator sources, validation output |
| — | `exports/` | SMALL_HANDOFF.zip, FULL_HANDOFF.zip |

## 3. Validation (brief §17)

Script: `evidence/generator/validate_s0a.py`. Output: `evidence/VALIDATION_RESULTS.txt`. **All 16 script checks PASS.**

| Check | Result |
|---|---|
| All 55 original decisions accounted for | PASS |
| No founder decision disappears silently (every audit FD-* id carried) | PASS (FD-A5, FD-R4, FD-R12 restored as D14–D16) |
| Engineering defaults separated from business choices | PASS |
| Historical rules supported by evidence | PASS (12 established items cite MEMORY lines, files or this brief) |
| Mobile and desktop/tablet treated as distinct experiences | PASS (25/25 capabilities) |
| No shared responsive customer shell proposed | PASS |
| Business data authoritative across experiences | PASS (one data owner per capability) |
| SITE00 source untouched | PASS (`git status` clean) |
| No live database mutation | PASS (process: 9 `execute_sql`, all SELECT; 1 `list_migrations`; 1 `get_advisors`; no `apply_migration`) |
| No payment behaviour changed | PASS (only this folder changed; no `api/`, `src/` or migration change) |
| No deployment, no merge, no PR | PASS (process) |
| Candidate migrations review-only | PASS (9 SQL files marked; none in `supabase/migrations`) |
| Service-role secrets never disclosed | PASS (pattern scan of every deliverable) |
| Staging requirements documented | PASS |
| Security risks have measurable containment criteria | PASS (C1–C9) |
| Founder approval states truthful | PASS (manifest null; board store read back empty after publishing) |
| Unresolved blockers reported | PASS (doc 18 §3) |
| Non-mutating repository check | Local `vite build` succeeded (3m45s); the bundle scan found no secrets. No unit or E2E tests were run (planning sprint) |

## 4. Final founder report

| Field | Value |
|---|---|
| SPRINT ID | P0.FRONTAL-SLAYER.OPUS.S0A-FOUNDER-DECISION-TRIAGE-AND-S0B1-SECURITY-CONTAINMENT-READINESS.V1 |
| STATUS | COMPLETE: planning and preparation only. Pending founder approval |
| REPOSITORY | yoteenz/fsbw (SITE00 untouched) |
| BRANCH | claude/frontal-slayer-audit-vclp3w |
| COMMIT | see the commit that adds this folder (the message contains `[sync-only]`) |
| PR | none |
| DEPLOYMENT | none |
| DATABASE MUTATIONS | none. Read-only: 9 SELECT queries, migration list, security advisor |
| MOBILE EXPERIENCE | Independent phone experience (≤767px; tablet partly, XD-2): 10 account families, 21 URLs, own shell and design authority |
| DESKTOP/TABLET EXPERIENCE | The immersive Tower: 4 floors and 12 rooms/zones (3 coming soon), 5 off-tower rooms. Account root is the Penthouse Suite. 9 capabilities hand off to mobile pages (XD-1) |
| ADMIN EXPERIENCE | Separate operational interface: 15 families, 24 pages, 448px column, Admin Alignment Protocol. Fabricated finance numbers flagged for S0B-2 |
| ORIGINAL DECISIONS | 55 (all accounted for) + 3 carried forward + 3 new |
| GENUINE FOUNDER DECISIONS | 34 |
| ENGINEERING DEFAULTS | 8 |
| ALREADY ESTABLISHED | 11 |
| BLOCKED BY EVIDENCE | 2 (A8, H2), plus XD-3 among the new |
| CRITICAL SECURITY RISKS | 6 open: R-01 and R-10 (live re-verified), R-05, R-15, R-03 (corrected: undercharged), R-11 |
| STAGING READINESS | None exists. Recommended: separate staging Supabase project + Vercel Preview on a staging domain + Stripe test mode. Needs 3 operator facts (plan tier, production domain, Stripe test keys) |
| SERVICE-ROLE VERIFICATION | U-01 OPEN. Source and local build clean; production and dashboards not reachable from this session; operator checklist in doc 12 |
| MIGRATION READINESS | M1A, M2, M3: ready for review (not executed). M1B: blocked (U-01). Trigger, profile and SITE00 items excluded |
| SITE00 IMPACT | None from M1A, M2 or M3 (no SITE00 caller, trigger or profile change). SITE00 owner smoke test required; hand-off note for 1 SITE00 function and 2 SITE00 tables with RLS off |
| FOUNDER BOARD V3 | https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82 (private until shared; owner-only recording; 0 recorded) |
| SMALL HANDOFF | `FRONTAL_SLAYER_S0A_S0B1_READINESS/exports/SMALL_HANDOFF.zip` |
| FULL HANDOFF | `FRONTAL_SLAYER_S0A_S0B1_READINESS/exports/FULL_HANDOFF.zip` |
| IMMEDIATE FOUNDER DECISIONS | **A1a** (rehearse the containment on staging) · **H2** (staging choice, after the operator facts) · **H3** (acknowledge SITE00 coordination). Operator action: the U-01 checklist, with no keys in chat |
| RECOMMENDED NEXT SPRINT | **S0B-1-REHEARSAL**: provision staging and rehearse M1A, M2, M3 there with the SITE00/JURNL smoke test. Production apply then needs **A1b** |
