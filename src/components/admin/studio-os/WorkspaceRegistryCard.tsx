import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkspaceListItem } from '../../../studio-os-core/workspace/types';
import {
  getWorkspaceSnapshot,
  toggleWorkspaceFavorite,
} from '../../../studio-os-core/workspace-registry/store';
import { STUDIO_OS_ROUTES } from '../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type Props = {
  workspace: WorkspaceListItem;
  isActive: boolean;
  onEnter: () => void;
  onMorningBriefing?: () => void;
  registryMeta?: { workspaceType?: string; deploymentStage?: string; isReferencePilot?: boolean };
};

export function WorkspaceRegistryCard({
  workspace,
  isActive,
  onEnter,
  onMorningBriefing,
  registryMeta,
}: Props) {
  const navigate = useNavigate();
  const snapshot = useMemo(() => getWorkspaceSnapshot(workspace.id), [workspace.id]);
  const isPlaceholder = workspace.status === 'placeholder';

  return (
    <article
      className="w-full text-left border bg-white/85 shadow-md studio-living-card studio-glass-sheen overflow-hidden"
      style={{
        borderWidth: '1.3px',
        borderColor: isActive ? '#EB1C24' : ADMIN_STUDIO_THEME.panelBorder,
        borderTop: `3px solid ${isActive ? '#EB1C24' : registryMeta?.isReferencePilot ? '#6366F1' : isPlaceholder ? '#9CA3AF' : '#2563EB'}`,
      }}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 overflow-hidden border flex items-center justify-center"
            style={{ width: 52, height: 52, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            <img src={workspace.logoSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '16px', margin: 0 }}>
                {workspace.displayName}
              </p>
              {isActive ? (
                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#EB1C24' }}>ACTIVE</span>
              ) : null}
            </div>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#808080', margin: '4px 0' }}>
              {workspace.metadata.industry?.toUpperCase() ?? 'ORGANIZATION'} · {workspace.metadata.description}
            </p>
            {registryMeta ? (
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: '#6366F1' }}>
                {registryMeta.workspaceType?.toUpperCase()} · {registryMeta.deploymentStage?.toUpperCase()}
                {registryMeta.isReferencePilot ? ' · REFERENCE PILOT' : ''}
              </p>
            ) : null}
          </div>
        </div>

        {snapshot ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: 'HEALTH', value: `${snapshot.organizationalHealthPct}%` },
              { label: 'APPROVALS', value: String(snapshot.pendingApprovals) },
              { label: 'AUTONOMY', value: snapshot.autonomyLevel.replace(/-/g, ' ').toUpperCase() },
              { label: 'REVENUE', value: snapshot.revenueSnapshot.split(' · ')[0] },
            ].map((s) => (
              <div key={s.label} className="py-1 px-2 text-center" style={{ background: 'rgba(0,0,0,0.03)' }}>
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: '#999', margin: 0 }}>{s.label}</p>
                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', margin: '2px 0 0' }}>{s.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {snapshot ? (
          <>
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: '#92704A', margin: '8px 0 2px' }}>
              TODAY&apos;S BRIEFING
            </p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#333', margin: 0 }}>
              {snapshot.todaysBriefing}
            </p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#888', margin: '4px 0 0' }}>
              {snapshot.recentActivity} · Chief Concierge {snapshot.conciergeStatus.replace(/-/g, ' ')}
            </p>
          </>
        ) : null}

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={onEnter}
            className="px-3 py-1.5 text-[7px] font-futura border"
            style={{ fontWeight: 515, color: '#FFF', background: '#EB1C24', borderColor: '#EB1C24' }}
          >
            ENTER WORKSPACE
          </button>
          <button
            type="button"
            onClick={onMorningBriefing ?? onEnter}
            className="px-2 py-1.5 text-[6px] font-futura border"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'white' }}
          >
            MORNING BRIEFING
          </button>
          <button
            type="button"
            onClick={() => toggleWorkspaceFavorite(workspace.id)}
            className="px-2 py-1.5 text-[6px] font-futura border"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'white' }}
          >
            {snapshot?.isFavorite ? '★ FAVORITE' : '☆ FAVORITE'}
          </button>
          <button
            type="button"
            onClick={() => navigate(STUDIO_OS_ROUTES.workspaceSettings(workspace.id))}
            className="px-2 py-1.5 text-[6px] font-futura border"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'white' }}
          >
            SETTINGS
          </button>
        </div>
      </div>
    </article>
  );
}
