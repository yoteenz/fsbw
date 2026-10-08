/*
 * AIO OFFICE unified review — ILLUSTRATIVE SAMPLE RECORDS. Safe demo data only: no real client, person or policy.
 * One record per business entity; every department references the same record by id (no duplicate databases).
 * Status words come from the live type sets the office contracts cite (insuranceTypes, factoringTypes, bookkeepingTypes,
 * fleetcareTypes, driverlinkTypes, dispatch statuses, IFTA staff buckets, ServiceRequest statuses).
 * Today in the review is THURSDAY, OCTOBER 8, 2026.
 */
const TODAY = 'OCT 8, 2026';

/* ACCOUNTS / DUES: the studio already declares CLIENTS (HOME panel rows) and DEADLINES (HOME list) as globals. */
const ACCOUNTS = {
  'c-rl': { id: 'c-rl', name: 'RIVERSTONE LOGISTICS', b: 'RL', dot: 'USDOT 3184207', mc: 'MC 1098432', state: 'TX', life: 'ACTIVE', contact: 'DANA RIVERS · OWNER', trucks: 6, lanes: ['filing', 'bookkeeping', 'compliance', 'maintenance', 'vehicles'] },
  'c-dh': { id: 'c-dh', name: 'DELTA HAULING LLC', b: 'DH', dot: 'USDOT 2957731', mc: 'MC 984213', state: 'OK', life: 'ACTIVE', contact: 'MARCUS DELL · OWNER', trucks: 4, lanes: ['permitting', 'insurance', 'filing', 'bookkeeping', 'vehicles'] },
  'c-tk': { id: 'c-tk', name: 'T&K TRANSPORT', b: 'TK', dot: 'USDOT 3420915', mc: 'MC 1203377', state: 'GA', life: 'ACTIVE', contact: 'TINA KWAN · OPERATIONS', trucks: 9, lanes: ['dispatch', 'filing', 'factoring', 'bookkeeping', 'maintenance', 'drivers', 'vehicles'] },
  'c-hf': { id: 'c-hf', name: 'HORIZON FREIGHT', b: 'HF', dot: 'USDOT 3561102', mc: 'MC 1244871', state: 'AZ', life: 'ACTIVE', contact: 'LUIS ORTEGA · OWNER', trucks: 3, lanes: ['permitting', 'filing', 'roadready', 'vehicles'] },
  'c-rj': { id: 'c-rj', name: 'R&J TRUCKING', b: 'RJ', dot: 'USDOT 2871544', mc: 'MC 935410', state: 'TN', life: 'ACTIVE', contact: 'RAY JENKINS · OWNER', trucks: 5, lanes: ['permitting', 'insurance', 'filing', 'bookkeeping', 'brokerage', 'vehicles'] },
  'c-abc': { id: 'c-abc', name: 'ABC TRUCKING LLC', b: 'AB', dot: 'USDOT 3302178', mc: 'MC 1150029', state: 'FL', life: 'ACTIVE', contact: 'ANGELA BROOKS · OWNER', trucks: 2, lanes: ['permitting', 'insurance', 'compliance', 'drivers', 'maintenance', 'roadready', 'vehicles'] },
  'c-mt': { id: 'c-mt', name: 'MASON TRANSPORT', b: 'MT', dot: 'USDOT PENDING', mc: 'MC PENDING', state: 'NV', life: 'PREBUILT', contact: 'OWEN MASON · OWNER', trucks: 2, lanes: ['permitting', 'roadready'] },
  'c-hc': { id: 'c-hc', name: 'HEARTLAND FREIGHT CO.', b: 'HC', dot: 'USDOT 2718830', mc: 'MC 902117', state: 'NE', life: 'INVITED', contact: 'GRACE HALL · OFFICE MANAGER', trucks: 7, lanes: ['filing', 'permitting'] },
};

const LIFE = {
  ACTIVE: ['ACTIVE', 'ok'],
  PREBUILT: ['PREBUILT · NOT ACTIVE YET', 'mute'],
  INVITED: ['INVITED · AWAITING CLIENT CONFIRMATION', 'gold'],
};

const STAFF = {
  's-alex': { id: 's-alex', name: 'ALEX R.', b: 'AR', role: 'FOUNDER (IN FOUNDER VIEW) · STAFF (IN STAFF VIEW)', area: 'ALL LANES', you: true },
  's-jordan': { id: 's-jordan', name: 'JORDAN LEE', b: 'JL', role: 'STAFF', area: 'FILING & FUEL TAXES · PERMITTING' },
  's-maria': { id: 's-maria', name: 'MARIA SANTOS', b: 'MS', role: 'STAFF', area: 'INSURANCE · COMPLIANCE' },
  's-dev': { id: 's-dev', name: 'DEV PATEL', b: 'DP', role: 'STAFF', area: 'DISPATCH · DRIVERS & CARRIERS' },
  's-kayla': { id: 's-kayla', name: 'KAYLA BROOKS', b: 'KB', role: 'STAFF · BILLING GRANT', area: 'BOOKKEEPING · BILLING' },
};

