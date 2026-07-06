/** Milestone 121 — Legacy Network™ V1.0 */

export const LEGACY_NETWORK_STORAGE_KEY = 'studioOsLegacyNetwork_v1';
export const LEGACY_NETWORK_VERSION = '1.0.0';
export const STUDIO_OS_LEGACY_NETWORK_UPDATED = 'studio-os-legacy-network-updated';

export const LEGACY_NETWORK_PHILOSOPHY = [
  'Organizations become stronger when they learn from one another — knowledge should never be trapped; it should be shared intentionally.',
  'The Legacy Network™ is a permission-based global ecosystem — voluntary contribution with complete IP ownership retained.',
  'Not a marketplace — a movement. PRESERVE EXPERTISE. BUILD LEGACY.',
] as const;

export const SHAREABLE_ASSET_TYPES = [
  'profession-brain-modules',
  'department-packs',
  'automation-blueprints',
  'templates',
  'playbooks',
  'frameworks',
  'studio-institute-courses',
  'knowledge-products',
  'innovation-frameworks',
  'organization-genome-components',
  'command-dock-workflows',
  'executive-council-models',
  'approval-systems',
  'operating-manual-sections',
] as const;

export const SHAREABLE_ASSET_LABELS: Record<(typeof SHAREABLE_ASSET_TYPES)[number], string> = {
  'profession-brain-modules': 'Profession Brain™ Modules',
  'department-packs': 'Department Packs',
  'automation-blueprints': 'Automation Blueprints',
  templates: 'Templates',
  playbooks: 'Playbooks',
  frameworks: 'Frameworks',
  'studio-institute-courses': 'Studio Institute™ Courses',
  'knowledge-products': 'Knowledge Products',
  'innovation-frameworks': 'Innovation Frameworks',
  'organization-genome-components': 'Organization Genome™ Components',
  'command-dock-workflows': 'Command Dock Workflows',
  'executive-council-models': 'Executive Council Models',
  'approval-systems': 'Approval Systems',
  'operating-manual-sections': 'Operating Manual Sections',
};

export const DISCOVERY_FILTERS = [
  'industry',
  'business-stage',
  'organization-size',
  'problem',
  'department',
  'profession',
  'popularity',
  'newest',
  'verified-organizations',
  'highest-rated',
  'knowledge-category',
] as const;

export const DISCOVERY_FILTER_LABELS: Record<(typeof DISCOVERY_FILTERS)[number], string> = {
  industry: 'Industry',
  'business-stage': 'Business Stage',
  'organization-size': 'Organization Size',
  problem: 'Problem',
  department: 'Department',
  profession: 'Profession',
  popularity: 'Popularity',
  newest: 'Newest',
  'verified-organizations': 'Verified Organizations',
  'highest-rated': 'Highest Rated',
  'knowledge-category': 'Knowledge Category',
};

export const REPUTATION_DIMENSIONS = [
  'contribution-score',
  'knowledge-impact',
  'community-trust',
  'adoption-rate',
  'innovation-score',
  'teaching-score',
  'legacy-score',
] as const;

export const REPUTATION_DIMENSION_LABELS: Record<(typeof REPUTATION_DIMENSIONS)[number], string> = {
  'contribution-score': 'Contribution Score',
  'knowledge-impact': 'Knowledge Impact',
  'community-trust': 'Community Trust',
  'adoption-rate': 'Adoption Rate',
  'innovation-score': 'Innovation Score',
  'teaching-score': 'Teaching Score',
  'legacy-score': 'Legacy Score',
};

export const COMMUNITY_FEATURES = [
  'verified-founder-profiles',
  'organization-profiles',
  'industry-communities',
  'discussion-forums',
  'knowledge-requests',
  'improvement-suggestions',
  'collaborative-research',
  'partnership-discovery',
  'innovation-challenges',
  'community-awards',
] as const;

export const COMMUNITY_FEATURE_LABELS: Record<(typeof COMMUNITY_FEATURES)[number], string> = {
  'verified-founder-profiles': 'Verified Founder Profiles',
  'organization-profiles': 'Organization Profiles',
  'industry-communities': 'Industry Communities',
  'discussion-forums': 'Discussion Forums',
  'knowledge-requests': 'Knowledge Requests',
  'improvement-suggestions': 'Improvement Suggestions',
  'collaborative-research': 'Collaborative Research',
  'partnership-discovery': 'Partnership Discovery',
  'innovation-challenges': 'Innovation Challenges',
  'community-awards': 'Community Awards',
};

export const LEGACY_NETWORK_ACCENT = '#B45309';
