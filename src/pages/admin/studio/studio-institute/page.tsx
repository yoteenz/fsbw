import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioInstituteWorkspace } from '../../../../components/admin/studio/studio-institute/StudioInstituteWorkspace';

const STUDIO_INSTITUTE_SUBTITLE =
  'Permanent learning institution — develop founders, executives, and creators through immersive organizational education, not software documentation.';

export default function AdminStudioStudioInstitutePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO INSTITUTE"
      subtitle={STUDIO_INSTITUTE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/executive-apprenticeship-founder-calibration')}
      navGroupId="overview"
    >
      <StudioInstituteWorkspace />
      <AdminStudioDisclaimerFooter>
        STUDIO INSTITUTE V1.0 · PERMANENT LEARNING INSTITUTION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
