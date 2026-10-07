/**
 * Shared CLIENT / STAFF workspace chrome — the authority top bar exactly as drawn: simple AIO mark left; search,
 * notifications and the avatar chip (name · role · chevron) right. Everything else the old chrome carried
 * (workspace switching, client switching, Messages, My Office / Office home) lives in the avatar menu, so the bar
 * matches the approved screens without losing a function.
 *
 * Search = interaction 04 FILTER / SORT over what the page registers; notifications list the open items the page
 * registers. Both are read-only views of the case record — no new business action.
 */
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IftaGlyph } from './IftaGlyph';
import { IftaIcon } from './IftaIcon';
import { IftaMark } from './IftaMark';
import { initials } from './iftaViewModel';

export type IftaShellItem = {
  id: string;
  label: string;
  detail?: string;
  to?: string;
  onSelect?: () => void;
  tone?: 'alert' | 'warn' | 'info';
};

export type IftaMenuSection = {
  title?: string;
  items: { id: string; label: string; detail?: string; to?: string; onSelect?: () => void; current?: boolean; disabled?: boolean }[];
};

type ShellData = { search: IftaShellItem[]; notices: IftaShellItem[] };

const ShellDataContext = createContext<{ set: (d: ShellData) => void } | null>(null);

/** Pages register what the top bar can search and what needs attention. */
export function useIftaShellData(data: ShellData) {
  const ctx = useContext(ShellDataContext);
  const key = JSON.stringify([data.search.map((i) => [i.id, i.label, i.detail, i.to]), data.notices.map((i) => [i.id, i.label, i.detail, i.to])]);
  const latest = useRef(data);
  latest.current = data;
  useEffect(() => {
    ctx?.set(latest.current);
  }, [ctx, key]);
  useEffect(() => () => ctx?.set({ search: [], notices: [] }), [ctx]);
}

type Panel = 'search' | 'notices' | 'menu' | null;

export function IftaWorkspaceShell({
  actor,
  homeTo,
  homeLabel,
  person,
  role,
  menu,
  children,
}: {
  actor: 'client' | 'staff';
  homeTo: string;
  homeLabel: string;
  person: string;
  role: string;
  menu: IftaMenuSection[];
  children: ReactNode;
}) {
  const [data, setData] = useState<ShellData>({ search: [], notices: [] });
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const barRef = useRef<HTMLElement>(null);
  const searchId = useId();
  const set = useCallback((d: ShellData) => setData(d), []);
  const ctx = useMemo(() => ({ set }), [set]);

  useEffect(() => setPanel(null), [location.pathname]);
  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [panel]);

  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));
  const q = query.trim().toLowerCase();
  const results = q ? data.search.filter((i) => `${i.label} ${i.detail ?? ''}`.toLowerCase().includes(q)).slice(0, 8) : data.search.slice(0, 6);
  const pick = (i: IftaShellItem) => {
    i.onSelect?.();
    setPanel(null);
  };
  const short = person;

  return (
    <ShellDataContext.Provider value={ctx}>
      <header className={`ifta-top ifta-top--${actor}`} ref={barRef}>
        <IftaMark to={homeTo} label={homeLabel} surface="light" />
        <div className="ifta-top__right">
          <button type="button" className="ifta-top__btn ifta-top__search" aria-label="Search" aria-expanded={panel === 'search'} onClick={() => toggle('search')}>
            <IftaIcon name="search" strokeWidth={2.2} />
          </button>
          <button type="button" className="ifta-top__btn ifta-top__bell" aria-label={`Notifications${data.notices.length ? ` · ${data.notices.length} open` : ''}`} aria-expanded={panel === 'notices'} onClick={() => toggle('notices')}>
            <IftaGlyph name="bell-solid" />
            {data.notices.length ? <span className="ifta-top__dot" aria-hidden="true" /> : null}
          </button>
          <button type="button" className="ifta-top__who" aria-haspopup="menu" aria-expanded={panel === 'menu'} onClick={() => toggle('menu')}>
            <span className="ifta-avatar" aria-hidden="true">
              <span>{initials(person) || 'AIO'}</span>
            </span>
            <span className="ifta-top__id">
              <span className="ifta-top__name">{short}</span>
              <span className="ifta-top__role">{role}</span>
            </span>
            <svg className="ifta-top__chev" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m3.5 6 4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {panel === 'search' ? (
          <div className="ifta-pop ifta-pop--search" role="dialog" aria-label="Search">
            <label className="ifta-pop__field" htmlFor={searchId}>
              <IftaIcon name="search" size={16} />
              <input id={searchId} autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this workspace" />
            </label>
            {results.length ? (
              <ul className="ifta-pop__list">
                {results.map((i) => (
                  <li key={i.id}>
                    {i.to ? (
                      <Link to={i.to} onClick={() => pick(i)}>
                        <span>{i.label}</span>
                        {i.detail ? <small>{i.detail}</small> : null}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => pick(i)}>
                        <span>{i.label}</span>
                        {i.detail ? <small>{i.detail}</small> : null}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ifta-pop__empty">No matches.</p>
            )}
          </div>
        ) : null}

        {panel === 'notices' ? (
          <div className="ifta-pop ifta-pop--notices" role="dialog" aria-label="Notifications">
            <p className="ifta-pop__title">Needs attention</p>
            {data.notices.length ? (
              <ul className="ifta-pop__list">
                {data.notices.map((i) => (
                  <li key={i.id} className={i.tone ? `is-${i.tone}` : undefined}>
                    {i.to ? (
                      <Link to={i.to} onClick={() => pick(i)}>
                        <span>{i.label}</span>
                        {i.detail ? <small>{i.detail}</small> : null}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => pick(i)}>
                        <span>{i.label}</span>
                        {i.detail ? <small>{i.detail}</small> : null}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ifta-pop__empty">Nothing needs attention right now.</p>
            )}
          </div>
        ) : null}

        {panel === 'menu' ? (
          <nav className="ifta-pop ifta-pop--menu" aria-label="Account and workspace">
            {menu.map((s, si) => (
              <div key={si} className="ifta-pop__section">
                {s.title ? <p className="ifta-pop__title">{s.title}</p> : null}
                <ul className="ifta-pop__list">
                  {s.items.map((i) => (
                    <li key={i.id} className={i.current ? 'is-current' : undefined}>
                      {i.to && !i.disabled ? (
                        <Link to={i.to} aria-current={i.current ? 'page' : undefined} onClick={() => setPanel(null)}>
                          <span>{i.label}</span>
                          {i.detail ? <small>{i.detail}</small> : null}
                        </Link>
                      ) : i.onSelect && !i.disabled ? (
                        <button type="button" onClick={() => { i.onSelect?.(); setPanel(null); }}>
                          <span>{i.label}</span>
                          {i.detail ? <small>{i.detail}</small> : null}
                        </button>
                      ) : (
                        <span className="ifta-pop__static" aria-current={i.current ? 'true' : undefined}>
                          <span>{i.label}</span>
                          {i.detail ? <small>{i.detail}</small> : null}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}
      </header>
      {children}
    </ShellDataContext.Provider>
  );
}
