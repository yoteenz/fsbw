import { getOrganizationAmbientAwarenessProfile } from '../ambient-awareness/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { EXECUTIVE_PRESENCE_LABELS } from './constants';
import type { ExecutivePresenceMoment } from './types';

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function buildExecutivePresenceMoments(organizationId: string, companyName: string): ExecutivePresenceMoment[] {
  const now = new Date().toISOString();
  const pulse = getOrganizationPulseProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const awareness = getOrganizationAmbientAwarenessProfile(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);

  const moments: ExecutivePresenceMoment[] = [];

  moments.push({
    id: `presence-${organizationId}-welcome`,
    type: 'daily-welcome',
    label: EXECUTIVE_PRESENCE_LABELS['daily-welcome'],
    message: `${timeGreeting()}. ${companyName} is in motion — I'm here when you need me, quiet when you don't.`,
    tone: 'warm',
    deliveredAt: now,
  });

  if (blueprint && blueprint.overallProgressPct >= 50) {
    moments.push({
      id: `presence-${organizationId}-accomplishment`,
      type: 'acknowledge-accomplishment',
      label: EXECUTIVE_PRESENCE_LABELS['acknowledge-accomplishment'],
      message: `Discovery progress at ${blueprint.overallProgressPct}% — meaningful work completed. Well done.`,
      tone: 'professional',
      deliveredAt: now,
    });
  }

  if (blueprint && blueprint.milestonesCelebrated.length > 0) {
    moments.push({
      id: `presence-${organizationId}-milestone`,
      type: 'celebrate-milestone',
      label: EXECUTIVE_PRESENCE_LABELS['celebrate-milestone'],
      message: `${blueprint.milestonesCelebrated.length} milestone(s) celebrated — the organization is building something lasting.`,
      tone: 'celebratory',
      deliveredAt: now,
    });
  }

  if (cognitive && (cognitive.loadState === 'elevated' || cognitive.loadState === 'critical')) {
    moments.push({
      id: `presence-${organizationId}-difficult`,
      type: 'recognize-difficult-period',
      label: EXECUTIVE_PRESENCE_LABELS['recognize-difficult-period'],
      message: 'This is a demanding stretch — your focus is protected. One decision at a time.',
      tone: 'supportive',
      deliveredAt: now,
    });
    moments.push({
      id: `presence-${organizationId}-encouragement`,
      type: 'encouragement',
      label: EXECUTIVE_PRESENCE_LABELS.encouragement,
      message: 'The organization is moving forward. Steady progress matters more than perfect days.',
      tone: 'supportive',
      deliveredAt: now,
    });
  }

  const month = new Date().getMonth();
  if (month === 6) {
    moments.push({
      id: `presence-${organizationId}-anniversary`,
      type: 'anniversary',
      label: EXECUTIVE_PRESENCE_LABELS.anniversary,
      message: `${companyName} anniversary season — a moment to reflect on how far you've come.`,
      tone: 'warm',
      deliveredAt: now,
    });
  }

  const customer = pulse?.indicatorScores.find((i) => /customer/i.test(i.label));
  if (customer && customer.scorePct >= 75) {
    moments.push({
      id: `presence-${organizationId}-customer`,
      type: 'customer-milestone',
      label: EXECUTIVE_PRESENCE_LABELS['customer-milestone'],
      message: `Customer experience at ${customer.scorePct}% — relationships strengthening across the organization.`,
      tone: 'celebratory',
      deliveredAt: now,
    });
  }

  if (brain && brain.brains.length >= 3) {
    moments.push({
      id: `presence-${organizationId}-employee`,
      type: 'employee-achievement',
      label: EXECUTIVE_PRESENCE_LABELS['employee-achievement'],
      message: `${brain.brains.length} department teams contributing — institutional expertise compounding daily.`,
      tone: 'professional',
      deliveredAt: now,
    });
  }

  if (awareness && awareness.awarenessScore >= 80) {
    moments.push({
      id: `presence-${organizationId}-continuity`,
      type: 'acknowledge-accomplishment',
      label: 'Organizational Continuity',
      message: 'Context synchronized across every Concierge — continuity you can feel, not software you manage.',
      tone: 'warm',
      deliveredAt: now,
    });
  }

  return moments.slice(0, 8);
}
