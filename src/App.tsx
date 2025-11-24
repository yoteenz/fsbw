import { Routes, Route } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode, lazy, Suspense } from 'react';
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
import LoadingScreen from './components/base/LoadingScreen';

// Use lazy loading for noir page like canonical backup
const NoirUnitPage = lazy(() => import('./pages/units/noir/page'));

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
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
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
          <Route path="/units/noir" element={<NoirUnitPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;


