import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import AdminGuard from './components/AdminGuard';
import AccountRouteGuard from './components/AccountRouteGuard';

// Helper to wrap lazy imports with retry logic and logging
const lazyWithLogging = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/31ad2c1c-bc12-4215-a008-3d30eef31493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:18',message:'Lazy import attempt',data:{componentName,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Retry logic for chunk loading failures (common on Vercel)
    const retryImport = async (retries = 3, delay = 1000): Promise<any> => {
      for (let i = 0; i < retries; i++) {
        try {
          const module = await importFn();
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/31ad2c1c-bc12-4215-a008-3d30eef31493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:21',message:'Lazy import success',data:{componentName,attempt:i+1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return module;
        } catch (error: any) {
          const isChunkError = error.message?.includes('Failed to fetch') || 
                               error.message?.includes('Loading chunk') ||
                               error.message?.includes('MIME type') ||
                               error.message?.includes('text/html') ||
                               error.name === 'ChunkLoadError';
          
          if (isChunkError && i < retries - 1) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/31ad2c1c-bc12-4215-a008-3d30eef31493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:26',message:'Lazy import retry',data:{componentName,attempt:i+1,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            // Wait before retrying, with exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            // Force reload chunk by adding cache busting query param
            if (error.message?.includes('Failed to fetch') || error.message?.includes('Loading chunk')) {
              // Clear module cache and retry
              if (typeof window !== 'undefined' && 'caches' in window) {
                try {
                  const cacheNames = await caches.keys();
                  await Promise.all(cacheNames.map(name => caches.delete(name)));
                } catch (e) {
                  // Ignore cache clearing errors
                }
              }
            }
            continue;
          }
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/31ad2c1c-bc12-4215-a008-3d30eef31493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:26',message:'Lazy import failed',data:{componentName,errorMessage:error.message,errorStack:error.stack?.substring(0,200),isMimeTypeError:error.message.includes('MIME type')||error.message.includes('text/html'),attempts:i+1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          throw error;
        }
      }
      throw new Error(`Failed to load ${componentName} after ${retries} attempts`);
    };
    
    return retryImport();
  });
};

