# All In One — CRM System (Sprint 15)

**Status:** Shipped in debug environment (`/debug/all-in-one`)  
**Module:** `src/all-in-one/crm/`, `src/all-in-one/demo/crmSeed.ts`, `src/all-in-one/demo/crmActions.ts`

---

## Core distinctions (invariants)

| Concept | Meaning |
|---------|---------|
| **Lead** | Potential relationship before conversion — not a customer |
| **Opportunity** | Qualified potential sale/service transaction |
| **Customer** | Canonical organization/client with established relationship |
| **Service Request** | Actual requested operational work |
| **Workflow** | Sprint 14 execution instance — CRM does not own workflow state |
| **Quote** | Sprint 07 canonical quote — CRM references, does not duplicate |

Lead status (relationship) is separate from opportunity pipeline stage (transaction).

---

## Domain entities

Stored on demo store v15: `crmLeads`, `crmOpportunities`, `crmLeadSources`, `crmPipelines`, `crmPipelineStages`, `crmServiceInterests`, `crmActivities`, `crmFollowUps`, `crmReferrals`, `crmConversionRecords`, `crmLostReasons`, `crmSettings`.

Types: `src/all-in-one/crm/crmTypes.ts`

---

## Lead lifecycle

Statuses: `new`, `contact_attempted`, `contacted`, `qualifying`, `qualified`, `unqualified`, `nurturing`, `converted`, `lost`, `do_not_contact`.

Qualification state: `not_started`, `in_progress`, `complete`, `needs_more_information`, `not_a_fit`.

---

## Pipelines

- **Carrier Services** — inquiry → contacted → discovery → qualified → solution → quote prep → quote sent → decision → won/lost
- **Shipper / Brokerage** — separate stage set for shipper acquisition

Configurable via CRM settings (demo seed). Stage IDs are stable for history.

---

## Office surfaces

| Route | Purpose |
|-------|---------|
| `/office/crm` | CRM home — metrics, follow-ups |
| `/office/crm/leads` | Lead list + filters |
| `/office/crm/leads/:leadId` | Prospect 360 |
| `/office/crm/pipeline` | Kanban pipeline board |
| `/office/crm/opportunities/:id` | Opportunity detail, quote prep |
| `/office/crm/calendar` | Sales calendar (not compliance) |
| `/office/crm/reports` | Foundational metrics |
| `/office/settings/crm` | CRM configuration (demo) |

---

## Public capture

- Contact form → `createLeadFromForm`
- Request callback → lightweight lead
- Smart Intake completion → `createLeadFromIntake`
- Service page CTA → `get-started?service=` inherits service interest

---

## Quotes

CRM uses canonical `Quote` with `leadId`, `opportunityId`, `secureToken`. Prospect view: `/quote/:secureToken`.

---

## Permissions

`crm.read`, `crm.leads.*`, `crm.opportunities.*`, `crm.convert`, `crm.quotes.prepare`, etc. — see `officeContext.ts` role bundles.

---

## Audit vs activity

- **Activity timeline** — human-readable CRM history on lead/opportunity
- **Audit** — security events (future wiring); conversion records preserve integrity

See also: `CRM_CONVERSION_ENGINE.md`, `CRM_PIPELINES.md`, `CRM_LEAD_CAPTURE.md`, `CRM_SECURITY.md`.
