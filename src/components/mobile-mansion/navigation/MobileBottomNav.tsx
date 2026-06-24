import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  LobbyIcon,
  ConciergeIcon,
  PenthouseIcon,
  ProfileIcon,
} from '../icons/NavIcons';

type NavTab = {
  id: string;
  label: string;
  path: string;
  icon: typeof HomeIcon;
  matchPaths: string[];
};

const NAV_TABS: NavTab[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/mobile/home',
    icon: HomeIcon,
    matchPaths: ['/mobile/home', '/mobile/rewards'],
  },
  {
    id: 'lobby',
    label: 'Lobby',
    path: '/mobile/lobby',
    icon: LobbyIcon,
    matchPaths: ['/mobile/lobby', '/mobile/lounge'],
  },
  {
    id: 'concierge',
    label: 'Concierge',
    path: '/mobile/concierge',
    icon: ConciergeIcon,
    matchPaths: ['/mobile/concierge'],
  },
  {
    id: 'penthouse',
    label: 'Penthouse',
    path: '/mobile/penthouse',
    icon: PenthouseIcon,
    matchPaths: [
      '/mobile/penthouse',
      '/mobile/showroom',
      '/mobile/analysis',
      '/mobile/build-a-wig',
      '/mobile/slay-cam',
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/mobile/profile',
    icon: ProfileIcon,
    matchPaths: ['/mobile/profile'],
  },
];

function isTabActive(tab: NavTab, pathname: string): boolean {
  return tab.matchPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="mansion-bottom-nav" aria-label="Mansion navigation">
      <div className="mansion-bottom-nav__bar">
        {NAV_TABS.map((tab) => {
          const active = isTabActive(tab, location.pathname);
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              className={`mansion-bottom-nav__tab ${active ? 'mansion-bottom-nav__tab--active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-current={active ? 'page' : undefined}
            >
              <motion.div
                animate={active ? { y: -1 } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon className="mansion-bottom-nav__icon" />
              </motion.div>
              <span className="mansion-bottom-nav__label">{tab.label}</span>
              {active ? (
                <motion.span
                  className="mansion-bottom-nav__indicator"
                  layoutId="mansion-nav-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
