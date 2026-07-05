import { Link } from 'react-router-dom';
import type { ChiefOfStaffStore, DelegationMode, ExecutiveInboxItem } from '../../../../studio-os-core/chief-of-staff/types';
import {
  DECISION_LEVEL_LABELS,
  DELEGATION_LABELS,
  SOFT_APPROVAL_SOURCES,
} from '../../../../studio-os-core/chief-of-staff/constants';
import { adminStudioExecutiveOrganizationPath, adminStudioLeadershipDnaPath, adminStudioStrategyEnginePath, adminStudioCampaignEnginePath, adminStudioWorkOrchestrationPath, adminStudioDistributionEnginePath, adminStudioReaderGraphPath, adminStudioRelationshipEnginePath, adminStudioCreatorMarketplacePath, adminStudioEcosystemMarketplacePath, adminStudioKnowledgeAssetEnginePath, adminStudioCompanyMaturityEnginePath, adminStudioBrandArchitectPath, adminStudioExperienceArchitectPath, adminStudioDigitalArchitectPath, adminStudioGrowthArchitectPath, adminStudioCompanyGenomePath, adminStudioArchitectStudioPath, adminStudioCampusEvolutionEnginePath, adminStudioFounderWalkPath, adminStudioRemembranceGardenPath, adminStudioFoundersPromisePath, adminStudioExecutiveFrameworkPath, adminStudioLeadershipManifestoFrameworkPath, adminStudioChiefBrandOfficerPath, adminStudioChiefExperienceOfficerPath, adminStudioChiefDigitalOfficerPath, adminStudioChiefTechnologyOfficerPath, adminStudioChiefGrowthOfficerPath, adminStudioExecutiveCouncilPath, adminStudioOrganizationalIntelligencePath, adminStudioOrganizationalAutonomyFrameworkPath, adminStudioOrganizationalDelegationEnginePath } from '../../../../utils/adminStudioRoutes';
import {
  CHIEF_OF_STAFF_STYLES,
  COS,
  cosDarkHeader,
  cosLabel,
  cosLiveDot,
  cosPanel,
  cosSectionTitle,
  cosValue,
  riskColor,
  statusColor,
} from './chiefOfStaffTheme';

type Props = {
  store: ChiefOfStaffStore;
  escalatedItems: ExecutiveInboxItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReturn: (id: string) => void;
  onDelegationChange: (deptId: string, mode: DelegationMode) => void;
};

function Metric({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="p-2 border text-center" style={{ borderColor: COS.panelBorder }}>
      <p style={{ ...cosValue, fontSize: accent ? '16px' : '14px', color: accent ? COS.red : COS.indigo }}>{value}</p>
      <p style={cosLabel}>{label}</p>
    </div>
  );
}

