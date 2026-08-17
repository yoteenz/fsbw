/**
 * DriverLink demo seed — Spanish-speaking driver + English carrier scenario.
 */

import type { DemoStore } from './demoTypes';
import type {
  DriverApplication,
  DriverCredential,
  DriverJobMatch,
  DriverProfile,
  JobOpportunity,
} from '../driverlink/driverlinkTypes';
import { matchDriversToOpportunity, matchOpportunitiesToDriver, toDriverJobMatch } from '../driverlink/matchingService';

export const DEMO_DRIVER_PROFILE_ID = 'dl-driver-maria-g';
export const DEMO_DRIVERLINK_CONTEXT = {
  activeDriverProfileId: DEMO_DRIVER_PROFILE_ID,
  activeCompanyOrgId: 'client-a',
};

export function createDriverLinkSeedData(): Pick<
  DemoStore,
  | 'driverlinkProfiles'
  | 'driverlinkCredentials'
  | 'driverlinkOpportunities'
  | 'driverlinkMatches'
  | 'driverlinkApplications'
  | 'driverlinkCounters'
  | 'driverlinkDemoContext'
> {
  const driver: DriverProfile = {
    id: DEMO_DRIVER_PROFILE_ID,
    userId: 'demo-driver-user',
    firstName: 'María',
    lastName: 'González',
    phone: '(555) 220-4410',
    email: 'maria.gonzalez.demo@aio.local',
    homeCity: 'Columbus',
    homeState: 'OH',
    preferredRegions: ['OH', 'IN', 'KY'],
    preferredLanes: ['OH-IN regional', 'Midwest regional'],
    routePreference: 'regional',
    soloTeamPreference: 'solo',
    employmentPreference: 'company_driver',
    cdlClass: 'A',
    endorsements: ['Tanker'],
    yearsExperience: 8,
    equipmentExperience: ['Dry Van', 'Reefer'],
    availabilityDate: '2026-09-01',
    homeTimePreference: 'Weekly',
    workHistorySummary: '8 years regional reefer and dry van — safe, on-time performance.',
    profileVisibility: 'public_match',
    marketplaceStatus: 'active',
    preferredLanguage: 'es-US',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-08-15T12:00:00.000Z',
  };

  const credentials: DriverCredential[] = [
    {
      id: 'dl-cred-cdl',
      driverProfileId: DEMO_DRIVER_PROFILE_ID,
      credentialType: 'cdl',
      credentialNumberMasked: '****4521',
      jurisdiction: 'OH',
      expirationDate: '2028-04-15',
      verificationStatus: 'verified',
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-10T10:00:00.000Z',
    },
    {
      id: 'dl-cred-med',
      driverProfileId: DEMO_DRIVER_PROFILE_ID,
      credentialType: 'medical_certificate',
      expirationDate: '2026-11-01',
      verificationStatus: 'verified',
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-10T10:00:00.000Z',
    },
    {
      id: 'dl-cred-clearinghouse',
      driverProfileId: DEMO_DRIVER_PROFILE_ID,
      credentialType: 'clearinghouse',
      verificationStatus: 'employer_action_required',
      clearinghouseStatus: 'employer_action_required',
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-01T10:00:00.000Z',
    },
    {
      id: 'dl-cred-dq',
      driverProfileId: DEMO_DRIVER_PROFILE_ID,
      credentialType: 'dq_documents',
      verificationStatus: 'uploaded',
      notes: '7 of 9 DQ items on file — employer review pending',
      createdAt: '2026-07-15T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    },
  ];

  const opportunities: JobOpportunity[] = [
    {
      id: 'dl-job-regional-reefer',
      organizationId: 'client-a',
      jobTitle: 'Regional Reefer Driver — Midwest',
      status: 'published',
      driverType: 'company_driver',
      cdlClassRequired: 'A',
      endorsementsRequired: [],
      equipmentType: ['Reefer', 'Dry Van'],
      routeType: 'regional',
      baseLocation: { city: 'Columbus', stateCode: 'OH' },
      serviceRegions: ['OH', 'IN', 'KY', 'MI'],
      lanes: ['Columbus hub — Midwest regional'],
      homeTime: 'Weekly',
      experienceRequiredYears: 2,
      compensationType: 'per_mile',
      compensationRange: 'Competitive CPM — discuss at interview',
      startDate: '2026-09-15',
      numberOfPositions: 2,
      description: 'Stable regional reefer lanes out of Columbus. No touch freight.',
      requirements: 'Valid CDL-A, 2+ years experience, clean MVR.',
      createdAt: '2026-08-01T09:00:00.000Z',
      updatedAt: '2026-08-10T09:00:00.000Z',
    },
    {
      id: 'dl-job-otr-flatbed',
      organizationId: 'client-b',
      jobTitle: 'OTR Flatbed Driver',
      status: 'published',
      driverType: 'company_driver',
      cdlClassRequired: 'A',
      endorsementsRequired: [],
      equipmentType: ['Flatbed'],
      routeType: 'otr',
      baseLocation: { city: 'Indianapolis', stateCode: 'IN' },
      serviceRegions: ['IN', 'OH', 'IL'],
      lanes: ['48-state OTR'],
      homeTime: 'Every 2-3 weeks',
      experienceRequiredYears: 3,
      compensationType: 'per_mile',
      numberOfPositions: 1,
      description: 'OTR flatbed — tarping experience preferred.',
      createdAt: '2026-07-20T09:00:00.000Z',
      updatedAt: '2026-07-20T09:00:00.000Z',
    },
  ];

  const driverMatches = matchOpportunitiesToDriver(driver, opportunities);
  const companyMatches = matchDriversToOpportunity([driver], opportunities[0]!);

  const matches: DriverJobMatch[] = [
    ...driverMatches.map(toDriverJobMatch),
    ...companyMatches.map(toDriverJobMatch),
  ].filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);

  const applications: DriverApplication[] = [
    {
      id: 'dl-app-maria-regional',
      driverProfileId: DEMO_DRIVER_PROFILE_ID,
      opportunityId: 'dl-job-regional-reefer',
      organizationId: 'client-a',
      status: 'application_submitted',
      matchId: matches.find((m) => m.opportunityId === 'dl-job-regional-reefer')?.id,
      consentGrantedAt: '2026-08-16T14:00:00.000Z',
      consentScope: ['professional_profile', 'contact_information', 'selected_credentials'],
      employerAccessLevel: 'application_data',
      createdAt: '2026-08-16T13:30:00.000Z',
      updatedAt: '2026-08-16T14:00:00.000Z',
    },
  ];

  return {
    driverlinkProfiles: [driver],
    driverlinkCredentials: credentials,
    driverlinkOpportunities: opportunities,
    driverlinkMatches: matches,
    driverlinkApplications: applications,
    driverlinkCounters: { applicationSeq: 100, opportunitySeq: 100 },
    driverlinkDemoContext: DEMO_DRIVERLINK_CONTEXT,
  };
}
