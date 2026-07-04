/**
 * Marketplace — AI Media workspace demo seeds & bootstrap.
 */

import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';
import { calculateTrustScore } from '../../../studio-os-core/marketplace/trustScore';
import {
  bootstrapMarketplaceStore,
  mergeMarketplacePatch,
  readMarketplaceStore,
  refreshMarketplaceIntelligence,
} from '../../../studio-os-core/marketplace/store';
import type {
  CollaborationHub,
  MarketplaceDeal,
  MarketplaceStore,
  ParticipantProfile,
  PaymentArchitectureRecord,
} from '../../../studio-os-core/marketplace/types';

const WS = AI_MEDIA_WORKSPACE_ID;
const now = '2026-07-04T14:00:00.000Z';

function perf(overrides: Partial<ParticipantProfile['performanceHistory']> = {}): ParticipantProfile['performanceHistory'] {
  return {
    responsiveness: 0.92,
    completionRate: 0.96,
    quality: 0.94,
    timeliness: 0.9,
    clientSatisfaction: 0.93,
    repeatBusinessRate: 0.68,
    ...overrides,
  };
}

function participant(
  partial: Omit<ParticipantProfile, 'trustScore' | 'performanceHistory' | 'createdAt' | 'updatedAt'> & {
    performanceHistory?: ParticipantProfile['performanceHistory'];
  }
): ParticipantProfile {
  const performanceHistory = partial.performanceHistory ?? perf();
  const { performanceHistory: _, ...rest } = partial;
  return {
    ...rest,
    performanceHistory,
    trustScore: calculateTrustScore(performanceHistory),
    createdAt: now,
    updatedAt: now,
  };
}

