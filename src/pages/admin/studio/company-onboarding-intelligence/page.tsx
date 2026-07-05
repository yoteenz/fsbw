import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CompanyOnboardingIntelligenceWorkspace } from '../../../../components/admin/studio/company-onboarding-intelligence/CompanyOnboardingIntelligenceWorkspace';

const COMPANY_ONBOARDING_INTELLIGENCE_SUBTITLE =
  'Intelligent onboarding — discover your organization\'s story, arrive at headquarters, feel understood from day one.';

export default function AdminStudioCompanyOnboardingIntelligencePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="COMPANY ONBOARDING INTELLIGENCE"
      subtitle={COMPANY_ONBOARDING_INTELLIGENCE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/leadership-modes')}
      navGroupId="overview"
    >
      <CompanyOnboardingIntelligenceWorkspace />
      <AdminStudioDisclaimerFooter>
        COMPANY ONBOARDING INTELLIGENCE V1.0 · ORGANIZATIONAL WELCOME · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
