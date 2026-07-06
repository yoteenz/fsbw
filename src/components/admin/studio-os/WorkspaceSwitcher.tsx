import { useNavigate } from 'react-router-dom';
import { useCampusTransition } from './campus/CampusTransitionProvider';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { canSwitchOrganizations } from '../../../studio-os-core/application/portfolio-access';
import { resolveOrganizationMissionControlPath } from '../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import { OrganizationIdentityCard } from './OrganizationIdentityCard';
import { useMemo, useState } from 'react';

/** Organization identity passport — portfolio owners may switch; org operators see active org only. */
export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { workspaceId, workspaces } = useWorkspace();
  const { travelToWorkspace, returnToCampus } = useCampusTransition();
  const [open, setOpen] = useState(false);
  const portfolioMode = canSwitchOrganizations();

  const activeWorkspaces = useMemo(
    () => workspaces.filter((w) => w.status !== 'archived'),
    [workspaces]
  );

  const switchTo = (id: string) => {
    setOpen(false);
    travelToWorkspace(id, { showBriefing: id !== workspaceId });
  };

  return (
    <div className="relative mb-2">
      <OrganizationIdentityCard
        portfolioMode={portfolioMode}
        switcherOpen={open}
        onToggleSwitcher={portfolioMode ? () => setOpen((v) => !v) : undefined}
      />

      {portfolioMode && open ? (
        <div
          className="absolute left-0 right-0 z-30 mt-1 p-2 rounded-sm studio-glass-depth"
          style={{ border: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.95)' }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              returnToCampus();
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
            → STUDIO COMMAND CENTER
          </button>
          {activeWorkspaces.map((ws) => (
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
                {ws.metadata.industry ?? ws.metadata.description?.slice(0, 40) ?? ws.displayName}
              </p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(resolveOrganizationMissionControlPath(workspaceId));
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
            → HEADQUARTERS
          </button>
        </div>
      ) : null}
    </div>
  );
}
