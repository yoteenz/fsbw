import type { CompiledWebsitePageRecord, DesignScreenRecord, ExperiencePageRecord } from '../types';
import {
  FRONTAL_SLAYER_CUSTOMER_ROUTE_GUARD,
  FRONTAL_SLAYER_INTERNAL_ROUTE_PATTERNS,
  FS_INTERNAL_WORKSPACE_SECTION,
} from './constants';
import { isExcludedFromPrimary } from '../experience-classifier';

export type FrontalSlayerPrimaryAuditEntry = {
  experiencePageId: string;
  displayName: string;
  route: string;
  classification: 'CUSTOMER_FACING' | 'INTERNAL_WORKSPACE' | 'AMBIGUOUS';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  signals: string[];
};

export function isFrontalSlayerInternalRoute(route: string, compiled?: CompiledWebsitePageRecord): boolean {
  if (FRONTAL_SLAYER_CUSTOMER_ROUTE_GUARD.some((re) => re.test(route))) return false;
  if (FRONTAL_SLAYER_INTERNAL_ROUTE_PATTERNS.some((re) => re.test(route))) return true;
  if (compiled && isExcludedFromPrimary(compiled.experienceClassification)) return true;
  if (compiled?.authContext === 'admin') return true;
  if (compiled?.experienceClassification === 'FOUNDER_WORKSPACE') return true;
  if (compiled?.experienceGroup === 'ADMIN') return true;
  const name = compiled?.displayName?.toLowerCase() ?? '';
  if (/analytics|dashboard|clients|meetings|revenue|audit|workers|headquarters|founder intelligence|collaboration|expert capture|trend desk|onboarding|pending|backend|users|pathname|param/.test(name)) {
    return true;
  }
  return false;
}

export function auditFrontalSlayerPrimaryExperience(
  pages: ExperiencePageRecord[],
  compiledByScreen: Map<string, CompiledWebsitePageRecord>,
): FrontalSlayerPrimaryAuditEntry[] {
  return pages.map((page) => {
    const compiled = compiledByScreen.get(page.representativeScreenId);
    const route = page.representativeRoute;
    const signals: string[] = [];
    let classification: FrontalSlayerPrimaryAuditEntry['classification'] = 'AMBIGUOUS';
    let confidence: FrontalSlayerPrimaryAuditEntry['confidence'] = 'LOW';

    if (FRONTAL_SLAYER_CUSTOMER_ROUTE_GUARD.some((re) => re.test(route))) {
      classification = 'CUSTOMER_FACING';
      confidence = 'HIGH';
      signals.push('customer-route-guard');
    } else if (isFrontalSlayerInternalRoute(route, compiled)) {
      classification = 'INTERNAL_WORKSPACE';
      confidence = FRONTAL_SLAYER_INTERNAL_ROUTE_PATTERNS.some((re) => re.test(route)) ? 'HIGH' : 'MEDIUM';
      signals.push('internal-route-pattern');
      if (compiled?.authContext === 'admin') signals.push('admin-auth');
    }

    return {
      experiencePageId: page.experiencePageId,
      displayName: page.displayName,
      route,
      classification,
      confidence,
      signals,
    };
  });
}

export function demotePageToInternalWorkspace(page: ExperiencePageRecord): ExperiencePageRecord {
  return {
    ...page,
    sectionId: FS_INTERNAL_WORKSPACE_SECTION,
    founderPrimary: false,
    captureEligible: false,
    experienceType: 'WORKSPACE_PAGE',
    priority: 'INTERNAL',
  };
}

export function isHardProtectedCustomerPage(page: ExperiencePageRecord): boolean {
  const route = page.representativeRoute;
  if (page.displayName === 'Product Detail' || page.displayName === 'Build-A-Wig') return true;
  if (page.displayName === 'Home' || page.displayName === 'Cart & Checkout') return true;
  if (FRONTAL_SLAYER_CUSTOMER_ROUTE_GUARD.some((re) => re.test(route))) return true;
  return false;
}

export function buildCompiledByScreen(
  compiledPages: CompiledWebsitePageRecord[],
  screens: DesignScreenRecord[],
): Map<string, CompiledWebsitePageRecord> {
  const map = new Map<string, CompiledWebsitePageRecord>();
  for (const c of compiledPages) map.set(c.designScreenId, c);
  for (const s of screens) {
    if (!map.has(s.designScreenId)) {
      const match = compiledPages.find((c) => c.representativeRoute === s.representativeRoute);
      if (match) map.set(s.designScreenId, match);
    }
  }
  return map;
}
