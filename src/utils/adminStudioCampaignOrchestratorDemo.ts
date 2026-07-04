/**
 * Campaign Orchestrator — operational launch planner (Milestone 17).
 * Demo/placeholder; one goal → one plan → every deliverable.
 */

export const CAMPAIGN_ORCHESTRATOR_SUBTITLE = 'ONE GOAL. ONE PLAN. EVERY DELIVERABLE.';

export const CAMPAIGN_ORCHESTRATOR_INHERITANCE_CHAIN = [
  'EXECUTIVE AI DIRECTOR',
  'CAMPAIGN ORCHESTRATOR',
  'PRODUCTION BUILDER',
  'CONTENT PACKS',
  'DISTRIBUTION',
  'LEGACY',
] as const;

export type CampaignTypeId =
  | 'product-launch'
  | 'collection-launch'
  | 'membership'
  | 'holiday'
  | 'giveaway'
  | 'educational-series'
  | 'brand-awareness'
  | 'community-event'
  | 'product-restock'
  | 'seasonal-collection'
  | 'email-sequence'
  | 'sales-promotion'
  | 'referral'
  | 'affiliate'
  | 'content-series'
  | 'custom';

export type CampaignRecurrence = 'none' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

export type CampaignDepartmentId =
  | 'research'
  | 'creative'
  | 'visual'
  | 'production'
  | 'editorial'
  | 'publishing'
  | 'analytics'
  | 'legacy';

export type ApprovalGateId = 'production' | 'generation' | 'publishing' | 'scheduling' | 'distribution';

export type CampaignWizardStep = 1 | 2 | 3 | 4 | 5;

export type CampaignTypeDefinition = {
  id: CampaignTypeId;
  label: string;
  deliverables: string[];
};

export const CAMPAIGN_TYPES: CampaignTypeDefinition[] = [
  { id: 'product-launch', label: 'PRODUCT LAUNCH', deliverables: ['HERO BANNER', 'LOUNGE TV', 'EMAIL', 'SOCIAL REELS', 'JOURNAL', 'PRODUCT GRAPHICS'] },
  { id: 'collection-launch', label: 'COLLECTION LAUNCH', deliverables: ['LOOKBOOK', 'PINTEREST', 'INSTAGRAM', 'EMAIL', 'LANDING PAGE'] },
  { id: 'membership', label: 'MEMBERSHIP CAMPAIGN', deliverables: ['EMAIL SEQUENCE', 'PUSH', 'JOURNAL', 'LOUNGE TV'] },
  { id: 'holiday', label: 'HOLIDAY CAMPAIGN', deliverables: ['HERO', 'EMAIL', 'SOCIAL', 'GIFT GUIDE', 'LOUNGE TV'] },
  { id: 'giveaway', label: 'GIVEAWAY', deliverables: ['SOCIAL', 'EMAIL', 'LANDING PAGE', 'STORIES'] },
  { id: 'educational-series', label: 'EDUCATIONAL SERIES', deliverables: ['EPISODES', 'JOURNAL', 'FAQ', 'LOUNGE TV', 'CHECKLIST'] },
  { id: 'brand-awareness', label: 'BRAND AWARENESS', deliverables: ['HERO', 'BEHIND THE SCENES', 'TIKTOK', 'JOURNAL'] },
  { id: 'community-event', label: 'COMMUNITY EVENT', deliverables: ['EMAIL', 'PUSH', 'SOCIAL', 'LANDING PAGE'] },
  { id: 'product-restock', label: 'PRODUCT RESTOCK', deliverables: ['PUSH', 'EMAIL', 'INSTAGRAM', 'PRODUCT HERO'] },
  { id: 'seasonal-collection', label: 'SEASONAL COLLECTION', deliverables: ['LOOKBOOK', 'PINTEREST', 'EMAIL', 'LOUNGE TV'] },
  { id: 'email-sequence', label: 'EMAIL SEQUENCE', deliverables: ['EMAIL 1', 'EMAIL 2', 'EMAIL 3', 'PUSH'] },
  { id: 'sales-promotion', label: 'SALES PROMOTION', deliverables: ['EMAIL', 'HERO BANNER', 'SOCIAL', 'PUSH'] },
  { id: 'referral', label: 'REFERRAL CAMPAIGN', deliverables: ['EMAIL', 'JOURNAL', 'SOCIAL', 'LANDING PAGE'] },
  { id: 'affiliate', label: 'AFFILIATE CAMPAIGN', deliverables: ['ASSETS KIT', 'EMAIL', 'SOCIAL', 'FAQ'] },
  { id: 'content-series', label: 'CONTENT SERIES', deliverables: ['EPISODES', 'JOURNAL', 'SOCIAL CLIPS', 'LOUNGE TV'] },
  { id: 'custom', label: 'CUSTOM CAMPAIGN', deliverables: ['CONTENT PACK', 'EMAIL', 'SOCIAL', 'JOURNAL'] },
];

