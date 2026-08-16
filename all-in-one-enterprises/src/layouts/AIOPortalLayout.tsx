import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AIOLogo } from '../components/AIOLogo';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { runExpirationEvaluation } from '../demo/vaultActions';
import { runBillingEvaluation } from '../demo/billingActions';
import { useDemoStore } from '../demo/useDemoStore';
import { resolvePortalKind, resolveOrganizationId } from '../portal/organizationContext';
import { aioPaths } from '../utils/paths';

type NavItem = { label: string; href: string; section?: string };

const carrierNav: NavItem[] = [
  { label: 'Command Center', href: aioPaths.portal, section: 'HOME' },
  { label: 'My Business', href: aioPaths.portalBusiness, section: 'MY BUSINESS' },
  { label: 'Road Ready', href: aioPaths.roadReady, section: 'MY BUSINESS' },
  { label: 'Fleet', href: aioPaths.portalFleet, section: 'MY BUSINESS' },
  { label: 'Insurance', href: aioPaths.portalInsurance, section: 'MY BUSINESS' },
  { label: 'Calendar', href: aioPaths.portalCalendar, section: 'MY BUSINESS' },
  { label: 'Renewals', href: aioPaths.portalRenewals, section: 'MY BUSINESS' },
  { label: 'Operations', href: aioPaths.portalOperations, section: 'OPERATIONS' },
  { label: 'Dispatch', href: aioPaths.portalDispatch, section: 'OPERATIONS' },
  { label: 'Brokerage', href: aioPaths.portalBrokerage, section: 'OPERATIONS' },
  { label: 'Money', href: aioPaths.portalMoney, section: 'MONEY' },
  { label: 'Billing', href: aioPaths.portalBilling, section: 'MONEY' },
  { label: 'Factoring', href: aioPaths.portalFactoring, section: 'MONEY' },
  { label: 'Bookkeeping', href: aioPaths.portalBookkeeping, section: 'MONEY' },
  { label: 'Documents', href: aioPaths.portalDocuments, section: 'DOCUMENTS' },
  { label: 'Vault', href: aioPaths.portalVault, section: 'DOCUMENTS' },
  { label: 'Messages', href: aioPaths.portalMessages, section: 'COMMUNICATION' },
  { label: 'Appointments', href: aioPaths.portalAppointments, section: 'COMMUNICATION' },
  { label: 'Notifications', href: aioPaths.portalNotifications, section: 'COMMUNICATION' },
  { label: 'Service Requests', href: aioPaths.portalRequestsCenter, section: 'ACCOUNT' },
  { label: 'Team', href: aioPaths.portalTeam, section: 'ACCOUNT' },
  { label: 'Settings', href: aioPaths.portalSettings, section: 'ACCOUNT' },
];

const shipperNav: NavItem[] = [
  { label: 'Shipper Home', href: aioPaths.shipper },
  { label: 'Shipments', href: aioPaths.shipperShipments },
  { label: 'Quotes', href: aioPaths.shipperQuotes },
  { label: 'Billing', href: aioPaths.shipperBilling },
  { label: 'Messages', href: aioPaths.portalMessages },
  { label: 'Notifications', href: aioPaths.portalNotifications },
];

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
  const nav = portalKind === 'shipper' ? shipperNav : carrierNav;

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
