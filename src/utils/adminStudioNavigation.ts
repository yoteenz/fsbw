/**
 * studio os navigation registry — grouped nav, breadcrumbs, and module metadata.
 * UI-only; does not change routes or business logic.
 */

import { ADMIN_STUDIO_BASE_PATH } from './adminStudioRoutes';
import type { StudioOsCoreModuleId } from '../studio-os-core/core/modules';

export type StudioNavGroupId =
  | 'overview'
  | 'create'
  | 'visuals'
  | 'production'
  | 'distribution'
  | 'intelligence'
  | 'legacy'
  | 'settings';

export type StudioModuleStatus = 'live' | 'demo' | 'coming-soon';

export type AdminStudioModule = {
  id: string;
  title: string;
  /** One-sentence plain-English purpose. */
  purpose: string;
  route: string;
  groupId: StudioNavGroupId;
  status: StudioModuleStatus;
  /** Demo metric shown on cards (e.g. last updated count). */
  metric: string;
  ctaLabel: string;
  /** Workspace moduleCopy key when available. */
  moduleKey?: StudioOsCoreModuleId | 'studio-dashboard';
  /** Shown on overview only — omit on dense sub-nav. */
  featuredOnOverview?: boolean;
};

export type StudioNavGroup = {
  id: StudioNavGroupId;
  label: string;
  description: string;
};

export const STUDIO_NAV_GROUPS: readonly StudioNavGroup[] = [
  { id: 'overview', label: 'OVERVIEW', description: 'COMMAND SURFACE · DASHBOARD · DAILY SIGNALS' },
  { id: 'create', label: 'CREATE', description: 'IDEATION · BIBLES · PROMPTS · AI TOOLS' },
  { id: 'visuals', label: 'VISUALS', description: 'SETS · TALENT · ASSETS · CASTING' },
  { id: 'production', label: 'PRODUCTION', description: 'PACKS · PIPELINE · AI EXECUTION' },
  { id: 'distribution', label: 'DISTRIBUTION', description: 'CHANNELS · QUEUE · CALENDAR' },
  { id: 'intelligence', label: 'INTELLIGENCE', description: 'STRATEGY · AUDIENCE · ANALYTICS' },
  { id: 'legacy', label: 'LEGACY', description: 'ARCHIVE · HALL OF FAME · VAULT' },
  { id: 'settings', label: 'SETTINGS', description: 'WORKSPACE · BRAND · PLATFORM' },
] as const;

export const STUDIO_OVERVIEW_PATH = `${ADMIN_STUDIO_BASE_PATH}/overview`;

const p = (segment: string) => `${ADMIN_STUDIO_BASE_PATH}/${segment.replace(/^\//, '')}`;

