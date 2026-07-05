import type { InheritanceCategoryId, InheritableGeneticId, InheritanceSourceId } from './types';

export const ORGANIZATIONAL_INHERITANCE_STORAGE_KEY = 'studioOsOrganizationalInheritance_v1';
export const ORGANIZATIONAL_INHERITANCE_VERSION = '1.0.0';
export const ORGANIZATIONAL_INHERITANCE_ID = 'organizational-inheritance';

export const INHERITANCE_PLATFORM_CHAIN = [
  { level: 'studio-os', label: 'STUDIO OS', description: 'Platform foundation — workspaces, DNA layers, intelligence' },
  { level: 'organizational-inheritance', label: 'ORGANIZATIONAL INHERITANCE', description: 'Foundational system — genetics, playbooks, and institutional wisdom transfer' },
  { level: 'new-company', label: 'NEW COMPANY', description: 'Launches with accumulated organizational experience — evolves independently' },
] as const;

export const INHERITABLE_GENETICS: { id: InheritableGeneticId; label: string }[] = [
  { id: 'company-dna', label: 'COMPANY DNA' },
  { id: 'creative-dna', label: 'CREATIVE DNA' },
  { id: 'writing-dna', label: 'WRITING DNA' },
  { id: 'leadership-dna', label: 'LEADERSHIP DNA' },
  { id: 'operational-dna', label: 'OPERATIONAL DNA' },
  { id: 'department-playbooks', label: 'DEPARTMENT PLAYBOOKS' },
  { id: 'approval-workflows', label: 'APPROVAL WORKFLOWS' },
  { id: 'quality-standards', label: 'QUALITY STANDARDS' },
  { id: 'executive-structures', label: 'EXECUTIVE STRUCTURES' },
  { id: 'automation-systems', label: 'AUTOMATION SYSTEMS' },
  { id: 'knowledge-graph', label: 'KNOWLEDGE GRAPH' },
  { id: 'memory-bible', label: 'MEMORY BIBLE' },
  { id: 'studio-intelligence-models', label: 'STUDIO INTELLIGENCE MODELS' },
  { id: 'simulation-history', label: 'SIMULATION HISTORY' },
  { id: 'talent-structures', label: 'TALENT STRUCTURES' },
  { id: 'marketplace-configurations', label: 'MARKETPLACE CONFIGURATIONS' },
];

export const INHERITANCE_CATEGORIES: { id: InheritanceCategoryId; label: string; genetics: InheritableGeneticId[] }[] = [
  { id: 'leadership', label: 'LEADERSHIP', genetics: ['leadership-dna', 'executive-structures', 'approval-workflows'] },
  { id: 'creative', label: 'CREATIVE', genetics: ['creative-dna', 'quality-standards', 'department-playbooks'] },
  { id: 'operations', label: 'OPERATIONS', genetics: ['operational-dna', 'automation-systems', 'approval-workflows'] },
  { id: 'marketing', label: 'MARKETING', genetics: ['company-dna', 'department-playbooks', 'studio-intelligence-models'] },
  { id: 'finance', label: 'FINANCE', genetics: ['approval-workflows', 'simulation-history', 'quality-standards'] },
  { id: 'content', label: 'CONTENT', genetics: ['writing-dna', 'memory-bible', 'department-playbooks'] },
  { id: 'engineering', label: 'ENGINEERING', genetics: ['automation-systems', 'knowledge-graph', 'quality-standards'] },
  { id: 'legal', label: 'LEGAL', genetics: ['approval-workflows', 'quality-standards', 'memory-bible'] },
  { id: 'support', label: 'SUPPORT', genetics: ['department-playbooks', 'talent-structures', 'memory-bible'] },
  { id: 'automation', label: 'AUTOMATION', genetics: ['automation-systems', 'operational-dna', 'simulation-history'] },
  { id: 'knowledge', label: 'KNOWLEDGE', genetics: ['knowledge-graph', 'memory-bible', 'studio-intelligence-models'] },
  { id: 'brand', label: 'BRAND', genetics: ['company-dna', 'creative-dna', 'quality-standards'] },
  { id: 'culture', label: 'CULTURE', genetics: ['company-dna', 'leadership-dna', 'executive-structures'] },
];

export const INHERITANCE_SOURCE_LABELS: Record<InheritanceSourceId, string> = {
  scratch: 'START FROM SCRATCH',
  'frontal-slayer': 'FRONTAL SLAYER',
  ndxbook: 'NDXBOOK',
  vxd: 'VXD',
  'ai-media': 'AI MEDIA PILOT',
  custom: 'CUSTOM INHERITANCE',
  multi: 'MULTIPLE COMPANIES',
};

export const WIZARD_PRESETS: { id: InheritanceSourceId; label: string; description: string }[] = [
  { id: 'scratch', label: 'START FROM SCRATCH', description: 'Minimal genetics — build everything new (still editable)' },
  { id: 'frontal-slayer', label: 'INHERIT FROM FRONTAL SLAYER', description: 'Luxury creative DNA · brand systems · executive structures' },
  { id: 'ndxbook', label: 'INHERIT FROM NDXBOOK', description: 'Newsroom workflows · operational DNA · content production systems' },
  { id: 'ai-media', label: 'INHERIT FROM AI MEDIA PILOT', description: 'Full platform stack · mission control · executive organization' },
  { id: 'vxd', label: 'INHERIT FROM VXD', description: 'Leadership DNA · vision engine · cinematic presentation systems' },
  { id: 'multi', label: 'INHERIT FROM MULTIPLE', description: 'Blend genetics from several organizations intelligently' },
  { id: 'custom', label: 'BUILD CUSTOM INHERITANCE', description: 'Pick exactly what to inherit category by category' },
];
