import type {
  DesignFamilyRecord,
  DesignScreenRecord,
  ExperienceCaptureScope,
  ExperiencePageAbstractionQa,
  ExperiencePageInstanceRecord,
  ExperiencePageMetrics,
  ExperiencePageRecord,
  ExperienceSectionRecord,
  MaterialScreenRecord,
  ProjectWebsitePageSet,
  ReferenceNecessityClassification,
  StudioWorldDesignRouteManifest,
} from './types';
import { EXPERIENCE_PAGE_SET_SCHEMA_VERSION } from './constants';
import {
  matchSite00CanonicalPage,
  isSite00DesignHostRoute,
  isSite00ProductionWorkspaceRoute,
  SITE00_CANONICAL_EXPERIENCE_PAGES,
  SITE00_CANONICAL_VISUAL_STATES,
  SITE00_EXPERIENCE_SECTIONS,
  SITE00_MISSING_EXPERIENCE_PAGES,
  SITE00_P0_VR_3D_BASELINE_COUNT,
} from './site00-p0-vr-3d-scope';
import { runExperiencePageAbstractionQa } from './experience-page-qa';
import { buildExperienceCaptureScope } from './experience-capture-scope';

type AbstractionContext = {
  manifest: StudioWorldDesignRouteManifest;
  projectId: string;
  pageSet: ProjectWebsitePageSet;
  screens: DesignScreenRecord[];
  families: DesignFamilyRecord[];
  screenById: Map<string, DesignScreenRecord>;
  familyById: Map<string, DesignFamilyRecord>;
  necessityByScreenVp: Map<string, ReferenceNecessityClassification>;
  routesByScreen: Map<string, string[]>;
};

const FS_PRODUCT_SLUGS = ['noir', 'blanco', 'soft-wave', 'beach-wave', 'soft-curl', 'ocean-curl'];

const INTERNAL_ROUTE_PATTERNS: Record<string, RegExp[]> = {
  'frontal-slayer': [/^\/studio(\/|$)/, /^\/studio-os(\/|$)/, /^\/admin\/studio(\/|$)/],
  site00: [/^\/admin\/site00(\/|$)/],
  'all-in-one-enterprise': [/\/office(\/|$)/, /^\/admin(\/|$)/],
  ndxbook: [],
};

const FS_SECTION_MAP: Record<string, string> = {
  HOME: 'frontal-slayer:section:discovery',
  COMMERCE: 'frontal-slayer:section:commerce',
  PERSONALIZATION: 'frontal-slayer:section:personalization',
  MEMBERSHIP: 'frontal-slayer:section:membership',
  EXPERIENCE: 'frontal-slayer:section:immersive',
  ACCOUNT: 'frontal-slayer:section:account',
  SUPPORT: 'frontal-slayer:section:support',
  OTHER: 'frontal-slayer:section:other',
};

function sectionId(projectId: string, key: string): string {
  return `${projectId}:section:${key.toLowerCase().replace(/\s+/g, '-')}`;
}

function primaryNecessity(
  ctx: AbstractionContext,
  screenId: string,
): ReferenceNecessityClassification {
  for (const vp of ['MOBILE', 'TABLET', 'DESKTOP'] as const) {
    const n = ctx.necessityByScreenVp.get(`${screenId}:${vp}`);
    if (n) return n;
  }
  return 'UNIQUE_REFERENCE_REQUIRED';
}

function isInternalRoute(projectId: string, route: string): boolean {
  const patterns = INTERNAL_ROUTE_PATTERNS[projectId] ?? [];
  if (projectId === 'site00' && (isSite00DesignHostRoute(route) || isSite00ProductionWorkspaceRoute(route))) {
    return true;
  }
  return patterns.some((re) => re.test(route));
}

function shouldDemoteToInstance(necessity: ReferenceNecessityClassification): boolean {
  return necessity === 'CONTENT_ONLY_VARIANT' || necessity === 'DATA_ONLY_VARIANT';
}

function shouldDemoteToState(necessity: ReferenceNecessityClassification): boolean {
  return necessity === 'STATE_DERIVED';
}

function isAssetOnlyFamily(family?: DesignFamilyRecord): boolean {
  return family?.displayName === 'Product Page' || (family?.designFamilyId?.includes('product-page') ?? false);
}

function inferMaterialStepType(name: string, route: string): MaterialScreenRecord['stepType'] {
  const s = `${name} ${route}`.toLowerCase();
  if (/entry|start|intro|landing/.test(s)) return 'ENTRY';
  if (/select|choose|pick|catalog|shop/.test(s)) return 'SELECTION';
  if (/custom|config|edit|personal/.test(s)) return 'CONFIGURATION';
  if (/review|summary|confirm/.test(s)) return 'REVIEW';
  if (/complete|success|thank|done/.test(s)) return 'COMPLETION';
  if (/:id|:param|:slug|:unit/.test(route)) return 'DETAIL';
  return 'OTHER';
}

