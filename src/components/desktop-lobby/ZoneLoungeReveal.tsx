import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { desktopArtboardHeightStyle } from '../../utils/desktopPreview';
import { GlassPanel } from './ui/GlassPanel';
import { RedButton, GhostButton } from './ui/Buttons';

// Slay Status Panel
function SlayStatusPanel() {
  const navigate = useNavigate();
  const [pointsVisible, setPointsVisible] = useState(false);
  const [displayPoints, setDisplayPoints] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const TARGET_POINTS = 2450;
  const NEXT_THRESHOLD = 3000;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPointsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (panelRef.current) observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pointsVisible) return;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPoints(Math.round(eased * TARGET_POINTS));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [pointsVisible]);

  const progressPct = (TARGET_POINTS / NEXT_THRESHOLD) * 100;

  return (
    <div ref={panelRef} className="flex flex-col gap-4" style={{ width: '220px' }}>
      {/* Member card */}
      <GlassPanel style={{ padding: '20px 18px' }}>
        {/* Avatar + tier */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid rgba(200,28,36,0.35)' }}
          >
            <img
              src="/assets/psa-avatar-neutral-smiling.png"
              alt="Member"
              className="w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).src = '/assets/psa-avatar-neutral.png'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full mb-0.5"
              style={{ background: 'rgba(200,28,36,0.08)', border: '1px solid rgba(200,28,36,0.2)' }}
            >
              <span
                className="text-[8px] tracking-[0.12em] uppercase"
                style={{ fontFamily: '"Futura PT Medium"', color: '#C81C24' }}
              >
                PREMIUM MEMBER
              </span>
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.06em]"
              style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
            >
              Since May 22, 2025
            </div>
          </div>
        </div>

        {/* Status label */}
        <div
          className="text-[9px] tracking-[0.18em] uppercase mb-3"
          style={{ fontFamily: '"Futura PT Medium"', color: '#959B9B' }}
        >
          YOUR SLAY STATUS
        </div>

        {/* Points */}
        <div className="mb-1">
          <div
            className="text-3xl tracking-[-0.02em]"
            style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
          >
            {displayPoints.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <div
              className="text-[9px] tracking-[0.06em]"
              style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
            >
              LOYALTY POINTS
            </div>
            <button
              onClick={() => navigate('/account/rewards')}
              className="text-[9px] tracking-[0.08em] uppercase"
              style={{ fontFamily: '"Futura PT Medium"', color: '#C81C24' }}
            >
              NEXT: {NEXT_THRESHOLD.toLocaleString()} →
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-full rounded-full overflow-hidden mb-4"
          style={{ height: '4px', background: 'rgba(26,26,26,0.08)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-[1.4s] ease-out"
            style={{
              width: pointsVisible ? `${progressPct}%` : '0%',
              background: 'linear-gradient(90deg, #C81C24, #E54050)',
            }}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'REWARDS', count: 5 },
            { label: 'ANALYSES', count: 3 },
            { label: 'BUILDS', count: 8 },
            { label: 'WISHLIST', count: 12 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
              style={{ background: 'rgba(26,26,26,0.04)', border: '1px solid rgba(26,26,26,0.06)' }}
            >
              <span
                className="text-[8px] tracking-[0.08em] uppercase"
                style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
              >
                {stat.label}
              </span>
              <span
                className="text-[11px]"
                style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
              >
                {stat.count}
              </span>
            </div>
          ))}
        </div>

        <GhostButton fullWidth size="sm" onClick={() => navigate('/account')}>
          VIEW DASHBOARD
        </GhostButton>
      </GlassPanel>
    </div>
  );
}

