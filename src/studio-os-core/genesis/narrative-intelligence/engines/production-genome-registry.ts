import type { XniDemoBrandId } from '../constants';
import type { XniProductionGenome } from '../types';
import { readNarrativeIntelligenceStore } from '../persistence';
import { SEED_PRODUCTION_GENOMES } from '../bootstrap/seed-data';

export function listProductionGenomes(): XniProductionGenome[] {
  return readNarrativeIntelligenceStore().productionGenomeRegistry;
}

export function getProductionGenomeByBrand(brandId: string): XniProductionGenome | undefined {
  return listProductionGenomes().find((g) => g.brandId === brandId);
}

export function getProductionGenomeForBrand(brandId: XniDemoBrandId): XniProductionGenome {
  return getProductionGenomeByBrand(brandId) ?? SEED_PRODUCTION_GENOMES[0];
}

export function ensureProductionGenomeForBrand(brandId: XniDemoBrandId): XniProductionGenome {
  const existing = getProductionGenomeByBrand(brandId);
  if (existing) return existing;
  const fallback = SEED_PRODUCTION_GENOMES.find((g) => g.brandId === brandId);
  return fallback ?? SEED_PRODUCTION_GENOMES[0];
}
