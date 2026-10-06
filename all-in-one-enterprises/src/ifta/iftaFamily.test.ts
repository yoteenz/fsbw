/**
 * IFTA family — functional proof (no visuals). Founder override P0.AIO.EXPERIENCE-DRIVEN-PAGE-REFINEMENT1:
 * the visual layer is superseded pending founder review; these tests prove the preserved functional contract —
 * brain consumption, client ⇄ staff mirror, contract transitions, Inbox / Activity / Vault relationships, next quarter.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import type { DemoStore } from '../demo/demoTypes';
import {
  IFTA_EXPERIENCE,
  IFTA_EXPERIENCE_PROVENANCE,
  primaryCta,
  sectionsFor,
  stateMeaning,
  visualRelationship,
  type IftaStateId,
} from './experience/iftaExperience';
import {
  approveReturn,
  askQuestion,
  findQuarter,
  prepareReturnSummary,
  recordFiling,
  recordPayment,
  requestCorrection,
  resolveDiscrepancy,
  resolveReceipt,
  sendForApproval,
  sendQuarterToAio,
  startReconciliation,
  verifyMileage,
  verifyReceipt,
} from './iftaActions';
import {
  canSendToAio,
  clientStatusLine,
  effectiveState,
  fleetReadiness,
  quarterReadiness,
  staffBucket,
  staffStatusLine,
} from './iftaDerive';

const NOW = new Date('2026-10-06T15:00:00.000Z');
const later = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);
const PIONEER_Q3 = 'ifta-client-c-2026-q3';

/** The seed anchors quarters to the clock — pin it so the filing quarter is Q3 2026 (due Oct 31). */
function seed(): DemoStore {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  try {
    return createDemoSeed();
  } finally {
    vi.useRealTimers();
  }
}

describe('Experience Brain consumption', () => {
  it('vendored contracts match their provenance hashes (no hand edits)', () => {
    for (const [name, meta] of Object.entries(IFTA_EXPERIENCE_PROVENANCE.files)) {
      const bytes = readFileSync(join(fileURLToPath(new URL('./experience', import.meta.url)), name));
      expect(createHash('sha256').update(bytes).digest('hex'), name).toBe(meta.sha256);
    }
    expect(IFTA_EXPERIENCE_PROVENANCE.source_repo).toBe('yoteenz/SITE00');
  });

  it('every contract state has a visual relationship and a per-actor primary action', () => {
    for (const state of IFTA_EXPERIENCE.states) {
      const v = visualRelationship(state.id);
      expect(v.emphasis_role, state.id).toBeTruthy();
      expect(primaryCta(state.id, 'CLIENT'), state.id).not.toBe('');
      expect(primaryCta(state.id, 'FOUNDER_STAFF'), state.id).not.toBe('');
    }
  });

  it('section order comes from the contract where the contract defines it', () => {
    expect(sectionsFor('CLIENT', 'NEEDS_CLIENT')).toEqual({ sections: ['QUARTER', 'FLAGS', 'RECEIPTS', 'MILEAGE'], fromContract: true });
    expect(sectionsFor('FOUNDER_STAFF', 'RECONCILING').fromContract).toBe(true);
    expect(sectionsFor('CLIENT', 'AIO_REVIEW').fromContract).toBe(false);
  });

  it('the public perspective covers every item the sprint requires the public page to explain', () => {
    const p = IFTA_EXPERIENCE.perspectives.public;
    expect(p.must_understand.length).toBeGreaterThan(0); // what IFTA is
    expect(p.who_its_for).toMatch(/interstate/i); // who needs it
    expect(p.what_we_handle.length).toBe(7); // what AIO handles
    expect(p.what_client_provides.length).toBe(4); // what the client provides
    expect(p.how_it_works.length).toBe(6); // the process
    expect(p.outcome).toMatch(/Vault/); // what they receive
    expect(p.cta).toBe('Request Filing'); // how they start
  });
});

