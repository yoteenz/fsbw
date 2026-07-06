import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationInaugurationState } from '../../../../hooks/useOrganizationInaugurationState';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  CEREMONIAL_LINES,
  ENTER_HEADQUARTERS_LABEL,
  INAUGURATION_PHASE_ORDER,
} from '../../../../studio-os-core/organization-inauguration';
import { resolveOrganizationMissionControlPath } from '../../../../studio-os-core/workspace/routes';
import { INAUGURATION_CLOSING_FEELING } from '../../../../utils/adminStudioOrganizationInaugurationDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
} from '../executive-ia';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

const PHASE_LABELS: Record<(typeof INAUGURATION_PHASE_ORDER)[number], string> = {
  ceremony: 'INAUGURATION',
  activation: 'HEADQUARTERS ACTIVATION',
  charter: 'ORGANIZATION CHARTER',
  'founder-message': 'FOUNDER WELCOME',
  walkthrough: 'HEADQUARTERS TOUR',
  recommendations: 'FIRST RECOMMENDATIONS',
  timeline: 'FOUNDING TIMELINE',
  legacy: 'ORGANIZATIONAL LEGACY',
  final: 'YOUR HEADQUARTERS AWAITS',
};

function phaseAdvanceLabel(phase: (typeof INAUGURATION_PHASE_ORDER)[number]): string {
  switch (phase) {
    case 'ceremony':
      return 'WITNESS HEADQUARTERS ACTIVATION';
    case 'activation':
      return 'VIEW ORGANIZATION CHARTER';
    case 'charter':
      return 'READ FOUNDER WELCOME';
    case 'founder-message':
      return 'BEGIN HEADQUARTERS TOUR';
    case 'walkthrough':
      return 'REVIEW RECOMMENDATIONS';
    case 'recommendations':
      return 'VIEW FOUNDING TIMELINE';
    case 'timeline':
      return 'PRESERVE ORGANIZATIONAL LEGACY';
    case 'legacy':
      return 'PREPARE TO ENTER HEADQUARTERS';
    default:
      return ENTER_HEADQUARTERS_LABEL;
  }
}

