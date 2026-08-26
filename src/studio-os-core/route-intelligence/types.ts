import type {
  DESIGNABLE_SURFACE_CLASSES,
  DESIGN_FAMILY_CONFIDENCE_LEVELS,
  DESIGN_FAMILY_STATUSES,
  DESIGN_ROUTE_PRIORITIES,
  FAILURE_TAXONOMY,
  INHERITANCE_STATUSES,
  REFERENCE_AUTHORITY_LEVELS,
  REFERENCE_NECESSITY_CLASSES,
  ROUTE_ALIAS_CLASSES,
  ROUTE_ENTRY_EVIDENCE_TYPES,
  ROUTE_FAMILIES,
  ROUTE_REACHABILITY_CLASSES,
  PROJECT_WEBSITE_EXPERIENCE_CLASSES,
  COMPILED_PAGE_STATUSES,
  PAGE_COMPILATION_CONFIDENCE_LEVELS,
  CUSTOMER_JOURNEY_STAGES,
  EXPERIENCE_PAGE_ABSTRACTION_CONFIDENCE_LEVELS,
  EXPERIENCE_PAGE_TYPES,
  MATERIAL_SCREEN_STEP_TYPES,
  VIEWPORT_CLASSES,
} from './constants';

export type ViewportClass = (typeof VIEWPORT_CLASSES)[number];
export type RouteFamily = (typeof ROUTE_FAMILIES)[number];
export type DesignRoutePriority = (typeof DESIGN_ROUTE_PRIORITIES)[number];
export type DesignableSurfaceClass = (typeof DESIGNABLE_SURFACE_CLASSES)[number];
export type FailureTaxonomy = (typeof FAILURE_TAXONOMY)[number];
export type RouteReachabilityClassification = (typeof ROUTE_REACHABILITY_CLASSES)[number];
export type RouteEntryEvidenceType = (typeof ROUTE_ENTRY_EVIDENCE_TYPES)[number];
export type RouteAliasClass = (typeof ROUTE_ALIAS_CLASSES)[number];
export type ReferenceNecessityClassification = (typeof REFERENCE_NECESSITY_CLASSES)[number];
export type DesignFamilyConfidence = (typeof DESIGN_FAMILY_CONFIDENCE_LEVELS)[number];
export type DesignFamilyStatus = (typeof DESIGN_FAMILY_STATUSES)[number];
export type InheritanceStatus = (typeof INHERITANCE_STATUSES)[number];
export type ReferenceAuthorityLevel = (typeof REFERENCE_AUTHORITY_LEVELS)[number];
export type ProjectWebsiteExperienceClassification = (typeof PROJECT_WEBSITE_EXPERIENCE_CLASSES)[number];
export type CompiledPageStatus = (typeof COMPILED_PAGE_STATUSES)[number];
export type PageCompilationConfidence = (typeof PAGE_COMPILATION_CONFIDENCE_LEVELS)[number];
export type CustomerJourneyStage = (typeof CUSTOMER_JOURNEY_STAGES)[number];
export type ExperiencePageAbstractionConfidence = (typeof EXPERIENCE_PAGE_ABSTRACTION_CONFIDENCE_LEVELS)[number];
export type ExperiencePageType = (typeof EXPERIENCE_PAGE_TYPES)[number];
export type MaterialScreenStepType = (typeof MATERIAL_SCREEN_STEP_TYPES)[number];

export type RouteType =
  | 'PAGE'
  | 'WORKSPACE'
  | 'FLOW'
  | 'STEP'
  | 'DETAIL'
  | 'INDEX'
  | 'MODAL'
  | 'OVERLAY'
  | 'MENU_STATE'
  | 'INTERACTION_STATE';

export type RouteStatus =
  | 'ACTIVE'
  | 'LEGACY'
  | 'SUPERSEDED'
  | 'EXPERIMENTAL'
  | 'UNKNOWN'
  | 'DEPRECATED'
  | 'REQUIRED_MISSING_ROUTE'
  | 'IMPLIED_REQUIRED_ROUTE'
  | 'ORPHANED'
  | 'POSSIBLY_DEAD'
  | 'HISTORICAL_ROUTE';

