import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'HOME', path: '/desktop/lobby' },
  { label: 'SHOP', path: '/home/shop' },
  { label: 'BUILD-A-WIG', path: '/build-a-wig' },
  { label: 'SLAY CAM', path: '/tools/slay-cam' },
  { label: 'ANALYSIS', path: '/tools/live-try-on' },
  { label: 'MEMBERSHIP', path: '/account/membership' },
  { label: 'REWARDS', path: '/account/rewards' },
  { label: 'PSA', path: '/account/concierge' },
];

interface NavBarProps {
  activeLink?: string;
}

export function NavBar({ activeLink = 'HOME' }: NavBarProps) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = Array.isArray(cart)
          ? cart.reduce((acc: number, item: { quantity?: number }) => acc + (item.quantity || 1), 0)
          : 0;
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-10"
      style={{
        height: '68px',
        background: 'rgba(255,255,255,0.84)',
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      {/* Wordmark */}
      <button
        onClick={() => navigate('/desktop/lobby')}
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

      {/* Primary navigation */}
      <div className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.path)}
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

      {/* Icon cluster */}
      <div className="flex items-center gap-5">
        <button
          className="hover:opacity-50 transition-opacity"
          onClick={() => navigate('/home/shop')}
          aria-label="Search"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        <button
          className="hover:opacity-50 transition-opacity"
          onClick={() => navigate('/account/notifications')}
          aria-label="Notifications"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <button
          className="hover:opacity-50 transition-opacity"
          onClick={() => navigate('/account')}
          aria-label="Account"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        <button
          className="relative hover:opacity-50 transition-opacity"
          onClick={() => navigate('/shopping-bag')}
          aria-label="Cart"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
