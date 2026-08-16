# Client 360 — Staff Customer View

**Route:** `/debug/all-in-one/office/clients/:organizationId`

## Purpose

One operational picture of a customer/business for staff — aggregated from canonical domains, not a parallel client record.

## Header

Business name, primary contact, customer since, Road Ready progress, operational status label, assigned staff, pinned operational notes.

## Operational status labels

`ACTIVE` · `ONBOARDING` · `ACTION NEEDED` · `WAITING ON CUSTOMER` · `PAUSED` · `INACTIVE`

(Distinct from compliance/legal certification.)

## Overview sections

- Customer status summary
- **Next staff action** (Office next-action engine scoped to org)
- All In One waiting on / customer waiting on work lists
- Service relationship summary (Permitting, Dispatch, Factoring, Insurance, Brokerage)
- Upcoming deadlines, open document requests, billing status
- Recent communication preview

## Tabs

Role-aware: Overview, Services, Road Ready, Fleet, Documents, Insurance, Operations, Factoring, Brokerage, Billing, Messages, Activity, Internal Notes.

Financial tabs require `billing.read`, `factoring_finance.read`, or `brokerage_finance.read` as appropriate.

## Timeline

Staff-facing activity from `activity` log (`visibility: internal`). Customer portal timeline does not automatically receive internal events.

## Internal notes

- Types: general, follow_up, risk_review, billing, operations, customer_preference, handoff
- Pinned notes surface in header
- **Never** exposed in customer, shipper, carrier, or partner portals

## Composers

UI distinguishes **Internal Note** vs **Customer Message** composers to prevent accidental external sends.

## Duplicate detection

`checkDuplicateCustomer()` warns on legal name, email, phone matches — does not auto-merge.
