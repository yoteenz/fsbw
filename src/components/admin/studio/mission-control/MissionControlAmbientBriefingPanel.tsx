import { useNavigate } from 'react-router-dom';
import { useAmbientAwarenessState } from '../../../../hooks/useAmbientAwarenessState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioAmbientAwarenessPath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Ambient Awareness™ daily executive briefing preview (M107). */
export function MissionControlAmbientBriefingPanel() {
  const navigate = useNavigate();
  const { profile } = useAmbientAwarenessState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="AMBIENT AWARENESS™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>AMBIENT AWARENESS™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const briefing = profile.dailyBriefing;
  const previewLines = briefing.briefingLines.slice(0, 3);

  return (
    <ExecutiveSecondaryCard title="AMBIENT AWARENESS™ · EXECUTIVE BRIEFING">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.awarenessScore} size={52} label="AWARENESS" accent="#475569" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {briefing.greeting} {profile.awarenessScore}% CONTEXT SYNC
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Present, not reactive — no prompt required
          </p>
        </div>
      </div>
      {previewLines.map((line) => (
        <p key={line} style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
          · {line}
        </p>
      ))}
      <p style={{ ...eiaCaption, fontSize: '7px', color: '#475569', marginBottom: 8, fontWeight: 515 }}>
        {briefing.topPriority}
      </p>
      <button type="button" onClick={() => navigate(adminStudioAmbientAwarenessPath())} style={eiaActionBtn}>
        OPEN AMBIENT AWARENESS →
      </button>
    </ExecutiveSecondaryCard>
  );
}
