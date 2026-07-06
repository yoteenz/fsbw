import { DEFAULT_DIGITAL_STAFF_MONTHLY } from './constants';
import type { DigitalStaffDefinition } from './types';

const rate = DEFAULT_DIGITAL_STAFF_MONTHLY;

/** Digital Staff catalog — recurring organizational payroll, never "AI subscriptions". */
export const DIGITAL_STAFF_CATALOG: DigitalStaffDefinition[] = [
  {
    id: 'chief-concierge',
    name: 'Chief Concierge',
    role: 'CHIEF CONCIERGE',
    departmentLabel: 'EXECUTIVE',
    monthlyPayroll: 0,
    includedInHeadquartersLicense: true,
    description: 'Routes founder commands · coordinates every department · always on duty.',
  },
  {
    id: 'studio-intelligence',
    name: 'Studio Intelligence',
    role: 'STUDIO INTELLIGENCE',
    departmentLabel: 'EXECUTIVE',
    monthlyPayroll: 79,
    description: 'Cross-department intelligence · portfolio insights · decision support.',
  },
  {
    id: 'marketing-concierge',
    name: 'Marketing Concierge',
    role: 'MARKETING CONCIERGE',
    departmentLabel: 'MARKETING',
    monthlyPayroll: rate,
    unlockedByPackId: 'marketing-department',
    description: 'Campaign rhythm · audience offers · channel coordination.',
  },
  {
    id: 'growth-concierge',
    name: 'Growth Concierge',
    role: 'GROWTH CONCIERGE',
    departmentLabel: 'MARKETING',
    monthlyPayroll: rate,
    unlockedByPackId: 'marketing-department',
    description: 'Pipeline growth · conversion · expansion signals.',
  },
  {
    id: 'research-concierge',
    name: 'Research Concierge',
    role: 'RESEARCH CONCIERGE',
    departmentLabel: 'RESEARCH',
    monthlyPayroll: rate,
    unlockedByPackId: 'creator-pack',
    description: 'Topic intelligence · competitive scan · educational angles.',
  },
  {
    id: 'production-concierge',
    name: 'Production Concierge',
    role: 'PRODUCTION CONCIERGE',
    departmentLabel: 'PRODUCTION',
    monthlyPayroll: rate,
    unlockedByPackId: 'creator-studio',
    description: 'Scene readiness · render queue · production approvals.',
  },
  {
    id: 'publishing-concierge',
    name: 'Publishing Concierge',
    role: 'PUBLISHING CONCIERGE',
    departmentLabel: 'PUBLISHING',
    monthlyPayroll: rate,
    unlockedByPackId: 'creator-studio',
    description: 'Schedule optimization · approval gates · publish windows.',
  },
  {
    id: 'distribution-concierge',
    name: 'Distribution Concierge',
    role: 'DISTRIBUTION CONCIERGE',
    departmentLabel: 'DISTRIBUTION',
    monthlyPayroll: rate,
    unlockedByPackId: 'creator-studio',
    description: 'Platform packaging · syndication · delivery timing.',
  },
  {
    id: 'thumbnail-concierge',
    name: 'Thumbnail Concierge',
    role: 'THUMBNAIL CONCIERGE',
    departmentLabel: 'CREATIVE',
    monthlyPayroll: rate,
    unlockedByPackId: 'creator-studio',
    description: 'CTR experiments · thumbnail variants · visual hooks.',
  },
  {
    id: 'audience-concierge',
    name: 'Audience Concierge',
    role: 'AUDIENCE CONCIERGE',
    departmentLabel: 'ANALYTICS',
    monthlyPayroll: rate,
    unlockedByPackId: 'creator-studio',
    description: 'Retention · hook performance · audience signals.',
  },
  {
    id: 'revenue-concierge',
    name: 'Revenue Concierge',
    role: 'REVENUE CONCIERGE',
    departmentLabel: 'FINANCE',
    monthlyPayroll: rate,
    unlockedByPackId: 'beauty-pack',
    description: 'Revenue pacing · margin alerts · offer timing.',
  },
  {
    id: 'finance-concierge',
    name: 'Finance Concierge',
    role: 'FINANCE CONCIERGE',
    departmentLabel: 'FINANCE',
    monthlyPayroll: rate,
    unlockedByPackId: 'accounting',
    description: 'Close readiness · AP/AR · forecast variance.',
  },
  {
    id: 'lead-concierge',
    name: 'Lead Concierge',
    role: 'LEAD CONCIERGE',
    departmentLabel: 'SALES',
    monthlyPayroll: rate,
    unlockedByPackId: 'sales-crm',
    description: 'Speed-to-lead · follow-up sequences · deal risk.',
  },
  {
    id: 'scheduling-concierge',
    name: 'Scheduling Concierge',
    role: 'SCHEDULING CONCIERGE',
    departmentLabel: 'OPERATIONS',
    monthlyPayroll: rate,
    unlockedByPackId: 'contractor-pack',
    description: 'Crew dispatch · route optimization · calendar conflicts.',
  },
  {
    id: 'customer-experience-concierge',
    name: 'Customer Experience Concierge',
    role: 'CUSTOMER EXPERIENCE CONCIERGE',
    departmentLabel: 'CUSTOMER EXPERIENCE',
    monthlyPayroll: rate,
    unlockedByPackId: 'beauty-pack',
    description: 'Support routing · delight moments · escalation.',
  },
  {
    id: 'seo-concierge',
    name: 'SEO Concierge',
    role: 'SEO CONCIERGE',
    departmentLabel: 'MARKETING',
    monthlyPayroll: rate,
    unlockedByPackId: 'marketing-department',
    description: 'Search visibility · content gaps · local presence.',
  },
  {
    id: 'warehouse-concierge',
    name: 'Warehouse Concierge',
    role: 'WAREHOUSE CONCIERGE',
    departmentLabel: 'WAREHOUSE',
    monthlyPayroll: rate,
    unlockedByPackId: 'warehouse',
    description: 'Pick accuracy · SLA risk · stockout prevention.',
  },
];

const catalogById = new Map(DIGITAL_STAFF_CATALOG.map((s) => [s.id, s]));

export function getDigitalStaffDefinition(staffId: string): DigitalStaffDefinition | undefined {
  return catalogById.get(staffId);
}

export function listDigitalStaffCatalog(): DigitalStaffDefinition[] {
  return DIGITAL_STAFF_CATALOG;
}

/** Map industry-architecture concierge ids to monetization staff ids. */
export function resolveStaffIdFromConcierge(conciergeId: string): string | undefined {
  const suffix = conciergeId.replace(/^(cc-|bc-|fc-|cs-|crm-|wh-)/, '');
  const direct = catalogById.get(`${suffix}-concierge`) ?? catalogById.get(suffix);
  if (direct) return direct.id;
  if (conciergeId.includes('production')) return 'production-concierge';
  if (conciergeId.includes('publishing')) return 'publishing-concierge';
  if (conciergeId.includes('research')) return 'research-concierge';
  if (conciergeId.includes('lead')) return 'lead-concierge';
  if (conciergeId.includes('scheduling') || conciergeId.includes('dispatch')) return 'scheduling-concierge';
  if (conciergeId.includes('sales')) return 'lead-concierge';
  if (conciergeId.includes('warehouse')) return 'warehouse-concierge';
  return undefined;
}
