import { useState, useEffect, useRef } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for cart updates from existing cart system
  useEffect(() => {
    const syncCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = Array.isArray(cart) ? cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) : 0;
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
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : '#FFFFFF',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/desktop/lobby')}
        className="flex items-center gap-1 flex-shrink-0"
        style={{ fontFamily: '"Futura PT Medium"' }}
      >
        <span
          className="text-xl tracking-[0.08em] uppercase"
          style={{ color: '#1A1A1A', letterSpacing: '0.06em' }}
        >
          FRONTAL
        </span>
        <span
          className="text-xl tracking-[0.08em] uppercase"
          style={{ color: '#C81C24', letterSpacing: '0.06em' }}
        >
          &nbsp;SLAYER
        </span>
      </button>

      {/* Nav Links */}
      <div className="flex items-center gap-7">
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.path)}
            className="relative text-[11px] tracking-[0.1em] uppercase transition-colors duration-150"
            style={{
              fontFamily: '"Futura PT Medium"',
              color: activeLink === link.label ? '#C81C24' : '#1A1A1A',
            }}
            onMouseEnter={(e) => {
              if (activeLink !== link.label) {
                (e.currentTarget as HTMLButtonElement).style.color = '#C81C24';
              }
            }}
            onMouseLeave={(e) => {
              if (activeLink !== link.label) {
                (e.currentTarget as HTMLButtonElement).style.color = '#1A1A1A';
              }
            }}
          >
            {link.label}
            {activeLink === link.label && (
              <div
                className="absolute -bottom-0.5 left-0 right-0 h-0.5"
                style={{ background: '#C81C24' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <button
          className="transition-opacity hover:opacity-60"
          onClick={() => navigate('/home/shop')}
          aria-label="Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {/* Bell */}
        <button
          className="transition-opacity hover:opacity-60"
          onClick={() => navigate('/account/notifications')}
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Profile */}
        <button
          className="transition-opacity hover:opacity-60"
          onClick={() => navigate('/account')}
          aria-label="Account"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* Cart */}
        <button
          className="relative transition-opacity hover:opacity-60"
          onClick={() => navigate('/shopping-bag')}
          aria-label="Cart"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-futura"
              style={{ background: '#C81C24', fontFamily: '"Futura PT Medium"' }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
