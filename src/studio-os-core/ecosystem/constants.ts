/** Studio OS Ecosystem v1.0 — constants. */

import type { EcosystemCategory, PublishStage } from './types';

export const ECOSYSTEM_STORAGE_KEY = 'studioOsEcosystem_v1';
export const ECOSYSTEM_VERSION = '1.0.0';

export const ECOSYSTEM_CATEGORIES: EcosystemCategory[] = [
  'company-blueprint',
  'creative-dna',
  'company-dna',
  'writing-bible',
  'photography-bible',
  'asset-pack',
  'prompt-library',
  'automation-pack',
  'workflow-system',
  'campaign-template',
  'email-system',
  'landing-page-system',
  'sales-system',
  'executive-ai-team',
  'ai-director',
  'knowledge-graph-template',
  'interactive-manual',
  'onboarding-system',
  'industry-template',
  'dashboard-layout',
  'application',
];

export const ECOSYSTEM_CATEGORY_LABELS: Record<EcosystemCategory, string> = {
  'company-blueprint': 'COMPANY BLUEPRINT',
  'creative-dna': 'CREATIVE DNA',
  'company-dna': 'COMPANY DNA',
  'writing-bible': 'WRITING BIBLE',
  'photography-bible': 'PHOTOGRAPHY BIBLE',
  'asset-pack': 'ASSET PACK',
  'prompt-library': 'PROMPT LIBRARY',
  'automation-pack': 'AUTOMATION PACK',
  'workflow-system': 'WORKFLOW SYSTEM',
  'campaign-template': 'CAMPAIGN TEMPLATE',
  'email-system': 'EMAIL SYSTEM',
  'landing-page-system': 'LANDING PAGE SYSTEM',
  'sales-system': 'SALES SYSTEM',
  'executive-ai-team': 'EXECUTIVE AI TEAM',
  'ai-director': 'AI DIRECTOR',
  'knowledge-graph-template': 'KNOWLEDGE GRAPH TEMPLATE',
  'interactive-manual': 'INTERACTIVE MANUAL',
  'onboarding-system': 'ONBOARDING SYSTEM',
  'industry-template': 'INDUSTRY TEMPLATE',
  'dashboard-layout': 'DASHBOARD LAYOUT',
  application: 'APPLICATION',
};

export const PUBLISH_STAGES: PublishStage[] = [
  'draft',
  'private-testing',
  'pilot',
  'review',
  'approved',
  'published',
  'updates',
  'retired',
];

export const PUBLISH_STAGE_LABELS: Record<PublishStage, string> = {
  draft: 'DRAFT',
  'private-testing': 'PRIVATE TESTING',
  pilot: 'PILOT',
  review: 'REVIEW',
  approved: 'APPROVED',
  published: 'PUBLISHED',
  updates: 'UPDATES',
  retired: 'RETIRED',
};