export const DEMO_PARTICIPANTS: ParticipantProfile[] = [
  participant({
    id: 'mp-ai-media-brand',
    workspaceId: WS,
    displayName: 'AI Media Network',
    participantType: 'brand',
    biography: 'Digital media network — 5 pillars, 5 shows, sponsor integrations and brand partnerships.',
    profileImage: '/assets/ai-media/marketplace/ai-media-brand.jpg',
    portfolio: ['Money Monday sponsor slots', 'Q3 Finance Campaign', 'Network ad integrations'],
    services: ['Sponsored series', 'Brand integrations', 'Cross-platform campaigns'],
    industries: ['media', 'fintech', 'education'],
    pricingModel: 'fixed-price',
    pricingSummary: '$2,400–$18,000 per campaign · 6-episode minimum',
    availability: 'Q3–Q4 2026 · partnership pipeline open',
    verified: true,
    verificationBadges: ['business', 'brand', 'workspace'],
    reviews: [
      { id: 'rev-1', authorName: 'LearnFlow EdTech', rating: 5, comment: 'Professional integration — renewed for Season 2.', date: '2026-06-01' },
    ],
    completedProjects: 8,
    workspaceConnections: ['ai-media', 'growth-network'],
    knowledgeGraphNodeId: 'node-mp-ai-media-brand',
  }),
  participant({
    id: 'mp-maya-creator',
    workspaceId: WS,
    displayName: 'Maya Chen (Presenter)',
    participantType: 'creator',
    biography: 'AI presenter + finance creator — Money Monday host, 28K followers, myth-busting educational content.',
    profileImage: '/assets/ai-media/talent/maya-chen.jpg',
    portfolio: ['Money Monday S2', 'Credit Myths series', 'FinTech collab pilot'],
    services: ['Host integrations', 'Expert segments', 'Affiliate packages'],
    industries: ['finance', 'education', 'media'],
    pricingModel: 'retainer',
    pricingSummary: '$2,400/ep · 12 eps/season retainer',
    availability: 'Mon–Wed · network calendar',
    verified: true,
    verificationBadges: ['identity', 'portfolio', 'workspace'],
    reviews: [{ id: 'rev-2', authorName: 'AI Media Network', rating: 5, comment: 'Top retention host — 74% avg.', date: '2026-06-15' }],
    completedProjects: 24,
    workspaceConnections: ['ai-media', 'talent-network'],
    knowledgeGraphNodeId: 'node-talent-maya-chen',
  }),
  participant({
    id: 'mp-casey-editor',
    workspaceId: WS,
    displayName: 'Casey Lee',
    participantType: 'editor',
    biography: 'Short-form video editor — pacing, captions, multi-platform exports for creator networks.',
    profileImage: '/assets/ai-media/talent/casey-lee.jpg',
    portfolio: ['Money Monday cuts', 'Future Friday packages', 'Cross-platform caption QA'],
    services: ['Short-form editing', 'Caption timing', 'Platform exports'],
    industries: ['media', 'creator economy'],
    pricingModel: 'hourly',
    pricingSummary: '$85/hr · $800/week retainer available',
    availability: 'Mon–Fri · 30 hrs/week',
    verified: true,
    verificationBadges: ['identity', 'portfolio', 'business'],
    reviews: [{ id: 'rev-3', authorName: 'AI Media Network', rating: 5, comment: '96% on-time delivery — 3 renewals.', date: '2026-06-20' }],
    completedProjects: 47,
    workspaceConnections: ['ai-media', 'talent-network'],
    knowledgeGraphNodeId: 'node-mp-casey-editor',
    performanceHistory: perf({ repeatBusinessRate: 0.82 }),
  }),
  participant({
    id: 'mp-sam-photographer',
    workspaceId: WS,
    displayName: 'Sam Ortiz',
    participantType: 'photographer',
    biography: 'Thumbnail, B-roll, and set photography for digital media productions.',
    profileImage: '/assets/ai-media/talent/sam-ortiz.jpg',
    portfolio: ['Network thumbnail package', 'Campaign stills', 'B-roll library'],
    services: ['Thumbnail photography', 'B-roll', 'Set stills'],
    industries: ['media', 'advertising'],
    pricingModel: 'retainer',
    pricingSummary: '$800/week · 20 hrs · thumbnail + B-roll package',
    availability: 'Mon–Fri · 20 hrs/week',
    verified: true,
    verificationBadges: ['identity', 'portfolio', 'business'],
    reviews: [{ id: 'rev-4', authorName: 'Casey Lee (Editor)', rating: 5, comment: 'Reliable assets — easy collaboration hub workflow.', date: '2026-06-18' }],
    completedProjects: 31,
    workspaceConnections: ['ai-media', 'talent-network'],
    knowledgeGraphNodeId: 'node-mp-sam-photographer',
  }),
  participant({
    id: 'mp-learnflow-brand',
    workspaceId: WS,
    displayName: 'LearnFlow EdTech',
    participantType: 'brand',
    biography: 'EdTech brand seeking educational series sponsorship — 6-episode integrations.',
    profileImage: '/assets/ai-media/marketplace/learnflow.jpg',
    portfolio: ['Prior AI Media pilot', 'Creator education campaigns'],
    services: ['Sponsored education series', 'Product integrations'],
    industries: ['edtech', 'education', 'ecommerce'],
    pricingModel: 'fixed-price',
    pricingSummary: '$18,000–$24,000 · 6-episode package',
    availability: 'Q3 2026 · deadline Aug 15',
    verified: true,
    verificationBadges: ['business', 'brand'],
    reviews: [],
    completedProjects: 2,
    workspaceConnections: ['growth-network'],
    knowledgeGraphNodeId: 'node-mp-learnflow',
  }),
  participant({
    id: 'mp-creator-agency',
    workspaceId: WS,
    displayName: 'Pulse Creator Agency',
    participantType: 'agency',
    biography: 'Creator management agency — 12 roster creators, brand deal pipeline, campaign production.',
    profileImage: '/assets/ai-media/marketplace/pulse-agency.jpg',
    portfolio: ['FinTech creator roster', 'Multi-platform campaigns'],
    services: ['Creator management', 'Brand deal sourcing', 'Campaign production'],
    industries: ['creator economy', 'marketing'],
    pricingModel: 'commission',
    pricingSummary: '15% commission on closed brand deals',
    availability: 'Immediate · Q3 campaign slots',
    verified: true,
    verificationBadges: ['business', 'workspace'],
    reviews: [{ id: 'rev-5', authorName: 'LearnFlow EdTech', rating: 4, comment: 'Strong creator roster match.', date: '2026-05-10' }],
    completedProjects: 15,
    workspaceConnections: ['growth-network', 'ai-media'],
    knowledgeGraphNodeId: 'node-mp-pulse-agency',
  }),
  participant({
    id: 'mp-jordan-videographer',
    workspaceId: WS,
    displayName: 'Jordan Reyes',
    participantType: 'videographer',
    biography: 'Campaign videographer — brand series, B-roll, multi-cam setups.',
    profileImage: '/assets/ai-media/marketplace/jordan-reyes.jpg',
    portfolio: ['Brand campaign B-roll', '6-episode series shoots'],
    services: ['Campaign videography', 'B-roll', 'Multi-cam'],
    industries: ['media', 'advertising'],
    pricingModel: 'fixed-price',
    pricingSummary: '$3,500/day · series packages available',
    availability: 'Q3 2026 · 2 slots/month',
    verified: true,
    verificationBadges: ['identity', 'portfolio'],
    reviews: [],
    completedProjects: 19,
    workspaceConnections: ['ai-media'],
    knowledgeGraphNodeId: 'node-mp-jordan-videographer',
  }),
  participant({
    id: 'mp-fulfillment-co',
    workspaceId: WS,
    displayName: 'ShipRight Fulfillment',
    participantType: 'fulfillment',
    biography: 'DTC fulfillment partner — ecommerce brands, MOQ-friendly, 2-day ship zones.',
    profileImage: '/assets/ai-media/marketplace/shipright.jpg',
    portfolio: ['DTC supplement brands', 'Digital product fulfillment'],
    services: ['Pick & pack', 'Returns', 'Inventory sync'],
    industries: ['ecommerce', 'logistics'],
    pricingModel: 'custom',
    pricingSummary: 'Per-SKU + storage · custom MOQ agreements',
    availability: 'Pilot slots · Q4 2026',
    verified: true,
    verificationBadges: ['business', 'workspace'],
    reviews: [],
    completedProjects: 6,
    workspaceConnections: ['growth-network'],
    knowledgeGraphNodeId: 'node-mp-shipright',
  }),
];

