import { asModuleTenantId } from '../workspace/tenant-ids';
import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import { buildBusinessGenomeSeed } from './engine';
import { bootstrapBusinessCompanyGenomeStore } from './business-store';
import { readCompanyGenomeStore } from './store';
import { bootstrapCompanyGenomePlatform } from './bootstrap';

/** Bootstrap living business dependency graph for active workspace. */
export function bootstrapBusinessCompanyGenomePlatform(): void {
  const orgId = asModuleTenantId(getRuntimeActiveWorkspaceId());
  bootstrapBusinessCompanyGenomeStore(buildBusinessGenomeSeed(orgId));
}

/** Bootstrap both genetic and business genome layers. */
export function bootstrapFullCompanyGenomePlatform(): void {
  bootstrapCompanyGenomePlatform();
  bootstrapBusinessCompanyGenomePlatform();
}

export function getCompanyGenomePlatformStats() {
  const genetic = readCompanyGenomeStore();
  return {
    geneticLayers: genetic.geneticLayers.length,
    activeWorkspace: genetic.activeWorkspaceId,
  };
}
