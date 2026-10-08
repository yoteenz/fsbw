/**
 * AIO client migration — flow prototype (runs inside the review artifact's frame).
 *
 * The real migration screens (MigrationStudioPage, OfficeActivationPage, ClientOfficeReviewPage) on the demo store, in a
 * memory router. The navigator page around it (scripts/migration/flow-prototype-template.html) boots this document with a
 * route and an optional demo scenario, and listens for route changes to draw the flow. Nothing here changes product code:
 *   · storage: if the frame refuses localStorage, an in-memory store stands in (state then lasts for this document only);
 *   · email: the activation-invite request is answered locally and the email is handed to the navigator's outbox;
 *   · assets: public /migration/* paths resolve to the data URIs packed into the page (window.__AIO_ASSETS);
 *   · exits: any route outside client migration shows where it leads instead of a blank page.
 */
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SEED } from '../../scripts/migration/migration-screens.mjs';
import { loadDemoStore, saveDemoStore } from '../demo/demoStore';
import { MigrationStudioPage } from '../client-migration/visual/MigrationStudioPage';
import { ClientOfficeReviewPage } from '../pages/activation/ClientOfficeReviewPage';
import { OfficeActivationPage } from '../pages/activation/OfficeActivationPage';
import '../styles/aio.css';
import '../styles/aio-auth.css';
import '../styles/aio-uppercase.css';

type Boot = { path: string; scenario?: string | null };
type ProtoWindow = Window & { __AIO_PROTO?: Boot; __AIO_ASSETS?: Record<string, string> };
const w = window as ProtoWindow;

function post(message: Record<string, unknown>) {
  try {
    window.parent?.postMessage({ source: 'aio-migration-prototype', ...message }, '*');
  } catch {
    /* no navigator around this frame */
  }
}

/* storage: keep the demo store working when the viewer blocks site data */
(function ensureStorage() {
  try {
    const probe = '__aio_probe';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
  } catch {
    const data = new Map<string, string>();
    const memory: Storage = {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (k) => (data.has(k) ? data.get(k)! : null),
      key: (i) => [...data.keys()][i] ?? null,
      removeItem: (k) => void data.delete(k),
      setItem: (k, v) => void data.set(k, String(v)),
    };
    Object.defineProperty(window, 'localStorage', { value: memory, configurable: true });
    post({ type: 'storage', persistent: false });
  }
})();

/* assets: /migration/* → packed data URIs; the icon sheet is inlined, so its <use> refs become #id */
(function mapAssets() {
  const assets = w.__AIO_ASSETS ?? {};
  const map = (value: string) => {
    if (value.startsWith('/migration/icons/aio-icon-sheet.svg#')) return value.slice(value.indexOf('#'));
    if (!value.includes('/migration/')) return value;
    return value.replace(/\/migration\/[A-Za-z0-9_\-./]+/g, (path) => assets[path] ?? path);
  };
  const setAttribute = Element.prototype.setAttribute;
  const urlAttributes = new Set(['src', 'srcset', 'href', 'xlink:href']);
  Element.prototype.setAttribute = function patched(name: string, value: string) {
    // React writes <source srcSet> under its camelCase name
    if (urlAttributes.has(name.toLowerCase()) && typeof value === 'string') value = map(value);
    return setAttribute.call(this, name, value);
  };
  // React re-assigns img.src as a property when the image mounts
  for (const [proto, prop] of [
    [HTMLImageElement.prototype, 'src'],
    [HTMLImageElement.prototype, 'srcset'],
    [HTMLSourceElement.prototype, 'src'],
    [HTMLSourceElement.prototype, 'srcset'],
  ] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
    if (!descriptor?.set) continue;
    Object.defineProperty(proto, prop, {
      ...descriptor,
      set(value: unknown) {
        descriptor.set!.call(this, typeof value === 'string' ? map(value) : value);
      },
    });
  }
})();

/* history: a srcdoc document resolves "#step" against the navigator's address, which it may not take; keep the fragment only */
(function srcdocHistory() {
  if (!window.location.href.startsWith('about:srcdoc')) return;
  for (const method of ['replaceState', 'pushState'] as const) {
    const original = window.history[method];
    window.history[method] = function patched(state: unknown, unused: string, url?: string | URL | null) {
      if (url != null) {
        const value = String(url);
        const hash = value.indexOf('#');
        url = `about:srcdoc${hash >= 0 ? value.slice(hash) : ''}`;
      }
      return original.call(this, state, unused, url);
    };
  }
})();

