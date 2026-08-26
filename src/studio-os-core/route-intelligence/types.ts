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
