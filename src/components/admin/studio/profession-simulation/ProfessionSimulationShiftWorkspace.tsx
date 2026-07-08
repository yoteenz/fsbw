import { useProfessionSimulationShift } from '../../../../hooks/useProfessionSimulationShift';
import {
  PROFESSION_SIMULATION_LOOP_STEPS,
  PROFESSION_SIMULATION_WORKPLACE_COPY,
} from '../../../../utils/adminStudioProfessionSimulationDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { SIMULATION_LOOP_LABELS } from '../../../../studio-os-core/profession-simulation-engine';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function PhaseRail({ activePhase }: { activePhase: string }) {
  const activeIndex = PROFESSION_SIMULATION_LOOP_STEPS.findIndex((step) => step.id === activePhase);

  return (
    <div className="flex flex-wrap gap-1 mb-4">
      {PROFESSION_SIMULATION_LOOP_STEPS.map((step, index) => {
        const isActive = step.id === activePhase;
        const isPast = index < activeIndex;
        return (
          <span
            key={step.id}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: isActive ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: isActive
                ? ADMIN_STUDIO_THEME.selectedBg
                : isPast
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(255,255,255,0.45)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
              opacity: index > activeIndex + 1 ? 0.45 : 1,
            }}
          >
            {SIMULATION_LOOP_LABELS[step.id]}
          </span>
        );
      })}
    </div>
  );
}

export function ProfessionSimulationShiftWorkspace() {
  const { session, phasePayload, progression, loading, error, advance, chooseExecution } =
    useProfessionSimulationShift();

  if (loading) {
    return (
      <div className="p-4 border text-[8px] font-futura uppercase" style={panelStyle}>
        Entering workplace…
      </div>
    );
  }

  if (error || !session || !phasePayload) {
    return (
      <div className="p-4 border text-[8px] font-futura uppercase" style={{ ...panelStyle, color: '#8b3a3a' }}>
        {error ?? 'Shift unavailable'}
      </div>
    );
  }

  const mentor = session.npcStates.find((npc) => npc.role === 'mentor');
  const client = session.npcStates.find((npc) => npc.role === 'client');
  const manager = session.npcStates.find((npc) => npc.role === 'manager');

  return (
    <div className="space-y-4">
      <div className="p-3 border" style={panelStyle}>
        <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {session.shift.displayName} · {session.shift.environment}
        </p>
        <h2
          className="text-[18px] leading-tight"
          style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}
        >
          Living Salon Workplace™
        </h2>
        <p className="text-[7px] font-futura uppercase mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          You are clocked in as Shampoo Technician™ — a client is waiting at the station.
        </p>
      </div>

      <PhaseRail activePhase={session.phase} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[mentor, client, manager].filter(Boolean).map((npc) => (
          <div key={npc!.characterId} className="p-3 border" style={panelStyle}>
            <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {npc!.role}
            </p>
            <p className="text-[10px] mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>
              {npc!.displayName}
            </p>
            <p className="text-[7px] font-futura uppercase mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Trust {npc!.relationshipScore} · {npc!.teachingStyle}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 border min-h-[180px]" style={panelStyle}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          {phasePayload.headline}
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: ADMIN_STUDIO_THEME.textPrimary }}>
          {phasePayload.body}
        </p>

        {phasePayload.choices ? (
          <div className="mt-4 space-y-2">
            {phasePayload.choices.map((choice) => {
              const selected = session.selectedExecutionChoiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => chooseExecution(choice.id)}
                  className="w-full text-left p-3 border"
                  style={{
                    borderColor: selected ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder,
                    background: selected ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.55)',
                  }}
                >
                  <span className="text-[8px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textPrimary }}>
                    {choice.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={advance}
          disabled={!phasePayload.canAdvance || session.completed}
          className="flex-1 py-3 text-[8px] font-futura uppercase border disabled:opacity-40"
          style={{
            fontWeight: 515,
            color: ADMIN_STUDIO_THEME.textPrimary,
            borderColor: ADMIN_STUDIO_THEME.panelBorderStrong,
            background: ADMIN_STUDIO_THEME.selectedBg,
          }}
        >
          {session.phase === 'arrival'
            ? PROFESSION_SIMULATION_WORKPLACE_COPY.clockIn
            : session.phase === 'execution'
              ? PROFESSION_SIMULATION_WORKPLACE_COPY.chooseAction
              : session.phase === 'unexpected-event'
                ? PROFESSION_SIMULATION_WORKPLACE_COPY.handleSurprise
                : session.completed
                  ? PROFESSION_SIMULATION_WORKPLACE_COPY.endShift
                  : PROFESSION_SIMULATION_WORKPLACE_COPY.continueShift}
        </button>
      </div>

      {session.completed ? (
        <div className="p-3 border" style={panelStyle}>
          <p className="text-[7px] font-futura uppercase mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Shift complete · reputation {progression.reputationScore} · evidence {progression.evidence.length}
          </p>
          <p className="text-[8px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Not an LMS — you lived a shift, handled a surprise, and earned promotion progress.
          </p>
        </div>
      ) : null}
    </div>
  );
}
