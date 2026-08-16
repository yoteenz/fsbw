# All In One — CRM Lead Capture

---

## Entry points

| Source | Handler | Lead source slug |
|--------|---------|------------------|
| Contact form | `createLeadFromForm` | `website` |
| Request callback | `createLeadFromForm` | `callback` |
| Smart Intake | `createLeadFromIntake` | `smart_intake` |
| Service page CTA | Intake + `?service=` param | `service_page` / inherited interest |

All feed **one** canonical lead table — no per-form duplicate tables.

---

## Smart Intake → CRM

On intake completion (`GetStartedPage`):

1. Roadmap generated (unchanged)
2. Lead created with status `qualifying`
3. Service interests mapped from roadmap + optional service param
4. **No** customer, service request, or workflow until conversion

---

## Deduplication

`findDuplicateMatches` checks email, phone, business name against leads and existing customers. Shows **Possible existing record** — staff may merge (permission: `crm.leads.merge`) or link to organization.

Does not auto-merge ambiguous matches.

---

## Attribution

`originalSourceId` preserved; `latestSourceId` updated on re-inquiry. Optional UTM fields on lead record.

---

## Security foundation

- Server-side validation on public forms (demo: client-side + store write)
- Rate limiting architecture reserved for production
- No sequential IDs on public quote links — opaque `secureToken`

---

## Demo leads A–J

See sprint spec — seeded in `crmSeed.ts` with current-date-relative activity.
