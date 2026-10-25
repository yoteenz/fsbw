// Founder decision board V2. founderSelection is always null here: nothing is approved by this package.
// Fields: id, group, subject, current, evidence, options[{key,label,consequence}], rec (option key), rationale,
// impact, reversibility (EASY|MODERATE|HARD), deps, gate (what it unblocks), blocks (sprints), priorAuditIds
const D = [];
const add = (o) => D.push({ founderSelection: null, status: 'PENDING', ...o });

// ---------------- A. SECURITY / PAYMENT ----------------
add({ id:'A1', group:'A. Security/payment', subject:'Approve the P0A database containment migration',
  current:'anon/authenticated can EXECUTE value RPCs (live; some functions also keep the PUBLIC default); legacy client write policies live on orders, meetings, notifications, reviews',
  evidence:'Live routine_privileges + pg_policies (audit doc 02 §5); risk register R-01, R-02, R-04',
  options:[{key:'1',label:'Approve narrowly scoped migration with prepared rollback, rehearsed on a Supabase branch, SITE00 smoke-tested',consequence:'Closes the exposure; small regression risk in shared DB'},
           {key:'2',label:'Defer',consequence:'Exposure remains open on production'}],
  rec:'1', rationale:'Anyone with the public anon key can grant hairstyle-analysis credits today; containment must not wait for page-tree approval.',
  impact:'Database (shared with SITE00)', reversibility:'EASY (rollback migration restores grants/policies)', deps:['H3 (SITE00 coordination)'], gate:'S0B-1', priorAuditIds:['FD-C1'] });
add({ id:'A2', group:'A. Security/payment', subject:'Build-A-Wig checkout until server pricing exists',
  current:'Stripe charges base + cap only for custom wigs (options dropped)',
  evidence:'api/_lib/pricing/resolveQuote.ts:181-205; src/utils/checkoutQuote.ts:40-55; risk R-03',
  options:[{key:'1',label:'Concierge-confirmed custom quote: Atelier and bag stay open; custom lines become "Request my custom quote" → admin sends consult offer → customer pays the server-held quoted amount',consequence:'No undercharge; reuses consult offer system; some manual work per order'},
           {key:'2',label:'Block card checkout for custom lines and route to "Book a consultation"',consequence:'Simplest; more friction'},
           {key:'3',label:'Keep current behaviour',consequence:'Undercharges every custom order (not acceptable)'}],
  rec:'1', rationale:'Keeps the immersive Atelier usable and revenue-safe until S1B makes server pricing authoritative.',
  impact:'Checkout, Meetings admin', reversibility:'EASY (flag)', deps:[], gate:'S0B-2', priorAuditIds:['FD-C3'] });
add({ id:'A3', group:'A. Security/payment', subject:'Non-Stripe CONFIRM ORDER on /checkout/upgrade',
  current:'Grants PREMIUM + welcome cash in the browser without charging', evidence:'src/pages/checkout/page.tsx:6818-6905; risk R-06',
  options:[{key:'1',label:'Disable in production (keep for non-production demo builds only)',consequence:'Membership only via Stripe'},{key:'2',label:'Keep',consequence:'Free premium client-side'}],
  rec:'1', rationale:'Server gates already ignore it; the client grant only misleads customers and admins.', impact:'Checkout', reversibility:'EASY', deps:[], gate:'S0B-2', priorAuditIds:['FD-C5'] });
add({ id:'A4', group:'A. Security/payment', subject:'Membership cancellation and saved payment methods',
  current:'CANCEL SUBSCRIPTION flips a local flag (Stripe keeps billing); /account/payment collects raw card number/CVV locally', evidence:'membership/page.tsx:1150-1175; payment/page.tsx:215-283; risks R-15, R-14',
  options:[{key:'1',label:'Stripe Customer Portal for cancel/plan/payment methods',consequence:'Least code, PCI-safe, Stripe-hosted UI (brand-styled by Stripe settings)'},{key:'2',label:'In-app cancel (cancel_at_period_end) + Stripe Elements for cards',consequence:'Fully on-brand; more code'}],
  rec:'1', rationale:'Fastest correct fix; can move in-app later without data changes.', impact:'Rewards, Settings', reversibility:'EASY', deps:[], gate:'S0B-2', priorAuditIds:['FD-C6','FD-C9'] });
add({ id:'A5', group:'A. Security/payment', subject:'Mock / demo / seed data in production',
  current:'Concierge injects test orders into real customers; admin dashboard falls back to fabricated data; mock clients and meetings merged', evidence:'concierge/page.tsx:1913-2211 (reproduced); dashboard/page.tsx:405-446; risk R-08',
  options:[{key:'1',label:'Quarantine all mock paths behind ?demo=1 on non-production hosts; founder "view as client" shows real data',consequence:'Honest but initially empty screens'},{key:'2',label:'Keep founder-only mocks',consequence:'Founder QA keeps seeing fake data; injection bug must still be fixed'}],
  rec:'1', rationale:'Trust: customers must never see fabricated orders or balances.', impact:'Account + admin', reversibility:'EASY', deps:[], gate:'S0B-2', priorAuditIds:['FD-C7'] });
