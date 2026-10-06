/**
 * IFTA actions — the contract's interaction grammar as reducers over a DemoStore draft.
 * Client verbs: TAKE PHOTO · UPLOAD · IMPORT · RESOLVE FLAG · SEND QUARTER TO AIO · APPROVE · ASK A QUESTION.
 * Staff verbs: RECONCILE · REQUEST CORRECTION · SEND FOR APPROVAL · FILE · record payment (→ ARCHIVE → next quarter).
 * Each reducer moves state only along a contract transition and emits to Inbox / Activity / Vault / staff.
 * Wrap with `runIftaAction` in the UI (updateDemoStore); call directly in tests.
 */
import type { DemoStore } from '../demo/demoTypes';
import { updateDemoStore } from '../demo/demoStore';
import { channelEvent, fillTemplate, type IftaStateId } from './experience/iftaExperience';
import { addDays, nextQuarter, quarterLabel, quarterPeriod } from './iftaDates';
import {
  COLLECTION_STATES,
  INPUTS_LOCKED_STATES,
  blockingItems,
  canSendToAio,
  effectiveState,
  fleetReadiness,
  jurisdictionName,
  latestMileageFor,
  milesWithoutFuel,
  quarterReadiness,
  vehicleReadiness,
} from './iftaDerive';
import {
  companyNameOf,
  emitActivity,
  emitClientNotice,
  emitStaffNotice,
  ensureThread,
  postThread,
  resolveClientNotices,
  sealPacketToVault,
  staffNameOf,
} from './iftaEvents';
import { stationsFor } from './iftaJurisdictions';
import { iftaContactName, returnSummaryFrom, seededRandom } from './iftaSeed';
import type {
  IftaCaptureMethod,
  IftaDiscrepancy,
  IftaMileageRecord,
  IftaMileageSourceId,
  IftaPaymentStatus,
  IftaQuarterCase,
  IftaReceipt,
} from './iftaTypes';

export class IftaActionError extends Error {}

const nowIso = (now: Date) => now.toISOString();

export function findQuarter(s: DemoStore, caseId: string): IftaQuarterCase {
  const q = s.iftaQuarters?.find((c) => c.id === caseId);
  if (!q) throw new IftaActionError(`IFTA quarter ${caseId} not found`);
  return q;
}

function audit(q: IftaQuarterCase, now: Date, actor: 'CLIENT' | 'FOUNDER_STAFF' | 'SYSTEM', actorName: string, action: string, note?: string) {
  q.audit.push({ id: `${q.id}-a${q.audit.length + 1}-${now.getTime().toString(36)}`, at: nowIso(now), actor, actorName, action, note });
}

function vars(q: IftaQuarterCase, count?: number) {
  return { quarter: q.quarter, year: q.year, count, client: '' };
}

function requireState(q: IftaQuarterCase, now: Date, allowed: IftaStateId[], verb: string) {
  const state = effectiveState(q, now);
  if (!allowed.includes(state)) throw new IftaActionError(`${verb} is not available while the quarter is ${state}.`);
}

function requireUnlocked(q: IftaQuarterCase, now: Date) {
  if (INPUTS_LOCKED_STATES.includes(effectiveState(q, now))) {
    throw new IftaActionError(`${quarterLabel(q)} is with AIO — inputs are locked.`);
  }
}

/** Record the derived collection-phase state (QUARTER_OPEN / COLLECTING / NEEDS_CLIENT / OVERDUE_RISK). */
function syncCollectionState(q: IftaQuarterCase, now: Date) {
  if (COLLECTION_STATES.includes(q.state)) q.state = effectiveState(q, now);
}

/* ───────────────────────────── demo parser (stands in for OCR / ELD parsing) ───────────────────────────── */

function parseReceipt(q: IftaQuarterCase, seedKey: string, opts: { jurisdiction?: string; vehicleId?: string | null; date?: string; method: IftaCaptureMethod | 'SYSTEM_GAP'; fileLabel?: string; now: Date }): IftaReceipt {
  const rng = seededRandom(`${q.id}:${seedKey}`);
  const operated = q.vehicles.filter((v) => v.operated !== false);
  const vehicle = operated.find((v) => v.id === opts.vehicleId) ?? operated[Math.floor(rng() * operated.length)] ?? q.vehicles[0];
  const fueled = vehicle ? fleetReadiness(q).find((v) => v.vehicle.id === vehicle.id)?.jurisdictions.filter((j) => j.gallons > 0) ?? [] : [];
  const jurisdiction = opts.jurisdiction ?? fueled[Math.floor(rng() * fueled.length)]?.state ?? q.baseJurisdiction;
  const stations = stationsFor(jurisdiction);
  const [vendor, location] = stations[Math.floor(rng() * stations.length)];
  const today = nowIso(opts.now).slice(0, 10);
  const lastDay = today < q.periodEnd ? today : q.periodEnd;
  const span = Math.max(1, Math.round((Date.parse(lastDay) - Date.parse(q.periodStart)) / 86_400_000));
  const date = opts.date ?? (opts.method === 'TAKE_PHOTO' || opts.method === 'CONTINUOUS_CAPTURE' ? lastDay : addDays(q.periodStart, Math.floor(rng() * span)));
  const gallons = Math.round((138 + rng() * 30) * 10) / 10;
  return {
    id: `${q.id}-c-${seedKey}`,
    vendor,
    location,
    jurisdiction,
    purchaseDate: date,
    gallons,
    amount: Math.round(gallons * (3.6 + rng() * 0.32) * 100) / 100,
    vehicleId: vehicle?.id ?? null,
    fuelUse: 'ROAD',
    source: opts.method,
    receiptClass: 'READY',
    fileLabel: opts.fileLabel,
    addedAt: nowIso(opts.now),
  };
}

