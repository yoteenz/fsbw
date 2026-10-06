/**
 * IFTA derivations — pure functions over a quarter case. Both actors read the same record through these:
 * the client gets the packet-builder view (what AIO needs from me), staff get the case-file view (what blocks this
 * filing). Mileage readiness is the existing engine (fleet/ifta/iftaReadiness.assessIftaReadiness), unchanged.
 * Nothing here computes tax — totals are sums of recorded miles / gallons; tax figures come from the staff worksheet.
 */
import {
  assessIftaReadiness,
  type FuelPurchaseRecord,
  type IftaReadinessStatus,
  type JurisdictionMileageEntry,
} from '../fleet/ifta/iftaReadiness';
import {
  IFTA_EXPERIENCE,
  IFTA_RECEIPT_CLASS_RULES,
  experienceState,
  fillTemplate,
  primaryCta,
  staffHubBucketFor,
  stateMeaning,
  type IftaStateId,
  type IftaTemplateVars,
} from './experience/iftaExperience';
import { daysUntil, formatLongDate, formatShortDate, monthsOfQuarter, parseIsoDate, quarterLabel } from './iftaDates';
import { IFTA_JURISDICTION_NAMES } from './iftaJurisdictions';
import type { IftaMileageRecord, IftaQuarterCase, IftaReceipt, IftaReceiptClass, IftaVehicle } from './iftaTypes';

/* ───────────────────────────── vocabulary ───────────────────────────── */

export const RECEIPT_CLASS_ORDER: IftaReceiptClass[] = ['NEEDS_YOU', 'UNREADABLE', 'POSSIBLE_MISSING', 'DUPLICATE', 'UNDER_AIO_REVIEW', 'READY'];

export const RECEIPT_CLASS_COPY: Record<IftaReceiptClass, { client: string; staff: string; rule: string; clientMustAct: boolean }> = {
  READY: { client: 'Ready', staff: 'Ready', rule: IFTA_RECEIPT_CLASS_RULES.READY, clientMustAct: false },
  NEEDS_YOU: { client: 'Needs you', staff: 'Client answer', rule: IFTA_RECEIPT_CLASS_RULES.NEEDS_YOU, clientMustAct: true },
  DUPLICATE: { client: 'Duplicate', staff: 'Duplicate', rule: IFTA_RECEIPT_CLASS_RULES.DUPLICATE, clientMustAct: false },
  POSSIBLE_MISSING: { client: 'Possible missing', staff: 'Possible missing', rule: IFTA_RECEIPT_CLASS_RULES.POSSIBLE_MISSING, clientMustAct: true },
  UNREADABLE: { client: 'Unreadable', staff: 'Unreadable', rule: IFTA_RECEIPT_CLASS_RULES.UNREADABLE, clientMustAct: true },
  UNDER_AIO_REVIEW: {
    client: 'Under AIO review',
    staff: 'Classify',
    rule: 'Readable and parsed; AIO is confirming one detail (station state or vehicle). Nothing needed from the client.',
    clientMustAct: false,
  },
};

/** System readiness states stay visible to staff; clients get plain language (sprint §9). */
export const READINESS_COPY: Record<IftaReadinessStatus, { client: string; staff: string }> = {
  INSUFFICIENT_DATA: { client: 'No miles yet', staff: 'INSUFFICIENT_DATA' },
  ESTIMATED: { client: 'Estimate only — can’t be filed', staff: 'ESTIMATED' },
  MANUAL_VERIFICATION_REQUIRED: { client: 'Received — AIO verifies these miles', staff: 'MANUAL_VERIFICATION_REQUIRED' },
  VERIFIED_SOURCE_AVAILABLE: { client: 'Verified miles — fuel still being checked', staff: 'VERIFIED_SOURCE_AVAILABLE' },
  READY_FOR_REPORTING: { client: 'Verified — ready for the return', staff: 'READY_FOR_REPORTING' },
};

const READINESS_RANK: Record<IftaReadinessStatus, number> = {
  INSUFFICIENT_DATA: 0,
  ESTIMATED: 1,
  MANUAL_VERIFICATION_REQUIRED: 2,
  VERIFIED_SOURCE_AVAILABLE: 3,
  READY_FOR_REPORTING: 4,
};

export const COLLECTION_STATES: IftaStateId[] = ['QUARTER_OPEN', 'COLLECTING', 'NEEDS_CLIENT', 'OVERDUE_RISK'];
export const INPUTS_LOCKED_STATES: IftaStateId[] = ['AIO_REVIEW', 'RECONCILING', 'AWAITING_APPROVAL', 'FILING', 'FILED', 'ARCHIVED', 'FILING_REJECTED'];

