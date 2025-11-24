import { Routes, Route, useLocation } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode } from 'react';
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
// import LoadingScreen from './components/base/LoadingScreen';
import NoirUnitPage from './pages/build-a-wig/units/noir/page';

// Use lazy loading for noir page like canonical backup
// const NoirUnitPage = lazy(() => import('./pages/build-a-wig/units/noir/page'));

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
  // Debug: Log current pathname
  console.log('🔵 App rendering, current pathname:', location.pathname);
  
  return (
    <div>
      {/* ALWAYS VISIBLE DEBUG - Shows App is rendering */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'purple',
        color: 'white',
        padding: '15px',
        zIndex: 9999999,
        fontSize: '18px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        🟣 APP IS RENDERING - Current URL: {location.pathname} 🟣
      </div>
      
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<BuildAWigPage />} />
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
            <div style={{minHeight: '100vh', paddingTop: '300px'}}>
              {/* Route matched debug - ALWAYS VISIBLE */}
              <div style={{
                position: 'fixed', 
                top: '60px', 
                left: 0, 
                right: 0,
                background: 'green', 
                color: 'white', 
                padding: '30px', 
                zIndex: 999999, 
                fontSize: '32px',
                textAlign: 'center',
                fontWeight: 'bold',
                borderBottom: '5px solid white'
              }}>
                ✅✅✅ ROUTE MATCHED: /units/noir ✅✅✅
                <br />
                <span style={{fontSize: '20px'}}>Loading NoirUnitPage component below...</span>
              </div>
              
              {/* Component wrapper debug */}
              <div style={{
                position: 'fixed',
                top: '180px',
                left: 0,
                right: 0,
                background: 'blue',
                color: 'white',
                padding: '20px',
                zIndex: 999998,
                fontSize: '20px',
                textAlign: 'center',
                borderBottom: '5px solid white'
              }}>
                If you see this blue box but not the red box below, the component crashed
              </div>
              
              {/* Render the component */}
              <ErrorBoundary>
                <NoirUnitPage />
              </ErrorBoundary>
            </div>
          } />
          {/* Catch-all route for debugging */}
          <Route path="*" element={
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'orange',
              color: 'black',
              padding: '50px',
              fontSize: '32px',
              zIndex: 9999999
            }}>
              <h1>404 - Route Not Found</h1>
              <p>Current pathname: {location.pathname}</p>
              <p>If you're trying to access /units/noir and see this, the route isn't matching</p>
            </div>
          } />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;


