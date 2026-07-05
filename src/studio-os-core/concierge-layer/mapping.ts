import type { ConciergeId, ConciergeIdentity } from './types';

/** Canonical concierge roster — founder-facing layer over executive organization. */
export const CONCIERGE_ROSTER: readonly ConciergeIdentity[] = [
  {
    id: 'chief-concierge',
    conciergeTitle: 'Chief Concierge',
    representsExecutive: 'Chief of Staff',
    tagline: 'Your primary guide throughout Studio OS · calm · intelligent · warm · deeply invested in your success',
    teaches: ['Daily priorities', 'Organizational navigation', 'Executive introductions', 'Council preparation'],
    behavior: ['Welcome founders', 'Coordinate the organization', 'Prepare briefings', 'Recommend next steps'],
    exampleInteraction: 'Chief Concierge opens your morning with priorities · introduces the concierge team · prepares council synthesis for your review',
  },
  {
    id: 'brand-concierge',
    conciergeTitle: 'Brand Concierge',
    representsExecutive: 'Chief Brand Officer',
    tagline: 'Identity · positioning · storytelling · creative stewardship — explained with clarity and care',
    teaches: ['Identity', 'Positioning', 'Storytelling', 'Creative stewardship'],
    behavior: ['Guide brand decisions', 'Translate creative complexity', 'Explain editorial reasoning'],
    exampleInteraction: 'Founder asks about a campaign headline · Brand Concierge consults CBO · returns recommendation with Writing DNA evidence',
  },
  {
    id: 'experience-concierge',
    conciergeTitle: 'Experience Concierge',
    representsExecutive: 'Chief Experience Officer',
    tagline: 'Hospitality · trust · customer psychology · relationship design',
    teaches: ['Hospitality', 'Trust', 'Customer psychology', 'Relationship design'],
    behavior: ['Guide reader journeys', 'Surface CX opportunities', 'Explain belonging metrics'],
    exampleInteraction: 'Founder asks about onboarding friction · Experience Concierge consults CEO · explains Step 3 trust impact with reader stories',
  },
  {
    id: 'digital-concierge',
    conciergeTitle: 'Digital Concierge',
    representsExecutive: 'Chief Digital Officer',
    tagline: 'Digital presence · publishing · distribution — curated for founder clarity',
    teaches: ['Digital craftsmanship', 'Publishing systems', 'Distribution architecture'],
    behavior: ['Guide digital strategy', 'Coordinate publishing', 'Translate platform complexity'],
    exampleInteraction: 'Founder asks about NDXBOOK distribution timing · Digital Concierge consults CDO · recommends organic-first approach',
  },
  {
    id: 'technology-concierge',
    conciergeTitle: 'Technology Concierge',
    representsExecutive: 'Chief Technology Officer',
    tagline: 'Engineering stewardship · resilient systems · enterprise readiness explained personally',
    teaches: ['Engineering stewardship', 'Resilient systems', 'Technical trade-offs'],
    behavior: ['Guide infrastructure priorities', 'Explain auth refactor rationale', 'Surface technical risks calmly'],
    exampleInteraction: 'Founder asks what to prioritize · Technology Concierge consults CTO · recommends auth refactor with enterprise readiness evidence',
  },
  {
    id: 'growth-concierge',
    conciergeTitle: 'Growth Concierge',
    representsExecutive: 'Chief Growth Officer',
    tagline: 'Sustainable growth · partnerships · market expansion — never vanity metrics',
    teaches: ['Sustainable growth', 'Partnerships', 'Market expansion', 'Community building'],
    behavior: ['Guide GTM timing', 'Explain trust gates', 'Surface relationship opportunities'],
    exampleInteraction: 'Founder asks about scaling spotlight program · Growth Concierge consults CGO · recommends organic expansion with belonging metrics',
  },
  {
    id: 'knowledge-concierge',
    conciergeTitle: 'Knowledge Concierge',
    representsExecutive: 'Organizational Intelligence · Knowledge Graph',
    tagline: 'Institutional wisdom · organizational memory · connected intelligence made accessible',
    teaches: ['Organizational understanding', 'Knowledge connections', 'Institutional memory'],
    behavior: ['Answer organizational questions', 'Surface KG insights', 'Explain OI reasoning'],
    exampleInteraction: 'Founder asks why a decision was made · Knowledge Concierge consults OI · traces reasoning through knowledge graph connections',
  },
  {
    id: 'launch-concierge',
    conciergeTitle: 'Launch Concierge',
    representsExecutive: 'Launch Architecture · Campaign Engine · Strategy Engine',
    tagline: 'Milestones · campaigns · go-to-market planning — personally orchestrated',
    teaches: ['Launch architecture', 'Milestone planning', 'Campaign orchestration', 'GTM sequencing'],
    behavior: ['Guide launch timing', 'Coordinate campaigns', 'Prepare milestone celebrations'],
    exampleInteraction: 'Founder asks about next launch · Launch Concierge consults strategy + campaign engines · returns sequenced plan with maturity gates',
  },
] as const;

const EXECUTIVE_TO_CONCIERGE: Record<string, ConciergeId> = {
  'Chief of Staff': 'chief-concierge',
  'Chief Brand Officer': 'brand-concierge',
  'Chief Experience Officer': 'experience-concierge',
  'Chief Digital Officer': 'digital-concierge',
  'Chief Technology Officer': 'technology-concierge',
  'Chief Growth Officer': 'growth-concierge',
};

export function getConciergeById(id: ConciergeId): ConciergeIdentity {
  const found = CONCIERGE_ROSTER.find((c) => c.id === id);
  if (!found) return CONCIERGE_ROSTER[0];
  return found;
}

export function executiveToConciergeTitle(executive: string): string {
  const id = EXECUTIVE_TO_CONCIERGE[executive];
  if (id) return getConciergeById(id).conciergeTitle;
  if (executive.includes('Organizational Intelligence') || executive.includes('Knowledge')) {
    return getConciergeById('knowledge-concierge').conciergeTitle;
  }
  return executive;
}

export function executiveToConciergeId(executive: string): ConciergeId | null {
  return EXECUTIVE_TO_CONCIERGE[executive] ?? null;
}
