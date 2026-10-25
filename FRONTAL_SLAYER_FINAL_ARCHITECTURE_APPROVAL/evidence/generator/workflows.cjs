// Customer ↔ admin workflow mirror (target architecture). One row per workflow, 12 required columns
// plus traceability: current state, prior broken-workflow ids (BW-xx), risks (R-xx), decisions, sprint.
// "Proposed" endpoints are design names; "(exists)" marks a file that exists today under api/.
const W = [];
const w = (o) => W.push(o);

// ---------------- ORDERS / PAYMENT ----------------
w({ id:'W-01', name:'Standard product purchase', area:'Orders/payment', current:'BROKEN (stub order of record; rich order local-only)', bw:['BW-01','BW-22'], risks:['R-11','R-12'], decisions:['A9','C4'], sprint:'S1',
  entry:'PDP → bag → /checkout', userAction:'Pay by card', api:'POST /api/checkout/quote (exists) → POST /api/stripe/create-product-payment-intent (exists, server-priced) → POST /api/stripe/webhook (exists)',
  record:'customer_orders + customer_order_items written by the webhook on payment_intent.succeeded; order number from a DB sequence', external:'Stripe PaymentIntent (amount from server quote only)',
  adminVisibility:'ORDERS list + order detail within seconds of the webhook', adminAction:'Advance status; add tracking; refund (W-04/W-05)', customerUpdate:'ORDERS list + order detail (status PAID / PROCESSING)',
  notification:'Order confirmation email (Resend) + in-app alert', audit:'order_status_events row (actor=webhook); stripe_webhook_events row', failureRecovery:'Webhook retry is idempotent on event id; nightly reconciliation of Stripe PIs vs orders raises SYSTEM ALERT for orphans',
  test:'E2E: test-mode card → order row with items and sequence number; replayed webhook creates no duplicate; second browser shows the same order' });
w({ id:'W-02', name:'Build-A-Wig custom purchase', area:'Orders/payment', current:'BROKEN (Stripe charges base + cap only)', bw:['BW-04'], risks:['R-03'], decisions:['A2','E5'], sprint:'S0B-2 (interim) → S1B',
  entry:'/build-a-wig Atelier → bag', userAction:'Configure a unit and pay', api:'Interim (A2 option 1): POST /api/consult-quote (exists) request → admin consult offer → POST /api/checkout/redeem-consult-code (exists). Target: POST /api/checkout/quote prices every BAW option from a server catalogue',
  record:'saved_configurations (build spec) + customer_orders with the server-priced line and frozen spec snapshot', external:'Stripe PaymentIntent for the server-held quote',
  adminVisibility:'Interim: MEETINGS › consult quotes queue. Target: ORDERS with full build spec', adminAction:'Interim: price and send the quote. Target: none for pricing; production status', customerUpdate:'Order detail shows the build spec and price paid',
  notification:'Quote-ready email + alert (interim); order confirmation', audit:'consult_quotes status history; order_status_events', failureRecovery:'Quote expiry returns the configuration to the bag; price mismatch between client and server blocks payment with a clear message',
  test:'E2E: build with colour/length/lace add-ons → charged amount equals the server quote; tampered client total rejected (unit test on resolveQuote)' });
w({ id:'W-03', name:'Customer order cancellation', area:'Orders/payment', current:'MISSING (no customer cancel; admin cancel is local-only)', bw:['BW-03'], risks:['R-07'], decisions:['C2','C4'], sprint:'S1',
  entry:'Order detail › "Need help?" › Request cancellation', userAction:'Request cancellation before production', api:'POST /api/orders/:id/cancel-request (proposed) → support_requests thread',
  record:'support_requests (type=cancellation) linked to order; order status unchanged until admin decides', external:'none until refund',
  adminVisibility:'INBOX + order detail banner "cancellation requested"', adminAction:'Approve → status CANCELLED + refund (W-04) or decline with reason', customerUpdate:'Order detail status + request thread',
  notification:'Email + alert on decision', audit:'order_status_events (actor=admin id, reason)', failureRecovery:'If refund fails, status stays CANCEL_PENDING and SYSTEM ALERT fires',
  test:'E2E: request → admin approve → Stripe test refund exists → customer sees CANCELLED + refund line' });
