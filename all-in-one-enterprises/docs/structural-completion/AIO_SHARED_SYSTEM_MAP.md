# AIO Shared System Map

| System | Primary modules | Families served |
|--------|-----------------|-----------------|
| Identity / org / membership | `auth/`, migrations identity | All |
| Role engine | `RouteGuards`, RLS functions | All |
| Workflow | `workflow/`, office workflows | F06, F07, office |
| Activity / audit | `activity`, brokerage audit, office audit | All |
| Messaging | `communications/`, portal messages | F17 |
| Notifications | `notifications/` | F17 |
| Appointments | `appointments/` | F17 |
| Documents / vault | `vault/`, digital records migration | F16 |
| Deadlines / renewals | `renewals/`, deadlines | F04, F12 |
| Billing / quotes / payments | `billing/`, quotes pages | F10 |
| Search | portal search | F05 |
| Calendar | portal calendar | F05, F17 |
| Integrations | `integrations/` | Office, load board |
| Demo store | `demo/` | Demo-first runtime |
| Supabase client | `data/supabase/` | Backend mode |
| Error / loading / empty | scattered components | Per-node gaps |
| QA / launch | `qa/`, `launch/` | Internal |

Background systems: autopilot persistence, bookkeeping handoff idempotency, freight exceptions (F07/F09/F11).