/** DUPLICATE_CHECK — same station + date + gallons (± 0.5) + amount. */
function markDuplicates(q: IftaQuarterCase, incoming: IftaReceipt[]) {
  for (const r of incoming) {
    const match = q.receipts.find(
      (o) => o.id !== r.id && o.receiptClass !== 'DUPLICATE' && o.vendor === r.vendor && o.purchaseDate === r.purchaseDate && Math.abs((o.gallons ?? 0) - (r.gallons ?? 0)) <= 0.5 && o.amount === r.amount,
    );
    if (match) {
      r.receiptClass = 'DUPLICATE';
      r.duplicateOfId = match.id;
      r.flag = { reason: 'Same station, date, gallons and total as a receipt already in this quarter — held out of totals.', question: 'Keep both, or remove the copy?', options: ['Remove copy', 'Keep both'] };
    }
  }
}

/* ───────────────────────────── client: receipts ───────────────────────────── */

export function captureReceipts(
  s: DemoStore,
  input: { caseId: string; method: Exclude<IftaCaptureMethod, 'CONTINUOUS_CAPTURE'> | 'CONTINUOUS_CAPTURE'; files?: { name: string }[]; actorName?: string; now?: Date },
): IftaReceipt[] {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireUnlocked(q, now);
  let added: IftaReceipt[] = [];
  if (input.method === 'IMPORT_FROM_VAULT') {
    const imported = new Set(q.receipts.map((r) => r.vaultDocumentId).filter(Boolean));
    const docs = s.documents.filter(
      (d) =>
        d.organizationId === q.organizationId &&
        d.documentType === 'Receipt' &&
        (d.category === 'tax_fuel' || d.category === 'billing') &&
        !imported.has(d.id) &&
        (d.issuedAt ?? d.createdAt).slice(0, 10) >= q.periodStart &&
        (d.issuedAt ?? d.createdAt).slice(0, 10) <= q.periodEnd,
    );
    added = docs.map((d, i) => ({
      ...parseReceipt(q, `vault-${d.id}`, { method: 'IMPORT_FROM_VAULT', date: (d.issuedAt ?? d.createdAt).slice(0, 10), jurisdiction: d.jurisdiction, fileLabel: d.fileName ?? d.title, now }),
      id: `${q.id}-v-${i}-${d.id}`,
      vaultDocumentId: d.id,
    }));
  } else {
    const files = input.files?.length ? input.files : [{ name: input.method === 'TAKE_PHOTO' ? 'camera-capture.jpg' : 'receipt.pdf' }];
    added = files.map((f, i) => parseReceipt(q, `${now.getTime().toString(36)}-${i}`, { method: input.method, fileLabel: f.name, now }));
  }
  if (added.length === 0) return [];
  markDuplicates(q, added);
  q.receipts.push(...added);
  const actor = input.actorName ?? iftaContactName(q.organizationId);
  audit(q, now, 'CLIENT', actor, `${added.length} receipt${added.length === 1 ? '' : 's'} added`, input.method.replace(/_/g, ' ').toLowerCase());
  emitActivity(s, q, 'IFTA_RECEIPTS_ADDED', fillTemplate(channelEvent('activity', 'ACT_RECEIPTS_ADDED').summary, vars(q, added.length)), {
    detail: `${input.method.replace(/_/g, ' ').toLowerCase()} · ${quarterLabel(q)}`,
    at: nowIso(now),
  });
  syncCollectionState(q, now);
  return added;
}

export type ReceiptResolution =
  | { kind: 'TRUCK_FUEL' }
  | { kind: 'REEFER_FUEL' }
  | { kind: 'RETAKE'; fileName: string }
  | { kind: 'ADD_RECEIPT'; fileName: string }
  | { kind: 'NO_FUEL_PURCHASED' }
  | { kind: 'REMOVE_DUPLICATE' }
  | { kind: 'KEEP_BOTH' };