function buildMaterialScreensForFamily(
  ctx: AbstractionContext,
  experiencePageId: string,
  members: DesignScreenRecord[],
  family?: DesignFamilyRecord,
): MaterialScreenRecord[] {
  if (members.length <= 1) return [];
  const familyName = (family?.displayName ?? '').toLowerCase();
  const isWorkflow =
    familyName.includes('build-a-wig') ||
    familyName.includes('assessment') ||
    familyName.includes('checkout') ||
    familyName.includes('hair analysis');

  if (!isWorkflow && members.length < 3) return [];

  return members
    .sort((a, b) => a.representativeRoute.localeCompare(b.representativeRoute))
    .map((screen, order) => ({
      materialScreenId: `${experiencePageId}:mat:${screen.designScreenId}`,
      projectId: ctx.projectId,
      experiencePageId,
      displayName: screen.displayName,
      stepType: inferMaterialStepType(screen.displayName, screen.representativeRoute),
      memberDesignScreenIds: [screen.designScreenId],
      memberRouteIds: [screen.representativeRouteId],
      representativeRoute: screen.representativeRoute,
      referencePolicy: primaryNecessity(ctx, screen.designScreenId),
      captureEligible: true,
      order,
    }));
}

function buildInstancesForPage(
  ctx: AbstractionContext,
  experiencePageId: string,
  members: DesignScreenRecord[],
  family?: DesignFamilyRecord,
): ExperiencePageInstanceRecord[] {
  const instances: ExperiencePageInstanceRecord[] = [];

  if (family?.displayName === 'Product Page' || family?.designFamilyId?.includes('product-page')) {
    for (const slug of FS_PRODUCT_SLUGS) {
      instances.push({
        instanceId: `${experiencePageId}:inst:product:${slug}`,
        projectId: ctx.projectId,
        experiencePageId,
        displayName: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        slugOrId: slug,
        memberDesignScreenIds: members.map((m) => m.designScreenId),
        memberRouteIds: members.map((m) => m.representativeRouteId),
        representativeRoute: `/home/shop/${slug}`,
        instanceKind: 'PRODUCT',
        captureEligible: false,
      });
    }
    return instances;
  }

  for (const screen of members) {
    if (screen.instanceCount <= 1 && !/:param|:id|:slug|:unit|:batchId|:assetId/.test(screen.representativeRoute)) {
      continue;
    }
    const slug = screen.representativeRoute.split('/').pop() ?? screen.displayName;
    instances.push({
      instanceId: `${experiencePageId}:inst:${screen.designScreenId}`,
      projectId: ctx.projectId,
      experiencePageId,
      displayName: screen.displayName,
      slugOrId: slug,
      memberDesignScreenIds: [screen.designScreenId],
      memberRouteIds: [screen.representativeRouteId],
      representativeRoute: screen.representativeRoute,
      instanceKind: /product|shop/i.test(screen.displayName)
        ? 'PRODUCT'
        : /episode|watch|lounge|psa/i.test(screen.displayName)
          ? 'EPISODE'
          : /room|mansion|desktop/i.test(screen.displayName)
            ? 'ROOM'
            : /service|dispatch|insurance|factoring/i.test(screen.displayName)
              ? 'SERVICE'
              : 'OTHER',
      captureEligible: false,
    });
  }

  return instances;
}

function groupScreensByFamily(ctx: AbstractionContext, screenIds: string[]): Map<string, DesignScreenRecord[]> {
  const buckets = new Map<string, DesignScreenRecord[]>();
  for (const id of screenIds) {
    const screen = ctx.screenById.get(id);
    if (!screen) continue;
    const familyId = screen.designFamilyId ?? `singleton:${screen.designScreenId}`;
    const list = buckets.get(familyId) ?? [];
    list.push(screen);
    buckets.set(familyId, list);
  }
  return buckets;
}

function collapseAioDetailFamilies(
  ctx: AbstractionContext,
  buckets: Map<string, DesignScreenRecord[]>,
): Map<string, DesignScreenRecord[]> {
  const result = new Map<string, DesignScreenRecord[]>();
  const paramScreens: DesignScreenRecord[] = [];
  const publicServices: DesignScreenRecord[] = [];

  for (const [familyId, members] of buckets) {
    const family = ctx.familyById.get(familyId);
    const isParam = family?.displayName === 'Param' || members.some((m) => /:param|:id|:slug/.test(m.representativeRoute));
    const isPublicService = family?.displayName === 'Public Service Page';

    if (isParam) {
      paramScreens.push(...members);
    } else if (isPublicService) {
      publicServices.push(...members);
    } else {
      result.set(familyId, members);
    }
  }

  if (paramScreens.length > 0) {
    result.set(`${ctx.projectId}:xp-bucket:record-detail`, paramScreens);
  }
  if (publicServices.length > 0) {
    result.set(`${ctx.projectId}:xp-bucket:public-services`, publicServices);
  }
  return result;
}

