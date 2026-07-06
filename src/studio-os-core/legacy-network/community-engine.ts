import { COMMUNITY_FEATURE_LABELS, COMMUNITY_FEATURES } from './constants';
import type { CommunityFeature, CommunityHighlight } from './types';

export function buildCommunityHighlights(organizationId: string, industryId: string): CommunityHighlight[] {
  const industryLabel = industryId.replace(/-/g, ' ');

  const details: Record<CommunityFeature, { headline: string; detail: string; active: boolean }> = {
    'verified-founder-profiles': {
      headline: 'Verified founders build trust across the network',
      detail: 'Founder profiles verified — expertise contributions permanently attributed.',
      active: true,
    },
    'organization-profiles': {
      headline: `${industryLabel} organization profiles active`,
      detail: 'Showcase published assets, reputation scores, and community participation.',
      active: true,
    },
    'industry-communities': {
      headline: `${industryLabel} industry community`,
      detail: 'Connect with peer organizations in your industry — share frameworks intentionally.',
      active: true,
    },
    'discussion-forums': {
      headline: 'Global discussion forums — organizational intelligence headquarters',
      detail: 'Discuss best practices, adoption experiences, and improvement suggestions.',
      active: true,
    },
    'knowledge-requests': {
      headline: 'Knowledge requests from peer organizations',
      detail: 'Request expertise — contributors respond voluntarily with full attribution.',
      active: true,
    },
    'improvement-suggestions': {
      headline: 'Community improvement suggestions on published assets',
      detail: 'Peer feedback strengthens contributed frameworks — version history preserved.',
      active: true,
    },
    'collaborative-research': {
      headline: 'Collaborative research initiatives',
      detail: 'Multi-organization research projects — permission-based, IP protected.',
      active: organizationId.length % 2 === 0,
    },
    'partnership-discovery': {
      headline: 'Partnership discovery through shared expertise',
      detail: 'Find complementary organizations via contributed frameworks and reputation.',
      active: true,
    },
    'innovation-challenges': {
      headline: 'Innovation challenges — collective advancement',
      detail: 'Community challenges advance business practice — not competitive marketplace.',
      active: true,
    },
    'community-awards': {
      headline: 'Community awards for exceptional contributions',
      detail: 'Recognition for teaching score, knowledge impact, and legacy score leaders.',
      active: true,
    },
  };

  return COMMUNITY_FEATURES.map((feature) => ({
    id: `community-${organizationId}-${feature}`,
    feature,
    label: COMMUNITY_FEATURE_LABELS[feature],
    headline: details[feature].headline,
    detail: details[feature].detail,
    active: details[feature].active,
  }));
}

export function summarizeCommunity(highlights: CommunityHighlight[]): string {
  const active = highlights.filter((h) => h.active).length;
  return `${active} community features active — global headquarters of organizational intelligence · movement not marketplace.`;
}
