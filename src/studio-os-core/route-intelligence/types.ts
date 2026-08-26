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
  fsbwMissingRouteCompletion?: FsbwMissingRouteCompletionReport;
  fsbwFamilyDerivedMissingTargets?: FamilyDerivedMissingTargetReport;
  experienceCurationCompilation?: ExperienceCurationCompilationMeta;
};

export type MissingPageCompletionMode =
  | 'FAMILY_DERIVED_SIMPLE'
  | 'STRUCTURAL_COMPLEX'
  | 'CREATIVE_COMPLEX'
  | 'FUNCTIONAL_COMPLEX'
  | 'UNKNOWN_REVIEW_REQUIRED';

export type ContentProvenanceSource =
  | 'SOURCE_CANON'
  | 'SOURCE_EXISTING_ROUTE'
  | 'SOURCE_DATABASE'
  | 'SOURCE_PROJECT_DOC'
  | 'COMPOSER_INFERRED'
  | 'CONTENT_REQUIRED';

export type PageAuthorType = 'COMPOSER' | 'MIXED' | 'FOUNDER';
export type PageReviewStatus = 'UNREVIEWED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED_FOR_RELEASE';
export type PagePublishStatus = 'PREVIEW_ONLY' | 'LIVE';
export type ReviewDimension = 'VISUAL' | 'CONTENT' | 'FUNCTION';

export type MissingPageCandidateRecord = {
  candidateId: string;
  projectId: string;
  experiencePageId?: string;
  displayName: string;
  representativeRoute: string;
  sectionId?: string;
  designFamilyIds: string[];
  sourceKind: 'EXPERIENCE_PAGE' | 'MISSING_PAGE_RECORD';
  ownership: 'FSBW' | 'EXTERNAL_REPO_OWNED';
  implementationStatus: 'IMPLEMENTATION_MISSING';
};

export type MissingPageRequirementsBrief = {
  candidateId: string;
  projectId: string;
  displayName: string;
  route: string;
  purpose: string;
  entryPoints: string[];
  exitPoints: string[];
  requiredContent: string[];
  requiredActions: string[];
  requiredData: string[];
  requiredStates: string[];
  designFamilyIds: string[];
  completionMode: MissingPageCompletionMode;
  creativeDirectionRequired: boolean;
  functionalReviewRequired: boolean;
  dependencies: string[];
  contentBlocks: Array<{ label: string; provenance: ContentProvenanceSource; detail?: string }>;
};

export type PageAuthorshipRecord = {
  authorshipId: string;
  projectId: string;
  experiencePageId: string;
  route: string;
  displayName: string;
  authorType: PageAuthorType;
  createdBySprint: string;
  reviewStatus: PageReviewStatus;
  publishStatus: PagePublishStatus;
  completionMode: MissingPageCompletionMode;
  createdAt: string;
  sourceCommit: string;
  reviewDimensions: Record<ReviewDimension, PageReviewStatus>;
  creativeDirectionRequired: boolean;
  functionalReviewRequired: boolean;
};

export type PageCreationReceipt = {
  receiptId: string;
  projectId: string;
  experiencePageId: string;
  displayName: string;
  route: string;
  completionMode: MissingPageCompletionMode;
  filesCreated: string[];
  filesModified: string[];
  familyUsed?: string;
  contentSources: ContentProvenanceSource[];
  inferredContent: string[];
  dependenciesResolved: string[];
  createdBy: string;
  sourceCommit: string;
  createdAt: string;
  previewOnly: boolean;
  productionNavBlocked: boolean;
};

export type ComposerDraftSnapshotRecord = {
  snapshotId: string;
  authorshipId: string;
  projectId: string;
  route: string;
  viewport: ViewportClass;
  label:
    | 'CURRENT · COMPOSER DRAFT'
    | 'FAMILY SOURCE · EXISTING IMPLEMENTATION'
    | 'CURRENT · COMPOSER DERIVED DRAFT';
  capturePath?: string;
  capturedAt?: string;
  status: 'CAPTURED' | 'FAILED' | 'PENDING';
  sourceSiblingId?: string;
  isSourceSibling?: boolean;
  /** P0.VR.3E persistent snapshot authority */
  storageAuthority?: 'P0.VR.3E';
  snapshotKind?: 'SOURCE_SIBLING' | 'DERIVED_DRAFT';
  supabaseStoragePath?: string;
  localMirrorPath?: string;
  sourceCommit?: string;
  targetId?: string;
  qaPassed?: boolean;
};

