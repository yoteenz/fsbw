import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { EcosystemMarketplaceWorkspace } from '../../../../components/admin/studio/ecosystem-marketplace/EcosystemMarketplaceWorkspace';

const ECOSYSTEM_MARKETPLACE_SUBTITLE =
  'Central exchange for organizational intelligence — publish, license, inherit, and compound proven systems. Not an app store.';

export default function AdminStudioEcosystemMarketplacePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ECOSYSTEM MARKETPLACE"
      subtitle={ECOSYSTEM_MARKETPLACE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/creator-marketplace')}
      navGroupId="intelligence"
    >
      <EcosystemMarketplaceWorkspace />
      <AdminStudioDisclaimerFooter>
        ECOSYSTEM MARKETPLACE V1.0 · ORGANIZATIONAL CAPABILITY · INHERITANCE · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
