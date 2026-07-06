import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildGuardianCoordinations, buildGuardianDashboardMetrics, buildDockGuardianLine } from './dashboard-engine';
import {
  buildGuardianAlerts,
  buildGuardianDomainStatuses,
  computeGuardianScore,
  countActiveAlerts,
  countUrgentAlerts,
} from './guardian-engine';
import { GUARDIAN_MONITOR_DOMAINS } from './constants';
import type { OrganizationGuardianProfile } from './types';

export function buildOrganizationGuardianProfile(organizationId: string): OrganizationGuardianProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const domainStatuses = buildGuardianDomainStatuses(organizationId);
  const alerts = buildGuardianAlerts(organizationId, now);
  const guardianScore = computeGuardianScore(domainStatuses, alerts);
  const dashboardMetrics = buildGuardianDashboardMetrics(domainStatuses, guardianScore);
  const coordinations = buildGuardianCoordinations(now);

  const profile: OrganizationGuardianProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    guardianScore,
    domainsMonitored: GUARDIAN_MONITOR_DOMAINS.length,
    activeAlerts: countActiveAlerts(alerts),
    urgentAlerts: countUrgentAlerts(alerts),
    systemsCoordinated: coordinations.length,
    domainStatuses,
    alerts,
    dashboardMetrics,
    coordinations,
    selectedAlertId: alerts[0]?.id ?? null,
    dockGuardianLine: '',
    silentProtectorNotMonitor: true,
    lastSyncedAt: now,
  };

  profile.dockGuardianLine = buildDockGuardianLine(profile);
  return profile;
}
