import { useNavigate } from 'react-router-dom';
import { useOrganizationPulseState } from '../../../../hooks/useOrganizationPulseState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioOrganizationPulsePath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

function pulseStateColor(state: string): string {
  if (state === 'thriving' || state === 'healthy' || state === 'growing') return '#16A34A';
  if (state === 'stable') return '#0891B2';
  if (state === 'needs-attention') return '#CA8A04';
  return MC_VISUAL.red;
}

/** Mission Control — Organization Pulse™ (M100). How the organization feels. */
export function MissionControlOrganizationPulsePanel() {
  const navigate = useNavigate();
  const { profile } = useOrganizationPulseState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ORGANIZATION PULSE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ORGANIZATION PULSE™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topIndicators = profile.indicatorScores
    .slice()
    .sort((a, b) => a.scorePct - b.scorePct)
    .slice(0, 3);

  const topAlert = profile.proactiveAlerts.find((a) => a.severity !== 'info');

  return (
    <ExecutiveSecondaryCard title="ORGANIZATION PULSE™ · HOW WE FEEL">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallPulseScore} size={52} label="PULSE" accent="#0891B2" />
        <div>
          <p style={{ ...eiaCaption, color: pulseStateColor(profile.pulseState), fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.overallPulseScore}% · {profile.pulseState.replace(/-/g, ' ').toUpperCase()}
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.pulseFeeling.slice(0, 90)}…
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {topIndicators.map((i) => (
          <div key={i.id} className="text-center py-1" style={{ background: 'rgba(0,0,0,0.03)' }}>
            <p style={{ ...eiaCaption, fontSize: '6px', color: MC_VISUAL.black }}>{i.label.split(' ')[0]}</p>
            <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '13px', color: pulseStateColor(i.state) }}>{i.scorePct}%</p>
          </div>
        ))}
      </div>
      {topAlert ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: MC_VISUAL.red, marginBottom: 8 }}>
          ALERT: {topAlert.title} — {topAlert.recommendedAction.slice(0, 55)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioOrganizationPulsePath())} style={eiaActionBtn}>
        DRILL INTO ORGANIZATION PULSE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
