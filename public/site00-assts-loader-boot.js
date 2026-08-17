(function site00AsstsLoaderBoot() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var path = window.location.pathname || '';
  if (path.indexOf('/assts') !== 0) return;

  var shouldBoot =
    typeof window.site00ShouldBootAsstsImmersiveLoader === 'function'
      ? window.site00ShouldBootAsstsImmersiveLoader()
      : true;
  if (!shouldBoot) return;

  var base = '/site00/loader/v1/';
  var bg = base + 'assts-loader-background-v1.png';

  function preload(href, as) {
    if (document.querySelector('link[rel="preload"][href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (as === 'image') link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }

  function ensureBootShell() {
    document.documentElement.classList.add('site00-assts-boot');

    preload(bg, 'image');

    var geometry = base + 'assts-loader-geometry-v1-source.mp4';
    preload(geometry, 'fetch');

    if (document.getElementById('site00-assts-boot-shell')) {
      var existing = document.getElementById('site00-assts-boot-shell');
      if (existing) existing.hidden = false;
      return;
    }

    var shell = document.createElement('div');
    shell.id = 'site00-assts-boot-shell';
    shell.className = 'site00-assts-boot-shell';
    shell.setAttribute('aria-hidden', 'true');
    shell.innerHTML =
      '<div class="site00-assts-boot-shell__env" style="background-image:url(\'' + bg + '\')"></div>';

    var mountTarget = document.body || document.documentElement;
    mountTarget.appendChild(shell);
  }

  if (document.body) {
    ensureBootShell();
    return;
  }

  document.documentElement.classList.add('site00-assts-boot');
  preload(bg, 'image');
  preload(base + 'assts-loader-geometry-v1-source.mp4', 'fetch');

  document.addEventListener('DOMContentLoaded', ensureBootShell, { once: true });
})();