export type PageReviewSetRecord = {
  reviewSetId: string;
  projectId: string;
  displayName: string;
  completionMode: MissingPageCompletionMode;
  authorshipIds: string[];
  bulkApprovalAllowed: boolean;
  reviewDimensions: ReviewDimension[];
};

export type FsbwComposerPageRegistry = {
  schemaVersion: 'fsbw-composer-page-registry@2';
  generatedAt: string;
  sourceCommit: string;
  authorship: PageAuthorshipRecord[];
  receipts: PageCreationReceipt[];
  snapshots: ComposerDraftSnapshotRecord[];
  reviewSets: PageReviewSetRecord[];
  /** P0.VR.3L-FSBW */
  familyDerivedTargets?: FamilyDerivedMissingTargetRecord[];
  sharedShells?: SharedShellRecord[];
  shellChanges?: FamilyShellChangeRecord[];
  shellPropagations?: ShellPropagationReceipt[];
  derivationReceipts?: FamilyDerivationReceipt[];
  recapturePlans?: ShellPropagationRecapturePlan[];
};

export type FsbwMissingRouteCompletionProjectSummary = {
  projectId: string;
  missing: number;
  simple: number;
  complex: number;
  built: number;
  shellOnly: number;
  blocked: number;
  externalSkipped: number;
};

export type FsbwMissingRouteCompletionReport = {
  sprintId: string;
  generatedAt: string;
  sourceCommit: string;
  sourceManifestVersion: string;
  repo: string;
  ownedProjects: string[];
  projectSummaries: FsbwMissingRouteCompletionProjectSummary[];
  externalRepoOwned: Array<{ projectId: string; count: number; pageIds: string[] }>;
  candidates: MissingPageCandidateRecord[];
  briefs: MissingPageRequirementsBrief[];
  registry: FsbwComposerPageRegistry;
  executeBuild: boolean;
};

/** P0.VR.3L-FSBW — Missing-target family derivation + shell propagation */

export type MissingDesignTargetType =
  | 'UNIQUE_EXPERIENCE'
  | 'FAMILY_DERIVED_PAGE'
  | 'MATERIAL_SCREEN'
  | 'TAB_STATE'
  | 'VISUAL_STATE'
  | 'CONTENT_INSTANCE'
  | 'DATA_INSTANCE'
  | 'ASSET_VARIANT'
  | 'UNKNOWN_REVIEW_REQUIRED';

export type MissingTargetReviewStatus =
  | 'UNCLASSIFIED'
  | 'READY_FOR_DERIVATION'
  | 'SOURCE_CAPTURE_REQUIRED'
  | 'DERIVING'
  | 'COMPOSER_DRAFT'
  | 'READY_FOR_REVIEW'
  | 'NEEDS_REVISION'
  | 'FOUNDER_APPROVED'
  | 'APPROVED_FOR_RELEASE';

export type ShellChangeStatus =
  | 'SHELL_CHANGE_PROPOSED'
  | 'SHELL_PROPAGATION_REVIEW'
  | 'SHELL_PROPAGATION_APPROVED'
  | 'SHELL_PROPAGATED'
  | 'SHELL_RECAPTURE_REQUIRED';

export type ShellPropagationScope = 'TARGET_ONLY' | 'DESIGN_FAMILY' | 'SHARED_SHELL_GLOBAL';

