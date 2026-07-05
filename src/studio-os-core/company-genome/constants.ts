import type { GeneticLayerId, GenomeZoomLevel } from './types';

export const COMPANY_GENOME_STORAGE_KEY = 'studioOsCompanyGenome_v1';
export const COMPANY_GENOME_VERSION = '1.0.0';
export const COMPANY_GENOME_ID = 'company-genome';

export const GENOME_PHILOSOPHY = [
  'Companies are living systems — not static dashboards',
  'Every decision · campaign · relationship · lesson strengthens the genome',
  'The genome continuously evolves · never remains static',
  'Living heartbeat of the organization — watch it grow over decades',
] as const;

export const COMPANY_GENOME_CONNECTED_SYSTEMS = [
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Operational DNA',
  'Knowledge Graph',
  'Reader Graph',
  'Relationship Engine',
  'Chief of Staff',
  'Studio Intelligence',
  'Business Architect',
  'Brand Architect',
  'Experience Architect',
  'Digital Architect',
  'Growth Architect',
  'Organizational Inheritance',
  'Architect Studio',
] as const;

export const ZOOM_LEVELS: { level: GenomeZoomLevel; label: string; description: string }[] = [
  { level: 'portfolio', label: 'PORTFOLIO', description: 'Multi-company holding · shared vs unique genetics' },
  { level: 'company', label: 'COMPANY', description: 'Organizational organism · unified health' },
  { level: 'department', label: 'DEPARTMENT', description: 'Department intelligence · knowledge flow' },
  { level: 'executive', label: 'EXECUTIVE', description: 'Executive alignment · leadership DNA' },
  { level: 'system', label: 'SYSTEM', description: 'Studio OS modules · genetic relationships' },
  { level: 'knowledge-asset', label: 'KNOWLEDGE ASSET', description: 'Institutional memory · compounding IP' },
  { level: 'decision', label: 'DECISION', description: 'Individual decisions · genome mutations' },
];

export const GENETIC_LAYER_IDS: GeneticLayerId[] = [
  'company-dna',
  'creative-dna',
  'writing-dna',
  'leadership-dna',
  'operational-dna',
];
