import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { BlueprintManagerWorkspace } from '../../../../components/admin/studio/blueprint-manager/BlueprintManagerWorkspace';
import { BLUEPRINT_MANAGER_SUBTITLE } from '../../../../utils/adminStudioBlueprintManagerDemo';

export default function AdminStudioBlueprintManagerPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="BLUEPRINT MANAGER"
      subtitle={BLUEPRINT_MANAGER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="visuals"
    >
      <BlueprintManagerWorkspace />
      <AdminStudioDisclaimerFooter>
        ASSET FACTORY FOUNDATION · SPECIFICATION ONLY · NO GENERATION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
