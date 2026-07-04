import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { BlueprintDetailEditor } from '../../../../../components/admin/studio/blueprint-manager/BlueprintDetailEditor';
import { useAdminStudioBlueprintManager } from '../../../../../hooks/useAdminStudioBlueprintManagerState';
import type { BlueprintStatus, ChecklistItemStatus } from '../../../../../utils/adminStudioBlueprintManagerDemo';
import { adminStudioBlueprintManagerPath } from '../../../../../utils/adminStudioRoutes';

const CHECKLIST_CYCLE: ChecklistItemStatus[] = ['waiting', 'ready', 'incomplete'];

export default function AdminStudioBlueprintDetailPage() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const navigate = useNavigate();
  const {
    getBlueprint,
    setBlueprintStatus,
    setChecklistStatus,
    restoreVersion,
    submitForReview,
    approveBlueprint,
  } = useAdminStudioBlueprintManager();

  const blueprint = blueprintId ? getBlueprint(blueprintId) : undefined;

  if (!blueprintId || !blueprint) {
    return <Navigate to={adminStudioBlueprintManagerPath()} replace />;
  }

  const toggleChecklist = (itemId: string) => {
    const item = blueprint.checklist.find((c) => c.id === itemId);
    if (!item) return;
    const idx = CHECKLIST_CYCLE.indexOf(item.status);
    const next = CHECKLIST_CYCLE[(idx + 1) % CHECKLIST_CYCLE.length];
    setChecklistStatus(blueprint.id, itemId, next);
  };

  return (
    <AdminStudioStageShell
      title="BLUEPRINT MANAGER"
      subtitle={blueprint.identity.name}
      breadcrumbParentLabel="BLUEPRINTS"
      breadcrumbParentPath={adminStudioBlueprintManagerPath()}
      onBack={() => navigate(adminStudioBlueprintManagerPath())}
      navGroupId="visuals"
    >
      <BlueprintDetailEditor
        blueprint={blueprint}
        onStatusChange={(status: BlueprintStatus) => setBlueprintStatus(blueprint.id, status)}
        onChecklistToggle={toggleChecklist}
        onRestoreVersion={(v: number) => restoreVersion(blueprint.id, v)}
        onSubmitReview={() => submitForReview(blueprint.id)}
        onApprove={() => approveBlueprint(blueprint.id)}
      />
      <AdminStudioDisclaimerFooter>
        BLUEPRINT EDITOR · SPECIFICATION ONLY · ASSET FACTORY NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
