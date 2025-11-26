import { Routes, Route, useLocation } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import LobbyPage from './pages/lobby/page';
import BuildAWigPage from './pages/build-a-wig/page';
import LengthPage from './pages/build-a-wig/length/page';
import ColorPage from './pages/build-a-wig/color/page';
import DensityPage from './pages/build-a-wig/density/page';
import LacePage from './pages/build-a-wig/lace/page';
import TexturePage from './pages/build-a-wig/texture/page';
import HairlinePage from './pages/build-a-wig/hairline/page';
import CapSizePage from './pages/build-a-wig/cap-size/page';
import StylingPage from './pages/build-a-wig/styling/page';
import AddOnsPage from './pages/build-a-wig/addons/page';
import { lazy, Suspense } from 'react';
import LoadingScreen from './components/base/LoadingScreen';

// Use lazy loading for admin pages and noir page (like canonical backup)
const AdminDashboard = lazy(() => import('./pages/admin/dashboard/page'));
const AdminBrand = lazy(() => import('./pages/admin/brand/page'));
const AdminClients = lazy(() => import('./pages/admin/clients/page'));
const AdminClientsAccount = lazy(() => import('./pages/admin/clients/account/page'));
const AdminMeetings = lazy(() => import('./pages/admin/meetings/page'));
const AdminPending = lazy(() => import('./pages/admin/pending/page'));
const AdminRevenue = lazy(() => import('./pages/admin/revenue/page'));
const AdminReviews = lazy(() => import('./pages/admin/reviews/page'));
const NoirUnitPage = lazy(() => import('./pages/build-a-wig/units/noir/page'));

// Error Boundary to catch component errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'red',
          color: 'white',
          padding: '20px',
          fontSize: '24px',
          zIndex: 99999
        }}>
          <h1>ERROR: Component Failed to Load</h1>
          <p>{this.state.error?.message}</p>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to ensure BuildAWigPage only renders on correct route
const BuildAWigPageWrapper = () => {
  const location = useLocation();
  
  // Only render BuildAWigPage if we're on the exact /build-a-wig route
  if (location.pathname !== '/build-a-wig') {
    return null;
  }
  
  return <BuildAWigPage />;
};

function App() {
  const location = useLocation();
  console.log('🔍 App.tsx rendering - Current pathname:', location.pathname);
  
  // Additional safeguard: if we're on root and somehow BuildAWigPage is rendering, log it
  useEffect(() => {
    if (location.pathname === '/' && window.location.pathname !== '/') {
      console.error('⚠️ Route mismatch detected!');
    }
  }, [location.pathname]);
  
  return (
    <ErrorBoundary>
      <Routes>
        <Route index element={<LobbyPage />} />
        <Route path="/" element={<LobbyPage />} />
        {/* Admin routes - placed before build-a-wig routes for proper matching */}
        <Route path="/admin/dashboard" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="/admin/brand" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminBrand />
          </Suspense>
        } />
        <Route path="/admin/clients/account" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminClientsAccount />
          </Suspense>
        } />
        <Route path="/admin/clients" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminClients />
          </Suspense>
        } />
        <Route path="/admin/meetings" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminMeetings />
          </Suspense>
        } />
        <Route path="/admin/pending" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminPending />
          </Suspense>
        } />
        <Route path="/admin/revenue" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminRevenue />
          </Suspense>
        } />
        <Route path="/admin/reviews" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminReviews />
          </Suspense>
        } />
        {/* Build-a-wig routes - specific routes must come before general /build-a-wig route */}
        {/* Edit mode routes */}
        <Route path="/build-a-wig/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/edit" element={<BuildAWigPage />} />
        
        {/* Customize mode routes */}
        <Route path="/build-a-wig/noir/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/noir/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/noir/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/noir/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/noir/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/noir/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/noir/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/noir/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/noir/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/noir/customize" element={<BuildAWigPage />} />
        
        {/* Main build-a-wig routes */}
        <Route path="/build-a-wig/length" element={<LengthPage />} />
        <Route path="/build-a-wig" element={<BuildAWigPageWrapper />} />
        <Route path="/build-a-wig/color" element={<ColorPage />} />
        <Route path="/build-a-wig/density" element={<DensityPage />} />
        <Route path="/build-a-wig/lace" element={<LacePage />} />
        <Route path="/build-a-wig/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/addons" element={<AddOnsPage />} />
        <Route path="/units/noir" element={
          <Suspense fallback={<LoadingScreen />}>
            <NoirUnitPage />
          </Suspense>
        } />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;


