/**
 * Knowledge Hub — living documentation layer for studio os (Milestone 20).
 * Demo/placeholder profiles and page guides; searchable wiki index.
 */

import { STUDIO_SET_SEPARATION_RULE, WEATHER_STUDIO_LAYER_SPECS } from './adminStudioSetSeparation';
import { ADMIN_STUDIO_MODULES, type AdminStudioModule } from './adminStudioNavigation';
import { ADMIN_STUDIO_BASE_PATH } from './adminStudioRoutes';
import { DOCUMENTATION_PAGE_GUIDE_OVERRIDES } from '../studio-os-core/documentation-sync/page-guide-overrides';
import { expandSemanticQuery } from '../studio-os-core/documentation-sync/semantic-search';
import { searchDocumentationFaq } from '../studio-os-core/documentation-sync/faq-registry';
import { DOCUMENTATION_SYSTEM_REGISTRY } from '../studio-os-core/documentation-sync/system-registry';
import { queryDocumentationRegistry } from '../studio-os-core/documentation-registry/smart-search';
import {
  adminStudioAssetDirectorStudioPath,
  adminStudioBlueprintDetailPath,
  adminStudioKnowledgeHubPath,
  adminStudioKnowledgeHubProfilePath,
  adminStudioKnowledgeHubWorkflowPath,
  adminStudioMemoryBiblePath,
} from './adminStudioRoutes';

export const KNOWLEDGE_HUB_SUBTITLE =
  'Interactive Manual + written Owner\'s Manual — learn studio os by using the live interface.';

export type KnowledgeObjectType =
  | 'studio'
  | 'show'
  | 'talent'
  | 'campaign'
  | 'product'
  | 'content-pack'
  | 'blueprint'
  | 'asset'
  | 'prompt'
  | 'material'
  | 'wardrobe'
  | 'scene'
  | 'workflow'
  | 'department'
  | 'module';

export type KnowledgeRelatedLink = {
  label: string;
  route: string;
  kind?: string;
};

export type KnowledgePageGuide = {
  moduleId: string;
  title: string;
  route: string;
  purpose: string;
  whyItExists: string;
  whenToUse: string[];
  bestPractices: string[];
  commonMistakes: string[];
  relatedPages: KnowledgeRelatedLink[];
  exampleWorkflows: string[];
  relatedAssets: string[];
  ownersManualChapter: string;
  tourSteps: string[];
  contextualHint?: string;
};

export type KnowledgeObjectProfile = {
  id: string;
  type: KnowledgeObjectType;
  name: string;
  previewSrc?: string;
  purpose: string;
  whyItExists?: string;
  typicalUses?: string[];
  bestFor?: string[];
  avoid?: string[];
  recommendedTalent?: string[];
  recommendedCameras?: string[];
  recommendedLighting?: string[];
  associatedProps?: string[];
  defaultIntro?: string;
  defaultOutro?: string;
  contentPacks?: string[];
  exampleProductions?: Array<{ title: string; previewSrc?: string; date?: string }>;
  relatedBlueprint?: KnowledgeRelatedLink;
  factoryStatus?: string;
  episodeLength?: string;
  publishingSchedule?: string;
  defaultStudio?: string;
  targetAudience?: string;
  typicalCta?: string;
  biography?: string;
  role?: string;
  shows?: string[];
  wardrobes?: string[];
  voice?: string;
  expressions?: string[];
  poses?: string[];
  studios?: string[];
  currentProjects?: string[];
  assetCount?: number;
  audience?: string;
  campaigns?: string[];
  relatedProducts?: string[];
  relationshipChain?: KnowledgeRelatedLink[];
  searchableText: string;
  /** Studio profiles — five-layer set separation. */
  setSeparationRule?: string;
  masterStudioItems?: string[];
  referenceSceneItems?: string[];
  setDressingItems?: string[];
  talentLayerItems?: string[];
  episodeGraphicsItems?: string[];
  productionBuilderNote?: string;
};

export type KnowledgeWorkflowGuide = {
  id: string;
  title: string;
  subtitle: string;
  steps: Array<{ title: string; detail: string; route?: string }>;
  relatedModules: string[];
};

