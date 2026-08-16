import { lazy, type ComponentType } from 'react';
import { isDynamicImportChunkFailure, reloadForStaleChunks } from './chunkLoadRecovery';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry(importFn: () => Promise<{ default: ComponentType<any> }>, componentName: string) {
  return lazy(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retryImport = async (retries = 3, delay = 800): Promise<{ default: ComponentType<any> }> => {
      for (let i = 0; i < retries; i++) {
        try {
          return await importFn();
        } catch (error: unknown) {
          if (isDynamicImportChunkFailure(error) && i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            continue;
          }
          if (isDynamicImportChunkFailure(error) && reloadForStaleChunks()) {
            return new Promise((_, reject) => {
              setTimeout(() => reject(error instanceof Error ? error : new Error(`Failed to load ${componentName}`)), 3000);
            });
          }
          throw error instanceof Error ? error : new Error(`Failed to load ${componentName}`);
        }
      }
      throw new Error(`Failed to load ${componentName}`);
    };
    return retryImport();
  });
}
