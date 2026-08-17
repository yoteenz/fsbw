import { Suspense } from 'react';
import AllInOneRoutes, { AllInOneLoading } from './routes/AllInOneRoutes';
import './styles/aio.css';
import './styles/aio-mobile.css';
import './styles/aio-auth.css';
import './styles/aio-document-vault.css';
import './styles/aio-homepage-mobile.css';
import './styles/aio-homepage.css';
import './styles/aio-large-display.css';
import './styles/aio-fleetcare.css';
import './styles/aio-driverlink.css';
import './styles/aio-i18n.css';
import './styles/aio-name-check.css';
import './styles/aio-smart-intake.css';
import './styles/aio-mgmt.css';
import { AIODebugBanner } from './components/AIODebugBanner';

/** Standalone application shell — Sprint 22 */
export default function App() {
  return (
    <div className="aio-standalone-root">
      <AIODebugBanner />
      <Suspense fallback={<AllInOneLoading />}>
        <AllInOneRoutes />
      </Suspense>
    </div>
  );
}
