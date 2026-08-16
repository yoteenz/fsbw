import type {
  AutomationRule,
  DocumentRequirementDef,
  ServiceJourney,
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowTemplate,
  WorkflowTemplateVersion,
} from '../workflow/workflowTypes';
import { recalculateWorkflow } from '../workflow/workflowEngine';
import { buildWorkflowContext } from '../workflow/workflowOrchestrator';

const TEAM_PERMITTING = 'team-permitting';

export const WORKFLOW_TEMPLATE_SLUGS = {
  operatingAuthority: 'operating-authority',
  usdot: 'usdot-registration',
  businessFormation: 'business-formation',
  boc3: 'boc-3',
  irp: 'irp-registration',
  ifta: 'ifta-registration',
  insuranceAssistance: 'insurance-assistance',
  dispatchOnboarding: 'dispatch-onboarding',
  factoringOnboarding: 'factoring-onboarding',
  bookkeepingOnboarding: 'bookkeeping-onboarding',
  bookkeepingMonthly: 'bookkeeping-monthly-cycle',
  booksRescue: 'books-rescue-cleanup',
  renewal: 'renewal',
  newCarrierStartup: 'new-carrier-startup',
} as const;

function buildOperatingAuthorityVersion(versionNum: number, versionId: string, templateId: string): WorkflowTemplateVersion {
  const phases = [
    { id: 'phase-info', name: 'Information', customerLabel: 'Information', sortOrder: 1 },
    { id: 'phase-docs', name: 'Documents', customerLabel: 'Documents', sortOrder: 2 },
    { id: 'phase-prep', name: 'Preparation', customerLabel: 'Preparation', sortOrder: 3 },
    { id: 'phase-submit', name: 'Submission', customerLabel: 'Submission', sortOrder: 4 },
    { id: 'phase-process', name: 'Processing', customerLabel: 'External Processing', sortOrder: 5 },
    { id: 'phase-complete', name: 'Completion', customerLabel: 'Completion', sortOrder: 6 },
  ];

  const steps = [
    { id: 'oa-info', phaseId: 'phase-info', name: 'Collect Customer Information', customerLabel: 'Provide business information', stepType: 'customer_action' as const, completionMethod: 'manual' as const, visibility: 'customer_visible' as const, responsibleTeamId: TEAM_PERMITTING, weight: 10 },
    { id: 'oa-docs', phaseId: 'phase-docs', name: 'Request Required Documents', customerLabel: 'Upload required documents', stepType: 'document_request' as const, completionMethod: 'system_verified' as const, visibility: 'customer_visible' as const, responsibleTeamId: TEAM_PERMITTING, documentRequirements: ['dr-articles', 'dr-ein'], weight: 15, skipConditions: [{ id: 'sc1', field: 'entityExists', operator: 'eq' as const, value: 'true' }] },
    { id: 'oa-doc-review', phaseId: 'phase-docs', name: 'Review Documents', customerLabel: 'Document review', stepType: 'document_review' as const, completionMethod: 'staff_verified' as const, visibility: 'customer_summary_only' as const, responsibleTeamId: TEAM_PERMITTING, weight: 10 },
    { id: 'oa-payment', phaseId: 'phase-prep', name: 'Payment Required', customerLabel: 'Complete payment', stepType: 'payment' as const, completionMethod: 'system_verified' as const, visibility: 'customer_visible' as const, paymentGate: 'paid_in_full' as const, weight: 10 },
    { id: 'oa-prep', phaseId: 'phase-prep', name: 'Prepare Filing Package', customerLabel: 'Preparing your filing', stepType: 'staff_action' as const, completionMethod: 'staff_verified' as const, visibility: 'customer_summary_only' as const, responsibleTeamId: TEAM_PERMITTING, weight: 15 },
    { id: 'oa-submit', phaseId: 'phase-submit', name: 'Record External Submission', customerLabel: 'Submission recorded', stepType: 'external_submission' as const, completionMethod: 'staff_verified' as const, visibility: 'customer_visible' as const, responsibleTeamId: TEAM_PERMITTING, weight: 10 },
    { id: 'oa-wait', phaseId: 'phase-process', name: 'Waiting on FMCSA Processing', customerLabel: 'Monitoring external processing', stepType: 'external_wait' as const, completionMethod: 'external_confirmed' as const, visibility: 'customer_summary_only' as const, responsibleTeamId: TEAM_PERMITTING, dueBusinessDays: 7, weight: 20 },
    { id: 'oa-followup', phaseId: 'phase-process', name: 'External Follow-Up', customerLabel: 'Following up with agency', stepType: 'follow_up' as const, completionMethod: 'staff_verified' as const, visibility: 'internal_only' as const, responsibleTeamId: TEAM_PERMITTING, weight: 5 },
    { id: 'oa-complete', phaseId: 'phase-complete', name: 'Service Complete', customerLabel: 'Operating authority assistance complete', stepType: 'completion' as const, completionMethod: 'staff_verified' as const, visibility: 'customer_visible' as const, weight: 5 },
  ];

  const dependencies = [
    { id: 'dep-1', fromStepId: 'oa-info', toStepId: 'oa-docs', kind: 'sequential' as const },
    { id: 'dep-2', fromStepId: 'oa-docs', toStepId: 'oa-doc-review', kind: 'sequential' as const },
    { id: 'dep-3', fromStepId: 'oa-doc-review', toStepId: 'oa-payment', kind: 'sequential' as const },
    { id: 'dep-4', fromStepId: 'oa-payment', toStepId: 'oa-prep', kind: 'sequential' as const },
    { id: 'dep-5', fromStepId: 'oa-prep', toStepId: 'oa-submit', kind: 'sequential' as const },
    { id: 'dep-6', fromStepId: 'oa-submit', toStepId: 'oa-wait', kind: 'sequential' as const },
    { id: 'dep-7', fromStepId: 'oa-wait', toStepId: 'oa-followup', kind: 'sequential' as const },
    { id: 'dep-8', fromStepId: 'oa-followup', toStepId: 'oa-complete', kind: 'sequential' as const },
  ];

  return {
    id: versionId,
    templateId,
    version: versionNum,
    status: 'published',
    publishedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    publishedById: 'staff-1',
    phases,
    steps,
    dependencies,
    transitions: [],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  };
}