export type DesignStatus =
  | 'MISSING_REFERENCE'
  | 'REFERENCE_DRAFT'
  | 'REFERENCE_CANONICAL'
  | 'NOT_IMPLEMENTED'
  | 'IMPLEMENTED_UNMATCHED'
  | 'NEEDS_REBUILD'
  | 'MATCHING'
  | 'FOUNDER_REVIEW'
  | 'MATCHED'
  | 'STALE_AGAINST_REFERENCE'
  | 'BLOCKED';

export type ReferenceQualityStatus =
  | 'CANONICAL_GOOD'
  | 'USABLE'
  | 'PARTIAL'
  | 'LOW_RESOLUTION'
  | 'OUTDATED'
  | 'WRONG_SHELL'
  | 'WRONG_VIEWPORT'
  | 'INCOMPLETE'
  | 'SHOULD_REPLACE';

export type ImplementationCoverageStatus =
  | 'IMPLEMENTATION_PRESENT'
  | 'IMPLEMENTATION_PARTIAL'
  | 'IMPLEMENTATION_BROKEN'
  | 'IMPLEMENTATION_MISSING'
  | 'IMPLEMENTATION_UNKNOWN';

export type ResponsiveLayoutMode =
  | 'DEDICATED_MOBILE_LAYOUT'
  | 'DEDICATED_TABLET_LAYOUT'
  | 'DEDICATED_DESKTOP_LAYOUT'
  | 'RESPONSIVE_INTERPOLATION'
  | 'UNKNOWN';

export type DependencyClosureStatus =
  | 'COMPLETE'
  | 'INCOMPLETE'
  | 'MISSING_ROUTE'
  | 'BROKEN_LINK'
  | 'ORPHANED'
  | 'UNREACHABLE';

export type ReferenceGenerationStatus =
  | 'READY_TO_GENERATE'
  | 'QUEUED'
  | 'GENERATING'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'FAILED'
  | 'BLOCKED';

export type RouteEvidenceSource =
  | 'router'
  | 'navigation'
  | 'link'
  | 'redirect'
  | 'test'
  | 'component'
  | 'notification'
  | 'deep-link'
  | 'route-constant'
  | 'manifest';

export type StudioWorldProjectRecord = {
  projectId: string;
  displayName: string;
  slug: string;
  hostBrand: 'host' | 'client';
  rootRoute: string;
  repoAuthority: 'fsbw' | 'site00-standalone' | 'aio-standalone';
  brandConfig?: Record<string, unknown>;
  projectAccent?: string;
  routeNamespace: string;
  designable: boolean;
  status: 'active' | 'planned' | 'deprecated';
  routerSystems: string[];
};

export type RouteEntryEvidence = {
  type: RouteEntryEvidenceType;
  file?: string;
  line?: number;
  detail?: string;
  targetRoute?: string;
};

export type RouteEvidence = {
  source: RouteEvidenceSource;
  file?: string;
  line?: number;
  detail?: string;
};

export type ProjectPageRouteRecord = {
  routeId: string;
  projectId: string;
  route: string;
  routePattern: string;
  displayName: string;
  routeType: RouteType;
  routeFamily: RouteFamily;
  priority: DesignRoutePriority;
  designableSurface: DesignableSurfaceClass;
  parentRouteId?: string;
  childRouteIds: string[];
  sourceFile?: string;
  component?: string;
  layoutOwner?: string;
  existsInRouter: boolean;
  reachableFromUI: boolean;
  deepLinkOnly: boolean;
  redirect?: string;
  deprecated: boolean;
  authRequired: boolean;
  isTemplate: boolean;
  status: RouteStatus;
  evidence: RouteEvidence[];
  responsiveLayout: ResponsiveLayoutMode;
  /** P0.VR.3B — multi-signal reachability (not static-link-only) */
  reachabilityClassification: RouteReachabilityClassification;
  entryEvidence: RouteEntryEvidence[];
  /** Maps to a design screen when normalized */
  designScreenId?: string;
  routeTemplateId?: string;
  aliasClass?: RouteAliasClass;
  implementationRouteKind: 'IMPLEMENTATION_ROUTE' | 'DESIGN_SCREEN';
};

