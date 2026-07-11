import { Navigate } from 'react-router-dom';
import { STUDIO_INSTITUTE_ROUTES } from '../../../studio-os-core/expert-capture/invite-system/config';

/** Legacy URL: /studio-institute/invite → /studio-institute/invites */
export default function StudioInstituteInviteLegacyRedirect() {
  return <Navigate to={STUDIO_INSTITUTE_ROUTES.inviteManager} replace />;
}
