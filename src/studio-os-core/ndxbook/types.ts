/**
 * NDXBook v1.0 — public media brand types.
 * AI Media = internal workspace · ndxbook = public-facing indexed media brand.
 */

export type NdxbookVolumeId = 'money' | 'body' | 'mind' | 'tech' | 'consumer';

export type NdxbookPlatformId =
  | 'instagram'
  | 'tiktok'
  | 'youtube-shorts'
  | 'facebook'
  | 'threads'
  | 'x'
  | 'pinterest';

export type NdxbookPageStatus = 'idea' | 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export type NdxbookSocialStatus = 'not-connected' | 'pending' | 'connected' | 'locked';

export type NdxbookBrandArchitecture = {
  internalWorkspace: string;
  publicBrand: string;
  experimentationLayer: string;
  productionNote: string;
};

export type NdxbookBrand = {
  id: string;
  workspaceId: string;
  publicName: string;
  internalName: string;
  description: string;
  positioning: string;
  promise: string;
  internalMeaning: string;
  publicExplanation: string;
  architecture: NdxbookBrandArchitecture;
  updatedAt: string;
};

export type NdxbookTaxonomy = {
  videoTerm: string;
  pillarTerm: string;
  categoryTerm: string;
  seriesTerm: string;
  audienceTerm: string;
  internalNote: string;
};

export type NdxbookVolume = {
  id: NdxbookVolumeId;
  number: number;
  label: string;
  displayLabel: string;
  chapters: string[];
  knowledgeGraphNodeId: string;
};

export type NdxbookProgrammingDay = {
  id: string;
  weekday: string;
  seriesTitle: string;
  primaryVolumeId: NdxbookVolumeId;
  secondaryVolumeIds: NdxbookVolumeId[];
  description: string;
};

export type NdxbookProgrammingSlot = {
  id: string;
  programmingDayId: string;
  seriesTitle: string;
  volumeId: NdxbookVolumeId;
  chapter: string;
  pageNumber: number;
  pageLabel: string;
  hostId: string;
  script: string;
  thumbnail: string;
  caption: string;
  hashtags: string[];
  platforms: NdxbookPlatformId[];
  status: NdxbookPageStatus;
  analytics: {
    retention: number;
    engagement: number;
    shares: number;
    saves: number;
    clicks: number;
    revenue: number;
  };
};

export type NdxbookPage = {
  id: string;
  workspaceId: string;
  pageNumber: number;
  pageLabel: string;
  volumeId: NdxbookVolumeId;
  chapter: string;
  title: string;
  hook: string;
  platformVersions: Partial<Record<NdxbookPlatformId, string>>;
  publishDate: string | null;
  status: NdxbookPageStatus;
  hostId: string | null;
  script: string;
  thumbnail: string;
  caption: string;
  hashtags: string[];
  platforms: NdxbookPlatformId[];
  experimentId: string | null;
  performance: {
    retention: number;
    engagement: number;
    shares: number;
    saves: number;
    clicks: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type NdxbookTalentHost = {
  id: string;
  role: string;
  volumeId: NdxbookVolumeId;
  displayName: string;
  talentNetworkRef: string | null;
  notes: string;
};

export type NdxbookSocialAccount = {
  id: string;
  platform: NdxbookPlatformId;
  status: NdxbookSocialStatus;
  handle: string;
  email: string;
  notes: string;
};

export type NdxbookVoiceRules = {
  voice: string[];
  avoid: string[];
  copyStyle: string[];
  pageQuestions: string[];
};

export type NdxbookCreativeDna = {
  status: 'placeholder' | 'approved';
  styleDirection: string[];
  notes: string;
  visualSystem: string[];
};

export type NdxbookLaunchChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type NdxbookDashboardSnapshot = {
  brand: string;
  positioning: string;
  launchVolumes: number;
  pagesCreated: number;
  pagesScheduled: number;
  socialsConnected: number;
  labsExperiments: number;
  nextAction: string;
};

export type NdxbookStore = {
  brand: NdxbookBrand | null;
  taxonomy: NdxbookTaxonomy | null;
  volumes: NdxbookVolume[];
  programming: NdxbookProgrammingDay[];
  programmingSlots: NdxbookProgrammingSlot[];
  pages: NdxbookPage[];
  talentHosts: NdxbookTalentHost[];
  socialAccounts: NdxbookSocialAccount[];
  voiceRules: NdxbookVoiceRules | null;
  creativeDna: NdxbookCreativeDna | null;
  launchChecklist: NdxbookLaunchChecklistItem[];
  nextPageNumber: number;
  dashboard: NdxbookDashboardSnapshot;
  version: string;
};
