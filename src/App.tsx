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
import { clearTestDataForNonAdminUserIfNeeded } from './utils/clearTestDataForNonAdmin';
import { ensureAuthRestoredFromBackup, persistAuthBackup, isSignedIn } from './utils/adminAuth';
import { schedulePushCartWishlistToCloud } from './utils/pushCartWishlistToCloud';
import { flushQueuedProfilePatch } from './utils/profileSyncQueue';
import { registerGlobalClientActivityListeners, trackClientViewPage } from './utils/clientActivityBootstrap';

/** Lazy route imports with retries for chunk/network failures (common after deploys). */
const lazyWithRetry = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => {
    const retryImport = async (retries = 3, delay = 1000): Promise<any> => {
      for (let i = 0; i < retries; i++) {
        try {
          return await importFn();
        } catch (error: any) {
          const isChunkError =
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('MIME type') ||
            error.message?.includes('text/html') ||
            error.name === 'ChunkLoadError';

          if (isChunkError && i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            if (error.message?.includes('Failed to fetch') || error.message?.includes('Loading chunk')) {
              if (typeof window !== 'undefined' && 'caches' in window) {
                try {
                  const cacheNames = await caches.keys();
                  await Promise.all(cacheNames.map((name) => caches.delete(name)));
                } catch {
                  // ignore
                }
              }
            }
            continue;
          }
          throw error;
        }
      }
      throw new Error(`Failed to load ${componentName} after ${retries} attempts`);
    };
    return retryImport();
  });
};

