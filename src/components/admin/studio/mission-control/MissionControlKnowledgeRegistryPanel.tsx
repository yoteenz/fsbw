import { useNavigate } from 'react-router-dom';
import { useKnowledgeRegistryState } from '../../../../hooks/useKnowledgeRegistryState';
import { KNOWLEDGE_REGISTRY_ACCENT } from '../../../../studio-os-core/knowledge-registry';
import { adminStudioKnowledgeRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Studio OS Knowledge Registry™ preview (M126). */
export function MissionControlKnowledgeRegistryPanel() {
  const navigate = useNavigate();
  const { profile } = useKnowledgeRegistryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="STUDIO OS KNOWLEDGE REGISTRY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>KNOWLEDGE REGISTRY LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="KNOWLEDGE REGISTRY™ · MASTER SPEC">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="KR" accent={KNOWLEDGE_REGISTRY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalEntries} ENTRIES · {profile.volumeSummaries.length} VOLUMES · {profile.masterSpecCoveragePct}% SPEC
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>ONE SPECIFICATION · INFINITE CONSUMERS · ALWAYS SYNCHRONIZED</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegistryLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioKnowledgeRegistryPath())} style={eiaActionBtn}>
        OPEN KNOWLEDGE REGISTRY™ →
      </button>
    </ExecutiveSecondaryCard>
  );
}

/** @deprecated Use MissionControlKnowledgeRegistryPanel */
export const MissionControlDocumentationRegistryPanel = MissionControlKnowledgeRegistryPanel;
