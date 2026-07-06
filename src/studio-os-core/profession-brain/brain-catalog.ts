import type { ProfessionBrainDefinition } from './types';

export const PROFESSION_BRAIN_CATALOG: ProfessionBrainDefinition[] = [
  {
    id: 'fuel-tax',
    label: 'Fuel Tax Brain',
    tagline: 'Compliance filing · mileage · receipts · quarterly judgment',
    conciergeId: 'finance-concierge',
    industryHints: ['financial-services', 'contractor'],
    serviceKeywords: ['fuel tax', 'ifta', 'mileage', 'quarterly filing'],
  },
  {
    id: 'permit',
    label: 'Permit Brain',
    tagline: 'Permitting · deadlines · exceptions · regulatory navigation',
    industryHints: ['contractor', 'construction'],
    serviceKeywords: ['permit', 'licensing', 'compliance'],
  },
  {
    id: 'bookkeeping',
    label: 'Bookkeeping Brain',
    tagline: 'Receipts · categorization · reconciliation · professional judgment',
    conciergeId: 'finance-concierge',
    industryHints: ['financial-services', 'restaurant', 'ecommerce'],
    serviceKeywords: ['bookkeeping', 'accounting', 'receipt', 'reconcile'],
  },
  {
    id: 'dispatch',
    label: 'Dispatch Brain',
    tagline: 'Crew routing · scheduling · exceptions · customer commitments',
    conciergeId: 'scheduling-concierge',
    industryHints: ['contractor', 'painting', 'landscaping'],
    serviceKeywords: ['dispatch', 'scheduling', 'crew', 'route'],
  },
  {
    id: 'painting',
    label: 'Painting Brain',
    tagline: 'Estimates · surfaces · materials · quality standards',
    industryHints: ['painting', 'contractor'],
    serviceKeywords: ['painting', 'estimate', 'surface prep'],
  },
  {
    id: 'hair-analysis',
    label: 'Hair Analysis Brain',
    tagline: 'Consultation · texture · damage · recommendation logic',
    industryHints: ['beauty'],
    serviceKeywords: ['hair analysis', 'consultation', 'texture'],
  },
  {
    id: 'hair-color',
    label: 'Hair Color Brain',
    tagline: 'Formulation · swatches · correction · client expectations',
    industryHints: ['beauty'],
    serviceKeywords: ['color', 'formulation', 'swatch', 'toner'],
  },
  {
    id: 'inventory',
    label: 'Inventory Brain',
    tagline: 'Stock · reorder · shrinkage · fulfillment judgment',
    industryHints: ['ecommerce', 'manufacturing', 'restaurant'],
    serviceKeywords: ['inventory', 'warehouse', 'stock', 'reorder'],
  },
  {
    id: 'membership',
    label: 'Membership Brain',
    tagline: 'Tiers · renewals · benefits · retention logic',
    industryHints: ['beauty', 'fitness'],
    serviceKeywords: ['membership', 'loyalty', 'rewards', 'renewal'],
  },
  {
    id: 'marketing',
    label: 'Marketing Brain',
    tagline: 'Brand voice · campaigns · audience · growth judgment',
    conciergeId: 'marketing-concierge',
    industryHints: ['creator', 'agency', 'ecommerce'],
    serviceKeywords: ['marketing', 'campaign', 'brand', 'content'],
  },
  {
    id: 'legal-intake',
    label: 'Legal Intake Brain',
    tagline: 'Client intake · conflicts · jurisdiction · escalation rules',
    industryHints: ['law-firm'],
    serviceKeywords: ['legal', 'intake', 'client', 'matter'],
  },
  {
    id: 'medical-scheduling',
    label: 'Medical Scheduling Brain',
    tagline: 'Appointments · insurance · triage · compliance',
    conciergeId: 'scheduling-concierge',
    industryHints: ['medical', 'dental'],
    serviceKeywords: ['scheduling', 'appointment', 'patient', 'insurance'],
  },
  {
    id: 'hvac',
    label: 'HVAC Brain',
    tagline: 'Diagnostics · service calls · parts · seasonal demand',
    industryHints: ['contractor', 'automotive'],
    serviceKeywords: ['hvac', 'service call', 'diagnostic'],
  },
  {
    id: 'construction',
    label: 'Construction Brain',
    tagline: 'Projects · subs · change orders · safety standards',
    industryHints: ['construction', 'contractor'],
    serviceKeywords: ['construction', 'change order', 'subcontractor'],
  },
  {
    id: 'dental',
    label: 'Dental Brain',
    tagline: 'Treatment plans · hygiene · insurance · patient care',
    industryHints: ['dental'],
    serviceKeywords: ['dental', 'hygiene', 'treatment plan'],
  },
  {
    id: 'restaurant',
    label: 'Restaurant Brain',
    tagline: 'Service flow · inventory · staff · guest experience',
    industryHints: ['restaurant', 'hospitality'],
    serviceKeywords: ['restaurant', 'menu', 'service', 'kitchen'],
  },
  {
    id: 'production',
    label: 'Production Brain',
    tagline: 'Media pipeline · quality · approvals · throughput',
    conciergeId: 'production-concierge',
    industryHints: ['creator'],
    serviceKeywords: ['production', 'render', 'publish', 'media'],
  },
  {
    id: 'publishing',
    label: 'Publishing Brain',
    tagline: 'Schedule · platforms · hooks · audience timing',
    conciergeId: 'publishing-concierge',
    industryHints: ['creator'],
    serviceKeywords: ['publishing', 'schedule', 'content', 'ndxbook'],
  },
  {
    id: 'customer-experience',
    label: 'Customer Experience Brain',
    tagline: 'Support · expectations · escalation · delight',
    conciergeId: 'customer-experience-concierge',
    industryHints: ['ecommerce', 'beauty', 'restaurant'],
    serviceKeywords: ['support', 'customer', 'experience', 'inquiry'],
  },
];

export function getBrainDefinition(id: string): ProfessionBrainDefinition | undefined {
  return PROFESSION_BRAIN_CATALOG.find((b) => b.id === id);
}

export function listBrainCatalog(): ProfessionBrainDefinition[] {
  return PROFESSION_BRAIN_CATALOG;
}

export function resolveBrainsForIndustry(industryId: string): ProfessionBrainDefinition[] {
  return PROFESSION_BRAIN_CATALOG.filter((b) => b.industryHints.includes(industryId));
}

export function resolveBrainForServiceName(serviceName: string): ProfessionBrainDefinition | undefined {
  const lower = serviceName.toLowerCase();
  return PROFESSION_BRAIN_CATALOG.find((b) =>
    b.serviceKeywords.some((k) => lower.includes(k))
  );
}

export function resolveBrainForKeyword(text: string): ProfessionBrainDefinition | undefined {
  const lower = text.toLowerCase();
  return PROFESSION_BRAIN_CATALOG.find((b) =>
    b.serviceKeywords.some((k) => lower.includes(k)) || lower.includes(b.id.replace(/-/g, ' '))
  );
}
