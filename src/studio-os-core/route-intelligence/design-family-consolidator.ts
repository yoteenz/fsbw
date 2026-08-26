import type {
  DesignFamilyDifferenceProfile,
  DesignFamilyRecord,
  DesignScreenRecord,
  ProjectPageRouteRecord,
  ProjectVisualStateRecord,
  RouteFamily,
} from './types';

type FamilyRule = {
  id: string;
  displayName: string;
  routeFamily: RouteFamily;
  shellAuthority: string;
  layoutAuthority: string;
  match: (screen: DesignScreenRecord, routes: Map<string, ProjectPageRouteRecord>) => boolean;
  groupingReason: string;
  sharedDimensions: DesignFamilyDifferenceProfile['dimensionsShared'];
  differingDimensions: DesignFamilyDifferenceProfile['dimensionsDiffering'];
};

const FS_FAMILY_RULES: FamilyRule[] = [
  {
    id: 'product-page',
    displayName: 'Product Page',
    routeFamily: 'COMMERCE',
    shellAuthority: 'ProductPDPShell',
    layoutAuthority: 'pages/product',
    match: (s) => !!s.routeTemplateId?.includes('product-pdp') || s.displayName === 'Product Page',
    groupingReason: 'Shared PDP shell — product imagery differs per unit',
    sharedDimensions: ['SHELL', 'LAYOUT', 'NAVIGATION', 'TYPOGRAPHY', 'INTERACTION', 'RESPONSIVE_BEHAVIOR'],
    differingDimensions: ['ARTWORK', 'CONTENT_DENSITY'],
  },
  {
    id: 'build-a-wig',
    displayName: 'Build-a-Wig',
    routeFamily: 'COMMERCE',
    shellAuthority: 'BuildAWigWorkflowShell',
    layoutAuthority: 'pages/build-a-wig',
    match: (s) =>
      !!s.routeTemplateId?.match(/baw-/) ||
      s.displayName.includes('Build-a-Wig') ||
      s.representativeRoute.includes('/build-a-wig'),
    groupingReason: 'BAW workflow shares step architecture — unique refs per visual composition group only',
    sharedDimensions: ['SHELL', 'NAVIGATION', 'INTERACTION', 'RESPONSIVE_BEHAVIOR'],
    differingDimensions: ['LAYOUT', 'PAGE_PURPOSE', 'CONTENT_DENSITY'],
  },
  {
    id: 'baw-hub',
    displayName: 'Build-a-Wig Hub',
    routeFamily: 'COMMERCE',
    shellAuthority: 'BuildAWigHubShell',
    layoutAuthority: 'pages/build-a-wig',
    match: () => false,
    groupingReason: 'merged into build-a-wig',
    sharedDimensions: ['SHELL'],
    differingDimensions: [],
  },
  {
    id: 'baw-customization',
    displayName: 'Build-a-Wig Customization',
    routeFamily: 'COMMERCE',
    shellAuthority: 'BuildAWigStepShell',
    layoutAuthority: 'pages/build-a-wig/customize',
    match: () => false,
    groupingReason: 'merged into build-a-wig',
    sharedDimensions: ['SHELL'],
    differingDimensions: [],
  },
  {
    id: 'baw-edit',
    displayName: 'Build-a-Wig Edit',
    routeFamily: 'COMMERCE',
    shellAuthority: 'BuildAWigStepShell',
    layoutAuthority: 'pages/build-a-wig/edit',
    match: () => false,
    groupingReason: 'merged into build-a-wig',
    sharedDimensions: ['SHELL'],
    differingDimensions: [],
  },
  {
    id: 'checkout-commerce',
    displayName: 'Checkout & Cart',
    routeFamily: 'COMMERCE',
    shellAuthority: 'CommerceCheckoutShell',
    layoutAuthority: 'pages/checkout',
    match: (s, routes) => {
      const rep = routes.get(s.representativeRouteId);
      return !!rep?.route.match(/^\/(checkout|bag)/);
    },
    groupingReason: 'Commerce checkout/cart shell family',
    sharedDimensions: ['SHELL', 'NAVIGATION', 'TYPOGRAPHY'],
    differingDimensions: ['LAYOUT', 'PAGE_PURPOSE'],
  },
  {
    id: 'mansion-room',
    displayName: 'Mansion / Desktop Room',
    routeFamily: 'TOOLS',
    shellAuthority: 'ImmersiveRoomShell',
    layoutAuthority: 'pages/desktop',
    match: (s) => !!s.routeTemplateId?.includes('desktop-room'),
    groupingReason: 'Immersive room shell — environment assets differ',
    sharedDimensions: ['SHELL', 'NAVIGATION', 'INTERACTION'],
    differingDimensions: ['ARTWORK', 'COLOR'],
  },
  {
    id: 'account-shell',
    displayName: 'Account',
    routeFamily: 'ACCOUNT',
    shellAuthority: 'AccountShell',
    layoutAuthority: 'pages/account',
    match: (s, routes) => {
      const rep = routes.get(s.representativeRouteId);
      return rep?.routeFamily === 'ACCOUNT' || !!rep?.route.match(/^\/account/);
    },
    groupingReason: 'Account area shared navigation shell',
    sharedDimensions: ['SHELL', 'NAVIGATION', 'TYPOGRAPHY'],
    differingDimensions: ['LAYOUT', 'PAGE_PURPOSE', 'CONTENT_DENSITY'],
  },
  {
    id: 'shop-commerce',
    displayName: 'Shop & Browse',
    routeFamily: 'COMMERCE',
    shellAuthority: 'ShopShell',
    layoutAuthority: 'pages/shop',
    match: (s, routes) => {
      const rep = routes.get(s.representativeRouteId);
      return !!rep?.route.match(/^\/home\/shop|^\/shop/);
    },
    groupingReason: 'Shop browse grid shell',
    sharedDimensions: ['SHELL', 'LAYOUT', 'NAVIGATION'],
    differingDimensions: ['CONTENT_DENSITY'],
  },
  {
    id: 'marketing-info',
    displayName: 'Marketing Info Page',
    routeFamily: 'MARKETING',
    shellAuthority: 'MarketingPageShell',
    layoutAuthority: 'pages/marketing',
    match: (s, routes) => {
      const rep = routes.get(s.representativeRouteId);
      return (
        (rep?.routeFamily === 'MARKETING' || rep?.routeFamily === 'CONTENT') &&
        !!rep.route.match(/\/(about|faq|contact|guide|brand|story|legal|privacy|terms)/i)
      );
    },
    groupingReason: 'Static marketing/info pages — content-only differences',
    sharedDimensions: ['SHELL', 'LAYOUT', 'NAVIGATION', 'TYPOGRAPHY', 'RESPONSIVE_BEHAVIOR'],
    differingDimensions: ['PAGE_PURPOSE'],
  },
];