describe('Client ⇄ staff mirror', () => {
  it('the primary seeded quarter reads the founder example on both sides', () => {
    const q = findQuarter(seed(), PIONEER_Q3);
    expect(effectiveState(q, NOW)).toBe('NEEDS_CLIENT');
    expect(clientStatusLine(q, NOW)).toBe('Needs you — 2 receipts');
    expect(staffStatusLine(q, NOW)).toBe('Awaiting client — 2 receipt corrections');
    expect(staffBucket(q, NOW)).toBe('AWAITING_CLIENT');
  });

  it('every material client state has a distinct staff meaning', () => {
    const material: IftaStateId[] = ['QUARTER_OPEN', 'COLLECTING', 'NEEDS_CLIENT', 'OVERDUE_RISK', 'AIO_REVIEW', 'RECONCILING', 'AWAITING_APPROVAL', 'FILING', 'FILED', 'ARCHIVED', 'FILING_REJECTED'];
    for (const id of material) {
      const client = stateMeaning(id, 'CLIENT', { quarter: 3, year: 2026, dueDate: 'Oct 31' });
      const staff = stateMeaning(id, 'FOUNDER_STAFF', { quarter: 3, year: 2026, dueDate: 'Oct 31' });
      expect(staff, id).toBeTruthy();
      expect(staff, id).not.toBe(client);
    }
  });

  it('estimated mileage never reads as filing-ready', () => {
    const s = seed();
    const q4 = findQuarter(s, 'ifta-client-c-2026-q4');
    const truck03 = fleetReadiness(q4).find((v) => v.vehicle.id === 'unit-c3')!;
    expect(truck03.status).toBe('ESTIMATED');
    expect(truck03.quality).toBe('ESTIMATE');
    expect(quarterReadiness(q4)).not.toBe('READY_FOR_REPORTING');
  });
});

