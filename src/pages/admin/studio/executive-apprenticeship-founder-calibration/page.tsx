import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveApprenticeshipWorkspace } from '../../../../components/admin/studio/executive-apprenticeship-founder-calibration/ExecutiveApprenticeshipWorkspace';

const EXECUTIVE_APPRENTICESHIP_SUBTITLE =
  'Executives apprentice under the founder — observe, learn, practice, and earn trust through calibration, never configuration.';

export default function AdminStudioExecutiveApprenticeshipFounderCalibrationPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXECUTIVE APPRENTICESHIP & FOUNDER CALIBRATION"
      subtitle={EXECUTIVE_APPRENTICESHIP_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/arrival-experience')}
      navGroupId="overview"
    >
      <ExecutiveApprenticeshipWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE APPRENTICESHIP & FOUNDER CALIBRATION V1.0 · TRUST EARNED · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