/* ── VEHICLES & FLEET: PowerUnit is the record everything else points to ── */
const VEHICLES = {
  'v-rl-101': { id: 'v-rl-101', client: 'c-rl', unit: 'UNIT 101', ymm: '2022 FREIGHTLINER CASCADIA', vin: '…4H7721', plate: 'TX · APPORTIONED', status: 'ACTIVE', avail: ['AVAILABLE', 'ok'], driver: 'd-rl-1', policy: 'pol-rl', quarter: 'ifta-rl-q3', ticket: null, compliance: [] },
  'v-rl-104': { id: 'v-rl-104', client: 'c-rl', unit: 'UNIT 104', ymm: '2020 VOLVO VNL 760', vin: '…9K2045', plate: 'TX · APPORTIONED', status: 'ACTIVE', avail: ['MAINTENANCE HOLD', 'bad'], driver: null, policy: 'pol-rl', quarter: 'ifta-rl-q3', ticket: 't-rl-1', compliance: [] },
  'v-dh-12': { id: 'v-dh-12', client: 'c-dh', unit: 'UNIT 12', ymm: '2021 KENWORTH T680', vin: '…7C1180', plate: 'OK · APPORTIONED', status: 'ACTIVE', avail: ['AVAILABLE', 'ok'], driver: 'd-dh-1', policy: 'pol-dh', quarter: 'ifta-dh-q3', ticket: null, compliance: ['dl-dh-pol'] },
  'v-tk-07': { id: 'v-tk-07', client: 'c-tk', unit: 'UNIT 07', ymm: '2023 PETERBILT 579', vin: '…2M8833', plate: 'GA · APPORTIONED', status: 'ACTIVE', avail: ['ON A LOAD', 'gold'], driver: 'd-tk-1', policy: null, quarter: 'ifta-tk-q3', ticket: null, load: 'ld-5520', compliance: [] },
  'v-tk-09': { id: 'v-tk-09', client: 'c-tk', unit: 'UNIT 09', ymm: '2019 INTERNATIONAL LT625', vin: '…5R0912', plate: 'GA · APPORTIONED', status: 'ACTIVE', avail: ['OUT OF SERVICE', 'bad'], driver: null, policy: null, quarter: 'ifta-tk-q3', ticket: 't-tk-2', compliance: ['dl-tk-09'] },
  'v-hf-3': { id: 'v-hf-3', client: 'c-hf', unit: 'UNIT 3', ymm: '2022 VOLVO VNL 860', vin: '…3T5507', plate: 'AZ · APPORTIONED', status: 'ACTIVE', avail: ['CANNOT DISPATCH · AUTHORITY INACTIVE', 'bad'], driver: null, policy: null, quarter: 'ifta-hf-q3', ticket: null, compliance: [] },
  'v-abc-1': { id: 'v-abc-1', client: 'c-abc', unit: 'UNIT 1', ymm: '2021 FREIGHTLINER CASCADIA', vin: '…8A4410', plate: 'FL · IRP PENDING', status: 'ACTIVE', avail: ['AVAILABLE', 'ok'], driver: 'd-abc-1', policy: 'pol-abc', quarter: null, ticket: null, compliance: ['dl-abc-insp', 'dl-abc-med'], request: 'req-abc-irp' },
  'v-abc-2': { id: 'v-abc-2', client: 'c-abc', unit: 'UNIT 2', ymm: '2018 MACK ANTHEM', vin: '…6D2291', plate: 'FL · APPORTIONED', status: 'ACTIVE', avail: ['SERVICE SCHEDULED', 'gold'], driver: null, policy: 'pol-abc', quarter: null, ticket: 't-abc-1', compliance: [] },
};

/* ── DRIVERS & CARRIERS (DriverLink) ── */
const DRIVERS = {
  'd-rl-1': { id: 'd-rl-1', client: 'c-rl', name: 'CARLOS MENDEZ', cdl: 'CDL-A · TX · EXP MAR 2028', med: 'MEDICAL CARD · EXP JAN 2027', vehicle: 'v-rl-101', status: ['ACTIVE', 'ok'] },
  'd-dh-1': { id: 'd-dh-1', client: 'c-dh', name: 'PRIYA NAIR', cdl: 'CDL-A · OK · EXP JUN 2029', med: 'MEDICAL CARD · EXP AUG 2027', vehicle: 'v-dh-12', status: ['ACTIVE', 'ok'] },
  'd-tk-1': { id: 'd-tk-1', client: 'c-tk', name: 'SAMUEL OKAFOR', cdl: 'CDL-A · GA · EXP NOV 2027', med: 'MEDICAL CARD · EXP MAY 2027', vehicle: 'v-tk-07', status: ['ON A LOAD', 'gold'] },
  'd-abc-1': { id: 'd-abc-1', client: 'c-abc', name: 'TERRENCE HOLT', cdl: 'CDL-A · FL · EXP SEP 2030', med: 'MEDICAL CARD · EXP OCT 29, 2026', vehicle: 'v-abc-1', status: ['CREDENTIAL EXPIRING', 'warn'] },
};
const APPLICATIONS = {
  'ap-1': { id: 'ap-1', client: 'c-tk', job: 'CDL-A REGIONAL DRIVER · T&K TRANSPORT', who: 'APPLICANT · J. WILLIAMS', status: ['UNDER REVIEW', 'gold'], at: '2 DAYS AGO' },
  'ap-2': { id: 'ap-2', client: 'c-tk', job: 'CDL-A REGIONAL DRIVER · T&K TRANSPORT', who: 'APPLICANT · M. CHEN', status: ['DOCUMENTS NEEDED', 'warn'], at: '4 DAYS AGO' },
  'ap-3': { id: 'ap-3', client: 'c-abc', job: 'CDL-A OTR DRIVER · ABC TRUCKING LLC', who: 'APPLICANT · R. DIAZ', status: ['INTERVIEW SCHEDULED', 'ok'], at: 'OCT 10' },
};

/* ── INSURANCE (referral / assistance only — nothing is bound without licensing) ── */
const POLICIES = {
  'pol-dh': { id: 'pol-dh', client: 'c-dh', title: 'AUTO LIABILITY $1M · CARGO $100K', partner: 'PARTNER AGENCY (SAMPLE)', status: ['EXPIRING SOON', 'warn'], exp: 'OCT 14, 2026', days: 6, vehicles: ['v-dh-12'], renewal: 'RENEWAL QUOTE READY · SEND TO CLIENT TODAY', request: ['CUSTOMER REVIEW', 'gold'], owner: 's-alex', docs: ['doc-dh-coi', 'doc-dh-dec'] },
  'pol-rj': { id: 'pol-rj', client: 'c-rj', title: 'AUTO LIABILITY $1M · PHYSICAL DAMAGE', partner: 'CLIENT’S EXISTING AGENT', status: ['PENDING REVIEW', 'gold'], exp: 'NOV 30, 2026', days: 53, vehicles: [], renewal: 'CLIENT UPLOADED A RENEWAL · NEEDS STAFF REVIEW', request: ['INTERNAL REVIEW', 'gold'], owner: 's-maria', docs: ['doc-rj-ren'] },
  'pol-abc': { id: 'pol-abc', client: 'c-abc', title: 'AUTO LIABILITY $1M · CARGO $100K', partner: 'PARTNER AGENCY (SAMPLE)', status: ['ACTIVE', 'ok'], exp: 'MAR 31, 2027', days: 174, vehicles: ['v-abc-1', 'v-abc-2'], renewal: 'NO ACTION · RENEWAL WINDOW OPENS JAN 30', request: ['COMPLETED', 'ok'], owner: 's-maria', docs: ['doc-abc-coi'] },
  'pol-rl': { id: 'pol-rl', client: 'c-rl', title: 'AUTO LIABILITY $1M · CARGO $250K', partner: 'CLIENT’S EXISTING AGENT', status: ['ACTIVE', 'ok'], exp: 'FEB 28, 2027', days: 143, vehicles: ['v-rl-101', 'v-rl-104'], renewal: 'NO ACTION', request: ['COMPLETED', 'ok'], owner: 's-maria', docs: [] },
};

