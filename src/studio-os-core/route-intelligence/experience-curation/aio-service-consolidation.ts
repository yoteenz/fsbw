import type {
  AioServiceConsolidationCandidate,
  DesignFamilyRecord,
  ExperiencePageInstanceRecord,
  ExperiencePageRecord,
} from '../types';
import { AIO_PORTAL_ROUTE_PATTERNS, AIO_SERVICE_MARKETING_ROUTE_PATTERNS } from './constants';

export function isAioPortalOrDistinctExperience(route: string, displayName: string): boolean {
  if (AIO_PORTAL_ROUTE_PATTERNS.some((re) => re.test(route))) return true;
  if (/load board|my loads|fleet|office/i.test(displayName)) return true;
  return false;
}

export function isAioServiceMarketingPage(
  page: ExperiencePageRecord,
  family?: DesignFamilyRecord,
): boolean {
  if (isAioPortalOrDistinctExperience(page.representativeRoute, page.displayName)) return false;
  if (family?.displayName === 'Public Service Page') return true;
  if (family?.shellAuthority === 'AioPublicShell') return true;
  if (AIO_SERVICE_MARKETING_ROUTE_PATTERNS.some((re) => re.test(page.representativeRoute))) return true;
  const name = page.displayName.toLowerCase();
  if (/bookkeeping|brokerage|dispatch|factoring|insurance|permitting|compliance|road ready|fleetcare|driverlink|business formation|services overview|public services/i.test(name)) {
    return true;
  }
  return false;
}

export function auditAioServiceConsolidation(
  pages: ExperiencePageRecord[],
  families: DesignFamilyRecord[],
): AioServiceConsolidationCandidate[] {
  const familyById = new Map(families.map((f) => [f.designFamilyId, f]));
  const servicePages = pages.filter((p) => {
    const family = p.designFamilyIds[0] ? familyById.get(p.designFamilyIds[0]) : undefined;
    return p.founderPrimary && isAioServiceMarketingPage(p, family);
  });

  if (servicePages.length < 2) return [];

  return [
    {
      projectId: 'all-in-one-enterprise',
      servicePageIds: servicePages.map((p) => p.experiencePageId),
      displayNames: servicePages.map((p) => p.displayName),
      sharedShell: true,
      confidence: 'HIGH',
    },
  ];
}

export function consolidateAioServicePages(
  pages: ExperiencePageRecord[],
  instances: ExperiencePageInstanceRecord[],
  families: DesignFamilyRecord[],
): {
  pages: ExperiencePageRecord[];
  instances: ExperiencePageInstanceRecord[];
  mergedPageIds: string[];
} {
  const familyById = new Map(families.map((f) => [f.designFamilyId, f]));
  const servicePages = pages.filter((p) => {
    const family = p.designFamilyIds[0] ? familyById.get(p.designFamilyIds[0]) : undefined;
    return p.founderPrimary && isAioServiceMarketingPage(p, family);
  });

  if (servicePages.length < 2) return { pages, instances, mergedPageIds: [] };

  const rep = servicePages.find((p) => p.displayName === 'Public Services' || p.representativeRoute === '/services') ?? servicePages[0]!;
  const experiencePageId = `${rep.projectId}:xp:service-detail`;

  const mergedInstances: ExperiencePageInstanceRecord[] = [...instances];
  for (const sp of servicePages) {
    if (sp.experiencePageId === experiencePageId) continue;
    mergedInstances.push({
      instanceId: `${experiencePageId}:inst:service:${sp.displayName.toLowerCase().replace(/\s+/g, '-')}`,
      projectId: rep.projectId,
      experiencePageId,
      displayName: sp.displayName,
      slugOrId: sp.representativeRoute.split('/').filter(Boolean).pop() ?? sp.displayName,
      memberDesignScreenIds: sp.memberDesignScreenIds,
      memberRouteIds: sp.memberRouteIds,
      representativeRoute: sp.representativeRoute,
      instanceKind: 'SERVICE',
      captureEligible: false,
    });
  }

  const mergedPage: ExperiencePageRecord = {
    ...rep,
    experiencePageId,
    displayName: 'Service Detail',
    memberDesignScreenIds: [...new Set(servicePages.flatMap((p) => p.memberDesignScreenIds))],
    memberRouteIds: [...new Set(servicePages.flatMap((p) => p.memberRouteIds))],
    instanceIds: mergedInstances.filter((i) => i.experiencePageId === experiencePageId).map((i) => i.instanceId),
    designFamilyIds: ['all-in-one-enterprise:dfamily:aio-public-service'],
    abstractionConfidence: 'HIGH',
    routeNodeCount: servicePages.reduce((n, p) => n + p.routeNodeCount, 0),
  };

  const mergedIds = new Set(servicePages.map((p) => p.experiencePageId));
  mergedIds.delete(experiencePageId);

  const remaining = pages.filter((p) => !mergedIds.has(p.experiencePageId));
  const hasMerged = remaining.some((p) => p.experiencePageId === experiencePageId);
  const nextPages = hasMerged
    ? remaining.map((p) => (p.experiencePageId === experiencePageId ? mergedPage : p))
    : [...remaining.filter((p) => p.experiencePageId !== experiencePageId), mergedPage];

  return {
    pages: nextPages,
    instances: mergedInstances,
    mergedPageIds: [...mergedIds],
  };
}

export function demoteAioOfficePages(pages: ExperiencePageRecord[]): ExperiencePageRecord[] {
  return pages.map((p) => {
    if (/^\/office|Office/i.test(p.representativeRoute + p.displayName)) {
      return {
        ...p,
        founderPrimary: false,
        sectionId: 'all-in-one-enterprise:section:workspace',
        experienceType: 'WORKSPACE_PAGE',
        captureEligible: false,
        priority: 'INTERNAL',
      };
    }
    return p;
  });
}
