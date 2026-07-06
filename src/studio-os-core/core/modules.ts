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
  | 'organizational-apprenticeship'
  | 'concierge-layer'
  | 'production-studio'
  | 'render-queue'
  | 'screening-room'
  | 'concierge-approval-flow'
  | 'design-dna-canon'
  | 'design-genome'
  | 'executive-timeline'
  | 'concierge-routing'
  | 'command-dock'
  | 'living-headquarters-presence'
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
  | 'expansion-center'
  | 'business-discovery-blueprint'
  | 'organization-inauguration'
  | 'profession-brain'
  | 'expert-marketplace'
  | 'knowledge-commerce'
  | 'professional-trust-framework'
  | 'organization-genome'
  | 'memory-engine'
  | 'company-health-index'
  | 'organization-pulse'
  | 'wisdom-capture'
  | 'shadow-mode'
  | 'organization-digital-twin'
  | 'business-simulation-lab'
  | 'knowledge-confidence'
  | 'legacy-vault'
  | 'ambient-awareness'
  | 'anticipation-engine'
  | 'founder-cognitive-load'
  | 'presence-engine'
  | 'cross-organization-intelligence'
  | 'relationship-memory'
  | 'predictive-organization'
  | 'autonomous-preparation'
  | 'organizational-consciousness'
  | 'world-knowledge-engine'
  | 'founder-operating-system'
  | 'innovation-lab'
  | 'organization-operating-manual'
  | 'legacy-network'
  | 'studio-intelligence-architecture'
  | 'model-orchestrator'
  | 'studio-foundation-models'
  | 'documentation-registry'
  | 'documentation-governance'
  | 'system-registry'
  | 'component-registry'
  | 'design-token-engine'
  | 'interaction-engine'
  | 'event-bus'
  | 'automation-registry'
  | 'prompt-registry'
  | 'policy-engine'
  | 'permission-engine'
  | 'workspace-runtime'
  | 'plugin-sdk'
  | 'workflow-engine'
  | 'state-engine'
  | 'asset-registry'
  | 'experience-engine'
  | 'qa-headquarters'
  | 'qa-inspector'
  | 'qa-simulation-engine'
  | 'ai-red-team'
  | 'executive-trust-dashboard'
  | 'time-machine'
  | 'predictive-qa'
  | 'self-healing-engine'
  | 'decision-audit'
  | 'confidence-engine'
  | 'organizational-guardian'
  | 'design-compliance-engine'
  | 'prompt-qa'
  | 'succession-mode'
  | 'brand-positioning'
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
    id: 'organizational-apprenticeship',
    label: 'ORGANIZATIONAL APPRENTICESHIP',
    description: 'Permanent learning & trust-building — stewardship and earned trust. V1.0.',
    routeSegment: 'organizational-apprenticeship',
  },
  {
    id: 'concierge-layer',
    label: 'CONCIERGE LAYER',
    description: 'Founder-facing guidance — hospitality-driven executive experience. V1.0.',
    routeSegment: 'concierge-layer',
  },
  {
    id: 'production-studio',
    label: 'PRODUCTION STUDIO',
    description: 'Cinematic production headquarters — approved pages become production-ready media. V1.0.',
    routeSegment: 'production-studio',
  },
  {
    id: 'render-queue',
    label: 'RENDER QUEUE',
    description: 'Centralized production floor — visible pipeline, live progress, founder never wonders. V1.0.',
    routeSegment: 'render-queue',
  },
  {
    id: 'screening-room',
    label: 'SCREENING ROOM',
    description: 'Luxury review theater — private cinema before publication. V1.0.',
    routeSegment: 'screening-room',
  },
  {
    id: 'concierge-approval-flow',
    label: 'CONCIERGE APPROVAL FLOW',
    description: 'Editorial board — concierge review before founder decision. Unified brief. V1.0.',
    routeSegment: 'concierge-approval-flow',
  },
  {
    id: 'design-dna-canon',
    label: 'DESIGN DNA & CANON SYSTEM',
    description: 'Permanent creative compass — canon pages · design DNA · headquarters review. V1.0.',
    routeSegment: 'design-dna-canon',
  },
  {
    id: 'design-genome',
    label: 'DESIGN GENOME',
    description: 'Organizational visual memory — promotion · inheritance · pre-build review. V1.0.',
    routeSegment: 'design-genome',
  },
  {
    id: 'executive-timeline',
    label: 'EXECUTIVE TIMELINE',
    description: 'Permanent organizational history — immersive executive timeline, intelligent insights, replay, and growth comparison. V1.0 (M116).',
    routeSegment: 'executive-timeline',
  },
  {
    id: 'concierge-routing',
    label: 'INTELLIGENT CONCIERGE ROUTING',
    description: 'Universal command routing — founders speak naturally, organization assigns concierges automatically. V1.0.',
    routeSegment: 'executive-timeline',
  },
  {
    id: 'command-dock',
    label: 'COMMAND DOCK',
    description: 'Executive command console — floating glass dock for natural-language organizational direction. V1.0.',
    routeSegment: 'mission-control',
  },
  {
    id: 'living-headquarters-presence',
    label: 'LIVING HEADQUARTERS PRESENCE',
    description: 'Quietly alive headquarters — organizational activity, time-based presence, morning arrival. V1.0.',
    routeSegment: 'mission-control',
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
    id: 'expansion-center',
    label: 'EXPANSION CENTER',
    description: 'Three-layer economy — Headquarters License, permanent Department Packs, Digital Workforce payroll. Grow the organization, never buy software.',
    routeSegment: 'expansion-center',
  },
  {
    id: 'business-discovery-blueprint',
    label: 'BUSINESS DISCOVERY BLUEPRINT™',
    description: 'Permanent onboarding architecture — guided chapters, conversational discovery, organizational archaeology. The birth certificate of every organization.',
    routeSegment: 'business-discovery-blueprint',
  },
  {
    id: 'organization-inauguration',
    label: 'ORGANIZATION INAUGURATION',
    description: 'Founder Ceremony V1.0 — immersive inauguration after Blueprint completion. Organization Charter, HQ activation, founding timeline, ENTER HEADQUARTERS.',
    routeSegment: 'organization-inauguration',
  },
  {
    id: 'profession-brain',
    label: 'PROFESSION BRAIN™',
    description: 'Living institutional intelligence V1.0 — preserves expertise, judgment, and organizational memory. Powers every concierge, Academy lesson, and automation.',
    routeSegment: 'profession-brain',
  },
  {
    id: 'expert-marketplace',
    label: 'EXPERT MARKETPLACE™',
    description: 'Public expertise ecosystem V1.0 — publish Profession Brain surfaces. Trusted experts, not AI bots. Share expertise. Expand your legacy.',
    routeSegment: 'expert-marketplace',
  },
  {
    id: 'knowledge-commerce',
    label: 'KNOWLEDGE COMMERCE™',
    description: 'Expertise economy V1.0 — monetize Profession Brain knowledge. Product builder, licensing, AI Expert Experiences, revenue intelligence. MONETIZE KNOWLEDGE.',
    routeSegment: 'knowledge-commerce',
  },
  {
    id: 'professional-trust-framework',
    label: 'PROFESSIONAL TRUST FRAMEWORK™',
    description: 'Permanent governance V1.0 — professional scope, confidence system, natural guidance, regulated industries, Command Dock escalation. Trust through responsible judgment.',
    routeSegment: 'professional-trust-framework',
  },
  {
    id: 'organization-genome',
    label: 'ORGANIZATION GENOME™',
    description: 'Permanent identity layer V1.0 — brand personality, tone, values, decision DNA, customer standards. Every AI interaction consults Genome before generating work.',
    routeSegment: 'organization-genome',
  },
  {
    id: 'memory-engine',
    label: 'MEMORY ENGINE™',
    description: 'Permanent organizational memory V1.0 — projects, campaigns, decisions, lessons, customer history. Recall before repeating. Remember forever.',
    routeSegment: 'memory-engine',
  },
  {
    id: 'company-health-index',
    label: 'COMPANY HEALTH INDEX™',
    description: 'Continuous organizational health V1.0 — 12 category scores, Executive Health Score, weak-area detection. Healthier, not simply larger.',
    routeSegment: 'company-health-index',
  },
  {
    id: 'organization-pulse',
    label: 'ORGANIZATION PULSE™',
    description: 'Real-time organizational well-being V1.0 — 14 pulse indicators, pulse states, proactive alerts. How is our organization really doing?',
    routeSegment: 'organization-pulse',
  },
  {
    id: 'wisdom-capture',
    label: 'WISDOM CAPTURE™',
    description: 'Continuous wisdom preservation V1.0 — detect lessons from conversation, permanent Wisdom Library, organizational learning sync.',
    routeSegment: 'wisdom-capture',
  },
  {
    id: 'shadow-mode',
    label: 'SHADOW MODE™',
    description: 'Concierge observation V1.0 — learn before automate. Four phases: Observe · Recommend · Assist · Automate. Confidence engine + transparency.',
    routeSegment: 'shadow-mode',
  },
  {
    id: 'organization-digital-twin',
    label: 'ORGANIZATION DIGITAL TWIN™',
    description: 'Living org simulation V1.0 — mirror the business in real time. What-if sandbox before acting. No real data changes.',
    routeSegment: 'organization-digital-twin',
  },
  {
    id: 'business-simulation-lab',
    label: 'BUSINESS SIMULATION LAB™',
    description: 'Strategic simulation V1.0 — test strategies, experiments, long-term decisions in sandbox. Executive Council review. Scenario Library.',
    routeSegment: 'business-simulation-lab',
  },
  {
    id: 'knowledge-confidence',
    label: 'KNOWLEDGE CONFIDENCE™',
    description: 'Profession Brain quality assurance V1.0 — 10 confidence dimensions, fuel gauges, learning recommendations. Trust through transparency.',
    routeSegment: 'knowledge-confidence',
  },
  {
    id: 'legacy-vault',
    label: 'LEGACY VAULT™',
    description: 'Permanent organizational history V2.0 — archive milestones, version history, founder archive, time capsules. PRESERVE EXPERTISE. BUILD LEGACY.',
    routeSegment: 'legacy-vault',
  },
  {
    id: 'ambient-awareness',
    label: 'AMBIENT AWARENESS™',
    description: 'Continuous organizational context V1.0 — 10 awareness layers, proactive executive briefings, department awareness. Present, not reactive.',
    routeSegment: 'ambient-awareness',
  },
  {
    id: 'anticipation-engine',
    label: 'ANTICIPATION ENGINE™',
    description: 'Predict organizational needs V1.0 — proactive preparation, pattern recognition, everything awaits approval. Prepare tomorrow.',
    routeSegment: 'anticipation-engine',
  },
  {
    id: 'founder-cognitive-load',
    label: 'FOUNDER COGNITIVE LOAD™',
    description: 'Protect founder attention V1.0 — cognitive analysis, intelligent filtering, attention modes. Prioritize, don\'t overwhelm.',
    routeSegment: 'founder-cognitive-load',
  },
  {
    id: 'presence-engine',
    label: 'PRESENCE ENGINE™',
    description: 'Living executive presence V1.0 — calm, confident, continuous support. Never noisy, always reassuring.',
    routeSegment: 'presence-engine',
  },
  {
    id: 'cross-organization-intelligence',
    label: 'CROSS-ORGANIZATION INTELLIGENCE™',
    description: 'Trusted cross-org collaboration V1.0 — intelligent connections, founder network, privacy-first resource sharing.',
    routeSegment: 'cross-organization-intelligence',
  },
  {
    id: 'relationship-memory',
    label: 'RELATIONSHIP MEMORY™',
    description: 'Professional familiarity V1.0 — learn how founders and organizations prefer to work. Familiar, never intrusive.',
    routeSegment: 'relationship-memory',
  },
  {
    id: 'predictive-organization',
    label: 'PREDICTIVE ORGANIZATION™',
    description: 'Future intelligence V1.0 — anticipate opportunities, risks, bottlenecks, and trends before they occur.',
    routeSegment: 'predictive-organization',
  },
  {
    id: 'autonomous-preparation',
    label: 'AUTONOMOUS PREPARATION™',
    description: 'Quiet preparation V1.0 — prepare work before founders ask. Nothing auto-executes; everything awaits approval.',
    routeSegment: 'autonomous-preparation',
  },
  {
    id: 'organizational-consciousness',
    label: 'ORGANIZATIONAL CONSCIOUSNESS™',
    description: 'Master intelligence V1.0 — unifies every intelligent system into one continuously learning organizational consciousness.',
    routeSegment: 'organizational-consciousness',
  },
  {
    id: 'world-knowledge-engine',
    label: 'WORLD KNOWLEDGE ENGINE™',
    description: 'External intelligence V1.0 — monitors the outside world, filters by organization context, delivers executive briefings. Information finds you.',
    routeSegment: 'world-knowledge-engine',
  },
  {
    id: 'founder-operating-system',
    label: 'FOUNDER OPERATING SYSTEM™',
    description: 'Founder leadership V1.0 — operates the founder while Studio OS operates the organization. Coaching, focus, personal dashboard. Studio OS V1 culmination.',
    routeSegment: 'founder-operating-system',
  },
  {
    id: 'innovation-lab',
    label: 'INNOVATION LAB™',
    description: 'Innovation Lab V1.0 — permanent research, invention, and strategic ideation. Continuously generate ideas from every intelligence source.',
    routeSegment: 'innovation-lab',
  },
  {
    id: 'organization-operating-manual',
    label: 'ORGANIZATION OPERATING MANUAL™',
    description: 'Living operating manual V1.0 — auto-generated handbook, searchable organization, live sync. Single source of operational truth.',
    routeSegment: 'organization-operating-manual',
  },
  {
    id: 'legacy-network',
    label: 'LEGACY NETWORK™',
    description: 'Legacy Network V1.0 — permission-based global ecosystem. Share expertise intentionally. Movement not marketplace.',
    routeSegment: 'legacy-network',
  },
  {
    id: 'studio-intelligence-architecture',
    label: 'STUDIO INTELLIGENCE™ ARCHITECTURE',
    description: 'Studio Intelligence Architecture V1.0 — model-agnostic intelligence layer. Org owns knowledge; models reason.',
    routeSegment: 'studio-intelligence-architecture',
  },
  {
    id: 'model-orchestrator',
    label: 'MODEL ORCHESTRATOR™',
    description: 'Model Orchestrator & AI Swap Engine V1.0 — interchangeable providers, failover, multi-model routing.',
    routeSegment: 'model-orchestrator',
  },
  {
    id: 'studio-foundation-models',
    label: 'STUDIO FOUNDATION MODELS™',
    description: 'Studio Foundation Models & Profession Models V1.0 — long-term Studio-owned intelligence roadmap.',
    routeSegment: 'studio-foundation-models',
  },
  {
    id: 'documentation-registry',
    label: 'DOCUMENTATION REGISTRY™',
    description: 'Documentation Registry V1.0 — single source of truth; register once, sync all documentation surfaces.',
    routeSegment: 'documentation-registry',
  },
  {
    id: 'documentation-governance',
    label: 'DOCUMENTATION GOVERNANCE™',
    description: 'Documentation Governance V1.0 — continuous audits, coverage validation, consistency, pre-deploy checks.',
    routeSegment: 'documentation-governance',
  },
  {
    id: 'system-registry',
    label: 'SYSTEM REGISTRY™',
    description: 'System Registry V1.0 — master directory of every object, module, feature, and system in Studio OS.',
    routeSegment: 'system-registry',
  },
  {
    id: 'component-registry',
    label: 'COMPONENT REGISTRY™',
    description: 'Component Registry V1.0 — reusable UI components as managed platform assets.',
    routeSegment: 'component-registry',
  },
  {
    id: 'design-token-engine',
    label: 'DESIGN TOKEN ENGINE™',
    description: 'Design Token Engine V1.0 — visual source of truth for spacing, typography, colors, motion, and themes.',
    routeSegment: 'design-token-engine',
  },
  {
    id: 'interaction-engine',
    label: 'INTERACTION ENGINE™',
    description: 'Interaction Engine V1.0 — behavioral source of truth for hover, focus, feedback, navigation, and accessibility.',
    routeSegment: 'interaction-engine',
  },
  {
    id: 'event-bus',
    label: 'EVENT BUS™',
    description: 'Event Bus V1.0 — publish/subscribe communication backbone; loosely coupled event-driven architecture.',
    routeSegment: 'event-bus',
  },
  {
    id: 'automation-registry',
    label: 'AUTOMATION REGISTRY™',
    description: 'Automation Registry V1.0 — every automation registered, visible, auditable; nothing executes without registration.',
    routeSegment: 'automation-registry',
  },
  {
    id: 'prompt-registry',
    label: 'PROMPT REGISTRY™',
    description: 'Prompt Registry V1.0 — every AI prompt versioned, searchable, testable; prompts are code, never hidden text.',
    routeSegment: 'prompt-registry',
  },
  {
    id: 'policy-engine',
    label: 'POLICY ENGINE™',
    description: 'Policy Engine V1.0 — centralized rulebook; define policies once; every system follows automatically.',
    routeSegment: 'policy-engine',
  },
  {
    id: 'permission-engine',
    label: 'PERMISSION ENGINE™',
    description: 'Permission Engine V1.0 — capability-based enterprise authorization; secure, intuitive, intentional.',
    routeSegment: 'permission-engine',
  },
  {
    id: 'workspace-runtime',
    label: 'WORKSPACE RUNTIME™',
    description: 'Workspace Runtime V1.0 — isolated execution environment per organization; independent digital headquarters.',
    routeSegment: 'workspace-runtime',
  },
  {
    id: 'plugin-sdk',
    label: 'PLUGIN SDK™',
    description: 'Plugin SDK V1.0 — extensible platform; organizations, developers, and partners build custom capabilities.',
    routeSegment: 'plugin-sdk',
  },
  {
    id: 'workflow-engine',
    label: 'WORKFLOW ENGINE™',
    description: 'Workflow Engine V1.0 — visual orchestration for every business process; design, test, evolve without code.',
    routeSegment: 'workflow-engine',
  },
  {
    id: 'state-engine',
    label: 'STATE ENGINE™',
    description: 'State Engine V1.0 — centralized lifecycle management; defined states, intentional transitions, complete history.',
    routeSegment: 'state-engine',
  },
  {
    id: 'asset-registry',
    label: 'ASSET REGISTRY™',
    description: 'Asset Registry V1.0 — permanent home for every organizational asset; searchable, versioned, connected.',
    routeSegment: 'asset-registry',
  },
  {
    id: 'experience-engine',
    label: 'EXPERIENCE ENGINE™',
    description: 'Experience Engine V1.0 — emotional and environmental layer; context-aware atmosphere, subtle transitions, Infrastructure Chapter completion.',
    routeSegment: 'experience-engine',
  },
  {
    id: 'qa-headquarters',
    label: 'QA HEADQUARTERS™',
    description: 'QA Headquarters V1.0 — permanent Quality Assurance & Trust Infrastructure; Trust Scores™, continuous validation, organizational integrity.',
    routeSegment: 'qa-headquarters',
  },
  {
    id: 'qa-inspector',
    label: 'QA INSPECTOR™',
    description: 'QA Inspector V1.0 — intelligent continuous audit; severity, confidence, root cause, recommended solution. Recommends only.',
    routeSegment: 'qa-inspector',
  },
  {
    id: 'qa-simulation-engine',
    label: 'QA SIMULATION ENGINE™',
    description: 'QA Simulation Engine V1.0 — pre-production practice field; simulate every persona journey before users encounter it.',
    routeSegment: 'qa-simulation-engine',
  },
  {
    id: 'ai-red-team',
    label: 'AI RED TEAM™',
    description: 'AI Red Team V1.0 — adversarial stress testing; assume wrong until proven, expose weaknesses before users discover them.',
    routeSegment: 'ai-red-team',
  },
  {
    id: 'executive-trust-dashboard',
    label: 'EXECUTIVE TRUST DASHBOARD™',
    description: 'Executive Trust Dashboard V1.0 — centralized trust metrics; health, confidence, risk, and history for every major system.',
    routeSegment: 'executive-trust-dashboard',
  },
  {
    id: 'time-machine',
    label: 'TIME MACHINE™',
    description: 'Time Machine V1.0 — organizational replay engine; experience any event exactly as it occurred to understand WHY.',
    routeSegment: 'time-machine',
  },
  {
    id: 'predictive-qa',
    label: 'PREDICTIVE QA™',
    description: 'Predictive QA V1.0 — future risk protection engine; identify tomorrow\'s operational problems while there is still time to prevent them.',
    routeSegment: 'predictive-qa',
  },
  {
    id: 'self-healing-engine',
    label: 'SELF-HEALING™ ENGINE',
    description: 'Self-Healing Engine V1.0 — intelligent resilience; safely correct low-risk issues and prepare Recovery Plans for higher-risk situations.',
    routeSegment: 'self-healing-engine',
  },
  {
    id: 'decision-audit',
    label: 'DECISION AUDIT™',
    description: 'Decision Audit V1.0 — permanent accountability for every significant recommendation, approval, rejection, automation, and AI decision.',
    routeSegment: 'decision-audit',
  },
  {
    id: 'confidence-engine',
    label: 'CONFIDENCE ENGINE™',
    description: 'Confidence Engine V1.0 — visible intelligence confidence; every recommendation explained with evidence, reasoning, and transparency.',
    routeSegment: 'confidence-engine',
  },
  {
    id: 'organizational-guardian',
    label: 'ORGANIZATIONAL GUARDIAN™',
    description: 'Organizational Guardian V1.0 — highest oversight layer; trusted executive advisor protecting quality, trust, security, and operational excellence.',
    routeSegment: 'organizational-guardian',
  },
  {
    id: 'design-compliance-engine',
    label: 'DESIGN COMPLIANCE ENGINE™',
    description: 'Design Compliance Engine V1.0 — Studio OS Creative Director; continuously audits every interface for visual, structural, and experiential design language consistency.',
    routeSegment: 'design-compliance-engine',
  },
  {
    id: 'prompt-qa',
    label: 'PROMPT QA™',
    description: 'Prompt QA V1.0 — validates every prompt, Profession Brain, workflow instruction, and AI reasoning chain before production.',
    routeSegment: 'prompt-qa',
  },
  {
    id: 'succession-mode',
    label: 'SUCCESSION MODE™',
    description: 'Succession readiness V1.0 — measure survival without founder. Knowledge dependency map, recommendations, legacy continuity. Preserve expertise. Build legacy.',
    routeSegment: 'succession-mode',
  },
  {
    id: 'brand-positioning',
    label: 'STUDIO OS BRAND',
    description: 'Official brand positioning V2.0 — PRESERVE EXPERTISE. BUILD LEGACY. Permanent tagline and contextual voice architecture.',
    routeSegment: 'brand-positioning',
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