export type KnowledgeSearchHit = {
  id: string;
  title: string;
  category: string;
  snippet: string;
  route: string;
};

export type KnowledgeMissionStats = {
  unreadGuides: number;
  newFeatures: number;
  recommendedLearning: string[];
  documentationUpdates: string[];
  knowledgeHealthPct: number;
};

export type KnowledgeEadTip = {
  id: string;
  tone: 'tip' | 'warning' | 'insight';
  text: string;
  relatedRoute?: string;
};

function modulePageGuide(mod: AdminStudioModule): KnowledgePageGuide {
  return {
    moduleId: mod.id,
    title: mod.title,
    route: mod.route.split('?')[0],
    purpose: mod.purpose,
    whyItExists: `${mod.title} is a studio os module in the ${mod.groupId.toUpperCase()} department — ${mod.purpose}`,
    whenToUse: [
      `When you need to ${mod.purpose.toLowerCase().replace(/\.$/, '')}`,
      `During ${mod.groupId} planning and daily production`,
      'Before approving assets or publishing to members',
    ],
    bestPractices: [
      'Read the blueprint or bible before generating',
      'Keep Asset Director approvals current',
      'Link outputs back to Content Packs',
    ],
    commonMistakes: [
      'Skipping approval gates',
      'Generating without an approved blueprint',
      'Publishing before QA review',
    ],
    relatedPages: ADMIN_STUDIO_MODULES.filter((m) => m.groupId === mod.groupId && m.id !== mod.id)
      .slice(0, 4)
      .map((m) => ({ label: m.title, route: m.route.split('?')[0] })),
    exampleWorkflows: [`OPEN ${mod.title} → REVIEW STATUS → TAKE ACTION`],
    relatedAssets: ['STUDIOS', 'TALENT', 'BLUEPRINTS', 'CONTENT PACKS'],
    ownersManualChapter: `CHAPTER · ${mod.title}`,
    tourSteps: [
      `Welcome to ${mod.title}`,
      'Review purpose and status metric',
      'Use related modules from the knowledge panel',
      'Return to Mission Control when done',
    ],
    contextualHint: mod.status === 'coming-soon' ? 'MODULE IN PREVIEW — PLACEHOLDER DATA ONLY' : undefined,
  };
}

