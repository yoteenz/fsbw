/**
 * IFTA family view model — pure projections of the canonical quarter case for the authority-led modules
 * (metrics rail, filing workflow, jurisdiction map, fuel donut, uploads, activity, tasks, health, queue lanes).
 * Read-only: nothing here computes tax or mutates a case. Tax figures come only from the staff-prepared return
 * summary (founder decision D-TAX-FIGURES); public figures are a static, labelled SAMPLE (D-PUBLIC-SAMPLE-DATA).
 */
import {
  READINESS_COPY,
  STAFF_BUCKETS,
  blockingItems,
  clientOpenItems,
  effectiveState,
  fleetReadiness,
  jurisdictionName,
  packetCompleteness,
  quarterReadiness,
  quarterStages,
  receiptTotals,
  countedReceipts,
  sortStaffQueue,
  staffBucket,
  taxPositionLabel,
  type IftaStage,
  type StaffBucket,
} from '../iftaDerive';
import { daysUntil, formatShortDate, lastEndedQuarter } from '../iftaDates';
import type { IftaStateId } from '../experience/iftaExperience';
import type { IftaAuditEvent, IftaQuarterCase } from '../iftaTypes';
import type { IftaIconName } from './IftaIcon';

/* ───────────────────────────── metrics rail ───────────────────────────── */

export type IftaTaxSlot =
  | { kind: 'PENDING'; label: string; value: string; note: string }
  | { kind: 'DUE' | 'CREDIT' | 'NONE'; label: string; value: string; note: string };

export interface IftaMetrics {
  miles: number;
  gallons: number;
  jurisdictions: number;
  tax: IftaTaxSlot;
}

export function quarterMetrics(q: IftaQuarterCase): IftaMetrics {
  const fleet = fleetReadiness(q).filter((v) => v.vehicle.operated !== false);
  const miles = fleet.reduce((s, v) => s + v.miles, 0);
  const states = new Set<string>();
  for (const v of fleet) for (const j of v.jurisdictions) if (j.miles > 0 || j.gallons > 0) states.add(j.state);
  for (const r of countedReceipts(q)) states.add(r.jurisdiction);
  const tax: IftaTaxSlot = q.returnSummary
    ? (() => {
        const p = taxPositionLabel(q.returnSummary.netPosition);
        return { kind: p.kind, label: p.label, value: p.amount, note: 'Staff-prepared return summary' };
      })()
    : { kind: 'PENDING', label: 'Tax due / credit', value: 'Pending', note: 'AIO preparation' };
  return { miles, gallons: receiptTotals(q).gallons, jurisdictions: states.size, tax };
}

/** Public specimen — static and labelled SAMPLE; never bound to a client record. */
export const PUBLIC_SAMPLE_QUARTER = {
  label: 'Q3 2026',
  period: 'Jul 1 – Sep 30, 2026',
  miles: 48320,
  gallons: 7420,
  jurisdictions: 8,
  tax: { label: 'Tax due', value: '$2,184.32', note: 'Staff-prepared' },
} as const;

/* ───────────────────────────── shares (map · bars · donut) ───────────────────────────── */

export interface IftaShare {
  code: string;
  name: string;
  value: number;
  pct: number;
}

function toShares(entries: [string, number][], top: number): IftaShare[] {
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total <= 0) return [];
  const sorted = [...entries].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top);
  const rows: IftaShare[] = head.map(([code, value]) => ({ code, name: jurisdictionName(code), value, pct: (value / total) * 100 }));
  if (rest.length) {
    const value = rest.reduce((s, [, v]) => s + v, 0);
    rows.push({ code: 'OTHER', name: 'Other', value, pct: (value / total) * 100 });
  }
  // Largest-remainder rounding so the legend always sums to 100.
  const floors = rows.map((r) => Math.floor(r.pct));
  let left = 100 - floors.reduce((s, v) => s + v, 0);
  const order = rows.map((r, i) => [r.pct - floors[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i] += 1;
    left -= 1;
  }
  return rows.map((r, i) => ({ ...r, pct: floors[i] }));
}

