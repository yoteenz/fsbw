import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { BrandArchitectWorkspace } from '../../../../components/admin/studio/brand-architect/BrandArchitectWorkspace';

const BRAND_ARCHITECT_SUBTITLE =
  'Transform a validated business into a complete living brand — meaning before colors, cohesive systems, experience architect handoff.';

export default function AdminStudioBrandArchitectPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="BRAND ARCHITECT"
      subtitle={BRAND_ARCHITECT_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/company-maturity-engine')}
      navGroupId="overview"
    >
      <BrandArchitectWorkspace />
      <AdminStudioDisclaimerFooter>
        BRAND ARCHITECT V1.0 · COHESIVE BRAND SYSTEMS · MEANING FIRST · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
