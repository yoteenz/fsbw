import { Link } from 'react-router-dom';
import type { LeadershipDnaStore, LeadershipProfileSectionId } from '../../../../studio-os-core/leadership-dna/types';
import { LEADERSHIP_DNA_CONNECTED_LAYERS } from '../../../../studio-os-core/leadership-dna/constants';
import { adminStudioChiefOfStaffPath } from '../../../../utils/adminStudioRoutes';
import type { ChiefOfStaffAlignmentCheck } from '../../../../studio-os-core/leadership-dna/types';
import {
  LEADERSHIP_DNA_STYLES,
  LDNA,
  confidenceColor,
  delegationColor,
  ldnaDarkHeader,
  ldnaLabel,
  ldnaLiveDot,
  ldnaPanel,
  ldnaSectionTitle,
  ldnaValue,
} from './leadershipDnaTheme';

type Props = {
  store: LeadershipDnaStore;
  activeSection: LeadershipProfileSectionId;
  onSectionChange: (id: LeadershipProfileSectionId) => void;
  evaluateAlignment: (input: {
    title: string;
    category: string;
    confidencePct: number;
    evaluatedAgainst: string[];
  }) => ChiefOfStaffAlignmentCheck;
};

function RuleList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item) => (
        <p key={item} style={ldnaLabel}>
          · {item}
        </p>
      ))}
    </>
  );
}

function Metric({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="p-2 border text-center" style={{ borderColor: LDNA.panelBorder }}>
      <p style={{ ...ldnaValue, fontSize: accent ? '16px' : '14px', color: accent ? LDNA.purple : LDNA.indigo }}>{value}</p>
      <p style={ldnaLabel}>{label}</p>
    </div>
  );
}