/** Miles by jurisdiction across operated trucks (recorded mileage only). */
export function mileageShares(q: IftaQuarterCase, top = 5): IftaShare[] {
  const byState = new Map<string, number>();
  for (const v of fleetReadiness(q)) {
    if (v.vehicle.operated === false) continue;
    for (const j of v.jurisdictions) byState.set(j.state, (byState.get(j.state) ?? 0) + j.miles);
  }
  return toShares([...byState.entries()], top);
}

/** Gallons by purchase jurisdiction across counted receipts. */
export function fuelShares(q: IftaQuarterCase, top = 5): IftaShare[] {
  const byState = new Map<string, number>();
  for (const r of countedReceipts(q)) byState.set(r.jurisdiction, (byState.get(r.jurisdiction) ?? 0) + (r.gallons ?? 0));
  return toShares([...byState.entries()].map(([k, v]) => [k, Math.round(v * 10) / 10]), top);
}

/** Every state with recorded miles, for the map fill (share of total miles, 0–1). */
export function mileageIntensity(q: IftaQuarterCase): Record<string, number> {
  const byState = new Map<string, number>();
  for (const v of fleetReadiness(q)) {
    if (v.vehicle.operated === false) continue;
    for (const j of v.jurisdictions) byState.set(j.state, (byState.get(j.state) ?? 0) + j.miles);
  }
  const max = Math.max(0, ...byState.values());
  return Object.fromEntries([...byState.entries()].filter(([, v]) => v > 0).map(([k, v]) => [k, max ? v / max : 0]));
}

/* ───────────────────────────── filing workflow (four phases) ───────────────────────────── */

export type IftaPhaseStatus = 'done' | 'current' | 'blocked' | 'upcoming';

export interface IftaPhase {
  index: number;
  label: string;
  status: IftaPhaseStatus;
  statusLabel: string;
  date: string | null;
  details: string[];
}

const PHASE_OF: Record<IftaStateId, number> = {
  NOT_ENROLLED: 0,
  QUARTER_OPEN: 0,
  COLLECTING: 0,
  NEEDS_CLIENT: 0,
  OVERDUE_RISK: 0,
  AIO_REVIEW: 1,
  RECONCILING: 1,
  FILING_REJECTED: 1,
  AWAITING_APPROVAL: 2,
  FILING: 3,
  FILED: 3,
  ARCHIVED: 3,
};

const STATUS_LABEL: Record<IftaPhaseStatus, string> = { done: 'Complete', current: 'In progress', blocked: 'Needs you', upcoming: 'Pending' };

/** Founder decision D-PROGRESS-PHASES: four reference phases mapped over the contract states. */
export function filingPhases(q: IftaQuarterCase, now: Date, actor: 'CLIENT' | 'STAFF' = 'CLIENT'): IftaPhase[] {
  const state = effectiveState(q, now);
  const current = PHASE_OF[state] ?? 0;
  const allDone = state === 'FILED' || state === 'ARCHIVED';
  const stages = quarterStages(q, now);
  const stage = (id: IftaStage['id']) => stages.find((s) => s.id === id)!;
  const blocked0 = state === 'NEEDS_CLIENT' || state === 'OVERDUE_RISK';
  const statusFor = (i: number): IftaPhaseStatus => {
    if (allDone || i < current) return 'done';
    if (i > current) return 'upcoming';
    if (i === 0 && blocked0) return 'blocked';
    if (i === 1 && state === 'FILING_REJECTED') return 'blocked';
    return 'current';
  };
  const labelFor = (s: IftaPhaseStatus) => (s === 'blocked' && actor === 'STAFF' ? 'Waiting on client' : STATUS_LABEL[s]);
  const raw: Omit<IftaPhase, 'statusLabel'>[] = [
    {
      index: 1,
      label: 'Data collection',
      status: statusFor(0),
      date: q.submittedAt ? formatShortDate(q.submittedAt) : null,
      details: [`Receipts · ${stage('receipts').note}`, `Mileage · ${stage('mileage').note}`, `Vehicles · ${stage('vehicles').note}`],
    },
    {
      index: 2,
      label: 'AIO preparation',
      status: statusFor(1),
      date: q.reviewStartedAt ? formatShortDate(q.reviewStartedAt) : null,
      details: [stage('review').note],
    },
    {
      index: 3,
      label: actor === 'CLIENT' ? 'Your review & approval' : 'Client review',
      status: statusFor(2),
      date: q.returnSummary?.sentForApprovalAt ? formatShortDate(q.returnSummary.sentForApprovalAt) : null,
      details: [stage('approval').note],
    },
    {
      index: 4,
      label: 'File & confirm',
      status: statusFor(3),
      date: q.filing ? formatShortDate(q.filing.filedAt) : formatShortDate(q.dueDate),
      details: [stage('filed').note],
    },
  ];
  return raw.map((p) => ({ ...p, statusLabel: labelFor(p.status) }));
}

