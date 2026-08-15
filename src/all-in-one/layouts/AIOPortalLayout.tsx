import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AIOLogo } from '../components/AIOLogo';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { runExpirationEvaluation } from '../demo/vaultActions';
import { runBillingEvaluation } from '../demo/billingActions';
import { useDemoStore } from '../demo/useDemoStore';
import { aioPaths } from '../utils/paths';

const portalNav = [
  { label: 'Dashboard', href: aioPaths.portal },
  { label: 'Road Ready', href: aioPaths.roadReady },
  { label: 'Vault', href: aioPaths.portalVault },
  { label: 'Calendar', href: aioPaths.portalCalendar },
  { label: 'Renewals', href: aioPaths.portalRenewals },
  { label: 'Billing', href: aioPaths.portalBilling },
  { label: 'Dispatch', href: aioPaths.portalDispatch },
  { label: 'Fleet', href: aioPaths.portalFleet },
  { label: 'Notifications', href: aioPaths.portalNotifications },
  { label: 'Service Plan', href: aioPaths.servicePlan },
  { label: 'Factoring', href: aioPaths.portalFactoring },
  { label: 'Support', href: aioPaths.contact },
];

export function AIOPortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const store = useDemoStore();
  const unread = store.notifications.filter((n) => n.recipientType === 'customer' && n.organizationId === store.portalClientId && !n.read).length;

  useEffect(() => {
    runExpirationEvaluation();
    runBillingEvaluation();
  }, []);

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <div className="aio-app aio-portal">
      <AIODebugBanner />
      <div className="aio-portal__mobile-bar">
        <AIOLogo />
        <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => setSidebarOpen((o) => !o)}>
          Menu
        </button>
      </div>

      <aside
        className="aio-portal__sidebar"
        style={sidebarOpen ? { display: 'flex', position: 'fixed', inset: '0 40% 0 0', zIndex: 200 } : undefined}
        aria-label="Portal navigation"
      >
        <div className="aio-portal__sidebar-brand">
          <AIOLogo />
        </div>
        <nav>
          {portalNav.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`aio-portal__nav-link ${isActive(item.href) ? 'aio-portal__nav-link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem 1.25rem' }}>
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
        <Outlet />
      </div>
    </div>
  );
}
