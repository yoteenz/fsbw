import { getOrganizationAnticipationProfile } from '../anticipation-engine/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPES } from './constants';
import type { DiscoverableResource } from './types';

export function buildDiscoverableResources(organizationId: string, companyName: string): DiscoverableResource[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const anticipation = getOrganizationAnticipationProfile(organizationId);

  const deptCount = brain?.brains.length ?? 4;
  const hasCapacity = anticipation && anticipation.anticipationItems.some((a) => a.category === 'hiring-needs');

  const resources: DiscoverableResource[] = [
    {
      id: `res-${organizationId}-depts`,
      type: 'available-departments',
      label: RESOURCE_TYPE_LABELS['available-departments'],
      summary: `${deptCount} department(s) — discoverability controlled by founder network settings`,
      discoverable: false,
      capacityPct: hasCapacity ? 35 : 72,
    },
    {
      id: `res-${organizationId}-staff`,
      type: 'digital-staff',
      label: RESOURCE_TYPE_LABELS['digital-staff'],
      summary: 'Digital Concierge capacity — shared only with trusted network members',
      discoverable: false,
      capacityPct: 68,
    },
    {
      id: `res-${organizationId}-services`,
      type: 'services',
      label: RESOURCE_TYPE_LABELS.services,
      summary: `${companyName} professional services — permission-based discovery only`,
      discoverable: false,
    },
    {
      id: `res-${organizationId}-knowledge`,
      type: 'knowledge-products',
      label: RESOURCE_TYPE_LABELS['knowledge-products'],
      summary: blueprint
        ? `Knowledge products from discovery blueprint (${blueprint.overallProgressPct}% maturity)`
        : 'Knowledge products — not published until founder approves',
      discoverable: blueprint ? blueprint.overallProgressPct >= 60 : false,
    },
    {
      id: `res-${organizationId}-brains`,
      type: 'profession-brains',
      label: RESOURCE_TYPE_LABELS['profession-brains'],
      summary: brain
        ? `${brain.brains.length} Profession Brain(s) — ${confidence?.overallConfidenceScore ?? 75}% confidence · publish selectively`
        : 'Profession Brains™ — private until explicitly published',
      discoverable: false,
      capacityPct: confidence?.overallConfidenceScore,
    },
    {
      id: `res-${organizationId}-marketplace`,
      type: 'marketplace-offerings',
      label: RESOURCE_TYPE_LABELS['marketplace-offerings'],
      summary: 'Marketplace offerings — discoverable only when founder enables visibility',
      discoverable: false,
    },
  ];

  return RESOURCE_TYPES.map((type) => resources.find((r) => r.type === type)!);
}
