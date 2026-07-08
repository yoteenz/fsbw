import { Navigate } from 'react-router-dom';
import { adminStudioExchangePath } from '../../../../utils/adminStudioRoutes';

/** Legacy Marketplace route — redirects to Studio Exchange™ (ARTICLE-E05). */
export default function AdminStudioMarketplaceRedirectPage() {
  return <Navigate to={adminStudioExchangePath()} replace />;
}
