import { getStudioIntelligenceLayerReadyView } from '../../studio-intelligence-layer/engine';
import type { XcosConsumerSystem } from '../constants';
import { hasGovernanceViolations } from './creative-governance-engine';
import { countEconomyAssets } from './creative-economy-registry';
import { listCreativeMemory } from './creative-memory-engine';
import { listBoardMeetings } from './board-meeting-engine';

export function listCreativeConsumerBindings(): { system: XcosConsumerSystem; status: string }[] {
  const pendingDecisions = listBoardMeetings().filter((m) => m.founderDecision === 'pending').length;
  const memoryCount = listCreativeMemory().length;
  const economyCount = countEconomyAssets();
  const violations = hasGovernanceViolations();

  let silStatus = 'ready';
  try {
    getStudioIntelligenceLayerReadyView();
  } catch {
    silStatus = 'degraded';
  }

  return [
    { system: 'studio-intelligence-layer', status: `Executive reasoning ${silStatus}` },
    { system: 'studio-production-system', status: 'Production packages linked to board meetings' },
    { system: 'narrative-intelligence', status: 'Narrative Blueprints archived to Creative Memory™' },
    { system: 'brand-discovery-engine', status: 'Brand Director evidence source active' },
    {
      system: 'institute-of-knowledge',
      status: `${memoryCount} Creative Memory records linked`,
    },
    {
      system: 'executive-headquarters',
      status: pendingDecisions > 0 ? `${pendingDecisions} founder decision(s) pending` : 'Creative initiatives visible',
    },
    { system: 'mission-control', status: 'Initiative status + blockers surfaced' },
    { system: 'company-genome', status: 'Strategic creative patterns available' },
    { system: 'studio-foundry', status: `${economyCount} reusable assets available` },
    {
      system: 'orb',
      status: violations ? 'Governance violations require founder briefing' : 'Board interpreter ready',
    },
  ];
}
