/**
 * Business Discovery™ — Studio OS signature onboarding architecture.
 *
 * Not a setup wizard. A premium strategy session that produces the Company's Genome™.
 */

export type BusinessDiscoveryPhaseId =
  | 'founder-discovery'
  | 'company-discovery'
  | 'relationship-discovery'
  | 'knowledge-discovery'
  | 'business-genome'
  | 'headquarters-generation';

export type BusinessDiscoveryQuestion = {
  id: string;
  prompt: string;
  intent: string;
};

export type BusinessDiscoveryPhaseDefinition = {
  id: BusinessDiscoveryPhaseId;
  number: number;
  title: string;
  purpose: string;
  questionsAsked: BusinessDiscoveryQuestion[];
  informationCollected: string[];
  objectsCreated: string[];
  systemsUpdated: string[];
  aiReasoning: string[];
  founderExperience: string;
  visualExperience: string;
  successCriteria: string[];
  orbRole: string;
  founderMoments: string[];
};

export type BusinessGenomeOutput = {
  id: string;
  title: string;
  description: string;
  sourcePhaseIds: BusinessDiscoveryPhaseId[];
  powersSystems: string[];
};

export type HeadquartersGenerationProposal = {
  id: string;
  title: string;
  description: string;
  genomeInputs: string[];
  createdSystems: string[];
};

export type BusinessDiscoveryArchitecture = {
  id: 'business-discovery';
  title: 'Business Discovery™';
  mission: string;
  objective: string;
  phases: BusinessDiscoveryPhaseDefinition[];
  genomeOutputs: BusinessGenomeOutput[];
  headquartersProposals: HeadquartersGenerationProposal[];
  orbPrinciples: string[];
  experiencePrinciples: string[];
};
