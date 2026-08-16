import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { resourcesMenuLinks, servicesMegaMenu, navLinkActivationBadge } from '../data/publicNavigation';
import { aioPaths } from '../utils/paths';
import { AIOLogo } from './AIOLogo';
import { PublicAuthNav } from './auth/PublicAuthNav';

type DropdownId = 'services' | 'resources' | null;

const topNavLinks = [
  { label: 'Start Your Business', href: aioPaths.startYourBusiness },
  { label: 'Road Ready™', href: aioPaths.roadReadyPublic },
  { label: 'About', href: aioPaths.about },
  { label: 'Contact', href: aioPaths.contact },
];

function NavDropdownPanel({
  id,
  open,
  onClose,
  children,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id={id}
      className="aio-nav-dropdown"
      role="region"
      aria-label={id.includes('services') ? 'Services menu' : 'Resources menu'}
    >
      {children}
    </div>
  );
}

export function AIONav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const closeAll = useCallback(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    closeAll();
  }, [location.pathname, closeAll]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const toggleDropdown = (id: DropdownId) => {
    setOpenDropdown((current) => (current === id ? null : id));
  };

  const toggleMobileSection = (key: string) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header className="aio-header" ref={navRef}>
      <div className="aio-header__inner">
        <AIOLogo />

        <nav className="aio-header__nav" aria-label="Primary">
          <div className="aio-header__nav-item">
            <button
              type="button"
              className={`aio-header__nav-link aio-header__nav-trigger ${openDropdown === 'services' || isActive(aioPaths.services) ? 'aio-header__nav-link--active' : ''}`}
              aria-expanded={openDropdown === 'services'}
              aria-controls="aio-nav-services-panel"
              onClick={() => toggleDropdown('services')}
            >
              Services <span aria-hidden="true">▾</span>
            </button>
            <NavDropdownPanel id="aio-nav-services-panel" open={openDropdown === 'services'} onClose={() => setOpenDropdown(null)}>
              <div className="aio-mega-menu">
                {servicesMegaMenu.map((category) => (
                  <div key={category.title} className="aio-mega-menu__col">
                    <p className="aio-mega-menu__title">{category.title}</p>
                    <ul className="aio-mega-menu__list">
                      {category.links.map((link) => {
                        const badge = navLinkActivationBadge(link.serviceSlug);
                        return (
                          <li key={link.href + link.label}>
                            <Link to={link.href} className="aio-mega-menu__link" onClick={closeAll}>
                              {link.label}
                              {badge ? <span className="aio-mega-menu__badge">{badge}</span> : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <Link to={aioPaths.services} className="aio-mega-menu__footer" onClick={closeAll}>
                View all services →
              </Link>
            </NavDropdownPanel>
          </div>

          {topNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`aio-header__nav-link ${isActive(link.href) ? 'aio-header__nav-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="aio-header__nav-item">
            <button
              type="button"
              className={`aio-header__nav-link aio-header__nav-trigger ${openDropdown === 'resources' ? 'aio-header__nav-link--active' : ''}`}
              aria-expanded={openDropdown === 'resources'}
              aria-controls="aio-nav-resources-panel"
              onClick={() => toggleDropdown('resources')}
            >
              Resources <span aria-hidden="true">▾</span>
            </button>
            <NavDropdownPanel id="aio-nav-resources-panel" open={openDropdown === 'resources'} onClose={() => setOpenDropdown(null)}>
              <ul className="aio-resources-menu">
                {resourcesMenuLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <Link to={link.href} className="aio-resources-menu__link" onClick={closeAll}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </NavDropdownPanel>
          </div>
        </nav>

        <div className="aio-header__utilities">
          <a href={aioAppConfig.contact.phoneHref} className="aio-header__phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            {aioAppConfig.contact.phone}
          </a>
          <PublicAuthNav variant="mobile-header" />
          <div className="aio-header__auth-desktop">
            <PublicAuthNav variant="desktop" />
          </div>
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
        <div className="aio-mobile-nav__section">
          <button
            type="button"
            className="aio-mobile-nav__toggle"
            aria-expanded={mobileExpanded.services}
            onClick={() => toggleMobileSection('services')}
          >
            Services <span aria-hidden="true">{mobileExpanded.services ? '−' : '+'}</span>
          </button>
          {mobileExpanded.services ? (
            <div className="aio-mobile-nav__sub">
              {servicesMegaMenu.map((category) => (
                <div key={category.id} className="aio-mobile-nav__group">
                  <button
                    type="button"
                    className="aio-mobile-nav__toggle aio-mobile-nav__group-title"
                    aria-expanded={mobileExpanded[category.id]}
                    onClick={() => toggleMobileSection(category.id)}
                  >
                    {category.title} <span aria-hidden="true">{mobileExpanded[category.id] ? '−' : '+'}</span>
                  </button>
                  {mobileExpanded[category.id]
                    ? category.links.map((link) => (
                        <Link key={link.href + link.label} to={link.href} className="aio-mobile-nav__sublink" onClick={closeAll}>
                          {link.label}
                        </Link>
                      ))
                    : null}
                </div>
              ))}
              <Link to={aioPaths.services} className="aio-mobile-nav__sublink" onClick={closeAll}>
                View all services
              </Link>
              <Link to={aioPaths.servicesFind} className="aio-mobile-nav__sublink" onClick={closeAll}>
                Find a service
              </Link>
            </div>
          ) : null}
        </div>

        <Link to={aioPaths.startYourBusiness} className="aio-mobile-nav__link" onClick={closeAll}>
          Start Your Business
        </Link>
        <Link to={aioPaths.roadReadyPublic} className="aio-mobile-nav__link" onClick={closeAll}>
          Road Ready™
        </Link>

        <div className="aio-mobile-nav__section">
          <button
            type="button"
            className="aio-mobile-nav__toggle"
            aria-expanded={mobileExpanded.resources}
            onClick={() => toggleMobileSection('resources')}
          >
            Resources <span aria-hidden="true">{mobileExpanded.resources ? '−' : '+'}</span>
          </button>
          {mobileExpanded.resources ? (
            <div className="aio-mobile-nav__sub">
              {resourcesMenuLinks.map((link) => (
                <Link key={link.href + link.label} to={link.href} className="aio-mobile-nav__sublink" onClick={closeAll}>
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <Link to={aioPaths.about} className="aio-mobile-nav__link" onClick={closeAll}>
          About
        </Link>
        <Link to={aioPaths.contact} className="aio-mobile-nav__link" onClick={closeAll}>
          Contact
        </Link>
        <div className="aio-mobile-nav__login">
          <PublicAuthNav variant="mobile-menu" onNavigate={closeAll} />
        </div>
      </nav>
    </header>
  );
}
