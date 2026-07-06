/** Milestone 117 — World Knowledge Engine™ V1.0 */

export const WORLD_KNOWLEDGE_ENGINE_STORAGE_KEY = 'studioOsWorldKnowledgeEngine_v1';
export const WORLD_KNOWLEDGE_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED = 'studio-os-world-knowledge-engine-updated';

export const WORLD_KNOWLEDGE_PHILOSOPHY = [
  'Founders should not spend hours searching for information — information should find them.',
  'Studio OS becomes an intelligent research partner and trusted window into the outside world.',
  'Only surface what matters to each organization — context-aware filtering, not noise.',
] as const;

export const MONITORING_CATEGORIES = [
  'industry-news',
  'market-trends',
  'competitor-activity',
  'government-regulations',
  'technology-advances',
  'artificial-intelligence',
  'economic-indicators',
  'social-trends',
  'platform-updates',
  'legislation',
  'consumer-behavior',
  'professional-certifications',
  'software-updates',
  'security-risks',
] as const;

export const MONITORING_CATEGORY_LABELS: Record<(typeof MONITORING_CATEGORIES)[number], string> = {
  'industry-news': 'Industry News',
  'market-trends': 'Market Trends',
  'competitor-activity': 'Competitor Activity',
  'government-regulations': 'Government Regulations',
  'technology-advances': 'Technology Advances',
  'artificial-intelligence': 'Artificial Intelligence',
  'economic-indicators': 'Economic Indicators',
  'social-trends': 'Social Trends',
  'platform-updates': 'Platform Updates',
  legislation: 'Legislation',
  'consumer-behavior': 'Consumer Behavior',
  'professional-certifications': 'Professional Certifications',
  'software-updates': 'Software Updates',
  'security-risks': 'Security Risks',
};

export const BRIEFING_TYPES = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'executive-summary',
  'opportunity-alert',
  'risk-alert',
] as const;

export const BRIEFING_TYPE_LABELS: Record<(typeof BRIEFING_TYPES)[number], string> = {
  daily: 'Daily Briefing',
  weekly: 'Weekly Intelligence Report',
  monthly: 'Monthly Industry Outlook',
  quarterly: 'Quarterly Strategic Report',
  'executive-summary': 'Executive Summary',
  'opportunity-alert': 'Opportunity Alert',
  'risk-alert': 'Risk Alert',
};

export const WORLD_KNOWLEDGE_ACCENT = '#0E7490';