/* ───────────────────────────── checklist (six stages) ───────────────────────────── */

export type IftaClientTab = 'PROGRESS' | 'FUEL PURCHASES' | 'MILEAGE' | 'VEHICLES' | 'JURISDICTIONS' | 'DOCUMENTS';

export interface IftaChecklistRow {
  id: IftaStage['id'];
  label: string;
  note: string;
  status: IftaStage['status'];
  icon: IftaIconName;
  tab: IftaClientTab;
}

const STAGE_PRESENTATION: Record<IftaStage['id'], { label: string; icon: IftaIconName; tab: IftaClientTab }> = {
  receipts: { label: 'Fuel purchases', icon: 'receipt', tab: 'FUEL PURCHASES' },
  mileage: { label: 'Mileage by jurisdiction', icon: 'miles', tab: 'MILEAGE' },
  vehicles: { label: 'Vehicle & trip data', icon: 'truck', tab: 'VEHICLES' },
  review: { label: 'IFTA return preparation', icon: 'doc', tab: 'JURISDICTIONS' },
  approval: { label: 'Your review & approval', icon: 'done', tab: 'JURISDICTIONS' },
  filed: { label: 'Filing & confirmation', icon: 'send', tab: 'DOCUMENTS' },
};

export function checklistRows(q: IftaQuarterCase, now: Date): IftaChecklistRow[] {
  return quarterStages(q, now).map((s) => ({ id: s.id, note: s.note, status: s.status, ...STAGE_PRESENTATION[s.id] }));
}

export const STAGE_STATUS_LABEL: Record<IftaStage['status'], string> = { done: 'Complete', current: 'In progress', blocked: 'Needs you', upcoming: 'Pending' };

/* ───────────────────────────── uploads · activity · tasks ───────────────────────────── */

export interface IftaUploadRow {
  id: string;
  label: string;
  detail: string;
  at: string;
  kind: 'MILEAGE' | 'RECEIPTS';
}