add({ id:'A6', group:'A. Security/payment', subject:'Slay Ticket purchases',
  current:'Checkout skips Stripe; credit endpoint trusts client lines (mintable)', evidence:'api/slay-tickets/credit-order.ts:55-89; productCheckoutPolicy.ts:77-84; risk R-05',
  options:[{key:'1',label:'Pause pack purchases until webhook-only crediting ships (in S0B-2)',consequence:'Short pause of a small revenue line'},{key:'2',label:'Ship webhook crediting first, then re-enable',consequence:'Same end state, exploit window remains meanwhile'}],
  rec:'1', rationale:'Closes the exploit immediately.', impact:'Lounge content economy', reversibility:'EASY', deps:[], gate:'S0B-2', priorAuditIds:['FD-R14'] });
add({ id:'A7', group:'A. Security/payment', subject:'Booking autopay final payments',
  current:'Charges Stripe customer/payment method IDs supplied by the client; cron likely not running (GET vs POST)', evidence:'appointment-meeting.ts:112-138; autopay-final-payment.ts:81,143-145; risk R-09',
  options:[{key:'1',label:'Keep autopay off until server-sourced IDs and amounts ship; collect final balances manually meanwhile',consequence:'Manual collection for in-flight bookings'},{key:'2',label:'Fix and enable in the same sprint',consequence:'Faster automation, needs Stripe test pass first'}],
  rec:'1', rationale:'Never charge a card the server cannot prove belongs to the customer.', impact:'Bookings', reversibility:'EASY', deps:[], gate:'S0B-2', priorAuditIds:[] });
add({ id:'A8', group:'A. Security/payment', subject:'Remediation for customers affected by money defects',
  current:'0 server orders, 0 analysis purchase grants, 9 profiles in production (live counts)', evidence:'audit doc 02 §5',
  options:[{key:'1',label:'Check Stripe for any 4-pack analysis or Slay Ticket or BAW payments; refund or grant manually with audit',consequence:'Likely no affected customers'},{key:'2',label:'No action',consequence:'Unknown residual'}],
  rec:'1', rationale:'Cheap verification before launch.', impact:'Finance', reversibility:'—', deps:[], gate:'S0B-2', priorAuditIds:['FD-C4'] });
add({ id:'A9', group:'A. Security/payment', subject:'Approve the additive schema plan (orders first)',
  current:'No server order of record; production has 0 orders', evidence:'doc 06; audit doc 14 §6',
  options:[{key:'1',label:'Approve S1 tables now (customer_orders, items, status events, webhook events); later tables per sprint',consequence:'Lowest-risk moment (no data to migrate)'},{key:'2',label:'Approve all at once',consequence:'Larger review'},{key:'3',label:'Defer',consequence:'Order pages cannot be completed'}],
  rec:'1', rationale:'Unblocks 14 pages; nothing to migrate today.', impact:'Database (shared with SITE00)', reversibility:'MODERATE (additive; drop tables if abandoned before use)', deps:['A1','H3'], gate:'S1', priorAuditIds:['FD-C2'] });

// ---------------- B. CUSTOMER ARCHITECTURE ----------------
add({ id:'B1', group:'B. Customer architecture', subject:'Approve the customer page tree (10 families, 21 routed pages, 3 new)',
  current:'18 core routes, no shared shell, no order detail', evidence:'doc 01',
  options:[{key:'1',label:'Approve as proposed',consequence:'S2 proceeds'},{key:'2',label:'Approve with amendments (note them)',consequence:'S2 adjusts'}],
  rec:'1', rationale:'Keeps all working URLs; adds only homes for tasks that have none.', impact:'Account', reversibility:'MODERATE', deps:[], gate:'S2', priorAuditIds:['FD-A1'] });
add({ id:'B2', group:'B. Customer architecture', subject:'MY HAIR as its own family (profile, analyses, builds)',
  current:'Analyses and saved builds have no home; no hair profile', evidence:'doc 01, doc 09',
  options:[{key:'1',label:'Own family /account/hair with 3 tabs + analysis detail route',consequence:'Clear home; one new page'},{key:'2',label:'Split: analyses under Rewards, builds under Wishlist',consequence:'No new page; scattered'}],
  rec:'1', rationale:'Customers think "my hair", not "rewards" or "wishlist", for these things.', impact:'Account', reversibility:'MODERATE', deps:['E1','E3'], gate:'S5', priorAuditIds:['FD-A2'] });
