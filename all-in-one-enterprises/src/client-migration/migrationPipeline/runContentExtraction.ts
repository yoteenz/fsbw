import type { MigrationFileInput } from './types';
import type { MigrationPipelineResult } from './types';
import { contentExtractionAdapter } from './contentExtractionAdapter';

/** Shared server + unit-test entry (same adapter as demo browser path). */
export async function runContentExtractionOnInput(
  input: MigrationFileInput,
  context: { organizationId: string; batchId: string },
): Promise<MigrationPipelineResult> {
  return contentExtractionAdapter.processFile(input, context);
}