// Use lazy loading for admin pages and noir page (like canonical backup)
const AdminDashboard = lazyWithLogging(() => import('./pages/admin/dashboard/page'), 'AdminDashboard');
const AdminBrand = lazyWithLogging(() => import('./pages/admin/brand/page'), 'AdminBrand');
const AdminClients = lazyWithLogging(() => import('./pages/admin/clients/page'), 'AdminClients');
const AdminClientsAccount = lazyWithLogging(() => import('./pages/admin/clients/account/page'), 'AdminClientsAccount');
const AdminDeletedAccounts = lazyWithLogging(() => import('./pages/admin/clients/deleted/page'), 'AdminDeletedAccounts');
const AdminMeetings = lazyWithLogging(() => import('./pages/admin/meetings/page'), 'AdminMeetings');
const AdminPending = lazyWithLogging(() => import('./pages/admin/pending/page'), 'AdminPending');
const AdminRevenue = lazyWithLogging(() => import('./pages/admin/revenue/page'), 'AdminRevenue');
const AdminReviews = lazyWithLogging(() => import('./pages/admin/reviews/page'), 'AdminReviews');
const AdminReferrals = lazyWithLogging(() => import('./pages/admin/referrals/page'), 'AdminReferrals');
const AdminAnalytics = lazyWithLogging(() => import('./pages/admin/analytics/page'), 'AdminAnalytics');
const NoirUnitPage = lazyWithLogging(() => import('./pages/straight/noir/page'), 'NoirUnitPage');
const BlancoUnitPage = lazyWithLogging(() => import('./pages/straight/blanco/page'), 'BlancoUnitPage');
const SoftCurlUnitPage = lazyWithLogging(() => import('./pages/curly/soft-curl/page'), 'SoftCurlUnitPage');
const SoftWaveUnitPage = lazyWithLogging(() => import('./pages/wavy/soft-wave/page'), 'SoftWaveUnitPage');
const OceanCurlUnitPage = lazyWithLogging(() => import('./pages/curly/ocean-curl/page'), 'OceanCurlUnitPage');
const BeachWaveUnitPage = lazyWithLogging(() => import('./pages/wavy/beach-wave/page'), 'BeachWaveUnitPage');
const WishlistPage = lazyWithLogging(() => import('./pages/wishlist/page'), 'WishlistPage');
const ViewListsPage = lazyWithLogging(() => import('./pages/wishlist/lists/page'), 'ViewListsPage');
const AccountPage = lazyWithLogging(() => import('./pages/account/page'), 'AccountPage');
const ConciergePage = lazyWithLogging(() => import('./pages/account/concierge/page'), 'ConciergePage');
const MembershipPage = lazyWithLogging(() => import('./pages/account/membership/page'), 'MembershipPage');
const ReferralsPage = lazyWithLogging(() => import('./pages/account/referrals/page'), 'ReferralsPage');
const AffiliatePage = lazyWithLogging(() => import('./pages/account/affiliate/page'), 'AffiliatePage');
const NotificationsPage = lazyWithLogging(() => import('./pages/account/notifications/page'), 'NotificationsPage');
const LoadCardPage = lazyWithLogging(() => import('./pages/account/load-card/page'), 'LoadCardPage');
const ReviewsPage = lazyWithLogging(() => import('./pages/account/reviews/page'), 'ReviewsPage');
const LeaveReviewOrderPage = lazyWithLogging(() => import('./pages/account/reviews/leave-review-order/page'), 'LeaveReviewOrderPage');
import ShippingPage from './pages/account/shipping/page';
const PaymentPage = lazyWithLogging(() => import('./pages/account/payment/page'), 'PaymentPage');
const SettingsPage = lazyWithLogging(() => import('./pages/account/settings/page'), 'SettingsPage');
const OrdersPage = lazyWithLogging(() => import('./pages/orders/page'), 'OrdersPage');
const SignInPage = lazyWithLogging(() => import('./pages/sign-in/page'), 'SignInPage');
const ShoppingBagPage = lazyWithLogging(() => import('./pages/shopping-bag/page'), 'ShoppingBagPage');
const CheckoutPage = lazyWithLogging(() => import('./pages/checkout/page'), 'CheckoutPage');
const CheckoutConfirmPage = lazyWithLogging(() => import('./pages/checkout/confirm/page'), 'CheckoutConfirmPage');
const StraightUnitsPage = lazyWithLogging(() => import('./pages/units/straight/page'), 'StraightUnitsPage');
const WavyUnitsPage = lazyWithLogging(() => import('./pages/units/wavy/page'), 'WavyUnitsPage');
const CurlyUnitsPage = lazyWithLogging(() => import('./pages/units/curly/page'), 'CurlyUnitsPage');
const ProductsPage = lazyWithLogging(() => import('./pages/products/page'), 'ProductsPage');
const ProductsUnitsPage = lazyWithLogging(() => import('./pages/products/units/page'), 'ProductsUnitsPage');
const ToolsPage = lazyWithLogging(() => import('./pages/tools/page'), 'ToolsPage');
const GiftCardPage = lazyWithLogging(() => import('./pages/tools/gift-card/page'), 'GiftCardPage');
const OrderFormPage = lazyWithLogging(() => import('./pages/shop/order-form/page'), 'OrderFormPage');
const BrandPage = lazyWithLogging(() => import('./pages/brand/page'), 'BrandPage');