export function resolveReceipt(s: DemoStore, input: { caseId: string; receiptId: string; resolution: ReceiptResolution; actorName?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireUnlocked(q, now);
  const idx = q.receipts.findIndex((r) => r.id === input.receiptId);
  if (idx < 0) throw new IftaActionError('Receipt not found');
  const r = q.receipts[idx];
  const actor = input.actorName ?? iftaContactName(q.organizationId);
  const res = input.resolution;
  const resolved = (note: string) => {
    r.receiptClass = 'READY';
    r.resolvedAt = nowIso(now);
    r.resolutionNote = note;
    r.flag = undefined;
  };
  switch (res.kind) {
    case 'TRUCK_FUEL':
      r.fuelUse = 'ROAD';
      resolved('Confirmed truck fuel');
      break;
    case 'REEFER_FUEL':
      r.fuelUse = 'REEFER';
      resolved('Reefer-unit fuel — kept on file, not reported on IFTA');
      break;
    case 'RETAKE':
    case 'ADD_RECEIPT': {
      const parsed = parseReceipt(q, `${r.id}-${res.kind}`, { method: 'TAKE_PHOTO', jurisdiction: r.jurisdiction, vehicleId: r.vehicleId, date: r.purchaseDate ?? undefined, fileLabel: res.fileName, now });
      const previous = r.fileLabel;
      Object.assign(r, { vendor: parsed.vendor, location: parsed.location, gallons: parsed.gallons, amount: parsed.amount, purchaseDate: parsed.purchaseDate, fileLabel: res.fileName, source: 'TAKE_PHOTO' });
      resolved(res.kind === 'RETAKE' ? `Retaken — supersedes ${previous ?? 'the unreadable image'} (kept in history)` : `Missing ${jurisdictionName(r.jurisdiction)} receipt added`);
      break;
    }
    case 'NO_FUEL_PURCHASED':
      q.receipts.splice(idx, 1);
      q.discrepancies.push({
        id: `${q.id}-d-${now.getTime().toString(36)}`,
        kind: 'MILES_WITHOUT_FUEL',
        jurisdiction: r.jurisdiction,
        vehicleId: r.vehicleId,
        detail: `Client confirmed no ${jurisdictionName(r.jurisdiction)} fuel was purchased — accept with a note.`,
        status: 'OPEN',
      });
      break;
    case 'REMOVE_DUPLICATE':
      q.receipts.splice(idx, 1);
      break;
    case 'KEEP_BOTH':
      r.duplicateOfId = undefined;
      resolved('Client confirmed both purchases are real');
      break;
  }
  audit(q, now, 'CLIENT', actor, `Resolved receipt — ${res.kind.replace(/_/g, ' ').toLowerCase()}`, r.vendor ?? jurisdictionName(r.jurisdiction));
  closeResolvedCorrections(s, q, now, actor);
  syncCollectionState(q, now);
}

/** A correction request closes when none of its receipts / trucks still block — Inbox and room update together. */
function closeResolvedCorrections(s: DemoStore, q: IftaQuarterCase, now: Date, actor: string) {
  const blockingReceiptIds = new Set(
    q.receipts.filter((r) => r.receiptClass === 'NEEDS_YOU' || r.receiptClass === 'UNREADABLE' || r.receiptClass === 'POSSIBLE_MISSING').map((r) => r.id),
  );
  for (const c of q.corrections) {
    if (c.resolvedAt) continue;
    const stillOpen = c.receiptIds.some((id) => blockingReceiptIds.has(id)) || c.vehicleIds.some((id) => vehicleReadiness(q, q.vehicles.find((v) => v.id === id)!).quality === 'MISSING');
    if (stillOpen) continue;
    c.resolvedAt = nowIso(now);
    const n = c.receiptIds.length + c.vehicleIds.length;
    postThread(s, q, { senderType: 'customer', senderName: actor, body: `Resolved ${n} item${n === 1 ? '' : 's'} in the ${quarterLabel(q)} filing room.`, at: nowIso(now) }, 'waiting_on_staff');
    resolveClientNotices(s, q, ['IFTA_NEEDS_YOU']);
    emitActivity(s, q, 'IFTA_ITEMS_RESOLVED', `${n} flagged item${n === 1 ? '' : 's'} resolved for ${quarterLabel(q)}`, { at: nowIso(now) });
    emitStaffNotice(s, q, 'IFTA_REVIEW_READY', `${companyNameOf(s, q.organizationId)} resolved ${quarterLabel(q)} corrections`, `${n} item${n === 1 ? '' : 's'} answered — waiting for the client to resend.`);
  }
}

/* ───────────────────────────── client: mileage + vehicles ───────────────────────────── */

export function addMileage(
  s: DemoStore,
  input: { caseId: string; vehicleId: string; sourceId: IftaMileageSourceId; fileName?: string; entries?: { state: string; miles: number }[]; actorName?: string; now?: Date },
): IftaMileageRecord {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireUnlocked(q, now);
  if (input.sourceId === 'ELD_GPS_IMPORT') throw new IftaActionError('ELD / GPS connection is not live yet — upload the ELD report instead.');
  if (input.sourceId === 'LOAD_DERIVED_ESTIMATE') throw new IftaActionError('Estimates come from Dispatch automatically.');
  const vehicle = q.vehicles.find((v) => v.id === input.vehicleId);
  if (!vehicle) throw new IftaActionError('Vehicle not found');
  const actor = input.actorName ?? iftaContactName(q.organizationId);

  let entries: { state: string; miles: number }[] = [];
  if (input.sourceId === 'MANUAL_STATE_ENTRY') {
    entries = (input.entries ?? []).filter((e) => e.state && e.miles > 0);
    if (entries.length === 0) throw new IftaActionError('Enter at least one state and its miles.');
  } else if (input.sourceId === 'ELD_REPORT_UPLOAD' || input.sourceId === 'SPREADSHEET') {
    // Demo parse: states fueled in this quarter (or the previous estimate's states), miles at the truck's prior MPG.
    const current = latestMileageFor(q, vehicle.id);
    const fuel = vehicleReadiness(q, vehicle).jurisdictions.filter((j) => j.gallons > 0);
    const mpg = vehicle.priorMpg ?? 6.5;
    entries = fuel.length
      ? fuel.map((j) => ({ state: j.state, miles: Math.round(j.gallons * mpg) }))
      : (current?.entries ?? [{ state: q.baseJurisdiction, miles: 0 }]).map((e) => ({ state: e.state, miles: e.miles }));
  }

  const verifiedAtParse = input.sourceId === 'ELD_REPORT_UPLOAD';
  const record: IftaMileageRecord = {
    id: `${q.id}-${vehicle.id}-m-${now.getTime().toString(36)}`,
    vehicleId: vehicle.id,
    sourceId: input.sourceId,
    entries: entries.map((e) => ({
      state: e.state,
      miles: e.miles,
      source: verifiedAtParse ? 'eld_verified' : input.sourceId === 'SPREADSHEET' ? 'driver_reported' : 'manual_verified',
      verified: verifiedAtParse,
    })),
    fileLabel: input.fileName,
    addedAt: nowIso(now),
  };
  for (const prior of q.mileage) {
    if (prior.vehicleId === vehicle.id && !prior.supersededById) prior.supersededById = record.id;
  }
  q.mileage.push(record);
  const sourceLabel = input.sourceId.replace(/_/g, ' ').toLowerCase();
  audit(q, now, 'CLIENT', actor, `${vehicle.unit} miles added — ${sourceLabel}`, input.fileName);
  if (input.sourceId === 'AIO_ASSISTANCE') {
    postThread(s, q, { senderType: 'customer', senderName: actor, body: `Please build ${vehicle.unit}’s ${quarterLabel(q)} miles by state from my trip records.`, at: nowIso(now) }, 'waiting_on_staff');
    emitStaffNotice(s, q, 'IFTA_REVIEW_READY', `${companyNameOf(s, q.organizationId)} asked AIO to build ${vehicle.unit} miles`, `${quarterLabel(q)} — assist with jurisdiction mileage.`);
  }
  emitActivity(s, q, 'IFTA_MILEAGE_IMPORTED', `${vehicle.unit} miles added to ${quarterLabel(q)} — ${sourceLabel}`, {
    detail: verifiedAtParse ? 'Verified source' : 'AIO verifies before reporting',
    at: nowIso(now),
  });
  closeResolvedCorrections(s, q, now, actor);
  syncCollectionState(q, now);
  return record;
}

export function confirmVehicles(s: DemoStore, input: { caseId: string; operated: Record<string, boolean>; actorName?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireUnlocked(q, now);
  for (const v of q.vehicles) {
    if (input.operated[v.id] !== undefined) v.operated = input.operated[v.id];
  }
  q.vehiclesConfirmedAt = nowIso(now);
  const ran = q.vehicles.filter((v) => v.operated !== false).length;
  audit(q, now, 'CLIENT', input.actorName ?? iftaContactName(q.organizationId), `Fleet confirmed — ${ran} truck${ran === 1 ? '' : 's'} ran`);
  syncCollectionState(q, now);
}

export function sendQuarterToAio(s: DemoStore, input: { caseId: string; actorName?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  const check = canSendToAio(q, now);
  if (!check.allowed) throw new IftaActionError(check.reasons.join(' '));
  const actor = input.actorName ?? iftaContactName(q.organizationId);
  q.state = 'AIO_REVIEW';
  q.submittedAt = nowIso(now);
  audit(q, now, 'CLIENT', actor, 'Quarter sent to AIO for review');
  postThread(s, q, { senderType: 'customer', senderName: actor, body: `${quarterLabel(q)} sent to AIO — receipts, miles and trucks are in.`, at: nowIso(now) }, 'waiting_on_staff');
  emitActivity(s, q, 'IFTA_QUARTER_SUBMITTED', fillTemplate(channelEvent('activity', 'ACT_SUBMITTED').summary, vars(q)), { detail: quarterLabel(q), at: nowIso(now) });
  emitStaffNotice(
    s,
    q,
    'IFTA_REVIEW_READY',
    fillTemplate(channelEvent('task', 'TASK_REVIEW_QUARTER').summary, { ...vars(q), client: companyNameOf(s, q.organizationId) }),
    `Due ${q.dueDate} — records ready for review.`,
  );
}

/* ───────────────────────────── client: approval ───────────────────────────── */

export function approveReturn(s: DemoStore, input: { caseId: string; actorName?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['AWAITING_APPROVAL'], 'APPROVE');
  if (!q.returnSummary) throw new IftaActionError('No return summary to approve.');
  const actor = input.actorName ?? iftaContactName(q.organizationId);
  q.returnSummary.approvedAt = nowIso(now);
  q.returnSummary.approvedBy = actor;
  q.state = 'FILING';
  audit(q, now, 'CLIENT', actor, 'Return approved by client');
  resolveClientNotices(s, q, ['IFTA_APPROVAL_REQUEST']);
  postThread(s, q, { senderType: 'customer', senderName: actor, body: `Approved the ${quarterLabel(q)} return — please file.`, at: nowIso(now) }, 'waiting_on_staff');
  emitActivity(s, q, 'IFTA_CLIENT_APPROVED', fillTemplate(channelEvent('activity', 'ACT_APPROVED').summary, vars(q)), { detail: quarterLabel(q), at: nowIso(now) });
  emitStaffNotice(
    s,
    q,
    'IFTA_CLIENT_APPROVED',
    fillTemplate(channelEvent('task', 'TASK_FILE').summary, { ...vars(q), client: companyNameOf(s, q.organizationId) }),
    `Approved by ${actor}.`,
  );
}

export function askQuestion(s: DemoStore, input: { caseId: string; text: string; actorName?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['AWAITING_APPROVAL'], 'ASK A QUESTION');
  if (!input.text.trim()) throw new IftaActionError('Write your question first.');
  const actor = input.actorName ?? iftaContactName(q.organizationId);
  q.state = 'RECONCILING';
  if (q.returnSummary) q.returnSummary.clientQuestion = { at: nowIso(now), text: input.text.trim() };
  audit(q, now, 'CLIENT', actor, 'Question on the return summary', input.text.trim());
  resolveClientNotices(s, q, ['IFTA_APPROVAL_REQUEST']);
  postThread(s, q, { senderType: 'customer', senderName: actor, body: input.text.trim(), at: nowIso(now) }, 'waiting_on_staff');
  emitStaffNotice(s, q, 'IFTA_REVIEW_READY', `${companyNameOf(s, q.organizationId)} asked about the ${quarterLabel(q)} return`, input.text.trim());
}

/* ───────────────────────────── staff ───────────────────────────── */

function staffActor(s: DemoStore, q: IftaQuarterCase, staffId?: string) {
  const id = staffId ?? s.officeStaffId ?? q.assignedStaffId;
  return { id, name: staffNameOf(s, id) };
}

/** System derivation at reconciliation: miles without fuel, MPG outliers, unverified miles, receipts to classify. */
function detectDiscrepancies(q: IftaQuarterCase, now: Date) {
  const has = (kind: IftaDiscrepancy['kind'], vehicleId: string | null, jurisdiction: string | null) =>
    q.discrepancies.some((d) => d.kind === kind && d.vehicleId === vehicleId && d.jurisdiction === jurisdiction);
  const push = (d: Omit<IftaDiscrepancy, 'id' | 'status'>) => q.discrepancies.push({ ...d, id: `${q.id}-d${q.discrepancies.length + 1}-${now.getTime().toString(36)}`, status: 'OPEN' });
  for (const gap of milesWithoutFuel(q)) {
    if (!has('MILES_WITHOUT_FUEL', gap.vehicle.id, gap.state)) {
      push({ kind: 'MILES_WITHOUT_FUEL', jurisdiction: gap.state, vehicleId: gap.vehicle.id, detail: `${gap.vehicle.unit} ran ${gap.miles.toLocaleString('en-US')} ${jurisdictionName(gap.state)} miles with no ${jurisdictionName(gap.state)} fuel.` });
    }
  }
  for (const v of fleetReadiness(q)) {
    if (v.vehicle.operated === false) continue;
    if (v.mpgOutlier && !has('MPG_OUTLIER', v.vehicle.id, null)) {
      push({ kind: 'MPG_OUTLIER', jurisdiction: null, vehicleId: v.vehicle.id, detail: `${v.vehicle.unit} at ${v.mpg} MPG vs ${v.vehicle.priorMpg} last quarter.` });
    }
    if (v.quality === 'AIO_CHECKING' && !has('UNVERIFIED_MILEAGE', v.vehicle.id, null)) {
      push({ kind: 'UNVERIFIED_MILEAGE', jurisdiction: null, vehicleId: v.vehicle.id, detail: `${v.vehicle.unit} miles need staff verification before reporting.` });
    }
  }
}

export function startReconciliation(s: DemoStore, input: { caseId: string; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['AIO_REVIEW'], 'START RECONCILIATION');
  const staff = staffActor(s, q, input.staffId);
  q.state = 'RECONCILING';
  q.reviewStartedAt = nowIso(now);
  detectDiscrepancies(q, now);
  audit(q, now, 'FOUNDER_STAFF', staff.name, 'Reconciliation started');
  postThread(s, q, { senderType: 'staff', senderId: staff.id, senderName: staff.name, body: `I’m reconciling your ${quarterLabel(q)} fuel and miles by state now. Nothing needed from you unless I ask.`, at: nowIso(now) }, 'waiting_on_staff');
  emitActivity(s, q, 'IFTA_REVIEW_STARTED', `AIO review started — ${quarterLabel(q)} fuel and miles`, { staffId: staff.id, at: nowIso(now) });
}

export function requestCorrection(
  s: DemoStore,
  input: { caseId: string; receiptIds?: string[]; gaps?: { vehicleId: string; state: string; miles: number }[]; reason?: string; message: string; staffId?: string; now?: Date },
): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['AIO_REVIEW', 'RECONCILING'], 'REQUEST CORRECTION');
  const staff = staffActor(s, q, input.staffId);
  const receiptIds = [...(input.receiptIds ?? [])];
  for (const id of input.receiptIds ?? []) {
    const r = q.receipts.find((x) => x.id === id);
    if (!r) continue;
    r.receiptClass = 'NEEDS_YOU';
    r.flag = { reason: input.reason ?? 'AIO needs a detail only you can confirm.', question: input.reason ?? 'Confirm the truck, state and gallons on this receipt.', options: ['Truck fuel', 'Reefer unit'], requestedByStaffId: staff.id };
  }
  for (const gap of input.gaps ?? []) {
    const unit = q.vehicles.find((v) => v.id === gap.vehicleId)?.unit ?? 'Truck';
    const id = `${q.id}-gap-${gap.vehicleId}-${gap.state}-${now.getTime().toString(36)}`;
    q.receipts.push({
      id,
      vendor: null,
      location: null,
      jurisdiction: gap.state,
      purchaseDate: null,
      gallons: null,
      amount: null,
      vehicleId: gap.vehicleId,
      fuelUse: 'ROAD',
      source: 'SYSTEM_GAP',
      receiptClass: 'POSSIBLE_MISSING',
      flag: {
        reason: `${unit} ran ${gap.miles.toLocaleString('en-US')} ${jurisdictionName(gap.state)} miles with no ${jurisdictionName(gap.state)} fuel purchase on file.`,
        question: `Add the ${jurisdictionName(gap.state)} receipt, or confirm no fuel was bought there.`,
        options: ['Add receipt', `No fuel bought in ${jurisdictionName(gap.state)}`],
        requestedByStaffId: staff.id,
      },
      addedAt: nowIso(now),
    });
    receiptIds.push(id);
  }
  if (receiptIds.length === 0) throw new IftaActionError('Pick at least one receipt or gap to send back.');
  q.corrections.push({ id: `${q.id}-corr-${q.corrections.length + 1}`, requestedAt: nowIso(now), requestedByStaffId: staff.id, receiptIds, vehicleIds: [], message: input.message });
  q.state = 'NEEDS_CLIENT';
  const n = receiptIds.length;
  audit(q, now, 'FOUNDER_STAFF', staff.name, `Correction requested — ${n} item${n === 1 ? '' : 's'}`, input.message);
  postThread(s, q, { senderType: 'staff', senderId: staff.id, senderName: staff.name, body: input.message, at: nowIso(now) }, 'waiting_on_customer');
  emitClientNotice(s, q, 'IFTA_NEEDS_YOU', fillTemplate(channelEvent('inbox', 'IFTA_NEEDS_YOU').summary, vars(q, n)), input.message, { at: nowIso(now) });
  emitActivity(s, q, 'IFTA_CORRECTION_REQUESTED', `AIO requested ${n} correction${n === 1 ? '' : 's'} on ${quarterLabel(q)}`, { staffId: staff.id, at: nowIso(now) });
}

export function nudgeClient(s: DemoStore, input: { caseId: string; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  const staff = staffActor(s, q, input.staffId);
  const n = blockingItems(q, now).length;
  const body = n
    ? `Reminder: ${n} item${n === 1 ? '' : 's'} on ${quarterLabel(q)} still need you before I can finish. Due ${q.dueDate}.`
    : `Reminder: ${quarterLabel(q)} is due ${q.dueDate}.`;
  postThread(s, q, { senderType: 'staff', senderId: staff.id, senderName: staff.name, body, at: nowIso(now) }, 'waiting_on_customer');
  audit(q, now, 'FOUNDER_STAFF', staff.name, 'Client reminded');
}

export function verifyReceipt(s: DemoStore, input: { caseId: string; receiptId: string; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  const r = q.receipts.find((x) => x.id === input.receiptId);
  if (!r || r.receiptClass !== 'UNDER_AIO_REVIEW') throw new IftaActionError('Only receipts under AIO review can be classified here.');
  r.receiptClass = 'READY';
  r.flag = undefined;
  r.resolvedAt = nowIso(now);
  r.resolutionNote = 'Classified by AIO';
  audit(q, now, 'FOUNDER_STAFF', staffActor(s, q, input.staffId).name, 'Receipt classified READY', `${r.vendor} · ${r.location}`);
}

export function verifyMileage(s: DemoStore, input: { caseId: string; recordId: string; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  const rec = q.mileage.find((m) => m.id === input.recordId);
  if (!rec) throw new IftaActionError('Mileage record not found');
  if (rec.sourceId === 'LOAD_DERIVED_ESTIMATE') throw new IftaActionError('Estimates can never be verified for filing.');
  const staff = staffActor(s, q, input.staffId);
  rec.staffVerifiedAt = nowIso(now);
  rec.entries = rec.entries.map((e) => ({ ...e, verified: true }));
  for (const d of q.discrepancies) {
    if (d.kind === 'UNVERIFIED_MILEAGE' && d.vehicleId === rec.vehicleId && d.status === 'OPEN') {
      d.status = 'RESOLVED';
      d.resolution = { at: nowIso(now), byStaffId: staff.id, note: 'Verified against source records', override: false };
    }
  }
  audit(q, now, 'FOUNDER_STAFF', staff.name, 'Mileage verified', q.vehicles.find((v) => v.id === rec.vehicleId)?.unit);
}

/** Resolve / override a discrepancy. An override requires a note and is audited (contract founder_override_points). */
export function resolveDiscrepancy(s: DemoStore, input: { caseId: string; discrepancyId: string; note: string; override: boolean; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  const d = q.discrepancies.find((x) => x.id === input.discrepancyId);
  if (!d) throw new IftaActionError('Discrepancy not found');
  if (!input.note.trim()) throw new IftaActionError('An override needs a note — it goes in the audit trail.');
  const staff = staffActor(s, q, input.staffId);
  d.status = 'RESOLVED';
  d.resolution = { at: nowIso(now), byStaffId: staff.id, note: input.note.trim(), override: input.override };
  audit(q, now, 'FOUNDER_STAFF', staff.name, input.override ? 'Override with note' : 'Discrepancy resolved', `${d.detail} — ${input.note.trim()}`);
}

export function prepareReturnSummary(s: DemoStore, input: { caseId: string; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['RECONCILING'], 'PREPARE RETURN SUMMARY');
  const open = q.discrepancies.filter((d) => d.status === 'OPEN');
  if (open.length) throw new IftaActionError(`${open.length} discrepanc${open.length === 1 ? 'y is' : 'ies are'} still open.`);
  if (q.receipts.some((r) => r.receiptClass === 'UNDER_AIO_REVIEW')) throw new IftaActionError('Classify the receipts still under AIO review first.');
  const readiness = quarterReadiness(q);
  if (readiness !== 'READY_FOR_REPORTING') throw new IftaActionError(`Quarter readiness is ${readiness} — estimates and unverified miles never enter the return.`);
  if (!q.staffWorksheet?.length) throw new IftaActionError('Enter the filing worksheet (net tax by jurisdiction) first.');
  const staff = staffActor(s, q, input.staffId);
  q.returnSummary = returnSummaryFrom(q, nowIso(now), staff.id);
  audit(q, now, 'FOUNDER_STAFF', staff.name, 'Return summary prepared from verified records');
}

export function sendForApproval(s: DemoStore, input: { caseId: string; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['RECONCILING'], 'SEND FOR APPROVAL');
  if (!q.returnSummary) throw new IftaActionError('Prepare the return summary first.');
  const staff = staffActor(s, q, input.staffId);
  q.returnSummary.sentForApprovalAt = nowIso(now);
  q.returnSummary.clientQuestion = undefined;
  q.state = 'AWAITING_APPROVAL';
  audit(q, now, 'FOUNDER_STAFF', staff.name, 'Return summary sent for approval');
  const title = fillTemplate(channelEvent('inbox', 'IFTA_APPROVAL_REQUEST').summary, vars(q));
  postThread(s, q, { senderType: 'staff', senderId: staff.id, senderName: staff.name, body: `${title}. Miles, gallons and tax by state are in the filing room — approve when it looks right, or ask me anything.`, at: nowIso(now) }, 'waiting_on_customer');
  emitClientNotice(s, q, 'IFTA_APPROVAL_REQUEST', title, fillTemplate(channelEvent('notification', 'NTF_APPROVAL').summary, vars(q)), { at: nowIso(now) });
  emitActivity(s, q, 'IFTA_RETURN_SENT_FOR_APPROVAL', `${quarterLabel(q)} return summary sent for your approval`, { staffId: staff.id, at: nowIso(now) });
}

export function recordFiling(s: DemoStore, input: { caseId: string; confirmationNumber: string; staffId?: string; now?: Date }): void {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['FILING'], 'RECORD FILING CONFIRMATION');
  if (!input.confirmationNumber.trim()) throw new IftaActionError('Enter the confirmation number from the base jurisdiction.');
  const staff = staffActor(s, q, input.staffId);
  q.filing = {
    filedAt: nowIso(now),
    confirmationNumber: input.confirmationNumber.trim(),
    filedByStaffId: staff.id,
    destination: `${q.baseJurisdictionName} — IFTA base jurisdiction (filed by AIO staff)`,
  };
  q.payment = { status: 'NOT_RECORDED', amount: Math.abs(q.returnSummary?.netPosition ?? 0) };
  q.state = 'FILED';
  audit(q, now, 'FOUNDER_STAFF', staff.name, 'IFTA return filed', `Confirmation ${q.filing.confirmationNumber}`);
  // AUTO_SEAL_PACKET (trigger FILED): seal into the Vault and resolve the inbox thread.
  const doc = sealPacketToVault(s, q, nowIso(now));
  audit(q, now, 'SYSTEM', 'AIO', 'Filing packet sealed in the Vault', q.vault?.path.join(' › '));
  resolveClientNotices(s, q, ['IFTA_NEEDS_YOU', 'IFTA_APPROVAL_REQUEST']);
  const filedTitle = fillTemplate(channelEvent('inbox', 'IFTA_FILED').summary, vars(q));
  postThread(s, q, { senderType: 'staff', senderId: staff.id, senderName: staff.name, body: `${filedTitle}. Confirmation ${q.filing.confirmationNumber}.`, at: nowIso(now) }, 'resolved');
  emitClientNotice(s, q, 'IFTA_FILED', filedTitle, `Confirmation ${q.filing.confirmationNumber} · ${doc.title}`, { at: nowIso(now) });
  emitActivity(s, q, 'IFTA_RETURN_FILED', fillTemplate(channelEvent('activity', 'ACT_FILED').summary, vars(q)), { detail: `${quarterLabel(q)} · confirmation ${q.filing.confirmationNumber}`, staffId: staff.id, at: nowIso(now) });
  emitActivity(s, q, 'IFTA_VAULT_PACKAGE_CREATED', `${doc.title} sealed in your Vault`, { detail: q.vault?.path.join(' › '), at: nowIso(now) });
}

/** FILED → ARCHIVED once payment status is recorded; the next quarter is opened if the boundary has not already. */
export function recordPayment(s: DemoStore, input: { caseId: string; status: Exclude<IftaPaymentStatus, 'NOT_RECORDED'>; note?: string; staffId?: string; now?: Date }): IftaQuarterCase | null {
  const now = input.now ?? new Date();
  const q = findQuarter(s, input.caseId);
  requireState(q, now, ['FILED'], 'RECORD PAYMENT STATUS');
  const staff = staffActor(s, q, input.staffId);
  q.payment = { ...q.payment, status: input.status, recordedAt: nowIso(now), note: input.note };
  const label = { PAYMENT_PENDING: 'Payment pending', PAID: 'Paid', CREDIT_CARRIED: 'Credit carried forward', NO_TAX_DUE: 'No tax due' }[input.status];
  audit(q, now, 'FOUNDER_STAFF', staff.name, `Payment status recorded — ${label}`, input.note);
  emitActivity(s, q, 'IFTA_PAYMENT_RECORDED', `${quarterLabel(q)} fuel tax payment — ${label.toLowerCase()}`, { staffId: staff.id, at: nowIso(now) });
  if (input.status === 'PAYMENT_PENDING') return null;
  q.state = 'ARCHIVED';
  audit(q, now, 'SYSTEM', 'AIO', 'Quarter archived');
  const next = openNextQuarter(s, q, now);
  emitActivity(s, q, 'IFTA_QUARTER_ARCHIVED', fillTemplate(channelEvent('activity', 'ACT_ARCHIVED').summary, vars(q)), { detail: `${quarterLabel(next)} is the active quarter`, at: nowIso(now) });
  return next;
}

/** IFTA_ARCHIVED_OPENS_NEXT — fleet pre-filled, continuous capture still on. Idempotent with the quarter boundary. */
export function openNextQuarter(s: DemoStore, q: IftaQuarterCase, now: Date): IftaQuarterCase {
  const n = nextQuarter(q.year, q.quarter);
  const existing = s.iftaQuarters?.find((c) => c.organizationId === q.organizationId && c.year === n.year && c.quarter === n.quarter);
  if (existing) return existing;
  const period = quarterPeriod(n.year, n.quarter);
  const next: IftaQuarterCase = {
    ...q,
    id: `ifta-${q.organizationId}-${n.year}-q${n.quarter}`,
    ...period,
    state: 'QUARTER_OPEN',
    vehicles: q.vehicles.map((v) => ({ ...v, operated: v.operated === false ? null : true })),
    vehiclesConfirmedAt: undefined,
    receipts: [],
    mileage: [],
    continuousCapture: true,
    submittedAt: undefined,
    reviewStartedAt: undefined,
    discrepancies: [],
    corrections: [],
    returnSummary: undefined,
    filing: undefined,
    payment: { status: 'NOT_RECORDED', amount: 0 },
    vault: undefined,
    conversationId: undefined,
    audit: [],
  };
  delete next.staffWorksheet;
  s.iftaQuarters = [...(s.iftaQuarters ?? []), next];
  audit(next, now, 'SYSTEM', 'AIO', `${quarterLabel(next)} opened — fleet pre-filled from ${quarterLabel(q)}`);
  ensureThread(s, next, nowIso(now));
  const title = fillTemplate(channelEvent('inbox', 'IFTA_QUARTER_OPEN').summary, vars(next));
  postThread(s, next, { senderType: 'system', senderName: 'All In One', body: title, at: nowIso(now) }, 'open');
  emitClientNotice(s, next, 'IFTA_QUARTER_OPEN', title, `Due ${period.dueDate} · your trucks are pre-filled.`, { at: nowIso(now) });
  return next;
}

/* ───────────────────────────── UI binding ───────────────────────────── */

export type IftaReducer = (s: DemoStore) => unknown;

/** Run one reducer against the demo store; returns an error message instead of throwing. */
export function runIftaAction(reducer: IftaReducer): string | null {
  let error: string | null = null;
  try {
    updateDemoStore((s) => {
      reducer(s);
      return s;
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return error;
}
