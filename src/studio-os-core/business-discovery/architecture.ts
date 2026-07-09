import { BUSINESS_DISCOVERY_PHASES } from './phases';
import { BUSINESS_GENOME_OUTPUTS, HEADQUARTERS_GENERATION_PROPOSALS } from './outputs';
import type { BusinessDiscoveryArchitecture } from './types';

export const BUSINESS_DISCOVERY_ARCHITECTURE: BusinessDiscoveryArchitecture = {
  id: 'business-discovery',
  title: 'Business Discovery™',
  mission:
    'Replace SaaS onboarding with a premium strategy session where founders discover, map, and understand their company.',
  objective:
    'The founder finishes understanding the business better than when they started, and the final output becomes the Company Genome™ that powers Studio OS.',
  phases: BUSINESS_DISCOVERY_PHASES,
  genomeOutputs: BUSINESS_GENOME_OUTPUTS,
  headquartersProposals: HEADQUARTERS_GENERATION_PROPOSALS,
  orbPrinciples: [
    'The Orb is a strategist, consultant, mentor, and business architect — not a chatbot.',
    'The Orb asks with intent, summarizes with precision, and explains why each question matters.',
    'The Orb never makes founders feel like they are configuring software.',
    'The Orb surfaces insights as discoveries, not judgments.',
    'The Orb uses memorable milestone language only when the business truly advances.',
  ],
  experiencePrinciples: [
    'Every phase must feel like a premium consulting session.',
    'Every answer becomes Company Genome™ material.',
    'Visuals should show the business taking shape in real time.',
    'Discovery should produce clarity before it produces configuration.',
    'The final Headquarters proposal must feel earned by evidence, not templated.',
  ],
};

export function getBusinessDiscoveryArchitecture(): BusinessDiscoveryArchitecture {
  return BUSINESS_DISCOVERY_ARCHITECTURE;
}