export function jurisdictionName(code: string): string {
  return IFTA_JURISDICTION_NAMES[code] ?? code;
}

export function formatMoney(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Net position from the staff-prepared summary: positive = tax due, negative = credit. */
export function taxPositionLabel(net: number): { label: string; amount: string; kind: 'DUE' | 'CREDIT' | 'NONE' } {
  if (net > 0) return { label: 'Tax due', amount: formatMoney(net), kind: 'DUE' };
  if (net < 0) return { label: 'Credit', amount: formatMoney(Math.abs(net)), kind: 'CREDIT' };
  return { label: 'No tax due', amount: formatMoney(0), kind: 'NONE' };
}

export function templateVars(q: IftaQuarterCase, now: Date, extra: Partial<IftaTemplateVars> = {}): IftaTemplateVars {
  return {
    quarter: q.quarter,
    year: q.year,
    dueDate: formatShortDate(q.dueDate),
    days: Math.max(0, daysUntil(q.dueDate, now)),
    pct: packetCompleteness(q, now).pct,
    baseJurisdiction: q.baseJurisdictionName,
    date: q.filing ? formatShortDate(q.filing.filedAt) : undefined,
    confirmation: q.filing?.confirmationNumber,
    ...extra,
  };
}

/* ───────────────────────────── receipts ───────────────────────────── */

export function receiptCounts(q: IftaQuarterCase): Record<IftaReceiptClass, number> {
  const counts = Object.fromEntries(RECEIPT_CLASS_ORDER.map((c) => [c, 0])) as Record<IftaReceiptClass, number>;
  for (const r of q.receipts) counts[r.receiptClass] += 1;
  return counts;
}

/** Receipts that count toward fuel totals: not held-out duplicates, not reefer fuel, with parsed gallons. */
export function countedReceipts(q: IftaQuarterCase): IftaReceipt[] {
  return q.receipts.filter(
    (r) => r.receiptClass !== 'DUPLICATE' && r.receiptClass !== 'POSSIBLE_MISSING' && r.gallons !== null && r.fuelUse !== 'REEFER',
  );
}

export function receiptTotals(q: IftaQuarterCase): { gallons: number; amount: number; count: number } {
  const counted = countedReceipts(q);
  return {
    gallons: Math.round(counted.reduce((s, r) => s + (r.gallons ?? 0), 0) * 10) / 10,
    amount: Math.round(counted.reduce((s, r) => s + (r.amount ?? 0), 0) * 100) / 100,
    count: counted.length,
  };
}

export function receiptLine(r: IftaReceipt, vehicles: IftaVehicle[]): string {
  const parts = [
    r.vendor ?? (r.receiptClass === 'POSSIBLE_MISSING' ? `No ${jurisdictionName(r.jurisdiction)} receipt` : 'Unreadable photo'),
    r.location,
    r.purchaseDate ? formatShortDate(r.purchaseDate) : null,
    r.gallons !== null ? `${formatNumber(r.gallons, 1)} gal` : null,
    r.amount !== null ? formatMoney(r.amount) : null,
    vehicles.find((v) => v.id === r.vehicleId)?.unit ?? null,
  ];
  return parts.filter(Boolean).join(' · ');
}

/* ───────────────────────────── mileage ───────────────────────────── */

export function activeMileage(q: IftaQuarterCase): IftaMileageRecord[] {
  return q.mileage.filter((m) => !m.supersededById);
}

export function latestMileageFor(q: IftaQuarterCase, vehicleId: string): IftaMileageRecord | undefined {
  return activeMileage(q)
    .filter((m) => m.vehicleId === vehicleId)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))[0];
}

/**
 * Entries handed to assessIftaReadiness. Manual / spreadsheet / AIO-built miles become `manual_verified` only once
 * staff have verified them (contract mileage source quality rules); before that they stay unverified.
 */
export function readinessEntries(record: IftaMileageRecord): JurisdictionMileageEntry[] {
  if (record.sourceId === 'LOAD_DERIVED_ESTIMATE') return record.entries.map((e) => ({ ...e, source: 'loaded_miles', verified: false }));
  if (record.sourceId === 'ELD_REPORT_UPLOAD' || record.sourceId === 'ELD_GPS_IMPORT') {
    return record.entries.map((e) => ({ ...e, source: 'eld_verified', verified: true }));
  }
  if (record.staffVerifiedAt) return record.entries.map((e) => ({ ...e, source: 'manual_verified', verified: true }));
  return record.entries.map((e) => ({ ...e, source: record.sourceId === 'SPREADSHEET' ? 'driver_reported' : 'manual_verified', verified: false }));
}

export type MileageQuality = 'VERIFIED' | 'AIO_CHECKING' | 'AIO_BUILDING' | 'ESTIMATE' | 'MISSING' | 'NOT_OPERATED';

