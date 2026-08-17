import { Link, useLocation } from 'react-router-dom';
import { shouldShowDebugBanner } from '../../config/dataMode';
import { layoutPreviewPathForMode, layoutPreviewModeFromPath } from '../../utils/layoutPreviewPaths';

const MODES = [
  { id: 'responsive' as const, label: 'Responsive' },
  { id: 'desktop' as const, label: 'Desktop' },
  { id: 'mobile' as const, label: 'Mobile' },
];

/** Preview-only layout switcher for all AIO pages (demo/debug). */
export function AioLayoutPreviewBar() {
  const { pathname, search } = useLocation();
  const current = layoutPreviewModeFromPath(pathname);

  if (!shouldShowDebugBanner()) {
    return null;
  }

  return (
    <div className="aio-layout-preview-bar" role="toolbar" aria-label="AIO layout preview">
      <span className="aio-layout-preview-bar__label">Layout preview</span>
      <div className="aio-layout-preview-bar__modes">
        {MODES.map((mode) => (
          <Link
            key={mode.id}
            to={`${layoutPreviewPathForMode(pathname, mode.id)}${search}`}
            className={`aio-layout-preview-bar__mode ${current === mode.id ? 'aio-layout-preview-bar__mode--active' : ''}`}
            aria-current={current === mode.id ? 'page' : undefined}
          >
            {mode.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
