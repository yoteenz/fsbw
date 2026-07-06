import { useNavigate } from 'react-router-dom';
import { useRegressionEngineState } from '../../../../hooks/useRegressionEngineState';
import { REGRESSION_ENGINE_ACCENT } from '../../../../studio-os-core/regression-engine';
import { adminStudioRegressionEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Regression Engine™ preview (M160). */
export function MissionControlRegressionEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useRegressionEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="REGRESSION ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>CONTINUOUS REGRESSION VERIFICATION LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="REGRESSION ENGINE™ · NEVER REPEAT MISTAKES">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallRegressionScore} size={52} label="REG" accent={REGRESSION_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.buildsTested} BUILDS · {profile.brokenFeaturesOpen} BROKEN
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.regressionsInHistory} in Historical Memory™ · {profile.recurringPatterns} pattern(s)
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegressionLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioRegressionEnginePath())} style={eiaActionBtn}>
        OPEN REGRESSION ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
