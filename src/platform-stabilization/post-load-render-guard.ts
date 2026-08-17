import {
  forceLoadingTerminalRecovery,
  getActiveLoadingSources,
} from './loadingTerminalRegistry';
import { clearLoadingScreenDocumentLock } from './loadingScreenLock';

type CapturedError = {
  message: string;
  stack?: string;
  source: string;
};

let lastCaptured: CapturedError | null = null;
let overlayShown = false;

function isAllInOnePath(pathname: string): boolean {
  return (
    pathname === '/all-in-one' ||
    pathname.startsWith('/all-in-one/') ||
    pathname === '/debug/all-in-one' ||
    pathname.startsWith('/debug/all-in-one/')
  );
}

function isAsstsPath(pathname: string): boolean {
  return pathname === '/assts' || pathname.startsWith('/assts/');
}

function dismissOverlayIfPresent(): void {
  if (typeof document === 'undefined') return;
  document.querySelector('[data-post-load-render-guard]')?.remove();
  overlayShown = false;
}

function captureError(source: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err ?? source);
  const stack = err instanceof Error ? err.stack : undefined;
  lastCaptured = { message, stack, source };
  console.error(`[post-load-render-guard] ${source}`, err);
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

function showOverlay(reason: string, details: Record<string, string>): void {
  if (overlayShown || typeof document === 'undefined') return;
  overlayShown = true;
  clearLoadingScreenDocumentLock();

  const root = document.getElementById('root');
  const panel = document.createElement('div');
  panel.setAttribute('data-post-load-render-guard', reason);
  panel.style.cssText =
    'min-height:100vh;padding:24px;font-family:system-ui,sans-serif;font-size:13px;color:#111;background:#fff5f5;box-sizing:border-box;';
  panel.innerHTML = `
    <h1 style="font-size:16px;margin:0 0 8px;color:#eb1c24">Post-load render failure</h1>
    <p style="margin:0 0 8px;font-weight:700">Reason</p>
    <pre style="white-space:pre-wrap;background:#fff;border:1px solid #fecaca;padding:12px;border-radius:6px;font-size:12px">${reason}</pre>
    ${Object.entries(details)
      .map(
        ([k, v]) =>
          `<p style="margin:12px 0 8px;font-weight:700">${k}</p><pre style="white-space:pre-wrap;background:#fff;border:1px solid #e5e7eb;padding:12px;border-radius:6px;font-size:11px;max-height:200px;overflow:auto">${v.replace(/</g, '&lt;')}</pre>`
      )
      .join('')}
    <p style="margin-top:16px;font-size:12px">
      <button type="button" id="plrg-reload" style="margin-right:12px;padding:6px 10px">Reload</button>
      <a href="/__studio-os-recovery" style="margin-right:12px">Clear stale site data</a>
      <a href="/__boot-debug">/__boot-debug</a> · <a href="/__studio-health">/__studio-health</a>
    </p>
  `;
  panel.querySelector('#plrg-reload')?.addEventListener('click', () => window.location.reload());
  if (root && root.childElementCount === 0) {
    root.appendChild(panel);
  } else {
    document.body.appendChild(panel);
  }
}

function rootLooksBlank(): boolean {
  const root = document.getElementById('root');
  if (!root) return true;
  if (document.querySelector('.loading-screen-root')) return false;
  if (document.querySelector('[data-platform-error]')) return false;
  if (document.querySelector('[data-root-app-error]')) return false;
  if (document.querySelector('[data-post-load-render-guard]')) return false;
  if (document.querySelector('[data-route-loading]')) return false;
  if (document.querySelector('.aio-loading')) return false;
  if (document.querySelector('.assts-route-fallback')) return false;
  if (document.querySelector('.site00-assts-shell')) return false;
  if (document.querySelector('.aio-shell, .aio-page, .aio-hero')) return false;
  const text = root.innerText.trim();
  const html = root.innerHTML.trim();
  if (/loading all in one/i.test(text)) return false;
  return html.length < 120 && text.length < 40;
}

