import { lazy, memo, Suspense, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../../components/base/LoadingScreen';
import { ScaledDesktopViewport } from '../../components/desktop-preview/ScaledDesktopViewport';
import {
  isDesktopPreviewEnvironment,
  resolveDesktopIframePath,
} from '../../utils/desktopPreview';
import { DESKTOP_GALLERY_PATH } from '../../constants/desktopFloors';

const DesktopPenthousePageLazy = lazy(() => import('../desktop/penthouse/page'));
const DesktopGalleryPageLazy = lazy(() => import('../desktop/gallery/page'));

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
    desktopPath === DESKTOP_GALLERY_PATH || desktopPath.startsWith(`${DESKTOP_GALLERY_PATH}?`) ? (
      <DesktopGalleryPageLazy />
    ) : (
      <DesktopPenthousePageLazy />
    );

  return (
    <ScaledDesktopViewport>
      <Suspense fallback={<LoadingScreen />}>{page}</Suspense>
    </ScaledDesktopViewport>
  );
}

export default memo(DesktopPreviewPage);
