# 01 — Staging Discovery

Method: repository configuration in both repos (read-only) and **authorized provider metadata** through the Supabase management connector (`list_organizations`, `list_projects`, `get_project`, `get_organization`, `list_branches`). These are metadata reads, with no project content and no writes. No Vercel or Stripe provider access exists in this session. The production hosts are refused by the session's network policy.

## Findings

| Question | Answer | Evidence | Confidence |
|---|---|---|---|
| Does FRONTAL SLAYER have a staging Supabase project? | **No** | `list_projects`: 3 projects in the organisation. None is a FS staging project | VERIFIED (provider metadata) |
| Does the FS production project have branches? | **No** (0 branches) | `list_branches(hyycomvcaqxxvyrfupes)` | VERIFIED |
| Is there *any* staging project in the organisation? | **Yes, `site00-staging`** (`soocqbyjkxeubfjnuwvf`, us-east-1, Postgres 17.11, created 2026-10-14). **Correction:** the prior package said "no staging project exists" | `list_projects`; SITE00 `motherboard/MEMORY.md:16671` (2026-10-15: SITE00 staging auth) | VERIFIED |
| Is `site00-staging` suitable for FRONTAL SLAYER? | **No.** It is SITE00's staging, used by SITE00's staging app, with its own Auth configuration and founder login | SITE00 MEMORY 2026-10-15 | VERIFIED. The brief also forbids assuming it |
| Supabase plan tier | **Pro** (`tier_pro`), organisation "FS Website" | `get_organization` | VERIFIED |
| Can a new project or branch be created? | Technically yes on Pro. **Both add cost.** Pricing is not shown by the connector | — | Cost UNVERIFIED; needs approval |
| Vercel Preview deployment for FS | **Unknown.** `vercel.json` has no environment or staging configuration. No `.vercel/project.json` in the repo | repo | UNVERIFIED (no Vercel access) |
| Dedicated staging domain | **None referenced** (0 references to any staging host in `api/`, `src/utils`, `vercel.json`, `.env.example`) | grep | VERIFIED for the repo |
| Production domain | **Not determinable from the repo.** `resolveSiteOrigin()` uses `SITE_URL`, then `VERCEL_URL`, then falls back to `https://fsbw.vercel.app` (`api/_lib/email/brandAssets.ts:6-12`). `frontalslayer.com` appears only as admin email addresses | repo | **U-17 OPEN** (needs Vercel → Domains) |
| Stripe test configuration | **Unknown.** Only variable names in `.env.example` (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*`) | repo | **U-20 OPEN** |
| Separate staging secrets | None exist (there is no staging environment) | — | VERIFIED |
| Test webhook configuration | Unknown (Stripe dashboard) | — | OPEN |
| Existing synthetic test users | `.env.e2e.example` defines E2E user variable **names**. Playwright runs iPhone 13 only. Which project those users live in is unknown | repo | UNVERIFIED |
| Database migration automation | **None for FS.** Migrations are applied manually through the Supabase connector (AGENTS.md). **SITE00 CI runs tests against the shared production project** with the service key | repo (prior evidence S) | VERIFIED |
| JURNL database dependency | JURNL (inside the SITE00 repo) uses **shared Supabase Auth** (`signUp`, `signInWithPassword`, `updateUser`). It does not reference any object S0B-1 changes | grep of `src/projects/jurnl`, `api/jurnl`, `scripts/jurnl` | VERIFIED (doc 11) |

## Conclusion

**No FRONTAL SLAYER staging exists.** The simplest safe option on the current Pro plan is a **new, separate FS staging project** (doc 02). It must not be `site00-staging` and must not be a branch of the shared production project. Creating it is **external provisioning with cost**, so it waits for **A1a + H2 + H3**, none of which is recorded (doc 17). External staging execution is **BLOCKED**.

## Founder-facing prerequisite checklist (no secrets in chat)

| # | Who | What | Where | Why |
|---|---|---|---|---|
| 1 | Founder | Record **H2** (staging configuration), **A1a** (rehearse on staging), **H3** (shared-database coordination) on the board | Board (doc 21) | Approval gate |
| 2 | Founder | Approve the **cost** of one additional Supabase project on the Pro plan | Supabase → Billing (price shown there) | Paid resource |
| 3 | Operator | Report the production domain(s) and whether `fsbw.vercel.app` serves production | Vercel → Project → Domains | U-17 |
| 4 | Operator | Report whether Stripe **test-mode** keys, test Price IDs (3/6/12 months) and a test webhook endpoint exist. **Yes/no only** | Stripe → Developers (test mode) | U-20 |
| 5 | Operator | Run the doc 04 presence checks for the service-role key (names and yes/no) | Vercel env, Railway variables | U-01 |
| 6 | SITE00 owner | Agree to run the SITE00 sign-in / profile sync smoke against FS staging when it exists | — | H3 |
