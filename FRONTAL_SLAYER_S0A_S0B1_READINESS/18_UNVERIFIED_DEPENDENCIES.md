# 18 — Unverified Dependencies and Open Blockers

This document continues the prior package's U-01…U-16 (`FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/17_CONFLICTS_AND_UNVERIFIED_ASSUMPTIONS.md`) and adds U-17 onward. Status is **OPEN** unless evidence is cited. Nothing was assumed resolved.

## 1. Status of the prior list

| ID | Subject | Status after this sprint |
|---|---|---|
| U-01 | Service-role key in FS and SITE00 production | **OPEN.** Source and local-build scans are clean, but production hosts were unreachable (network policy) and there is no dashboard access. Plan: doc 12 |
| U-02 | Customers affected by money defects | **PARTLY ANSWERED.** Database (live, 2026-10-25): 0 analysis grants, 0 orders, 0 meetings, 0 Stripe subscriptions, 0 Slay Ticket transactions. **Stripe-side history still OPEN** (A8) |
| U-03 | Collectible transparency and silhouette | OPEN (S4) |
| U-04 | Signed-in flows end-to-end | OPEN. No staging yet (H2) |
| U-05 | Stripe dashboard configuration | OPEN (doc 13 needs it) |
| U-06 | Live DB matches migrations | **PARTLY ANSWERED.** Remote history is interleaved and uses apply-time versions. An out-of-band trigger (`trg_log_profile_changes`) exists. A schema diff is still needed before each DB sprint |
| U-07 | Unknown tier default | Resolved as an engineering default (D10: fail closed) |
| U-08 | Visual layout of new surfaces | OPEN, now **per experience** (mobile and desktop/tablet separately) |
| U-09 | Local-only orders on devices | OPEN |
| U-10 | SITE00 `/account/*` paths | OPEN (low; SITE00 has its own route tree) |
| U-11 | Emails render and deliver | OPEN |
| U-12 | Named-only perks | Folded into D9 |
| U-13 | Build and test health | **This sprint:** local `vite build` succeeded (3m45s), with one unresolved-asset warning (`reference/CSLP/m1.webp`, resolved at runtime). No unit or E2E tests were run |
| U-14 | Responsive findings with signed-in data | **Reframed:** verify each experience separately (mobile ≤767; desktop/tablet ≥768 native; phone artboard for `/desktop/*` is a dev aid) |
| U-15 | Non-USD charges in production | OPEN |
| U-16 | Founder preference: deposit collection and gift-card visibility | OPEN (A7 note) |

## 2. New items

| ID | Unknown | Why it matters | How to verify | Blocks |
|---|---|---|---|---|
| U-17 | Which domain serves production; whether `fsbw.vercel.app` is production | `isPreviewEnvironment()` enables mock and demo paths on `*.vercel.app` | Vercel → Domains (doc 12 A5) | XD-3, H2, S0B-2 mock quarantine verification |
| U-18 | What ≥1024px visitors see on the production domain today | MEMORY says desktop is "not live"; the code has no gate | One production visit at desktop width (operator) | XD-3 |
| U-19 | Supabase plan tier and branching availability | Staging option choice | Supabase dashboard → Billing | H2 |
| U-20 | Stripe test-mode keys, Price IDs and portal configuration exist | Staging rehearsal of webhooks and cancellation | Stripe dashboard (test mode) | H2, A4 |
| U-21 | Owner and effect of `trg_log_profile_changes` → `profile_debug_log` | INFERRED: may make user-token profile updates fail (FS and SITE00 `api/profile.ts`). The log has 0 rows | Staging: user-token PATCH /api/profile → observe. Ask the SITE00 owner whether they created it | Any future `profiles` trigger change (R-18); not S0B-1 |
| U-22 | PITR or backup capability on the shared project | Recovery precondition P6 (doc 14) | Supabase dashboard → Backups | A1b |
| U-23 | Whether any integration outside both repos calls the RPCs with the anon key | M1A would break it (intended) | 24h production log watch after M1A; staging cannot show this | None (accepted risk; forward-fix) |
| U-24 | Penthouse Suite vs `/account` numeric parity at runtime | EC-5 | Staging with fixtures, both experiences | S2 data-parity fix |
| U-25 | Analysis Lab room functionality on desktop | Parity matrix CAP-16 | Staging walkthrough at 1440px | XD-1 |
| U-26 | Whether this sprint's experience charter wording matches the founder's intent | It replaces stale `CORE.md:39-43` | Founder confirms in the approval manifest (`experienceAuthority.confirmedByFounder`) | Documentation update of CORE.md |

## 3. Blockers that stop work (summary)

| Blocker | Blocks | Unblocked by |
|---|---|---|
| No staging (H2: U-19, U-20, U-17) | A1a rehearsal; every signed-in E2E | Operator facts + founder H2 choice |
| U-01 | M1B; full confidence in M1A and M2 production behaviour | Doc 12 checklist |
| A1a / A1b not recorded | Any S0B-1 apply | Founder |
| Wave 2 founder decisions (A2, A4, A5, F1) | The corresponding S0B-2 items. Defaults A3, A6, A7, E2 can proceed when S0B-2 is authorized | Founder |
| A8 evidence | Customer remediation | Read-only Stripe review |
| XD-1, XD-2 | Desktop/tablet account scope in S2 | Founder |