w({ id:'W-04', name:'Refund (full or partial)', area:'Orders/payment', current:'BROKEN (admin "refund" rewrites admin localStorage only)', bw:['BW-03'], risks:['R-07','R-16'], decisions:['C2','A8'], sprint:'S1',
  entry:'Admin › ORDERS › order detail › REFUND', userAction:'(customer) none; sees result', api:'POST /api/admin/orders/:id/refund (proposed; requireAdmin + role FOUNDER/ADMIN per C2) → Stripe refunds.create with idempotency key → webhook charge.refunded',
  record:'order_refunds row (amount, reason, stripe_refund_id) + order status REFUNDED/PARTIALLY_REFUNDED; ledger reversals for points/cash/vouchers earned or used', external:'Stripe Refund',
  adminVisibility:'Order detail payments panel; REVENUE reconciles', adminAction:'Refund with mandatory reason; above threshold requires FOUNDER (C2)', customerUpdate:'Order detail payment section shows refund and status',
  notification:'Refund email + alert', audit:'admin_audit_log + order_status_events', failureRecovery:'Stripe error leaves order unchanged and surfaces the error; webhook is the confirmation of record; double-click protected by idempotency key',
  test:'E2E: partial refund → Stripe test refund amount matches → loyalty_ledger reversal rows exist → balances recomputed' });
w({ id:'W-05', name:'Fulfilment and production status', area:'Orders/payment', current:'BROKEN (status changes live in admin localStorage)', bw:['BW-02','BW-21'], risks:['R-11'], decisions:['C4'], sprint:'S1/S3',
  entry:'Admin › ORDERS › order detail', userAction:'(customer) watches the timeline', api:'POST /api/admin/orders/:id/status (proposed; replaces local handlers)',
  record:'customer_orders.status + order_status_events (canonical vocabulary per C4)', external:'none',
  adminVisibility:'ORDERS filters by status; Command Center queue tiles', adminAction:'Advance stage; attach order-form approval to the server order id', customerUpdate:'Order detail StatusTimeline',
  notification:'Stage emails per C4 (opt-out respected via customer_preferences)', audit:'order_status_events', failureRecovery:'Illegal transitions rejected server-side; stale admin tab gets 409 and refreshes',
  test:'E2E: admin advances to IN PRODUCTION → customer timeline updates in another session; illegal jump rejected' });
w({ id:'W-06', name:'Shipping and tracking', area:'Orders/payment', current:'BROKEN (tracking saved to admin localStorage; email sent but account never updates)', bw:['BW-02'], risks:['R-11'], decisions:['C4'], sprint:'S1',
  entry:'Admin › ORDERS › order detail › ADD TRACKING', userAction:'Track parcel from order detail', api:'POST /api/admin/orders/:id/shipment (proposed)',
  record:'order shipment fields (carrier, tracking, shipped_at) + status SHIPPED; delivered_at when DELIVERED', external:'Carrier link (no carrier API in scope)',
  adminVisibility:'ORDERS (shipped, awaiting delivery)', adminAction:'Add/edit tracking; mark delivered', customerUpdate:'Order detail tracking card; LEAVE A REVIEW unlocks on DELIVERED',
  notification:'Shipped email (existing template) + alert', audit:'order_status_events', failureRecovery:'Edits keep history; wrong tracking corrected with an event, never overwritten silently',
  test:'E2E: add tracking → customer order detail shows link; DELIVERED enables review button (closes BW-19)' });
w({ id:'W-07', name:'Saved addresses and payment methods', area:'Orders/payment', current:'BROKEN (addresses wiped by profile sync; payment page captures raw card data client-side)', bw:['BW-18'], risks:['R-14'], decisions:['A4'], sprint:'S2',
  entry:'/account/shipping, /account/payment', userAction:'Add/edit/delete address; manage cards', api:'GET/PUT /api/profile addresses (exists, extend) ; Stripe SetupIntent + customer portal or Payment Element for cards',
  record:'customer_addresses (proposed) ; cards only in Stripe (customer id on profile)', external:'Stripe Customer / SetupIntent',
  adminVisibility:'Customer detail (masked)', adminAction:'View only', customerUpdate:'Lists persist across devices',
  notification:'Security email on payment method change', audit:'profile change log', failureRecovery:'SetupIntent failure shows Stripe message; no raw PAN ever touches app code',
  test:'E2E: address saved on device A visible on device B after sign-in sync; payment page contains no raw card inputs (static check)' });

