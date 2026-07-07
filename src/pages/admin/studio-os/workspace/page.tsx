import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { StudioPlatformLayout } from '../../../../components/admin/studio-os/StudioPlatformLayout';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_VOCABULARY } from '../../../../studio-os-core/core/vocabulary';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { getWorkspaceById, isDynamicWorkspaceId, isKnownWorkspaceId } from '../../../../workspaces';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

/** Placeholder workspace shell — architecture testing only. */
export default function AdminStudioOsWorkspaceShellPage() {
  useRequireAdminPageAccess();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspace, setActiveWorkspace } = useWorkspace();

  useEffect(() => {
    if (workspaceId && isKnownWorkspaceId(workspaceId) && workspaceId !== workspace.id) {
      setActiveWorkspace(workspaceId);
    }
  }, [workspaceId, workspace.id, setActiveWorkspace]);

  if (!workspaceId || !isKnownWorkspaceId(workspaceId)) {
    return <Navigate to={STUDIO_OS_ROUTES.entry} replace />;
  }

  const schema = getWorkspaceById(workspaceId);
  if (!schema) {
    return <Navigate to={STUDIO_OS_ROUTES.entry} replace />;
  }

  if (isDynamicWorkspaceId(workspaceId)) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceDashboard(workspaceId)} replace />;
  }

  if (schema.studioEnabled) {
    return <Navigate to={schema.studioEntryPath} replace />;
  }

  const shellLinks = [
    { label: `${STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()} DASHBOARD`, path: STUDIO_OS_ROUTES.workspaceShell(workspaceId) },
    { label: `${STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()} SETTINGS`, path: STUDIO_OS_ROUTES.workspaceSettings(workspaceId) },
    { label: `${STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()} ASSETS`, path: STUDIO_OS_ROUTES.workspaceAssets(workspaceId) },
    { label: `${STUDIO_OS_VOCABULARY.project.term.toUpperCase()}S`, path: STUDIO_OS_ROUTES.workspaceProjects(workspaceId) },
    { label: `${STUDIO_OS_VOCABULARY.contentPack.term.toUpperCase()}S`, path: STUDIO_OS_ROUTES.workspaceContentPacks(workspaceId) },
    { label: 'LEGACY', path: STUDIO_OS_ROUTES.workspaceLegacy(workspaceId) },
  ];

  return (
    <StudioPlatformLayout
      title={schema.displayName}
      subtitle={`PLACEHOLDER ${STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()} · NO PRODUCTION DATA · ROUTING ARCHITECTURE ONLY`}
      onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
      hideNav
    >
      <div className="space-y-2 mb-4">
        {shellLinks.map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => navigate(link.path)}
            className="w-full text-left px-3 py-2 border text-[7px] font-futura uppercase"
            style={{
              fontWeight: 515,
              color: ADMIN_STUDIO_THEME.textSecondary,
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
              background: 'rgba(255,255,255,0.75)',
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setActiveWorkspace('frontal-slayer');
          navigate('/admin/studio/mission-control');
        }}
        className="w-full py-2.5 text-[7px] font-futura uppercase border"
        style={{ fontWeight: 515, color: '#FFF', background: '#EB1C24', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        OPEN FRONTAL SLAYER {STUDIO_OS_VOCABULARY.studio.term.toUpperCase()}
      </button>

      <p className="mt-4 text-[6px] font-futura uppercase text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ACTIVE CONTEXT: {workspace.displayName}
      </p>
    </StudioPlatformLayout>
  );
}
