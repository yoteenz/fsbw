/**
 * World Graph Impact™ — every win permanently enriches civilization history.
 */

import type { CivilizationEvent, EventWorldImpact, ProfessionId } from './types';

export function buildEventWorldImpacts(
  events: CivilizationEvent[],
  companyName: string
): EventWorldImpact[] {
  const impacts: EventWorldImpact[] = [];

  for (const event of events.filter((e) => e.status === 'active' || e.status === 'completed')) {
    impacts.push({
      id: `impact-${event.id}`,
      eventId: event.id,
      label: `${event.title} — civilization impact recorded`,
      who: companyName || 'Studio World community',
      why: event.subtitle,
      invented: event.worldImpactSummary,
      collaborators: event.collaborationRequired
        ? event.professions.map(formatProfession)
        : [companyName || 'Participating founder'],
      professions: event.professions,
      knowledgeCreated: `Permanent World Graph node ${event.worldGraphNodeId}`,
      graphNodeId: event.worldGraphNodeId,
      permanentEffects: buildPermanentEffects(event),
    });
  }

  return impacts;
}

function formatProfession(p: ProfessionId): string {
  return p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildPermanentEffects(event: CivilizationEvent): string[] {
  const effects: string[] = [
    'World Graph™ historical record',
    'Civilization Events™ archive',
  ];

  if (event.discoveryPackId) {
    effects.push(`Discovery Pack™ ${event.discoveryPackId} eligible`);
  }
  if (event.museumExhibitId) {
    effects.push('Living Museum™ permanent exhibit commissioned');
  }
  if (event.collaborationRequired) {
    effects.push('Collaboration honor weight 2× — cross-profession innovation');
  }

  switch (event.category) {
    case 'grand-challenge':
      effects.push('New district permanently unlocked', 'Education curriculum in World Graph™');
      break;
    case 'world-expo':
      effects.push('Atlas Expo Pavilion', 'Marketplace exhibition integration');
      break;
    case 'headquarters-showcase':
      effects.push('HQ becomes walkable Museum exhibit', 'Architecture canon updated');
      break;
    case 'knowledge-tournament':
      effects.push('Knowledge Library wing expansion', 'Blueprint lineage deepened');
      break;
    case 'industry-olympics':
      effects.push('Profession monument commissioned', 'Industry reputation elevated');
      break;
    default:
      effects.push('New architecture eligible', 'Marketplace product lineage');
  }

  return effects;
}
