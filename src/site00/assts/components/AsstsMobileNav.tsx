import { NavLink } from 'react-router-dom';

const STATUS_CLASS: Record<string, string> = {
  QUEUED: 'queued',
  GENERATING: 'generating',
  NEEDS_REVIEW: 'needs-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REGENERATING: 'regenerating',
  VARIANT_REQUESTED: 'variant-requested',
  LOCKED: 'locked',
  FAILED: 'failed',
  IN_REVIEW: 'needs-review',
  READY_TO_LOCK: 'approved',
  PARTIALLY_APPROVED: 'needs-review',
  DRAFT: 'queued',
};

type AsstsStatusBadgeProps = {
  status: string;
  variant?: 'default' | 'review' | 'muted';
};

export function AsstsMobileNav() {
  return (
    <nav className="site00-assts-mobile-nav" aria-label="ASSTS navigation">
      <NavLink to="/assts" end className={({ isActive }) => (isActive ? 'active' : '')}>
        Library
      </NavLink>
      <NavLink to="/assts#batches" className={({ isActive }) => (isActive ? 'active' : '')}>
        Batches
      </NavLink>
      <NavLink to="/origin" className="site00-assts-nav-exit">
        Exit to SITE 00
      </NavLink>
    </nav>
  );
}

export function AsstsStatusBadge({ status, variant = 'default' }: AsstsStatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const token = STATUS_CLASS[normalized] ?? (variant === 'review' ? 'needs-review' : variant === 'muted' ? 'queued' : 'queued');
  const label = status.replace(/_/g, ' ');
  return <span className={`site00-assts-status site00-assts-status--${token}`}>{label}</span>;
}
