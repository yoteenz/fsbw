import { NavLink } from 'react-router-dom';

const links = [
  { to: '/assts', label: 'Library', end: true },
  { to: '/assts#batches', label: 'Batches' },
];

export function AsstsMobileNav() {
  return (
    <nav className="site00-assts-mobile-nav" aria-label="ASSTS navigation">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          {link.label}
        </NavLink>
      ))}
      <a href="/origin" className="site00-assts-nav-exit">
        SITE 00
      </a>
    </nav>
  );
}

export function AsstsStatusBadge({ status }: { status: string }) {
  const cls = `site00-assts-status site00-assts-status--${status.toLowerCase().replace(/_/g, '-')}`;
  return <span className={cls}>{status.replace(/_/g, ' ')}</span>;
}