const PAGE_GUIDE_OVERRIDES: Partial<Record<string, Partial<KnowledgePageGuide>>> = {
  ...DOCUMENTATION_PAGE_GUIDE_OVERRIDES,
  'asset-director': {
    whenToUse: [
      'Before publishing any studio, talent, or wardrobe asset',
      'When versioning DAY / NIGHT / SEASONAL studio outputs',
      'To preview 21:9 masters and approve factory deliveries',
    ],
    exampleWorkflows: [
      'OPEN WEATHER STUDIO → GENERATE DAY → PREVIEW TILE → APPROVE',
      'REPLACE VERSION WITH UPLOADED MASTER → ASSET DIRECTOR UPDATES',
    ],
    tourSteps: [
      'Browse STUDIOS or TALENT hubs',
      'Open a studio detail — review VERSIONS grid',
      'PREVIEW opens full-screen interactive master',
      'GENERATE runs live Fal pipeline when configured',
    ],
  },
  'asset-factory': {
    whenToUse: [
      'After a blueprint is APPROVED in Blueprint Manager',
      'When manufacturing full creative systems from specs',
      'To track department progress on multi-variant jobs',
    ],
    commonMistakes: [
      'Starting factory runs before blueprint approval',
      'Ignoring FAILED jobs from earlier auth or reference errors',
    ],
  },
  'knowledge-hub': {
    purpose: 'Living documentation — Interactive Manual, Knowledge Graph, search, and written Owner\'s Manual synchronized.',
    whyItExists: 'Documentation Synchronization™ keeps every help surface aligned with current Studio OS architecture.',
    whenToUse: ['Onboarding new operators', 'Searching for any Studio OS concept', 'Planning workflows', 'Reviewing What\'s New'],
    bestPractices: [
      'Use semantic search — try "memory" or "AI" to surface related systems',
      'Complete Getting Started progression before advanced intelligence modules',
      'Press ⓘ on any page for contextual help',
    ],
    relatedPages: [
      { label: 'MEMORY BIBLE', route: adminStudioMemoryBiblePath() },
    ],
    contextualHint: 'M125 · DOCUMENTATION SYNCHRONIZED — SEARCH UNDERSTANDS ALIASES AND RELATED CONCEPTS',
  },
  'memory-bible': {
    purpose: 'Curated institutional knowledge — founder context, naming, decisions, and AI context packages.',
    whyItExists:
      'studio os owns long-term business memory for agents, contractors, and team — not scattered chat history or a single AI vendor memory.',
    whenToUse: [
      'Before starting a development or design milestone',
      'When onboarding a contractor, designer, or developer',
      'To verify official names and past decisions',
      'To generate a task-specific AI context package',
    ],
    bestPractices: [
      'Use AI Context Builder for Cursor / OpenArt / contractor handoffs',
      'Append Decision Log entries instead of overwriting history',
      'Link decisions to Knowledge Graph nodes when relevant',
    ],
    commonMistakes: [
      'Relying on ChatGPT memory instead of Memory Bible',
      'Using deprecated names from Naming Bible',
      'Exposing founder profile on customer-facing pages',
    ],
    relatedPages: [
      { label: 'KNOWLEDGE HUB', route: adminStudioKnowledgeHubPath() },
      { label: 'MISSION CONTROL', route: `${ADMIN_STUDIO_BASE_PATH}/mission-control` },
    ],
    exampleWorkflows: [
      'OPEN MEMORY BIBLE → REVIEW NAMING → CHECK DECISION LOG → BUILD CURSOR CONTEXT PACKAGE',
      'SELECT FRONTAL SLAYER WORKSPACE → PHOTOGRAPHY SCOPE → EXPORT MARKDOWN FOR CONTRACTOR',
    ],
    tourSteps: [
      'Review Founder Profile and workspace memory',
      'Search Naming Bible for official module names',
      'Read Decision Log for architecture choices',
      'Open AI Context Builder — select target, task, and scopes',
      'Copy context or export markdown with traceable sources',
    ],
    ownersManualChapter: 'CHAPTER · MEMORY BIBLE · INSTITUTIONAL KNOWLEDGE',
  },
  'mission-control': {
    whenToUse: ['Start of every production day', 'Reviewing approvals and mission health'],
    relatedPages: [
      { label: 'KNOWLEDGE HUB', route: adminStudioKnowledgeHubPath() },
      { label: 'EXECUTIVE AI DIRECTOR', route: `${ADMIN_STUDIO_BASE_PATH}/executive-ai-director` },
    ],
  },
};

export const KNOWLEDGE_PAGE_GUIDES: KnowledgePageGuide[] = [
  ...ADMIN_STUDIO_MODULES.map((mod) => ({
    ...modulePageGuide(mod),
    ...(PAGE_GUIDE_OVERRIDES[mod.id] ?? {}),
  })),
  {
    moduleId: 'knowledge-hub',
    title: 'KNOWLEDGE HUB',
    route: adminStudioKnowledgeHubPath(),
    purpose: 'Living documentation layer — every object explains itself.',
    whyItExists: 'studio os should teach itself like Apple Tips × Notion Wiki × Figma Community.',
    whenToUse: ['Learn any module', 'Search wiki', 'Read object profiles', 'Take tours'],
    bestPractices: ['Tap ⓘ on any page for contextual help', 'Bookmark workflow guides'],
    commonMistakes: ['Skipping object profiles before first generate'],
    relatedPages: [{ label: 'MISSION CONTROL', route: `${ADMIN_STUDIO_BASE_PATH}/mission-control` }],
    exampleWorkflows: ['SEARCH → OPEN PROFILE → FOLLOW WORKFLOW → OPEN OWNER MANUAL CHAPTER'],
    relatedAssets: ['STUDIOS', 'SHOWS', 'TALENT', 'BLUEPRINTS'],
    ownersManualChapter: 'CHAPTER 0 · KNOWLEDGE HUB',
    tourSteps: ['Search the wiki', 'Open Weather Studio profile', 'Take Creating a Studio workflow'],
  },
];