// Use lazy loading for admin pages and noir page (like canonical backup)
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/dashboard/page'), 'AdminDashboard');
const AdminBrand = lazyWithRetry(() => import('./pages/admin/brand/page'), 'AdminBrand');
const AdminClients = lazyWithRetry(() => import('./pages/admin/clients/page'), 'AdminClients');
const AdminDeletedAccounts = lazyWithRetry(() => import('./pages/admin/clients/deleted/page'), 'AdminDeletedAccounts');
const AdminMeetings = lazyWithRetry(() => import('./pages/admin/meetings/page'), 'AdminMeetings');
const AdminMeetingsSchedule = lazyWithRetry(() => import('./pages/admin/meetings/schedule/page'), 'AdminMeetingsSchedule');
const AdminPending = lazyWithRetry(() => import('./pages/admin/pending/page'), 'AdminPending');
const AdminRevenue = lazyWithRetry(() => import('./pages/admin/revenue/page'), 'AdminRevenue');
const AdminAccountingReport = lazyWithRetry(() => import('./pages/admin/revenue/accounting-report/page'), 'AdminAccountingReport');
const AdminFulfilledOrders = lazyWithRetry(() => import('./pages/admin/revenue/fulfilled-orders/page'), 'AdminFulfilledOrders');
const AdminFraudAnalysis = lazyWithRetry(() => import('./pages/admin/revenue/fraud-analysis/page'), 'AdminFraudAnalysis');
const AdminEditInventory = lazyWithRetry(() => import('./pages/admin/revenue/edit-inventory/page'), 'AdminEditInventory');
const AdminReviews = lazyWithRetry(() => import('./pages/admin/reviews/page'), 'AdminReviews');
const AdminReferrals = lazyWithRetry(() => import('./pages/admin/referrals/page'), 'AdminReferrals');
const AdminAnalytics = lazyWithRetry(() => import('./pages/admin/analytics/page'), 'AdminAnalytics');
const AdminUsers = lazyWithRetry(() => import('./pages/admin/users/page'), 'AdminUsers');
const AdminNotifications = lazyWithRetry(() => import('./pages/admin/notifications/page'), 'AdminNotifications');
const AdminAudit = lazyWithRetry(() => import('./pages/admin/audit/page'), 'AdminAudit');
const AdminSpecialOffer = lazyWithRetry(() => import('./pages/admin/special-offer/page'), 'AdminSpecialOffer');
const AdminWorkers = lazyWithRetry(() => import('./pages/admin/workers/page'), 'AdminWorkers');
const AdminBackend = lazyWithRetry(() => import('./pages/admin/backend/page'), 'AdminBackend');
const AdminMarketing = lazyWithRetry(() => import('./pages/admin/marketing/page'), 'AdminMarketing');
const NoirUnitPage = lazyWithRetry(() => import('./pages/straight/noir/page'), 'NoirUnitPage');
const BlancoUnitPage = lazyWithRetry(() => import('./pages/straight/blanco/page'), 'BlancoUnitPage');
const SoftCurlUnitPage = lazyWithRetry(() => import('./pages/curly/soft-curl/page'), 'SoftCurlUnitPage');
const SoftWaveUnitPage = lazyWithRetry(() => import('./pages/wavy/soft-wave/page'), 'SoftWaveUnitPage');
const OceanCurlUnitPage = lazyWithRetry(() => import('./pages/curly/ocean-curl/page'), 'OceanCurlUnitPage');
const BeachWaveUnitPage = lazyWithRetry(() => import('./pages/wavy/beach-wave/page'), 'BeachWaveUnitPage');
const WishlistPage = lazyWithRetry(() => import('./pages/wishlist/page'), 'WishlistPage');
const ViewListsPage = lazyWithRetry(() => import('./pages/wishlist/lists/page'), 'ViewListsPage');
const AccountPage = lazyWithRetry(() => import('./pages/account/page'), 'AccountPage');
const ConciergePage = lazyWithRetry(() => import('./pages/account/concierge/page'), 'ConciergePage');
const MembershipPage = lazyWithRetry(() => import('./pages/account/membership/page'), 'MembershipPage');
const ReferralsPage = lazyWithRetry(() => import('./pages/account/referrals/page'), 'ReferralsPage');
const AffiliatePage = lazyWithRetry(() => import('./pages/account/affiliate/page'), 'AffiliatePage');
const NotificationsPage = lazyWithRetry(() => import('./pages/account/notifications/page'), 'NotificationsPage');
const LoadCardPage = lazyWithRetry(() => import('./pages/account/load-card/page'), 'LoadCardPage');
const ReviewsPage = lazyWithRetry(() => import('./pages/account/reviews/page'), 'ReviewsPage');
const LeaveReviewOrderPage = lazyWithRetry(() => import('./pages/account/reviews/leave-review-order/page'), 'LeaveReviewOrderPage');
import ShippingPage from './pages/account/shipping/page';
const PaymentPage = lazyWithRetry(() => import('./pages/account/payment/page'), 'PaymentPage');
const SettingsPage = lazyWithRetry(() => import('./pages/account/settings/page'), 'SettingsPage');
const OrdersPage = lazyWithRetry(() => import('./pages/orders/page'), 'OrdersPage');
const SignInPage = lazyWithRetry(() => import('./pages/sign-in/page'), 'SignInPage');
const ShoppingBagPage = lazyWithRetry(() => import('./pages/shopping-bag/page'), 'ShoppingBagPage');
const CheckoutPage = lazyWithRetry(() => import('./pages/checkout/page'), 'CheckoutPage');
const CheckoutConfirmPage = lazyWithRetry(() => import('./pages/checkout/confirm/page'), 'CheckoutConfirmPage');
const StraightUnitsPage = lazyWithRetry(() => import('./pages/units/straight/page'), 'StraightUnitsPage');
const WavyUnitsPage = lazyWithRetry(() => import('./pages/units/wavy/page'), 'WavyUnitsPage');
const CurlyUnitsPage = lazyWithRetry(() => import('./pages/units/curly/page'), 'CurlyUnitsPage');
const ProductsPage = lazyWithRetry(() => import('./pages/products/page'), 'ProductsPage');
const ProductsUnitsPage = lazyWithRetry(() => import('./pages/products/units/page'), 'ProductsUnitsPage');
const ToolsPage = lazyWithRetry(() => import('./pages/tools/page'), 'ToolsPage');
const GiftCardPage = lazyWithRetry(() => import('./pages/tools/gift-card/page'), 'GiftCardPage');
const OrderFormPage = lazyWithRetry(() => import('./pages/shop/order-form/page'), 'OrderFormPage');
const BrandPage = lazyWithRetry(() => import('./pages/brand/page'), 'BrandPage');
const BrandCareersPage = lazyWithRetry(() => import('./pages/brand/careers/page'), 'BrandCareersPage');

// Error Boundary to catch component errors with auto-recovery
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null; retryCount: number }> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

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

