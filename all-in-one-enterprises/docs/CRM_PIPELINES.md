# All In One — CRM Pipelines

**Seed:** `src/all-in-one/demo/crmSeed.ts`  
**Types:** `CrmPipeline`, `CrmPipelineStage` in `crmTypes.ts`

---

## Carrier Services Pipeline

| Stage ID | Name |
|----------|------|
| `cs-new` | New Inquiry |
| `cs-contacted` | Contacted |
| `cs-discovery` | Discovery |
| `cs-qualified` | Qualified |
| `cs-solution` | Solution / Services Selected |
| `cs-quote-prep` | Quote Preparation |
| `cs-quote-sent` | Quote Sent |
| `cs-decision` | Decision |
| `cs-won` | Won (terminal) |
| `cs-lost` | Lost (terminal) |

---

## Shipper / Brokerage Pipeline

| Stage ID | Name |
|----------|------|
| `sh-new` | New Shipper Lead |
| `sh-contacted` | Contacted |
| `sh-qualified` | Qualified |
| `sh-discovery` | Lane / Freight Discovery |
| `sh-pricing` | Pricing / Quote |
| `sh-decision` | Decision |
| `sh-active` | Active Shipper (won) |
| `sh-lost` | Lost |

---

## Rules

- One lead may have **multiple** opportunities (e.g. startup package + dispatch)
- Stage changes recorded as CRM activities
- Terminal won/lost stages set opportunity status
- Pipeline configuration changes preserve stage IDs for historical analytics

---

## UI

Pipeline board: `/office/crm/pipeline` — Kanban columns with list fallback via opportunity detail stage select.
