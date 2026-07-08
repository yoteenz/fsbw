import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  FLAGSHIP_DESTINATIONS,
  resolveStudioWorldPath,
  STUDIO_WORLD_BASE_PATH,
} from '../../../../studio-os-core/studio-world';

/**
 * Canonical Studio World™ path resolver.
 * `/admin/studio/world/*` → legacy implementation routes (functionality preserved).
 */
export function StudioWorldPathResolver() {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/$/, '') || location.pathname;

  useEffect(() => {
    document.body.dataset.studioWorldV4 = 'active';
    return () => {
      delete document.body.dataset.studioWorldV4;
    };
  }, []);

  if (pathname === STUDIO_WORLD_BASE_PATH) {
    const defaultFlagship = FLAGSHIP_DESTINATIONS[0]!;
    return <Navigate to={defaultFlagship.worldEntryPath} replace />;
  }

  const resolution = resolveStudioWorldPath(pathname);
  let targetPath = resolution.target;
  let targetSearch = location.search;

  if (resolution.kind === 'legacy-redirect' && resolution.target.includes('?')) {
    const [path, query] = resolution.target.split('?');
    targetPath = path!;
    targetSearch = query ? `?${query}` : '';
  }

  return <Navigate to={{ pathname: targetPath, search: targetSearch }} replace />;
}

export default StudioWorldPathResolver;
