import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DESKTOP_NAV_QUICK_ROUTES,
  buildDesktopQuickRouteHref,
  resolveDesktopNavActiveLabel,
} from '../../constants/desktopNavQuickRoutes';
import { useDesktopTowerTravelOptional } from '../desktop-tower/DesktopTowerNavProvider';
import { desktopNavBarStyle } from './desktopLobbyAcrylic';
import { readCartCountFromStorage } from '../../utils/cartLocalStorage';
import { DESKTOP_BOOKING_SUITE_PATH } from '../../constants/transformationSuite';
import { DESKTOP_ALERTS_PATH } from '../../constants/desktopNotifications';
import {
  DESKTOP_ACCOUNT_HUB_PATH,
  DESKTOP_SHOPPING_BAG_PATH,
  resolveAccountHubPath,
  resolveShoppingBagPath,
} from '../../utils/desktopCommerceRoutes';

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const towerTravel = useDesktopTowerTravelOptional();
  const [cartCount, setCartCount] = useState(0);

  /** Express transport to exact zone/room — no elevator; floor directory owns that journey. */
  const go = (href: string) => {
    if (towerTravel) towerTravel.quickTravelTo(href);
    else navigate(href);
  };

  const activeLink = resolveDesktopNavActiveLabel(location.pathname, location.search);
  const accountHubPath = resolveAccountHubPath(location.pathname);
  const shoppingBagPath = resolveShoppingBagPath(location.pathname);
  const bookingSuiteActive = location.pathname === DESKTOP_BOOKING_SUITE_PATH;
  const alertsActive = location.pathname === DESKTOP_ALERTS_PATH;
  const accountActive = location.pathname === DESKTOP_ACCOUNT_HUB_PATH;
  const shoppingBagActive = location.pathname === DESKTOP_SHOPPING_BAG_PATH;

  useEffect(() => {
    const syncCart = () => {
      setCartCount(readCartCountFromStorage());
    };
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    window.addEventListener('cartCountUpdated', syncCart);
    window.addEventListener('cartItemsChanged', syncCart);
    return () => {
      window.removeEventListener('cartUpdated', syncCart);
      window.removeEventListener('cartCountUpdated', syncCart);
      window.removeEventListener('cartItemsChanged', syncCart);
    };
  }, []);

  const homeRoute = DESKTOP_NAV_QUICK_ROUTES.find((r) => r.label === 'HOME')!;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-10"
      style={{
        height: '68px',
        ...desktopNavBarStyle,
      }}
    >
      <button
        onClick={() => go(buildDesktopQuickRouteHref(homeRoute))}
        className="flex items-center flex-shrink-0"
        style={{ fontFamily: '"Futura PT Medium"', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ fontSize: '17px', letterSpacing: '0.09em', textTransform: 'uppercase', color: '#1A1A1A' }}>
          FRONTAL
        </span>
        <span style={{ fontSize: '17px', letterSpacing: '0.09em', textTransform: 'uppercase', color: '#C81C24' }}>
          &nbsp;SLAYER
        </span>
      </button>

      <div className="flex items-center gap-8">
        {DESKTOP_NAV_QUICK_ROUTES.map((link) => (
          <button
            key={link.label}
            onClick={() => go(buildDesktopQuickRouteHref(link))}
            className="relative"
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '10px',
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: activeLink === link.label ? '#C81C24' : '#1A1A1A',
              transition: 'color 0.15s ease',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (activeLink !== link.label)
                (e.currentTarget as HTMLButtonElement).style.color = '#C81C24';
            }}
            onMouseLeave={(e) => {
              if (activeLink !== link.label)
                (e.currentTarget as HTMLButtonElement).style.color = '#1A1A1A';
            }}
          >
            {link.label}
            {activeLink === link.label && (
              <span
                className="absolute left-0 right-0"
                style={{ bottom: '-2px', height: '1px', background: '#C81C24', display: 'block' }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-5">
        <button
          className="hover:opacity-50 transition-opacity"
          onClick={() => go(buildDesktopQuickRouteHref(DESKTOP_NAV_QUICK_ROUTES.find((r) => r.label === 'SHOP')!))}
          aria-label="Search"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        <button
          className="hover:opacity-50 transition-opacity"
          onClick={() => go(DESKTOP_ALERTS_PATH)}
          aria-label="Alerts"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={alertsActive ? '#C81C24' : '#1A1A1A'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <button
          className="hover:opacity-50 transition-opacity"
          onClick={() => go(DESKTOP_BOOKING_SUITE_PATH)}
          aria-label="The Transformation Suite"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={bookingSuiteActive ? '#C81C24' : '#1A1A1A'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
          </svg>
        </button>

        <button
          className="hover:opacity-50 transition-opacity"
          onClick={() => navigate(accountHubPath)}
          aria-label="Account"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accountActive ? '#C81C24' : '#1A1A1A'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        <button
          className="relative hover:opacity-50 transition-opacity"
          onClick={() => navigate(shoppingBagPath)}
          aria-label="Cart"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={shoppingBagActive ? '#C81C24' : '#1A1A1A'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: '#C81C24',
                fontFamily: '"Futura PT Medium"',
                fontSize: '9px',
                color: '#fff',
              }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