export type ProjectVisualStateRecord = {
  visualStateId: string;
  routeId: string;
  projectId: string;
  label: string;
  stateType: 'MODAL' | 'DRAWER' | 'MENU' | 'PANEL' | 'STEP' | 'EMPTY' | 'ERROR' | 'LOADING' | 'OTHER';
  parentRouteId: string;
  designableSurface: DesignableSurfaceClass;
};

export type ViewportVisualAuthority = {
  viewportClass: ViewportClass;
  referenceWidth: number;
  referenceHeight: number;
  referenceId?: string;
  referencePath?: string;
  implementationStatus: ImplementationCoverageStatus;
  designStatus: DesignStatus;
  referenceQuality?: ReferenceQualityStatus;
  responsiveLayout: ResponsiveLayoutMode;
};

export type PageVisualCoverageRecord = {
  projectId: string;
  routeId: string;
  visualStateId?: string;
  mobile: ViewportVisualAuthority;
  tablet: ViewportVisualAuthority;
  desktop: ViewportVisualAuthority;
};

export type MissingRequiredRoute = {
  routePattern: string;
  requestedBy: string[];
  parentFlow: string;
  expectedPurpose: string;
  evidence: RouteEvidence[];
  recommendedAction: string;
};

export type ImpliedRequiredRoute = {
  routePattern: string;
  parentFlow: string;
  expectedPurpose: string;
  evidence: RouteEvidence[];
};

export type DependencyClosure = {
  flowId: string;
  flowLabel: string;
  projectId: string;
  routeIds: string[];
  status: DependencyClosureStatus;
  missingRoutePatterns: string[];
  brokenLinks: string[];
};

export type ProjectRouteDependencyGraph = {
  projectId: string;
  nodes: ProjectPageRouteRecord[];
  edges: Array<{ fromRouteId: string; toRouteId: string; relation: 'requires' | 'navigates' | 'redirects' | 'child' }>;
  closures: DependencyClosure[];
  missingRequired: MissingRequiredRoute[];
  impliedRequired: ImpliedRequiredRoute[];
  orphanedRouteIds: string[];
  duplicateGroups: Array<{ authority: RouteStatus; routeIds: string[]; note: string }>;
};

export type ReferenceQualityEvaluation = {
  referenceId: string;
  routeId: string;
  viewportClass: ViewportClass;
  status: ReferenceQualityStatus;
  reasons: string[];
};

export type RouteAuditProbeResult = {
  routeId: string;
  route: string;
  viewportClass: ViewportClass;
  httpStatus?: number;
  componentMounted: boolean;
  authBlocker: boolean;
  runtimeError?: string;
  redirect?: string;
  blankScreen: boolean;
};

export type ProjectCompletenessScores = {
  projectId: string;
  routeCompletenessScore: number;
  visualReferenceCoverageScore: number;
  implementationCoverageScore: number;
  viewportCoverageScore: number;
  designableRouteCount: number;
  totalRouteCount: number;
};

export type DynamicRouteTemplateGroup = {
  templateId: string;
  projectId: string;
  routePattern: string;
  displayName: string;
  routeFamily: RouteFamily;
  instanceRouteIds: string[];
  representativeRouteId: string;
  representativeRoute: string;
  sharedVisualShell: boolean;
  perInstanceOverrideAllowed: boolean;
};

export type DesignScreenRecord = {
  designScreenId: string;
  projectId: string;
  displayName: string;
  routeFamily: RouteFamily;
  priority: DesignRoutePriority;
  implementationRouteIds: string[];
  routeTemplateId?: string;
  representativeRoute: string;
  representativeRouteId: string;
  instanceCount: number;
  instanceRoutes: string[];
  perInstanceOverrideRouteIds: string[];
  visualStateIds: string[];
  viewportCoverage?: PageVisualCoverageRecord;
  referenceCoverage?: PageVisualCoverageRecord;
  reachabilitySummary: Partial<Record<RouteReachabilityClassification, number>>;
  referenceFamilyConflict: boolean;
  /** P0.VR.3C — design family assignment */
  designFamilyId?: string;
};

