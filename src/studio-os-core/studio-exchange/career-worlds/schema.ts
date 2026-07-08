import type { CareerWorldId } from '../../career-worlds/types';
import type { ProfessionId } from '../../profession-simulation-engine/types';

/** Commerce-facing Career World listing — links to E02 runtime + E01 simulation. */
export type ExchangeCareerWorldListing = {
  careerWorldId: CareerWorldId;
  profession: ProfessionId;
  displayName: string;
  professionBrainRef: string;
  simulationEngineRef: string;
  expansionRegistryIds: string[];
  certificationRegistryIds: string[];
  economyModelId: string;
  industryEventPackIds: string[];
  mentorNetworkId: string;
  licenseProductId: string;
  summary: string;
  districts: string[];
};
