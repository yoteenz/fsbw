import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../studio-os-core/config/platform';
import { STUDIO_OS_VOCABULARY } from '../../../studio-os-core/core/vocabulary';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { workspaceStudioEntryPath } from '../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import type { WorkspaceListItem } from '../../../studio-os-core/workspace/types';

export default function AdminStudioOsPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspaces, setActiveWorkspace, workspaceId } = useWorkspace();

  const selectWorkspace = (id: string, entryPath: string) => {
    setActiveWorkspace(id);
    navigate(workspaceStudioEntryPath(id, entryPath));
  };

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
          title={STUDIO_OS_PLATFORM.name}
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black p-4 shadow-lg"
              style={{ borderWidth: '1.3px' }}
            >
              <p
                className="text-red-500 font-bold text-xl tracking-wider uppercase"
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                  color: '#EB1C24',
                }}
              >
                {STUDIO_OS_PLATFORM.name}
              </p>
              <p
                className="mt-2 text-[10px] font-futura uppercase"
                style={{ fontWeight: 515, color: '#808080', lineHeight: 1.4 }}
              >
                {STUDIO_OS_PLATFORM.tagline}
              </p>
              <p
                className="mt-3 text-[8px] font-futura uppercase"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
              >
                SELECT {STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {workspaces.map((ws: WorkspaceListItem) => {
                const isActive = ws.id === workspaceId;
                const isPlaceholder = ws.status === 'placeholder';
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      const entry = ws.id === 'frontal-slayer'
                        ? '/admin/studio/mission-control'
                        : `/admin/studio-os/workspace/${ws.id}`;
                      selectWorkspace(ws.id, entry);
                    }}
                    className="w-full text-left border bg-white/80 shadow-md transition-transform active:scale-[0.98] overflow-hidden"
                    style={{
                      borderWidth: '1.3px',
                      borderColor: isActive ? '#EB1C24' : ADMIN_STUDIO_THEME.panelBorder,
                      borderTop: `2px solid ${isActive ? '#EB1C24' : isPlaceholder ? '#9CA3AF' : '#2563EB'}`,
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="flex-shrink-0 overflow-hidden border"
                        style={{ width: 48, height: 48, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                      >
                        <img src={ws.logoSrc} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12px] leading-tight"
                          style={{
                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                            color: ADMIN_STUDIO_THEME.textPrimary,
                          }}
                        >
                          {ws.displayName}
                        </p>
                        <p
                          className="text-[7px] font-futura uppercase mt-1 line-clamp-2"
                          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}
                        >
                          {ws.metadata.description}
                        </p>
                        {isPlaceholder ? (
                          <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#9CA3AF' }}>
                            PLACEHOLDER · ARCHITECTURE TEST
                          </p>
                        ) : null}
                      </div>
                      {isActive ? (
                        <span className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#EB1C24' }}>
                          ACTIVE
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <p
              className="text-[6px] font-futura uppercase text-center px-2"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}
            >
              {STUDIO_OS_PLATFORM.owner} OWNS {STUDIO_OS_PLATFORM.name} · {STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()}S RUN ON THE PLATFORM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
