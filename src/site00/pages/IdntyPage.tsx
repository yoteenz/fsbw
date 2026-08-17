import { Navigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';

/** IDNTY entry — routes to brand state selection */
export default function IdntyPage() {
  return <Navigate to={SITE00_ROUTES.idntyState} replace />;
}
