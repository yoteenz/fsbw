const STORAGE_KEY = 'studioOsDiagnosticCheckpoint_v1';

let lastCheckpoint = 'pre:main-entry';

export function getLastDiagnosticCheckpoint(): string {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    } catch {
      /* ignore */
    }
  }
  return lastCheckpoint;
}

/** Record diagnostic entry checkpoint — also mirrors to MTD when available. */
export function markDiagnosticCheckpoint(id: string, detail?: string): void {
  const label = detail ? `${id}:${detail}` : id;
  lastCheckpoint = label;

  try {
    sessionStorage.setItem(STORAGE_KEY, label);
  } catch {
    /* ignore */
  }

  try {
    void import('../platform-stabilization/main-thread-diagnostics').then(({ markStartupCheckpoint }) => {
      markStartupCheckpoint(id, detail ?? 'diagnostic');
    });
  } catch {
    /* ignore */
  }

  const el = document.getElementById('studio-os-diagnostic-plain-dom');
  if (el) {
    el.setAttribute('data-checkpoint', label);
  }
}
