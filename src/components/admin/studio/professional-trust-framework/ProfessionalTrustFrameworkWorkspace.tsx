import { useState } from 'react';
import { useProfessionalTrustState } from '../../../../hooks/useProfessionalTrustState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  CONCIERGE_TRUST_BEHAVIORS,
  ESCALATION_ACTIONS,
  PROFESSIONAL_TRUST_PHILOSOPHY,
  REGULATED_PROFESSIONS,
} from '../../../../studio-os-core/professional-trust-framework';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type TrustTab = 'overview' | 'scope' | 'confidence' | 'guidance' | 'regulated' | 'escalation';

const TABS: { id: TrustTab; label: string }[] = [
  { id: 'overview', label: 'TRUST OVERVIEW' },
  { id: 'scope', label: 'PROFESSIONAL SCOPE' },
  { id: 'confidence', label: 'CONFIDENCE SYSTEM' },
  { id: 'guidance', label: 'NATURAL GUIDANCE' },
  { id: 'regulated', label: 'REGULATED INDUSTRIES' },
  { id: 'escalation', label: 'ESCALATION' },
];

export function ProfessionalTrustFrameworkWorkspace() {
  const [tab, setTab] = useState<TrustTab>('overview');
  const { profile, refresh } = useProfessionalTrustState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROFESSIONAL TRUST FRAMEWORK LOADING — SYNCING FROM PROFESSION BRAIN™
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 94 · PROFESSIONAL TRUST FRAMEWORK™"
        title={profile.companyName.toUpperCase()}
        subtitle="Trust is one of Studio OS's greatest assets — built through responsible guidance."
        progressPct={profile.overallTrustScore}
        stats={[
          { label: 'BRAINS', value: String(profile.brainDeclarations.length) },
          { label: 'TRUST SCORE', value: `${profile.overallTrustScore}%` },
          { label: 'REGULATED', value: String(profile.regulatedRules.length) },
          { label: 'ESCALATIONS', value: String(profile.escalationPlaybook.length) },
        ]}
      />
      {PROFESSIONAL_TRUST_PHILOSOPHY.slice(1, 3).map((line) => (
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
        SYNC FROM PROFESSION BRAIN
      </button>
    </ExecutivePageShell>
  );

  const renderScope = () => (
    <ExecutivePageShell>
      {profile.brainDeclarations.map((d) => (
        <ExecutiveFocusPanel key={d.brainId} title={d.brainLabel.toUpperCase()}>
          <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: '#92704A' }}>
            CAN DO
          </p>
          {d.scope.canDo.map((item) => (
            <p key={item} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {item}
            </p>
          ))}
          <p className="text-[6px] font-futura uppercase mb-1 mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            CANNOT DO
          </p>
          {d.scope.cannotDo.map((item) => (
            <p key={item} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {item}
            </p>
          ))}
          <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Review recommended: {d.scope.reviewRecommended.join(' · ')} · Required: {d.scope.reviewRequired.join(' · ')}
          </p>
        </ExecutiveFocusPanel>
      ))}
    </ExecutivePageShell>
  );

  const renderConfidence = () => (
    <ExecutivePageShell>
      {profile.brainDeclarations.map((d) => (
        <ExecutiveSecondaryCard key={d.brainId} title={d.brainLabel}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Knowledge Coverage {d.confidence.knowledgeCoveragePct}% · Confidence {d.confidence.confidenceLevel.toUpperCase()} ·
            Review {d.confidence.professionalReviewStatus.replace(/-/g, ' ').toUpperCase()}
            {d.confidence.regulatedProfession ? ` · ${d.confidence.regulatedProfession}` : ''}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderGuidance = () => (
    <ExecutiveFocusPanel title="NATURAL PROFESSIONAL GUIDANCE · NO FEAR BANNERS">
      <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
        Concierge behaviors: {CONCIERGE_TRUST_BEHAVIORS.join(' · ')}
      </p>
      {profile.brainDeclarations.flatMap((d) => d.guidanceSamples).map((g) => (
        <div key={g.id} className="mb-3 pb-3 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
            {g.context}
          </p>
          <p className="text-[6px] font-futura normal-case mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
            "{g.message}"
          </p>
        </div>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderRegulated = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="REGULATED PROFESSIONS">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {REGULATED_PROFESSIONS.join(' · ')}
        </p>
      </ExecutiveFocusPanel>
      {profile.regulatedRules.map((rule) => (
        <ExecutiveSecondaryCard key={`${rule.profession}-${rule.industryId}`} title={rule.profession.toUpperCase()}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {rule.additionalRequirements.join(' · ')}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderEscalation = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="COMMAND DOCK ESCALATION · BEYOND SCOPE">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Actions: {ESCALATION_ACTIONS.join(' · ')}
        </p>
      </ExecutiveFocusPanel>
      {profile.escalationPlaybook.map((e) => (
        <ExecutiveSecondaryCard key={e.id} title={e.label}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {e.reason}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'scope':
        return renderScope();
      case 'confidence':
        return renderConfidence();
      case 'guidance':
        return renderGuidance();
      case 'regulated':
        return renderRegulated();
      case 'escalation':
        return renderEscalation();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="professional-trust-framework" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(235,28,36,0.04)' : 'white',
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
