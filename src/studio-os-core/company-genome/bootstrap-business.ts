import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import { ensureBusinessCompanyGenomeSeeded } from './engine';
import { readCompanyGenomeStore } from './store';
import { bootstrapCompanyGenomePlatform } from './bootstrap';

/** Bootstrap living business dependency graph for active workspace. */
export function bootstrapBusinessCompanyGenomePlatform(): void {
  ensureBusinessCompanyGenomeSeeded(getRuntimeActiveWorkspaceId());
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