export type SiblingConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type FamilyDerivedMissingTargetRecord = {
  targetId: string;
  projectId: string;
  targetType: MissingDesignTargetType;
  displayName: string;
  representativeRoute: string;
  experiencePageId?: string;
  materialScreenId?: string;
  visualStateId?: string;
  parentExperiencePageId?: string;
  sourceFamilyId?: string;
  sourceSiblingId?: string;
  sourceRoute?: string;
  sourceComponentIds: string[];
  sourceSnapshotId?: string;
  shellId?: string;
  sharedComponentIds: string[];
  preservedProperties: string[];
  allowedDifferences: string[];
  derivationConfidence: SiblingConfidence;
  createdBy: string;
  reviewStatus: MissingTargetReviewStatus;
  lineage: {
    derivedFromFamily?: string;
    derivedFromSibling?: string;
    derivedFromShell?: string;
    derivedFromSnapshot?: string;
    derivedFromComponents: string[];
  };
  trueMissingRoute?: boolean;
  handoffSprint?: 'P0.VR.3H-FSBW';
};

export type FamilySiblingCandidate = {
  siblingId: string;
  designScreenId: string;
  route: string;
  displayName: string;
  familyId: string;
  shellId?: string;
  score: number;
  confidence: SiblingConfidence;
  similarityExplanation: string;
  hasSnapshot: boolean;
  snapshotStale: boolean;
  captureRequired: boolean;
};

export type SharedShellRecord = {
  shellId: string;
  projectId: string;
  displayName: string;
  componentPaths: string[];
  consumerPageIds: string[];
  consumerFamilyIds: string[];
  responsiveAuthority: string;
  version: string;
};

export type SharedShellDependencyGraph = {
  projectId: string;
  shells: SharedShellRecord[];
  edges: Array<{
    shellId: string;
    componentPath: string;
    familyId?: string;
    experiencePageId?: string;
    materialScreenId?: string;
    route?: string;
  }>;
};

export type ShellPropagationImpactAnalysis = {
  scope: ShellPropagationScope;
  shellId: string;
  projectId: string;
  affectedFamilyIds: string[];
  affectedPageIds: string[];
  affectedMaterialScreenIds: string[];
  affectedStateIds: string[];
  affectedRoutes: string[];
  viewportsAffected: ViewportClass[];
  referencesPossiblyStale: string[];
  snapshotsPossiblyStale: string[];
  knownExceptions: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  duplicatedFamilyImplementation: boolean;
  crossProjectBlocked: boolean;
  blastRadius: {
    pages: number;
    materialScreens: number;
    states: number;
    viewportImplementations: number;
  };
  requiresFounderApproval: boolean;
};

export type ShellPropagationExceptionRecord = {
  exceptionId: string;
  shellChangeId: string;
  pageId: string;
  reason: string;
  createdAt: string;
};

export type FamilyShellChangeRecord = {
  changeId: string;
  projectId: string;
  sourceTargetId: string;
  sourceFamilyId?: string;
  sourceShellId?: string;
  propagationScope: ShellPropagationScope;
  affectedFamilyIds: string[];
  affectedPageIds: string[];
  affectedMaterialScreenIds: string[];
  affectedStateIds: string[];
  beforeVersion: string;
  afterVersion: string;
  changedComponents: string[];
  changedTokens: string[];
  changedGeometry: string[];
  founderApproved: boolean;
  status: ShellChangeStatus;
  exceptions: ShellPropagationExceptionRecord[];
  createdAt: string;
};

export type ShellPropagationRecapturePlan = {
  planId: string;
  shellChangeId: string;
  projectId: string;
  targets: Array<{ targetId: string; route: string; viewports: ViewportClass[] }>;
  fullProjectRecapture: false;
};

export type FamilyDerivationReceipt = {
  receiptId: string;
  targetId: string;
  projectId: string;
  targetType: MissingDesignTargetType;
  sourceSiblingId?: string;
  sourceSnapshotId?: string;
  draftSnapshotIds: string[];
  fidelityIssues: string[];
  unexplainedDrift: boolean;
  createdAt: string;
  createdBy: string;
};

export type ShellPropagationReceipt = {
  receiptId: string;
  changeId: string;
  projectId: string;
  scope: ShellPropagationScope;
  affectedPages: number;
  affectedRoutes: string[];
  beforeShellVersion: string;
  afterShellVersion: string;
  codeChanges: string[];
  exceptions: string[];
  referencesInvalidated: string[];
  snapshotsInvalidated: string[];
  recapturePlanId?: string;
  createdAt: string;
};

