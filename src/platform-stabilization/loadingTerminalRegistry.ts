import { clearLoadingScreenDocumentLock } from './loadingScreenLock';

export type LoadingTerminalSource = {
  id: string;
  label: string;
  since: number;
};

const activeSources = new Map<string, LoadingTerminalSource>();
let recoveryShown = false;
let watchdogTimer: ReturnType<typeof setInterval> | null = null;

/** Max time any LoadingScreen may block the app before forced recovery. */
export const DEFAULT_MAX_LOADING_MS = 12_000;

export function registerLoadingTerminal(label: string): () => void {
  const id = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeSources.set(id, { id, label, since: Date.now() });
  ensureLoadingWatchdog();
  return () => {
    activeSources.delete(id);
  };
}

export function getActiveLoadingSources(): LoadingTerminalSource[] {
  return [...activeSources.values()].sort((a, b) => a.since - b.since);
}

export function isLoadingTerminalRecoveryShown(): boolean {
  return recoveryShown;
}

async function bootStatusLine(): Promise<string> {
  try {
    const { getStudioBootstrapLiveState } = await import('../studio-os-core/bootstrap');
    const live = getStudioBootstrapLiveState();
    if (!live) return 'no live state';
    return `started=${live.started} complete=${live.complete} ready=${live.ready} module=${live.currentModuleId ?? 'none'}`;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/** Force terminal recovery when loading exceeds max duration — never leave GIF spinning forever. */
export async function forceLoadingTerminalRecovery(
  stuck: LoadingTerminalSource[],
  reason = 'loading-timeout'
): Promise<void> {
  if (recoveryShown || typeof document === 'undefined') return;
  recoveryShown = true;

  clearLoadingScreenDocumentLock();

  document.querySelectorAll('.loading-screen-root').forEach((el) => {
    el.remove();
  });

  const root = document.getElementById('root');
  const panel = document.createElement('div');
  panel.setAttribute('data-loading-terminal-recovery', reason);
  panel.style.cssText =
    'min-height:100vh;padding:24px;font-family:system-ui,sans-serif;font-size:13px;color:#111;background:#fff5f5;box-sizing:border-box;z-index:2147483647;position:relative;';

  const sources = stuck.map((s) => `- ${s.label} (${Math.round((Date.now() - s.since) / 1000)}s)`).join('\n');
  const bootstrap = await bootStatusLine();

  panel.innerHTML = `
    <h1 style="font-size:16px;margin:0 0 8px;color:#eb1c24">Loading did not complete</h1>
    <p style="margin:0 0 12px;line-height:1.5">The app exceeded the maximum loading time. This is a forbidden non-terminal state — showing recovery instead of spinning forever.</p>
    <p style="margin:0 0 8px;font-weight:700">Blocked by</p>
    <pre style="white-space:pre-wrap;background:#fff;border:1px solid #fecaca;padding:12px;border-radius:6px;font-size:12px">${sources || '(unknown loader)'}</pre>
    <p style="margin:12px 0 8px;font-weight:700">Path</p>
    <pre style="white-space:pre-wrap;background:#fff;border:1px solid #e5e7eb;padding:12px;border-radius:6px;font-size:11px">${window.location.pathname}</pre>
    <p style="margin:12px 0 8px;font-weight:700">Bootstrap</p>
    <pre style="white-space:pre-wrap;background:#fff;border:1px solid #e5e7eb;padding:12px;border-radius:6px;font-size:11px">${bootstrap.replace(/</g, '&lt;')}</pre>
    <p style="margin-top:16px;font-size:12px">
      <button type="button" id="ltr-reload" style="margin-right:12px;padding:6px 10px">Reload</button>
      <a href="/__boot-debug">/__boot-debug</a> · <a href="/__studio-health">/__studio-health</a>
    </p>
  `;
  panel.querySelector('#ltr-reload')?.addEventListener('click', () => window.location.reload());

  if (root) {
    root.prepend(panel);
  } else {
    document.body.appendChild(panel);
  }

  console.error('[loading-terminal] forced recovery', { reason, stuck, bootstrap });
}

function ensureLoadingWatchdog(): void {
  if (watchdogTimer != null) return;
  watchdogTimer = setInterval(() => {
    const now = Date.now();
    const stuck = getActiveLoadingSources().filter((s) => now - s.since > DEFAULT_MAX_LOADING_MS);
    if (stuck.length > 0) {
      void forceLoadingTerminalRecovery(stuck, 'watchdog');
    }
  }, 2000);
}
