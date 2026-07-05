/** NDXBook v1.0 — public media brand constants (AI Media workspace). */

import type {
  NdxbookBrand,
  NdxbookCreativeDna,
  NdxbookLaunchChecklistItem,
  NdxbookProgrammingDay,
  NdxbookSocialAccount,
  NdxbookTalentHost,
  NdxbookTaxonomy,
  NdxbookVoiceRules,
  NdxbookVolume,
  NdxbookVolumeId,
  NdxbookPlatformId,
} from './types';

export const NDXBOOK_STORAGE_KEY = 'studioOsNdxbook_v1';
export const NDXBOOK_VERSION = '1.0.0';
export const NDXBOOK_WORKSPACE_ID = 'ai-media';
export const NDXBOOK_BRAND_ID = 'ndxbook';

export const BRAND_DESCRIPTION =
  'ndxbook is an educational media brand built as the index for everyday knowledge. it publishes highly engaging short-form content that helps people understand money, health, psychology, ai, technology, consumer intelligence, & modern life.';

export const BRAND_POSITIONING = 'the index for everyday knowledge.';
export const BRAND_PROMISE = 'every page makes you smarter.';
export const INTERNAL_MEANING = 'ndxbook = index book';

export const NDXBOOK_PLATFORMS: NdxbookPlatformId[] = [
  'instagram',
  'tiktok',
  'youtube-shorts',
  'facebook',
  'threads',
  'x',
  'pinterest',
];

export const PLATFORM_LABELS: Record<NdxbookPlatformId, string> = {
  instagram: 'INSTAGRAM',
  tiktok: 'TIKTOK',
  'youtube-shorts': 'YOUTUBE SHORTS',
  facebook: 'FACEBOOK',
  threads: 'THREADS',
  x: 'X',
  pinterest: 'PINTEREST',
};

export const VOLUME_LABELS: Record<NdxbookVolumeId, string> = {
  money: 'MONEY',
  body: 'BODY',
  mind: 'MIND',
  tech: 'TECH',
  consumer: 'CONSUMER',
};

export const DEFAULT_TAXONOMY: NdxbookTaxonomy = {
  videoTerm: 'pages',
  pillarTerm: 'volumes',
  categoryTerm: 'chapters',
  seriesTerm: 'collections',
  audienceTerm: 'readers',
  internalNote:
    'Every video is a page, every topic category is a chapter, every content pillar is a volume. Series = collections. Audience = readers.',
};

export const DEFAULT_BRAND: NdxbookBrand = {
  id: NDXBOOK_BRAND_ID,
  workspaceId: NDXBOOK_WORKSPACE_ID,
  publicName: 'ndxbook',
  internalName: 'index book',
  description: BRAND_DESCRIPTION,
  positioning: BRAND_POSITIONING,
  promise: BRAND_PROMISE,
  internalMeaning: INTERNAL_MEANING,
  publicExplanation: 'Minimal — the brand stands on its own.',
  architecture: {
    internalWorkspace: 'AI Media',
    publicBrand: 'ndxbook',
    experimentationLayer: 'Studio OS Labs',
    productionNote: 'Content produced under ndxbook; performance tracked through AI Media.',
  },
  updatedAt: '2026-07-05T03:00:00.000Z',
};

