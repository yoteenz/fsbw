import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CompanyGenomeWorkspace } from '../../../../components/admin/studio/company-genome/CompanyGenomeWorkspace';

const COMPANY_GENOME_SUBTITLE =
  'Living organizational genetics — watch your company evolve as a living system, not another analytics dashboard.';

export default function AdminStudioCompanyGenomePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="COMPANY GENOME"
      subtitle={COMPANY_GENOME_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/growth-architect')}
      navGroupId="overview"
    >
      <CompanyGenomeWorkspace />
      <AdminStudioDisclaimerFooter>
        COMPANY GENOME V1.0 · LIVING HEARTBEAT · ORGANIZATIONAL GENETICS · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
