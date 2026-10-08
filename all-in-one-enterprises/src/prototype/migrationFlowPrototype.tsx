/**
 * AIO client migration — flow prototype (runs inside the review artifact's frame).
 *
 * The real migration screens (MigrationStudioPage, OfficeActivationPage, ClientOfficeReviewPage) on the demo store, in a
 * memory router. The navigator page around it (scripts/migration/flow-prototype-template.html) boots this document with a
 * route and an optional demo scenario, and listens for route changes to draw the flow. Nothing here changes product code:
 *   · storage: if the frame refuses localStorage, an in-memory store stands in (state then lasts for this document only);
 *   · email: the activation-invite request is answered locally and the email is handed to the navigator's outbox;
 *   · assets: public /migration/* paths resolve to the data URIs packed into the page (window.__AIO_ASSETS);
 *   · exits: any route outside client migration shows where it leads instead of a blank page;
 *   · mock data (on unless the navigator turns it off): each screen gets what a person would supply (migrationMockData.ts).
 */
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SEED } from '../../scripts/migration/migration-screens.mjs';
import { loadDemoStore, saveDemoStore } from '../demo/demoStore';
import { MigrationStudioPage } from '../client-migration/visual/MigrationStudioPage';
import { prepareScreen } from './migrationMockData';
import { ClientOfficeReviewPage } from '../pages/activation/ClientOfficeReviewPage';
import { OfficeActivationPage } from '../pages/activation/OfficeActivationPage';
import '../styles/aio.css';
import '../styles/aio-auth.css';
import '../styles/aio-uppercase.css';

type Boot = { path: string; scenario?: string | null; mock?: boolean };
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

/* mock data mode, switched from the navigator; the client review moves between steps in the hash, announced as aio-proto-step */
let mockOn = boot.mock !== false;
/** MATCH AND CONFLICT REVIEW keeps its choice in the open page only, and APPROVE MIGRATION needs it */
let matchChosen = false;
/** one trip back through MATCH per arrival on APPROVAL (never a loop) */
let detoured = false;
/** while mock data goes back through MATCH for the approval, the navigator is told the moves are not the tester's */
let quiet = false;
const STEP_EVENT = 'aio-proto-step';

/** The client review keeps its step in the document hash (replaceState); report it with the router path. */
function RouteReporter() {
  const location = useLocation();
  useEffect(() => {
    const send = () => {
      post({ type: 'route', quiet, path: `${location.pathname}${location.search}${location.pathname.startsWith('/portal/activation') ? window.location.hash : ''}` });
      window.dispatchEvent(new Event(STEP_EVENT));
    };
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

/** The screen key the navigator uses (client review steps live in the hash). */
function screenKey(pathname: string): string {
  if (pathname === '/office/migration') return 'root';
  if (pathname.startsWith('/office/migration/')) return pathname.split('/')[3] ?? 'root';
  if (pathname.startsWith('/office-activation/')) return 'activation';
  if (pathname === '/portal/activation/review') {
    const step = window.location.hash.replace('#', '') || 'welcome';
    return step === 'done' ? 'complete' : step;
  }
  return 'exit';
}

/**
 * MOCK DATA: on each arrival, fill what the screen needs (migrationMockData.ts) and tell the navigator what was filled.
 * APPROVE MIGRATION needs the client match chosen in this page; after a jump past MATCH it goes back through it first.
 */
function MockRunner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const resume = useRef<{ to: string; note: string } | null>(null);
  /** the screen last reported: later runs on the same screen add to its list instead of replacing it */
  const reported = useRef<string | null>(null);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(STEP_EVENT, bump);
    window.addEventListener('aio-proto-mock', bump);
    // a choice the tester makes on MATCH counts too (MATCH TO EXISTING and CREATE NEW resolve it; NEEDS REVIEW does not)
    const onClick = (event: MouseEvent) => {
      const row = (event.target as Element | null)?.closest?.('.amg-match__options button.amg-row');
      if (!row) return;
      const rows = [...document.querySelectorAll('.amg-match__options button.amg-row')];
      matchChosen = rows.indexOf(row) < 2;
    };
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener(STEP_EVENT, bump);
      window.removeEventListener('aio-proto-mock', bump);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  const key = screenKey(location.pathname);
  useEffect(() => {
    // leaving the migration pages for the intake root remounts the studio page, which forgets the match
    if (key === 'root') matchChosen = false;
    if (key !== 'approval' && key !== 'match') detoured = false;
    const report = (items: string[], screen = key) => {
      post({ type: 'mocked', screen, on: mockOn, items, append: reported.current === screen });
      reported.current = screen;
    };
    if (!mockOn) {
      report([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (key === 'approval' && !matchChosen && !detoured) {
        detoured = true;
        resume.current = { to: `${location.pathname}${location.search}`, note: 'Went back through MATCH AND CONFLICT REVIEW to choose the match (approval needs it and you jumped past it)' };
        quiet = true;
        navigate(`/office/migration/match${location.search}`, { replace: true });
        return;
      }
      const items = await prepareScreen({
        screen: key,
        search: new URLSearchParams(location.search),
        reviewOrg: (location.state as { organizationId?: string } | null)?.organizationId ?? loadDemoStore().portalClientId ?? 'client-a',
        select: (clientId) => navigate(`${location.pathname}?client=${encodeURIComponent(clientId)}`, { replace: true }),
      });
      // a fill that moved the route (picking the client) still reports what it did
      if (cancelled && !items.length) return;
      if (key === 'match' && (items.length || document.querySelector('.amg-match__options button.amg-row.is-on'))) matchChosen = true;
      if (key === 'match' && resume.current) {
        const back = resume.current;
        resume.current = null;
        window.setTimeout(() => {
          navigate(back.to, { replace: true });
          window.setTimeout(() => {
            quiet = false;
            report([back.note], 'approval');
          }, 250);
        }, 400);
        return;
      }
      report(items);
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key, location.pathname, location.search, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** The navigator can move the frame (open an emailed link as the client) without rebooting it. */
function NavigatorBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; type?: string; path?: string; on?: boolean } | null;
      if (data?.source !== 'aio-migration-navigator') return;
      if (data.type === 'mock') {
        mockOn = data.on !== false;
        window.dispatchEvent(new Event('aio-proto-mock'));
        return;
      }
      if (data.type !== 'navigate' || !data.path) return;
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
      <MockRunner />
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