export const KNOWLEDGE_OBJECT_PROFILES: KnowledgeObjectProfile[] = [
  {
    id: 'studio-ad-studio-weather',
    type: 'studio',
    name: 'WEATHER STUDIO',
    previewSrc: '/assets/NOIR/noir-thumb.png',
    purpose: 'Luxury broadcast studio for recurring forecast-style productions.',
    whyItExists: 'Provides one reusable filming environment for all forecast-based content.',
    typicalUses: [
      'Weekly Slay Report',
      'Trend Forecast',
      'Launch Forecast',
      'Seasonal Forecast',
      'Membership Updates',
      'Email Header Videos',
    ],
    bestFor: ['Educational content', 'Industry commentary', 'Forecast series'],
    avoid: ['Product close-ups', 'Interview formats', 'Long podcasts'],
    recommendedTalent: ['PSA', 'Guest Stylist', 'Founder'],
    recommendedCameras: ['Wide', 'Medium', 'Close'],
    recommendedLighting: ['Broadcast', 'Luxury Day', 'Luxury Night'],
    associatedProps: ['Forecast Desk', 'Forecast Screen', 'Glass Panels', 'Luxury Skyline', 'Microphone'],
    defaultIntro: 'Weather Intro',
    defaultOutro: 'Forecast Outro',
    contentPacks: ['The Slay Report', 'Trend Forecast', 'Launch Forecast'],
    exampleProductions: [
      { title: 'SLAY REPORT · EP 12', previewSrc: '/assets/NOIR/wave-thumb.png', date: '2026-06-01' },
      { title: 'TREND FORECAST · SUMMER', previewSrc: '/assets/NOIR/curl-thumb.png', date: '2026-05-15' },
    ],
    relatedBlueprint: {
      label: 'WEATHER STUDIO BLUEPRINT',
      route: adminStudioBlueprintDetailPath('bp-weather-studio'),
    },
    factoryStatus: 'MASTER NEEDS GENERATION · REFERENCE SCENE AVAILABLE',
    setSeparationRule: STUDIO_SET_SEPARATION_RULE,
    masterStudioItems: WEATHER_STUDIO_LAYER_SPECS.find((l) => l.layerId === 'master-studio')?.items,
    referenceSceneItems: WEATHER_STUDIO_LAYER_SPECS.find((l) => l.layerId === 'reference-scene')?.items,
    setDressingItems: WEATHER_STUDIO_LAYER_SPECS.find((l) => l.layerId === 'set-dressing')?.items,
    talentLayerItems: WEATHER_STUDIO_LAYER_SPECS.find((l) => l.layerId === 'talent-layer')?.items,
    episodeGraphicsItems: WEATHER_STUDIO_LAYER_SPECS.find((l) => l.layerId === 'episode-graphics')?.items,
    productionBuilderNote:
      'ASSEMBLE IN PRODUCTION BUILDER: Master Studio + Set Dressing + Talent + Wardrobe + Lighting + Camera + Episode Graphics + CTA',
    relationshipChain: [
      { label: 'THE SLAY REPORT', route: `${ADMIN_STUDIO_BASE_PATH}/shows`, kind: 'USED BY' },
      { label: 'FORECAST DESK', route: adminStudioAssetDirectorStudioPath('ad-studio-weather'), kind: 'USES' },
      { label: 'BROADCAST LIGHTING', route: `${ADMIN_STUDIO_BASE_PATH}/asset-director/section/lighting`, kind: 'USES' },
    ],
    searchableText:
      'weather studio glass forecast marble cherry red broadcast slay report trend forecast lounge tv',
  },
  {
    id: 'show-slay-report',
    type: 'show',
    name: 'THE SLAY REPORT',
    previewSrc: '/assets/NOIR/wave-thumb.png',
    purpose: 'Weekly luxury beauty forecast.',
    episodeLength: '5–10 minutes',
    publishingSchedule: 'Weekly',
    defaultStudio: 'Weather Studio',
    typicalUses: ['Member education', 'Trend commentary'],
    targetAudience: 'Members',
    typicalCta: 'Visit Lounge TV',
    recommendedTalent: ['PSA'],
    exampleProductions: [
      { title: 'EP 11 · LACE TRENDS', previewSrc: '/assets/NOIR/noir-thumb.png' },
      { title: 'EP 10 · SUMMER COLOR', previewSrc: '/assets/NOIR/blanco-thumb.png' },
    ],
    relationshipChain: [
      { label: 'WEATHER STUDIO', route: adminStudioAssetDirectorStudioPath('ad-studio-weather'), kind: 'FILMS IN' },
    ],
    searchableText: 'slay report weekly show forecast members lounge tv',
  },
  {
    id: 'talent-psa',
    type: 'talent',
    name: 'PSA',
    previewSrc: '/assets/personal-assistant-icon.svg',
    purpose: 'Founder-voice on-camera host and trusted educator.',
    biography: 'Luxury hair bestie — trust over sales, four pillars concierge / educator.',
    role: 'PSA HOST',
    shows: ['The Slay Report', 'Lounge TV Learn'],
    wardrobes: ['Luxury White Outfit', 'Editorial Black'],
    voice: 'Warm · authoritative · never robotic',
    expressions: ['Confident', 'Welcoming', 'Expert'],
    poses: ['Desk anchor', 'Standing forecast', 'Close teaching'],
    studios: ['Weather Studio', 'Hair Lab'],
    currentProjects: ['Slay Report Q3', 'Academy Lace Series'],
    assetCount: 48,
    exampleProductions: [{ title: 'PSA · FORECAST OPEN', previewSrc: '/assets/NOIR/noir-thumb.png' }],
    searchableText: 'psa founder host talent voice concierge educator',
  },
  {
    id: 'blueprint-bp-weather-studio',
    type: 'blueprint',
    name: 'WEATHER STUDIO BLUEPRINT',
    purpose: 'Canonical spec for glass forecast wing — drives Asset Factory generation.',
    factoryStatus: 'APPROVED · PRODUCTION READY',
    relatedBlueprint: {
      label: 'OPEN IN BLUEPRINT MANAGER',
      route: adminStudioBlueprintDetailPath('bp-weather-studio'),
    },
    searchableText: 'blueprint weather studio asset factory spec dna',
  },
  {
    id: 'module-asset-director',
    type: 'module',
    name: 'ASSET DIRECTOR',
    purpose: 'Visual source of truth — approve studios, talent, and delivery assets.',
    typicalUses: ['Version tiles', 'GENERATE / REPLACE', 'Quick preview'],
    searchableText: 'asset director versions preview generate',
  },
  {
    id: 'module-asset-factory',
    type: 'module',
    name: 'ASSET FACTORY',
    purpose: 'Manufacturing department — builds creative systems from approved blueprints.',
    factoryStatus: 'LIVE PIPELINE FOR SINGLE-VARIANT GENERATE',
    searchableText: 'asset factory fal manufacturing queue',
  },
];

