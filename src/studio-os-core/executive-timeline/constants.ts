/** Executive Timeline V1.0 — temporal intelligence layer for Studio OS (Milestone 81). */

export const EXECUTIVE_TIMELINE_STORAGE_KEY = 'studioOsExecutiveTimeline_v1';
export const EXECUTIVE_TIMELINE_VERSION = '1.0.0';
export const EXECUTIVE_TIMELINE_ID = 'executive-timeline';

export const TIMELINE_PHILOSOPHY = [
  'Don\'t manage your calendar. Lead your organization. We\'ll manage the time.',
  'Never feel like a calendar — feel like the organization\'s executive planner.',
  'Founders spend less time managing dates and more time making decisions.',
] as const;

export const TIMELINE_LAYERS = [
  { id: 'personal', label: 'PERSONAL', accent: '#EB1C24' },
  { id: 'organization', label: 'ORGANIZATION', accent: '#6366F1' },
  { id: 'projects', label: 'PROJECTS', accent: '#0891B2' },
  { id: 'content', label: 'CONTENT', accent: '#7C3AED' },
  { id: 'marketing', label: 'MARKETING', accent: '#059669' },
  { id: 'product-development', label: 'PRODUCT DEVELOPMENT', accent: '#2563EB' },
  { id: 'executive-meetings', label: 'EXECUTIVE MEETINGS', accent: '#92704A' },
  { id: 'travel', label: 'TRAVEL', accent: '#0D9488' },
  { id: 'health', label: 'HEALTH', accent: '#16A34A' },
  { id: 'learning', label: 'LEARNING', accent: '#CA8A04' },
  { id: 'finance', label: 'FINANCE', accent: '#64748B' },
  { id: 'hiring', label: 'HIRING', accent: '#9333EA' },
  { id: 'client-meetings', label: 'CLIENT MEETINGS', accent: '#DB2777' },
  { id: 'photoshoots', label: 'PHOTOSHOOTS', accent: '#EA580C' },
  { id: 'launches', label: 'LAUNCHES', accent: '#DC2626' },
  { id: 'campaigns', label: 'CAMPAIGNS', accent: '#4F46E5' },
  { id: 'future-vision', label: 'FUTURE VISION', accent: '#A855F7' },
] as const;

export const TIMELINE_VIEWS = [
  { id: 'agenda', label: 'AGENDA' },
  { id: 'day', label: 'DAY' },
  { id: 'week', label: 'WEEK' },
  { id: 'month', label: 'MONTH' },
  { id: 'quarter', label: 'QUARTER' },
  { id: 'year', label: 'YEAR' },
  { id: 'roadmap', label: 'ROADMAP' },
  { id: 'milestones', label: 'MILESTONES' },
  { id: 'organization', label: 'ORGANIZATION' },
  { id: 'portfolio', label: 'PORTFOLIO' },
  { id: 'executive', label: 'EXECUTIVE' },
  { id: 'campaign', label: 'CAMPAIGN' },
  { id: 'founder', label: 'FOUNDER' },
] as const;

export const TIMELINE_ORGANIZATIONS = [
  { id: 'frontal-slayer', label: 'FRONTAL SLAYER' },
  { id: 'ndxbook', label: 'NDXBOOK' },
  { id: 'vxd-inc', label: 'VXD INC' },
  { id: 'all-in-one-enterprise', label: 'ALL IN ONE ENTERPRISE' },
  { id: 'portfolio', label: 'PORTFOLIO TIMELINE' },
] as const;

export const TIMELINE_CONNECTED_SYSTEMS = [
  'Mission Control',
  'Workspace Registry',
  'Production Studio',
  'Render Queue',
  'Screening Room',
  'Publishing',
  'Campaign Engine',
  'Organization Intelligence',
  'Relationship Engine',
  'Knowledge Graph',
  'Executive Council',
  'Studio Institute',
  'Chief Concierge',
  'PSA',
  'Concierge Team',
  'Chief of Staff',
  'Work Orchestration',
] as const;

export const CONCIERGE_COMMAND_EXAMPLES = [
  { concierge: 'PSA', command: 'Move tomorrow\'s designer meeting to Thursday.' },
  { concierge: 'Brand Concierge', command: 'Push the Noir campaign back one week.' },
  { concierge: 'Growth Concierge', command: 'Prepare a Black Friday timeline.' },
  { concierge: 'Chief Concierge', command: 'Clear my afternoon for strategy work.' },
  { concierge: 'Experience Concierge', command: 'Schedule customer interviews next month.' },
] as const;

export const CONVERSATIONAL_EXAMPLES = [
  'Move everything after lunch.',
  'Give me a free afternoon.',
  'Find time for a photoshoot next month.',
  'Schedule a strategy day.',
  'Delay the launch until after packaging arrives.',
  'Block every Friday morning for deep work.',
] as const;
