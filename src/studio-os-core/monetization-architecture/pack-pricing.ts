import type { DepartmentPackPricing } from './types';

/** Permanent purchase prices — departments become permanent wings of Headquarters. */
export const DEPARTMENT_PACK_PRICING: DepartmentPackPricing[] = [
  {
    packId: 'creator-pack',
    layer: 'department-pack',
    permanentPrice: 2499,
    label: 'CREATOR PACK',
    expansionWings: ['PRODUCTION WING', 'PUBLISHING WING', 'MEDIA LIBRARY', 'DISTRIBUTION CENTER', 'RESEARCH LAB'],
  },
  {
    packId: 'beauty-pack',
    layer: 'department-pack',
    permanentPrice: 1999,
    label: 'BEAUTY PACK',
    expansionWings: ['ORDERS', 'BOOKINGS', 'MEMBERSHIPS', 'CRM', 'CUSTOMER EXPERIENCE'],
  },
  {
    packId: 'contractor-pack',
    layer: 'department-pack',
    permanentPrice: 1999,
    label: 'CONTRACTOR PACK',
    expansionWings: ['LEAD PIPELINE', "TODAY'S JOBS", 'CREW SCHEDULING', 'ESTIMATES', 'OPERATIONS'],
  },
  {
    packId: 'restaurant-pack',
    layer: 'department-pack',
    permanentPrice: 1899,
    label: 'RESTAURANT PACK',
    expansionWings: ['MENU ENGINE', 'RESERVATIONS', 'KITCHEN OPS', 'GUEST EXPERIENCE'],
  },
  {
    packId: 'medical-pack',
    layer: 'department-pack',
    permanentPrice: 2199,
    label: 'MEDICAL PACK',
    expansionWings: ['PATIENT INTAKE', 'SCHEDULING', 'COMPLIANCE', 'BILLING'],
  },
  {
    packId: 'agency-pack',
    layer: 'department-pack',
    permanentPrice: 1999,
    label: 'AGENCY PACK',
    expansionWings: ['CLIENT ACCOUNTS', 'CAMPAIGNS', 'CREATIVE OPS', 'DELIVERY'],
  },
  {
    packId: 'marketing-department',
    layer: 'department-pack',
    permanentPrice: 0,
    label: 'MARKETING DEPARTMENT',
    expansionWings: ['MARKETING', 'CAMPAIGNS', 'AUDIENCE INTELLIGENCE'],
  },
  {
    packId: 'creator-studio',
    layer: 'department-pack',
    permanentPrice: 1499,
    label: 'CREATOR STUDIO',
    expansionWings: ['PRODUCTION WING', 'PUBLISHING WING', 'MEDIA LIBRARY', 'DISTRIBUTION CENTER', 'SCREENING ROOM', 'RESEARCH LAB'],
  },
  {
    packId: 'sales-crm',
    layer: 'department-pack',
    permanentPrice: 999,
    label: 'SALES CRM',
    expansionWings: ['SALES PIPELINE', 'OUTREACH SEQUENCES', 'PROPOSALS'],
  },
  {
    packId: 'warehouse',
    layer: 'department-pack',
    permanentPrice: 899,
    label: 'WAREHOUSE',
    expansionWings: ['RECEIVING', 'PICK / PACK', 'INVENTORY CENTER', 'SHIPPING', 'MATERIALS', 'STORAGE'],
  },
  {
    packId: 'accounting',
    layer: 'department-pack',
    permanentPrice: 999,
    label: 'ACCOUNTING',
    expansionWings: ['FINANCE WING', 'PAYROLL', 'FORECASTING', 'REPORTING'],
  },
  {
    packId: 'hiring-suite',
    layer: 'department-pack',
    permanentPrice: 799,
    label: 'HIRING SUITE',
    expansionWings: ['RECRUITING', 'ONBOARDING', 'ROSTER'],
  },
  {
    packId: 'business-intelligence',
    layer: 'department-pack',
    permanentPrice: 899,
    label: 'BUSINESS INTELLIGENCE',
    expansionWings: ['EXECUTIVE ANALYTICS', 'FORECASTING', 'SCORECARDS'],
  },
  {
    packId: 'automation-engine',
    layer: 'department-pack',
    permanentPrice: 799,
    label: 'AUTOMATION ENGINE',
    expansionWings: ['WORKFLOW AUTOMATION', 'CROSS-DEPARTMENT RULES'],
  },
  {
    packId: 'ai-research-lab',
    layer: 'department-pack',
    permanentPrice: 699,
    label: 'AI RESEARCH LAB',
    expansionWings: ['RESEARCH LAB', 'EXPERIMENTATION'],
  },
];

const pricingByPackId = new Map(DEPARTMENT_PACK_PRICING.map((p) => [p.packId, p]));

export function getDepartmentPackPricing(packId: string): DepartmentPackPricing | undefined {
  return pricingByPackId.get(packId);
}

export function formatPermanentPurchasePrice(packId: string): string {
  const pricing = getDepartmentPackPricing(packId);
  if (!pricing) return 'PERMANENT · CONTACT STUDIO';
  if (pricing.permanentPrice === 0) return 'INCLUDED · UNIVERSAL DEPARTMENT';
  return `PERMANENT · $${pricing.permanentPrice.toLocaleString()}`;
}
