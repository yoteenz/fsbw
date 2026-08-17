/**
 * ASSTS immersive boot gate — must stay in sync with
 * `src/site00/components/loader/site00LoaderSession.ts` (`shouldShowAsstsImmersiveLoader`).
 * Used by index.html inline script and site00-assts-loader-boot.js (pre-React, no modules).
 */
(function site00AsstsBootGate(global) {
  var SESSION_KEY = 'site00-assts-immersive-complete';

  function shouldBootAsstsImmersiveLoader() {
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') return true;
    } catch (e) {
      /* ignore */
    }

    try {
      return sessionStorage.getItem(SESSION_KEY) !== '1';
    } catch (e) {
      return true;
    }
  }

  global.site00ShouldBootAsstsImmersiveLoader = shouldBootAsstsImmersiveLoader;
})(typeof window !== 'undefined' ? window : {});
