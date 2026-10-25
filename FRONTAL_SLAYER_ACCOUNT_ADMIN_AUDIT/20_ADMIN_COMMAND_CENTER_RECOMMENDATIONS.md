# 20 — Admin Command Center Recommendations

## 1. Current dashboard verdict

`/admin/dashboard` is a **2-column grid of 12 link cards inside a 448px column**. It does not help run the business:

- **The top two cards are Studio OS** (HEADQUARTERS, STUDIO COMMAND CENTER), with constant decorative metrics.
- **Several numbers are fabricated or arithmetic guesses:** Brand 94% / 23% / 78% / +15%; "Reviews per month 18"; tax = revenue × 15%; quarterly = revenue × 65%; "on track to exceed targets".
- **Revenue and inventory figures** come from the admin's own browser storage.
- **RecentActivity and ActivityFeed** are hardcoded 2025 fiction ("DATA BREACH…", "TEMPERATURE ALERT…"), and their buttons only `console.log`.
- **If any API call fails, a full mock dashboard is shown silently.**
- **Founders see 20 mock clients** in the counts.
- **No card lists an actionable item.**

Live production context: **0 server orders, 9 profiles, 56 audit rows.** An honest Command Center on day one would show mostly empty queues. That is correct, and better than fabricated activity.

## 2. Principles

1. **Queues before metrics.** Each panel answers "what needs me?" and opens the exact list or item.
2. **Every number has a server source, or it is not shown.** No mock fallback. An API failure shows an error panel.
3. **Separate the four kinds of information:** ACTION QUEUES · SYSTEM ALERTS · BUSINESS METRICS · RECENT ACTIVITY.
4. **Same brand vocabulary.** Marble, `StatsCard` glass tiles, Covered By Your Grace titles, red counts. Wider at desktop (doc 19).
5. **Studio OS gets one link**, not the first two cards.

## 3. Proposed layout

```
COMMAND CENTER                                         [AdminHeader + admin menu]
┌──────────────────────── ACTION QUEUES (glass tiles, red count, oldest-first list of 3) ───────────┐
│ ORDERS NEEDING A FORM    │ READY TO SHIP / NO TRACKING │ DELAYED (> stage SLA)  │ APPROVALS      │
│ → /admin/orders?tab=     │ → /admin/orders?tab=READY   │ → /admin/orders?tab=   │ reviews·forms· │
│   NEEDS_FORM             │                             │   ISSUES               │ affiliate      │
├──────────────────────────┼─────────────────────────────┼────────────────────────┼────────────────┤
│ INBOX UNRESOLVED         │ MEETINGS TODAY / NEXT 48H   │ CONSULT OFFERS EXPIRING│ LOW STOCK      │
│ priority · contact · FAQ │ → /admin/meetings           │ (72h window)           │ → /admin/      │
│ → /admin/messages        │                             │                        │   inventory    │
└──────────────────────────┴─────────────────────────────┴────────────────────────┴────────────────┘
┌──────────── SYSTEM ALERTS (only when non-zero; red border) ───────────────────────────────────────┐
│ Membership payment failures (membership_payment_failures, last 7d) · Booking autopay failures       │
│ (booking_autopay_attempts) · Stripe webhook / grant failures (e.g. hair-analysis grant invalid)     │
│ · Email send failures · Reported Lounge comments over threshold                                    │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────── BUSINESS METRICS (4 tiles max, period selector 7d / 30d / quarter) ──────────────────┐
│ Revenue (server orders + membership_payments) · Orders placed · Active members by plan ·           │
│ New customers                                                                                      │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────── RECENT ACTIVITY (audit_log + order_status_events, last 20) ──────────────────────────┐
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
  STUDIO ↗ (single link)
```

## 4. Queue definitions and data sources

| Queue | Source today | Source after repair | Available now? |
|---|---|---|---|
| Orders needing a form | ✘ (local `AWAITING FORM` never written on the server) | `customer_orders.order_form_status='required'` (S1) | After Phase 1 |
| Ready to ship / no tracking | ✘ | `customer_orders.status='finalizing' AND tracking IS NULL` | After Phase 1 |
| Delayed | ✘ | `order_status_events` age > stage SLA (SLA = founder input, FD-B5) | After Phase 1 |
| Approvals | ✔ `/api/admin/pending-queue` | same | **Now** |
| Inbox unresolved | ✔ `priority_messages` + `brand_contact_inquiries` (status new); FAQ ✘ | `support_requests` (S7) | **Now** (partial) |
| Meetings today / 48h | ✔ `/api/admin/meetings` (without the mock merge) | same | **Now** |
| Consult offers expiring | ✔ `consult_quotes.expires_at` | same | **Now** |
| Low stock | ✘ | `inventory_items.on_hand <= low_threshold` (S14) | After Phase 3 |
| Membership payment failures | ✔ `membership_payment_failures` | same | **Now** |
| Booking autopay failures | ✔ `booking_autopay_attempts` | same | **Now** |
| Hair-analysis grant failures | ✘ (console only) | Grant failure rows | After Phase 0B |
| Revenue / orders metrics | Partial (`/api/admin/revenue` over stub orders) | `customer_orders` + `membership_payments` | Partial now |
| Active members by plan | ✔ `profiles.subscription_tier` | same | **Now** |
| Recent activity | ✔ `audit_log` | + `order_status_events` | **Now** |

**About half of the Command Center can be built on existing server data immediately** (approvals, inbox, meetings, consult offers, payment and autopay failures, members, audit activity). The order and inventory queues light up as Phases 1 and 3 land.

## 5. What to remove

- RecentActivity and ActivityFeed fixtures.
- `buildMockDashboardData()` fallback.
- Founder mock-client merge.
- Hardcoded Brand, Reviews, tax and quarterly numbers.
- The PREFERENCES and SETTINGS buttons (dead routes).
- The two Studio cards from the grid.
- The mock meetings merge.
- The admin-browser localStorage revenue and inventory feeds.

## 6. Acceptance criteria

- Every tile shows a count that matches a server query, opens a filtered list, and shows an empty state with a next step when it is zero.
- An API failure renders an error tile ("COULDN'T LOAD …  RETRY"), never mock data.
- Command Center loads in under 2 s on mobile (one aggregated `/api/admin/command-center` endpoint).
- Tests: a unit test per queue query, plus one Playwright admin spec using a seeded test admin on a non-production environment.
