/*
 * AIO OFFICE workspace proofs — sample data added to the shared review records (../office/office-data.js).
 * ILLUSTRATIVE SAMPLE DATA ONLY: no real client, person, account or amount. Transaction amounts are sample line items,
 * never balances. Today in the review is OCT 8, 2026.
 */

/* ── VEHICLES & FLEET: body type (drives the drawing) and sample odometer ── */
const FLEET_META = {
  'v-rl-101': { cab: 'sleeper', odo: '412,880', since: 'MAR 2022' },
  'v-rl-104': { cab: 'sleeper', odo: '538,210', since: 'JUN 2020' },
  'v-dh-12': { cab: 'sleeper', odo: '301,455', since: 'JAN 2021' },
  'v-tk-07': { cab: 'sleeper', odo: '188,020', since: 'FEB 2023' },
  'v-tk-09': { cab: 'sleeper', odo: '621,700', since: 'AUG 2019' },
  'v-hf-3': { cab: 'sleeper', odo: '244,310', since: 'MAY 2022' },
  'v-abc-1': { cab: 'sleeper', odo: '356,900', since: 'APR 2021' },
  'v-abc-2': { cab: 'daycab', odo: '702,115', since: 'SEP 2018' },
};
const AVAIL_GROUP = {
  AVAILABLE: 'ready',
  'ON A LOAD': 'road',
  'SERVICE SCHEDULED': 'shop',
  'MAINTENANCE HOLD': 'shop',
  'OUT OF SERVICE': 'stop',
  'CANNOT DISPATCH · AUTHORITY INACTIVE': 'stop',
};

