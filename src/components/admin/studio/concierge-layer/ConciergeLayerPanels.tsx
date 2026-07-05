import { Link } from 'react-router-dom';
import type { ConciergeLayerStore, ConciergeLayerWorkspaceId } from '../../../../studio-os-core/concierge-layer/types';
import { CONCIERGE_CONNECTED_SYSTEMS } from '../../../../studio-os-core/concierge-layer/constants';
import {
  adminStudioArrivalExperiencePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioConciergeLayerPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioFounderWalkPath,
  adminStudioOrganizationalApprenticeshipPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioReaderGraphPath,
  adminStudioStudioInstitutePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  CONCIERGE_LAYER_STYLES,
  CL,
  clDarkHeader,
  clLabel,
  clLiveDot,
  clPanel,
  clSectionTitle,
  clValue,
} from './conciergeLayerTheme';

type Props = {
  store: ConciergeLayerStore;
  onSelectWorkspace: (id: ConciergeLayerWorkspaceId) => void;
};

export function ConciergeLayerHeader() {
  return (
    <>
      <style>{CONCIERGE_LAYER_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...clDarkHeader, borderTop: `3px solid ${CL.gold}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CONCIERGE LAYER
        </p>
        <p style={{ ...clLabel, color: '#FDE68A' }}>
          <span style={clLiveDot} />
          FOUNDER-FACING GUIDANCE · V1.0 · EXECUTIVES GOVERN · CONCIERGES GUIDE
        </p>
        <p style={{ ...clLabel, color: '#FEF3C7', marginTop: 4, fontStyle: 'italic' }}>
          YOU DON&apos;T NAVIGATE STUDIO OS · STUDIO OS GUIDES YOU
        </p>
      </header>
    </>
  );
}

export function ClDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...clPanel, background: CL.missionBg }}>
      <p style={clSectionTitle}>CONCIERGE DASHBOARD · PERSONAL GUIDANCE</p>
      <p style={{ ...clLabel, color: CL.champagne, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-5">
        {[
          ['CONCIERGE TEAM', `${d.conciergeTeamSize}`],
          ['GUIDANCE', `${d.activeGuidanceSessions}`],
          ['SATISFACTION', `${d.founderSatisfactionPct}%`],
          ['TODAY', `${d.recommendationsToday}`],
          ['CONFIDENCE', `${d.organizationalConfidencePct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CL.panelBorder }}>
            <p style={{ ...clValue, fontSize: '12px' }}>{val}</p>
            <p style={clLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ConciergePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>CORE PHILOSOPHY · HOSPITALITY-DRIVEN INTELLIGENCE</p>
      {store.conciergePhilosophy.map((line) => (
        <p key={line} style={{ ...clLabel, color: CL.champagne }}>· {line}</p>
      ))}
    </section>
  );
}

export function ConciergeDirectoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>MEET YOUR CONCIERGE TEAM · CONCIERGE DIRECTORY</p>
      {store.conciergeIdentities.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: CL.panelBorder }}>
          <p style={{ ...clLabel, fontSize: '6px', color: CL.champagne, fontFamily: '"Futura PT Medium"' }}>
            {c.conciergeTitle.toUpperCase()} · REPRESENTS {c.representsExecutive.toUpperCase()}
          </p>
          <p style={clLabel}>{c.tagline}</p>
          <p style={{ ...clLabel, color: CL.emerald, fontSize: '6px' }}>Teaches: {c.teaches.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function ConciergeBehaviorPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>CONCIERGE BEHAVIOR · EXPERIENCED ADVISORS</p>
      {store.conciergeBehavior.map((b) => (
        <div key={b.id} className="py-2 border-b" style={{ borderColor: CL.panelBorder }}>
          <p style={{ ...clLabel, fontSize: '6px', color: CL.champagne, fontFamily: '"Futura PT Medium"' }}>
            {b.principle.toUpperCase()}
          </p>
          <p style={clLabel}>{b.description}</p>
        </div>
      ))}
    </section>
  );
}

