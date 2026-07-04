import {
  AI_PRODUCTION_DEPARTMENTS,
  AI_PRODUCTION_FLOW_STEPS,
  DEPARTMENT_STATUS_LABELS,
  type AiProductionRun,
} from '../../../utils/adminStudioAiProductionEngineDemo';
import { AdminStudioAiProductionDepartmentCard } from './AdminStudioAiProductionDepartmentCard';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAiProductionLiveMonitorProps = {
  run: AiProductionRun;
  onDepartmentClick?: (departmentId: string) => void;
};

export function AdminStudioAiProductionLiveMonitor({ run, onDepartmentClick }: AdminStudioAiProductionLiveMonitorProps) {
  return (
    <div
      className="p-3 border"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      <AdminStudioSectionHeading>LIVE PRODUCTION MONITOR</AdminStudioSectionHeading>
      <p className="text-[6px] font-futura uppercase -mt-2 mb-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {run.title} · QUALITY {run.qualityScore}%
      </p>
      <div className="space-y-2">
        {AI_PRODUCTION_FLOW_STEPS.map((step) => {
          const dept = AI_PRODUCTION_DEPARTMENTS.find((d) => d.id === step.id);
          const state = run.departments[step.id];
          const isActive = run.currentDepartment === step.id && run.runStatus === 'running';
          return (
            <AdminStudioAiProductionDepartmentCard
              key={step.id}
              departmentId={step.id}
              title={dept?.title ?? step.label}
              description={`${DEPARTMENT_STATUS_LABELS[state.status]} · ${state.progress}%`}
              state={state}
              accentHex={run.accentHex}
              live={isActive}
              onClick={onDepartmentClick ? () => onDepartmentClick(step.id) : undefined}
            />
          );
        })}
      </div>
      <div className="mt-3 pt-2 border-t flex justify-between" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <span className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          APPROVED CONTENT PACK
        </span>
        <span className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: run.runStatus === 'draft-complete' ? '#16A34A' : ADMIN_STUDIO_THEME.accent }}>
          {run.runStatus === 'draft-complete' ? 'DRAFT COMPLETE' : 'IN PRODUCTION'}
        </span>
      </div>
    </div>
  );
}