function buildUsdotVersion(versionId: string, templateId: string): WorkflowTemplateVersion {
  return {
    id: versionId,
    templateId,
    version: 1,
    status: 'published',
    publishedAt: new Date().toISOString(),
    publishedById: 'staff-1',
    phases: [
      { id: 'u-phase-1', name: 'Information', customerLabel: 'Information', sortOrder: 1 },
      { id: 'u-phase-2', name: 'Documents', customerLabel: 'Documents', sortOrder: 2 },
      { id: 'u-phase-3', name: 'Submission', customerLabel: 'Submission', sortOrder: 3 },
      { id: 'u-phase-4', name: 'Complete', customerLabel: 'Complete', sortOrder: 4 },
    ],
    steps: [
      { id: 'usdot-info', phaseId: 'u-phase-1', name: 'USDOT Information', customerLabel: 'Provide USDOT details', stepType: 'customer_action', completionMethod: 'manual', visibility: 'customer_visible', responsibleTeamId: TEAM_PERMITTING, weight: 20 },
      { id: 'usdot-docs', phaseId: 'u-phase-2', name: 'USDOT Documents', customerLabel: 'Upload supporting documents', stepType: 'document_request', completionMethod: 'system_verified', visibility: 'customer_visible', responsibleTeamId: TEAM_PERMITTING, weight: 30 },
      { id: 'usdot-review', phaseId: 'u-phase-2', name: 'Review USDOT Package', customerLabel: 'Review in progress', stepType: 'document_review', completionMethod: 'staff_verified', visibility: 'customer_summary_only', responsibleTeamId: TEAM_PERMITTING, weight: 20 },
      { id: 'usdot-submit', phaseId: 'u-phase-3', name: 'USDOT Submission', customerLabel: 'Submission recorded', stepType: 'external_submission', completionMethod: 'staff_verified', visibility: 'customer_visible', responsibleTeamId: TEAM_PERMITTING, weight: 15 },
      { id: 'usdot-complete', phaseId: 'u-phase-4', name: 'USDOT Complete', customerLabel: 'USDOT registration complete', stepType: 'completion', completionMethod: 'staff_verified', visibility: 'customer_visible', weight: 15 },
    ],
    dependencies: [
      { id: 'ud-1', fromStepId: 'usdot-info', toStepId: 'usdot-docs', kind: 'sequential' },
      { id: 'ud-2', fromStepId: 'usdot-docs', toStepId: 'usdot-review', kind: 'sequential' },
      { id: 'ud-3', fromStepId: 'usdot-review', toStepId: 'usdot-submit', kind: 'sequential' },
      { id: 'ud-4', fromStepId: 'usdot-submit', toStepId: 'usdot-complete', kind: 'sequential' },
    ],
    transitions: [],
    createdAt: new Date().toISOString(),
  };
}