function collapseFsContentFamilies(
  ctx: AbstractionContext,
  buckets: Map<string, DesignScreenRecord[]>,
): Map<string, DesignScreenRecord[]> {
  const result = new Map<string, DesignScreenRecord[]>();
  const marketing: DesignScreenRecord[] = [];

  for (const [familyId, members] of buckets) {
    const family = ctx.familyById.get(familyId);
    if (family?.displayName === 'Marketing Info Page') {
      marketing.push(...members);
    } else {
      result.set(familyId, members);
    }
  }

  if (marketing.length > 1) {
    result.set(`${ctx.projectId}:xp-bucket:marketing-info`, marketing);
  } else if (marketing.length === 1) {
    result.set(`${ctx.projectId}:xp-bucket:marketing-info`, marketing);
  }
  return result;
}

function compileSite00ExperiencePages(ctx: AbstractionContext): {
  sections: ExperienceSectionRecord[];
  pages: ExperiencePageRecord[];
  materialScreens: MaterialScreenRecord[];
  instances: ExperiencePageInstanceRecord[];
  workspacePages: ExperiencePageRecord[];
} {
  const sections: ExperienceSectionRecord[] = SITE00_EXPERIENCE_SECTIONS.map((s) => ({
    ...s,
    projectId: 'site00',
    experiencePageIds: [],
  }));
  const sectionById = new Map(sections.map((s) => [s.sectionId, s]));

  const pageBuckets = new Map<string, { canonical: (typeof SITE00_CANONICAL_EXPERIENCE_PAGES)[0]; screens: DesignScreenRecord[] }>();
  for (const c of SITE00_CANONICAL_EXPERIENCE_PAGES) {
    pageBuckets.set(c.id, { canonical: c, screens: [] });
  }

  const workspaceScreens: DesignScreenRecord[] = [];
  const allScreens = ctx.screens.filter((s) => s.projectId === 'site00');

  for (const screen of allScreens) {
    const route = screen.representativeRoute;
    if (isSite00DesignHostRoute(route) || isSite00ProductionWorkspaceRoute(route)) {
      workspaceScreens.push(screen);
      continue;
    }
    const canonical = matchSite00CanonicalPage(route);
    if (canonical) {
      pageBuckets.get(canonical.id)?.screens.push(screen);
    } else if (/^\/(build|live|composition|desktop|control)/.test(route)) {
      workspaceScreens.push(screen);
    } else {
      workspaceScreens.push(screen);
    }
  }

  const pages: ExperiencePageRecord[] = [];
  const materialScreens: MaterialScreenRecord[] = [];
  const instances: ExperiencePageInstanceRecord[] = [];
  const visualStateIdsByPage = new Map<string, string[]>();

  for (const vs of SITE00_CANONICAL_VISUAL_STATES) {
    const list = visualStateIdsByPage.get(vs.parentPageId) ?? [];
    list.push(vs.id);
    visualStateIdsByPage.set(vs.parentPageId, list);
  }

  for (const [pageId, { canonical, screens }] of pageBuckets) {
    if (screens.length === 0 && !SITE00_MISSING_EXPERIENCE_PAGES.some((m) => m.id === `${pageId}-missing`)) {
      const missing = SITE00_MISSING_EXPERIENCE_PAGES.find((m) => m.id === pageId.replace(':xp:', ':xp-missing:'));
      if (!missing && !['site00:xp:account'].includes(pageId)) continue;
    }

    const rep = screens[0] ?? ctx.screens.find((s) => matchSite00CanonicalPage(s.representativeRoute)?.id === pageId);
    const memberIds = screens.map((s) => s.designScreenId);
    const familyIds = [...new Set(screens.map((s) => s.designFamilyId).filter(Boolean))] as string[];

    const xp: ExperiencePageRecord = {
      experiencePageId: pageId,
      projectId: 'site00',
      displayName: canonical.displayName,
      sectionId: canonical.sectionId,
      experienceType: canonical.experienceType,
      memberDesignScreenIds: memberIds,
      memberRouteIds: screens.map((s) => s.representativeRouteId),
      materialScreenIds: [],
      visualStateIds: visualStateIdsByPage.get(pageId) ?? [],
      instanceIds: [],
      representativeScreenId: rep?.designScreenId ?? pageId,
      representativeRoute: rep?.representativeRoute ?? canonical.routePatterns[0]?.source ?? '/',
      designFamilyIds: familyIds,
      referencePolicy: rep ? primaryNecessity(ctx, rep.designScreenId) : 'UNIQUE_REFERENCE_REQUIRED',
      viewportRequirements: { mobile: true, tablet: true, desktop: true },
      implementationStatus: rep ? 'IMPLEMENTATION_PRESENT' : 'IMPLEMENTATION_MISSING',
      referenceStatus: rep ? 'IMPLEMENTED' : 'IMPLEMENTATION_MISSING',
      priority: canonical.priority,
      journeyStage: canonical.journeyStage,
      founderDesignable: true,
      founderPrimary: canonical.founderPrimary,
      abstractionConfidence: 'HIGH',
      captureEligible: !!rep && canonical.founderPrimary,
      routeNodeCount: memberIds.length,
    };

    const mats = buildMaterialScreensForFamily(ctx, pageId, screens, familyIds[0] ? ctx.familyById.get(familyIds[0]) : undefined);
    xp.materialScreenIds = mats.map((m) => m.materialScreenId);
    materialScreens.push(...mats);
    pages.push(xp);
    sectionById.get(canonical.sectionId)?.experiencePageIds.push(pageId);
  }

  for (const missing of SITE00_MISSING_EXPERIENCE_PAGES) {
    const existing = pages.find(
      (p) =>
        p.displayName.toLowerCase() === missing.displayName.toLowerCase() &&
        p.implementationStatus !== 'IMPLEMENTATION_MISSING',
    );
    if (existing) continue;

    const pageId = missing.id;
    pages.push({
      experiencePageId: pageId,
      projectId: 'site00',
      displayName: missing.displayName,
      sectionId: missing.sectionId,
      experienceType: 'MISSING_PAGE',
      memberDesignScreenIds: [],
      memberRouteIds: [],
      materialScreenIds: [],
      visualStateIds: missing.displayName === 'Brand' ? ['site00:vs:brand-panel'] : [],
      instanceIds: [],
      representativeScreenId: pageId,
      representativeRoute: missing.suggestedRoute,
      designFamilyIds: [],
      referencePolicy: 'UNIQUE_REFERENCE_REQUIRED',
      viewportRequirements: { mobile: true, tablet: true, desktop: true },
      implementationStatus: 'IMPLEMENTATION_MISSING',
      referenceStatus: 'IMPLEMENTATION_MISSING',
      priority: missing.priority,
      journeyStage: 'DISCOVERY',
      founderDesignable: true,
      founderPrimary: true,
      abstractionConfidence: 'HIGH',
      captureEligible: false,
      routeNodeCount: 0,
    });
    sectionById.get(missing.sectionId)?.experiencePageIds.push(pageId);
  }

  const workspacePages: ExperiencePageRecord[] = workspaceScreens.length
    ? [
        {
          experiencePageId: 'site00:xp:production-os',
          projectId: 'site00',
          displayName: 'Production OS',
          sectionId: 'site00:section:system',
          experienceType: 'WORKSPACE_PAGE',
          memberDesignScreenIds: workspaceScreens.map((s) => s.designScreenId),
          memberRouteIds: workspaceScreens.map((s) => s.representativeRouteId),
          materialScreenIds: [],
          visualStateIds: [],
          instanceIds: [],
          representativeScreenId: workspaceScreens[0]!.designScreenId,
          representativeRoute: workspaceScreens[0]!.representativeRoute,
          designFamilyIds: [...new Set(workspaceScreens.map((s) => s.designFamilyId).filter(Boolean))] as string[],
          referencePolicy: 'CONTENT_ONLY_VARIANT',
          viewportRequirements: { mobile: true, tablet: true, desktop: true },
          implementationStatus: 'IMPLEMENTATION_PRESENT',
          referenceStatus: 'CONTENT_ONLY',
          priority: 'INTERNAL',
          journeyStage: 'SUPPORT',
          founderDesignable: true,
          founderPrimary: false,
          abstractionConfidence: 'HIGH',
          captureEligible: false,
          routeNodeCount: workspaceScreens.length,
        },
      ]
    : [];

  return { sections, pages, materialScreens, instances, workspacePages };
}

