import { readInteractionModelStore } from '../persistence';
import type { InteractionModelRegistryStats, StudioInteraction } from '../types';
import { CANONICAL_INTERACTION_TYPES } from '../constants';

/** Interaction Registry™ */
export function listInteractionRegistry(): StudioInteraction[] {
  return readInteractionModelStore().interactions;
}

export function getInteractionRegistryStats(): Pick<
  InteractionModelRegistryStats,
  'interactionCount' | 'pendingInteractionCount'
> {
  const interactions = listInteractionRegistry();
  return {
    interactionCount: interactions.length,
    pendingInteractionCount: interactions.filter(
      (i) => i.status === 'requested' || i.status === 'in_progress' || i.status === 'accepted'
    ).length,
  };
}

export function searchInteractionRegistry(query: string, limit = 20): StudioInteraction[] {
  const q = query.trim().toLowerCase();
  if (!q) return listInteractionRegistry().slice(0, limit);

  return listInteractionRegistry()
    .map((item) => {
      let score = 0;
      if (item.interactionId.toLowerCase().includes(q)) score += 6;
      if (item.officialName.toLowerCase().includes(q)) score += 5;
      if (item.interactionType.toLowerCase().includes(q)) score += 4;
      if (item.initiatorObjectId.toLowerCase().includes(q)) score += 2;
      if (item.recipientObjectId.toLowerCase().includes(q)) score += 2;
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function listInteractionsByType(
  interactionType: StudioInteraction['interactionType']
): StudioInteraction[] {
  return listInteractionRegistry().filter((i) => i.interactionType === interactionType);
}

export function listInteractionsByStatus(status: StudioInteraction['status']): StudioInteraction[] {
  return listInteractionRegistry().filter((i) => i.status === status);
}

export function listInteractionsForObject(objectId: string): StudioInteraction[] {
  return listInteractionRegistry().filter(
    (i) =>
      i.initiatorObjectId === objectId ||
      i.recipientObjectId === objectId ||
      i.participants.some((p) => p.objectId === objectId)
  );
}

export function getInteractionTypeCoverage(): { type: string; count: number }[] {
  return CANONICAL_INTERACTION_TYPES.map((type) => ({
    type,
    count: listInteractionsByType(type).length,
  }));
}

export function listInteractionsByWorkflow(workflowId: string): StudioInteraction[] {
  return listInteractionRegistry().filter((i) => i.workflowId === workflowId);
}

export function listInteractionsByCorrelation(correlationId: string): StudioInteraction[] {
  return listInteractionRegistry().filter((i) => i.correlationId === correlationId);
}