export type MissingTargetQueueGroup =
  | 'READY_FOR_FAMILY_DERIVATION'
  | 'NEEDS_SIBLING_SELECTION'
  | 'NEEDS_CREATIVE_DIRECTION'
  | 'NEEDS_FUNCTIONAL_DIRECTION'
  | 'TRUE_MISSING_ROUTE'
  | 'INSTANCE_STATE_ONLY';

export type MissingTargetQueueItem = {
  group: MissingTargetQueueGroup;
  target: FamilyDerivedMissingTargetRecord;
  sibling?: FamilySiblingCandidate;
  siblingCandidates?: FamilySiblingCandidate[];
};

export type FamilyDerivedMissingTargetReport = {
  sprintId: string;
  generatedAt: string;
  sourceCommit: string;
  projectSummaries: Array<{
    projectId: string;
    total: number;
    byType: Partial<Record<MissingDesignTargetType, number>>;
    readyForDerivation: number;
    sourceCaptureRequired: number;
    derived: number;
    trueMissingRoutes: number;
  }>;
  targets: FamilyDerivedMissingTargetRecord[];
  queue: MissingTargetQueueItem[];
  shellGraph: SharedShellDependencyGraph[];
  registry: FsbwComposerPageRegistry;
  executeBuild: boolean;
};

export type FamilyDerivedTargetVisualQaResult = {
  passed: boolean;
  unexplainedDrift: boolean;
  expectedDifferences: string[];
  unexpectedDifferences: string[];
  dimensions: {
    shellGeometry: boolean;
    tabs: boolean;
    spacing: boolean;
    typography: boolean;
    responsive: boolean;
  };
  blockingIssues: string[];
};

export type FamilyDerivedTargetReviewReceipt = {
  receiptId: string;
  targetId: string;
  projectId: string;
  action: 'APPROVE_TARGET' | 'REQUEST_REVISION' | 'APPROVE_SHELL_PROPAGATION';
  propagationScope?: ShellPropagationScope;
  createdAt: string;
  createdBy: string;
};

export type CharacterLabParentRecord = {
  experiencePageId: string;
  sectionId: string;
  designFamilyId: string;
  sharedShellId: string;
  displayName: string;
  representativeRoute: string;
  memberRoutes: string[];
  materialScreens: string[];
  tabStates: string[];
  sharedComponentPaths: string[];
  shellGeometry: Record<string, unknown>;
};

export type VoiceLabExecutionResult = {
  sprintId: string;
  target: FamilyDerivedMissingTargetRecord;
  parent: CharacterLabParentRecord;
  sourceSibling: FamilySiblingCandidate;
  siblingCandidates: FamilySiblingCandidate[];
  sourceSnapshots: ComposerDraftSnapshotRecord[];
  targetSnapshots: ComposerDraftSnapshotRecord[];
  visualQa: FamilyDerivedTargetVisualQaResult;
  authorship: PageAuthorshipRecord;
  derivationReceipt: FamilyDerivationReceipt;
  readyForFounderReview: boolean;
  propagationDefaultScope: ShellPropagationScope;
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
  /** P0.VR.3I — curation layers */
  compilerProposedPages?: ExperiencePageRecord[];
  founderCuratedPages?: ExperiencePageRecord[];
  activeExperiencePages?: ExperiencePageRecord[];
  experienceCuration?: ProjectExperienceCurationBundle;
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
  /** P0.VR.3I — true when capture blocked until LOCKED_FOR_CAPTURE */
  requiresLockedCuration?: boolean;
};

/** P0.VR.3I — Experience page curation governance */
export type ExperiencePageUniverseStatus =
  | 'DRAFT'
  | 'REVIEWING'
  | 'CURATED'
  | 'LOCKED_FOR_CAPTURE'
  | 'STALE';

