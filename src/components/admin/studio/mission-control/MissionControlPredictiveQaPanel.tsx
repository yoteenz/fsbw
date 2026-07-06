import { useNavigate } from 'react-router-dom';
import { usePredictiveQaState } from '../../../../hooks/usePredictiveQaState';
import { PREDICTIVE_QA_ACCENT } from '../../../../studio-os-core/predictive-qa';
import { adminStudioPredictiveQaPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Predictive QA™ preview (M149). */
export function MissionControlPredictiveQaPanel() {
  const navigate = useNavigate();
  const { profile } = usePredictiveQaState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PREDICTIVE QA™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>FUTURE RISK ENGINE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="PREDICTIVE QA™ · FUTURE PROTECTION">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.predictiveQaScore} size={52} label="PQ" accent={PREDICTIVE_QA_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.activePredictions} ACTIVE · {profile.highRiskPredictions} HIGH-RISK
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Protect the future · not just validate the past
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockPredictiveQaLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioPredictiveQaPath())} style={eiaActionBtn}>
        OPEN PREDICTIVE QA →
      </button>
    </ExecutiveSecondaryCard>
  );
}
