import { NavLink, useLocation } from 'react-router-dom';

export function AsstsBottomDock() {
  const location = useLocation();
  const path = location.pathname;
  const onLibrary = path === '/assts';
  const onBatches = path === '/assts/batches' || path.startsWith('/assts/batches/');

  return (
    <div className="assts-bottom-dock-wrap">
      <nav className="assts-bottom-dock" aria-label="ASSTS navigation">
        <NavLink
          to="/assts"
          end
          className={`assts-bottom-dock__item ${onLibrary ? 'active' : ''}`}
        >
          <span className="assts-bottom-dock__glyph assts-bottom-dock__glyph--library" aria-hidden="true" />
          <span className="assts-bottom-dock__label">Library</span>
        </NavLink>
        <NavLink to="/assts/batches" className={`assts-bottom-dock__item ${onBatches ? 'active' : ''}`}>
          <span className="assts-bottom-dock__glyph assts-bottom-dock__glyph--batches" aria-hidden="true" />
          <span className="assts-bottom-dock__label">Batches</span>
        </NavLink>
        <NavLink to="/origin" className="assts-bottom-dock__item assts-bottom-dock__item--exit">
          <span className="assts-bottom-dock__glyph assts-bottom-dock__glyph--exit" aria-hidden="true" />
          <span className="assts-bottom-dock__label">Exit SITE 00</span>
        </NavLink>
      </nav>
    </div>
  );
}

/** @deprecated use AsstsBottomDock */
export const AsstsMobileNav = AsstsBottomDock;

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

export function AsstsStatusBadge({ status, variant = 'default' }: AsstsStatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const token = STATUS_CLASS[normalized] ?? (variant === 'review' ? 'needs-review' : variant === 'muted' ? 'queued' : 'queued');
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`assts-status assts-status--${token}`}>
      <span className="assts-status__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export type BatchViewMode = 'grid' | 'contact' | 'compare';

type ViewModeToggleProps = {
  mode: BatchViewMode;
  onChange: (mode: BatchViewMode) => void;
  showContact?: boolean;
  showCompare?: boolean;
};

export function AsstsViewModeToggle({ mode, onChange, showContact, showCompare }: ViewModeToggleProps) {
  return (
    <div className="assts-view-toggle" role="tablist" aria-label="Batch view mode">
      <button type="button" role="tab" aria-selected={mode === 'grid'} className={mode === 'grid' ? 'active' : ''} onClick={() => onChange('grid')}>
        GRID
      </button>
      {showContact ? (
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'contact'}
          className={mode === 'contact' ? 'active' : ''}
          onClick={() => onChange('contact')}
        >
          CONTACT SHEET
        </button>
      ) : null}
      {showCompare ? (
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'compare'}
          className={mode === 'compare' ? 'active' : ''}
          onClick={() => onChange('compare')}
        >
          COMPARE
        </button>
      ) : null}
    </div>
  );
}
