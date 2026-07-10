/**
 * Plain-DOM heartbeat for Shell V2 — independent of legacy diagnostics and React state.
 */

export type ShellV2HeartbeatSnapshot = {
  heartbeat: number;
  rafCount: number;
  timeoutProbe: number;
  lastHeartbeatAt: number;
};

let heartbeat = 0;
let rafCount = 0;
let timeoutProbe = 0;
let lastHeartbeatAt = 0;
let overlayEl: HTMLDivElement | null = null;

function updateOverlay(): void {
  if (!overlayEl) return;
  const hb = overlayEl.querySelector('[data-v2-hb]');
  const raf = overlayEl.querySelector('[data-v2-raf]');
  const to = overlayEl.querySelector('[data-v2-to]');
  if (hb) hb.textContent = String(heartbeat);
  if (raf) raf.textContent = String(rafCount);
  if (to) to.textContent = String(timeoutProbe);
}

export function getShellV2HeartbeatSnapshot(): ShellV2HeartbeatSnapshot {
  return { heartbeat, rafCount, timeoutProbe, lastHeartbeatAt };
}

export function initShellV2Heartbeat(): void {
  if (typeof window === 'undefined' || overlayEl) return;

  overlayEl = document.createElement('div');
  overlayEl.id = 'shell-v2-heartbeat-overlay';
  overlayEl.innerHTML =
    '<div style="color:#7dd3fc;font-weight:700">V2 hb</div>' +
    '<div>hb: <span data-v2-hb>0</span> · raf: <span data-v2-raf>0</span> · to: <span data-v2-to>0</span></div>';
  document.documentElement.appendChild(overlayEl);

  window.setInterval(() => {
    heartbeat += 1;
    lastHeartbeatAt = Date.now();
    updateOverlay();
  }, 250);

  const rafLoop = () => {
    rafCount += 1;
    updateOverlay();
    window.requestAnimationFrame(rafLoop);
  };
  window.requestAnimationFrame(rafLoop);

  const timeoutLoop = () => {
    timeoutProbe += 1;
    updateOverlay();
    window.setTimeout(timeoutLoop, 250);
  };
  window.setTimeout(timeoutLoop, 250);

  (window as unknown as { __SHELL_V2_HB?: () => ShellV2HeartbeatSnapshot }).__SHELL_V2_HB =
    getShellV2HeartbeatSnapshot;
}
