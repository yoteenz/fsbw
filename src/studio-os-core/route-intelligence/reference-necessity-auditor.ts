import type {
  DesignFamilyConfidence,
  DesignFamilyRecord,
  DesignScreenRecord,
  DesignScreenReferenceInheritance,
  DesignFamilyReferenceAuthority,
  PageVisualCoverageRecord,
  ProjectPageRouteRecord,
  ProjectVisualStateRecord,
  ReferenceGenerationSavings,
  ReferenceNecessityAuditRecord,
  ReferenceNecessityClassification,
  ViewportClass,
} from './types';
import { VIEWPORT_CLASSES } from './constants';

function classifyForViewport(
  screen: DesignScreenRecord,
  family: DesignFamilyRecord | undefined,
  vp: ViewportClass,
  isVisualState: boolean,
  route: ProjectPageRouteRecord | undefined,
): { classification: ReferenceNecessityClassification; reason: string; confidence: DesignFamilyConfidence } {
  if (isVisualState) {
    return {
      classification: 'STATE_DERIVED',
      reason: 'Visual state derives from parent screen reference',
      confidence: 'HIGH',
    };
  }

  if (route?.status === 'REQUIRED_MISSING_ROUTE') {
    return {
      classification: 'UNKNOWN_REVIEW_REQUIRED',
      reason: 'Implementation missing — reference policy pending shell confirmation',
      confidence: 'LOW',
    };
  }

  if (family?.designFamilyId.includes('build-a-wig') && family.memberDesignScreenIds.length > 1) {
    if (screen.designScreenId !== family.representativeScreenId) {
      return {
        classification: 'SHARED_FAMILY_REFERENCE',
        reason: 'BAW workflow step inherits family shell',
        confidence: family.confidence,
      };
    }
    return {
      classification: 'UNIQUE_REFERENCE_REQUIRED',
      reason: 'BAW family representative — canonical workflow reference',
      confidence: family.confidence,
    };
  }

  if (family?.referencePolicy === 'ASSET_ONLY_VARIANT' || family?.designFamilyId.includes('product-page')) {
    return {
      classification: 'ASSET_ONLY_VARIANT',
      reason: 'Shared PDP shell — product imagery via P0.PAF asset factory',
      confidence: family?.confidence ?? 'HIGH',
    };
  }

  if (family?.displayName.includes('Marketing Info') || family?.designFamilyId.includes('info')) {
    return {
      classification: 'CONTENT_ONLY_VARIANT',
      reason: 'Info pages share shell — copy/content differs only',
      confidence: family?.confidence ?? 'HIGH',
    };
  }

  if (route?.routeFamily === 'ADMIN' && family && family.memberDesignScreenIds.length > 1) {
    return {
      classification: 'DATA_ONLY_VARIANT',
      reason: 'Admin/data pages share shell — records differ',
      confidence: family.confidence,
    };
  }

  if (family && family.memberDesignScreenIds.length > 1) {
    if (family.referenceFamilyConflict) {
      return {
        classification: 'UNKNOWN_REVIEW_REQUIRED',
        reason: 'REFERENCE_FAMILY_CONFLICT — founder review before inheritance',
        confidence: 'LOW',
      };
    }
    if (family.confidence === 'LOW' || family.inheritancePolicy === 'FOUNDER_REVIEW_REQUIRED') {
      return {
        classification: 'UNKNOWN_REVIEW_REQUIRED',
        reason: 'Low-confidence family grouping — founder review required',
        confidence: 'LOW',
      };
    }
    if (vp === 'TABLET' && route?.responsiveLayout !== 'DEDICATED_TABLET_LAYOUT') {
      return {
        classification: 'SHARED_FAMILY_REFERENCE',
        reason: 'Tablet safe to inherit family reference (responsive interpolation)',
        confidence: family.confidence,
      };
    }
    if (screen.designScreenId !== family.representativeScreenId) {
      return {
        classification: 'SHARED_FAMILY_REFERENCE',
        reason: `Inherits ${family.displayName} family reference`,
        confidence: family.confidence,
      };
    }
    return {
      classification: 'UNIQUE_REFERENCE_REQUIRED',
      reason: `Family representative — canonical ${family.displayName} reference`,
      confidence: family.confidence,
    };
  }

  if (route?.reachabilityClassification === 'WORKFLOW_REACHABLE' && family && family.memberDesignScreenIds.length > 1) {
    if (screen.designScreenId !== family.representativeScreenId) {
      return {
        classification: 'SHARED_FAMILY_REFERENCE',
        reason: 'Workflow child inherits family workflow shell',
        confidence: family.confidence,
      };
    }
  }

  if (route?.reachabilityClassification === 'WORKFLOW_REACHABLE' && (!family || family.memberDesignScreenIds.length === 1)) {
    return {
      classification: 'CONTENT_ONLY_VARIANT',
      reason: 'Workflow step — shared workflow chrome, step content differs',
      confidence: 'MEDIUM',
    };
  }

  if (route?.routeFamily === 'MARKETING' || route?.routeFamily === 'CONTENT') {
    return {
      classification: 'CONTENT_ONLY_VARIANT',
      reason: 'Marketing/content page — copy differs, shell shared within route family',
      confidence: 'MEDIUM',
    };
  }

  if (route?.routeFamily === 'ADMIN' || route?.routeFamily === 'WORKSPACE') {
    return {
      classification: 'DATA_ONLY_VARIANT',
      reason: 'Admin/workspace data surface — structure shared, records differ',
      confidence: 'MEDIUM',
    };
  }

  if (route?.routeFamily === 'ACCOUNT' && screen.designScreenId !== family?.representativeScreenId) {
    return {
      classification: 'SHARED_FAMILY_REFERENCE',
      reason: 'Account sub-page inherits account shell family',
      confidence: family?.confidence ?? 'MEDIUM',
    };
  }

  if (screen.instanceCount > 1 && screen.routeTemplateId) {
    return {
      classification: 'SHARED_FAMILY_REFERENCE',
      reason: 'Collapsed template screen — shared shell across instances',
      confidence: 'HIGH',
    };
  }

  if (route?.route.includes('legacy') || route?.deprecated) {
    return {
      classification: 'NO_NEW_REFERENCE_REQUIRED',
      reason: 'Legacy route — no new reference production',
      confidence: 'HIGH',
    };
  }

  if (vp === 'TABLET' && route?.responsiveLayout !== 'DEDICATED_TABLET_LAYOUT') {
    return {
      classification: 'SHARED_FAMILY_REFERENCE',
      reason: 'Tablet inherits mobile/desktop family authority',
      confidence: 'MEDIUM',
    };
  }

  return {
    classification: 'UNIQUE_REFERENCE_REQUIRED',
    reason: 'Singleton screen — unique visual composition',
    confidence: 'HIGH',
  };
}

