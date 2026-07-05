import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { getWorkspaceSnapshot } from '../../../studio-os-core/workspace-registry/store';
import { STUDIO_OS_ROUTES } from '../../../studio-os-core/workspace/routes';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../../../studio-os-core/workspace/storage';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

/** Premium workspace switcher — always know which organization you are inside. */
export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { workspaceId, workspace, workspaces, enterWorkspace, resolveModulePath } = useWorkspace();
  const [open, setOpen] = useState(false);
  const snapshot = useMemo(() => getWorkspaceSnapshot(workspaceId), [workspaceId]);

  const switchTo = (id: string) => {
    enterWorkspace(id);
    setOpen(false);
    if (id === STUDIO_OS_DEFAULT_WORKSPACE_ID) {
      navigate('/admin/studio/mission-control');
      return;
    }
    if (id === 'ai-media') {
      navigate(STUDIO_OS_ROUTES.workspaceDashboard(id));
      return;
    }
    navigate(STUDIO_OS_ROUTES.workspaceDashboard(id));
  };

  return (
    <div className="relative mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left studio-living-card studio-glass-depth px-2 py-2 rounded-sm"
        style={{
          border: `1.3px solid ${workspace.colors.accent}44`,
          background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${workspace.colors.accent}08 100%)`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex-shrink-0 overflow-hidden border flex items-center justify-center"
            style={{ width: 28, height: 28, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            <img src={workspace.logoSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#808080', margin: 0 }}>
              CURRENT WORKSPACE
            </p>
            <p
              style={{
                fontFamily: '"Covered By Your Grace", sans-serif',
                fontSize: '14px',
                color: workspace.colors.primary,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {workspace.displayName}
            </p>
            {snapshot ? (
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#666', margin: '2px 0 0' }}>
                HEALTH {snapshot.organizationalHealthPct}% · {snapshot.pendingApprovals} APPROVALS
              </p>
            ) : null}
          </div>
          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#808080' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-30 mt-1 p-2 rounded-sm studio-glass-depth"
          style={{ border: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.95)' }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(STUDIO_OS_ROUTES.entry);
            }}
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '6px',
              color: '#6366F1',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: 6,
            }}
          >
            → WORKSPACE REGISTRY (CAMPUS)
          </button>
          {workspaces
            .filter((w) => w.status !== 'archived')
            .map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => switchTo(ws.id)}
                className="w-full text-left px-2 py-1.5 mb-1 studio-living-card"
                style={{
                  border: ws.id === workspaceId ? `1px solid ${ADMIN_STUDIO_THEME.accent}` : '1px solid #eee',
                  background: ws.id === workspaceId ? 'rgba(235,28,36,0.04)' : 'white',
                }}
              >
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', margin: 0 }}>{ws.displayName}</p>
                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#888', margin: '2px 0 0' }}>
                  {ws.metadata.industry ?? ws.metadata.description.slice(0, 40)}
                </p>
              </button>
            ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(resolveModulePath('mission-control'));
            }}
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '6px',
              color: ADMIN_STUDIO_THEME.accent,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            → MISSION CONTROL
          </button>
        </div>
      ) : null}
    </div>
  );
}
