# 18 — Next: S0B-2 Application Containment

S0B-1 closes database exposures only. This sprint's code-level reproductions confirm that the application-level CRITICAL risks are **still open** and **untouched by the migrations** (doc 15). S0B-2 is the next implementation sprint for them. The item numbers follow the S0A spec (`FRONTAL_SLAYER_S0A_S0B1_READINESS/15_APPLICATION_CONTAINMENT_S0B2_SPEC.md`); this document adds what the rehearsal learned.

## 1. Items carried from S0A, with new evidence

| # | Item | Risk | New evidence this sprint | Founder gate |
|---|---|---|---|---|
| 1 | Build-A-Wig checkout → custom quote | R-03 | Reproduced: a BAW NOIR line resolves `fullyResolved: true` at 74,000 cents, options unpriced | **A2** |
| 2 | Stripe session "activating" banner | — | — | Engineering default |
| 3 | Subscription cancellation via portal | R-15 | Static: 0 cancel paths in the code; webhook already mirrors `cancel_at_period_end` | **A4** |
| 4 | Paid entitlement fulfilment | R-10 (app side), R-13 | DB side rehearsed (M3). App: alert when a grant fails | E6 established |
| 5 | Slay Tickets `credit-order` → 410 | R-05 | Reproduced: 600 tickets from forged client lines; the DB cannot stop it because the endpoint uses the service role | A6 (engineering default) |
| 6 | Ignore client-supplied Stripe identifiers | R-09, R-12, R-14 | After M2, `meetings` writes are server-only; the API must stop copying client card IDs | A7 (engineering default) |
| 7 | Remove fake order and reward data | R-08 | — | **A5**, **F1** |
| 8 | Admin mock financial reporting | R-08 (admin side) | — | Engineering default; **no layout change** |
| 9 | Non-Stripe membership confirm | R-06 | SEC-22/28 show the DB already refuses customer membership writes; the remaining hole is localStorage-only UI | A3 (engineering default) |

## 2. Items added by this sprint

| # | Item | Why | Change |
|---|---|---|---|
| 10 | `getSupabaseAdmin()` fail-closed | Doc 04: 78 FS files silently fall back to the anon key. With M1A/M2 that fallback can only fail, but silently | Throw (503) when the service key is missing, as `getSupabaseAdminServiceRole` already does. Same for the two inline helpers (`api/lounge-tv-config.ts:41`, `api/special-offer-config.ts:44`) |
| 11 | Wire `env_guard.cjs` into build/start | Doc 03: guard verified locally (7/7) but not wired | Run at Vercel build for Preview and Production; production fails if it sees test Stripe keys or a staging ref |
| 12 | Email sandbox | G-6: staging must never mail customers | `EMAIL_SANDBOX_RECIPIENT` honoured by the mailer when `APP_ENV != production` |
| 13 | Table-level grant hardening (proposal) | Doc 07: anon/authenticated hold ALL on FS tables | FS-only migration revoking INSERT/UPDATE/DELETE/TRUNCATE from anon/authenticated on orders, meetings, notifications, reviews. DB sprint, A1-style approval |

## 3. U-21 / R-18 joint fix (not S0B-2 by default)

| Field | Detail |
|---|---|
| Problem | `trg_log_profile_changes` (out-of-band, owner unknown) blocks every customer-token profile update (FS and SITE00 `api/profile.ts`). Disabling it exposes R-18 |
| Required first | Identify the trigger owner (SITE00 owner asked). Founder decision (doc 17 §2) |
| Proposed shape | One migration that (a) extends `profiles_preserve_privileged_columns` to protect the affiliate/approval JSON keys, then (b) drops or fixes the debug trigger. Rehearse both on staging with the SEC-20…22, SEC-32 and REG-18 tests (the harness already has them) |
| Cross-product | Touches a shared trigger: SITE00 and JURNL signup and profile smoke required |

## 4. Out of scope (unchanged)

XD-1, XD-2, XD-3, responsive unification and any redesign. Mobile, Desktop/Tablet and Admin remain independent experience authorities: S0B-2 changes behaviour, not presentation, except the copy items each founder decision names.