export const MILEAGE_QUALITY_COPY: Record<MileageQuality, { client: string; badge: string }> = {
  VERIFIED: { client: 'Verified source', badge: 'VERIFIED' },
  AIO_CHECKING: { client: 'Received — AIO verifies', badge: 'AIO VERIFYING' },
  AIO_BUILDING: { client: 'AIO is building these miles from your records', badge: 'AIO BUILDING' },
  ESTIMATE: { client: 'Estimate only — can’t be filed', badge: 'ESTIMATE' },
  MISSING: { client: 'No miles yet', badge: 'NO MILES' },
  NOT_OPERATED: { client: 'Did not run this quarter', badge: 'NOT OPERATED' },
};

export interface VehicleReadiness {
  vehicle: IftaVehicle;
  record?: IftaMileageRecord;
  status: IftaReadinessStatus;
  warnings: string[];
  quality: MileageQuality;
  miles: number;
  gallons: number;
  mpg: number | null;
  mpgOutlier: boolean;
  jurisdictions: { state: string; miles: number; gallons: number }[];
}

export function vehicleReadiness(q: IftaQuarterCase, vehicle: IftaVehicle): VehicleReadiness {
  const record = latestMileageFor(q, vehicle.id);
  const entries = record ? readinessEntries(record) : [];
  const fuel: FuelPurchaseRecord[] = countedReceipts(q)
    .filter((r) => r.vehicleId === vehicle.id && r.receiptClass !== 'UNREADABLE')
    .map((r) => ({
      id: r.id,
      organizationId: q.organizationId,
      purchaseDate: r.purchaseDate ?? q.periodEnd,
      gallons: r.gallons ?? 0,
      state: r.jurisdiction,
      source: 'fuel_receipt',
      verified: r.receiptClass === 'READY',
    }));
  const assessment = assessIftaReadiness(entries, fuel);
  const miles = entries.reduce((s, e) => s + e.miles, 0);
  const gallons = Math.round(fuel.reduce((s, f) => s + f.gallons, 0) * 10) / 10;
  const mpg = miles > 0 && gallons > 0 ? Math.round((miles / gallons) * 100) / 100 : null;
  const mpgOutlier = mpg !== null && vehicle.priorMpg !== undefined && Math.abs(mpg - vehicle.priorMpg) / vehicle.priorMpg > 0.15;
  const byState = new Map<string, { miles: number; gallons: number }>();
  for (const e of entries) byState.set(e.state, { miles: (byState.get(e.state)?.miles ?? 0) + e.miles, gallons: byState.get(e.state)?.gallons ?? 0 });
  for (const f of fuel) byState.set(f.state, { miles: byState.get(f.state)?.miles ?? 0, gallons: (byState.get(f.state)?.gallons ?? 0) + f.gallons });

  let quality: MileageQuality;
  if (vehicle.operated === false) quality = 'NOT_OPERATED';
  else if (!record) quality = 'MISSING';
  else if (record.sourceId === 'AIO_ASSISTANCE' && record.entries.length === 0) quality = 'AIO_BUILDING';
  else if (assessment.status === 'ESTIMATED') quality = 'ESTIMATE';
  else if (assessment.status === 'READY_FOR_REPORTING' || assessment.status === 'VERIFIED_SOURCE_AVAILABLE') quality = 'VERIFIED';
  else if (assessment.status === 'MANUAL_VERIFICATION_REQUIRED') quality = 'AIO_CHECKING';
  else quality = 'MISSING';

  return {
    vehicle,
    record,
    status: assessment.status,
    warnings: assessment.warnings,
    quality,
    miles,
    gallons,
    mpg,
    mpgOutlier,
    jurisdictions: [...byState.entries()]
      .map(([state, v]) => ({ state, miles: v.miles, gallons: Math.round(v.gallons * 10) / 10 }))
      .sort((a, b) => b.miles - a.miles),
  };
}

export function fleetReadiness(q: IftaQuarterCase): VehicleReadiness[] {
  return q.vehicles.map((v) => vehicleReadiness(q, v));
}

/** READY_FOR_REPORTING only when every operated vehicle has verified miles and verified fuel (contract QUARTER_READINESS). */
export function quarterReadiness(q: IftaQuarterCase): IftaReadinessStatus {
  const operated = fleetReadiness(q).filter((v) => v.vehicle.operated !== false);
  if (operated.length === 0) return 'INSUFFICIENT_DATA';
  return operated.reduce<IftaReadinessStatus>((worst, v) => (READINESS_RANK[v.status] < READINESS_RANK[worst] ? v.status : worst), 'READY_FOR_REPORTING');
}

