import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import { IftaIcon } from './IftaIcon';
import { IftaMark } from './IftaMark';
import { IFTA_BRAND, IFTA_MEDIA } from './iftaAssetManifest';
import './ifta-ui.css';

const SECTIONS = [
  { href: '#filing-room', label: 'IFTA filing room' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#what-aio-handles', label: 'Features' },
  { href: '#jurisdictions', label: 'Jurisdictions' },
  { href: '#run-faqs', label: 'FAQs' },
];

/** PUBLIC · IFTA — dark cinematic family shell (approved public tablet / desktop authority); no legacy public chrome. */
export function IftaPublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ifta-root ifta-root--dark ifta-public-wrap">
      <header className="ifta-pubnav">
        <div className="ifta-pubnav__inner">
          <IftaMark surface="dark" />
          <nav className="ifta-pubnav__links" aria-label="IFTA public">
            {SECTIONS.map((s, i) => (
              <a key={s.href} href={s.href} className={i === 0 ? 'is-current' : undefined}>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ifta-pubnav__right">
            <Link to={aioPaths.services} className="ifta-pubnav__quiet">
              Services
            </Link>
            <Link to={aioPaths.login} className="ifta-pubnav__quiet">
              Log in
            </Link>
            <Link to={aioPaths.getStartedForService('ifta-filing')} className="ifta-btn ifta-btn--gold ifta-btn--sm">
              Get started
              <IftaIcon name="arrow" size={16} />
            </Link>
            <button type="button" className="ifta-pubnav__menu" aria-expanded={open} aria-controls="ifta-pubnav-sheet" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
              <IftaIcon name={open ? 'close' : 'menu'} size={24} />
            </button>
          </div>
        </div>
        {open ? (
          <nav id="ifta-pubnav-sheet" className="ifta-pubnav__sheet" aria-label="IFTA public menu">
            {SECTIONS.map((s) => (
              <a key={s.href} href={s.href} onClick={() => setOpen(false)}>
                {s.label}
              </a>
            ))}
            <Link to={aioPaths.services}>Services</Link>
            <Link to={aioPaths.login}>Log in</Link>
          </nav>
        ) : null}
      </header>
      <Outlet />
      <footer className="ifta-pubfoot">
        <img className="ifta-pubfoot__range" src={IFTA_MEDIA.publicRange} alt="" loading="lazy" decoding="async" />
        <div className="ifta-pubfoot__inner">
          <div className="ifta-pubfoot__brand">
            <img src={IFTA_BRAND.lockupOnDark} alt="All In One Enterprises Inc." width={260} height={62} loading="lazy" decoding="async" />
            <p>Driven by compliance. Built for what moves you.</p>
          </div>
          <p className="ifta-pubfoot__words">Data · Compliance · Real progress</p>
        </div>
        <p className="ifta-pubfoot__legal">All In One Enterprises · IFTA filing support</p>
      </footer>
    </div>
  );
}