/* ── FILING & FUEL TAXES (IFTA quarter cases; manual staff filing — no government API) ── */
const QUARTERS = {
  'ifta-rl-q3': { id: 'ifta-rl-q3', client: 'c-rl', q: 'Q3 2026', bucket: ['NEEDS REVIEW', 'warn'], status: 'AIO REVIEW', due: 'OCT 31, 2026', miles: '61,420', gallons: '9,874', owner: 's-alex', next: 'REVIEW THE RETURN, THEN SEND FOR CLIENT APPROVAL (DUE OCT 13)' },
  'ifta-hf-q3': { id: 'ifta-hf-q3', client: 'c-hf', q: 'Q3 2026', bucket: ['FILED', 'ok'], status: 'FILED', due: 'OCT 31, 2026', miles: '28,115', gallons: '4,402', owner: 's-jordan', next: 'FILED OCT 6 · PAYMENT CONFIRMED' },
  'ifta-dh-q3': { id: 'ifta-dh-q3', client: 'c-dh', q: 'Q3 2026', bucket: ['FILED', 'ok'], status: 'FILED', due: 'OCT 31, 2026', miles: '33,860', gallons: '5,310', owner: 's-jordan', next: 'FILED OCT 5' },
  'ifta-rj-q3': { id: 'ifta-rj-q3', client: 'c-rj', q: 'Q3 2026', bucket: ['FILED', 'ok'], status: 'FILED', due: 'OCT 31, 2026', miles: '47,005', gallons: '7,512', owner: 's-jordan', next: 'FILED OCT 2' },
  'ifta-tk-q3': { id: 'ifta-tk-q3', client: 'c-tk', q: 'Q3 2026', bucket: ['AWAITING CLIENT', 'gold'], status: 'NEEDS CLIENT', due: 'OCT 31, 2026', miles: '—', gallons: '—', owner: 's-jordan', next: 'WAITING ON FUEL RECEIPTS FOR UNITS 07 AND 09' },
  'ifta-tk-q2': { id: 'ifta-tk-q2', client: 'c-tk', q: 'Q2 2026', bucket: ['COMPLETE', 'ok'], status: 'ARCHIVED', due: 'JUL 31, 2026', miles: '92,310', gallons: '14,880', owner: 's-jordan', next: 'FILED JUL 22' },
  'ifta-hc-q3': { id: 'ifta-hc-q3', client: 'c-hc', q: 'Q3 2026', bucket: ['BLOCKED', 'bad'], status: 'NOT ENROLLED', due: 'OCT 31, 2026', miles: '—', gallons: '—', owner: null, next: 'CLIENT IS INVITED, NOT ACTIVE — NO FILING UNTIL THEY CONFIRM' },
};

/* ── PERMITTING & AUTHORITIES (ServiceRequest) ── */
const REQUESTS = {
  'req-hf-mc': { id: 'req-hf-mc', client: 'c-hf', title: 'MC AUTHORITY REINSTATEMENT', section: 'OPERATING AUTHORITIES', status: ['INFORMATION NEEDED', 'bad'], due: 'OCT 10, 2026', owner: 's-alex', blocker: 'EIN LETTER NOT RECEIVED FROM THE CLIENT', docs: ['doc-hf-ein'], vehicles: ['v-hf-3'] },
  'req-rj-ucr': { id: 'req-rj-ucr', client: 'c-rj', title: 'UCR REGISTRATION RENEWAL', section: 'OTHER PERMITS', status: ['OVERDUE', 'bad'], due: 'OCT 7, 2026', owner: 's-jordan', blocker: 'PAYMENT AUTHORIZATION FROM THE CLIENT', docs: [], vehicles: [] },
  'req-abc-irp': { id: 'req-abc-irp', client: 'c-abc', title: 'IRP APPORTIONED REGISTRATION · UNIT 1', section: 'TAGS / REGISTRATION', status: ['UNDER REVIEW', 'gold'], due: 'OCT 20, 2026', owner: 's-jordan', blocker: null, docs: ['doc-abc-irp'], vehicles: ['v-abc-1'] },
  'req-dh-ifta': { id: 'req-dh-ifta', client: 'c-dh', title: 'IFTA LICENSE & 2027 DECALS', section: 'FUEL / ROAD TAX PERMITS', status: ['AWAITING AGENCY', 'gold'], due: 'DEC 15, 2026', owner: 's-jordan', blocker: null, docs: ['doc-dh-permit'], vehicles: ['v-dh-12'] },
  'req-mt-boc3': { id: 'req-mt-boc3', client: 'c-mt', title: 'BOC-3 PROCESS AGENT FILING', section: 'BOC-3', status: ['PARTNER PENDING', 'mute'], due: '—', owner: null, blocker: 'BOC-3 IS A PARTNER / MANUAL WORKFLOW UNTIL A PROVIDER IS READY', docs: [], vehicles: [] },
  'req-abc-llc': { id: 'req-abc-llc', client: 'c-abc', title: 'LLC ANNUAL REPORT · FLORIDA', section: 'LLC / INC', status: ['IN PROGRESS', 'gold'], due: 'NOV 1, 2026', owner: 's-jordan', blocker: null, docs: [], vehicles: [] },
  'req-tk-os': { id: 'req-tk-os', client: 'c-tk', title: 'OVERSIZE TRIP PERMIT · GA → AL', section: 'OTHER PERMITS', status: ['COMPLETED', 'ok'], due: 'OCT 2, 2026', owner: 's-jordan', blocker: null, docs: [], vehicles: ['v-tk-07'] },
};

