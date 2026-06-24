import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Navigate } from 'react-router-dom';
import LoadingScreen from '../components/base/LoadingScreen';

const MobileHomePage = lazy(() => import('../pages/mobile/home/page'));
const MobileLobbyPage = lazy(() => import('../pages/mobile/lobby/page'));
const MobileConciergePage = lazy(() => import('../pages/mobile/concierge/page'));
const MobilePenthousePage = lazy(() => import('../pages/mobile/penthouse/page'));
const MobileShowroomPage = lazy(() => import('../pages/mobile/showroom/page'));
const MobileAnalysisPage = lazy(() => import('../pages/mobile/analysis/page'));
const MobileBuildAWigPage = lazy(() => import('../pages/mobile/build-a-wig/page'));
const MobileRewardsPage = lazy(() => import('../pages/mobile/rewards/page'));
const MobileSlayCamPage = lazy(() => import('../pages/mobile/slay-cam/page'));
const MobileLoungePage = lazy(() => import('../pages/mobile/lounge/page'));
const MobileProfilePage = lazy(() => import('../pages/mobile/profile/page'));

function MobileSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

/**
 * Mobile Mansion app shell routes.
 * Foundation only — no business logic, no Supabase, no ecommerce.
 */
export function MobileMansionRoutes() {
  return (
    <>
      <Route path="/mobile" element={<Navigate to="/mobile/home" replace />} />
      <Route
        path="/mobile/home"
        element={
          <MobileSuspense>
            <MobileHomePage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/lobby"
        element={
          <MobileSuspense>
            <MobileLobbyPage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/concierge"
        element={
          <MobileSuspense>
            <MobileConciergePage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/penthouse"
        element={
          <MobileSuspense>
            <MobilePenthousePage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/showroom"
        element={
          <MobileSuspense>
            <MobileShowroomPage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/analysis"
        element={
          <MobileSuspense>
            <MobileAnalysisPage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/build-a-wig"
        element={
          <MobileSuspense>
            <MobileBuildAWigPage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/rewards"
        element={
          <MobileSuspense>
            <MobileRewardsPage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/slay-cam"
        element={
          <MobileSuspense>
            <MobileSlayCamPage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/lounge"
        element={
          <MobileSuspense>
            <MobileLoungePage />
          </MobileSuspense>
        }
      />
      <Route
        path="/mobile/profile"
        element={
          <MobileSuspense>
            <MobileProfilePage />
          </MobileSuspense>
        }
      />
    </>
  );
}
