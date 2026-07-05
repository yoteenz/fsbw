/** Company Genome V1.0 — living organizational genetics (Milestone 57). */

export type CompanyGenomeWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type GenomeZoomLevel =
  | 'portfolio'
  | 'company'
  | 'department'
  | 'executive'
  | 'system'
  | 'knowledge-asset'
  | 'decision';

export type GeneticLayerId =
  | 'company-dna'
  | 'creative-dna'
  | 'writing-dna'
  | 'leadership-dna'
  | 'operational-dna';

export type GeneticLayer = {
  id: GeneticLayerId;
  label: string;
  healthPct: number;
  maturityPct: number;
  confidencePct: number;
  growthPct: number;
  inheritance: string;
  organizationalImpact: string;
};

export type GeneticRelationship = {
  id: string;
  fromSystem: string;
  toSystem: string;
  influence: string;
  strengthPct: number;
};

export type EvolutionEvent = {
  id: string;
  date: string;
  category: string;
  label: string;
  impact: string;
};

export type OrganizationalHealthDimension = {
  id: string;
  dimension: string;
  scorePct: number;
};

export type GenomeIntelligenceAlert = {
  id: string;
  category: string;
  signal: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type ResilienceMetric = {
  id: string;
  metric: string;
  scorePct: number;
  trend: 'rising' | 'stable' | 'declining';
};

export type OrganizationalFingerprint = {
  uniquenessScore: number;
  competitiveDifferentiation: string[];
  geneticStrengths: string[];
  rareCapabilities: string[];
  institutionalAdvantages: string[];
};

export type GenomeSimulation = {
  id: string;
  scenario: string;
  genomeImpact: string;
  healthDeltaPct: number;
  resilienceDeltaPct: number;
  confidencePct: number;
  recommendations: string[];
};

export type CrossCompanyGenetic = {
  id: string;
  company: string;
  sharedGenetics: string[];
  uniqueGenetics: string[];
  overlapPct: number;
};

export type KnowledgeFlowNode = {
  id: string;
  from: string;
  to: string;
  flowType: string;
  strengthPct: number;
};

export type CompanyGenomeDashboard = {
  summary: string;
  unifiedHealthPct: number;
  resiliencePct: number;
  maturityPct: number;
  innovationPct: number;
  growthPct: number;
  activeZoomLevel: GenomeZoomLevel;
};

export type CompanyGenomeStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: CompanyGenomeWorkspaceId;
  companyName: string;
  dashboard: CompanyGenomeDashboard;
  genomePhilosophy: string[];
  geneticLayers: GeneticLayer[];
  geneticRelationships: GeneticRelationship[];
  evolutionTimeline: EvolutionEvent[];
  healthDimensions: OrganizationalHealthDimension[];
  intelligenceAlerts: GenomeIntelligenceAlert[];
  resilienceMetrics: ResilienceMetric[];
  fingerprint: OrganizationalFingerprint;
  simulations: GenomeSimulation[];
  crossCompanyGenetics: CrossCompanyGenetic[];
  knowledgeFlow: KnowledgeFlowNode[];
  zoomLevels: { level: GenomeZoomLevel; label: string; description: string }[];
  futureOpportunities: string[];
};