/* ── COMPLIANCE (Deadline / RenewalRecord — no compliance case model yet) ── */
const DUES = {
  'dl-abc-med': { id: 'dl-abc-med', client: 'c-abc', what: 'DRIVER MEDICAL CARD · TERRENCE HOLT', kind: 'DRIVER CREDENTIAL', due: 'OCT 29, 2026', state: ['DUE SOON', 'gold'], days: 21, links: ['driver:d-abc-1', 'vehicle:v-abc-1'] },
  'dl-abc-insp': { id: 'dl-abc-insp', client: 'c-abc', what: 'ANNUAL DOT INSPECTION · UNIT 1', kind: 'VEHICLE', due: 'NOV 2, 2026', state: ['DUE SOON', 'gold'], days: 25, links: ['vehicle:v-abc-1'] },
  'dl-dh-pol': { id: 'dl-dh-pol', client: 'c-dh', what: 'INSURANCE POLICY RENEWAL', kind: 'COVERAGE', due: 'OCT 14, 2026', state: ['DUE SOON', 'warn'], days: 6, links: ['policy:pol-dh', 'vehicle:v-dh-12'] },
  'dl-rj-ucr': { id: 'dl-rj-ucr', client: 'c-rj', what: 'UCR REGISTRATION', kind: 'REGISTRATION', due: 'OCT 7, 2026', state: ['OVERDUE', 'bad'], days: -1, links: ['request:req-rj-ucr'] },
  'dl-tk-09': { id: 'dl-tk-09', client: 'c-tk', what: 'OUT-OF-SERVICE REPAIRS · UNIT 09', kind: 'VEHICLE', due: 'BEFORE NEXT DISPATCH', state: ['BLOCKING DISPATCH', 'bad'], days: 0, links: ['vehicle:v-tk-09', 'ticket:t-tk-2'] },
  'dl-rl-cq': { id: 'dl-rl-cq', client: 'c-rl', what: 'DRUG & ALCOHOL CLEARINGHOUSE ANNUAL QUERY', kind: 'DRIVER PROGRAM', due: 'DEC 1, 2026', state: ['UPCOMING', 'mute'], days: 54, links: ['driver:d-rl-1'] },
};

/* ── DISPATCH (Load) ── */
const LOADS = {
  'ld-5520': { id: 'ld-5520', client: 'c-tk', ref: 'LOAD 5520', lane: 'ATLANTA, GA → DALLAS, TX', status: ['IN TRANSIT', 'gold'], col: 'MOVING', pickup: 'OCT 7', delivery: 'OCT 9', vehicle: 'v-tk-07', driver: 'd-tk-1', rate: '$3,150', owner: 's-dev', exception: null },
  'ld-5521': { id: 'ld-5521', client: 'c-tk', ref: 'LOAD 5521', lane: 'DALLAS, TX → MEMPHIS, TN', status: ['BOOKED', 'mute'], col: 'BOOKED', pickup: 'OCT 10', delivery: 'OCT 11', vehicle: 'v-tk-07', driver: 'd-tk-1', rate: '$2,400', owner: 's-dev', exception: null },
  'ld-5518': { id: 'ld-5518', client: 'c-tk', ref: 'LOAD 5518', lane: 'SAVANNAH, GA → CHARLOTTE, NC', status: ['POD NEEDED', 'warn'], col: 'DELIVERED', pickup: 'OCT 3', delivery: 'OCT 4', vehicle: 'v-tk-07', driver: 'd-tk-1', rate: '$2,850', owner: 's-dev', exception: 'PROOF OF DELIVERY NOT UPLOADED — FACTORING SUBMISSION WAITS ON IT' },
  'ld-5517': { id: 'ld-5517', client: 'c-tk', ref: 'LOAD 5517', lane: 'MACON, GA → BIRMINGHAM, AL', status: ['ISSUE', 'bad'], col: 'ISSUE', pickup: 'OCT 6', delivery: 'OCT 6', vehicle: 'v-tk-09', driver: null, rate: '$1,320', owner: 's-dev', exception: 'TRUCK PLACED OUT OF SERVICE AT PICKUP — LOAD NEEDS A NEW TRUCK OR A CANCELLATION' },
  'ld-5501': { id: 'ld-5501', client: 'c-tk', ref: 'LOAD 5501', lane: 'JACKSONVILLE, FL → ATLANTA, GA', status: ['COMPLETE', 'ok'], col: 'DELIVERED', pickup: 'SEP 30', delivery: 'OCT 1', vehicle: 'v-tk-07', driver: 'd-tk-1', rate: '$1,980', owner: 's-dev', exception: null },
};

/* ── BROKERAGE (PAUSED — business activation required; demo records only) ── */
const SHIPMENTS = {
  'sh-4471': { id: 'sh-4471', client: 'c-rj', ref: 'LOAD 4471', shipper: 'SAMPLE SHIPPER · NORTHGATE SUPPLY', lane: 'NASHVILLE, TN → COLUMBUS, OH', status: ['RATE CONFIRMATION UNSIGNED', 'bad'], carrier: 'R&J TRUCKING', margin: '$412 (FOUNDER · FINANCE ONLY)', owner: 's-alex' },
  'sh-4468': { id: 'sh-4468', client: 'c-rj', ref: 'QUOTE 4468', shipper: 'SAMPLE SHIPPER · LAKEPORT GOODS', lane: 'KNOXVILLE, TN → ATLANTA, GA', status: ['QUOTE SENT', 'gold'], carrier: '—', margin: '—', owner: 's-alex' },
};

/* ── FACTORING (partner referral — not direct funding) ── */
const SUBMISSIONS = {
  'fs-2210': { id: 'fs-2210', client: 'c-tk', ref: 'SUBMISSION 2210', invoice: 'FREIGHT INVOICE 5518 · $2,850', status: ['DOCUMENTS NEEDED', 'warn'], provider: 'T&K’S EXISTING PROVIDER', load: 'ld-5518', blocker: 'POD FOR LOAD 5518' },
  'fs-2207': { id: 'fs-2207', client: 'c-tk', ref: 'SUBMISSION 2207', invoice: 'FREIGHT INVOICE 5501 · $1,980', status: ['FUNDED', 'ok'], provider: 'T&K’S EXISTING PROVIDER', load: 'ld-5501', blocker: null },
};

/* ── BOOKKEEPING (Essentials · Plus · All In One Bookkeeping; seed-only today) ── */
const SUBSCRIPTIONS = {
  'bk-rl': { id: 'bk-rl', client: 'c-rl', pkg: 'PLUS', status: ['ACTIVE', 'ok'], cycle: 'cy-rl-sep', owner: 's-kayla' },
  'bk-dh': { id: 'bk-dh', client: 'c-dh', pkg: 'ESSENTIALS', status: ['ONBOARDING', 'gold'], cycle: 'cy-dh-sep', owner: 's-kayla' },
  'bk-tk': { id: 'bk-tk', client: 'c-tk', pkg: 'ALL IN ONE BOOKKEEPING', status: ['ACTIVE', 'ok'], cycle: 'cy-tk-sep', owner: 's-kayla' },
  'bk-rj': { id: 'bk-rj', client: 'c-rj', pkg: 'ESSENTIALS', status: ['PAST DUE', 'bad'], cycle: null, owner: 's-kayla' },
};
const CYCLE_STEPS = ['PERIOD OPEN', 'DOCUMENTS REQUESTED', 'DOCUMENTS RECEIVED', 'CATEGORIZED', 'RECONCILIATION', 'STAFF REVIEW', 'REPORTS PREPARED', 'REPORTS DELIVERED', 'PERIOD COMPLETE'];
const CYCLES = {
  'cy-rl-sep': { id: 'cy-rl-sep', client: 'c-rl', period: 'SEPTEMBER 2026', step: 4, status: ['RECONCILIATION', 'gold'], due: 'OCT 15' },
  'cy-tk-sep': { id: 'cy-tk-sep', client: 'c-tk', period: 'SEPTEMBER 2026', step: 3, status: ['QUESTIONS FOR CUSTOMER', 'warn'], due: 'OCT 15', question: '3 UNCATEGORIZED FUEL CARD CHARGES' },
  'cy-dh-sep': { id: 'cy-dh-sep', client: 'c-dh', period: 'SEPTEMBER 2026', step: 1, status: ['DOCUMENTS REQUESTED', 'gold'], due: 'OCT 20' },
};

