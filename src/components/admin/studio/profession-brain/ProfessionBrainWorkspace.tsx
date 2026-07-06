import { useState } from 'react';
import { useProfessionBrainState } from '../../../../hooks/useProfessionBrainState';
import {
  KNOWLEDGE_DOMAINS,
  LEGACY_MODE_PHILOSOPHY,
  LIVING_BRAIN_PROMPT,
  OWNERSHIP_CAPABILITIES,
  PROFESSION_BRAIN_PHILOSOPHY,
  buildLegacySummary,
  listEvolutionSignals,
} from '../../../../studio-os-core/profession-brain';
import { PROFESSION_BRAIN_LEGACY_FEELING } from '../../../../utils/adminStudioProfessionBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
  ExecutiveVisualSummary,
} from '../executive-ia';

type BrainTab =
  | 'overview'
  | 'brains'
  | 'memory-graph'
  | 'decisions'
  | 'human'
  | 'academy'
  | 'customer'
  | 'ownership'
  | 'legacy';

const TABS: { id: BrainTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'brains', label: 'PROFESSION BRAINS' },
  { id: 'memory-graph', label: 'MEMORY GRAPH' },
  { id: 'decisions', label: 'DECISION INTELLIGENCE' },
  { id: 'human', label: 'HUMAN KNOWLEDGE' },
  { id: 'academy', label: 'ACADEMY FOUNDATION' },
  { id: 'customer', label: 'CUSTOMER EXPERIENCE' },
  { id: 'ownership', label: 'KNOWLEDGE OWNERSHIP' },
  { id: 'legacy', label: 'LEGACY MODE' },
];

