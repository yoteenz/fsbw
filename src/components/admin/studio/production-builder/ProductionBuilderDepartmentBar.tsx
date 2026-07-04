import type { ProductionDraft } from '../../../../utils/adminStudioProductionBuilderDemo';
import { PRODUCTION_DEPARTMENTS } from '../../../../utils/adminStudioProductionBuilderDemo';
import { PB_VISUAL, pbCaptionStyle, pbPanelStyle } from './productionBuilderTheme';

const STATUS_COLORS: Record<string, string> = {
  waiting: '#9CA3AF',
  working: '#D97706',
  ready: '#2563EB',
  complete: '#16A34A',
};

type ProductionBuilderDepartmentBarProps = {
  departmentStatus: ProductionDraft['departmentStatus'];
};

export function ProductionBuilderDepartmentBar({ departmentStatus }: ProductionBuilderDepartmentBarProps) {
  return (
    <div className="mb-3 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="flex gap-2 min-w-max pb-1">
        {PRODUCTION_DEPARTMENTS.map((dept) => {
          const status = departmentStatus[dept.id];
          return (
            <div
              key={dept.id}
              className="px-2 py-1.5 flex-shrink-0"
              style={{ ...pbPanelStyle, minWidth: '88px' }}
            >
              <p style={{ ...pbCaptionStyle, fontFamily: '"Futura PT Medium"', color: PB_VISUAL.black, fontSize: '8px' }}>
                {dept.label}
              </p>
              <p style={{ ...pbCaptionStyle, color: STATUS_COLORS[status], fontFamily: '"Futura PT Medium"', fontSize: '8px', marginTop: '2px' }}>
                {status.toUpperCase()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
