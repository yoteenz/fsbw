import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AIOAuthProvider } from '../auth/AIOAuthProvider';
import { LayoutPreviewRootLayout } from '../layout-preview/LayoutPreviewRootLayout';
import { layoutPreviewPaths } from '../utils/layoutPreviewPaths';
import { aioCoreRoutes } from './AioCoreRoutes';

export function AllInOneLoading() {
  return <div className="aio-loading">Loading All In One…</div>;
}

function AllInOneNotFound() {
  return (
    <div className="aio-page" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <h1 className="aio-display-md">Page not found</h1>
      <p className="aio-body" style={{ margin: '1rem 0 1.5rem' }}>
        That All In One route does not exist.
      </p>
      <Link to="" className="aio-btn aio-btn--gold">
        Back to home
      </Link>
    </div>
  );
}

export default function AllInOneRoutes() {
  return (
    <AIOAuthProvider>
      <Routes>
        {aioCoreRoutes}

        <Route path="desktop/*" element={<LayoutPreviewRootLayout mode="desktop" />}>
          {aioCoreRoutes}
        </Route>

        <Route path="mobile/*" element={<LayoutPreviewRootLayout mode="mobile" />}>
          {aioCoreRoutes}
        </Route>

        <Route path="get-started/desktop" element={<Navigate to={layoutPreviewPaths.desktopGetStarted} replace />} />
        <Route path="get-started/mobile" element={<Navigate to={layoutPreviewPaths.mobileGetStarted} replace />} />

        <Route path="*" element={<AllInOneNotFound />} />
      </Routes>
    </AIOAuthProvider>
  );
}
