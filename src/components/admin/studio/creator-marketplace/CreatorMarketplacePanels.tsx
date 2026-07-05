import { Link } from 'react-router-dom';
import type {
  BrandProfile,
  CreatorMarketplaceStore,
  CreatorMarketplaceWorkspaceId,
  CreatorProfile,
} from '../../../../studio-os-core/creator-marketplace/types';
import { CREATOR_MARKETPLACE_CONNECTED_SYSTEMS } from '../../../../studio-os-core/creator-marketplace/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioTalentNetworkPath,
  adminStudioEcosystemMarketplacePath,
} from '../../../../utils/adminStudioRoutes';
import {
  CREATOR_MARKETPLACE_STYLES,
  CM,
  cmDarkHeader,
  cmLabel,
  cmLiveDot,
  cmPanel,
  cmSectionTitle,
  cmValue,
  scoreColor,
} from './creatorMarketplaceTheme';

type Props = {
  store: CreatorMarketplaceStore;
  selectedCreator: CreatorProfile | null;
  selectedBrand: BrandProfile | null;
  workspaceCreators: CreatorProfile[];
  creatorMatches: CreatorMarketplaceStore['matches'];
  creatorDeals: CreatorMarketplaceStore['deals'];
  creatorOs: CreatorMarketplaceStore['creatorOs'][string] | null;
  onSelectWorkspace: (id: CreatorMarketplaceWorkspaceId) => void;
  onSelectCreator: (id: string | null) => void;
  onSelectBrand: (id: string | null) => void;
};

export function CreatorMarketplaceHeader() {
  return (
    <>
      <style>{CREATOR_MARKETPLACE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...cmDarkHeader, borderTop: `3px solid ${CM.blue}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CREATOR MARKETPLACE
        </p>
        <p style={{ ...cmLabel, color: '#94A3B8' }}>
          <span style={cmLiveDot} />
          ALIGNMENT · CAREER GROWTH · LONG-TERM PARTNERSHIPS · NOT BUYING POSTS
        </p>
        <p style={{ ...cmLabel, color: '#CBD5E1', marginTop: 4 }}>
          INTELLIGENT CREATOR BUSINESS ECOSYSTEM · EVERY CREATOR IS A BUSINESS
        </p>
      </header>
    </>
  );
}

export function MarketplaceDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>CREATOR MARKETPLACE · ACTIVE HQ</p>
      <p style={{ ...cmLabel, color: CM.blue, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['VERIFIED CREATORS', d.verifiedCreators],
          ['ACTIVE DEALS', d.activeDeals],
          ['AVG MATCH CONF', `${d.avgMatchConfidence}%`],
          ['RISING CREATORS', d.risingCreators],
          ['RENEWAL RATE', `${d.partnershipRenewalPct}%`],
          ['MARKETPLACE HEALTH', `${d.marketplaceHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CM.panelBorder }}>
            <p style={{ ...cmValue, fontSize: '12px' }}>{val}</p>
            <p style={cmLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CreatorPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>CREATOR PHILOSOPHY · ALIGNMENT OVER FOLLOWERS</p>
      {store.creatorPhilosophy.map((line) => (
        <p key={line} style={{ ...cmLabel, color: CM.blue }}>· {line}</p>
      ))}
      <p style={{ ...cmLabel, marginTop: 8, fontSize: '6px' }}>
        Optimize for career growth · business growth · long-term partnerships · education · trust · brand alignment
      </p>
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: CreatorMarketplaceWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>MARKETPLACE WORKSPACE</p>
      <div className="flex gap-1 flex-wrap">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? CM.blue : CM.panelBorder,
              color: store.activeWorkspaceId === ws ? CM.blue : CM.gray,
              background: store.activeWorkspaceId === ws ? 'rgba(37,99,235,0.06)' : 'white',
            }}
          >
            {ws.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function CreatorDiscoveryPanel({ workspaceCreators, store, onSelectCreator }: Pick<Props, 'workspaceCreators' | 'store' | 'onSelectCreator'>) {
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>CREATOR DISCOVERY · DYNAMIC PROFILES</p>
      {workspaceCreators.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelectCreator(c.id)}
          className="w-full text-left py-2 border-b"
          style={{
            borderColor: CM.panelBorder,
            background: store.selectedCreatorId === c.id ? 'rgba(37,99,235,0.04)' : 'transparent',
          }}
        >
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(c.creatorScore) }}>
            {c.displayName} · {c.careerStage.replace(/-/g, ' ').toUpperCase()} · {c.creatorScore}%
          </p>
          <p style={{ ...cmLabel, fontSize: '5px' }}>
            ALIGN {c.brandAlignmentScore}% · TRUST {c.trustScore}% · {c.platforms.join(' · ')}
          </p>
        </button>
      ))}
    </section>
  );
}

