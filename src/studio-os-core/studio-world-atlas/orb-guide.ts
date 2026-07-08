import type { AtlasNode, AtlasOrbRecommendation } from './types';

function uid(): string {
  return `orb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Studio Orb™ world guide — recommends where the founder should go next */
export function buildAtlasOrbRecommendations(nodes: AtlasNode[]): AtlasOrbRecommendation[] {
  const recs: AtlasOrbRecommendation[] = [];
  const active = nodes.filter((n) => n.activity === 'generating' || n.activity === 'pulse');
  const fogged = nodes.filter((n) => n.fogged && n.unlocked);
  const command = nodes.find((n) => n.id.includes('studio-command-center') && n.level === 1);

  if (command?.activity === 'pulse') {
    recs.push({
      id: uid(),
      message: 'Studio Command Center™ is highly active today — the Organization Pulse Core awaits.',
      targetNodeId: command.id,
      priority: 'high',
    });
  }

  const creative = nodes.find((n) => n.flagshipId === 'creative-direction-studio' && n.level === 1);
  if (creative && creative.activity === 'generating') {
    recs.push({
      id: uid(),
      message: 'Creative Direction Studio has pending Golden Build layers — Scene Stack™ is assembling.',
      targetNodeId: creative.id,
      priority: 'high',
    });
  }

  const archives = nodes.find((n) => n.flagshipId === 'studio-archives' && n.level === 1);
  if (archives) {
    recs.push({
      id: uid(),
      message: 'Studio Archives™ Museum Wing has new assets ready for retrieval.',
      targetNodeId: archives.id,
      priority: 'medium',
    });
  }

  const intel = nodes.find((n) => n.displayName.includes('Intelligence') || n.id.includes('intelligence'));
  if (intel) {
    recs.push({
      id: uid(),
      message: 'Intelligence Headquarters discovered three opportunities worth your attention.',
      targetNodeId: intel.id,
      priority: 'medium',
    });
  }

  if (fogged.length > 0) {
    recs.push({
      id: uid(),
      message: `${fogged.length} wings remain in Fog of Discovery™ — expand your company to reveal them.`,
      targetNodeId: fogged[0]!.id,
      priority: 'low',
    });
  }

  if (active.length === 0) {
    recs.push({
      id: uid(),
      message: 'Walk the campus — discovery rewards curiosity more than fast travel.',
      targetNodeId: 'atlas-world-root',
      priority: 'low',
    });
  }

  return recs.slice(0, 4);
}
