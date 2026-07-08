import type { WorldNodeType } from './types';

const TYPE_PREFIX: Record<WorldNodeType, string> = {
  'knowledge-object': 'W-KNO',
  'conversation-archive': 'W-CONV',
  'knowledge-extraction': 'W-KEX',
  'founder-approval': 'W-APP',
  'architectural-decision': 'W-DEC',
  'design-principle': 'W-DPR',
  'constitutional-law': 'W-LAW',
  'foundational-physics-law': 'W-PHY',
  'implementation-standard': 'W-STD',
  blueprint: 'W-BP',
  'master-scene-blueprint': 'W-MSB',
  'scene-graph': 'W-SG',
  'scene-stack-layer': 'W-SSL',
  company: 'W-CO',
  organization: 'W-ORG',
  founder: 'W-FDR',
  headquarters: 'W-HQ',
  flagship: 'W-FLG',
  district: 'W-DST',
  wing: 'W-WNG',
  room: 'W-RM',
  department: 'W-DPT',
  engine: 'W-ENG',
  'ai-agent': 'W-AI',
  'orb-personality': 'W-ORB',
  'marketplace-product': 'W-MKT',
  'marketplace-transaction': 'W-TXN',
  asset: 'W-AST',
  'asset-pack': 'W-PCK',
  'environment-shell': 'W-ESH',
  'lighting-preset': 'W-LGT',
  'furniture-collection': 'W-FUR',
  material: 'W-MAT',
  camera: 'W-CAM',
  animation: 'W-ANI',
  'innovation-lineage': 'W-INL',
  'innovation-constellation': 'W-INC',
  'innovation-expedition': 'W-EXP',
  collaboration: 'W-COL',
  reputation: 'W-REP',
  'company-genome': 'W-CGN',
  'founder-genome': 'W-FGN',
  'industry-genome': 'W-IGN',
  'historical-event': 'W-EVT',
  'future-simulation': 'W-SIM',
  'golden-build': 'W-GB',
  'warehouse-object': 'W-WH',
  publication: 'W-PUB',
  'implementation-sprint': 'W-SPR',
  milestone: 'W-MS',
  era: 'W-ERA',
};

export function worldNodeId(nodeType: WorldNodeType, slug: string): string {
  const prefix = TYPE_PREFIX[nodeType] ?? 'W-NOD';
  const safe = slug.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').toLowerCase();
  return `${prefix}-${safe}`;
}

export function worldEdgeId(type: string, from: string, to: string): string {
  return `W-EDGE-${type}-${from}-${to}`.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 180);
}

/** Legacy Knowledge Object K-ID maps into World Graph */
export function knowledgeObjectToWorldId(knowledgeSlug: string): string {
  return worldNodeId('knowledge-object', knowledgeSlug);
}