/* email: answer the invite-delivery request locally and hand the email to the navigator */
(function simulateEmail() {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('/api/aio/client-migration/send-activation-invite')) {
      let body: Record<string, string> = {};
      try {
        body = JSON.parse(String(init?.body ?? '{}'));
      } catch {
        /* keep empty */
      }
      // the app builds the link from window.location.origin, which a srcdoc frame reports as "null": keep the route only
      const path = String(body.activationUrl ?? '').match(/\/office-activation\/[^/?#\s]+/)?.[0] ?? '';
      post({ type: 'outbox', email: body.email, company: body.companyName, path });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return realFetch(input, init);
  };
})();

/* boot: the scenario's demo state, then the requested route */
const boot: Boot = w.__AIO_PROTO ?? { path: '/office/migration', scenario: 'none' };
const [bootPath, bootHash = ''] = boot.path.split('#');
if (boot.scenario) {
  saveDemoStore(loadDemoStore());
  SEED(boot.scenario);
}
if (bootHash) window.history.replaceState(null, '', `#${bootHash}`);

/** The client review keeps its step in the document hash (replaceState); report it with the router path. */
function RouteReporter() {
  const location = useLocation();
  useEffect(() => {
    const send = () => post({ type: 'route', path: `${location.pathname}${location.search}${location.pathname.startsWith('/portal/activation') ? window.location.hash : ''}` });
    send();
    const replaceState = window.history.replaceState;
    window.history.replaceState = function patched(...args: Parameters<History['replaceState']>) {
      replaceState.apply(this, args);
      send();
    };
    window.addEventListener('hashchange', send);
    return () => {
      window.history.replaceState = replaceState;
      window.removeEventListener('hashchange', send);
    };
  }, [location]);
  return null;
}

/**
 * Dead affordances: a chevron or arrow drawn outside any button, link or label looks tappable but does nothing.
 * Reported per screen so the navigator can list them.
 */
function AffordanceScan() {
  const location = useLocation();
  useEffect(() => {
    const scan = () => {
      const found = [...document.querySelectorAll('.amg-ico--chevron, .amg-ico--arrow, .amg-ico--forward')]
        .filter((icon) => !icon.closest('button, a, label, [role=button], [role=link], [role=radio], select, .proto-exit'))
        .filter((icon) => (icon as SVGElement).getBoundingClientRect().width > 0)
        .map((icon) => {
          const row = icon.closest('li, .amg-row, .amg-card, section') ?? icon.parentElement;
          return (row?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
        });
      post({ type: 'affordances', path: location.pathname, items: [...new Set(found)] });
    };
    const t = window.setTimeout(scan, 450);
    return () => window.clearTimeout(t);
  });
  return null;
}

/** The navigator can move the frame (open an emailed link as the client) without rebooting it. */
function NavigatorBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; type?: string; path?: string } | null;
      if (data?.source !== 'aio-migration-navigator' || data.type !== 'navigate' || !data.path) return;
      const [path, hash] = data.path.split('#');
      window.history.replaceState(null, '', hash ? `#${hash}` : '#');
      navigate(path);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);
  return null;
}

/** A link that leaves client migration (HOME, FILING, the client office…): say where it goes. */
function LeavesMigration() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="proto-exit">
      <p className="proto-exit__k">LEAVES CLIENT MIGRATION</p>
      <p className="proto-exit__route">{location.pathname}</p>
      <p className="proto-exit__note">THIS LINK OPENS ANOTHER PART OF AIO. IT IS NOT PART OF THIS FLOW PROTOTYPE.</p>
      <button type="button" className="proto-exit__back" onClick={() => navigate(-1)}>
        BACK TO THE FLOW
      </button>
    </div>
  );
}

const exitStyle = document.createElement('style');
exitStyle.textContent = `
.proto-exit{min-height:100vh;display:grid;align-content:center;justify-items:center;gap:14px;padding:32px 20px;background:#f2f0ec;color:#111112;font:15px/1.4 Roboto,Arial,sans-serif;text-align:center;text-transform:uppercase}
.proto-exit__k{font:700 13px/1 'Roboto Condensed',Arial,sans-serif;letter-spacing:.24em;color:#9a6a12}
.proto-exit__route{font:600 22px/1.2 'Roboto Mono',monospace;word-break:break-all}
.proto-exit__note{max-width:420px;color:#55555a}
.proto-exit__back{margin-top:8px;padding:14px 22px;border:0;border-radius:10px;background:linear-gradient(180deg,#f6cd6c,#e8ad3e);font:600 16px/1 'Roboto Condensed',Arial,sans-serif;letter-spacing:.04em;cursor:pointer}
`;
document.head.append(exitStyle);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter initialEntries={[bootPath || '/office/migration']}>
      <RouteReporter />
      <NavigatorBridge />
      <AffordanceScan />
      <Routes>
        <Route path="/office/migration" element={<MigrationStudioPage />} />
        <Route path="/office/migration/:screen" element={<MigrationStudioPage />} />
        <Route path="/office-activation/:token" element={<OfficeActivationPage />} />
        <Route path="/portal/activation/review" element={<ClientOfficeReviewPage />} />
        <Route path="*" element={<LeavesMigration />} />
      </Routes>
    </MemoryRouter>
  </StrictMode>,
);
