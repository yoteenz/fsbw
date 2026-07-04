import type { ManualModule, ManualStep } from './types';
import { STUDIO_INTERACTIVE_MANUAL_LABEL } from './constants';
import type { ManualModuleDefinitionV2, ManualNodeDef } from './schema';

function nodeMap(nodes: ManualNodeDef[]): Map<string, ManualNodeDef> {
  return new Map(nodes.map((n) => [n.id, n]));
}

export function compileManualModuleDefinition(def: ManualModuleDefinitionV2): ManualModule {
  const byId = nodeMap(def.nodes);
  const steps: ManualStep[] = [];
  let order = 1;

  for (const nodeId of def.linearNodeIds) {
    const node = byId.get(nodeId);
    if (!node) continue;
    steps.push({
      id: node.id,
      moduleId: def.id,
      title: node.title,
      body: node.body,
      benefit: node.benefit,
      route: node.route ?? def.route,
      targetSelector: node.targetSelector,
      animationType: node.animationType,
      position: node.position,
      spotlight: node.spotlight,
      actionLabel: node.actionLabel,
      actionType: node.actionType,
      order: order++,
      nodeKind: node.kind,
      sectionId: node.sectionId ?? (node.kind === 'section' ? node.id : undefined),
      widgetId: node.widgetId ?? (node.kind === 'widget' ? node.id : undefined),
      workflowNodes: node.workflowNodes,
      relatedModuleIds: node.relatedModuleIds ?? def.relatedModuleIds,
      relatedChapter: node.relatedChapter ?? def.ownersManualChapter,
      writtenDocChapter: node.writtenDocChapter ?? def.ownersManualChapter,
      versionIntroduced: node.versionIntroduced ?? def.versionIntroduced,
      knowledgeLevel: node.knowledgeLevel,
    });
  }

  return {
    id: def.id,
    moduleName: def.moduleName,
    customerName: def.customerName,
    productLabel: STUDIO_INTERACTIVE_MANUAL_LABEL,
    description: def.description,
    route: def.route,
    estimatedMinutes: def.estimatedMinutes,
    steps,
    ownersManualChapter: def.ownersManualChapter,
    relatedModuleIds: def.relatedModuleIds,
    versionIntroduced: def.versionIntroduced,
    versionUpdated: def.versionUpdated,
  };
}

export function compileAllManualDefinitions(defs: ManualModuleDefinitionV2[]): ManualModule[] {
  return defs.map(compileManualModuleDefinition);
}

export function findManualStepIndex(moduleId: string, stepId: string, modules: ManualModule[]): number {
  const mod = modules.find((m) => m.id === moduleId);
  return mod?.steps.findIndex((s) => s.id === stepId) ?? -1;
}
