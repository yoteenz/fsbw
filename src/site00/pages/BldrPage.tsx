import { Navigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';

/** BLDR entry — routes to build state selection */
export default function BldrPage() {
  return <Navigate to={SITE00_ROUTES.bldrState} replace />;
}
