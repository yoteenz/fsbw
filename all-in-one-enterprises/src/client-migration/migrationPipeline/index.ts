export * from './types';
export { fixtureMigrationPipelineAdapter } from './fixtureAdapter';
export { serverMigrationPipelineAdapter } from './serverAdapter';

import type { MigrationPipelineAdapter } from './types';
import { fixtureMigrationPipelineAdapter } from './fixtureAdapter';
import { serverMigrationPipelineAdapter } from './serverAdapter';
import { isDemoMode, isLocalTestMode, isSupabaseMode } from '../../config/dataMode';

let adapter: MigrationPipelineAdapter | null = null;

export function getMigrationPipelineAdapter(): MigrationPipelineAdapter {
  if (adapter) return adapter;
  if (isSupabaseMode()) return serverMigrationPipelineAdapter;
  if (isDemoMode() || isLocalTestMode()) return fixtureMigrationPipelineAdapter;
  return serverMigrationPipelineAdapter;
}

export function setMigrationPipelineAdapter(next: MigrationPipelineAdapter): void {
  adapter = next;
}