// Error Boundary to catch component errors with auto-recovery
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null; retryCount: number }> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/31ad2c1c-bc12-4215-a008-3d30eef31493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:59',message:'ErrorBoundary caught error',data:{errorMessage:error.message,errorStack:error.stack?.substring(0,200),isMimeTypeError:error.message.includes('MIME type')||error.message.includes('text/html')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/31ad2c1c-bc12-4215-a008-3d30eef31493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:64',message:'ErrorBoundary componentDidCatch',data:{errorMessage:error.message,componentStack:errorInfo.componentStack?.substring(0,200),errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Auto-retry for chunk loading errors (common on Vercel)
    const isChunkError = error.message?.includes('Failed to fetch') || 
                         error.message?.includes('Loading chunk') ||
                         error.message?.includes('MIME type') ||
                         error.message?.includes('text/html') ||
                         error.name === 'ChunkLoadError';
    
    if (isChunkError && this.state.retryCount < 2) {
      // Clear any cached chunks and retry after a delay
      this.retryTimeout = setTimeout(() => {
        if (typeof window !== 'undefined' && 'caches' in window) {
          caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(name => caches.delete(name)));
          }).catch(() => {});
        }
        this.setState(prev => ({ 
          hasError: false, 
          error: null, 
          retryCount: prev.retryCount + 1 
        }));
        // Force a page reload if retry count is maxed
        if (this.state.retryCount >= 1) {
          window.location.reload();
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    // Clear caches and reset error state
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(name => caches.delete(name)));
      }).catch(() => {});
    }
    this.setState({ hasError: false, error: null, retryCount: 0 });
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.message?.includes('Failed to fetch') || 
                          this.state.error?.message?.includes('Loading chunk') ||
                          this.state.error?.message?.includes('MIME type') ||
                          this.state.error?.message?.includes('text/html') ||
                          this.state.error?.name === 'ChunkLoadError';
      
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
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <h1>ERROR: Component Failed to Load</h1>
          <p>{this.state.error?.message}</p>
          {isChunkError && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={this.handleRetry}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: 'red',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Retry
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: 'red',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Reload Page
              </button>
            </div>
          )}
          <pre style={{ fontSize: '12px', maxWidth: '90%', overflow: 'auto' }}>{this.state.error?.stack}</pre>
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
        {/* Admin routes - protected by AdminGuard (sign-in required, admin role only) */}
        <Route path="/admin" element={<AdminGuard />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="brand" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminBrand />
            </Suspense>
          } />
          <Route path="clients/account" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminClientsAccount />
            </Suspense>
          } />
          <Route path="clients/deleted" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminDeletedAccounts />
            </Suspense>
          } />
          <Route path="clients" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminClients />
            </Suspense>
          } />
          <Route path="meetings" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminMeetings />
            </Suspense>
          } />
          <Route path="pending" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminPending />
            </Suspense>
          } />
          <Route path="revenue" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminRevenue />
            </Suspense>
          } />
          <Route path="reviews" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminReviews />
            </Suspense>
          } />
          <Route path="referrals" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminReferrals />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAnalytics />
            </Suspense>
          } />
        </Route>
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
        <Route path="/shop/order-form" element={
          <Suspense fallback={<LoadingScreen />}>
            <OrderFormPage />
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
        {/* Brand pages: /brand/about, /brand/contact, /brand/care, /brand/member, /brand/faq, /brand/payment, /brand/reviews, /brand/terms */}
        <Route path="/brand/about" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/contact" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/care" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/member" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/faq" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/payment" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/reviews" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/terms" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/wishlist" element={
          <Suspense fallback={<LoadingScreen />}>
            <WishlistPage />
          </Suspense>
        } />
        <Route path="/wishlist/lists" element={
          <Suspense fallback={<LoadingScreen />}>
            <ViewListsPage />
          </Suspense>
        } />
        <Route path="/account" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <AccountPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/concierge" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ConciergePage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/rewards" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <MembershipPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/referrals" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ReferralsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/affiliate" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <AffiliatePage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/alerts" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <NotificationsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/orders/:orderId/review" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <LeaveReviewOrderPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/reviews" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ReviewsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/shipping" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ShippingPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/payment" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <PaymentPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/settings" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <SettingsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/orders" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <OrdersPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/load-card" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <LoadCardPage />
            </Suspense>
          </AccountRouteGuard>
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
        <Route path="/checkout/upgrade" element={
          <Suspense fallback={<LoadingScreen />}>
            <CheckoutPage />
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