// ---------------- MEMBERSHIP ----------------
w({ id:'W-08', name:'Membership subscription purchase', area:'Membership', current:'PARTIAL (Stripe path works; non-Stripe CONFIRM ORDER grants premium free)', bw:['BW-05'], risks:['R-06'], decisions:['A3','D3'], sprint:'S0B-2 / S1',
  entry:'/checkout/upgrade', userAction:'Choose 3/6/12 months and pay', api:'POST /api/stripe/create-checkout-session (exists) → webhook customer.subscription.created / invoice.paid',
  record:'profiles.membership_* written by webhook + membership_events row (unique Stripe event id); welcome credit as wallet_ledger entry per D3', external:'Stripe Subscription',
  adminVisibility:'REWARDS › MEMBERS; CLIENTS › customer detail', adminAction:'View; comp a membership only via FOUNDER (C2)', customerUpdate:'REWARDS › MEMBERSHIP shows plan, renewal date, invoices',
  notification:'Welcome email + alert', audit:'membership_events', failureRecovery:'Webhook idempotent; client never sets tier; CONFIRM ORDER disabled in production (A3)',
  test:'E2E: test-mode subscription → server gates return the tier; CONFIRM ORDER absent in production build' });
w({ id:'W-09', name:'Membership upgrade', area:'Membership', current:'PARTIAL (code: immediate with refund; unverified end-to-end)', bw:[], risks:['R-06'], decisions:['D2'], sprint:'S2',
  entry:'REWARDS › MEMBERSHIP › Upgrade', userAction:'Move to a longer term', api:'POST /api/stripe/create-checkout-session (upgrade mode, exists) → webhook',
  record:'membership_events (from/to tier) + profile tier; proration/refund recorded', external:'Stripe Subscription update + refund',
  adminVisibility:'REWARDS › MEMBERS history', adminAction:'View', customerUpdate:'New tier and benefits immediately',
  notification:'Upgrade confirmation email', audit:'membership_events', failureRecovery:'Failed payment keeps the old tier; no client-side tier write',
  test:'E2E: 3→12 upgrade in test mode → tier 12, refund line exists' });
w({ id:'W-10', name:'Membership renewal (and failed renewal)', area:'Membership', current:'UNVERIFIED (webhook handles invoice events; no dunning UI)', bw:[], risks:['R-06'], decisions:['D11'], sprint:'S2',
  entry:'Automatic (Stripe)', userAction:'Update card if renewal fails', api:'webhook invoice.paid / invoice.payment_failed',
  record:'membership_events; profile period_end; anniversary points by scheduled job per D11', external:'Stripe invoices',
  adminVisibility:'REWARDS › MEMBERS (renewals, failures)', adminAction:'Contact customer', customerUpdate:'MEMBERSHIP shows next renewal or payment problem banner',
  notification:'Renewal receipt; payment failed email', audit:'membership_events', failureRecovery:'Grace period per Stripe settings; tier drops only on subscription deleted',
  test:'Stripe test clock: advance → renewal event recorded once; failed card → banner + email' });
w({ id:'W-11', name:'Membership cancellation', area:'Membership', current:'BROKEN (local flag; Stripe keeps billing)', bw:['BW-06'], risks:['R-15'], decisions:['A4'], sprint:'S0B-2',
  entry:'REWARDS › MEMBERSHIP › Cancel', userAction:'Cancel at period end', api:'POST /api/membership/cancel (proposed; server sets cancel_at_period_end) or Stripe customer portal (A4)',
  record:'Stripe subscription cancel_at_period_end + membership_events', external:'Stripe Subscription update',
  adminVisibility:'REWARDS › MEMBERS (cancelling)', adminAction:'View; reverse on request', customerUpdate:'"Ends on <date>" with resume option',
  notification:'Cancellation confirmation email', audit:'membership_events', failureRecovery:'If Stripe call fails, UI says so and nothing changes locally',
  test:'E2E: cancel → Stripe test subscription has cancel_at_period_end=true; no further invoice after test-clock advance' });

