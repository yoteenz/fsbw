# Road Ready System — All In One Enterprises Inc.

**Sprint:** 05  
**Product name:** `Road Ready` (configurable via `ROAD_READY_PRODUCT_NAME` in `roadReadyConfig.ts`)  
**Rule version:** `2026.08` (internal product rules — not government rules)

---

## Purpose

Road Ready is the customer’s **persistent business-readiness profile** — not a one-time signup wizard. It answers:

- Where is my business right now?
- What have I completed vs. what has All In One verified?
- What needs attention, review, or renewal?
- What should I do next?

Road Ready is a **business organization and service-assistance tool**. It is **not** legal advice, **not** a government system, and must **not** claim legal/federal compliance unless a future validated compliance engine supports that determination.

Preferred language: **Road Ready Profile**, **Setup Progress**, **Items Verified**, **Items Needing Review**, **Recommended Next Steps** — based on information available to All In One.

---

## Architecture

| Layer | Location |
|-------|----------|
| Config & types | `src/all-in-one/road-ready/roadReadyConfig.ts`, `roadReadyTypes.ts` |
| Rule engine | `roadReadyRules.ts` — builds items from profile + fleet |
| Scoring | `roadReadyScoring.ts` — setup vs verified progress (single source of truth) |
| Priority | `roadReadyPriority.ts` — attention center, next best action |
| Demo persistence | `src/all-in-one/demo/roadReadySeed.ts`, `roadReadyActions.ts` |
| Customer UI | `/all-in-one/portal/onboarding`, `/portal/road-ready`, `/portal/fleet` |
| Office UI | `/all-in-one/office/road-ready`, `/office/clients/:id/road-ready` |

Organization-scoped (not user-scoped). Shipper accounts exclude carrier Road Ready scoring.

---

## Lifecycle Modes

`onboarding` → `active` → `attention_required` / `review_required` → `monitoring`

There is no terminal “finished forever” state. Transportation compliance changes over time.

---

## Onboarding (10 steps)

1. Business Profile (EIN collected as yes/no/in progress/not sure — not full tax ID storage)
2. Operation Profile
3. Authority (USDOT, MC, BOC-3)
4. Fleet (power units, trailers, drivers — minimal)
5. Registration & Tags
6. Tax & Fuel (IFTA, road tax)
7. Insurance (high-level status only)
8. Permits
9. Documents (metadata/placeholder when secure storage unavailable)
10. Review → **Build My Road Ready Profile**

Autosave after meaningful steps. Resume via `onboardingStep`. Skip allowed (`I'll Do This Later`).

---

## Status Model

**Item status:** `not_started`, `action_needed`, `in_progress`, `needs_review`, `completed`, `optional`, `not_applicable`

**Verification status:** `unverified`, `self_reported`, `pending_review`, `verified`, `rejected`, `expired`

**Source:** `customer_reported`, `staff_verified`, `document_verified`, `service_request`, `system_recommendation`, `external_source_future`

Customer “Yes, I have IFTA” → `self_reported`, not equivalent to staff `verified`.

---

## Scoring

Two metrics (never collapse into one misleading percentage):

| Metric | Meaning |
|--------|---------|
| **Setup Progress** | Applicable setup completed from available information |
| **Verified Progress** | Weight confirmed by All In One |

Rules in `computeRoadReadyScores()`:

- `optional` / Operate & Grow (dispatch, factoring, brokerage) → **no negative impact**
- `not_applicable` → excluded
- `verified` complete → full verified weight
- `self_reported` complete → counts toward setup, shown separately
- `needs_review` / `action_needed` → attention, not fully verified

Do not store conflicting derived percentages; calculate from canonical items.

---

## Categories

1. Business  
2. Authority  
3. Registration  
4. Tax & Fuel  
5. Insurance  
6. Permits  
7. Fleet  
8. Ongoing Compliance  

**Operate & Grow** (dispatch, factoring, brokerage) — visually separate, excluded from compliance score.

---

## Fleet & Scope