export type DesignFamilyDifferenceDimension =
  | 'SHELL'
  | 'LAYOUT'
  | 'TYPOGRAPHY'
  | 'NAVIGATION'
  | 'CONTENT_DENSITY'
  | 'ARTWORK'
  | 'COLOR'
  | 'INTERACTION'
  | 'STATE'
  | 'RESPONSIVE_BEHAVIOR'
  | 'PAGE_PURPOSE';

export type DesignFamilyDifferenceProfile = {
  dimensionsDiffering: DesignFamilyDifferenceDimension[];
  dimensionsShared: DesignFamilyDifferenceDimension[];
  notes: string[];
};

export type DesignFamilyRecord = {
  designFamilyId: string;
  projectId: string;
  displayName: string;
  routeFamily: RouteFamily;
  memberDesignScreenIds: string[];
  representativeScreenId: string;
  representativeRoute: string;
  shellAuthority: string;
  layoutAuthority: string;
  visualDifferenceDimensions: DesignFamilyDifferenceProfile;
  referencePolicy: ReferenceNecessityClassification;
  inheritancePolicy: 'AUTO_INHERIT_HIGH_CONFIDENCE' | 'FOUNDER_REVIEW_REQUIRED';
  confidence: DesignFamilyConfidence;
  status: DesignFamilyStatus;
  groupingReason: string;
  referenceFamilyConflict: boolean;
  version: number;
  history?: Array<{ version: number; memberDesignScreenIds: string[]; splitFrom?: string; mergedFrom?: string[] }>;
};

export type DesignFamilyReferenceAuthority = {
  designFamilyId: string;
  viewportClass: ViewportClass;
  canonicalReferenceId?: string;
  representativeScreenId: string;
  referenceVersion: number;
  status: DesignStatus;
};

export type DesignScreenReferenceInheritance = {
  designScreenId: string;
  designFamilyId: string;
  viewportClass: ViewportClass;
  inheritFromFamily: boolean;
  overrideReferenceId?: string;
  inheritanceStatus: InheritanceStatus;
  reason: string;
};

export type ReferenceNecessityAuditRecord = {
  designScreenId: string;
  projectId: string;
  viewportClass: ViewportClass;
  classification: ReferenceNecessityClassification;
  designFamilyId: string;
  confidence: DesignFamilyConfidence;
  currentReferenceId?: string;
  recommendedReferenceId?: string;
  reason: string;
  estimatedGenerationAvoided: boolean;
};

export type EffectiveDesignReference = {
  referenceId?: string;
  authorityLevel: ReferenceAuthorityLevel;
  designFamilyId?: string;
  designScreenId: string;
  viewportClass: ViewportClass;
  inheritancePath: string[];
  necessityClassification: ReferenceNecessityClassification;
};

export type ReferenceGenerationSavings = {
  projectId: string;
  designScreensBefore: number;
  designFamiliesAfter: number;
  potentialScreenViewportJobs: number;
  uniqueReferencesRequired: number;
  familyReferencesReused: number;
  generationRequestsAvoided: number;
  byNecessity: Partial<Record<ReferenceNecessityClassification, number>>;
  byViewport: {
    MOBILE: { unique: number; family: number; other: number };
    TABLET: { unique: number; family: number; other: number };
    DESKTOP: { unique: number; family: number; other: number };
  };
};

export type ReachabilitySummary = {
  projectId: string;
  navReachable: number;
  programmaticReachable: number;
  workflowReachable: number;
  authGated: number;
  deepLinkSupported: number;
  legacy: number;
  unknown: number;
  trueOrphan: number;
  dynamicInstance: number;
  adminReachable: number;
  testOnly: number;
};

export type DesignCoverageSummary = {
  projectId: string;
  /** Primary founder-facing count — design screens, not raw routes */
  totalDesignableScreens: number;
  rawImplementationRoutes: number;
  normalizedRouteTemplates: number;
  trueOrphanCount: number;
  mobile: { canonical: number; missing: number; stale: number; matched: number };
  tablet: { canonical: number; missing: number; stale: number; matched: number };
  desktop: { canonical: number; missing: number; stale: number; matched: number };
  needsReference: number;
  needsImprovement: number;
  brokenRoutes: number;
  possibleDeadRoutes: number;
  /** P0.VR.3C */
  designFamilies?: number;
  uniqueReferencesRequired?: number;
  generationRequestsAvoided?: number;
};

