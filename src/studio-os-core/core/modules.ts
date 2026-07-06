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
    description: 'Temporal intelligence — living organizational timeline with dependencies, concierge commands, and portfolio view. V1.0.',
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
