import { NETWORK_TYPE_LABELS, NETWORK_TYPES } from './constants';
import type { FounderNetworkMember, NetworkType } from './types';

const DEMO_NETWORK: { type: NetworkType; name: string; relationship: string; capabilities: string[] }[] = [
  {
    type: 'preferred-partners',
    name: 'Studio Partner · Creative Agency',
    relationship: 'Preferred design partner — branding and launch assets',
    capabilities: ['Brand design', 'Campaign creative', 'Launch assets'],
  },
  {
    type: 'agencies',
    name: 'Studio Partner · Growth Agency',
    relationship: 'Marketing agency — campaign execution capacity',
    capabilities: ['Marketing strategy', 'Content pipeline', 'Analytics'],
  },
  {
    type: 'suppliers',
    name: 'Studio Partner · Professional Bookkeeping',
    relationship: 'Verified bookkeeping expertise — finance operations',
    capabilities: ['Bookkeeping', 'Payroll support', 'Financial reporting'],
  },
  {
    type: 'internal-companies',
    name: 'Portfolio Company · Sister Brand',
    relationship: 'Internal portfolio company — shared founder network',
    capabilities: ['Cross-promotion', 'Shared audience', 'Knowledge exchange'],
  },
  {
    type: 'clients',
    name: 'Trusted Client · Enterprise Account',
    relationship: 'Long-term client — selective capability sharing enabled',
    capabilities: ['Custom services', 'Dedicated support'],
  },
  {
    type: 'family-businesses',
    name: 'Family Business · Legacy Division',
    relationship: 'Family business unit — succession and legacy continuity',
    capabilities: ['Succession planning', 'Legacy vault sharing', 'Institutional memory'],
  },
];

export function buildFounderNetwork(organizationId: string, companyName: string): FounderNetworkMember[] {
  return DEMO_NETWORK.map((entry, index) => ({
    id: `network-${organizationId}-${index}`,
    organizationName: entry.name,
    networkType: entry.type,
    relationship: `${entry.relationship} · connected to ${companyName}`,
    sharedCapabilities: entry.capabilities,
    trustLevel: index < 3 ? 'trusted' : index < 5 ? 'verified' : 'pending',
  }));
}

export function networkTypeLabel(type: NetworkType): string {
  return NETWORK_TYPE_LABELS[type];
}

export function countNetworkByType(members: FounderNetworkMember[]): Record<NetworkType, number> {
  const counts = Object.fromEntries(NETWORK_TYPES.map((t) => [t, 0])) as Record<NetworkType, number>;
  for (const m of members) counts[m.networkType] += 1;
  return counts;
}
