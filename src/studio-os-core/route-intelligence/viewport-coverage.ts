import { DEFAULT_VIEWPORT_DIMENSIONS } from './constants';
import type {
  DesignStatus,
  ImplementationCoverageStatus,
  PageVisualCoverageRecord,
  ProjectPageRouteRecord,
  ResponsiveLayoutMode,
  ViewportClass,
  ViewportVisualAuthority,
} from './types';
import {
  evaluateReferenceQuality,
  matchReferenceToRoute,
  type DiscoveredReference,
} from './reference-discovery';

function defaultAuthority(viewport: ViewportClass, layout: ResponsiveLayoutMode): ViewportVisualAuthority {
  const dims = DEFAULT_VIEWPORT_DIMENSIONS[viewport];
  return {
    viewportClass: viewport,
    referenceWidth: dims.referenceWidth,
    referenceHeight: dims.referenceHeight,
    implementationStatus: 'IMPLEMENTATION_UNKNOWN',
    designStatus: 'MISSING_REFERENCE',
    responsiveLayout: layout,
  };
}

function designStatusFromQuality(
  ref: DiscoveredReference | undefined,
  qualityStatus: string,
): DesignStatus {
  if (!ref) return 'MISSING_REFERENCE';
  if (qualityStatus === 'CANONICAL_GOOD') return 'REFERENCE_CANONICAL';
  if (qualityStatus === 'OUTDATED' || qualityStatus === 'WRONG_SHELL') return 'STALE_AGAINST_REFERENCE';
  if (qualityStatus === 'SHOULD_REPLACE') return 'NEEDS_REBUILD';
  if (qualityStatus === 'PARTIAL' || qualityStatus === 'LOW_RESOLUTION') return 'REFERENCE_DRAFT';
  return 'REFERENCE_CANONICAL';
}

function implementationStatus(route: ProjectPageRouteRecord): ImplementationCoverageStatus {
  if (route.status === 'REQUIRED_MISSING_ROUTE' || route.status === 'IMPLIED_REQUIRED_ROUTE') {
    return 'IMPLEMENTATION_MISSING';
  }
  if (!route.existsInRouter) return 'IMPLEMENTATION_MISSING';
  if (route.status === 'ORPHANED' || route.status === 'POSSIBLY_DEAD') return 'IMPLEMENTATION_PARTIAL';
  return 'IMPLEMENTATION_PRESENT';
}

export function buildViewportCoverage(
  route: ProjectPageRouteRecord,
  refs: DiscoveredReference[],
): PageVisualCoverageRecord {
  const viewports: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'];
  const record: PageVisualCoverageRecord = {
    projectId: route.projectId,
    routeId: route.routeId,
    mobile: defaultAuthority('MOBILE', route.responsiveLayout),
    tablet: defaultAuthority('TABLET', route.responsiveLayout),
    desktop: defaultAuthority('DESKTOP', route.responsiveLayout),
  };

  const impl = implementationStatus(route);

  for (const vp of viewports) {
    const ref = matchReferenceToRoute(refs, route.projectId, route.route, vp);
    const quality = evaluateReferenceQuality(ref, route.route, vp);
    const authority: ViewportVisualAuthority = {
      viewportClass: vp,
      referenceWidth: DEFAULT_VIEWPORT_DIMENSIONS[vp].referenceWidth,
      referenceHeight: DEFAULT_VIEWPORT_DIMENSIONS[vp].referenceHeight,
      referenceId: ref?.referenceId,
      referencePath: ref?.path,
      implementationStatus: impl,
      designStatus: designStatusFromQuality(ref, quality.status),
      referenceQuality: quality.status,
      responsiveLayout:
        vp === 'MOBILE' && route.route.includes('/desktop')
          ? 'DEDICATED_DESKTOP_LAYOUT'
          : route.responsiveLayout,
    };

    if (impl === 'IMPLEMENTATION_PRESENT' && authority.designStatus === 'REFERENCE_CANONICAL') {
      authority.designStatus = 'MATCHED';
    } else if (impl === 'IMPLEMENTATION_PRESENT' && authority.designStatus === 'MISSING_REFERENCE') {
      authority.designStatus = 'IMPLEMENTED_UNMATCHED';
    }

    record[vp.toLowerCase() as 'mobile' | 'tablet' | 'desktop'] = authority;
  }

  return record;
}

export function buildAllCoverage(
  routes: ProjectPageRouteRecord[],
  refs: DiscoveredReference[],
): PageVisualCoverageRecord[] {
  return routes
    .filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE')
    .map((r) => buildViewportCoverage(r, refs));
}