async function audit(reason: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const pathname = window.location.pathname;

  if (overlayShown && !rootLooksBlank()) {
    dismissOverlayIfPresent();
    return;
  }

  // Isolated lazy routes (All In One marketing shell) — cold mobile cache can exceed 4–8s.
  if (isAllInOnePath(pathname) && (reason === '4s-post-load' || reason === '8s-post-load' || reason === '12s-post-load')) {
    if (!rootLooksBlank()) return;
    if (document.querySelector('.aio-loading, [data-route-loading="all-in-one"]')) return;
    if (document.querySelector('[data-route-loading="app-shell"]')) return;
    return;
  }

  // ASSTS Asset Vault — lightweight route fallback; lazy chunk + admin gate can exceed 4s on mobile preview.
  if (isAsstsPath(pathname) && (reason === '4s-post-load' || reason === '8s-post-load')) {
    if (!rootLooksBlank()) return;
    if (document.querySelector('.assts-route-fallback, .site00-assts-shell')) return;
    if (document.querySelector('[data-route-loading="app-shell"]')) return;
    return;
  }

  const loadingOverlay = document.querySelector('.loading-screen-root');
  const stuckLoadingAttr =
    document.documentElement.getAttribute('data-loading-screen') === 'true' &&
    !loadingOverlay;

  if (stuckLoadingAttr) {
    clearLoadingScreenDocumentLock();
  }

  if (loadingOverlay) {
    const source = loadingOverlay.getAttribute('data-loading-source') ?? 'unknown LoadingScreen';
    // App shell chunk is large — allow bootstrap + lazy import to finish before forced recovery.
    if (reason === '4s-post-load' || reason === '8s-post-load') {
      if (source === 'App.lazy' || source.includes('application')) {
        return;
      }
      if (document.querySelector('[data-route-loading="app-shell"]')) {
        return;
      }
      // Lobby/lounge intentionally shows a ~3s asset splash after route mount (can start after App boot).
      if (source === 'LobbyApp.initial') {
        return;
      }
      // SITE 00 lazy pages (Origin, ASSTS legacy Site00Suspense, etc.)
      if (source === 'Site00') {
        return;
      }
      try {
        const { getStudioBootstrapLiveState } = await import('../studio-os-core/bootstrap');
        const live = getStudioBootstrapLiveState();
        if (live?.started && !live.complete && live.elapsedMs < 20_000) {
          return;
        }
      } catch {
        /* ignore */
      }
    }

    const stuck = getActiveLoadingSources();
    if (stuck.length > 0) {
      await forceLoadingTerminalRecovery(stuck, `post-load-guard:${reason}`);
      return;
    }
    await forceLoadingTerminalRecovery(
      [{ id: source, label: source, since: Date.now() - 12000 }],
      `post-load-guard:${reason}:orphan-overlay`
    );
    return;
  }

  if (lastCaptured) {
    showOverlay(reason, {
      Error: lastCaptured.message,
      Source: lastCaptured.source,
      Stack: lastCaptured.stack ?? '(no stack)',
      Bootstrap: await bootStatusLine(),
      Path: window.location.pathname,
    });
    return;
  }

  if (rootLooksBlank()) {
    showOverlay('blank-root-after-loading', {
      Bootstrap: await bootStatusLine(),
      Path: window.location.pathname,
      Hint: 'React mounted but #root has no visible content after loading shell cleared.',
    });
  }
}

/** Detect blank screen / async crashes after the loading animation. */
export function registerPostLoadRenderGuard(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    captureError('window.error', event.error ?? event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureError('unhandledrejection', event.reason);
  });

  window.addEventListener('studio-bootstrap-start-failed', (event) => {
    const detail = (event as CustomEvent<{ message?: string }>).detail;
    captureError('studio-bootstrap-start-failed', detail?.message ?? 'bootstrap start failed');
  });

  window.setTimeout(() => void audit('4s-post-load'), 4000);
  window.setTimeout(() => void audit('8s-post-load'), 8000);
  window.setTimeout(() => void audit('12s-post-load'), 12_000);
  window.setTimeout(() => void audit('20s-post-load'), 20_000);
}
