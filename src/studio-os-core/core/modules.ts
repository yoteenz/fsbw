/**
 * studio os Core modules — reusable, industry-agnostic platform capabilities.
 * Core contains NO workspace-specific knowledge.
 */

export type StudioOsCoreModuleId =
  | 'mission-control'
  | 'chief-of-staff'
  | 'executive-organization'
  | 'organizational-inheritance'
  | 'strategy-engine'
  | 'campaign-engine'
  | 'work-orchestration'
  | 'distribution-engine'
  | 'reader-graph'
  | 'relationship-engine'
  | 'creator-marketplace'
  | 'ecosystem-marketplace'
  | 'knowledge-asset-engine'
  | 'company-maturity-engine'
  | 'brand-architect'
  | 'experience-architect'
  | 'digital-architect'
  | 'growth-architect'
  | 'company-genome'
  | 'architect-studio'
  | 'campus-evolution-engine'
  | 'founder-walk'
  | 'remembrance-garden'
  | 'founders-promise'
  | 'executive-framework'
  | 'leadership-manifesto-framework'
  | 'chief-brand-officer'
  | 'chief-experience-officer'
  | 'chief-digital-officer'
  | 'chief-technology-officer'
  | 'chief-growth-officer'
  | 'executive-council'
  | 'organizational-intelligence'
  | 'organizational-autonomy-framework'
  | 'organizational-delegation-engine'
  | 'organizational-workflow-orchestration'
  | 'organizational-self-improvement'
  | 'organizational-governance-safeguards'
  | 'organizational-maturity-model'
  | 'leadership-modes'
  | 'company-onboarding-intelligence'
  | 'arrival-experience'
  | 'executive-apprenticeship-founder-calibration'
  | 'studio-institute'
  | 'blueprint-manager'
  | 'asset-factory'
  | 'executive-command-center'
  | 'studio-dashboard'
  | 'content-brain'
  | 'creative-director'
  | 'intelligence-engine'
  | 'show-bible'
  | 'asset-director'
  | 'studio-lot'
  | 'talent-agency'
  | 'casting'
  | 'production-pipeline'
  | 'ai-production-engine'
  | 'distribution-network'
  | 'audience-brain'
  | 'growth-network'
  | 'labs'
  | 'ai-media-network'
  | 'ndxbook'
  | 'talent-network'
  | 'marketplace'
  | 'business-model-engine'
  | 'ecosystem'
  | 'governance'
  | 'studio-intelligence'
  | 'simulation-engine'
  | 'vision-engine'
  | 'legacy-system'
  | 'knowledge-hub'
  | 'memory-bible'
  | 'leadership-dna';

export type StudioOsCoreModule = {
  id: StudioOsCoreModuleId;
  label: string;
  description: string;
  routeSegment: string;
};

