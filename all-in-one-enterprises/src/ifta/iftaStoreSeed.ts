/**
 * Puts the IFTA seed into the demo store together with what the seeded history already produced on the shared
 * surfaces: quarter threads (Inbox › Messages), notices (Inbox › Notifications), My Office activity, sealed Vault
 * packets, and Vault receipts waiting to be imported into the current quarter.
 */
import type { DemoStore } from '../demo/demoTypes';
import type { VaultDocument } from '../vault/vaultTypes';
import { channelEvent, fillTemplate } from './experience/iftaExperience';
import { addDays, quarterLabel } from './iftaDates';
import { blockingItems } from './iftaDerive';
import { emitActivity, emitClientNotice, ensureThread, postThread, sealPacketToVault } from './iftaEvents';
import { createIftaSeed, iftaContactName } from './iftaSeed';
import type { IftaQuarterCase } from './iftaTypes';

const v = (q: IftaQuarterCase, count?: number) => ({ quarter: q.quarter, year: q.year, count });

function seedSurfaces(s: DemoStore, q: IftaQuarterCase, now: Date) {
  const contact = iftaContactName(q.organizationId);
  const opened = `${q.periodStart}T12:00:00.000Z`;
  ensureThread(s, q, opened);
  postThread(s, q, { senderType: 'system', senderName: 'All In One', body: fillTemplate(channelEvent('inbox', 'IFTA_QUARTER_OPEN').summary, v(q)), at: opened }, 'open');

  const receipts = q.receipts.filter((r) => r.source !== 'SYSTEM_GAP').length;
  if (receipts > 0 && q.state !== 'QUARTER_OPEN') {
    emitActivity(s, q, 'IFTA_RECEIPTS_ADDED', fillTemplate(channelEvent('activity', 'ACT_RECEIPTS_ADDED').summary, v(q, receipts)), {
      id: `act-${q.id}-receipts`,
      at: q.receipts[q.receipts.length - 1]?.addedAt ?? opened,
    });
  }
  const mileage = q.mileage.filter((m) => !m.supersededById && m.sourceId !== 'LOAD_DERIVED_ESTIMATE');
  if (mileage.length) {
    emitActivity(s, q, 'IFTA_MILEAGE_IMPORTED', `${mileage.length} truck mileage report${mileage.length === 1 ? '' : 's'} added to ${quarterLabel(q)}`, {
      id: `act-${q.id}-miles`,
      at: mileage[0].addedAt,
    });
  }
  if (q.submittedAt) {
    postThread(s, q, { senderType: 'customer', senderName: contact, body: `${quarterLabel(q)} sent to AIO — receipts, miles and trucks are in.`, at: q.submittedAt }, 'waiting_on_staff');
    emitActivity(s, q, 'IFTA_QUARTER_SUBMITTED', fillTemplate(channelEvent('activity', 'ACT_SUBMITTED').summary, v(q)), { id: `act-${q.id}-submitted`, at: q.submittedAt });
  }
  if (q.reviewStartedAt) {
    emitActivity(s, q, 'IFTA_REVIEW_STARTED', `AIO review started — ${quarterLabel(q)} fuel and miles`, { id: `act-${q.id}-review`, at: q.reviewStartedAt, staffId: q.assignedStaffId });
  }
  for (const c of q.corrections) {
    postThread(s, q, { senderType: 'staff', senderId: c.requestedByStaffId, senderName: 'Jordan Lee', body: c.message, at: c.requestedAt }, 'waiting_on_customer');
    emitActivity(s, q, 'IFTA_CORRECTION_REQUESTED', `AIO requested ${c.receiptIds.length} correction${c.receiptIds.length === 1 ? '' : 's'} on ${quarterLabel(q)}`, {
      id: `act-${c.id}`,
      at: c.requestedAt,
      staffId: c.requestedByStaffId,
    });
    if (!c.resolvedAt) {
      const n = blockingItems(q, now).length;
      emitClientNotice(s, q, 'IFTA_NEEDS_YOU', fillTemplate(channelEvent('inbox', 'IFTA_NEEDS_YOU').summary, v(q, n)), c.message, { at: c.requestedAt });
    }
  }
  const summary = q.returnSummary;
  if (summary?.sentForApprovalAt) {
    postThread(s, q, { senderType: 'staff', senderId: 'staff-2', senderName: 'Jordan Lee', body: `${fillTemplate(channelEvent('inbox', 'IFTA_APPROVAL_REQUEST').summary, v(q))}.`, at: summary.sentForApprovalAt }, 'waiting_on_customer');
    emitActivity(s, q, 'IFTA_RETURN_SENT_FOR_APPROVAL', `${quarterLabel(q)} return summary sent for your approval`, { id: `act-${q.id}-sent`, at: summary.sentForApprovalAt });
  }
  if (summary?.approvedAt) {
    postThread(s, q, { senderType: 'customer', senderName: contact, body: `Approved the ${quarterLabel(q)} return — please file.`, at: summary.approvedAt }, 'waiting_on_staff');
    emitActivity(s, q, 'IFTA_CLIENT_APPROVED', fillTemplate(channelEvent('activity', 'ACT_APPROVED').summary, v(q)), { id: `act-${q.id}-approved`, at: summary.approvedAt });
  }
  if (q.filing) {
    const filedTitle = fillTemplate(channelEvent('inbox', 'IFTA_FILED').summary, v(q));
    postThread(s, q, { senderType: 'staff', senderId: 'staff-2', senderName: 'Jordan Lee', body: `${filedTitle}. Confirmation ${q.filing.confirmationNumber}.`, at: q.filing.filedAt }, 'resolved');
    emitActivity(s, q, 'IFTA_RETURN_FILED', fillTemplate(channelEvent('activity', 'ACT_FILED').summary, v(q)), { id: `act-${q.id}-filed`, at: q.filing.filedAt, detail: `Confirmation ${q.filing.confirmationNumber}` });
    const sealedAt = q.vault?.sealedAt ?? q.filing.filedAt;
    const doc = sealPacketToVault(s, q, sealedAt);
    emitActivity(s, q, 'IFTA_VAULT_PACKAGE_CREATED', `${doc.title} sealed in your Vault`, { id: `act-${q.id}-vault`, at: sealedAt, detail: q.vault?.path.join(' › ') });
    emitClientNotice(s, q, 'IFTA_FILED', filedTitle, `Confirmation ${q.filing.confirmationNumber} · ${doc.title}`, { at: q.filing.filedAt, read: q.state === 'ARCHIVED' });
  }
  if (q.payment.recordedAt) {
    emitActivity(s, q, 'IFTA_PAYMENT_RECORDED', `${quarterLabel(q)} fuel tax payment — ${q.payment.status === 'PAID' ? 'paid' : 'credit carried forward'}`, { id: `act-${q.id}-paid`, at: q.payment.recordedAt });
  }
  if (q.state === 'ARCHIVED') {
    emitActivity(s, q, 'IFTA_QUARTER_ARCHIVED', fillTemplate(channelEvent('activity', 'ACT_ARCHIVED').summary, v(q)), { id: `act-${q.id}-archived`, at: q.vault?.sealedAt ?? opened });
  }
  if (q.state === 'QUARTER_OPEN' || q.state === 'COLLECTING') {
    emitClientNotice(s, q, 'IFTA_QUARTER_OPEN', fillTemplate(channelEvent('inbox', 'IFTA_QUARTER_OPEN').summary, v(q)), `Due ${q.dueDate} · your trucks are pre-filled.`, { at: opened, read: true });
  }
}

