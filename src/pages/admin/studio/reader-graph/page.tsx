import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ReaderGraphWorkspace } from '../../../../components/admin/studio/reader-graph/ReaderGraphWorkspace';

const READER_GRAPH_SUBTITLE =
  'Every person becomes part of a continuously evolving relationship graph — trust, learning, loyalty, and advocacy over years.';

export default function AdminStudioReaderGraphPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="READER GRAPH"
      subtitle={READER_GRAPH_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/distribution-engine')}
      navGroupId="intelligence"
    >
      <ReaderGraphWorkspace />
      <AdminStudioDisclaimerFooter>
        READER GRAPH V1.0 · LIVING RELATIONSHIPS · TRUST · ADVOCACY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
