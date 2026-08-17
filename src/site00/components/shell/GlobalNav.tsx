import { Link, useLocation } from 'react-router-dom';
import { SITE00_GLOBAL_NAV } from '../../config/navigation';
import { site00NavPathIsActive } from '../../config/routes';

export function GlobalNav() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Global navigation">
      <ul className="site00-global-nav">
        {SITE00_GLOBAL_NAV.map((item) => {
          const active = site00NavPathIsActive(pathname, item.href);
          if (!item.enabled) {
            return (
              <li key={item.id}>
                <button type="button" disabled aria-disabled="true" title="Coming in a future sprint">
                  {item.label}
                </button>
              </li>
            );
          }
          return (
            <li key={item.id}>
              <Link to={item.href} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
