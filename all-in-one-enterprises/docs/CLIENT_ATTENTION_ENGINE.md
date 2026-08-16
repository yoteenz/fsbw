# All In One — Client Attention Engine

**Sprint:** 12 — Attention aggregation · Next action · Dedupe  
**Status:** Implemented in `clientAttentionEngine.ts`, `clientNextActionEngine.ts`, collectors in `clientCommandCenterService.ts`  
**Last updated:** 2026-08-15

---

## Purpose

The **Client Attention Engine** turns noisy cross-domain state (documents, loads, insurance, billing, renewals, Road Ready, optional services) into a **short, deduplicated list** of customer-actionable items plus **one** next-action hero.

Design goals:

- **No duplicate alarms** for the same underlying issue (especially insurance expiry)
- **Operational beats optional** — growth recommendations never outrank compliance/ops
- **Deterministic** — same store state → same ordering (testable)
- **Actionable CTAs** — every item resolves to a concrete route

---

## Architecture

```
collectAttentionCandidates(ctx, store)
  → RawAttentionCandidate[]     // many rows, may duplicate keys
       ↓
aggregateAttentionItems()
  → ClientAttentionItem[]       // deduped, sorted for list UI
       ↓
selectNextAction(candidates, attentionItems)
  → ClientNextAction | undefined // single hero
```

**Optional filter (next action only):** `suppressOptionalGrowthItems()` removes `category: 'services'` when any operational candidate exists.

---

## Action sources

Collectors run in `collectAttentionCandidates()`. Shipper orgs **return early** after shipper quote candidates.

### Shipper (`ctx.isShipper`)

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| Freight quotes | `status ∈ {sent, viewed}` | `shipper-quote:{quoteId}` | high |

### Carrier — Road Ready

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| Road Ready attention items | Top 8 from `getRoadReadySummary()` | `rr:{itemId}` | urgent/high/normal from score |

### Carrier — Documents (Vault)

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| Requested upload | `status === 'requested'` | `doc-needed:{docId}` | high |
| Expiring document | current + expires ≤45 days | `doc-expiry:{docId}` | urgent/high/normal/low from days |

### Carrier — Renewals

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| Open renewal | not completed/declined/N/A, ≤60 days | `renewal:{renewalId}` **or** `insurance-expiry:{orgId}:{date}` if insurance-related |

Insurance-related renewals use **`insurance-expiry:{orgId}:{expirationDate}`** — same key as active policy expiry below.

### Carrier — Insurance

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| Active policy expiring | expiration ≤45 days | `insurance-expiry:{orgId}:{expirationDate}` | from `priorityFromDays()` |
| Open insurance request | no active policy; request in flight | `insurance-request:{requestId}` | normal |
| Missing insurance | no policy, no open request | `insurance-missing:{orgId}` | high |

### Carrier — Dispatch

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| POD needed | `operationalStatus === 'pod_needed'` && no POD doc | `load-pod:{loadId}` | urgent |
| Load offer | `offerStatus === 'awaiting_carrier'` | `load-offer:{loadId}` | high |
| Factoring handoff ready | `factoringHandoffStatus === 'ready'` | `factoring-ready:{loadId}` | normal |

### Carrier — Factoring

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| Submission docs needed | `status === 'documents_needed'` | `factoring-doc:{submissionId}` | high |

### Carrier — Billing

| Source | Condition | dedupeKey | Priority |
|--------|-----------|-----------|----------|
| Open invoice | due within 14 days or past due | `invoice:{invoiceId}` | high/normal |

Gated by **`ctx.canViewBilling`**.

### Carrier — Service requests & growth

| Source | Condition | dedupeKey | Priority | Category |
|--------|-----------|-----------|----------|----------|
| Request waiting on customer | `status === 'documents_needed'` | `service-request:{requestId}` | high | services |
| Factoring explore | enrolled `interested`, no submissions | `factoring-explore:{orgId}` | low | services |

---

## Priority rules

### Action priority enum

`urgent` · `high` · `normal` · `low`

### Priority weights (aggregation sort)

| Priority | Weight |
|----------|--------|
| urgent | 400 |
| high | 300 |
| normal | 200 |
| low | 100 |

List sort score: `PRIORITY_WEIGHT[priority] + (deadline ? -daysUntil(deadline) : 0)` — sooner deadlines rise within the same band.

### Time-based mapping (`priorityFromDays`)

Used for document expiry, renewals, insurance policy:

| Days until deadline | Priority |
|---------------------|----------|
| < 0 (expired) | urgent |
| ≤ 7 | urgent |
| ≤ 18 | high |
| ≤ 30 | normal |
| else | low |

Collectors also assign **`sortScore`** per domain (e.g. POD = 520, insurance ≤7 days = 490) for next-action tie-breaking.

---

## Deduplication

### Algorithm (`aggregateAttentionItems`)

1. Index candidates by **`dedupeKey`**
2. On duplicate key:
   - **Union** `affectedAreas` arrays
   - Keep **higher priority** title, explanation, CTA fields
3. Sort merged set by priority + deadline proximity

### Insurance expiry canonical key

**`insurance-expiry:{orgId}:{date}`**

Emitted by:

- Active policy expiration candidate
- Insurance-category renewal record (when title/category indicates insurance)

This prevents duplicate rows when Renewal Center and Insurance module both surface the same expiration.

