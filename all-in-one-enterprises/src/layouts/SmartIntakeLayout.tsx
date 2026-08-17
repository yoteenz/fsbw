import { Outlet } from 'react-router-dom';
import { AIODebugBanner } from '../components/AIODebugBanner';

/** Focused Smart Intake shell — no public nav/footer. */
export function SmartIntakeLayout() {
  return (
    <div className="aio-app aio-app--smart-intake">
      <AIODebugBanner />
      <main id="aio-main-content" className="si-main">
        <Outlet />
      </main>
    </div>
  );
}