// ---------------- HAIR ANALYSIS / CONSULT ----------------
w({ id:'W-12', name:'Hairstyle analysis credit purchase', area:'Hair analysis', current:'BROKEN for 4-pack (live SQL accepts 1/3/6 only; $60 grants nothing)', bw:['BW-08'], risks:['R-10'], decisions:['E1','A8'], sprint:'S0B-1',
  entry:'MY HAIR › ANALYSES › Buy credits', userAction:'Buy 1 ($20) or 4 ($60) credits', api:'POST /api/stripe/create-product-payment-intent (exists) → webhook → grant RPC (service role only)',
  record:'hairstyle_analysis_credit purchases (paid credits FIFO) keyed by Stripe event id', external:'Stripe PaymentIntent',
  adminVisibility:'REWARDS › ANALYSIS CREDITS', adminAction:'Grant/adjust with reason (C2)', customerUpdate:'Credits remaining on MY HAIR',
  notification:'Receipt email', audit:'credit grant rows + admin_audit_log', failureRecovery:'Affected past 4-pack buyers remediated per A8; webhook idempotent',
  test:'E2E: buy 4 → 4 credits; SQL accepts pack size 4; anon cannot call grant RPC' });
w({ id:'W-13', name:'Hairstyle analysis redemption', area:'Hair analysis', current:'PARTIAL (works for subscribers; results not saved; usage RPC callable by anon)', bw:[], risks:['R-01','R-02'], decisions:['E1','E3','B2'], sprint:'S0B-1 / S5',
  entry:'MY HAIR › New analysis (moved from /tools/hairstyle-analysis)', userAction:'Upload selfie, run analysis', api:'POST /api/hairstyle-analysis-generate (exists) → server consumes free then paid credit',
  record:'hairstyle_analysis_results (proposed) + usage row; selfie in private bucket per E3', external:'AI provider',
  adminVisibility:'CLIENTS › customer detail › hair', adminAction:'View (consented); delete on request', customerUpdate:'MY HAIR › ANALYSES list + detail page',
  notification:'Result ready alert', audit:'usage rows', failureRecovery:'Generation failure refunds the credit automatically (compensating row)',
  test:'E2E: run → credit decremented once, result persisted, failure path restores credit' });
w({ id:'W-14', name:'Consultation booking', area:'Consultations', current:'PARTIAL (meetings table + booking APIs exist; legacy client write policy on meetings)', bw:[], risks:['R-04'], decisions:['A1'], sprint:'S0B-1 / S2',
  entry:'Concierge › Book / order detail', userAction:'Pick a slot and pay deposit if required', api:'POST /api/booking/consult-meeting (exists) ; /api/booking/appointment-meeting (exists)',
  record:'meetings row (server-written only)', external:'Stripe deposit; calendar link',
  adminVisibility:'MEETINGS (calendar, schedule)', adminAction:'Confirm/reschedule', customerUpdate:'ORDERS › APPOINTMENTS tab',
  notification:'Booking confirmation + reminder', audit:'meeting status history', failureRecovery:'Slot conflict rejected server-side; payment failure releases slot',
  test:'E2E: book → meeting row; direct client insert into meetings denied by RLS' });
w({ id:'W-15', name:'Consultation cancellation / reschedule', area:'Consultations', current:'MISSING (no customer flow)', bw:[], risks:[], decisions:['C4'], sprint:'S2',
  entry:'ORDERS › APPOINTMENTS › Request change', userAction:'Request cancel or new time', api:'POST /api/booking/:id/change-request (proposed) → support_requests',
  record:'support_requests + meetings status on admin decision', external:'Stripe refund of deposit if policy allows',
  adminVisibility:'INBOX + MEETINGS', adminAction:'Approve/decline/reschedule', customerUpdate:'Appointments tab',
  notification:'Email + alert', audit:'meeting status history', failureRecovery:'Request stays open until handled; SLA tile on Command Center',
  test:'E2E: request → admin reschedule → customer sees new time' });
