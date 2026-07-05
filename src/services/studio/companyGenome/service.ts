import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readCompanyGenomeStore } from '../../../studio-os-core/company-genome/store';

export type CompanyGenomeSnapshot = ReturnType<typeof readCompanyGenomeStore>;

export const COMPANY_GENOME_CHAIN = [
  'PHILOSOPHY',
  'VISUALIZE',
  'LAYERS',
  'EVOLVE',
  'HEALTH',
  'RELATE',
  'SIMULATE',
  'COMPOUND',
] as const;

export const companyGenomeStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CompanyGenomeSnapshot>>;
} = {
  id: 'company-genome',
  label: 'COMPANY GENOME',
  phase: 2,
  enabled: false,
  description: 'LIVING ORGANIZATIONAL GENETICS — HEARTBEAT · EVOLUTION · FINGERPRINT',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Company Genome requires browser context.');
    }
    return { ok: true, data: readCompanyGenomeStore() };
  },
};