/* ───────────────────────────── packet + open items ───────────────────────────── */

export function periodEnded(q: IftaQuarterCase, now: Date): boolean {
  return now.getTime() >= parseIsoDate(q.periodEnd).getTime() + 86_400_000;
}

export interface PacketCompleteness {
  pct: number;
  receipts: { done: number; total: number };
  mileage: { done: number; total: number };
  vehicles: { done: number; total: number };
}

export function packetCompleteness(q: IftaQuarterCase, _now: Date = new Date()): PacketCompleteness {
  const receiptPool = q.receipts.filter((r) => r.receiptClass !== 'DUPLICATE');
  const receiptsDone = receiptPool.filter((r) => r.receiptClass === 'READY' || r.receiptClass === 'UNDER_AIO_REVIEW').length;
  const fleet = fleetReadiness(q).filter((v) => v.vehicle.operated !== false);
  const mileageDone = fleet.filter((v) => v.quality === 'VERIFIED' || v.quality === 'AIO_CHECKING' || v.quality === 'AIO_BUILDING').length;
  const vehiclesDone = q.vehiclesConfirmedAt ? 1 : 0;
  const frac = (done: number, total: number) => (total === 0 ? 0 : done / total);
  const pct = Math.floor(((frac(receiptsDone, receiptPool.length) + frac(mileageDone, fleet.length) + vehiclesDone) / 3) * 100);
  return {
    pct,
    receipts: { done: receiptsDone, total: receiptPool.length },
    mileage: { done: mileageDone, total: fleet.length },
    vehicles: { done: vehiclesDone, total: 1 },
  };
}

export type IftaCompartment = 'receipts' | 'mileage' | 'vehicles' | 'approval';

export interface IftaOpenItem {
  id: string;
  compartment: IftaCompartment;
  title: string;
  detail: string;
  action: string;
  /** Blocks AIO review (moves the quarter to NEEDS_CLIENT). Duplicates and approval are not blockers. */
  blocking: boolean;
  requestedByAio: boolean;
  receiptId?: string;
  vehicleId?: string;
}

export function clientOpenItems(q: IftaQuarterCase, now: Date): IftaOpenItem[] {
  const items: IftaOpenItem[] = [];
  const unit = (id: string | null) => q.vehicles.find((v) => v.id === id)?.unit ?? 'a truck';
  for (const r of q.receipts) {
    const requestedByAio = Boolean(r.flag?.requestedByStaffId);
    if (r.receiptClass === 'NEEDS_YOU') {
      items.push({ id: `item-${r.id}`, compartment: 'receipts', title: r.flag?.question ?? 'Answer a question about this receipt', detail: receiptLine(r, q.vehicles), action: 'Answer', blocking: true, requestedByAio, receiptId: r.id });
    } else if (r.receiptClass === 'UNREADABLE') {
      items.push({ id: `item-${r.id}`, compartment: 'receipts', title: `Retake the unreadable receipt${r.purchaseDate ? ` from ${formatShortDate(r.purchaseDate)}` : ''}`, detail: r.flag?.reason ?? IFTA_RECEIPT_CLASS_RULES.UNREADABLE, action: 'Retake photo', blocking: true, requestedByAio, receiptId: r.id });
    } else if (r.receiptClass === 'POSSIBLE_MISSING') {
      items.push({ id: `item-${r.id}`, compartment: 'receipts', title: `Add the missing ${jurisdictionName(r.jurisdiction)} receipt for ${unit(r.vehicleId)}`, detail: r.flag?.reason ?? IFTA_RECEIPT_CLASS_RULES.POSSIBLE_MISSING, action: 'Resolve', blocking: true, requestedByAio, receiptId: r.id });
    } else if (r.receiptClass === 'DUPLICATE') {
      items.push({ id: `item-${r.id}`, compartment: 'receipts', title: `Confirm a duplicate ${r.vendor ?? ''} receipt`.replace(/\s+/g, ' '), detail: r.flag?.reason ?? IFTA_RECEIPT_CLASS_RULES.DUPLICATE, action: 'Review', blocking: false, requestedByAio: false, receiptId: r.id });
    }
  }
  const ended = periodEnded(q, now);
  if (!q.vehiclesConfirmedAt) {
    items.push({ id: 'item-vehicles', compartment: 'vehicles', title: `Confirm which trucks ran in Q${q.quarter}`, detail: `${q.vehicles.length} truck${q.vehicles.length === 1 ? '' : 's'} pre-filled from your fleet`, action: 'Confirm trucks', blocking: ended, requestedByAio: false });
  }
  for (const v of fleetReadiness(q)) {
    if (v.vehicle.operated === false) continue;
    if (v.quality === 'MISSING') {
      items.push({ id: `item-miles-${v.vehicle.id}`, compartment: 'mileage', title: `Add ${v.vehicle.unit} miles by state`, detail: ended ? 'Upload the ELD report, a spreadsheet, or enter miles by state' : `Expected after ${formatShortDate(q.periodEnd)} — the quarter is still running`, action: 'Add miles', blocking: ended, requestedByAio: false, vehicleId: v.vehicle.id });
    } else if (v.quality === 'ESTIMATE') {
      items.push({ id: `item-miles-${v.vehicle.id}`, compartment: 'mileage', title: `Replace the ${v.vehicle.unit} estimate with your ELD report`, detail: 'Load miles from Dispatch are an estimate — they can never be filed', action: 'Upload ELD report', blocking: ended, requestedByAio: false, vehicleId: v.vehicle.id });
    }
  }
  if (q.state === 'AWAITING_APPROVAL') {
    items.push({ id: 'item-approval', compartment: 'approval', title: `Approve your ${quarterLabel(q)} return`, detail: 'AIO files only after you approve', action: 'Review and approve', blocking: false, requestedByAio: true });
  }
  return items;
}

