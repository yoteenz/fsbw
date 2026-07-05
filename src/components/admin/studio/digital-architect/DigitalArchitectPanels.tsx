import { Link } from 'react-router-dom';
import type { DigitalArchitectStore, DigitalArchitectWorkspaceId } from '../../../../studio-os-core/digital-architect/types';
import { DIGITAL_ARCHITECT_CONNECTED_SYSTEMS } from '../../../../studio-os-core/digital-architect/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioExperienceArchitectPath,
  adminStudioGrowthArchitectPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  DA,
  DIGITAL_ARCHITECT_STYLES,
  daDarkHeader,
  daLabel,
  daLiveDot,
  daPanel,
  daSectionTitle,
  daValue,
  scoreColor,
} from './digitalArchitectTheme';

type Props = {
  store: DigitalArchitectStore;
  onSelectWorkspace: (id: DigitalArchitectWorkspaceId) => void;
};

export function DigitalArchitectHeader() {
  return (
    <>
      <style>{DIGITAL_ARCHITECT_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...daDarkHeader, borderTop: `3px solid ${DA.indigo}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          DIGITAL ARCHITECT
        </p>
        <p style={{ ...daLabel, color: '#94A3B8' }}>
          <span style={daLiveDot} />
          V2.0 · DIGITAL SOLUTION ARCHITECT · PURPOSE BEFORE TEMPLATES · UNFORGETTABLE DIGITAL WORLDS
        </p>
        <p style={{ ...daLabel, color: '#CBD5E1', marginTop: 4 }}>
          EXPERIENCE GALLERY · HYBRID ARCHITECTURE · INHERITANCE · LAUNCH HANDOFF
        </p>
      </header>
    </>
  );
}

export function DigitalDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>DIGITAL ARCHITECT · ACTIVE HQ</p>
      <p style={{ ...daLabel, color: DA.indigo, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...daLabel, color: DA.indigo, marginTop: 4 }}>
        {store.companyName} · MODE: {(d.selectedMode ?? 'UNSELECTED').toString().replace(/-/g, ' ').toUpperCase()} · {d.approvalStatus.replace(/-/g, ' ').toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['ARCHITECTURE', `${d.architectureHealthPct}%`],
          ['INHERITANCE', `${d.inheritanceCompletenessPct}%`],
          ['DESIGN SYSTEM', `${d.designSystemPct}%`],
          ['IMPLEMENTATION', `${d.implementationReadinessPct}%`],
          ['MODES', store.experienceModes.length],
          ['HANDOFF', store.launchHandoff.status.toUpperCase()],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: DA.panelBorder }}>
            <p style={{ ...daValue, fontSize: '12px' }}>{val}</p>
            <p style={daLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DigitalPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>DIGITAL PHILOSOPHY · EXPERIENCES NOT TEMPLATES</p>
      {store.digitalPhilosophy.map((line) => (
        <p key={line} style={{ ...daLabel, color: DA.indigo }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExperienceGalleryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>EXPERIENCE MODE GALLERY · IMMERSIVE · NOT TEMPLATE CARDS</p>
      <p style={{ ...daLabel, fontSize: '5px', marginBottom: 8 }}>Walk through fully interactive digital experiences · inspiration before implementation</p>
      {store.experienceModes.map((m) => (
        <div
          key={m.id}
          className="p-2 mb-2 border"
          style={{
            borderColor: m.status === 'selected' || m.status === 'recommended' ? DA.indigo : DA.panelBorder,
            background: m.status === 'selected' ? 'rgba(99,102,241,0.06)' : 'white',
          }}
        >
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: m.status === 'selected' ? DA.indigo : DA.accent }}>{m.label}</p>
            <span className="text-[5px] font-futura" style={{ color: m.status === 'selected' ? DA.indigo : DA.gray }}>{m.status.toUpperCase()}</span>
          </div>
          <p style={{ ...daLabel, fontSize: '5px' }}>IDEAL: {m.idealFor.join(' · ')}</p>
          <p style={{ ...daLabel, fontSize: '5px', color: DA.slate }}>{m.capabilities.join(' · ')}</p>
          <p style={{ ...daLabel, fontSize: '5px', color: DA.indigo, marginTop: 4 }}>PREVIEW: {m.previewLabel}</p>
        </div>
      ))}
    </section>
  );
}

export function HybridArchitecturePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>HYBRID ARCHITECTURE · COMBINE MODES</p>
      {store.hybridArchitectures.map((h) => (
        <div key={h.id} className="p-2 mb-1 border" style={{ borderColor: DA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{h.label}</p>
            <span style={{ ...daValue, fontSize: '10px' }}>{h.confidencePct}%</span>
          </div>
          <p style={{ ...daLabel, fontSize: '5px' }}>{h.description}</p>
          <div className="flex gap-1 mt-1">
            {h.modes.map((m) => (
              <span key={m} className="text-[4px] font-futura px-1 border" style={{ borderColor: DA.indigo, color: DA.indigo }}>{m.toUpperCase()}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function RecommendationEnginePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>EXPERIENCE RECOMMENDATION ENGINE · STUDIO INTELLIGENCE</p>
      {store.recommendations.map((r) => (
        <div key={r.id} className="p-2 mb-1 border" style={{ borderColor: r.status === 'accepted' ? DA.indigo : DA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>
              {r.mode === 'hybrid' ? r.hybridLabel : r.mode.replace(/-/g, ' ').toUpperCase()}
            </p>
            <span style={{ ...daLabel, color: scoreColor(r.confidencePct) }}>{r.confidencePct}% · {r.status.toUpperCase()}</span>
          </div>
          <p style={{ ...daLabel, fontSize: '5px' }}>{r.reasoning}</p>
          <p style={{ ...daLabel, fontSize: '5px', color: DA.indigo }}>CUSTOMER: {r.customerImpact}</p>
          <p style={{ ...daLabel, fontSize: '5px', color: DA.slate }}>BUSINESS: {r.businessImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function ImmersivePreviewPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>IMMERSIVE PREVIEW MODE · STEP INSIDE</p>
      <p style={{ ...daLabel, fontSize: '5px', marginBottom: 8 }}>No screenshots · fully explorable environments · feel pacing · motion · navigation</p>
      {store.immersivePreviews.map((p) => (
        <div key={p.id} className="p-2 mb-2 border" style={{ borderColor: DA.panelBorder, borderLeft: `3px solid ${DA.indigo}` }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: DA.indigo }}>{p.label}</p>
          <p style={{ ...daLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...daLabel, fontSize: '5px', color: DA.slate }}>EXPLORE: {p.explorePath}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {p.capabilities.map((c) => (
              <span key={c} className="text-[4px] font-futura px-1 border" style={{ borderColor: DA.panelBorder }}>{c}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function EcosystemBuilderPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>DIGITAL ECOSYSTEM BUILDER</p>
      {store.ecosystemProducts.map((p) => (
        <div key={p.id} className="flex justify-between py-1 border-b" style={{ borderColor: DA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{p.product}</p>
            <p style={{ ...daLabel, fontSize: '5px' }}>{p.category}</p>
          </div>
          <span className="text-[5px] font-futura" style={{ color: p.status === 'ready' ? DA.green : DA.indigo }}>{p.status.toUpperCase()}</span>
        </div>
      ))}
    </section>
  );
}

export function SolutionArchitecturePanel({ store }: Pick<Props, 'store'>) {
  const s = store.solutionArchitecture;
  const sections: [string, string[]][] = [
    ['BUSINESS OBJECTIVES', s.businessObjectives],
    ['USER ROLES', s.userRoles],
    ['WORKFLOWS', s.workflows],
    ['INTEGRATIONS', s.integrations],
    ['SECURITY', s.securityNotes],
    ['PERFORMANCE', s.performanceNotes],
    ['SCALABILITY', s.scalabilityNotes],
  ];
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>SOLUTION ARCHITECTURE · BEFORE INTERFACE</p>
      {sections.map(([title, items]) => (
        <div key={title} className="mb-2">
          <p style={{ ...daSectionTitle, fontSize: '7px' }}>{title}</p>
          {items.map((item) => <p key={item} style={{ ...daLabel, fontSize: '5px' }}>· {item}</p>)}
        </div>
      ))}
    </section>
  );
}

export function ExperienceInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>EXPERIENCE INHERITANCE · NO REDEFINITION</p>
      {store.experienceInheritance.map((i) => (
        <div key={i.source} className="p-2 mb-1 border" style={{ borderColor: DA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{i.source}</p>
            <span className="text-[5px] font-futura" style={{ color: i.status === 'complete' ? DA.green : DA.indigo }}>{i.status.toUpperCase()}</span>
          </div>
          {i.inherited.map((item) => (
            <p key={item} style={{ ...daLabel, fontSize: '5px' }}>· {item}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function DesignSystemPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>DESIGN SYSTEM GENERATION · UNIFIED LANGUAGE</p>
      {store.designSystem.map((d) => (
        <div key={d.id} className="p-2 mb-1 border" style={{ borderColor: DA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{d.component}</p>
            <span className="text-[5px] font-futura" style={{ color: d.status === 'inherited' ? DA.indigo : DA.green }}>{d.status.toUpperCase()}</span>
          </div>
          <p style={{ ...daLabel, fontSize: '5px' }}>{d.tokens}</p>
        </div>
      ))}
    </section>
  );
}

export function ApplicationArchitecturePanel({ store }: Pick<Props, 'store'>) {
  const a = store.applicationArchitecture;
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>APPLICATION ARCHITECTURE · BEFORE CODE</p>
      {[
        ['INFORMATION ARCHITECTURE', a.informationArchitecture],
        ['NAVIGATION', a.navigation],
        ['FEATURE HIERARCHY', a.featureHierarchy],
        ['PERMISSIONS', a.permissions],
        ['DATABASE PLAN', a.databasePlan],
        ['API PLAN', a.apiPlan],
        ['TECHNICAL ROADMAP', a.technicalRoadmap],
      ].map(([title, items]) => (
        <div key={title as string} className="mb-2">
          <p style={{ ...daSectionTitle, fontSize: '7px' }}>{title}</p>
          {(items as string[]).map((item) => <p key={item} style={{ ...daLabel, fontSize: '5px' }}>· {item}</p>)}
        </div>
      ))}
      <p style={{ ...daSectionTitle, fontSize: '7px' }}>AUTH MODEL</p>
      <p style={{ ...daLabel, fontSize: '5px' }}>{a.authModel}</p>
    </section>
  );
}

export function AiFeatureArchitectPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>AI FEATURE ARCHITECT · STRATEGY-ALIGNED ONLY</p>
      {store.aiFeatures.map((f) => (
        <div key={f.id} className="flex justify-between items-center py-1 border-b" style={{ borderColor: DA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{f.feature}</p>
            <p style={{ ...daLabel, fontSize: '5px' }}>{f.alignment}</p>
          </div>
          <span className="text-[5px] font-futura" style={{ color: f.status === 'approved' ? DA.green : DA.indigo }}>{f.priority.toUpperCase()} · {f.status.toUpperCase()}</span>
        </div>
      ))}
    </section>
  );
}

export function DigitalSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>DIGITAL SIMULATION · BEFORE ENGINEERING</p>
      {store.simulations.map((s) => (
        <div key={s.id} className="p-2 mb-2 border" style={{ borderColor: DA.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: DA.indigo }}>{s.label}</p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {[
              ['PERF', s.performancePct],
              ['CONVERSION', s.conversionPct],
              ['ENGAGEMENT', s.engagementPct],
              ['A11Y', s.accessibilityPct],
              ['COMPLEXITY', s.complexityPct],
              ['SCALE', s.scalabilityPct],
            ].map(([label, pct]) => (
              <div key={label as string} className="text-center">
                <p style={{ ...daValue, fontSize: '9px', color: scoreColor(pct as number) }}>{pct}%</p>
                <p style={{ ...daLabel, fontSize: '4px' }}>{label}</p>
              </div>
            ))}
          </div>
          <p style={{ ...daLabel, fontSize: '5px' }}>COST: {s.costEstimate} · CONFIDENCE {s.confidencePct}%</p>
          {s.recommendations.map((r) => (
            <p key={r} style={{ ...daLabel, fontSize: '5px', color: DA.slate }}>→ {r}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function ImplementationRoadmapPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>IMPLEMENTATION PLANNING · TECHNICAL ROADMAP</p>
      {store.implementationRoadmap.map((m) => (
        <div key={m.id} className="p-2 mb-1 border" style={{ borderColor: DA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{m.sequence}. {m.title}</p>
            <span className="text-[5px] font-futura">{m.effort.toUpperCase()}</span>
          </div>
          <p style={{ ...daLabel, fontSize: '5px' }}>{m.engineeringReq}</p>
          {m.dependencies.length > 0 && (
            <p style={{ ...daLabel, fontSize: '5px', color: DA.gray }}>DEPS: {m.dependencies.join(' · ')}</p>
          )}
        </div>
      ))}
    </section>
  );
}

export function DeveloperHandoffPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>DEVELOPER HANDOFF · ZERO AMBIGUITY</p>
      {store.developerHandoff.map((d) => (
        <div key={d.id} className="flex justify-between py-1 border-b" style={{ borderColor: DA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{d.artifact}</p>
            <p style={{ ...daLabel, fontSize: '5px' }}>{d.description}</p>
          </div>
          <span className="text-[5px] font-futura" style={{ color: d.status === 'ready' ? DA.green : DA.indigo }}>{d.status.toUpperCase()}</span>
        </div>
      ))}
    </section>
  );
}

export function IntegrationCenterPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>INTEGRATION CENTER · FUTURE-READY</p>
      {store.integrations.map((i) => (
        <div key={i.id} className="flex justify-between py-1 border-b" style={{ borderColor: DA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{i.platform}</p>
            <p style={{ ...daLabel, fontSize: '5px' }}>{i.category}</p>
          </div>
          <span className="text-[5px] font-futura" style={{ color: i.status === 'connected' ? DA.green : i.status === 'architecture-ready' ? DA.indigo : DA.gray }}>
            {i.status.replace(/-/g, ' ').toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function LaunchArchitectHandoffPanel({ store }: Pick<Props, 'store'>) {
  const h = store.launchHandoff;
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>LAUNCH ARCHITECT HANDOFF · FUTURE VISION</p>
      <p style={{ ...daLabel, color: DA.indigo }}>STATUS: {h.status.toUpperCase()} · Technical architecture · design system · journeys transfer on approval.</p>
      <p style={{ ...daSectionTitle, fontSize: '7px', marginTop: 8 }}>INHERITED ASSETS</p>
      {h.inheritedAssets.map((a) => <p key={a} style={{ ...daLabel, fontSize: '5px' }}>· {a}</p>)}
      <p style={{ ...daSectionTitle, fontSize: '7px', marginTop: 8 }}>DOWNSTREAM</p>
      {h.downstreamTargets.map((t) => <p key={t} style={{ ...daLabel, fontSize: '5px', color: DA.slate }}>→ {t}</p>)}
      <Link
        to={adminStudioGrowthArchitectPath()}
        style={{ ...daLabel, color: '#059669', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN GROWTH ARCHITECT
      </Link>
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: DigitalArchitectWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>DIGITAL WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? DA.indigo : DA.panelBorder,
              color: store.activeWorkspaceId === id ? DA.indigo : DA.gray,
              background: store.activeWorkspaceId === id ? 'rgba(99,102,241,0.04)' : 'white',
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
    <section className="p-3 mb-3" style={daPanel}>
      <p style={daSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {DIGITAL_ARCHITECT_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: DA.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...daLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...daLabel, color: '#BE185D', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...daLabel, color: '#0369A1', fontSize: '6px' }}>→ COMPANY MATURITY ENGINE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...daLabel, color: DA.slate, fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...daLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...daLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...daLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...daLabel, color: DA.accent, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
      </div>
    </section>
  );
}
