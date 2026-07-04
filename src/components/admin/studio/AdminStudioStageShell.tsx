import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../../pages/admin/components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { useWorkspace } from '../../../studio-os/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../studio-os/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioStageShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  breadcrumbParentLabel?: string;
  breadcrumbParentPath?: string;
  children: ReactNode;
  /** Optional accent for subtle header emphasis */
  accentHex?: string;
};

/** Light frosted Studio shell — matches admin marble + StatsCard language. */
export function AdminStudioStageShell({
  title,
  subtitle,
  showBack = true,
  onBack,
  breadcrumbParentLabel = 'THE STUDIO',
  breadcrumbParentPath = '/admin/studio',
  children,
  accentHex: _accentHex = ADMIN_STUDIO_THEME.accent,
}: AdminStudioStageShellProps) {
  void _accentHex;
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  const handleBack = onBack ?? (() => navigate(breadcrumbParentPath));

  return (
    <div className="min-h-screen relative">
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
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={title}
          showBack={showBack}
          onBack={handleBack}
          breadcrumbParentLabel={breadcrumbParentLabel}
          breadcrumbParentPath={breadcrumbParentPath}
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto">
            <div
              className={`bg-white/60 backdrop-blur-sm border border-black p-4 ${ADMIN_STUDIO_THEME.cardShadow}`}
              style={{ borderWidth: '1.3px', minHeight: 'calc(100dvh - 200px)' }}
            >
              {subtitle ? (
                <p
                  className="text-[9px] font-futura uppercase mb-4 tracking-widest"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
                >
                  {subtitle}
                </p>
              ) : null}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
