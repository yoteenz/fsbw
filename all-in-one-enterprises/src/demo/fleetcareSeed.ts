/**
 * FleetCare demo seed — synthetic provider, tickets, jobs (never real PII).
 */

import type { DemoStore } from '../demo/demoTypes';
import type {
  MaintenanceTicket,
  ReferralTransaction,
  RepairEstimate,
  RepairRecord,
  ServiceJob,
  ServiceProvider,
} from '../fleetcare/fleetcareTypes';

export const DEMO_FLEETCARE_PROVIDER_ID = 'fc-provider-smith-diesel';
export const DEMO_FLEETCARE_CONTEXT = { activeProviderId: DEMO_FLEETCARE_PROVIDER_ID };

export function createFleetCareSeedData(): Pick<
  DemoStore,
  | 'fleetcareProviders'
  | 'fleetcareProviderUsers'
  | 'fleetcareProviderInsurance'
  | 'fleetcareProviderCredentials'
  | 'fleetcarePreexistingRelationships'
  | 'fleetcareTickets'
  | 'fleetcareTicketEvents'
  | 'fleetcareTicketMatches'
  | 'fleetcareEstimates'
  | 'fleetcareAuthorizations'
  | 'fleetcareJobs'
  | 'fleetcareRepairRecords'
  | 'fleetcareReferrals'
  | 'fleetcareCounters'
  | 'fleetcareDemoContext'
