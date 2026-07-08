/** Company Genome™ snapshot for prompt compilation — reads existing store. */

import { readCompanyGenomeStore } from '../company-genome/store';

export type CompanyGenomeSnapshot = {
  companyName: string;
  materialLanguage: string;
  editorialDirection: string;
  lightingStyle: string;
  photographyDirection: string;
  brandDNA: string;
  voice: string;
  values: string;
};

export function resolveCompanyGenomeSnapshot(_workspaceId?: string): CompanyGenomeSnapshot {
  const store = readCompanyGenomeStore();
  const companyName = store.companyName || 'Studio Organization';
  const creative = store.geneticLayers?.find((l) => l.id === 'creative-dna');
  const company = store.geneticLayers?.find((l) => l.id === 'company-dna');
  const writing = store.geneticLayers?.find((l) => l.id === 'writing-dna');

  return {
    companyName,
    materialLanguage: creative?.inheritance?.split('·')[0]?.trim() || 'Premium editorial materials · gallery plaster · stone · brass',
    editorialDirection: creative?.organizationalImpact || 'Editorial luxury · restrained composition · ceremony weight',
    lightingStyle: 'Warm editorial three-point · calm immersive register',
    photographyDirection: creative?.inheritance || 'Photography Bible · stat-forward editorial',
    brandDNA: company?.inheritance || 'Mission-driven · trust-before-scale',
    voice: writing?.inheritance || 'Futura register · Covered By Your Grace accents',
    values: company?.inheritance || 'Authority · relationship · compound knowledge',
  };
}
