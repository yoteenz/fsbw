/** AI Orchestrator — pipeline, adapters, packaging, and approval demo seeds. */

export type OrchestratorProviderId = 'openai' | 'fal' | 'openart' | 'voice' | 'email';

export type OrchestratorAdapterDefinition = {
  id: OrchestratorProviderId;
  label: string;
  responsibilities: string[];
};

export const ORCHESTRATOR_ADAPTER_REGISTRY: OrchestratorAdapterDefinition[] = [
  {
    id: 'openai',
    label: 'OPENAI ADAPTER',
    responsibilities: [
      'RESEARCH',
      'OUTLINES',
      'SCRIPTS',
      'ARTICLES',
      'EMAILS',
      'CAPTIONS',
      'METADATA',
      'SEO',
      'PSA DIALOGUE',
      'FAQ GENERATION',
      'KNOWLEDGE SUMMARIES',
    ],
  },
  {
    id: 'fal',
    label: 'FAL ADAPTER',
    responsibilities: [
      'IMAGE GENERATION',
      'VIDEO GENERATION',
      'UPSCALING',
      'EPISODE SCENES',
      'PRODUCT ASSETS',
      'BACKGROUND ASSETS',
      'THUMBNAIL GENERATION',
    ],
  },
  {
    id: 'openart',
    label: 'OPENART ADAPTER',
    responsibilities: [
      'LUXURY ENVIRONMENTS',
      'CAMPAIGN ARTWORK',
      'EDITORIAL GRAPHICS',
      'MOODBOARDS',
      'HERO IMAGES',
      'CONCEPT DEVELOPMENT',
    ],
  },
  {
    id: 'voice',
    label: 'VOICE ADAPTER',
    responsibilities: ['PSA VOICE', 'NARRATION', 'EPISODE INTROS', 'EPISODE OUTROS', 'VOICEOVERS'],
  },
  {
    id: 'email',
    label: 'EMAIL ADAPTER (RESEND)',
    responsibilities: [
      'TRANSACTIONAL EMAILS',
      'CAMPAIGN EMAILS',
      'NEWSLETTER DRAFTS',
      'HTML TEMPLATES',
    ],
  },
];

export type OrchestratorPipelineStepId =
  | 'topic'
  | 'content-brain'
  | 'creative-director'
  | 'intelligence-engine'
  | 'prompt-assembly'
  | 'ai-orchestrator'
  | 'provider-adapters'
  | 'generated-assets'
  | 'draft-package'
  | 'review'
  | 'approval'
  | 'scheduling'
  | 'publishing';

export const ORCHESTRATOR_PIPELINE_STEPS: Array<{ id: OrchestratorPipelineStepId; label: string }> = [
  { id: 'topic', label: 'TOPIC' },
  { id: 'content-brain', label: 'CONTENT BRAIN' },
  { id: 'creative-director', label: 'CREATIVE DIRECTOR' },
  { id: 'intelligence-engine', label: 'INTELLIGENCE ENGINE' },
  { id: 'prompt-assembly', label: 'PROMPT ASSEMBLY' },
  { id: 'ai-orchestrator', label: 'AI ORCHESTRATOR' },
  { id: 'provider-adapters', label: 'PROVIDER ADAPTERS' },
  { id: 'generated-assets', label: 'GENERATED ASSETS' },
  { id: 'draft-package', label: 'DRAFT PACKAGE' },
  { id: 'review', label: 'REVIEW' },
  { id: 'approval', label: 'APPROVAL' },
  { id: 'scheduling', label: 'SCHEDULING' },
  { id: 'publishing', label: 'PUBLISHING' },
];

export type ContentPackAssetSlotId =
  | 'episode'
  | 'journal'
  | 'email'
  | 'carousel'
  | 'reel'
  | 'tiktok'
  | 'pinterest'
  | 'push-notification'
  | 'thumbnail'
  | 'transcript'
  | 'captions'
  | 'metadata';

export const CONTENT_PACK_ASSET_SLOTS: Array<{ id: ContentPackAssetSlotId; label: string; defaultProvider: OrchestratorProviderId }> = [
  { id: 'episode', label: 'EPISODE', defaultProvider: 'openai' },
  { id: 'journal', label: 'JOURNAL', defaultProvider: 'openai' },
  { id: 'email', label: 'EMAIL', defaultProvider: 'email' },
  { id: 'carousel', label: 'CAROUSEL', defaultProvider: 'openai' },
  { id: 'reel', label: 'REEL', defaultProvider: 'fal' },
  { id: 'tiktok', label: 'TIKTOK', defaultProvider: 'openai' },
  { id: 'pinterest', label: 'PINTEREST', defaultProvider: 'openart' },
  { id: 'push-notification', label: 'PUSH NOTIFICATION', defaultProvider: 'openai' },
  { id: 'thumbnail', label: 'THUMBNAIL', defaultProvider: 'fal' },
  { id: 'transcript', label: 'TRANSCRIPT', defaultProvider: 'openai' },
  { id: 'captions', label: 'CAPTIONS', defaultProvider: 'openai' },
  { id: 'metadata', label: 'METADATA', defaultProvider: 'openai' },
];

export type ApprovalPipelineStatus =
  | 'draft'
  | 'needs-review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export const APPROVAL_PIPELINE_STATUSES: Array<{ id: ApprovalPipelineStatus; label: string; color: string }> = [
  { id: 'draft', label: 'DRAFT', color: '#808080' },
  { id: 'needs-review', label: 'NEEDS REVIEW', color: '#CA8A04' },
  { id: 'approved', label: 'APPROVED', color: '#16A34A' },
  { id: 'scheduled', label: 'SCHEDULED', color: '#2563EB' },
  { id: 'published', label: 'PUBLISHED', color: '#000000' },
  { id: 'archived', label: 'ARCHIVED', color: '#9CA3AF' },
];

export type OrchestratorErrorCode =
  | 'TIMEOUT'
  | 'QUOTA_LIMIT'
  | 'GENERATION_FAILED'
  | 'MISSING_ASSET'
  | 'PROVIDER_ERROR'
  | 'NOT_CONNECTED';

export const ORCHESTRATOR_ERROR_LABELS: Record<OrchestratorErrorCode, string> = {
  TIMEOUT: 'TIMEOUT — RETRY STEP',
  QUOTA_LIMIT: 'QUOTA LIMIT — WAIT OR SWITCH PROVIDER',
  GENERATION_FAILED: 'GENERATION FAILED — RETRY STEP',
  MISSING_ASSET: 'MISSING ASSET — RE-RUN UPSTREAM',
  PROVIDER_ERROR: 'PROVIDER ERROR — CHECK ADAPTER',
  NOT_CONNECTED: 'NOT CONNECTED — PHASE 2 WIRING',
};

export const ADMIN_STUDIO_ORCHESTRATOR_SUBTITLE =
  'FRONTAL SLAYER PRODUCTION TEAM — STUDIO TALKS ONLY TO THE ORCHESTRATOR · PROVIDERS ARE INTERCHANGEABLE.';

export const DEMO_ORCHESTRATOR_PACK_ID = 'demo-pack-cherry-red-forecast';