export const CAMPAIGN_PRODUCTS = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'] as const;
export const CAMPAIGN_COLLECTIONS = ['SIGNATURE', 'SUMMER LUXURY', 'EDITORIAL NOIR', 'CARE ESSENTIALS'] as const;
export const CAMPAIGN_AUDIENCES = ['ALL CLIENTS', 'PREMIUM MEMBERS', 'BLACK TIER', 'NEW SUBSCRIBERS', 'LAPSED MEMBERS'] as const;
export const CAMPAIGN_REGIONS = ['NORTH AMERICA', 'GLOBAL', 'US ONLY'] as const;
export const CAMPAIGN_SHOWS = ['THE SLAY REPORT', 'SLAY LAB', 'PSA SESSIONS', 'LOUNGE TV LEARN'] as const;
export const CAMPAIGN_STUDIOS = ['WEATHER STUDIO', 'BUILD STUDIO', 'CAMPAIGN STUDIO', 'PRODUCT STUDIO'] as const;
export const CAMPAIGN_TALENT = ['PSA', 'LUXURY STYLIST', 'BEAUTY REPORTER'] as const;

export type CampaignWizardDraft = {
  step: CampaignWizardStep;
  name: string;
  typeId: CampaignTypeId;
  workspace: string;
  brand: string;
  goals: string;
  products: string[];
  collections: string[];
  memberships: string[];
  audience: string;
  regions: string[];
  launchDate: string;
  lengthWeeks: number;
  priority: 'high' | 'medium' | 'low';
  budgetPlaceholder: string;
  theme: string;
  shows: string[];
  studios: string[];
  talent: string[];
  moodboards: string[];
  brandMaterials: string[];
  recurrence: CampaignRecurrence;
};

export type CampaignTimelinePhase = {
  id: string;
  week: number;
  label: string;
  focus: string;
};

export type CampaignTaskStatus = 'waiting' | 'working' | 'ready' | 'complete' | 'blocked';

export type CampaignTask = {
  id: string;
  title: string;
  department: CampaignDepartmentId;
  status: CampaignTaskStatus;
  dependsOn?: string[];
  deliverableType?: string;
  week: number;
};

export type CampaignDeliverable = {
  id: string;
  type: string;
  channel: string;
  status: 'planned' | 'in-production' | 'ready' | 'published';
};

export type CampaignApprovalGate = {
  id: ApprovalGateId;
  label: string;
  approved: boolean;
  required: boolean;
};

export type CampaignAutomationRule = {
  id: string;
  trigger: string;
  action: string;
  enabled: boolean;
  stopsAtApproval: boolean;
};

export type CampaignRecommendation = {
  id: string;
  title: string;
  reasoning: string;
  source: 'history' | 'config' | 'estimate';
};

export type CampaignExecutiveReview = {
  timelineScore: number;
  resourcesScore: number;
  contentMixScore: number;
  brandAlignment: number;
  audienceAlignment: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
};

export type CampaignWhatIfScenario = {
  id: string;
  label: string;
  launchDate: string;
  estimatedReach: string;
  estimatedRevenue: string;
  confidence: string;
};

