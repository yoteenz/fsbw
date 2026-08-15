import { buildNotification } from '../notifications/notificationEngine';
import { derivePolicyStatusFromDates } from '../insurance/insuranceCalculations';
import { canTransitionRequestStatus, isPolicyActiveForRoadReady } from '../insurance/insuranceRules';
import { manualInsurancePartnerAdapter } from '../insurance/insurancePartnerAdapter';
import type {
  InsurancePolicy,
  InsuranceQuoteRecord,
  InsuranceRequest,
} from '../insurance/insuranceTypes';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { aioPaths } from '../utils/paths';

function uid(): string {
  return crypto.randomUUID();
}

export function getOrganizationId(store: DemoStore = loadDemoStore()): string {
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

export function getInsuranceMetrics(store: DemoStore = loadDemoStore()) {
  const openRequests = store.insuranceRequests.filter((r) => !['completed', 'cancelled', 'declined'].includes(r.status));
  return {
    openRequests: openRequests.length,
    incompleteRequests: openRequests.filter((r) => r.status === 'information_needed').length,
    partnerReview: openRequests.filter((r) => ['referred', 'partner_review'].includes(r.status)).length,
    quotesReported: openRequests.filter((r) => r.status === 'quote_options_reported' || r.status === 'customer_review').length,
    policiesExpiring: store.insurancePolicies.filter((p) => p.status === 'expiring_soon').length,
    expiredPolicies: store.insurancePolicies.filter((p) => p.status === 'expired').length,
    coiRequests: store.insuranceCertificates.filter((c) => ['requested', 'processing'].includes(c.status)).length,
    roadReadyBlockers: store.insuranceIssues.filter((i) => i.status === 'open').length,
  };
}

export function getPoliciesForOrg(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.insurancePolicies.filter((p) => p.organizationId === orgId && p.status !== 'replaced');
}

export function getActivePolicy(orgId: string, store: DemoStore = loadDemoStore()): InsurancePolicy | undefined {
  return getPoliciesForOrg(orgId, store).find((p) => ['active', 'expiring_soon'].includes(p.status));
}

export function getRequestsForOrg(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.insuranceRequests.filter((r) => r.organizationId === orgId);
}

export function getQuotesForRequest(requestId: string, store: DemoStore = loadDemoStore()) {
  return store.insuranceQuoteRecords.filter((q) => q.requestId === requestId);
}

export function syncInsuranceToRoadReady(orgId: string, store: DemoStore): DemoStore {
  const profile = store.roadReadyProfiles.find((p) => p.organizationId === orgId);
  const active = getActivePolicy(orgId, store);
  if (profile) {
    if (active && isPolicyActiveForRoadReady(active)) {
      profile.insurance = {
        hasInsurance: 'yes',
        carrierName: active.carrierName,
        expirationDate: active.expirationDate,
      };
    } else {
      profile.insurance = { ...profile.insurance, hasInsurance: profile.insurance?.hasInsurance ?? 'in_progress' };
    }
    profile.updatedAt = new Date().toISOString();
  }
  const item = store.roadReadyItems.find((i) => i.organizationId === orgId && i.requirementKey === 'commercial_insurance');
  if (item && active) {
    const derived = derivePolicyStatusFromDates(active.expirationDate, active.status);
    if (derived === 'active' || derived === 'expiring_soon') {
      item.status = derived === 'expiring_soon' ? 'action_needed' : 'completed';
      item.verificationStatus = active.verificationState === 'staff_reviewed' ? 'verified' : 'self_reported';
      item.expirationDate = active.expirationDate;
    } else if (derived === 'expired') {
      item.status = 'action_needed';
      item.verificationStatus = 'expired';
    }
  }
  return store;
}

export function submitInsuranceRequest(
  orgId: string,
  partial: Pick<InsuranceRequest, 'requestType' | 'coverageNeeds' | 'selectedPowerUnitIds' | 'coverageNeedNotes'>,
): string {
  let id = '';
  updateDemoStore((s) => {
    s.insuranceCounters.request += 1;
    id = uid();
    const req: InsuranceRequest = {
      id,
      requestNumber: `IR-2026-${String(s.insuranceCounters.request).padStart(4, '0')}`,
      organizationId: orgId,
      status: 'submitted',
      documentIds: [],
      assignedCoordinatorStaffId: 'staff-5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      ...partial,
    };
    s.insuranceRequests.push(req);
    s.notifications.unshift(
      buildNotification({
        organizationId: orgId,
        recipientType: 'staff',
        staffId: 'staff-5',
        eventType: 'INSURANCE_REQUEST_SUBMITTED',
        category: 'insurance',
        title: 'Insurance request received',
        body: req.requestNumber,
        link: aioPaths.officeInsuranceRequest(req.id),
      }),
    );
    s.activity.unshift({
      id: uid(),
      kind: 'INSURANCE_REQUEST_SUBMITTED',
      title: `Insurance request ${req.requestNumber}`,
      clientId: orgId,
      createdAt: req.createdAt,
      visibility: 'internal',
    });
    return s;
  });
  return id;
}

export function addExistingPolicy(
  orgId: string,
  partial: Pick<InsurancePolicy, 'carrierName' | 'policyNumber' | 'effectiveDate' | 'expirationDate' | 'agencyName' | 'policyType'>,
): string {
  let id = '';
  updateDemoStore((s) => {
    s.insuranceCounters.policy += 1;
    id = uid();
    const status = derivePolicyStatusFromDates(partial.expirationDate, 'pending');
    const policy: InsurancePolicy = {
      id,
      organizationId: orgId,
      policyType: partial.policyType ?? 'Commercial Auto',
      carrierName: partial.carrierName,
      agencyName: partial.agencyName,
      policyNumber: partial.policyNumber,
      effectiveDate: partial.effectiveDate,
      expirationDate: partial.expirationDate,
      status,
      verificationState: 'customer_reported',
      source: 'customer_intake',
      documentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    s.insurancePolicies.push(policy);
    syncInsuranceToRoadReady(orgId, s);
    s.notifications.unshift(
      buildNotification({
        organizationId: orgId,
        recipientType: 'customer',
        eventType: 'INSURANCE_POLICY_RECORDED',
        category: 'insurance',
        title: 'Policy information saved',
        body: 'Your policy record is customer-reported until reviewed.',
        link: aioPaths.portalInsurancePolicy(policy.id),
      }),
    );
    return s;
  });
  return id;
}

export function recordPartnerReferral(requestId: string, partnerId: string, staffId: string): void {
  updateDemoStore((s) => {
    const req = s.insuranceRequests.find((r) => r.id === requestId);
    if (!req || !canTransitionRequestStatus(req.status, 'referred')) return s;
    const handoffId = uid();
    const result = manualInsurancePartnerAdapter.createReferral({
      requestId,
      organizationId: req.organizationId,
      partnerId,
    });
    s.insurancePartnerHandoffs.push({
      id: handoffId,
      requestId,
      partnerId,
      status: 'sent_manual',
      sentAt: new Date().toISOString(),
      externalReference: result.externalReference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    req.partnerId = partnerId;
    req.partnerHandoffId = handoffId;
    req.status = 'partner_review';
    req.updatedAt = new Date().toISOString();
    void staffId;
    s.notifications.unshift(
      buildNotification({
        organizationId: req.organizationId,
        recipientType: 'customer',
        eventType: 'INSURANCE_REFERRED',
        category: 'insurance',
        title: 'Insurance request referred',
        body: 'Your information was prepared for a licensed insurance professional.',
        link: aioPaths.portalInsuranceRequest(req.id),
      }),
    );
    return s;
  });
}

export function recordInsuranceQuote(
  requestId: string,
  partial: Pick<InsuranceQuoteRecord, 'insuranceCarrierName' | 'premiumMinor' | 'coverageSummary' | 'quoteReference'>,
): void {
  updateDemoStore((s) => {
    const req = s.insuranceRequests.find((r) => r.id === requestId);
    if (!req) return s;
    const quote: InsuranceQuoteRecord = {
      id: uid(),
      requestId,
      partnerId: req.partnerId,
      insuranceCarrierName: partial.insuranceCarrierName,
      quoteReference: partial.quoteReference,
      premiumMinor: partial.premiumMinor,
      coverageSummary: partial.coverageSummary,
      status: 'available',
      source: 'partner_reported',
      documentIds: [],
      receivedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.insuranceQuoteRecords.push(quote);
    if (canTransitionRequestStatus(req.status, 'quote_options_reported')) {
      req.status = 'quote_options_reported';
      req.updatedAt = new Date().toISOString();
    }
    s.notifications.unshift(
      buildNotification({
        organizationId: req.organizationId,
        recipientType: 'customer',
        eventType: 'INSURANCE_QUOTE_REPORTED',
        category: 'insurance',
        title: 'Coverage option received',
        body: 'Review quote information from your insurance provider.',
        link: aioPaths.portalInsuranceRequest(req.id),
      }),
    );
    return s;
  });
}

export function selectQuoteExternal(requestId: string, quoteId: string, orgId: string): void {
  updateDemoStore((s) => {
    const req = s.insuranceRequests.find((r) => r.id === requestId && r.organizationId === orgId);
    const quote = s.insuranceQuoteRecords.find((q) => q.id === quoteId && q.requestId === requestId);
    if (!req || !quote) return s;
    quote.status = 'selected';
    req.status = 'policy_selected_external';
    req.updatedAt = new Date().toISOString();
    return s;
  });
}

export function activatePolicyFromEvidence(policyId: string, staffId: string): void {
  updateDemoStore((s) => {
    const policy = s.insurancePolicies.find((p) => p.id === policyId);
    if (!policy) return s;
    policy.status = derivePolicyStatusFromDates(policy.expirationDate, 'active');
    policy.verificationState = 'document_supported';
    policy.updatedAt = new Date().toISOString();
    syncInsuranceToRoadReady(policy.organizationId, s);
    void staffId;
    s.notifications.unshift(
      buildNotification({
        organizationId: policy.organizationId,
        recipientType: 'customer',
        eventType: 'INSURANCE_POLICY_RECORDED',
        category: 'insurance',
        title: 'Policy record updated',
        link: aioPaths.portalInsurancePolicy(policy.id),
      }),
    );
    return s;
  });
}

export function requestCertificate(
  orgId: string,
  holderId: string,
  instructions?: string,
): string {
  let id = '';
  updateDemoStore((s) => {
    s.insuranceCounters.certificate += 1;
    id = uid();
    const active = getActivePolicy(orgId, s);
    s.insuranceCertificates.push({
      id,
      organizationId: orgId,
      policyId: active?.id,
      certificateHolderId: holderId,
      status: 'requested',
      requestedAt: new Date().toISOString(),
      source: 'customer_request',
      instructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    s.notifications.unshift(
      buildNotification({
        organizationId: orgId,
        recipientType: 'staff',
        staffId: 'staff-5',
        eventType: 'INSURANCE_COI_REQUESTED',
        category: 'insurance',
        title: 'Certificate of Insurance requested',
        link: aioPaths.officeInsuranceCertificates,
      }),
    );
    return s;
  });
  return id;
}

export function getVehicleCoverageSummary(orgId: string, store: DemoStore = loadDemoStore()) {
  const units = store.powerUnits.filter((u) => u.organizationId === orgId && u.status === 'active');
  const linked = new Set(store.insurancePolicyVehicles.filter((v) => v.organizationId === orgId).map((v) => v.powerUnitId));
  return {
    activeUnits: units.length,
    linkedUnits: units.filter((u) => linked.has(u.id)).length,
    reviewNeeded: units.length > 0 && linked.size > 0 && units.length !== linked.size,
  };
}

export function getBrokerageCarrierInsurance(orgId: string, store: DemoStore = loadDemoStore()) {
  const policy = getActivePolicy(orgId, store);
  if (!policy) return { hasPolicy: false, reviewNeeded: true, verificationState: 'customer_reported' as const };
  return {
    hasPolicy: true,
    autoLiability: store.insurancePolicyCoverages.some((c) => c.policyId === policy.id && c.coverageType === 'auto_liability'),
    cargo: store.insurancePolicyCoverages.some((c) => c.policyId === policy.id && c.coverageType === 'cargo'),
    expirationDate: policy.expirationDate,
    verificationState: policy.verificationState,
    reviewNeeded: policy.status === 'expiring_soon' || policy.status === 'expired',
  };
}