Requirements support scope: `organization` | `vehicle` | `driver` (future).

VIN masked in summaries (`maskVin()`). Vehicle readiness: `ready`, `needs_attention`, `incomplete`, `unknown` — not legal authority to operate.

---

## Documents

Statuses: requested, uploaded, under review, verified, rejected, expired, expiring soon.

Verified document **may** support item verification — upload alone does **not** auto-verify critical items.

---

## Service Requests

**Get Help With This** pre-populates service request from Road Ready item. Item → `in_progress`, linked `serviceRequestId`. Staff completion → `completed` + `pending_review` or `verified` per workflow — not automatic legal verification on task close.

---

## Expiration

Centralized windows: 90, 60, 30, 7 days (`EXPIRATION_WINDOWS_DAYS`).

States: `active`, `expiring_soon`, `expired`, `unknown`

Expiration dates sync to shared **deadlines** table (`syncExpirationDeadlines`) — one source for Road Ready, dashboard, compliance calendar, office deadline center.

---

## Office Verification

Staff queue at `/office/road-ready` and per-client `/office/clients/:id/road-ready`.

Actions: Verify, Request More Information, Reject — all audited in `roadReadyVerifications` (who, what, when, previous/new status, note).

Role-gated in backend mode (Permitting Specialist, Compliance Specialist, Insurance Specialist, Administrator).

---

## Profile Change Recalculation

Meaningful operating changes (e.g. intrastate → interstate) trigger recalculation via `detectProfileChangeRequiresRecalc`. Verified history preserved; new items may show `needs_review` with customer-visible explanation.

---

## Demo Seed Clients

| Client | Profile |
|--------|---------|
| A (Summit Ridge) | 35% setup, onboarding incomplete, mostly unverified |
| B (Heartland) | 82% setup, 61% verified, insurance expiring soon |
| C (Pioneer Fleet) | Multi-truck, one vehicle needs attention |
| D (BlueLine) | Complete, monitoring mode |

Reset demo restores v4 seed including Road Ready.

---

## Notification Hooks (Sprint 06 — active in demo)

In-app notifications via `notificationEngine` + `notificationScheduler`. Events: document upload/verify/reject/expiring/expired, renewal window, deadline thresholds, service request updates. Dedupe keys prevent duplicate reminders. Portal runs `runExpirationEvaluation()` on layout mount; production should use server cron.

**Vault integration:** Road Ready items link to `documentId`; category cards and item rows link to Vault document detail and Renewal Center. Verified documents sync deadlines and renewal records. Upload ≠ verification (Sprint 05 rule preserved).

See: `DOCUMENT_VAULT_SYSTEM.md`, `RENEWAL_SYSTEM.md`, `NOTIFICATION_SYSTEM.md`.

---

## Safety Limitations (Sprint 05–06)

Not built: government API verification, FMCSA live check, automated compliance certificates, OCR auto-approval, AI legal decisions, payment/banking/factoring funding.

Printable **Road Ready Summary** placeholder only — never “Certificate of Compliance.”

---

## Routes

| Route | Audience |
|-------|----------|
| `/all-in-one/portal/onboarding` | Customer onboarding |
| `/all-in-one/portal/road-ready` | Customer persistent home |
| `/all-in-one/portal/fleet` | Fleet profile |
| `/all-in-one/portal/fleet/vehicles/:id` | Vehicle detail |
| `/all-in-one/office/road-ready` | Staff queue |
| `/all-in-one/portal/vault` | Document Vault |
| `/all-in-one/portal/vault/:id` | Document detail |
| `/all-in-one/portal/calendar` | Compliance Calendar |
| `/all-in-one/portal/renewals` | Renewal Center |
| `/all-in-one/portal/notifications` | Notification Center |
| `/all-in-one/office/documents` | Office Document Center |
| `/all-in-one/office/deadlines` | Office Deadline Center |
| `/all-in-one/office/clients/:id/road-ready` | Staff verification review |

Legacy `/debug/all-in-one/*` redirects to `/all-in-one/*`.
