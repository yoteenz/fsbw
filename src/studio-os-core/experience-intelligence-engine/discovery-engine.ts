import { DISCOVERY_OPPORTUNITY_TEMPLATES } from './laws';
import type { DiscoveryOpportunity } from './types';
import { STUDIO_WORLD_MIGRATION_AUDIT } from '../studio-world/migration-audit';

function uid(): string {
  return `disc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function recommendDiscoveryOpportunities(limit = 12): DiscoveryOpportunity[] {
  const opportunities: DiscoveryOpportunity[] = [];
  const lowDiscovery = STUDIO_WORLD_MIGRATION_AUDIT.filter(
    (r) => r.flaggedAsWebpage || r.currentUiPattern !== 'immersive-live'
  );

  for (let i = 0; i < Math.min(limit, lowDiscovery.length); i++) {
    const row = lowDiscovery[i]!;
    const template = DISCOVERY_OPPORTUNITY_TEMPLATES[i % DISCOVERY_OPPORTUNITY_TEMPLATES.length]!;
    opportunities.push({
      id: uid(),
      destination: row.room,
      type: template.type,
      suggestion: `${template.suggestion} Target: ${row.building} → ${row.wing}.`,
    });
  }

  const liveRooms = STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.currentUiPattern === 'immersive-live');
  for (const row of liveRooms.slice(0, 3)) {
    opportunities.push({
      id: uid(),
      destination: row.room,
      type: 'environmental-surprise',
      suggestion: 'Deepen an existing live room with a second-layer hidden hotspot — reward return visits.',
    });
  }

  return opportunities;
}
