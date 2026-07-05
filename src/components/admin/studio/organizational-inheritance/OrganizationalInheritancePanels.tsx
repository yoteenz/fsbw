import { Link } from 'react-router-dom';
import type {
  InheritanceCategoryAction,
  InheritanceCategoryId,
  InheritanceSourceId,
  OrganizationalInheritanceStore,
} from '../../../../studio-os-core/organizational-inheritance/types';
import { INHERITANCE_SOURCE_LABELS, WIZARD_PRESETS } from '../../../../studio-os-core/organizational-inheritance/constants';
import { adminStudioExecutiveOrganizationPath, adminStudioOsCreatePath, adminStudioEcosystemMarketplacePath } from '../../../../utils/adminStudioRoutes';
import {
  ORGANIZATIONAL_INHERITANCE_STYLES,
  OI,
  confidenceColor,
  oiDarkHeader,
  oiLabel,
  oiLiveDot,
  oiPanel,
  oiSectionTitle,
  oiValue,
} from './organizationalInheritanceTheme';

type Props = {
  store: OrganizationalInheritanceStore;
  onSelectLibraryItem: (id: string) => void;
  onSelectBlendPlan: (id: string) => void;
  onSetCategoryAction: (categoryId: InheritanceCategoryId, action: InheritanceCategoryAction, sourceId?: InheritanceSourceId | null) => void;
  onSetWizardSource: (sourceId: InheritanceSourceId) => void;
};

