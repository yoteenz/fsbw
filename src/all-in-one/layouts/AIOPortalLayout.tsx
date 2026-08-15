import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AIOLogo } from '../components/AIOLogo';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { aioPaths } from '../utils/paths';

const portalNav = [
  { label: 'Dashboard', href: aioPaths.portal },
  { label: 'My Roadmap', href: aioPaths.roadmapResults },
  { label: 'Service Plan', href: aioPaths.servicePlan },
  { label: 'Permits & Registrations', href: aioPaths.permitting },
  { label: 'Insurance', href: aioPaths.insurance },
  { label: 'Dispatch', href: aioPaths.dispatching },
  { label: 'Factoring', href: aioPaths.portalFactoring },
  { label: 'Documents', href: aioPaths.portal },
  { label: 'Compliance Calendar', href: aioPaths.roadmap },
  { label: 'Support', href: aioPaths.contact },
];

export function AIOPortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

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
        <Outlet />
      </div>
    </div>
  );
}