**Unit test:** two candidates with the same insurance-expiry key merge to one item with affected areas `Insurance`, `Renewals`, `Road Ready`.

### Document vs notification dedupe

Command center dedupe keys are **independent** from notification engine keys (`doc-expiring-30d:*`, etc.) but should describe the same entity. Future production may unify key namespaces — see **`NOTIFICATION_SYSTEM.md`**.

---

## Urgency

Urgency is expressed through:

1. **`priority`** — drives sort order and badge styling
2. **`statusLabel`** — customer language (`POD NEEDED`, `EXPIRING SOON`, `WAITING ON YOU`)
3. **`deadline` / `deadlineLabel`** — ISO date + human `formatDaysRemaining()`
4. **`sortScore`** — domain-specific boost for next-action selection

Next-action precedence (see below) can promote an item even when sort scores are close — e.g. expired document beats optional factoring explore.

---

## CTA resolution

Each candidate includes:

| Field | Purpose |
|-------|---------|
| `ctaLabel` | Button text (ALL CAPS customer convention) |
| `ctaHref` | Absolute path under `/all-in-one` via `aioPaths` |
| `entityType` / `entityId` | Analytics + future deep linking |
| `affectedAreas` | Cross-domain labels after merge |

`selectNextAction()` prefers the matching **`ClientAttentionItem`** row (post-dedupe) so list and hero CTAs stay aligned.

### Example CTAs

| Item | ctaLabel | ctaHref |
|------|----------|---------|
| Policy expiring | REVIEW INSURANCE | `/portal/insurance/policies/:policyId` |
| POD needed | SUBMIT POD | `/portal/dispatch/loads/:loadId` |
| Doc requested | UPLOAD DOCUMENT | `/portal/vault/:documentId` |
| Invoice past due | REVIEW INVOICE | `/portal/billing/invoices/:invoiceId` |
| Renewal window | START RENEWAL | `/portal/renewals` |

---

## Optional-service suppression

**Function:** `suppressOptionalGrowthItems(candidates, hasOperationalItems)`

When **any** candidate has `category !== 'services'`:

- Filter out all `category === 'services'` candidates **before** next-action selection

Rationale: “Explore factoring assistance” must not become the hero when POD or insurance expiry is open.

**Does not apply** to attention list aggregation directly — service-request items (`documents_needed`) are `category: 'services'` but are **operational** and use high priority; they remain in the operational set for suppression logic because they are not filtered (only growth/low explore items are `services` + suppressed when ops exist).

Growth items still appear in the attention list when no operational items exist (greenfield org).

---

## Next-action selection

**Function:** `selectNextAction(candidates, attentionItems)`

1. Identify operational candidates (`category !== 'services'`)
2. Apply optional-service suppression
3. `sortCandidates()` — `sortScore + PRIORITY_WEIGHT`
4. Take top candidate; map to aggregated attention item
5. Return `ClientNextAction` with `reason` = source `statusLabel`

Documented precedence (product contract):

1. Expired critical document  
2. Service request blocked by customer info  
3. Load delivery / POD action  
4. Insurance/registration urgent window (≤7 days)  
5. Carrier load offer requiring response  
6. Factoring package missing item  
7. Renewal action  
8. Open invoice past due / due soon  
9. Unread message requiring response  
10. Optional growth (low only)  

Precedence is implemented via **`sortScore`** tuning in collectors + priority weights — not a separate rule engine. Changing scores requires test updates.

---

## All-caught-up behavior

**Flag:** `allCaughtUp = attentionItems.length === 0`

When true:

- `AllCaughtUpBanner` renders on `/portal`
- `businessStatus` tone = `good`, label = `GOOD`
- Next action hero hidden (no `ClientNextAction`)
- Upcoming calendar items may still show in sidebar — they are informational, not attention queue

Demo baseline: **client-g (RidgeLine)** seeded for minimal attention — use for QA.

---

## Attention categories

`AttentionCategory` values:

`road_ready` · `documents` · `renewals` · `insurance` · `dispatch` · `factoring` · `billing` · `messages` · `brokerage` · `services`

Used for filtering, analytics, and calendar icon mapping on hub pages.

---

## Testing

`src/all-in-one/portal/clientCommandCenter.test.ts`:

- Dedupe merge for `insurance-expiry:{orgId}:{date}`
- Optional growth suppressed when operational items present
- Next action prefers urgent insurance over low factoring explore
- Driver role excludes money (integration with command center service)
- No combined money total field

Run: `npm test -- clientCommandCenter`

---

## Production migration notes

| Demo | Production |
|------|------------|
| Synchronous collectors in browser | Server materialized view or edge function |
| `dedupeKey` in memory | Persist on `aio_attention_items` with unique (org_id, dedupe_key) |
| Role gate client-side | RLS + membership claims |
| Sort/score constants in TS | Versioned rule config document |

Keep **`insurance-expiry:{orgId}:{date}`** as the canonical insurance expiration key across notification, attention, and calendar systems.

---

## Related documentation

- **`CLIENT_COMMAND_CENTER.md`** — dashboard composition
- **`NOTIFICATION_SYSTEM.md`** — parallel in-app notification dedupe
- **`RENEWAL_SYSTEM.md`** — renewal vs insurance renewal overlap
- **`INSURANCE_SYSTEM.md`** — policy expiration derivation