export const KNOWLEDGE_WORKFLOW_GUIDES: KnowledgeWorkflowGuide[] = [
  {
    id: 'creating-a-studio',
    title: 'CREATING A STUDIO',
    subtitle: 'Master Studio vs Reference Scene — five-layer separation',
    steps: [
      { title: 'DEFINE BLUEPRINT', detail: 'Blueprint Manager → five layers: Master · Reference · Dressing · Talent · Graphics', route: adminStudioBlueprintDetailPath('bp-weather-studio') },
      { title: 'GENERATE MASTER STUDIO', detail: 'Empty reusable set — no talent, products, or episode text' },
      { title: 'GENERATE REFERENCE SCENE', detail: 'Staged example with PSA, graphics, products — guidance only' },
      { title: 'OPEN ASSET DIRECTOR', detail: 'Studios → Weather Studio → verify layer sections', route: adminStudioAssetDirectorStudioPath('ad-studio-weather') },
      { title: 'ASSEMBLE IN PRODUCTION BUILDER', detail: 'Layer Master + Dressing + Talent + Graphics per scene' },
    ],
    relatedModules: ['blueprint-manager', 'asset-director', 'asset-factory', 'production-builder'],
  },
  {
    id: 'studio-set-separation',
    title: 'STUDIO SET SEPARATION',
    subtitle: 'Permanent sets vs temporary production elements',
    steps: [
      { title: 'MASTER STUDIO', detail: 'Clean empty filming environment — reusable across episodes' },
      { title: 'REFERENCE SCENE', detail: 'Finished mockup — never replaces Master Studio' },
      { title: 'SET DRESSING', detail: 'Reusable props attached in Production Builder' },
      { title: 'TALENT LAYERS', detail: 'From Talent Agency — layered, never baked into Master' },
      { title: 'EPISODE GRAPHICS', detail: 'Per Content Pack overlays — toggled in Director Mode' },
    ],
    relatedModules: ['asset-director', 'production-builder', 'director-mode', 'talent-agency'],
  },
  {
    id: 'generating-assets',
    title: 'GENERATING ASSETS',
    subtitle: 'Asset Director → Factory → Fal → delivery',
    steps: [
      { title: 'PICK VARIANT', detail: 'DAY / NIGHT / HOLIDAY / SUMMER tile' },
      { title: 'GENERATE', detail: 'Server uses marble + studio refs + blueprint prompt — not wig thumbs' },
      { title: 'REVIEW OUTPUT', detail: 'Tile updates with Supabase URL · subtitle FACTORY GENERATED' },
      { title: 'OPTIONAL FACTORY', detail: 'Open Asset Factory to inspect job logs' },
    ],
    relatedModules: ['asset-director', 'asset-factory', 'blueprint-manager'],
  },
  {
    id: 'building-a-campaign',
    title: 'BUILDING A CAMPAIGN',
    subtitle: 'Campaign Orchestrator launch planner',
    steps: [
      { title: 'OBJECTIVE', detail: 'Campaign Orchestrator wizard — pick campaign type' },
      { title: 'SCHEDULE', detail: 'Timeline + department tasks' },
      { title: 'EAD REVIEW', detail: 'Executive AI Director pre-production review' },
      { title: 'APPROVE GATES', detail: 'Human approval before generation / publishing' },
    ],
    relatedModules: ['campaign-orchestrator', 'executive-ai-director', 'mission-control'],
  },
  {
    id: 'publishing-lounge-tv',
    title: 'PUBLISHING LOUNGE TV',
    subtitle: 'Content pack → production → distribution',
    steps: [
      { title: 'CONTENT PACK', detail: 'Build pack in Production Pipeline' },
      { title: 'PRODUCTION BUILDER', detail: 'Assemble scenes from approved assets' },
      { title: 'DISTRIBUTION', detail: 'Queue via Distribution Network' },
    ],
    relatedModules: ['production', 'production-builder', 'distribution-network'],
  },
  {
    id: 'getting-started-studio-os',
    title: 'GETTING STARTED WITH STUDIO OS',
    subtitle: 'Progressive onboarding — organization to consciousness (M125)',
    steps: [
      { title: 'ORGANIZATION', detail: 'Register workspace and organizational identity', route: `${ADMIN_STUDIO_BASE_PATH}/studio-os` },
      { title: 'BUSINESS DISCOVERY BLUEPRINT™', detail: 'Capture how your business operates', route: `${ADMIN_STUDIO_BASE_PATH}/business-discovery-blueprint` },
      { title: 'PROFESSION BRAIN™', detail: 'Activate living professional expertise', route: `${ADMIN_STUDIO_BASE_PATH}/profession-brain` },
      { title: 'HEADQUARTERS', detail: 'Open Mission Control — executive nerve center', route: `${ADMIN_STUDIO_BASE_PATH}/mission-control` },
      { title: 'COMMAND DOCK™', detail: 'Speak naturally — Studio OS routes intelligently', route: `${ADMIN_STUDIO_BASE_PATH}/command-dock` },
      { title: 'EXECUTIVE COUNCIL™', detail: 'Many minds, one briefing', route: `${ADMIN_STUDIO_BASE_PATH}/executive-council` },
      { title: 'STUDIO INSTITUTE™', detail: 'Learn from expertise — carry legacy forward', route: `${ADMIN_STUDIO_BASE_PATH}/studio-institute` },
      { title: 'ADVANCED INTELLIGENCE', detail: 'Studio Intelligence Architecture → Model Orchestrator → Foundation Models', route: `${ADMIN_STUDIO_BASE_PATH}/studio-intelligence-architecture` },
    ],
    relatedModules: ['business-discovery-blueprint', 'profession-brain', 'mission-control', 'command-dock', 'studio-intelligence-architecture', 'model-orchestrator', 'studio-foundation-models'],
  },
  {
    id: 'intelligence-stack-m120-m124',
    title: 'STUDIO INTELLIGENCE STACK',
    subtitle: 'M120–M124 sync chain — operating manual to foundation models',
    steps: [
      { title: 'OPERATING MANUAL™', detail: 'One handbook — always current (M120)', route: `${ADMIN_STUDIO_BASE_PATH}/organization-operating-manual` },
      { title: 'LEGACY NETWORK™', detail: 'Share expertise globally with attribution (M121)', route: `${ADMIN_STUDIO_BASE_PATH}/legacy-network` },
      { title: 'STUDIO INTELLIGENCE ARCHITECTURE', detail: 'Knowledge Fabric + Context Engine (M122)', route: `${ADMIN_STUDIO_BASE_PATH}/studio-intelligence-architecture` },
      { title: 'MODEL ORCHESTRATOR™', detail: 'AI Swap Engine — providers interchangeable (M123)', route: `${ADMIN_STUDIO_BASE_PATH}/model-orchestrator` },
      { title: 'STUDIO FOUNDATION MODELS™', detail: 'Long-term Studio-owned intelligence (M124)', route: `${ADMIN_STUDIO_BASE_PATH}/studio-foundation-models` },
    ],
    relatedModules: ['organization-operating-manual', 'legacy-network', 'studio-intelligence-architecture', 'model-orchestrator', 'studio-foundation-models'],
  },
];