export function CreatorProfilePanel({ selectedCreator }: Pick<Props, 'selectedCreator'>) {
  if (!selectedCreator) return null;
  const c = selectedCreator;
  return (
    <section className="p-3 mb-3" style={{ ...cmPanel, borderLeft: `4px solid ${CM.blue}` }}>
      <p style={cmSectionTitle}>CREATOR PROFILE · {c.displayName}</p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {[
          ['CREATOR', c.creatorScore],
          ['ALIGNMENT', c.brandAlignmentScore],
          ['TRUST', c.trustScore],
          ['PROFESSIONAL', c.professionalismScore],
          ['COMMUNITY', c.communityScore],
          ['KNOWLEDGE', c.knowledgeScore],
        ].map(([label, val]) => (
          <div key={label} className="text-center p-1 border" style={{ borderColor: CM.panelBorder }}>
            <p style={{ ...cmValue, fontSize: '11px', color: scoreColor(val as number) }}>{val}%</p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={cmLabel}>ENGAGEMENT: {c.engagementQuality}</p>
      <p style={cmLabel}>AUDIENCE: {c.audienceDemographics}</p>
      <p style={cmLabel}>CATEGORIES: {c.contentCategories.join(' · ')} · INDUSTRIES: {c.industries.join(' · ')}</p>
      <p style={cmLabel}>PRICING: {c.pricing} · AVAIL: {c.availability}</p>
      <p style={cmLabel}>LOCATION: {c.location} · LANG: {c.languages.join(', ')} · {c.verified ? '✓ VERIFIED' : 'UNVERIFIED'}</p>
      <p style={{ ...cmLabel, color: CM.blue, marginTop: 4 }}>GOALS: {c.futureGoals.join(' · ')}</p>
    </section>
  );
}

export function BrandDiscoveryPanel({ store, onSelectBrand }: Pick<Props, 'store' | 'onSelectBrand'>) {
  const brands = store.brands.filter((b) => b.workspaceId === store.activeWorkspaceId);
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>BRAND DISCOVERY · MARKETPLACE PROFILES</p>
      {brands.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onSelectBrand(b.id)}
          className="w-full text-left py-2 border-b"
          style={{
            borderColor: CM.panelBorder,
            background: store.selectedBrandId === b.id ? 'rgba(37,99,235,0.04)' : 'transparent',
          }}
        >
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(b.brandReputation) }}>
            {b.name} · {b.industry} · REP {b.brandReputation}%
          </p>
          <p style={{ ...cmLabel, fontSize: '5px' }}>{b.mission}</p>
        </button>
      ))}
    </section>
  );
}

export function BrandProfilePanel({ selectedBrand }: Pick<Props, 'selectedBrand'>) {
  if (!selectedBrand) return null;
  const b = selectedBrand;
  return (
    <section className="p-3 mb-3" style={{ ...cmPanel, borderLeft: `4px solid ${CM.slate}` }}>
      <p style={cmSectionTitle}>BRAND PROFILE · {b.name}</p>
      <p style={cmLabel}>MISSION: {b.mission}</p>
      <p style={cmLabel}>COMPANY DNA: {b.companyDna}</p>
      <p style={cmLabel}>CREATIVE DNA: {b.creativeDna}</p>
      <p style={cmLabel}>PHILOSOPHY: {b.partnershipPhilosophy}</p>
      <p style={cmLabel}>BUDGET: {b.budgetRange} · CAMPAIGNS: {b.campaignCount}</p>
      <p style={cmLabel}>VALUES: {b.brandValues.join(' · ')}</p>
      <p style={cmLabel}>PREFERRED: {b.preferredCreatorTypes.join(' · ')}</p>
      <p style={cmLabel}>STYLES: {b.collaborationStyles.join(' · ')}</p>
    </section>
  );
}