function compileNdxbookExperiencePages(ctx: AbstractionContext): {
  sections: ExperienceSectionRecord[];
  pages: ExperiencePageRecord[];
  materialScreens: MaterialScreenRecord[];
  instances: ExperiencePageInstanceRecord[];
  workspacePages: ExperiencePageRecord[];
} {
  const sections: ExperienceSectionRecord[] = [
    {
      sectionId: 'ndxbook:section:workspace',
      projectId: 'ndxbook',
      displayName: 'NDXBOOK WORKSPACE',
      order: 0,
      experiencePageIds: [],
    },
    {
      sectionId: 'ndxbook:section:content',
      projectId: 'ndxbook',
      displayName: 'CONTENT',
      order: 1,
      experiencePageIds: [],
    },
  ];
  const sectionById = new Map(sections.map((s) => [s.sectionId, s]));
  const pages: ExperiencePageRecord[] = [];

  for (const compiled of ctx.pageSet.compiledPages.filter((p) => p.isPrimaryExperience)) {
    const screen = ctx.screenById.get(compiled.designScreenId);
    if (!screen) continue;
    const isWorkspace = /\/admin\/studio\/ndxbook/.test(screen.representativeRoute);
    const sid = isWorkspace ? 'ndxbook:section:workspace' : 'ndxbook:section:content';
    const pageId = `ndxbook:xp:${screen.designScreenId}`;
    pages.push({
      experiencePageId: pageId,
      projectId: 'ndxbook',
      displayName: screen.displayName,
      sectionId: sid,
      experienceType: isWorkspace ? 'WORKSPACE_PAGE' : 'PUBLIC_PAGE',
      memberDesignScreenIds: [screen.designScreenId],
      memberRouteIds: [screen.representativeRouteId],
      materialScreenIds: [],
      visualStateIds: compiled.visualStateIds,
      instanceIds: [],
      representativeScreenId: screen.designScreenId,
      representativeRoute: screen.representativeRoute,
      designFamilyIds: screen.designFamilyId ? [screen.designFamilyId] : [],
      referencePolicy: compiled.referencePolicy,
      viewportRequirements: { mobile: true, tablet: true, desktop: true },
      implementationStatus: 'IMPLEMENTATION_PRESENT',
      referenceStatus: compiled.compiledStatus,
      priority: compiled.priority,
      journeyStage: compiled.journeyStage,
      founderDesignable: true,
      founderPrimary: true,
      abstractionConfidence: 'HIGH',
      captureEligible: compiled.captureEligible,
      routeNodeCount: screen.instanceCount,
      authContext: compiled.authContext,
    });
    sectionById.get(sid)?.experiencePageIds.push(pageId);
  }

  for (const missing of ctx.pageSet.missingPages) {
    const pageId = missing.pageId.replace('missing-page', 'xp-missing');
    pages.push({
      experiencePageId: pageId,
      projectId: 'ndxbook',
      displayName: missing.displayName,
      sectionId: 'ndxbook:section:workspace',
      experienceType: 'MISSING_PAGE',
      memberDesignScreenIds: [],
      memberRouteIds: [],
      materialScreenIds: [],
      visualStateIds: [],
      instanceIds: [],
      representativeScreenId: pageId,
      representativeRoute: missing.suggestedRoute,
      designFamilyIds: [],
      referencePolicy: 'UNIQUE_REFERENCE_REQUIRED',
      viewportRequirements: { mobile: true, tablet: true, desktop: true },
      implementationStatus: 'IMPLEMENTATION_MISSING',
      referenceStatus: 'IMPLEMENTATION_MISSING',
      priority: missing.priority,
      journeyStage: missing.journeyStage,
      founderDesignable: true,
      founderPrimary: true,
      abstractionConfidence: 'HIGH',
      captureEligible: false,
      routeNodeCount: 0,
    });
    sectionById.get('ndxbook:section:workspace')?.experiencePageIds.push(pageId);
  }

  return { sections, pages, materialScreens: [], instances: [], workspacePages: [] };
}