export function auditReferenceNecessity(
  screens: DesignScreenRecord[],
  families: DesignFamilyRecord[],
  routes: ProjectPageRouteRecord[],
  visualStates: ProjectVisualStateRecord[],
  coverage: PageVisualCoverageRecord[],
  projectId: string,
): {
  audits: ReferenceNecessityAuditRecord[];
  inheritances: DesignScreenReferenceInheritance[];
  familyAuthorities: DesignFamilyReferenceAuthority[];
} {
  const familyMap = new Map(families.filter((f) => f.projectId === projectId).map((f) => [f.designFamilyId, f]));
  const routeMap = new Map(routes.map((r) => [r.routeId, r]));
  const coverageMap = new Map(coverage.map((c) => [c.routeId, c]));
  const stateParentIds = new Set(visualStates.filter((v) => v.projectId === projectId).map((v) => v.routeId));

  const audits: ReferenceNecessityAuditRecord[] = [];
  const inheritances: DesignScreenReferenceInheritance[] = [];

  for (const screen of screens.filter((s) => s.projectId === projectId)) {
    const family = screen.designFamilyId ? familyMap.get(screen.designFamilyId) : undefined;
    const route = routeMap.get(screen.representativeRouteId);
    const cov = coverageMap.get(screen.designScreenId) ?? screen.viewportCoverage;
    const isState = stateParentIds.has(screen.representativeRouteId);

    for (const vp of VIEWPORT_CLASSES) {
      const vpKey = vp.toLowerCase() as 'mobile' | 'tablet' | 'desktop';
      const { classification, reason, confidence } = classifyForViewport(screen, family, vp, isState, route);
      const currentRef = cov?.[vpKey]?.referenceId;
      const isRep = family?.representativeScreenId === screen.designScreenId;
      const inheritFromFamily =
        classification === 'SHARED_FAMILY_REFERENCE' ||
        classification === 'CONTENT_ONLY_VARIANT' ||
        classification === 'DATA_ONLY_VARIANT' ||
        classification === 'ASSET_ONLY_VARIANT' ||
        classification === 'STATE_DERIVED' ||
        classification === 'NO_NEW_REFERENCE_REQUIRED';

      const estimatedGenerationAvoided =
        inheritFromFamily && !isRep && classification !== 'NO_NEW_REFERENCE_REQUIRED';

      audits.push({
        designScreenId: screen.designScreenId,
        projectId,
        viewportClass: vp,
        classification,
        designFamilyId: family?.designFamilyId ?? screen.designFamilyId ?? screen.designScreenId,
        confidence,
        currentReferenceId: currentRef,
        recommendedReferenceId: isRep ? currentRef : family ? `family:${family.designFamilyId}:${vp}` : currentRef,
        reason,
        estimatedGenerationAvoided,
      });

      inheritances.push({
        designScreenId: screen.designScreenId,
        designFamilyId: family?.designFamilyId ?? screen.designScreenId,
        viewportClass: vp,
        inheritFromFamily,
        overrideReferenceId: undefined,
        inheritanceStatus: inheritFromFamily
          ? isRep
            ? 'NO_REFERENCE'
            : 'INHERITS_FAMILY'
          : classification === 'UNKNOWN_REVIEW_REQUIRED'
            ? 'FOUNDER_REVIEW_REQUIRED'
            : 'NO_REFERENCE',
        reason,
      });
    }
  }

  const familyAuthorities: DesignFamilyReferenceAuthority[] = [];
  for (const family of families.filter((f) => f.projectId === projectId)) {
    const repCov = coverageMap.get(family.representativeScreenId);
    for (const vp of VIEWPORT_CLASSES) {
      const vpKey = vp.toLowerCase() as 'mobile' | 'tablet' | 'desktop';
      familyAuthorities.push({
        designFamilyId: family.designFamilyId,
        viewportClass: vp,
        canonicalReferenceId: repCov?.[vpKey]?.referenceId,
        representativeScreenId: family.representativeScreenId,
        referenceVersion: family.version,
        status: repCov?.[vpKey]?.designStatus ?? 'MISSING_REFERENCE',
      });
    }
  }

  return { audits, inheritances, familyAuthorities };
}

