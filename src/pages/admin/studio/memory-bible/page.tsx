import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { MemoryBibleWorkspace } from '../../../../components/admin/studio/memory-bible/MemoryBibleWorkspace';
import { MEMORY_BIBLE_SUBTITLE } from '../../../../utils/adminStudioMemoryBibleDemo';

export default function AdminStudioMemoryBiblePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="MEMORY BIBLE"
      subtitle={MEMORY_BIBLE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <MemoryBibleWorkspace />
      <AdminStudioDisclaimerFooter>
        MEMORY BIBLE · ADMIN ONLY · INSTITUTIONAL KNOWLEDGE · AI CONTEXT BUILDER · LINKED TO KNOWLEDGE GRAPH
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
