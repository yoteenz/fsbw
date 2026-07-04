import type { ExecutiveTeamMember } from '../../../../studio-os-core/workspace-creation/types';
import { getExecutiveCollaborationChain } from '../../../../studio-os-core/workspace-creation/executiveTeam';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type ExecutiveTeamPanelProps = {
  team: ExecutiveTeamMember[];
  highlightCollaboration?: boolean;
};

export function ExecutiveTeamPanel({ team, highlightCollaboration = true }: ExecutiveTeamPanelProps) {
  const chain = highlightCollaboration
    ? getExecutiveCollaborationChain(team, 'chief-content-officer')
    : [];

  return (
    <div className="space-y-3">
      <p className="text-[8px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AI EXECUTIVE TEAM · INHERITS MEMORY BIBLE · CREATIVE DNA · WORKFLOWS · COMPANY OBJECTIVES
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="p-2 border"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
          >
            <p className="text-[8px] font-futura" style={{ fontWeight: 515, color: '#6366F1' }}>
              {member.title.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {member.department.toUpperCase()} · {member.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mt-1 leading-relaxed" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
              {member.mandate}
            </p>
            <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: '#9CA3AF' }}>
              INHERITS · {member.inherits.join(' · ').toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      {chain.length > 1 ? (
        <div className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(99,102,241,0.05)' }}>
          <p className="text-[7px] font-futura mb-2" style={{ fontWeight: 515, color: '#6366F1' }}>
            EXECUTIVE COLLABORATION EXAMPLE
          </p>
          <div className="flex flex-col items-center gap-0">
            {chain.map((member, i) => (
              <div key={member.id} className="w-full flex flex-col items-center">
                {i > 0 ? <div className="w-px h-2 bg-indigo-300" /> : null}
                <div
                  className="w-full text-center px-2 py-1 border text-[6px] font-futura"
                  style={{ borderColor: '#6366F1', background: 'white' }}
                >
                  {member.title.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[5px] font-futura mt-2 text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            CCO → CREATIVE DIRECTOR → DISTRIBUTION → ANALYTICS → UNIFIED PRODUCTION RECOMMENDATION
          </p>
        </div>
      ) : null}
    </div>
  );
}