describe('Quarter journey (functional E2E, no UI)', () => {
  it('NEEDS YOU → resolved → AIO review → reconcile → approve → filed → vault → next quarter', () => {
    const s = seed();
    const q = () => findQuarter(s, PIONEER_Q3);
    const unreadNeedsYou = () => s.notifications.filter((n) => n.entityId === PIONEER_Q3 && n.eventType === 'IFTA_NEEDS_YOU' && !n.archived);
    expect(unreadNeedsYou()).toHaveLength(1);
    expect(canSendToAio(q(), NOW).allowed).toBe(false);

    // CLIENT: resolve both AIO corrections inline (reefer question + retake).
    resolveReceipt(s, { caseId: PIONEER_Q3, receiptId: `${PIONEER_Q3}-unit-c2-reefer`, resolution: { kind: 'TRUCK_FUEL' }, now: later(1) });
    expect(effectiveState(q(), later(1))).toBe('NEEDS_CLIENT');
    resolveReceipt(s, { caseId: PIONEER_Q3, receiptId: `${PIONEER_Q3}-unit-c1-unreadable`, resolution: { kind: 'RETAKE', fileName: 'IMG_2240.JPG' }, now: later(2) });
    expect(effectiveState(q(), later(2))).toBe('COLLECTING');
    // Inbox and room update together.
    expect(unreadNeedsYou()).toHaveLength(0);
    expect(q().corrections[0].resolvedAt).toBeTruthy();
    expect(s.commMessages!.some((m) => m.conversationId === q().conversationId && /Resolved 2 items/.test(m.body))).toBe(true);

    // CLIENT: SEND QUARTER TO AIO.
    expect(canSendToAio(q(), later(3))).toEqual({ allowed: true, reasons: [] });
    sendQuarterToAio(s, { caseId: PIONEER_Q3, now: later(3) });
    expect(q().state).toBe('AIO_REVIEW');

    // STAFF: reconcile — system flags TN miles with no TN fuel; override needs a note.
    startReconciliation(s, { caseId: PIONEER_Q3, now: later(10) });
    expect(q().state).toBe('RECONCILING');
    const tn = q().discrepancies.find((d) => d.kind === 'MILES_WITHOUT_FUEL' && d.jurisdiction === 'TN')!;
    expect(tn).toBeTruthy();
    expect(() => resolveDiscrepancy(s, { caseId: PIONEER_Q3, discrepancyId: tn.id, note: '  ', override: true, now: later(11) })).toThrow(/note/);
    expect(() => prepareReturnSummary(s, { caseId: PIONEER_Q3, now: later(11) })).toThrow(/still open/);
    resolveDiscrepancy(s, { caseId: PIONEER_Q3, discrepancyId: tn.id, note: 'Truck 02 crosses TN on the Chattanooga run; fueled in GA both sides.', override: true, now: later(12) });
    for (const r of q().receipts.filter((x) => x.receiptClass === 'UNDER_AIO_REVIEW')) verifyReceipt(s, { caseId: PIONEER_Q3, receiptId: r.id, now: later(13) });
    expect(quarterReadiness(q())).toBe('READY_FOR_REPORTING');
    prepareReturnSummary(s, { caseId: PIONEER_Q3, now: later(14) });
    expect(q().returnSummary!.lines.find((l) => l.jurisdiction === 'GA')!.netTax).toBe(-161.18); // staff worksheet, not computed
    sendForApproval(s, { caseId: PIONEER_Q3, now: later(15) });
    expect(q().state).toBe('AWAITING_APPROVAL');
    expect(clientStatusLine(q(), later(15))).toBe('Review and approve your return');

    // CLIENT: ask a question → back to RECONCILING → re-sent → approve.
    askQuestion(s, { caseId: PIONEER_Q3, text: 'Why is Georgia a credit?', now: later(16) });
    expect(q().state).toBe('RECONCILING');
    sendForApproval(s, { caseId: PIONEER_Q3, now: later(17) });
    approveReturn(s, { caseId: PIONEER_Q3, now: later(18) });
    expect(q().state).toBe('FILING');
    expect(q().returnSummary!.approvedAt).toBeTruthy();

    // STAFF: record filing → FILED; packet sealed in the Vault; thread resolved; inbox notice.
    recordFiling(s, { caseId: PIONEER_Q3, confirmationNumber: 'GA-2026Q3-552190', now: later(30) });
    expect(q().state).toBe('FILED');
    expect(q().vault!.path).toEqual(['Vault', 'Tax & Fuel', 'IFTA', '2026', 'Q3']);
    expect(s.documents.find((d) => d.id === q().vault!.documentId)!.title).toBe('IFTA Q3 2026 filing packet');
    expect(s.commConversations!.find((c) => c.id === q().conversationId)!.status).toBe('resolved');
    expect(s.notifications.some((n) => n.entityId === PIONEER_Q3 && n.eventType === 'IFTA_FILED')).toBe(true);
    expect(staffBucket(q(), later(30))).toBe('FILED');

    // STAFF: payment → ARCHIVED; the next quarter is the bench object (already opened at the boundary).
    recordPayment(s, { caseId: PIONEER_Q3, status: 'PAYMENT_PENDING', now: later(31) });
    expect(staffBucket(q(), later(31))).toBe('PAYMENT_PENDING');
    const next = recordPayment(s, { caseId: PIONEER_Q3, status: 'PAID', now: later(40) });
    expect(q().state).toBe('ARCHIVED');
    expect(staffBucket(q(), later(40))).toBe('COMPLETE');
    expect(next!.id).toBe('ifta-client-c-2026-q4');
    expect(next!.continuousCapture).toBe(true);
    expect(next!.receipts.length).toBeGreaterThan(0);

    // ACTIVITY: every sprint §19 event exists for this quarter.
    const kinds = new Set(s.activity.filter((a) => a.clientId === 'client-c').map((a) => a.kind));
    for (const k of [
      'IFTA_RECEIPTS_ADDED',
      'IFTA_MILEAGE_IMPORTED',
      'IFTA_REVIEW_STARTED',
      'IFTA_CORRECTION_REQUESTED',
      'IFTA_CLIENT_APPROVED',
      'IFTA_RETURN_FILED',
      'IFTA_PAYMENT_RECORDED',
      'IFTA_VAULT_PACKAGE_CREATED',
    ] as const) {
      expect(kinds.has(k), k).toBe(true);
    }
  });

  it('staff correction requests land in the room and the Inbox at once', () => {
    const s = seed();
    const caseId = 'ifta-client-d-2026-q3';
    const q = findQuarter(s, caseId);
    const gap = q.discrepancies.find((d) => d.kind === 'MILES_WITHOUT_FUEL')!;
    requestCorrection(s, { caseId, gaps: [{ vehicleId: gap.vehicleId!, state: gap.jurisdiction!, miles: 2950 }], message: 'Kevin — Unit 7 ran 2,950 Alabama miles with no Alabama fuel. Add the receipt or tell us you did not fuel there.', now: NOW });
    expect(effectiveState(q, NOW)).toBe('NEEDS_CLIENT');
    expect(clientStatusLine(q, NOW)).toBe('Needs you — 1 receipt');
    expect(staffStatusLine(q, NOW)).toBe('Awaiting client — 1 possible missing receipt');
    expect(s.notifications.some((n) => n.entityId === caseId && n.eventType === 'IFTA_NEEDS_YOU' && !n.read)).toBe(true);
    expect(s.commConversations!.find((c) => c.id === q.conversationId)!.status).toBe('waiting_on_customer');
  });

  it('estimates can never be verified for filing', () => {
    const s = seed();
    const q4 = findQuarter(s, 'ifta-client-c-2026-q4');
    const estimate = q4.mileage.find((m) => m.sourceId === 'LOAD_DERIVED_ESTIMATE')!;
    expect(() => verifyMileage(s, { caseId: q4.id, recordId: estimate.id })).toThrow(/never be verified/);
  });
});