export const DEMO_DEALS: MarketplaceDeal[] = [
  {
    id: 'deal-editor-retainer',
    workspaceId: WS,
    title: 'Money Monday + Future Friday · Editor Retainer',
    initiatorId: 'mp-ai-media-brand',
    counterpartyId: 'mp-casey-editor',
    stage: 'production',
    pricingModel: 'retainer',
    budget: '$800/week',
    value: 3200,
    startedAt: '2026-04-01T00:00:00.000Z',
    updatedAt: now,
    renewalEligible: true,
    relationshipHistory: [
      { id: 'dh-1', stage: 'discovery', label: 'Growth Network opportunity match', date: '2026-03-15' },
      { id: 'dh-2', stage: 'introduction', label: 'Talent Network → Marketplace intro', date: '2026-03-18' },
      { id: 'dh-3', stage: 'proposal', label: 'Retainer proposal · 30 hrs/week', date: '2026-03-22' },
      { id: 'dh-4', stage: 'contract', label: '12-month renewal path signed', date: '2026-04-01' },
      { id: 'dh-5', stage: 'production', label: 'S2E12–S2E13 in production', date: '2026-06-28' },
    ],
  },
  {
    id: 'deal-edtech-sponsor',
    workspaceId: WS,
    title: 'LearnFlow · 6-Episode EdTech Sponsorship',
    initiatorId: 'mp-learnflow-brand',
    counterpartyId: 'mp-ai-media-brand',
    stage: 'negotiation',
    pricingModel: 'fixed-price',
    budget: '$18,000–$24,000',
    value: 21000,
    startedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: now,
    renewalEligible: true,
    relationshipHistory: [
      { id: 'dh-6', stage: 'discovery', label: 'Growth Network · qualified lead', date: '2026-05-20' },
      { id: 'dh-7', stage: 'meeting', label: 'Partnership discovery call', date: '2026-05-28' },
      { id: 'dh-8', stage: 'proposal', label: '6-episode integration proposal', date: '2026-06-05' },
      { id: 'dh-9', stage: 'negotiation', label: 'Deliverables + exclusivity review', date: '2026-06-20' },
    ],
  },
  {
    id: 'deal-photo-package',
    workspaceId: WS,
    title: 'Thumbnail + B-roll · Photographer Package',
    initiatorId: 'mp-casey-editor',
    counterpartyId: 'mp-sam-photographer',
    stage: 'delivery',
    pricingModel: 'retainer',
    budget: '$800/week',
    value: 800,
    startedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: now,
    renewalEligible: true,
    relationshipHistory: [
      { id: 'dh-10', stage: 'discovery', label: 'Ecosystem recommendation · editor needs photographer', date: '2026-05-25' },
      { id: 'dh-11', stage: 'contract', label: 'Weekly retainer signed', date: '2026-06-01' },
      { id: 'dh-12', stage: 'production', label: 'S2E12 thumbnail shoot', date: '2026-06-10' },
      { id: 'dh-13', stage: 'delivery', label: 'Asset delivery · collaboration hub', date: '2026-06-28' },
    ],
  },
  {
    id: 'deal-agency-video',
    workspaceId: WS,
    title: 'Pulse Agency · Campaign Videographer',
    initiatorId: 'mp-creator-agency',
    counterpartyId: 'mp-jordan-videographer',
    stage: 'proposal',
    pricingModel: 'commission',
    budget: '15% commission',
    value: 5250,
    startedAt: '2026-06-15T00:00:00.000Z',
    updatedAt: now,
    renewalEligible: true,
    relationshipHistory: [
      { id: 'dh-14', stage: 'discovery', label: 'Marketplace ecosystem match', date: '2026-06-10' },
      { id: 'dh-15', stage: 'introduction', label: 'Agency roster fit confirmed', date: '2026-06-12' },
      { id: 'dh-16', stage: 'proposal', label: 'Q3 campaign videographer proposal', date: '2026-06-15' },
    ],
  },
];

