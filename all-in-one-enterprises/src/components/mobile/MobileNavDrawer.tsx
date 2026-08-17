import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { aioAppConfig } from '../../config/appConfig';
import { mobileDrawerCompany, mobileDrawerSolutions } from '../../data/mobileNavigation';
import { aioPaths } from '../../utils/paths';
import { AIOLogo } from '../AIOLogo';
import { PublicAuthNav } from '../auth/PublicAuthNav';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavDrawer({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button type="button" className="aio-mobile-drawer__backdrop" aria-label="Close menu" onClick={onClose} />
      <nav className="aio-mobile-drawer" aria-label="Mobile navigation" role="dialog" aria-modal="true">
        <div className="aio-mobile-drawer__header">
          <AIOLogo />
          <button ref={closeRef} type="button" className="aio-mobile-drawer__close" aria-label="Close menu" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="aio-mobile-drawer__scroll">
          <PublicAuthNav variant="mobile-menu" onNavigate={onClose} />

          <section className="aio-mobile-drawer__section">
            <h2 className="aio-mobile-drawer__section-label">Solutions</h2>
            <ul className="aio-mobile-drawer__list">
              {mobileDrawerSolutions.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="aio-mobile-drawer__row" onClick={onClose}>
                    {item.iconSrc ? (
                      <img src={item.iconSrc} alt="" className="aio-mobile-drawer__icon" width={28} height={28} />
                    ) : null}
                    <span className="aio-mobile-drawer__row-label">{item.label}</span>
                    <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link to={aioPaths.services} className="aio-mobile-drawer__row" onClick={onClose}>
                  <span className="aio-mobile-drawer__row-label">View All Services</span>
                  <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                    ›
                  </span>
                </Link>
              </li>
            </ul>
          </section>

          <section className="aio-mobile-drawer__section">
            <h2 className="aio-mobile-drawer__section-label">Company</h2>
            <ul className="aio-mobile-drawer__list">
              {mobileDrawerCompany.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="aio-mobile-drawer__row" onClick={onClose}>
                    <span className="aio-mobile-drawer__row-label">{item.label}</span>
                    <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <aside className="aio-mobile-drawer__support">
            <p className="aio-mobile-drawer__support-title">Need Help?</p>
            <a href={aioAppConfig.contact.phoneHref} className="aio-mobile-drawer__support-phone">
              {aioAppConfig.contact.phone}
            </a>
            <a href={aioAppConfig.contact.emailHref} className="aio-mobile-drawer__support-email">
              {aioAppConfig.contact.email}
            </a>
          </aside>
        </div>
      </nav>
    </>
  );
}
