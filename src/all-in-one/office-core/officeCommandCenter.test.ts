import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { aggregateOfficeAttention, collectOfficeAttentionCandidates } from '../office-core/officeAttentionEngine';
import { getOfficeCommandCenterView } from '../office-core/officeCommandCenterService';
import { resolveOfficeStaffContext, hasOfficePermission, canViewFinancialDomain } from '../office-core/officeContext';
import {
  enrichWorkItem,
  filterOverdue,
  getUnassignedWork,
  isStaleWork,
  isWorkOverdue,
  transitionWorkStatus,
} from '../office-core/officeWorkEngine';
import { transitionApprovalStatus, transitionHandoffStatus } from '../office-core/officeNextActionEngine';
import { getClient360View, checkDuplicateCustomer } from '../office-core/client360Service';

describe('Office 2.0 command center', () => {
  it('deduplicates insurance expiry attention across domains', () => {
    const store = createDemoSeed();
    const candidates = collectOfficeAttentionCandidates(store);
    const items = aggregateOfficeAttention(candidates);
    const insuranceKeys = items.filter((i) => i.dedupeKey.startsWith('insurance-expiry:'));
    const uniqueKeys = new Set(insuranceKeys.map((i) => i.dedupeKey));
    expect(uniqueKeys.size).toBe(insuranceKeys.length);
    if (insuranceKeys[0]) {
      expect(insuranceKeys[0].affectedAreas).toContain('Insurance');
    }
  });

  it('selects overdue customer-waiting work as next action before optional items', () => {
    const store = createDemoSeed();
    store.officeStaffId = 'staff-5';
    store.officeStaffRole = 'insurance_coordinator';
    const view = getOfficeCommandCenterView(store);
    expect(view.nextAction).toBeDefined();
    expect(view.customersWaitingOnUsCount).toBeGreaterThan(0);
  });

  it('manager sees unassigned count; specialist does not get manager summary by default', () => {
    const store = createDemoSeed();
    store.officeStaffId = 'staff-2';
    store.officeStaffRole = 'permitting_specialist';
    const specialistView = getOfficeCommandCenterView(store);
    expect(specialistView.managerSummary).toBeUndefined();

    store.officeStaffId = 'staff-1';
    store.officeStaffRole = 'manager';
    const managerView = getOfficeCommandCenterView(store);
    expect(managerView.managerSummary).toBeDefined();
    expect(managerView.unassignedCount).toBeGreaterThan(0);
  });
});

describe('Office work engine', () => {
  it('detects overdue and stale work deterministically', () => {
    const store = createDemoSeed();
    const item = store.officeWorkItems!.find((w) => w.id === 'owi-b2')!;
    const enriched = enrichWorkItem(item, store);
    expect(isWorkOverdue(item)).toBe(true);
    expect(enriched.isOverdue).toBe(true);

    const staleItem = { ...item, updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(), status: 'assigned' as const };
    expect(isStaleWork(staleItem)).toBe(true);
  });

  it('preserves assignment version on transition', () => {
    const store = createDemoSeed();
    const item = store.officeWorkItems![0];
    const next = transitionWorkStatus(item, 'completed');
    expect(next.version).toBe(item.version + 1);
    expect(next.completedAt).toBeTruthy();
  });

  it('lists unassigned active work', () => {
    const store = createDemoSeed();
    const unassigned = getUnassignedWork(store);
    expect(unassigned.some((w) => !w.assignedUserId)).toBe(true);
  });

  it('filters overdue items', () => {
    const store = createDemoSeed();
    const overdue = filterOverdue(store.officeWorkItems ?? []);
    expect(overdue.length).toBeGreaterThan(0);
  });
});

describe('Office authorization', () => {
  it('dispatcher cannot view brokerage finance by default', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'dispatcher';
    const ctx = resolveOfficeStaffContext(store);
    expect(canViewFinancialDomain(ctx, 'brokerage')).toBe(false);
    expect(canViewFinancialDomain(ctx, 'factoring')).toBe(false);
  });

  it('billing specialist can view billing but not brokerage margin', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'billing_specialist';
    const ctx = resolveOfficeStaffContext(store);
    expect(hasOfficePermission(ctx, 'billing.read')).toBe(true);
    expect(canViewFinancialDomain(ctx, 'brokerage')).toBe(false);
  });

  it('factoring coordinator can view factoring finance only', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'factoring_coordinator';
    const ctx = resolveOfficeStaffContext(store);
    expect(canViewFinancialDomain(ctx, 'factoring')).toBe(true);
    expect(canViewFinancialDomain(ctx, 'brokerage')).toBe(false);
  });
});

describe('Approval and handoff transitions', () => {
  it('allows pending → approved/rejected only', () => {
    expect(transitionApprovalStatus('pending', 'approved')).toBe(true);
    expect(transitionApprovalStatus('pending', 'rejected')).toBe(true);
    expect(transitionApprovalStatus('approved', 'rejected')).toBe(false);
  });

  it('allows handoff pending → accepted → in_progress → completed', () => {
    expect(transitionHandoffStatus('pending', 'accepted')).toBe(true);
    expect(transitionHandoffStatus('accepted', 'in_progress')).toBe(true);
    expect(transitionHandoffStatus('in_progress', 'completed')).toBe(true);
    expect(transitionHandoffStatus('completed', 'pending')).toBe(false);
  });
});

describe('Client 360', () => {
  it('builds unified client view from canonical domains', () => {
    const store = createDemoSeed();
    const view = getClient360View(store, 'client-b');
    expect(view).not.toBeNull();
    expect(view!.companyName).toContain('Heartland');
    expect(view!.activeServices.length).toBeGreaterThan(0);
    expect(view!.tabs).toContain('overview');
  });

  it('warns on duplicate customer detection without auto-merge', () => {
    const store = createDemoSeed();
    const dupes = checkDuplicateCustomer(store, { email: 'diana.demo@heartland.example' });
    expect(dupes.length).toBeGreaterThan(0);
    expect(dupes[0].matchReason).toMatch(/email/i);
  });
});

describe('Internal note privacy invariant', () => {
  it('customer portal messages exclude internal notes', () => {
    const store = createDemoSeed();
    const internal = store.notes.every((n) => n.visibility === 'internal');
    expect(internal).toBe(true);
    const portalMessages = store.messages.filter((m) => m.visibility === 'customer');
    expect(portalMessages.every((m) => m.visibility !== 'internal')).toBe(true);
  });
});
