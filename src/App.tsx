import { Routes, Route, useLocation } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode } from 'react';
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
// Admin pages
import AdminDashboard from './pages/admin/dashboard/page';
import AdminBrand from './pages/admin/brand/page';
import AdminClients from './pages/admin/clients/page';
import AdminClientsAccount from './pages/admin/clients/account/page';
import AdminMeetings from './pages/admin/meetings/page';
import AdminPending from './pages/admin/pending/page';
import AdminRevenue from './pages/admin/revenue/page';
import AdminReviews from './pages/admin/reviews/page';

// Use lazy loading for noir page like canonical backup
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

function App() {
  const location = useLocation();
  console.log('🔍 App.tsx rendering - Current pathname:', location.pathname);
  
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/build-a-wig" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/length" element={<LengthPage />} />
        <Route path="/build-a-wig/color" element={<ColorPage />} />
        <Route path="/build-a-wig/density" element={<DensityPage />} />
        <Route path="/build-a-wig/lace" element={<LacePage />} />
        <Route path="/build-a-wig/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/cap-size" element={<CapSizePage />} />
        <Route path="/build-a-wig/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/addons" element={<AddOnsPage />} />
        <Route path="/units/noir" element={
          <Suspense fallback={<LoadingScreen />}>
            <NoirUnitPage />
          </Suspense>
        } />
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/brand" element={<AdminBrand />} />
        <Route path="/admin/clients" element={<AdminClients />} />
        <Route path="/admin/clients/account" element={<AdminClientsAccount />} />
        <Route path="/admin/meetings" element={<AdminMeetings />} />
        <Route path="/admin/pending" element={<AdminPending />} />
        <Route path="/admin/revenue" element={<AdminRevenue />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;