/* ── MECHANIC / MAINTENANCE (FleetCare tickets; providers own the work) ── */
const TICKETS = {
  't-rl-1': { id: 't-rl-1', client: 'c-rl', vehicle: 'v-rl-104', ref: 'TICKET 3307', issue: 'AIR BRAKE LEAK · REAR AXLE', status: ['AWAITING PARTS', 'warn'], provider: 'p-i35', urgency: 'SOON' },
  't-tk-2': { id: 't-tk-2', client: 'c-tk', vehicle: 'v-tk-09', ref: 'TICKET 3311', issue: 'OUT-OF-SERVICE REPAIRS · LIGHTING AND TIRES', status: ['AWAITING CUSTOMER AUTHORIZATION', 'warn'], provider: 'p-peach', urgency: 'TODAY' },
  't-abc-1': { id: 't-abc-1', client: 'c-abc', vehicle: 'v-abc-2', ref: 'TICKET 3315', issue: 'PREVENTIVE MAINTENANCE · 15,000-MILE SERVICE', status: ['SCHEDULED', 'ok'], provider: 'p-gulf', urgency: 'ROUTINE' },
};
const PROVIDERS = {
  'p-i35': { id: 'p-i35', name: 'SAMPLE PROVIDER · I-35 TRUCK & TRAILER', where: 'DALLAS, TX', verify: ['AIO VERIFIED', 'ok'] },
  'p-peach': { id: 'p-peach', name: 'SAMPLE PROVIDER · PEACH STATE DIESEL', where: 'MACON, GA', verify: ['AIO VERIFIED', 'ok'] },
  'p-gulf': { id: 'p-gulf', name: 'SAMPLE PROVIDER · GULF COAST FLEET SERVICE', where: 'TAMPA, FL', verify: ['PENDING REVIEW', 'gold'] },
};

/* ── ROAD READY (no engagement state yet: AVAILABLE ≠ ACTIVE) ── */
const PROFILES = {
  'rr-hf': { id: 'rr-hf', client: 'c-hf', mode: ['ATTENTION REQUIRED', 'bad'], done: 5, total: 9, items: [['OPERATING AUTHORITY ACTIVE', 'ACTION NEEDED', 'bad'], ['BOC-3 ON FILE', 'COMPLETED', 'ok'], ['INSURANCE FILED WITH FMCSA', 'COMPLETED', 'ok'], ['UCR REGISTRATION', 'COMPLETED', 'ok'], ['IFTA LICENSE', 'COMPLETED', 'ok'], ['DRUG & ALCOHOL CONSORTIUM', 'NEEDS REVIEW', 'gold'], ['CLEARINGHOUSE REGISTRATION', 'NOT STARTED', 'mute'], ['DRIVER QUALIFICATION FILES', 'IN PROGRESS', 'gold'], ['EIN LETTER', 'COMPLETED', 'ok']] },
  'rr-abc': { id: 'rr-abc', client: 'c-abc', mode: ['MONITORING', 'ok'], done: 8, total: 9, items: [['OPERATING AUTHORITY ACTIVE', 'COMPLETED', 'ok'], ['BOC-3 ON FILE', 'COMPLETED', 'ok'], ['INSURANCE FILED WITH FMCSA', 'COMPLETED', 'ok'], ['UCR REGISTRATION', 'COMPLETED', 'ok'], ['IRP REGISTRATION · UNIT 1', 'IN PROGRESS', 'gold'], ['DRUG & ALCOHOL CONSORTIUM', 'COMPLETED', 'ok'], ['CLEARINGHOUSE REGISTRATION', 'COMPLETED', 'ok'], ['DRIVER QUALIFICATION FILES', 'COMPLETED', 'ok'], ['EIN LETTER', 'COMPLETED', 'ok']] },
  'rr-mt': { id: 'rr-mt', client: 'c-mt', mode: ['ONBOARDING · CLIENT NOT ACTIVE', 'mute'], done: 1, total: 9, items: [['EIN LETTER', 'COMPLETED', 'ok'], ['BOC-3 ON FILE', 'PARTNER PENDING', 'mute'], ['OPERATING AUTHORITY ACTIVE', 'NOT STARTED', 'mute']] },
};

