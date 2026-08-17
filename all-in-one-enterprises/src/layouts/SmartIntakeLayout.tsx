import { Outlet, useLocation } from 'react-router-dom';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { SmartIntakePreviewBar } from '../components/smart-intake/SmartIntakePreviewBar';
import { smartIntakeAppClass } from '../intake/smartIntakeLayoutMode';
import type { SmartIntakeLayoutMode } from '../intake/smartIntakeLayoutMode';

function layoutModeFromPath(pathname: string): SmartIntakeLayoutMode {
  if (pathname.endsWith('/get-started/desktop')) return 'desktop';
  if (pathname.endsWith('/get-started/mobile')) return 'mobile';
  return 'responsive';
}

/** Focused Smart Intake shell — no public nav/footer. */
export function SmartIntakeLayout() {
  const { pathname } = useLocation();
  const layoutMode = layoutModeFromPath(pathname);
  const appLayoutClass = smartIntakeAppClass(layoutMode);

  return (
    <div className={`aio-app aio-app--smart-intake${appLayoutClass ? ` ${appLayoutClass}` : ''}`}>
      <AIODebugBanner />
      <SmartIntakePreviewBar />
      <main id="aio-main-content" className="si-main">
        <Outlet />
      </main>
    </div>
  );
}