// Redirect /admin/clients/account?email=... to /admin/clients/overview?email=... (details now toggle on main card)
const ClientsAccountRedirect = () => {
  const location = useLocation();
  return <Navigate to={{ pathname: '/admin/clients/overview', search: location.search }} replace />;
};

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

  // Clear test data for signed-in accounts that aren't ayoteenz@yahoo.com with admin tag (once per email)
  useEffect(() => {
    clearTestDataForNonAdminUserIfNeeded();
  }, []);

  // Client activity: cart/wishlist debounced snapshots + bawTrackActivity bridge (admin Activity tab)
  useEffect(() => {
    registerGlobalClientActivityListeners();
  }, []);

  useEffect(() => {
    trackClientViewPage(location.pathname, location.search);
  }, [location.pathname, location.search]);

  // Auth persistence: restore from backup on every load (survives browser close), then re-persist backup and notify listeners.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      ensureAuthRestoredFromBackup();
      persistAuthBackup();
      const signedIn = localStorage.getItem('isSignedIn') === 'true';
      const currentUser = localStorage.getItem('currentUser');
      if (signedIn && currentUser) {
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      }
    } catch (_) {}
  }, []);

  // Keep auth backup updated while signed in so it survives browser close even when beforeunload doesn't fire
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      if (isSignedIn()) persistAuthBackup();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Persist backup on every navigation when signed in (e.g. product page, lobby, account) so backup is always fresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isSignedIn()) persistAuthBackup();
  }, [location.pathname]);

  // When signed in with Supabase, periodically push local cart/wishlist to cloud (debounced per navigation)
  useEffect(() => {
    schedulePushCartWishlistToCloud();
  }, [location.pathname]);

  // Same push when cart/wishlist change without a route change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const run = () => schedulePushCartWishlistToCloud();
    window.addEventListener('cartUpdated', run);
    window.addEventListener('wishlistUpdated', run);
    window.addEventListener('ordersUpdated', run);
    return () => {
      window.removeEventListener('cartUpdated', run);
      window.removeEventListener('wishlistUpdated', run);
      window.removeEventListener('ordersUpdated', run);
    };
  }, []);

  // Keep queued profile edits (photo/name/settings fields) synced to backend.
  useEffect(() => {
    void flushQueuedProfilePatch();
  }, [location.pathname]);

  // When the app loads while already signed in (localStorage + Supabase session), pull server state automatically.
  // bootstrap in main.tsx skips API sync when isSignedIn was already true — this effect covers that gap so users
  // do not need to sign out/in or use admin "Sync my account" to refresh profile from Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === 'undefined') return;
      if (!isSignedIn()) return;
      const { isSupabaseConfigured, getSupabase } = await import('./utils/supabase');
      if (!isSupabaseConfigured()) return;
      const supabase = getSupabase();
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token || cancelled) return;
      const { syncAllFromApi } = await import('./utils/syncFromApi');
      const profile = await syncAllFromApi();
      if (cancelled) return;
      if (profile) {
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const run = () => {
      void flushQueuedProfilePatch();
    };
    window.addEventListener('signInStateChanged', run);
    window.addEventListener('focus', run);
    return () => {
      window.removeEventListener('signInStateChanged', run);
      window.removeEventListener('focus', run);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route index element={<Navigate to="/shop/units" replace />} />
        <Route path="/" element={<Navigate to="/shop/units" replace />} />
        <Route path="/lobby" element={<LobbyPage />} />
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
          <Route path="clients/account" element={<ClientsAccountRedirect />} />
          <Route path="clients/deleted" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminDeletedAccounts />
            </Suspense>
          } />
          <Route path="clients/overview" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminClients />
            </Suspense>
          } />
          <Route path="clients" element={<Navigate to="/admin/clients/overview" replace />} />
          <Route path="meetings/schedule" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminMeetingsSchedule />
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
          <Route path="revenue/accounting-report" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAccountingReport />
            </Suspense>
          } />
          <Route path="revenue/fulfilled-orders" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminFulfilledOrders />
            </Suspense>
          } />
          <Route path="revenue/fraud-analysis" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminFraudAnalysis />
            </Suspense>
          } />
          <Route path="revenue/edit-inventory" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminEditInventory />
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
          <Route path="marketing/offers" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminSpecialOffer />
            </Suspense>
          } />
          <Route path="marketing" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminMarketing />
            </Suspense>
          } />
          <Route path="workers" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminWorkers />
            </Suspense>
          } />
          <Route path="backend" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminBackend />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAnalytics />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminUsers />
            </Suspense>
          } />
          <Route path="notifications" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminNotifications />
            </Suspense>
          } />
          <Route path="audit" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAudit />
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
        {/* Brand pages: /brand/about … /brand/reviews, /brand/careers, /brand/terms */}
        <Route path="/brand/jobs" element={<Navigate to="/brand/careers" replace />} />
        <Route path="/brand/about" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/contact" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/care" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/member" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/faq" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/payment" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/reviews" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/careers" element={<Suspense fallback={<LoadingScreen />}><BrandCareersPage /></Suspense>} />
        <Route path="/brand/terms" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/wishlist" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <WishlistPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/wishlist/lists" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ViewListsPage />
            </Suspense>
          </AccountRouteGuard>
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


