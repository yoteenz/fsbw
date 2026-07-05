import type { ExperienceModeId } from './types';

export const DIGITAL_ARCHITECT_STORAGE_KEY = 'studioOsDigitalArchitect_v2';
export const DIGITAL_ARCHITECT_VERSION = '2.0.0';
export const DIGITAL_ARCHITECT_ID = 'digital-architect';

export const DIGITAL_PHILOSOPHY = [
  'Digital products begin with purpose — not templates',
  'Solve business problems while reinforcing company identity',
  'Long-term competitive advantages — not disposable websites',
  'Optimize for experiences · unforgettable digital worlds',
] as const;

export const DIGITAL_ARCHITECT_CONNECTED_SYSTEMS = [
  'Company Maturity Engine',
  'Brand Architect',
  'Experience Architect',
  'Business Architect',
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Operational DNA',
  'Knowledge Graph',
  'Chief of Staff',
  'Studio Intelligence',
  'Launch Architect',
] as const;

export const EXPERIENCE_MODE_IDS: ExperienceModeId[] = [
  'classic',
  'luxury',
  'immersive',
  'editorial',
  'community',
  'marketplace',
  'enterprise',
  'saas',
  'custom',
];

export const INTEGRATION_PLATFORMS = [
  'Cursor', 'GitHub', 'Supabase', 'Vercel', 'Figma', 'OpenArt', 'Fal',
  'Stripe', 'Shopify',
] as const;

export const ECOSYSTEM_PRODUCT_TYPES = [
  'Marketing websites',
  'Ecommerce',
  'Marketplaces',
  'Mobile apps',
  'Desktop apps',
  'Admin dashboards',
  'Customer portals',
  'Employee portals',
  'Community platforms',
  'Learning systems',
  'CRM',
  'ERP',
  'Booking systems',
  'Knowledge centers',
  'Documentation',
  'API ecosystems',
] as const;
