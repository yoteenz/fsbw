import { Navigate } from 'react-router-dom';
import { adminStudioWarehousePath } from '../../../../utils/adminStudioRoutes';

/**
 * Studio Museum™ is absorbed into Studio Warehouse™ — Museum Wing™ district.
 * No standalone webpage. Continuous campus walk only.
 */
export default function AdminStudioMuseumPage() {
  return <Navigate to={`${adminStudioWarehousePath()}?zone=museum-wing`} replace />;
}