export function blockingItems(q: IftaQuarterCase, now: Date): IftaOpenItem[] {
  return clientOpenItems(q, now).filter((i) => i.blocking);
}

/**
 * Collection-phase state from the records (contract transitions: COLLECTING ⇄ NEEDS_CLIENT on flags, OVERDUE_RISK
 * inside 10 days of the due date). Review / approval / filing states are moved only by actor actions.
 */
export function effectiveState(q: IftaQuarterCase, now: Date): IftaStateId {
  if (!COLLECTION_STATES.includes(q.state)) return q.state;
  const hasRecords = q.receipts.length > 0 || q.mileage.length > 0;
  const dueSoon = periodEnded(q, now) && daysUntil(q.dueDate, now) <= 10;
  if (!hasRecords) return dueSoon ? 'OVERDUE_RISK' : 'QUARTER_OPEN';
  const blocking = blockingItems(q, now).length;
  if (dueSoon && (blocking > 0 || packetCompleteness(q, now).pct < 100)) return 'OVERDUE_RISK';
  if (blocking > 0) return 'NEEDS_CLIENT';
  return 'COLLECTING';
}

export interface SendCheck {
  allowed: boolean;
  reasons: string[];
}

/** SEND QUARTER TO AIO — every vehicle has a mileage source, flags resolved, quarter ended (contract transition). */
export function canSendToAio(q: IftaQuarterCase, now: Date): SendCheck {
  const reasons: string[] = [];
  const state = effectiveState(q, now);
  if (!['COLLECTING', 'OVERDUE_RISK'].includes(state) && state !== 'NEEDS_CLIENT') reasons.push('This quarter is already with AIO.');
  if (!periodEnded(q, now)) reasons.push(`Q${q.quarter} is still running — send it after ${formatShortDate(q.periodEnd)}.`);
  const blocking = blockingItems(q, now);
  if (blocking.length > 0) reasons.push(`${blocking.length} item${blocking.length === 1 ? '' : 's'} still need${blocking.length === 1 ? 's' : ''} you.`);
  if (!q.receipts.some((r) => r.receiptClass === 'READY')) reasons.push('Add at least one fuel receipt.');
  return { allowed: reasons.length === 0, reasons };
}

/* ───────────────────────────── stages (the six-step quarter) ───────────────────────────── */

export type StageStatus = 'done' | 'current' | 'blocked' | 'upcoming';

export interface IftaStage {
  id: 'receipts' | 'mileage' | 'vehicles' | 'review' | 'approval' | 'filed';
  label: string;
  status: StageStatus;
  note: string;
}