export const KNOWLEDGE_MISSION_STATS: KnowledgeMissionStats = {
  unreadGuides: 3,
  newFeatures: 5,
  recommendedLearning: [
    'GETTING STARTED WITH STUDIO OS',
    'STUDIO INTELLIGENCE STACK M120–M124',
    'SEMANTIC SEARCH — TRY "MEMORY" OR "AI"',
  ],
  documentationUpdates: [
    'M126 DOCUMENTATION REGISTRY™',
    '32+ FEATURES REGISTERED ONCE',
    'WALKTHROUGH + ACADEMY AUTO-SYNC',
  ],
  knowledgeHealthPct: 97,
};

export const KNOWLEDGE_EAD_TIPS: KnowledgeEadTip[] = [
  {
    id: 'ead-k-1',
    tone: 'tip',
    text: 'Approve Weather Studio DAY variant before scheduling Slay Report production.',
    relatedRoute: adminStudioAssetDirectorStudioPath('ad-studio-weather'),
  },
  {
    id: 'ead-k-2',
    tone: 'warning',
    text: 'Asset Factory FAILED rows are historical — check Asset Director tile for live output.',
    relatedRoute: `${ADMIN_STUDIO_BASE_PATH}/asset-factory`,
  },
  {
    id: 'ead-k-3',
    tone: 'insight',
    text: 'Knowledge Hub profiles link every studio to its blueprint and content packs.',
    relatedRoute: adminStudioKnowledgeHubPath(),
  },
];

