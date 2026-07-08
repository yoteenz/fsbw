import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { WarehouseWorkspace } from '../../../../components/admin/studio/warehouse/WarehouseWorkspace';
import { STUDIO_WAREHOUSE_SUBTITLE } from '../../../../utils/adminStudioWarehouseDemo';

export default function AdminStudioWarehousePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO WAREHOUSE™"
      subtitle={STUDIO_WAREHOUSE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="visuals"
    >
      <WarehouseWorkspace />
      <AdminStudioDisclaimerFooter>
        IMMERSIVE WAREHOUSE · HYDRATES FROM PIPELINE REGISTRY + SEED CATALOG · SCENE RECIPE™ + REPLACE WORKFLOW LIVE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
