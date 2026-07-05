import { Link } from 'react-router-dom';
import type { FoundersPromiseStore, FoundersPromiseWorkspaceId } from '../../../../studio-os-core/founders-promise/types';
import { FOUNDERS_PROMISE_CONNECTED_SYSTEMS } from '../../../../studio-os-core/founders-promise/constants';
import {
  adminStudioArchitectStudioPath,
  adminStudioCampusEvolutionEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioFounderWalkPath,
  adminStudioLeadershipDnaPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioRemembranceGardenPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioRelationshipEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  alignmentColor,
  FOUNDERS_PROMISE_STYLES,
  FP,
  fpDarkHeader,
  fpLabel,
  fpLiveDot,
  fpPanel,
  fpSectionTitle,
  fpValue,
  statusColor,
} from './foundersPromiseTheme';

type Props = {
  store: FoundersPromiseStore;
  onSelectWorkspace: (id: FoundersPromiseWorkspaceId) => void;
};

export function FoundersPromiseHeader() {
  return (
    <>
      <style>{FOUNDERS_PROMISE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...fpDarkHeader, borderTop: `3px solid ${FP.amber}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          FOUNDER&apos;S PROMISE
        </p>
        <p style={{ ...fpLabel, color: '#94A3B8' }}>
          <span style={fpLiveDot} />
          PERSONAL NORTH STAR · NOT MARKETING · OPTIMIZED FOR TRUTH
        </p>
        <p style={{ ...fpLabel, color: '#CBD5E1', marginTop: 4 }}>
          THE QUIET COMPASS · EMOTIONAL FOUNDATION · PRESERVE THE CONVICTION THAT STARTED EVERYTHING
        </p>
      </header>
    </>
  );
}

export function PromiseDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>FOUNDER&apos;S PROMISE · NORTH STAR</p>
      <p style={{ ...fpLabel, color: FP.amber, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...fpLabel, color: FP.amber, marginTop: 4 }}>
        {store.companyName} · V{d.currentVersion} · PRIVACY: {d.privacy.toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['ALIGNMENT', `${d.alignmentScorePct}%`],
          ['VERSIONS', `${d.totalVersions}`],
          ['EXECUTIVES', `${d.executivesAligned}`],
          ['ARCHIVE', `${d.archiveEntries}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: FP.panelBorder }}>
            <p style={{ ...fpValue, fontSize: '12px' }}>{val}</p>
            <p style={fpLabel}>{label}</p>
          </div>
        ))}
      </div>
      {d.reflectionMomentsPending > 0 && (
        <p style={{ ...fpLabel, marginTop: 8, color: FP.amber }}>
          {d.reflectionMomentsPending} reflection invitation pending · not obligation
        </p>
      )}
    </section>
  );
}

export function PromisePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>PROMISE PHILOSOPHY · BEFORE SUCCESS</p>
      {store.promisePhilosophy.map((line) => (
        <p key={line} style={{ ...fpLabel, color: FP.amber }}>· {line}</p>
      ))}
    </section>
  );
}

export function ReflectiveQuestionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fpPanel, background: FP.promiseBg }}>
      <p style={fpSectionTitle}>GUIDED REFLECTION · THOUGHTFUL CONVERSATION</p>
      <p style={{ ...fpLabel, fontSize: '5px', marginBottom: 8 }}>
        Studio Intelligence helps explore · never an empty text box
      </p>
      {store.reflectiveQuestions.map((q) => (
        <div key={q.id} className="py-2 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '6px', color: q.explored ? FP.amber : FP.gray, fontFamily: '"Futura PT Medium"' }}>
            {q.explored ? '✓' : '○'} {q.question}
          </p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>{q.promptContext}</p>
        </div>
      ))}
    </section>
  );
}

export function CurrentPromisePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fpPanel, background: FP.promiseBg }}>
      <p style={fpSectionTitle}>THE PROMISE · V{store.currentPromise.version} · {store.currentPromise.format.toUpperCase()}</p>
      <p style={{ ...fpLabel, fontSize: '5px', marginBottom: 8 }}>Last revised: {store.currentPromise.lastRevised}</p>
      <div className="fp-promise-text">{store.currentPromise.text}</div>
    </section>
  );
}

export function OriginalPromisePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fpPanel, borderLeft: `4px solid ${FP.amber}` }}>
      <p style={fpSectionTitle}>ORIGINAL PROMISE · PRESERVED FOREVER</p>
      <p style={{ ...fpLabel, fontSize: '5px', marginBottom: 8 }}>
        {store.originalPromise.date} · {store.originalPromise.preserved ? 'IMMUTABLE ARCHIVE' : 'DRAFT'}
      </p>
      <div className="fp-promise-text" style={{ opacity: 0.92 }}>{store.originalPromise.text}</div>
    </section>
  );
}

export function PromiseVersionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>PROMISE VERSIONS · EVERY REVISION IS HISTORY</p>
      {store.promiseVersions.map((v) => (
        <div key={v.id} className="py-2 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '6px', color: FP.amber, fontFamily: '"Futura PT Medium"' }}>
            V{v.version} · {v.label} · {v.date} · {v.format.toUpperCase()}
          </p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>{v.excerpt}</p>
          {v.changeReason && <p style={{ ...fpLabel, fontSize: '5px', fontStyle: 'italic' }}>WHY: {v.changeReason}</p>}
        </div>
      ))}
    </section>
  );
}

