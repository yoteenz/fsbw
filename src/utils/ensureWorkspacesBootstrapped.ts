/**
 * Lazy-load workspace registry + Studio OS auth bridge.
 * Admin routes must await this before mounting WorkspaceProvider.
 */
import { registerStudioOsAuthBridge } from '../shared/auth/studioOsAuthBridge';

let bootstrapPromise: Promise<void> | null = null;
let workspacesBootstrapped = false;

export function isWorkspacesBootstrapped(): boolean {
  return workspacesBootstrapped;
}

export function ensureWorkspacesBootstrapped(): Promise<void> {
  if (workspacesBootstrapped) {
    return Promise.resolve();
  }
  if (!bootstrapPromise) {
    registerStudioOsAuthBridge();
    bootstrapPromise = import('../workspaces')
      .then(() => {
        workspacesBootstrapped = true;
      })
      .catch((error: unknown) => {
        bootstrapPromise = null;
        throw error;
      });
  }
  return bootstrapPromise;
}