export function quarterStages(q: IftaQuarterCase, now: Date): IftaStage[] {
  const state = effectiveState(q, now);
  const packet = packetCompleteness(q, now);
  const items = clientOpenItems(q, now);
  const blockedIn = (c: IftaCompartment) => items.some((i) => i.compartment === c && i.blocking);
  const submitted = INPUTS_LOCKED_STATES.includes(state);
  const compartment = (c: 'receipts' | 'mileage' | 'vehicles', label: string, done: boolean, note: string): IftaStage => ({
    id: c,
    label,
    status: submitted ? 'done' : blockedIn(c) ? 'blocked' : done ? 'done' : 'current',
    note,
  });
  const reviewStatus: StageStatus =
    state === 'AIO_REVIEW' || state === 'RECONCILING' || state === 'FILING_REJECTED'
      ? 'current'
      : ['AWAITING_APPROVAL', 'FILING', 'FILED', 'ARCHIVED'].includes(state)
        ? 'done'
        : q.corrections.some((c) => !c.resolvedAt)
          ? 'blocked'
          : 'upcoming';
  return [
    compartment('receipts', 'Fuel receipts', packet.receipts.total > 0 && packet.receipts.done === packet.receipts.total, `${packet.receipts.done} of ${packet.receipts.total} ready`),
    compartment('mileage', 'Mileage', packet.mileage.total > 0 && packet.mileage.done === packet.mileage.total, `${packet.mileage.done} of ${packet.mileage.total} trucks`),
    compartment('vehicles', 'Vehicles', packet.vehicles.done === 1, q.vehiclesConfirmedAt ? 'Confirmed' : 'Confirm trucks'),
    { id: 'review', label: 'AIO review', status: reviewStatus, note: reviewStatus === 'blocked' ? 'Paused — waiting on you' : reviewStatus === 'current' ? 'In progress' : reviewStatus === 'done' ? 'Reviewed' : 'After you send' },
    {
      id: 'approval',
      label: 'Your approval',
      status: state === 'AWAITING_APPROVAL' ? 'current' : ['FILING', 'FILED', 'ARCHIVED'].includes(state) ? 'done' : 'upcoming',
      note: q.returnSummary?.approvedAt ? `Approved ${formatShortDate(q.returnSummary.approvedAt)}` : state === 'AWAITING_APPROVAL' ? 'Waiting on you' : 'Return summary',
    },
    {
      id: 'filed',
      label: 'Filed',
      status: state === 'FILING' ? 'current' : state === 'FILED' || state === 'ARCHIVED' ? 'done' : 'upcoming',
      note: q.filing ? `Filed ${formatShortDate(q.filing.filedAt)}` : `Due ${formatShortDate(q.dueDate)}`,
    },
  ];
}

/* ───────────────────────────── client voice ───────────────────────────── */

const UNDER_REVIEW = IFTA_EXPERIENCE.perspectives.client.under_review;

/** "What is AIO doing?" — answered on every screen (sprint §26). */
export function aioDoingLine(q: IftaQuarterCase, now: Date, reviewerName: string): string {
  const state = effectiveState(q, now);
  switch (state) {
    case 'QUARTER_OPEN':
    case 'COLLECTING':
      return `Checking every receipt as it arrives and keeping ${quarterLabel(q)} ready for review.`;
    case 'NEEDS_CLIENT':
    case 'OVERDUE_RISK':
      return q.corrections.some((c) => !c.resolvedAt)
        ? `${reviewerName} paused the review until these are answered — everything else is checked.`
        : 'Holding the review until these items are resolved.';
    case 'AIO_REVIEW':
      return `${reviewerName} is ${UNDER_REVIEW[0].replace(/^AIO /, '')}.`;
    case 'RECONCILING':
      return `${reviewerName} is ${UNDER_REVIEW[1].replace(/^AIO /, '')}.`;
    case 'AWAITING_APPROVAL':
      return 'Waiting for your approval — nothing is filed until you approve.';
    case 'FILING':
      return `${reviewerName} is ${UNDER_REVIEW[2].replace(/^AIO /, '').replace('your base jurisdiction', q.baseJurisdictionName)}.`;
    case 'FILED':
      return q.payment.status === 'PAYMENT_PENDING' ? 'Confirming your tax payment with the base jurisdiction.' : 'Recording payment status and sealing the packet.';
    case 'ARCHIVED':
      return 'Nothing — this quarter is closed and kept in your Vault.';
    case 'FILING_REJECTED':
      return `Correcting the return ${q.baseJurisdictionName} sent back.`;
    default:
      return '';
  }
}

/** "What happens next?" (sprint §26). */
export function nextStepLine(q: IftaQuarterCase, now: Date): string {
  const state = effectiveState(q, now);
  switch (state) {
    case 'QUARTER_OPEN':
    case 'COLLECTING':
      return periodEnded(q, now)
        ? `When everything is in, send ${quarterLabel(q)} to AIO. AIO reviews, you approve, AIO files before ${formatShortDate(q.dueDate)}.`
        : `${quarterLabel(q)} closes ${formatShortDate(q.periodEnd)}. Then upload each truck’s ELD report and send the quarter to AIO.`;
    case 'NEEDS_CLIENT':
    case 'OVERDUE_RISK':
      return `Resolve these, then send ${quarterLabel(q)} back to AIO. Due ${formatLongDate(q.dueDate)}.`;
    case 'AIO_REVIEW':
    case 'RECONCILING':
      return 'You’ll get the return summary to approve — miles, gallons and tax by state.';
    case 'AWAITING_APPROVAL':
      return `After you approve, AIO files with ${q.baseJurisdictionName} and the confirmation lands in your Vault.`;
    case 'FILING':
      return 'You’ll see the confirmation number here and in your Vault.';
    case 'FILED':
    case 'ARCHIVED':
      return fillTemplate(IFTA_EXPERIENCE.next_step, { quarter: q.quarter, year: q.year });
    default:
      return '';
  }
}