export type DesignRouteSyncContract = {
  schemaVersion: string;
  projectId: string;
  routeId: string;
  route: string;
  displayName: string;
  routeFamily: RouteFamily;
  priority: DesignRoutePriority;
  dependencies: string[];
  visualStates: ProjectVisualStateRecord[];
  viewportCoverage: PageVisualCoverageRecord;
  referenceCoverage: PageVisualCoverageRecord;
  implementationCoverage: PageVisualCoverageRecord;
  recommendedAction: string;
  sourceAuthority: string;
  designableSurface: DesignableSurfaceClass;
  status: RouteStatus;
};

export type StudioWorldDesignRouteManifest = {
  manifestVersion: string;
  schemaVersion: string;
  generatedAt: string;
  sourceCommit: string;
  sourceRepo: string;
  projects: StudioWorldProjectRecord[];
  /** All discovered implementation routes (Inspect authority) */
  rawImplementationRoutes: ProjectPageRouteRecord[];
  /** @deprecated use rawImplementationRoutes — v1 compat alias */
  routes: ProjectPageRouteRecord[];
  routeTemplates: DynamicRouteTemplateGroup[];
  designScreens: DesignScreenRecord[];
  designFamilies: DesignFamilyRecord[];
  referenceNecessityAudits: ReferenceNecessityAuditRecord[];
  familyReferenceAuthorities: DesignFamilyReferenceAuthority[];
  screenReferenceInheritances: DesignScreenReferenceInheritance[];
  referenceGenerationSavings: ReferenceGenerationSavings[];
  visualStates: ProjectVisualStateRecord[];
  dependencyGraphs: ProjectRouteDependencyGraph[];
  coverage: PageVisualCoverageRecord[];
  syncContracts: DesignRouteSyncContract[];
  coverageSummaries: DesignCoverageSummary[];
  completenessScores: ProjectCompletenessScores[];
  reachabilitySummaries: ReachabilitySummary[];
  failures: FailureTaxonomy[];
  forensicReportId: string;
  referenceMigration?: {
    preservedRouteIds: string[];
    mappedToDesignScreens: Record<string, string>;
    conflicts: string[];
    deleted: string[];
  };
  projectPageSets: ProjectWebsitePageSet[];
  pageSetCompilation?: ProjectPageSetCompilationMeta;
  pageSetOverrides?: PageSetOverrideRecord[];
  experienceSections?: ExperienceSectionRecord[];
  experiencePages?: ExperiencePageRecord[];
  materialScreens?: MaterialScreenRecord[];
  pageInstances?: ExperiencePageInstanceRecord[];
  experiencePageOverrides?: ExperiencePageOverrideRecord[];
  experiencePageCompilation?: ExperiencePageCompilationMeta;
};

export type CrossProjectRouteForensicReport = {
  reportId: string;
  generatedAt: string;
  sourceCommit: string;
  sourceRepo: string;
  projectsDiscovered: StudioWorldProjectRecord[];
  routesDiscovered: number;
  designableRoutes: number;
  visualStateCount: number;
  dynamicTemplateCount: number;
  authenticatedRouteCount: number;
  orphanedCount: number;
  deprecatedCount: number;
  missingDependencyCount: number;
  impliedRouteCount: number;
  dependencyGraphs: ProjectRouteDependencyGraph[];
  coverageSummaries: DesignCoverageSummary[];
  referenceQuality: ReferenceQualityEvaluation[];
  failures: FailureTaxonomy[];
  perProject: Array<{
    projectId: string;
    rawImplementationRoutes: number;
    normalizedRouteTemplates: number;
    designScreens: number;
    routesDiscovered: number;
    designableRoutes: number;
    visualStates: number;
    dynamicTemplates: number;
    authenticatedRoutes: number;
    orphaned: number;
    trueOrphans: number;
    deprecated: number;
    missingDependencies: number;
    impliedRoutes: number;
    navReachable: number;
    programmaticReachable: number;
    workflowReachable: number;
    authGated: number;
    deepLinkSupported: number;
    legacy: number;
    unknown: number;
    previousOrphanCount?: number;
    /** P0.VR.3C */
    designFamilies?: number;
    uniqueReferencesRequired?: number;
    generationRequestsAvoided?: number;
  }>;
};

