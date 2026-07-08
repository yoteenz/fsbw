import type { AtlasBuildingMemory, AtlasNode } from './types';

export function seedBuildingMemoryForNode(node: AtlasNode, companyName: string): AtlasBuildingMemory | null {
  if (!node.flagshipId || node.level > 3) return null;
  if (node.fogged || node.id === 'future-districts') return null;

  const base: AtlasBuildingMemory = {
    nodeId: node.id,
    displayName: node.displayName,
    constructedAt: new Date(Date.now() - 86_400_000 * 120).toISOString(),
    reason: `${companyName} flagship destination — permanent Studio World presence.`,
    milestones: ['FOUNDING CAMPUS', 'SCENE STACK™ LIVE'],
    generationCost: node.migrationStatus === 'immersive-live' ? '$$' : '$',
    creativeBudgetUsed: node.migrationStatus === 'immersive-live' ? '12%' : '4%',
    creativeEquityGained: node.migrationStatus === 'immersive-live' ? '+8' : '+2',
  };

  if (node.flagshipId === 'creative-direction-studio') {
    return {
      ...base,
      enabledByBlueprint: 'Creative Direction Golden Build™',
      unlockedByExpedition: 'Creative Genesis Expedition™',
      milestones: [...base.milestones, 'GOLDEN BUILD MONUMENT', 'STORY TABLE™ OPENED'],
    };
  }
  if (node.flagshipId === 'studio-warehouse') {
    return {
      ...base,
      enabledByBlueprint: 'Warehouse Manufacturing Blueprint™',
      milestones: [...base.milestones, 'PRODUCTION WING LIVE', 'ASSET REGISTRY™ OPEN'],
    };
  }
  if (node.flagshipId === 'studio-archives') {
    return {
      ...base,
      enabledByBlueprint: 'Studio Archives Preservation Blueprint™',
      milestones: [...base.milestones, 'MUSEUM WING ILLUMINATED'],
    };
  }
  if (node.flagshipId === 'marketplace') {
    return {
      ...base,
      enabledByBlueprint: 'Marketplace Pavilion Blueprint™',
      milestones: [...base.milestones, 'LICENSING HALL OPEN'],
      reason: 'Distribution layer — everything here originated in another flagship.',
    };
  }
  if (node.flagshipId === 'studio-command-center') {
    return {
      ...base,
      enabledByBlueprint: 'Command Center Executive Atrium™',
      milestones: [...base.milestones, 'ATLAS HOLOGRAPHIC TABLE', 'ARCHITECTURE OBSERVATORY™'],
    };
  }
  if (node.flagshipId === 'expedition-hub') {
    return {
      ...base,
      unlockedByExpedition: 'Business Discovery Blueprint™',
      reason: 'Unlocked through guided company evolution expedition.',
    };
  }

  return base;
}

export function buildDefaultBuildingMemories(nodes: AtlasNode[], companyName: string): AtlasBuildingMemory[] {
  const seen = new Set<string>();
  const memories: AtlasBuildingMemory[] = [];
  for (const node of nodes) {
    if (seen.has(node.id)) continue;
    const mem = seedBuildingMemoryForNode(node, companyName);
    if (mem) {
      seen.add(node.id);
      memories.push(mem);
    }
  }
  return memories;
}

export function getBuildingMemory(
  nodeId: string,
  memories: AtlasBuildingMemory[]
): AtlasBuildingMemory | undefined {
  return memories.find((m) => m.nodeId === nodeId);
}

export function formatMemoryTimeline(memories: AtlasBuildingMemory[]): AtlasBuildingMemory[] {
  return [...memories].sort(
    (a, b) => new Date(a.constructedAt).getTime() - new Date(b.constructedAt).getTime()
  );
}
