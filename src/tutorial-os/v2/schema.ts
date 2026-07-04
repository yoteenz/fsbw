import type {
  TutorialAnimationType,
  TutorialCompletionTrigger,
  TutorialPanelPosition,
  TutorialTourStatus,
} from '../types';

/** Tour → Page → Feature → Widget → Action hierarchy (unlimited nesting via nestedTourId). */
export type TutorialNodeKind = 'page' | 'section' | 'feature' | 'widget' | 'action';

export type TutorialFeatureCardDef = {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  showMeRoute?: string;
  targetSelector?: string;
  /** Opens a dedicated nested walkthrough tour. */
  nestedTourId: string;
};

export type TutorialNodeDef = {
  id: string;
  kind: TutorialNodeKind;
  title: string;
  body: string;
  benefit: string;
  route?: string;
  targetSelector?: string;
  animationType: TutorialAnimationType;
  position: TutorialPanelPosition;
  spotlight: boolean;
  requiresLogin?: boolean;
  actionLabel?: string;
  actionRoute?: string;
  completionTrigger: TutorialCompletionTrigger;
  previewKey?: string;
  parentId?: string;
  pageId?: string;
  featureId?: string;
  widgetId?: string;
  /** Page-level cards — tap SHOW ME to open nestedTourId. */
  featureCards?: TutorialFeatureCardDef[];
  relatedTutorialIds?: string[];
  suggestedNextTutorialId?: string;
  searchKeywords?: string[];
};

export type TutorialTourDefinitionV2 = {
  id: string;
  moduleName: string;
  customerName: string;
  productLabel?: string;
  description: string;
  estimatedMinutes: number;
  status: TutorialTourStatus;
  featured?: boolean;
  achievementId?: string;
  /** Explicit linear order of node ids for the wizard (supports dynamic step counts). */
  linearNodeIds: string[];
  nodes: TutorialNodeDef[];
  /** Optional nested tours referenced by featureCards / relatedTutorialIds. */
  nestedTourIds?: string[];
};

export type TutorialPageRegistryEntry = {
  id: string;
  title: string;
  route: string;
  routeMatch?: RegExp;
  primaryTourId?: string;
  helpTourId?: string;
  searchKeywords: string[];
};

export type TutorialSearchEntry = {
  id: string;
  query: string;
  keywords: string[];
  tourId: string;
  stepId?: string;
  label: string;
  snippet: string;
};

export type TutorialProgressV2Extras = {
  completedPageIds: string[];
  completedFeatureIds: string[];
  completedWidgetIds: string[];
  recentlyLearned: string[];
  suggestedNextTutorialId?: string;
};