const SITE00_FAMILY_RULES: FamilyRule[] = [
  {
    id: 'site00-assessment',
    displayName: 'Assessment Step',
    routeFamily: 'ONBOARDING',
    shellAuthority: 'Site00AssessmentShell',
    layoutAuthority: 'site00/assessment',
    match: (s) => !!s.routeTemplateId?.includes('site00-assessment'),
    groupingReason: 'SITE 00 assessment stages share shell',
    sharedDimensions: ['SHELL', 'LAYOUT', 'NAVIGATION', 'INTERACTION'],
    differingDimensions: ['PAGE_PURPOSE', 'STATE'],
  },
  {
    id: 'site00-info',
    displayName: 'SITE 00 Info Page',
    routeFamily: 'CONTENT',
    shellAuthority: 'Site00PublicShell',
    layoutAuthority: 'site00/pages',
    match: (s, routes) => {
      const rep = routes.get(s.representativeRouteId);
      return !!rep?.route.match(/^\/(guide|about|faq|contact|origin|idnty|bldr)(\/|$)/) && !s.routeTemplateId;
    },
    groupingReason: 'SITE 00 informational pages — copy differs',
    sharedDimensions: ['SHELL', 'LAYOUT', 'NAVIGATION', 'TYPOGRAPHY'],
    differingDimensions: ['PAGE_PURPOSE'],
  },
];

const AIO_FAMILY_RULES: FamilyRule[] = [
  {
    id: 'aio-portal',
    displayName: 'Customer Portal',
    routeFamily: 'ACCOUNT',
    shellAuthority: 'AioPortalShell',
    layoutAuthority: 'portal',
    match: (s) => !!s.routeTemplateId?.includes('aio-portal'),
    groupingReason: 'AIO portal sections share shell',
    sharedDimensions: ['SHELL', 'NAVIGATION', 'LAYOUT'],
    differingDimensions: ['PAGE_PURPOSE', 'CONTENT_DENSITY'],
  },
  {
    id: 'aio-office',
    displayName: 'Office Section',
    routeFamily: 'ADMIN',
    shellAuthority: 'AioOfficeShell',
    layoutAuthority: 'office',
    match: (s) => !!s.routeTemplateId?.includes('aio-office'),
    groupingReason: 'AIO office role shell — do not merge across roles',
    sharedDimensions: ['SHELL', 'NAVIGATION'],
    differingDimensions: ['LAYOUT', 'PAGE_PURPOSE'],
  },
  {
    id: 'aio-public-service',
    displayName: 'Public Service Page',
    routeFamily: 'MARKETING',
    shellAuthority: 'AioPublicShell',
    layoutAuthority: 'pages/public',
    match: (s, routes) => {
      const rep = routes.get(s.representativeRouteId);
      return rep?.routeFamily === 'MARKETING' && !s.routeTemplateId;
    },
    groupingReason: 'AIO public marketing pages',
    sharedDimensions: ['SHELL', 'LAYOUT', 'TYPOGRAPHY'],
    differingDimensions: ['PAGE_PURPOSE'],
  },
];

