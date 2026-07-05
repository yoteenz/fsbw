import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ChiefOfStaffWorkspace } from '../../../../components/admin/studio/chief-of-staff/ChiefOfStaffWorkspace';

const CHIEF_OF_STAFF_SUBTITLE =
  'Chief Concierge — your primary guide throughout Studio OS. Warm briefings, attention protection, and personal coordination. Governance role: Chief of Staff · executive organization unchanged.';

export default function AdminStudioChiefOfStaffPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CHIEF CONCIERGE"
      subtitle={CHIEF_OF_STAFF_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="overview"
    >
      <ChiefOfStaffWorkspace />
      <AdminStudioDisclaimerFooter>
        CHIEF OF STAFF V1.0 · SOFT APPROVAL ENGINE · DECISION LEARNING · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