w({ id:'W-16', name:'Consultation add-ons (style analysis, autopay final payment)', area:'Consultations', current:'BROKEN (add-on never fulfilled; autopay trusts client Stripe ids)', bw:['BW-09'], risks:['R-09','R-13'], decisions:['A7','E6'], sprint:'S0B-2 / S5',
  entry:'Consult checkout', userAction:'Buy style-analysis add-on; authorise final payment', api:'POST /api/consult-style-analysis-generate (exists) ; POST /api/booking/autopay-final-payment (exists; must resolve PM server-side)',
  record:'consult add-on deliverable row linked to meeting; autopay attempts table (exists)', external:'Stripe off-session PaymentIntent',
  adminVisibility:'MEETINGS › meeting detail (deliverables, autopay attempts)', adminAction:'Deliver add-on; retry/void autopay', customerUpdate:'Appointment detail shows deliverable and payment status',
  notification:'Deliverable ready; payment receipt', audit:'booking_autopay_attempts', failureRecovery:'Autopay disabled until server-side PM resolution (A7); undelivered add-ons remediated (A8)',
  test:'E2E: add-on purchase creates a deliverable task visible to admin; autopay rejects a client-supplied foreign payment method' });

// ---------------- REWARDS ----------------
w({ id:'W-17', name:'Points earning', area:'Rewards', current:'BROKEN (no ledger; no server writer)', bw:['BW-13'], risks:['R-16'], decisions:['D4','D5'], sprint:'S4',
  entry:'Automatic on paid order / approved content / anniversary', userAction:'None', api:'Webhook + approvals transaction + scheduled job write loyalty_ledger',
  record:'loyalty_ledger (unique reason/source)', external:'none',
  adminVisibility:'REWARDS › POINTS LEDGER', adminAction:'Adjust with reason (C2)', customerUpdate:'REWARDS › POINTS activity',
  notification:'Points earned alert (batched)', audit:'ledger row itself + admin_audit_log for adjustments', failureRecovery:'Nightly reconciliation; refunds write reversals',
  test:'Integration: paid order → one ledger row with multiplier per tier; replayed webhook → no second row' });
w({ id:'W-18', name:'Points redemption', area:'Rewards', current:'BROKEN (REDEEM is a stub modal)', bw:['BW-13'], risks:['R-16'], decisions:['D4'], sprint:'S4',
  entry:'REWARDS › POINTS › Redeem or checkout', userAction:'Redeem points for reward/discount', api:'POST /api/rewards/redeem (proposed) reserves inside order transaction',
  record:'loyalty_ledger negative entry (reserved → committed)', external:'none',
  adminVisibility:'POINTS LEDGER', adminAction:'Reverse with reason', customerUpdate:'Balance updates',
  notification:'Redemption confirmation', audit:'ledger', failureRecovery:'Failed payment releases reservation',
  test:'Integration: redeem beyond balance rejected; concurrent redeem cannot overspend (row lock)' });
w({ id:'W-19', name:'Voucher issue and redemption', area:'Rewards', current:'BROKEN (list wiped to [] for non-founders)', bw:['BW-14'], risks:['R-16'], decisions:['D3','D9'], sprint:'S4',
  entry:'REWARDS › WALLET; checkout voucher picker', userAction:'Apply a voucher', api:'GET /api/rewards/wallet (proposed); checkout quote validates voucher server-side',
  record:'customer_vouchers (available → reserved → used/expired)', external:'none',
  adminVisibility:'REWARDS › WALLET & VOUCHERS', adminAction:'Issue/void with reason', customerUpdate:'Wallet shows status and expiry (6 months per canon)',
  notification:'Voucher issued / expiring email (cron exists)', audit:'voucher status history', failureRecovery:'Order refund restores voucher if unexpired',
  test:'E2E: issued voucher appears on second device; applying it reduces server quote; refund restores it' });
w({ id:'W-20', name:'Digital cash and gift card load/redeem', area:'Rewards', current:'BROKEN (codes in admin localStorage → INVALID CODE)', bw:['BW-12'], risks:['R-16'], decisions:['C2'], sprint:'S4',
  entry:'REWARDS › WALLET › Load card (/account/load-card nested); checkout', userAction:'Load gift code; spend cash', api:'POST /api/rewards/gift-card/redeem (proposed) ; checkout quote applies wallet balance',
  record:'gift_card_codes (hashed) + wallet_ledger', external:'Stripe for purchased gift cards',
  adminVisibility:'REWARDS › CODES; wallet ledger', adminAction:'Create/void codes', customerUpdate:'Wallet balance + history',
  notification:'Code redeemed alert', audit:'code status + ledger', failureRecovery:'Code redemption single-use enforced by unique constraint',
  test:'E2E: admin creates code → customer redeems on another device → balance; second redeem rejected' });