export const DEMO_COLLABORATION_HUBS: CollaborationHub[] = [
  {
    id: 'hub-editor-retainer',
    dealId: 'deal-editor-retainer',
    workspaceId: WS,
    messages: [
      { id: 'msg-1', author: 'Casey Lee', body: 'S2E12 rough cut ready for review — caption timing adjusted for TikTok.', date: '2026-06-28T10:00:00.000Z' },
      { id: 'msg-2', author: 'AI Media Network', body: 'Approved — ship to distribution. Renewal discussion next week.', date: '2026-06-28T14:30:00.000Z' },
    ],
    sharedFiles: ['s2e12-rough-cut.mp4', 'caption-timeline.srt', 'brand-safe-checklist.pdf'],
    deliverables: ['Final cut · 3 platforms', 'Caption QA', 'Thumbnail handoff to Sam'],
    timeline: [
      { id: 'tl-1', label: 'Rough cut delivery', dueDate: '2026-06-28', status: 'complete' },
      { id: 'tl-2', label: 'Final approval', dueDate: '2026-06-30', status: 'in-progress' },
      { id: 'tl-3', label: 'Renewal review', dueDate: '2026-07-07', status: 'pending' },
    ],
    approvals: ['Creative Director · caption timing', 'Brand safety · finance topics'],
    contractRef: 'contract-casey-retainer-2026',
    paymentRefs: ['pay-milestone-june'],
    meetingNotes: ['2026-06-01 · Retainer kickoff — 12-month renewal path agreed'],
    activityFeed: [
      { id: 'act-1', label: 'Rough cut uploaded', date: '2026-06-28T10:00:00.000Z' },
      { id: 'act-2', label: 'Approval requested', date: '2026-06-28T10:05:00.000Z' },
    ],
    aiRecommendations: [
      'Suggest renewal at current rate — 96% completion, 3 prior renewals.',
      'Introduce Sam Ortiz for thumbnail package — ecosystem fit 87%.',
    ],
  },
  {
    id: 'hub-edtech-sponsor',
    dealId: 'deal-edtech-sponsor',
    workspaceId: WS,
    messages: [
      { id: 'msg-3', author: 'LearnFlow EdTech', body: 'Can we extend exclusivity to edtech vertical only?', date: '2026-06-20T09:00:00.000Z' },
    ],
    sharedFiles: ['integration-proposal-v2.pdf', 'deliverables-matrix.xlsx'],
    deliverables: ['6× 60s integrations', 'Cross-platform clips', 'Performance report'],
    timeline: [
      { id: 'tl-4', label: 'Contract signature', dueDate: '2026-07-15', status: 'pending' },
      { id: 'tl-5', label: 'Episode 1 integration', dueDate: '2026-08-01', status: 'pending' },
    ],
    approvals: ['Legal · exclusivity clause', 'Executive · budget sign-off'],
    paymentRefs: ['pay-escrow-edtech-50pct'],
    meetingNotes: ['2026-05-28 · Discovery — long-term series, not one-off UGC'],
    activityFeed: [{ id: 'act-3', label: 'Proposal v2 shared', date: '2026-06-05T16:00:00.000Z' }],
    aiRecommendations: ['Prioritize 6-episode minimum — aligns with relationship-first marketplace goal.'],
  },
];

