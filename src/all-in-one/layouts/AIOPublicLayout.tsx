import { Outlet } from 'react-router-dom';
import { AIONav } from '../components/AIONav';
import { AIOFooter } from '../components/AIOFooter';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { AIOServicePlanBar } from '../components/AIOServicePlanBar';

export function AIOPublicLayout() {
  return (
    <div className="aio-app">
      <AIODebugBanner />
      <AIONav />
      <AIOServicePlanBar />
      <main id="aio-main-content">
        <Outlet />
      </main>
      <AIOFooter />
    </div>
  );
}
