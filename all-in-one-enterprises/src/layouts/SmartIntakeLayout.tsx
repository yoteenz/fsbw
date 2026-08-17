import { Outlet } from 'react-router-dom';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { useLayoutPreviewMode } from '../layout-preview/LayoutPreviewContext';
import { smartIntakeAppClass } from '../intake/smartIntakeLayoutMode';

/** Focused Smart Intake shell — no public nav/footer. */
export function SmartIntakeLayout() {
  const layoutMode = useLayoutPreviewMode();
  const appLayoutClass = smartIntakeAppClass(layoutMode);

  return (
    <div className={`aio-app aio-app--smart-intake${appLayoutClass ? ` ${appLayoutClass}` : ''}`}>
      <AIODebugBanner />
      <main id="aio-main-content" className="si-main">
        <Outlet />
      </main>
    </div>
  );
}