function compileGenericExperiencePages(ctx: AbstractionContext): {
  sections: ExperienceSectionRecord[];
  pages: ExperiencePageRecord[];
  materialScreens: MaterialScreenRecord[];
  instances: ExperiencePageInstanceRecord[];
  workspacePages: ExperiencePageRecord[];
} {
  const primaryCompiled = ctx.pageSet.compiledPages.filter((p) => p.isPrimaryExperience);
  const customerScreens = primaryCompiled.filter((p) => !isInternalRoute(ctx.projectId, p.representativeRoute));

  const workspaceCompiled = primaryCompiled.filter((p) => isInternalRoute(ctx.projectId, p.representativeRoute));
  const demotedScreenIds = new Set<string>();

  const stateAttachments = new Map<string, string[]>();
  const instanceAttachments = new Map<string, DesignScreenRecord[]>();

  for (const page of customerScreens) {
    const screen = ctx.screenById.get(page.designScreenId);
    if (!screen) continue;
    const necessity = page.referencePolicy;
    if (shouldDemoteToState(necessity)) {
      demotedScreenIds.add(screen.designScreenId);
      const familyId = screen.designFamilyId ?? 'ungrouped';
      const states = stateAttachments.get(familyId) ?? [];
      states.push(screen.visualStateIds[0] ?? `state:${screen.designScreenId}`);
      stateAttachments.set(familyId, states);
    } else if (shouldDemoteToInstance(necessity) && !isAssetOnlyFamily(ctx.familyById.get(screen.designFamilyId ?? ''))) {
      demotedScreenIds.add(screen.designScreenId);
      const familyId = screen.designFamilyId ?? screen.designScreenId;
      const list = instanceAttachments.get(familyId) ?? [];
      list.push(screen);
      instanceAttachments.set(familyId, [...list, screen]);
    }
  }

  const activeScreenIds = customerScreens
    .map((p) => p.designScreenId)
    .filter((id) => !demotedScreenIds.has(id));

  let familyBuckets = groupScreensByFamily(ctx, activeScreenIds);

  if (ctx.projectId === 'all-in-one-enterprise') {
    familyBuckets = collapseAioDetailFamilies(ctx, familyBuckets);
  }

  if (ctx.projectId === 'frontal-slayer') {
    familyBuckets = collapseFsContentFamilies(ctx, familyBuckets);
  }
  const sectionsMap = new Map<string, ExperienceSectionRecord>();
  const pages: ExperiencePageRecord[] = [];
  const materialScreens: MaterialScreenRecord[] = [];
  const instances: ExperiencePageInstanceRecord[] = [];

  for (const [familyId, members] of familyBuckets) {
    const family = ctx.familyById.get(familyId.startsWith('singleton:') ? '' : familyId) ?? ctx.familyById.get(familyId);
    const rep = members[0]!;
    const compiled = customerScreens.find((p) => p.designScreenId === rep.designScreenId);
    const sectionKey =
      ctx.projectId === 'frontal-slayer'
        ? FS_SECTION_MAP[compiled?.experienceGroup ?? 'OTHER'] ?? sectionId(ctx.projectId, 'other')
        : sectionId(ctx.projectId, compiled?.experienceGroup?.toLowerCase() ?? 'general');

    if (!sectionsMap.has(sectionKey)) {
      sectionsMap.set(sectionKey, {
        sectionId: sectionKey,
        projectId: ctx.projectId,
        displayName: (compiled?.experienceGroup ?? 'GENERAL').toUpperCase(),
        order: sectionsMap.size,
        experiencePageIds: [],
      });
    }

    const familyName = family?.displayName ?? rep.displayName;
    const experiencePageId = `${ctx.projectId}:xp:${(family?.designFamilyId ?? rep.designScreenId).replace(/[^a-z0-9:-]/gi, '-')}`;

    let displayName = familyName;
    if (familyName === 'Product Page') displayName = 'Product Detail';
    if (familyName.includes('Build-a-Wig')) displayName = 'Build-A-Wig';
    if (familyName === 'Marketing Info Page') displayName = 'Marketing & Information';
    if (familyName === 'Shop & Browse') displayName = 'Shop / Collection';
    if (familyName === 'Checkout & Cart') displayName = 'Cart & Checkout';
    if (familyName === 'Account') displayName = 'Account';
    if (familyName === 'Mansion / Desktop Room') displayName = 'Mansion';
    if (familyName === 'Customer Portal') displayName = 'Customer Portal';
    if (familyName === 'Office Section') displayName = 'Office';
    if (familyName === 'Public Service Page' && members.length > 1) displayName = 'Services Overview';
    if (familyId.includes('record-detail')) displayName = 'Record Detail';
    if (familyId.includes('public-services')) displayName = 'Public Services';
    if (familyId.includes('marketing-info')) displayName = 'Marketing & Information';

    const mats = buildMaterialScreensForFamily(ctx, experiencePageId, members, family);
    const inst = buildInstancesForPage(ctx, experiencePageId, members, family);

    const xp: ExperiencePageRecord = {
      experiencePageId,
      projectId: ctx.projectId,
      displayName,
      sectionId: sectionKey,
      experienceType: familyName.includes('Portal')
        ? 'PORTAL_PAGE'
        : familyName.includes('Build-a-Wig') || familyName.includes('Assessment')
          ? 'WORKFLOW_PAGE'
          : familyName.includes('Mansion') || familyName.includes('Room')
            ? 'IMMERSIVE_PAGE'
            : familyName === 'Product Page'
              ? 'DETAIL_PAGE'
              : 'PUBLIC_PAGE',
      memberDesignScreenIds: members.map((m) => m.designScreenId),
      memberRouteIds: members.map((m) => m.representativeRouteId),
      materialScreenIds: mats.map((m) => m.materialScreenId),
      visualStateIds: stateAttachments.get(familyId) ?? [],
      instanceIds: inst.map((i) => i.instanceId),
      representativeScreenId: rep.designScreenId,
      representativeRoute: rep.representativeRoute,
      designFamilyIds: family ? [family.designFamilyId] : [],
      referencePolicy: compiled?.referencePolicy ?? primaryNecessity(ctx, rep.designScreenId),
      viewportRequirements: { mobile: true, tablet: true, desktop: true },
      implementationStatus: 'IMPLEMENTATION_PRESENT',
      referenceStatus: compiled?.compiledStatus ?? 'IMPLEMENTED',
      priority: compiled?.priority ?? rep.priority,
      journeyStage: compiled?.journeyStage ?? 'DISCOVERY',
      founderDesignable: true,
      founderPrimary: true,
      abstractionConfidence: family && members.length > 1 ? 'HIGH' : members.length === 1 ? 'MEDIUM' : 'HIGH',
      captureEligible: true,
      routeNodeCount: members.reduce((n, m) => n + Math.max(1, m.instanceCount), 0),
      authContext: compiled?.authContext,
    };

    pages.push(xp);
    materialScreens.push(...mats);
    instances.push(...inst);
    sectionsMap.get(sectionKey)!.experiencePageIds.push(experiencePageId);
  }

  const workspacePages: ExperiencePageRecord[] = [];
  if (workspaceCompiled.length > 0) {
    const wsScreens = workspaceCompiled.map((p) => ctx.screenById.get(p.designScreenId)).filter(Boolean) as DesignScreenRecord[];
    workspacePages.push({
      experiencePageId: `${ctx.projectId}:xp:workspace`,
      projectId: ctx.projectId,
      displayName: ctx.projectId === 'frontal-slayer' ? 'Studio OS Workspace' : 'Office / Workspace',
      sectionId: sectionId(ctx.projectId, 'workspace'),
      experienceType: 'WORKSPACE_PAGE',
      memberDesignScreenIds: wsScreens.map((s) => s.designScreenId),
      memberRouteIds: wsScreens.map((s) => s.representativeRouteId),
      materialScreenIds: [],
      visualStateIds: [],
      instanceIds: [],
      representativeScreenId: wsScreens[0]?.designScreenId ?? `${ctx.projectId}:workspace`,
      representativeRoute: wsScreens[0]?.representativeRoute ?? '/workspace',
      designFamilyIds: [...new Set(wsScreens.map((s) => s.designFamilyId).filter(Boolean))] as string[],
      referencePolicy: 'CONTENT_ONLY_VARIANT',
      viewportRequirements: { mobile: true, tablet: true, desktop: true },
      implementationStatus: 'IMPLEMENTATION_PRESENT',
      referenceStatus: 'CONTENT_ONLY',
      priority: 'INTERNAL',
      journeyStage: 'SUPPORT',
      founderDesignable: true,
      founderPrimary: false,
      abstractionConfidence: 'HIGH',
      captureEligible: false,
      routeNodeCount: wsScreens.length,
    });
  }

  return {
    sections: [...sectionsMap.values()],
    pages,
    materialScreens,
    instances,
    workspacePages,
  };
}

