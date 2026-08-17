import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminGuard from '../components/AdminGuard';
import { Site00Provider } from '../site00/state/Site00Context';
import { SITE00_ROUTES } from '../site00/config/routes';
import { AsstsRouteSuspense } from '../site00/assts/components/AsstsRouteSuspense';
import { AsstsColdStartGate } from '../site00/assts/components/AsstsColdStartGate';
import { Site00RouteLoadingFallback } from '../site00/components/loader/Site00RouteLoadingFallback';
import { Site00WorldColdStartGate } from '../site00/components/loader/Site00WorldColdStartGate';
import { Site00TypographyBootstrap } from '../site00/components/Site00TypographyBootstrap';
/* Eager-load SITE 00 + ASSTS styles (lazy route CSS was not applying on mobile preview). */
import '../site00/styles/site00.css';
import '../site00/styles/site00-loader.css';
import '../site00/assts/styles/assts.css';
import '../site00/assts/styles/assts-depth.css';
import '../site00/assts/styles/assts-composition.css';
import '../site00/assts/styles/assts-library-home.css';

const Site00OriginPage = lazy(() => import('../site00/pages/OriginPage'));
const Site00EnterPage = lazy(() => import('../site00/pages/EnterPage'));
const Site00IdntyPage = lazy(() => import('../site00/pages/IdntyPage'));
const Site00IdntyStatePage = lazy(() => import('../site00/pages/IdntyStatePage'));
const Site00BldrPage = lazy(() => import('../site00/pages/BldrPage'));
const Site00BldrStatePage = lazy(() => import('../site00/pages/BldrStatePage'));
const AsstsLibraryPage = lazy(() => import('../site00/assts/pages/LibraryPage'));
const AsstsBatchesListPage = lazy(() => import('../site00/assts/pages/BatchesListPage'));
const AsstsBatchPage = lazy(() => import('../site00/assts/pages/BatchPage'));
const AsstsInspectionPage = lazy(() => import('../site00/assts/pages/InspectionPage'));
const AsstsLoaderPipelinePage = lazy(() => import('../site00/assts/pages/LoaderPipelinePage'));
const AsstsCompositionStudioPage = lazy(() => import('../site00/assts/pages/CompositionStudioPage'));
const AsstsSearchPage = lazy(() => import('../site00/assts/pages/SearchPage'));
const AsstsNotificationsPage = lazy(() => import('../site00/assts/pages/NotificationsPage'));
const AsstsProfilePage = lazy(() => import('../site00/assts/pages/ProfilePage'));

function Site00Suspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Site00RouteLoadingFallback />}>{children}</Suspense>;
}

function Site00Layout({ children }: { children: ReactNode }) {
  return (
    <Site00Provider>
      <Site00TypographyBootstrap />
      <Site00WorldColdStartGate>{children}</Site00WorldColdStartGate>
    </Site00Provider>
  );
}

/**
 * SITE 00 Foundation V1.1 routes.
 * Invoke as `{Site00Routes()}` inside `<Routes>`.
 *
 * `/` remains Frontal Slayer HomeLandingRedirect unless VITE_SITE00_ROOT=1.
 * SITE 00 Origin is always available at `/origin`.
 */
export function Site00Routes() {
  const site00Root = import.meta.env.VITE_SITE00_ROOT === '1';

  return (
    <>
      {site00Root ? (
        <Route
          index
          element={
            <Site00Layout>
              <Site00Suspense>
                <Site00OriginPage />
              </Site00Suspense>
            </Site00Layout>
          }
        />
      ) : null}
      {site00Root ? (
        <Route
          path="/"
          element={
            <Site00Layout>
              <Site00Suspense>
                <Site00OriginPage />
              </Site00Suspense>
            </Site00Layout>
          }
        />
      ) : null}
      <Route
        path={SITE00_ROUTES.originAlias}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00OriginPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.enter}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00EnterPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.idnty}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00IdntyPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.idntyState}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00IdntyStatePage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.bldr}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00BldrPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.bldrState}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00BldrStatePage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      {/* ASSTS Asset Vault — admin-only internal review surface */}
      <Route path="/assts" element={<AdminGuard />}>
        <Route element={<AsstsColdStartGate />}>
          <Route
            index
            element={
              <AsstsRouteSuspense>
                <AsstsLibraryPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="composition-studio"
            element={
              <AsstsRouteSuspense>
                <AsstsCompositionStudioPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="batches"
            element={
              <AsstsRouteSuspense>
                <AsstsBatchesListPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="batches/:batchId"
            element={
              <AsstsRouteSuspense>
                <AsstsBatchPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="loader-pipeline"
            element={
              <AsstsRouteSuspense>
                <AsstsLoaderPipelinePage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="search"
            element={
              <AsstsRouteSuspense>
                <AsstsSearchPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="notifications"
            element={
              <AsstsRouteSuspense>
                <AsstsNotificationsPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="profile"
            element={
              <AsstsRouteSuspense>
                <AsstsProfilePage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path=":assetId"
            element={
              <AsstsRouteSuspense>
                <AsstsInspectionPage />
              </AsstsRouteSuspense>
            }
          />
        </Route>
      </Route>
      {/* Reserved future namespaces — redirect to origin until implemented */}
      <Route path="/bluprint/*" element={<Navigate to={SITE00_ROUTES.originAlias} replace />} />
      <Route path="/build/*" element={<Navigate to={SITE00_ROUTES.originAlias} replace />} />
      <Route path="/control/*" element={<Navigate to={SITE00_ROUTES.originAlias} replace />} />
      <Route path="/live/*" element={<Navigate to={SITE00_ROUTES.originAlias} replace />} />
    </>
  );
}
