/** AI Media Network v1.0 — constants. */

import type { ContentPillar, CrossPlatformId, NetworkShow, NetworkShowId } from './types';

export const AI_MEDIA_NETWORK_STORAGE_KEY = 'studioOsAiMediaNetwork_v1';
export const AI_MEDIA_NETWORK_VERSION = '1.0.0';
export const AI_MEDIA_WORKSPACE_ID = 'ai-media';

export const BRAND_VALUES = [
  'clarity',
  'credibility',
  'curiosity',
  'consistency',
  'continuous experimentation',
  'audience-first education',
] as const;

export const COMPANY_MISSION =
  'Make practical knowledge entertaining, accessible, and highly shareable while serving as the permanent pilot workspace for studio os.';

export const PILOT_ROLE =
  'Permanent Studio OS pilot workspace — every network feature validates before platform-wide promotion.';

export const CROSS_PLATFORMS: CrossPlatformId[] = [
  'instagram',
  'tiktok',
  'youtube-shorts',
  'facebook',
  'threads',
  'x',
  'pinterest',
];

export const PLATFORM_LABELS: Record<CrossPlatformId, string> = {
  instagram: 'INSTAGRAM',
  tiktok: 'TIKTOK',
  'youtube-shorts': 'YOUTUBE SHORTS',
  facebook: 'FACEBOOK',
  threads: 'THREADS',
  x: 'X',
  pinterest: 'PINTEREST',
};

export const NETWORK_SHOW_IDS: NetworkShowId[] = [
  'money-monday',
  'truth-tuesday',
  'workflow-wednesday',
  'smart-living-thursday',
  'future-friday',
];

export const DEFAULT_PILLARS: ContentPillar[] = [
  {
    id: 'money',
    label: 'MONEY',
    strategy: 'Demystify personal finance with myth-busting, actionable tips, and affiliate-aligned product recommendations.',
    topics: [
      'budgeting',
      'credit',
      'banking',
      'investing',
      'taxes',
      'retirement',
      'side hustles',
      'passive income',
      'financial scams',
      'affiliate opportunities',
    ],
    knowledgeGraphNodeId: 'node-pillar-money',
  },
  {
    id: 'health',
    label: 'HEALTH',
    strategy: 'Evidence-informed wellness content that debunks myths and promotes sustainable healthy habits.',
    topics: [
      'health myths',
      'nutrition',
      'fitness',
      'sleep',
      'mental wellness',
      'supplements',
      'healthy habits',
      'medical misconceptions',
    ],
    knowledgeGraphNodeId: 'node-pillar-health',
  },
  {
    id: 'psychology',
    label: 'PSYCHOLOGY',
    strategy: 'Make human behavior, habits, and decision-making accessible through short-form storytelling.',
    topics: [
      'habits',
      'body language',
      'relationships',
      'communication',
      'decision making',
      'productivity',
      'cognitive biases',
      'human behavior',
    ],
    knowledgeGraphNodeId: 'node-pillar-psychology',
  },
  {
    id: 'ai-technology',
    label: 'AI & TECHNOLOGY',
    strategy: 'Practical AI tools, automation, and digital productivity for creators and everyday users.',
    topics: [
      'ai tools',
      'automation',
      'software',
      'cybersecurity',
      'gadgets',
      'future technology',
      'digital productivity',
    ],
    knowledgeGraphNodeId: 'node-pillar-ai-tech',
  },
  {
    id: 'consumer-intelligence',
    label: 'CONSUMER INTELLIGENCE',
    strategy: 'Empower viewers with consumer rights, smart shopping, and everyday money-saving strategies.',
    topics: [
      'consumer rights',
      'shopping strategies',
      'travel',
      'subscriptions',
      'insurance',
      'warranties',
      'hidden fees',
      'online safety',
      'everyday money-saving strategies',
    ],
    knowledgeGraphNodeId: 'node-pillar-consumer',
  },
];