/* ── BOOKKEEPING: the close worktable for each client and period ── */
const BOOK_PERIODS = ['AUG 2026', 'SEP 2026', 'OCT 2026'];
const BOOK_PHASES = [
  ['collect', 'COLLECT', [0, 1, 2]],
  ['reconcile', 'RECONCILE', [3, 4]],
  ['review', 'REVIEW', [5, 6]],
  ['deliver', 'DELIVER', [7, 8]],
];
const doc = (id, name, source, status, date, link = null) => ({ id, name, source, status, date, link });
const BOOKS = {
  'c-tk': {
    sub: 'bk-tk',
    periods: {
      'AUG 2026': { step: 8, due: 'SEP 15', closed: 'SEP 14', docs: [doc('a1', 'OPERATING ACCOUNT STATEMENT', 'BANK', 'RECEIVED', 'SEP 2'), doc('a2', 'FUEL CARD STATEMENT', 'CARD PROVIDER', 'RECEIVED', 'SEP 2'), doc('a3', 'FUEL RECEIPTS · UNITS 07 AND 09', 'CLIENT UPLOAD', 'RECEIVED', 'SEP 4'), doc('a4', 'FREIGHT SETTLEMENTS', 'FACTORING PROVIDER', 'RECEIVED', 'SEP 3'), doc('a5', 'DRIVER PAY REPORT', 'CLIENT UPLOAD', 'RECEIVED', 'SEP 5')], items: [], review: 'done' },
      'SEP 2026': {
        step: 3,
        due: 'OCT 15',
        docs: [
          doc('s1', 'OPERATING ACCOUNT STATEMENT', 'BANK', 'RECEIVED', 'OCT 3'),
          doc('s2', 'FUEL CARD STATEMENT', 'CARD PROVIDER', 'RECEIVED', 'OCT 2'),
          doc('s3', 'FUEL RECEIPTS · UNIT 07', 'CLIENT UPLOAD', 'RECEIVED', 'TODAY', 'doc-tk-1'),
          doc('s4', 'FUEL RECEIPTS · UNIT 09', 'CLIENT UPLOAD', 'MISSING', 'ASKED OCT 1'),
          doc('s5', 'FREIGHT SETTLEMENTS', 'FACTORING PROVIDER', 'RECEIVED', 'OCT 2'),
          doc('s6', 'DRIVER PAY REPORT', 'CLIENT UPLOAD', 'REQUESTED', 'ASKED OCT 6'),
        ],
        items: [
          { id: 'q1', date: 'SEP 04', desc: 'TRUCK STOP · I-20 EXIT 51', acct: 'FUEL CARD ··4410', amt: '86.40', ask: 'FUEL OR SUPPLIES?', options: ['FUEL', 'SUPPLIES', 'ASK THE CLIENT'] },
          { id: 'q2', date: 'SEP 12', desc: 'TRAVEL CENTER · MACON, GA', acct: 'FUEL CARD ··4410', amt: '142.00', ask: 'REPAIR OR FUEL?', options: ['REPAIRS', 'FUEL', 'ASK THE CLIENT'] },
          { id: 'q3', date: 'SEP 21', desc: 'ONLINE MARKETPLACE', acct: 'FUEL CARD ··4410', amt: '64.99', ask: 'SUPPLIES OR PERSONAL?', options: ['SUPPLIES', 'OWNER PERSONAL', 'ASK THE CLIENT'] },
        ],
        review: 'open',
      },
      'OCT 2026': { step: 0, due: 'NOV 15', docs: [doc('o1', 'OPERATING ACCOUNT STATEMENT', 'BANK', 'NOT YET DUE', 'NOV 2'), doc('o2', 'FUEL CARD STATEMENT', 'CARD PROVIDER', 'NOT YET DUE', 'NOV 2')], items: [], review: 'open' },
    },
  },
  'c-rl': {
    sub: 'bk-rl',
    periods: {
      'AUG 2026': { step: 8, due: 'SEP 15', closed: 'SEP 12', docs: [doc('a1', 'OPERATING ACCOUNT STATEMENT', 'BANK', 'RECEIVED', 'SEP 1'), doc('a2', 'CREDIT CARD STATEMENT', 'BANK', 'RECEIVED', 'SEP 1'), doc('a3', 'FREIGHT INVOICES', 'CLIENT UPLOAD', 'RECEIVED', 'SEP 3')], items: [], review: 'done' },
      'SEP 2026': {
        step: 4,
        due: 'OCT 15',
        docs: [doc('s1', 'OPERATING ACCOUNT STATEMENT', 'BANK', 'RECEIVED', 'OCT 1'), doc('s2', 'CREDIT CARD STATEMENT', 'BANK', 'RECEIVED', 'OCT 1'), doc('s3', 'FREIGHT INVOICES', 'CLIENT UPLOAD', 'RECEIVED', 'OCT 2'), doc('s4', 'PAYROLL REPORT', 'PAYROLL PROVIDER', 'RECEIVED', 'OCT 3')],
        items: [],
        review: 'open',
      },
      'OCT 2026': { step: 0, due: 'NOV 15', docs: [doc('o1', 'OPERATING ACCOUNT STATEMENT', 'BANK', 'NOT YET DUE', 'NOV 1')], items: [], review: 'open' },
    },
  },
  'c-dh': {
    sub: 'bk-dh',
    periods: {
      'SEP 2026': {
        step: 1,
        due: 'OCT 20',
        docs: [doc('s1', 'OPERATING ACCOUNT STATEMENT', 'BANK', 'REQUESTED', 'ASKED OCT 2'), doc('s2', 'CREDIT CARD STATEMENT', 'BANK', 'REQUESTED', 'ASKED OCT 2'), doc('s3', 'FREIGHT INVOICES', 'CLIENT UPLOAD', 'MISSING', 'ASKED OCT 2'), doc('s4', 'PRIOR-YEAR TAX RETURN', 'CLIENT UPLOAD', 'RECEIVED', 'OCT 4')],
        items: [],
        review: 'open',
      },
      'OCT 2026': { step: 0, due: 'NOV 20', docs: [], items: [], review: 'open' },
    },
  },
  'c-rj': { sub: 'bk-rj', paused: true, periods: {} },
};
const REVIEW_CHECKS = ['EVERY STATEMENT RECEIVED', 'CLIENT QUESTIONS ANSWERED', 'CHARGES CATEGORIZED', 'OWNER / PERSONAL ITEMS FLAGGED', 'STAFF REVIEW SIGNED OFF'];

