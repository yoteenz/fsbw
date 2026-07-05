export const CHIEF_OF_STAFF_STORAGE_KEY = 'studioOsChiefOfStaff_v1';
export const CHIEF_OF_STAFF_VERSION = '1.0.0';

export const CHIEF_OF_STAFF_ID = 'chief-of-staff';

export const EXECUTIVE_LEADERSHIP_ROSTER = [
  { id: 'chief-marketing-officer', title: 'Chief Marketing Officer', department: 'Marketing' },
  { id: 'chief-operations-officer', title: 'Chief Operations Officer', department: 'Operations' },
  { id: 'chief-creative-officer', title: 'Chief Creative Officer', department: 'Creative' },
  { id: 'chief-financial-officer', title: 'Chief Financial Officer', department: 'Finance' },
  { id: 'chief-legal-officer', title: 'Chief Legal Officer', department: 'Legal' },
  { id: 'chief-growth-officer', title: 'Chief Growth Officer', department: 'Growth' },
  { id: 'chief-product-officer', title: 'Chief Product Officer', department: 'Product' },
  { id: 'chief-technology-officer', title: 'Chief Technology Officer', department: 'Technology' },
  { id: 'chief-content-officer', title: 'Chief Content Officer', department: 'Content' },
] as const;

export const DECISION_LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: 'LEVEL 1 · AUTOMATIC',
  2: 'LEVEL 2 · CHIEF OF STAFF',
  3: 'LEVEL 3 · FOUNDER',
};

export const DELEGATION_LABELS: Record<string, string> = {
  'fully-autonomous': 'FULLY AUTONOMOUS',
  'chief-of-staff-only': 'CHIEF OF STAFF ONLY',
  'soft-approval': 'SOFT APPROVAL',
  'founder-review': 'FOUNDER REVIEW',
  'manual-approval': 'MANUAL APPROVAL',
};

export const SOFT_APPROVAL_SOURCES = [
  'Strategy Engine',
  'Campaign Engine',
  'Work Orchestration',
  'Distribution Engine',
  'Reader Graph',
  'Relationship Engine',
  'Creator Marketplace',
  'Ecosystem Marketplace',
  'Knowledge Asset Engine',
  'Company Maturity Engine',
  'Brand Architect',
  'Experience Architect',
  'Digital Architect',
  'Growth Architect',
  'Company Genome',
  'Architect Studio',
  'Campus Evolution Engine',
  'Founder Walk',
  'Remembrance Garden',
  'Founder\'s Promise',
  'Executive Framework',
  'Leadership Manifesto Framework',
  'Chief Brand Officer',
  'Chief Experience Officer',
  'Chief Digital Officer',
  'Chief Technology Officer',
  'Leadership DNA',
  'Company DNA',
  'Creative DNA',
  'Writing Bible',
  'Memory Bible',
  'Knowledge Graph',
  'Approved Design Systems',
  'Institutional Knowledge',
  'Previous Founder Decisions',
] as const;
