/**
 * IFTA demo seed — deterministic client-quarters for the Quarterly Filing Room and the Fuel Tax queue.
 *
 * Quarters are anchored to the real calendar: the most recently ended quarter is the one being filed, the quarter
 * before it is archived, and the current quarter is already collecting (continuous capture).
 *
 * Fuel purchases and miles are authored per truck per jurisdiction; receipts are split from those purchases.
 * Tax figures are NOT computed here or anywhere in code — `staffWorksheet` holds the staff-entered net tax per
 * jurisdiction, exactly what the return summary's tax column shows.
 */
import type { IftaStateId } from './experience/iftaExperience';
import {
  addDays,
  daysInPeriod,
  lastEndedQuarter,
  nextQuarter,
  previousQuarter,
  quarterLabel,
  quarterPeriod,
  type IftaQuarterNumber,
} from './iftaDates';
import type {
  IftaAuditEvent,
  IftaMileageRecord,
  IftaMileageSourceId,
  IftaQuarterCase,
  IftaReceipt,
  IftaVehicle,
} from './iftaTypes';
import { IFTA_JURISDICTION_NAMES, stationsFor } from './iftaJurisdictions';

export { IFTA_JURISDICTION_NAMES, stationsFor };

/** Small deterministic PRNG so the seed is identical on every reset. */
export function seededRandom(key: string): () => number {
  let h = 1779033703 ^ key.length;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

interface TruckPlan {
  vehicle: IftaVehicle;
  miles: Record<string, number>;
  /** Gallons purchased per jurisdiction this quarter. */
  purchases: Record<string, number>;
  mileageSource: IftaMileageSourceId;
  fileLabel?: string;
}

interface ClientPlan {
  organizationId: string;
  contactName: string;
  baseJurisdiction: string;
  iftaAccount: string;
  serviceFeeLabel: string;
  fleet: TruckPlan[];
  worksheet: Record<string, number>;
}

/** Receipts split from authored purchases: ~150-gallon fills spread across the quarter. */
function receiptsFromPurchases(caseId: string, period: { periodStart: string; periodEnd: string }, plan: TruckPlan, addedAt: string): IftaReceipt[] {
  const rng = seededRandom(`${caseId}:${plan.vehicle.id}`);
  const days = daysInPeriod(period);
  const fills: { jurisdiction: string; gallons: number }[] = [];
  for (const [jurisdiction, total] of Object.entries(plan.purchases)) {
    if (total <= 0) continue;
    const count = Math.max(1, Math.round(total / 150));
    let remaining = total;
    for (let i = 0; i < count; i++) {
      const gallons = i === count - 1 ? remaining : round1((total / count) * (0.92 + rng() * 0.16));
      remaining = round1(remaining - gallons);
      fills.push({ jurisdiction, gallons: round1(gallons) });
    }
  }
  // interleave jurisdictions through the quarter
  const ordered = fills
    .map((f) => ({ f, k: rng() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.f);
  return ordered.map((fill, i) => {
    const day = Math.min(days - 1, Math.floor(((i + 0.3 + rng() * 0.4) * days) / ordered.length));
    const stations = stationsFor(fill.jurisdiction);
    const [vendor, location] = stations[Math.floor(rng() * stations.length)];
    const price = 3.58 + rng() * 0.38;
    return {
      id: `${caseId}-${plan.vehicle.id}-r${String(i + 1).padStart(2, '0')}`,
      vendor,
      location,
      jurisdiction: fill.jurisdiction,
      purchaseDate: addDays(period.periodStart, day),
      gallons: fill.gallons,
      amount: round2(fill.gallons * price),
      vehicleId: plan.vehicle.id,
      fuelUse: 'ROAD',
      source: rng() > 0.55 ? 'CONTINUOUS_CAPTURE' : 'UPLOAD_FILES',
      receiptClass: 'READY',
      addedAt,
    } satisfies IftaReceipt;
  });
}

function mileageRecord(caseId: string, plan: TruckPlan, addedAt: string, staffVerifiedAt?: string): IftaMileageRecord {
  const sourceMap: Record<IftaMileageSourceId, IftaMileageRecord['entries'][0]['source']> = {
    ELD_GPS_IMPORT: 'eld_verified',
    ELD_REPORT_UPLOAD: 'eld_verified',
    MANUAL_STATE_ENTRY: 'manual_verified',
    SPREADSHEET: 'driver_reported',
    AIO_ASSISTANCE: 'manual_verified',
    LOAD_DERIVED_ESTIMATE: 'loaded_miles',
  };
  const verified = plan.mileageSource === 'ELD_REPORT_UPLOAD' || plan.mileageSource === 'ELD_GPS_IMPORT' || Boolean(staffVerifiedAt);
  return {
    id: `${caseId}-${plan.vehicle.id}-m-${plan.mileageSource.toLowerCase()}`,
    vehicleId: plan.vehicle.id,
    sourceId: plan.mileageSource,
    entries: Object.entries(plan.miles).map(([state, miles]) => ({ state, miles, source: sourceMap[plan.mileageSource], verified })),
    fileLabel: plan.fileLabel,
    addedAt,
    staffVerifiedAt,
  };
}

const at = (date: string, hour = 10, minute = 0) => `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;

function audit(caseId: string, n: number, atIso: string, actor: IftaAuditEvent['actor'], actorName: string, action: string, note?: string): IftaAuditEvent {
  return { id: `${caseId}-a${n}`, at: atIso, actor, actorName, action, note };
}

function baseCase(plan: ClientPlan, year: number, quarter: IftaQuarterNumber, state: IftaStateId): IftaQuarterCase {
  const period = quarterPeriod(year, quarter);
  return {
    id: `ifta-${plan.organizationId}-${year}-q${quarter}`,
    organizationId: plan.organizationId,
    year,
    quarter,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    dueDate: period.dueDate,
    baseJurisdiction: plan.baseJurisdiction,
    baseJurisdictionName: IFTA_JURISDICTION_NAMES[plan.baseJurisdiction] ?? plan.baseJurisdiction,
    iftaAccount: plan.iftaAccount,
    state,
    assignedStaffId: 'staff-2',
    vehicles: plan.fleet.map((t) => ({ ...t.vehicle })),
    receipts: [],
    mileage: [],
    continuousCapture: true,
    discrepancies: [],
    corrections: [],
    payment: { status: 'NOT_RECORDED', amount: 0 },
    serviceFeeLabel: plan.serviceFeeLabel,
    audit: [],
  };
}

/** A fully worked quarter: receipts, verified mileage, staff-prepared summary (used for history and late-stage seeds). */
function workedQuarter(plan: ClientPlan, year: number, quarter: IftaQuarterNumber, state: IftaStateId): IftaQuarterCase {
  const c = baseCase(plan, year, quarter, state);
  const submitted = addDays(c.periodEnd, 3);
  c.vehiclesConfirmedAt = at(addDays(c.periodEnd, 1), 14);
  c.receipts = plan.fleet.flatMap((t) => receiptsFromPurchases(c.id, c, t, at(addDays(c.periodEnd, 1), 15)));
  c.mileage = plan.fleet.map((t) =>
    mileageRecord(c.id, t, at(addDays(c.periodEnd, 2), 9), t.mileageSource === 'ELD_REPORT_UPLOAD' ? undefined : at(addDays(c.periodEnd, 6), 11)),
  );
  c.submittedAt = at(submitted, 16);
  c.reviewStartedAt = at(addDays(submitted, 1), 9);
  c.staffWorksheet = Object.entries(plan.worksheet).map(([jurisdiction, netTax]) => ({ jurisdiction, netTax }));
  return c;
}

/* ───────────────────────────── client plans ───────────────────────────── */

const PIONEER: ClientPlan = {
  organizationId: 'client-c',
  contactName: 'Chris Nguyen',
  baseJurisdiction: 'GA',
  iftaAccount: 'GA IFTA ••• 6120',
  serviceFeeLabel: 'Quarterly filing — 3 qualified vehicles (per accepted quote)',
  fleet: [
    {
      vehicle: { id: 'unit-c1', unit: 'Truck 01', description: '2020 Kenworth', operated: true, priorMpg: 6.5 },
      miles: { GA: 14212, FL: 6880, AL: 3940, TN: 2105 },
      purchases: { GA: 2480, FL: 1090, AL: 455, TN: 150 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'Motive-IFTA-Truck01.csv',
    },
    {
      vehicle: { id: 'unit-c2', unit: 'Truck 02', description: '2018 Peterbilt · pulls reefer T-102', operated: true, priorMpg: 6.4 },
      miles: { GA: 11450, SC: 5320, NC: 4870, TN: 1960 },
      purchases: { GA: 2140, SC: 760, NC: 730 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'Motive-IFTA-Truck02.csv',
    },
    {
      vehicle: { id: 'unit-c3', unit: 'Truck 03', description: '2021 Volvo', operated: true, priorMpg: 6.6 },
      miles: { GA: 9870, FL: 8215, AL: 2410 },
      purchases: { GA: 1520, FL: 1410, AL: 223 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'Motive-IFTA-Truck03.csv',
    },
  ],
  worksheet: { GA: -161.18, FL: -41.95, AL: 91.62, TN: 137.4, SC: 17.88, NC: 7.21 },
};

const HEARTLAND: ClientPlan = {
  organizationId: 'client-b',
  contactName: 'Diana Cole',
  baseJurisdiction: 'OH',
  iftaAccount: 'OH IFTA ••• 2047',
  serviceFeeLabel: 'Quarterly filing — 1 qualified vehicle (per accepted quote)',
  fleet: [
    {
      vehicle: { id: 'unit-b1', unit: 'Truck 204', description: '2018 Freightliner Cascadia', operated: true, priorMpg: 6.8 },
      miles: { OH: 12040, IN: 4210, IL: 3880, PA: 2950, KY: 1240, WV: 615 },
      purchases: { OH: 2180, IL: 760, PA: 470, KY: 257 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'Samsara-IFTA-Truck204.pdf',
    },
  ],
  worksheet: { OH: -128.4, IN: 188.36, IL: 34.1, PA: 41.77, KY: 12.05, WV: 32.66 },
};

const BLUELINE: ClientPlan = {
  organizationId: 'client-d',
  contactName: 'Kevin Shaw',
  baseJurisdiction: 'FL',
  iftaAccount: 'FL IFTA ••• 3398',
  serviceFeeLabel: 'Quarterly filing — 2 qualified vehicles (per accepted quote)',
  fleet: [
    {
      vehicle: { id: 'unit-d1', unit: 'Unit 7', description: '2019 Peterbilt', operated: true, priorMpg: 6.6 },
      miles: { FL: 15320, GA: 6410, AL: 2950 },
      purchases: { FL: 2610, GA: 1129 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'KeepTruckin-Unit7.csv',
    },
    {
      vehicle: { id: 'unit-d2', unit: 'Unit 8', description: '2020 Kenworth', operated: true, priorMpg: 6.4 },
      miles: { FL: 13880, GA: 5120, SC: 3260 },
      purchases: { FL: 3050, GA: 920, SC: 395 },
      mileageSource: 'SPREADSHEET',
      fileLabel: 'Unit8-trip-sheet-Q3.xlsx',
    },
  ],
  worksheet: { FL: -96.2, GA: 14.35, AL: 136.9, SC: 22.4 },
};

const DELTA: ClientPlan = {
  organizationId: 'client-f',
  contactName: 'Chris Delta',
  baseJurisdiction: 'TN',
  iftaAccount: 'TN IFTA ••• 0815',
  serviceFeeLabel: 'Quarterly filing — 1 qualified vehicle (per accepted quote)',
  fleet: [
    {
      vehicle: { id: 'ifta-f-v1', unit: 'Truck 1', description: '2017 Volvo VNL 760', operated: true, priorMpg: 6.7 },
      miles: { TN: 10220, KY: 3840, AL: 2960, MS: 1880, GA: 1170 },
      purchases: { TN: 1860, KY: 520, AL: 410, MS: 206 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'Motive-IFTA-Truck1.csv',
    },
  ],
  worksheet: { TN: -54.6, KY: 22.15, AL: 4.92, MS: 39.4, GA: 58.03 },
};

const RIDGELINE: ClientPlan = {
  organizationId: 'client-g',
  contactName: 'Pat Ridge',
  baseJurisdiction: 'GA',
  iftaAccount: 'GA IFTA ••• 7731',
  serviceFeeLabel: 'Quarterly filing — 2 qualified vehicles (per accepted quote)',
  fleet: [
    {
      vehicle: { id: 'ifta-g-v1', unit: 'RL-11', description: '2021 Freightliner Cascadia', operated: true, priorMpg: 6.9 },
      miles: { GA: 13110, AL: 4020, MS: 2760, TN: 1890 },
      purchases: { GA: 2050, AL: 610, MS: 495 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'Samsara-RL-11.csv',
    },
    {
      vehicle: { id: 'ifta-g-v2', unit: 'RL-14', description: '2022 International LT', operated: true, priorMpg: 7.1 },
      miles: { GA: 12480, FL: 7310, AL: 1140 },
      purchases: { GA: 1810, FL: 990 },
      mileageSource: 'ELD_REPORT_UPLOAD',
      fileLabel: 'Samsara-RL-14.csv',
    },
  ],
  worksheet: { GA: -118.5, AL: 96.3, MS: 18.41, TN: 179.44, FL: 136.79 },
};

export const IFTA_ENROLLED_PLANS: ClientPlan[] = [PIONEER, HEARTLAND, BLUELINE, DELTA, RIDGELINE];

export function iftaContactName(organizationId: string): string {
  return IFTA_ENROLLED_PLANS.find((p) => p.organizationId === organizationId)?.contactName ?? 'Client';
}

/* ───────────────────────────── quarter builders ───────────────────────────── */

export function returnSummaryFrom(c: IftaQuarterCase, preparedAt: string, staffId: string): NonNullable<IftaQuarterCase['returnSummary']> {
  const miles = new Map<string, number>();
  for (const rec of c.mileage) {
    if (rec.supersededById) continue;
    for (const e of rec.entries) miles.set(e.state, (miles.get(e.state) ?? 0) + e.miles);
  }
  const gallons = new Map<string, number>();
  for (const r of c.receipts) {
    if (r.receiptClass !== 'READY' || r.gallons === null || r.fuelUse === 'REEFER') continue;
    gallons.set(r.jurisdiction, (gallons.get(r.jurisdiction) ?? 0) + r.gallons);
  }
  const jurisdictions = [...new Set([...miles.keys(), ...gallons.keys()])].sort(
    (a, b) => (a === c.baseJurisdiction ? -1 : b === c.baseJurisdiction ? 1 : (miles.get(b) ?? 0) - (miles.get(a) ?? 0)),
  );
  const worksheet = new Map((c.staffWorksheet ?? []).map((w) => [w.jurisdiction, w.netTax]));
  const lines = jurisdictions.map((j) => ({
    jurisdiction: j,
    miles: miles.get(j) ?? 0,
    taxPaidGallons: round1(gallons.get(j) ?? 0),
    netTax: worksheet.get(j) ?? 0,
  }));
  const totalMiles = lines.reduce((s, l) => s + l.miles, 0);
  const totalGallons = round1(lines.reduce((s, l) => s + l.taxPaidGallons, 0));
  return {
    preparedByStaffId: staffId,
    preparedAt,
    lines,
    totalMiles,
    totalGallons,
    fleetMpg: totalGallons > 0 ? round2(totalMiles / totalGallons) : 0,
    netPosition: round2(lines.reduce((s, l) => s + l.netTax, 0)),
  };
}

function sealed(c: IftaQuarterCase, filedAt: string, confirmation: string, payment: IftaQuarterCase['payment'], sealedAt: string): IftaQuarterCase {
  c.filing = {
    filedAt,
    confirmationNumber: confirmation,
    filedByStaffId: 'staff-2',
    destination: `${c.baseJurisdictionName} — IFTA base jurisdiction (filed by AIO staff)`,
  };
  c.payment = payment;
  c.vault = {
    sealedAt,
    path: iftaVaultPath(c),
    documentId: `vdoc-${c.id}-packet`,
    contents: iftaPacketContents(c),
  };
  return c;
}

export function iftaVaultPath(c: { year: number; quarter: number }): string[] {
  return ['Vault', 'Tax & Fuel', 'IFTA', String(c.year), `Q${c.quarter}`];
}

export function iftaPacketContents(c: IftaQuarterCase): string[] {
  const receipts = c.receipts.filter((r) => r.receiptClass === 'READY').length;
  const trucks = c.vehicles.filter((v) => v.operated !== false).length;
  return [
    `${receipts} fuel receipts`,
    `Jurisdiction mileage — ${trucks} truck${trucks === 1 ? '' : 's'}`,
    'IFTA return summary (approved)',
    'Filed IFTA return',
    'Filing confirmation',
  ];
}

function archivedHistory(plan: ClientPlan, year: number, quarter: IftaQuarterNumber, n: number): IftaQuarterCase {
  const c = workedQuarter(plan, year, quarter, 'ARCHIVED');
  const prepared = at(addDays(c.periodEnd, 9), 13);
  c.returnSummary = { ...returnSummaryFrom(c, prepared, 'staff-2'), sentForApprovalAt: prepared };
  c.returnSummary.approvedAt = at(addDays(c.periodEnd, 11), 18);
  c.returnSummary.approvedBy = plan.contactName;
  const filed = addDays(c.periodEnd, 14);
  const net = c.returnSummary.netPosition;
  sealed(
    c,
    at(filed, 15),
    `${plan.baseJurisdiction}-${year}Q${quarter}-${String(40000 + n * 1777).padStart(6, '0')}`,
    { status: net > 0 ? 'PAID' : net < 0 ? 'CREDIT_CARRIED' : 'NO_TAX_DUE', amount: Math.abs(net), recordedAt: at(addDays(filed, 2), 10), note: net > 0 ? 'Paid to base jurisdiction by ACH' : 'Credit carried forward' },
    at(addDays(filed, 2), 10, 5),
  );
  c.audit = [
    audit(c.id, 1, c.submittedAt!, 'CLIENT', plan.contactName, 'Quarter sent to AIO for review'),
    audit(c.id, 2, prepared, 'FOUNDER_STAFF', 'Jordan Lee', 'Return summary sent for approval'),
    audit(c.id, 3, c.returnSummary.approvedAt, 'CLIENT', plan.contactName, 'Return approved by client'),
    audit(c.id, 4, c.filing!.filedAt, 'FOUNDER_STAFF', 'Jordan Lee', 'IFTA return filed', `Confirmation ${c.filing!.confirmationNumber}`),
    audit(c.id, 5, c.payment.recordedAt!, 'FOUNDER_STAFF', 'Jordan Lee', 'Payment status recorded', c.payment.note),
    audit(c.id, 6, c.vault!.sealedAt, 'SYSTEM', 'AIO', 'Filing packet sealed in the Vault'),
  ];
  return c;
}

/** The current (still running) quarter — fleet pre-filled, continuous capture on. */
function openQuarter(plan: ClientPlan, year: number, quarter: IftaQuarterNumber, now: Date, captured: number): IftaQuarterCase {
  const c = baseCase(plan, year, quarter, captured > 0 ? 'COLLECTING' : 'QUARTER_OPEN');
  const today = now.toISOString().slice(0, 10);
  const daysSoFar = Math.max(1, Math.min(daysInPeriod(c), Math.round((Date.parse(today) - Date.parse(c.periodStart)) / 86_400_000) + 1));
  const rng = seededRandom(c.id);
  for (let i = 0; i < captured; i++) {
    const truck = plan.fleet[i % plan.fleet.length];
    const jurisdiction = Object.keys(truck.purchases)[i % Object.keys(truck.purchases).length];
    const stations = stationsFor(jurisdiction);
    const [vendor, location] = stations[Math.floor(rng() * stations.length)];
    const gallons = round1(140 + rng() * 25);
    const date = addDays(c.periodStart, Math.min(daysSoFar - 1, Math.floor(((i + 0.5) * daysSoFar) / captured)));
    c.receipts.push({
      id: `${c.id}-${truck.vehicle.id}-r${String(i + 1).padStart(2, '0')}`,
      vendor,
      location,
      jurisdiction,
      purchaseDate: date,
      gallons,
      amount: round2(gallons * (3.6 + rng() * 0.3)),
      vehicleId: truck.vehicle.id,
      fuelUse: 'ROAD',
      source: 'CONTINUOUS_CAPTURE',
      receiptClass: 'READY',
      addedAt: at(date, 17, 20),
    });
  }
  return c;
}

/* ───────────────────────────── the seed ───────────────────────────── */

export interface IftaSeedResult {
  quarters: IftaQuarterCase[];
}

export function createIftaSeed(now: Date = new Date()): IftaSeedResult {
  const filing = lastEndedQuarter(now);
  const history = previousQuarter(filing.year, filing.quarter);
  const current = nextQuarter(filing.year, filing.quarter);
  const quarters: IftaQuarterCase[] = [];
  /** `daysAgo` before now, never earlier than the day after the filing quarter ended. */
  const recent = (daysAgo: number, hour = 10) => {
    const floor = Date.parse(at(addDays(quarterPeriod(filing.year, filing.quarter).periodEnd, 1), 8));
    const day = new Date(Math.max(floor, now.getTime() - daysAgo * 86_400_000)).toISOString().slice(0, 10);
    return at(day, hour);
  };

  IFTA_ENROLLED_PLANS.forEach((plan, i) => quarters.push(archivedHistory(plan, history.year, history.quarter, i + 1)));

  /* PIONEER FLEET — the primary filing room: AIO asked for 2 receipt corrections. */
  {
    const c = workedQuarter(PIONEER, filing.year, filing.quarter, 'NEEDS_CLIENT');
    c.reviewStartedAt = recent(3, 9);
    c.submittedAt = recent(4, 16);
    const truck02 = PIONEER.fleet[1];
    const truck03 = PIONEER.fleet[2];
    // Truck 03 first ran on load-derived estimates from Dispatch — superseded by the ELD report.
    const estimate: IftaMileageRecord = {
      ...mileageRecord(c.id, { ...truck03, mileageSource: 'LOAD_DERIVED_ESTIMATE', miles: { GA: 9100, FL: 7600, AL: 2200 }, fileLabel: undefined }, at(addDays(c.periodStart, 40), 8)),
      supersededById: `${c.id}-unit-c3-m-eld_report_upload`,
    };
    c.mileage.unshift(estimate);
    const reefer: IftaReceipt = {
      id: `${c.id}-unit-c2-reefer`,
      vendor: 'Pilot Flying J',
      location: 'Valdosta, GA',
      jurisdiction: 'GA',
      purchaseDate: addDays(c.periodStart, 44),
      gallons: 38.2,
      amount: 142.11,
      vehicleId: truck02.vehicle.id,
      fuelUse: null,
      source: 'CONTINUOUS_CAPTURE',
      receiptClass: 'NEEDS_YOU',
      flag: {
        reason: 'Pumped at the reefer lane — reefer-unit fuel is not reported on IFTA.',
        question: 'Was this fuel for Truck 02 or for the reefer unit?',
        options: ['Truck fuel', 'Reefer unit'],
        requestedByStaffId: 'staff-2',
      },
      addedAt: at(addDays(c.periodStart, 44), 21),
    };
    const unreadable: IftaReceipt = {
      id: `${c.id}-unit-c1-unreadable`,
      vendor: null,
      location: null,
      jurisdiction: 'GA',
      purchaseDate: addDays(c.periodStart, 70),
      gallons: null,
      amount: null,
      vehicleId: 'unit-c1',
      fuelUse: 'ROAD',
      source: 'TAKE_PHOTO',
      receiptClass: 'UNREADABLE',
      fileLabel: 'IMG_2231.JPG',
      flag: {
        reason: 'Photo too dark to read the station, gallons or total.',
        question: 'Retake the photo, or upload the pump receipt.',
        requestedByStaffId: 'staff-2',
      },
      addedAt: at(addDays(c.periodStart, 70), 22),
    };
    const original = c.receipts.find((r) => r.vehicleId === 'unit-c3' && r.jurisdiction === 'FL')!;
    const duplicate: IftaReceipt = {
      ...original,
      id: `${c.id}-unit-c3-dup`,
      source: 'UPLOAD_FILES',
      fileLabel: 'TA-Jacksonville-receipt.pdf',
      receiptClass: 'DUPLICATE',
      duplicateOfId: original.id,
      flag: { reason: 'Same station, date, gallons and total as a receipt already in Q3 — held out of totals.', question: 'Keep both, or remove the copy?', options: ['Remove copy', 'Keep both'] },
    };
    const underReview = c.receipts.filter((r) => r.jurisdiction === 'TN').slice(0, 2);
    for (const r of underReview) {
      r.receiptClass = 'UNDER_AIO_REVIEW';
      r.flag = { reason: 'AIO is confirming the station’s state from its address — nothing needed from you.' };
    }
    c.receipts.push(reefer, unreadable, duplicate);
    c.corrections = [
      {
        id: `${c.id}-corr-1`,
        requestedAt: recent(2, 15),
        requestedByStaffId: 'staff-2',
        receiptIds: [reefer.id, unreadable.id],
        vehicleIds: [],
        message:
          'Hi Chris — two receipts need you before I can finish reviewing Q3: one Valdosta fill may be reefer fuel, and one photo is too dark to read. Everything else checks out.',
      },
    ];
    c.audit = [
      audit(c.id, 1, at(addDays(c.periodEnd, 1), 14), 'CLIENT', PIONEER.contactName, 'Fleet confirmed — 3 trucks ran'),
      audit(c.id, 2, at(addDays(c.periodEnd, 2), 9), 'CLIENT', PIONEER.contactName, 'ELD reports uploaded — Truck 01, 02, 03', 'Truck 03 estimate from Dispatch superseded'),
      audit(c.id, 3, c.submittedAt, 'CLIENT', PIONEER.contactName, 'Quarter sent to AIO for review'),
      audit(c.id, 4, c.reviewStartedAt, 'FOUNDER_STAFF', 'Jordan Lee', 'AIO review started'),
      audit(c.id, 5, c.corrections[0].requestedAt, 'FOUNDER_STAFF', 'Jordan Lee', 'Correction requested — 2 receipts', c.corrections[0].message),
    ];
    quarters.push(c);
  }

  /* HEARTLAND — staff asked about Indiana miles with no Indiana fuel (POSSIBLE_MISSING). */
  {
    const c = workedQuarter(HEARTLAND, filing.year, filing.quarter, 'NEEDS_CLIENT');
    c.submittedAt = recent(5, 11);
    c.reviewStartedAt = recent(3, 13);
    const gap: IftaReceipt = {
      id: `${c.id}-gap-in`,
      vendor: null,
      location: null,
      jurisdiction: 'IN',
      purchaseDate: null,
      gallons: null,
      amount: null,
      vehicleId: 'unit-b1',
      fuelUse: 'ROAD',
      source: 'SYSTEM_GAP',
      receiptClass: 'POSSIBLE_MISSING',
      flag: {
        reason: 'Truck 204 ran 4,210 Indiana miles with no Indiana fuel purchase on file.',
        question: 'Add the Indiana receipt, or confirm no fuel was bought in Indiana.',
        options: ['Add receipt', 'No fuel bought in Indiana'],
        requestedByStaffId: 'staff-2',
      },
      addedAt: recent(3, 13),
    };
    c.receipts.push(gap);
    c.corrections = [
      { id: `${c.id}-corr-1`, requestedAt: recent(3, 14), requestedByStaffId: 'staff-2', receiptIds: [gap.id], vehicleIds: [], message: 'Hi Diana — Truck 204 ran 4,210 miles in Indiana but no Indiana fuel is on file. If you fueled there, add the receipt; if not, just tell us.' },
    ];
    c.audit = [
      audit(c.id, 1, c.submittedAt, 'CLIENT', HEARTLAND.contactName, 'Quarter sent to AIO for review'),
      audit(c.id, 2, c.reviewStartedAt, 'FOUNDER_STAFF', 'Jordan Lee', 'AIO review started'),
      audit(c.id, 3, c.corrections[0].requestedAt, 'FOUNDER_STAFF', 'Jordan Lee', 'Correction requested — 1 possible missing receipt'),
    ];
    quarters.push(c);
  }

  /* BLUELINE — reconciling: spreadsheet miles unverified, MPG outlier, Alabama miles with no Alabama fuel. */
  {
    const c = workedQuarter(BLUELINE, filing.year, filing.quarter, 'RECONCILING');
    c.mileage = c.mileage.map((m) => (m.sourceId === 'SPREADSHEET' ? { ...m, staffVerifiedAt: undefined, entries: m.entries.map((e) => ({ ...e, verified: false })) } : m));
    c.submittedAt = recent(4, 10);
    c.reviewStartedAt = recent(2, 9);
    c.discrepancies = [
      { id: `${c.id}-d1`, kind: 'UNVERIFIED_MILEAGE', jurisdiction: null, vehicleId: 'unit-d2', detail: 'Unit 8 miles come from a trip-sheet spreadsheet — verify against the trip sheets before reporting.', status: 'OPEN' },
      { id: `${c.id}-d2`, kind: 'MPG_OUTLIER', jurisdiction: null, vehicleId: 'unit-d2', detail: 'Unit 8 at 5.1 MPG vs 6.4 last quarter — miles may be overstated or fuel missing.', status: 'OPEN' },
      { id: `${c.id}-d3`, kind: 'MILES_WITHOUT_FUEL', jurisdiction: 'AL', vehicleId: 'unit-d1', detail: 'Unit 7 ran 2,950 Alabama miles with no Alabama fuel.', status: 'OPEN' },
    ];
    c.audit = [
      audit(c.id, 1, c.submittedAt, 'CLIENT', BLUELINE.contactName, 'Quarter sent to AIO for review'),
      audit(c.id, 2, c.reviewStartedAt, 'FOUNDER_STAFF', 'Jordan Lee', 'Reconciliation started'),
    ];
    quarters.push(c);
  }

  /* DELTA HAUL — client approved; ready to file. */
  {
    const c = workedQuarter(DELTA, filing.year, filing.quarter, 'FILING');
    c.submittedAt = recent(6, 10);
    c.reviewStartedAt = recent(5, 9);
    const prepared = recent(4, 15);
    c.returnSummary = { ...returnSummaryFrom(c, prepared, 'staff-2'), sentForApprovalAt: prepared, approvedAt: recent(2, 19), approvedBy: DELTA.contactName };
    c.audit = [
      audit(c.id, 1, c.submittedAt, 'CLIENT', DELTA.contactName, 'Quarter sent to AIO for review'),
      audit(c.id, 2, prepared, 'FOUNDER_STAFF', 'Jordan Lee', 'Return summary sent for approval'),
      audit(c.id, 3, c.returnSummary.approvedAt!, 'CLIENT', DELTA.contactName, 'Return approved by client'),
    ];
    quarters.push(c);
  }

  /* RIDGELINE — filed; tax payment scheduled with the base jurisdiction. */
  {
    const c = workedQuarter(RIDGELINE, filing.year, filing.quarter, 'FILED');
    c.submittedAt = recent(9, 10);
    const prepared = recent(7, 15);
    c.returnSummary = { ...returnSummaryFrom(c, prepared, 'staff-2'), sentForApprovalAt: prepared, approvedAt: recent(6, 12), approvedBy: RIDGELINE.contactName };
    sealed(
      c,
      recent(4, 15),
      `GA-${filing.year}Q${filing.quarter}-118204`,
      { status: 'PAYMENT_PENDING', amount: c.returnSummary.netPosition, note: 'ACH scheduled with the base jurisdiction' },
      recent(4, 15),
    );
    c.audit = [
      audit(c.id, 1, c.submittedAt, 'CLIENT', RIDGELINE.contactName, 'Quarter sent to AIO for review'),
      audit(c.id, 2, prepared, 'FOUNDER_STAFF', 'Jordan Lee', 'Return summary sent for approval'),
      audit(c.id, 3, c.returnSummary.approvedAt!, 'CLIENT', RIDGELINE.contactName, 'Return approved by client'),
      audit(c.id, 4, c.filing!.filedAt, 'FOUNDER_STAFF', 'Jordan Lee', 'IFTA return filed', `Confirmation ${c.filing!.confirmationNumber}`),
      audit(c.id, 5, c.vault!.sealedAt, 'SYSTEM', 'AIO', 'Filing packet sealed in the Vault'),
    ];
    quarters.push(c);
  }

  /* The current quarter is already open for every enrolled client — continuous capture keeps running. */
  for (const plan of IFTA_ENROLLED_PLANS) {
    const captured = plan === PIONEER ? 3 : plan === HEARTLAND ? 1 : 0;
    const c = openQuarter(plan, current.year, current.quarter, now, captured);
    if (plan === PIONEER) {
      // Dispatch load miles arrive as estimates (DISPATCH_TO_IFTA) until the quarter's ELD report replaces them.
      c.mileage.push(
        mileageRecord(c.id, { ...PIONEER.fleet[2], mileageSource: 'LOAD_DERIVED_ESTIMATE', miles: { GA: 640, FL: 410 }, fileLabel: undefined }, at(c.periodStart, 18)),
      );
    }
    c.audit = [audit(c.id, 1, at(c.periodStart, 0, 5), 'SYSTEM', 'AIO', `${quarterLabel(c)} opened — fleet pre-filled from ${quarterLabel(filing)}`)];
    quarters.push(c);
  }

  return { quarters };
}
