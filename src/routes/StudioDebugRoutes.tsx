/**
 * TEMPORARY public debug routes — remove when Experience Lab is stable.
 * Registered in main.tsx BEFORE App (no AdminGuard, workspace bootstrap, or admin layout).
 */
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import StudioHealthDebugPage from '../pages/debug/studio-health/page';
import ChunkDebugPage from '../pages/debug/chunk-debug/page';
import BootDebugPage from '../pages/debug/boot-debug/page';
import ThreadHeartbeatDebugPage from '../pages/debug/thread-heartbeat/page';
import ExperienceLabSafeDebugPage from '../pages/debug/experience-lab-safe/page';
import ExperienceEngineBisectPage from '../pages/debug/experience-engine-bisect/page';
import ExperienceEngineFreezeReportPage from '../pages/debug/experience-engine-freeze-report/page';
import { DebugRouteErrorBoundary } from '../pages/debug/DebugRouteErrorBoundary';
import { RootAppErrorBoundary } from './RootAppErrorBoundary';
import LoadingScreen from '../components/base/LoadingScreen';

const App = lazy(() => import('../App'));

export const STUDIO_DEBUG_PATHS = [
  '/__studio-health',
  '/__chunk-debug',
  '/__boot-debug',
  '/__thread-heartbeat',
  '/__experience-lab-safe',
  '/__experience-engine-bisect',
  '/__experience-engine-freeze-report',
] as const;

export function isStudioDebugPath(pathname: string): boolean {
  return (STUDIO_DEBUG_PATHS as readonly string[]).includes(pathname);
}

export default function StudioDebugRoutes() {
  return (
    <Routes>
      <Route path="/__studio-health" element={<StudioHealthDebugPage />} />
      <Route path="/__chunk-debug" element={<ChunkDebugPage />} />
      <Route
        path="/__boot-debug"
        element={
          <DebugRouteErrorBoundary route="/__boot-debug">
            <BootDebugPage />
          </DebugRouteErrorBoundary>
        }
      />
      <Route path="/__thread-heartbeat" element={<ThreadHeartbeatDebugPage />} />
      <Route path="/__experience-lab-safe" element={<ExperienceLabSafeDebugPage />} />
      <Route path="/__experience-engine-bisect" element={<ExperienceEngineBisectPage />} />
      <Route path="/__experience-engine-freeze-report" element={<ExperienceEngineFreezeReportPage />} />
      <Route
        path="*"
        element={
          <RootAppErrorBoundary>
            <Suspense fallback={<LoadingScreen source="App.lazy" />}>
              <App />
            </Suspense>
          </RootAppErrorBoundary>
        }
      />
    </Routes>
  );
}