// Exclusive Content Grid
function ExclusiveContentGrid() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div
            className="text-[11px] tracking-[0.16em] uppercase"
            style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
          >
            EXCLUSIVE CONTENT
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.06em]"
            style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
          >
            For Our Slayers Only.
          </div>
        </div>
      </div>

      {/* Featured content */}
      <GlassPanel className="mb-3" hover>
        <div className="relative overflow-hidden rounded-xl" style={{ height: '160px' }}>
          <img
            src="/assets/final-lounge.png"
            alt="Founder Masterclass"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 20%' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div
              className="text-[8px] tracking-[0.16em] uppercase mb-1 text-white opacity-75"
              style={{ fontFamily: '"Futura PT Book"' }}
            >
              FOUNDER MASTERCLASS
            </div>
            <div
              className="text-sm text-white uppercase tracking-[0.06em]"
              style={{ fontFamily: '"Futura PT Medium"' }}
            >
              The Art of Luxury Hair
            </div>
          </div>
          {/* Play button */}
          <button
            onClick={() => navigate('/account/concierge')}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: 'rgba(200,28,36,0.9)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        </div>
        <div className="p-3">
          <RedButton size="sm" onClick={() => navigate('/account/concierge')}>
            WATCH NOW
          </RedButton>
        </div>
      </GlassPanel>

      {/* Secondary tiles */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: 'Behind the Brand', sub: 'The Journey' },
          { title: 'Hair Education', sub: 'Lace 101' },
          { title: 'Styling Secrets', sub: 'Pro Techniques' },
          { title: 'Member Live', sub: 'Q&A Replay' },
        ].map((tile) => (
          <GlassPanel
            key={tile.title}
            hover
            className="cursor-pointer"
            style={{ padding: '12px 14px' }}
          >
            <div
              className="text-[10px] tracking-[0.06em] mb-0.5 uppercase"
              style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
            >
              {tile.title}
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.05em]"
              style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
            >
              {tile.sub}
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

// Slay Cam Live
function SlayCamLiveGrid() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col" style={{ width: '260px' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div
            className="text-[11px] tracking-[0.16em] uppercase"
            style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
          >
            SLAY CAM LIVE
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.06em]"
            style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
          >
            Real Slayers. Real Styles.
          </div>
        </div>
        <button
          onClick={() => navigate('/slay-cam')}
          className="text-[9px] tracking-[0.1em] uppercase"
          style={{ fontFamily: '"Futura PT Medium"', color: '#C81C24' }}
        >
          VIEW ALL
        </button>
      </div>

      {/* 2x2 media grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { src: '/assets/NOIR/noir front.png', unit: 'NOIR' },
          { src: '/assets/BLANCO-FRONT.png', unit: 'BLANCO' },
          { src: '/assets/SOFT-WAVE FRONT.png', unit: 'SOFT WAVE' },
          { src: '/assets/SOFT CURL FRONT.JPG', unit: 'SOFT CURL' },
        ].map((item, i) => (
          <GlassPanel
            key={i}
            hover
            className="cursor-pointer overflow-hidden"
            style={{ padding: 0 }}
          >
            <div className="relative" style={{ height: '100px' }}>
              <img
                src={item.src}
                alt={item.unit}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 10%' }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
              >
                <div
                  className="text-[8px] tracking-[0.1em] uppercase text-white"
                  style={{ fontFamily: '"Futura PT Book"' }}
                >
                  {item.unit}
                </div>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Slay MVP */}
      <GlassPanel style={{ padding: '14px 16px' }}>
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-[9px] tracking-[0.14em] uppercase"
            style={{ fontFamily: '"Futura PT Medium"', color: '#959B9B' }}
          >
            SLAY MVP
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[7px] tracking-[0.1em] uppercase text-white"
            style={{ fontFamily: '"Futura PT Medium"', background: '#C81C24' }}
          >
            MAY 2025
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid rgba(200,28,36,0.35)' }}
          >
            <img
              src="/assets/psa-avatar-delighted.png"
              alt="MVP"
              className="w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).src = '/assets/psa-avatar-neutral.png'; }}
            />
          </div>
          <div>
            <div
              className="text-[10px] tracking-[0.06em] uppercase"
              style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
            >
              @theHairQueen
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.05em]"
              style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
            >
              Wearing: NOIR
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