w({ id:'W-21', name:'Slay Challenge progress and completion', area:'Rewards', current:'BROKEN (progress never advances; not user-scoped)', bw:['BW-17'], risks:['R-16'], decisions:['D1','B4'], sprint:'S4',
  entry:'REWARDS › SLAY CHALLENGE', userAction:'Complete qualifying actions', api:'Server evaluator subscribed to events (order paid, review approved, analysis completed, …)',
  record:'slay_challenge_progress per user/cycle/tier', external:'none',
  adminVisibility:'REWARDS › SLAY CHALLENGE participants', adminAction:'Configure cycle; inspect progress', customerUpdate:'Phase image (existing 3 per reward) by completed count per D1',
  notification:'Phase reached alert', audit:'requirements JSON with source ids', failureRecovery:'Evaluator re-runnable (idempotent on source events)',
  test:'Integration: fire qualifying events → phase transitions per D1 thresholds; other user unaffected' });
w({ id:'W-22', name:'Slay Challenge reward claim', area:'Rewards', current:'MISSING (no fulfilment)', bw:['BW-17'], risks:['R-16'], decisions:['D1','D9'], sprint:'S4',
  entry:'REWARDS › SLAY CHALLENGE › Claim', userAction:'Choose 1 of 2 rewards and claim', api:'POST /api/rewards/slay/claim (proposed)',
  record:'reward_claims + ledger entry or fulfilment task', external:'none',
  adminVisibility:'SLAY CHALLENGE › claims to fulfil', adminAction:'Fulfil physical rewards', customerUpdate:'Claimed / fulfilled state; collectible unlocked',
  notification:'Claim confirmation; fulfilled', audit:'reward_claims', failureRecovery:'Unique (user, cycle, tier) prevents double claim',
  test:'E2E: claim once succeeds; second claim rejected; ledger row present' });
w({ id:'W-23', name:'Referral qualification and credit', area:'Rewards', current:'BROKEN (computed in buyer browser; referral_earnings never written)', bw:['BW-15'], risks:['R-16'], decisions:['D8'], sprint:'S6',
  entry:'Friend uses referral code at checkout', userAction:'Share code (referrer); apply code (friend)', api:'Checkout quote validates code server-side; status hook on order status per D8',
  record:'referral_earnings + wallet_ledger entry (amount per D8; NOT implemented automatically)', external:'none',
  adminVisibility:'REWARDS › REFERRALS', adminAction:'Void fraudulent referral', customerUpdate:'EARN & SHARE › REFERRALS list',
  notification:'Referral credited alert', audit:'referral_earnings + ledger', failureRecovery:'Refund/cancel writes reversal; self-referral blocked server-side',
  test:'E2E: friend order reaches D8 status → one credit; refund → reversal; self-referral rejected' });
w({ id:'W-24', name:'Birthday and anniversary rewards', area:'Rewards', current:'PARTIAL (eligibility computed, unused)', bw:[], risks:['R-16'], decisions:['D11','D13'], sprint:'S4',
  entry:'Automatic (scheduled job)', userAction:'Choose birthday gift option', api:'cron job (pattern exists: /api/cron/expiring-rewards-emails)',
  record:'loyalty_ledger / wallet_ledger / reward_claims', external:'none',
  adminVisibility:'REWARDS console', adminAction:'View', customerUpdate:'Activity + alert',
  notification:'Birthday/anniversary email', audit:'ledger', failureRecovery:'Job idempotent per period_key',
  test:'Integration: job twice for same period → one entry' });

// ---------------- CONTENT / COMMUNITY ----------------
w({ id:'W-25', name:'Affiliate content submission and approval', area:'Community', current:'BROKEN (approval writes 100 to profile JSON; no ledger)', bw:['BW-16'], risks:['R-16'], decisions:['D6','F2'], sprint:'S6',
  entry:'/account/affiliate', userAction:'Submit photo/video/social link for a delivered order', api:'POST /api/client/submissions (exists; take owner/email from JWT) → admin approve endpoint',
  record:'content_submissions + loyalty_ledger on approval (caps per D6)', external:'Storage bucket',
  adminVisibility:'APPROVALS › AFFILIATE', adminAction:'Approve/decline with reason', customerUpdate:'REVIEWS & CONTENT › SUBMISSIONS status + points',
  notification:'Decision alert/email', audit:'moderation log', failureRecovery:'Re-approval cannot pay twice (unique source key); cap overflow approved with 0 points and reason',
  test:'E2E: submit → approve → ledger row at canonical amount; cap respected; body email ignored' });