const NDXBOOK_FAMILY_RULES: FamilyRule[] = [
  {
    id: 'ndxbook-workspace',
    displayName: 'NDXBOOK Workspace Tab',
    routeFamily: 'WORKSPACE',
    shellAuthority: 'NdxbookWorkspaceShell',
    layoutAuthority: 'admin/studio/ndxbook',
    match: (s) => s.routeFamily === 'WORKSPACE',
    groupingReason: 'NDXBOOK workspace tabs — validate each tab visual authority',
    sharedDimensions: ['NAVIGATION'],
    differingDimensions: ['LAYOUT', 'PAGE_PURPOSE', 'ARTWORK'],
  },
];

function rulesForProject(projectId: string): FamilyRule[] {
  switch (projectId) {
    case 'frontal-slayer':
      return FS_FAMILY_RULES;
    case 'site00':
      return SITE00_FAMILY_RULES;
    case 'all-in-one-enterprise':
      return AIO_FAMILY_RULES;
    case 'ndxbook':
      return NDXBOOK_FAMILY_RULES;
    default:
      return [];
  }
}

function familyId(projectId: string, ruleId: string): string {
  return `${projectId}:dfamily:${ruleId}`;
}

function singletonFamilyId(projectId: string, screenId: string): string {
  return `${projectId}:dfamily:singleton:${screenId}`;
}

function pickRepresentativeScreen(screens: DesignScreenRecord[]): DesignScreenRecord {
  const order = { CRITICAL: 0, PRIMARY: 1, SECONDARY: 2, SUPPORTING: 3, INTERNAL: 4 };
  return [...screens].sort((a, b) => {
    const priDiff = order[a.priority] - order[b.priority];
    if (priDiff !== 0) return priDiff;
    if (b.instanceCount !== a.instanceCount) return b.instanceCount - a.instanceCount;
    return a.representativeRoute.length - b.representativeRoute.length;
  })[0]!;
}

function detectReferenceConflict(screens: DesignScreenRecord[]): boolean {
  const refIds = new Set<string>();
  for (const s of screens) {
    for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
      const id = s.referenceCoverage?.[vp]?.referenceId;
      if (id) refIds.add(`${vp}:${id}`);
    }
  }
  const mobileRefs = screens
    .map((s) => s.referenceCoverage?.mobile.referenceId)
    .filter(Boolean);
  return new Set(mobileRefs).size > 1;
}

export function resolveFamilyKeyForScreen(
  screen: DesignScreenRecord,
  routes: Map<string, ProjectPageRouteRecord>,
  projectId: string,
): { rule: FamilyRule | null; singleton: boolean } {
  for (const rule of rulesForProject(projectId)) {
    if (rule.match(screen, routes)) return { rule, singleton: false };
  }
  return { rule: null, singleton: true };
}

