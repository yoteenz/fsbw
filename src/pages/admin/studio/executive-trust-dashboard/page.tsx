import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveTrustDashboardWorkspace } from '../../../../components/admin/studio/executive-trust-dashboard/ExecutiveTrustDashboardWorkspace';

const SUBTITLE =
  'Executive Trust Dashboard™ — centralized trust metrics for your entire organization. Trust Score, health, confidence, risk, and history for every major system. Measurable, not assumed.';

export default function AdminStudioExecutiveTrustDashboardPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXECUTIVE TRUST DASHBOARD™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/time-machine')}
      navGroupId="intelligence"
    >
      <ExecutiveTrustDashboardWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE TRUST DASHBOARD™ V1.0 · M147 · TRUST AS FIRST-CLASS METRIC · MEASURABLE NOT ASSUMED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
