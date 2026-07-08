import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { MuseumWorkspace } from '../../../../components/admin/studio/museum/MuseumWorkspace';
import { STUDIO_MUSEUM_SUBTITLE } from '../../../../utils/adminStudioMuseumDemo';

export default function AdminStudioMuseumPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO MUSEUM™"
      subtitle={STUDIO_MUSEUM_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="visuals"
    >
      <MuseumWorkspace />
      <AdminStudioDisclaimerFooter>
        LIVING HISTORY™ · GOLDEN BUILDS™ AUTO-ARCHIVED · WAREHOUSE BUILDS THE FUTURE · MUSEUM PRESERVES IT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
