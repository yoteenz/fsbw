# Appointments System (Sprint 16)

## Domain

| Entity | Purpose |
|--------|---------|
| `AppointmentType` | Consultation types + duration + team |
| `AppointmentAvailabilityRule` | Day/time windows, timezone |
| `Appointment` | Scheduled interaction + status history |
| `AppointmentSlotHold` | 10-minute booking hold (session key) |
| `AppointmentReminder` | Foundation for Sprint 14 reminder consumption |

## Status flow

`requested` → `pending_confirmation` → `confirmed` → `completed`  
Also: `reschedule_requested`, `cancelled`, `no_show`

## Booking

- Public: `/schedule` — mobile-first, creates lead + conversation + appointment (prospect)
- Customer: `/portal/appointments`
- Staff: `/office/appointments`, `/office/appointments/:id`
- Settings: `/office/settings/appointments`

## Double-booking protection

`tryBookSlot()` rejects overlapping `scheduledStart` for active appointments; holds exclude other sessions until expiry.

## Timezone

Stored on appointment; displayed with explicit timezone label. Business hours from `commSettings` + availability rules.

## CRM calendar

`/office/crm/calendar` includes upcoming consultations from canonical `appointments` — not a duplicate calendar table.

## Integrations

- Prospect booking → CRM lead + conversation
- Completion → CRM activity on lead
- No external Google/Outlook sync in Sprint 16
