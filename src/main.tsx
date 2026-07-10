/**
 * Minimal entry — pre-main probe runs from index.html before this module loads.
 * No flight recorder or application imports here; route split happens in entry-dispatch.
 */
const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

if (!pathname.startsWith('/__studio-os-')) {
  try {
    const raw = sessionStorage.getItem('studioOsPreMainProbe_v1');
    if (raw) {
      const probe = JSON.parse(raw) as { mainBundleStarted?: boolean };
      probe.mainBundleStarted = true;
      sessionStorage.setItem('studioOsPreMainProbe_v1', JSON.stringify(probe));
    }
  } catch {
    /* ignore */
  }
}

void import('./entry-dispatch');