/* ── DOCUMENTS & VAULT (each document is STAFF ONLY or CLIENT-VISIBLE) ── */
const DOCS = {
  'doc-dh-coi': { id: 'doc-dh-coi', client: 'c-dh', title: 'CERTIFICATE OF INSURANCE 2025–26', type: 'PDF', vis: 'client', status: ['ON FILE', 'ok'], owner: 'policy:pol-dh', added: 'OCT 15, 2025' },
  'doc-dh-dec': { id: 'doc-dh-dec', client: 'c-dh', title: 'POLICY DECLARATIONS PAGE', type: 'PDF', vis: 'internal', status: ['ON FILE', 'ok'], owner: 'policy:pol-dh', added: 'OCT 15, 2025' },
  'doc-dh-permit': { id: 'doc-dh-permit', client: 'c-dh', title: 'IFTA LICENSE APPLICATION', type: 'PDF', vis: 'client', status: ['APPROVED', 'ok'], owner: 'request:req-dh-ifta', added: '6 HRS AGO' },
  'doc-hf-ein': { id: 'doc-hf-ein', client: 'c-hf', title: 'EIN CONFIRMATION LETTER (CP 575)', type: '—', vis: 'client', status: ['REQUESTED · NOT RECEIVED', 'bad'], owner: 'request:req-hf-mc', added: 'REQUESTED OCT 6' },
  'doc-rj-ren': { id: 'doc-rj-ren', client: 'c-rj', title: 'INSURANCE RENEWAL (CLIENT UPLOAD)', type: 'PDF', vis: 'client', status: ['UPLOADED · UNDER REVIEW', 'gold'], owner: 'policy:pol-rj', added: '5 HRS AGO' },
  'doc-abc-coi': { id: 'doc-abc-coi', client: 'c-abc', title: 'CERTIFICATE OF INSURANCE 2026–27', type: 'PDF', vis: 'client', status: ['ON FILE', 'ok'], owner: 'policy:pol-abc', added: 'MAR 30, 2026' },
  'doc-abc-irp': { id: 'doc-abc-irp', client: 'c-abc', title: 'IRP CAB CARD APPLICATION · UNIT 1', type: 'PDF', vis: 'internal', status: ['UNDER REVIEW', 'gold'], owner: 'request:req-abc-irp', added: 'OCT 5, 2026' },
  'doc-abc-med': { id: 'doc-abc-med', client: 'c-abc', title: 'MEDICAL EXAMINER’S CERTIFICATE · T. HOLT', type: 'PDF', vis: 'internal', status: ['EXPIRES OCT 29', 'warn'], owner: 'driver:d-abc-1', added: 'OCT 29, 2024' },
  'doc-tk-1': { id: 'doc-tk-1', client: 'c-tk', title: 'FUEL RECEIPTS · SEPTEMBER (UNIT 07)', type: 'ZIP', vis: 'client', status: ['UPLOADED · UNDER REVIEW', 'gold'], owner: 'quarter:ifta-tk-q3', added: '3 HRS AGO' },
  'doc-tk-2': { id: 'doc-tk-2', client: 'c-tk', title: 'BILL OF LADING · LOAD 5518', type: 'PDF', vis: 'client', status: ['UPLOADED · UNDER REVIEW', 'gold'], owner: 'load:ld-5518', added: '3 HRS AGO' },
  'doc-tk-3': { id: 'doc-tk-3', client: 'c-tk', title: 'REPAIR ESTIMATE · UNIT 09', type: 'PDF', vis: 'client', status: ['UPLOADED · UNDER REVIEW', 'gold'], owner: 'ticket:t-tk-2', added: '3 HRS AGO' },
  'doc-rl-q3': { id: 'doc-rl-q3', client: 'c-rl', title: 'Q3 2026 IFTA WORKSHEET', type: 'XLSX', vis: 'internal', status: ['DRAFT', 'gold'], owner: 'quarter:ifta-rl-q3', added: 'YESTERDAY' },
};

/* ── MESSAGES (client conversations and internal notes, drawn distinctly) ── */
const THREADS = {
  'th-mt': { id: 'th-mt', client: 'c-mt', subject: 'WHEN WILL MY AUTHORITY BE ACTIVE?', status: ['WAITING ON STAFF', 'warn'], msgs: [['client', 'OWEN MASON', 'HI — WE SENT EVERYTHING LAST WEEK. WHEN WILL OUR AUTHORITY BE ACTIVE?', '1 HR AGO'], ['internal', 'JORDAN LEE', 'INTERNAL NOTE: BOC-3 IS PARTNER-PENDING. DO NOT PROMISE A DATE.', '40 MIN AGO']] },
  'th-dh': { id: 'th-dh', client: 'c-dh', subject: 'RENEWAL OPTIONS FOR OCTOBER', status: ['WAITING ON CLIENT', 'gold'], msgs: [['staff', 'MARIA SANTOS', 'YOUR RENEWAL OPTIONS ARE READY. I’LL SEND THE SUMMARY TODAY.', 'YESTERDAY'], ['client', 'MARCUS DELL', 'THANKS — PLEASE KEEP THE SAME CARGO LIMIT.', 'YESTERDAY']] },
  'th-tk': { id: 'th-tk', client: 'c-tk', subject: 'SEPTEMBER BOOKS · 3 QUESTIONS', status: ['WAITING ON CLIENT', 'gold'], msgs: [['staff', 'KAYLA BROOKS', 'THREE FUEL CARD CHARGES NEED A CATEGORY. CAN YOU CONFIRM?', '2 DAYS AGO']] },
};

/* ── GROWTH / CRM (by grant) ── */
const LEADS = {
  'ld-crm-1': { id: 'ld-crm-1', name: 'BLUE MESA CARRIERS', stage: ['NEW', 'gold'], need: 'NEW AUTHORITY + IFTA', source: 'WEBSITE', follow: 'TODAY' },
  'ld-crm-2': { id: 'ld-crm-2', name: 'NORTHLINE HAULERS', stage: ['CONTACTED', 'mute'], need: 'BOOKKEEPING · PLUS', source: 'REFERRAL', follow: 'OCT 10' },
  'ld-crm-3': { id: 'ld-crm-3', name: 'COPPER STATE LOGISTICS', stage: ['QUOTED', 'ok'], need: 'DISPATCH + FACTORING REFERRAL', source: 'PHONE', follow: 'OCT 12' },
  'ld-crm-4': { id: 'ld-crm-4', name: 'PRAIRIE WIND TRANSPORT', stage: ['FOLLOW-UP OVERDUE', 'bad'], need: 'INSURANCE ASSISTANCE', source: 'WEBSITE', follow: 'OCT 6' },
};

/* ── BILLING (by grant) ── */
const INVOICES = {
  'inv-3301': { id: 'inv-3301', client: 'c-tk', ref: 'INVOICE 3301', what: 'DISPATCH SERVICE · SEPTEMBER', amount: '$1,240.00', status: ['PAID', 'ok'], date: 'OCT 7, 2026' },
  'inv-3305': { id: 'inv-3305', client: 'c-rj', ref: 'INVOICE 3305', what: 'BOOKKEEPING · ESSENTIALS · SEPTEMBER', amount: '$295.00', status: ['PAST DUE', 'bad'], date: 'SEP 15, 2026' },
  'inv-3308': { id: 'inv-3308', client: 'c-dh', ref: 'INVOICE 3308', what: 'IFTA LICENSE & DECALS SERVICE', amount: '$185.00', status: ['SENT', 'gold'], date: 'OCT 6, 2026' },
  'inv-3309': { id: 'inv-3309', client: 'c-rl', ref: 'INVOICE 3309', what: 'BOOKKEEPING · PLUS · SEPTEMBER', amount: '$495.00', status: ['DRAFT', 'mute'], date: '—' },
};

