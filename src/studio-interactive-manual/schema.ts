import type { ManualAnimationType, ManualActionType, ManualPanelPosition } from './types';

export type ManualNodeKind = 'module' | 'section' | 'page' | 'widget' | 'action' | 'workflow';

export type ManualNodeDef = {
  id: string;
  kind: ManualNodeKind;
  title: string;
  body: string;
  benefit: string;
  route?: string;
  targetSelector?: string;
  animationType: ManualAnimationType;
  position: ManualPanelPosition;
  spotlight: boolean;
  actionLabel?: string;
  actionType?: ManualActionType;
  sectionId?: string;
  widgetId?: string;
  workflowNodes?: string[];
  relatedModuleIds?: string[];
  relatedChapter?: string;
  writtenDocChapter?: string;
  versionIntroduced?: string;
  knowledgeLevel?: 'intro' | 'intermediate' | 'advanced';
  searchKeywords?: string[];
};

export type ManualModuleDefinitionV2 = {
  id: string;
  moduleName: string;
  customerName: string;
  description: string;
  route: string;
  estimatedMinutes: number;
  linearNodeIds: string[];
  nodes: ManualNodeDef[];
  ownersManualChapter?: string;
  relatedModuleIds?: string[];
  versionIntroduced?: string;
  versionUpdated?: string;
};
