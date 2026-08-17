/**
 * DriverLink demo actions — applications, matching, hiring transition hooks.
 */

import type { DemoStore } from './demoTypes';
import { loadDemoStore, saveDemoStore } from './demoStore';
import { matchOpportunitiesToDriver, toDriverJobMatch } from '../driverlink/matchingService';
import type { DriverApplication, DriverApplicationStatus, JobOpportunity } from '../driverlink/driverlinkTypes';

function nowIso() {
  return new Date().toISOString();
}

export function getDriverProfileById(id: string, store: DemoStore) {
  return store.driverlinkProfiles?.find((p) => p.id === id);
}

export function getOpportunityById(id: string, store: DemoStore) {
  return store.driverlinkOpportunities?.find((o) => o.id === id);
}

export function getApplicationsForDriver(driverId: string, store: DemoStore): DriverApplication[] {
  return (store.driverlinkApplications ?? []).filter((a) => a.driverProfileId === driverId);
}

export function getApplicationsForOrg(orgId: string, store: DemoStore): DriverApplication[] {
  return (store.driverlinkApplications ?? []).filter((a) => a.organizationId === orgId);
}

export function getMatchesForDriver(driverId: string, store: DemoStore) {
  return (store.driverlinkMatches ?? []).filter((m) => m.driverProfileId === driverId && m.eligible);
}

export function getOpportunitiesForOrg(orgId: string, store: DemoStore): JobOpportunity[] {
  return (store.driverlinkOpportunities ?? []).filter((o) => o.organizationId === orgId);
}

export function refreshMatchesForDriver(driverId: string): void {
  const store = loadDemoStore();
  const driver = getDriverProfileById(driverId, store);
  if (!driver) return;
  const jobs = store.driverlinkOpportunities ?? [];
  const results = matchOpportunitiesToDriver(driver, jobs);
  const newMatches = results.map(toDriverJobMatch);
  const others = (store.driverlinkMatches ?? []).filter((m) => m.driverProfileId !== driverId);
  saveDemoStore({ ...store, driverlinkMatches: [...others, ...newMatches] });
}

export interface ApplyToOpportunityInput {
  driverProfileId: string;
  opportunityId: string;
  consentScope: string[];
}

export function applyToOpportunity(input: ApplyToOpportunityInput): DriverApplication {
  let store = loadDemoStore();
  const opp = getOpportunityById(input.opportunityId, store);
  const driver = getDriverProfileById(input.driverProfileId, store);
  if (!opp || !driver) throw new Error('Invalid application');

  const existing = store.driverlinkApplications?.find(
    (a) => a.driverProfileId === input.driverProfileId && a.opportunityId === input.opportunityId,
  );
  if (existing) return existing;

  const app: DriverApplication = {
    id: `dl-app-${Date.now()}`,
    driverProfileId: input.driverProfileId,
    opportunityId: input.opportunityId,
    organizationId: opp.organizationId,
    status: 'application_submitted',
    consentGrantedAt: nowIso(),
    consentScope: input.consentScope,
    employerAccessLevel: 'application_data',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store = {
    ...store,
    driverlinkApplications: [...(store.driverlinkApplications ?? []), app],
    driverlinkCounters: {
      applicationSeq: (store.driverlinkCounters?.applicationSeq ?? 100) + 1,
      opportunitySeq: store.driverlinkCounters?.opportunitySeq ?? 100,
    },
  };
  saveDemoStore(store);
  return app;
}

export function updateApplicationStatus(applicationId: string, status: DriverApplicationStatus): void {
  const store = loadDemoStore();
  saveDemoStore({
    ...store,
    driverlinkApplications: (store.driverlinkApplications ?? []).map((a) =>
      a.id === applicationId ? { ...a, status, updatedAt: nowIso() } : a,
    ),
  });
}

export function publishOpportunity(opportunity: Omit<JobOpportunity, 'id' | 'createdAt' | 'updatedAt' | 'status'>): JobOpportunity {
  let store = loadDemoStore();
  const id = `dl-job-${Date.now()}`;
  const job: JobOpportunity = {
    ...opportunity,
    id,
    status: 'published',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store = {
    ...store,
    driverlinkOpportunities: [...(store.driverlinkOpportunities ?? []), job],
    driverlinkCounters: {
      applicationSeq: store.driverlinkCounters?.applicationSeq ?? 100,
      opportunitySeq: (store.driverlinkCounters?.opportunitySeq ?? 100) + 1,
    },
  };
  saveDemoStore(store);
  return job;
}

export function markDriverHired(applicationId: string): void {
  const store = loadDemoStore();
  const app = store.driverlinkApplications?.find((a) => a.id === applicationId);
  if (!app) return;

  const updatedApps = (store.driverlinkApplications ?? []).map((a) =>
    a.id === applicationId
      ? { ...a, status: 'hired' as const, employerAccessLevel: 'active_driver_access' as const, updatedAt: nowIso() }
      : a,
  );

  const updatedProfiles = (store.driverlinkProfiles ?? []).map((p) =>
    p.id === app.driverProfileId ? { ...p, marketplaceStatus: 'hired' as const, updatedAt: nowIso() } : p,
  );

  saveDemoStore({
    ...store,
    driverlinkApplications: updatedApps,
    driverlinkProfiles: updatedProfiles,
  });
}