export function ChiefOfStaffHeader() {
  return (
    <>
      <style>{CHIEF_OF_STAFF_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...cosDarkHeader, borderTop: `3px solid ${COS.gold}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CHIEF OF STAFF
        </p>
        <p style={{ ...cosLabel, color: '#94A3B8' }}>
          <span style={cosLiveDot} />
          FOUNDER&apos;S PRIMARY EXECUTIVE · ALL DEPARTMENTS REPORT HERE FIRST
        </p>
        <p style={{ ...cosLabel, color: '#CBD5E1', marginTop: 4 }}>
          FOUNDER → CHIEF OF STAFF → EXECUTIVE LEADERSHIP → DEPARTMENTS → WORKERS → TASKS
        </p>
      </header>
    </>
  );
}

export function DashboardSummaryPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>EXECUTIVE SUMMARY</p>
      <p style={{ ...cosLabel, color: COS.accent, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.executiveSummary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        <Metric label="REQUIRE FOUNDER" value={d.itemsRequiringApproval} accent />
        <Metric label="AUTO APPROVED" value={d.itemsAutoApproved} />
        <Metric label="RETURNED" value={d.itemsReturnedRevision} />
        <Metric label="REJECTED" value={d.itemsRejected} />
        <Metric label="RISKS" value={d.pendingRisks} accent />
        <Metric label="OPPORTUNITIES" value={d.pendingOpportunities} />
        <Metric label="CONFIDENCE" value={`${d.overallConfidencePct}%`} />
        <Metric label="EST. REVIEW" value={`${d.estimatedFounderReviewMins} MIN`} accent />
      </div>
      <div className="mt-3 p-2" style={{ background: 'rgba(22,163,74,0.08)', border: `1px solid ${COS.green}` }}>
        <p style={{ ...cosSectionTitle, color: COS.green, fontSize: '8px' }}>FOUNDER ATTENTION PROTECTION</p>
        <p style={{ ...cosLabel, color: COS.accent }}>{d.attentionProtectionNote}</p>
      </div>
      <p style={{ ...cosSectionTitle, marginTop: 10 }}>TODAY&apos;S PRIORITIES</p>
      {d.todayPriorities.map((p) => (
        <p key={p} style={{ ...cosLabel, color: COS.accent }}>· {p}</p>
      ))}
    </section>
  );
}

export function MorningBriefingPanel({ store }: Pick<Props, 'store'>) {
  const b = store.morningBriefing;
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: `4px solid ${COS.gold}` }}>
      <p style={cosSectionTitle}>MORNING BRIEFING · UNIFIED</p>
      <p style={{ ...cosLabel, color: COS.accent }}>{b.businessHealthSummary}</p>
      <p style={{ ...cosSectionTitle, marginTop: 8 }}>DEPARTMENTS</p>
      {b.departmentSummaries.map((s) => (
        <p key={s} style={cosLabel}>· {s}</p>
      ))}
      <p style={{ ...cosSectionTitle, marginTop: 8 }}>OPPORTUNITIES</p>
      {b.majorOpportunities.map((o) => (
        <p key={o} style={{ ...cosLabel, color: COS.green }}>· {o}</p>
      ))}
      <p style={{ ...cosSectionTitle, marginTop: 8 }}>RISKS</p>
      {b.majorRisks.map((r) => (
        <p key={r} style={{ ...cosLabel, color: COS.red }}>· {r}</p>
      ))}
      <p style={{ ...cosSectionTitle, marginTop: 8 }}>STUDIO INTELLIGENCE</p>
      <p style={cosLabel}>{b.studioIntelligenceSummary}</p>
      <p style={{ ...cosLabel, color: COS.indigo, marginTop: 6 }}>
        EST. FOUNDER WORKLOAD · {b.estimatedFounderWorkloadMins} MINUTES
      </p>
    </section>
  );
}

function InboxCard({
  item,
  showActions,
  onApprove,
  onReject,
  onReturn,
}: {
  item: ExecutiveInboxItem;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReturn?: (id: string) => void;
}) {
  return (
    <div className="p-2 mb-2 border" style={{ borderColor: item.status === 'escalated' ? COS.red : COS.panelBorder }}>
      <div className="flex justify-between gap-2">
        <p style={{ ...cosLabel, color: COS.indigo, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
          {item.executiveTitle.toUpperCase()} · {item.category.toUpperCase()}
        </p>
        <span style={{ ...cosLabel, color: statusColor(item.status), fontSize: '6px' }}>{item.status.replace(/-/g, ' ').toUpperCase()}</span>
      </div>
      <p style={{ ...cosLabel, color: COS.accent, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{item.title}</p>
      <p style={cosLabel}>{item.summary}</p>
      <p style={cosLabel}>{DECISION_LEVEL_LABELS[item.decisionLevel]} · CONFIDENCE {item.confidencePct}% · RISK <span style={{ color: riskColor(item.riskLevel) }}>{item.riskLevel.toUpperCase()}</span></p>
      <p style={{ ...cosLabel, fontSize: '6px' }}>WHY · {item.reasoning}</p>
      <p style={{ ...cosLabel, fontSize: '6px' }}>EVIDENCE · {item.supportingEvidence.join(' · ')}</p>
      <p style={{ ...cosLabel, fontSize: '6px' }}>HISTORY · {item.similarHistoricalApprovals.join(' · ')}</p>
      <p style={{ ...cosLabel, color: COS.indigo, fontSize: '6px' }}>ACTION · {item.recommendedAction}</p>
      {showActions ? (
        <div className="flex gap-1 mt-2">
          <button type="button" className="flex-1 py-1 text-[6px] font-futura border" style={{ borderColor: COS.green, color: COS.green, fontWeight: 515 }} onClick={() => onApprove?.(item.id)}>APPROVE</button>
          <button type="button" className="flex-1 py-1 text-[6px] font-futura border" style={{ borderColor: COS.gold, color: COS.gold, fontWeight: 515 }} onClick={() => onReturn?.(item.id)}>REVISE</button>
          <button type="button" className="flex-1 py-1 text-[6px] font-futura border" style={{ borderColor: COS.red, color: COS.red, fontWeight: 515 }} onClick={() => onReject?.(item.id)}>REJECT</button>
        </div>
      ) : null}
    </div>
  );
}

export function ExecutiveInboxPanel({ store, escalatedItems, onApprove, onReject, onReturn }: Props) {
  const recent = store.executiveInbox.filter((i) => i.status !== 'escalated').slice(0, 5);
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>EXECUTIVE INBOX · SOFT APPROVAL ENGINE · THRESHOLD {store.softApprovalThresholdPct}%</p>
      <p style={cosLabel}>EVALUATES · {SOFT_APPROVAL_SOURCES.join(' · ')}</p>

      {escalatedItems.length > 0 ? (
        <>
          <p style={{ ...cosSectionTitle, marginTop: 10, color: COS.red }}>FOUNDER REVIEW REQUIRED ({escalatedItems.length})</p>
          {escalatedItems.map((item) => (
            <InboxCard key={item.id} item={item} showActions onApprove={onApprove} onReject={onReject} onReturn={onReturn} />
          ))}
        </>
      ) : (
        <p style={{ ...cosLabel, color: COS.green, marginTop: 8 }}>NO ESCALATIONS — CHIEF OF STAFF HANDLING OPERATIONS</p>
      )}

      <p style={{ ...cosSectionTitle, marginTop: 10 }}>RECENTLY PROCESSED</p>
      {recent.map((item) => (
        <InboxCard key={item.id} item={item} />
      ))}
    </section>
  );
}

export function OrgHierarchyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <div className="flex items-center justify-between mb-2">
        <p style={cosSectionTitle}>ORGANIZATION · EXECUTIVE LEADERSHIP</p>
        <Link
          to={adminStudioExecutiveOrganizationPath()}
          style={{ ...cosLabel, color: COS.gold, fontFamily: '"Futura PT Medium"', fontSize: '6px' }}
        >
          EXEC ORG →
        </Link>
      </div>
      <div className="flex flex-col items-center gap-0 mb-3">
        {['FOUNDER', 'CHIEF OF STAFF', 'EXECUTIVE LEADERSHIP'].map((level, i) => (
          <div key={level} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-2" style={{ background: COS.indigo }} /> : null}
            <div className="w-full px-2 py-1 text-[7px] font-futura text-center border" style={{ borderColor: COS.indigo, background: i === 1 ? 'rgba(99,102,241,0.1)' : 'white', fontWeight: 515 }}>
              {level}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {store.executiveLeadership.map((exec) => (
          <div key={exec.id} className="p-2 border" style={{ borderColor: exec.status === 'coaching' ? COS.gold : COS.panelBorder }}>
            <p style={{ ...cosLabel, color: COS.indigo, fontFamily: '"Futura PT Medium"' }}>{exec.title.toUpperCase()}</p>
            <p style={cosLabel}>{exec.department.toUpperCase()} · {exec.status.toUpperCase()}</p>
            <p style={cosLabel}>PENDING · {exec.pendingSubmissions} · AUTO-RATE · {exec.autoApprovalRatePct}%</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DepartmentStatusPanel({ store, onDelegationChange }: Pick<Props, 'store' | 'onDelegationChange'>) {
  const modes: DelegationMode[] = ['fully-autonomous', 'chief-of-staff-only', 'soft-approval', 'founder-review', 'manual-approval'];
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>DEPARTMENT STATUS · DELEGATION</p>
      {store.departments.map((dept) => (
        <div key={dept.id} className="p-2 mb-2 border" style={{ borderColor: COS.panelBorder }}>
          <div className="flex justify-between">
            <p style={{ ...cosLabel, color: COS.accent, fontFamily: '"Futura PT Medium"' }}>{dept.name.toUpperCase()} · HEALTH {dept.healthPct}%</p>
            <p style={cosLabel}>AUTO {dept.autoApprovedToday} · ESC {dept.escalatedToday}</p>
          </div>
          <select
            value={dept.autonomy}
            onChange={(e) => onDelegationChange(dept.id, e.target.value as DelegationMode)}
            className="w-full mt-1 text-[6px] font-futura border py-1"
            style={{ borderColor: COS.indigo, color: COS.accent }}
          >
            {modes.map((m) => (
              <option key={m} value={m}>{DELEGATION_LABELS[m]}</option>
            ))}
          </select>
        </div>
      ))}
    </section>
  );
}

export function DecisionLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>DECISION LEARNING · FOUNDER PATTERNS</p>
      {store.founderDecisions.map((d) => (
        <div key={d.id} className="p-2 mb-1 border" style={{ borderColor: COS.panelBorder }}>
          <p style={{ ...cosLabel, color: d.action === 'approved' ? COS.green : COS.red, fontFamily: '"Futura PT Medium"' }}>
            {d.action.toUpperCase()} · {new Date(d.timestamp).toLocaleDateString()}
          </p>
          {d.reason ? <p style={cosLabel}>REASON · {d.reason}</p> : null}
          <p style={{ ...cosLabel, fontSize: '6px' }}>LEARNED · {d.patternsLearned.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveCoachingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>EXECUTIVE COACHING</p>
      {store.coachingNotes.map((note) => (
        <div key={note.id} className="p-2 mb-2 border" style={{ borderColor: note.recurring ? COS.gold : COS.panelBorder }}>
          <p style={{ ...cosLabel, color: COS.indigo, fontFamily: '"Futura PT Medium"' }}>{note.executiveTitle.toUpperCase()}</p>
          <p style={cosLabel}>ISSUE · {note.issue}</p>
          <p style={cosLabel}>FEEDBACK · {note.feedback}</p>
          <p style={cosLabel}>TRAINING · {note.trainingRecommended}</p>
        </div>
      ))}
    </section>
  );
}

export function LeadershipTimelinePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>LEADERSHIP TIMELINE · TRUST EVOLUTION</p>
      {store.leadershipTimeline.map((ev) => (
        <div key={ev.id} className="py-1 border-b" style={{ borderColor: '#eee' }}>
          <p style={{ ...cosLabel, color: COS.accent, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
            {ev.type.toUpperCase()} · {ev.title}
          </p>
          <p style={{ ...cosLabel, fontSize: '6px' }}>{ev.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function CrossWorkspacePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>CROSS-WORKSPACE LEADERSHIP</p>
      {store.crossWorkspaceInsights.map((ins) => (
        <div key={ins.id} className="p-2 mb-1 border" style={{ borderColor: ins.founderAttentionImpact === 'high' ? COS.red : COS.panelBorder }}>
          <p style={{ ...cosLabel, color: COS.indigo, fontFamily: '"Futura PT Medium"' }}>{ins.workspaceName.toUpperCase()}</p>
          <p style={cosLabel}>{ins.insight}</p>
          <p style={{ ...cosLabel, fontSize: '6px' }}>ATTENTION IMPACT · {ins.founderAttentionImpact.toUpperCase()}</p>
        </div>
      ))}
    </section>
  );
}

export function StudioIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>STUDIO INTELLIGENCE → CHIEF OF STAFF</p>
      {store.studioIntelligenceAdvisories.map((adv) => (
        <div key={adv.id} className="p-2 mb-1 border" style={{ borderColor: COS.panelBorder }}>
          <p style={{ ...cosLabel, color: COS.accent, fontFamily: '"Futura PT Medium"' }}>{adv.signal}</p>
          <p style={cosLabel}>REC · {adv.recommendation}</p>
          <p style={cosLabel}>{adv.confidencePct}% CONFIDENCE</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveMemoryPanel({ store }: Pick<Props, 'store'>) {
  const m = store.executiveMemory;
  const sections = [
    ['VISUAL TASTE', m.visualTaste],
    ['WRITING STYLE', m.writingStyle],
    ['DECISION PATTERNS', m.decisionPatterns],
    ['QUALITY EXPECTATIONS', m.qualityExpectations],
    ['BRAND PHILOSOPHY', m.brandPhilosophy],
    ['COMMUNICATION', m.communicationPreferences],
    ['LONG-TERM VISION', m.longTermVision],
  ] as const;

  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>EXECUTIVE MEMORY · FOUNDER MODEL</p>
      <p style={cosLabel}>SOURCES · {m.sources.join(' · ')}</p>
      {sections.map(([label, items]) => (
        <div key={label} className="mt-2">
          <p style={{ ...cosSectionTitle, fontSize: '8px' }}>{label}</p>
          {items.map((item) => (
            <p key={item} style={cosLabel}>· {item}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function DecisionRoutingPanel() {
  const levels = [
    { level: 1, label: 'AUTOMATIC', examples: 'Minor copy · thumbnail selection · caption optimization · scheduling · internal organization' },
    { level: 2, label: 'CHIEF OF STAFF', examples: 'Creative direction · campaign sequencing · workflow optimization · content prioritization · talent assignments' },
    { level: 3, label: 'FOUNDER', examples: 'Company strategy · pricing · contracts · major hiring · brand positioning · legal · high-value spending' },
  ];
  return (
    <section className="p-3 mb-3" style={cosPanel}>
      <p style={cosSectionTitle}>DECISION ROUTING</p>
      {levels.map((l) => (
        <div key={l.level} className="p-2 mb-1 border" style={{ borderColor: COS.panelBorder }}>
          <p style={{ ...cosLabel, color: COS.indigo, fontFamily: '"Futura PT Medium"' }}>LEVEL {l.level} · {l.label}</p>
          <p style={{ ...cosLabel, fontSize: '6px' }}>{l.examples}</p>
        </div>
      ))}
    </section>
  );
}

export function CampaignEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #D97706' }}>
      <p style={cosSectionTitle}>CAMPAIGN ENGINE · EXECUTION PRIORITIZATION</p>
      <p style={cosLabel}>
        Prioritize campaign deliverables by strategic impact · approve launches · flag misaligned production
      </p>
      <Link
        to={adminStudioCampaignEnginePath()}
        style={{ ...cosLabel, color: '#D97706', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CAMPAIGN ENGINE
      </Link>
    </section>
  );
}

export function WorkOrchestrationLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #0891B2' }}>
      <p style={cosSectionTitle}>WORK ORCHESTRATION · ORGANIZATIONAL EXECUTION</p>
      <p style={cosLabel}>
        Prioritize work packages · assign departments · balance workloads · resequence activities · protect founder attention
      </p>
      <Link
        to={adminStudioWorkOrchestrationPath()}
        style={{ ...cosLabel, color: '#0891B2', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN WORK ORCHESTRATION
      </Link>
    </section>
  );
}

export function DistributionEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #7C3AED' }}>
      <p style={cosSectionTitle}>DISTRIBUTION ENGINE · KNOWLEDGE REACH</p>
      <p style={cosLabel}>
        Approve distribution strategy · channel optimization · evergreen republishing · protect unified source of truth
      </p>
      <Link
        to={adminStudioDistributionEnginePath()}
        style={{ ...cosLabel, color: '#7C3AED', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN DISTRIBUTION ENGINE
      </Link>
    </section>
  );
}

export function ReaderGraphLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #E11D48' }}>
      <p style={cosSectionTitle}>READER GRAPH · LIVING RELATIONSHIPS</p>
      <p style={cosLabel}>
        Relationship health · advocate pipeline · membership recommendations · protect reader privacy
      </p>
      <Link
        to={adminStudioReaderGraphPath()}
        style={{ ...cosLabel, color: '#E11D48', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN READER GRAPH
      </Link>
    </section>
  );
}

export function RelationshipEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #059669' }}>
      <p style={cosSectionTitle}>RELATIONSHIP ENGINE · ACTIVE NURTURING</p>
      <p style={cosLabel}>
        Next best actions · recognition · relationship health alerts · protect long-term trust
      </p>
      <Link
        to={adminStudioRelationshipEnginePath()}
        style={{ ...cosLabel, color: '#059669', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN RELATIONSHIP ENGINE
      </Link>
    </section>
  );
}

export function CreatorMarketplaceLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #2563EB' }}>
      <p style={cosSectionTitle}>CREATOR MARKETPLACE · PARTNERSHIP INTELLIGENCE</p>
      <p style={cosLabel}>
        Creator-brand alignment · deal approvals · career growth · long-term partnerships over one-time posts
      </p>
      <Link
        to={adminStudioCreatorMarketplacePath()}
        style={{ ...cosLabel, color: '#2563EB', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CREATOR MARKETPLACE
      </Link>
    </section>
  );
}

export function EcosystemMarketplaceLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #4F46E5' }}>
      <p style={cosSectionTitle}>ECOSYSTEM MARKETPLACE · ORGANIZATIONAL ASSETS</p>
      <p style={cosLabel}>
        Asset activation approvals · inheritance compatibility · organizational capability over file downloads
      </p>
      <Link
        to={adminStudioEcosystemMarketplacePath()}
        style={{ ...cosLabel, color: '#4F46E5', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN ECOSYSTEM MARKETPLACE
      </Link>
    </section>
  );
}

export function KnowledgeAssetEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #0D9488' }}>
      <p style={cosSectionTitle}>KNOWLEDGE ASSET ENGINE · INSTITUTIONAL MEMORY</p>
      <p style={cosLabel}>
        Canonical source integrity · knowledge governance · SSOT protection · institutional memory
      </p>
      <Link
        to={adminStudioKnowledgeAssetEnginePath()}
        style={{ ...cosLabel, color: '#0D9488', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN KNOWLEDGE ASSET ENGINE
      </Link>
    </section>
  );
}

export function CompanyMaturityEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #0369A1' }}>
      <p style={cosSectionTitle}>COMPANY MATURITY ENGINE · ORGANIZATIONAL UNDERSTANDING</p>
      <p style={cosLabel}>
        Maturity monitoring · proactive improvements · universal entry · meet founders where they are
      </p>
      <Link
        to={adminStudioCompanyMaturityEnginePath()}
        style={{ ...cosLabel, color: '#0369A1', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN COMPANY MATURITY ENGINE
      </Link>
    </section>
  );
}

export function BrandArchitectLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #BE185D' }}>
      <p style={cosSectionTitle}>BRAND ARCHITECT · COHESIVE IDENTITY</p>
      <p style={cosLabel}>
        Brand blueprint · verbal + visual systems · competitive intelligence · experience architect handoff
      </p>
      <Link
        to={adminStudioBrandArchitectPath()}
        style={{ ...cosLabel, color: '#BE185D', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN BRAND ARCHITECT
      </Link>
    </section>
  );
}

export function ExperienceArchitectLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #0891B2' }}>
      <p style={cosSectionTitle}>EXPERIENCE ARCHITECT · EMOTIONAL DESIGN</p>
      <p style={cosLabel}>
        Journey maps · emotional architecture · memorability · every touchpoint reinforces identity
      </p>
      <Link
        to={adminStudioExperienceArchitectPath()}
        style={{ ...cosLabel, color: '#0891B2', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN EXPERIENCE ARCHITECT
      </Link>
    </section>
  );
}

export function DigitalArchitectLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #6366F1' }}>
      <p style={cosSectionTitle}>DIGITAL ARCHITECT · DIGITAL WORLDS</p>
      <p style={cosLabel}>
        Experience gallery · hybrid architecture · ecosystem design · purpose before templates
      </p>
      <Link
        to={adminStudioDigitalArchitectPath()}
        style={{ ...cosLabel, color: '#6366F1', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN DIGITAL ARCHITECT
      </Link>
    </section>
  );
}

export function GrowthArchitectLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #059669' }}>
      <p style={cosSectionTitle}>GROWTH ARCHITECT · SUSTAINABLE GROWTH OS</p>
      <p style={cosLabel}>
        Initiatives · GTM · orchestration · compound trust · revenue · relationships over decades
      </p>
      <Link
        to={adminStudioGrowthArchitectPath()}
        style={{ ...cosLabel, color: '#059669', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN GROWTH ARCHITECT
      </Link>
    </section>
  );
}

export function CompanyGenomeLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #9333EA' }}>
      <p style={cosSectionTitle}>COMPANY GENOME · LIVING ORGANIZATIONAL GENETICS</p>
      <p style={cosLabel}>
        DNA layers · health · evolution · relationships · fingerprint · not analytics — the organizational heartbeat
      </p>
      <Link
        to={adminStudioCompanyGenomePath()}
        style={{ ...cosLabel, color: '#9333EA', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN COMPANY GENOME
      </Link>
    </section>
  );
}

export function ArchitectStudioLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #CA8A04' }}>
      <p style={cosSectionTitle}>ARCHITECT STUDIO · LIVING HEADQUARTERS</p>
      <p style={cosLabel}>
        Five connected studios · morning arrival · executive briefing · organization already in motion before you interact
      </p>
      <Link
        to={adminStudioArchitectStudioPath()}
        style={{ ...cosLabel, color: '#CA8A04', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → ENTER ARCHITECT STUDIO
      </Link>
    </section>
  );
}

export function CampusEvolutionEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #0D9488' }}>
      <p style={cosSectionTitle}>CAMPUS EVOLUTION ENGINE · LIVING ARCHITECTURE</p>
      <p style={cosLabel}>
        Walk through decades of growth · earned spaces · company memory · architectural progression · not static themes
      </p>
      <Link
        to={adminStudioCampusEvolutionEnginePath()}
        style={{ ...cosLabel, color: '#0D9488', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → WALK THE CAMPUS
      </Link>
    </section>
  );
}

export function FounderWalkLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #78716C' }}>
      <p style={cosSectionTitle}>FOUNDER WALK · EMOTIONAL SPINE</p>
      <p style={cosLabel}>
        Marble pathway of milestones · memory markers · legacy for future generations · not a trophy case
      </p>
      <Link
        to={adminStudioFounderWalkPath()}
        style={{ ...cosLabel, color: '#78716C', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → BEGIN FOUNDER WALK
      </Link>
    </section>
  );
}

export function RemembranceGardenLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #6B9080' }}>
      <p style={cosSectionTitle}>REMEMBRANCE GARDEN · PRESERVE GRATITUDE</p>
      <p style={cosLabel}>
        Honor people, moments, and sacrifices · dedications · legacy letters · peaceful · not mourning
      </p>
      <Link
        to={adminStudioRemembranceGardenPath()}
        style={{ ...cosLabel, color: '#6B9080', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → ENTER REMEMBRANCE GARDEN
      </Link>
    </section>
  );
}

export function FoundersPromiseLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #92400E' }}>
      <p style={cosSectionTitle}>FOUNDER&apos;S PROMISE · NORTH STAR</p>
      <p style={cosLabel}>
        Personal commitment · not marketing · alignment governing principle · preserve the conviction that started everything
      </p>
      <Link
        to={adminStudioFoundersPromisePath()}
        style={{ ...cosLabel, color: '#92400E', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → READ FOUNDER&apos;S PROMISE
      </Link>
    </section>
  );
}

export function ExecutiveFrameworkLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #334155' }}>
      <p style={cosSectionTitle}>EXECUTIVE FRAMEWORK · LEADERSHIP ORGANIZATION</p>
      <p style={cosLabel}>
        Constitutional foundation for every AI executive · coordinated leadership · not isolated assistants
      </p>
      <Link
        to={adminStudioExecutiveFrameworkPath()}
        style={{ ...cosLabel, color: '#334155', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN EXECUTIVE FRAMEWORK
      </Link>
    </section>
  );
}

export function LeadershipManifestoFrameworkLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #4338CA' }}>
      <p style={cosSectionTitle}>LEADERSHIP MANIFESTO FRAMEWORK · CONSTITUTIONAL DNA</p>
      <p style={cosLabel}>
        Shared leadership principles inherited by every executive · wisdom over authority · living philosophy
      </p>
      <Link
        to={adminStudioLeadershipManifestoFrameworkPath()}
        style={{ ...cosLabel, color: '#4338CA', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN LEADERSHIP MANIFESTO
      </Link>
    </section>
  );
}

export function ChiefBrandOfficerLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #7C3AED' }}>
      <p style={cosSectionTitle}>CHIEF BRAND OFFICER · BRAND STEWARD V2.0</p>
      <p style={cosLabel}>
        Lifelong guardian of identity · protect meaning · brand governance · alignment engine
      </p>
      <Link
        to={adminStudioChiefBrandOfficerPath()}
        style={{ ...cosLabel, color: '#7C3AED', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CHIEF BRAND OFFICER
      </Link>
    </section>
  );
}

export function ChiefExperienceOfficerLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #0891B2' }}>
      <p style={cosSectionTitle}>CHIEF EXPERIENCE OFFICER · CX GUARDIAN V2.0</p>
      <p style={cosLabel}>
        Lifelong guardian of customer experience · trust · delight · hospitality · humanity
      </p>
      <Link
        to={adminStudioChiefExperienceOfficerPath()}
        style={{ ...cosLabel, color: '#0891B2', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CHIEF EXPERIENCE OFFICER
      </Link>
    </section>
  );
}

export function ChiefDigitalOfficerLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #6366F1' }}>
      <p style={cosSectionTitle}>CHIEF DIGITAL OFFICER · DIGITAL ECOSYSTEM V1.0</p>
      <p style={cosLabel}>
        Lifelong guardian of digital ecosystem · technology invisible · architecture · craftsmanship
      </p>
      <Link
        to={adminStudioChiefDigitalOfficerPath()}
        style={{ ...cosLabel, color: '#6366F1', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CHIEF DIGITAL OFFICER
      </Link>
    </section>
  );
}

export function ChiefTechnologyOfficerLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #2563EB' }}>
      <p style={cosSectionTitle}>CHIEF TECHNOLOGY OFFICER · ENGINEERING V1.0</p>
      <p style={cosLabel}>
        Lifelong guardian of engineering · infrastructure · resilience · built to last
      </p>
      <Link
        to={adminStudioChiefTechnologyOfficerPath()}
        style={{ ...cosLabel, color: '#2563EB', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CHIEF TECHNOLOGY OFFICER
      </Link>
    </section>
  );
}

export function ChiefGrowthOfficerLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #059669' }}>
      <p style={cosSectionTitle}>CHIEF GROWTH OFFICER · SUSTAINABLE GROWTH V1.0</p>
      <p style={cosLabel}>
        Lifelong guardian of sustainable growth · stronger not bigger · relationship-driven
      </p>
      <Link
        to={adminStudioChiefGrowthOfficerPath()}
        style={{ ...cosLabel, color: '#059669', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CHIEF GROWTH OFFICER
      </Link>
    </section>
  );
}

export function ExecutiveCouncilLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #B45309' }}>
      <p style={cosSectionTitle}>EXECUTIVE COUNCIL · COLLABORATIVE LEADERSHIP V2.0</p>
      <p style={cosLabel}>
        Highest leadership body · executive debate · decision synthesis · organizational wisdom
      </p>
      <Link
        to={adminStudioExecutiveCouncilPath()}
        style={{ ...cosLabel, color: '#B45309', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → ENTER EXECUTIVE COUNCIL
      </Link>
    </section>
  );
}

export function OrganizationalIntelligenceLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #4F46E5' }}>
      <p style={cosSectionTitle}>ORGANIZATIONAL INTELLIGENCE · COLLECTIVE MIND V1.0</p>
      <p style={cosLabel}>
        Accumulated wisdom · observe · learn · reflect · predict · compound organizational knowledge
      </p>
      <Link
        to={adminStudioOrganizationalIntelligencePath()}
        style={{ ...cosLabel, color: '#4F46E5', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN ORGANIZATIONAL INTELLIGENCE
      </Link>
    </section>
  );
}

export function OrganizationalAutonomyFrameworkLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #0D9488' }}>
      <p style={cosSectionTitle}>ORGANIZATIONAL AUTONOMY FRAMEWORK · TRUSTED STEWARDSHIP V1.0</p>
      <p style={cosLabel}>
        Constitutional autonomy governance · earned through trust · founder-aligned execution
      </p>
      <Link
        to={adminStudioOrganizationalAutonomyFrameworkPath()}
        style={{ ...cosLabel, color: '#0D9488', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN ORGANIZATIONAL AUTONOMY FRAMEWORK
      </Link>
    </section>
  );
}

export function OrganizationalDelegationEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #7C3AED' }}>
      <p style={cosSectionTitle}>ORGANIZATIONAL DELEGATION ENGINE · OUTCOME-BASED DELEGATION V1.0</p>
      <p style={cosLabel}>
        Founders define outcomes · executives collaborate autonomously · governance inherits organizational rules
      </p>
      <Link
        to={adminStudioOrganizationalDelegationEnginePath()}
        style={{ ...cosLabel, color: '#7C3AED', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN ORGANIZATIONAL DELEGATION ENGINE
      </Link>
    </section>
  );
}

export function StrategyEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: '4px solid #334155' }}>
      <p style={cosSectionTitle}>STRATEGY ENGINE · PRIORITIZATION FRAMEWORK</p>
      <p style={cosLabel}>
        When multiple items need attention · prioritize by strategic impact · ask what moves the company closer to its objective
      </p>
      <p style={{ ...cosSectionTitle, marginTop: 8 }}>CoS STRATEGY QUESTIONS</p>
      <p style={cosLabel}>· What moves the company closer to its objective?</p>
      <p style={cosLabel}>· What can be delegated?</p>
      <p style={cosLabel}>· What requires founder judgment?</p>
      <p style={cosLabel}>· What should be paused?</p>
      <Link
        to={adminStudioStrategyEnginePath()}
        style={{ ...cosLabel, color: '#334155', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN STRATEGY ENGINE
      </Link>
    </section>
  );
}

export function LeadershipDnaLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cosPanel, borderLeft: `4px solid ${COS.gold}` }}>
      <p style={cosSectionTitle}>LEADERSHIP DNA · PRIMARY TRAINING FRAMEWORK</p>
      <p style={cosLabel}>
        Before escalation · evaluate against founder operating blueprint · soft approve when alignment exceeds threshold · otherwise revise or escalate
      </p>
      <p style={{ ...cosSectionTitle, marginTop: 8 }}>EVALUATION SOURCES</p>
      {SOFT_APPROVAL_SOURCES.map((src) => (
        <p key={src} style={cosLabel}>· {src}</p>
      ))}
      <Link
        to={adminStudioLeadershipDnaPath()}
        style={{ ...cosLabel, color: COS.gold, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN LEADERSHIP DNA
      </Link>
    </section>
  );
}
