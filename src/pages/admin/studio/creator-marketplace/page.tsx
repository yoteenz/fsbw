import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CreatorMarketplaceWorkspace } from '../../../../components/admin/studio/creator-marketplace/CreatorMarketplaceWorkspace';

const CREATOR_MARKETPLACE_SUBTITLE =
  'Intelligent creator business ecosystem — alignment, career growth, and long-term partnerships. Not buying posts.';

export default function AdminStudioCreatorMarketplacePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CREATOR MARKETPLACE"
      subtitle={CREATOR_MARKETPLACE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/relationship-engine')}
      navGroupId="intelligence"
    >
      <CreatorMarketplaceWorkspace />
      <AdminStudioDisclaimerFooter>
        CREATOR MARKETPLACE V1.0 · ALIGNMENT · CAREER GROWTH · PARTNERSHIPS · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