// Lounge Navigation Bar
function LoungeNavBar() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  const NAV_ITEMS = [
    { label: 'MY CONTENT', path: '/account/concierge' },
    { label: 'COMMUNITY', path: '/slay-cam' },
    { label: 'MY REWARDS', path: '/account/rewards' },
    { label: 'MY BENEFITS', path: '/account/membership' },
    { label: 'EVENTS', path: '/account/concierge' },
    { label: 'PSA LOUNGE', path: '/account/concierge' },
  ];

  return (
    <div
      className="flex items-center justify-around pt-4 mt-4 border-t"
      style={{ borderColor: 'rgba(0,0,0,0.08)' }}
    >
      {NAV_ITEMS.map((item, i) => (
        <button
          key={item.label}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate(item.path)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 transition-all duration-200"
          style={{ transform: hovered === i ? 'translateY(-2px)' : 'translateY(0)' }}
        >
          <span
            className="text-[9px] tracking-[0.12em] uppercase transition-colors duration-150"
            style={{
              fontFamily: '"Futura PT Medium"',
              color: hovered === i ? '#C81C24' : '#1A1A1A',
            }}
          >
            {item.label}
          </span>
          <div
            className="w-1 h-1 rounded-full transition-colors duration-150"
            style={{ background: hovered === i ? '#C81C24' : 'transparent' }}
          />
        </button>
      ))}
    </div>
  );
}

// Zone 3 — The Lounge Reveal (full assembly)
export function ZoneLoungeReveal() {
  const dividerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (dividerRef.current) observer.observe(dividerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: '#FDF9F8',
        backgroundImage: 'url(/assets/mini-marble.png)',
        backgroundSize: '600px',
        minHeight: desktopArtboardHeightStyle(),
        paddingTop: '64px',
        paddingBottom: '48px',
      }}
    >
      {/* Warm marble overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(253,249,248,0.88)' }}
      />

      {/* Rose accent - right side */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none opacity-15"
        style={{ width: '280px', transform: 'translateX(60px)' }}
      >
        <img src="/assets/roses.png" alt="" className="w-full" />
      </div>

      <div className="relative z-10 px-16">
        {/* Zone header */}
        <div ref={dividerRef} className="mb-8">
          <div
            className="text-[10px] tracking-[0.22em] uppercase mb-1"
            style={{ fontFamily: '"Futura PT Medium"', color: '#959B9B' }}
          >
            LOUNGE EXPERIENCE
          </div>
          <div
            className="text-[11px] leading-snug uppercase tracking-[0.1em]"
            style={{ fontFamily: '"Futura PT Book"', color: '#1A1A1A', maxWidth: '320px' }}
          >
            Your private space. Your community. Your power.
          </div>
        </div>

        {/* 3-column layout */}
        <div
          className="flex gap-8"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          {/* Left: Slay Status */}
          <div
            style={{
              transform: visible ? 'translateX(0)' : 'translateX(-24px)',
              transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease',
              opacity: visible ? 1 : 0,
            }}
          >
            <SlayStatusPanel />
          </div>

          {/* Center: Exclusive Content */}
          <div
            className="flex-1"
            style={{
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'transform 0.7s 0.1s cubic-bezier(0.16,1,0.3,1), opacity 0.7s 0.1s ease',
              opacity: visible ? 1 : 0,
            }}
          >
            <ExclusiveContentGrid />
          </div>

          {/* Right: Slay Cam Live */}
          <div
            style={{
              transform: visible ? 'translateX(0)' : 'translateX(24px)',
              transition: 'transform 0.7s 0.15s cubic-bezier(0.16,1,0.3,1), opacity 0.7s 0.15s ease',
              opacity: visible ? 1 : 0,
            }}
          >
            <SlayCamLiveGrid />
          </div>
        </div>

        {/* Lounge navigation */}
        <LoungeNavBar />
      </div>
    </section>
  );
}
