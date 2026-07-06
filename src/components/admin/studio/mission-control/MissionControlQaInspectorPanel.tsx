import { useNavigate } from 'react-router-dom';
import { useQaInspectorState } from '../../../../hooks/useQaInspectorState';
import { QA_INSPECTOR_ACCENT } from '../../../../studio-os-core/qa-inspector';
import { adminStudioQaInspectorPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — QA Inspector™ preview (M143). */
export function MissionControlQaInspectorPanel() {
  const navigate = useNavigate();
  const { profile } = useQaInspectorState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="QA INSPECTOR™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>CONTINUOUS AUDIT LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="QA INSPECTOR™ · RECOMMENDS ONLY">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.inspectorScore} size={52} label="QI" accent={QA_INSPECTOR_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.openFindings} OPEN · {profile.criticalFindings} CRITICAL
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Never silently modifies · organization decides
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockInspectorLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioQaInspectorPath())} style={eiaActionBtn}>
        OPEN QA INSPECTOR →
      </button>
    </ExecutiveSecondaryCard>
  );
}