export function ProfessionBrainWorkspace() {
  const [tab, setTab] = useState<BrainTab>('overview');
  const [selectedBrainId, setSelectedBrainId] = useState<string | null>(null);
  const [livingPhrase, setLivingPhrase] = useState('');
  const { profile, conciergeBindings, exportSnapshot, recordLivingUpdate, dismissLivingSignal } =
    useProfessionBrainState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROFESSION BRAIN LOADING — INITIALIZING INSTITUTIONAL INTELLIGENCE
      </p>
    );
  }

  const selectedBrain = profile.brains.find((b) => b.id === (selectedBrainId ?? profile.brains[0]?.id));
  const unresolvedLiving = profile.livingSignals.filter((s) => !s.resolved);

  const handleExport = () => {
    const json = exportSnapshot();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(json);
    }
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 91 · PROFESSION BRAIN™"
        title={profile.companyName.toUpperCase()}
        subtitle="Living institutional intelligence — not an AI chatbot"
        progressPct={profile.overallMaturityPct}
        stats={[
          { label: 'BRAINS', value: String(profile.brains.length) },
          { label: 'KNOWLEDGE', value: String(profile.brains.reduce((s, b) => s + b.knowledgeEntries.length, 0)) },
          { label: 'GRAPH EDGES', value: String(profile.memoryGraph.edges.length) },
          { label: 'MATURITY', value: `${profile.overallMaturityPct}%` },
        ]}
      />
      <ExecutiveFocusPanel title="CORE PHILOSOPHY">
        {PROFESSION_BRAIN_PHILOSOPHY.map((line) => (
          <p key={line} className="text-[6px] font-futura normal-case mb-1" style={{ color: '#555', lineHeight: 1.45 }}>
            · {line}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveVisualSummary title="KNOWLEDGE DOMAINS CAPTURED">
        <div className="flex flex-wrap gap-1 mt-2">
          {KNOWLEDGE_DOMAINS.slice(0, 12).map((d) => (
            <span
              key={d}
              className="px-1 py-0.5 text-[5px] font-futura uppercase border"
              style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
            >
              {d}
            </span>
          ))}
        </div>
      </ExecutiveVisualSummary>
      {unresolvedLiving.length > 0 ? (
        <ExecutiveFocusPanel title="LIVING KNOWLEDGE UPDATES">
          {unresolvedLiving.map((s) => (
            <div key={s.id} className="mb-2 flex gap-2">
              <p className="flex-1 text-[6px] font-futura normal-case" style={{ color: '#555' }}>
                "{s.phrase}"
              </p>
              <button
                type="button"
                onClick={() => dismissLivingSignal(s.id)}
                className="px-2 py-1 text-[6px] font-futura uppercase border shrink-0"
                style={{ borderColor: '#0D9488', color: '#0D9488' }}
              >
                UPDATE BRAIN
              </button>
            </div>
          ))}
        </ExecutiveFocusPanel>
      ) : null}
    </ExecutivePageShell>
  );

  const renderBrains = () => (
    <ExecutiveSecondaryGrid>
      {profile.brains.map((brain) => (
        <button
          key={brain.id}
          type="button"
          onClick={() => setSelectedBrainId(brain.id)}
          className="text-left p-2 border"
          style={{
            background: ADMIN_STUDIO_THEME.panelBg,
            borderColor: selectedBrain?.id === brain.id ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
          }}
        >
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            {brain.label}
          </p>
          <p className="text-[6px] font-futura uppercase mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {brain.knowledgeEntries.length} entries · {brain.maturityPct}% maturity
          </p>
        </button>
      ))}
    </ExecutiveSecondaryGrid>
  );

  const renderMemoryGraph = () => (
    <ExecutiveFocusPanel title="ORGANIZATIONAL MEMORY GRAPH">
      <p className="text-[6px] font-futura normal-case mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
        {profile.memoryGraph.nodes.length} nodes · {profile.memoryGraph.edges.length} connections — knowledge never exists in isolation.
      </p>
      {profile.memoryGraph.edges.slice(0, 20).map((edge) => {
        const from = profile.memoryGraph.nodes.find((n) => n.id === edge.fromId);
        const to = profile.memoryGraph.nodes.find((n) => n.id === edge.toId);
        return (
          <p key={edge.id} className="text-[6px] font-futura normal-case mb-1" style={{ color: '#555' }}>
            {from?.label} → {edge.relationship} → {to?.label}
          </p>
        );
      })}
    </ExecutiveFocusPanel>
  );

  const renderDecisions = () => (
    <ExecutiveFocusPanel title="DECISION INTELLIGENCE · PROFESSIONAL JUDGMENT">
      {(selectedBrain?.judgmentPatterns ?? profile.brains.flatMap((b) => b.judgmentPatterns)).map((p) => (
        <div key={p.id} className="mb-3 pb-3 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
            {p.situation}
          </p>
          <p className="text-[6px] font-futura normal-case mt-1" style={{ color: ADMIN_STUDIO_THEME.accent, lineHeight: 1.45 }}>
            {p.professionalResponse}
          </p>
          <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
            Not only: {p.notJustProcedure}
          </p>
        </div>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderHuman = () => (
    <ExecutiveFocusPanel title="HUMAN KNOWLEDGE · AUTO-GENERATED">
      {profile.humanKnowledge.slice(0, 12).map((a) => (
        <ExecutiveSecondaryCard key={a.id} title={`${a.type.replace(/-/g, ' ').toUpperCase()} · ${a.title}`}>
          <p className="text-[6px] font-futura normal-case" style={{ color: '#555', lineHeight: 1.45 }}>
            {a.content.slice(0, 280)}
            {a.content.length > 280 ? '…' : ''}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderAcademy = () => (
    <ExecutiveFocusPanel title="STUDIO INSTITUTE FOUNDATION">
      {profile.academyModules.map((m) => (
        <div key={m.id} className="mb-2 pb-2 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            {m.title}
          </p>
          <p className="text-[6px] font-futura uppercase" style={{ color: '#92704A' }}>
            {m.audiences.join(' · ').toUpperCase()}
          </p>
          <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
            {m.summary}
          </p>
        </div>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderCustomer = () => (
    <ExecutiveFocusPanel title="PUBLIC KNOWLEDGE SURFACES">
      {profile.publicSurfaces.map((s) => (
        <div key={s.id} className="mb-3 pb-3 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: s.enabled ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary }}>
            {s.publicTitle} {s.enabled ? '· PUBLISHED' : '· PRIVATE'}
          </p>
          <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
            {s.description}
          </p>
          <p className="text-[6px] font-futura uppercase mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {s.capabilities.join(' · ')}
          </p>
        </div>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderOwnership = () => (
    <>
      <ExecutiveFocusPanel title="KNOWLEDGE OWNERSHIP · YOUR ORGANIZATION OWNS IT">
        <p className="text-[6px] font-futura normal-case mb-2" style={{ color: '#555', lineHeight: 1.45 }}>
          Studio OS hosts your Profession Brain. Your organization owns, exports, backs up, and protects it.
        </p>
        <ul className="mb-3">
          {OWNERSHIP_CAPABILITIES.map((c) => (
            <li key={c} className="text-[6px] font-futura normal-case mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {c}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleExport}
          className="w-full py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, borderColor: '#92704A', color: '#92704A' }}
        >
          EXPORT PROFESSION BRAIN SNAPSHOT
        </button>
        {profile.ownership.exportedAt ? (
          <p className="text-[6px] font-futura uppercase mt-2" style={{ color: '#0D9488' }}>
            Last export · {new Date(profile.ownership.exportedAt).toLocaleString()}
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <ExecutiveCollapsibleSection title="CONCIERGE INTELLIGENCE BINDINGS" defaultOpen>
        {conciergeBindings.map((b) => (
          <p key={b.conciergeId} className="text-[6px] font-futura normal-case mb-2" style={{ color: '#555', lineHeight: 1.45 }}>
            <span style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>{b.conciergeId.replace(/-/g, ' ').toUpperCase()}</span>
            {' · '}
            {b.voiceNote}
          </p>
        ))}
      </ExecutiveCollapsibleSection>
    </>
  );

  const renderLegacy = () => (
    <>
      <ExecutiveHeroCard
        eyebrow="LEGACY MODE"
        title="INSTITUTIONAL MEMORY ACROSS GENERATIONS"
        subtitle={buildLegacySummary(profile)}
      />
      <ExecutiveFocusPanel title="EVOLUTION">
        {LEGACY_MODE_PHILOSOPHY.map((line) => (
          <p key={line} className="text-[6px] font-futura normal-case mb-1" style={{ color: '#555', lineHeight: 1.45 }}>
            · {line}
          </p>
        ))}
        {listEvolutionSignals(profile).map((s) => (
          <p key={s} className="text-[6px] font-futura normal-case mb-1 mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {s}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="LIVING KNOWLEDGE">
        <p className="text-[6px] font-futura normal-case mb-2" style={{ color: '#555' }}>
          {LIVING_BRAIN_PROMPT}
        </p>
        <textarea
          value={livingPhrase}
          onChange={(e) => setLivingPhrase(e.target.value)}
          placeholder="We changed how we handle receipts…"
          rows={2}
          className="w-full p-2 mb-2 text-[7px] font-futura border normal-case"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button
          type="button"
          onClick={() => {
            if (!livingPhrase.trim()) return;
            recordLivingUpdate(livingPhrase.trim(), selectedBrain?.id);
            setLivingPhrase('');
          }}
          className="w-full py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, borderColor: '#0D9488', color: '#0D9488' }}
        >
          STRENGTHEN PROFESSION BRAIN
        </button>
        <p className="text-[6px] font-futura normal-case mt-3 italic" style={{ color: '#92704A' }}>
          "{PROFESSION_BRAIN_LEGACY_FEELING}"
        </p>
      </ExecutiveFocusPanel>
    </>
  );

  return (
    <div className="profession-brain-root">
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(13,148,136,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'brains' && renderBrains()}
      {tab === 'memory-graph' && renderMemoryGraph()}
      {tab === 'decisions' && renderDecisions()}
      {tab === 'human' && renderHuman()}
      {tab === 'academy' && renderAcademy()}
      {tab === 'customer' && renderCustomer()}
      {tab === 'ownership' && renderOwnership()}
      {tab === 'legacy' && renderLegacy()}
    </div>
  );
}
