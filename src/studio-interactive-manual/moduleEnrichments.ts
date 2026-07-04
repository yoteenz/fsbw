import type { ManualNodeDef } from './schema';

export type ModuleManualEnrichment = {
  architecture?: string;
  featureSteps?: ManualNodeDef[];
  workflowNodes?: string[];
  relatedModuleIds?: string[];
  versionIntroduced?: string;
  versionUpdated?: string;
};

const HEADER = '[data-studio-manual="module-header"]';
const CONTENT = '[data-studio-manual="workspace-content"]';
const NAV = '[data-studio-manual="nav-tabs"]';
const INFO = '[data-studio-manual="info-button"]';

/** Rich interactive steps for flagship Studio modules. */
export const MODULE_MANUAL_ENRICHMENTS: Record<string, ModuleManualEnrichment> = {
  'asset-factory': {
    architecture:
      'Blueprint Manager (spec) → Asset Factory (manufacturing) → Asset Director (approval) → Distribution / Mission Control sync.',
    versionIntroduced: 'Milestone 19',
    workflowNodes: [
      'APPROVED BLUEPRINT',
      'GENERATION PLAN',
      'FACTORY FLOOR',
      'QA & VERSIONING',
      'ASSET DIRECTOR',
      'MISSION CONTROL',
      'PUBLISHING',
    ],
    featureSteps: [
      {
        id: 'factory-dashboard',
        kind: 'widget',
        title: 'EXECUTIVE DASHBOARD',
        body: 'Start here for queue health, department status, and approval gates before any run.',
        benefit: 'See factory readiness at a glance.',
        targetSelector: CONTENT,
        animationType: 'glow',
        position: 'bottom',
        spotlight: true,
        knowledgeLevel: 'intro',
      },
      {
        id: 'generation-pipeline',
        kind: 'widget',
        title: 'GENERATION PIPELINE',
        body: 'Nine simulated departments run in order — each must pass QA before the next handoff.',
        benefit: 'Understand why jobs pause at approval gates.',
        targetSelector: CONTENT,
        animationType: 'pulse',
        position: 'bottom',
        spotlight: true,
        knowledgeLevel: 'intermediate',
      },
      {
        id: 'asset-approval',
        kind: 'widget',
        title: 'ASSET APPROVAL',
        body: 'Approved outputs auto-populate Asset Director and Mission Control — never skip human review.',
        benefit: 'Keep published assets trustworthy.',
        targetSelector: CONTENT,
        animationType: 'spotlight',
        position: 'bottom',
        spotlight: true,
        knowledgeLevel: 'advanced',
      },
      {
        id: 'factory-publishing',
        kind: 'widget',
        title: 'PUBLISHING HANDOFF',
        body: 'Finished assets sync to Content Packs, Distribution Network, and member surfaces.',
        benefit: 'Close the loop from spec to ship.',
        targetSelector: CONTENT,
        animationType: 'transition',
        position: 'center',
        spotlight: false,
        knowledgeLevel: 'advanced',
      },
    ],
    relatedModuleIds: ['blueprint-manager', 'asset-director', 'mission-control'],
  },
  'asset-director': {
    architecture: 'Visual asset management hub — studios, talent, wardrobe, versions, and health cards.',
    workflowNodes: [
      'MASTER HERO',
      'BACKGROUND REMOVAL',
      'AUTOMATIC CROPS',
      'MEDIA KIT GENERATION',
      'EXPORT TEMPLATES',
      'PUBLISHING',
      'WEBSITE SYNC',
    ],
    featureSteps: [
      {
        id: 'ad-gallery',
        kind: 'widget',
        title: 'GALLERY & LIST MODES',
        body: 'Switch between 21:9 hero gallery and dense list for bulk approvals.',
        benefit: 'Review faster at scale.',
        targetSelector: CONTENT,
        animationType: 'glow',
        position: 'bottom',
        spotlight: true,
      },
      {
        id: 'ad-preview',
        kind: 'widget',
        title: 'QUICK PREVIEW',
        body: 'Tap any tile for full-screen interactive master before approving a version.',
        benefit: 'Catch issues before publish.',
        targetSelector: CONTENT,
        animationType: 'zoom',
        position: 'bottom',
        spotlight: true,
      },
    ],
    relatedModuleIds: ['asset-factory', 'brand-assets', 'production-builder'],
  },
  'brand-assets': {
    architecture: 'Photography Bible → derivatives → Product Asset Factory → locked storefront specs.',
    workflowNodes: [
      'MASTER HERO',
      'BACKGROUND REMOVAL',
      'AUTOMATIC CROPS',
      'MEDIA KIT',
      'EXPORT TEMPLATES',
      'WEBSITE SYNC',
      'EMAIL SYNC',
    ],
    featureSteps: [
      {
        id: 'photo-bible',
        kind: 'section',
        title: 'PHOTOGRAPHY BIBLE',
        body: 'Locked angles, lighting, and crop rules every product shoot must follow.',
        benefit: 'One source of truth for catalog photography.',
        targetSelector: CONTENT,
        animationType: 'spotlight',
        position: 'bottom',
        spotlight: true,
      },
      {
        id: 'variants-inherit',
        kind: 'widget',
        title: 'VARIANT INHERITANCE',
        body: 'Child SKUs inherit master hero rules — edit the bible, not every derivative by hand.',
        benefit: 'Scale consistency across the catalog.',
        targetSelector: CONTENT,
        animationType: 'pulse',
        position: 'bottom',
        spotlight: true,
        knowledgeLevel: 'intermediate',
      },
    ],
    relatedModuleIds: ['asset-factory', 'asset-director'],
  },
  'blueprint-manager': {
    architecture: 'Specification-only library — no generation until APPROVED status.',
    workflowNodes: ['DRAFT SPEC', 'VALIDATION', 'APPROVAL', 'ASSET FACTORY', 'VERSION HISTORY'],
    relatedModuleIds: ['asset-factory', 'asset-director'],
  },
  'mission-control': {
    architecture: 'Executive HQ — missions, departments, approvals, and live activity.',
    relatedModuleIds: ['executive-ai-director', 'campaign-orchestrator', 'knowledge-hub'],
  },
  'knowledge-hub': {
    architecture: 'Interactive Manual + written wiki + object profiles + workflow guides.',
    versionIntroduced: 'Milestone 20',
    versionUpdated: 'Milestone 24',
  },
  'campaign-orchestrator': {
    workflowNodes: ['OBJECTIVE', 'AUDIENCE', 'SCHEDULE', 'CREATIVE', 'GENERATE PLAN', 'APPROVALS'],
    relatedModuleIds: ['executive-ai-director', 'production-builder', 'asset-factory'],
  },
  'production-builder': {
    workflowNodes: ['ASSET LIBRARY', 'SCENE BUILDER', 'INSPECTOR', 'BUILD PRODUCTION', 'DIRECTOR MODE'],
    relatedModuleIds: ['director-mode', 'asset-director', 'content-packs'],
  },
};

export { HEADER, CONTENT, NAV, INFO };