export const DEFAULT_SHOWS: NetworkShow[] = [
  {
    id: 'money-monday',
    name: 'MONEY MONDAY',
    weekday: 'Monday',
    primaryPillar: 'money',
    description: 'Weekly finance myth-busting and money mastery — kick off the week with actionable wealth content.',
    branding: 'Bold red accent · dollar-sign kinetic typography · confident host tone',
    thumbnailStyle: 'red-text · shocked face · chart overlay',
    intro: '3s stinger · "Money Monday — myths vs truth"',
    outro: 'CTA · affiliate link · subscribe prompt',
    host: 'Voice B · Finance Host',
    creativeDnaRef: 'ai-media-creative-dna-v1.2',
    knowledgeGraphNodeId: 'node-show-money-monday',
  },
  {
    id: 'truth-tuesday',
    name: 'TRUTH TUESDAY',
    weekday: 'Tuesday',
    primaryPillar: 'health',
    description: 'Health myth debunks and wellness truths — calm, credible, save-worthy content.',
    branding: 'Soft blue · clean minimal · trust-first typography',
    thumbnailStyle: 'white text · calm face · wellness icon',
    intro: '2s fade · "Truth Tuesday — what doctors wish you knew"',
    outro: 'Save this · link in bio for guide',
    host: 'Voice A · Wellness Host',
    creativeDnaRef: 'ai-media-creative-dna-v1.2',
    knowledgeGraphNodeId: 'node-show-truth-tuesday',
  },
  {
    id: 'workflow-wednesday',
    name: 'WORKFLOW WEDNESDAY',
    weekday: 'Wednesday',
    primaryPillar: 'psychology',
    description: 'Habits, productivity, and human behavior hacks for mid-week momentum.',
    branding: 'Purple accent · brain graphics · motion typography',
    thumbnailStyle: 'brain diagram · question hook · high contrast',
    intro: '3s kinetic · "Workflow Wednesday — hack your brain"',
    outro: 'Comment your habit · follow for weekly facts',
    host: 'Voice B · Psychology Host',
    creativeDnaRef: 'ai-media-creative-dna-v1.2',
    knowledgeGraphNodeId: 'node-show-workflow-wednesday',
  },
  {
    id: 'smart-living-thursday',
    name: 'SMART LIVING THURSDAY',
    weekday: 'Thursday',
    primaryPillar: 'consumer-intelligence',
    description: 'Consumer rights, smart shopping, subscriptions, and hidden-fee exposés.',
    branding: 'Teal · receipt/price tag motifs · investigative tone',
    thumbnailStyle: 'split receipt · warning text · consumer shield icon',
    intro: '2s snap · "Smart Living — don\'t get played"',
    outro: 'Share to save a friend · affiliate tools link',
    host: 'Voice A · Consumer Advocate',
    creativeDnaRef: 'ai-media-creative-dna-v1.2',
    knowledgeGraphNodeId: 'node-show-smart-living',
  },
  {
    id: 'future-friday',
    name: 'FUTURE FRIDAY',
    weekday: 'Friday',
    primaryPillar: 'ai-technology',
    description: 'AI tools, automation demos, and future-tech previews to end the week strong.',
    branding: 'Neon green on black · screen-recording aesthetic · tech beats',
    thumbnailStyle: 'split-screen before/after · tool logo · excited host',
    intro: '3s glitch · "Future Friday — tools that change everything"',
    outro: 'Affiliate link · weekend watchlist',
    host: 'Voice A · Tech Host',
    creativeDnaRef: 'ai-media-creative-dna-v1.2',
    knowledgeGraphNodeId: 'node-show-future-friday',
  },
];

export const SHOW_LABELS: Record<NetworkShowId, string> = {
  'money-monday': 'MONEY MONDAY',
  'truth-tuesday': 'TRUTH TUESDAY',
  'workflow-wednesday': 'WORKFLOW WEDNESDAY',
  'smart-living-thursday': 'SMART LIVING THURSDAY',
  'future-friday': 'FUTURE FRIDAY',
};

export const PILLAR_LABELS: Record<string, string> = {
  money: 'MONEY',
  health: 'HEALTH',
  psychology: 'PSYCHOLOGY',
  'ai-technology': 'AI & TECHNOLOGY',
  'consumer-intelligence': 'CONSUMER INTELLIGENCE',
};