export function LeadershipDnaHeader() {
  return (
    <>
      <style>{LEADERSHIP_DNA_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ldnaDarkHeader, borderTop: `3px solid ${LDNA.purple}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          LEADERSHIP DNA
        </p>
        <p style={{ ...ldnaLabel, color: '#94A3B8' }}>
          <span style={ldnaLiveDot} />
          FOUNDER OPERATING BLUEPRINT · PRIMARY CoS TRAINING FRAMEWORK
        </p>
        <p style={{ ...ldnaLabel, color: '#CBD5E1', marginTop: 4 }}>
          HOW THE FOUNDER LEADS · NOT WHAT TASKS THEY DO · AMPLIFIES JUDGMENT · NEVER REPLACES IT
        </p>
      </header>
    </>
  );
}

export function DashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>LEADERSHIP DNA · OPERATING BLUEPRINT</p>
      <p style={{ ...ldnaLabel, color: LDNA.accent, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        <Metric label="PRINCIPLES" value={d.principlesCount} />
        <Metric label="DECISIONS LOGGED" value={d.decisionsLogged} />
        <Metric label="APPROVAL PATTERNS" value={d.approvalPatternsIdentified} />
        <Metric label="CONFIDENCE" value={`${d.overallConfidencePct}%`} accent />
        <Metric label="DELEGATION GROWTH" value={`+${d.delegationGrowthPct}%`} />
        <Metric label="EXECUTIVE TRUST" value={`${d.executiveTrustPct}%`} />
        <Metric label="ORG MATURITY" value={`${d.organizationalMaturityPct}%`} />
        <Metric label="CoS TRAINING" value="ACTIVE" accent />
      </div>
      <div className="mt-3 p-2" style={{ background: 'rgba(124,58,237,0.08)', border: `1px solid ${LDNA.purple}` }}>
        <p style={{ ...ldnaSectionTitle, color: LDNA.purple, fontSize: '8px' }}>{d.chiefOfStaffTrainingStatus}</p>
        <p style={{ ...ldnaLabel, color: LDNA.accent }}>
          Every executive asks: &quot;Based on everything we have learned, is this something the founder would confidently approve?&quot;
        </p>
      </div>
    </section>
  );
}

export function FounderProfilePanel({ store, activeSection, onSectionChange }: Pick<Props, 'store' | 'activeSection' | 'onSectionChange'>) {
  const section = store.founderProfile.find((s) => s.id === activeSection) ?? store.founderProfile[0];
  if (!section) return null;

  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>FOUNDER PROFILE · EVOLVING SECTIONS</p>
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {store.founderProfile.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSectionChange(s.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: activeSection === s.id ? LDNA.purple : LDNA.panelBorder,
              color: activeSection === s.id ? LDNA.purple : LDNA.gray,
              background: activeSection === s.id ? 'rgba(124,58,237,0.06)' : 'white',
            }}
          >
            {s.title.split(' ')[0]}
          </button>
        ))}
      </div>
      <p style={{ ...ldnaLabel, color: LDNA.purple, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{section.title}</p>
      <p style={{ ...ldnaLabel, fontSize: '6px' }}>
        CONFIDENCE · {section.confidencePct}% · UPDATED · {new Date(section.lastUpdatedAt).toLocaleDateString()}
      </p>
      <p style={{ ...ldnaSectionTitle, marginTop: 8 }}>PRINCIPLES</p>
      <RuleList items={section.principles} />
      <p style={{ ...ldnaSectionTitle, marginTop: 8 }}>EVOLUTION</p>
      {section.evolutionNotes.map((n) => (
        <p key={n} style={{ ...ldnaLabel, color: LDNA.indigo }}>
          · {n}
        </p>
      ))}
    </section>
  );
}

export function LeadershipPrinciplesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ldnaPanel, borderLeft: `4px solid ${LDNA.gold}` }}>
      <p style={ldnaSectionTitle}>ENDURING LEADERSHIP PRINCIPLES</p>
      <RuleList items={store.leadershipPrinciples} />
    </section>
  );
}

export function DecisionJournalPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>DECISION JOURNAL · SIGNIFICANT FOUNDER DECISIONS</p>
      {store.decisionJournal.map((entry) => (
        <div key={entry.id} className="p-2 mb-2 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.accent, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
            {entry.decision.toUpperCase()}
          </p>
          <p style={ldnaLabel}>CONTEXT · {entry.context}</p>
          <p style={ldnaLabel}>REASONING · {entry.reasoning}</p>
          <p style={ldnaLabel}>ALTERNATIVES · {entry.alternativesConsidered.join(' · ')}</p>
          <p style={ldnaLabel}>EXPECTED · {entry.expectedOutcome}</p>
          {entry.actualOutcome ? <p style={{ ...ldnaLabel, color: LDNA.green }}>ACTUAL · {entry.actualOutcome}</p> : null}
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>LESSONS · {entry.lessonsLearned.join(' · ')}</p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>
            {entry.confidencePct}% CONF · {entry.timeHorizon.toUpperCase()} · KG · {entry.knowledgeGraphNodeIds.join(' · ')}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ApprovalIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>APPROVAL INTELLIGENCE · PATTERN RECOGNITION</p>
      <p style={ldnaLabel}>Every approval teaches Leadership DNA · patterns over isolated choices</p>
      {store.approvalPatterns.map((p) => (
        <div key={p.id} className="p-2 mb-1 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.indigo, fontFamily: '"Futura PT Medium"' }}>
            {p.domain.toUpperCase()} · {p.confidencePct}%
          </p>
          <p style={ldnaLabel}>{p.pattern}</p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>
            {p.evidenceCount} OBSERVATIONS · {p.examples.join(' · ')}
          </p>
        </div>
      ))}
    </section>
  );
}

export function CreativeTastePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>CREATIVE TASTE ENGINE</p>
      <p style={ldnaLabel}>CoS compares proposals against historical creative preferences</p>
      {store.creativeTaste.map((t) => (
        <div key={t.id} className="py-1 border-b" style={{ borderColor: '#eee' }}>
          <p style={{ ...ldnaLabel, color: LDNA.accent, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
            {t.dimension.toUpperCase()} · {t.strengthPct}%
          </p>
          <p style={ldnaLabel}>{t.preference}</p>
        </div>
      ))}
    </section>
  );
}

export function WritingIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>WRITING INTELLIGENCE · CONNECTED TO WRITING DNA</p>
      {store.writingIntelligence.map((w) => (
        <div key={w.id} className="p-2 mb-1 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.indigo, fontFamily: '"Futura PT Medium"' }}>
            {w.dimension.toUpperCase()} · {w.strengthPct}%
          </p>
          <p style={ldnaLabel}>{w.preference}</p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>WRITING DNA · {w.writingDnaLink}</p>
        </div>
      ))}
    </section>
  );
}

export function DelegationEnginePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>DELEGATION ENGINE · RECOMMENDED LEVELS</p>
      {store.delegationRecommendations.map((d) => (
        <div key={d.id} className="p-2 mb-1 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.accent, fontFamily: '"Futura PT Medium"' }}>{d.domain.toUpperCase()}</p>
          <p style={ldnaLabel}>
            CURRENT ·{' '}
            <span style={{ color: delegationColor(d.currentLevel) }}>{d.currentLevel.replace(/-/g, ' ').toUpperCase()}</span>
            {' → '}
            REC ·{' '}
            <span style={{ color: delegationColor(d.recommendedLevel) }}>{d.recommendedLevel.replace(/-/g, ' ').toUpperCase()}</span>
          </p>
          <p style={ldnaLabel}>{d.rationale}</p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>{d.confidencePct}% CONFIDENCE</p>
        </div>
      ))}
    </section>
  );
}

export function RiskIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>RISK INTELLIGENCE</p>
      {store.riskIntelligence.map((r) => (
        <div key={r.id} className="p-2 mb-1 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: confidenceColor(r.tolerance === 'conservative' ? 60 : r.tolerance === 'moderate' ? 75 : 90), fontFamily: '"Futura PT Medium"' }}>
            {r.category.toUpperCase()} · {r.tolerance.toUpperCase()}
          </p>
          <p style={ldnaLabel}>TRIGGER · {r.trigger}</p>
          <p style={ldnaLabel}>PATTERN · {r.observedPattern}</p>
        </div>
      ))}
    </section>
  );
}

export function FeedbackIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>FEEDBACK INTELLIGENCE · PROACTIVE COACHING</p>
      <p style={ldnaLabel}>Executives receive coaching before work reaches the founder</p>
      {store.feedbackIntelligence.map((f) => (
        <div key={f.id} className="p-2 mb-1 border" style={{ borderColor: f.type === 'praise' ? LDNA.green : LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.indigo, fontFamily: '"Futura PT Medium"' }}>
            {f.type.toUpperCase()} · {f.frequency}x
          </p>
          <p style={ldnaLabel}>{f.pattern}</p>
          <p style={{ ...ldnaLabel, color: LDNA.purple }}>COACHING · {f.coachingNote}</p>
        </div>
      ))}
    </section>
  );
}

export function LeadershipTimelinePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>LEADERSHIP TIMELINE · STYLE DEVELOPMENT</p>
      {store.leadershipTimeline.map((ev) => (
        <div key={ev.id} className="py-1 border-b" style={{ borderColor: '#eee' }}>
          <p style={{ ...ldnaLabel, color: LDNA.accent, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
            {ev.type.toUpperCase()} · {ev.title}
          </p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>{ev.detail}</p>
          {ev.metricDelta ? <p style={{ ...ldnaLabel, color: LDNA.green, fontSize: '6px' }}>{ev.metricDelta}</p> : null}
        </div>
      ))}
    </section>
  );
}

export function CrossCompanyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>CROSS-COMPANY LEADERSHIP · PORTFOLIO</p>
      <p style={ldnaLabel}>Founder philosophy consistent · company DNA unique per workspace</p>
      {store.crossCompanyInsights.map((ins) => (
        <div key={ins.id} className="p-2 mb-1 border" style={{ borderColor: ins.appliesToAll ? LDNA.purple : LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.indigo, fontFamily: '"Futura PT Medium"' }}>{ins.workspaceName.toUpperCase()}</p>
          <p style={ldnaLabel}>{ins.insight}</p>
          {ins.appliesToAll ? <p style={{ ...ldnaLabel, fontSize: '6px', color: LDNA.purple }}>APPLIES TO ALL COMPANIES</p> : null}
        </div>
      ))}
    </section>
  );
}

export function LeadershipSimulatorPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>LEADERSHIP SIMULATOR · DECISION PATTERNS</p>
      {store.simulatorScenarios.map((sim) => (
        <div key={sim.id} className="p-2 mb-2 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.purple, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{sim.title.toUpperCase()}</p>
          <p style={ldnaLabel}>SITUATION · {sim.situation}</p>
          <p style={ldnaLabel}>PARALLELS · {sim.historicalParallels.join(' · ')}</p>
          <p style={ldnaLabel}>OUTCOMES · {sim.pastOutcomes.join(' · ')}</p>
          <p style={ldnaLabel}>ALTERNATIVES · {sim.alternativeStrategies.join(' · ')}</p>
          <p style={{ ...ldnaLabel, color: LDNA.green }}>REC · {sim.recommendedApproach}</p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>{sim.confidencePct}% CONFIDENCE</p>
        </div>
      ))}
    </section>
  );
}

export function InstitutionalLeadershipPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>INSTITUTIONAL LEADERSHIP · LESSONS LEARNED</p>
      {store.institutionalLessons.map((l) => (
        <div key={l.id} className="p-2 mb-1 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.indigo, fontFamily: '"Futura PT Medium"' }}>{l.sourceWorkspace.toUpperCase()}</p>
          <p style={ldnaLabel}>{l.lesson}</p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>PATTERN · {l.pattern}</p>
          {l.transferable ? <p style={{ ...ldnaLabel, color: LDNA.green, fontSize: '6px' }}>TRANSFERABLE ACROSS COMPANIES</p> : null}
        </div>
      ))}
    </section>
  );
}

export function KnowledgeGraphPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ldnaPanel}>
      <p style={ldnaSectionTitle}>KNOWLEDGE GRAPH INTEGRATION</p>
      <p style={ldnaLabel}>CONNECTED LAYERS · {LEADERSHIP_DNA_CONNECTED_LAYERS.join(' · ')}</p>
      <p style={{ ...ldnaSectionTitle, marginTop: 8 }}>GRAPH NODES</p>
      {store.knowledgeGraphLinks.map((link) => (
        <p key={link} style={ldnaLabel}>
          · {link}
        </p>
      ))}
    </section>
  );
}

export function ChiefOfStaffIntegrationPanel({ store, evaluateAlignment }: Pick<Props, 'store' | 'evaluateAlignment'>) {
  const sampleChecks = [
    evaluateAlignment({
      title: 'Page 028 thumbnail — stat overlay variant B',
      category: 'creative approval',
      confidencePct: 88,
      evaluatedAgainst: ['Creative DNA', 'Leadership DNA', 'Previous Founder Decisions'],
    }),
    evaluateAlignment({
      title: 'Q3 creator tools subscription — $2,400',
      category: 'financial approval',
      confidencePct: 68,
      evaluatedAgainst: ['Company DNA', 'Memory Bible', 'Leadership DNA'],
    }),
    evaluateAlignment({
      title: 'Page 029 script — habits chapter hook revision',
      category: 'script approval',
      confidencePct: 71,
      evaluatedAgainst: ['Writing Bible', 'Leadership DNA', 'Creative DNA'],
    }),
  ];

  return (
    <section className="p-3 mb-3" style={{ ...ldnaPanel, borderLeft: `4px solid ${LDNA.indigo}` }}>
      <p style={ldnaSectionTitle}>CHIEF OF STAFF INTEGRATION · PRIMARY FRAMEWORK</p>
      <p style={ldnaLabel}>
        Before escalation · CoS evaluates alignment with Leadership DNA · threshold {store.cosAlignmentThresholdPct}%
      </p>
      {sampleChecks.map((check) => (
        <div key={check.itemTitle} className="p-2 mb-1 border" style={{ borderColor: LDNA.panelBorder }}>
          <p style={{ ...ldnaLabel, color: LDNA.accent, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
            {check.itemTitle.toUpperCase()}
          </p>
          <p style={ldnaLabel}>
            ALIGNMENT ·{' '}
            <span style={{ color: confidenceColor(check.alignmentPct) }}>{check.alignmentPct}%</span>
            {' · '}
            <span style={{ color: check.wouldFounderApprove ? LDNA.green : LDNA.red }}>
              {check.wouldFounderApprove ? 'WOULD APPROVE' : 'NEEDS REVIEW'}
            </span>
          </p>
          <p style={{ ...ldnaLabel, color: LDNA.indigo }}>REC · {check.recommendation.replace(/-/g, ' ').toUpperCase()}</p>
          <p style={{ ...ldnaLabel, fontSize: '6px' }}>{check.reasoning}</p>
        </div>
      ))}
      <Link
        to={adminStudioChiefOfStaffPath()}
        style={{ ...ldnaLabel, color: LDNA.purple, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8 }}
      >
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}
