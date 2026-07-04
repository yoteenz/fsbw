/**
 * Vision Engine™ — Studio OS cinematic presentation platform types.
 * Reusable across workspaces; workspace-specific content lives in adapters.
 */

export type VisionModeKind =
  | 'creative-partner'
  | 'investor'
  | 'brand-story'
  | 'product-showcase'
  | 'product-launch'
  | 'employee-onboarding'
  | 'agency-presentation'
  | 'press-tour'
  | 'sales-demo'
  | 'franchise-demo'
  | 'self-guided';

export type VisionEngineRole =
  | 'owner'
  | 'administrator'
  | 'creative-director'
  | 'marketing'
  | 'investor-relations'
  | 'internal-team';

export type VisionPhase =
  | 'idle'
  | 'opening'
  | 'running'
  | 'paused'
  | 'transition'
  | 'mobile'
  | 'ending'
  | 'complete';

export type VisionTransitionKind = 'fade' | 'elevator' | 'bloom' | 'glass-wipe' | 'mobile-reveal' | 'none';

export type VisionHotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type VisionPresenterNotes = {
  voiceover: string;
  whyExists: string;
  problemSolved: string;
  emotionalResponse: string;
  designPhilosophy: string;
  customerJourney: string;
  futureExpansion: string;
};

export type VisionStop = {
  id: string;
  chapterId: string;
  sectionLabel: string;
  title: string;
  subtitle?: string;
  route?: string;
  durationMs: number;
  transition: VisionTransitionKind;
  useElevator?: boolean;
  hotspots?: VisionHotspot[];
  presenter: VisionPresenterNotes;
  cinematicDrift?: boolean;
};

export type VisionChapter = {
  id: string;
  title: string;
  stopIds: string[];
};

export type VisionModeDefinition = {
  id: string;
  kind: VisionModeKind;
  name: string;
  description: string;
  workspaceId: string;
  tagline: string;
  openingTitle: string;
  endingTagline: string;
  chapters: VisionChapter[];
  stops: VisionStop[];
  presenterModeDefault: boolean;
  recordOptimized: boolean;
  /** AI generation stub — future Vision AI fills this */
  aiGenerated?: boolean;
};

export type WorkspaceVisionManifest = {
  workspaceId: string;
  brandName: string;
  logoText: string;
  tagline: string;
  primaryColor: string;
  routes: string[];
  modes: VisionModeDefinition[];
};

export type VisionShareLink = {
  id: string;
  slug: string;
  modeId: string;
  workspaceId: string;
  label: string;
  password?: string;
  expiresAt?: string;
  autoplay: boolean;
  presenterMode: boolean;
  selfGuided: boolean;
  createdAt: string;
  views: number;
};

export type VisionAnalyticsEvent = {
  id: string;
  shareId: string;
  modeId: string;
  event: 'view' | 'complete' | 'skip' | 'hotspot' | 'cta' | 'share' | 'exit';
  stopId?: string;
  watchMs?: number;
  at: string;
};

export type VisionAnalyticsSummary = {
  shareId: string;
  modeLabel: string;
  totalViews: number;
  avgWatchMs: number;
  completionRate: number;
  replayedSections: string[];
  skippedSections: string[];
  hotspotClicks: number;
  ctaClicks: number;
  shares: number;
  engagementTimeline: string;
};

export type VisionRecorderJob = {
  id: string;
  modeId: string;
  workspaceId: string;
  status: 'queued' | 'directing' | 'ready' | 'failed';
  outputFormats: Array<'mp4-21-9' | 'mp4-16-9' | 'mp4-9-16' | 'mp4-4-5' | 'mp4-1-1'>;
  outputTypes: Array<'creative-partner-film' | 'investor-film' | 'launch-trailer' | 'product-demo' | 'social-reel'>;
  createdAt: string;
  note: string;
};

export type VisionEngineStore = {
  manifests: Record<string, WorkspaceVisionManifest>;
  customModes: VisionModeDefinition[];
  shareLinks: VisionShareLink[];
  analytics: VisionAnalyticsEvent[];
  recorderJobs: VisionRecorderJob[];
  version: string;
};
