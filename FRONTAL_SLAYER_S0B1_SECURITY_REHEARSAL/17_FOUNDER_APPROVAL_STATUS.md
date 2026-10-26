# 17 — Founder Approval Status

**Founder approvals recorded: 0.** The board decision store (`decisions` collection on the Architecture Board artifact) was read on 2026-10-26: **empty**. This sprint brief, the recommendations, the prepared templates and any visual selection are **not** approvals.

## 1. Required now (wave 1)

| ID | Decision | Recommendation (not an approval) | Recorded? | Blocks |
|---|---|---|---|---|
| **A1a** | Rehearse M1A + M2 + M3 on an isolated staging environment | Approve | **No — PENDING DECISION** | Track S, P-6…P-8 |
| **H2** | Staging option | Separate FS staging Supabase project + Vercel Preview on a staging domain + Stripe test mode (doc 02) | **No — PENDING DECISION** | Provisioning |
| **H3** | Acknowledge the shared-database rules (FS never alters SITE00 objects; SITE00 owner runs the smoke) | Acknowledge | **No — PENDING DECISION** | Every DB sprint |
| **Cost** | Provider, plan and monthly cost of the staging project | Supabase, existing Pro organisation, one additional project (cost per the Supabase billing page at the time of approval) | **No** | Provisioning |

## 2. Required later

| ID | Decision | When | Recorded? |
|---|---|---|---|
| **A1b** | Apply the same files to production | After the staging evidence pack (doc 16) | **No** (cannot be requested yet) |
| A2 | Build-A-Wig interim checkout path (R-03) | Before S0B-2 #1 | No |
| A4 | Portal vs in-app cancellation (R-15) | Before S0B-2 #3 | No |
| A5, F1 | Own-account mock cleanup; Slay Cam copy | Before S0B-2 #7 | No |
| C4 | Order status vocabulary and SLAs | Before S1 | No |
| **New: U-21 / R-18 joint fix** | Whether to fix customer profile edits together with an R-18 guard extension, and who owns the debug trigger | Before any `profiles` trigger change | No |
| XD-1, XD-2, XD-3 | Desktop/tablet presentation decisions | Not this sprint (not implemented) | No |

## 3. Operator facts still needed (not approvals)

| Ref | Fact | Where |
|---|---|---|
| U-01 | Service-role key present in Vercel production / Railway (yes/no; names only) | Vercel → Settings → Environment Variables |
| U-17 | Which domain serves production; whether `fsbw.vercel.app` is production | Vercel → Domains |
| U-19 | Confirmed: Pro plan (from organisation metadata). Branching not used | — (answered read-only) |
| U-20 | Stripe test keys, test Price IDs, test webhook endpoint exist (yes/no) | Stripe → Developers (test mode) |
| U-22 | Backups / PITR on the shared project | Supabase → Database → Backups |

**Never paste secret values in chat.** Report names and yes/no only.

## 4. How to record a decision

Open the Architecture Board (https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82), choose an option and an outcome on the decision card, then press **Record decision**. The card changes to **FOUNDER APPROVED** only after the record is saved and read back from the store. See `21_BOARD_APPROVAL_STATE_CORRECTION/`.
