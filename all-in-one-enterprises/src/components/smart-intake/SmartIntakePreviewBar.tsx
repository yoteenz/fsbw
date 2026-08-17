import { Link, useLocation } from 'react-router-dom';
import { shouldShowDebugBanner } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

const MODES = [
  { id: 'responsive' as const, label: 'Responsive', path: aioPaths.getStarted },
  { id: 'desktop' as const, label: 'Desktop', path: aioPaths.getStartedDesktop },
  { id: 'mobile' as const, label: 'Mobile', path: aioPaths.getStartedMobile },
];

function activeMode(pathname: string): (typeof MODES)[number]['id'] {
  if (pathname.endsWith('/get-started/desktop')) return 'desktop';
  if (pathname.endsWith('/get-started/mobile')) return 'mobile';
  return 'responsive';
}

/** Preview-only layout switcher — does not appear in production customer UI. */
export function SmartIntakePreviewBar() {
  const { pathname, search } = useLocation();
  const current = activeMode(pathname);

  if (!shouldShowDebugBanner()) {
    return null;
  }

  return (
    <div className="si-preview-bar" role="toolbar" aria-label="Smart Intake layout preview">
      <span className="si-preview-bar__label">Layout preview</span>
      <div className="si-preview-bar__modes">
        {MODES.map((mode) => (
          <Link
            key={mode.id}
            to={`${mode.path}${search}`}
            className={`si-preview-bar__mode ${current === mode.id ? 'si-preview-bar__mode--active' : ''}`}
            aria-current={current === mode.id ? 'page' : undefined}
          >
            {mode.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
