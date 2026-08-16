# Service Provider Model — All In One Enterprises

## Fulfillment types

| Type | Meaning |
|------|---------|
| `AIO_DIRECT` | All In One staff/workflow performs the service |
| `AIO_MANAGED` | Customer works through AIO; external providers may participate |
| `PARTNER_PROVIDED` | Third party performs underlying service; AIO may refer, facilitate, coordinate |
| `HYBRID` | Legitimate mix of direct AIO work and partner fulfillment |
| `null` | Not configured — do not assume direct vs partner |

## Payment handling

| Model | Use |
|-------|-----|
| `AIO_COLLECTS` | AIO collects service fees (e.g. bookkeeping) |
| `PARTNER_COLLECTS` | Partner collects for their service |
| `REFERRAL_ONLY` | Referral/facilitation only (factoring, insurance) |
| `QUOTE_REQUIRED` | Quote before payment |

## Public disclosure

- Do not expose raw enum names to customers
- Use configurable `publicDisclosure` on catalog entries
- Partner directory: `serviceProviderRegistry.ts` (placeholder names until configured)

## Partner handoff lifecycle

1. Customer request
2. AIO intake
3. Customer consent / disclosure
4. Partner assignment
5. Handoff
6. Partner processing
7. Status update
8. Result received
9. Customer notified
10. Service complete

## Partner statuses (internal)

`PENDING_HANDOFF`, `HANDED_OFF`, `PARTNER_ACCEPTED`, `PARTNER_NEEDS_INFO`, `IN_PROGRESS`, `RESULT_RECEIVED`, `COMPLETED`, `DECLINED`, `ESCALATED`

## Code paths

- Catalog: `src/services/catalog/serviceCatalog.ts`
- Partners: `src/services/catalog/serviceProviderRegistry.ts`
- Office queue: `src/office/pages/OfficeWorkPages.tsx` → `OfficeServicesPage`
