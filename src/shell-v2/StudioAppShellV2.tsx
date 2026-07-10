import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isShellV2StageEnabled } from './shellV2Matrix';
import { ShellV2ErrorBoundary } from './ShellV2ErrorBoundary';
import ShellV2DiagnosticPage from './pages/ShellV2DiagnosticPage';
import ShellV2PublicPage from './pages/ShellV2PublicPage';
import './shell-v2.css';

/**
 * Isolated production shell — incremental provider composition via shellV2Matrix stages.
 * Stage 0: React + Router + two static routes only.
 */
export default function StudioAppShellV2() {
  let tree = (
    <BrowserRouter>
      <Routes>
        <Route path="/v2" element={<ShellV2PublicPage />} />
        <Route path="/v2/diagnostic" element={<ShellV2DiagnosticPage />} />
        <Route path="/v2/*" element={<Navigate to="/v2" replace />} />
      </Routes>
    </BrowserRouter>
  );

  // Stage 10 → 1: wrap outermost first when enabling (future commits add inner stages before this block grows upward)
  if (isShellV2StageEnabled(1)) {
    tree = <ShellV2ErrorBoundary>{tree}</ShellV2ErrorBoundary>;
  }

  // Stages 2–10: added one commit at a time — do not batch.
  // 2: ShellV2AuthProvider
  // 3: ShellV2RouteGuards
  // 4: Studio Bootstrap (isolated import)
  // 5: platform/state DNA modules
  // 6: registries
  // 7: workspace runtime
  // 8: admin shell
  // 9: Experience Runtime
  // 10: migrated App routes

  return tree;
}