> {
  const provider: ServiceProvider = {
    id: DEMO_FLEETCARE_PROVIDER_ID,
    businessName: 'Smith Mobile Diesel LLC',
    providerType: 'mobile_diesel_repair',
    verificationStatus: 'aio_verified',
    providerTier: 'founding',
    phone: '(555) 410-7820',
    email: 'dispatch@smithmobilediesel.demo',
    mobileServiceAvailable: true,
    shopServiceAvailable: true,
    emergencyAvailable: true,
    applicationStatus: 'approved',
    active: true,
    agreementVersion: 'fleetcare-provider-v0.1-draft',
    agreementAcceptedAt: '2026-01-15T12:00:00.000Z',
    serviceCategoryCodes: [
      'preventive_maintenance',
      'diagnostics',
      'engine_repair',
      'brakes',
      'mobile_diesel_repair',
      'truck_repair',
    ],
    primaryLocation: {
      id: 'fc-loc-smith-primary',
      providerId: DEMO_FLEETCARE_PROVIDER_ID,
      label: 'Primary Shop',
      city: 'Columbus',
      stateCode: 'OH',
      postalCode: '43215',
      latitude: 39.9612,
      longitude: -82.9988,
      isPrimary: true,
    },
    serviceAreas: [
      {
        id: 'fc-area-smith-oh',
        providerId: DEMO_FLEETCARE_PROVIDER_ID,
        areaType: 'state',
        stateCode: 'OH',
      },
      {
        id: 'fc-area-smith-radius',
        providerId: DEMO_FLEETCARE_PROVIDER_ID,
        areaType: 'radius',
        radiusMiles: 75,
        centerLatitude: 39.9612,
        centerLongitude: -82.9988,
      },
    ],
  };

  const tickets: MaintenanceTicket[] = [
    {
      id: 'fc-ticket-brakes',
      ticketNumber: 'FC-000101',
      clientOrganizationId: 'client-a',
      vehicleId: 'unit-a1',
      serviceCategoryCode: 'brakes',
      issueDescription: 'Air brake lag on tractor — needs inspection before next load.',
      drivableStatus: 'yes',
      location: { city: 'Columbus', stateCode: 'OH', label: 'Terminal yard' },
      urgency: 'soon',
      status: 'estimate_sent',
      providerId: DEMO_FLEETCARE_PROVIDER_ID,
      assignedAt: '2026-08-10T14:00:00.000Z',
      leadSource: 'aio_marketplace',
      aioOriginated: true,
      customerContactReleased: true,
      createdAt: '2026-08-10T13:30:00.000Z',
      updatedAt: '2026-08-11T09:00:00.000Z',
    },
    {
      id: 'fc-ticket-pm',
      ticketNumber: 'FC-000102',
      clientOrganizationId: 'client-a',
      vehicleId: 'unit-a1',
      serviceCategoryCode: 'preventive_maintenance',
      issueDescription: 'Scheduled PM — oil, filters, general inspection.',
      drivableStatus: 'yes',
      location: { city: 'Columbus', stateCode: 'OH' },
      urgency: 'routine',
      status: 'completed',
      providerId: DEMO_FLEETCARE_PROVIDER_ID,
      assignedAt: '2026-07-01T10:00:00.000Z',
      leadSource: 'aio_marketplace',
      aioOriginated: true,
      customerContactReleased: true,
      createdAt: '2026-06-28T08:00:00.000Z',
      updatedAt: '2026-07-05T16:00:00.000Z',
    },
    {
      id: 'fc-ticket-searching',
      ticketNumber: 'FC-000103',
      clientOrganizationId: 'client-b',
      vehicleId: 'unit-b1',
      serviceCategoryCode: 'mobile_diesel_repair',
      issueDescription: 'Check engine light — reduced power on I-70 eastbound.',
      drivableStatus: 'no',
      location: { city: 'Springfield', stateCode: 'OH', label: 'I-70 mm 54' },
      urgency: 'roadside_urgent',
      status: 'searching',
      leadSource: 'aio_marketplace',
      aioOriginated: true,
      customerContactReleased: false,
      createdAt: '2026-08-17T16:00:00.000Z',
      updatedAt: '2026-08-17T16:00:00.000Z',
    },
  ];

  const estimates: RepairEstimate[] = [
    {
      id: 'fc-est-brakes-1',
      ticketId: 'fc-ticket-brakes',
      providerId: DEMO_FLEETCARE_PROVIDER_ID,
      version: 1,
      status: 'sent',
      lineItems: [
        {
          id: 'li-1',
          lineType: 'labor',
          description: 'Brake system diagnosis & repair',
          quantity: 3,
          unitAmountMinor: 12500,
          totalMinor: 37500,
        },
        {
          id: 'li-2',
          lineType: 'parts',
          description: 'Air brake chamber & fittings',
          quantity: 1,
          unitAmountMinor: 28500,
          totalMinor: 28500,
        },
      ],
      subtotalMinor: 66000,
      taxMinor: 5280,
      totalMinor: 71280,
      notes: 'Estimate valid 7 days. Parts subject to availability.',
      expiresAt: '2026-08-18T23:59:59.000Z',
      isChangeOrder: false,
      createdAt: '2026-08-11T09:00:00.000Z',
    },
  ];

  const jobs: ServiceJob[] = [
    {
      id: 'fc-job-pm',
      ticketId: 'fc-ticket-pm',
      providerId: DEMO_FLEETCARE_PROVIDER_ID,
      status: 'completed',
      scheduledAt: '2026-07-03T08:00:00.000Z',
      completedAt: '2026-07-05T16:00:00.000Z',
      finalAmountMinor: 48500,
      mileageAtService: 142800,
      workSummary: 'PM service — oil, filters, grease, DOT-level inspection checklist.',
    },
  ];

  const repairRecords: RepairRecord[] = [
    {
      id: 'fc-record-pm',
      jobId: 'fc-job-pm',
      vehicleId: 'unit-a1',
      organizationId: 'client-a',
      providerId: DEMO_FLEETCARE_PROVIDER_ID,
      serviceCategoryCode: 'preventive_maintenance',
      summary: 'Preventive maintenance completed',
      mileageAtService: 142800,
      completedAt: '2026-07-05T16:00:00.000Z',
      documentIds: [],
    },
  ];

  const referrals: ReferralTransaction[] = [
    {
      id: 'fc-ref-pm',
      ticketId: 'fc-ticket-pm',
      jobId: 'fc-job-pm',
      providerId: DEMO_FLEETCARE_PROVIDER_ID,
      clientOrganizationId: 'client-a',
      leadSource: 'aio_marketplace',
      aioOriginated: true,
      preexistingRelationship: false,
      grossServiceValueMinor: 48500,
      feeRate: 0.1,
      feeAmountMinor: 4850,
      feeStatus: 'calculated',
      earnedAt: '2026-07-05T16:00:00.000Z',
    },
  ];

  return {
    fleetcareProviders: [provider],
    fleetcareProviderUsers: [
      {
        id: 'fc-user-smith-owner',
        providerId: DEMO_FLEETCARE_PROVIDER_ID,
        userId: 'demo-provider-user',
        role: 'owner',
        status: 'active',
      },
    ],
    fleetcareProviderInsurance: [
      {
        id: 'fc-ins-gl',
        providerId: DEMO_FLEETCARE_PROVIDER_ID,
        coverageType: 'commercial_general_liability',
        insurer: 'Demo Mutual',
        expirationDate: '2027-03-01',
        verificationStatus: 'verified',
      },
    ],
    fleetcareProviderCredentials: [],
    fleetcarePreexistingRelationships: [],
    fleetcareTickets: tickets,
    fleetcareTicketEvents: [],
    fleetcareTicketMatches: [],
    fleetcareEstimates: estimates,
    fleetcareAuthorizations: [],
    fleetcareJobs: jobs,
    fleetcareRepairRecords: repairRecords,
    fleetcareReferrals: referrals,
    fleetcareCounters: { ticketSeq: 103 },
    fleetcareDemoContext: DEMO_FLEETCARE_CONTEXT,
  };
}