export function nextItemLine(q: IftaQuarterCase, now: Date): string {
  const state = effectiveState(q, now);
  const items = clientOpenItems(q, now);
  if (state === 'QUARTER_OPEN') return `Add your first ${quarterLabel(q)} fuel receipt`;
  if (COLLECTION_STATES.includes(state)) {
    const blocking = items.find((i) => i.blocking);
    if (blocking) return blocking.title;
    if (canSendToAio(q, now).allowed) return `Everything is in — send ${quarterLabel(q)} to AIO`;
    if (!periodEnded(q, now)) {
      const captured = q.receipts.filter((r) => r.source !== 'SYSTEM_GAP').length;
      return `Keep snapping receipts at the pump — ${captured} captured so far`;
    }
    const pending = items.find((i) => i.compartment !== 'approval');
    return pending ? pending.title : `Keep capturing ${quarterLabel(q)} receipts as you fuel`;
  }
  if (state === 'AWAITING_APPROVAL') return `Approve your ${quarterLabel(q)} return`;
  return stateMeaning(state, 'CLIENT', templateVars(q, now));
}

/* ───────────────────────────── client ⇄ staff mirror ───────────────────────────── */

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Client-facing status line, e.g. “NEEDS YOU — 2 RECEIPTS”. */
export function clientStatusLine(q: IftaQuarterCase, now: Date): string {
  const state = effectiveState(q, now);
  const blocking = blockingItems(q, now);
  const receipts = blocking.filter((i) => i.compartment === 'receipts').length;
  const miles = blocking.filter((i) => i.compartment === 'mileage').length;
  const vehicles = blocking.filter((i) => i.compartment === 'vehicles').length;
  const parts = [receipts ? plural(receipts, 'receipt') : '', miles ? `${plural(miles, 'truck')} without miles` : '', vehicles ? 'truck list' : ''].filter(Boolean);
  switch (state) {
    case 'NEEDS_CLIENT':
      return `Needs you — ${parts.join(' · ')}`;
    case 'OVERDUE_RISK':
      return `Due in ${plural(Math.max(0, daysUntil(q.dueDate, now)), 'day')} — ${parts.length ? parts.join(' · ') : 'finish the quarter'}`;
    case 'QUARTER_OPEN':
    case 'COLLECTING':
      return `${packetCompleteness(q, now).pct}% ready · due ${formatShortDate(q.dueDate)}`;
    default:
      return stateMeaning(state, 'CLIENT', templateVars(q, now));
  }
}

export type StaffBucket = 'NEEDS_REVIEW' | 'BLOCKED' | 'AWAITING_CLIENT' | 'READY_TO_FILE' | 'FILED' | 'PAYMENT_PENDING' | 'COMPLETE';

/** Contract hub buckets, with the sprint's FILED / PAYMENT PENDING split of the COMPLETE bucket. */
export const STAFF_BUCKETS: { id: StaffBucket; label: string; fromContract: boolean }[] = [
  { id: 'NEEDS_REVIEW', label: 'Needs review', fromContract: true },
  { id: 'BLOCKED', label: 'Blocked', fromContract: true },
  { id: 'AWAITING_CLIENT', label: 'Awaiting client', fromContract: true },
  { id: 'READY_TO_FILE', label: 'Ready to file', fromContract: true },
  { id: 'FILED', label: 'Filed', fromContract: false },
  { id: 'PAYMENT_PENDING', label: 'Payment pending', fromContract: false },
  { id: 'COMPLETE', label: 'Complete', fromContract: true },
];

export function staffBucket(q: IftaQuarterCase, now: Date): StaffBucket {
  const state = effectiveState(q, now);
  if (state === 'FILED') return q.payment.status === 'PAYMENT_PENDING' ? 'PAYMENT_PENDING' : 'FILED';
  const bucket = staffHubBucketFor(state);
  if (bucket === 'COMPLETE') return 'COMPLETE';
  return (bucket as StaffBucket | null) ?? 'AWAITING_CLIENT';
}

