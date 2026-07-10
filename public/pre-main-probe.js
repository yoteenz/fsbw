/**
 * Pre-React synchronous storage probe — runs before any application bundle.
 * Records metadata only (no token values). Namespace: studioOsPreMainProbe_v1
 */
(function preMainProbe() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var NS = 'studioOsPreMainProbe_v1';
  var TRACE_NS = 'studioOsPreMainBootTrace_v1';
  var BUILD_KEY = 'fsbw_lastKnownBuildId_v1';
  var route = window.location.pathname || '/';
  var isDiagnostic = route.indexOf('/__studio-os-') === 0;

  function metaBuildId() {
    var el = document.querySelector('meta[name="app-build-id"]');
    return el ? el.getAttribute('content') || 'unknown' : 'unknown';
  }

  function storageInventory(storage) {
    var keys = [];
    try {
      for (var i = 0; i < storage.length; i++) {
        var k = storage.key(i);
        if (!k) continue;
        var bytes = 0;
        try {
          var v = storage.getItem(k);
          bytes = v ? v.length : 0;
        } catch (e) {
          bytes = -1;
        }
        keys.push({ key: k, bytes: bytes });
      }
    } catch (e) {
      return { keys: [], error: String(e) };
    }
    keys.sort(function (a, b) {
      return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    });
    return { keys: keys };
  }

  function studioKeyFilter(keys) {
    return keys.filter(function (item) {
      var k = item.key;
      return (
        k.indexOf('studioOs') === 0 ||
        k.indexOf('studio-os') === 0 ||
        k.indexOf('genesis_') === 0 ||
        k.indexOf('worldCompiler') === 0 ||
        k.indexOf('fsbw_') === 0 ||
        k.indexOf('startup') !== -1
      );
    });
  }

  function cookieNames() {
    try {
      return document.cookie
        .split(';')
        .map(function (p) {
          return p.trim().split('=')[0];
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  var buildId = metaBuildId();
  var previousBuildId = null;
  try {
    previousBuildId = localStorage.getItem(BUILD_KEY);
  } catch (e) {
    /* ignore */
  }

  var buildMismatch =
    previousBuildId && previousBuildId !== 'unknown' && buildId !== 'unknown' && previousBuildId !== buildId;

  var swController = null;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      swController = navigator.serviceWorker.controller.scriptURL || 'active';
    }
  } catch (e) {
    swController = 'error:' + String(e);
  }

  var ls = storageInventory(localStorage);
  var ss = storageInventory(sessionStorage);

  var snapshot = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    route: route,
    buildId: buildId,
    previousBuildId: previousBuildId,
    buildMismatch: buildMismatch,
    diagnosticIsolationActive: isDiagnostic,
    mainBundleStarted: false,
    serviceWorker: {
      controller: swController,
      supported: Boolean(navigator.serviceWorker),
    },
    cookies: cookieNames(),
    localStorage: ls,
    sessionStorage: ss,
    studioOsLocalKeys: studioKeyFilter(ls.keys || []),
    studioOsSessionKeys: studioKeyFilter(ss.keys || []),
    documentReadyState: document.readyState,
  };

  try {
    sessionStorage.setItem(NS, JSON.stringify(snapshot));
  } catch (e) {
    /* quota */
  }

  try {
    var traceRaw = sessionStorage.getItem(TRACE_NS);
    var trace = traceRaw ? JSON.parse(traceRaw) : [];
    if (!Array.isArray(trace)) trace = [];
    trace.push({
      ts: Date.now(),
      event: 'PRE_MAIN_ENTRY',
      route: route,
      buildId: buildId,
      isDiagnostic: isDiagnostic,
    });
    if (trace.length > 200) trace = trace.slice(-200);
    sessionStorage.setItem(TRACE_NS, JSON.stringify(trace));
  } catch (e) {
    /* ignore */
  }

  try {
    if (buildId && buildId !== 'unknown') {
      localStorage.setItem(BUILD_KEY, buildId);
    }
  } catch (e) {
    /* ignore */
  }

  window.__STUDIO_OS_PRE_MAIN_PROBE__ = snapshot;
})();
