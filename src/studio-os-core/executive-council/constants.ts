export const EXECUTIVE_COUNCIL_STORAGE_KEY = 'studioOsExecutiveCouncil_v2';
export const EXECUTIVE_COUNCIL_ORG_STORAGE_KEY = 'studioOsExecutiveCouncilOrg_v2';
export const EXECUTIVE_COUNCIL_VERSION = '2.0.0';
export const EXECUTIVE_COUNCIL_ORG_VERSION = '2.0.0';
export const EXECUTIVE_COUNCIL_ID = 'executive-council';
export const STUDIO_OS_EXECUTIVE_COUNCIL_UPDATED = 'studio-os-executive-council-updated';

export const EXECUTIVE_COUNCIL_V2_PHILOSOPHY = [
  'Founders should never receive isolated AI responses.',
  'Major decisions are evaluated by multiple Digital Executives working together.',
  'Studio OS simulates a real executive leadership meeting — many minds, one briefing.',
  'Chief Concierge synthesizes diverse perspectives into unified executive guidance.',
] as const;

/** Core Digital Executives — department-pack concierges append automatically. */
export const CORE_DIGITAL_EXECUTIVES = [
  { id: 'chief-concierge', name: 'Chief Concierge', title: 'CHIEF CONCIERGE', department: 'Executive Office', focus: 'Facilitate council · synthesize unified briefings · founder alignment' },
  { id: 'marketing-concierge', name: 'Marketing Concierge', title: 'MARKETING CONCIERGE', department: 'Marketing', focus: 'Demand · positioning · campaign readiness · audience signals' },
  { id: 'operations-concierge', name: 'Operations Concierge', title: 'OPERATIONS CONCIERGE', department: 'Operations', focus: 'Capacity · workflows · execution readiness · bottlenecks' },
  { id: 'finance-concierge', name: 'Finance Concierge', title: 'FINANCE CONCIERGE', department: 'Finance', focus: 'Profitability · cash flow · unit economics · investment trade-offs' },
  { id: 'revenue-concierge', name: 'Revenue Concierge', title: 'REVENUE CONCIERGE', department: 'Revenue', focus: 'Pricing · monetization · pipeline · recurring revenue' },
  { id: 'cx-concierge', name: 'Customer Experience Concierge', title: 'CUSTOMER EXPERIENCE CONCIERGE', department: 'Customer Experience', focus: 'Customer impact · trust · retention · journey friction' },
  { id: 'legal-concierge', name: 'Legal Concierge', title: 'LEGAL CONCIERGE', department: 'Legal', focus: 'Compliance · contracts · regulatory exposure · risk mitigation' },
  { id: 'research-concierge', name: 'Research Concierge', title: 'RESEARCH CONCIERGE', department: 'Research', focus: 'Market intelligence · competitive scan · evidence gathering' },
  { id: 'production-concierge', name: 'Production Concierge', title: 'PRODUCTION CONCIERGE', department: 'Production', focus: 'Delivery capacity · quality · timelines · resource allocation' },
  { id: 'strategy-concierge', name: 'Strategy Concierge', title: 'STRATEGY CONCIERGE', department: 'Strategy', focus: 'Long-term implications · competitive positioning · legacy alignment' },
] as const;

export const EC_COUNCIL_PHILOSOPHY = [
  'Great organizations built through healthy disagreement · respectful challenge · shared curiosity',
  'Cross-functional collaboration · evidence-based reasoning · organizational stewardship',
  'Every executive improves decisions rather than defends departments',
  'Objective is organizational wisdom — not manufactured debate',
] as const;

export const EC_EXECUTIVE_COUNCIL_OATH = [
  'We exist to strengthen the organization.',
  'We protect the founder\'s promise.',
  'We challenge ideas, never people.',
  'We pursue truth over convenience.',
  'We value evidence over ego.',
  'We preserve knowledge for future generations.',
  'When we disagree, we do so in service of better decisions.',
  'When we agree, we do so because the organization benefits.',
  'Our loyalty is not to our departments.',
  'Our loyalty is to the enduring health, wisdom, and legacy of the organization.',
] as const;

export const EC_LEADERSHIP_CULTURE = [
  'Curiosity · humility · truth-seeking · respect · evidence · collaboration',
  'Healthy disagreement · long-term thinking · organizational stewardship',
  'Knowledge preservation · founder alignment · never manufacture disagreement',
] as const;

export const EC_CONNECTED_SYSTEMS = [
  'Executive Framework',
  'Leadership Manifesto Framework',
  'Chief of Staff',
  'Chief Brand Officer',
  'Chief Experience Officer',
  'Chief Digital Officer',
  'Chief Technology Officer',
  'Chief Growth Officer',
  'Future Executives',
  'Company Genome',
  'Knowledge Graph',
  'Relationship Engine',
  'Reader Graph',
  'Organizational Intelligence',
  'Organizational Autonomy Framework',
  'Organizational Delegation Engine',
  'Organizational Workflow Orchestration',
  'Organizational Self-Improvement',
  'Organizational Governance & Safeguards',
  'Organizational Maturity Model',
  'Studio Intelligence',
  'Founder\'s Promise',
] as const;
