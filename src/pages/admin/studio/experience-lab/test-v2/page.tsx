import { Navigate } from 'react-router-dom';
import { EXPERIENCE_LAB_V2_ROUTE } from '../../../../../features/studio-world/experience-lab-v2/experience-lab-v2.types';

/** Stable alias → canonical V2 test route. */
export default function AdminStudioExperienceLabTestV2AliasPage() {
  return <Navigate to={EXPERIENCE_LAB_V2_ROUTE} replace />;
}