export function createWorkflowSeedData(now = new Date()) {
  const templateIds = {
    operatingAuthority: 'wtpl-operating-authority',
    usdot: 'wtpl-usdot',
    businessFormation: 'wtpl-business-formation',
    insurance: 'wtpl-insurance-assistance',
    renewal: 'wtpl-renewal',
  };

  const oaV1Id = 'wtv-oa-v1';
  const oaV2Id = 'wtv-oa-v2';
  const usdotV1Id = 'wtv-usdot-v1';

  const templates: WorkflowTemplate[] = [
    { id: templateIds.operatingAuthority, slug: WORKFLOW_TEMPLATE_SLUGS.operatingAuthority, name: 'Operating Authority', serviceType: 'operating_authority', division: 'permitting_compliance', description: 'DEMO — MC/authority filing assistance workflow', jurisdiction: 'federal', currentPublishedVersionId: oaV2Id, isDemo: true },
    { id: templateIds.usdot, slug: WORKFLOW_TEMPLATE_SLUGS.usdot, name: 'USDOT Registration', serviceType: 'usdot', division: 'permitting_compliance', currentPublishedVersionId: usdotV1Id, isDemo: true },
    { id: templateIds.businessFormation, slug: WORKFLOW_TEMPLATE_SLUGS.businessFormation, name: 'Business Formation', serviceType: 'business_formation', division: 'permitting_compliance', isDemo: true },
    { id: templateIds.insurance, slug: WORKFLOW_TEMPLATE_SLUGS.insuranceAssistance, name: 'Insurance Assistance', serviceType: 'insurance_assistance', division: 'insurance', currentPublishedVersionId: 'wtv-insurance-v1', isDemo: true },
    { id: templateIds.renewal, slug: WORKFLOW_TEMPLATE_SLUGS.renewal, name: 'Renewal', serviceType: 'renewal', division: 'permitting_compliance', isDemo: true },
    { id: 'wtpl-bookkeeping-onboarding', slug: WORKFLOW_TEMPLATE_SLUGS.bookkeepingOnboarding, name: 'Bookkeeping Onboarding', serviceType: 'bookkeeping', division: 'bookkeeping', isDemo: true },
    { id: 'wtpl-bookkeeping-monthly', slug: WORKFLOW_TEMPLATE_SLUGS.bookkeepingMonthly, name: 'Monthly Bookkeeping Cycle', serviceType: 'bookkeeping', division: 'bookkeeping', isDemo: true },
    { id: 'wtpl-books-rescue', slug: WORKFLOW_TEMPLATE_SLUGS.booksRescue, name: 'Books Rescue Cleanup', serviceType: 'books_rescue', division: 'bookkeeping', isDemo: true },
    { id: 'wtpl-new-carrier', slug: WORKFLOW_TEMPLATE_SLUGS.newCarrierStartup, name: 'New Carrier Startup Journey', serviceType: 'journey', division: 'permitting_compliance', isDemo: true },
  ];

  const templateVersions: WorkflowTemplateVersion[] = [
    buildOperatingAuthorityVersion(1, oaV1Id, templateIds.operatingAuthority),
    { ...buildOperatingAuthorityVersion(2, oaV2Id, templateIds.operatingAuthority), version: 2 },
    buildUsdotVersion(usdotV1Id, templateIds.usdot),
  ];

  const documentRequirementDefs: DocumentRequirementDef[] = [
    { id: 'dr-articles', documentType: 'articles_of_organization', required: true, reuseAllowed: true, reviewRequired: true, acceptedStatuses: ['verified'] },
    { id: 'dr-ein', documentType: 'ein_letter', required: true, reuseAllowed: true, reviewRequired: true, acceptedStatuses: ['verified'] },
    { id: 'dr-insurance', documentType: 'insurance_certificate', required: true, reuseAllowed: true, reviewRequired: true, acceptedStatuses: ['verified'] },
  ];

  const automationRules: AutomationRule[] = [
    {
      id: 'rule-doc-received',
      name: 'Document received — surface review',
      enabled: true,
      whenEvent: 'DOCUMENT_RECEIVED',
      actions: [{ type: 'CREATE_WORK_ITEM' }, { type: 'SEND_NOTIFICATION' }],
      safetyClass: 'medium_risk',
      dedupeKeyTemplate: 'rule-doc:{dedupeKey}',
      isDemo: true,
    },
    {
      id: 'rule-step-completed',
      name: 'Step completed — recalculate workflow',
      enabled: true,
      whenEvent: 'STEP_COMPLETED',
      actions: [{ type: 'SURFACE_CUSTOMER_ACTION' }],
      safetyClass: 'low_risk',
      dedupeKeyTemplate: 'rule-step:{dedupeKey}',
      isDemo: true,
    },
    {
      id: 'rule-workflow-started',
      name: 'Workflow started notification',
      enabled: true,
      whenEvent: 'WORKFLOW_STARTED',
      actions: [{ type: 'SEND_NOTIFICATION' }],
      safetyClass: 'medium_risk',
      dedupeKeyTemplate: 'rule-wf-start:{dedupeKey}',
      isDemo: true,
    },
  ];

  // Demo Journey 1 — Start My Trucking Business (client-a)
  const journeyId = 'journey-client-a-startup';
  const wfInstanceOaId = 'wfi-oa-client-a';
  const oaVersion = templateVersions.find((v) => v.id === oaV1Id)!;

  const stepInstances: WorkflowStepInstance[] = oaVersion.steps.map((step) => {
    const completed = ['oa-info', 'oa-docs', 'oa-doc-review', 'oa-payment', 'oa-prep', 'oa-submit'].includes(step.id);
    const active = step.id === 'oa-wait';
    return {
      id: `wsi-${step.id}-a`,
      workflowInstanceId: wfInstanceOaId,
      stepTemplateId: step.id,
      phaseId: step.phaseId,
      status: completed ? 'completed' : active ? 'waiting_external' : 'pending',
      waitingOn: completed ? 'none' : active ? 'external' : 'none',
      assignedTeamId: step.responsibleTeamId,
      startedAt: completed || active ? daysAgo(now, 2) : undefined,
      completedAt: completed ? daysAgo(now, 1) : undefined,
      version: 1,
    };
  });

  const oaInstance: WorkflowInstance = {
    id: wfInstanceOaId,
    templateVersionId: oaV1Id,
    templateId: templateIds.operatingAuthority,
    organizationId: 'client-a',
    serviceRequestId: 'req-1',
    journeyId,
    status: 'waiting_external',
    currentPhaseId: 'phase-process',
    progress: 0,
    startedAt: daysAgo(now, 5),
    createdById: 'staff-2',
    version: 1,
    isDemo: true,
  };

  const context = buildWorkflowContext(
    { documents: [], requests: [{ id: 'req-1', clientId: 'client-a', billingStatus: 'paid' }] } as never,
    'client-a',
    'req-1',
  );
  const recalc = recalculateWorkflow(oaInstance, stepInstances, oaVersion, context);

  const usdotInstanceId = 'wfi-usdot-client-a';
  const usdotVersion = templateVersions.find((v) => v.id === usdotV1Id)!;
  const usdotSteps: WorkflowStepInstance[] = usdotVersion.steps.map((step) => ({
    id: `wsi-usdot-${step.id}`,
    workflowInstanceId: usdotInstanceId,
    stepTemplateId: step.id,
    phaseId: step.phaseId,
    status: step.id === 'usdot-info' ? 'completed' : step.id === 'usdot-docs' ? 'waiting_on_customer' : 'pending',
    waitingOn: step.id === 'usdot-docs' ? 'customer' : 'none',
    assignedTeamId: step.responsibleTeamId,
    startedAt: step.id === 'usdot-info' || step.id === 'usdot-docs' ? daysAgo(now, 1) : undefined,
    completedAt: step.id === 'usdot-info' ? daysAgo(now, 0) : undefined,
    version: 1,
  }));

  const usdotInstance: WorkflowInstance = {
    id: usdotInstanceId,
    templateVersionId: usdotV1Id,
    templateId: templateIds.usdot,
    organizationId: 'client-a',
    journeyId,
    status: 'waiting_on_customer',
    currentPhaseId: 'u-phase-2',
    progress: 20,
    startedAt: daysAgo(now, 3),
    version: 1,
    isDemo: true,
  };

  const journeys: ServiceJourney[] = [
    {
      id: journeyId,
      slug: WORKFLOW_TEMPLATE_SLUGS.newCarrierStartup,
      name: 'Start My Trucking Business',
      organizationId: 'client-a',
      templateSlug: WORKFLOW_TEMPLATE_SLUGS.newCarrierStartup,
      status: 'active',
      progress: 35,
      workflowInstanceIds: [wfInstanceOaId, usdotInstanceId],
      startedAt: daysAgo(now, 10),
      isDemo: true,
    },
  ];

  return {
    workflowTemplates: templates,
    workflowTemplateVersions: templateVersions,
    documentRequirementDefs,
    automationRules,
    workflowInstances: [recalc.instance, usdotInstance],
    workflowStepInstances: [...recalc.steps, ...usdotSteps],
    workflowEvents: [],
    automationExecutions: [],
    automationExceptions: [],
    workflowReminders: [],
    serviceJourneys: journeys,
    workflowKillSwitch: { allNonEssentialDisabled: false, disabledRuleIds: [], disabledTemplateAutomationIds: [] },
  };
}

function daysAgo(now: Date, d: number): string {
  return new Date(now.getTime() - d * 86400000).toISOString();
}

export function resolveTemplateIdForService(slug: string): string | undefined {
  const map: Record<string, string> = {
    'operating-authority': 'wtpl-operating-authority',
    authority: 'wtpl-operating-authority',
    usdot: 'wtpl-usdot',
    'usdot-registration': 'wtpl-usdot',
    'business-formation': 'wtpl-business-formation',
    llc: 'wtpl-business-formation',
    'boc-3': 'wtpl-operating-authority',
    irp: 'wtpl-operating-authority',
    insurance: 'wtpl-insurance-assistance',
    bookkeeping: 'wtpl-bookkeeping-onboarding',
    'bookkeeping-essentials': 'wtpl-bookkeeping-onboarding',
    'bookkeeping-plus': 'wtpl-bookkeeping-onboarding',
    'all-in-one-bookkeeping': 'wtpl-bookkeeping-onboarding',
    'books-rescue': 'wtpl-books-rescue',
    renewal: 'wtpl-renewal',
  };
  return map[slug.toLowerCase()] ?? map[slug];
}
