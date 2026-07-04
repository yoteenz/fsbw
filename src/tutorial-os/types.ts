/** Tutorial OS — reusable guided walkthrough schema for Frontal Slayer / StudioOS. */

export type TutorialNodeKind = 'page' | 'section' | 'feature' | 'widget' | 'action';

export type TutorialFeatureCardDef = {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  showMeRoute?: string;
  targetSelector?: string;
  nestedTourId: string;
};

export type TutorialAnimationType =
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

export type TutorialPanelPosition = 'bottom' | 'center' | 'top' | 'auto';

export type TutorialCompletionTrigger = 'manual' | 'action' | 'view' | 'route';

export type TutorialStep = {
  id: string;
  tourId: string;
  title: string;
  body: string;
  benefit: string;
  /** CSS selector for highlight target — optional. */
  targetSelector?: string;
  /** Route to navigate before showing this step. */
  route?: string;
  animationType: TutorialAnimationType;
  position: TutorialPanelPosition;
  spotlight: boolean;
  requiresLogin?: boolean;
  actionLabel?: string;
  actionRoute?: string;
  completionTrigger: TutorialCompletionTrigger;
  order: number;
  /** Preview chip / icon key for wizard preview area. */
  previewKey?: string;
  /** V2 — hierarchy metadata (data-driven). */
  nodeKind?: TutorialNodeKind;
  pageId?: string;
  featureId?: string;
  widgetId?: string;
  featureCards?: TutorialFeatureCardDef[];
  relatedTutorialIds?: string[];
  suggestedNextTutorialId?: string;
};

export type TutorialTourStatus = 'enabled' | 'disabled' | 'draft';

export type TutorialTour = {
  id: string;
  /** Internal module name */
  moduleName: string;
  /** Customer-facing label */
  customerName: string;
  optionalLabel?: string;
  description: string;
  estimatedMinutes: number;
  status: TutorialTourStatus;
  steps: TutorialStep[];
  /** Placeholder achievement id on completion */
  achievementId?: string;
  featured?: boolean;
};

export type TutorialTourProgressStatus =
  | 'not_started'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'dismissed';

export type TutorialTourProgress = {
  tourId: string;
  status: TutorialTourProgressStatus;
  lastStepId?: string;
  lastStepIndex: number;
  completedStepIds: string[];
  completionPercentage: number;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  dismissedAt?: string;
  updatedAt: string;
};

export type TutorialProgressStore = {
  version: 2;
  tours: Record<string, TutorialTourProgress>;
  welcomeDismissedAt?: string;
  welcomeMaybeLaterAt?: string;
  earnedAchievementIds: string[];
  /** V2 granular completion tracking. */
  completedPageIds?: string[];
  completedFeatureIds?: string[];
  completedWidgetIds?: string[];
  recentlyLearned?: string[];
  suggestedNextTutorialId?: string;
};

export type TutorialMissingTargetLog = {
  tourId: string;
  stepId: string;
  selector: string;
  route: string;
  at: string;
};
