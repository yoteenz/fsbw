import { Navigate, useLocation } from 'react-router-dom';
import { resolveGlobalRouteTarget } from '../../../studio-os-core/company-routes/route-catalog';

/**
 * Global Studio World routes (not company-specific).
 */
export default function StudioGlobalRouteResolver() {
  const { pathname, search } = useLocation();
  const segment = pathname.replace('/admin/studio/', '').replace(/\/$/, '');
  const target = resolveGlobalRouteTarget(segment);

  if (!target) {
    return <Navigate to="/admin/studio/command-center" replace />;
  }

  let targetPath = target.legacyPath;
  let targetSearch = search;
  if (targetPath.includes('?')) {
    const [path, query] = targetPath.split('?');
    targetPath = path!;
    targetSearch = query ? `?${query}` : '';
  }

  return <Navigate to={{ pathname: targetPath, search: targetSearch }} replace />;
}
