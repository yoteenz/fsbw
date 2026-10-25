# L — Live read-only verification (2026-10-25, this sprint)

Project `hyycomvcaqxxvyrfupes` (shared FRONTAL SLAYER / SITE00 / JURNL). Calls made: 4 × `execute_sql` with **SELECT-only catalog and aggregate-count queries**, 1 × `list_migrations`, 1 × `get_advisors(security)`. **No write, DDL, RPC execution or exploit attempt.** No row content was read except aggregate counts. Advisor observation timestamp: 2026-10-25T20:36:39Z.

## 1. SECURITY DEFINER functions in `public` (17 incl. two overloads) — all executable by anon AND authenticated

| Function | Args | anon | authenticated | PUBLIC (`=X`) in ACL | search_path set |
|---|---|---|---|---|---|
| hairstyle_analysis_grant_purchase_credits | p_user_id uuid, p_payment_intent_id text, p_comparison_counts int[] | YES | YES | no | yes |
| hairstyle_analysis_refund_consume (4-arg) | p_user_id, p_month_key, p_source, p_comparison_count | YES | YES | **yes** | yes |
| hairstyle_analysis_refund_consume (2-arg, legacy overload) | p_user_id, p_month_key | YES | YES | no | yes |
| hairstyle_analysis_try_consume | p_user_id, p_month_key, p_month_limit | YES | YES | no | yes |
| psa_try_consume_message | p_user_id, p_month_key, p_day_key, p_month_limit, p_day_limit | YES | YES | no | yes |
| psa_consume_watch_if_qualified | p_session_id, p_user_id | YES | YES | no | yes |
| lounge_toggle_helpful | p_content_type, p_content_id, p_user_id | YES | YES | **yes** | yes |
| lounge_record_qualified_view | p_content_type, p_content_id, p_watch_seconds, p_duration_seconds, p_user_id, p_viewer_key | YES | YES | **yes** | yes |
| lounge_engagement_ensure_summary | p_content_type, p_content_id | YES | YES | **yes** | yes |
| lounge_engagement_recount_summary | p_content_type, p_content_id | YES | YES | **yes** | yes |
| studio_world_atomic_reserve_budget | (10 args) | YES | YES | **yes** | yes |
| slay_forecast_public_broadcast_package | p_edition_slug | YES | YES | no | yes |
| trend_intelligence_public_forecast_payload | p_edition_slug | YES | YES | **yes** | yes |
| trend_intelligence_public_report_signals | p_pack_id | YES | YES | **yes** | yes |
| site00_allocate_access_credential_code (SITE00-owned) | — | YES | YES | **yes** | yes |
| handle_new_user (trigger fn) | — | YES | YES | **yes** | yes |
| profiles_preserve_privileged_columns (trigger fn) | — | YES | YES | **yes** | yes |

- `hairstyle_analysis_grant_purchase_credits` body: **does not reference `auth.uid()`**; pack check is `IN (1, 3, 6)` (the app sells 1 and 4 → R-10 reconfirmed live).
- The 2-arg `hairstyle_analysis_refund_consume` overload is a **second callable signature** the earlier register did not list separately; the revoke must name both signatures.

## 2. Customer write policies (live `pg_policies`)

| Table | Legacy write policies present | Notes |
|---|---|---|
| orders | "Users can insert own orders" (INSERT), "Users can update own orders" (UPDATE) | R-04 reconfirmed. 2 SELECT policies (duplicate) |
| meetings | insert / update / delete own | R-04, R-09 reconfirmed |
| notifications | insert / update own | R-04 reconfirmed |
| reviews | insert own | R-04 reconfirmed |
| profiles | insert own ×2, update own ×2 (one without WITH CHECK) | Guarded by `profiles_guard_privileged_columns` trigger; SITE00 relies on these (do not drop) |
| cart, wishlist | ALL own + per-command own (duplicates) | Legitimate customer-owned data; out of scope |
| user_activity | insert/select own (duplicates) | SITE00 inserts; out of scope |
| priority_messages, consult_quotes, membership_payments, slay_ticket_transactions, booking_autopay_attempts | select own (+ priority insert own) | OK |

