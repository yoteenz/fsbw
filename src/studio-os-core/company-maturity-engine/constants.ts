import type { CompanyStageId, MaturityDomainId } from './types';

export const COMPANY_MATURITY_ENGINE_STORAGE_KEY = 'studioOsCompanyMaturityEngine_v1';
export const COMPANY_MATURITY_ENGINE_VERSION = '1.0.0';
export const COMPANY_MATURITY_ENGINE_ID = 'company-maturity-engine';

export const MATURITY_PHILOSOPHY = [
  'Meet founders where they are — never force a restart',
  'Organizational understanding before organizational improvement',
  'Build new or import existing — same organizational blueprint',
  'Preserve the past while accelerating the future',
] as const;

export const COMPANY_STAGES: { id: CompanyStageId; label: string }[] = [
  { id: 'idea', label: 'IDEA · NAPKIN STAGE' },
  { id: 'registered', label: 'REGISTERED BUSINESS' },
  { id: 'early-startup', label: 'EARLY STARTUP' },
  { id: 'operating', label: 'OPERATING BUSINESS' },
  { id: 'growing', label: 'GROWING COMPANY' },
  { id: 'established', label: 'ESTABLISHED COMPANY' },
  { id: 'enterprise', label: 'ENTERPRISE' },
];

export const MATURITY_DOMAINS: { id: MaturityDomainId; label: string }[] = [
  { id: 'business', label: 'BUSINESS' },
  { id: 'leadership', label: 'LEADERSHIP' },
  { id: 'strategy', label: 'STRATEGY' },
  { id: 'branding', label: 'BRANDING' },
  { id: 'customer-experience', label: 'CUSTOMER EXPERIENCE' },
  { id: 'digital-experience', label: 'DIGITAL EXPERIENCE' },
  { id: 'marketing', label: 'MARKETING' },
  { id: 'sales', label: 'SALES' },
  { id: 'operations', label: 'OPERATIONS' },
  { id: 'finance', label: 'FINANCE' },
  { id: 'legal', label: 'LEGAL' },
  { id: 'human-resources', label: 'HUMAN RESOURCES' },
  { id: 'technology', label: 'TECHNOLOGY' },
  { id: 'knowledge', label: 'KNOWLEDGE' },
  { id: 'automation', label: 'AUTOMATION' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'relationships', label: 'RELATIONSHIPS' },
  { id: 'commerce', label: 'COMMERCE' },
  { id: 'creator-ecosystem', label: 'CREATOR ECOSYSTEM' },
  { id: 'organizational-intelligence', label: 'ORG INTELLIGENCE' },
];

export const COMPANY_MATURITY_CONNECTED_SYSTEMS = [
  'Business Architect',
  'Leadership DNA',
  'Company DNA',
  'Knowledge Graph',
  'Chief of Staff',
  'Studio Intelligence',
  'Organizational Inheritance',
  'Simulation Engine',
  'Knowledge Asset Engine',
  'Strategy Engine',
  'Future Architects',
] as const;

export const INTEGRATION_PLATFORMS = [
  'Shopify', 'Stripe', 'Supabase', 'GitHub', 'Vercel', 'Figma',
  'WordPress', 'Webflow', 'Framer', 'HubSpot', 'Google Workspace', 'Notion',
  'Slack', 'Mailchimp', 'ConvertKit', 'Instagram', 'YouTube', 'LinkedIn', 'TikTok', 'Facebook', 'X',
] as const;