export function OrganizationInaugurationWorkspace() {
  const navigate = useNavigate();
  const { workspaceId } = useWorkspace();
  const [lineIndex, setLineIndex] = useState(0);
  const [activating, setActivating] = useState(false);

  const {
    profile,
    ceremonyState,
    readyForInauguration,
    advancePhase,
    powerOnStep,
    nextWalkthroughStop,
    enterHeadquarters,
  } = useOrganizationInaugurationState();

  useEffect(() => {
    if (!profile || profile.currentPhase !== 'ceremony') return;
    const timer = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % CEREMONIAL_LINES.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [profile]);

  useEffect(() => {
    if (!profile || profile.currentPhase !== 'activation' || activating) return;
    if (profile.activationSteps.every((s) => s.completed)) return;

    setActivating(true);
    let step = 0;
    const timer = window.setInterval(() => {
      powerOnStep();
      step += 1;
      if (step >= profile.activationSteps.length) {
        window.clearInterval(timer);
        setActivating(false);
      }
    }, 700);
    return () => window.clearInterval(timer);
  }, [profile?.currentPhase, profile?.organizationId]);

  if (!readyForInauguration || !profile || !ceremonyState) {
    return (
      <ExecutiveFocusPanel title="INAUGURATION PENDING">
        <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Complete the Business Discovery Blueprint™ to unlock the Founder Ceremony. Every chapter must be documented before Headquarters can be inaugurated.
        </p>
      </ExecutiveFocusPanel>
    );
  }

  const phase = profile.currentPhase;
  const walkthroughStop = profile.walkthroughStops[profile.walkthroughIndex];
  const missionControlPath = resolveOrganizationMissionControlPath(workspaceId);

  const handlePrimaryAction = () => {
    if (phase === 'final') {
      enterHeadquarters();
      navigate(missionControlPath);
      return;
    }
    if (phase === 'walkthrough' && profile.walkthroughIndex < profile.walkthroughStops.length - 1) {
      nextWalkthroughStop();
      return;
    }
    advancePhase();
  };

  const primaryLabel =
    phase === 'final'
      ? ENTER_HEADQUARTERS_LABEL
      : phase === 'walkthrough' && profile.walkthroughIndex < profile.walkthroughStops.length - 1
        ? 'NEXT STOP ON TOUR'
        : phaseAdvanceLabel(phase);

  const renderPhaseContent = () => {
    switch (phase) {
      case 'ceremony':
        return (
          <ExecutiveFocusPanel title="INAUGURATION CEREMONY">
            {CEREMONIAL_LINES.map((line, i) => (
              <p
                key={line}
                className="text-[7px] font-futura normal-case mb-2 transition-opacity duration-700"
                style={{
                  color: i === lineIndex ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  lineHeight: 1.5,
                  fontWeight: i === lineIndex ? 515 : 400,
                  opacity: i === lineIndex ? 1 : 0.45,
                }}
              >
                {line}
              </p>
            ))}
          </ExecutiveFocusPanel>
        );

      case 'activation':
        return (
          <ExecutiveFocusPanel title="HEADQUARTERS ACTIVATION">
            <div
              className="mb-3 h-2 w-full overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.06)', border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}` }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${ceremonyState.activationProgressPct}%`,
                  background: 'linear-gradient(90deg, #92704A 0%, #0D9488 100%)',
                }}
              />
            </div>
            {profile.activationSteps.map((step) => (
              <div key={step.id} className="mb-2 flex gap-2 items-start">
                <span
                  className="text-[8px] shrink-0"
                  style={{ color: step.completed ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary }}
                >
                  {step.completed ? '◆' : '◇'}
                </span>
                <div>
                  <p
                    className="text-[6px] font-futura uppercase"
                    style={{ fontWeight: 515, color: step.completed ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary }}
                  >
                    {step.label}
                  </p>
                  <p className="text-[6px] font-futura normal-case" style={{ color: '#555', lineHeight: 1.4 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </ExecutiveFocusPanel>
        );

      case 'charter':
        return (
          <ExecutiveFocusPanel title="ORGANIZATION CHARTER · FOUNDING DOCUMENT">
            <ExecutiveSecondaryGrid>
              {[
                ['ORGANIZATION', profile.charter.organizationName],
                ['FOUNDER', profile.charter.founder],
                ['ESTABLISHED', profile.charter.dateEstablished],
                ['MISSION', profile.charter.mission],
                ['VISION', profile.charter.vision],
                ['CORE VALUES', profile.charter.coreValues],
                ['CORE SERVICES', profile.charter.coreServices.join(' · ')],
                ['DEPARTMENTS', profile.charter.primaryDepartments.join(' · ') || 'Awakening with Headquarters'],
                ['GROWTH', profile.charter.growthObjectives],
                ['DIGITAL WORKFORCE', profile.charter.digitalWorkforceSummary],
              ].map(([label, value]) => (
                <ExecutiveSecondaryCard key={label} title={label}>
                  <p className="text-[6px] font-futura normal-case" style={{ color: '#555', lineHeight: 1.45 }}>
                    {value}
                  </p>
                </ExecutiveSecondaryCard>
              ))}
            </ExecutiveSecondaryGrid>
            <p className="text-[6px] font-futura uppercase mt-2" style={{ color: '#92704A', fontWeight: 515 }}>
              PERMANENT FOUNDING DOCUMENT · ACCESSIBLE FROM HEADQUARTERS
            </p>
          </ExecutiveFocusPanel>
        );

      case 'founder-message':
        return (
          <ExecutiveFocusPanel title="PERSONALIZED FOUNDER WELCOME">
            {profile.founderWelcome.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-[6px] font-futura normal-case mb-2"
                style={{ color: i === 0 ? ADMIN_STUDIO_THEME.accent : '#555', lineHeight: 1.55, fontWeight: i === 0 ? 515 : 400 }}
              >
                {p}
              </p>
            ))}
            <p className="text-[6px] font-futura normal-case mt-3 pt-2 border-t" style={{ color: '#92704A', lineHeight: 1.5, borderColor: '#eee' }}>
              {profile.founderWelcome.closingLine}
            </p>
          </ExecutiveFocusPanel>
        );

      case 'walkthrough':
        return (
          <ExecutiveFocusPanel title="GUIDED EXECUTIVE TOUR">
            <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              STOP {profile.walkthroughIndex + 1} OF {profile.walkthroughStops.length}
            </p>
            <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              {walkthroughStop.title}
            </p>
            <p className="text-[6px] font-futura normal-case" style={{ color: '#555', lineHeight: 1.5 }}>
              {walkthroughStop.purpose}
            </p>
          </ExecutiveFocusPanel>
        );

      case 'recommendations':
        return (
          <ExecutiveFocusPanel title="FIRST RECOMMENDATIONS · UNIQUE TO YOUR ORGANIZATION">
            {profile.recommendations.map((rec) => (
              <div key={rec.id} className="mb-3 pb-3 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
                <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
                  {rec.category.replace(/-/g, ' ')}
                </p>
                <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {rec.headline}
                </p>
                <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
                  {rec.detail}
                </p>
              </div>
            ))}
          </ExecutiveFocusPanel>
        );

      case 'timeline':
        return (
          <ExecutiveFocusPanel title="FOUNDING TIMELINE · PERMANENT HISTORY">
            {profile.foundingTimeline.map((m) => (
              <div key={m.id} className="mb-2 pl-3 border-l-2" style={{ borderColor: '#92704A' }}>
                <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {m.label}
                </p>
                <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {new Date(m.occurredAt).toLocaleString()}
                </p>
              </div>
            ))}
            <p className="text-[6px] font-futura normal-case mt-2" style={{ color: '#555', lineHeight: 1.45 }}>
              Future milestones will build on this history forever.
            </p>
          </ExecutiveFocusPanel>
        );

      case 'legacy':
        return (
          <ExecutiveFocusPanel title="ORGANIZATIONAL LEGACY">
            <p className="text-[6px] font-futura normal-case mb-2" style={{ color: '#555', lineHeight: 1.5 }}>
              Your founding Business Discovery Blueprint™ is preserved permanently. Living discovery expands your organizational memory — it never overwrites the original founding Blueprint.
            </p>
            <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: '#92704A' }}>
              FOUNDING SNAPSHOT · {profile.foundingBlueprintSnapshot.preservedAt.slice(0, 10)}
            </p>
            <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {profile.foundingBlueprintSnapshot.blueprint.responses.length} answers ·{' '}
              {profile.foundingBlueprintSnapshot.blueprint.serviceSessions.filter((s) => s.status === 'complete').length}{' '}
              services documented · preserved for generations.
            </p>
          </ExecutiveFocusPanel>
        );

      case 'final':
        return (
          <div
            className="p-6 text-center border"
            style={{
              ...panelStyle,
              background: 'linear-gradient(180deg, rgba(146,112,74,0.08) 0%, rgba(13,148,136,0.06) 100%)',
            }}
          >
            <p className="text-[8px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: '#92704A', letterSpacing: '0.12em' }}>
              {profile.companyName}
            </p>
            <p className="text-[10px] font-futura uppercase mb-4" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, lineHeight: 1.3 }}>
              HEADQUARTERS IS OPERATIONAL
            </p>
            <p className="text-[6px] font-futura normal-case mb-6 italic" style={{ color: '#555', lineHeight: 1.55 }}>
              "{INAUGURATION_CLOSING_FEELING}"
            </p>
            <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              Take a moment. You have established a digital headquarters, preserved your organization's intelligence, and created the first chapter of your company's legacy.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="organization-inauguration-root">
      <ExecutiveHeroCard
        eyebrow={`MILESTONE 90.5 · ${PHASE_LABELS[phase]}`}
        title={profile.companyName.toUpperCase()}
        subtitle="The official birth of your organization inside Studio OS"
        progressPct={Math.round(((ceremonyState.phaseIndex + 1) / ceremonyState.totalPhases) * 100)}
        stats={[
          { label: 'PHASE', value: `${ceremonyState.phaseIndex + 1}/${ceremonyState.totalPhases}` },
          { label: 'CHARTER', value: 'SEALED' },
          { label: 'HQ STATUS', value: phase === 'final' ? 'AWAITING ENTRY' : 'ACTIVATING' },
          { label: 'LEGACY', value: 'PRESERVED' },
        ]}
      />

      {renderPhaseContent()}

      <button
        type="button"
        onClick={handlePrimaryAction}
        disabled={phase === 'activation' && activating}
        className="w-full mt-4 py-3 text-[8px] font-futura uppercase border"
        style={{
          fontWeight: 515,
          borderColor: phase === 'final' ? '#0D9488' : '#92704A',
          color: phase === 'final' ? '#0D9488' : '#92704A',
          background: phase === 'final' ? 'rgba(13,148,136,0.08)' : 'rgba(146,112,74,0.06)',
          letterSpacing: phase === 'final' ? '0.14em' : '0.08em',
        }}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