export function LivingEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>LIVING PROMISE · HOW IT EVOLVED</p>
      {store.livingEvolution.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '5px', color: FP.amber }}>V{e.fromVersion} → V{e.toVersion}</p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>CHANGED: {e.whatChanged}</p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>WHY: {e.whyChanged}</p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>EVENT: {e.influencingEvent}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalAlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>ORGANIZATIONAL ALIGNMENT · DECISIONS VS PROMISE</p>
      {store.organizationalAlignment.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '6px', color: alignmentColor(a.alignmentScore), fontFamily: '"Futura PT Medium"' }}>
            {a.alignmentScore}% · {a.category} · {a.decision}
          </p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>{a.reasoning}</p>
          {a.potentialConflict && <p style={{ ...fpLabel, fontSize: '5px', color: FP.red }}>CONFLICT: {a.potentialConflict}</p>}
          {a.recommendedAdjustment && <p style={{ ...fpLabel, fontSize: '5px', color: FP.amber }}>→ {a.recommendedAdjustment}</p>}
        </div>
      ))}
    </section>
  );
}

export function ExecutiveAlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>EXECUTIVE ALIGNMENT · GOVERNING PRINCIPLE</p>
      {store.executiveAlignment.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '6px', color: statusColor(e.status), fontFamily: '"Futura PT Medium"' }}>
            {e.executive} · {e.status.toUpperCase()}
          </p>
          <p style={{ ...fpLabel, fontSize: '5px', fontStyle: 'italic' }}>{e.alignmentQuestion}</p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>{e.currentAssessment}</p>
        </div>
      ))}
    </section>
  );
}

export function ReflectionMomentsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fpPanel, borderLeft: `4px solid ${FP.amber}` }}>
      <p style={fpSectionTitle}>PROMISE REFLECTION · INVITATION NOT OBLIGATION</p>
      {store.reflectionMoments.map((r) => (
        <div key={r.id} className="py-1 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '5px', color: FP.amber }}>{r.trigger} · {r.status.toUpperCase()}</p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>{r.invitation}</p>
        </div>
      ))}
    </section>
  );
}

export function PromiseArchivePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>PROMISE ARCHIVE · FULL HISTORY</p>
      {store.promiseArchive.map((a) => (
        <div key={a.id} className="py-1 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '5px', color: FP.amber }}>{a.type.toUpperCase()} · {a.date}</p>
          <p style={{ ...fpLabel, fontSize: '6px', fontFamily: '"Futura PT Medium"' }}>{a.title}</p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>{a.note}</p>
        </div>
      ))}
    </section>
  );
}

export function LegacyInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fpPanel, background: 'rgba(254,243,199,0.5)' }}>
      <p style={fpSectionTitle}>LEGACY INHERITANCE · LETTERS TO THE FUTURE</p>
      {store.legacyInheritance.map((l) => (
        <div key={l.id} className="py-2 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '6px', color: FP.amber, fontFamily: '"Futura PT Medium"' }}>
            {l.recipient} · {l.privacy.toUpperCase()}
          </p>
          <p style={{ ...fpLabel, fontSize: '5px', color: FP.accent }}>{l.subject}</p>
          <p style={{ ...fpLabel, fontSize: '5px', fontStyle: 'italic' }}>{l.excerpt}</p>
        </div>
      ))}
    </section>
  );
}

export function CampusInstallationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>CAMPUS INSTALLATION · A PLACE NOT A PLAQUE</p>
      {store.campusInstallation.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: FP.panelBorder }}>
          <p style={{ ...fpLabel, fontSize: '6px', color: FP.amber, fontFamily: '"Futura PT Medium"' }}>{c.location}</p>
          <p style={{ ...fpLabel, fontSize: '5px' }}>{c.description}</p>
          <p style={{ ...fpLabel, fontSize: '5px', fontStyle: 'italic' }}>{c.experience}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: FoundersPromiseWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>PROMISE WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? FP.amber : FP.panelBorder,
              color: store.activeWorkspaceId === id ? FP.amber : FP.gray,
              background: store.activeWorkspaceId === id ? 'rgba(146,64,14,0.06)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...fpLabel, color: FP.amber }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={fpPanel}>
      <p style={fpSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {FOUNDERS_PROMISE_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: FP.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioRemembranceGardenPath()} style={{ ...fpLabel, color: '#6B9080', fontSize: '6px' }}>→ REMEMBRANCE GARDEN</Link>
        <Link to={adminStudioFounderWalkPath()} style={{ ...fpLabel, color: '#78716C', fontSize: '6px' }}>→ FOUNDER WALK</Link>
        <Link to={adminStudioCampusEvolutionEnginePath()} style={{ ...fpLabel, color: '#0D9488', fontSize: '6px' }}>→ CAMPUS EVOLUTION</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...fpLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...fpLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...fpLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...fpLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...fpLabel, color: FP.amber, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...fpLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioArchitectStudioPath()} style={{ ...fpLabel, color: '#CA8A04', fontSize: '6px' }}>→ ARCHITECT STUDIO</Link>
      </div>
    </section>
  );
}
