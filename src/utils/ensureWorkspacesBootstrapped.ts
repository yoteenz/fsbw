/**
 * Lazy-load workspace registry + Studio OS auth bridge.
 * Admin routes must await this before mounting WorkspaceProvider.
 */
import { registerStudioOsAuthBridge } from '../shared/auth/studioOsAuthBridge';

let bootstrapPromise: Promise<void> | null = null;

export function ensureWorkspacesBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    registerStudioOsAuthBridge();
    bootstrapPromise = import('../workspaces')
      .then(() => undefined)
      .catch((error: unknown) => {
        bootstrapPromise = null;
        throw error;
      });
  }
  return bootstrapPromise;
}
