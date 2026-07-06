import { Navigate } from 'react-router-dom';
import { STUDIO_ADMINISTRATION_ROUTES } from '../../../../studio-os-core/application/routes';

/** Legacy alias — Studio Administration home is Studio Command Center. */
export default function StudioAdministrationPage() {
  return <Navigate to={STUDIO_ADMINISTRATION_ROUTES.commandCenter} replace />;
}
