(function fsLobbyLoungeImmersiveLoaderBoot() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var path = window.location.pathname || '';
  var isLobby =
    typeof window.fsIsLobbyLoungeImmersivePath === 'function'
      ? window.fsIsLobbyLoungeImmersivePath(path)
      : path === '/lobby' || path === '/lobby/lounge' || path === '/lounge';
  if (!isLobby) return;

  var shouldBoot =
    typeof window.fsShouldBootLobbyLoungeImmersiveLoader === 'function'
      ? window.fsShouldBootLobbyLoungeImmersiveLoader()
      : true;
  if (!shouldBoot) return;

  var projectRef = 'hyycomvcaqxxvyrfupes';
  var storageBase =
    'https://' + projectRef + '.supabase.co/storage/v1/object/public/live-preview/site00/';
  var isWide = window.matchMedia('(min-width: 768px)').matches;
  var bg = isWide
    ? storageBase + 'BLDR/4EEB4F70-BF07-4EFE-B324-10C94AE018B5.png'
    : storageBase + 'IMG_0404.png';
  var animation = isWide
    ? storageBase + 'BLDR/openart-output_1787109389654_e04aea07.mp4'
    : storageBase + 'BLDR/openart-output_1787107938282_745c8292.mp4';
  var bgFocal = isWide ? 'center center' : 'center 45%';

  function applyBootEnvStyle(env) {
    if (!env) return;
    env.style.backgroundImage = "url('" + bg + "')";
    env.style.backgroundPosition = bgFocal;
    env.style.setProperty('--fs-lobby-lounge-loader-bg-focal', bgFocal);
  }

  function preload(href, as) {
    if (!href || document.querySelector('link[rel="preload"][href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (as === 'image') link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }

  function ensureBootShell() {
    document.documentElement.classList.add('fs-lobby-lounge-boot');
    preload(bg, 'image');
    preload(animation, 'fetch');

    var shell = document.getElementById('fs-lobby-lounge-boot-shell');
    if (shell) {
      shell.hidden = false;
      var env = shell.querySelector('.fs-lobby-lounge-boot-shell__env');
      applyBootEnvStyle(env);
      return;
    }

    var nextShell = document.createElement('div');
    nextShell.id = 'fs-lobby-lounge-boot-shell';
    nextShell.className = 'fs-lobby-lounge-boot-shell';
    nextShell.setAttribute('aria-hidden', 'true');
    nextShell.style.setProperty('--fs-lobby-lounge-loader-bg-focal', bgFocal);
    nextShell.innerHTML =
      '<div class="fs-lobby-lounge-boot-shell__env" style="background-image:url(\'' +
      bg +
      "');background-position:" +
      bgFocal +
      '"></div>';

    var mountTarget = document.body || document.documentElement;
    mountTarget.appendChild(nextShell);
  }

  if (document.body) {
    ensureBootShell();
    return;
  }

  document.addEventListener('DOMContentLoaded', ensureBootShell, { once: true });
})();
