# Communication Security (Sprint 16)

## Authorization

- **Customer:** `authorizeConversationAccess(store, id, { organizationId })` — org-scoped only
- **Staff:** Full thread including internal notes (permission-gated composer)
- **Brokerage:** Separate shipper/carrier threads; `authorizeBrokerageConversation` boundary

## Internal notes

- `visibility: internal_only`, distinct UI (amber panel)
- Never returned from customer portal message endpoints
- Audit: internal note creation is a meaningful event (foundation)

## Attachments

`CommAttachment` references vault document id when satisfied — no duplicate vault copies in message body.

## Public scheduling

Session-key holds; appointment detail requires org match or lead context — no cross-customer enumeration in demo routes.

## Sensitive data

Staff composer warns against SSN/cards in plain messages — use vault upload flows.

## Permissions (`comm.*`)

`comm.read`, `comm.manage`, `comm.assign`, `comm.templates.*`, `comm.settings.manage`, `appointments.*` in `officeContext.ts`

## Tests

`src/all-in-one/communications/communications.test.ts` — visibility, cross-org denial, consent, double-book, internal note isolation.
