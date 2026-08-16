import type { IntakeAnswers } from '../intake/intakeTypes';
import { buildLineItems, calculateBillingTotals } from '../billing/billingCalculator';
import type { Quote, QuoteVersion } from '../billing/billingTypes';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import {
  buildConversionPreview,
  convertLeadToCustomer,
  lineItemsFromServiceSlugs,
} from '../crm/conversionEngine';
import { findDuplicateMatches } from '../crm/leadDeduplication';
import type {
  CrmActivity,
  CrmFollowUp,
  CrmLead,
  CrmLeadSourceSlug,
  CrmLeadStatus,
  CrmOpportunity,
  CrmServiceInterest,
} from '../crm/crmTypes';
import { CARRIER_PIPELINE_ID, SHIPPER_PIPELINE_ID } from '../crm/crmTypes';
import { createConversation } from './communicationActions';

function uid(): string {
  return crypto.randomUUID();
}

function secureToken(): string {
  return `qt_${crypto.randomUUID().replace(/-/g, '')}`;
}

function prospectOrgId(leadId: string): string {
  return `prospect-${leadId}`;
}

export function getCrmLeads(store: DemoStore = loadDemoStore()): CrmLead[] {
  return (store.crmLeads ?? []).filter((l) => !l.mergedIntoLeadId);
}

export function getLead(id: string, store: DemoStore = loadDemoStore()): CrmLead | undefined {
  return store.crmLeads?.find((l) => l.id === id);
}

export function getOpportunity(id: string, store: DemoStore = loadDemoStore()): CrmOpportunity | undefined {
  return store.crmOpportunities?.find((o) => o.id === id);
}

export function getLeadInterests(leadId: string, store: DemoStore = loadDemoStore()): CrmServiceInterest[] {
  return (store.crmServiceInterests ?? []).filter((i) => i.leadId === leadId);
}

export function getLeadActivities(leadId: string, store: DemoStore = loadDemoStore()): CrmActivity[] {
  return (store.crmActivities ?? []).filter((a) => a.leadId === leadId);
}

export function getLeadOpportunities(leadId: string, store: DemoStore = loadDemoStore()): CrmOpportunity[] {
  return (store.crmOpportunities ?? []).filter((o) => o.leadId === leadId);
}

export function getQuoteBySecureToken(token: string, store: DemoStore = loadDemoStore()): Quote | undefined {
  return store.quotes.find((q) => q.secureToken === token);
}

