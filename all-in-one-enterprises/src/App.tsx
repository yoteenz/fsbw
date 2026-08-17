import { Suspense } from 'react';
import AllInOneRoutes, { AllInOneLoading } from './routes/AllInOneRoutes';
import './styles/aio.css';
import './styles/aio-mobile.css';
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
