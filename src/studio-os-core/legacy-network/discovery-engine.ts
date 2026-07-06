import { DISCOVERY_FILTER_LABELS, DISCOVERY_FILTERS, SHAREABLE_ASSET_LABELS } from './constants';
import type { DiscoveredResource, DiscoveryFilter, PublishableAsset, ShareableAssetType } from './types';

const PEER_ORGS = [
  'Summit Legal Group',
  'Artisan Painting Co',
  'Velvet Beauty Collective',
  'Precision Contracting',
  'Horizon Media Labs',
];

function orgSeed(organizationId: string, salt: string): number {
  let h = 0;
  const s = organizationId + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 100;
}

const DISCOVERY_TITLES: Record<ShareableAssetType, string> = {
  'profession-brain-modules': 'Tax Compliance Profession Brain Module',
  'department-packs': 'Marketing Department Pack',
  'automation-blueprints': 'Client Follow-Up Automation Blueprint',
  templates: 'Service Business Onboarding Template',
  playbooks: 'Customer Success Playbook',
  frameworks: 'Founder Decision Framework',
  'studio-institute-courses': 'Leadership Essentials Course',
  'knowledge-products': 'Industry Best Practices Knowledge Product',
  'innovation-frameworks': 'Revenue Diversification Innovation Framework',
  'organization-genome-components': 'Brand Voice Genome Components',
  'command-dock-workflows': 'Executive Briefing Command Workflow',
  'executive-council-models': 'Strategic Council Meeting Model',
  'approval-systems': 'Three-Tier Approval System',
  'operating-manual-sections': 'Employee Handbook — CX Standards',
};

export function discoverNetworkResources(
  organizationId: string,
  industryId: string,
  ownAssets: PublishableAsset[]
): DiscoveredResource[] {
  const seed = orgSeed(organizationId, 'discover');
  const filters = DISCOVERY_FILTERS;

  return filters.flatMap((filter, filterIdx) => {
    const typeKeys = Object.keys(SHAREABLE_ASSET_LABELS) as ShareableAssetType[];
    const type = typeKeys[(filterIdx + seed) % typeKeys.length];
    const peer = PEER_ORGS[(filterIdx + seed) % PEER_ORGS.length];
    const own = ownAssets.find((a) => a.type === type);

    return [
      {
        id: `discovered-${organizationId}-${filter}-${filterIdx}`,
        title: DISCOVERY_TITLES[type],
        type,
        typeLabel: SHAREABLE_ASSET_LABELS[type],
        organization: peer,
        verified: filter === 'verified-organizations' || filterIdx % 3 === 0,
        rating: Math.min(5, 3.5 + ((seed + filterIdx) % 15) / 10),
        adoptions: (seed + filterIdx * 7) % 40 + 5,
        filterMatch: filter,
        summary: `Discovered via ${DISCOVERY_FILTER_LABELS[filter]} — ${industryId.replace(/-/g, ' ')} relevant resource with permanent attribution.`,
        attribution: own?.attribution ?? {
          originalOrganization: peer,
          founder: 'Verified Founder',
          version: '1.2.0',
          createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          license: 'Legacy Network Contribution License',
          usageRights: 'Adopt with attribution · contributor retains IP',
          downloads: 48 + filterIdx * 11,
          reviews: 12 + filterIdx,
          adoptions: 8 + filterIdx * 2,
          averageRating: 4.2,
        },
      },
    ];
  });
}

export function summarizeDiscovery(resources: DiscoveredResource[]): string {
  const verified = resources.filter((r) => r.verified).length;
  return `${resources.length} discoverable resources · ${verified} from verified organizations · filter by industry · stage · problem · department · rating.`;
}

export function filterResourcesByDiscovery(
  resources: DiscoveredResource[],
  filter: DiscoveryFilter
): DiscoveredResource[] {
  return resources.filter((r) => r.filterMatch === filter);
}