add({ id:'B3', group:'B. Customer architecture', subject:'Concierge scope',
  current:'Holds messages, offers, a duplicate tracking engine, Slay Challenge, quests, gifts; route open to non-premium', evidence:'audit appendix A §2.2',
  options:[{key:'1',label:'Premium-only page: messages (with replies), offers, orders-in-progress links, gifts; tracking → order detail',consequence:'Focused white-glove page'},{key:'2',label:'Keep as is',consequence:'Duplication persists'}],
  rec:'1', rationale:'One tracking engine; clear purpose.', impact:'Account', reversibility:'EASY', deps:[], gate:'S2', priorAuditIds:['FD-A3'] });
add({ id:'B4', group:'B. Customer architecture', subject:'Where Slay Challenge lives',
  current:'Inside Concierge', evidence:'concierge/page.tsx:6004-6130',
  options:[{key:'1',label:'REWARDS › SLAY CHALLENGE tab',consequence:'Rewards in one place'},{key:'2',label:'Stay in Concierge',consequence:'Premium context kept'}],
  rec:'1', rationale:'It is a rewards mechanic; its art and ledger live with Rewards.', impact:'Account', reversibility:'EASY', deps:['D1'], gate:'S4', priorAuditIds:['FD-A4'] });
add({ id:'B5', group:'B. Customer architecture', subject:'/account on tablet/desktop',
  current:'≥768px redirects to the Desktop Penthouse (different numbers) despite mobile-only build target', evidence:'AccountHubRedirect.tsx; sweep',
  options:[{key:'1',label:'Keep the Penthouse redirect, but it must read /api/account/overview so numbers match',consequence:'Immersive desktop preserved'},{key:'2',label:'Pause redirect until desktop phase; centred 720px account column',consequence:'Consistent now; Penthouse later'}],
  rec:'1', rationale:'Preserves the approved immersive desktop experience while fixing data truth.', impact:'Desktop', reversibility:'EASY', deps:[], gate:'S2', priorAuditIds:['FD-A9'] });
add({ id:'B6', group:'B. Customer architecture', subject:'Mobile Mansion /mobile/* placeholder pages',
  current:'Placeholder slots, unguarded, broken background, off-brand Playfair Display', evidence:'src/pages/mobile/*; V2 assets §2',
  options:[{key:'1',label:'Keep unlinked and out of the account tree until a dedicated creative sprint',consequence:'No change'},{key:'2',label:'Remove routes',consequence:'Less clutter; loses prototype'},{key:'3',label:'Make it the mobile home now',consequence:'Large creative scope'}],
  rec:'1', rationale:'Avoids scope creep; preserves the prototype.', impact:'Mobile', reversibility:'EASY', deps:[], gate:'—', priorAuditIds:['FD-A7'] });
add({ id:'B7', group:'B. Customer architecture', subject:'Support for all members (MY REQUESTS + replies)',
  current:'Premium priority messages are one-way; standard members only have /brand/contact', evidence:'audit appendix A §4',
  options:[{key:'1',label:'support_requests threads for everyone; premium keeps priority routing',consequence:'New feature (approval needed)'},{key:'2',label:'Premium-only replies',consequence:'Standard members unanswered in-app'}],
  rec:'1', rationale:'Every message deserves a visible answer.', impact:'Account + Inbox', reversibility:'MODERATE', deps:[], gate:'S6', priorAuditIds:[] });
add({ id:'B8', group:'B. Customer architecture', subject:'Navigation labels (creative)',
  current:'Proposed: OVERVIEW · ORDERS · CONCIERGE · REWARDS · MY HAIR · WISHLIST · REVIEWS & CONTENT · EARN & SHARE · ALERTS · SETTINGS', evidence:'doc 01',
  options:[{key:'1',label:'Use proposed labels',consequence:'—'},{key:'2',label:'Founder wording (note it)',consequence:'—'}],
  rec:'1', rationale:'Plain words customers recognise.', impact:'Copy', reversibility:'EASY', deps:[], gate:'S2', priorAuditIds:[] });

// ---------------- C. ADMIN ARCHITECTURE ----------------
add({ id:'C1', group:'C. Admin architecture', subject:'Approve the admin page tree (15 families, 24 routed pages, 5 new, 10 folded)',
  current:'33 routes, no admin menu, 7 unreachable, Studio cards first', evidence:'doc 02',
  options:[{key:'1',label:'Approve as proposed',consequence:'S3 proceeds'},{key:'2',label:'Approve with amendments',consequence:'S3 adjusts'}],
  rec:'1', rationale:'Operational families; every real feature reachable; redirects keep old links.', impact:'Admin', reversibility:'MODERATE', deps:[], gate:'S3', priorAuditIds:['FD-B1'] });
