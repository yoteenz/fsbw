import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CompanyMaturityEngineWorkspace } from '../../../../components/admin/studio/company-maturity-engine/CompanyMaturityEngineWorkspace';

const COMPANY_MATURITY_ENGINE_SUBTITLE =
  'Universal onboarding for Studio OS — assess organizational maturity, preserve existing assets, and recommend the next best path.';

export default function AdminStudioCompanyMaturityEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="COMPANY MATURITY ENGINE"
      subtitle={COMPANY_MATURITY_ENGINE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/knowledge-asset-engine')}
      navGroupId="overview"
    >
      <CompanyMaturityEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        COMPANY MATURITY ENGINE V1.0 · ORGANIZATIONAL UNDERSTANDING · UNIVERSAL ENTRY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