/* ── SERVICE CATALOG: the live activation matrix (src/infrastructure/serviceActivation.ts) ── */
const SERVICES = [
  ['PERMITTING', 'ACTIVE', 'ok', 'START SERVICE REQUEST (DEMO PERSISTENCE)'],
  ['TAG SERVICES', 'ACTIVE', 'ok', 'REQUEST INFORMATION'],
  ['FUEL TAX (IFTA)', 'INTERNAL ONLY', 'gold', 'STAFF WORKFLOW — MANUAL FILING; NO GOVERNMENT API'],
  ['ROAD / USE TAX', 'INTERNAL ONLY', 'gold', 'STAFF WORKFLOW'],
  ['AUTHORITY SERVICES', 'ACTIVE', 'ok', 'START ROAD READY / SERVICE REQUEST'],
  ['BOC-3', 'PARTNER PENDING', 'mute', 'PARTNER / MANUAL WORKFLOW UNTIL A PROVIDER IS READY'],
  ['BUSINESS FORMATION', 'ACTIVE', 'ok', 'START INTAKE'],
  ['DISPATCHING', 'ACTIVE', 'ok', 'MANUAL LOAD ENTRY WITHOUT A LOAD BOARD'],
  ['BROKERAGE', 'PAUSED', 'bad', 'BUSINESS ACTIVATION REQUIRED · AUTHORITY / LICENSING SEPARATE'],
  ['FACTORING (PARTNER)', 'PARTNER PENDING', 'mute', 'PARTNER REFERRAL — NOT DIRECT FUNDING'],
  ['INSURANCE (REFERRAL)', 'PARTNER PENDING', 'mute', 'ASSISTANCE / REFERRAL — NO BIND WITHOUT LICENSING'],
  ['BOOKKEEPING', 'ACTIVE', 'ok', 'ESSENTIALS · PLUS · ALL IN ONE BOOKKEEPING (SEED DATA TODAY)'],
];

/* ── INTAKE: migration cases (lifecycle from the migration model — staff preparation stops at PREBUILT) ── */
const MIG_LIFE = [
  ['KNOWN_UNMIGRATED', 'KNOWN · NOT MIGRATED'],
  ['INTAKE_IN_PROGRESS', 'INTAKE IN PROGRESS'],
  ['MIGRATION_IN_PROGRESS', 'MIGRATION IN PROGRESS'],
  ['MIGRATION_REVIEW_REQUIRED', 'REVIEW REQUIRED'],
  ['PREBUILT', 'PREBUILT · NOT ACTIVE YET'],
  ['CLIENT_CONFIRMATION_REQUIRED', 'AWAITING CLIENT CONFIRMATION'],
  ['ACTIVE', 'ACTIVE · CLIENT CONFIRMED'],
];
const MIG_CASES = {
  'mig-sr': { id: 'mig-sr', name: 'SUMMIT RIDGE HAULING LLC', branch: 'existing', life: 'MIGRATION_REVIEW_REQUIRED', stage: ['FOUNDER REVIEW', 'gold'], screen: 'AIO-MIG-EXISTING-REVIEW-001', files: 14, found: '1 COMPANY · 3 PEOPLE · 4 VEHICLES · 9 DOCUMENTS', conflicts: 0, owner: 's-jordan', started: 'OCT 5', client: null, section: 'review', source: 'PREVIOUS PROVIDER EXPORT (XLSX + PDF)' },
  'mig-bl': { id: 'mig-bl', name: 'BLUELINE TRANSPORT', branch: 'existing', life: 'MIGRATION_REVIEW_REQUIRED', stage: ['2 CONFLICTS', 'bad'], screen: 'AIO-MIG-EXISTING-CONFLICTS-001', files: 22, found: '1 COMPANY · 5 PEOPLE · 6 VEHICLES · 14 DOCUMENTS', conflicts: 2, owner: 's-jordan', started: 'OCT 6', client: null, section: 'match', source: 'SAMSARA EXPORT + SCANNED PERMITS' },
  'mig-lv': { id: 'mig-lv', name: 'LAKEVIEW DISTRIBUTION CO.', branch: 'new', life: 'INTAKE_IN_PROGRESS', stage: ['EXTRACTING', 'gold'], screen: 'AIO-MIG-NEW-EXTRACT-001', files: 9, found: 'READING 9 FILES', conflicts: 0, owner: 's-maria', started: 'TODAY', client: null, section: 'extraction', source: 'NEW CLIENT UPLOADS (PDF)' },
  'mig-b07': { id: 'mig-b07', name: 'BATCH 07 · ACCOUNTANT HAND-OFF', branch: 'bulk', life: 'MIGRATION_REVIEW_REQUIRED', stage: ['DETECTION SUMMARY', 'gold'], screen: 'AIO-MIG-BATCH-SUMMARY-001', files: 61, found: '5 CLIENTS DETECTED · 1 POSSIBLE DUPLICATE', conflicts: 1, owner: 's-alex', started: 'OCT 7', client: null, section: 'status', source: 'ACCOUNTANT ZIP (CSV + PDF)' },
  'mig-mt': { id: 'mig-mt', name: 'MASON TRANSPORT', branch: 'new', life: 'PREBUILT', stage: ['PREBUILT · NOT ACTIVE YET', 'mute'], screen: 'AIO-MIG-NEW-PREBUILT-001', files: 7, found: '1 COMPANY · 1 PERSON · 2 VEHICLES · 4 DOCUMENTS', conflicts: 0, owner: 's-jordan', started: 'OCT 2', client: 'c-mt', section: 'prebuilt', source: 'NEW CLIENT UPLOADS (PDF)' },
  'mig-hc': { id: 'mig-hc', name: 'HEARTLAND FREIGHT CO.', branch: 'existing', life: 'CLIENT_CONFIRMATION_REQUIRED', stage: ['INVITED · AWAITING CLIENT', 'gold'], screen: 'AIO-MIG-EXISTING-INVITED-001', files: 18, found: '1 COMPANY · 4 PEOPLE · 7 VEHICLES · 11 DOCUMENTS', conflicts: 0, owner: 's-jordan', started: 'SEP 29', client: 'c-hc', section: 'activation', source: 'PREVIOUS PROVIDER EXPORT (CSV)', invited: 'OCT 6' },
  'mig-rl': { id: 'mig-rl', name: 'RIVERSTONE LOGISTICS', branch: 'existing', life: 'ACTIVE', stage: ['ACTIVE · CLIENT CONFIRMED', 'ok'], screen: 'AIO-MIG-EXISTING-INVITED-001', files: 26, found: '1 COMPANY · 6 PEOPLE · 6 VEHICLES · 19 DOCUMENTS', conflicts: 0, owner: 's-jordan', started: 'AUG 4', client: 'c-rl', section: 'history', source: 'PREVIOUS PROVIDER EXPORT (XLSX)', confirmed: 'AUG 14, 2026' },
  'mig-tk': { id: 'mig-tk', name: 'T&K TRANSPORT', branch: 'bulk', life: 'ACTIVE', stage: ['ACTIVE · CLIENT CONFIRMED', 'ok'], screen: 'AIO-MIG-BATCH-COMPLETE-001', files: 31, found: '1 COMPANY · 9 PEOPLE · 9 VEHICLES · 22 DOCUMENTS', conflicts: 0, owner: 's-alex', started: 'AUG 20', client: 'c-tk', section: 'history', source: 'BATCH 05', confirmed: 'SEP 2, 2026' },
};