export type PageAbstractionReviewDecision =
  | 'APPROVE_AS_PAGE'
  | 'SPLIT_PAGE'
  | 'MERGE_WITH_PAGE'
  | 'DEMOTE_TO_MATERIAL_SCREEN'
  | 'DEMOTE_TO_STATE'
  | 'DEMOTE_TO_INSTANCE'
  | 'MOVE_TO_INTERNAL_WORKSPACE'
  | 'MOVE_TO_SUPPORTING'
  | 'PROMOTE_TO_PRIMARY'
  | 'CHANGE_SECTION'
  | 'CHANGE_REPRESENTATIVE'
  | 'REVIEW_LATER';

export type PageAbstractionReviewRecord = {
  reviewId: string;
  projectId: string;
  experiencePageId: string;
  decision: PageAbstractionReviewDecision;
  reason?: string;
  reviewedBy: string;
  reviewedAt: string;
  sourceManifestVersion: string;
  active: boolean;
};

export type ExperiencePageOverrideTypeV2 =
  | 'FORCE_PRIMARY'
  | 'FORCE_SUPPORTING'
  | 'FORCE_INTERNAL'
  | 'FORCE_PAGE'
  | 'FORCE_MATERIAL_SCREEN'
  | 'FORCE_STATE'
  | 'FORCE_INSTANCE'
  | 'FORCE_SECTION'
  | 'FORCE_SPLIT'
  | 'FORCE_MERGE'
  | 'FORCE_REPRESENTATIVE';

export type ExperiencePageOverrideRecordV2 = {
  overrideId: string;
  projectId: string;
  targetType: 'EXPERIENCE_PAGE' | 'MATERIAL_SCREEN' | 'INSTANCE';
  targetId: string;
  overrideType: ExperiencePageOverrideTypeV2;
  value: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  active: boolean;
  supersedesOverrideId?: string;
  status?: 'ACTIVE' | 'OVERRIDE_CONFLICT' | 'RETIRED';
  systemProposed?: boolean;
};

export type ProjectCurationState = {
  projectId: string;
  curationVersion: string;
  universeStatus: ExperiencePageUniverseStatus;
  lockedForCapture: boolean;
  curationUpdateAvailable?: boolean;
  lastCompiledAt?: string;
  lastReviewedAt?: string;
};

export type ExperienceCurationStore = {
  schemaVersion: string;
  updatedAt: string;
  sourceCommit: string;
  overrides: ExperiencePageOverrideRecordV2[];
  reviews: PageAbstractionReviewRecord[];
  projectCuration: Record<string, ProjectCurationState>;
  /** P0.VR.3K */
  reviewSessions?: CurationReviewSession[];
  actionReceipts?: CurationActionReceipt[];
  reviewReceipts?: PageAbstractionReviewReceiptV2[];
  lockReceipts?: ProjectCaptureLockReceipt[];
  sourceSnapshots?: Record<string, CurationSourceSnapshot>;
  externalRepoAuthority?: Record<string, ExternalRepoAuthorityMark>;
  studioWorldAudit?: StudioWorldCurationAudit;
  lastActionByProject?: Record<string, string>;
};

export type CurationReviewQueueItem = {
  category:
    | 'LOW_CONFIDENCE'
    | 'POSSIBLE_INTERNAL_LEAK'
    | 'POSSIBLE_DUPLICATE_PAGE'
    | 'POSSIBLE_SERVICE_INSTANCE'
    | 'OVERRIDE_CONFLICT'
    | 'NEW_SOURCE_PAGE';
  experiencePageId: string;
  displayName: string;
  detail: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
};

export type PrimaryExperienceInternalLeakAudit = {
  projectId: string;
  experiencePageId: string;
  displayName: string;
  route: string;
  signals: string[];
  recommendedAction: 'DEMOTE_TO_INTERNAL' | 'REVIEW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type ExperiencePageDuplicateAudit = {
  projectId: string;
  experiencePageIds: string[];
  displayNames: string[];
  sharedDesignFamilyId?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: 'MERGE' | 'REVIEW';
};

