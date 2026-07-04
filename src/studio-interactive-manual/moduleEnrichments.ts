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
  'campaign-orchestrator': {
    workflowNodes: ['OBJECTIVE', 'AUDIENCE', 'SCHEDULE', 'CREATIVE', 'GENERATE PLAN', 'APPROVALS'],
    relatedModuleIds: ['executive-ai-director', 'production-builder', 'asset-factory'],
  },
  'knowledge-hub': {
    architecture:
      'Knowledge Graph connects modules, workflows, written manual chapters, Memory Bible decisions, and customer Onboarding Tutorial.',
    versionIntroduced: 'Milestone 20',
    versionUpdated: 'Milestone 25',
    relatedModuleIds: ['memory-bible', 'tutorial-os'],
  },
  'memory-bible': {
    architecture:
      'Founder profile → communication & writing rules → naming bible → decision log → workspace memory → AI Context Builder with source tracking.',
    versionIntroduced: 'Milestone 25',
    workflowNodes: [
      'FOUNDER PROFILE',
      'NAMING BIBLE',
      'DECISION LOG',
      'WORKSPACE MEMORY',
      'AI CONTEXT BUILDER',
      'EXPORT HISTORY',
      'VERSION HISTORY',
    ],
    relatedModuleIds: ['knowledge-hub', 'content-brain', 'photography-bible', 'mission-control'],
    featureSteps: [
      {
        id: 'memory-naming-bible',
        kind: 'section',
        title: 'NAMING BIBLE',
        body: 'Official names, deprecated aliases, and usage notes — studio os, Frontal Slayer, Creative DNA, Memory Bible, and more.',
        benefit: 'Every agent and contractor starts with the same vocabulary.',
        targetSelector: CONTENT,
        animationType: 'glow',
        position: 'bottom',
        spotlight: true,
      },
      {
        id: 'memory-decision-log',
        kind: 'section',
        title: 'DECISION LOG',
        body: 'Structured decisions with reason, alternatives, outcome, and links to Knowledge Graph nodes.',
        benefit: 'Understand why architecture choices were made — not just what changed.',
        targetSelector: CONTENT,
        animationType: 'pulse',
        position: 'bottom',
        spotlight: true,
      },
      {
        id: 'memory-context-builder',
        kind: 'widget',
        title: 'AI CONTEXT BUILDER',
        body: 'Select workspace, target (Cursor, OpenArt, contractor), task type, and scopes — generate traceable context packages.',
        benefit: 'Every AI session starts informed instead of from scratch.',
        targetSelector: CONTENT,
        animationType: 'spotlight',
        position: 'bottom',
        spotlight: true,
      },
    ],
  },
  'tutorial-os': {
    architecture: 'Admin management for customer Onboarding Tutorial (Mansion Tour) — separate from studio os Interactive Manual.',
    workflowNodes: ['Welcome', 'Mansion Tour steps', 'Feature cards', 'Nested tours', 'Progress analytics'],
    relatedModuleIds: ['knowledge-hub'],
    featureSteps: [
      {
        id: 'tutorial-customer-separation',
        kind: 'section',
        title: 'CUSTOMER VS ADMIN',
        body: 'Onboarding Tutorial teaches the storefront. studio os Interactive Manual teaches admin tools. Both share layered walkthrough architecture.',
        benefit: 'Never confuse customer onboarding with operator training.',
        position: 'center',
        animationType: 'transition',
        spotlight: false,
      },
    ],
  },
  'photography-bible': {
    architecture: 'Creative DNA → Master Hero → Asset Factory → Smart Asset Registry → Website surfaces.',
    workflowNodes: [
      'CREATIVE DNA',
      'MASTER HERO',
      'ASSET FACTORY',
      'TRANSPARENT MASTER',
      'SMART ASSETS',
      'WEBSITE',
    ],
    relatedModuleIds: ['brand-assets-asset-factory', 'asset-factory', 'brand-assets'],
    featureSteps: [
      {
        id: 'photo-creative-dna-tab',
        kind: 'widget',
        title: 'CREATIVE DNA TAB',
        body: 'Approved prompt v2.0, display bust, editorial reference — locked before any Fal generation.',
        benefit: 'One source of truth for every signature unit.',
        targetSelector: CONTENT,
        animationType: 'pulse',
        position: 'bottom',
        spotlight: true,
      },
      {
        id: 'photo-master-hero',
        kind: 'section',
        title: 'MASTER HERO GENERATION',
        body: 'Generate via Fal using Creative DNA package — SOFT WAVE POC, expanding to full catalog.',
        benefit: 'Approved masters feed Asset Factory automatically.',
        targetSelector: CONTENT,
        animationType: 'glow',
        position: 'bottom',
        spotlight: true,
      },
    ],
  },
  'brand-assets-asset-factory': {
    architecture: 'Receives masters → background removal → smart crops → Supabase → registry by context.',
    workflowNodes: [
      'MASTER INPUT',
      'BACKGROUND REMOVAL',
      'SMART CROPS',
      'SUPABASE UPLOAD',
      'REGISTRY',
      'CART · CHECKOUT · EMAIL',
    ],
    relatedModuleIds: ['photography-bible', 'asset-factory'],
    featureSteps: [
      {
        id: 'smart-registry-contexts',
        kind: 'section',
        title: 'CONTEXT-AWARE DELIVERY',
        body: 'Wishlist, cart, checkout, email, and Build-A-Wig snapshots each resolve the correct variant.',
        benefit: 'One registry — many surfaces.',
        targetSelector: CONTENT,
        animationType: 'spotlight',
        position: 'bottom',
        spotlight: true,
      },
      {
        id: 'fallback-status',
        kind: 'widget',
        title: 'FALLBACK_USED',
        body: 'When variant lookup fails, a safe fallback displays — investigate Photography Bible + Factory pipeline.',
        benefit: 'Catch missing assets before customers see broken images.',
        targetSelector: CONTENT,
        animationType: 'blur',
        position: 'bottom',
        spotlight: false,
      },
    ],
  },
  analytics: {
    relatedModuleIds: ['executive-command-center', 'audience-brain'],
  },
  'content-packs': {
    relatedModuleIds: ['production-builder', 'publishing-queue', 'lounge-tv'],
  },
  'executive-ai-director': {
    relatedModuleIds: ['mission-control', 'campaign-orchestrator', 'knowledge-hub'],
  },
  'director-mode': {
    relatedModuleIds: ['production-builder', 'asset-director'],
  },
};

export { HEADER, CONTENT, NAV, INFO };