add({ id:'C2', group:'C. Admin architecture', subject:'Admin roles and money authority',
  current:'Email allow-list in 3 places; no roles table; founder hardcoded', evidence:'audit doc 13 §2',
  options:[{key:'1',label:'admin_roles: FOUNDER / ADMIN (STAFF later); refunds and adjustments above a threshold need FOUNDER',consequence:'Least privilege'},{key:'2',label:'Everyone on the allow-list can do everything',consequence:'Simpler; riskier'}],
  rec:'1', rationale:'Money actions need accountable authority.', impact:'Admin', reversibility:'EASY', deps:[], gate:'S3', priorAuditIds:['FD-B2','FD-B3'] });
add({ id:'C3', group:'C. Admin architecture', subject:'Command Center content',
  current:'12 link cards with fabricated metrics', evidence:'audit doc 20',
  options:[{key:'1',label:'Queues first (forms, ready to ship, delayed, approvals, inbox, meetings, offers expiring, low stock) + system alerts + 4 metrics',consequence:'Actionable; looks empty pre-launch'},{key:'2',label:'Keep cards, remove fake numbers',consequence:'Smaller change; not actionable'}],
  rec:'1', rationale:'The admin home must start work.', impact:'Admin', reversibility:'EASY', deps:['C4'], gate:'S3', priorAuditIds:[] });
add({ id:'C4', group:'C. Admin architecture', subject:'Canonical order status vocabulary and stage SLAs',
  current:'Three conflicting stage lists; time-computed stages', evidence:'audit appendix A §4',
  options:[{key:'1',label:'pending_payment → paid → awaiting_form → confirmed → in_production (sourcing, constructing, cleansing, customizing, finalizing) → shipped → delivered; + canceled, refunded, issue; digital: paid → processing → complete; founder supplies SLA days per stage',consequence:'One vocabulary'},{key:'2',label:'Founder-specified list',consequence:'—'}],
  rec:'1', rationale:'Matches existing customer-facing stage names while making them event-driven.', impact:'Orders everywhere', reversibility:'MODERATE', deps:[], gate:'S1', priorAuditIds:['FD-C10','FD-B5'] });
add({ id:'C5', group:'C. Admin architecture', subject:'Studio OS boundary',
  current:'HEADQUARTERS and STUDIO COMMAND CENTER are the first dashboard cards; dashboard boots Studio modules', evidence:'audit doc 04',
  options:[{key:'1',label:'Single STUDIO link in the admin menu; no Studio/SITE00 modules in FS admin',consequence:'Clean boundary'},{key:'2',label:'Keep cards',consequence:'Clutter'}],
  rec:'1', rationale:'FS admin stays a business operations tool.', impact:'Admin', reversibility:'EASY', deps:[], gate:'S3', priorAuditIds:[] });

// ---------------- D. MEMBERSHIP / REWARDS ----------------
add({ id:'D1', group:'D. Membership/rewards', subject:'Slay Challenge requirement and reveal model',
  current:'Brief: 3 requirements per reward. Repo canon (MEMORY 2026-06-19): 4 tiers 5/7, 4/7, 5/9, 6/9; 3 reveal phases; code fires phase 2 at 67%; no repo canon for full-silhouette/transparent art', evidence:'evidence/R2_rewards_canon.md §5; doc 08 §1.5',
  options:[{key:'1',label:'Keep 4 tiers; reveal phase = share of the tier\'s own required count (phase 2 at ≥75%, phase 3 at 100%)',consequence:'Preserves latest repo canon and 3-phase art'},{key:'2',label:'Adopt 3 requirements per reward (rewrite tiers to 3 tasks)',consequence:'Matches brief wording; changes reward economics'},{key:'3',label:'Other (founder specifies)',consequence:'—'}],
  rec:'1', rationale:'Latest documented canon; art unchanged either way. Founder confirms the existing 30 PNGs show the full silhouette with ghosted→coloured sections (not verifiable offline).', impact:'Rewards', reversibility:'MODERATE', deps:[], gate:'S4', priorAuditIds:['FD-R1','FD-R2'] });
add({ id:'D2', group:'D. Membership/rewards', subject:'Benefit eligibility conflicts', current:'Special offers (12 vs 6/12), Slay Challenge (all vs 6/12), live order tracking (3 vs 6)', evidence:'doc 08 §1.1',
  options:[{key:'1',label:'Follow the published benefit list (special offers 12; challenges all premium; live tracking 3+)',consequence:'Code gates change to match copy'},{key:'2',label:'Follow current code gates; update copy',consequence:'Copy changes'}],
  rec:'1', rationale:'Customers bought against the published list.', impact:'Membership', reversibility:'EASY', deps:[], gate:'S4', priorAuditIds:['FD-R3','FD-R5','FD-R6'] });
