import { lazy, type ComponentType } from 'react';
import { isDynamicImportChunkFailure, reloadForStaleChunks } from './chunkLoadRecovery';

/** Lazy route imports with retries for chunk/network failures (common after deploys or on mobile). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry(importFn: () => Promise<{ default: ComponentType<any> }>, componentName: string) {
  return lazy(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retryImport = async (retries = 4, delay = 1000): Promise<{ default: ComponentType<any> }> => {
      for (let i = 0; i < retries; i++) {
        try {
          return await importFn();
        } catch (error: unknown) {
          const chunkFail = isDynamicImportChunkFailure(error);

          if (chunkFail && i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            if (typeof window !== 'undefined' && 'caches' in window) {
              try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((name) => caches.delete(name)));
              } catch {
                // ignore
              }
            }
            continue;
          }
          if (chunkFail) {
            if (reloadForStaleChunks()) {
              return new Promise(() => {
                /* page reload in progress */
              });
            }
            throw error instanceof Error ? error : new Error(`Failed to load ${componentName}`);
          }
          throw error instanceof Error ? error : new Error(`Failed to load ${componentName}`);
        }
      }
      throw new Error(`Failed to load ${componentName} after ${retries} attempts`);
    };
    return retryImport();
  });
}
