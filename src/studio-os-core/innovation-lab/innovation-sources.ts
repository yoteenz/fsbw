import { ensureOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationExecutiveHistoryProfile } from '../executive-timeline/history-store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationFounderOperatingSystemProfile } from '../founder-operating-system/store';
import { getOrganizationKnowledgeCommerceProfile } from '../knowledge-commerce/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationWorldKnowledgeProfile } from '../world-knowledge-engine/store';
import { INNOVATION_SOURCE_LABELS, INNOVATION_SOURCES } from './constants';
import type { InnovationSourceContribution, InnovationSourceId } from './types';

function source(
  sourceId: InnovationSourceId,
  active: boolean,
  contributionCount: number,
  latestInsight: string
): InnovationSourceContribution {
  return {
    sourceId,
    label: INNOVATION_SOURCE_LABELS[sourceId],
    active,
    contributionCount,
    latestInsight,
  };
}

export function buildInnovationSourceContributions(organizationId: string): InnovationSourceContribution[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const pulse = getOrganizationPulseProfile(organizationId);
  const commerce = getOrganizationKnowledgeCommerceProfile(organizationId);
  const world = getOrganizationWorldKnowledgeProfile(organizationId);
  const history = getOrganizationExecutiveHistoryProfile(organizationId);
  const founder = getOrganizationFounderOperatingSystemProfile(organizationId);

  const brainCount = brain?.brains.length ?? 0;
  const worldSignals = world?.signalsSurfaced ?? 0;
  const commerceStreams = commerce?.products.length ?? 0;
  const historyEvents = history?.events.length ?? 0;

  const contributions: InnovationSourceContribution[] = [
    source(
      'profession-brain',
      Boolean(brain),
      brainCount * 2 + 3,
      brain
        ? `${brainCount} Profession Brains™ feeding innovation — expertise patterns detected.`
        : 'Profession Brain™ pending — innovation will strengthen when brains are active.'
    ),
    source(
      'organization-genome',
      Boolean(genome),
      genome ? 4 : 0,
      genome
        ? `Genome identity "${genome.brandVoice.brandPersonality.slice(0, 40)}…" shapes innovation direction.`
        : 'Organization Genome™ will align ideas with organizational identity.'
    ),
    source(
      'business-discovery-blueprint',
      blueprint.overallProgressPct >= 40,
      Math.round(blueprint.overallProgressPct / 10) + 2,
      `Blueprint ${blueprint.overallProgressPct}% complete — services and growth chapters fuel ideation.`
    ),
    source(
      'customer-feedback',
      pulse?.indicatorScores.some((i) => i.id === 'customer-satisfaction') ?? false,
      pulse ? 3 : 1,
      pulse
        ? 'Customer satisfaction patterns suggest recurring problems worth solving with new services.'
        : 'Customer feedback channel ready — recurring problems will trigger innovation.'
    ),
    source(
      'executive-council',
      Boolean(council?.latestBriefing),
      council?.decisionHistory.length ?? 0,
      council?.latestBriefing
        ? 'Executive Council™ strategic discussions surface expansion and product opportunities.'
        : 'Council meetings will feed strategic ideation when convened.'
    ),
    source(
      'organization-pulse',
      Boolean(pulse),
      pulse?.indicatorScores.length ?? 0,
      pulse
        ? `Pulse state ${pulse.pulseState} — weak areas become innovation targets.`
        : 'Organization Pulse™ will identify innovation opportunities from organizational health.'
    ),
    source(
      'knowledge-commerce',
      Boolean(commerce),
      commerceStreams + 2,
      commerce
        ? `${commerceStreams} knowledge revenue streams — monetization patterns suggest new products.`
        : 'Knowledge Commerce™ will convert expertise into innovation categories.'
    ),
    source(
      'market-trends',
      worldSignals >= 2,
      worldSignals,
      world?.filteredSignals.find((s) => s.category === 'market-trends')?.headline ??
        'Market trend monitoring active via World Knowledge Engine.'
    ),
    source(
      'competitor-analysis',
      worldSignals >= 1,
      world?.filteredSignals.filter((s) => s.category === 'competitor-activity').length ?? 0,
      world?.filteredSignals.find((s) => s.category === 'competitor-activity')?.headline ??
        'Competitor signals monitored — differentiation opportunities tracked.'
    ),
    source(
      'world-knowledge-engine',
      Boolean(world),
      worldSignals + 1,
      world?.dockWorldLine ?? 'External intelligence filtered for organization-relevant innovation.'
    ),
    source(
      'historical-performance',
      historyEvents >= 3,
      historyEvents,
      history
        ? `${historyEvents} historical events analyzed — fastest growth periods inform new ventures.`
        : 'Executive Timeline history will reveal patterns for future innovation.'
    ),
    source(
      'founder-vision',
      Boolean(founder),
      founder ? 5 : 2,
      founder
        ? 'Founder strategic time and creative cycles guide long-term innovation priorities.'
        : 'Founder vision captured from Blueprint and cognitive patterns.'
    ),
  ];

  return INNOVATION_SOURCES.map(
    (id) => contributions.find((c) => c.sourceId === id) ?? source(id, false, 0, 'Source connected — awaiting data.')
  );
}

export function summarizeInnovationSources(contributions: InnovationSourceContribution[]): string {
  const active = contributions.filter((c) => c.active);
  const total = contributions.reduce((sum, c) => sum + c.contributionCount, 0);
  return `${active.length}/${contributions.length} innovation sources active · ${total} contributions feeding ideation.`;
}
