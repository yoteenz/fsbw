// Local, offline application-level checks (no network, no Stripe API, no database).
// They run the repository's own pure functions to show what the database migrations do NOT fix.
import { resolveCheckoutQuoteLines } from '/home/user/fsbw/api/_lib/pricing/resolveQuote.ts';
import { slayTicketsPurchasedForLineItems } from '/home/user/fsbw/api/_lib/slayTickets.ts';
import Stripe from '/home/user/fsbw/node_modules/stripe/esm/stripe.esm.node.js';

const out: Record<string, unknown> = {};
// R-03: a customised Build-A-Wig line as the client sends it (options are not part of the quote payload).
const baw = resolveCheckoutQuoteLines([{ id: 'build-a-wig-1730000000-x', name: 'NOIR', quantity: 1 } as any]);
const stock = resolveCheckoutQuoteLines([{ id: 'noir-1', name: 'NOIR', quantity: 1 } as any]);
out['R-03'] = { bawLine: { fullyResolved: (baw as any).fullyResolved, totalUsd: (baw as any).totalUsd ?? (baw as any).subtotalUsd, lines: (baw as any).lines }, stockLine: { totalUsd: (stock as any).totalUsd ?? (stock as any).subtotalUsd } };
// R-05: purchased ticket count is derived from client-supplied line items only.
out['R-05'] = { purchasedFromClientLines: slayTicketsPurchasedForLineItems([{ name: 'SLAY TICKET PACK', slayTicketPackCount: 60, quantity: 10 } as any]) };
// Webhook signature verification behaviour with a SYNTHETIC secret (not a real Stripe secret).
const stripe = new Stripe('sk_test_' + 'x'.repeat(24), { apiVersion: '2024-06-20' as any });
const secret = 'whsec_' + 'synthetic'.repeat(4);
const payload = JSON.stringify({ id: 'evt_local_1', type: 'payment_intent.succeeded', data: { object: { id: 'pi_local_1', metadata: { hairstyle_analysis_grants: '[4]' } } } });
const goodHeader = stripe.webhooks.generateTestHeaderString({ payload, secret });
let valid = false, tampered = 'accepted', wrongSecret = 'accepted';
try { valid = stripe.webhooks.constructEvent(payload, goodHeader, secret).id === 'evt_local_1'; } catch { valid = false; }
try { stripe.webhooks.constructEvent(payload.replace('[4]', '[44]'), goodHeader, secret); } catch { tampered = 'rejected'; }
try { stripe.webhooks.constructEvent(payload, goodHeader, 'whsec_other' + 'x'.repeat(20)); } catch { wrongSecret = 'rejected'; }
out['WEBHOOK_SIGNATURE'] = { validSignatureAccepted: valid, tamperedPayload: tampered, wrongSecret };
console.log(JSON.stringify(out, null, 1));
