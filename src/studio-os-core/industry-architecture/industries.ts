import type { IndustryDefinition, IndustryId } from './types';

export const INDUSTRY_DEFINITIONS: IndustryDefinition[] = [
  {
    id: 'creator',
    label: 'CREATOR',
    tagline: 'AI Media Operating Center · research through distribution',
    starterPackIds: ['creator-pack'],
    headquartersExample: ['Mission Control', 'Production', 'Publishing', 'Distribution', 'Knowledge', 'Studio Intelligence', 'Analytics'],
    marketingInsightExample: 'Short-form retention peaks when hooks land in the first 3 seconds.',
  },
  {
    id: 'ecommerce',
    label: 'ECOMMERCE',
    tagline: 'Commerce headquarters · orders through customer experience',
    starterPackIds: ['beauty-pack'],
    headquartersExample: ['Mission Control', 'Orders', 'Inventory', 'Marketing', 'Customer Experience', 'Finance'],
    marketingInsightExample: 'Cart recovery campaigns lift revenue 12–18% when sent within 45 minutes.',
  },
  {
    id: 'beauty',
    label: 'BEAUTY',
    tagline: 'Luxury digital headquarters · memberships and rewards',
    starterPackIds: ['beauty-pack'],
    headquartersExample: ['Mission Control', 'Orders', 'Bookings', 'Memberships', 'Marketing', 'Rewards', 'Build-A-Wig'],
    marketingInsightExample: 'Back-to-school installs begin trending in 3 weeks.',
  },
  {
    id: 'contractor',
    label: 'CONTRACTOR',
    tagline: 'Field operations · leads through finance',
    starterPackIds: ['contractor-pack'],
    headquartersExample: ["Mission Control", "Lead Pipeline", "Today's Jobs", 'Crew Scheduling', 'Marketing', 'Revenue'],
    marketingInsightExample: 'Exterior painting demand increased 21% in your service area.',
  },
  {
    id: 'construction',
    label: 'CONSTRUCTION',
    tagline: 'Project operations · crews through compliance',
    starterPackIds: ['contractor-pack'],
    headquartersExample: ['Mission Control', 'Estimates', 'Scheduling', 'Crews', 'Materials', 'Finance'],
    marketingInsightExample: 'Permit season drives 34% more estimate requests in Q2.',
  },
  {
    id: 'painting',
    label: 'PAINTING',
    tagline: 'Painting company HQ · jobs through follow-up',
    starterPackIds: ['contractor-pack'],
    headquartersExample: ["Mission Control", "Lead Pipeline", "Today's Jobs", 'Pending Estimates', 'Crew Scheduling', 'Google Reviews', 'Revenue'],
    marketingInsightExample: 'Exterior painting demand increased 21% in your service area.',
  },
  {
    id: 'landscaping',
    label: 'LANDSCAPING',
    tagline: 'Seasonal field ops · routes through reviews',
    starterPackIds: ['contractor-pack'],
    headquartersExample: ['Mission Control', 'Lead Pipeline', 'Route Scheduling', 'Crews', 'Marketing', 'Reviews'],
    marketingInsightExample: 'Spring cleanup searches spike 40% the first warm weekend.',
  },
  {
    id: 'restaurant',
    label: 'RESTAURANT',
    tagline: 'Kitchen through loyalty · service rhythm HQ',
    starterPackIds: ['restaurant-pack'],
    headquartersExample: ['Mission Control', 'Reservations', 'Kitchen', 'Staff', 'Marketing', 'Loyalty', 'Reviews'],
    marketingInsightExample: 'Lunch traffic historically drops on Wednesdays.',
  },
  {
    id: 'medical',
    label: 'MEDICAL',
    tagline: 'Patient care operations · scheduling through compliance',
    starterPackIds: ['medical-pack'],
    headquartersExample: ['Mission Control', 'Patients', 'Scheduling', 'Billing', 'CRM', 'Compliance'],
    marketingInsightExample: 'Annual wellness visit reminders improve retention 19%.',
  },
  {
    id: 'dental',
    label: 'DENTAL',
    tagline: 'Chair-side operations · recalls through insurance',
    starterPackIds: ['medical-pack'],
    headquartersExample: ['Mission Control', 'Patients', 'Scheduling', 'Insurance', 'Marketing', 'Reviews'],
    marketingInsightExample: 'Hygiene recall campaigns fill 28% more open chair time.',
  },
  {
    id: 'law-firm',
    label: 'LAW FIRM',
    tagline: 'Matters through billing · client trust HQ',
    starterPackIds: ['agency-pack'],
    headquartersExample: ['Mission Control', 'Clients', 'Matters', 'Approvals', 'Billing', 'CRM'],
    marketingInsightExample: 'Referral partners respond fastest on Tuesday mornings.',
  },
  {
    id: 'real-estate',
    label: 'REAL ESTATE',
    tagline: 'Listings through closings · relationship HQ',
    starterPackIds: ['agency-pack'],
    headquartersExample: ['Mission Control', 'Listings', 'Clients', 'Showings', 'Marketing', 'CRM'],
    marketingInsightExample: 'Spring listing photography bookings peak 2 weeks before Easter.',
  },
  {
    id: 'insurance',
    label: 'INSURANCE',
    tagline: 'Policies through renewals · trust HQ',
    starterPackIds: ['agency-pack'],
    headquartersExample: ['Mission Control', 'Policies', 'Clients', 'Renewals', 'Marketing', 'Compliance'],
    marketingInsightExample: 'Renewal outreach 45 days early reduces lapse rate 11%.',
  },
  {
    id: 'financial-services',
    label: 'FINANCIAL SERVICES',
    tagline: 'Advisory through compliance · client HQ',
    starterPackIds: ['agency-pack'],
    headquartersExample: ['Mission Control', 'Clients', 'Portfolios', 'Compliance', 'Marketing', 'Reporting'],
    marketingInsightExample: 'Quarter-end planning sessions drive 22% more booked consults.',
  },
  {
    id: 'nonprofit',
    label: 'NONPROFIT',
    tagline: 'Mission through donors · impact HQ',
    starterPackIds: ['agency-pack'],
    headquartersExample: ['Mission Control', 'Donors', 'Programs', 'Volunteers', 'Marketing', 'Grants'],
    marketingInsightExample: 'Giving Tuesday campaigns outperform email by 3.2× when paired with stories.',
  },
  {
    id: 'fitness',
    label: 'FITNESS',
    tagline: 'Members through retention · class HQ',
    starterPackIds: ['beauty-pack'],
    headquartersExample: ['Mission Control', 'Members', 'Classes', 'Bookings', 'Marketing', 'Rewards'],
    marketingInsightExample: 'January challenge sign-ups convert 31% better with SMS nudges.',
  },
  {
    id: 'hospitality',
    label: 'HOSPITALITY',
    tagline: 'Guests through experience · occupancy HQ',
    starterPackIds: ['restaurant-pack'],
    headquartersExample: ['Mission Control', 'Reservations', 'Housekeeping', 'Staff', 'Marketing', 'Reviews'],
    marketingInsightExample: 'Weekend occupancy lifts 8% when local event packages go live Thursday.',
  },
  {
    id: 'education',
    label: 'EDUCATION',
    tagline: 'Learners through outcomes · curriculum HQ',
    starterPackIds: ['agency-pack'],
    headquartersExample: ['Mission Control', 'Students', 'Courses', 'Scheduling', 'Marketing', 'Reporting'],
    marketingInsightExample: 'Enrollment windows close 40% faster with parent SMS reminders.',
  },
  {
    id: 'agency',
    label: 'AGENCY',
    tagline: 'Client delivery · creative through reporting',
    starterPackIds: ['agency-pack'],
    headquartersExample: ['Mission Control', 'Clients', 'Projects', 'Creative', 'Publishing', 'Invoices'],
    marketingInsightExample: 'Case study posts generate 2× inbound leads vs service ads alone.',
  },
  {
    id: 'manufacturing',
    label: 'MANUFACTURING',
    tagline: 'Production floor through supply chain HQ',
    starterPackIds: ['contractor-pack'],
    headquartersExample: ['Mission Control', 'Production', 'Inventory', 'Quality', 'Scheduling', 'Finance'],
    marketingInsightExample: 'Supplier lead times trending longer — reorder window now 12 days.',
  },
  {
    id: 'automotive',
    label: 'AUTOMOTIVE',
    tagline: 'Service bay through customer follow-up HQ',
    starterPackIds: ['contractor-pack'],
    headquartersExample: ['Mission Control', 'Service Queue', 'Parts', 'Scheduling', 'Marketing', 'Reviews'],
    marketingInsightExample: 'Oil change reminders fill bays 18% faster with seasonal tire bundles.',
  },
];

export function getIndustryDefinition(id: IndustryId): IndustryDefinition | undefined {
  return INDUSTRY_DEFINITIONS.find((i) => i.id === id);
}

export function listIndustryDefinitions(): IndustryDefinition[] {
  return INDUSTRY_DEFINITIONS;
}

export function resolveIndustryForWorkspace(workspaceId: string): IndustryId {
  if (workspaceId === 'ai-media') return 'creator';
  if (workspaceId === 'frontal-slayer') return 'beauty';
  if (workspaceId === 'vxd-inc') return 'agency';
  if (workspaceId === 'all-in-one-enterprise') return 'manufacturing';
  return 'ecommerce';
}
