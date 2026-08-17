import { shouldShowAsstsImmersiveLoader } from './site00LoaderSession';
import {
  site00LoaderBackgroundUrl,
  site00LoaderGeometryApngUrl,
  site00LoaderGeometryWebmUrl,
  site00LoaderPrefersApngGeometry,
} from './site00LoaderMedia';
import { preloadSite00LoaderBackground, preloadSite00LoaderAnimation } from './site00LoaderPreload';

const BOOT_CLASS = 'site00-assts-boot';
const SHELL_ID = 'site00-assts-boot-shell';

function injectPreload(href: string, as: 'image' | 'fetch' | 'video'): void {
  if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (as === 'image') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
}

function ensureBootShell(): void {
  if (document.getElementById(SHELL_ID)) return;
  const shell = document.createElement('div');
  shell.id = SHELL_ID;
  shell.className = 'site00-assts-boot-shell';
  shell.setAttribute('aria-hidden', 'true');
  shell.innerHTML = `<div class="site00-assts-boot-shell__env" style="background-image:url('${site00LoaderBackgroundUrl()}')"></div>`;
  document.body.appendChild(shell);
}

/** Earliest possible ASSTS loader bootstrap — before React suspense. */
export function initSite00AsstsLoaderBoot(): void {
  if (typeof window === 'undefined') return;
  if (!window.location.pathname.startsWith('/assts')) return;
  if (!shouldShowAsstsImmersiveLoader()) return;

  document.documentElement.classList.add(BOOT_CLASS);
  ensureBootShell();

  const bg = site00LoaderBackgroundUrl();
  injectPreload(bg, 'image');
  void preloadSite00LoaderBackground(bg);

  const geometryUrl = site00LoaderPrefersApngGeometry()
    ? site00LoaderGeometryApngUrl()
    : site00LoaderGeometryWebmUrl();
  injectPreload(geometryUrl, 'fetch');
  void preloadSite00LoaderAnimation(geometryUrl);
}

export function teardownSite00AsstsBootShell(): void {
  document.documentElement.classList.remove(BOOT_CLASS);
  document.getElementById(SHELL_ID)?.remove();
}