export function recentUploads(q: IftaQuarterCase, limit = 3): IftaUploadRow[] {
  const rows: IftaUploadRow[] = [];
  for (const m of q.mileage) {
    if (!m.fileLabel) continue;
    const unit = q.vehicles.find((v) => v.id === m.vehicleId)?.unit;
    rows.push({ id: m.id, label: m.fileLabel, detail: [unit, `${m.entries.length} state${m.entries.length === 1 ? '' : 's'}`, formatShortDate(m.addedAt)].filter(Boolean).join(' · '), at: m.addedAt, kind: 'MILEAGE' });
  }
  const batches = new Map<string, number>();
  for (const r of q.receipts) {
    if (r.source === 'SYSTEM_GAP') continue;
    const day = r.addedAt.slice(0, 10);
    batches.set(day, (batches.get(day) ?? 0) + 1);
  }
  for (const [day, count] of batches) {
    rows.push({ id: `receipts-${day}`, label: 'Fuel receipts', detail: `${count} file${count === 1 ? '' : 's'} · ${formatShortDate(day)}`, at: `${day}T23:59:59.000Z`, kind: 'RECEIPTS' });
  }
  return rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export function recentActivity(q: IftaQuarterCase, limit = 4, actor?: IftaAuditEvent['actor']): IftaAuditEvent[] {
  return [...q.audit]
    .filter((a) => !actor || a.actor === actor)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

export interface IftaTaskRow {
  id: string;
  label: string;
  detail: string;
  owner: 'CLIENT' | 'AIO';
  done: boolean;
}

/** Client-safe quarter tasks: the open items AIO needs from the client (D-CLIENT-DESKTOP-STAFF-MODULES). */
export function clientTasks(q: IftaQuarterCase, now: Date): IftaTaskRow[] {
  return clientOpenItems(q, now).map((i) => ({ id: i.id, label: i.title, detail: i.action, owner: 'CLIENT', done: false }));
}

/** Staff quarter tasks: client items, open discrepancies, correction requests (resolved ones stay listed as done). */
export function staffTasks(q: IftaQuarterCase, now: Date): IftaTaskRow[] {
  const client = clientOpenItems(q, now).map((i) => ({ id: i.id, label: i.title, detail: `Client · ${i.action}`, owner: 'CLIENT' as const, done: false }));
  const discrepancies = q.discrepancies.map((d) => ({ id: d.id, label: d.detail, detail: `AIO · ${d.kind.replace(/_/g, ' ').toLowerCase()}`, owner: 'AIO' as const, done: d.status === 'RESOLVED' }));
  const corrections = q.corrections.map((c) => ({ id: c.id, label: c.message, detail: `Correction request · ${formatShortDate(c.requestedAt)}`, owner: 'AIO' as const, done: Boolean(c.resolvedAt) }));
  return [...client, ...discrepancies, ...corrections].sort((a, b) => Number(a.done) - Number(b.done));
}

export interface IftaDateRow {
  label: string;
  value: string;
  icon: IftaIconName;
}

export function importantDates(q: IftaQuarterCase): IftaDateRow[] {
  const rows: IftaDateRow[] = [{ label: 'Return period', value: `${formatShortDate(q.periodStart)} – ${formatShortDate(q.periodEnd)}`, icon: 'calendar' }];
  if (q.submittedAt) rows.push({ label: 'Sent to AIO', value: formatShortDate(q.submittedAt), icon: 'send' });
  if (q.reviewStartedAt) rows.push({ label: 'Review started', value: formatShortDate(q.reviewStartedAt), icon: 'clipboard' });
  if (q.returnSummary?.sentForApprovalAt) rows.push({ label: 'Sent for approval', value: formatShortDate(q.returnSummary.sentForApprovalAt), icon: 'done' });
  rows.push({ label: 'File & pay deadline', value: formatShortDate(q.dueDate), icon: 'clock' });
  return rows;
}

export interface IftaFlagRow {
  id: string;
  label: string;
  detail: string;
  tone: 'ok' | 'warn' | 'alert';
}

export function riskFlags(q: IftaQuarterCase, now: Date): IftaFlagRow[] {
  const rows: IftaFlagRow[] = [];
  for (const d of q.discrepancies.filter((x) => x.status === 'OPEN')) rows.push({ id: d.id, label: d.kind.replace(/_/g, ' '), detail: d.detail, tone: 'warn' });
  const blocking = blockingItems(q, now);
  if (blocking.length) rows.push({ id: 'blocking', label: `${blocking.length} client item${blocking.length === 1 ? '' : 's'} open`, detail: blocking.map((b) => b.title).slice(0, 2).join(' · '), tone: 'alert' });
  for (const v of fleetReadiness(q)) if (v.mpgOutlier) rows.push({ id: `mpg-${v.vehicle.id}`, label: 'MPG outside band', detail: `${v.vehicle.unit} · ${v.mpg} mpg vs ${v.vehicle.priorMpg} prior`, tone: 'warn' });
  if (!rows.length) rows.push({ id: 'none', label: 'No issues detected', detail: 'All recorded data looks consistent', tone: 'ok' });
  return rows;
}

/* ───────────────────────────── case health (staff) ───────────────────────────── */

export function caseHealth(q: IftaQuarterCase, now: Date) {
  const packet = packetCompleteness(q, now);
  const bucket = staffBucket(q, now);
  return {
    packet: packet.pct,
    receipts: `${packet.receipts.done}/${packet.receipts.total}`,
    mileage: `${packet.mileage.done}/${packet.mileage.total}`,
    vehicles: q.vehiclesConfirmedAt ? 'Confirmed' : 'Unconfirmed',
    readiness: READINESS_COPY[quarterReadiness(q)].client,
    bucket,
    bucketLabel: STAFF_BUCKETS.find((b) => b.id === bucket)!.label,
  };
}

/* ───────────────────────────── staff queue ───────────────────────────── */

export const LANE_ORDER: StaffBucket[] = ['BLOCKED', 'NEEDS_REVIEW', 'READY_TO_FILE', 'AWAITING_CLIENT', 'PAYMENT_PENDING', 'FILED', 'COMPLETE'];

export const BUCKET_TONE: Record<StaffBucket, 'alert' | 'progress' | 'gold' | 'warn' | 'success' | 'muted'> = {
  BLOCKED: 'alert',
  NEEDS_REVIEW: 'progress',
  READY_TO_FILE: 'gold',
  AWAITING_CLIENT: 'warn',
  PAYMENT_PENDING: 'warn',
  FILED: 'success',
  COMPLETE: 'muted',
};

export const BUCKET_ICON: Record<StaffBucket, IftaIconName> = {
  BLOCKED: 'alert',
  NEEDS_REVIEW: 'clipboard',
  READY_TO_FILE: 'send',
  AWAITING_CLIENT: 'clock',
  PAYMENT_PENDING: 'coins',
  FILED: 'done',
  COMPLETE: 'archive',
};

export interface IftaQueueLane {
  bucket: StaffBucket;
  label: string;
  cases: IftaQuarterCase[];
}

/** Lanes by bucket priority; inside a lane the contract queue order (due date × readiness) is kept. */
export function queueLanes(cases: IftaQuarterCase[], now: Date): IftaQueueLane[] {
  const sorted = sortStaffQueue(cases, now);
  return LANE_ORDER.map((bucket) => ({
    bucket,
    label: STAFF_BUCKETS.find((b) => b.id === bucket)!.label,
    cases: sorted.filter((q) => staffBucket(q, now) === bucket),
  })).filter((l) => l.cases.length > 0);
}

export function queueSummary(cases: IftaQuarterCase[], now: Date) {
  const counts = Object.fromEntries(LANE_ORDER.map((b) => [b, 0])) as Record<StaffBucket, number>;
  for (const q of cases) counts[staffBucket(q, now)] += 1;
  const open = cases.length - counts.COMPLETE;
  const filing = lastEndedQuarter(now);
  const filingCases = cases.filter((q) => q.year === filing.year && q.quarter === filing.quarter);
  const due = filingCases[0]?.dueDate ?? null;
  return {
    counts,
    open,
    total: cases.length,
    filing: { label: `Q${filing.quarter} ${filing.year}`, cases: filingCases.length, due: due ? formatShortDate(due) : null, days: due ? Math.max(0, daysUntil(due, now)) : null },
    openDiscrepancies: cases.reduce((s, q) => s + q.discrepancies.filter((d) => d.status === 'OPEN').length, 0),
    openCorrections: cases.reduce((s, q) => s + q.corrections.filter((c) => !c.resolvedAt).length, 0),
  };
}

/** Upcoming deadlines across the queue (one row per distinct open due date). */
export function queueDeadlines(cases: IftaQuarterCase[], now: Date): { due: string; label: string; days: number; cases: number }[] {
  const open = cases.filter((q) => staffBucket(q, now) !== 'COMPLETE');
  const byDue = new Map<string, IftaQuarterCase[]>();
  for (const q of open) byDue.set(q.dueDate, [...(byDue.get(q.dueDate) ?? []), q]);
  return [...byDue.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([due, qs]) => ({ due: formatShortDate(due), label: `Q${qs[0].quarter} ${qs[0].year} returns`, days: Math.max(0, daysUntil(due, now)), cases: qs.length }));
}

export function initials(name: string): string {
  return name
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^(llc|inc|co|corp|ltd)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
