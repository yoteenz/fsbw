import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { TutorialOsWorkspace } from '../../../../components/admin/studio/tutorial-os/TutorialOsWorkspace';
import { TUTORIAL_OS_SUBTITLE } from '../../../../utils/adminStudioTutorialOsDemo';

export default function AdminStudioTutorialOsPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="TUTORIAL OS"
      subtitle={TUTORIAL_OS_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <TutorialOsWorkspace />
      <AdminStudioDisclaimerFooter>
        ONBOARDING TUTORIAL · THE MANSION TOUR · REUSABLE WALKTHROUGH SYSTEM FOR STUDIO OS WORKSPACES
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
