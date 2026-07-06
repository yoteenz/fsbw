import { useNavigate } from 'react-router-dom';
import { useDesignTokenEngineState } from '../../../../hooks/useDesignTokenEngineState';
import { DESIGN_TOKEN_ENGINE_ACCENT } from '../../../../studio-os-core/design-token-engine';
import { adminStudioDesignTokenEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Design Token Engine™ preview (M129). */
export function MissionControlDesignTokenEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useDesignTokenEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="DESIGN TOKEN ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>VISUAL TOKENS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="DESIGN TOKEN ENGINE™ · VISUAL TRUTH">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.engineScore} size={52} label="DT" accent={DESIGN_TOKEN_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalTokens} TOKENS · {profile.componentCoveragePct}% INHERITANCE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>DESIGN BIBLE PROTECTED</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockEngineLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioDesignTokenEnginePath())} style={eiaActionBtn}>
        OPEN DESIGN TOKEN ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
