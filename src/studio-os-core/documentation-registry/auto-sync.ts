import { invalidateDocumentationCaches } from '../documentation-sync/sync-engine';

/** Invalidate caches and notify consumers — registry profile built separately. */
export function syncAllDocumentationConsumers(): void {
  invalidateDocumentationCaches();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studio-os-documentation-registry-updated'));
    window.dispatchEvent(new CustomEvent('studio-os-documentation-sync-updated'));
  }
}

export function listSyncedConsumerSurfaces(): string[] {
  return [
    'Studio Manual',
    'Getting Started Guide',
    'Interactive Walkthrough',
    'Studio Institute Academy',
    'Help Center',
    'Search Index',
    'Tooltips',
    'FAQ',
    'Developer Docs',
    'Architecture Docs',
    'Command Dock Help',
    'Release Notes',
    'Feature Registry',
    'Version History',
  ];
}
