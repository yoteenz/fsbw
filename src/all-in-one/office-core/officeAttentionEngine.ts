import type { Priority } from '../demo/demoTypes';
import type { DemoStore } from '../demo/demoTypes';
import type { OfficeAttentionItem, OfficeWaitingOn } from './officeWorkTypes';
import { aioPaths } from '../utils/paths';
import { instanceStatusLabel } from '../workflow/workflowEngine';

export interface RawOfficeAttentionCandidate {
  dedupeKey: string;
  category: string;
  priority: Priority;
  title: string;
  explanation: string;
  statusLabel: string;
  organizationId?: string;
  organizationName?: string;
  ctaLabel: string;
  ctaHref: string;
  affectedAreas?: string[];
  entityType?: string;
  entityId?: string;
  waitingOn?: OfficeWaitingOn;
  sortScore: number;
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 400,
  high: 300,
  normal: 200,
  low: 100,
};

export function aggregateOfficeAttention(candidates: RawOfficeAttentionCandidate[]): OfficeAttentionItem[] {
  const byKey = new Map<string, OfficeAttentionItem>();

  for (const c of candidates) {
    const existing = byKey.get(c.dedupeKey);
    if (!existing) {
      byKey.set(c.dedupeKey, {
        id: c.dedupeKey,
        dedupeKey: c.dedupeKey,
        category: c.category,
        priority: c.priority,
        title: c.title,
        explanation: c.explanation,
        statusLabel: c.statusLabel,
        organizationId: c.organizationId,
        organizationName: c.organizationName,
        ctaLabel: c.ctaLabel,
        ctaHref: c.ctaHref,
        affectedAreas: c.affectedAreas ?? [],
        entityType: c.entityType,
        entityId: c.entityId,
        waitingOn: c.waitingOn,
      });
      continue;
    }

    const merged = new Set([...existing.affectedAreas, ...(c.affectedAreas ?? [])]);
    existing.affectedAreas = [...merged];
    if (PRIORITY_WEIGHT[c.priority] > PRIORITY_WEIGHT[existing.priority]) {
      existing.priority = c.priority;
      existing.title = c.title;
      existing.explanation = c.explanation;
      existing.ctaLabel = c.ctaLabel;
      existing.ctaHref = c.ctaHref;
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const scoreA = PRIORITY_WEIGHT[a.priority];
    const scoreB = PRIORITY_WEIGHT[b.priority];
    return scoreB - scoreA;
  });
}