export type AioServiceConsolidationCandidate = {
  projectId: string;
  servicePageIds: string[];
  displayNames: string[];
  sharedShell: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type ImplementationSnapshotCapturePlan = {
  projectId: string;
  curationVersion: string;
  experiencePageIds: string[];
  materialScreenIds: string[];
  viewports: ViewportClass[];
  representativeRoutes: Record<string, string>;
  authContexts: Record<string, string>;
  estimatedCaptureCount: number;
  requiresLockedCuration: boolean;
};

export type DesignReferenceGenerationPlan = {
  projectId: string;
  curationVersion: string;
  uniqueReferenceRequirements: number;
  familyInherited: number;
  assetOnly: number;
  stateDerived: number;
  experiencePageIds: string[];
  materialScreenIds: string[];
};

export type PageAbstractionReviewReceipt = {
  projectId: string;
  manifestVersion: string;
  curationVersion: string;
  decisions: number;
  pagesPromoted: number;
  pagesDemoted: number;
  pagesMerged: number;
  pagesSplit: number;
  sectionsChanged: number;
  reviewer: string;
  date: string;
};

export type ProjectExperienceCurationBundle = {
  projectId: string;
  curationVersion: string;
  universeStatus: ExperiencePageUniverseStatus;
  compilerProposedPrimaryCount: number;
  activePrimaryCount: number;
  internalWorkspaceCount: number;
  supportingCount: number;
  reviewQueue: CurationReviewQueueItem[];
  reviewGroups?: CurationReviewGroup[];
  internalLeakAudit: PrimaryExperienceInternalLeakAudit[];
  duplicateAudit: ExperiencePageDuplicateAudit[];
  aioServiceConsolidation?: AioServiceConsolidationCandidate[];
  bawMaterialScreenAudit?: BawMaterialScreenAudit;
  capturePlan: ImplementationSnapshotCapturePlan;
  normalizedCapturePlan?: NormalizedCapturePlan;
  referencePlan: DesignReferenceGenerationPlan;
  normalizedReferencePlan?: NormalizedReferencePlan;
  overrideConflicts: ExperiencePageOverrideRecordV2[];
  sourceDiff?: CurationSourceDiff;
  lockBlockers?: string[];
  externalRepoAuthority?: boolean;
  changes: {
    demoted: string[];
    promoted: string[];
    merged: string[];
    split: string[];
    instanceConversions: string[];
    sectionChanges: string[];
  };
};

export type ExperienceCurationCompilationMeta = {
  curationSchemaVersion: string;
  generatedAt: string;
  sourceManifestVersion: string;
  sourceCommit: string;
  /** P0.VR.3K — FSBW-only capture scope summary */
  fsbwCaptureScope?: FsbwCaptureScopeSummary;
};

/** P0.VR.3K — Founder curation actions + review governance */
export type CurationActionType =
  | 'KEEP_AS_PAGE'
  | 'MOVE_TO_WORKSPACE'
  | 'MOVE_TO_SUPPORTING'
  | 'PROMOTE_TO_PRIMARY'
  | 'DEMOTE_TO_MATERIAL_SCREEN'
  | 'DEMOTE_TO_STATE'
  | 'DEMOTE_TO_INSTANCE'
  | 'CHANGE_SECTION'
  | 'CHANGE_REPRESENTATIVE'
  | 'SPLIT_PAGE'
  | 'MERGE_PAGES'
  | 'LOCK_FOR_CAPTURE'
  | 'UNLOCK_FOR_REVIEW'
  | 'UNDO_LAST_ACTION'
  | 'BATCH_KEEP'
  | 'BATCH_MOVE_TO_WORKSPACE'
  | 'BATCH_MOVE_TO_SUPPORTING'
  | 'BATCH_MAKE_INSTANCES';

export type CurationActionReceipt = {
  receiptId: string;
  projectId: string;
  sessionId?: string;
  actionType: CurationActionType;
  targetId: string;
  targetIds?: string[];
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  reason?: string;
  sourceEvidence?: string[];
  result: 'APPLIED' | 'BLOCKED' | 'CONFLICT';
  overrideId?: string;
  reviewer: string;
  timestamp: string;
};

export type CurationReviewSession = {
  sessionId: string;
  projectId: string;
  reviewer: string;
  startedAt: string;
  endedAt?: string;
  actionReceiptIds: string[];
  notes?: string;
};

export type PageAbstractionReviewReceiptV2 = {
  receiptId: string;
  projectId: string;
  curationVersion: string;
  reviewSessionId?: string;
  reviewer: string;
  timestamp: string;
  actions: CurationActionReceipt[];
  beforeSummary: { primary: number; internal: number; supporting: number; materialScreens: number };
  afterSummary: { primary: number; internal: number; supporting: number; materialScreens: number };
  affectedPageIds: string[];
  overrideIds: string[];
  conflicts: string[];
  notes?: string;
};

export type ProjectCaptureLockReceipt = {
  receiptId: string;
  projectId: string;
  curationVersion: string;
  lockedBy: string;
  lockedAt: string;
  activePageCount: number;
  materialScreenCount: number;
  captureTargetCount: number;
  manifestVersion: string;
  sourceCommit: string;
};

export type CurationSourceDiff = {
  projectId: string;
  newRoutes: string[];
  removedRoutes: string[];
  screenChanges: string[];
  familyChanges: string[];
  pageCandidates: string[];
  materialScreenChanges: string[];
  authChanges: string[];
};

export type CurationSourceSnapshot = {
  projectId: string;
  sourceCommit: string;
  routeFingerprints: string[];
  screenFingerprints: string[];
  capturedAt: string;
};

export type CurationReviewGroup = {
  groupId: string;
  projectId: string;
  label: string;
  category: string;
  items: CurationReviewQueueItem[];
  recommendedAction?: CurationActionType;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type BawMaterialScreenAuditEntry = {
  materialScreenId: string;
  displayName: string;
  representativeRoute: string;
  classification: 'MATERIAL_SCREEN_KEEP' | 'STATE_CANDIDATE' | 'INSTANCE_CANDIDATE' | 'DUPLICATE_CANDIDATE';
  detail: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type BawMaterialScreenAudit = {
  projectId: string;
  inputCount: number;
  keep: number;
  stateCandidates: number;
  instanceCandidates: number;
  duplicateCandidates: number;
  finalMaterialScreenCount: number;
  entries: BawMaterialScreenAuditEntry[];
};

export type StudioWorldCurationAudit = {
  projectId: 'studio-world';
  rawRoutes: number;
  designScreens: number;
  designFamilies: number;
  experiencePagesProposed: number;
  primaryWorkspace: number;
  supporting: number;
  internalSystem: number;
  materialScreens: number;
  states: number;
  instances: number;
  reviewRequired: number;
  sections: Array<{ sectionId: string; displayName: string; pageCount: number }>;
  universeStatus: ExperiencePageUniverseStatus;
  pages: Array<{
    experiencePageId: string;
    displayName: string;
    route: string;
    classification: 'PRODUCTION_WORKSPACE' | 'DESIGN' | 'CAMPAIGN_CONTENT' | 'CHARACTER_CREATIVE' | 'ASSET_GENERATION' | 'SYSTEM_ADMIN' | 'OTHER';
  }>;
};

export type FsbwCaptureScopeSummary = {
  projects: string[];
  theoreticalPageViewportTargets: number;
  captureEligibleTargets: number;
  blockedTargets: number;
  actualCaptureTargets: number;
  perProject: Record<
    string,
    {
      experiencePages: number;
      materialScreens: number;
      mobile: number;
      tablet: number;
      desktop: number;
      blocked: number;
      actualTargets: number;
    }
  >;
};

export type NormalizedCapturePlan = ImplementationSnapshotCapturePlan & {
  experiencePageTargets: string[];
  materialScreenTargets: string[];
  viewportTargets: ViewportClass[];
  mobileTargets: number;
  tabletTargets: number;
  desktopTargets: number;
  blockedTargets: string[];
  theoreticalPageViewportTargets: number;
  captureEligibleTargets: number;
  actualCaptureTargets: number;
};

export type NormalizedReferencePlan = DesignReferenceGenerationPlan & {
  theoreticalPageViewportReferenceNeeds: number;
  referenceEligibleRequirements: number;
  uniqueReferencesRequired: number;
  inheritedReferenceAssignments: number;
  noNewReferenceAssignments: number;
};

export type ExternalRepoAuthorityMark = {
  projectId: string;
  authority: 'EXTERNAL_REPO';
  note: string;
};
