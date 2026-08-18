import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE00_ADMIN_NAV, SITE00_ADMIN_MOBILE_NAV } from '../../config/nav';
import { Site00AdminHeader } from './Site00AdminHeader';

type Site00AdminShellProps = {
  children: ReactNode;
  approvalBadge?: number;
};

export function Site00AdminShell({ children, approvalBadge }: Site00AdminShellProps) {
  const { pathname } = useLocation();

  return (
    <div className="site00-admin-shell">
      <div className="site00-admin-shell__layout">
        <aside className="site00-admin-sidebar" aria-label="SITE 00 admin navigation">
          <div className="site00-admin-sidebar__brand">
            SITE 00 <span aria-hidden="true">+</span>
          </div>
          <nav className="site00-admin-sidebar__nav">
            {SITE00_ADMIN_NAV.map((item) => {
              const active = pathname === item.href || (item.href !== '/admin/site00' && pathname.startsWith(item.href));
              const badge = item.id === 'approvals' ? approvalBadge : undefined;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`site00-admin-sidebar__link ${active ? 'site00-admin-sidebar__link--active' : ''}`.trim()}
                >
                  <span>{item.label}</span>
                  {badge ? <span className="site00-admin-sidebar__badge">{badge}</span> : null}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="site00-admin-main">
          <Site00AdminHeader />
          <div className="site00-admin-content">{children}</div>
        </div>
      </div>
      <nav className="site00-admin-mobile-nav" aria-label="Mobile admin navigation">
        <div className="site00-admin-mobile-nav__inner">
          {SITE00_ADMIN_MOBILE_NAV.map((item) => (
            <Link key={item.id} to={item.href} className={pathname.startsWith(item.href) ? 'active' : ''}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
