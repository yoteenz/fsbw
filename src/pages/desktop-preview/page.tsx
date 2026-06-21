import { lazy, memo, Suspense, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../../components/base/LoadingScreen';
import { ScaledDesktopViewport } from '../../components/desktop-preview/ScaledDesktopViewport';
import {
  isDesktopPreviewEnvironment,
  resolveDesktopIframePath,
} from '../../utils/desktopPreview';

const DesktopLobbyPageLazy = lazy(() => import('../desktop-lobby/page'));
const DesktopLoungePageLazy = lazy(() => import('../desktop/lounge/page'));

/**
 * Staging phone preview: renders desktop pages directly inside a scaled 1920px
 * scroll shell (no iframe). Open `https://fsbw.vercel.app/desktop-preview`.
 */
function DesktopPreviewPage() {
  const location = useLocation();
  const previewAllowed = isDesktopPreviewEnvironment();
  const desktopPath = useMemo(
    () => resolveDesktopIframePath(location.pathname),
    [location.pathname],
  );

  if (!previewAllowed) {
    return <Navigate to="/home/shop" replace />;
  }

  const page =
    desktopPath === '/desktop/lounge' ? (
      <DesktopLoungePageLazy />
    ) : (
      <DesktopLobbyPageLazy />
    );

  return (
    <ScaledDesktopViewport>
      <Suspense fallback={<LoadingScreen />}>{page}</Suspense>
    </ScaledDesktopViewport>
  );
}

export default memo(DesktopPreviewPage);
