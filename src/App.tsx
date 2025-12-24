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
const NoirUnitPage = lazy(() => import('./pages/straight/noir/page'));
const BlancoUnitPage = lazy(() => import('./pages/straight/blanco/page'));
const SoftCurlUnitPage = lazy(() => import('./pages/curly/soft-curl/page'));
const SoftWaveUnitPage = lazy(() => import('./pages/wavy/soft-wave/page'));
const OceanCurlUnitPage = lazy(() => import('./pages/curly/ocean-curl/page'));
const BeachWaveUnitPage = lazy(() => import('./pages/wavy/beach-wave/page'));
const WishlistPage = lazy(() => import('./pages/wishlist/page'));
const AccountPage = lazy(() => import('./pages/account/page'));
const OrdersPage = lazy(() => import('./pages/orders/page'));
const SignInPage = lazy(() => import('./pages/sign-in/page'));
const ShoppingBagPage = lazy(() => import('./pages/shopping-bag/page'));
const CheckoutPage = lazy(() => import('./pages/checkout/page'));
const CheckoutConfirmPage = lazy(() => import('./pages/checkout/confirm/page'));
const StraightUnitsPage = lazy(() => import('./pages/units/straight/page'));
const WavyUnitsPage = lazy(() => import('./pages/units/wavy/page'));
const CurlyUnitsPage = lazy(() => import('./pages/units/curly/page'));
const ProductsPage = lazy(() => import('./pages/products/page'));
const ProductsUnitsPage = lazy(() => import('./pages/products/units/page'));
const ToolsPage = lazy(() => import('./pages/tools/page'));
const GiftCardPage = lazy(() => import('./pages/tools/gift-card/page'));

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
        {/* Unit page routes - placed early to ensure proper matching */}
        <Route path="/curly/soft-curl" element={
          <Suspense fallback={<LoadingScreen />}>
            <SoftCurlUnitPage />
          </Suspense>
        } />
        <Route path="/wavy/soft-wave" element={
          <Suspense fallback={<LoadingScreen />}>
            <SoftWaveUnitPage />
          </Suspense>
        } />
        <Route path="/wavy/beach-wave" element={
          <Suspense fallback={<LoadingScreen />}>
            <BeachWaveUnitPage />
          </Suspense>
        } />
        <Route path="/curly/ocean-curl" element={
          <Suspense fallback={<LoadingScreen />}>
            <OceanCurlUnitPage />
          </Suspense>
        } />
        <Route path="/straight/noir" element={
          <Suspense fallback={<LoadingScreen />}>
            <NoirUnitPage />
          </Suspense>
        } />
        <Route path="/straight/blanco" element={
          <Suspense fallback={<LoadingScreen />}>
            <BlancoUnitPage />
          </Suspense>
        } />
        {/* Build-a-wig routes - specific routes must come before general /build-a-wig route */}
        
        {/* Noir routes */}
        <Route path="/build-a-wig/noir/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/noir/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/noir/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/noir/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/noir/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/noir/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/noir/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/noir/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/noir/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/noir/edit" element={<BuildAWigPage />} />
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
        <Route path="/build-a-wig/noir" element={<BuildAWigPage />} />
        
        {/* Blanco routes */}
        <Route path="/build-a-wig/blanco/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/blanco/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/blanco/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/blanco/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/blanco/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/blanco/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/blanco/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/blanco/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/blanco/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/blanco/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/blanco/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/blanco/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/blanco/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/blanco/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/blanco/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/blanco/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/blanco/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/blanco/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/blanco/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/blanco/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/blanco" element={<BuildAWigPage />} />
        
        {/* Soft Wave routes */}
        <Route path="/build-a-wig/soft-wave/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-wave/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-wave/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-wave/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-wave/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-wave/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-wave/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-wave/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-wave/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-wave/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-wave/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-wave/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-wave/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-wave/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-wave/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-wave/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-wave/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-wave/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-wave/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-wave/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-wave" element={<BuildAWigPage />} />
        
        {/* Beach Wave routes */}
        <Route path="/build-a-wig/beach-wave/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/beach-wave/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/beach-wave/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/beach-wave/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/beach-wave/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/beach-wave/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/beach-wave/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/beach-wave/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/beach-wave/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/beach-wave/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/beach-wave/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/beach-wave/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/beach-wave/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/beach-wave/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/beach-wave/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/beach-wave/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/beach-wave/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/beach-wave/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/beach-wave/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/beach-wave/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/beach-wave" element={<BuildAWigPage />} />
        
        {/* Soft Curl routes */}
        <Route path="/build-a-wig/soft-curl/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-curl/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-curl/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-curl/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-curl/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-curl/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-curl/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-curl/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-curl/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-curl/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-curl/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-curl/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-curl/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-curl/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-curl/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-curl/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-curl/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-curl/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-curl/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-curl/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-curl" element={<BuildAWigPage />} />
        
        {/* Ocean Curl routes */}
        <Route path="/build-a-wig/ocean-curl/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/ocean-curl/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/ocean-curl/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/ocean-curl" element={<BuildAWigPage />} />
        
        {/* Legacy edit routes (for backward compatibility) */}
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
        <Route path="/units/straight" element={
          <Suspense fallback={<LoadingScreen />}>
            <StraightUnitsPage />
          </Suspense>
        } />
        <Route path="/units/wavy" element={
          <Suspense fallback={<LoadingScreen />}>
            <WavyUnitsPage />
          </Suspense>
        } />
        <Route path="/units/curly" element={
          <Suspense fallback={<LoadingScreen />}>
            <CurlyUnitsPage />
          </Suspense>
        } />
        <Route path="/shop/units" element={
          <Suspense fallback={<LoadingScreen />}>
            <ProductsUnitsPage />
          </Suspense>
        } />
        <Route path="/home/shop" element={
          <Suspense fallback={<LoadingScreen />}>
            <ProductsPage />
          </Suspense>
        } />
        <Route path="/tools" element={
          <Suspense fallback={<LoadingScreen />}>
            <ToolsPage />
          </Suspense>
        } />
        <Route path="/home/tools" element={
          <Suspense fallback={<LoadingScreen />}>
            <ToolsPage />
          </Suspense>
        } />
        <Route path="/tools/gift-card" element={
          <Suspense fallback={<LoadingScreen />}>
            <GiftCardPage />
          </Suspense>
        } />
        <Route path="/wishlist" element={
          <Suspense fallback={<LoadingScreen />}>
            <WishlistPage />
          </Suspense>
        } />
        <Route path="/account" element={
          <Suspense fallback={<LoadingScreen />}>
            <AccountPage />
          </Suspense>
        } />
        <Route path="/account/orders" element={
          <Suspense fallback={<LoadingScreen />}>
            <OrdersPage />
          </Suspense>
        } />
        <Route path="/sign-in" element={
          <Suspense fallback={<LoadingScreen />}>
            <SignInPage />
          </Suspense>
        } />
        <Route path="/bag" element={
          <Suspense fallback={<LoadingScreen />}>
            <ShoppingBagPage />
          </Suspense>
        } />
        <Route path="/checkout" element={
          <Suspense fallback={<LoadingScreen />}>
            <CheckoutPage />
          </Suspense>
        } />
        <Route path="/checkout/summary" element={
          <Suspense fallback={<LoadingScreen />}>
            <CheckoutConfirmPage />
          </Suspense>
        } />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;