w({ id:'W-26', name:'Slay Cam submission and feature', area:'Community', current:'BROKEN (CTA loops; stats fabricated)', bw:['BW-24'], risks:['R-08'], decisions:['F1','F4'], sprint:'S0B-2 (copy) / S5',
  entry:'/slay-cam → SUBMIT YOUR LOOK', userAction:'Submit look with consent', api:'POST /api/client/submissions kind=slay_cam (extend)',
  record:'content_submissions (kind slay_cam, featured flag)', external:'Storage bucket',
  adminVisibility:'APPROVALS › SLAY CAM', adminAction:'Approve/feature/MVP per F4', customerUpdate:'SUBMISSIONS status; gallery when featured',
  notification:'Featured alert', audit:'moderation log', failureRecovery:'Consent withdrawal unfeatures',
  test:'E2E: submission without consent rejected; featured row appears in /slay-cam' });
w({ id:'W-27', name:'Review submission and moderation', area:'Community', current:'BROKEN (button unreachable; verified_purchase hardcoded; no public display)', bw:['BW-19','BW-20'], risks:['R-04'], decisions:['F2','F3','D7'], sprint:'S5',
  entry:'Order detail › LEAVE A REVIEW (DELIVERED only)', userAction:'Write review + media', api:'POST /api/reviews (proposed server endpoint; client insert policy removed)',
  record:'reviews / content_submissions (verified_purchase derived)', external:'Storage bucket',
  adminVisibility:'APPROVALS › REVIEWS', adminAction:'Publish/decline with customer-visible reason', customerUpdate:'REVIEWS & CONTENT status',
  notification:'Decision alert', audit:'moderation log', failureRecovery:'Edit/withdraw while pending',
  test:'E2E: non-delivered order cannot review; published review shows on product page (F3)' });
w({ id:'W-28', name:'Support inquiry and reply', area:'Support', current:'BROKEN (admin inbox read-only; no customer thread)', bw:['BW-23'], risks:[], decisions:['B7'], sprint:'S6',
  entry:'Concierge priority messages; SETTINGS › MY REQUESTS; order "Need help?"; brand contact', userAction:'Send message; read replies', api:'POST/GET /api/support/threads (proposed; wraps /api/client/priority-messages and brand contact)',
  record:'support_requests + messages', external:'Resend',
  adminVisibility:'INBOX', adminAction:'Reply, assign, resolve', customerUpdate:'Thread view in MY REQUESTS',
  notification:'Reply email + alert', audit:'message history', failureRecovery:'Unanswered SLA tile; email fallback',
  test:'E2E: customer message → admin reply → customer sees reply on second device' });

// ---------------- ACCOUNT / ADMIN OPS ----------------
w({ id:'W-29', name:'Inventory and sold-out', area:'Admin ops', current:'BROKEN (override in admin localStorage only)', bw:['BW-11'], risks:[], decisions:['C1'], sprint:'S3',
  entry:'Admin › INVENTORY', userAction:'(customer) sees availability; joins waitlist', api:'PUT /api/admin/inventory (proposed); GET availability public; /api/inventory/back-in-stock-notify (exists)',
  record:'inventory_items + inventory_movements; stock_waitlist', external:'none',
  adminVisibility:'INVENTORY (stock, waitlist)', adminAction:'Set stock; notify waitlist', customerUpdate:'PDP availability for every shopper',
  notification:'Back-in-stock email', audit:'inventory_movements', failureRecovery:'Paid order decrements stock in the webhook transaction; oversell alert',
  test:'E2E: admin sets 0 → second browser sees sold out; restock → waitlist email' });
w({ id:'W-30', name:'Promo code creation and use', area:'Admin ops', current:'BROKEN (admin localStorage)', bw:['BW-12'], risks:[], decisions:['C2'], sprint:'S4',
  entry:'Admin › REWARDS › CODES', userAction:'Apply promo at checkout', api:'POST /api/admin/promo-codes (proposed); checkout quote validates',
  record:'promo_codes + redemption rows', external:'none',
  adminVisibility:'CODES usage', adminAction:'Create/expire', customerUpdate:'Discount line in quote',
  notification:'—', audit:'admin_audit_log', failureRecovery:'Limits enforced in the order transaction',
  test:'E2E: code created on admin device works for a customer elsewhere; limit enforced' });
