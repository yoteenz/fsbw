/** studio os Interactive Manual — runtime types (compiled from V2 defs). */

export type ManualNodeKind = 'module' | 'section' | 'page' | 'widget' | 'action' | 'workflow';

export type ManualAnimationType =
  | 'pulse'
  | 'glow'
  | 'arrow'
  | 'blur'
  | 'spotlight'
  | 'scroll'
  | 'zoom'
  | 'tooltip'
  | 'transition'
  | 'none';

export type ManualPanelPosition = 'bottom' | 'center' | 'top' | 'auto';

export type ManualActionType = 'none' | 'open-written-doc' | 'open-knowledge-hub' | 'try-feature';

export type ManualStep = {
  id: string;
  moduleId: string;
  title: string;
  body: string;
  benefit: string;
  targetSelector?: string;
  route?: string;
  animationType: ManualAnimationType;
  position: ManualPanelPosition;
  spotlight: boolean;
  actionLabel?: string;
  actionType?: ManualActionType;
  order: number;
  nodeKind?: ManualNodeKind;
  sectionId?: string;
  widgetId?: string;
  workflowNodes?: string[];
  relatedModuleIds?: string[];
  relatedChapter?: string;
  writtenDocChapter?: string;
  versionIntroduced?: string;
  knowledgeLevel?: 'intro' | 'intermediate' | 'advanced';
};

export type ManualModule = {
  id: string;
  moduleName: string;
  customerName: string;
  productLabel: string;
  description: string;
  route: string;
  estimatedMinutes: number;
  steps: ManualStep[];
  ownersManualChapter?: string;
  relatedModuleIds?: string[];
  versionIntroduced?: string;
  versionUpdated?: string;
};

export type ManualModuleProgressStatus =
  | 'not_started'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'skipped';

export type ManualModuleProgress = {
  moduleId: string;
  status: ManualModuleProgressStatus;
  lastStepId?: string;
  lastStepIndex: number;
  completedStepIds: string[];
  completionPercentage: number;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
};

export type ManualProgressStore = {
  version: 2;
  modules: Record<string, ManualModuleProgress>;
  completedModuleIds: string[];
  completedFeatureIds: string[];
  completedWidgetIds: string[];
  completedWorkflowIds: string[];
  recentlyLearned: string[];
  resumeModuleId?: string;
  resumeStepIndex?: number;
  overallKnowledgePct?: number;
  visitedGraphNodeIds?: string[];
  manualChaptersViewed?: string[];
  workflowsLearned?: string[];
};

export type ManualWhatsNewEntry = {
  id: string;
  moduleId: string;
  version: string;
  title: string;
  summary: string;
  highlightStepId?: string;
  releasedAt: string;
};

export type ManualSearchEntry = {
  id: string;
  query: string;
  keywords: string[];
  moduleId: string;
  stepId?: string;
  label: string;
  snippet: string;
};

export type ManualMissingTargetLog = {
  moduleId: string;
  stepId: string;
  selector: string;
  route: string;
  at: string;
};
