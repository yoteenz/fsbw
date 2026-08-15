import type { DemoStore } from '../demo/demoTypes';
import { getActivePolicy, getPoliciesForOrg, getRequestsForOrg as getInsuranceRequests } from '../demo/insuranceActions';
import { getRoadReadySummary } from '../demo/roadReadyActions';
import { getBillingSummary } from '../demo/billingActions';
import { resolveOfficeStaffContext, hasOfficePermission } from './officeContext';
import { enrichWorkItem } from './officeWorkEngine';
import { selectOfficeNextAction } from './officeNextActionEngine';
import { collectOfficeAttentionCandidates } from './officeAttentionEngine';
import type { Client360Tab, Client360View } from './officeWorkTypes';

function operationalStatus(client: { accountStatus: string }, waitingOnUs: number, waitingOnCustomer: number): { tone: string; label: string } {
  if (waitingOnUs > 0) return { tone: 'attention', label: 'ACTION NEEDED' };
  if (waitingOnCustomer > 0) return { tone: 'review', label: 'WAITING ON CUSTOMER' };
  if (client.accountStatus === 'pending') return { tone: 'review', label: 'ONBOARDING' };
  if (client.accountStatus === 'inactive') return { tone: 'good', label: 'INACTIVE' };
  return { tone: 'good', label: 'ACTIVE' };
}

export function getClient360View(store: DemoStore, organizationId: string): Client360View | null {
  const client = store.clients.find((c) => c.id === organizationId);
  if (!client) return null;

  const ctx = resolveOfficeStaffContext(store);
  const now = new Date();
  const staff = store.staff.find((s) => s.id === client.assignedStaffId);
  const rr = getRoadReadySummary(organizationId);

  const orgWork = (store.officeWorkItems ?? [])
    .filter((w) => w.organizationId === organizationId)
    .map((w) => enrichWorkItem(w, store, now));

  const customerWaitingOn = orgWork.filter((w) => w.waitingOn === 'customer' && w.status !== 'completed');
  const allInOneWaitingOn = orgWork.filter((w) => w.waitingOn === 'all_in_one' && w.status !== 'completed');

  const myCandidates = collectOfficeAttentionCandidates(store).filter((c) => c.organizationId === organizationId);
  const nextStaffAction = selectOfficeNextAction(
    orgWork.filter((w) => w.assignedUserId === ctx.staffId),
    myCandidates,
    ctx.isManager,
  );

  const activeServices: { name: string; status: string }[] = [];
  if (client.services.some((s) => s.includes('Authority') || s.includes('IRP') || s.includes('Formation'))) {
    activeServices.push({ name: 'Permitting & Compliance', status: 'ACTIVE' });
  }
  if (store.dispatchEnrollments.some((e) => e.organizationId === organizationId && e.status === 'active')) {
    activeServices.push({ name: 'Dispatch', status: 'ACTIVE' });
  }
  if (store.factoringProfiles.some((p) => p.organizationId === organizationId && p.enrollmentStatus === 'active')) {
    activeServices.push({ name: 'Factoring', status: 'ACTIVE — External Provider' });
  }
  if (getInsuranceRequests(organizationId, store).length > 0 || getPoliciesForOrg(organizationId, store).length > 0) {
    const activePolicy = getActivePolicy(organizationId, store);
    activeServices.push({
      name: 'Insurance Assistance',
      status: activePolicy?.status === 'active' ? 'ACTIVE' : 'RENEWAL IN PROGRESS',
    });
  }
  if (store.loads.some((l) => l.sourceType === 'brokerage' && l.organizationId === organizationId)) {
    activeServices.push({ name: 'Brokerage Carrier Network', status: 'ACTIVE' });
  }

  const docs = store.documents.filter((d) => (d.organizationId ?? d.clientId) === organizationId);
  const billing = getBillingSummary(organizationId, store);
  const messages = store.messages.filter((m) => m.clientId === organizationId && m.visibility === 'customer');
  const notes = store.notes.filter((n) => n.clientId === organizationId);
  const pinnedNotes = notes
    .filter((n) => n.pinned)
    .map((n) => ({ body: n.body, authorInitials: n.authorInitials, noteType: n.noteType ?? 'general' }));

  const timeline = store.activity
    .filter((a) => a.clientId === organizationId && a.visibility === 'internal')
    .slice(0, 20)
    .map((a) => ({ title: a.title, createdAt: a.createdAt, kind: a.kind }));

  const tabs: Client360Tab[] = ['overview', 'services', 'road_ready', 'fleet', 'documents', 'messages', 'activity', 'internal_notes'];
  if (hasOfficePermission(ctx, 'billing.read')) tabs.splice(tabs.indexOf('documents') + 1, 0, 'insurance', 'operations', 'billing');
  else {
    tabs.push('insurance', 'operations');
  }
  if (hasOfficePermission(ctx, 'factoring_finance.read')) tabs.push('factoring');
  if (hasOfficePermission(ctx, 'brokerage_finance.read')) tabs.push('brokerage');

  const op = operationalStatus(client, allInOneWaitingOn.length, customerWaitingOn.length);

  return {
    organizationId,
    companyName: client.companyName,
    customerSince: client.customerSince,
    primaryContact: client.contactName,
    phone: client.contactPhone,
    email: client.contactEmail,
    organizationType: client.clientType.replace('_', ' '),
    roadReadyProgress: rr?.scores.setupProgress ?? client.roadmapProgress,
    accountStatus: client.accountStatus,
    operationalStatus: op.tone,
    operationalStatusLabel: op.label,
    assignedStaffName: staff?.name,
    activeServices,
    nextStaffAction,
    customerWaitingOn,
    allInOneWaitingOn,
    activeRequests: store.requests.filter((r) => r.clientId === organizationId && !['completed', 'cancelled'].includes(r.status)).length,
    upcomingDeadlines: store.deadlines
      .filter((d) => d.clientId === organizationId && !d.complete)
      .slice(0, 5)
      .map((d) => ({ label: d.label, dueDate: d.dueDate })),
    openDocumentRequests: docs.filter((d) => d.status === 'requested').length,
    billingStatus: billing.openInvoices.length > 0 ? `${billing.openInvoices.length} open invoice(s)` : 'Current',
    recentCommunication: messages.slice(0, 5).map((m) => ({
      author: m.authorName,
      body: m.body,
      createdAt: m.createdAt,
    })),
    pinnedNotes,
    timeline,
    tabs,
  };
}

export function checkDuplicateCustomer(
  store: DemoStore,
  fields: { legalName?: string; email?: string; phone?: string; usdot?: string; mc?: string },
): { id: string; companyName: string; matchReason: string }[] {
  const matches: { id: string; companyName: string; matchReason: string }[] = [];
  for (const c of store.clients) {
    if (fields.legalName && c.companyName.toLowerCase() === fields.legalName.toLowerCase()) {
      matches.push({ id: c.id, companyName: c.companyName, matchReason: 'Legal name match' });
    }
    if (fields.email && c.contactEmail.toLowerCase() === fields.email.toLowerCase()) {
      matches.push({ id: c.id, companyName: c.companyName, matchReason: 'Email match' });
    }
    if (fields.phone && c.contactPhone === fields.phone) {
      matches.push({ id: c.id, companyName: c.companyName, matchReason: 'Phone match' });
    }
  }
  const seen = new Set<string>();
  return matches.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}