/** Canonical registry of studio os platform modules. */
export const STUDIO_OS_CORE_MODULES: readonly StudioOsCoreModule[] = [
  {
    id: 'asset-factory',
    label: 'ASSET FACTORY',
    description: 'Manufacture complete creative systems from approved blueprints.',
    routeSegment: 'asset-factory',
  },
  {
    id: 'blueprint-manager',
    label: 'BLUEPRINT MANAGER',
    description: 'Creative asset specifications for Asset Factory.',
    routeSegment: 'blueprint-manager',
  },
  {
    id: 'mission-control',
    label: 'MISSION CONTROL',
    description: 'Workspace executive operating room and mission HQ.',
    routeSegment: 'mission-control',
  },
  {
    id: 'chief-of-staff',
    label: 'CHIEF OF STAFF',
    description: 'Founder primary executive — soft approvals and attention protection.',
    routeSegment: 'chief-of-staff',
  },
  {
    id: 'executive-organization',
    label: 'EXECUTIVE ORGANIZATION',
    description: 'Living leadership team — executives, departments, teams, workers, and culture.',
    routeSegment: 'executive-organization',
  },
  {
    id: 'organizational-inheritance',
    label: 'ORGANIZATIONAL INHERITANCE',
    description: 'Inherit organizational genetics — DNA, playbooks, executives, knowledge across companies.',
    routeSegment: 'organizational-inheritance',
  },
  {
    id: 'strategy-engine',
    label: 'STRATEGY ENGINE',
    description: 'Defines why work matters — strategy board, initiatives, alignment, and strategic command center.',
    routeSegment: 'strategy-engine',
  },
  {
    id: 'campaign-engine',
    label: 'CAMPAIGN ENGINE',
    description: 'Transforms strategy into coordinated execution — campaigns, deliverables, analytics, playbooks.',
    routeSegment: 'campaign-engine',
  },
  {
    id: 'work-orchestration',
    label: 'WORK ORCHESTRATION',
    description: 'Intelligent execution — work packages, dependencies, CoS orchestration, founder workspace.',
    routeSegment: 'work-orchestration',
  },
  {
    id: 'distribution-engine',
    label: 'DISTRIBUTION ENGINE',
    description: 'Global distribution for knowledge assets — channel optimization, evergreen, lineage, performance.',
    routeSegment: 'distribution-engine',
  },
  {
    id: 'reader-graph',
    label: 'READER GRAPH',
    description: 'Living relationship map — readers, journey, communities, trust, advocacy, portfolio relationships.',
    routeSegment: 'reader-graph',
  },
  {
    id: 'relationship-engine',
    label: 'RELATIONSHIP ENGINE',
    description: 'Active relationship OS — nurture, next best action, recognition, loyalty, institutional learning.',
    routeSegment: 'relationship-engine',
  },
  {
    id: 'creator-marketplace',
    label: 'CREATOR MARKETPLACE',
    description: 'Intelligent creator business ecosystem — matching, deals, career graph, alignment over followers.',
    routeSegment: 'creator-marketplace',
  },
  {
    id: 'ecosystem-marketplace',
    label: 'ECOSYSTEM MARKETPLACE',
    description: 'Organizational intelligence exchange — assets, inheritance, licensing, capability over files.',
    routeSegment: 'ecosystem-marketplace',
  },
  {
    id: 'knowledge-asset-engine',
    label: 'KNOWLEDGE ASSET ENGINE',
    description: 'Foundational knowledge model — SSOT, evolution, lineage, academy, institutional memory.',
    routeSegment: 'knowledge-asset-engine',
  },
  {
    id: 'company-maturity-engine',
    label: 'COMPANY MATURITY ENGINE',
    description: 'Universal onboarding — maturity assessment, asset inventory, architects, roadmap, organizational understanding.',
    routeSegment: 'company-maturity-engine',
  },
  {
    id: 'brand-architect',
    label: 'BRAND ARCHITECT',
    description: 'Cohesive brand systems — blueprint, verbal + visual identity, competitive intelligence, experience architect handoff.',
    routeSegment: 'brand-architect',
  },
  {
    id: 'experience-architect',
    label: 'EXPERIENCE ARCHITECT',
    description: 'Emotional design — every touchpoint, journey maps, memorability, digital architect handoff.',
    routeSegment: 'experience-architect',
  },
  {
    id: 'digital-architect',
    label: 'DIGITAL ARCHITECT',
    description: 'Digital solution architect — experience gallery, hybrid architecture, ecosystem builder, launch handoff. V2.0.',
    routeSegment: 'digital-architect',
  },
  {
    id: 'growth-architect',
    label: 'GROWTH ARCHITECT',
    description: 'Sustainable growth OS — initiatives, GTM, orchestration, relationship-driven compound growth.',
    routeSegment: 'growth-architect',
  },
  {
    id: 'company-genome',
    label: 'COMPANY GENOME',
    description: 'Living organizational genetics — DNA layers, health, evolution, relationships, and portfolio intelligence.',
    routeSegment: 'company-genome',
  },
  {
    id: 'architect-studio',
    label: 'ARCHITECT STUDIO',
    description: 'Immersive innovation headquarters — five connected studios, collaboration forum, evolution wall.',
    routeSegment: 'architect-studio',
  },
  {
    id: 'campus-evolution-engine',
    label: 'CAMPUS EVOLUTION ENGINE',
    description: 'Living architectural growth — earned spaces, organic evolution, company memory, portfolio campus.',
    routeSegment: 'campus-evolution-engine',
  },
  {
    id: 'founder-walk',
    label: 'FOUNDER WALK',
    description: 'Emotional spine of the campus — marble pathway, memory markers, legacy for future generations.',
    routeSegment: 'founder-walk',
  },
  {
    id: 'remembrance-garden',
    label: 'REMEMBRANCE GARDEN',
    description: 'Most personal campus space — dedications, living memorials, legacy letters, preserve gratitude.',
    routeSegment: 'remembrance-garden',
  },
  {
    id: 'founders-promise',
    label: 'FOUNDER\'S PROMISE',
    description: 'Personal north star — guided reflection, living promise, alignment, legacy inheritance.',
    routeSegment: 'founders-promise',
  },
  {
    id: 'executive-framework',
    label: 'EXECUTIVE FRAMEWORK',
    description: 'Constitutional foundation for AI executives — identity, standards, collaboration, accountability.',
    routeSegment: 'executive-framework',
  },
  {
    id: 'leadership-manifesto-framework',
    label: 'LEADERSHIP MANIFESTO FRAMEWORK',
    description: 'Constitutional foundation inherited by every executive — identity, philosophy, compass, non-negotiables.',
    routeSegment: 'leadership-manifesto-framework',
  },
  {
    id: 'chief-brand-officer',
    label: 'CHIEF BRAND OFFICER',
    description: 'Lifelong guardian of brand identity — governance, alignment, intelligence, protection. V2.0.',
    routeSegment: 'chief-brand-officer',
  },
  {
    id: 'chief-experience-officer',
    label: 'CHIEF EXPERIENCE OFFICER',
    description: 'Lifelong guardian of customer experience — journey, trust, hospitality, protection. V2.0.',
    routeSegment: 'chief-experience-officer',
  },
  {
    id: 'chief-digital-officer',
    label: 'CHIEF DIGITAL OFFICER',
    description: 'Lifelong guardian of digital ecosystem — governance, alignment, architecture, protection. V1.0.',
    routeSegment: 'chief-digital-officer',
  },
  {
    id: 'chief-technology-officer',
    label: 'CHIEF TECHNOLOGY OFFICER',
    description: 'Lifelong guardian of engineering & infrastructure — governance, alignment, ops center, protection. V1.0.',
    routeSegment: 'chief-technology-officer',
  },
  {
    id: 'chief-growth-officer',
    label: 'CHIEF GROWTH OFFICER',
    description: 'Lifelong guardian of sustainable growth — governance, alignment, laboratory, protection. V1.0.',
    routeSegment: 'chief-growth-officer',
  },
  {
    id: 'executive-council',
    label: 'EXECUTIVE COUNCIL',
    description: 'Highest collaborative leadership body — executive debate, synthesis, simulations. V2.0.',
    routeSegment: 'executive-council',
  },
  {
    id: 'organizational-intelligence',
    label: 'ORGANIZATIONAL INTELLIGENCE',
    description: 'Collective mind — observe, learn, reflect, predict, compound wisdom. V1.0.',
    routeSegment: 'organizational-intelligence',
  },
  {
    id: 'organizational-autonomy-framework',
    label: 'ORGANIZATIONAL AUTONOMY FRAMEWORK',
    description: 'Constitutional autonomy governance — trusted stewardship, earned through trust. V1.0.',
    routeSegment: 'organizational-autonomy-framework',
  },
  {
    id: 'organizational-delegation-engine',
    label: 'ORGANIZATIONAL DELEGATION ENGINE',
    description: 'Outcome-based delegation — founders define outcomes, executives collaborate to achieve them. V1.0.',
    routeSegment: 'organizational-delegation-engine',
  },
  {
    id: 'organizational-workflow-orchestration',
    label: 'ORGANIZATIONAL WORKFLOW ORCHESTRATION',
    description: 'Cross-functional workflow choreography — coordinated teams, not disconnected automations. V1.0.',
    routeSegment: 'organizational-workflow-orchestration',
  },
  {
    id: 'organizational-self-improvement',
    label: 'ORGANIZATIONAL SELF-IMPROVEMENT',
    description: 'Continuous organizational evolution — learning compounds every day. V1.0.',
    routeSegment: 'organizational-self-improvement',
  },
  {
    id: 'organizational-governance-safeguards',
    label: 'ORGANIZATIONAL GOVERNANCE & SAFEGUARDS',
    description: 'Constitutional stewardship — invisible safeguards preserving trust. V1.0.',
    routeSegment: 'organizational-governance-safeguards',
  },
  {
    id: 'organizational-maturity-model',
    label: 'ORGANIZATIONAL MATURITY MODEL',
    description: 'Master progression system — maturity earned, not unlocked. V1.0.',
    routeSegment: 'organizational-maturity-model',
  },
  {
    id: 'leadership-modes',
    label: 'LEADERSHIP MODES',
    description: 'Founder & executive mode — adaptive leadership perspective. V1.0.',
    routeSegment: 'leadership-modes',
  },
  {
    id: 'company-onboarding-intelligence',
    label: 'COMPANY ONBOARDING INTELLIGENCE',
    description: 'Intelligent onboarding — organizational welcome and discovery. V1.0.',
    routeSegment: 'company-onboarding-intelligence',
  },
  {
    id: 'arrival-experience',
    label: 'ARRIVAL EXPERIENCE',
    description: 'Ceremonial headquarters welcome — organizational arrival. V1.0.',
    routeSegment: 'arrival-experience',
  },
  {
    id: 'executive-apprenticeship-founder-calibration',
    label: 'EXECUTIVE APPRENTICESHIP & FOUNDER CALIBRATION',
    description: 'Executive development — observe, calibrate, earn trust. V1.0.',
    routeSegment: 'executive-apprenticeship-founder-calibration',
  },
  {
    id: 'studio-institute',
    label: 'STUDIO INSTITUTE',
    description: 'Permanent learning institution — organizational education. V1.0.',
    routeSegment: 'studio-institute',
  },
  {
    id: 'executive-command-center',
    label: 'EXECUTIVE COMMAND CENTER',
    description: 'Workspace executive overview and command surface.',
    routeSegment: 'executive-command-center',
  },
  {
    id: 'studio-dashboard',
    label: 'STUDIO DASHBOARD',
    description: 'Creative operations hub and module directory.',
    routeSegment: 'hub',
  },
  {
    id: 'content-brain',
    label: 'CONTENT BRAIN',
    description: 'Brand knowledge, editorial rules, and content intelligence.',
    routeSegment: 'content-brain',
  },
  {
    id: 'creative-director',
    label: 'CREATIVE DIRECTOR',
    description: 'Creative decision engine before production execution.',
    routeSegment: 'creative-director',
  },
  {
    id: 'intelligence-engine',
    label: 'INTELLIGENCE ENGINE',
    description: 'Evidence-based recommendations from connected sources.',
    routeSegment: 'intelligence-engine',
  },
  {
    id: 'show-bible',
    label: 'SHOW BIBLE',
    description: 'Show DNA, structure, and production standards.',
    routeSegment: 'show-bible',
  },
  {
    id: 'asset-director',
    label: 'ASSET DIRECTOR',
    description: 'Visual source of truth for approved assets.',
    routeSegment: 'asset-director',
  },
  {
    id: 'studio-lot',
    label: 'STUDIO LOT',
    description: 'Virtual production environments and sets.',
    routeSegment: 'studio-lot',
  },
  {
    id: 'talent-agency',
    label: 'TALENT AGENCY',
    description: 'On-camera personalities and casting profiles.',
    routeSegment: 'talent-agency',
  },
  {
    id: 'casting',
    label: 'CASTING',
    description: 'Production casting board and approvals.',
    routeSegment: 'casting',
  },
  {
    id: 'production-pipeline',
    label: 'PRODUCTION PIPELINE',
    description: 'Operational heart turning ideas into experiences.',
    routeSegment: 'production',
  },
  {
    id: 'ai-production-engine',
    label: 'AI PRODUCTION ENGINE',
    description: 'Automated production execution layer.',
    routeSegment: 'ai-production-engine',
  },
  {
    id: 'distribution-network',
    label: 'DISTRIBUTION NETWORK',
    description: 'Multi-channel publishing and broadcast routing.',
    routeSegment: 'distribution-network',
  },
  {
    id: 'audience-brain',
    label: 'AUDIENCE BRAIN',
    description: 'Audience intelligence and feedback loops.',
    routeSegment: 'audience-brain',
  },
  {
    id: 'growth-network',
    label: 'GROWTH NETWORK',
    description: 'Intelligent business growth ecosystem — opportunities, partnerships, and revenue.',
    routeSegment: 'growth-network',
  },
  {
    id: 'labs',
    label: 'STUDIO OS LABS',
    description: 'Research & experimentation — every published asset becomes an experiment; learning engine.',
    routeSegment: 'labs',
  },
  {
    id: 'ai-media-network',
    label: 'AI MEDIA NETWORK',
    description: 'Digital media network — programming, pillars, calendar, monetization; AI Media pilot.',
    routeSegment: 'ai-media-network',
  },
  {
    id: 'ndxbook',
    label: 'NDXBOOK',
    description: 'Public media brand — indexed pages, volumes, chapters, programming; AI Media public layer.',
    routeSegment: 'ndxbook',
  },
  {
    id: 'talent-network',
    label: 'TALENT NETWORK',
    description: 'Unified talent operating system — AI + human registry, casting, wardrobe, contracts, and character evolution.',
    routeSegment: 'talent-network',
  },
  {
    id: 'marketplace',
    label: 'MARKETPLACE',
    description: 'Professional operating network — discover, collaborate, hire, and grow through lasting business relationships.',
    routeSegment: 'marketplace',
  },
  {
    id: 'business-model-engine',
    label: 'BUSINESS MODEL ENGINE',
    description: 'Economic engine — subscriptions, marketplace revenue, royalties, wallets, enterprise, and diversified monetization.',
    routeSegment: 'business-model-engine',
  },
  {
    id: 'ecosystem',
    label: 'STUDIO OS ECOSYSTEM',
    description: 'Business operating ecosystem — community blueprints, DNA, automations, executives, and complete operating system packages.',
    routeSegment: 'ecosystem',
  },
  {
    id: 'governance',
    label: 'STUDIO OS GOVERNANCE',
    description: 'Trust, quality, compliance, moderation, verification, certification, and ecosystem health — the platform constitution.',
    routeSegment: 'governance',
  },
  {
    id: 'studio-intelligence',
    label: 'STUDIO INTELLIGENCE',
    description: 'Operating intelligence — executive briefings, opportunity/risk engines, business health, and proactive recommendations.',
    routeSegment: 'studio-intelligence',
  },
  {
    id: 'simulation-engine',
    label: 'SIMULATION ENGINE',
    description: 'Model business decisions before committing — scenario comparison, risk analysis, and decision support. Not predictions.',
    routeSegment: 'simulation-engine',
  },
  {
    id: 'vision-engine',
    label: 'VISION ENGINE',
    description: 'Cinematic presentation operating system — Vision Modes, Builder, Recorder, Share, Analytics.',
    routeSegment: 'vision-engine',
  },
  {
    id: 'legacy-system',
    label: 'LEGACY SYSTEM',
    description: 'Permanent memory and institutional archive.',
    routeSegment: 'legacy-system',
  },
  {
    id: 'knowledge-hub',
    label: 'KNOWLEDGE HUB',
    description: 'Living documentation — every object explains itself.',
    routeSegment: 'knowledge-hub',
  },
  {
    id: 'memory-bible',
    label: 'MEMORY BIBLE',
    description: 'Curated institutional knowledge — naming, decisions, AI context packages.',
    routeSegment: 'memory-bible',
  },
  {
    id: 'leadership-dna',
    label: 'LEADERSHIP DNA',
    description: 'Founder operating blueprint — decision framework, approval patterns, and Chief of Staff training.',
    routeSegment: 'leadership-dna',
  },
] as const;