export function getPageKnowledgeForPath(pathname: string): KnowledgePageGuide | undefined {
  const normalized = pathname.replace(/\/$/, '') || '/';
  const sorted = [...KNOWLEDGE_PAGE_GUIDES].sort((a, b) => b.route.length - a.route.length);
  for (const guide of sorted) {
    if (normalized === guide.route || normalized.startsWith(`${guide.route}/`)) {
      return guide;
    }
  }
  if (normalized.startsWith(`${ADMIN_STUDIO_BASE_PATH}/`)) {
    return KNOWLEDGE_PAGE_GUIDES.find((g) => g.moduleId === 'studio-overview');
  }
  return undefined;
}

export function getKnowledgeProfile(profileId: string): KnowledgeObjectProfile | undefined {
  return KNOWLEDGE_OBJECT_PROFILES.find((p) => p.id === profileId);
}

export function getKnowledgeWorkflow(workflowId: string): KnowledgeWorkflowGuide | undefined {
  return KNOWLEDGE_WORKFLOW_GUIDES.find((w) => w.id === workflowId);
}

export function searchKnowledgeHub(query: string, limit = 24): KnowledgeSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const registryHits = queryDocumentationRegistry(q, Math.min(limit, 8)).map((hit) => ({
    id: `registry-${hit.entry.internalId}`,
    title: hit.entry.officialName,
    category: 'REGISTRY',
    snippet: hit.entry.purpose.slice(0, 120),
    route: hit.entry.route ?? adminStudioKnowledgeHubPath(),
  }));

  const { expandedTerms, relatedSystemIds } = expandSemanticQuery(q);
  const terms = expandedTerms.length > 0 ? expandedTerms : [q];
  const hits: KnowledgeSearchHit[] = [...registryHits];

  const matchesBlob = (blob: string) => terms.some((t) => blob.includes(t));

  for (const guide of KNOWLEDGE_PAGE_GUIDES) {
    const blob = `${guide.title} ${guide.purpose} ${guide.whyItExists} ${guide.whenToUse.join(' ')}`.toLowerCase();
    if (matchesBlob(blob) || relatedSystemIds.includes(guide.moduleId)) {
      hits.push({
        id: `page-${guide.moduleId}`,
        title: guide.title,
        category: 'MODULE',
        snippet: guide.purpose,
        route: guide.route,
      });
    }
  }

  for (const sys of DOCUMENTATION_SYSTEM_REGISTRY) {
    const blob = `${sys.label} ${sys.purpose} ${sys.overview} ${sys.aliases.join(' ')}`.toLowerCase();
    if (matchesBlob(blob) || relatedSystemIds.includes(sys.id)) {
      if (!hits.some((h) => h.id === `page-${sys.moduleId ?? sys.id}`)) {
        hits.push({
          id: `doc-${sys.id}`,
          title: sys.label,
          category: 'DOCUMENTATION',
          snippet: sys.overview.slice(0, 120),
          route: sys.route ?? adminStudioKnowledgeHubPath(),
        });
      }
    }
  }

  for (const faq of searchDocumentationFaq(q, 6)) {
    hits.push({
      id: faq.id,
      title: faq.question,
      category: 'FAQ',
      snippet: faq.answer.slice(0, 120),
      route: adminStudioKnowledgeHubPath(),
    });
  }

  for (const profile of KNOWLEDGE_OBJECT_PROFILES) {
    if (matchesBlob(profile.searchableText.toLowerCase()) || matchesBlob(profile.name.toLowerCase())) {
      hits.push({
        id: profile.id,
        title: profile.name,
        category: profile.type.toUpperCase(),
        snippet: profile.purpose,
        route: adminStudioKnowledgeHubProfilePath(profile.id),
      });
    }
  }

  for (const wf of KNOWLEDGE_WORKFLOW_GUIDES) {
    const blob = `${wf.title} ${wf.subtitle} ${wf.steps.map((s) => s.title).join(' ')}`.toLowerCase();
    if (matchesBlob(blob)) {
      hits.push({
        id: `wf-${wf.id}`,
        title: wf.title,
        category: 'WORKFLOW',
        snippet: wf.subtitle,
        route: adminStudioKnowledgeHubWorkflowPath(wf.id),
      });
    }
  }

  return hits.slice(0, limit);
}

export const KNOWLEDGE_PROFILE_TYPE_LABELS: Record<KnowledgeObjectType, string> = {
  studio: 'STUDIO',
  show: 'SHOW',
  talent: 'TALENT',
  campaign: 'CAMPAIGN',
  product: 'PRODUCT',
  'content-pack': 'CONTENT PACK',
  blueprint: 'BLUEPRINT',
  asset: 'ASSET',
  prompt: 'PROMPT',
  material: 'MATERIAL',
  wardrobe: 'WARDROBE',
  scene: 'SCENE',
  workflow: 'WORKFLOW',
  department: 'DEPARTMENT',
  module: 'MODULE',
};
