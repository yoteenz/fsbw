import { useNavigate } from 'react-router-dom';
import { usePredictiveOrganizationState } from '../../../../hooks/usePredictiveOrganizationState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioPredictiveOrganizationPath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Predictive Organization™ forecast preview (M113). */
export function MissionControlPredictiveOrganizationPanel() {
  const navigate = useNavigate();
  const { profile } = usePredictiveOrganizationState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PREDICTIVE ORGANIZATION™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>PREDICTIVE ORGANIZATION™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topPred = profile.predictions[0];
  const thirtyDay = profile.executiveForecasts.find((f) => f.horizon === '30-day');

  return (
    <ExecutiveSecondaryCard title="PREDICTIVE ORGANIZATION™ · FORECAST">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.predictiveScore} size={52} label="READY" accent="#EA580C" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.predictionsActive} PREDICTIONS · {profile.domainsAnalyzed} DOMAINS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>Prepare before tomorrow arrives</p>
        </div>
      </div>
      {thirtyDay ? (
        <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
          {thirtyDay.summary.slice(0, 100)}…
        </p>
      ) : null}
      {topPred ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#EA580C', marginBottom: 8 }}>
          {topPred.prediction.slice(0, 90)}… ({topPred.confidencePct}%)
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioPredictiveOrganizationPath())} style={eiaActionBtn}>
        OPEN PREDICTIVE ORGANIZATION →
      </button>
    </ExecutiveSecondaryCard>
  );
}
