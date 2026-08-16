import type { DemoStore, Client, ServiceRequest } from '../demo/demoTypes';
import type { CrmLead, CrmOpportunity, CrmConversionRecord } from './crmTypes';
import { createWorkflowInstanceFromRequest } from '../workflow/workflowOrchestrator';
import { resolveTemplateIdForService } from '../demo/workflowSeed';
import type { LineItemInput } from '../billing/billingCalculator';
import { relinkConversationOnLeadConversion } from '../demo/communicationActions';

export interface ConversionPreview {
  lead: CrmLead;
  opportunity: CrmOpportunity;
  willCreateOrganization: boolean;
  willLinkExistingOrganization: boolean;
  organizationId?: string;
  organizationName: string;
  serviceSlugs: string[];
  quoteId?: string;
  duplicateWarnings: string[];
}

export interface ConversionResult {
  success: boolean;
  error?: string;
  record?: CrmConversionRecord;
  organizationId?: string;
  serviceRequestIds?: string[];
}

function uid(): string {
  return crypto.randomUUID();
}

export function buildConversionPreview(
  store: DemoStore,
  leadId: string,
  opportunityId: string,
): ConversionPreview | null {
  const lead = store.crmLeads?.find((l) => l.id === leadId);
  const opp = store.crmOpportunities?.find((o) => o.id === opportunityId);
  if (!lead || !opp) return null;

  const existingOrg = lead.organizationId ? store.clients.find((c) => c.id === lead.organizationId) : undefined;
  const interests = (store.crmServiceInterests ?? []).filter((i) => i.leadId === leadId);
  const serviceSlugs = interests.map((i) => i.serviceSlug);

  return {
    lead,
    opportunity: opp,
    willCreateOrganization: !existingOrg,
    willLinkExistingOrganization: !!existingOrg,
    organizationId: existingOrg?.id,
    organizationName: existingOrg?.companyName ?? lead.businessName ?? `${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim(),
    serviceSlugs,
    quoteId: opp.quoteId,
    duplicateWarnings: existingOrg ? [] : [],
  };
}

export function convertLeadToCustomer(
  store: DemoStore,
  leadId: string,
  opportunityId: string,
  staffId?: string,
  forceNewOrganization = false,
): { store: DemoStore; result: ConversionResult } {
  const idempotencyKey = `convert:${leadId}:${opportunityId}`;
  const existing = store.crmConversionRecords?.find((r) => r.idempotencyKey === idempotencyKey);
  if (existing) {
    return {
      store,
      result: {
        success: true,
        record: existing,
        organizationId: existing.organizationId,
        serviceRequestIds: existing.serviceRequestIds,
      },
    };
  }

  const lead = store.crmLeads?.find((l) => l.id === leadId);
  const opp = store.crmOpportunities?.find((o) => o.id === opportunityId);
  if (!lead || !opp) return { store, result: { success: false, error: 'Lead or opportunity not found' } };
  if (lead.status === 'converted') return { store, result: { success: false, error: 'Lead already converted' } };
  if (lead.doNotContact) return { store, result: { success: false, error: 'Lead is marked Do Not Contact' } };

  const quote = opp.quoteId ? store.quotes.find((q) => q.id === opp.quoteId) : undefined;
  if (quote && quote.status !== 'accepted') {
    return { store, result: { success: false, error: 'Quote must be accepted before conversion' } };
  }

  let orgId = !forceNewOrganization ? lead.organizationId : undefined;
  let wasExisting = !!orgId;

  if (!orgId) {
    const client: Client = {
      id: uid(),
      companyName: lead.businessName ?? `${lead.firstName ?? 'New'} ${lead.lastName ?? 'Customer'}`.trim(),
      contactName: (`${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim() || lead.businessName) ?? 'Contact',
      contactEmail: lead.email ?? 'prospect@demo.local',
      contactPhone: lead.phone,
      clientType: lead.leadType === 'shipper' ? 'shipper' : lead.leadType === 'fleet' ? 'fleet' : lead.leadType === 'existing_carrier' ? 'carrier' : 'owner_operator',
      primaryState: store.intake?.business?.operatingState ?? 'FL',
      accountStatus: 'active',
      assignedStaffId: lead.assignedUserId ?? staffId,
      roadmapProgress: store.roadmap?.complianceProgress ?? 0,
      customerSince: new Date().toISOString().slice(0, 10),
      services: [],
      activeRequestCount: 0,
      documentsNeededCount: 0,
      lastActivityAt: new Date().toISOString(),
    };
    store.clients.unshift(client);
    orgId = client.id;
    wasExisting = false;
  }

  const interests = (store.crmServiceInterests ?? []).filter((i) => i.leadId === leadId && i.state !== 'declined');
  const serviceRequestIds: string[] = [];
  const now = new Date().toISOString();

  for (const interest of interests) {
    store.requestCounter += 1;
    const requestNumber = `AIO-DEMO-${String(store.requestCounter).padStart(4, '0')}`;
    const req: ServiceRequest = {
      id: uid(),
      requestNumber,
      clientId: orgId,
      services: [{ slug: interest.serviceSlug, title: interest.serviceTitle, division: divisionForSlug(interest.serviceSlug) }],
      division: divisionForSlug(interest.serviceSlug),
      status: 'new_request',
      statusLabel: 'New Request',
      workflowStep: 'new_request',
      priority: 'normal',
      createdAt: now,
      nextStep: 'All In One will begin processing your service',
      timeline: [],
      documentIds: [],
      taskIds: [],
      isDemo: true,
      billingStatus: quote ? 'awaiting_quote_acceptance' : 'quote_needed',
    };
    store.requests.unshift(req);
    serviceRequestIds.push(req.id);

    const templateId = resolveTemplateIdForService(interest.serviceSlug);
    if (templateId) {
      store = createWorkflowInstanceFromRequest(store, req.id, templateId, staffId);
    }
  }

  if (quote) {
    quote.organizationId = orgId;
    quote.status = 'converted';
    if (serviceRequestIds[0]) quote.serviceRequestId = serviceRequestIds[0];
  }

  const client = store.clients.find((c) => c.id === orgId);
  if (client) {
    client.services = [...new Set([...client.services, ...interests.map((i) => i.serviceTitle)])];
    client.activeRequestCount += serviceRequestIds.length;
    client.lastActivityAt = now;
  }

  lead.status = 'converted';
  lead.convertedAt = now;
  lead.organizationId = orgId;
  lead.updatedAt = now;
  store.crmLeads = (store.crmLeads ?? []).map((l) => (l.id === leadId ? lead : l));

  opp.status = 'won';
  opp.wonAt = now;
  opp.organizationId = orgId;
  opp.updatedAt = now;
  store.crmOpportunities = (store.crmOpportunities ?? []).map((o) => (o.id === opportunityId ? opp : o));

  for (const si of store.crmServiceInterests ?? []) {
    if (si.leadId === leadId) si.state = 'converted';
  }

  const record: CrmConversionRecord = {
    id: uid(),
    leadId,
    opportunityId,
    organizationId: orgId,
    contactCreated: !wasExisting,
    serviceRequestIds,
    quoteId: opp.quoteId,
    convertedByStaffId: staffId,
    convertedAt: now,
    idempotencyKey,
    wasExistingCustomer: wasExisting,
  };
  store.crmConversionRecords = [...(store.crmConversionRecords ?? []), record];

  store = relinkConversationOnLeadConversion(store, leadId, orgId);

  store.activity.unshift({
    id: uid(),
    kind: 'REQUEST_CREATED',
    title: `CRM conversion — ${client?.companyName ?? orgId}`,
    clientId: orgId,
    staffId,
    createdAt: now,
    visibility: 'internal',
  });

  return { store, result: { success: true, record, organizationId: orgId, serviceRequestIds } };
}

function divisionForSlug(slug: string): string {
  if (slug.includes('dispatch')) return 'dispatching';
  if (slug.includes('factoring')) return 'factoring';
  if (slug.includes('insurance') || slug.includes('liability')) return 'insurance';
  if (slug.includes('brokerage') || slug.includes('shipper')) return 'brokerage';
  if (slug.includes('llc') || slug.includes('formation')) return 'business-formation';
  return 'permitting';
}

export function lineItemsFromServiceSlugs(
  store: DemoStore,
  slugs: string[],
): LineItemInput[] {
  return slugs.map((slug) => {
    const pricing = store.servicePricing.find((p) => p.serviceSlug === slug);
    const title = pricing?.title ?? slug;
    const fee = pricing?.baseServiceFeeMinor ?? 25000;
    return {
      description: title,
      quantity: 1,
      unitAmountMinor: fee,
      feeCategory: 'service_fee' as const,
      amountStatus: 'known' as const,
    };
  });
}
