import type { FlowFrictionPoint } from './types';
import { STUDIO_WORLD_MIGRATION_AUDIT } from '../studio-world/migration-audit';

function uid(): string {
  return `flow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function analyzeExperienceFlow(): FlowFrictionPoint[] {
  const friction: FlowFrictionPoint[] = [];

  for (const row of STUDIO_WORLD_MIGRATION_AUDIT) {
    if (row.currentUiPattern === 'scrollable-admin-stage') {
      friction.push({
        id: uid(),
        destination: row.room,
        frictionType: 'awkward-nav',
        observation: 'Founder opens a page instead of walking — movement dies at breadcrumb boundary.',
        architecturalRecommendation: `Rebuild ${row.room} as continuous camera zone inside ${row.building}.`,
      });
    }

    if (row.currentUiPattern === 'immersive-partial-dashboard') {
      friction.push({
        id: uid(),
        destination: row.room,
        frictionType: 'hesitation',
        observation: 'Immersive arrival conflicts with dashboard KPIs — founder pauses at metric grid.',
        architecturalRecommendation: 'Replace statistic grid with living installation; wings as camera pans only.',
      });
      friction.push({
        id: uid(),
        destination: row.room,
        frictionType: 'abrupt-transition',
        observation: 'Wing portals navigate() to legacy URLs — transition breaks presence.',
        architecturalRecommendation: 'Corridor dolly inside single Scene Stack — no route change.',
      });
    }

    if (row.migrationPriority === 'P0' && row.flaggedAsWebpage) {
      friction.push({
        id: uid(),
        destination: row.room,
        frictionType: 'lost',
        observation: 'Executive priority destination still feels like admin software.',
        architecturalRecommendation: `Elevate ${row.room} to P0 immersive rebuild — arrival sequence mandatory.`,
      });
    }
  }

  return friction.slice(0, 24);
}