Table-level grants: `anon` holds INSERT/UPDATE/DELETE on orders, meetings, notifications, reviews, profiles (Supabase default). RLS blocks anon because the policies require `auth.uid() = user_id` (anon has no uid). Containment therefore targets the **policies**, not the default grants.

## 3. Triggers

| Table | Trigger | Function |
|---|---|---|
| auth.users | on_auth_user_created | handle_new_user (SECURITY DEFINER) |
| public.profiles | profiles_guard_privileged_columns | profiles_preserve_privileged_columns (SECURITY DEFINER) |
| public.profiles | trg_log_profile_changes | log_profile_changes (**SECURITY INVOKER, mutable search_path**, inserts into `public.profile_debug_log`, which has RLS on and no policies) |

`trg_log_profile_changes` was not in the prior register. INFERRED: as an invoker function inserting into an RLS-locked table, a non-service profile UPDATE could fail unless the insert path is conditional. This needs a staging test (U-new; see 18).

## 4. Aggregate counts (no row content)

| Table / filter | Rows |
|---|---|
| orders | 0 |
| meetings | 0 |
| hairstyle_analysis_purchase_grants | 0 |
| slay_ticket_transactions | 0 |
| profiles where membership_type='PREMIUM' | 0 |
| profiles with stripe_subscription_id | 0 |

**Meaning:** in the database, no customer currently holds an order, meeting, paid hair-analysis grant, Slay Ticket transaction or Stripe subscription. Database-side remediation (decision A8) has no rows to act on today. Stripe-side history (charges that never reached the DB) is **not** verified.

## 5. Advisor (security), 2026-10-25T20:36:39Z

| Lint | Level | Count | FRONTAL SLAYER-relevant |
|---|---|---|---|
| anon_security_definer_function_executable | WARN | 17 | 13 FS functions + 2 trigger fns + 1 SITE00 fn + studio_world |
| authenticated_security_definer_function_executable | WARN | 17 | same set |
| rls_disabled_in_public | **ERROR** | 2 | **SITE00 tables** `site00_production_invalidation_events`, `site00_production_dependency_edges` — SITE00-owned; report only |
| function_search_path_mutable | WARN | 2 | `log_profile_changes` (FS), `studio_asset_registry_refresh_search_document` (Studio) |
| rls_enabled_no_policy | INFO | 95 | service-only tables (expected deny-all) |
| auth_leaked_password_protection | WARN | 1 | project-wide auth setting (shared with SITE00/JURNL) |

## 6. Remote migration history

- Highest applied version: **20261011140245** (`site00_digital_foundation_persistence_v2`).
- Remote versions are apply-time timestamps and do **not** match repo filenames (e.g. repo `20260820190000_studio_world_governance_enforcement.sql` is remote `20260820170859`). Both repos' migrations appear interleaved.
- A new FS containment migration must use a version **greater than 20261011140245 and unused in either repo**, applied only after re-listing.

## 7. `trg_log_profile_changes` detail (function source read; it is code, not customer data)

- `AFTER UPDATE ON public.profiles FOR EACH ROW`, function owner `postgres`, **SECURITY INVOKER**, no `search_path`.
- Body: unconditional `INSERT INTO public.profile_debug_log (profile_id, email, old/new first_name, last_name, profile_image)`.
- `profile_debug_log`: RLS enabled, **no policies**, **0 rows**.
- INFERRED consequence: any profile UPDATE made with a user JWT (not service role) should fail with an RLS violation on the log insert, rolling back the update. Callers that use a user JWT include SITE00 `api/profile.ts` upsert (X2 §1a). Zero log rows is consistent with no successful profile updates since the trigger was created, or with the log having been cleared. **Not reproduced** (no write was attempted). Not defined in any migration file in either repo (grep) → created out-of-band.
