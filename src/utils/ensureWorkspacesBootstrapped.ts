/**
 * Lazy-load `src/workspaces/index.ts` so public routes never pay Studio OS bootstrap cost.
 * Admin routes must await this before mounting WorkspaceProvider.
 */
let bootstrapPromise: Promise<void> | null = null;

export function ensureWorkspacesBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = import('../workspaces')
      .then(() => undefined)
      .catch((error: unknown) => {
        bootstrapPromise = null;
        throw error;
      });
  }
  return bootstrapPromise;
}