/** Canonical module directory — every existing Studio route remains reachable. */
export const ADMIN_STUDIO_MODULES: readonly AdminStudioModule[] = [
  // OVERVIEW
  {
    id: 'mission-control',
    title: 'MISSION CONTROL',
    purpose: 'Executive operating room — missions, departments, approvals, and live workspace activity in one view.',
    route: p('mission-control'),
    groupId: 'overview',
    status: 'demo',
    metric: 'HQ',
    ctaLabel: 'ENTER HQ',
    featuredOnOverview: true,
  },
  {
    id: 'chief-of-staff',
    title: 'CHIEF OF STAFF',
    purpose: 'Founder primary executive — soft approvals, unified briefings, and attention protection before escalations.',
    route: p('chief-of-staff'),
    groupId: 'overview',
    status: 'demo',
    metric: '2 REVIEWS',
    ctaLabel: 'OPEN CHIEF OF STAFF',
    featuredOnOverview: true,
  },
  {
    id: 'executive-organization',
    title: 'EXECUTIVE ORGANIZATION',
    purpose: 'Living leadership team — executive HQ, departments, teams, workers, culture, and organizational memory.',
    route: p('executive-organization'),
    groupId: 'overview',
    status: 'demo',
    metric: 'v1.0',
    ctaLabel: 'OPEN EXEC ORG',
    moduleKey: 'executive-organization',
    featuredOnOverview: true,
  },
  {
    id: 'organizational-inheritance',
    title: 'ORGANIZATIONAL INHERITANCE',
    purpose: 'Inherit proven organizational genetics — DNA, playbooks, executives, and institutional knowledge across companies.',
    route: p('organizational-inheritance'),
    groupId: 'overview',
    status: 'demo',
    metric: 'v1.0',
    ctaLabel: 'OPEN INHERITANCE',
    moduleKey: 'organizational-inheritance',
    featuredOnOverview: true,
  },
  {
    id: 'strategy-engine',
    title: 'STRATEGY ENGINE',
    purpose: 'Defines the game each company is playing — strategy board, initiatives, alignment, and direction before execution.',
    route: p('strategy-engine'),
    groupId: 'intelligence',
    status: 'demo',
    metric: 'v1.0',
    ctaLabel: 'OPEN STRATEGY',
    moduleKey: 'strategy-engine',
    featuredOnOverview: true,
  },
  {
    id: 'campaign-engine',
    title: 'CAMPAIGN ENGINE',
    purpose: 'Transforms strategy into coordinated execution — campaigns bridge initiatives and production.',
    route: p('campaign-engine'),
    groupId: 'production',
    status: 'demo',
    metric: 'v1.0',
    ctaLabel: 'OPEN CAMPAIGNS',
    moduleKey: 'campaign-engine',
    featuredOnOverview: true,
  },
  {
    id: 'work-orchestration',
    title: 'WORK ORCHESTRATION',
    purpose: 'Transforms objectives into coordinated execution — work packages, dependencies, and CoS orchestration.',
    route: p('work-orchestration'),
    groupId: 'production',
    status: 'demo',
    metric: 'v1.0',
    ctaLabel: 'OPEN ORCHESTRATION',
    moduleKey: 'work-orchestration',
    featuredOnOverview: true,
  },
  {
    id: 'executive-command-center',
    title: 'EXECUTIVE COMMAND CENTER',
    purpose: 'See company health, priorities, and decisions in one executive view.',
    route: p('executive-command-center'),
    groupId: 'overview',
    status: 'demo',
    metric: '12 SIGNALS',
    ctaLabel: 'OPEN COMMAND CENTER',
    moduleKey: 'executive-command-center',
    featuredOnOverview: true,
  },
  {
    id: 'studio-overview',
    title: 'STUDIO DASHBOARD',
    purpose: 'Browse every Studio module by department with quick-launch cards.',
    route: STUDIO_OVERVIEW_PATH,
    groupId: 'overview',
    status: 'live',
    metric: '32 MODULES',
    ctaLabel: 'VIEW OVERVIEW',
    moduleKey: 'studio-dashboard',
    featuredOnOverview: true,
  },
  {
    id: 'daily-briefing',
    title: 'DAILY BRIEFING',
    purpose: 'Read today’s creative direction, topics, and production priorities.',
    route: p('creative-director'),
    groupId: 'overview',
    status: 'demo',
    metric: 'TODAY',
    ctaLabel: 'READ BRIEFING',
    moduleKey: 'creative-director',
    featuredOnOverview: true,
  },
  // CREATE
  {
    id: 'content-brain',
    title: 'CONTENT BRAIN',
    purpose: 'Store brand rules, show bibles, and editorial knowledge for every AI tool.',
    route: p('content-brain'),
    groupId: 'create',
    status: 'demo',
    metric: '9 SECTIONS',
    ctaLabel: 'OPEN CONTENT BRAIN',
    moduleKey: 'content-brain',
    featuredOnOverview: true,
  },
  {
    id: 'creative-director',
    title: 'CREATIVE DIRECTOR',
    purpose: 'Run the creative decision engine before any production or AI run.',
    route: p('creative-director'),
    groupId: 'create',
    status: 'demo',
    metric: '4 WIDGETS',
    ctaLabel: 'OPEN DIRECTOR',
    moduleKey: 'creative-director',
    featuredOnOverview: true,
  },
  {
    id: 'show-bible',
    title: 'SHOW BIBLE',
    purpose: 'Define show DNA, episode structure, and on-air standards.',
    route: p('show-bible'),
    groupId: 'create',
    status: 'demo',
    metric: '8 SHOWS',
    ctaLabel: 'OPEN SHOW BIBLE',
    moduleKey: 'show-bible',
    featuredOnOverview: true,
  },
  {
    id: 'prompt-library',
    title: 'PROMPT LIBRARY',
    purpose: 'Curate approved prompts for PSA, Lounge TV, and marketing.',
    route: p('prompt-library'),
    groupId: 'create',
    status: 'demo',
    metric: '63',
    ctaLabel: 'BROWSE PROMPTS',
    featuredOnOverview: true,
  },
  {
    id: 'ai-studio',
    title: 'AI STUDIO',
    purpose: 'Generate scripts, thumbnails, and campaign assets in one workspace.',
    route: p('ai-studio'),
    groupId: 'create',
    status: 'demo',
    metric: '121',
    ctaLabel: 'OPEN AI STUDIO',
    featuredOnOverview: true,
  },
  {
    id: 'shows',
    title: 'SHOWS',
    purpose: 'Manage series, episodes, and Lounge TV programming.',
    route: p('shows'),
    groupId: 'create',
    status: 'demo',
    metric: '8',
    ctaLabel: 'VIEW SHOWS',
  },
  {
    id: 'ai-orchestrator',
    title: 'AI ORCHESTRATOR',
    purpose: 'Coordinate multi-step AI workflows across Studio modules.',
    route: p('ai-orchestrator'),
    groupId: 'create',
    status: 'demo',
    metric: '6 FLOWS',
    ctaLabel: 'OPEN ORCHESTRATOR',
  },
  {
    id: 'recent-generations',
    title: 'RECENT GENERATIONS',
    purpose: 'Review the latest AI outputs awaiting approval.',
    route: p('recent-generations'),
    groupId: 'create',
    status: 'coming-soon',
    metric: '12',
    ctaLabel: 'VIEW OUTPUTS',
  },
  // VISUALS
  {
    id: 'asset-director',
    title: 'ASSET DIRECTOR',
    purpose: 'Approve studios, talent looks, and visual libraries for every channel.',
    route: p('asset-director'),
    groupId: 'visuals',
    status: 'demo',
    metric: '16 SECTIONS',
    ctaLabel: 'OPEN ASSET DIRECTOR',
    moduleKey: 'asset-director',
    featuredOnOverview: true,
  },
  {
    id: 'blueprint-manager',
    title: 'BLUEPRINT MANAGER',
    purpose: 'Define creative DNA before generation — studios, talent, campaigns, and every asset spec.',
    route: p('blueprint-manager'),
    groupId: 'visuals',
    status: 'demo',
    metric: '16 TYPES',
    ctaLabel: 'OPEN BLUEPRINTS',
    featuredOnOverview: true,
  },
  {
    id: 'asset-factory',
    title: 'ASSET FACTORY',
    purpose: 'Manufacture complete creative systems from approved blueprints — executive, floor, and tour views.',
    route: p('asset-factory'),
    groupId: 'visuals',
    status: 'demo',
    metric: '3 VIEWS',
    ctaLabel: 'ENTER FACTORY',
    featuredOnOverview: true,
  },
  {
    id: 'studio-lot',
    title: 'STUDIO LOT',
    purpose: 'Tour virtual sets and production environments before you shoot.',
    route: p('studio-lot'),
    groupId: 'visuals',
    status: 'demo',
    metric: '5 SETS',
    ctaLabel: 'ENTER LOT',
    moduleKey: 'studio-lot',
    featuredOnOverview: true,
  },
  {
    id: 'talent-agency',
    title: 'TALENT AGENCY',
    purpose: 'Browse on-camera personalities, contracts, and usage rights.',
    route: p('talent-agency'),
    groupId: 'visuals',
    status: 'demo',
    metric: '14 TALENT',
    ctaLabel: 'VIEW ROSTER',
    moduleKey: 'talent-agency',
    featuredOnOverview: true,
  },
  {
    id: 'casting',
    title: 'CASTING',
    purpose: 'Run casting boards and approve talent for each production.',
    route: p('casting'),
    groupId: 'visuals',
    status: 'demo',
    metric: '3 BOARDS',
    ctaLabel: 'OPEN CASTING',
    moduleKey: 'casting',
    featuredOnOverview: true,
  },
  {
    id: 'brand-assets',
    title: 'BRAND ASSETS',
    purpose: 'Official brand visual standards — Photography Bible, media kits, and locked product photography specs.',
    route: p('brand-assets'),
    groupId: 'visuals',
    status: 'demo',
    metric: 'V1.0',
    ctaLabel: 'OPEN BRAND ASSETS',
    featuredOnOverview: true,
  },
  {
    id: 'asset-library',
    title: 'ASSET LIBRARY',
    purpose: 'Browse thumbnails, heroes, B-roll, and brand films.',
    route: p('asset-library'),
    groupId: 'visuals',
    status: 'coming-soon',
    metric: '214',
    ctaLabel: 'BROWSE ASSETS',
  },
  // PRODUCTION
  {
    id: 'director-mode',
    title: 'DIRECTOR MODE',
    purpose: 'Rehearse productions in a cinematic control room before AI generates assets.',
    route: p('director-mode'),
    groupId: 'production',
    status: 'demo',
    metric: 'CINEMA',
    ctaLabel: 'ENTER DIRECTOR MODE',
    featuredOnOverview: true,
  },
  {
    id: 'production-builder',
    title: 'PRODUCTION BUILDER',
    purpose: 'Visually assemble studios, talent, and scenes before AI generates your content pack.',
    route: p('production-builder'),
    groupId: 'production',
    status: 'demo',
    metric: 'VISUAL',
    ctaLabel: 'OPEN BUILDER',
    featuredOnOverview: true,
  },
  {
    id: 'content-packs',
    title: 'CONTENT PACKS',
    purpose: 'Bundle weekly video, article, and checklist releases.',
    route: p('content-packs'),
    groupId: 'production',
    status: 'demo',
    metric: '42',
    ctaLabel: 'VIEW PACKS',
    featuredOnOverview: true,
  },
  {
    id: 'production',
    title: 'PRODUCTION PIPELINE',
    purpose: 'Track packs from draft through final delivery.',
    route: p('production'),
    groupId: 'production',
    status: 'demo',
    metric: '7 ACTIVE',
    ctaLabel: 'OPEN PIPELINE',
    moduleKey: 'production-pipeline',
    featuredOnOverview: true,
  },
  {
    id: 'ai-production-engine',
    title: 'AI PRODUCTION ENGINE',
    purpose: 'Automate render queues and department handoffs with AI.',
    route: p('ai-production-engine'),
    groupId: 'production',
    status: 'demo',
    metric: '4 RUNS',
    ctaLabel: 'OPEN ENGINE',
    moduleKey: 'ai-production-engine',
    featuredOnOverview: true,
  },
  {
    id: 'drafts',
    title: 'DRAFTS',
    purpose: 'See work-in-progress across every channel.',
    route: p('drafts'),
    groupId: 'production',
    status: 'coming-soon',
    metric: '18',
    ctaLabel: 'VIEW DRAFTS',
  },
  // DISTRIBUTION
  {
    id: 'distribution-engine',
    title: 'DISTRIBUTION ENGINE',
    purpose: 'Global distribution for knowledge assets — channel optimization, evergreen, and institutional learning.',
    route: p('distribution-engine'),
    groupId: 'distribution',
    status: 'demo',
    metric: 'v1.0',
    ctaLabel: 'OPEN DISTRIBUTION',
    moduleKey: 'distribution-engine',
    featuredOnOverview: true,
  },
  {
    id: 'distribution-network',
    title: 'DISTRIBUTION NETWORK',
    purpose: 'Route one story to Lounge, email, social, and partner channels.',
    route: p('distribution-network'),
    groupId: 'distribution',
    status: 'demo',
    metric: '6 CHANNELS',
    ctaLabel: 'OPEN NETWORK',
    moduleKey: 'distribution-network',
    featuredOnOverview: true,
  },
  {
    id: 'campaign-orchestrator',
    title: 'CAMPAIGN ORCHESTRATOR',
    purpose: 'Turn one business objective into a complete launch plan with timeline, tasks, and approvals.',
    route: p('campaign-orchestrator'),
    groupId: 'distribution',
    status: 'demo',
    metric: '16 TYPES',
    ctaLabel: 'OPEN ORCHESTRATOR',
    featuredOnOverview: true,
  },
  {
    id: 'publishing-queue',
    title: 'PUBLISHING QUEUE',
    purpose: 'Ship approved content to Lounge, email, and social.',
    route: p('publishing-queue'),
    groupId: 'distribution',
    status: 'demo',
    metric: '6',
    ctaLabel: 'OPEN QUEUE',
    featuredOnOverview: true,
  },
  {
    id: 'calendar',
    title: 'CALENDAR',
    purpose: 'Plan editorial rhythm and premiere dates.',
    route: p('calendar'),
    groupId: 'distribution',
    status: 'coming-soon',
    metric: '14',
    ctaLabel: 'VIEW CALENDAR',
    featuredOnOverview: true,
  },
  {
    id: 'social-accounts',
    title: 'SOCIAL ACCOUNTS',
    purpose: 'Connect official OAuth accounts for approved publishing.',
    route: p('social-accounts'),
    groupId: 'distribution',
    status: 'demo',
    metric: '4 PLATFORMS',
    ctaLabel: 'MANAGE ACCOUNTS',
  },
  {
    id: 'scheduled',
    title: 'SCHEDULED',
    purpose: 'View locked release dates and premiere slots.',
    route: p('scheduled'),
    groupId: 'distribution',
    status: 'coming-soon',
    metric: '6',
    ctaLabel: 'VIEW SCHEDULE',
  },
  // INTELLIGENCE
  {
    id: 'executive-ai-director',
    title: 'EXECUTIVE AI DIRECTOR',
    purpose: 'Executive advisor that coaches, forecasts, and optimizes from workspace intelligence.',
    route: p('executive-ai-director'),
    groupId: 'intelligence',
    status: 'demo',
    metric: 'ADVISOR',
    ctaLabel: 'OPEN ADVISOR',
    featuredOnOverview: true,
  },
  {
    id: 'knowledge-hub',
    title: 'KNOWLEDGE HUB',
    purpose: 'Living documentation — every studio os object explains itself; searchable wiki and workflow guides.',
    route: p('knowledge-hub'),
    groupId: 'intelligence',
    status: 'live',
    metric: 'WIKI',
    ctaLabel: 'OPEN KNOWLEDGE HUB',
    moduleKey: 'knowledge-hub',
    featuredOnOverview: true,
  },
  {
    id: 'memory-bible',
    title: 'MEMORY BIBLE',
    purpose: 'Institutional knowledge — founder context, naming bible, decision log, and AI context builder.',
    route: p('memory-bible'),
    groupId: 'intelligence',
    status: 'live',
    metric: 'v1.0',
    ctaLabel: 'OPEN MEMORY BIBLE',
    moduleKey: 'memory-bible',
    featuredOnOverview: true,
  },
  {
    id: 'leadership-dna',
    title: 'LEADERSHIP DNA',
    purpose: 'Founder operating blueprint — decision framework, approval patterns, and primary Chief of Staff training system.',
    route: p('leadership-dna'),
    groupId: 'intelligence',
    status: 'demo',
    metric: 'v1.0',
    ctaLabel: 'OPEN LEADERSHIP DNA',
    moduleKey: 'leadership-dna',
    featuredOnOverview: true,
  },
  {
    id: 'tutorial-os',
    title: 'TUTORIAL OS',
    purpose: 'Manage onboarding tutorial walkthroughs — The Mansion Tour, hotspots, progress analytics, and preview.',
    route: p('tutorial-os'),
    groupId: 'intelligence',
    status: 'demo',
    metric: 'MANSION',
    ctaLabel: 'OPEN TUTORIAL OS',
    featuredOnOverview: true,
  },
  {
    id: 'intelligence-engine',
    title: 'INTELLIGENCE ENGINE',
    purpose: 'Turn connected data into evidence-based recommendations.',
    route: p('intelligence-engine'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '8 INSIGHTS',
    ctaLabel: 'OPEN ENGINE',
    moduleKey: 'intelligence-engine',
    featuredOnOverview: true,
  },
  {
    id: 'audience-brain',
    title: 'AUDIENCE BRAIN',
    purpose: 'Learn from every interaction and refine audience journeys.',
    route: p('audience-brain'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '5 SEGMENTS',
    ctaLabel: 'OPEN AUDIENCE',
    moduleKey: 'audience-brain',
    featuredOnOverview: true,
  },
  {
    id: 'growth-network',
    title: 'GROWTH NETWORK',
    purpose: 'Discover opportunities, manage partnerships, and scale revenue intelligently.',
    route: p('growth-network'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN GROWTH',
    moduleKey: 'growth-network',
    featuredOnOverview: true,
  },
  {
    id: 'labs',
    title: 'STUDIO OS LABS',
    purpose: 'Experiment engine & learning system — every publish becomes institutional intelligence.',
    route: p('labs'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN LABS',
    moduleKey: 'labs',
    featuredOnOverview: true,
  },
  {
    id: 'ai-media-network',
    title: 'AI MEDIA NETWORK',
    purpose: 'Digital media network — 5 pillars, 5 shows, programming calendar, monetization, Labs integration.',
    route: p('ai-media-network'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '9 TABS',
    ctaLabel: 'OPEN NETWORK',
    moduleKey: 'ai-media-network',
    featuredOnOverview: true,
  },
  {
    id: 'ndxbook',
    title: 'NDXBOOK',
    purpose: 'Public media brand for AI Media — indexed pages, volumes, chapters, programming, social placeholders, Labs tracking.',
    route: p('ndxbook'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '12 TABS',
    ctaLabel: 'OPEN BRAND',
    moduleKey: 'ndxbook',
    featuredOnOverview: true,
  },
  {
    id: 'talent-network',
    title: 'TALENT NETWORK',
    purpose: 'Unified talent OS — AI + human registry, casting, wardrobe, contracts, performance score, character evolution.',
    route: p('talent-network'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN TALENT NETWORK',
    moduleKey: 'talent-network',
    featuredOnOverview: true,
  },
  {
    id: 'marketplace',
    title: 'MARKETPLACE',
    purpose: 'Professional operating network — intelligent matching, deal center, collaboration hubs, trust, lasting partnerships.',
    route: p('marketplace'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN MARKETPLACE',
    moduleKey: 'marketplace',
    featuredOnOverview: true,
  },
  {
    id: 'business-model-engine',
    title: 'BUSINESS MODEL ENGINE',
    purpose: 'Economic engine — membership, billing, usage, fees, wallets, royalties, asset marketplaces, enterprise, aligned incentives.',
    route: p('business-model-engine'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN BME',
    moduleKey: 'business-model-engine',
    featuredOnOverview: true,
  },
  {
    id: 'ecosystem',
    title: 'STUDIO OS ECOSYSTEM',
    purpose: 'Business operating ecosystem — blueprints, DNA, automations, executives. Install complete operating systems, not plugins.',
    route: p('ecosystem'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN ECOSYSTEM',
    moduleKey: 'ecosystem',
    featuredOnOverview: true,
  },
  {
    id: 'governance',
    title: 'STUDIO OS GOVERNANCE',
    purpose: 'Trust, quality, compliance, moderation, verification, certification — platform constitution for responsible growth.',
    route: p('governance'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN GOVERNANCE',
    moduleKey: 'governance',
    featuredOnOverview: true,
  },
  {
    id: 'studio-intelligence',
    title: 'STUDIO INTELLIGENCE',
    purpose: 'Operating intelligence — executive briefings, opportunity/risk engines, business health, proactive recommendations.',
    route: p('studio-intelligence'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN INTELLIGENCE',
    moduleKey: 'studio-intelligence',
    featuredOnOverview: true,
  },
  {
    id: 'simulation-engine',
    title: 'SIMULATION ENGINE',
    purpose: 'Model decisions before committing — scenarios, risk, financial/marketing/content sims. Not predictions.',
    route: p('simulation-engine'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '14 TABS',
    ctaLabel: 'OPEN SIMULATION',
    moduleKey: 'simulation-engine',
    featuredOnOverview: true,
  },
  {
    id: 'vision-engine',
    title: 'VISION ENGINE',
    purpose: 'Generate cinematic Vision Modes — Builder, Recorder, Share, Analytics. Internal only.',
    route: p('vision-engine'),
    groupId: 'intelligence',
    status: 'demo',
    metric: '11 MODES',
    ctaLabel: 'OPEN VISION',
    moduleKey: 'vision-engine',
    featuredOnOverview: true,
  },
  {
    id: 'analytics',
    title: 'ANALYTICS',
    purpose: 'Track views, completion, and content performance.',
    route: p('analytics'),
    groupId: 'intelligence',
    status: 'coming-soon',
    metric: '—',
    ctaLabel: 'VIEW ANALYTICS',
    featuredOnOverview: true,
  },
  // LEGACY
  {
    id: 'legacy-system',
    title: 'LEGACY SYSTEM',
    purpose: 'Preserve institutional memory and the living museum of the brand.',
    route: p('legacy-system'),
    groupId: 'legacy',
    status: 'demo',
    metric: 'MUSEUM',
    ctaLabel: 'ENTER LEGACY',
    moduleKey: 'legacy-system',
    featuredOnOverview: true,
  },
  {
    id: 'legacy-archives',
    title: 'ARCHIVES',
    purpose: 'Browse historical records, campaigns, and milestone documents.',
    route: `${p('legacy-system/museum')}?tab=archives`,
    groupId: 'legacy',
    status: 'demo',
    metric: '48 RECORDS',
    ctaLabel: 'OPEN ARCHIVES',
    featuredOnOverview: true,
  },
  {
    id: 'legacy-hall-of-fame',
    title: 'HALL OF FAME',
    purpose: 'Celebrate standout talent, shows, and community moments.',
    route: `${p('legacy-system/museum')}?tab=hall-of-fame`,
    groupId: 'legacy',
    status: 'demo',
    metric: '12 INDUCTEES',
    ctaLabel: 'VIEW HALL',
    featuredOnOverview: true,
  },
  {
    id: 'legacy-vault',
    title: 'VAULT OF FIRSTS',
    purpose: 'Honor first-of-their-kind wins and breakthrough moments.',
    route: `${p('legacy-system/museum')}?tab=vault`,
    groupId: 'legacy',
    status: 'demo',
    metric: '9 FIRSTS',
    ctaLabel: 'OPEN VAULT',
    featuredOnOverview: true,
  },
  // SETTINGS
  {
    id: 'workspace-settings',
    title: 'WORKSPACE SETTINGS',
    purpose: 'Switch workspaces and manage brand-scoped Studio access.',
    route: '/admin/studio-os',
    groupId: 'settings',
    status: 'live',
    metric: '4 SPACES',
    ctaLabel: 'OPEN WORKSPACES',
    featuredOnOverview: true,
  },
  {
    id: 'brand-config',
    title: 'BRAND CONFIG',
    purpose: 'Edit brand voice, rules, and visual standards in Content Brain.',
    route: p('content-brain/brand-brain'),
    groupId: 'settings',
    status: 'demo',
    metric: 'BRAND',
    ctaLabel: 'EDIT BRAND',
    featuredOnOverview: true,
  },
  {
    id: 'platform-settings',
    title: 'PLATFORM SETTINGS',
    purpose: 'studio os platform identity and workspace registry (VXD Inc.).',
    route: '/admin/studio-os',
    groupId: 'settings',
    status: 'live',
    metric: 'STUDIO OS',
    ctaLabel: 'PLATFORM',
    featuredOnOverview: true,
  },
] as const;

const MODULES_BY_ROUTE_LENGTH = [...ADMIN_STUDIO_MODULES].sort((a, b) => {
  const aBase = a.route.split('?')[0];
  const bBase = b.route.split('?')[0];
  return bBase.length - aBase.length;
});

export function getStudioNavGroup(id: StudioNavGroupId): StudioNavGroup | undefined {
  return STUDIO_NAV_GROUPS.find((g) => g.id === id);
}

export function getStudioModuleById(id: string): AdminStudioModule | undefined {
  return ADMIN_STUDIO_MODULES.find((m) => m.id === id);
}

export function getModulesForGroup(groupId: StudioNavGroupId, options?: { overviewOnly?: boolean }): AdminStudioModule[] {
  const list = ADMIN_STUDIO_MODULES.filter((m) => m.groupId === groupId);
  if (options?.overviewOnly) {
    const featured = list.filter((m) => m.featuredOnOverview);
    return featured.length > 0 ? featured : list.slice(0, 6);
  }
  return list;
}

export function resolveStudioModuleFromPath(pathname: string): AdminStudioModule | undefined {
  const normalized = pathname.replace(/\/$/, '') || '/';

  if (normalized === `${ADMIN_STUDIO_BASE_PATH}/hub`) {
    return getStudioModuleById('studio-overview');
  }

  for (const mod of MODULES_BY_ROUTE_LENGTH) {
    const base = mod.route.split('?')[0];
    if (normalized === base || normalized.startsWith(`${base}/`)) {
      return mod;
    }
  }

  const sectionMatch = normalized.match(new RegExp(`^${ADMIN_STUDIO_BASE_PATH}/([^/]+)`));
  if (sectionMatch) {
    const sectionId = sectionMatch[1];
    return ADMIN_STUDIO_MODULES.find((m) => m.id === sectionId);
  }

  return undefined;
}

export type StudioBreadcrumbSegment = {
  label: string;
  path?: string;
};

export function buildStudioBreadcrumbs(pathname: string, pageTitle?: string): StudioBreadcrumbSegment[] {
  const mod = resolveStudioModuleFromPath(pathname);
  const segments: StudioBreadcrumbSegment[] = [
    { label: 'ADMIN', path: '/admin/dashboard' },
    { label: 'STUDIO OS', path: STUDIO_OVERVIEW_PATH },
  ];

  if (mod) {
    const group = getStudioNavGroup(mod.groupId);
    if (group) {
      segments.push({ label: group.label, path: `${STUDIO_OVERVIEW_PATH}?group=${mod.groupId}` });
    }
    if (mod.id !== 'studio-overview') {
      segments.push({ label: mod.title, path: mod.route.split('?')[0] });
    }
  }

  if (pageTitle && pageTitle !== mod?.title) {
    segments.push({ label: pageTitle });
  }

  return segments;
}

export const STUDIO_STATUS_LABELS: Record<StudioModuleStatus, string> = {
  live: 'LIVE',
  demo: 'DEMO',
  'coming-soon': 'COMING SOON',
};
