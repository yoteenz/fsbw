# Release Gate — Product Genome

Release criteria for Build-a-Wig / Frontal Slayer production launch.  
Derived from genome audit 2026-06-12. Each gate has an **owner** field for team assignment.

---

## Gate status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Met at `2ea7bd9e` or earlier |
| ⚠️ | Partial / manual action required |
| ❌ | Not met |
| 🔄 | In progress / deferred with ticket |

---

## P0 — Must pass (security & money)

| # | Gate | Status | Evidence / action | Owner |
|---|------|--------|-------------------|-------|
| G-P0-1 | **No committed secrets** in tracked files | ✅ | `.env.wig-preview` removed `2ea7bd9e` | Eng |
| G-P0-2 | **Git history scrubbed** OR keys rotated treating history as compromised | ⚠️ | User must run `docs/SECURITY_SECRETS_ROTATION.md` | Ops |
| G-P0-3 | **No plaintext password persistence** in localStorage/cookies | ✅ | `authPasswordSanitize.ts`, sign-in changes | Eng |
| G-P0-4 | **Frontend build passes** (`npm run build`) | ✅ | runtime-verified | CI |
| G-P0-5 | **Every Stripe-chargeable line server-priced** (`fullyResolved`) | ❌ | BAW/BCF/gift unresolved — `resolveQuote.ts:207-209` | Eng |
| G-P0-6 | **PaymentIntent amount from server quote only** on product checkout | ⚠️ | API exists; UI may use legacy confirm | Eng |
| G-P0-7 | **Webhook idempotency** tested for `payment_intent.succeeded` | ❌ | `recordProductOrderFromPaymentIntent.ts` | Eng |
| G-P0-8 | **session-restore** origin locked; refresh token not in JSON body | ❌ | `session-restore.ts:92-141` | Eng |

---

## P1 — Strongly required before scale

| # | Gate | Status | Evidence / action | Owner |
|---|------|--------|-------------------|-------|
| G-P1-1 | **API typecheck passes** in CI (`api/` included) | ❌ | 19 errors; `tsconfig` src-only | Eng |
| G-P1-2 | **Critical APIs have contract tests** (quote, PI, webhook, profile) | ❌ | see test matrix | Eng |
| G-P1-3 | **Durable rate limits** on Fal routes (NOIR color, styling) | ❌ | in-memory only | Eng |
| G-P1-4 | **Admin/founder APIs server-verified** (no client-only admin) | ⚠️ | AdminGuard client + `requireAdmin` server | Eng |
| G-P1-5 | **Supabase RLS tested** for profiles, cart, orders | ❌ | migrations exist | Eng |
| G-P1-6 | **Mobile guest journey** E2E green | ⚠️ | 11 guest tests; WebKit install needed locally | QA |
| G-P1-7 | **Mobile signed-in journey** E2E green | ⚠️ | 11 tests; needs `.env.e2e.local` | QA |
| G-P1-8 | **Pricing catalog single source** — no known mismatches | ❌ | BEACH WAVE wishlist bug | Eng |
| G-P1-9 | **npm audit** — no high/critical in prod deps | ⚠️ | 24 moderate at audit | Eng |

---

## P2 — Hardening & hygiene

| # | Gate | Status | Action | Owner |
|---|------|--------|--------|-------|
| G-P2-1 | Motherboard CODEBASE reconciled or genome kept current | ⚠️ | This genome replaces stale CODEBASE | Eng |
| G-P2-2 | Repo size: `canonical-backup` untracked or removed | ❌ | ~830M | Eng |
| G-P2-3 | `public/assets` optimized or CDN split | ❌ | ~1.2G | Eng |
| G-P2-4 | Admin SPA split or code-split admin bundle | 🔄 | planned | Eng |
| G-P2-5 | JSONB orders → relational order model | 🔄 | planned | Eng |
| G-P2-6 | Playwright admin smoke | ❌ | | QA |
| G-P2-7 | OpenAPI or shared Zod contracts for API | 🔄 | planned | Eng |

---

## Explicit deferrals (must be documented if waived)

| Item | Risk accepted | Approver |
|------|---------------|----------|
| Desktop layout | Mobile-only launch | Product |
| DRM for lounge MP4 | Public MP4 acceptable short-term | Product |
| Local cart for guests | Guest checkout without account | Product |
| Founder demo orders in production build | Demo data merge | Founder |

---

## Release checklist (run order)

1. ✅ `npm ci && npm run build`
2. ❌ API `tsc` clean (add to CI)
3. ⚠️ Rotate secrets if history leaked
4. ❌ `FULL_GENOME_TEST_MATRIX` P0 rows green
5. ❌ Stripe test-mode purchase on `/checkout` with resolved lines only
6. ⚠️ Manual iPhone Safari: sign-in → bag → checkout → sign-out
7. ⚠️ Vercel env audit (all vars in `.env.example` set)
8. ❌ Sign off on **G-P0-5** (server pricing) — **launch blocker for product checkout**

---

## Sign-off template

```
Release: ___________
Commit: ___________
G-P0 failures waived: ___________ (approver: ___)
G-P1 failures waived: ___________ (approver: ___)
Mobile QA device: ___________
Stripe mode: test / live
```

---

## Mapping to genome docs

| Gate area | Reference |
|-----------|-----------|
| Architecture risks | `architecture/PRODUCT_GENOME_INDEX.md` |
| Pricing completeness | `architecture/PRODUCT_AND_PRICING_GENOME.md` |
| API contracts | `architecture/API_CONTRACT_REGISTRY.md` |
| Test cases | `FULL_GENOME_TEST_MATRIX.md` |
| Motherboard truth | `architecture/MOTHERBOARD_RECONCILIATION.md` |
