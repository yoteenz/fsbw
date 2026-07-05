import { bootstrapDigitalArchitectStore } from './store';
import type { DigitalArchitectStore, ExperienceMode } from './types';

export function buildDigitalArchitectSeed(): Partial<DigitalArchitectStore> {
  const experienceModes: ExperienceMode[] = [
    { id: 'classic', label: 'CLASSIC', idealFor: ['Consulting', 'Services', 'Local business', 'Professional firms'], capabilities: ['Responsive website', 'CMS', 'SEO', 'Contact', 'Blog', 'Analytics'], previewLabel: 'Professional services flagship', status: 'available' },
    { id: 'luxury', label: 'LUXURY', idealFor: ['Luxury brands', 'Fashion', 'Beauty', 'Hospitality', 'Fine jewelry'], capabilities: ['Cinematic storytelling', 'Immersive scroll', 'Premium typography', 'Luxury ecommerce', 'Concierge'], previewLabel: 'Luxury flagship · cinematic commerce', status: 'available' },
    { id: 'immersive', label: 'IMMERSIVE', idealFor: ['Virtual experiences', '3D commerce', 'Brand worlds', 'Interactive storytelling'], capabilities: ['Immersive navigation', 'Dynamic environments', 'Advanced motion', 'Non-linear exploration'], previewLabel: 'Virtual commerce environment', status: 'available' },
    { id: 'editorial', label: 'EDITORIAL', idealFor: ['Media', 'Publishing', 'Education', 'Thought leadership', 'Knowledge companies'], capabilities: ['Reading journeys', 'Reader graph', 'Knowledge discovery', 'Subscriptions', 'Knowledge assets'], previewLabel: 'Future newsroom · stat-forward authority', status: 'recommended' },
    { id: 'community', label: 'COMMUNITY', idealFor: ['Memberships', 'Communities', 'Creator ecosystems', 'Private groups'], capabilities: ['Community interaction', 'Events', 'Recognition', 'Relationship engine', 'Member progression'], previewLabel: 'Member community · advocate pipeline', status: 'available' },
    { id: 'marketplace', label: 'MARKETPLACE', idealFor: ['Marketplaces', 'Creator economies', 'Booking', 'Vendors', 'Freelancers'], capabilities: ['Buyers · sellers', 'Payments', 'Trust systems', 'Matching', 'Reviews'], previewLabel: 'Creator marketplace ecosystem', status: 'available' },
    { id: 'enterprise', label: 'ENTERPRISE', idealFor: ['Internal systems', 'Operations', 'Executive dashboards', 'CRM', 'ERP'], capabilities: ['Workflow orchestration', 'Org intelligence', 'Client portals', 'Employee platforms'], previewLabel: 'Enterprise mission control', status: 'available' },
    { id: 'saas', label: 'SAAS', idealFor: ['Subscription software', 'AI products', 'Automation', 'Analytics', 'Developer tools'], capabilities: ['Auth', 'Subscriptions', 'Permissions', 'Billing', 'API architecture', 'Usage analytics'], previewLabel: 'Studio OS platform shell', status: 'available' },
    { id: 'custom', label: 'CUSTOM', idealFor: ['Bespoke ecosystems', 'No predefined layouts', 'First principles design'], capabilities: ['Business architecture', 'Brand + experience inheritance', 'Long-term strategy', 'Unprecedented experiences'], previewLabel: 'Fully bespoke digital world', status: 'available' },
  ];

  return {
    companyName: 'NDXBOOK',
    dashboard: {
      summary: 'DIGITAL ARCHITECT V2.0 — digital solution architect · purpose before templates · unforgettable digital worlds · launch architect handoff.',
      architectureHealthPct: 84,
      inheritanceCompletenessPct: 0,
      designSystemPct: 0,
      implementationReadinessPct: 0,
      selectedMode: 'editorial',
      approvalStatus: 'in-review',
    },
    activeWorkspaceId: 'ndxbook',
    experienceModes: experienceModes.map((m) => (
      m.id === 'editorial' ? { ...m, status: 'selected' as const } : m
    )),
    hybridArchitectures: [
      { id: 'hyb-1', label: 'EDITORIAL + COMMUNITY', modes: ['editorial', 'community'], description: 'Knowledge-first media with membership community · reader graph · advocate pipeline', confidencePct: 91 },
      { id: 'hyb-2', label: 'EDITORIAL + MARKETPLACE', modes: ['editorial', 'marketplace'], description: 'Authority content + creator economy · distribution + creator marketplace', confidencePct: 78 },
      { id: 'hyb-3', label: 'LUXURY + IMMERSIVE', modes: ['luxury', 'immersive'], description: 'Build-a-Wig premium commerce · cinematic product worlds', confidencePct: 72 },
    ],
    recommendations: [
      { id: 'rec-1', mode: 'editorial', confidencePct: 94, reasoning: 'Authority media · stat-forward pages · knowledge asset engine · 100K readers strategy', customerImpact: 'Readers feel smarter · compounding trust · returning reader focus', businessImpact: 'Knowledge compounds · subscription revenue · institutional IP', status: 'accepted' },
      { id: 'rec-2', mode: 'hybrid', hybridLabel: 'EDITORIAL + COMMUNITY', confidencePct: 88, reasoning: 'Membership tiers · Lounge TV · advocate pipeline · relationship engine maturity', customerImpact: 'Belonging · insider access · community recognition', businessImpact: 'Retention · LTV · creator pipeline', status: 'recommended' },
      { id: 'rec-3', mode: 'enterprise', confidencePct: 65, reasoning: 'Studio OS internal · mission control · work orchestration · secondary priority', customerImpact: 'Founder/team operational clarity', businessImpact: 'Cross-brand ops · agent orchestration', status: 'ignored' },
    ],
    immersivePreviews: [
      { id: 'prev-1', label: 'FUTURE NEWSROOM · EDITORIAL', mode: 'editorial', description: 'Walk through stat-forward page strategy · reader journey · knowledge discovery', explorePath: 'Home → Page 042 → Reader graph → Membership', capabilities: ['Pacing', 'Typography', 'Navigation', 'Emotional design'] },
      { id: 'prev-2', label: 'LUXURY FLAGSHIP · BUILD-A-WIG', mode: 'luxury', description: 'Cinematic commerce · NOIR customize flow · premium interactions', explorePath: 'Hub → Customize → Live preview → Checkout', capabilities: ['Motion', 'Photography Bible', 'Premium typography'] },
      { id: 'prev-3', label: 'CREATOR MARKETPLACE', mode: 'marketplace', description: 'Multi-sided platform · matching · deal engine · career graph', explorePath: 'Browse → Match → Deal → Creator OS', capabilities: ['Trust systems', 'Payments', 'Reviews'] },
      { id: 'prev-4', label: 'ENTERPRISE MISSION CONTROL', mode: 'enterprise', description: 'Studio OS executive operating room · dashboards · orchestration', explorePath: 'Overview → Strategy → Campaign → CoS', capabilities: ['Workflow', 'Permissions', 'Org intelligence'] },
      { id: 'prev-5', label: 'IMMERSIVE VIRTUAL COMMERCE', mode: 'immersive', description: '3D product world · environment exploration · non-linear journey', explorePath: 'Enter world → Explore → Interact → Purchase', capabilities: ['Dynamic environments', 'Advanced motion', 'Custom transitions'] },
    ],
    ecosystemProducts: [
      { id: 'ep-1', product: 'AUTHORITY MEDIA PLATFORM', category: 'Marketing website + editorial', status: 'architecture' },
      { id: 'ep-2', product: 'MEMBERSHIP PORTAL', category: 'Customer portal + community', status: 'architecture' },
      { id: 'ep-3', product: 'BUILD-A-WIG ECOMMERCE', category: 'Ecommerce + luxury', status: 'ready' },
      { id: 'ep-4', product: 'STUDIO OS ADMIN', category: 'Admin dashboard + enterprise', status: 'architecture' },
      { id: 'ep-5', product: 'KNOWLEDGE CENTER', category: 'Knowledge center + documentation', status: 'planned' },
      { id: 'ep-6', product: 'CREATOR MARKETPLACE', category: 'Marketplace', status: 'planned' },
      { id: 'ep-7', product: 'MOBILE APP', category: 'Mobile app', status: 'planned' },
    ],
    solutionArchitecture: {
      businessObjectives: ['100K returning readers', 'Authority through consistency', 'Membership + commerce revenue', 'Knowledge compounds forever'],
      userRoles: ['Reader', 'Premium member', 'Commerce customer', 'Creator', 'Founder/admin', 'Agent'],
      workflows: ['Page publish cadence', 'Membership signup', 'Build-a-Wig customize', 'Newsroom QA', 'CoS approval'],
      integrations: ['Supabase', 'Stripe', 'Vercel', 'GitHub', 'Fal · OpenArt'],
      securityNotes: ['Auth via Supabase', 'RLS policies', 'Founder-gated admin', 'Stripe webhooks'],
      performanceNotes: ['Vite build · lazy routes', 'CDN assets', 'Mobile-first', 'Stat card optimization'],
      scalabilityNotes: ['Multi-brand workspace model', 'Studio OS module registry', 'Knowledge graph expansion'],
    },
    experienceInheritance: [
      { source: 'Brand Architect', inherited: ['Color system', 'Typography', 'Voice · tone', 'Visual hierarchy', 'Design tokens'], status: 'complete' },
      { source: 'Experience Architect', inherited: ['18-stage blueprint', 'Journey touchpoints', 'Emotional architecture', 'Micro-experiences', 'Cross-channel standards'], status: 'complete' },
      { source: 'Company Maturity Engine', inherited: ['Organizational context', 'Integration readiness', 'Architect recommendations'], status: 'complete' },
      { source: 'Creative DNA · Writing Bible', inherited: ['Panel language', 'Stat-forward copy', 'Headline systems'], status: 'complete' },
    ],
    designSystem: [
      { id: 'ds-1', component: 'PANEL SYSTEM', tokens: 'Glass blur · Futura headers · Grace metrics · border tokens', status: 'inherited' },
      { id: 'ds-2', component: 'STAT CARDS', tokens: 'Handwritten metric · label hierarchy · score colors', status: 'inherited' },
      { id: 'ds-3', component: 'TAB NAVIGATION', tokens: '6px Futura · active accent · overflow scroll', status: 'inherited' },
      { id: 'ds-4', component: 'RESPONSIVE GRID', tokens: '8px base · sm:grid-cols-3 · mobile-first', status: 'generated' },
      { id: 'ds-5', component: 'MOTION SYSTEM', tokens: 'Subtle fade · stat count-up · no bounce', status: 'inherited' },
      { id: 'ds-6', component: 'ICONOGRAPHY', tokens: 'Minimal line · live dots · no decorative clutter', status: 'inherited' },
    ],
    applicationArchitecture: {
      informationArchitecture: ['Public media', 'Membership', 'Commerce', 'Admin Studio OS', 'Knowledge graph'],
      navigation: ['Top-level brand nav', 'Page strategy routes', 'Studio OS module directory', 'Mission control'],
      featureHierarchy: ['Reader experience', 'Member experience', 'Commerce', 'Operations', 'Intelligence'],
      authModel: 'Supabase Auth · session cookies · founder admin gate',
      permissions: ['Public reader', 'Premium member', 'Commerce customer', 'Admin', 'Founder'],
      databasePlan: ['profiles', 'orders', 'app_config', 'analytics_events', 'knowledge assets'],
      apiPlan: ['Vercel serverless', 'Stripe webhooks', 'Fal live preview', 'Supabase RLS'],
      technicalRoadmap: ['Editorial platform v2', 'Membership portal', 'Mobile app architecture', 'API ecosystem'],
    },
    aiFeatures: [
      { id: 'ai-1', feature: 'KNOWLEDGE ASSISTANT', alignment: 'Knowledge Asset Engine · reader questions', priority: 'high', status: 'recommended' },
      { id: 'ai-2', feature: 'CoS ORCHESTRATION', alignment: 'Chief of Staff · soft approval · agent routing', priority: 'high', status: 'approved' },
      { id: 'ai-3', feature: 'CONTENT RECOMMENDATION', alignment: 'Reader graph · next best page', priority: 'medium', status: 'recommended' },
      { id: 'ai-4', feature: 'LIVE PREVIEW GENERATION', alignment: 'Build-a-Wig · Fal pipeline', priority: 'high', status: 'approved' },
      { id: 'ai-5', feature: 'VOICE CONCIERGE', alignment: 'Future · membership concierge', priority: 'low', status: 'deferred' },
    ],
    simulations: [
      { id: 'sim-1', label: 'EDITORIAL PLATFORM · BASELINE', performancePct: 88, conversionPct: 82, engagementPct: 91, accessibilityPct: 78, complexityPct: 45, costEstimate: 'Medium · Vercel + Supabase', scalabilityPct: 90, confidencePct: 92, recommendations: ['Strong fit · inherit brand + experience · reader graph integration'] },
      { id: 'sim-2', label: 'EDITORIAL + COMMUNITY HYBRID', performancePct: 85, conversionPct: 86, engagementPct: 94, accessibilityPct: 76, complexityPct: 62, costEstimate: 'High · community infra', scalabilityPct: 85, confidencePct: 88, recommendations: ['Phase 2 · after editorial core · membership portal first'] },
      { id: 'sim-3', label: 'FULL MARKETPLACE ADD-ON', performancePct: 80, conversionPct: 75, engagementPct: 88, accessibilityPct: 72, complexityPct: 78, costEstimate: 'Very high · multi-sided', scalabilityPct: 82, confidencePct: 74, recommendations: ['Defer to M49 creator marketplace maturity · hybrid later'] },
    ],
    implementationRoadmap: [
      { id: 'rm-1', title: 'INHERITANCE LOCK · BRAND + EXPERIENCE', sequence: 1, effort: 'Low', dependencies: [], engineeringReq: 'Design tokens · journey map import' },
      { id: 'rm-2', title: 'EDITORIAL IA · PAGE STRATEGY ROUTES', sequence: 2, effort: 'Medium', dependencies: ['rm-1'], engineeringReq: 'React routes · CMS structure · SEO' },
      { id: 'rm-3', title: 'MEMBERSHIP PORTAL · COMMUNITY HYBRID', sequence: 3, effort: 'High', dependencies: ['rm-2'], engineeringReq: 'Auth tiers · Lounge TV · reader graph' },
      { id: 'rm-4', title: 'DESIGN SYSTEM · COMPONENT LIBRARY', sequence: 4, effort: 'Medium', dependencies: ['rm-1'], engineeringReq: 'Shared tokens · Storybook-ready' },
      { id: 'rm-5', title: 'DEVELOPER HANDOFF · GITHUB + VERCEL', sequence: 5, effort: 'Low', dependencies: ['rm-2', 'rm-4'], engineeringReq: 'PRD · API docs · acceptance criteria' },
      { id: 'rm-6', title: 'LAUNCH ARCHITECT HANDOFF', sequence: 6, effort: 'Low', dependencies: ['rm-5'], engineeringReq: 'Launch readiness · go-live checklist' },
    ],
    developerHandoff: [
      { id: 'dh-1', artifact: 'PRODUCT REQUIREMENTS', description: 'Business objectives · user roles · feature hierarchy · acceptance criteria', status: 'ready' },
      { id: 'dh-2', artifact: 'TECHNICAL ARCHITECTURE', description: 'IA · auth · database · API · scalability', status: 'ready' },
      { id: 'dh-3', artifact: 'DESIGN SYSTEM SPEC', description: 'Tokens · components · motion · responsive grid', status: 'ready' },
      { id: 'dh-4', artifact: 'INTERACTION SPECIFICATIONS', description: 'Experience blueprint · micro-experiences · journey map', status: 'ready' },
      { id: 'dh-5', artifact: 'ENGINEERING ROADMAP', description: 'Milestones · dependencies · build order', status: 'draft' },
    ],
    integrations: [
      { id: 'int-1', platform: 'Supabase', category: 'Database · Auth', status: 'architecture-ready', },
      { id: 'int-2', platform: 'Vercel', category: 'Hosting · Deploy', status: 'architecture-ready' },
      { id: 'int-3', platform: 'GitHub', category: 'Code · CI', status: 'architecture-ready' },
      { id: 'int-4', platform: 'Stripe', category: 'Payments', status: 'architecture-ready' },
      { id: 'int-5', platform: 'Figma', category: 'Design', status: 'planned' },
      { id: 'int-6', platform: 'Cursor', category: 'AI Development', status: 'planned' },
      { id: 'int-7', platform: 'Fal', category: 'AI Media', status: 'connected' },
      { id: 'int-8', platform: 'Shopify', category: 'Commerce', status: 'planned' },
    ],
    launchHandoff: {
      status: 'ready',
      transferredAt: null,
      inheritedAssets: ['Technical architecture', 'Design system', 'Customer journeys', 'Brand systems', 'Experience systems', 'Implementation roadmap'],
      downstreamTargets: ['Launch Architect', 'Go-live checklist', 'Production deploy', 'Growth activation'],
    },
  };
}

export function bootstrapDigitalArchitectPlatform(): void {
  bootstrapDigitalArchitectStore(buildDigitalArchitectSeed());
}
