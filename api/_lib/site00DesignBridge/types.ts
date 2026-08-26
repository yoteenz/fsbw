/** P0.BRIDGE.1-FSBW — SITE 00 design bridge shared types */

export const FSBW_REPO_BINDING = 'yoteenz/fsbw' as const;
export const ELIGIBLE_CHANGE_STATUS = 'READY_FOR_REPO' as const;

export const SITE00_PROJECT_KEYS = [
  'FRONTAL_SLAYER',
  'ALL_IN_ONE_ENTERPRISES',
  'STUDIO_WORLD_WEBSITE',
] as const;

export type Site00ProjectKey = (typeof SITE00_PROJECT_KEYS)[number];

export const SITE00_OPERATION_TYPES = [
  'UPDATE_COMPONENT_PROP',
  'UPDATE_LAYOUT_REGION',
  'ADD_SECTION',
  'REMOVE_SECTION',
  'REORDER_SECTION',
  'UPDATE_DESIGN_TOKEN',
  'CHANGE_ASSET_BINDING',
  'CHANGE_SHARED_SHELL',
  'REGISTER_ROUTE',
  'REGISTER_TAB',
  'UPDATE_RESPONSIVE_RULE',
  'UPDATE_PAGE_METADATA',
  'UPDATE_CONTENT_BINDING',
  'UPDATE_ALLOWED_COMPONENT_VARIANT',
] as const;

export type Site00OperationType = (typeof SITE00_OPERATION_TYPES)[number];

export const RECEIPT_EVENTS = [
  'FETCHED',
  'VALIDATED',
  'BLOCKED',
  'APPLYING',
  'APPLIED',
  'TESTS_PASSED',
  'BUILD_PASSED',
  'PR_CREATED',
  'MERGED',
  'FAILED',
  'ROLLBACK',
] as const;

export type Site00ReceiptEvent = (typeof RECEIPT_EVENTS)[number];

export const RUNTIME_BINDING_TYPES = [
  'content',
  'asset_id',
  'design_token',
  'page_metadata',
  'component_variant',
  'section_order',
  'responsive_rule',
] as const;

export type Site00RuntimeBindingType = (typeof RUNTIME_BINDING_TYPES)[number];

export type Site00StructuredOperation = {
  type: Site00OperationType;
  targetPath?: string;
  componentId?: string;
  route?: string;
  prop?: string;
  value?: unknown;
  sectionKey?: string;
  order?: string[];
  tokenKey?: string;
  assetId?: string;
  shellId?: string;
  expectedShellVersion?: string;
  authorizeMultiFilePropagation?: boolean;
  metadata?: Record<string, unknown>;
};

export type Site00ShellPropagation = {
  shellId: string;
  expectedVersion: string;
  consumers?: string[];
  excludedPages?: string[];
  scope?: string;
};

export type Site00DesignChangeRequest = {
  id: string;
  change_request_id: string;
  project_id: Site00ProjectKey;
  repo_binding: string;
  status: string;
  design_version: string | null;
  base_source_commit: string | null;
  target_branch: string;
  operations: Site00StructuredOperation[];
  shell_propagation: Site00ShellPropagation | null;
  runtime_bindings: Record<string, unknown>[] | null;
  propagation_exceptions: string[];
  risk_level: string | null;
  metadata: Record<string, unknown>;
  founder_approved_at: string | null;
  fsbw_status: string | null;
  fsbw_applied_commit: string | null;
  fsbw_applied_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Site00ChangeReceipt = {
  id: string;
  change_request_id: string;
  event: Site00ReceiptEvent;
  status: string | null;
  project_id: string | null;
  payload: Record<string, unknown>;
  source_commit_before: string | null;
  source_commit_after: string | null;
  created_at: string;
};

export type Site00RuntimeBindingRow = {
  id: string;
  project_id: Site00ProjectKey;
  route: string | null;
  page_key: string | null;
  binding_type: Site00RuntimeBindingType;
  binding_key: string;
  binding_value: unknown;
  schema_version: string;
  design_version: string | null;
  change_request_id: string | null;
  is_active: boolean;
};

export type MaterializationPlanStatus =
  | 'VALID'
  | 'BLOCKED'
  | 'CONFLICT'
  | 'UNSUPPORTED_OPERATION'
  | 'BLOCKED_SOURCE_DIVERGENCE'
  | 'DUPLICATED_IMPLEMENTATION_RECONCILIATION_REQUIRED';

export type Site00SourceMaterializationPlan = {
  changeRequestId: string;
  projectId: Site00ProjectKey;
  baseCommit: string | null;
  targetBranch: string;
  operations: Site00StructuredOperation[];
  filesExpectedToChange: string[];
  componentsExpectedToChange: string[];
  routesExpectedToChange: string[];
  testsRequired: string[];
  buildRequired: boolean;
  riskLevel: string;
  status: MaterializationPlanStatus;
  blockReason?: string;
  shell?: Site00ShellPropagation;
};

export type MaterializationApplyResult = {
  ok: boolean;
  dryRun: boolean;
  plan: Site00SourceMaterializationPlan;
  filesChanged: string[];
  componentsChanged: string[];
  routesChanged: string[];
  testsPassed?: boolean;
  buildPassed?: boolean;
  commitBefore?: string;
  commitAfter?: string;
  prUrl?: string;
  error?: string;
  receiptIds?: string[];
};

export type BridgeValidationResult = {
  ok: boolean;
  status: MaterializationPlanStatus;
  reason?: string;
  expectedCommit?: string;
  currentCommit?: string;
  affectedTargets?: string[];
};

export type Site00BridgeOptions = {
  repoRoot: string;
  dryRun?: boolean;
  changeId?: string;
  projectFilter?: Site00ProjectKey;
  skipTests?: boolean;
  skipBuild?: boolean;
  /** Inject for tests */
  supabase?: Site00BridgeSupabase;
  execCommand?: (cmd: string, cwd: string) => Promise<{ code: number; stdout: string; stderr: string }>;
  getCurrentCommit?: (repoRoot: string, scopePath: string) => string | null;
};

export type Site00BridgeSupabase = {
  from: (table: string) => Site00BridgeQuery;
};

export type Site00BridgeQuery = {
  select: (cols?: string) => Site00BridgeQuery;
  insert: (row: Record<string, unknown> | Record<string, unknown>[]) => Site00BridgeQuery;
  update: (row: Record<string, unknown>) => Site00BridgeQuery;
  eq: (col: string, val: unknown) => Site00BridgeQuery;
  in: (col: string, vals: unknown[]) => Site00BridgeQuery;
  is: (col: string, val: null) => Site00BridgeQuery;
  order: (col: string, opts?: { ascending?: boolean }) => Site00BridgeQuery;
  limit: (n: number) => Site00BridgeQuery;
  maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
  single: () => Promise<{ data: unknown; error: { message: string } | null }>;
};