export type DesignRouteManifestDiffType =
  | 'PROJECT_ADDED'
  | 'ROUTE_ADDED'
  | 'ROUTE_CHANGED'
  | 'ROUTE_REMOVED'
  | 'STATE_ADDED'
  | 'VIEWPORT_REQUIREMENT_CHANGED';

export type DesignRouteManifestDiffEntry = {
  type: DesignRouteManifestDiffType;
  projectId?: string;
  routeId?: string;
  visualStateId?: string;
  previous?: string;
  current?: string;
  detail: string;
};

export type DesignRouteManifestDiff = {
  previousCommit: string;
  currentCommit: string;
  previousGeneratedAt: string;
  currentGeneratedAt: string;
  entries: DesignRouteManifestDiffEntry[];
};

export type PossibleDeadRouteQueueItem = {
  projectId: string;
  routeId: string;
  route: string;
  displayName: string;
  reachabilityClassification: RouteReachabilityClassification;
};

export type NeedsReferenceQueueItem = {
  projectId: string;
  routeId: string;
  designScreenId?: string;
  designFamilyId?: string;
  displayName: string;
  viewportClass: ViewportClass;
  priority: DesignRoutePriority;
  routeFamily: RouteFamily;
  queueKind: 'UNIQUE_SCREEN' | 'FAMILY_REPRESENTATIVE' | 'REVIEW_REQUIRED';
  necessityClassification: ReferenceNecessityClassification;
};

export type NeedsImprovementQueueItem = {
  projectId: string;
  routeId: string;
  displayName: string;
  viewportClass: ViewportClass;
  quality: ReferenceQualityStatus;
  reasons: string[];
};

export type PageDesignReferencePromptInput = {
  projectId: string;
  routeId: string;
  route: string;
  displayName: string;
  viewportClass: ViewportClass;
  routeFamily: RouteFamily;
  dependencies: string[];
  neighboringReferenceIds: string[];
  shellAuthority: string;
  designSystemNotes: string[];
};

export type PageDesignReferencePromptOutput = {
  prompt: string;
  imageReferenceIds: string[];
  modelHint: string;
  estimatedCostUsd?: number;
};

export type ReferenceBatchPreview = {
  projectId: string;
  viewportClass: ViewportClass;
  routeIds: string[];
  designFamilyIds: string[];
  requestCount: number;
  designScreensCovered: number;
  model: string;
  estimatedCostUsd?: number;
  generationRequestsAvoided: number;
};

export type CompiledWebsitePageRecord = {
  pageId: string;
  projectId: string;
  designScreenId: string;
  displayName: string;
  experienceGroup: string;
  experienceClassification: ProjectWebsiteExperienceClassification;
  representativeRoute: string;
  designFamilyId?: string;
  instanceCount: number;
  priority: DesignRoutePriority;
  journeyStage: CustomerJourneyStage;
  journeyOrder: number;
  compiledStatus: CompiledPageStatus;
  referencePolicy: ReferenceNecessityClassification;
  implementationStatus: ImplementationCoverageStatus;
  mobileStatus: CompiledPageStatus;
  tabletStatus: CompiledPageStatus;
  desktopStatus: CompiledPageStatus;
  visualStateIds: string[];
  isPrimaryExperience: boolean;
  isMissingPage: boolean;
  confidence: PageCompilationConfidence;
  captureEligible: boolean;
  authContext?: 'anonymous' | 'authenticated' | 'admin';
  effectiveReferenceHandoff: boolean;
};

export type RequiredWebsitePageRecord = {
  pageId: string;
  projectId: string;
  displayName: string;
  suggestedRoute: string;
  experienceClassification: ProjectWebsiteExperienceClassification;
  parentFlow: string;
  requiredByPageIds: string[];
  dependencyEvidence: RouteEvidence[];
  designFamilyCandidate?: string;
  referenceStatus: CompiledPageStatus;
  implementationStatus: 'IMPLEMENTATION_MISSING';
  priority: DesignRoutePriority;
  journeyStage: CustomerJourneyStage;
};

