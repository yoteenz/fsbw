import type {
  DESIGNABLE_SURFACE_CLASSES,
  DESIGN_ROUTE_PRIORITIES,
  FAILURE_TAXONOMY,
  ROUTE_FAMILIES,
  VIEWPORT_CLASSES,
} from './constants';

export type ViewportClass = (typeof VIEWPORT_CLASSES)[number];
export type RouteFamily = (typeof ROUTE_FAMILIES)[number];
export type DesignRoutePriority = (typeof DESIGN_ROUTE_PRIORITIES)[number];
export type DesignableSurfaceClass = (typeof DESIGNABLE_SURFACE_CLASSES)[number];
export type FailureTaxonomy = (typeof FAILURE_TAXONOMY)[number];

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

export type DesignCoverageSummary = {
  projectId: string;
  totalDesignableScreens: number;
  mobile: { canonical: number; missing: number; stale: number; matched: number };
  tablet: { canonical: number; missing: number; stale: number; matched: number };
  desktop: { canonical: number; missing: number; stale: number; matched: number };
  needsReference: number;
  needsImprovement: number;
  brokenRoutes: number;
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
  routes: ProjectPageRouteRecord[];
  visualStates: ProjectVisualStateRecord[];
  dependencyGraphs: ProjectRouteDependencyGraph[];
  coverage: PageVisualCoverageRecord[];
  syncContracts: DesignRouteSyncContract[];
  coverageSummaries: DesignCoverageSummary[];
  completenessScores: ProjectCompletenessScores[];
  failures: FailureTaxonomy[];
  forensicReportId: string;
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
    routesDiscovered: number;
    designableRoutes: number;
    visualStates: number;
    dynamicTemplates: number;
    authenticatedRoutes: number;
    orphaned: number;
    deprecated: number;
    missingDependencies: number;
    impliedRoutes: number;
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

export type NeedsReferenceQueueItem = {
  projectId: string;
  routeId: string;
  displayName: string;
  viewportClass: ViewportClass;
  priority: DesignRoutePriority;
  routeFamily: RouteFamily;
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
  requestCount: number;
  model: string;
  estimatedCostUsd: number;
};