export function compilePrimaryExperiencePages(
  manifest: StudioWorldDesignRouteManifest,
  projectId: string,
): {
  sections: ExperienceSectionRecord[];
  pages: ExperiencePageRecord[];
  materialScreens: MaterialScreenRecord[];
  instances: ExperiencePageInstanceRecord[];
  workspacePages: ExperiencePageRecord[];
  qa: ExperiencePageAbstractionQa;
  metrics: ExperiencePageMetrics;
  captureScope: ExperienceCaptureScope;
} {
  const pageSet = manifest.projectPageSets.find((p) => p.projectId === projectId);
  if (!pageSet) {
    throw new Error(`No page set for project ${projectId}`);
  }

  const screens = manifest.designScreens.filter((s) => s.projectId === projectId);
  const families = manifest.designFamilies.filter((f) => f.projectId === projectId);
  const necessityByScreenVp = new Map<string, ReferenceNecessityClassification>();
  for (const a of manifest.referenceNecessityAudits ?? []) {
    if (a.projectId === projectId) necessityByScreenVp.set(`${a.designScreenId}:${a.viewportClass}`, a.classification);
  }

  const ctx: AbstractionContext = {
    manifest,
    projectId,
    pageSet,
    screens,
    families,
    screenById: new Map(screens.map((s) => [s.designScreenId, s])),
    familyById: new Map(families.map((f) => [f.designFamilyId, f])),
    necessityByScreenVp,
    routesByScreen: new Map(),
  };

  const result =
    projectId === 'site00'
      ? compileSite00ExperiencePages(ctx)
      : projectId === 'ndxbook'
        ? compileNdxbookExperiencePages(ctx)
        : compileGenericExperiencePages(ctx);

  const beforeVr3f = pageSet.summary.totalPrimaryPages;
  const primaryPages = result.pages.filter((p) => p.founderPrimary);
  const qa = runExperiencePageAbstractionQa(projectId, result.pages, pageSet, beforeVr3f);
  const captureScope = buildExperienceCaptureScope(projectId, result.pages, result.materialScreens);

  const metrics: ExperiencePageMetrics = {
    projectId,
    beforeVr3fPrimary: beforeVr3f,
    afterExperiencePages: primaryPages.length,
    reductionCount: beforeVr3f - primaryPages.length,
    reductionPercent: beforeVr3f > 0 ? Math.round(((beforeVr3f - primaryPages.length) / beforeVr3f) * 100) : 0,
    rawRoutes: manifest.rawImplementationRoutes.filter((r) => r.projectId === projectId).length,
    designScreens: screens.length,
    materialScreens: result.materialScreens.length,
    visualStates: result.pages.reduce((n, p) => n + p.visualStateIds.length, 0),
    instances: result.instances.length,
    missingPages: pageSet.missingPages.length,
    workspacePages: result.workspacePages.length,
  };

  return { ...result, qa, metrics, captureScope };
}

