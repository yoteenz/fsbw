import { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import LoadingScreen from '../components/base/LoadingScreen';
import '../site00/admin/styles/site00-admin.css';

const Site00AdminDashboardPage = lazy(() => import('../site00/admin/pages/DashboardPage'));
const Site00AdminStudioPage = lazy(() => import('../site00/admin/pages/StudioPage'));
const Site00AdminApprovalsPage = lazy(() => import('../site00/admin/pages/ApprovalsPage'));
const Site00AdminProjectsPage = lazy(() => import('../site00/admin/pages/ProjectsPage'));
const Site00AdminProjectWorkspacePage = lazy(() => import('../site00/admin/pages/ProjectWorkspacePage'));
const Site00AdminPlaceholderPage = lazy(() => import('../site00/admin/pages/PlaceholderSectionPage'));

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

/** SITE 00 Admin Production OS routes — mounted under AdminGuard at /admin/site00/* */
export function Site00AdminRoutes() {
  return (
    <>
      <Route
        path="site00"
        element={
          <AdminSuspense>
            <Site00AdminDashboardPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/studio"
        element={
          <AdminSuspense>
            <Site00AdminStudioPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/studio/queue"
        element={
          <AdminSuspense>
            <Site00AdminStudioPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/approvals"
        element={
          <AdminSuspense>
            <Site00AdminApprovalsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/projects"
        element={
          <AdminSuspense>
            <Site00AdminProjectsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/projects/:projectId"
        element={
          <AdminSuspense>
            <Site00AdminProjectWorkspacePage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/projects/:projectId/:section"
        element={
          <AdminSuspense>
            <Site00AdminProjectWorkspacePage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/identities"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/bldr-intakes"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/leads"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/discovery"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/sites"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/finance"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/team"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/reports"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/settings"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/settings/studio/automation"
        element={
          <AdminSuspense>
            <Site00AdminPlaceholderPage />
          </AdminSuspense>
        }
      />
      <Route path="site00/*" element={<Navigate to="/admin/site00" replace />} />
    </>
  );
}
