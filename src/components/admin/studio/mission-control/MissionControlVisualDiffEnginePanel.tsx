import { useNavigate } from 'react-router-dom';
import { useVisualDiffEngineState } from '../../../../hooks/useVisualDiffEngineState';
import { VISUAL_DIFF_ENGINE_ACCENT } from '../../../../studio-os-core/visual-diff-engine';
import { adminStudioVisualDiffEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Visual Diff Engine™ preview (M157). */
export function MissionControlVisualDiffEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useVisualDiffEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="VISUAL DIFF ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>VISUAL MEMORY SCAN LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="VISUAL DIFF ENGINE™ · VISUAL MEMORY">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.visualMemoryScore} size={52} label="VD" accent={VISUAL_DIFF_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.screensCompared} SCREENS · {profile.diffsDetected} DIFFS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Guardian of Studio OS visual identity
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockVisualDiffLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioVisualDiffEnginePath())} style={eiaActionBtn}>
        OPEN VISUAL DIFF →
      </button>
    </ExecutiveSecondaryCard>
  );
}
