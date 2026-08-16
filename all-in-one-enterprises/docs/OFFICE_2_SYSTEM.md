# All In One Office 2.0 — System Architecture

**Sprint:** 13 · **Status:** Shipped (demo) · **Route base:** `/debug/all-in-one/office`

## Purpose

Office 2.0 is the **internal operating headquarters** for All In One Enterprises Inc. It answers:

> **What does All In One need from us today?**

It sits **above** canonical domain systems (Road Ready, Dispatch, Factoring, Brokerage, Insurance, Billing) and coordinates staff work without replacing those records.

## Module layout

| Path | Role |
|------|------|
| `src/all-in-one/office-core/officeWorkTypes.ts` | Work item, handoff, approval, escalation types |
| `src/all-in-one/office-core/officeWorkEngine.ts` | Work enrichment, overdue/stale, queue helpers |
| `src/all-in-one/office-core/officeAttentionEngine.ts` | Internal attention aggregation + dedupe |
| `src/all-in-one/office-core/officeNextActionEngine.ts` | Staff next-action precedence |
| `src/all-in-one/office-core/officeCommandCenterService.ts` | Command center view model |
| `src/all-in-one/office-core/client360Service.ts` | Client 360 aggregation |
| `src/all-in-one/office-core/officeContext.ts` | Staff identity + permission matrix |
| `src/all-in-one/demo/officeSeed.ts` | Demo store v13 scenarios A–H |
| `src/all-in-one/demo/officeActions.ts` | Assign, approve, escalate, handoff actions |

## Information architecture

- **Home** — Office Command Center (`/office`)
- **Work** — My Work, Queues, Approvals, Escalations
- **Clients** — Customers, Road Ready
- **Services** — Cross-service ops + division desks (Insurance, Dispatch, Factoring, Brokerage preserved)
- **Operations** — Loads, Renewals, Document Review, Calendar
- **Finance** — Billing desk + canonical financial routes (domains never combined)
- **Communication** — Inbox (canonical messaging)
- **Management** — Team, Workload, Reports, Activity, Audit

## Command Center

Staff home surfaces:

- Personalized greeting + assigned/due-today/waiting-on-us counts
- **Your Next Action** — highest-priority assigned work
- Attention items (deduplicated)
- Due today / overdue slices
- Role-aware desk modules (Permitting, Dispatcher, Insurance Coordinator, etc.)
- Manager operational summary (unassigned, bottlenecks, escalations, approvals)

## Work items

`OfficeWorkItem` references canonical entities — it does **not** duplicate them.

See `OFFICE_WORK_MODEL.md` for fields, states, and queue membership.

## Security

- Role bundles in `officeContext.ts` gate financial and audit views
- Internal notes remain `visibility: internal` only
- Customer portal payloads must never include internal notes or staff comments
- Search and Client 360 respect permission matrix

## Demo mode

- Demo store **v13** seeds work items, handoffs, approvals, escalations, teams
- Staff switcher in Office preview bar + debug banner
- Reset restores full Office demo state via `resetDemoStore()`

## Mobile

Desktop-first layout with responsive work lists and simplified tables on narrow viewports. Critical actions: My Work, customer open, inbox, assign, acknowledge escalation.

## Future (Sprint 14+)

Workflow automation will consume handoffs, work items, and queue definitions — not replace them.
