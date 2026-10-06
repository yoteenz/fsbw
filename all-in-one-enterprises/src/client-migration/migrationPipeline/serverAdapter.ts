import type { MigrationPipelineAdapter, MigrationPipelineResult } from './types';

/** Production path: server-side processing only (no browser → third-party). */
export const serverMigrationPipelineAdapter: MigrationPipelineAdapter = {
  async processFile(input, context): Promise<MigrationPipelineResult> {
    try {
      const res = await fetch('/api/aio/client-migration/process-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context }),
      });
      if (res.status === 503) {
        return {
          stage: 'REVIEW_REQUIRED',
          exception: 'PROVIDER_UNAVAILABLE',
          proposedFacts: [],
        };
      }
      if (!res.ok) {
        return {
          stage: 'REVIEW_REQUIRED',
          exception: 'PROCESSING_FAILED',
          proposedFacts: [],
        };
      }
      return (await res.json()) as MigrationPipelineResult;
    } catch {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'PROCESSING_FAILED',
        proposedFacts: [],
      };
    }
  },
};
