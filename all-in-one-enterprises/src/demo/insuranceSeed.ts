import { dollarsToMinor } from '../billing/money';
import {
  DEFAULT_INSURANCE_CAPABILITY,
  DEFAULT_INSURANCE_OPERATING_MODE,
  INSURANCE_READINESS_CHECKLIST,
} from '../insurance/insuranceConfig';
import type {
  CertificateHolder,
  InsuranceCapabilityState,
  InsuranceCertificate,
  InsuranceCounters,
  InsuranceIssue,
  InsurancePartner,
  InsurancePartnerHandoff,
  InsurancePolicy,
  InsurancePolicyCoverage,
  InsurancePolicyVehicle,
  InsuranceQuoteRecord,
  InsuranceRequest,
} from '../insurance/insuranceTypes';
import { daysAgo, daysAhead, isoNow } from './dateHelpers';

export function createInsuranceSeedData(): {
  capability: InsuranceCapabilityState;
  partners: InsurancePartner[];
  policies: InsurancePolicy[];
  coverages: InsurancePolicyCoverage[];
  policyVehicles: InsurancePolicyVehicle[];
  requests: InsuranceRequest[];
  handoffs: InsurancePartnerHandoff[];
  quoteRecords: InsuranceQuoteRecord[];
  certificateHolders: CertificateHolder[];
  certificates: InsuranceCertificate[];
  issues: InsuranceIssue[];
  counters: InsuranceCounters;
} {
  const capability: InsuranceCapabilityState = {
    capability: DEFAULT_INSURANCE_CAPABILITY,
    operatingMode: DEFAULT_INSURANCE_OPERATING_MODE,
    readinessItems: INSURANCE_READINESS_CHECKLIST.map((item) => ({
      ...item,
      status: item.key === 'direct_disabled' ? 'complete' : 'missing',
    })),
    updatedAt: isoNow(),
    updatedByStaffId: 'staff-1',
  };

  const partners: InsurancePartner[] = [
    {
      id: 'ins-partner-demo',
      agencyName: 'Demo Trucking Insurance Agency LLC',
      contactName: 'Jordan Wells',
      email: 'coordination.demo@dtia.example',
      phone: '(800) 555-0199',
      relationshipType: 'referral',
      status: 'approved_relationship',
      statesServed: ['OH', 'TX', 'GA', 'TN', 'FL'],
      commercialTrucking: true,
      notes: 'Fictional demo partner — manual referral workflow only.',
      createdAt: daysAgo(400),
      updatedAt: daysAgo(1),
    },
  ];

  const policies: InsurancePolicy[] = [
    {
      id: 'pol-b-active',
      organizationId: 'client-b',
      policyType: 'Commercial Auto Package',
      carrierName: 'Demo Mutual Insurance Co.',
      agencyName: 'Demo Trucking Insurance Agency LLC',
      policyNumber: 'DMI-8844821',
      effectiveDate: daysAhead(-335),
      expirationDate: daysAhead(21),
      status: 'expiring_soon',
      verificationState: 'document_supported',
      source: 'customer_intake',
      documentIds: ['vdoc-b1'],
      namedInsured: 'Heartland Freight Co.',
      createdAt: daysAgo(340),
      updatedAt: daysAgo(1),
      version: 1,
    },
    {
      id: 'pol-c-expiring',
      organizationId: 'client-c',
      policyType: 'Commercial Auto Package',
      carrierName: 'Pioneer Assurance Group',
      agencyName: 'Customer Existing Agent',
      policyNumber: 'PAG-2200199',
      effectiveDate: daysAhead(-300),
      expirationDate: daysAhead(30),
      status: 'expiring_soon',
      verificationState: 'staff_reviewed',
      source: 'customer_intake',
      documentIds: [],
      namedInsured: 'Pioneer Fleet Services',
      createdAt: daysAgo(300),
      updatedAt: daysAgo(2),
      version: 1,
    },
    {
      id: 'pol-c-active-new',
      organizationId: 'client-c',
      policyType: 'Commercial Auto Package',
      carrierName: 'Pioneer Assurance Group',
      agencyName: 'Demo Trucking Insurance Agency LLC',
      policyNumber: 'PAG-3300444',
      effectiveDate: daysAhead(-10),
      expirationDate: daysAhead(355),
      status: 'active',
      verificationState: 'document_supported',
      source: 'staff_entry',
      replacesPolicyId: 'pol-c-expiring',
      documentIds: ['vdoc-c-policy-new'],
      namedInsured: 'Pioneer Fleet Services',
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1),
      version: 1,
    },
    {
      id: 'pol-g-replaced',
      organizationId: 'client-c',
      policyType: 'Commercial Auto Package',
      carrierName: 'Pioneer Assurance Group',
      policyNumber: 'PAG-2200199',
      effectiveDate: daysAhead(-665),
      expirationDate: daysAhead(-35),
      status: 'replaced',
      verificationState: 'document_supported',
      source: 'customer_intake',
      replacedByPolicyId: 'pol-c-active-new',
      documentIds: [],
      createdAt: daysAgo(700),
      updatedAt: daysAgo(12),
      version: 2,
    },
  ];

  const coverages: InsurancePolicyCoverage[] = [
    { id: 'cov-b-al', policyId: 'pol-b-active', coverageType: 'auto_liability', limitMinor: dollarsToMinor(1_000_000), status: 'active', verificationState: 'document_supported' },
    { id: 'cov-b-cargo', policyId: 'pol-b-active', coverageType: 'cargo', limitMinor: dollarsToMinor(100_000), status: 'active', verificationState: 'document_supported' },
    { id: 'cov-c-al', policyId: 'pol-c-active-new', coverageType: 'auto_liability', limitMinor: dollarsToMinor(1_000_000), status: 'active', verificationState: 'document_supported' },
    { id: 'cov-c-pd', policyId: 'pol-c-active-new', coverageType: 'physical_damage', deductibleMinor: dollarsToMinor(2_500), status: 'active', verificationState: 'document_supported' },
  ];

  const policyVehicles: InsurancePolicyVehicle[] = [
    { id: 'pv-b-1', policyId: 'pol-b-active', powerUnitId: 'unit-b1', organizationId: 'client-b' },
    { id: 'pv-c-1', policyId: 'pol-c-active-new', powerUnitId: 'unit-c1', organizationId: 'client-c' },
    { id: 'pv-c-2', policyId: 'pol-c-active-new', powerUnitId: 'unit-c2', organizationId: 'client-c' },
    { id: 'pv-c-3', policyId: 'pol-c-active-new', powerUnitId: 'unit-c3', organizationId: 'client-c' },
    // 3 of 3 fleet units on active policy — client-c has exactly 3 units
  ];

  const requests: InsuranceRequest[] = [
    {
      id: 'ir-a-draft',
      requestNumber: 'IR-2026-0001',
      organizationId: 'client-a',
      requestType: 'new_coverage',
      status: 'submitted',
      coverageNeeds: ['auto_liability', 'cargo'],
      selectedPowerUnitIds: ['unit-a1'],
      assignedCoordinatorStaffId: 'staff-5',
      documentIds: [],
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      version: 1,
    },
    {
      id: 'ir-d-incomplete',
      requestNumber: 'IR-2026-0002',
      organizationId: 'client-d',
      requestType: 'new_coverage',
      status: 'information_needed',
      coverageNeeds: ['auto_liability'],
      selectedPowerUnitIds: ['unit-d1'],
      assignedCoordinatorStaffId: 'staff-5',
      documentIds: [],
      internalNotes: 'Missing second power unit VIN for full fleet schedule.',
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
      version: 1,
    },
    {
      id: 'ir-f-partner',
      requestNumber: 'IR-2026-0003',
      organizationId: 'client-f',
      requestType: 'new_coverage',
      status: 'partner_review',
      coverageNeeds: ['auto_liability', 'cargo', 'physical_damage'],
      selectedPowerUnitIds: [],
      partnerId: 'ins-partner-demo',
      partnerHandoffId: 'ih-f-1',
      assignedCoordinatorStaffId: 'staff-5',
      documentIds: [],
      createdAt: daysAgo(8),
      updatedAt: daysAgo(2),
      version: 2,
    },
    {
      id: 'ir-g-quotes',
      requestNumber: 'IR-2026-0004',
      organizationId: 'client-g',
      requestType: 'renewal_help',
      status: 'customer_review',
      coverageNeeds: ['auto_liability'],
      selectedPowerUnitIds: [],
      partnerId: 'ins-partner-demo',
      assignedCoordinatorStaffId: 'staff-5',
      documentIds: [],
      createdAt: daysAgo(14),
      updatedAt: daysAgo(1),
      version: 2,
    },
  ];

  const handoffs: InsurancePartnerHandoff[] = [
    {
      id: 'ih-f-1',
      requestId: 'ir-f-partner',
      partnerId: 'ins-partner-demo',
      status: 'sent_manual',
      sentAt: daysAgo(5),
      externalReference: 'MANUAL-REF-IR-F-PART',
      notes: 'Referral recorded — external agency coordination.',
      createdAt: daysAgo(6),
      updatedAt: daysAgo(5),
    },
  ];

  const quoteRecords: InsuranceQuoteRecord[] = [
    {
      id: 'iqr-g-1',
      requestId: 'ir-g-quotes',
      partnerId: 'ins-partner-demo',
      insuranceCarrierName: 'Demo National Truck Insurers',
      quoteReference: 'DNQ-2026-881',
      premiumMinor: dollarsToMinor(14_000),
      billingFrequency: 'annual',
      downPaymentMinor: dollarsToMinor(2_800),
      coverageSummary: 'Auto Liability $1M CSL · Cargo $100K',
      effectiveDate: daysAhead(14),
      status: 'available',
      source: 'partner_reported',
      documentIds: [],
      receivedAt: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: 'iqr-g-2',
      requestId: 'ir-g-quotes',
      partnerId: 'ins-partner-demo',
      insuranceCarrierName: 'Fictional Haulers Mutual',
      quoteReference: 'FHM-2026-442',
      premiumMinor: dollarsToMinor(12_600),
      billingFrequency: 'annual',
      downPaymentMinor: dollarsToMinor(2_100),
      coverageSummary: 'Auto Liability $1M · Physical Damage $2.5K ded.',
      effectiveDate: daysAhead(14),
      status: 'available',
      source: 'partner_reported',
      documentIds: [],
      receivedAt: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  ];

  const certificateHolders: CertificateHolder[] = [
    {
      id: 'ch-broker-demo',
      organizationId: 'client-e',
      name: 'All In One Brokerage (Demo Shipper Request)',
      address: '100 Demo Plaza, Chicago IL',
      email: 'certificates.demo@aio.example',
      holderType: 'shipper',
      createdAt: daysAgo(30),
    },
  ];

  const certificates: InsuranceCertificate[] = [
    {
      id: 'cert-b-coi',
      organizationId: 'client-b',
      policyId: 'pol-b-active',
      certificateHolderId: 'ch-broker-demo',
      status: 'issued',
      requestedAt: daysAgo(20),
      issuedAt: daysAgo(18),
      documentId: 'vdoc-b-coi',
      source: 'partner_reported',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(18),
    },
    {
      id: 'cert-i-processing',
      organizationId: 'client-e',
      policyId: undefined,
      certificateHolderId: 'ch-broker-demo',
      status: 'processing',
      requestedAt: daysAgo(3),
      source: 'customer_request',
      instructions: 'Certificate for fictional shipper load coordination.',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    },
  ];

  const issues: InsuranceIssue[] = [
    {
      id: 'ii-d-vehicles',
      organizationId: 'client-d',
      requestId: 'ir-d-incomplete',
      type: 'vehicle_coverage_review',
      status: 'waiting_on_customer',
      summary: 'Fleet schedule incomplete — review needed for unit count',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    },
    {
      id: 'ii-b-expiring',
      organizationId: 'client-b',
      policyId: 'pol-b-active',
      type: 'policy_expiring',
      status: 'open',
      summary: 'Auto liability policy expiring within 21 days',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];

  return {
    capability,
    partners,
    policies,
    coverages,
    policyVehicles,
    requests,
    handoffs,
    quoteRecords,
    certificateHolders,
    certificates,
    issues,
    counters: { request: 4, policy: 4, certificate: 2 },
  };
}
