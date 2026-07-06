import { useNavigate } from 'react-router-dom';
import { useStudioFoundationModelsState } from '../../../../hooks/useStudioFoundationModelsState';
import {
  ROADMAP_PHASE_LABELS,
  STUDIO_FOUNDATION_MODELS_ACCENT,
} from '../../../../studio-os-core/studio-foundation-models';
import { adminStudioStudioFoundationModelsPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Studio Foundation Models™ preview (M124). */
export function MissionControlStudioFoundationModelsPanel() {
  const navigate = useNavigate();
  const { profile } = useStudioFoundationModelsState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="STUDIO FOUNDATION MODELS™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>FOUNDATION MODELS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="STUDIO FOUNDATION MODELS™ · PROFESSION MODELS™">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.foundationScore} size={52} label="SFM" accent={STUDIO_FOUNDATION_MODELS_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {ROADMAP_PHASE_LABELS[profile.currentRoadmapPhase].toUpperCase()} · {profile.professionModels.length} PROFESSION MODELS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>GENERAL MODELS KNOW THE WORLD · STUDIO MODELS™ KNOW ORGANIZATIONS</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockFoundationModelsLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioStudioFoundationModelsPath())} style={eiaActionBtn}>
        OPEN STUDIO FOUNDATION MODELS →
      </button>
    </ExecutiveSecondaryCard>
  );
}
