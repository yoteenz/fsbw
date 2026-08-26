import type {
  CompiledWebsitePageRecord,
  DesignFamilyRecord,
  DesignScreenRecord,
  ExperiencePageRecord,
  StudioWorldCurationAudit,
} from '../types';

const STUDIO_ROUTE_RE = /^\/admin\/studio|^\/admin\/studio-os|^\/studio-os|^\/studio\/|^\/admin\/headquarters/;

function classifyStudioRoute(route: string, displayName: string): StudioWorldCurationAudit['pages'][0]['classification'] {
  const r = route.toLowerCase();
  const n = displayName.toLowerCase();
  if (/debug|test|qa|pathname|param|sandbox|preview-path/.test(r + n)) return 'SYSTEM_ADMIN';
  if (/asset-factory|asset-director|production-builder|director-mode|virtual-production|generation|foundry/.test(r + n)) {
    return 'ASSET_GENERATION';
  }
  if (/knowledge-hub|blueprint|creative-direction|character|campaign|content-pack|social/.test(r + n)) {
    return 'CAMPAIGN_CONTENT';
  }
  if (/mission-control|executive|headquarters|command-center|overview|atlas|institute/.test(r + n)) {
    return 'PRODUCTION_WORKSPACE';
  }
  if (/design|bluprint|experience-lab|world-compiler/.test(r + n)) return 'DESIGN';
  if (/settings|administration|governance|legacy|archives/.test(r + n)) return 'SYSTEM_ADMIN';
  return 'OTHER';
}

export function auditStudioWorldSurfaces(
  compiledPages: CompiledWebsitePageRecord[],
  designScreens: DesignScreenRecord[],
  designFamilies: DesignFamilyRecord[],
  experiencePages: ExperiencePageRecord[],
): StudioWorldCurationAudit {
  const studioCompiled = compiledPages.filter((p) => STUDIO_ROUTE_RE.test(p.representativeRoute));
  const studioScreens = designScreens.filter((s) => STUDIO_ROUTE_RE.test(s.representativeRoute));
  const studioFamilies = designFamilies.filter((f) =>
    f.memberDesignScreenIds.some((id) => studioScreens.some((s) => s.designScreenId === id)),
  );

  const studioXp = experiencePages.filter((p) => STUDIO_ROUTE_RE.test(p.representativeRoute));

  const pages = studioXp.map((p) => ({
    experiencePageId: p.experiencePageId,
    displayName: p.displayName,
    route: p.representativeRoute,
    classification: classifyStudioRoute(p.representativeRoute, p.displayName),
  }));

  const sectionMap = new Map<string, { sectionId: string; displayName: string; pageCount: number }>();
  for (const p of studioXp) {
    const sec = sectionMap.get(p.sectionId) ?? {
      sectionId: p.sectionId,
      displayName: p.sectionId.split(':').pop()?.toUpperCase() ?? 'STUDIO',
      pageCount: 0,
    };
    sec.pageCount += 1;
    sectionMap.set(p.sectionId, sec);
  }

  const primaryWorkspace = pages.filter((p) =>
    ['PRODUCTION_WORKSPACE', 'DESIGN', 'CAMPAIGN_CONTENT', 'ASSET_GENERATION'].includes(p.classification),
  ).length;
  const internalSystem = pages.filter((p) => p.classification === 'SYSTEM_ADMIN').length;
  const supporting = pages.filter((p) => p.classification === 'OTHER').length;

  return {
    projectId: 'studio-world',
    rawRoutes: studioCompiled.length,
    designScreens: studioScreens.length,
    designFamilies: studioFamilies.length,
    experiencePagesProposed: studioXp.length,
    primaryWorkspace,
    supporting,
    internalSystem,
    materialScreens: studioXp.reduce((n, p) => n + p.materialScreenIds.length, 0),
    states: studioXp.reduce((n, p) => n + p.visualStateIds.length, 0),
    instances: studioXp.reduce((n, p) => n + p.instanceIds.length, 0),
    reviewRequired: pages.filter((p) => p.classification === 'OTHER' || p.classification === 'SYSTEM_ADMIN').length,
    sections: [...sectionMap.values()],
    universeStatus: reviewRequiredStatus(pages),
    pages,
  };
}

function reviewRequiredStatus(pages: StudioWorldCurationAudit['pages']): StudioWorldCurationAudit['universeStatus'] {
  const ambiguous = pages.filter((p) => p.classification === 'OTHER' || p.classification === 'SYSTEM_ADMIN').length;
  return ambiguous > 5 ? 'REVIEWING' : 'CURATED';
}

export function extractStudioWorldExperiencePages(experiencePages: ExperiencePageRecord[]): ExperiencePageRecord[] {
  return experiencePages.filter((p) => STUDIO_ROUTE_RE.test(p.representativeRoute));
}
