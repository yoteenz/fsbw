import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';
import { AIOLogo } from './AIOLogo';
import { AIOButton } from './AIOButton';

const navLinks = [
  { label: 'Services', href: aioPaths.services },
  { label: 'Industries', href: aioPaths.industries },
  { label: 'Resources', href: aioPaths.resources },
  { label: 'About Us', href: aioPaths.about },
  { label: 'Contact', href: aioPaths.contact },
];

export function AIONav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <header className="aio-header">
      <div className="aio-header__inner">
        <AIOLogo />

        <nav className="aio-header__nav" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`aio-header__nav-link ${isActive(link.href) ? 'aio-header__nav-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="aio-header__utilities">
          <a href={aioAppConfig.contact.phoneHref} className="aio-header__phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            {aioAppConfig.contact.phone}
          </a>
          <Link to={aioAppConfig.routes.clientLogin}>
            <AIOButton variant="gold" size="sm">
              Client Login
            </AIOButton>
          </Link>
          <button
            type="button"
            className="aio-header__menu-btn"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        className={`aio-mobile-nav ${mobileOpen ? 'aio-mobile-nav--open' : ''}`}
        aria-label="Mobile"
        aria-hidden={!mobileOpen}
      >
        {navLinks.map((link) => (
          <Link key={link.href} to={link.href} className="aio-mobile-nav__link" onClick={() => setMobileOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link to={aioAppConfig.routes.clientLogin} className="aio-mobile-nav__link" onClick={() => setMobileOpen(false)}>
          Client Login
        </Link>
      </nav>
    </header>
  );
}