/* ── COMPLIANCE: three more expirations in the 90-day horizon, owners, requirements and history ── */
DUES['dl-tk-insp'] = { id: 'dl-tk-insp', client: 'c-tk', what: 'ANNUAL DOT INSPECTION · UNIT 07', kind: 'VEHICLE', due: 'NOV 18, 2026', state: ['UPCOMING', 'mute'], days: 41, links: ['vehicle:v-tk-07'] };
DUES['dl-dh-decals'] = { id: 'dl-dh-decals', client: 'c-dh', what: 'IFTA LICENSE & 2027 DECALS', kind: 'REGISTRATION', due: 'DEC 15, 2026', state: ['UPCOMING', 'mute'], days: 68, links: ['request:req-dh-ifta', 'vehicle:v-dh-12'] };
DUES['dl-rl-irp'] = { id: 'dl-rl-irp', client: 'c-rl', what: 'IRP REGISTRATION RENEWAL · UNITS 101 AND 104', kind: 'REGISTRATION', due: 'DEC 31, 2026', state: ['UPCOMING', 'mute'], days: 84, links: ['vehicle:v-rl-101', 'vehicle:v-rl-104'] };
const DUE_META = {
  'dl-rj-ucr': { owner: 's-jordan', need: 'PAY AND FILE THE UCR RENEWAL', subject: null, docs: [], hist: [['OCT 7', 'DUE DATE PASSED'], ['OCT 1', 'PAYMENT AUTHORIZATION REQUESTED FROM CLIENT'], ['SEP 15', 'RENEWAL OPENED']] },
  'dl-tk-09': { owner: 's-dev', need: 'FINISH OUT-OF-SERVICE REPAIRS BEFORE DISPATCH', subject: 'vehicle:v-tk-09', docs: ['doc-tk-3'], hist: [['3 HRS AGO', 'REPAIR ESTIMATE UPLOADED'], ['OCT 6', 'PLACED OUT OF SERVICE AT PICKUP']] },
  'dl-dh-pol': { owner: 's-alex', need: 'RENEW AUTO LIABILITY AND CARGO COVERAGE', subject: 'policy:pol-dh', docs: ['doc-dh-coi', 'doc-dh-dec'], hist: [['YESTERDAY', 'RENEWAL OPTIONS RECEIVED'], ['SEP 30', 'RENEWAL WINDOW OPENED']] },
  'dl-abc-med': { owner: 's-maria', need: 'NEW MEDICAL EXAMINER’S CERTIFICATE', subject: 'driver:d-abc-1', docs: ['doc-abc-med'], hist: [['OCT 1', 'ENTERED THE 30-DAY WINDOW'], ['OCT 29, 2024', 'CURRENT CARD ISSUED']] },
  'dl-abc-insp': { owner: 's-maria', need: 'ANNUAL DOT INSPECTION', subject: 'vehicle:v-abc-1', docs: [], hist: [['OCT 3', 'ENTERED THE 30-DAY WINDOW'], ['NOV 2, 2025', 'LAST INSPECTION PASSED']] },
  'dl-rl-cq': { owner: 's-maria', need: 'RUN THE ANNUAL CLEARINGHOUSE QUERY', subject: 'driver:d-rl-1', docs: [], hist: [['DEC 1, 2025', 'LAST QUERY · NO VIOLATIONS']] },
  'dl-tk-insp': { owner: 's-dev', need: 'ANNUAL DOT INSPECTION', subject: 'vehicle:v-tk-07', docs: [], hist: [['NOV 18, 2025', 'LAST INSPECTION PASSED']] },
  'dl-dh-decals': { owner: 's-jordan', need: 'RENEW THE IFTA LICENSE AND ORDER 2027 DECALS', subject: 'request:req-dh-ifta', docs: ['doc-dh-permit'], hist: [['6 HRS AGO', 'LICENSE APPLICATION APPROVED BY STAFF']] },
  'dl-rl-irp': { owner: 's-jordan', need: 'RENEW APPORTIONED PLATES FOR TWO UNITS', subject: 'vehicle:v-rl-101', docs: [], hist: [['JAN 2, 2026', 'CURRENT CAB CARDS ISSUED']] },
};
const KIND_LANE = { VEHICLE: 'VEHICLES', 'DRIVER CREDENTIAL': 'DRIVERS', 'DRIVER PROGRAM': 'DRIVERS', COVERAGE: 'COVERAGE', REGISTRATION: 'REGISTRATION' };

/* ── CLIENT 360: relationship facts ── */
const CLIENT_META = {
  'c-rl': { since: 'AUG 2026', via: 'MIGRATED FROM A PREVIOUS PROVIDER' },
  'c-dh': { since: 'MAR 2024', via: 'REFERRAL' },
  'c-tk': { since: 'SEP 2026', via: 'MIGRATED IN BATCH 05' },
  'c-hf': { since: 'JUN 2025', via: 'WEBSITE' },
  'c-rj': { since: 'NOV 2023', via: 'REFERRAL' },
  'c-abc': { since: 'APR 2021', via: 'WEBSITE' },
  'c-mt': { since: 'PREBUILT OCT 2', via: 'NEW CLIENT FILE' },
  'c-hc': { since: 'INVITED OCT 6', via: 'MIGRATION INVITE' },
};
