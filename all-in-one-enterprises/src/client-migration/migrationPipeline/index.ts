export * from './types';
export { fixtureMigrationPipelineAdapter } from './fixtureAdapter';
export { serverMigrationPipelineAdapter } from './serverAdapter';
export { contentExtractionAdapter } from './contentExtractionAdapter';

import type { MigrationPipelineAdapter } from './types';
import { fixtureMigrationPipelineAdapter } from './fixtureAdapter';
import { serverMigrationPipelineAdapter } from './serverAdapter';
import { contentExtractionAdapter } from './contentExtractionAdapter';
import { isDemoMode, isLocalTestMode, isSupabaseMode } from '../../config/dataMode';

let adapter: MigrationPipelineAdapter | null = null;

function useFixturePipeline(): boolean {
  const flag = typeof import.meta !== 'undefined' ? import.meta.env.VITE_AIO_MIGRATION_FIXTURE : undefined;
  return flag === '1' || flag === 'true';
}

export function getMigrationPipelineAdapter(): MigrationPipelineAdapter {
  if (adapter) return adapter;
  if (useFixturePipeline()) return fixtureMigrationPipelineAdapter;
  if (isSupabaseMode()) return serverMigrationPipelineAdapter;
  if (isDemoMode() || isLocalTestMode()) return contentExtractionAdapter;
  return serverMigrationPipelineAdapter;
}

export function setMigrationPipelineAdapter(next: MigrationPipelineAdapter): void {
  adapter = next;
}