/** Staff mirror of the client line, e.g. “AWAITING CLIENT — 2 RECEIPT CORRECTIONS”. */
export function staffStatusLine(q: IftaQuarterCase, now: Date): string {
  const state = effectiveState(q, now);
  const bucket = STAFF_BUCKETS.find((b) => b.id === staffBucket(q, now))!.label;
  const blocking = blockingItems(q, now);
  const corrections = blocking.filter((i) => i.compartment === 'receipts' && i.receiptId && q.receipts.find((r) => r.id === i.receiptId)?.receiptClass !== 'POSSIBLE_MISSING').length;
  const missing = blocking.filter((i) => i.receiptId && q.receipts.find((r) => r.id === i.receiptId)?.receiptClass === 'POSSIBLE_MISSING').length;
  const miles = blocking.filter((i) => i.compartment === 'mileage').length;
  const openDiscrepancies = q.discrepancies.filter((d) => d.status === 'OPEN').length;
  switch (state) {
    case 'NEEDS_CLIENT':
    case 'OVERDUE_RISK': {
      const parts = [
        corrections ? plural(corrections, 'receipt correction') : '',
        missing ? plural(missing, 'possible missing receipt') : '',
        miles ? `${plural(miles, 'truck')} without verified miles` : '',
        blocking.some((i) => i.compartment === 'vehicles') ? 'fleet unconfirmed' : '',
      ].filter(Boolean);
      return `${bucket} — ${parts.join(' · ') || 'flags open'}`;
    }
    case 'QUARTER_OPEN':
      return `${bucket} — collection window open, nothing received`;
    case 'COLLECTING':
      return `${bucket} — ${packetCompleteness(q, now).pct}% of packet received`;
    case 'AIO_REVIEW':
      return `${bucket} — records ready for review`;
    case 'RECONCILING':
      return `${bucket} — ${
        openDiscrepancies === 0
          ? 'discrepancies cleared · prepare summary'
          : `${openDiscrepancies} open discrepanc${openDiscrepancies === 1 ? 'y' : 'ies'}`
      }`;
    case 'AWAITING_APPROVAL':
      return `${bucket} — return approval sent ${q.returnSummary?.sentForApprovalAt ? formatShortDate(q.returnSummary.sentForApprovalAt) : ''}`.trim();
    case 'FILING':
      return `${bucket} — approved ${q.returnSummary?.approvedAt ? formatShortDate(q.returnSummary.approvedAt) : ''} · file with ${q.baseJurisdictionName}`;
    case 'FILED':
      return q.payment.status === 'PAYMENT_PENDING' ? `${bucket} — ${q.payment.note ?? 'tax payment pending'}` : `${bucket} — record payment status`;
    case 'ARCHIVED':
      return `${bucket} — packet sealed · audit trail closed`;
    default:
      return `${bucket} — ${stateMeaning(state, 'FOUNDER_STAFF', templateVars(q, now))}`;
  }
}

export function staffNextAction(q: IftaQuarterCase, now: Date): string {
  return primaryCta(effectiveState(q, now), 'FOUNDER_STAFF', templateVars(q, now));
}

const BUCKET_PRIORITY: Record<StaffBucket, number> = {
  BLOCKED: 0,
  NEEDS_REVIEW: 1,
  READY_TO_FILE: 2,
  AWAITING_CLIENT: 3,
  PAYMENT_PENDING: 4,
  FILED: 5,
  COMPLETE: 6,
};

/** Queue order: due date × readiness (contract work_queue). */
export function sortStaffQueue(cases: IftaQuarterCase[], now: Date): IftaQuarterCase[] {
  return [...cases].sort(
    (a, b) =>
      a.dueDate.localeCompare(b.dueDate) ||
      BUCKET_PRIORITY[staffBucket(a, now)] - BUCKET_PRIORITY[staffBucket(b, now)] ||
      packetCompleteness(a, now).pct - packetCompleteness(b, now).pct,
  );
}

/* ───────────────────────────── staff case-file instruments ───────────────────────────── */

/** Receipts per truck per month — gaps are visible (contract staff missing_inputs). */
export function receiptHeatStrip(q: IftaQuarterCase): { vehicle: IftaVehicle; months: { key: string; label: string; count: number }[] }[] {
  const months = monthsOfQuarter(q);
  return q.vehicles.map((vehicle) => ({
    vehicle,
    months: months.map((m) => ({
      ...m,
      count: q.receipts.filter((r) => r.vehicleId === vehicle.id && r.purchaseDate?.startsWith(m.key) && r.receiptClass !== 'DUPLICATE').length,
    })),
  }));
}

/** Jurisdictions with miles but no fuel — candidates for POSSIBLE_MISSING. */
export function milesWithoutFuel(q: IftaQuarterCase): { vehicle: IftaVehicle; state: string; miles: number }[] {
  return fleetReadiness(q).flatMap((v) => v.jurisdictions.filter((j) => j.miles > 0 && j.gallons === 0).map((j) => ({ vehicle: v.vehicle, state: j.state, miles: j.miles })));
}

export function stateClassOf(q: IftaQuarterCase, now: Date) {
  return experienceState(effectiveState(q, now)).state_class;
}