export function IntelligentMatchingPanel({ creatorMatches, store }: Pick<Props, 'creatorMatches' | 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>INTELLIGENT MATCHING · STUDIO INTELLIGENCE</p>
      <p style={{ ...cmLabel, fontSize: '6px', marginBottom: 8 }}>
        Replace manual searching · alignment · audience overlap · long-term partnership potential
      </p>
      {creatorMatches.map((m) => {
        const creator = store.creators.find((c) => c.id === m.creatorId);
        const brand = store.brands.find((b) => b.id === m.brandId);
        return (
          <div key={m.id} className="py-2 border-b" style={{ borderColor: CM.panelBorder }}>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(m.confidencePct) }}>
              {m.campaignLabel ?? 'MATCH'} · {m.confidencePct}% CONFIDENCE
            </p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>
              {creator?.displayName} ↔ {brand?.name}
            </p>
            <p style={cmLabel}>REASONING: {m.reasoning}</p>
            <p style={{ ...cmLabel, color: CM.blue }}>IMPACT: {m.expectedImpact}</p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>LONG-TERM: {m.longTermPotential}</p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>
              DNA {m.factors.companyDna}% · CREATIVE {m.factors.creativeDna}% · AUDIENCE {m.factors.audienceOverlap}% · VALUES {m.factors.brandValues}%
            </p>
          </div>
        );
      })}
    </section>
  );
}

export function CareerGraphPanel({ store, selectedCreator }: Pick<Props, 'store' | 'selectedCreator'>) {
  const stages = store.careerStages;
  const currentIdx = selectedCreator ? stages.findIndex((s) => s.stage === selectedCreator.careerStage) : -1;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>CREATOR CAREER GRAPH · EVOLUTION PATH</p>
      <div className="flex flex-wrap gap-1">
        {stages.map((s, i) => (
          <span
            key={s.stage}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: i === currentIdx ? CM.blue : CM.panelBorder,
              color: i === currentIdx ? CM.blue : i < currentIdx ? CM.green : CM.gray,
              background: i === currentIdx ? 'rgba(37,99,235,0.08)' : 'white',
            }}
          >
            {s.label}
          </span>
        ))}
      </div>
      {selectedCreator && (
        <p style={{ ...cmLabel, color: CM.blue, marginTop: 8 }}>
          {selectedCreator.displayName} · CURRENT: {selectedCreator.careerStage.replace(/-/g, ' ').toUpperCase()}
        </p>
      )}
    </section>
  );
}

export function BrandDealEnginePanel({ creatorDeals, store }: Pick<Props, 'creatorDeals' | 'store'>) {
  const deals = creatorDeals.length ? creatorDeals : store.deals;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>BRAND DEAL ENGINE · PIPELINE</p>
      {deals.map((d) => {
        const brand = store.brands.find((b) => b.id === d.brandId);
        return (
          <div key={d.id} className="py-2 border-b" style={{ borderColor: CM.panelBorder }}>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: CM.blue }}>
              {d.campaignLabel} · {d.status.toUpperCase()}
            </p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>{brand?.name}</p>
            <p style={cmLabel}>DELIVERABLES: {d.deliverables.join(' · ')}</p>
            <p style={cmLabel}>TIMELINE: {d.timeline} · PAYMENT: {d.payment}</p>
            {d.performance && <p style={{ ...cmLabel, color: CM.green }}>PERF: {d.performance}</p>}
            <p style={{ ...cmLabel, fontSize: '5px' }}>RENEWAL: {d.renewalPotential}</p>
          </div>
        );
      })}
    </section>
  );
}