export function attachExperiencePagesToPageSet(
  manifest: StudioWorldDesignRouteManifest,
  pageSet: ProjectWebsitePageSet,
): ProjectWebsitePageSet {
  const compiled = compilePrimaryExperiencePages(manifest, pageSet.projectId);
  const journeyIndex = {
    projectId: pageSet.projectId,
    stages: pageSet.journeyIndex.stages.map((stage) => ({
      ...stage,
      pageIds: compiled.pages
        .filter((p) => p.journeyStage === stage.stage && p.founderPrimary)
        .map((p) => p.experiencePageId),
    })),
  };

  return {
    ...pageSet,
    experienceSections: compiled.sections,
    experiencePages: [...compiled.pages, ...compiled.workspacePages],
    materialScreens: compiled.materialScreens,
    pageInstances: compiled.instances,
    experiencePageQa: [compiled.qa],
    experienceMetrics: compiled.metrics,
    journeyIndex,
    summary: {
      ...pageSet.summary,
      vr3fPrimaryPages: pageSet.summary.totalPrimaryPages,
      experiencePages: compiled.pages.filter((p) => p.founderPrimary).length,
      materialScreens: compiled.materialScreens.length,
      visualStates: compiled.pages.reduce((n, p) => n + p.visualStateIds.length, 0),
      instances: compiled.instances.length,
      workspacePages: compiled.workspacePages.length,
    },
  };
}