add({ id:'D3', group:'D. Membership/rewards', subject:'Welcome credits', current:'Premium chart $10/$20/$40/$60 vs checkout $10/$20/$40; spend-tier $10/$40/$80; both "WELCOME DISCOUNT"', evidence:'doc 08 §1.1',
  options:[{key:'1',label:'Founder confirms amounts, once-per-tier vs per-term, and whether premium and spend-tier credits stack',consequence:'—'}],
  rec:'1', rationale:'Money values must come from the founder.', impact:'Wallet ledger', reversibility:'EASY', deps:[], gate:'S4', priorAuditIds:['FD-R7','FD-R11'] });
add({ id:'D4', group:'D. Membership/rewards', subject:'Purchase points formula', current:'Checkout: eligible net × multiplier; display: order total 1:1; desktop: third formula', evidence:'doc 08 §1.3',
  options:[{key:'1',label:'Eligible net × multiplier (checkout rule) everywhere',consequence:'Matches "1 point per $1, excludes tax/shipping"'},{key:'2',label:'Order total 1:1',consequence:'Simpler; includes non-eligible items'}],
  rec:'1', rationale:'Matches the published "excludes taxes + shipping" rule.', impact:'Ledger', reversibility:'MODERATE', deps:[], gate:'S4', priorAuditIds:['FD-R8'] });
add({ id:'D5', group:'D. Membership/rewards', subject:'Points expiry', current:'No rule; expiry email template exists', evidence:'doc 08 §1.3',
  options:[{key:'1',label:'Points never expire (retire points_expiring email)',consequence:'Simple, generous'},{key:'2',label:'Expire after N months inactivity',consequence:'Liability control'},{key:'3',label:'Fixed period from earn date',consequence:'—'}],
  rec:'1', rationale:'No published expiry exists; introducing one is a new rule.', impact:'Ledger', reversibility:'MODERATE', deps:[], gate:'S4', priorAuditIds:['FD-R8'] });
add({ id:'D6', group:'D. Membership/rewards', subject:'Affiliate rewards and caps', current:'Copy 400/600/600; caps 3,000 social per product, 5,000 per unit per 6 months; hidden 2+2 photo/video sub-cap; server writes 100', evidence:'doc 08 §1.4',
  options:[{key:'1',label:'Confirm copy values as canonical; caps per copy; show sub-caps; no multipliers; define Featured Creator later',consequence:'Server enforces published rules'},{key:'2',label:'Founder edits values',consequence:'—'}],
  rec:'1', rationale:'Matches published program and historical references.', impact:'Ledger', reversibility:'MODERATE', deps:[], gate:'S6', priorAuditIds:['FD-R10'] });
add({ id:'D7', group:'D. Membership/rewards', subject:'Points for review content', current:'Loyalty chart "+150 content review", "+200 tag us"; pending tally 400/600 for review media', evidence:'audit appendix B FD-10',
  options:[{key:'1',label:'Founder sets review-content points (or none)',consequence:'—'}],
  rec:'1', rationale:'Conflicting copy.', impact:'Ledger', reversibility:'EASY', deps:[], gate:'S5', priorAuditIds:['FD-R10'] });
add({ id:'D8', group:'D. Membership/rewards', subject:'Referral program rules', current:'$20 off + $20 digital cash at confirmation; activation delivered (copy) vs shipped (code); stacking undefined; client-only', evidence:'doc 08 §1.4',
  options:[{key:'1',label:'Confirm $20/$20; credit when the referred order is delivered; reverse on refund/cancel; no stacking with +100 earn task',consequence:'Conservative'},{key:'2',label:'Confirm $20/$20 at confirmation (current)',consequence:'Faster reward, more reversals'},{key:'3',label:'Different amounts',consequence:'—'}],
  rec:'1', rationale:'Brief: do not implement $20 automatically; delivered-based credit minimises reversals.', impact:'Wallet ledger', reversibility:'MODERATE', deps:[], gate:'S6', priorAuditIds:['FD-R9'] });
add({ id:'D9', group:'D. Membership/rewards', subject:'Undefined perks', current:'Mystery rewards, Early Access, Expedited Processing, Free Shipping credit, 2X/2.5X/3X next purchase, tier welcome bonuses, Annual Consultation, Status Protection, free gift fulfilment', evidence:'doc 08 §1.3',
  options:[{key:'1',label:'Define each (contents, trigger, fulfilment) or remove its copy',consequence:'—'}],
  rec:'1', rationale:'Copy without fulfilment is a broken promise.', impact:'Rewards copy + ledger', reversibility:'EASY', deps:[], gate:'S4', priorAuditIds:['FD-R16','FD-R15'] });
