(function site00AsstsLoaderBoot() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var path = window.location.pathname || '';
  if (path.indexOf('/assts') !== 0) return;
  try {
    if (sessionStorage.getItem('site00-assts-immersive-complete') === '1') return;
  } catch (e) {
    /* ignore */
  }

  document.documentElement.classList.add('site00-assts-boot');

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

  preload(bg, 'image');

  var geometry = base + 'assts-loader-geometry-v1-source.mp4';
  preload(geometry, 'fetch');

  if (!document.getElementById('site00-assts-boot-shell')) {
    var shell = document.createElement('div');
    shell.id = 'site00-assts-boot-shell';
    shell.className = 'site00-assts-boot-shell';
    shell.setAttribute('aria-hidden', 'true');
    shell.innerHTML =
      '<div class="site00-assts-boot-shell__env" style="background-image:url(\'' + bg + '\')"></div>';
    document.body.appendChild(shell);
  }
})();