export function attachExperiencePagesToManifest(
  manifest: StudioWorldDesignRouteManifest,
): StudioWorldDesignRouteManifest {
  const projectPageSets = manifest.projectPageSets.map((ps) => attachExperiencePagesToPageSet(manifest, ps));
  const allSections = projectPageSets.flatMap((p) => p.experienceSections ?? []);
  const allPages = projectPageSets.flatMap((p) => p.experiencePages ?? []);
  const allMaterial = projectPageSets.flatMap((p) => p.materialScreens ?? []);
  const allInstances = projectPageSets.flatMap((p) => p.pageInstances ?? []);

  return {
    ...manifest,
    projectPageSets,
    experienceSections: allSections,
    experiencePages: allPages,
    materialScreens: allMaterial,
    pageInstances: allInstances,
    experiencePageCompilation: {
      experiencePageSetSchemaVersion: EXPERIENCE_PAGE_SET_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      sourceManifestVersion: manifest.manifestVersion,
      sourceCommit: manifest.sourceCommit,
      captureScope: 'EXPERIENCE_PAGES_AND_MATERIAL_SCREENS',
    },
    pageSetCompilation: {
      ...(manifest.pageSetCompilation ?? {
        pageSetSchemaVersion: 'studio-world-project-page-set@2',
        generatedAt: new Date().toISOString(),
        sourceManifestVersion: manifest.manifestVersion,
        sourceCommit: manifest.sourceCommit,
      }),
      pageSetSchemaVersion: 'studio-world-project-page-set@2',
    },
  };
}

export function groupExperiencePagesForSelector(
  pageSet: ProjectWebsitePageSet,
  mode: 'PRIMARY' | 'ALL_DESIGNABLE' | 'WORKSPACE',
): Record<string, ExperiencePageRecord[]> {
  const pages = pageSet.experiencePages ?? [];
  const filtered =
    mode === 'PRIMARY'
      ? pages.filter((p) => p.founderPrimary)
      : mode === 'WORKSPACE'
        ? pages.filter((p) => p.experienceType === 'WORKSPACE_PAGE')
        : pages.filter((p) => p.founderDesignable);

  const groups: Record<string, ExperiencePageRecord[]> = {};
  for (const p of filtered) {
    const section = pageSet.experienceSections?.find((s) => s.sectionId === p.sectionId);
    const key = section?.displayName ?? p.sectionId;
    const list = groups[key] ?? [];
    list.push(p);
    groups[key] = list;
  }
  return groups;
}

export { SITE00_P0_VR_3D_BASELINE_COUNT };