export const LAUNCH_VOLUMES: NdxbookVolume[] = [
  {
    id: 'money',
    number: 1,
    label: 'money',
    displayLabel: 'VOLUME 001 — MONEY',
    chapters: [
      'budgeting',
      'credit',
      'banking',
      'investing',
      'taxes',
      'retirement',
      'side hustles',
      'passive income',
      'financial scams',
    ],
    knowledgeGraphNodeId: 'node-ndxbook-volume-money',
  },
  {
    id: 'body',
    number: 2,
    label: 'body',
    displayLabel: 'VOLUME 002 — BODY',
    chapters: [
      'health myths',
      'nutrition',
      'fitness',
      'sleep',
      'mental wellness',
      'supplements',
      'healthy habits',
      'medical misconceptions',
    ],
    knowledgeGraphNodeId: 'node-ndxbook-volume-body',
  },
  {
    id: 'mind',
    number: 3,
    label: 'mind',
    displayLabel: 'VOLUME 003 — MIND',
    chapters: [
      'habits',
      'psychology',
      'body language',
      'relationships',
      'communication',
      'decision making',
      'productivity',
      'cognitive biases',
      'human behavior',
    ],
    knowledgeGraphNodeId: 'node-ndxbook-volume-mind',
  },
  {
    id: 'tech',
    number: 4,
    label: 'tech',
    displayLabel: 'VOLUME 004 — TECH',
    chapters: [
      'ai tools',
      'automation',
      'software',
      'cybersecurity',
      'gadgets',
      'digital productivity',
      'future technology',
    ],
    knowledgeGraphNodeId: 'node-ndxbook-volume-tech',
  },
  {
    id: 'consumer',
    number: 5,
    label: 'consumer',
    displayLabel: 'VOLUME 005 — CONSUMER',
    chapters: [
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
    knowledgeGraphNodeId: 'node-ndxbook-volume-consumer',
  },
];

export const DEFAULT_PROGRAMMING: NdxbookProgrammingDay[] = [
  {
    id: 'money-monday',
    weekday: 'Monday',
    seriesTitle: 'Money Monday',
    primaryVolumeId: 'money',
    secondaryVolumeIds: [],
    description: 'Volume: money',
  },
  {
    id: 'truth-tuesday',
    weekday: 'Tuesday',
    seriesTitle: 'Truth Tuesday',
    primaryVolumeId: 'body',
    secondaryVolumeIds: ['mind'],
    description: 'Volume: body / mind',
  },
  {
    id: 'workflow-wednesday',
    weekday: 'Wednesday',
    seriesTitle: 'Workflow Wednesday',
    primaryVolumeId: 'tech',
    secondaryVolumeIds: [],
    description: 'Volume: tech',
  },
  {
    id: 'smart-living-thursday',
    weekday: 'Thursday',
    seriesTitle: 'Smart Living Thursday',
    primaryVolumeId: 'consumer',
    secondaryVolumeIds: [],
    description: 'Volume: consumer',
  },
  {
    id: 'future-friday',
    weekday: 'Friday',
    seriesTitle: 'Future Friday',
    primaryVolumeId: 'tech',
    secondaryVolumeIds: [],
    description: 'Volume: tech / business / innovation',
  },
];

export const DEFAULT_TALENT_HOSTS: NdxbookTalentHost[] = [
  {
    id: 'host-money',
    role: 'money host',
    volumeId: 'money',
    displayName: 'Pending — Money Host',
    talentNetworkRef: null,
    notes: 'Placeholder — connect to Talent Network when profiles are ready.',
  },
  {
    id: 'host-body',
    role: 'body host',
    volumeId: 'body',
    displayName: 'Pending — Body Host',
    talentNetworkRef: null,
    notes: 'Placeholder — connect to Talent Network when profiles are ready.',
  },
  {
    id: 'host-mind',
    role: 'mind host',
    volumeId: 'mind',
    displayName: 'Pending — Mind Host',
    talentNetworkRef: null,
    notes: 'Placeholder — connect to Talent Network when profiles are ready.',
  },
  {
    id: 'host-tech',
    role: 'tech host',
    volumeId: 'tech',
    displayName: 'Pending — Tech Host',
    talentNetworkRef: null,
    notes: 'Placeholder — connect to Talent Network when profiles are ready.',
  },
  {
    id: 'host-consumer',
    role: 'consumer host',
    volumeId: 'consumer',
    displayName: 'Pending — Consumer Host',
    talentNetworkRef: null,
    notes: 'Placeholder — connect to Talent Network when profiles are ready.',
  },
  {
    id: 'host-future',
    role: 'future host',
    volumeId: 'tech',
    displayName: 'Pending — Future Host',
    talentNetworkRef: null,
    notes: 'Future Friday crossover host — connect to Talent Network later.',
  },
];

export const DEFAULT_SOCIAL_ACCOUNTS: NdxbookSocialAccount[] = NDXBOOK_PLATFORMS.map((platform) => ({
  id: `social-${platform}`,
  platform,
  status: 'not-connected' as const,
  handle: 'pending',
  email: 'pending',
  notes: 'Placeholder — do not connect live accounts until handles are secured.',
}));

export const DEFAULT_VOICE_RULES: NdxbookVoiceRules = {
  voice: ['clear', 'curious', 'sharp', 'useful', 'slightly mysterious'],
  avoid: ['preachy', 'childish', 'overly academic', 'fearmongering'],
  copyStyle: [
    'short hooks',
    'fast explanations',
    'simple language',
    'specific examples',
    'no filler',
  ],
  pageQuestions: [
    'what is this?',
    'why does it matter?',
    'what should the reader do or remember?',
  ],
};

export const DEFAULT_CREATIVE_DNA: NdxbookCreativeDna = {
  status: 'placeholder',
  styleDirection: [
    'editorial',
    'minimal',
    'clean',
    'high contrast',
    'modern',
    'slightly futuristic',
    'trustworthy',
  ],
  notes: 'Not cartoonish unless a collection specifically requires it.',
  visualSystem: [
    'page number',
    'volume label',
    'chapter label',
    'strong hook text',
    'host / talent',
    'simple visual metaphor',
    'clear thumbnail hierarchy',
  ],
};

export const DEFAULT_LAUNCH_CHECKLIST: NdxbookLaunchChecklistItem[] = [
  { id: 'chk-email', label: 'secure email', completed: false },
  { id: 'chk-handles', label: 'secure social handles', completed: false },
  { id: 'chk-ig', label: 'connect instagram', completed: false },
  { id: 'chk-tiktok', label: 'connect tiktok', completed: false },
  { id: 'chk-youtube', label: 'connect youtube', completed: false },
  { id: 'chk-talent', label: 'create first talent profiles', completed: false },
  { id: 'chk-ideas', label: 'create first 10 page ideas', completed: false },
  { id: 'chk-thumb', label: 'approve thumbnail style', completed: false },
  { id: 'chk-script', label: 'approve script style', completed: false },
  { id: 'chk-first-page', label: 'create first page', completed: false },
  { id: 'chk-schedule', label: 'schedule first week', completed: false },
];

export const LABS_TRACKING_FIELDS = [
  'hook',
  'topic',
  'volume',
  'chapter',
  'host',
  'thumbnail',
  'caption',
  'hashtags',
  'publish time',
  'platform',
  'retention',
  'engagement',
  'shares',
  'saves',
  'clicks',
  'revenue',
  'learnings',
] as const;

export const PROGRAMMING_SLOT_FIELDS = [
  'series title',
  'volume',
  'chapter',
  'page number',
  'host',
  'script',
  'thumbnail',
  'caption',
  'hashtags',
  'platforms',
  'status',
  'analytics',
] as const;
