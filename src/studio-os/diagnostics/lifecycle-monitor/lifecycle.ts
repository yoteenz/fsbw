import { recordFlightEvent } from '../flight-recorder/recorder';
import { incrementReactRenderCount } from '../flight-recorder/context-snapshot';

let remountCount = 0;
let rootChildCount = 0;

/** Passive lifecycle observation — history, errors, DOM churn. No React internals patched. */
export function installLifecycleMonitor(): () => void {
  const cleanups: Array<() => void> = [];

  const recordRoute = (source: string) => {
    recordFlightEvent('ROUTE_CHANGED', source, {
      detail: { pathname: window.location.pathname, href: window.location.href },
    });
  };

  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = (...args: Parameters<History['pushState']>) => {
    const result = origPush(...args);
    recordRoute('history.pushState');
    return result;
  };
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    const result = origReplace(...args);
    recordRoute('history.replaceState');
    return result;
  };
  window.addEventListener('popstate', () => recordRoute('popstate'));
  cleanups.push(() => {
    history.pushState = origPush;
    history.replaceState = origReplace;
  });

  const onError = (ev: ErrorEvent) => {
    recordFlightEvent('ERROR_BOUNDARY', 'window.error', {
      detail: { message: ev.message, filename: ev.filename, lineno: ev.lineno },
    });
  };
  const onRejection = (ev: PromiseRejectionEvent) => {
    recordFlightEvent('ERROR_BOUNDARY', 'unhandledrejection', {
      detail: { reason: String(ev.reason) },
    });
  };
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  cleanups.push(() => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  });

  try {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration < 50) continue;
        recordFlightEvent('LONG_TASK', 'PerformanceObserver', {
          detail: { durationMs: entry.duration, name: entry.name },
        });
      }
    });
    obs.observe({ entryTypes: ['longtask'] });
    cleanups.push(() => obs.disconnect());
  } catch {
    /* unsupported */
  }

  const root = document.getElementById('root');
  if (root) {
    const mo = new MutationObserver(() => {
      const count = root.childElementCount;
      if (count !== rootChildCount) {
        if (rootChildCount > 0 && count > 0) {
          remountCount += 1;
          recordFlightEvent('COMPONENT_REMOUNT', 'MutationObserver:root', {
            detail: { prevChildren: rootChildCount, nextChildren: count, remountCount },
          });
        }
        rootChildCount = count;
      }
    });
    mo.observe(root, { childList: true, subtree: false });
    rootChildCount = root.childElementCount;
    cleanups.push(() => mo.disconnect());
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}

export function getRemountCount(): number {
  return remountCount;
}

/** Optional hook for components that opt in to lifecycle recording. */
export function recordComponentMount(name: string, detail?: Record<string, unknown>): void {
  incrementReactRenderCount();
  recordFlightEvent('COMPONENT_MOUNT', name, { detail });
}

export function recordComponentUnmount(name: string): void {
  recordFlightEvent('COMPONENT_UNMOUNT', name);
}

export function recordProviderRender(name: string): void {
  incrementReactRenderCount();
  recordFlightEvent('PROVIDER_RENDER', name);
}