add({ id:'D10', group:'D. Membership/rewards', subject:'Unknown premium tier default', current:'Defaults to 12-month privileges', evidence:'psaFeatureGates.ts:33',
  options:[{key:'1',label:'Default to 3-month privileges',consequence:'Conservative'},{key:'2',label:'Keep 12-month',consequence:'Generous'}],
  rec:'1', rationale:'Never grant more than paid for.', impact:'Gates', reversibility:'EASY', deps:[], gate:'S4', priorAuditIds:['FD-R6'] });
add({ id:'D11', group:'D. Membership/rewards', subject:'Anniversary semantics', current:'Awarded at each completed term; renewal behaviour unclear', evidence:'doc 08 §1.3',
  options:[{key:'1',label:'Once per completed term, including renewals',consequence:'—'},{key:'2',label:'Once per membership year',consequence:'—'},{key:'3',label:'First term only',consequence:'—'}],
  rec:'1', rationale:'Matches current code; founder confirms.', impact:'Ledger', reversibility:'EASY', deps:[], gate:'S4', priorAuditIds:[] });
add({ id:'D12', group:'D. Membership/rewards', subject:'"Hair Bestie Bonus"', current:'Not found anywhere in the repo ("hair bestie" is a PSA voice pillar)', evidence:'evidence/R2_rewards_canon.md §4',
  options:[{key:'1',label:'Drop the term',consequence:'—'},{key:'2',label:'Define amount, trigger, eligibility',consequence:'New rule'}],
  rec:'1', rationale:'No evidence it exists; defining it is a new business rule.', impact:'Rewards', reversibility:'EASY', deps:[], gate:'S4', priorAuditIds:[] });
add({ id:'D13', group:'D. Membership/rewards', subject:'Birthday gift', current:'$20 gift card or 200 points; premium (chart) vs VIP/affiliate (copy); eligibility unused; never fulfilled', evidence:'doc 08 §1.3',
  options:[{key:'1',label:'Premium only; claim window around birthday; fulfilled via ledger',consequence:'—'},{key:'2',label:'Premium + affiliates',consequence:'—'}],
  rec:'1', rationale:'Matches the chart.', impact:'Rewards', reversibility:'EASY', deps:[], gate:'S4', priorAuditIds:['FD-R17'] });

// ---------------- E. HAIR ANALYSIS / BAW ----------------
add({ id:'E1', group:'E. Hair Analysis/Build-A-Wig', subject:'Hair Analysis eligibility and bonus credits', current:'Subscribers only (BLACK excluded); non-subscribers can buy credits but get 403; bonus credit has no grant path', evidence:'doc 08 §1.2',
  options:[{key:'1',label:'Subscribers + anyone who buys credits may use purchased credits; BLACK gets no free monthly; bonus credit = one paid-credit grant',consequence:'Purchases always usable'},{key:'2',label:'Subscribers only; disable purchase for others',consequence:'—'},{key:'3',label:'Also give BLACK the monthly free analysis',consequence:'—'}],
  rec:'1', rationale:'A customer who pays must be able to use what they bought.', impact:'Hair analysis', reversibility:'EASY', deps:[], gate:'S5', priorAuditIds:['FD-R7'] });
add({ id:'E2', group:'E. Hair Analysis/Build-A-Wig', subject:'/tools/hairstyle-analysis harness', current:'Customer-reachable admin harness with demo identity; consumes a real credit', evidence:'HairstyleAnalysisDemo.tsx:7-14',
  options:[{key:'1',label:'Admin-only; customers redirect to MY HAIR › ANALYSES',consequence:'—'},{key:'2',label:'Keep',consequence:'Credits wasted on demo output'}],
  rec:'1', rationale:'Prevents wasted credits and demo identity exposure.', impact:'Tools', reversibility:'EASY', deps:[], gate:'S0B-2', priorAuditIds:['FD-A6'] });
add({ id:'E3', group:'E. Hair Analysis/Build-A-Wig', subject:'Selfie consent, retention and deletion', current:'No consent; selfies sent to Fal/OpenAI and stored in local cart/order JSON', evidence:'doc 09 §1',
  options:[{key:'1',label:'Founder-approved consent text; private storage; retention N days (founder sets); delete on request and account deletion',consequence:'—'}],
  rec:'1', rationale:'Policy wording belongs to the founder.', impact:'Privacy', reversibility:'EASY', deps:[], gate:'S5', priorAuditIds:['FD-C8'] });
add({ id:'E4', group:'E. Hair Analysis/Build-A-Wig', subject:'Edit-from-cart gate', current:'Premium only (code) vs sign-in only (canon)', evidence:'BuildWigCustomizeEditAccessGate.tsx:49-52; CORE.md:50',
  options:[{key:'1',label:'Sign-in only (canon); premium-only options stay gated',consequence:'Standard members can edit their own lines'},{key:'2',label:'Premium only',consequence:'—'}],
  rec:'1', rationale:'Matches documented canon.', impact:'Atelier', reversibility:'EASY', deps:[], gate:'S1B', priorAuditIds:['FD-A8'] });