export function buildDesignFamilies(
  screens: DesignScreenRecord[],
  routes: ProjectPageRouteRecord[],
  visualStates: ProjectVisualStateRecord[],
  projectId: string,
): DesignFamilyRecord[] {
  const projectScreens = screens.filter((s) => s.projectId === projectId);
  const routeMap = new Map(routes.filter((r) => r.projectId === projectId).map((r) => [r.routeId, r]));
  const buckets = new Map<string, { rule: FamilyRule | null; screens: DesignScreenRecord[] }>();

  for (const screen of projectScreens) {
    const { rule } = resolveFamilyKeyForScreen(screen, routeMap, projectId);
    const key = rule ? familyId(projectId, rule.id) : singletonFamilyId(projectId, screen.designScreenId);
    const bucket = buckets.get(key) ?? { rule, screens: [] };
    bucket.screens.push(screen);
    buckets.set(key, bucket);
  }

  const families: DesignFamilyRecord[] = [];

  for (const [fid, { rule, screens: members }] of buckets) {
    const rep = pickRepresentativeScreen(members);
    const conflict = detectReferenceConflict(members);
    const confidence: DesignFamilyRecord['confidence'] =
      rule && members.length > 1 ? 'HIGH' : rule ? 'MEDIUM' : 'HIGH';

    const profile: DesignFamilyDifferenceProfile = rule
      ? { dimensionsShared: rule.sharedDimensions, dimensionsDiffering: rule.differingDimensions, notes: [rule.groupingReason] }
      : {
          dimensionsShared: ['SHELL', 'LAYOUT'],
          dimensionsDiffering: ['PAGE_PURPOSE'],
          notes: ['Singleton screen — unique visual family'],
        };

    for (const m of members) {
      m.designFamilyId = fid;
    }

    families.push({
      designFamilyId: fid,
      projectId,
      displayName: rule?.displayName ?? rep.displayName,
      routeFamily: rule?.routeFamily ?? rep.routeFamily,
      memberDesignScreenIds: members.map((m) => m.designScreenId),
      representativeScreenId: rep.designScreenId,
      representativeRoute: rep.representativeRoute,
      shellAuthority: rule?.shellAuthority ?? rep.displayName,
      layoutAuthority: rule?.layoutAuthority ?? rep.representativeRoute,
      visualDifferenceDimensions: profile,
      referencePolicy: rule?.id === 'product-page' ? 'ASSET_ONLY_VARIANT' : 'SHARED_FAMILY_REFERENCE',
      inheritancePolicy: conflict ? 'FOUNDER_REVIEW_REQUIRED' : 'AUTO_INHERIT_HIGH_CONFIDENCE',
      confidence,
      status: conflict ? 'FOUNDER_REVIEW_REQUIRED' : 'ACTIVE',
      groupingReason: rule?.groupingReason ?? 'Unique screen — no consolidation',
      referenceFamilyConflict: conflict,
      version: 1,
      history: [{ version: 1, memberDesignScreenIds: members.map((m) => m.designScreenId) }],
    });
  }

  // Visual states inherit parent screen family
  for (const vs of visualStates.filter((v) => v.projectId === projectId)) {
    const parentRoute = routes.find((r) => r.routeId === vs.parentRouteId);
    if (parentRoute?.designScreenId) {
      const parentScreen = projectScreens.find((s) => s.designScreenId === parentRoute.designScreenId);
      if (parentScreen?.designFamilyId) {
        /* state tracked via necessity auditor */
      }
    }
  }

  return families.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/** Merge singleton marketing/content screens into route-family batches (second pass) */
export function mergeRouteFamilySingletons(
  families: DesignFamilyRecord[],
  screens: DesignScreenRecord[],
  projectId: string,
): DesignFamilyRecord[] {
  const singletonBatchFamilies = ['MARKETING', 'CONTENT', 'SUPPORT'] as const;
  const updated = [...families];
  for (const rf of singletonBatchFamilies) {
    const singletons = updated.filter(
      (f) =>
        f.projectId === projectId &&
        f.memberDesignScreenIds.length === 1 &&
        f.routeFamily === rf,
    );
    if (singletons.length < 3) continue;
    const batchId = `${projectId}:dfamily:${rf.toLowerCase()}-batch`;
    const members = singletons.flatMap((f) => f.memberDesignScreenIds);
    const memberScreens = screens.filter((s) => members.includes(s.designScreenId));
    const rep = pickRepresentativeScreen(memberScreens);
    updated.push({
      designFamilyId: batchId,
      projectId,
      displayName: `${rf} Pages`,
      routeFamily: rf,
      memberDesignScreenIds: members,
      representativeScreenId: rep.designScreenId,
      representativeRoute: rep.representativeRoute,
      shellAuthority: 'MarketingPageShell',
      layoutAuthority: `pages/${rf.toLowerCase()}`,
      visualDifferenceDimensions: {
        dimensionsShared: ['SHELL', 'LAYOUT', 'NAVIGATION', 'TYPOGRAPHY'],
        dimensionsDiffering: ['PAGE_PURPOSE'],
        notes: ['Route-family batch — content-only differences'],
      },
      referencePolicy: 'CONTENT_ONLY_VARIANT',
      inheritancePolicy: 'AUTO_INHERIT_HIGH_CONFIDENCE',
      confidence: 'MEDIUM',
      status: 'ACTIVE',
      groupingReason: `Batch merged ${singletons.length} ${rf} singleton screens`,
      referenceFamilyConflict: false,
      version: 1,
    });
    for (const s of memberScreens) s.designFamilyId = batchId;
    for (const f of singletons) {
      const idx = updated.indexOf(f);
      if (idx >= 0) updated.splice(idx, 1);
    }
  }
  return updated;
}

export function buildAllDesignFamilies(
  screens: DesignScreenRecord[],
  routes: ProjectPageRouteRecord[],
  visualStates: ProjectVisualStateRecord[],
  projectIds: string[],
): DesignFamilyRecord[] {
  return projectIds.flatMap((pid) => {
    const base = buildDesignFamilies(screens, routes, visualStates, pid);
    return mergeRouteFamilySingletons(base, screens, pid);
  });
}