export function OrganizationalInheritanceHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_INHERITANCE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...oiDarkHeader, borderTop: `3px solid ${OI.indigo}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL INHERITANCE
        </p>
        <p style={{ ...oiLabel, color: '#94A3B8' }}>
          <span style={oiLiveDot} />
          FOUNDATIONAL PLATFORM · INHERIT WISDOM · EVOLVE INDEPENDENTLY
        </p>
        <p style={{ ...oiLabel, color: '#CBD5E1', marginTop: 4 }}>
          COMPANIES NEVER BEGIN FROM ZERO · INHERITANCE PROVIDES GENETICS · EXECUTION CREATES UNIQUE IDENTITY
        </p>
      </header>
    </>
  );
}

export function InheritanceDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL INHERITANCE · PLATFORM HQ</p>
      <p style={{ ...oiLabel, color: OI.indigo, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['LIBRARY', d.libraryItemCount],
          ['ACTIVE BLENDS', d.activeBlends],
          ['SOURCE COMPANIES', d.companiesWithInheritance],
          ['REUSABLE ASSETS', d.reusableAssets],
          ['AVG CONFIDENCE', `${d.avgConfidencePct}%`],
          ['EVOLUTION EVENTS', d.evolutionEvents],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OI.panelBorder }}>
            <p style={{ ...oiValue, fontSize: '13px' }}>{val}</p>
            <p style={oiLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InheritancePlatformChainPanel() {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>STUDIO OS → ORGANIZATIONAL INHERITANCE</p>
      <div className="flex flex-col items-center gap-0">
        {[
          { label: 'STUDIO OS', desc: 'Platform foundation' },
          { label: 'ORGANIZATIONAL INHERITANCE', desc: 'Foundational genetics transfer system' },
          { label: 'NEW COMPANY', desc: 'Launches with wisdom · evolves independently' },
        ].map((level, i) => (
          <div key={level.label} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-2" style={{ background: OI.indigo }} /> : null}
            <div
              className="w-full px-2 py-1 text-[7px] font-futura text-center border"
              style={{
                borderColor: i === 1 ? OI.indigo : OI.panelBorder,
                background: i === 1 ? 'rgba(99,102,241,0.08)' : 'white',
                fontWeight: 515,
              }}
            >
              {level.label}
              <p style={{ ...oiLabel, fontSize: '5px', margin: '2px 0 0' }}>{level.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InheritanceWizardPanel({ store, onSetWizardSource }: Pick<Props, 'store' | 'onSetWizardSource'>) {
  const draft = store.wizardDraft;
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INHERITANCE WIZARD · COMPANY CREATION</p>
      <p style={oiLabel}>Replace blank setup — choose how a new company inherits organizational genetics. Every choice remains editable.</p>
      <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
        {WIZARD_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSetWizardSource(preset.id)}
            className="text-left p-2 border"
            style={{
              borderColor: draft.primarySourceId === preset.id ? OI.indigo : OI.panelBorder,
              background: draft.primarySourceId === preset.id ? 'rgba(99,102,241,0.08)' : 'white',
            }}
          >
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{preset.label}</p>
            <p style={{ ...oiLabel, fontSize: '6px', marginTop: 2 }}>{preset.description}</p>
          </button>
        ))}
      </div>
      {draft.targetCompanyName ? (
        <p className="mt-2 text-[7px] font-futura" style={{ fontWeight: 515, color: OI.indigo }}>
          DRAFT: {draft.targetCompanyName.toUpperCase()} · {draft.simulatorPassed ? 'SIMULATOR PASSED ✓' : 'RUN SIMULATOR BEFORE LAUNCH'}
        </p>
      ) : null}
      <Link
        to={adminStudioOsCreatePath()}
        className="inline-block mt-2 text-[6px] font-futura border px-2 py-1"
        style={{ fontWeight: 515, color: OI.indigo, borderColor: OI.indigo }}
      >
        WORKSPACE CREATION ENGINE →
      </Link>
    </section>
  );
}

export function InheritanceBuilderPanel({ store, onSetCategoryAction }: Pick<Props, 'store' | 'onSetCategoryAction'>) {
  const actions: InheritanceCategoryAction[] = ['inherit', 'skip', 'customize', 'combine'];
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INHERITANCE BUILDER · CATEGORIES</p>
      <p style={oiLabel}>Control exactly what is inherited — inherit · skip · customize · combine per category.</p>
      <div className="space-y-2 mt-2">
        {store.categoryConfigs.map((cat) => (
          <div key={cat.id} className="p-2 border" style={{ borderColor: OI.panelBorder }}>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{cat.label}</p>
              {cat.sourceId ? (
                <span className="text-[5px] font-futura px-1 border" style={{ borderColor: OI.indigo, color: OI.indigo }}>
                  FROM {INHERITANCE_SOURCE_LABELS[cat.sourceId]}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => onSetCategoryAction(cat.id, action, cat.sourceId)}
                  className="px-2 py-0.5 text-[5px] font-futura border"
                  style={{
                    fontWeight: 515,
                    borderColor: cat.action === action ? OI.indigo : OI.panelBorder,
                    background: cat.action === action ? 'rgba(99,102,241,0.1)' : 'white',
                    color: cat.action === action ? OI.indigo : OI.gray,
                  }}
                >
                  {action.toUpperCase()}
                </button>
              ))}
            </div>
            {cat.notes ? <p style={{ ...oiLabel, fontSize: '5px', marginTop: 4 }}>{cat.notes}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function GeneticBlendingPanel({ store, onSelectBlendPlan }: Pick<Props, 'store' | 'onSelectBlendPlan'>) {
  const plan = store.blendPlans.find((b) => b.id === store.selectedBlendPlanId) ?? store.blendPlans[0];
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>GENETIC BLENDING · MULTI-SOURCE</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {store.blendPlans.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelectBlendPlan(b.id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: plan?.id === b.id ? OI.indigo : OI.panelBorder,
              background: plan?.id === b.id ? 'rgba(99,102,241,0.08)' : 'white',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
      {plan ? (
        <>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo }}>{plan.mergeStrategy}</p>
          <div className="mt-2 space-y-1">
            {plan.items.map((item, i) => (
              <div key={i} className="flex justify-between text-[6px] font-futura border-b py-1" style={{ borderColor: OI.panelBorder, fontWeight: 515 }}>
                <span>{item.geneticId.replace(/-/g, ' ').toUpperCase()}</span>
                <span style={{ color: OI.indigo }}>{item.sourceLabel} · {item.blendWeightPct}%</span>
              </div>
            ))}
          </div>
          {plan.conflicts.length > 0 ? (
            <div className="mt-2">
              <p style={{ ...oiSectionTitle, fontSize: '7px' }}>CONFLICTS IDENTIFIED</p>
              {plan.conflicts.map((c) => (
                <div key={c.id} className="p-1 mb-1 border" style={{ borderColor: c.severity === 'high' ? OI.red : OI.gold }}>
                  <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{c.geneticId.replace(/-/g, ' ').toUpperCase()} · {c.severity.toUpperCase()}</p>
                  <p style={{ ...oiLabel, fontSize: '5px' }}>{c.resolution}</p>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export function InheritanceSimulatorPanel({ store }: Pick<Props, 'store'>) {
  const sim = store.simulator;
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INHERITANCE SIMULATOR · PRE-LAUNCH</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['COMPATIBILITY', `${sim.organizationalCompatibilityPct}%`],
          ['LEADERSHIP', `${sim.leadershipConsistencyPct}%`],
          ['BRAND', `${sim.brandCompatibilityPct}%`],
          ['CONFIDENCE', `${sim.confidencePct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OI.panelBorder }}>
            <p style={{ ...oiValue, fontSize: '12px', color: confidenceColor(parseInt(String(val), 10)) }}>{val}</p>
            <p style={oiLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[7px] font-futura" style={{ fontWeight: 515, color: sim.readyToActivate ? OI.green : OI.gold }}>
        RISK: {sim.riskLevel.toUpperCase()} · {sim.readyToActivate ? 'READY TO ACTIVATE' : 'ADJUSTMENTS RECOMMENDED'}
      </p>
      {sim.recommendedAdjustments.map((adj, i) => (
        <p key={i} style={{ ...oiLabel, fontSize: '6px' }}>→ {adj}</p>
      ))}
    </section>
  );
}