export type CampaignMemoryEntry = {
  id: string;
  lessonsLearned: string;
  performance: string;
  recordedAt: string;
};

export type CampaignBlueprintId = 'launch' | 'holiday' | 'product-drop' | 'membership' | 'email';

export type CampaignBlueprint = {
  id: CampaignBlueprintId;
  name: string;
  typeId: CampaignTypeId;
  description: string;
};

export const CAMPAIGN_BLUEPRINTS: CampaignBlueprint[] = [
  { id: 'launch', name: 'LAUNCH BLUEPRINT', typeId: 'product-launch', description: '6-WEEK TEASE → REVEAL → LAUNCH → RETENTION' },
  { id: 'holiday', name: 'HOLIDAY BLUEPRINT', typeId: 'holiday', description: 'SEASONAL LUXURY MULTI-CHANNEL' },
  { id: 'product-drop', name: 'PRODUCT DROP BLUEPRINT', typeId: 'product-restock', description: 'RESTOCK ALERT + SOCIAL + EMAIL' },
  { id: 'membership', name: 'MEMBERSHIP BLUEPRINT', typeId: 'membership', description: 'PREMIUM CONVERSION SEQUENCE' },
  { id: 'email', name: 'EMAIL BLUEPRINT', typeId: 'email-sequence', description: '3-PART EDITORIAL SEQUENCE' },
];

export type CampaignPlan = {
  id: string;
  wizard: CampaignWizardDraft;
  timeline: CampaignTimelinePhase[];
  tasks: CampaignTask[];
  deliverables: CampaignDeliverable[];
  approvals: CampaignApprovalGate[];
  automation: CampaignAutomationRule[];
  recommendations: CampaignRecommendation[];
  executiveReview: CampaignExecutiveReview;
  whatIfScenarios: CampaignWhatIfScenario[];
  readinessScore: number;
  riskScore: number;
  progressPct: number;
  createdAt: string;
  status: 'draft' | 'planned' | 'in-progress' | 'complete' | 'archived';
  memory?: CampaignMemoryEntry;
};

export const DELIVERABLE_CATALOG = [
  'CONTENT PACKS', 'EPISODES', 'JOURNAL ARTICLES', 'EMAILS', 'PUSH NOTIFICATIONS',
  'SOCIAL POSTS', 'LOUNGE TV RELEASES', 'LANDING PAGES', 'HERO BANNERS', 'PRODUCT GRAPHICS',
  'PINTEREST PINS', 'TIKTOK VIDEOS', 'INSTAGRAM REELS', 'STORIES', 'BEHIND THE SCENES', 'FAQ CONTENT',
] as const;

export const CAMPAIGN_DEPARTMENTS: Array<{ id: CampaignDepartmentId; label: string }> = [
  { id: 'research', label: 'RESEARCH' },
  { id: 'creative', label: 'CREATIVE' },
  { id: 'visual', label: 'VISUAL' },
  { id: 'production', label: 'PRODUCTION' },
  { id: 'editorial', label: 'EDITORIAL' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'legacy', label: 'LEGACY' },
];

export function createDefaultWizard(): CampaignWizardDraft {
  return {
    step: 1,
    name: '',
    typeId: 'product-launch',
    workspace: 'FRONTAL SLAYER',
    brand: 'FRONTAL SLAYER',
    goals: '',
    products: [],
    collections: [],
    memberships: [],
    audience: 'ALL CLIENTS',
    regions: ['NORTH AMERICA'],
    launchDate: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10),
    lengthWeeks: 6,
    priority: 'high',
    budgetPlaceholder: '$2,400',
    theme: 'LUXURY EDITORIAL',
    shows: [],
    studios: [],
    talent: [],
    moodboards: [],
    brandMaterials: [],
    recurrence: 'none',
  };
}

export function getCampaignType(id: CampaignTypeId): CampaignTypeDefinition | undefined {
  return CAMPAIGN_TYPES.find((t) => t.id === id);
}
