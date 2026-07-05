import type { KnowledgeInterestId, RelationshipStageId } from './types';

export const READER_GRAPH_STORAGE_KEY = 'studioOsReaderGraph_v1';
export const READER_GRAPH_VERSION = '1.0.0';
export const READER_GRAPH_ID = 'reader-graph';

export const READER_GRAPH_PLATFORM_CHAIN = [
  { level: 'studio-os', label: 'STUDIO OS', description: 'Platform · relationships deepen over years · not vanity metrics' },
  { level: 'reader-graph', label: 'READER GRAPH', description: 'Living relationship map · every person evolves over time' },
  { level: 'institutional-memory', label: 'INSTITUTIONAL MEMORY', description: 'Every interaction strengthens understanding of people served' },
] as const;

export const RELATIONSHIP_PHILOSOPHY = [
  'Replace followers · subscribers · customers · contacts',
  'With readers · members · community · partners · advocates',
  'Every relationship matures over time',
  'Optimize for trust · learning · loyalty · advocacy',
] as const;

export const READER_JOURNEY_STAGES: { stage: RelationshipStageId; label: string; description: string }[] = [
  { stage: 'discover', label: 'DISCOVER', description: 'First encounter with knowledge' },
  { stage: 'engage', label: 'ENGAGE', description: 'Active interaction · read · watch' },
  { stage: 'return', label: 'RETURN', description: 'Coming back · habit forming' },
  { stage: 'bookmark', label: 'BOOKMARK', description: 'Saving for later · intent signal' },
  { stage: 'share', label: 'SHARE', description: 'Advocacy beginning · social proof' },
  { stage: 'subscribe', label: 'SUBSCRIBE', description: 'Owned relationship · newsletter · alerts' },
  { stage: 'member', label: 'MEMBER', description: 'Community membership · deeper access' },
  { stage: 'customer', label: 'CUSTOMER', description: 'Commercial relationship · purchase' },
  { stage: 'advocate', label: 'ADVOCATE', description: 'Active promotion · referrals' },
  { stage: 'ambassador', label: 'AMBASSADOR', description: 'Representative · creator pipeline' },
  { stage: 'partner', label: 'PARTNER', description: 'Collaborative relationship' },
  { stage: 'mentor', label: 'MENTOR', description: 'Teaching · guiding others' },
];

export const KNOWLEDGE_INTERESTS: { id: KnowledgeInterestId; label: string }[] = [
  { id: 'entrepreneurship', label: 'ENTREPRENEURSHIP' },
  { id: 'finance', label: 'FINANCE' },
  { id: 'luxury', label: 'LUXURY' },
  { id: 'hair', label: 'HAIR' },
  { id: 'beauty', label: 'BEAUTY' },
  { id: 'psychology', label: 'PSYCHOLOGY' },
  { id: 'health', label: 'HEALTH' },
  { id: 'technology', label: 'TECHNOLOGY' },
  { id: 'ai', label: 'AI' },
  { id: 'marketing', label: 'MARKETING' },
  { id: 'design', label: 'DESIGN' },
  { id: 'relationships', label: 'RELATIONSHIPS' },
  { id: 'wellness', label: 'WELLNESS' },
];

export const READER_GRAPH_CONNECTED_SYSTEMS = [
  'Distribution Engine',
  'Newsroom',
  'Campaign Engine',
  'Strategy Engine',
  'Studio Intelligence',
  'Chief of Staff',
  'Knowledge Graph',
  'Company DNA',
  'Leadership DNA',
  'Creator Marketplace',
  'Community Systems',
  'CRM',
  'Future Commerce',
] as const;

export const GRAPH_ZOOM_LEVELS: { id: 'individual' | 'community' | 'company' | 'portfolio'; label: string }[] = [
  { id: 'individual', label: 'INDIVIDUAL' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'company', label: 'COMPANY' },
  { id: 'portfolio', label: 'PORTFOLIO' },
];