export function createLeadFromForm(input: {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  message?: string;
  sourceSlug?: CrmLeadSourceSlug;
  serviceSlug?: string;
  serviceTitle?: string;
  preferredContactMethod?: 'phone' | 'email' | 'text';
  utm?: CrmLead['utm'];
}): CrmLead {
  let created!: CrmLead;
  updateDemoStore((s) => {
    const dupes = findDuplicateMatches(s, { email: input.email, phone: input.phone, businessName: input.businessName });
    const source = s.crmLeadSources?.find((x) => x.slug === (input.sourceSlug ?? 'website')) ?? s.crmLeadSources?.[0];
    const now = new Date().toISOString();
    const lead: CrmLead = {
      id: uid(),
      firstName: input.firstName,
      lastName: input.lastName,
      businessName: input.businessName,
      email: input.email,
      phone: input.phone,
      preferredContactMethod: input.preferredContactMethod,
      leadType: input.serviceSlug?.includes('shipper') ? 'shipper' : 'unknown',
      leadSourceId: source?.id ?? 'src-unknown',
      originalSourceId: source?.id,
      latestSourceId: source?.id,
      status: 'new',
      priority: 'normal',
      qualificationState: 'not_started',
      utm: input.utm,
      possibleDuplicateOfLeadId: dupes.find((d) => d.kind === 'lead')?.id,
      organizationId: dupes.find((d) => d.kind === 'client')?.id,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    s.crmLeads = [...(s.crmLeads ?? []), lead];
    if (input.serviceSlug && input.serviceTitle) {
      s.crmServiceInterests = [
        ...(s.crmServiceInterests ?? []),
        { id: uid(), leadId: lead.id, serviceSlug: input.serviceSlug, serviceTitle: input.serviceTitle, state: 'interested', source: 'form', createdAt: now },
      ];
    }
    if (input.message) {
      s.crmActivities = [
        ...(s.crmActivities ?? []),
        { id: uid(), leadId: lead.id, activityType: 'note', title: 'Inbound message', body: input.message, createdAt: now, isDemo: true },
      ];
    }
    scheduleFollowUpInternal(s, lead.id, 'First contact', now, 'staff-2');
    created = lead;
    return s;
  });
  if (input.message) {
    createConversation({
      subject: input.serviceTitle ? `Inquiry — ${input.serviceTitle}` : 'Website inquiry',
      conversationType: input.serviceSlug?.includes('insurance') ? 'insurance' : input.serviceSlug?.includes('dispatch') ? 'dispatch' : 'sales',
      leadId: created.id,
      primaryContextType: 'lead',
      primaryContextId: created.id,
      initialMessage: input.message,
      senderName: `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim() || input.businessName || 'Prospect',
    });
  }
  return created;
}

export function createLeadFromIntake(intake: IntakeAnswers, roadmapServiceSlugs?: string[]): CrmLead {
  let created!: CrmLead;
  updateDemoStore((s) => {
    const email = intake.contact?.email;
    const phone = intake.contact?.phone;
    const businessName = intake.business?.name;
    const dupes = findDuplicateMatches(s, { email, phone, businessName });
    const source = s.crmLeadSources?.find((x) => x.slug === 'smart_intake');
    const now = new Date().toISOString();
    const lead: CrmLead = {
      id: uid(),
      firstName: intake.contact?.name?.split(' ')[0],
      lastName: intake.contact?.name?.split(' ').slice(1).join(' '),
      businessName,
      email,
      phone,
      leadType: intake.business?.operationType === 'shipper' ? 'shipper' : intake.goal === 'start_business' ? 'new_trucking_business' : 'unknown',
      leadSourceId: source?.id ?? 'src-intake',
      originalSourceId: source?.id,
      latestSourceId: source?.id,
      status: 'qualifying',
      priority: 'high',
      qualificationState: 'in_progress',
      possibleDuplicateOfLeadId: dupes.find((d) => d.kind === 'lead')?.id,
      organizationId: dupes.find((d) => d.kind === 'client')?.id,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    s.crmLeads = [...(s.crmLeads ?? []), lead];
    const slugs = roadmapServiceSlugs ?? mapIntakeToServiceSlugs(intake);
    s.crmServiceInterests = [
      ...(s.crmServiceInterests ?? []),
      ...slugs.map((slug) => ({
        id: uid(),
        leadId: lead.id,
        serviceSlug: slug,
        serviceTitle: s.servicePricing.find((p) => p.serviceSlug === slug)?.title ?? slug,
        state: 'interested' as const,
        source: 'smart_intake',
        createdAt: now,
      })),
    ];
    s.crmActivities = [
      ...(s.crmActivities ?? []),
      { id: uid(), leadId: lead.id, activityType: 'note', title: 'Smart Intake completed', body: 'Structured intake captured business context and service interests.', createdAt: now, isDemo: true },
    ];
    created = lead;
    return s;
  });
  return created;
}

function mapIntakeToServiceSlugs(intake: IntakeAnswers): string[] {
  const slugs: string[] = [];
  if (intake.goal === 'start_business') {
    slugs.push('llc-formation-assistance', 'operating-authority-assistance', 'boc-3-assistance');
  }
  if (intake.goal === 'get_legal') slugs.push('llc-formation-assistance');
  if (intake.goal === 'compliance') slugs.push('operating-authority-assistance', 'irp-apportioned-registration');
  if (intake.goal === 'insurance') slugs.push('commercial-auto-liability');
  if (intake.goal === 'dispatch') slugs.push('carrier-dispatch-support');
  if (intake.goal === 'factoring') slugs.push('factoring-consultation');
  if (intake.goal === 'move_freight') slugs.push('freight-quote');
  return [...new Set(slugs)];
}

function scheduleFollowUpInternal(s: DemoStore, leadId: string, purpose: string, fromIso: string, staffId: string) {
  const scheduled = new Date(new Date(fromIso).getTime() + 86400000).toISOString();
  const followUpId = uid();
  s.crmFollowUps = [
    ...(s.crmFollowUps ?? []),
    { id: followUpId, leadId, purpose, scheduledFor: scheduled, assignedUserId: staffId, status: 'upcoming', createdAt: fromIso, isDemo: true },
  ];
  const lead = s.crmLeads?.find((l) => l.id === leadId);
  s.officeWorkItems = [
    ...(s.officeWorkItems ?? []),
    {
      id: `owi-crm-${followUpId}`,
      sourceDomain: 'crm',
      sourceEntityType: 'crm_follow_up',
      sourceEntityId: followUpId,
      organizationId: lead?.organizationId ?? `prospect-${leadId}`,
      title: purpose,
      description: lead?.businessName ?? `${lead?.firstName ?? ''} ${lead?.lastName ?? ''}`.trim(),
      workType: 'follow_up',
      division: 'customer_support',
      queueId: 'crm_follow_up',
      priority: 'normal',
      status: 'new',
      statusLabel: 'New',
      assignedUserId: staffId,
      dueAt: scheduled,
      waitingOn: 'none',
      createdAt: fromIso,
      updatedAt: fromIso,
      version: 1,
      isDemo: true,
    },
  ];
}

export function updateLeadStatus(leadId: string, status: CrmLeadStatus, staffId?: string): void {
  updateDemoStore((s) => {
    s.crmLeads = (s.crmLeads ?? []).map((l) =>
      l.id === leadId ? { ...l, status, updatedAt: new Date().toISOString(), qualifiedAt: status === 'qualified' ? new Date().toISOString() : l.qualifiedAt } : l,
    );
    s.crmActivities = [
      ...(s.crmActivities ?? []),
      { id: uid(), leadId, activityType: 'status_change', title: `Status → ${status}`, actorStaffId: staffId, createdAt: new Date().toISOString(), isDemo: true },
    ];
    return s;
  });
}

export function logCall(leadId: string, outcome: CrmActivity['callOutcome'], notes?: string, staffId?: string): void {
  updateDemoStore((s) => {
    const now = new Date().toISOString();
    s.crmActivities = [
      ...(s.crmActivities ?? []),
      { id: uid(), leadId, activityType: 'call', title: `Call — ${outcome?.replace(/_/g, ' ') ?? 'logged'}`, body: notes, callOutcome: outcome, actorStaffId: staffId, createdAt: now, isDemo: true },
    ];
    const lead = s.crmLeads?.find((l) => l.id === leadId);
    if (lead && !lead.firstContactAt && outcome === 'connected') {
      lead.firstContactAt = now;
      lead.firstStaffActionAt = lead.firstStaffActionAt ?? now;
      if (lead.status === 'new') lead.status = 'contacted';
      lead.updatedAt = now;
    }
    return s;
  });
}

export function addLeadNote(leadId: string, body: string, staffId?: string): void {
  updateDemoStore((s) => {
    s.crmActivities = [
      ...(s.crmActivities ?? []),
      { id: uid(), leadId, activityType: 'note', title: 'Internal note', body, actorStaffId: staffId, createdAt: new Date().toISOString(), isDemo: true },
    ];
    return s;
  });
}

export function createOpportunity(leadId: string, name: string, pipelineId?: string): CrmOpportunity {
  let created!: CrmOpportunity;
  updateDemoStore((s) => {
    const lead = s.crmLeads?.find((l) => l.id === leadId);
    const pipe = pipelineId ?? (lead?.leadType === 'shipper' ? SHIPPER_PIPELINE_ID : CARRIER_PIPELINE_ID);
    const firstStage = (s.crmPipelineStages ?? []).find((st) => st.pipelineId === pipe && st.sortOrder === 1);
    const now = new Date().toISOString();
    const opp: CrmOpportunity = {
      id: uid(),
      leadId,
      name,
      status: 'open',
      pipelineId: pipe,
      pipelineStageId: firstStage?.id ?? 'cs-new',
      organizationId: lead?.organizationId,
      assignedUserId: lead?.assignedUserId,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    s.crmOpportunities = [...(s.crmOpportunities ?? []), opp];
    created = opp;
    return s;
  });
  return created;
}

export function moveOpportunityStage(opportunityId: string, stageId: string, staffId?: string): void {
  updateDemoStore((s) => {
    const stage = s.crmPipelineStages?.find((st) => st.id === stageId);
    s.crmOpportunities = (s.crmOpportunities ?? []).map((o) => {
      if (o.id !== opportunityId) return o;
      const updated = { ...o, pipelineStageId: stageId, updatedAt: new Date().toISOString() };
      if (stage?.isLost) {
        updated.status = 'lost';
        updated.lostAt = new Date().toISOString();
      }
      if (stage?.isWon) {
        updated.status = 'won';
        updated.wonAt = new Date().toISOString();
      }
      return updated;
    });
    const opp = s.crmOpportunities?.find((o) => o.id === opportunityId);
    if (opp) {
      s.crmActivities = [
        ...(s.crmActivities ?? []),
        { id: uid(), leadId: opp.leadId, opportunityId, activityType: 'status_change', title: `Pipeline → ${stage?.name ?? stageId}`, actorStaffId: staffId, createdAt: new Date().toISOString(), isDemo: true },
      ];
    }
    return s;
  });
}

export function createQuoteFromOpportunity(opportunityId: string, staffId: string): Quote {
  let quote!: Quote;
  updateDemoStore((s) => {
    const opp = s.crmOpportunities?.find((o) => o.id === opportunityId);
    if (!opp) throw new Error('Opportunity not found');
    const lead = s.crmLeads?.find((l) => l.id === opp.leadId);
    const interests = (s.crmServiceInterests ?? []).filter((i) => i.leadId === opp.leadId && i.state !== 'declined');
    const slugs = interests.map((i) => i.serviceSlug);
    const lineInputs = lineItemsFromServiceSlugs(s, slugs);
    const lineItems = buildLineItems(lineInputs);
    const totals = calculateBillingTotals(lineItems);
    const quoteId = uid();
    const version: QuoteVersion = {
      id: `${quoteId}-v1`,
      quoteId,
      versionNumber: 1,
      lineItems: totals.lineItems,
      subtotalServiceFeesMinor: totals.subtotalServiceFeesMinor,
      subtotalExternalFeesMinor: totals.subtotalExternalFeesMinor,
      discountTotalMinor: totals.discountTotalMinor,
      taxTotalMinor: totals.taxTotalMinor,
      totalKnownMinor: totals.totalKnownMinor,
      hasPendingExternalFees: totals.hasPendingExternalFees,
      createdAt: new Date().toISOString(),
      createdByStaffId: staffId,
    };
    const q: Quote = {
      id: quoteId,
      quoteNumber: nextQuoteNumber(s),
      organizationId: lead?.organizationId ?? prospectOrgId(opp.leadId),
      leadId: opp.leadId,
      opportunityId: opp.id,
      secureToken: secureToken(),
      serviceTitle: opp.name,
      status: 'draft',
      currentVersionId: version.id,
      versions: [version],
      issueDate: new Date().toISOString().slice(0, 10),
      expirationDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      preparedByStaffId: staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.quotes.unshift(q);
    opp.quoteId = q.id;
    opp.pipelineStageId = 'cs-quote-prep';
    opp.updatedAt = new Date().toISOString();
    s.crmOpportunities = (s.crmOpportunities ?? []).map((o) => (o.id === opportunityId ? opp : o));
    quote = q;
    return s;
  });
  return quote;
}

function nextQuoteNumber(s: DemoStore): string {
  s.billingCounters.quote += 1;
  return `AIO-QTE-${new Date().getFullYear()}-${String(s.billingCounters.quote).padStart(6, '0')}`;
}

export function recordQuoteSent(quoteId: string, staffId?: string): void {
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.id === quoteId);
    if (!q) return s;
    q.status = 'sent';
    q.updatedAt = new Date().toISOString();
    if (q.opportunityId) {
      s.crmOpportunities = (s.crmOpportunities ?? []).map((o) =>
        o.id === q.opportunityId ? { ...o, pipelineStageId: 'cs-quote-sent', updatedAt: new Date().toISOString() } : o,
      );
    }
    if (q.leadId) {
      s.crmActivities = [
        ...(s.crmActivities ?? []),
        { id: uid(), leadId: q.leadId, opportunityId: q.opportunityId, activityType: 'quote_sent', title: `Quote sent — ${q.quoteNumber}`, actorStaffId: staffId, createdAt: new Date().toISOString(), isDemo: true },
      ];
    }
    return s;
  });
}

export function acceptQuoteByToken(token: string, acceptedByLabel?: string): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.secureToken === token);
    if (!q || !['sent', 'viewed', 'revised'].includes(q.status)) return s;
    if (q.expirationDate && q.expirationDate < new Date().toISOString().slice(0, 10)) {
      q.status = 'expired';
      return s;
    }
    const version = q.versions.find((v) => v.id === q.currentVersionId);
    if (!version) return s;
    q.status = 'accepted';
    q.acceptance = {
      versionId: version.id,
      acceptedAt: new Date().toISOString(),
      totalAcceptedMinor: version.totalKnownMinor,
      acceptedByLabel,
    };
    q.updatedAt = new Date().toISOString();
    if (q.opportunityId) {
      s.crmOpportunities = (s.crmOpportunities ?? []).map((o) =>
        o.id === q.opportunityId ? { ...o, pipelineStageId: 'cs-decision', updatedAt: new Date().toISOString() } : o,
      );
    }
    if (q.leadId) {
      s.crmActivities = [
        ...(s.crmActivities ?? []),
        { id: uid(), leadId: q.leadId, opportunityId: q.opportunityId, activityType: 'customer_reply', title: 'Quote accepted', body: `${acceptedByLabel ?? 'Prospect'} accepted quote.`, createdAt: new Date().toISOString(), isDemo: true },
      ];
    }
    ok = true;
    return s;
  });
  return ok;
}

export function declineQuoteByToken(token: string, reason?: string): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.secureToken === token);
    if (!q || !['sent', 'viewed'].includes(q.status)) return s;
    q.status = 'declined';
    q.updatedAt = new Date().toISOString();
    if (q.leadId) {
      s.crmActivities = [
        ...(s.crmActivities ?? []),
        { id: uid(), leadId: q.leadId, activityType: 'note', title: 'Quote declined', body: reason, createdAt: new Date().toISOString(), isDemo: true },
      ];
    }
    ok = true;
    return s;
  });
  return ok;
}

export function getConversionPreview(leadId: string, opportunityId: string) {
  return buildConversionPreview(loadDemoStore(), leadId, opportunityId);
}

export function convertLead(leadId: string, opportunityId: string, staffId?: string, forceNewOrganization = false) {
  return updateDemoStore((s) => convertLeadToCustomer(s, leadId, opportunityId, staffId, forceNewOrganization).store);
}

export function mergeLeads(sourceLeadId: string, destinationLeadId: string, staffId?: string): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const src = s.crmLeads?.find((l) => l.id === sourceLeadId);
    const dest = s.crmLeads?.find((l) => l.id === destinationLeadId);
    if (!src || !dest || src.mergedIntoLeadId) return s;
    src.mergedIntoLeadId = destinationLeadId;
    src.status = 'lost';
    src.updatedAt = new Date().toISOString();
    for (const i of s.crmServiceInterests ?? []) {
      if (i.leadId === sourceLeadId) i.leadId = destinationLeadId;
    }
    for (const o of s.crmOpportunities ?? []) {
      if (o.leadId === sourceLeadId) o.leadId = destinationLeadId;
    }
    for (const a of s.crmActivities ?? []) {
      if (a.leadId === sourceLeadId) a.leadId = destinationLeadId;
    }
    s.crmActivities = [
      ...(s.crmActivities ?? []),
      { id: uid(), leadId: destinationLeadId, activityType: 'note', title: 'Lead merged', body: `Merged lead ${sourceLeadId} into ${destinationLeadId}`, actorStaffId: staffId, createdAt: new Date().toISOString(), isDemo: true },
    ];
    ok = true;
    return s;
  });
  return ok;
}

export function setDoNotContact(leadId: string, reason: string, staffId?: string): void {
  updateDemoStore((s) => {
    s.crmLeads = (s.crmLeads ?? []).map((l) =>
      l.id === leadId
        ? {
            ...l,
            doNotContact: true,
            doNotContactReason: reason,
            doNotContactAt: new Date().toISOString(),
            doNotContactById: staffId,
            status: 'do_not_contact',
            consent: { ...l.consent, emailContactAllowed: false, smsContactAllowed: false, marketingOptIn: false },
            updatedAt: new Date().toISOString(),
          }
        : l,
    );
    return s;
  });
}

export function getCrmMetrics(store: DemoStore = loadDemoStore()) {
  const leads = getCrmLeads(store);
  const opps = store.crmOpportunities ?? [];
  const followUps = store.crmFollowUps ?? [];
  const now = Date.now();
  return {
    newLeads: leads.filter((l) => l.status === 'new').length,
    needFollowUp: followUps.filter((f) => f.status === 'due' || f.status === 'overdue').length,
    qualifying: leads.filter((l) => l.status === 'qualifying').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    quotesOut: opps.filter((o) => o.pipelineStageId === 'cs-quote-sent' || o.pipelineStageId === 'cs-decision').length,
    decisionPending: opps.filter((o) => o.pipelineStageId === 'cs-decision' && o.status === 'open').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    lost: leads.filter((l) => l.status === 'lost').length,
    followUpToday: followUps.filter((f) => {
      const d = new Date(f.scheduledFor).getTime();
      return f.status !== 'completed' && d <= now + 86400000 && d >= now - 86400000;
    }).length,
    overdueFollowUp: followUps.filter((f) => f.status === 'overdue' || (f.status !== 'completed' && new Date(f.scheduledFor).getTime() < now)).length,
  };
}

export function getDueFollowUps(store: DemoStore = loadDemoStore()): CrmFollowUp[] {
  const now = Date.now();
  return (store.crmFollowUps ?? []).filter((f) => f.status !== 'completed' && f.status !== 'cancelled' && new Date(f.scheduledFor).getTime() <= now + 86400000);
}

export function completeFollowUp(followUpId: string): void {
  updateDemoStore((s) => {
    s.crmFollowUps = (s.crmFollowUps ?? []).map((f) =>
      f.id === followUpId ? { ...f, status: 'completed', completedAt: new Date().toISOString() } : f,
    );
    s.officeWorkItems = (s.officeWorkItems ?? []).map((w) =>
      w.sourceEntityId === followUpId && w.sourceDomain === 'crm'
        ? { ...w, status: 'completed', statusLabel: 'Completed', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : w,
    );
    return s;
  });
}

export { findDuplicateMatches };
