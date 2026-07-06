import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudioFoundationModelsState } from '../../../../hooks/useStudioFoundationModelsState';
import {
  ENTERPRISE_DEPLOYMENT_LABELS,
  FOUNDATION_MODEL_CAPABILITY_LABELS,
  HYBRID_LAYER_LABELS,
  MOAT_SOURCE_LABELS,
  PROFESSION_MODEL_LABELS,
  ROADMAP_PHASE_LABELS,
  STUDIO_FOUNDATION_MODELS_ACCENT,
  STUDIO_MODELS_PHILOSOPHY,
  TRAINING_SOURCE_LABELS,
} from '../../../../studio-os-core/studio-foundation-models';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type FoundationTab = 'overview' | 'roadmap' | 'profession' | 'training' | 'hybrid' | 'enterprise' | 'moat';

const TABS: { id: FoundationTab; label: string }[] = [
  { id: 'overview', label: 'FOUNDATION OVERVIEW' },
  { id: 'roadmap', label: 'LONG-TERM ROADMAP' },
  { id: 'profession', label: 'PROFESSION MODELS™' },
  { id: 'training', label: 'TRAINING SOURCES' },
  { id: 'hybrid', label: 'HYBRID INTELLIGENCE' },
  { id: 'enterprise', label: 'ENTERPRISE DEPLOYMENT' },
  { id: 'moat', label: 'STUDIO MOAT' },
];

export function StudioFoundationModelsWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FoundationTab>('overview');
  const { profile, refresh } = useStudioFoundationModelsState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        STUDIO FOUNDATION MODELS™ LOADING — GENERAL MODELS KNOW THE WORLD · STUDIO MODELS™ KNOW ORGANIZATIONS
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 124 · STUDIO FOUNDATION MODELS™ & PROFESSION MODELS™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Long-term Studio-owned intelligence roadmap — model-agnostic now, model-independent where possible."
        progressPct={profile.foundationScore}
        stats={[
          { label: 'FOUNDATION', value: `${profile.foundationScore}%` },
          { label: 'PHASE', value: ROADMAP_PHASE_LABELS[profile.currentRoadmapPhase].split(' ')[0].toUpperCase() },
          { label: 'PROFESSION', value: `${profile.professionModels.length}` },
          { label: 'HYBRID', value: `${profile.hybridLayers.filter((l) => l.active).length}/${profile.hybridLayers.length}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.foundationScore} size={56} label="SFM" accent={STUDIO_FOUNDATION_MODELS_ACCENT} />
        <div>
          {STUDIO_MODELS_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · STUDIO MODELS STATUS">
        <p className="text-[6px] font-futura" style={{ color: STUDIO_FOUNDATION_MODELS_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockFoundationModelsLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="HYBRID INTELLIGENCE">
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          {profile.hybridIntelligenceLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="LONG-TERM MOAT">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          {profile.moatLine}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: STUDIO_FOUNDATION_MODELS_ACCENT, color: STUDIO_FOUNDATION_MODELS_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH FOUNDATION MODELS
      </button>
    </ExecutivePageShell>
  );

  const renderRoadmap = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="LONG-TERM ROADMAP · MODEL-AGNOSTIC → MODEL-RESILIENT → MODEL-INDEPENDENT → STUDIO-OWNED">
        {profile.roadmapPhases.map((phase) => (
          <ExecutiveSecondaryCard key={phase.phase} title={`${phase.label.toUpperCase()} · ${phase.progressPct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STUDIO_FOUNDATION_MODELS_ACCENT, fontWeight: 515 }}>
              Status: {phase.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {phase.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderProfession = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROFESSION MODELS™ · SPECIALIZED REASONING LAYERS — NOT GENERIC CHATBOTS">
        {profile.professionModels.map((model) => (
          <ExecutiveSecondaryCard key={model.id} title={`${model.label.toUpperCase()} · ${model.readinessPct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STUDIO_FOUNDATION_MODELS_ACCENT, fontWeight: 515 }}>
              {model.reasoningFocus}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {model.industryFit} · Brain: {model.professionBrainLinked ? 'linked' : 'pending'} · Trust: {model.trustFrameworkLinked ? 'linked' : 'pending'}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTraining = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="TRAINING SOURCES · NEVER TRAIN ON PRIVATE ORG DATA WITHOUT EXPLICIT CONSENT">
        {profile.trainingSources.map((source) => (
          <ExecutiveSecondaryCard key={source.source} title={TRAINING_SOURCE_LABELS[source.source].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: source.approved ? STUDIO_FOUNDATION_MODELS_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {source.approved ? 'APPROVED' : 'PENDING'} {source.consentRequired ? '· CONSENT REQUIRED' : ''}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {source.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHybrid = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="HYBRID INTELLIGENCE · LAYERED REASONING WITH EXTERNAL MODELS">
        {profile.hybridLayers.map((layer) => (
          <ExecutiveSecondaryCard key={layer.layer} title={HYBRID_LAYER_LABELS[layer.layer].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: layer.active ? STUDIO_FOUNDATION_MODELS_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {layer.active ? 'ACTIVE' : 'STANDBY'} · {layer.role}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {layer.example}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        {profile.recentHybridRequests.map((req) => (
          <ExecutiveSecondaryCard key={req.id} title={`DEMO · ${PROFESSION_MODEL_LABELS[req.professionModelId].toUpperCase()}`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {req.workflow}: {req.studioModelRole} · {req.externalModelRole}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderEnterprise = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ENTERPRISE + PRIVATE DEPLOYMENT · REGULATED · OFFLINE · CUSTOMER-OWNED">
        {profile.enterpriseDeployments.map((dep) => (
          <ExecutiveSecondaryCard key={dep.mode} title={ENTERPRISE_DEPLOYMENT_LABELS[dep.mode].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: dep.available ? STUDIO_FOUNDATION_MODELS_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {dep.available ? 'AVAILABLE' : 'PLANNED'} {dep.regulatedIndustryReady ? '· REGULATED READY' : ''}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {dep.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderMoat = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="LONG-TERM MOAT · ORGANIZATIONAL EXPERTISE COMPOUNDS STUDIO INTELLIGENCE™">
        {profile.moatSources.map((source) => (
          <ExecutiveSecondaryCard key={source.source} title={`${MOAT_SOURCE_LABELS[source.source].toUpperCase()} · ${source.contributionPct}%`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {source.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="FOUNDATION MODEL CAPABILITIES">
          {profile.foundationCapabilities.map((cap) => (
            <p key={cap.capability} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {FOUNDATION_MODEL_CAPABILITY_LABELS[cap.capability]} — {cap.readinessPct}% {cap.studioOwned ? '· STUDIO-OWNED PATH' : ''}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="studio-foundation-models" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? STUDIO_FOUNDATION_MODELS_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? STUDIO_FOUNDATION_MODELS_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'roadmap' && renderRoadmap()}
      {tab === 'profession' && renderProfession()}
      {tab === 'training' && renderTraining()}
      {tab === 'hybrid' && renderHybrid()}
      {tab === 'enterprise' && renderEnterprise()}
      {tab === 'moat' && renderMoat()}
    </div>
  );
}
