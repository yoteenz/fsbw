import type { TutorialStep, TutorialTour } from '../types';
import { ONBOARDING_TUTORIAL_LABEL } from '../constants';
import type { TutorialNodeDef, TutorialTourDefinitionV2 } from './schema';

function nodeMap(nodes: TutorialNodeDef[]): Map<string, TutorialNodeDef> {
  return new Map(nodes.map((n) => [n.id, n]));
}

/** Compile a V2 definition into a runtime tour with flat steps (data-driven). */
export function compileTourDefinitionV2(def: TutorialTourDefinitionV2): TutorialTour {
  const byId = nodeMap(def.nodes);
  const steps: TutorialStep[] = [];
  let order = 1;

  for (const nodeId of def.linearNodeIds) {
    const node = byId.get(nodeId);
    if (!node) continue;
    steps.push({
      id: node.id,
      tourId: def.id,
      title: node.title,
      body: node.body,
      benefit: node.benefit,
      route: node.route,
      targetSelector: node.targetSelector,
      animationType: node.animationType,
      position: node.position,
      spotlight: node.spotlight,
      requiresLogin: node.requiresLogin,
      actionLabel: node.actionLabel,
      actionRoute: node.actionRoute,
      completionTrigger: node.completionTrigger,
      previewKey: node.previewKey,
      order: order++,
      nodeKind: node.kind,
      pageId: node.pageId ?? (node.kind === 'page' ? node.id : node.pageId),
      featureId: node.featureId,
      widgetId: node.widgetId ?? (node.kind === 'widget' ? node.id : undefined),
      featureCards: node.featureCards,
      relatedTutorialIds: node.relatedTutorialIds,
      suggestedNextTutorialId: node.suggestedNextTutorialId,
    });
  }

  return {
    id: def.id,
    moduleName: def.moduleName,
    customerName: def.customerName,
    optionalLabel: def.productLabel ?? ONBOARDING_TUTORIAL_LABEL,
    description: def.description,
    estimatedMinutes: def.estimatedMinutes,
    status: def.status,
    featured: def.featured,
    achievementId: def.achievementId,
    steps,
  };
}

export function compileAllTourDefinitionsV2(defs: TutorialTourDefinitionV2[]): TutorialTour[] {
  return defs.map(compileTourDefinitionV2);
}