export function InstitutionalLibraryPanel({ store, onSelectLibraryItem }: Pick<Props, 'store' | 'onSelectLibraryItem'>) {
  const selected = store.library.find((l) => l.id === store.selectedLibraryItemId) ?? store.library[0];
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INSTITUTIONAL LIBRARY · SEARCH · VERSION · COMPARE</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {store.library.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectLibraryItem(item.id)}
            className="px-2 py-1 text-[5px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: selected?.id === item.id ? OI.indigo : OI.panelBorder,
              background: selected?.id === item.id ? 'rgba(99,102,241,0.08)' : 'white',
            }}
          >
            {item.title.slice(0, 24)}…
          </button>
        ))}
      </div>
      {selected ? (
        <div className="p-2 border" style={{ borderColor: OI.indigo }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{selected.title}</p>
          <p style={{ ...oiLabel, fontSize: '6px' }}>v{selected.version} · {selected.type.replace(/-/g, ' ').toUpperCase()} · {INHERITANCE_SOURCE_LABELS[selected.sourceId]}</p>
          <p style={{ ...oiLabel, fontSize: '6px', marginTop: 4 }}>{selected.description}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {selected.tags.map((t) => (
              <span key={t} className="text-[5px] font-futura px-1 border" style={{ borderColor: OI.panelBorder }}>{t}</span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function DepartmentInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>DEPARTMENT INHERITANCE · INDEPENDENT PACKAGES</p>
      {store.departmentPackages.map((pkg) => (
        <div key={pkg.id} className="p-2 mb-2 border" style={{ borderColor: OI.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>
            {pkg.departmentName} · FROM {INHERITANCE_SOURCE_LABELS[pkg.sourceId]}
          </p>
          <p style={{ ...oiLabel, fontSize: '5px', marginTop: 2 }}>ADAPT: {pkg.adaptToIdentity}</p>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {[
              ['KNOWLEDGE', pkg.knowledge.length],
              ['PLAYBOOKS', pkg.playbooks.length],
              ['STANDARDS', pkg.qualityStandards.length],
              ['WORKFLOWS', pkg.approvalWorkflows.length],
            ].map(([label, count]) => (
              <span key={label} className="text-[5px] font-futura" style={{ color: OI.gray }}>{label}: {count}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>EXECUTIVE INHERITANCE · CoS RECOMMENDATIONS</p>
      {store.executivePackages.map((pkg) => (
        <div key={pkg.id} className="p-2 mb-2 border" style={{ borderColor: pkg.cosRecommended ? OI.indigo : OI.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{pkg.executiveRole}</p>
            <span className="text-[6px] font-futura" style={{ color: confidenceColor(pkg.historicalPerformancePct) }}>
              {pkg.historicalPerformancePct}% PERF
            </span>
          </div>
          <p style={{ ...oiLabel, fontSize: '5px' }}>FROM {INHERITANCE_SOURCE_LABELS[pkg.sourceId]} · {pkg.organizationalMemory.length} MEMORY ITEMS</p>
          {pkg.cosRecommended ? (
            <span className="text-[5px] font-futura px-1 border mt-1 inline-block" style={{ borderColor: OI.indigo, color: OI.indigo }}>CoS RECOMMENDED</span>
          ) : null}
        </div>
      ))}
      <Link to={adminStudioExecutiveOrganizationPath()} className="text-[6px] font-futura" style={{ fontWeight: 515, color: OI.indigo }}>
        EXECUTIVE ORGANIZATION →
      </Link>
    </section>
  );
}

export function KnowledgeAncestryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>KNOWLEDGE ANCESTRY · LINEAGE</p>
      {store.ancestry.map((a) => (
        <div key={a.id} className="flex justify-between items-start py-1 border-b" style={{ borderColor: OI.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{a.systemLabel}</p>
            <p style={{ ...oiLabel, fontSize: '5px' }}>ORIGIN: {a.originLabel} · {a.originDetail}</p>
          </div>
          {a.editable ? (
            <span className="text-[5px] font-futura px-1 border" style={{ borderColor: OI.green, color: OI.green }}>EDITABLE</span>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function OrgTimelinePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL TIMELINE · EVOLUTION</p>
      {store.timeline.map((ev) => (
        <div key={ev.id} className="pl-2 mb-2 border-l-2" style={{ borderColor: OI.indigo }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: OI.indigo }}>{ev.type.replace(/-/g, ' ').toUpperCase()}</p>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{ev.title}</p>
          <p style={{ ...oiLabel, fontSize: '5px' }}>{ev.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function InheritanceRecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>STUDIO INTELLIGENCE · INHERITANCE RECOMMENDATIONS</p>
      {store.recommendations.map((rec) => (
        <div key={rec.id} className="p-2 mb-2 border" style={{ borderColor: OI.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{rec.targetCompanyType.toUpperCase()}</p>
            <span className="text-[8px] font-futura" style={{ fontWeight: 515, color: confidenceColor(rec.confidencePct) }}>
              {rec.confidencePct}%
            </span>
          </div>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo }}>{rec.recommendation}</p>
          <p style={{ ...oiLabel, fontSize: '5px' }}>{rec.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL EVOLUTION · POST-INHERITANCE</p>
      <p style={oiLabel}>Inheritance creates a starting point — not permanent dependency. Track new decisions, workflows, genetics, and lessons.</p>
      {store.evolution.map((ev) => (
        <div key={ev.id} className="py-1 border-b" style={{ borderColor: OI.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{ev.title}</p>
          <p style={{ ...oiLabel, fontSize: '5px' }}>{ev.type.replace(/-/g, ' ').toUpperCase()} · {ev.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function CrossCompanyLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>CROSS-COMPANY LEARNING</p>
      {store.crossCompanyLearning.map((item) => (
        <div key={item.id} className="flex justify-between items-center py-1 border-b" style={{ borderColor: OI.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{item.title}</p>
            <p style={{ ...oiLabel, fontSize: '5px' }}>{item.improvement}</p>
          </div>
          <span
            className="text-[5px] font-futura px-1 border"
            style={{
              borderColor: item.visibility === 'reusable' ? OI.green : OI.gray,
              color: item.visibility === 'reusable' ? OI.green : OI.gray,
            }}
          >
            {item.visibility.toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function MarketplacePreparedPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ECOSYSTEM MARKETPLACE · ORGANIZATIONAL ASSETS</p>
      <p style={{ ...oiLabel, color: OI.indigo }}>Share · license · inherit · purchase organizational intelligence via Ecosystem Marketplace V1.0.</p>
      {store.marketplacePrepared.map((cap) => (
        <div key={cap.id} className="p-2 mb-1 border" style={{ borderColor: OI.panelBorder, opacity: 0.85 }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{cap.assetType.toUpperCase()}</p>
          <p style={{ ...oiLabel, fontSize: '5px' }}>{cap.description}</p>
          <p style={{ ...oiLabel, fontSize: '5px', color: OI.indigo }}>FUTURE: {cap.futureActions.join(' · ').toUpperCase()}</p>
        </div>
      ))}
      <Link
        to={adminStudioEcosystemMarketplacePath()}
        style={{ ...oiLabel, color: OI.indigo, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN ECOSYSTEM MARKETPLACE
      </Link>
    </section>
  );
}

export function InheritanceSourcesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INHERITABLE SOURCE COMPANIES</p>
      {store.sources.map((src) => (
        <div key={src.id} className="p-2 mb-1 border" style={{ borderColor: OI.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{src.label}</p>
            <span className="text-[6px] font-futura" style={{ color: confidenceColor(src.maturityPct) }}>{src.maturityPct}% MATURE</span>
          </div>
          <p style={{ ...oiLabel, fontSize: '5px' }}>{src.description}</p>
          <p style={{ ...oiLabel, fontSize: '5px' }}>{src.availableGenetics.length} GENETICS AVAILABLE</p>
        </div>
      ))}
    </section>
  );
}