export function CreatorOsPanel({ creatorOs, selectedCreator }: Pick<Props, 'creatorOs' | 'selectedCreator'>) {
  if (!creatorOs || !selectedCreator) return null;
  return (
    <section className="p-3 mb-3" style={{ ...cmPanel, borderLeft: `4px solid ${CM.blue}` }}>
      <p style={cmSectionTitle}>CREATOR OS · HEADQUARTERS · {selectedCreator.displayName}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          ['MONTHLY REV', creatorOs.monthlyRevenue],
          ['ACTIVE CAMPAIGNS', creatorOs.activeCampaigns],
          ['PENDING CONTRACTS', creatorOs.pendingContracts],
          ['DELIVERABLES', creatorOs.upcomingDeliverables],
          ['BRAND RELS', creatorOs.brandRelationships],
          ['CAREER PROGRESS', `${creatorOs.careerProgressPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-1 border text-center" style={{ borderColor: CM.panelBorder }}>
            <p style={{ ...cmValue, fontSize: '10px' }}>{val}</p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...cmLabel, marginTop: 8, fontSize: '6px' }}>
        Dashboard · calendars · contracts · payments · analytics · tax · invoices · media kit · education · career roadmap
      </p>
    </section>
  );
}

export function AgencyModePanel({ store, selectedCreator }: Pick<Props, 'store' | 'selectedCreator'>) {
  const team = selectedCreator
    ? store.agencyTeams.filter((m) => m.creatorId === selectedCreator.id)
    : store.agencyTeams;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>AGENCY MODE · SCALE INTO ORGANIZATIONS</p>
      {team.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: CM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {m.role.toUpperCase()} · {m.label} · {m.status.toUpperCase()}
          </p>
        </div>
      ))}
      <p style={{ ...cmLabel, fontSize: '5px', marginTop: 4 }}>
        Manager · editor · designer · writer · producer · VA · accountant · lawyer · future AI executives
      </p>
    </section>
  );
}

export function MarketplaceIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>MARKETPLACE INTELLIGENCE · OPPORTUNITY SIGNALS</p>
      {store.intelligenceSignals.map((sig) => (
        <div key={sig.id} className="py-1 border-b" style={{ borderColor: CM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(sig.confidencePct) }}>
            {sig.label} · {sig.type.replace(/-/g, ' ').toUpperCase()} · {sig.confidencePct}%
          </p>
          <p style={{ ...cmLabel, fontSize: '5px' }}>{sig.opportunity}</p>
        </div>
      ))}
    </section>
  );
}

export function RelationshipManagementPanel({ store, selectedCreator }: Pick<Props, 'store' | 'selectedCreator'>) {
  const rels = selectedCreator
    ? store.relationships.filter((r) => r.creatorId === selectedCreator.id)
    : store.relationships;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>RELATIONSHIP MANAGEMENT · LONG-TERM COLLABORATION</p>
      {rels.map((r) => {
        const brand = store.brands.find((b) => b.id === r.brandId);
        return (
          <div key={r.id} className="py-2 border-b" style={{ borderColor: CM.panelBorder }}>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(r.collaborationHealthPct) }}>
              {brand?.name} · TRUST {r.trustPct}% · HEALTH {r.collaborationHealthPct}%
            </p>
            <p style={cmLabel}>RENEWALS: {r.renewals} · {r.longTerm ? 'LONG-TERM ✓' : 'TRANSACTIONAL'}</p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>{r.feedback}</p>
          </div>
        );
      })}
    </section>
  );
}

export function MarketplaceSimulationPanel({ store, selectedCreator }: Pick<Props, 'store' | 'selectedCreator'>) {
  const sims = selectedCreator
    ? store.simulations.filter((s) => s.creatorId === selectedCreator.id)
    : store.simulations;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>MARKETPLACE SIMULATION · BEFORE PARTNERSHIPS</p>
      {sims.map((sim) => (
        <div key={sim.id} className="py-2 border-b" style={{ borderColor: CM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(sim.confidencePct) }}>
            {sim.label} · {sim.confidencePct}%
          </p>
          <p style={cmLabel}>PERF: {sim.campaignPerformance} · FIT: {sim.brandFit}</p>
          <p style={cmLabel}>AUDIENCE: {sim.audienceResponse} · REL: {sim.relationshipImpact}</p>
          <p style={{ ...cmLabel, color: CM.blue }}>ROI: {sim.expectedRoi} · REV: {sim.expectedRevenue}</p>
          {sim.adjustments.map((a) => (
            <p key={a} style={{ ...cmLabel, fontSize: '5px' }}>→ {a}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function CreatorAcademyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>CREATOR ACADEMY · BUSINESS EDUCATION</p>
      {store.education.map((mod) => (
        <div key={mod.id} className="py-1 border-b" style={{ borderColor: CM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {mod.title} · {mod.category.toUpperCase()}
          </p>
          <p style={{ ...cmLabel, fontSize: '5px' }}>{mod.description}</p>
        </div>
      ))}
    </section>
  );
}

export function TalentNetworkPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>TALENT NETWORK · BEYOND INFLUENCERS</p>
      {store.talentDiscoveries.map((td) => {
        const brand = store.brands.find((b) => b.id === td.brandId);
        return (
          <div key={td.id} className="py-1 border-b" style={{ borderColor: CM.panelBorder }}>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(td.fitScore) }}>
              {td.type.toUpperCase()} · {td.name} · {td.fitScore}% FIT
            </p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>{brand?.name}</p>
          </div>
        );
      })}
      <Link
        to={adminStudioTalentNetworkPath()}
        style={{ ...cmLabel, color: CM.blue, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN TALENT NETWORK
      </Link>
    </section>
  );
}

export function CareerIntelligencePanel({ store, selectedCreator }: Pick<Props, 'store' | 'selectedCreator'>) {
  const recs = selectedCreator
    ? store.careerRecommendations.filter((r) => r.creatorId === selectedCreator.id)
    : store.careerRecommendations;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>CAREER INTELLIGENCE · REVENUE DIVERSIFICATION</p>
      {recs.map((r) => (
        <div key={r.id} className="py-1 border-b" style={{ borderColor: CM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: CM.blue }}>
            {r.label} · {r.type.replace(/-/g, ' ').toUpperCase()}
          </p>
          <p style={{ ...cmLabel, fontSize: '5px' }}>{r.rationale}</p>
          <p style={{ ...cmLabel, color: CM.green, fontSize: '5px' }}>LIFT: {r.projectedLift}</p>
        </div>
      ))}
    </section>
  );
}

export function PaymentIntelligencePanel({ store, selectedCreator }: Pick<Props, 'store' | 'selectedCreator'>) {
  const intel = selectedCreator ? store.paymentIntel[selectedCreator.id] : null;
  if (!intel) return null;
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>PAYMENT INTELLIGENCE · FINANCIAL HEALTH</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['MONTHLY', intel.monthlyRevenue],
          ['ANNUAL', intel.annualRevenue],
          ['BRAND CONC', `${intel.brandConcentrationPct}%`],
          ['DIVERSITY', `${intel.incomeDiversityPct}%`],
          ['FORECAST', intel.forecast],
          ['HEALTH', `${intel.financialHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-1 border" style={{ borderColor: CM.panelBorder }}>
            <p style={{ ...cmValue, fontSize: '10px' }}>{val}</p>
            <p style={{ ...cmLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...cmLabel, color: CM.blue, marginTop: 8 }}>REC: {intel.recommendation}</p>
    </section>
  );
}

export function CosIntegrationPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cmPanel, borderLeft: `4px solid ${CM.blue}` }}>
      <p style={cmSectionTitle}>CHIEF OF STAFF · PARTNERSHIP APPROVALS</p>
      <p style={cmLabel}>
        Creator marketplace deals evaluated against Leadership DNA · Company DNA · alignment thresholds
      </p>
      <Link
        to={adminStudioChiefOfStaffPath()}
        style={{ ...cmLabel, color: CM.blue, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={cmPanel}>
      <p style={cmSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CREATOR_MARKETPLACE_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CM.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...cmLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...cmLabel, color: '#E11D48', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...cmLabel, color: '#D97706', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...cmLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioTalentNetworkPath()} style={{ ...cmLabel, color: CM.blue, fontSize: '6px' }}>→ TALENT NETWORK</Link>
        <Link to={adminStudioEcosystemMarketplacePath()} style={{ ...cmLabel, color: '#4F46E5', fontSize: '6px' }}>→ ECOSYSTEM MARKETPLACE</Link>
      </div>
    </section>
  );
}
