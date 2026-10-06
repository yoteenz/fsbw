export * from './types';
export { fixtureMigrationPipelineAdapter } from './fixtureAdapter';

import type { MigrationPipelineAdapter } from './types';
import { fixtureMigrationPipelineAdapter } from './fixtureAdapter';

let adapter: MigrationPipelineAdapter = fixtureMigrationPipelineAdapter;

export function getMigrationPipelineAdapter(): MigrationPipelineAdapter {
  return adapter;
}

export function setMigrationPipelineAdapter(next: MigrationPipelineAdapter): void {
  adapter = next;
}
