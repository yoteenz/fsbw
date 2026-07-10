import { getLastDiagnosticCheckpoint } from './checkpoints';

const PLAIN_DOM_ID = 'studio-os-diagnostic-plain-dom';

function bundleVersion(): string {
  try {
    return import.meta.env.VITE_APP_VERSION ?? import.meta.env.MODE ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export function injectDiagnosticPlainDom(mode: 'loading' | 'failed', route: string, error?: unknown): void {
  if (typeof document === 'undefined') return;

  let el = document.getElementById(PLAIN_DOM_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = PLAIN_DOM_ID;
    el.style.cssText =
      'position:fixed;inset:0;z-index:2147483645;background:#0b1020;color:#e2e8f0;font:14px/1.5 system-ui,sans-serif;padding:24px;box-sizing:border-box;overflow:auto;';
    document.body.prepend(el);
  }

  const checkpoint = getLastDiagnosticCheckpoint();
  const title =
    mode === 'loading' ? 'Studio OS Diagnostic Route Loading' : 'Studio OS Diagnostic Route Failed';

  const errBlock =
    mode === 'failed' && error
      ? `<pre style="white-space:pre-wrap;background:#1a0000;color:#fecaca;padding:12px;border-radius:6px;font-size:11px;margin-top:12px">${escapeHtml(formatError(error))}</pre>`
      : '';

  el.innerHTML = `
    <h1 style="margin:0 0 8px;font-size:18px;color:${mode === 'loading' ? '#7dd3fc' : '#f87171'}">${title}</h1>
    <p style="margin:0 0 4px;color:#94a3b8">Route: <code>${escapeHtml(route)}</code></p>
    <p style="margin:0 0 4px;color:#94a3b8">Checkpoint: <code>${escapeHtml(checkpoint)}</code></p>
    <p style="margin:0;color:#64748b;font-size:12px">Bundle: ${escapeHtml(bundleVersion())}</p>
    ${errBlock}
  `;
  el.setAttribute('data-checkpoint', checkpoint);
}

export function clearDiagnosticPlainDom(): void {
  document.getElementById(PLAIN_DOM_ID)?.remove();
}

export function showDiagnosticPlainDomFailed(route: string, error: unknown): void {
  injectDiagnosticPlainDom('failed', route, error);
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack ?? ''}`;
  }
  return String(error);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function getBundleVersionLabel(): string {
  return bundleVersion();
}
