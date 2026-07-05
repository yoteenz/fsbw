import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ChiefBrandOfficerWorkspace } from '../../../../components/admin/studio/chief-brand-officer/ChiefBrandOfficerWorkspace';

const CHIEF_BRAND_OFFICER_SUBTITLE =
  'Lifelong guardian of organizational identity — protect meaning, evolve thoughtfully, strengthen trust across every touchpoint. Not logos. Timelessness.';

export default function AdminStudioChiefBrandOfficerPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CHIEF BRAND OFFICER"
      subtitle={CHIEF_BRAND_OFFICER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/leadership-manifesto-framework')}
      navGroupId="overview"
    >
      <ChiefBrandOfficerWorkspace />
      <AdminStudioDisclaimerFooter>
        CHIEF BRAND OFFICER V2.0 · BRAND STEWARD · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
