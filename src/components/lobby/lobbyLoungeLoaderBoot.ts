import {
  resolveSite00LoaderAnimationPreloadUrl,
  resolveSite00LoaderBackgroundFocal,
  resolveSite00LoaderBackgroundUrl,
  resolveSite00LoaderMediaPresentation,
} from '../../site00/components/loader/site00LoaderMedia';
import { preloadSite00LoaderAnimation, preloadSite00LoaderBackground } from '../../site00/components/loader/site00LoaderPreload';
import {
  FS_LOBBY_LOUNGE_LOADER_BOOT_CLASS,
  FS_LOBBY_LOUNGE_LOADER_SHELL_ID,
  isLobbyLoungeImmersiveLoaderPath,
} from './lobbyLoungeLoaderPaths';

function injectPreload(href: string, as: 'image' | 'fetch' | 'video'): void {
  if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (as === 'image') link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
}

function ensureBootShell(): void {
  const existing = document.getElementById(FS_LOBBY_LOUNGE_LOADER_SHELL_ID);
  if (existing) {
    existing.hidden = false;
    return;
  }

  const presentation = resolveSite00LoaderMediaPresentation();
  const bootBg = resolveSite00LoaderBackgroundUrl(presentation);
  const bootFocal = resolveSite00LoaderBackgroundFocal(presentation);

  const shell = document.createElement('div');
  shell.id = FS_LOBBY_LOUNGE_LOADER_SHELL_ID;
  shell.className = 'fs-lobby-lounge-boot-shell';
  shell.setAttribute('aria-hidden', 'true');
  shell.style.setProperty('--fs-lobby-lounge-loader-bg-focal', bootFocal);
  shell.innerHTML = `<div class="fs-lobby-lounge-boot-shell__env" style="background-image:url('${bootBg}');background-position:${bootFocal}"></div>`;
  document.body.appendChild(shell);
}

/** Earliest lobby/lounge bootstrap — paints static bg before React hydrates. */
export function initLobbyLoungeImmersiveLoaderBoot(): void {
  if (typeof window === 'undefined') return;
  if (!isLobbyLoungeImmersiveLoaderPath(window.location.pathname)) return;

  document.documentElement.classList.add(FS_LOBBY_LOUNGE_LOADER_BOOT_CLASS);
  ensureBootShell();

  const presentation = resolveSite00LoaderMediaPresentation();
  const bg = resolveSite00LoaderBackgroundUrl(presentation);
  injectPreload(bg, 'image');
  void preloadSite00LoaderBackground(bg);

  const animationUrl = resolveSite00LoaderAnimationPreloadUrl(presentation);
  if (animationUrl) {
    injectPreload(animationUrl, 'fetch');
    void preloadSite00LoaderAnimation(animationUrl);
  }
}

/** Fade out boot shell after React loader paints static background. */
export function teardownLobbyLoungeImmersiveBootShell(): void {
  if (typeof document === 'undefined') return;

  const shell = document.getElementById(FS_LOBBY_LOUNGE_LOADER_SHELL_ID);
  if (shell) {
    shell.classList.add('fs-lobby-lounge-boot-shell--handoff');
    window.setTimeout(() => {
      shell.remove();
      document.documentElement.classList.remove(FS_LOBBY_LOUNGE_LOADER_BOOT_CLASS);
    }, 220);
    return;
  }

  document.documentElement.classList.remove(FS_LOBBY_LOUNGE_LOADER_BOOT_CLASS);
}
