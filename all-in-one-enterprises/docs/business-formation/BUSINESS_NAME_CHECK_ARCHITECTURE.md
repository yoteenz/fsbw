# Business Name Check Architecture

All In One Smart Intake performs **state-aware business name registry searches** during Step 3 (Business Information) and again before service request submission when results are stale or inputs changed.

## Principles

- A registry **search result is not state filing approval**.
- Never claim guaranteed availability, reservation, or Secretary of State approval.
- Unsupported states return **Manual Verification Required** — users may continue intake.
- Demo mode uses an isolated **deterministic demo adapter** — never mixed with production registry responses.

## Registry adapter architecture

```
BusinessNameCheckField / RequestSubmitPage
        ↓
nameCheckClient.requestBusinessNameCheck()
        ↓ (demo)              ↓ (production)
demoAdapter              POST /api/aio/business-name-check
                                ↓
                         registryService.checkBusinessNameAvailability()
                                ↓
                    topographAdapter (if AIO_TOPOGRAPH_API_KEY set)
                    unsupportedAdapter (fallback)
```

Entry point:

```ts
checkBusinessNameAvailability({ state, businessName, entityType, demoMode })
```

Adapters live under `src/business-formation/businessNameRegistry/adapters/`.

## Supported-state configuration

`stateCapabilities.ts` defines per-state metadata:

| Field | Purpose |
|-------|---------|
| `automatedLookupSupported` | Whether automated lookup is architecturally supported |
| `lookupMethod` | `demo`, `topograph_api`, or `none` |
| `sourceName` / `sourceUrl` | Attribution for UI and audit |
| `manualReviewRequired` | Default when lookup unavailable |
| `entityRulesSupported` | Structure-aware validation flag (adapter-level) |

Production automated lookup for TN, GA, IL requires **`AIO_TOPOGRAPH_API_KEY`** (commercial provider hitting live SOS portals). Without the key, those states fall back to manual verification.

See also: [BUSINESS_NAME_REGISTRY_SUPPORT.md](./BUSINESS_NAME_REGISTRY_SUPPORT.md)

## Lookup statuses

| Status | Meaning |
|--------|---------|
| `idle` | No check yet |
| `checking` | In-flight (UI only) |
| `likely_available` | No exact conflict found |
| `possible_conflict` | Similar names returned |
| `unavailable` | Exact/strong conflict |
| `manual_review_required` | Staff must verify |
| `lookup_unavailable` | No integration for state |
| `error` | Provider/transport failure |
| `stale_result` | Inputs or TTL invalidated prior result |

## Data model (intake)

Stored on `intake.business.nameCheck`:

- `businessNameRaw`, `businessNameNormalized`
- `formationState`, `entityStructure`
- `status`, `source`, `sourceUrl`, `checkedAt`, `queryId`
- `matchCount`, `topMatches`, `manualReviewRequired`, `errorCode`
- `fingerprint` — normalized inputs hash for stale detection

## Stale-result behavior

Results invalidate when **business name**, **formation state**, or **entity structure** changes, or after **24 hours** (`NAME_CHECK_STALE_MS`).

UI shows **“Name changed — check again”** and clears green availability styling.

## Manual-review workflow

When status is `lookup_unavailable` or `manual_review_required`, demo store creates an Office work item in queue **`business_name_review`** (`/office/business-name-review`).

Staff verify manually against the state registry and update the client formation record (future: persisted review outcome).

## Final recheck

`RequestSubmitPage` calls `shouldRecheckBeforeSubmit()` before submit. If stale/missing/changed, it runs a fresh check and persists the result on intake.

## Security

- Lookups run **server-side** in production (`api/aio/business-name-check.ts`).
- Validates state code, name length, JSON shape.
- Per-IP rate limit (30/hour) via `server/rateLimit.ts`.
- No registry API keys in client bundles.
- Short TTL in-memory cache (5 minutes) keyed by state + normalized name + entity type.

## Rate limiting

Client demo path bypasses HTTP rate limits. Production endpoint enforces IP buckets independent of client.

## i18n

Namespace: **`intake`** — English (`en-US`) and Spanish (`es-US`) keys under `nameCheck.*`. Official registry entity names are not translated.

## Demo Mode

Demo adapter keywords (case-insensitive normalized name):

| Pattern | Result |
|---------|--------|
| `demo available`, `unique*` | Likely available |
| `perfect choice`, `demo conflict` | Possible conflict |
| `demo conflict exact` | Unavailable |
| `demo manual` | Manual review |
| `demo error` | Error |

Set `AIO_ALLOW_DEMO_NAME_CHECK=1` to allow demo responses through the HTTP endpoint in non-production.

## Observability

`logNameCheckHealth()` emits JSON logs: state, status, adapter, latency, error code — no full business names in production logs beyond operational need (handler logs status only).
