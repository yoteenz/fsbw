import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { BrandCopyEditorPanel, type BrandCopyEditorMode } from '../../components/BrandCopyEditorPanel';
import PsaChatCopyEditorPanel from '../../components/PsaChatCopyEditorPanel';
import AdminPsaReviewPanel from '../../components/AdminPsaReviewPanel';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

function parseCopyKind(raw: string | undefined): BrandCopyEditorMode | 'chat' | 'psa-review' | null {
  if (raw === 'nudges' || raw === 'alerts' || raw === 'chat' || raw === 'psa-review') return raw;
  return null;
}

export default function AdminBrandCopyEditor() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { copyKind } = useParams<{ copyKind: string }>();
  const mode = parseCopyKind(copyKind);

  useEffect(() => {
    if (!mode) navigate('/admin/brand?tab=ALERTS', { replace: true });
  }, [mode, navigate]);

  if (!mode) return null;

  const title =
    mode === 'nudges'
      ? 'EDIT PSA NUDGES'
      : mode === 'alerts'
        ? 'EDIT ACCOUNT ALERTS'
        : mode === 'psa-review'
          ? 'PSA REVIEW'
          : 'EDIT PSA CHAT';

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={title}
          showBack
          onBack={() => navigate('/admin/brand?tab=ALERTS')}
          breadcrumbParentLabel="BRAND"
          breadcrumbParentPath="/admin/brand?tab=ALERTS"
        />
        <div className="pb-8 px-4 max-w-md mx-auto">
          <div
            className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
            style={{ borderWidth: '1.3px' }}
          >
            <div
              className="overflow-y-auto overflow-x-hidden"
              style={{
                maxHeight: 'calc(100vh - 140px)',
                padding: '16px 20px 24px',
                boxSizing: 'border-box',
              }}
            >
              {mode === 'chat' ? (
                <PsaChatCopyEditorPanel />
              ) : mode === 'psa-review' ? (
                <AdminPsaReviewPanel />
              ) : (
                <BrandCopyEditorPanel mode={mode} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