add({ id:'E5', group:'E. Hair Analysis/Build-A-Wig', subject:'Build-A-Wig price catalogue ownership', current:'6+ hand-synced price tables; no admin editor', evidence:'doc 09 §2',
  options:[{key:'1',label:'Code-defined single catalogue with an admin read view; changes by release',consequence:'Safest, fastest'},{key:'2',label:'Admin-editable catalogue table (founder approves price changes)',consequence:'Flexible; more build'}],
  rec:'1', rationale:'Pricing correctness first; editing UI can follow.', impact:'Checkout', reversibility:'MODERATE', deps:[], gate:'S1B', priorAuditIds:[] });
add({ id:'E6', group:'E. Hair Analysis/Build-A-Wig', subject:'Asynchronous deliverables (PSA picks, consult add-on)', current:'PSA promises 24h, delivers nothing; paid consult add-on unfulfilled', evidence:'doc 09 §1',
  options:[{key:'1',label:'Store and deliver automatically (PSA picks immediately; consult add-on generated and reviewed by admin before release within 24h)',consequence:'—'},{key:'2',label:'Remove the 24h promise / add-on until built',consequence:'—'}],
  rec:'1', rationale:'Customers paid or were promised.', impact:'Hair analysis, Meetings', reversibility:'EASY', deps:['E3'], gate:'S5', priorAuditIds:[] });

// ---------------- F. COMMUNITY / AFFILIATE ----------------
add({ id:'F1', group:'F. Community/affiliate', subject:'Fabricated Slay Cam stats and testimonials', current:'"42K LOOK SAVES", named fictional posts shown as community', evidence:'slay-cam/page.tsx:75-214',
  options:[{key:'1',label:'Remove stats; label posts as curated editorial until real submissions exist',consequence:'Copy-only change; page design kept'},{key:'2',label:'Keep',consequence:'Misleading'}],
  rec:'1', rationale:'Trust.', impact:'Public page', reversibility:'EASY', deps:[], gate:'S0B-2', priorAuditIds:['FD-C11'] });
add({ id:'F2', group:'F. Community/affiliate', subject:'UGC consent, usage rights and retention wording', current:'None', evidence:'doc 10 §2',
  options:[{key:'1',label:'Founder supplies wording (or approves a drafted version reviewed by counsel)',consequence:'—'}],
  rec:'1', rationale:'Legal/policy text is the founder\'s.', impact:'Reviews, affiliate, Slay Cam', reversibility:'EASY', deps:[], gate:'S5', priorAuditIds:['FD-C8'] });
add({ id:'F3', group:'F. Community/affiliate', subject:'Public review display', current:'Published reviews appear nowhere public', evidence:'audit doc 17',
  options:[{key:'1',label:'Show approved, consented reviews on product pages and /brand/reviews',consequence:'—'},{key:'2',label:'Keep private',consequence:'—'}],
  rec:'1', rationale:'The PDP already promises it.', impact:'Shop', reversibility:'EASY', deps:['F2'], gate:'S5', priorAuditIds:[] });
add({ id:'F4', group:'F. Community/affiliate', subject:'Slay MVP selection and reward', current:'Hardcoded first post', evidence:'slay-cam/page.tsx:296',
  options:[{key:'1',label:'Admin picks MVP per period; reward defined by founder',consequence:'—'},{key:'2',label:'No MVP',consequence:'—'}],
  rec:'1', rationale:'Existing concept; needs a rule.', impact:'Community', reversibility:'EASY', deps:['F2'], gate:'S5', priorAuditIds:[] });
add({ id:'F5', group:'F. Community/affiliate', subject:'Lounge comment moderation', current:'Live posting; reports increment a counter; no queue', evidence:'loungeEngagement.ts:363-386',
  options:[{key:'1',label:'Keep live posting; auto-hide at N unique reports (founder sets N); admin queue',consequence:'—'},{key:'2',label:'Pre-moderate all comments',consequence:'Slower community'}],
  rec:'1', rationale:'Balances openness and safety.', impact:'Lounge', reversibility:'EASY', deps:[], gate:'S5', priorAuditIds:[] });

// ---------------- G. VISUAL / RESPONSIVE ----------------
add({ id:'G1', group:'G. Visual/responsive', subject:'Account desktop column widths', current:'Pages stretch edge to edge at 1440/2560', evidence:'audit doc 19',
  options:[{key:'1',label:'Centred 720px (forms) / 960px (lists) column on marble; optional side rail later',consequence:'Phone unchanged'},{key:'2',label:'Founder-specified widths',consequence:'—'}],
  rec:'1', rationale:'Readable and luxurious; no restyle.', impact:'Account desktop', reversibility:'EASY', deps:['B5'], gate:'S2', priorAuditIds:[] });
