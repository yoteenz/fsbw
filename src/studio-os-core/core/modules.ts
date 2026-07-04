/**
 * studio os Core modules — reusable, industry-agnostic platform capabilities.
 * Core contains NO workspace-specific knowledge.
 */

export type StudioOsCoreModuleId =
  | 'mission-control'
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
  | 'legacy-system'
  | 'knowledge-hub'
  | 'memory-bible';

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
] as const;