export function ChiefConciergeExperiencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...clPanel, background: CL.missionBg }}>
      <p style={clSectionTitle}>CHIEF CONCIERGE EXPERIENCE · FACE OF STUDIO OS</p>
      {store.chiefConciergeExperience.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: CL.panelBorder }}>
          <p style={{ ...clLabel, fontSize: '6px', color: CL.champagne, fontFamily: '"Futura PT Medium"' }}>
            {m.experience.toUpperCase()} · {m.timing.toUpperCase()}
          </p>
          <p style={clLabel}>{m.chiefConciergeRole}</p>
        </div>
      ))}
    </section>
  );
}

export function ConciergeRelationshipPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>EXECUTIVE RELATIONSHIP · SEAMLESS BEHIND THE SCENES</p>
      {store.relationshipExamples.map((ex) => (
        <div key={ex.id} className="py-2 border-b" style={{ borderColor: CL.panelBorder }}>
          <p style={{ ...clLabel, fontSize: '6px', color: CL.champagne, fontFamily: '"Futura PT Medium"' }}>
            {ex.concierge.toUpperCase()}
          </p>
          <p style={{ ...clLabel, fontStyle: 'italic' }}>&quot;{ex.founderQuestion}&quot;</p>
          <p style={clLabel}><span style={{ color: CL.slate }}>Behind the scenes:</span> {ex.behindTheScenes}</p>
          <p style={{ ...clLabel, color: CL.emerald }}><span style={{ color: CL.slate }}>Founder experience:</span> {ex.founderExperience}</p>
        </div>
      ))}
    </section>
  );
}

export function TerminologyMapPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>FOUNDER-FACING TERMINOLOGY · GOVERNANCE UNCHANGED</p>
      {store.terminologyMap.map((t) => (
        <p key={t.founderFacing} style={clLabel}>
          <span style={{ color: CL.champagne, fontFamily: '"Futura PT Medium"' }}>{t.founderFacing}</span>
          {' ← '}
          <span style={{ color: CL.slate }}>{t.internalGovernance}</span>
        </p>
      ))}
    </section>
  );
}

export function FutureVisionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>FUTURE VISION · WORLD-CLASS HEADQUARTERS HOSPITALITY</p>
      {store.futureOpportunities.map((o) => (
        <p key={o} style={clLabel}>· {o}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ConciergeLayerWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? CL.champagne : CL.panelBorder,
              color: store.activeWorkspaceId === id ? CL.champagne : CL.gray,
              background: store.activeWorkspaceId === id ? 'rgba(146,112,74,0.08)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={clPanel}>
      <p style={clSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CONCIERGE_CONNECTED_SYSTEMS.map((sys: string) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CL.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...clLabel, color: '#0F172A', fontSize: '6px' }}>→ CHIEF OF STAFF (GOVERNANCE)</Link>
        <Link to={adminStudioArrivalExperiencePath()} style={{ ...clLabel, color: '#0369A1', fontSize: '6px' }}>→ ARRIVAL EXPERIENCE</Link>
        <Link to={adminStudioFounderWalkPath()} style={{ ...clLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER WALK</Link>
        <Link to={adminStudioStudioInstitutePath()} style={{ ...clLabel, color: '#854D0E', fontSize: '6px' }}>→ STUDIO INSTITUTE</Link>
        <Link to={adminStudioOrganizationalApprenticeshipPath()} style={{ ...clLabel, color: '#155E75', fontSize: '6px' }}>→ ORGANIZATIONAL APPRENTICESHIP</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...clLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...clLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...clLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...clLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...clLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...clLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...clLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...clLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...clLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...clLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioConciergeLayerPath()} style={{ ...clLabel, color: '#92704A', fontSize: '6px' }}>→ CONCIERGE LAYER</Link>
      </div>
    </section>
  );
}
