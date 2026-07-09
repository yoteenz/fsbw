import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CompanyGenomeWorkspace } from '../../../../components/admin/studio/company-genome/CompanyGenomeWorkspace';

const COMPANY_GENOME_SUBTITLE =
  'Living business dependency graph — systems, dependencies, flows, events, risks, and opportunities as one connected organism.';

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
        COMPANY GENOME V2.0 · LIVING BUSINESS DEPENDENCY GRAPH · SYSTEMS · FLOWS · RISKS · OPPORTUNITIES
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
