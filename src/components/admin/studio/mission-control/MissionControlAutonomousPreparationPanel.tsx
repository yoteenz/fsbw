import { useNavigate } from 'react-router-dom';
import { useAutonomousPreparationState } from '../../../../hooks/useAutonomousPreparationState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioAutonomousPreparationPath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Autonomous Preparation™ queue preview (M114). */
export function MissionControlAutonomousPreparationPanel() {
  const navigate = useNavigate();
  const { profile } = useAutonomousPreparationState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="AUTONOMOUS PREPARATION™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>AUTONOMOUS PREPARATION™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topPending = profile.pendingPreparations.find((p) => p.status === 'pending');

  return (
    <ExecutiveSecondaryCard title="AUTONOMOUS PREPARATION™ · ONE STEP AHEAD">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.preparationScore} size={52} label="READY" accent="#0891B2" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.awaitingApprovalCount} AWAITING APPROVAL · {profile.pendingQueueCount} IN QUEUE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>Nothing auto-executes</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockPreparationLine.slice(0, 100)}…
      </p>
      {topPending ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#0891B2', marginBottom: 8 }}>
          {topPending.title} · {topPending.confidencePct}% confidence
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioAutonomousPreparationPath())} style={eiaActionBtn}>
        OPEN AUTONOMOUS PREPARATION →
      </button>
    </ExecutiveSecondaryCard>
  );
}
