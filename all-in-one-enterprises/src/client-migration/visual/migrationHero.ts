import type { CSSProperties } from 'react';

/**
 * Headline copy (line breaks as drawn) and geometry for every propagated authority screen.
 * Geometry is measured on the authority PNGs in frame px: cap-top of the first line, font size from cap height
 * (Roboto / Roboto Condensed cap height = 0.711 em) and line pitch. heroStyle() converts cap tops to CSS box tops.
 */
export type HeroMetrics = {
  /** left edge of the headline column */
  x?: number;
  /** kicker: cap top, size, tracking (em) */
  k?: [number, number, number?];
  /** title: cap top of line 1, size, pitch, tracking (em) */
  t: [number, number, number, number?];
  /** subtitle: cap top of line 1, size, pitch */
  s?: [number, number, number];
  /** accent (PREBUILT box / ACTIVE WITH AIO): cap top, size */
  a?: [number, number];
};

export type HeroSpec = {
  kicker?: string;
  title: string[];
  sub: string[];
  accent?: string;
  accentBox?: boolean;
  gold?: number[];
  thin?: number[];
  /** authority top of the first panel (frame px) */
  top: number;
  m: HeroMetrics;
};

const ASC = 0.928;
const CONTENT = 1.172;
const CAP = 0.711;

/** Box top of a line box whose cap top sits at `cap` (Roboto vertical metrics). */
function boxTop(cap: number, size: number, pitch: number): number {
  return +(cap - ((pitch - CONTENT * size) / 2 + (ASC - CAP) * size)).toFixed(2);
}

export function heroStyle(m: HeroMetrics): CSSProperties {
  const v: Record<string, string | number> = {};
  if (m.x != null) v['--hx'] = m.x;
  if (m.k) {
    const [cap, size, track] = m.k;
    v['--k-top'] = boxTop(cap, size, size);
    v['--k-size'] = size;
    if (track != null) v['--k-track'] = `${track}em`;
  }
  const [tc, ts, tp, tt] = m.t;
  v['--t-top'] = boxTop(tc, ts, tp);
  v['--t-size'] = ts;
  v['--t-pitch'] = tp;
  v['--t-dx'] = 0;
  if (tt != null) v['--t-track'] = `${tt}em`;
  if (m.s) {
    const [sc, ss, sp] = m.s;
    v['--s-top'] = boxTop(sc, ss, sp);
    v['--s-size'] = ss;
    v['--s-pitch'] = sp;
  }
  if (m.a) {
    const [ac, as] = m.a;
    v['--a-top'] = boxTop(ac, as, as);
    v['--a-size'] = as;
  }
  return v as CSSProperties;
}

const INTAKE = 'CLIENT MIGRATION INTAKE';
const ACTIVATION = 'CLIENT ACTIVATION';
/** existing-family kicker (cap 128) */
const KE: [number, number, number] = [128, 19.5, 0.235];
/** root-family kicker (cap 163) */
const KR: [number, number, number] = [163.5, 21, 0.185];