export type CustomerFlowDeadEndAudit = {
  projectId: string;
  flowId: string;
  flowLabel: string;
  deadEndRoute: string;
  missingTerminal?: string;
  severity: 'CRITICAL' | 'WARNING';
};

export type ProjectCustomerJourneyIndex = {
  projectId: string;
  stages: Array<{
    stage: CustomerJourneyStage;
    pageIds: string[];
    order: number;
  }>;
};

export type ProjectWebsitePageSet = {
  projectId: string;
  displayName: string;
  primaryPageIds: string[];
  supportingPageIds: string[];
  missingRequiredPageIds: string[];
  visualStateIds: string[];
  excludedInternalIds: string[];
  designFamilyIds: string[];
  compiledPages: CompiledWebsitePageRecord[];
  missingPages: RequiredWebsitePageRecord[];
  journeyIndex: ProjectCustomerJourneyIndex;
  deadEndAudits: CustomerFlowDeadEndAudit[];
  viewportCoverage: {
    mobile: { primary: number; missingRef: number };
    tablet: { primary: number; missingRef: number };
    desktop: { primary: number; missingRef: number };
  };
  status: 'COMPLETE' | 'HAS_MISSING' | 'HAS_DEAD_ENDS' | 'REVIEW_REQUIRED';
  summary: {
    totalPrimaryPages: number;
    implemented: number;
    missing: number;
    referenceMissing: number;
    inheritsFamily: number;
    assetOnly: number;
    internalExcluded: number;
    /** P0.VR.3G — curated experience page counts */
    vr3fPrimaryPages?: number;
    experiencePages?: number;
    materialScreens?: number;
    visualStates?: number;
    instances?: number;
    workspacePages?: number;
  };
  /** P0.VR.3G experience abstraction layer */
  experienceSections?: ExperienceSectionRecord[];
  experiencePages?: ExperiencePageRecord[];
  materialScreens?: MaterialScreenRecord[];
  pageInstances?: ExperiencePageInstanceRecord[];
  experiencePageQa?: ExperiencePageAbstractionQa[];
  experienceMetrics?: ExperiencePageMetrics;
};

export type PageSetOverrideRecord = {
  pageId: string;
  projectId: string;
  overrideType: 'MARK_PRIMARY' | 'MARK_SUPPORTING' | 'MARK_INTERNAL' | 'MARK_MISSING_REQUIRED' | 'CHANGE_FAMILY' | 'CHANGE_ORDER';
  value: string;
  createdAt: string;
};

export type ProjectWebsitePageSetDiffType =
  | 'PAGE_ADDED'
  | 'PAGE_REMOVED'
  | 'PAGE_RECLASSIFIED'
  | 'MISSING_PAGE_ADDED'
  | 'MISSING_PAGE_RESOLVED'
  | 'STATE_ADDED'
  | 'FAMILY_CHANGED'
  | 'VIEWPORT_REQUIREMENT_CHANGED';

export type ProjectWebsitePageSetDiffEntry = {
  type: ProjectWebsitePageSetDiffType;
  projectId: string;
  pageId?: string;
  previous?: string;
  current?: string;
  detail: string;
};

export type ProjectWebsitePageSetDiff = {
  pageSetSchemaVersion: string;
  previousGeneratedAt: string;
  currentGeneratedAt: string;
  sourceManifestVersion: string;
  entries: ProjectWebsitePageSetDiffEntry[];
};

export type ProjectPageSetCompilationMeta = {
  pageSetSchemaVersion: string;
  generatedAt: string;
  sourceManifestVersion: string;
  sourceCommit: string;
};

export type ExperienceSectionRecord = {
  sectionId: string;
  projectId: string;
  displayName: string;
  order: number;
  experiencePageIds: string[];
};

