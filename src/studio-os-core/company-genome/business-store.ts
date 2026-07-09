import {
  BUSINESS_COMPANY_GENOME_STORAGE_KEY,
  BUSINESS_COMPANY_GENOME_VERSION,
} from './business-constants';
import type { BusinessCompanyGenomeStore, BusinessVisualizationId } from './business-types';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import { asModuleTenantId } from '../workspace/tenant-ids';
import { computeDependents } from './business-systems/registry';

function emptyStore(): BusinessCompanyGenomeStore {
  const orgId = asModuleTenantId(getRuntimeActiveWorkspaceId());
  return {
    version: BUSINESS_COMPANY_GENOME_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    organizationId: orgId,
    company: {
      companyId: orgId,
      officialName: orgId.toUpperCase().replace(/-/g, ' '),
      industry: '',
      thesis: '',
      engines: ['desire', 'product', 'client', 'revenue', 'operating'],
      growthLoop: '',
    },
    systems: [],
    dependencies: [],
    flows: [],
    events: [],
    risks: [],
    automationOpportunities: [],
    aiOpportunities: [],
    activeVisualization: 'interactive-genome',
    selectedSystemId: null,
  };
}

export function readBusinessCompanyGenomeStore(): BusinessCompanyGenomeStore {
  if (typeof window === 'undefined') return emptyStore();
  const parsed = readScopedStore(BUSINESS_COMPANY_GENOME_STORAGE_KEY, emptyStore);
  return {
    ...parsed,
    systems: computeDependents(parsed.systems),
  };
}

export function writeBusinessCompanyGenomeStore(store: BusinessCompanyGenomeStore): void {
  if (typeof window === 'undefined') return;
  writeScopedStore(BUSINESS_COMPANY_GENOME_STORAGE_KEY, {
    ...store,
    systems: computeDependents(store.systems),
    lastUpdatedAt: new Date().toISOString(),
    version: BUSINESS_COMPANY_GENOME_VERSION,
  });
}

export function bootstrapBusinessCompanyGenomeStore(seed: Partial<BusinessCompanyGenomeStore>): void {
  const existing = readBusinessCompanyGenomeStore();
  if (existing.systems.length > 0) return;
  writeBusinessCompanyGenomeStore({
    ...emptyStore(),
    ...seed,
    systems: computeDependents(seed.systems ?? []),
    dependencies: seed.dependencies ?? [],
  });
}

export function setBusinessVisualization(id: BusinessVisualizationId): void {
  const store = readBusinessCompanyGenomeStore();
  writeBusinessCompanyGenomeStore({ ...store, activeVisualization: id });
}

export function selectBusinessSystem(systemId: string | null): void {
  const store = readBusinessCompanyGenomeStore();
  writeBusinessCompanyGenomeStore({ ...store, selectedSystemId: systemId });
}

export function emitBusinessGenomeUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('studio-os-business-company-genome-updated'));
}