export function computeReferenceGenerationSavings(
  projectId: string,
  screens: DesignScreenRecord[],
  families: DesignFamilyRecord[],
  audits: ReferenceNecessityAuditRecord[],
): ReferenceGenerationSavings {
  const projectScreens = screens.filter((s) => s.projectId === projectId);
  const projectAudits = audits.filter((a) => a.projectId === projectId);
  const potentialScreenViewportJobs = projectScreens.length * 3;

  const byNecessity: ReferenceGenerationSavings['byNecessity'] = {};
  for (const a of projectAudits) {
    byNecessity[a.classification] = (byNecessity[a.classification] ?? 0) + 1;
  }

  const exempt = new Set<ReferenceNecessityClassification>([
    'CONTENT_ONLY_VARIANT',
    'DATA_ONLY_VARIANT',
    'ASSET_ONLY_VARIANT',
    'NO_NEW_REFERENCE_REQUIRED',
    'STATE_DERIVED',
    'SHARED_FAMILY_REFERENCE',
  ]);

  const uniqueKeys = new Set<string>();
  const projectFamilies = families.filter((f) => f.projectId === projectId);

  for (const family of projectFamilies) {
    for (const vp of VIEWPORT_CLASSES) {
      const repAudit = projectAudits.find(
        (a) => a.designScreenId === family.representativeScreenId && a.viewportClass === vp,
      );
      if (!repAudit || exempt.has(repAudit.classification)) continue;
      if (
        repAudit.classification === 'UNIQUE_REFERENCE_REQUIRED' ||
        repAudit.classification === 'VIEWPORT_SPECIFIC_REFERENCE_REQUIRED'
      ) {
        uniqueKeys.add(`family:${family.designFamilyId}:${vp}`);
      }
    }
  }

  for (const a of projectAudits) {
    if (a.classification === 'UNKNOWN_REVIEW_REQUIRED') {
      uniqueKeys.add(`review:${a.designScreenId}:${a.viewportClass}`);
    }
  }

  const uniqueReferencesRequired = uniqueKeys.size;
  const familyReferencesReused = projectAudits.filter((a) => a.classification === 'SHARED_FAMILY_REFERENCE').length;
  const generationRequestsAvoided = projectAudits.filter((a) => a.estimatedGenerationAvoided).length;

  const byViewport = { MOBILE: { unique: 0, family: 0, other: 0 }, TABLET: { unique: 0, family: 0, other: 0 }, DESKTOP: { unique: 0, family: 0, other: 0 } };
  for (const a of projectAudits) {
    const bucket = byViewport[a.viewportClass];
    if (a.classification === 'UNIQUE_REFERENCE_REQUIRED' || a.classification === 'VIEWPORT_SPECIFIC_REFERENCE_REQUIRED') {
      bucket.unique++;
    } else if (a.classification === 'SHARED_FAMILY_REFERENCE') {
      bucket.family++;
    } else {
      bucket.other++;
    }
  }

  return {
    projectId,
    designScreensBefore: projectScreens.length,
    designFamiliesAfter: families.filter((f) => f.projectId === projectId).length,
    potentialScreenViewportJobs,
    uniqueReferencesRequired,
    familyReferencesReused,
    generationRequestsAvoided,
    byNecessity,
    byViewport,
  };
}

export function necessityBadge(classification: ReferenceNecessityClassification): string {
  switch (classification) {
    case 'UNIQUE_REFERENCE_REQUIRED':
    case 'VIEWPORT_SPECIFIC_REFERENCE_REQUIRED':
      return 'UNIQUE';
    case 'SHARED_FAMILY_REFERENCE':
      return 'FAMILY';
    case 'STATE_DERIVED':
      return 'STATE';
    case 'ASSET_ONLY_VARIANT':
      return 'ASSET ONLY';
    case 'CONTENT_ONLY_VARIANT':
      return 'CONTENT ONLY';
    case 'DATA_ONLY_VARIANT':
      return 'DATA ONLY';
    case 'NO_NEW_REFERENCE_REQUIRED':
      return 'NO NEW REF';
    default:
      return 'REVIEW';
  }
}