export type ExperiencePageRecord = {
  experiencePageId: string;
  projectId: string;
  displayName: string;
  sectionId: string;
  experienceType: ExperiencePageType;
  memberDesignScreenIds: string[];
  memberRouteIds: string[];
  materialScreenIds: string[];
  visualStateIds: string[];
  instanceIds: string[];
  representativeScreenId: string;
  representativeRoute: string;
  designFamilyIds: string[];
  referencePolicy: ReferenceNecessityClassification;
  viewportRequirements: { mobile: boolean; tablet: boolean; desktop: boolean };
  implementationStatus: ImplementationCoverageStatus | 'IMPLEMENTATION_MISSING';
  referenceStatus: CompiledPageStatus;
  priority: DesignRoutePriority;
  journeyStage: CustomerJourneyStage;
  founderDesignable: boolean;
  founderPrimary: boolean;
  abstractionConfidence: ExperiencePageAbstractionConfidence;
  captureEligible: boolean;
  routeNodeCount: number;
  authContext?: 'anonymous' | 'authenticated' | 'admin';
};

export type MaterialScreenRecord = {
  materialScreenId: string;
  projectId: string;
  experiencePageId: string;
  displayName: string;
  stepType: MaterialScreenStepType;
  memberDesignScreenIds: string[];
  memberRouteIds: string[];
  representativeRoute: string;
  referencePolicy: ReferenceNecessityClassification;
  captureEligible: boolean;
  order: number;
};

export type ExperiencePageInstanceRecord = {
  instanceId: string;
  projectId: string;
  experiencePageId: string;
  displayName: string;
  slugOrId: string;
  memberDesignScreenIds: string[];
  memberRouteIds: string[];
  representativeRoute: string;
  instanceKind: 'PRODUCT' | 'CONTENT' | 'RECORD' | 'EPISODE' | 'SERVICE' | 'ASSESSMENT' | 'ROOM' | 'OTHER';
  captureEligible: boolean;
};

export type ExperiencePageOverrideRecord = {
  experiencePageId: string;
  projectId: string;
  overrideType: 'APPROVE_GROUP' | 'SPLIT' | 'MAKE_SCREEN_A_PAGE' | 'DEMOTE_TO_STATE' | 'DEMOTE_TO_INSTANCE' | 'CHANGE_SECTION';
  value: string;
  createdAt: string;
};

export type ExperiencePageAbstractionQaIssue = {
  code:
    | 'SAME_EXPERIENCE_SPLIT'
    | 'DIFFERENT_EXPERIENCES_MERGED'
    | 'INSTANCE_PROMOTED_TO_PAGE'
    | 'STATE_PROMOTED_TO_PAGE'
    | 'WORKFLOW_NODE_PROMOTED'
    | 'INTERNAL_ROUTE_LEAKED'
    | 'MATERIAL_SCREEN_MISSING'
    | 'SITE00_SCOPE_REGRESSION';
  severity: 'CRITICAL' | 'WARNING';
  detail: string;
  experiencePageId?: string;
  designScreenId?: string;
};

export type ExperiencePageAbstractionQa = {
  projectId: string;
  issues: ExperiencePageAbstractionQaIssue[];
  reviewRequired: boolean;
};

export type ExperiencePageMetrics = {
  projectId: string;
  beforeVr3fPrimary: number;
  afterExperiencePages: number;
  reductionCount: number;
  reductionPercent: number;
  rawRoutes: number;
  designScreens: number;
  materialScreens: number;
  visualStates: number;
  instances: number;
  missingPages: number;
  workspacePages: number;
};

export type ExperiencePageCompilationMeta = {
  experiencePageSetSchemaVersion: string;
  generatedAt: string;
  sourceManifestVersion: string;
  sourceCommit: string;
  captureScope: 'EXPERIENCE_PAGES_AND_MATERIAL_SCREENS';
};

export type ExperienceCaptureScope = {
  projectId: string;
  experiencePageIds: string[];
  materialScreenIds: string[];
  instancesExcludedByDefault: boolean;
  statesExcludedByDefault: boolean;
  advancedActions: Array<'CAPTURE_ALL_INSTANCES' | 'CAPTURE_ALL_STATES' | 'CAPTURE_RAW_DESIGN_SCREENS'>;
};
