# 25 — Validation and Evidence Report

## 1. Validation checklist (brief §35)

| Requirement | Result | Where |
|---|---|---|
| Every account route inventoried | ✅ 28 customer surfaces (22 core + 6 parallel/adjacent) plus 3 redirects | doc 02 §4, doc 09 |
| Every admin route inventoried | ✅ 33 FS operational routes. ≈319 Studio OS / SITE00 routes identified and scoped out with justification. | doc 02 §4, doc 10 |
| Every scoped page assigned a maturity status | ✅ (0 COMPLETE_AND_VERIFIED: no page has functional test evidence) | docs 09, 10 |
| Every page has a defined parent or explicit top-level responsibility | ✅ | doc 08 (PARENT + RESPONSIBILITY columns) |
| Every incomplete page has a proposed treatment | ✅ Type A/B/C + phase | docs 09, 10 (RECOMMENDED_TREATMENT, PHASE) |
| Every dead control has a corresponding issue | ✅ DC-01…49, DA-01…48 each map to a BW-id or phase | doc 11 |
| Every major customer action has an admin counterpart or a documented reason it doesn't need one | ✅ 46 capabilities | doc 12 |
| Every significant admin action has a defined data source and permissions | ✅ | docs 10, 12, 13 |
| No invented business rules | ✅ Conflicts are listed as FD-R* decisions, not resolved by the audit | doc 24 |
| No unnecessary page duplication | ✅ Net reduction: admin 33 → 24; customer +2 new only where a task had no home | doc 07 |
| No unauthorized public-site redesign | ✅ No product files changed | git diff |
| No marble background replacement | ✅ | doc 18 |
| No glass-panel design replacement | ✅ | doc 18 |
| No production database modifications | ✅ Only `SELECT` against catalog views and aggregate counts, plus `get_advisors` | §3 |
| No new media assets | ✅ (`PAGE_TREE_BOARD.html` is a text/CSS diagram; evidence screenshots stayed in the session scratchpad and are not committed) | — |
| No provider credit spending | ✅ No Fal/OpenAI/Artlist calls; the local sweep blocked all non-localhost requests | §4 |
| No automatic merge | ✅ Branch `claude/frontal-slayer-audit-vclp3w` only; no PR merged | — |
| No production deployment | ✅ Commits carry no deploy action; Vercel deploys only on founder "deploy now" | — |

## 2. Independent spot-verification (by the lead auditor, beyond the six sub-audits)

| Claim | Verified how | Result |
|---|---|---|
| FRONTAL SLAYER = `yoteenz/fsbw` | README, AGENTS, CORE, SITE00 README | ✅ |
| Slay Tickets credited from client lines | Read `api/slay-tickets/credit-order.ts:40-95` | ✅ No payment or order verification |
| `psa_tool_events` RLS | Migration lacks it; live `relrowsecurity = true` | ✅ Downgraded to drift |
| Credit RPCs executable by `anon` | Live `information_schema.routine_privileges` + advisor + function source | ✅ **CRITICAL (new)** |
| 4-comparison credit grant | Live `pg_get_functiondef` shows `IN (1, 3, 6)` | ✅ Grants nothing |
| Legacy order/meeting/notification write policies | Live `pg_policies` | ✅ Present |
| BAW priced at base + cap by the server quote | `api/_lib/pricing/resolveQuote.ts:181-205`; `src/utils/checkoutQuote.ts:40-55` | ✅ (the docstring at `:207` contradicts the code) |
| Subscription / bookings / gift card / slay-ticket checkouts skip Stripe product payment | `src/utils/productCheckoutPolicy.ts:70-85` | ✅ |
| Concierge injects test orders into a non-founder customer | **Reproduced** in the local render: a new account visiting `/account/concierge` got `test-order-1…5` in `userOrders_<email>`, and `/account/rewards` then showed **3,960 PTS** (a fresh account shows 0). Code: `concierge/page.tsx:1760-1772` vs `1913-2211`. | ✅ **CRITICAL trust** |
| `/account` ≥768px redirects to `/desktop/account` | Reproduced in the sweep (`/account` at 768 landed on `/desktop/account`) | ✅ |
| Admin client guard is localStorage-only; server enforces | `AdminGuard.tsx`; `api/_lib/adminAuth.ts:37-94` | ✅ |

## 3. Live database queries executed (all read-only)

1. `get_advisors(type=security)` for project `hyycomvcaqxxvyrfupes`.
2. One `SELECT` combining: `pg_policies` for orders, meetings, notifications, reviews and profiles; `pg_class.relrowsecurity` for 5 tables; `information_schema.routine_privileges` for 4 functions; `information_schema.columns` for 3 profile columns; and `count(*)` aggregates for orders, profiles, loyalty > 0, BLACK tier, referral_earnings, audit_log and hairstyle purchase grants.
3. One `SELECT` over `pg_proc` / `pg_get_functiondef` for 2 functions, returning booleans only.

No customer row content was selected. No DDL or DML was executed.

## 4. Local render sweep (evidence for doc 19)

- **Server:** a local production build (`vite build`) served by `vite preview` on `127.0.0.1:4174`, with `VITE_DEV_PROXY_TARGET=http://127.0.0.1:9` (dead), so **no `/api` traffic could reach production** (`/api/profile` returned 500 locally). No Supabase env was set. An earlier dev-server run was discarded because cold module compiles exceeded the render wait and produced blank captures.
- **Browser:** Playwright Chromium. **Every request to a non-localhost host was aborted**, except Google Fonts.
- **Identities:** a synthetic customer (`audit.customer@example.test`) and a synthetic admin email from the code's default allow-list, both seeded into **local** browser storage only. With no API backend, pages show their empty or offline states, which is itself evidence of how they handle failure.
- **Viewports:** 390×844, 768×1024, 1440×900, 2560×1440.
- **Metrics per page:** landing URL (redirects), horizontal overflow, count of interactive elements and of those under 24px, marble/glass presence, page errors.
- **Raw results:** `appendix/responsive_sweep_results.jsonl`. Screenshots were kept in the session scratchpad and not committed.

## 5. Build / test evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` (8 GB heap) | **0 errors** |
| `npx vite build` | **PASS** (62s) |
| `npx vitest run` | 1,340 passed / 17 failed / 11 skipped across 112 files. The 9 failing files are all outside scope (Studio OS, SITE00 bridge, platform-stabilization). |
| Account/admin unit tests | none exist |
| Admin E2E | none exist |

## 6. Limits of this audit (stated plainly)

- No authenticated end-to-end run against a real Supabase backend: production was deliberately not touched, and there is no staging project. Interaction classifications come from code reading plus the offline render. **UNVERIFIED** is used wherever behaviour depends on live data.
- Reward PNG art (Supabase Storage) was not downloaded, so whether the existing three phase images depict ghosted-to-coloured sections is UNVERIFIED (FD-R2).
- Studio OS and SITE00 admin surfaces were not audited beyond their intrusion into the FS admin. One out-of-scope security issue was noted (`api/expert-capture/knowledge-mirror.ts`).
- The Desktop Mansion (`/desktop/*`) is outside the declared mobile-first build target. It was inventoried, not deeply audited.
