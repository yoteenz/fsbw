import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudioIntelligenceArchitectureState } from '../../../../hooks/useStudioIntelligenceArchitectureState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  CONTEXT_ENGINE_SOURCE_LABELS,
  INTELLIGENCE_LAYER_STEP_LABELS,
  INTELLIGENCE_STACK_LABELS,
  KNOWLEDGE_FABRIC_NODE_LABELS,
  MODEL_GATEWAY_PROVIDER_LABELS,
  STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT,
  STUDIO_INTELLIGENCE_PHILOSOPHY,
} from '../../../../studio-os-core/studio-intelligence-architecture';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type ArchitectureTab = 'overview' | 'fabric' | 'context' | 'layer' | 'gateway';

const TABS: { id: ArchitectureTab; label: string }[] = [
  { id: 'overview', label: 'ARCHITECTURE OVERVIEW' },
  { id: 'fabric', label: 'KNOWLEDGE FABRIC™' },
  { id: 'context', label: 'CONTEXT ENGINE' },
  { id: 'layer', label: 'INTELLIGENCE LAYER' },
  { id: 'gateway', label: 'MODEL GATEWAY' },
];

export function StudioIntelligenceArchitectureWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ArchitectureTab>('overview');
  const { profile, refresh } = useStudioIntelligenceArchitectureState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        STUDIO INTELLIGENCE™ ARCHITECTURE LOADING — MODEL-AGNOSTIC · ORG OWNS KNOWLEDGE
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 122 · STUDIO INTELLIGENCE™ ARCHITECTURE V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="The model is not the intelligence — the organization is the intelligence. Studio OS owns knowledge; models help reason."
        progressPct={profile.architectureScore}
        stats={[
          { label: 'ARCHITECTURE', value: `${profile.architectureScore}%` },
          { label: 'FABRIC NODES', value: `${profile.knowledgeFabricNodes}` },
          { label: 'CONTEXT', value: `${profile.contextSourcesReady}` },
          { label: 'PIPELINE', value: `${profile.pipelineHealthPct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing
          value={profile.pipelineHealthPct}
          size={56}
          label="PIPELINE"
          accent={STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT}
        />
        <div>
          {STUDIO_INTELLIGENCE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="KNOWLEDGE VS REASONING">
        <p className="text-[6px] font-futura" style={{ color: STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.knowledgeVsReasoningLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="COMMAND DOCK · ARCHITECTURE STATUS">
        <p className="text-[6px] font-futura" style={{ color: STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockArchitectureLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="INTELLIGENCE STACK · 10 UNIFIED SYSTEMS">
        {profile.intelligenceStack.map((s) => (
          <p key={s.systemId} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {INTELLIGENCE_STACK_LABELS[s.systemId]}:{' '}
            <span style={{ color: s.connected ? STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              {s.connected ? `${s.vitalityPct}%` : 'connecting…'}
            </span>{' '}
            — {s.insight.slice(0, 70)}…
          </p>
        ))}
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT, color: STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH ARCHITECTURE
      </button>
    </ExecutivePageShell>
  );

  const renderFabric = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="KNOWLEDGE FABRIC™ · INTERCONNECTED ORGANIZATIONAL INTELLIGENCE">
        <ExecutiveSecondaryCard title={`${profile.knowledgeFabricNodes} NODES · ${profile.knowledgeFabricEdges.length} CONNECTIONS`}>
          <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Internally a knowledge graph · externally Knowledge Fabric™ — people, documents, brains, genomes, memory, and more.
          </p>
        </ExecutiveSecondaryCard>
        {profile.knowledgeFabricNodesList.slice(0, 12).map((n) => (
          <ExecutiveSecondaryCard key={n.id} title={`${n.typeLabel.toUpperCase()} · ${n.trustPct}% TRUST`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT, fontWeight: 515 }}>
              {n.label}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {n.summary} · {n.connectionCount} connections · via {n.sourceSystem}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="NODE CATEGORIES">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(KNOWLEDGE_FABRIC_NODE_LABELS).map(([key, label]) => (
              <p key={key} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {label}
              </p>
            ))}
          </div>
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderContext = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTEXT ENGINE · TRUSTED CONTEXT BEFORE ANY AI RESPONSE">
        {profile.contextBundle.map((c) => (
          <ExecutiveSecondaryCard key={c.source} title={CONTEXT_ENGINE_SOURCE_LABELS[c.source].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT, fontWeight: 515 }}>
              {c.relevancePct}% relevance · {c.trustPct}% trust · {c.included ? 'INCLUDED' : 'EXCLUDED'}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderLayer = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE LAYER · NO FEATURE CALLS THIRD-PARTY AI DIRECTLY">
        {profile.pipelineSteps.map((s) => (
          <ExecutiveSecondaryCard key={s.step} title={`${INTELLIGENCE_LAYER_STEP_LABELS[s.step].toUpperCase()} · ${s.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {s.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGateway = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MODEL GATEWAY · MODEL-AGNOSTIC REASONING ENGINES">
        <ExecutiveSecondaryCard title="STUDIO OS USES MODELS · STUDIO OS IS NOT DEFINED BY MODELS">
          <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            All AI requests pass through Studio Intelligence™. Direct vendor calls from features are blocked.
          </p>
        </ExecutiveSecondaryCard>
        {profile.modelGatewayRoutes.map((r) => (
          <ExecutiveSecondaryCard key={r.provider} title={MODEL_GATEWAY_PROVIDER_LABELS[r.provider].toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: r.active ? STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              Role: {r.role} · {r.active ? 'ACTIVE ROUTE' : 'STANDBY'} · model-agnostic
            </p>
          </ExecutiveSecondaryCard>
        ))}
        {profile.recentRequests.slice(0, 3).map((req) => (
          <ExecutiveSecondaryCard key={req.id} title="RECENT GATEWAY REQUEST · VALIDATED">
            <p className="text-[6px] font-futura mb-1" style={{ color: STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT, fontWeight: 515 }}>
              {req.query}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Org knows first: {req.organizationKnowsFirst.slice(0, 100)}…
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {req.modelReasoningSecond} · {req.contextSourcesUsed} sources · {req.pipelineStepsComplete} pipeline steps
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="studio-intelligence-architecture" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'fabric' && renderFabric()}
      {tab === 'context' && renderContext()}
      {tab === 'layer' && renderLayer()}
      {tab === 'gateway' && renderGateway()}
    </div>
  );
}
