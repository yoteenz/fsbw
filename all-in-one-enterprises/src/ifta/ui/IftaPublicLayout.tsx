import { useEffect, useId, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import { IftaIcon } from './IftaIcon';
import { IftaMark } from './IftaMark';
import { IFTA_BRAND, IFTA_PLATES } from './iftaAssetManifest';
import { IFTA_FAQS } from './RunFaqsPanel';
import { useIftaAuthorityScale, useIftaBand } from './iftaScale';
import './ifta-ui.css';

const SECTIONS = [
  { href: '#filing-room', label: 'IFTA filing room', lead: 'IFTA' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#jurisdictions', label: 'Jurisdictions' },
];

const LINKS = [
  { label: 'IFTA account assistance', detail: 'Need an IFTA account first?', to: aioPaths.serviceSlug('ifta-fuel-tax-assistance') },
  { label: 'All services', detail: 'Permits, compliance and back office', to: aioPaths.services },
  { label: 'Log in', detail: 'Client office', to: aioPaths.login },
];

type Panel = 'resources' | 'search' | 'menu' | null;

/** PUBLIC · IFTA — the approved dark public chrome: mark · section nav · search · GET STARTED (· menu on tablet / phone). */
export function IftaPublicLayout() {
  useIftaAuthorityScale('public');
  const band = useIftaBand();
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const searchId = useId();
  const getStarted = aioPaths.getStartedForService('ifta-filing');

  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => navRef.current && !navRef.current.contains(e.target as Node) && setPanel(null);
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
  const faqHits = IFTA_FAQS.filter((f) => !q || `${f.q} ${f.a}`.toLowerCase().includes(q));
  const linkHits = LINKS.filter((l) => !q || `${l.label} ${l.detail}`.toLowerCase().includes(q));
  const sectionHits = SECTIONS.filter((s) => q && s.label.toLowerCase().includes(q));

  const resources = (
    <div className="ifta-pubpop__cols">
      <div>
        <p className="ifta-pubpop__title">
          <span className="ifta-pubpop__num">09</span> Run FAQs
        </p>
        <div className="ifta-pubpop__faqs">
          {(panel === 'search' ? faqHits : IFTA_FAQS).map((f) => (
            <details key={f.q} className="ifta-faq ifta-faq--dark">
              <summary>
                <span>{f.q}</span>
                <IftaIcon name="chevron" size={16} className="ifta-faq__chev" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <ul className="ifta-pubpop__links">
        {(panel === 'search' ? linkHits : LINKS).map((l) => (
          <li key={l.label}>
            <Link to={l.to} onClick={() => setPanel(null)}>
              <span>{l.label}</span>
              <small>{l.detail}</small>
            </Link>
          </li>
        ))}
        {sectionHits.map((s) => (
          <li key={s.href}>
            <a href={s.href} onClick={() => setPanel(null)}>
              <span>{s.label}</span>
              <small>On this page</small>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="ifta-root ifta-root--dark ifta-root--public">
      <header className="ifta-pubnav" ref={navRef}>
        <IftaMark surface="dark" />
        {band === 'desktop' ? (
          <nav className="ifta-pubnav__links" aria-label="IFTA public">
            {SECTIONS.map((s, i) => (
              <a key={s.href} href={s.href} className={i === 0 ? 'is-current' : undefined} aria-current={i === 0 ? 'location' : undefined}>
                {s.lead ? <span className="ifta-pubnav__lead">{s.lead}</span> : null}
                {s.lead ? s.label.slice(s.lead.length) : s.label}
              </a>
            ))}
            <button type="button" aria-expanded={panel === 'resources'} onClick={() => toggle('resources')}>
              Resources
            </button>
          </nav>
        ) : null}
        <div className="ifta-pubnav__right">
          <button type="button" className="ifta-pubnav__search" aria-label="Search" aria-expanded={panel === 'search'} onClick={() => toggle('search')}>
            <IftaIcon name="search" strokeWidth={2.1} />
          </button>
          <Link to={getStarted} className="ifta-pubnav__cta">
            Get started
            {band === 'desktop' ? <IftaIcon name="arrow" strokeWidth={2.2} /> : null}
          </Link>
          {band !== 'desktop' ? (
            <button type="button" className="ifta-pubnav__menu" aria-expanded={panel === 'menu'} aria-label={panel === 'menu' ? 'Close menu' : 'Open menu'} onClick={() => toggle('menu')}>
              <IftaIcon name={panel === 'menu' ? 'close' : 'menu'} strokeWidth={2} />
            </button>
          ) : null}
        </div>

        {panel === 'resources' ? (
          <div className="ifta-pubpop" role="dialog" aria-label="Resources">
            {resources}
          </div>
        ) : null}
        {panel === 'search' ? (
          <div className="ifta-pubpop" role="dialog" aria-label="Search">
            <label className="ifta-pubpop__field" htmlFor={searchId}>
              <IftaIcon name="search" size={16} />
              <input id={searchId} autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search IFTA filing" />
            </label>
            {resources}
          </div>
        ) : null}
        {panel === 'menu' ? (
          <nav className="ifta-pubpop ifta-pubpop--menu" aria-label="IFTA public menu">
            <ul className="ifta-pubpop__links">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} onClick={() => setPanel(null)}>
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => setPanel('resources')}>
                  <span>Resources · 09 Run FAQs</span>
                </button>
              </li>
              {LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} onClick={() => setPanel(null)}>
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>
      <Outlet />
      <footer className="ifta-pubfoot">
        <picture className="ifta-pubfoot__plate" aria-hidden="true">
          <source media="(max-width: 1199.98px)" srcSet={IFTA_PLATES.publicFooter.compact} />
          <img src={IFTA_PLATES.publicFooter.desktop} alt="" loading="lazy" decoding="async" />
        </picture>
        <div className="ifta-pubfoot__brand">
          <img className="ifta-pubfoot__lockup" src={IFTA_BRAND.lockupOnDark} alt="All In One Enterprises Inc." loading="lazy" decoding="async" />
          <p className="ifta-pubfoot__line">Driven by compliance. Built for what moves you.</p>
        </div>
        {band === 'desktop' ? (
          <p className="ifta-pubfoot__words">
            <span>Data</span>
            <span>Compliance</span>
            <span>Real progress</span>
          </p>
        ) : null}
      </footer>
    </div>
  );
}
