# 13 — Staging Environment Proposal (decision H2)

## Recommendation (the simplest safe configuration)

> **A separate Supabase project for FRONTAL SLAYER staging, plus a Vercel Preview-scoped environment on a fixed staging hostname, plus Stripe test mode.** No real data, no live payments, nothing shared with production except source code.

| Layer | Recommendation | Why |
|---|---|---|
| Database | **New Supabase project** `frontal-slayer-staging` (its own ref). Schema created from a **schema-only** dump of production: all of `public` (including SITE00 and Studio tables, so cross-product effects can be rehearsed), the `auth` triggers, and the storage bucket definitions. **No rows copied.** | Isolation. The shared project's migration history cannot be replayed cleanly (interleaved repos, colliding versions, out-of-band objects such as `trg_log_profile_changes`), so a branch built by replaying migrations would not match production. A schema-only dump does. |
| Alternative | Supabase **branching** on the shared project | Only if the plan supports it **and** a replay test succeeds. Branches replay migrations. **Not recommended** until the migration history is reconciled. |
| Not acceptable | SITE00's setup as FRONTAL SLAYER staging | SITE00 has no staging project. Its CI tests run against the shared production project. |
| Application | The same Vercel project, using **Preview** environment variables scoped to a dedicated branch (`staging`) and a fixed domain, e.g. `staging.frontalslayer.com` | One project to maintain. Environment-scoped variables keep production secrets out. A fixed host keeps Stripe webhooks and auth redirects stable. |
| Host caveat | `isPreviewEnvironment()` treats `*.vercel.app` as preview and enables demo paths. Use the custom staging domain and add it to the preview-host list explicitly. Confirm production is **not** served on `*.vercel.app` (doc 12 A5). | Prevents mock data leaking into tests or production. |
| Payments | Stripe **test mode** keys (`sk_test_…`), test Price IDs for 3/6/12 months, a test webhook endpoint `https://staging…/api/stripe/webhook` with its own `whsec_`, the Customer Portal configured in test mode. **Stripe CLI** (`stripe trigger`, `stripe listen`) for webhook replay. | No live charges. Real webhook signatures. |
| Email | Resend test domain, or a capture inbox. `SITE_URL` = the staging host. | No customer email. |
| Auth | The staging project's own Auth. Site URL and redirect allow-list = the staging host only. | Never shares production's Auth configuration. |
| Secrets | The staging service-role key lives only in Vercel's Preview scope (Sensitive). | Doc 12 §3E. |

## Synthetic fixtures (no real customer data)

| Fixture set | Contents |
|---|---|
| Identities | `guest` (no account) · `customer.std@staging.test` · `member.3m@`, `member.6m@`, `member.12m@` (subscriptions via Stripe test clocks) · `black.tier@` · `admin@` (in the staging `ADMIN_EMAILS`) · `founder@` (staging founder identity) · `site00.user@` and `jurnl.user@` (cross-product smoke). Passwords are generated and kept in the operator's vault. |
| Catalogue | The real product names and prices from code (`UNIT_BASE_USD_BY_NAME`, analysis 1 = $20 / 4 = $60). No customer content. |
| Membership | Test subscriptions per tier; one cancelling at period end; one with a failed renewal (test card 4000 0000 0000 0341). |
| Rewards | Profile balances at 0 / 1,000 / 4,000 points; one voucher; one gift balance. These are synthetic values for display tests, not business rules. |
| Orders | 0 orders initially. Orders are created by running test-mode purchases (the webhook writes them), never by seeding the orders table. |
| Hair analysis | One user with an empty queue; one after buying a test-mode 4-pack (validates M3). |
| Roles and permissions | Admin vs non-admin API calls; anon vs authenticated RPC probes (V1 Part B). |

## Workflow

1. **Provision** (operator): create the staging project → apply the schema-only dump → create buckets → set Vercel Preview environment variables → point the DNS for the staging host.
2. **Baseline:** run `V0_PRECHECK` on staging. Its output must match production's on the objects in scope (expected differences: row counts).
3. **Rehearse S0B-1:** apply M1A → M2 → M3 on staging → run `V1` Part A and Part B → the doc 14 test plan.
4. **Smoke:** FRONTAL SLAYER E2E (hair analysis, PSA, lounge, Stripe test webhook, membership test checkout); SITE00 sign-in + profile sync and JURNL signup against staging (doc 11 §4).
5. **Evidence pack:** V0/V1 outputs, test results, advisor before/after, operator name, date.
6. **Promote:** founder A1b → apply the same files to production in the same order → V1 Part A on production → 24h log watch.
7. **Teardown/reset:** reset staging data between rehearsals (truncate synthetic tables, never production).

## Effort and cost (indicative, UNVERIFIED pricing)

- One additional Supabase project (a free tier may suffice for rehearsal; a paid tier is needed for always-on use). Vercel Preview is included. A Stripe test account costs nothing. The DNS record is negligible.
- Operator time: about half a day to provision, plus about one hour per rehearsal.

## What the founder chooses (H2)

| Option | Isolation | Effort | Recommendation |
|---|---|---|---|
| **1. Separate staging Supabase project + Vercel Preview on a staging domain + Stripe test mode** | Full | Medium | **Recommended** |
| 2. Supabase branching on the shared project | Good (after a successful replay test) | Low–medium | Only if the plan supports it and the replay succeeds |
| 3. No staging; apply S0B-1 to production with the read-only pre/post checks only | None | Lowest | Not recommended (doc 14 lists what cannot be tested this way) |

H2 stays **Category 4 (blocked by evidence)** until the operator confirms: the Supabase plan tier and branching availability, which domain serves production, and whether Stripe test-mode keys and Price IDs exist.
