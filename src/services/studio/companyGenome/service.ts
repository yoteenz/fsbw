import { studioServiceNotConnected, type StudioServiceResult, type StudioServiceStub } from '../types';
import { consultBusinessCompanyGenome } from '../../../studio-os-core/company-genome/engine';
import { readCompanyGenomeStore } from '../../../studio-os-core/company-genome/store';

export type CompanyGenomeSnapshot = ReturnType<typeof readCompanyGenomeStore>;
export type BusinessCompanyGenomeSnapshot = ReturnType<typeof consultBusinessCompanyGenome>;

export const COMPANY_GENOME_CHAIN = [
  'PHILOSOPHY',
  'BUSINESS SYSTEMS',
  'DEPENDENCIES',
  'FLOWS',
  'EVENTS',
  'RISKS',
  'AUTOMATION',
  'AI OPPORTUNITIES',
] as const;

export const companyGenomeStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CompanyGenomeSnapshot>>;
  getBusinessSnapshot(): Promise<StudioServiceResult<BusinessCompanyGenomeSnapshot>>;
} = {
  id: 'company-genome',
  label: 'COMPANY GENOME',
  phase: 2,
  enabled: true,
  description: 'LIVING BUSINESS GENOME — SYSTEMS · DEPENDENCIES · FLOWS · RISKS · OPPORTUNITIES',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Company Genome requires browser context.');
    }
    return { ok: true, data: readCompanyGenomeStore() };
  },
  async getBusinessSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Company Genome requires browser context.');
    }
    return { ok: true, data: consultBusinessCompanyGenome() };
  },
};