/* ── HOME: the full lists behind the approved HOME cards (the root shows 5 of 7) ── */
const HOME_LISTS = {
  attention: [
    ['URGENT', 'bad', 'rec/policy/pol-dh', 'c-dh', 'INSURANCE POLICY EXPIRES IN 6 DAYS', 'insurance', 'TODAY'],
    ['URGENT', 'bad', 'rec/request/req-hf-mc', 'c-hf', 'WORKFLOW BLOCKED — EIN LETTER NOT RECEIVED', 'permitting', '2 DAYS'],
    ['HIGH', 'warn', 'more/documents_vault@c-tk', 'c-tk', '3 DOCUMENTS UPLOADED FOR REVIEW', 'documents', '3 HRS'],
    ['HIGH', 'warn', 'rec/quarter/ifta-rl-q3', 'c-rl', 'Q3 2026 IFTA RETURN READY FOR REVIEW', 'filing', '5 HRS'],
    ['HIGH', 'warn', 'rec/thread/th-mt', 'c-mt', 'CLIENT IS WAITING ON A REPLY', 'messages', '1 HR'],
    ['HIGH', 'warn', 'rec/load/ld-5517', 'c-tk', 'LOAD 5517 — TRUCK PLACED OUT OF SERVICE AT PICKUP', 'dispatch', 'YESTERDAY'],
    ['NORMAL', 'gold', 'rec/deadline/dl-abc-med', 'c-abc', 'DRIVER MEDICAL CARD EXPIRES OCT 29', 'compliance', '2 DAYS'],
  ],
  deadlines: [
    ['OVERDUE', 'bad', 'rec/request/req-rj-ucr', 'c-rj', 'UCR REGISTRATION RENEWAL', 'permitting', 'OCT 7 · 1 DAY LATE'],
    ['TODAY', 'warn', 'rec/policy/pol-dh', 'c-dh', 'SEND RENEWAL QUOTE TO THE CLIENT', 'insurance', 'OCT 8'],
    ['SOON', 'gold', 'rec/request/req-hf-mc', 'c-hf', 'MC AUTHORITY REINSTATEMENT FILING', 'permitting', 'OCT 10'],
    ['SOON', 'gold', 'rec/quarter/ifta-rl-q3', 'c-rl', 'Q3 2026 IFTA — CLIENT APPROVAL', 'filing', 'OCT 13'],
  ],
  blocked: [
    ['BLOCKED', 'bad', 'rec/request/req-hf-mc', 'c-hf', 'MC REINSTATEMENT — EIN LETTER NOT RECEIVED', 'permitting', '2 DAYS', 'WAITING ON THE CLIENT'],
    ['BLOCKED', 'bad', 'rec/shipment/sh-4471', 'c-rj', 'LOAD 4471 — RATE CONFIRMATION NOT SIGNED', 'brokerage', '1 DAY', 'WAITING ON A CARRIER'],
  ],
};

/* ── record lookup: every record knows its lane, title and client ── */
const RECORD_TYPES = {
  vehicle: { table: VEHICLES, lane: 'vehicles', title: (r) => `${r.unit} · ${r.ymm}` },
  driver: { table: DRIVERS, lane: 'drivers', title: (r) => r.name },
  application: { table: APPLICATIONS, lane: 'drivers', title: (r) => r.job },
  policy: { table: POLICIES, lane: 'insurance', title: (r) => r.title },
  quarter: { table: QUARTERS, lane: 'filing', title: (r) => `IFTA ${r.q}` },
  request: { table: REQUESTS, lane: 'permitting', title: (r) => r.title },
  deadline: { table: DUES, lane: 'compliance', title: (r) => r.what },
  load: { table: LOADS, lane: 'dispatch', title: (r) => `${r.ref} · ${r.lane}` },
  shipment: { table: SHIPMENTS, lane: 'brokerage', title: (r) => `${r.ref} · ${r.lane}` },
  submission: { table: SUBMISSIONS, lane: 'factoring', title: (r) => r.ref },
  subscription: { table: SUBSCRIPTIONS, lane: 'bookkeeping', title: (r) => `BOOKKEEPING · ${r.pkg}` },
  cycle: { table: CYCLES, lane: 'bookkeeping', title: (r) => `${r.period} CLOSE` },
  ticket: { table: TICKETS, lane: 'maintenance', title: (r) => `${r.ref} · ${r.issue}` },
  profile: { table: PROFILES, lane: 'roadready', title: () => 'ROAD READY PROFILE' },
  document: { table: DOCS, lane: null, title: (r) => r.title },
  thread: { table: THREADS, lane: null, title: (r) => r.subject },
  invoice: { table: INVOICES, lane: null, title: (r) => `${r.ref} · ${r.what}` },
};
/** What each record type is called where it is worked — the lane (or MORE entry) that owns it. */
const OWNER_LABEL = { vehicle: 'VEHICLES & FLEET', driver: 'DRIVERS & CARRIERS', application: 'DRIVERS & CARRIERS · MATCHING', policy: 'INSURANCE', quarter: 'FILING & FUEL TAXES', request: 'PERMITTING & AUTHORITIES', deadline: 'COMPLIANCE', load: 'DISPATCH', shipment: 'BROKERAGE', submission: 'FACTORING', subscription: 'BOOKKEEPING', cycle: 'BOOKKEEPING', ticket: 'MECHANIC / MAINTENANCE', profile: 'ROAD READY', document: 'DOCUMENTS & VAULT', thread: 'MESSAGES', invoice: 'BILLING' };
const OWNER_ICON = { vehicle: 'truck', driver: 'steering', application: 'steering', policy: 'umbrella', quarter: 'fuel', request: 'id-card', deadline: 'shield-check', load: 'pin', shipment: 'link', submission: 'cash', subscription: 'calculator', cycle: 'calculator', ticket: 'wrench', profile: 'tests', document: 'folder', thread: 'letter', invoice: 'summary' };
/** A record's status word + tone (the first [WORD, tone] field it carries). */
const statusWord = (r) => [r.status, r.bucket, r.state, r.avail, r.mode, r.stage, r.verify].find(Array.isArray) || null;
const rec = (type, id) => RECORD_TYPES[type]?.table[id];
