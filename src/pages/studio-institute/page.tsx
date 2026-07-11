import { Navigate } from 'react-router-dom';
import { STUDIO_INSTITUTE_ROUTES } from '../../studio-os-core/expert-capture/invite-system/config';

export default function StudioInstituteHomePage() {
  return <Navigate to={STUDIO_INSTITUTE_ROUTES.inviteManager} replace />;
}
