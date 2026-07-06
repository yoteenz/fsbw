import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { VisualDiffEngineWorkspace } from '../../../../components/admin/studio/visual-diff-engine/VisualDiffEngineWorkspace';

const SUBTITLE =
  'Visual Diff Engine™ — Studio OS visual memory. Continuously compares every interface against the approved Design System and detects unintended visual changes before users ever see them.';

export default function AdminStudioVisualDiffEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="VISUAL DIFF ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/experience-qa')}
      navGroupId="intelligence"
    >
      <VisualDiffEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        VISUAL DIFF ENGINE™ V1.0 · M157 · GOLDEN REFERENCE™ · GUARDIAN OF VISUAL IDENTITY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
