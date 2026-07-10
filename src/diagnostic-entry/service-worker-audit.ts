/**
 * Service worker and Cache Storage audit for diagnostic isolation.
 */
import type { PreMainProbeSnapshot } from './boot-events';
import { readPreMainProbe } from './boot-events';

export type ServiceWorkerAudit = {
  supported: boolean;
  registrations: number;
  controllerUrls: string[];
  cacheNames: string[];
  staleAssetHints: string[];
  buildMismatch: boolean;
  probe: PreMainProbeSnapshot | null;
};

export async function inspectServiceWorkerAndCaches(): Promise<ServiceWorkerAudit> {
  const probe = readPreMainProbe();
  const audit: ServiceWorkerAudit = {
    supported: Boolean(navigator.serviceWorker),
    registrations: 0,
    controllerUrls: [],
    cacheNames: [],
    staleAssetHints: [],
    buildMismatch: probe?.buildMismatch ?? false,
    probe,
  };

  try {
    if (navigator.serviceWorker) {
      if (navigator.serviceWorker.controller?.scriptURL) {
        audit.controllerUrls.push(navigator.serviceWorker.controller.scriptURL);
      }
      const regs = await navigator.serviceWorker.getRegistrations();
      audit.registrations = regs.length;
      for (const reg of regs) {
        if (reg.active?.scriptURL) audit.controllerUrls.push(reg.active.scriptURL);
        if (reg.waiting?.scriptURL) audit.staleAssetHints.push(`waiting:${reg.waiting.scriptURL}`);
        if (reg.installing?.scriptURL) audit.staleAssetHints.push(`installing:${reg.installing.scriptURL}`);
      }
    }
  } catch {
    /* ignore */
  }

  try {
    if (typeof caches !== 'undefined') {
      audit.cacheNames = await caches.keys();
    }
  } catch {
    /* ignore */
  }

  if (probe?.buildMismatch) {
    audit.staleAssetHints.push(
      `build-id mismatch: stored=${probe.previousBuildId} current=${probe.buildId}`
    );
  }

  return audit;
}

export async function unregisterAllServiceWorkers(): Promise<number> {
  if (!navigator.serviceWorker) return 0;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
  return regs.length;
}

export async function clearObsoleteStudioCaches(): Promise<string[]> {
  if (typeof caches === 'undefined') return [];
  const cleared: string[] = [];
  const names = await caches.keys();
  for (const name of names) {
    const lower = name.toLowerCase();
    if (
      lower.includes('studio') ||
      lower.includes('fsbw') ||
      lower.includes('workbox') ||
      lower.includes('vite') ||
      lower.includes('precache')
    ) {
      await caches.delete(name);
      cleared.push(name);
    }
  }
  return cleared;
}