w({ id:'W-31', name:'Mock and test data isolation', area:'Platform', current:'BROKEN (Concierge injects test orders into real histories; mock data shown as live)', bw:['BW-25'], risks:['R-08'], decisions:['A5'], sprint:'S0B-2',
  entry:'Any account/admin page', userAction:'None', api:'Build-time flag; mocks only behind VITE_DEMO in non-production',
  record:'n/a (removal)', external:'none',
  adminVisibility:'Cleanup report of affected accounts', adminAction:'Run one-off client cleanup (local keys) after approval', customerUpdate:'Order history shows real orders only',
  notification:'none (unless A8 remediation)', audit:'cleanup log', failureRecovery:'Feature flag rollback',
  test:'Static: no mock imports in production bundle; E2E: visiting Concierge adds no orders' });
w({ id:'W-32', name:'Slay Ticket purchase', area:'Rewards', current:'BROKEN (credits without payment proof)', bw:['BW-07'], risks:['R-05'], decisions:['A6'], sprint:'S0B-2',
  entry:'/tools/slay-tickets → /checkout/slay-tickets', userAction:'Buy tickets', api:'Disable /api/slay-tickets/credit-order (exists) until Stripe-backed path',
  record:'slay ticket ledger written by webhook only', external:'Stripe',
  adminVisibility:'REWARDS › WALLET', adminAction:'Adjust with reason', customerUpdate:'Wallet tickets',
  notification:'Receipt', audit:'ledger', failureRecovery:'Endpoint returns 410 until replaced',
  test:'Integration: credit-order without paid PI rejected' });
w({ id:'W-33', name:'Account deletion and data export', area:'Platform', current:'PARTIAL (/api/delete-account exists; admin deleted list exists)', bw:[], risks:['R-17'], decisions:['E3','F2','H3'], sprint:'S2',
  entry:'SETTINGS › Delete account', userAction:'Request deletion', api:'POST /api/delete-account (exists)',
  record:'deleted account record; content anonymised; ledgers retained (financial)', external:'Stripe customer retained for tax',
  adminVisibility:'CLIENTS › DELETED', adminAction:'Restore within window', customerUpdate:'Signed out; confirmation email',
  notification:'Confirmation email', audit:'deletion log', failureRecovery:'Shared auth.users with SITE00: deletion must not remove SITE00 data (H3)',
  test:'E2E: delete → cannot sign in; orders retained anonymised; SITE00 tables untouched' });
w({ id:'W-34', name:'Wishlist save, lists and share', area:'Account', current:'PARTIAL (works; share token unverified)', bw:[], risks:[], decisions:['B1'], sprint:'S2',
  entry:'PDP heart; /wishlist', userAction:'Save, organise, share', api:'/api/wishlist (exists)',
  record:'wishlist tables (server)', external:'none',
  adminVisibility:'CLIENTS › customer detail', adminAction:'View', customerUpdate:'Lists on all devices',
  notification:'Back-in-stock for wishlisted items', audit:'—', failureRecovery:'Share token revocable',
  test:'E2E: shared token readable signed-out; revoked token 404' });
w({ id:'W-35', name:'PSA "Find my best looks" picks delivery', area:'Hair analysis', current:'BROKEN (server returns picks; client discards them; "ready within 24 hours" never delivered)', bw:['BW-10'], risks:['R-13'], decisions:['E6','E3'], sprint:'S0B-2 (pause/relabel) → S5',
  entry:'PSA chat › FIND MY BEST LOOKS', userAction:'Upload selfie and request picks', api:'POST /api/psa/selfie-style-analysis (exists) → persist result',
  record:'hairstyle_analysis_results (kind=psa_picks) linked to the PSA thread; selfie per E3 retention', external:'AI provider',
  adminVisibility:'CLIENTS › customer detail › hair', adminAction:'View; resend', customerUpdate:'MY HAIR › ANALYSES shows the picks; PSA thread links to them',
  notification:'Picks ready alert', audit:'usage row + result row', failureRecovery:'Generation failure refunds the usage; caps per E6',
  test:'E2E: request picks → result persisted and visible in MY HAIR on a second device; no "24 hours" promise without a delivery path' });

module.exports = W;
