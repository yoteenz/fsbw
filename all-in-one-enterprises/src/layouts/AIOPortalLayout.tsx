import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AIOLogo } from '../components/AIOLogo';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { runExpirationEvaluation } from '../demo/vaultActions';
import { runBillingEvaluation } from '../demo/billingActions';
import { useDemoStore } from '../demo/useDemoStore';
import { resolvePortalKind, resolveOrganizationId } from '../portal/organizationContext';
import { aioPaths } from '../utils/paths';
import { LanguageSelector } from '../components/i18n/LanguageSelector';
import { PortalModuleContextRail } from '../context-rail/StartBusinessStepShell';
import { buildCarrierPortalNav, buildShipperPortalNav, type PortalNavItem } from '../product-graph/portalNavFromMeta';

const mobileBottomNav = [
  { label: 'Home', href: aioPaths.portal },
  { label: 'Business', href: aioPaths.portalBusiness },
  { label: 'Ops', href: aioPaths.portalOperations },
  { label: 'Money', href: aioPaths.portalMoney },
  { label: 'More', href: aioPaths.portalServicesCenter },
];

export function AIOPortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const store = useDemoStore();
  const portalKind = resolvePortalKind(location.pathname);
  const orgId = resolveOrganizationId(store, portalKind);
  const nav: PortalNavItem[] = portalKind === 'shipper' ? buildShipperPortalNav() : buildCarrierPortalNav();

  const unread = useMemo(
    () => store.notifications.filter((n) => n.recipientType === 'customer' && n.organizationId === orgId && !n.read).length,
    [store.notifications, orgId],
  );

  useEffect(() => {
    runExpirationEvaluation();
    runBillingEvaluation();
  }, []);

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  let lastSection = '';

  return (
    <div className="aio-app aio-portal">
      <AIODebugBanner />
      <div className="aio-portal__mobile-bar">
        <AIOLogo />
        <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => setSidebarOpen((o) => !o)}>
          Menu
        </button>
      </div>

      <div className="aio-portal__shell">
        <aside
          className="aio-portal__sidebar"
          style={sidebarOpen ? { display: 'flex', position: 'fixed', inset: '0 40% 0 0', zIndex: 200 } : undefined}
          aria-label="Portal navigation"
        >
        <div className="aio-portal__sidebar-brand">
          <AIOLogo />
        </div>
        <nav>
          {nav.map((item) => {
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;
            return (
              <div key={item.label}>
                {showSection && <p className="aio-portal__nav-section">{item.section}</p>}
                <Link
                  to={item.href}
                  className={`aio-portal__nav-link ${isActive(item.href) ? 'aio-portal__nav-link--active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem 1.25rem' }}>
          <LanguageSelector className="aio-portal-header__lang" />
          <Link to={aioPaths.home} className="aio-portal__nav-link">
            ← Back to Website
          </Link>
        </div>
        </aside>

        <div className="aio-portal__main">
          {unread > 0 && (
            <div className="aio-portal-notif-bar" role="status">
              <span>{unread} unread notification{unread === 1 ? '' : 's'}</span>
              <Link to={aioPaths.portalNotifications}>View →</Link>
            </div>
          )}
          <div className="aio-portal__main-inner">
            <PortalModuleContextRail />
            <div className="aio-portal__main-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {portalKind === 'carrier' && (
        <nav className="aio-portal-bottom-nav" aria-label="Mobile primary navigation">
          {mobileBottomNav.map((item) => (
            <Link key={item.label} to={item.href} className={isActive(item.href) ? 'active' : ''}>{item.label}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