export const DEMO_PAYMENTS: PaymentArchitectureRecord[] = [
  {
    id: 'pay-milestone-june',
    dealId: 'deal-editor-retainer',
    workspaceId: WS,
    type: 'milestone',
    amount: 800,
    status: 'paid',
    label: 'June retainer · week 4',
    scheduledDate: '2026-06-28',
    note: 'Architecture only — no live payment processing in v1.',
  },
  {
    id: 'pay-escrow-edtech-50pct',
    dealId: 'deal-edtech-sponsor',
    workspaceId: WS,
    type: 'escrow',
    amount: 10500,
    status: 'escrow',
    label: '50% escrow on contract signature',
    note: 'Escrow release on episode 3 delivery — connector not connected.',
  },
  {
    id: 'pay-invoice-photo',
    dealId: 'deal-photo-package',
    workspaceId: WS,
    type: 'invoice',
    amount: 800,
    status: 'scheduled',
    label: 'Weekly photographer invoice · June W4',
    scheduledDate: '2026-07-01',
    note: 'Partial payment architecture — payout to Sam Ortiz on approval.',
  },
  {
    id: 'pay-payout-casey',
    dealId: 'deal-editor-retainer',
    workspaceId: WS,
    type: 'payout',
    amount: 800,
    status: 'paid',
    label: 'Payout · Casey Lee · June retainer',
    note: 'Payout rail not connected — demo record only.',
  },
];

export function buildMarketplaceStorePatch(): Partial<MarketplaceStore> {
  return {
    participants: DEMO_PARTICIPANTS,
    deals: DEMO_DEALS,
    collaborationHubs: DEMO_COLLABORATION_HUBS,
    payments: DEMO_PAYMENTS,
  };
}

export function bootstrapAiMediaMarketplace(): void {
  bootstrapMarketplaceStore();
  const store = readMarketplaceStore();
  if (store.participants.length > 0) return;
  mergeMarketplacePatch(buildMarketplaceStorePatch());
  refreshMarketplaceIntelligence(WS);
}
