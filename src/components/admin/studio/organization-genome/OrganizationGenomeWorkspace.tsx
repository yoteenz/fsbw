import { useState } from 'react';
import { useOrganizationGenomeState } from '../../../../hooks/useOrganizationGenomeState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  AI_CONSULTATION_CONTEXTS,
  GENOME_COMMUNICATION_STYLES,
  ORGANIZATION_GENOME_PHILOSOPHY,
  consultOrganizationGenome,
} from '../../../../studio-os-core/organization-genome';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type GenomeTab = 'overview' | 'identity' | 'voice' | 'decisions' | 'customer' | 'consultation';

const TABS: { id: GenomeTab; label: string }[] = [
  { id: 'overview', label: 'GENOME OVERVIEW' },
  { id: 'identity', label: 'IDENTITY CORE' },
  { id: 'voice', label: 'BRAND VOICE' },
  { id: 'decisions', label: 'DECISION DNA' },
  { id: 'customer', label: 'CUSTOMER STANDARDS' },
  { id: 'consultation', label: 'AI CONSULTATION' },
];

export function OrganizationGenomeWorkspace() {
  const [tab, setTab] = useState<GenomeTab>('overview');
  const { profile, refresh } = useOrganizationGenomeState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATION GENOME™ LOADING — SYNCING FROM BLUEPRINT & CHARTER
      </p>
    );
  }

  const sampleConsultation = consultOrganizationGenome(profile, 'concierge-response');

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 95 · ORGANIZATION GENOME™"
        title={profile.companyName.toUpperCase()}
        subtitle="Profession Brain™ preserves expertise. Organization Genome™ preserves identity."
        progressPct={profile.genomeCompletenessPct}
        stats={[
          { label: 'COMPLETENESS', value: `${profile.genomeCompletenessPct}%` },
          { label: 'LAYERS', value: String(profile.identityLayers.length) },
          { label: 'AI RULES', value: String(profile.aiConsultationRules.length) },
          { label: 'STYLE', value: profile.brandVoice.communicationStyle.toUpperCase() },
        ]}
      />
      {ORGANIZATION_GENOME_PHILOSOPHY.slice(1, 3).map((line) => (
        <ExecutiveSecondaryCard key={line} title="PHILOSOPHY">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {line}
          </p>
        </ExecutiveSecondaryCard>
      ))}
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.accent, color: ADMIN_STUDIO_THEME.accent }}
      >
        SYNC FROM BLUEPRINT
      </button>
    </ExecutivePageShell>
  );

  const renderIdentity = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MISSION">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.identityCore.mission}
        </p>
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="VISION">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.identityCore.vision}
        </p>
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="CORE VALUES">
        {profile.identityCore.coreValues.map((v) => (
          <p key={v} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {v}
          </p>
        ))}
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="LONG-TERM OBJECTIVES">
        {profile.identityCore.longTermObjectives.map((o) => (
          <p key={o} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {o}
          </p>
        ))}
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderVoice = () => (
    <ExecutivePageShell>
      <ExecutiveSecondaryCard title="BRAND PERSONALITY">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.brandVoice.brandPersonality}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="TONE OF VOICE">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.brandVoice.toneOfVoice}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="COMMUNICATION STYLE">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Active: {profile.brandVoice.communicationStyle} · Available: {GENOME_COMMUNICATION_STYLES.join(' · ')}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Design philosophy: {profile.brandVoice.designPhilosophy}
        </p>
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="BRAND VOCABULARY">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.brandVoice.brandVocabulary.join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="INTERNAL TERMINOLOGY">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.brandVoice.internalTerminology.join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderDecisions = () => (
    <ExecutivePageShell>
      <ExecutiveSecondaryCard title="LEADERSHIP PHILOSOPHY">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.decisionDna.leadershipPhilosophy}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="DECISION PRINCIPLES">
        {profile.decisionDna.decisionPrinciples.map((p) => (
          <p key={p} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {p}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="APPROVAL PREFERENCES">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.decisionDna.approvalPreferences} — {profile.decisionDna.approvalNotes}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="RISK TOLERANCE">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.decisionDna.riskTolerance} — {profile.decisionDna.riskNotes}
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderCustomer = () => (
    <ExecutivePageShell>
      <ExecutiveSecondaryCard title="SERVICE PROMISE">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.customerStandards.servicePromise}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="EXPERIENCE STANDARDS">
        {profile.customerStandards.experienceStandards.map((s) => (
          <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {s}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="ESCALATION TONE">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.customerStandards.escalationTone}
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderConsultation = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EVERY AI INTERACTION CONSULTS THE GENOME FIRST">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Contexts: {AI_CONSULTATION_CONTEXTS.join(' · ')}
        </p>
        <p className="text-[6px] font-futura mb-2" style={{ color: '#92704A' }}>
          Sample concierge consultation: {sampleConsultation.toneGuidance}
        </p>
        {sampleConsultation.constraints.slice(0, 4).map((c) => (
          <p key={c} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {c}
          </p>
        ))}
      </ExecutiveFocusPanel>
      {profile.aiConsultationRules.slice(0, 4).map((rule) => (
        <ExecutiveSecondaryCard key={rule.context} title={rule.context.toUpperCase()}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {rule.sampleGuidance}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'identity':
        return renderIdentity();
      case 'voice':
        return renderVoice();
      case 'decisions':
        return renderDecisions();
      case 'customer':
        return renderCustomer();
      case 'consultation':
        return renderConsultation();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="organization-genome" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(146,112,74,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