add({ id:'G2', group:'G. Visual/responsive', subject:'Admin menu drawer', current:'No admin navigation besides dashboard cards', evidence:'audit doc 04',
  options:[{key:'1',label:'Hamburger drawer in AdminHeader using the existing menu-toggle card pattern',consequence:'—'},{key:'2',label:'Persistent side rail ≥1024px',consequence:'Bigger visual change'}],
  rec:'1', rationale:'Uses an approved pattern.', impact:'Admin', reversibility:'EASY', deps:['C1'], gate:'S3', priorAuditIds:[] });
add({ id:'G3', group:'G. Visual/responsive', subject:'Admin wide shell and Command Center layout', current:'448px column on every device', evidence:'audit doc 19',
  options:[{key:'1',label:'448 phone · 720 tablet · 1280 desktop shell on marble, glass panels',consequence:'—'},{key:'2',label:'Keep 448 everywhere',consequence:'Cramped tables'}],
  rec:'1', rationale:'Operational density without changing the look.', impact:'Admin', reversibility:'EASY', deps:['C3'], gate:'S3', priorAuditIds:['FD-B4'] });
add({ id:'G4', group:'G. Visual/responsive', subject:'Account Overview status panels and MY HAIR page visuals', current:'Card grid only', evidence:'audit doc 21',
  options:[{key:'1',label:'Approve panels in the existing glass card language (screenshot review in S2)',consequence:'—'}],
  rec:'1', rationale:'Visible change needs founder eyes.', impact:'Account', reversibility:'EASY', deps:['B1','B2'], gate:'S2/S5', priorAuditIds:[] });
add({ id:'G5', group:'G. Visual/responsive', subject:'Trend Desk and PSA Broadcast re-skin', current:'Black SaaS screens', evidence:'audit doc 19 sweep',
  options:[{key:'1',label:'Re-skin onto marble/glass admin shell',consequence:'—'},{key:'2',label:'Keep dark (intentional studio look)',consequence:'—'}],
  rec:'1', rationale:'Brand consistency in admin.', impact:'Admin', reversibility:'EASY', deps:[], gate:'S6', priorAuditIds:[] });
add({ id:'G6', group:'G. Visual/responsive', subject:'Certification collectible art', current:'CSS placeholder (only genuinely missing asset)', evidence:'evidence/V2_assets_components.md §2',
  options:[{key:'1',label:'Commission art in the existing collectible style',consequence:'New asset (founder creative)'},{key:'2',label:'Keep placeholder',consequence:'—'}],
  rec:'2', rationale:'Not launch-blocking; founder may commission later.', impact:'Collectibles', reversibility:'EASY', deps:[], gate:'—', priorAuditIds:[] });

// ---------------- H. LAUNCH READINESS ----------------
add({ id:'H1', group:'H. Launch readiness', subject:'Launch definition', current:'No page verified; 0 production orders', evidence:'doc 19',
  options:[{key:'1',label:'Launch-critical = P0A + P0B + S2 + S3 + S4 at H (verified) with doc 19 launch rows passing; S5/S6 may follow',consequence:'Earliest safe launch'},{key:'2',label:'Everything through S6 verified',consequence:'Later launch'}],
  rec:'1', rationale:'Money, orders, accounts and rewards must be true at launch; extended experiences can follow.', impact:'Launch', reversibility:'—', deps:[], gate:'S7', priorAuditIds:[] });
add({ id:'H2', group:'H. Launch readiness', subject:'Staging environment for signed-in verification', current:'No staging; E2E targets production by default', evidence:'playwright.config.ts',
  options:[{key:'1',label:'Supabase branch + Stripe test mode + seeded test accounts (customer standard/premium, admin, founder)',consequence:'Enables verification'},{key:'2',label:'Separate staging project',consequence:'More isolation, more cost'}],
  rec:'1', rationale:'Pages cannot reach H without signed-in backend tests.', impact:'QA', reversibility:'EASY', deps:['H3'], gate:'S7 (and S0B-1 rehearsal)', priorAuditIds:[] });
add({ id:'H3', group:'H. Launch readiness', subject:'SITE00 shares the Supabase project', current:'Shared auth, profiles trigger and public functions', evidence:'doc 11 R-17',
  options:[{key:'1',label:'Coordinate every FS migration with a SITE00 impact check now; plan SITE00 move to its own project',consequence:'—'},{key:'2',label:'Coordinate only',consequence:'Shared-DB risk persists'}],
  rec:'1', rationale:'Never assume a database change is isolated.', impact:'Both products', reversibility:'—', deps:[], gate:'S0B-1', priorAuditIds:[] });

module.exports = D;