export function collectOfficeAttentionCandidates(store: DemoStore): RawOfficeAttentionCandidate[] {
  const out: RawOfficeAttentionCandidate[] = [];
  const now = new Date();

  for (const w of store.officeWorkItems ?? []) {
    if (w.status === 'completed' || w.status === 'cancelled') continue;
    const client = store.clients.find((c) => c.id === w.organizationId);
    out.push({
      dedupeKey: `work:${w.id}`,
      category: w.division.replace('_', ' '),
      priority: w.priority,
      title: w.title,
      explanation: w.description ?? w.statusLabel,
      statusLabel: w.statusLabel.toUpperCase(),
      organizationId: w.organizationId,
      organizationName: client?.companyName,
      ctaLabel: 'OPEN WORK',
      ctaHref: w.sourceDomain === 'service_request'
        ? aioPaths.officeRequest(w.sourceEntityId)
        : aioPaths.officeWork,
      affectedAreas: [w.division.replace('_', ' ')],
      entityType: w.sourceEntityType,
      entityId: w.sourceEntityId,
      waitingOn: w.waitingOn,
      sortScore: PRIORITY_WEIGHT[w.priority],
    });
  }

  for (const policy of store.insurancePolicies ?? []) {
    if (!policy.expirationDate) continue;
    const days = Math.floor(
      (new Date(policy.expirationDate).getTime() - now.getTime()) / 86400000,
    );
    if (days > 30 || days < 0) continue;
    const orgId = policy.organizationId;
    const client = store.clients.find((c) => c.id === orgId);
    out.push({
      dedupeKey: `insurance-expiry:${orgId}:${policy.expirationDate.slice(0, 10)}`,
      category: 'insurance',
      priority: days <= 7 ? 'urgent' : days <= 18 ? 'high' : 'normal',
      title: 'Insurance renewal action needed',
      explanation: `Policy expiring in ${days} days.`,
      statusLabel: 'RENEWAL IN PROGRESS',
      organizationId: orgId,
      organizationName: client?.companyName,
      ctaLabel: 'VIEW INSURANCE',
      ctaHref: aioPaths.officeInsurance,
      affectedAreas: ['Insurance', 'Road Ready', 'Renewals'],
      entityType: 'insurance_policy',
      entityId: policy.id,
      waitingOn: 'all_in_one',
      sortScore: days <= 7 ? 380 : 260,
    });
  }

  for (const doc of store.documents.filter((d) => ['uploaded', 'under_review'].includes(d.status))) {
    const orgId = doc.organizationId ?? doc.clientId ?? '';
    const client = store.clients.find((c) => c.id === orgId);
    out.push({
      dedupeKey: `doc-review:${doc.id}`,
      category: 'documents',
      priority: 'high',
      title: `Review ${doc.title ?? doc.name ?? 'document'}`,
      explanation: 'Customer uploaded — review needed.',
      statusLabel: 'DOCUMENT RECEIVED',
      organizationId: orgId,
      organizationName: client?.companyName,
      ctaLabel: 'REVIEW',
      ctaHref: aioPaths.officeDocumentsReview,
      affectedAreas: ['Documents'],
      entityType: 'document',
      entityId: doc.id,
      waitingOn: 'all_in_one',
      sortScore: 340,
    });
  }

  for (const msg of store.messages.filter((m) => m.from === 'customer' && !m.read)) {
    const client = store.clients.find((c) => c.id === msg.clientId);
    out.push({
      dedupeKey: `msg:${msg.id}`,
      category: 'communication',
      priority: 'high',
      title: 'Customer message awaiting response',
      explanation: msg.body.slice(0, 120),
      statusLabel: 'CUSTOMER REPLY',
      organizationId: msg.clientId,
      organizationName: client?.companyName,
      ctaLabel: 'OPEN INBOX',
      ctaHref: aioPaths.officeInbox,
      affectedAreas: ['Messages'],
      entityType: 'message',
      entityId: msg.id,
      waitingOn: 'all_in_one',
      sortScore: 320,
    });
  }

  for (const wf of store.workflowInstances ?? []) {
    if (['completed', 'cancelled'].includes(wf.status)) continue;
    const client = store.clients.find((c) => c.id === wf.organizationId);
    const template = store.workflowTemplates?.find((t) => t.id === wf.templateId);
    if (['waiting_on_customer', 'waiting_external', 'blocked', 'ready_for_review'].includes(wf.status)) {
      out.push({
        dedupeKey: `workflow:${wf.id}`,
        category: 'workflows',
        priority: wf.status === 'blocked' ? 'urgent' : wf.status === 'ready_for_review' ? 'high' : 'normal',
        title: `${template?.name ?? 'Workflow'} — ${instanceStatusLabel(wf.status)}`,
        explanation: `Workflow at ${wf.progress}% — ${instanceStatusLabel(wf.status)}`,
        statusLabel: instanceStatusLabel(wf.status).toUpperCase(),
        organizationId: wf.organizationId,
        organizationName: client?.companyName,
        ctaLabel: 'OPEN WORKFLOW',
        ctaHref: aioPaths.officeWorkflow(wf.id),
        affectedAreas: ['Workflows', template?.division.replace('_', ' ') ?? 'Services'],
        entityType: 'workflow_instance',
        entityId: wf.id,
        waitingOn: wf.status === 'waiting_on_customer' ? 'customer' : wf.status === 'waiting_external' ? 'external_provider' : 'all_in_one',
        sortScore: wf.status === 'blocked' ? 360 : 240,
      });
    }
  }

  return out;
}