export const MIGRATION_HERO: Record<string, HeroSpec> = {
  // ── existing client branch (staff) ──
  upload: {
    kicker: INTAKE,
    title: ['UPLOAD', 'CLIENT FILE'],
    sub: ['Upload the current client record set', 'for the selected business. This starts', 'migration. It does not make the client active.'],
    top: 403,
    m: { x: 44, k: KE, t: [158.5, 75, 66.5], s: [293.5, 22.5, 28] },
  },
  match: {
    kicker: INTAKE,
    title: ['MATCH AND', 'CONFLICT REVIEW'],
    sub: ['We’ve matched your client’s records.', 'Review the details below, check for any', 'conflicts, and choose how to proceed.'],
    top: 413,
    m: { x: 44, k: KE, t: [160, 70.5, 63.5], s: [291, 22.5, 27] },
  },
  review: {
    kicker: INTAKE,
    title: ['FOUNDER', 'REVIEW'],
    sub: ['Review the extracted information below.', 'Nothing will be written to the profile', 'until you approve.'],
    top: 413,
    m: { x: 45, k: KE, t: [158.5, 74, 66], s: [294, 22.5, 27.5] },
  },
  conflicts: {
    kicker: INTAKE,
    title: ['ITEMS', 'NEEDING REVIEW'],
    sub: ['We found some differences between', 'your existing AIO data and the extracted', 'data. Review each item and choose', 'how to proceed.'],
    top: 413,
    m: { x: 44, k: KE, t: [160, 68.5, 63], s: [286, 22.5, 27.3] },
  },
  approval: {
    kicker: 'CLIENT MIGRATION',
    title: ['APPROVAL', 'SUMMARY'],
    sub: ['Review your client’s readiness', 'and confirm the details before', 'creating their new office.'],
    top: 413,
    m: { x: 43, k: KE, t: [159, 75, 66], s: [295, 22.5, 28] },
  },
  prebuilt: {
    kicker: INTAKE,
    title: ['PREBUILT'],
    accent: 'NOT ACTIVE YET',
    accentBox: true,
    sub: ['Your client workspace is prebuilt', 'and ready. Review the details', 'below and send an activation', 'invite when you’re ready.'],
    top: 425,
    m: { x: 44, k: KE, t: [160, 82, 82], s: [300, 22.5, 27.7], a: [246, 35] },
  },
  invite: {
    kicker: ACTIVATION,
    title: ['SEND', 'ACTIVATION', 'INVITE'],
    sub: ['Get your client into the new system', 'quickly and securely. We’ll handle', 'the setup so they can get started.'],
    top: 450,
    m: { x: 44, k: KE, t: [159, 74.5, 64.7], s: [353, 22.3, 27] },
  },
  invited: {
    kicker: INTAKE,
    title: ['INVITE SENT'],
    sub: ['Your client has been invited', 'to review and confirm their', 'information.'],
    top: 390,
    m: { x: 44, k: [130.5, 19.5, 0.235], t: [172, 79, 79], s: [246, 26.5, 31.5] },
  },

  // ── client activation (client) ──
  welcome: {
    kicker: ACTIVATION,
    title: ['HERE’S WHAT AIO', 'ALREADY KNOWS.'],
    sub: ['We already have information from', 'your existing client records, so you’re', 'reviewing your current truth —', 'not starting from a blank form.'],
    top: 413,
    m: { x: 44, k: KE, t: [167, 63.5, 59], s: [289, 22.5, 28] },
  },
  people: {
    kicker: ACTIVATION,
    title: ['PEOPLE', 'REVIEW'],
    sub: ['Review the owners and contacts', 'we already have for this client.', 'Confirm the details or flag anything', 'that needs an update.'],
    top: 413,
    m: { x: 44, k: KE, t: [158.5, 75.5, 66], s: [295, 22.5, 27] },
  },
  vehicles: {
    kicker: ACTIVATION,
    title: ['VEHICLES', 'REVIEW'],
    sub: ['Here are the vehicles already on this', 'client’s record. Review the details and', 'confirm they’re ready to activate.'],
    top: 413,
    m: { x: 43, k: KE, t: [160, 73, 66], s: [295, 22.5, 27] },
  },
  services: {
    kicker: ACTIVATION,
    title: ['ACTIVE', 'SERVICES'],
    sub: ['Review your client’s key services', 'and confirm what’s ready to activate.', 'We’ll keep everything organized', 'in one place.'],
    top: 432,
    m: { x: 43, k: KE, t: [160, 79, 69], s: [299, 22, 27.7] },
  },
  documents: {
    kicker: ACTIVATION,
    title: ['DOCUMENTS', 'WE HAVE'],
    sub: ['Here’s what we already have on file', 'for this client. Review each document', 'and let us know if it looks right.'],
    top: 402,
    m: { x: 45, k: KE, t: [159.5, 73, 66], s: [292, 22.5, 27.5] },
  },
  changed: {
    kicker: ACTIVATION,
    title: ['WHAT', 'CHANGED?'],
    sub: ['Tell us what’s different so we can', 'update your client records accurately', 'and keep everything up to date.'],
    top: 424,
    m: { x: 42, k: KE, t: [162, 76.5, 66], s: [300, 23, 29] },
  },
  confirm: {
    kicker: ACTIVATION,
    title: ['CONFIRM YOUR', 'INFORMATION'],
    sub: ['Review your existing client information', 'below. Once confirmed, we’ll activate', 'your account and make it available', 'in the new system.'],
    top: 413,
    m: { x: 44, k: KE, t: [161, 67.5, 58], s: [287, 22.5, 28] },
  },

  // ── new client branch (staff) ──
  new: {
    kicker: INTAKE,
    title: ['NEW CLIENT', 'FILE'],
    sub: ['Start a migration for a business that is', 'not yet an AIO client. This opens a prebuilt', 'path. It does not make the client active.'],
    top: 470,
    m: { x: 47, k: KR, t: [202, 89.5, 75], s: [358, 21.5, 25.5] },
  },
  'new-received': {
    kicker: INTAKE,
    title: ['FILES RECEIVED'],
    sub: ['We’ve received files for a new client.', 'Review the details below and begin', 'extraction to continue.'],
    top: 442,
    m: { x: 43, k: KR, t: [202, 90, 90], s: [287, 22.5, 28] },
  },
  'new-extract': {
    kicker: INTAKE,
    title: ['EXTRACTION AND', 'CLASSIFICATION'],
    sub: ['New client, not an existing match.', 'We’re extracting and classifying your', 'file to build your client record.'],
    top: 468,
    m: { x: 43, k: KR, t: [203, 86, 71], s: [356, 21.5, 26] },
  },
  'new-identity': {
    kicker: INTAKE,
    title: ['BUSINESS', 'IDENTITY', 'REVIEW'],
    sub: ['Let’s review your business details', 'to start building your client file.'],
    top: 482,
    m: { x: 45, k: KR, t: [200, 82.5, 72], s: [416, 21.5, 27] },
  },
  'new-records': {
    kicker: INTAKE,
    title: ['PEOPLE', 'VEHICLES', 'SERVICES', 'DOCUMENTS'],
    sub: ['Start a migration for a business that is', 'not yet an AIO client. This opens a prebuilt', 'path. It does not make the client active.'],
    top: 504,
    m: { x: 44, k: KR, t: [199, 62, 53.7], s: [420, 21, 24.5] },
  },
  'new-review': {
    kicker: INTAKE,
    title: ['FOUNDER', 'REVIEW'],
    sub: ['New client, not an existing match.', 'Review the details below and approve', 'to create a prebuilt client profile.'],
    top: 467,
    m: { x: 43, k: KR, t: [202, 89, 76], s: [358, 21.5, 25.5] },
  },
  'new-approval': {
    kicker: INTAKE,
    title: ['APPROVAL', 'SUMMARY'],
    sub: ['New client file.'],
    top: 468,
    m: { x: 43, k: [172.5, 21, 0.185], t: [208, 94, 82], s: [377, 28, 32] },
  },
  'new-prebuilt': {
    kicker: INTAKE,
    title: ['PREBUILT', 'NOT ACTIVE YET.'],
    gold: [1],
    sub: ['The office has prepared your client.', 'Review and send an activation invite', 'when ready.'],
    top: 469,
    m: { x: 44, k: KR, t: [203, 88.5, 77.5], s: [359, 21.5, 27] },
  },
  'new-invite': {
    kicker: INTAKE,
    title: ['SEND INVITE'],
    sub: ['New client who is prebuilt and', 'not active yet. Send an invitation', 'so they can complete their setup.'],
    top: 468,
    m: { x: 43, k: KR, t: [202, 88.5, 88.5], s: [296, 23, 29] },
  },
  'new-confirm': {
    kicker: INTAKE,
    title: ['CLIENT', 'CONFIRMATION', 'REQUIRED'],
    sub: ['New client.'],
    top: 468,
    m: { x: 44, k: [164.5, 21, 0.185], t: [199.5, 77, 61.5], s: [396, 28, 32] },
  },

  // ── bulk batch branch (staff) ──
  batch: {
    kicker: INTAKE,
    title: ['BULK BATCH', 'MIGRATION'],
    sub: ['Intake multiple client files in one', 'controlled batch. Each client stays', 'separately reviewable.'],
    top: 466,
    m: { x: 46, k: KR, t: [198, 85, 71], s: [352, 22, 26.5] },
  },
  'batch-received': {
    kicker: INTAKE,
    title: ['BATCH FILES', 'RECEIVED'],
    sub: ['Your files have been uploaded', 'and are ready for review. Each', 'future client stays separately', 'reviewable.'],
    top: 480,
    m: { x: 43, k: KR, t: [198, 84.5, 73], s: [351, 23, 27.3] },
  },
  'batch-processing': {
    kicker: INTAKE,
    title: ['PROCESSING AND', 'CLIENT DETECTION'],
    sub: ['We’re processing your files and', 'detecting clients in the background.', 'You can leave this screen and', 'return anytime.'],
    top: 467,
    m: { x: 43, k: KR, t: [201, 72, 62.5], s: [333, 22.5, 27.3] },
  },
  'batch-summary': {
    kicker: INTAKE,
    title: ['DETECTION', 'SUMMARY'],
    sub: ['Each client stays separately', 'reviewable. Detection does not', 'activate any client.'],
    top: 483,
    m: { x: 46, k: [182.5, 21, 0.185], t: [216, 91, 74], s: [376, 24, 30] },
  },
  'batch-conflicts': {
    kicker: INTAKE,
    title: ['DUPLICATES', 'AND CONFLICTS'],
    sub: ['Review potential duplicates and conflicting', 'information. Each client stays separately', 'reviewable.'],
    top: 467,
    m: { x: 43, k: KR, t: [199, 85, 71], s: [351, 22, 27] },
  },
  'batch-queue': {
    kicker: INTAKE,
    title: ['PER-CLIENT', 'REVIEW QUEUE'],
    sub: ['Each client is reviewed separately.', 'Open a client to review details,', 'match, or update information.'],
    top: 467,
    m: { x: 43, k: KR, t: [198, 85.5, 73], s: [353, 22, 27] },
  },
  'batch-client': {
    title: ['CLIENT', 'REVIEW DETAIL'],
    thin: [0],
    sub: [],
    top: 468,
    m: { x: 43, t: [248, 61, 46] },
  },
  'batch-approval': {
    kicker: INTAKE,
    title: ['BULK BATCH', 'MIGRATION'],
    sub: ['Intake multiple client files in one', 'controlled batch. Each client stays', 'separately reviewable.'],
    top: 466,
    m: { x: 43, k: KR, t: [198, 85, 71], s: [353, 22, 26.5] },
  },
  'batch-run': {
    kicker: INTAKE,
    title: ['PROCESSING', 'APPROVED', 'CLIENTS'],
    sub: ['Moving approved clients to', 'PREBUILT. None of them will', 'become ACTIVE in this step.'],
    top: 488,
    m: { x: 45, k: KR, t: [196, 79, 65], s: [399, 22.5, 27] },
  },
  'batch-complete': {
    kicker: INTAKE,
    title: ['BATCH', 'COMPLETE'],
    sub: ['Your files have been processed.', 'Review the results below.'],
    top: 468,
    m: { x: 45, k: KR, t: [196, 89, 75], s: [355, 23, 29] },
  },
};