/** Fuel receipts already sitting in the Vault for the running quarter — IMPORT FROM VAULT picks these up. */
function vaultReceipts(q: IftaQuarterCase): VaultDocument[] {
  return [
    { day: 1, station: 'Pilot Flying J — Valdosta, GA', file: 'pilot-valdosta.pdf' },
    { day: 3, station: 'TA Petro — Jacksonville, FL', file: 'ta-jacksonville.pdf' },
  ].map((r, i) => {
    const date = addDays(q.periodStart, r.day);
    return {
      id: `vdoc-${q.id}-fuel-${i + 1}`,
      organizationId: q.organizationId,
      category: 'tax_fuel',
      documentType: 'Receipt',
      title: `Fuel receipt — ${r.station}`,
      status: 'uploaded',
      verificationStatus: 'unverified',
      visibility: 'customer',
      isCurrent: true,
      source: 'client_upload',
      jurisdiction: r.station.slice(-2),
      fileName: r.file,
      mimeType: 'application/pdf',
      issuedAt: date,
      createdAt: `${date}T19:00:00.000Z`,
      updatedAt: `${date}T19:00:00.000Z`,
      uploadedAt: `${date}T19:00:00.000Z`,
    } satisfies VaultDocument;
  });
}

export function applyIftaSeed(s: DemoStore, now: Date = new Date()): DemoStore {
  const { quarters } = createIftaSeed(now);
  s.iftaQuarters = quarters;
  const ordered = [...quarters].sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  for (const q of ordered) seedSurfaces(s, q, now);
  const running = quarters.find((q) => q.organizationId === 'client-c' && (q.state === 'COLLECTING' || q.state === 'QUARTER_OPEN'));
  if (running) s.documents = [...vaultReceipts(running), ...s.documents];
  s.activity.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  s.notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return s;
}

/** Existing demo stores (saved before IFTA existed) gain the IFTA seed once, without a schema version bump. */
export function ensureIftaSeed(s: DemoStore, now: Date = new Date()): { store: DemoStore; changed: boolean } {
  if (s.iftaQuarters) return { store: s, changed: false };
  return { store: applyIftaSeed(s, now), changed: true };
}
